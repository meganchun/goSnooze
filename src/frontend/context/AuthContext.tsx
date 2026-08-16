import React, { createContext, useContext, useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { RootStackParamList } from "../navigation/MainNavigation";
import { supabase } from "@/src/backend/supabase";
import {
  getProfile,
  Profile,
  saveProfile,
  uploadProfileImage,
} from "../services/profileService";
import { User } from "../types/userTypes";
import { describeError } from "../services/errors";

interface AuthContextType {
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  OTP: string;
  setOTP: (OTP: string) => void;
  isOTPVerified: boolean;
  setIsOTPVerified: (isOTPVerified: boolean) => void;
  userEmail: string | null;
  setUserEmail: (userEmail: string) => void;
  userPhone: string | null;
  setUserPhone: (userPhone: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: () => Promise<void>;
  createUser: (
    email: string,
    password: string,
    name: string,
    profilePicture?: string
  ) => Promise<void>;
  sendEmail: () => Promise<void>;
  verifyEmailVerification: (
    interval: ReturnType<typeof setInterval>
  ) => Promise<void>;
  linkGoogleIdentity: () => Promise<void>;
}

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [OTP, setOTP] = useState("");
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const applyProfile = (profile: Profile | null) => {
    setUser(profile);
    setUserEmail(profile?.email || null);
    setUserPhone(profile?.phone || null);
    // Phone OTP creates a session before profile/email onboarding is complete.
    setIsAuthenticated(Boolean(profile?.onboardingCompleted));
  };

  const loadSession = async () => {
    setLoading(true);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) {
        applyProfile(null);
        return;
      }

      let profile = await getProfile(data.session.user.id);
      // Covers projects that were configured after a user was already created.
      if (!profile) {
        profile = await saveProfile({
          id: data.session.user.id,
          email: data.session.user.email || "",
          phone: data.session.user.phone || "",
          firstName: "",
          lastName: "",
          profilePicture: "",
          onboardingCompleted: false,
        });
      }
      applyProfile({
        ...profile,
        email: data.session.user.email || "",
        phone: data.session.user.phone || "",
      });
      setError(null);
    } catch (cause: any) {
      console.error("Unable to restore Supabase session:", cause);
      applyProfile(null);
      setError(describeError(cause?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Supabase holds an internal lock while dispatching this callback. Do not
      // call auth/database APIs until after it has returned.
      setTimeout(() => {
        loadSession();
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(describeError(signOutError.message));
      return;
    }
    applyProfile(null);
    setOTP("");
    setIsOTPVerified(false);
    setError(null);
  };

  const login = async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(describeError(signInError.message));
      throw signInError;
    }
  };

  const sendOTP = async (phone: string) => {
    setError(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    if (otpError) {
      const message = describeError(otpError.message);
      setError(message);
      throw otpError;
    }
    setUserPhone(phone);
    setOTP("");
    navigation.navigate("OTP");
  };

  const verifyOTP = async () => {
    if (!userPhone) {
      setError("Enter your phone number and request a new code.");
      return;
    }
    if (OTP.length !== 6) {
      setError("Enter the complete six-digit code.");
      return;
    }
    setError(null);
    const { error: verificationError } = await supabase.auth.verifyOtp({
      phone: userPhone,
      token: OTP,
      type: "sms",
    });
    if (verificationError) {
      setError(describeError(verificationError.message));
      return;
    }
    setOTP("");
    setIsOTPVerified(true);
    navigation.navigate("ProfileDetails");
  };

  const createUser = async (
    email: string,
    password: string,
    name: string,
    profilePicture?: string
  ) => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setError("Verify your phone number before creating your profile.");
      return;
    }

    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      email,
      password,
    });
    if (updateError) {
      setError(describeError(updateError.message));
      return;
    }

    try {
      const avatarUrl = profilePicture
        ? await uploadProfileImage(authUser.id, profilePicture)
        : user?.profilePicture || "";
      const [firstName, ...remainingNames] = name.trim().split(/\s+/);
      const profile = await saveProfile({
        id: authUser.id,
        email,
        phone: authUser.phone || userPhone || "",
        firstName: firstName || "",
        lastName: remainingNames.join(" "),
        profilePicture: avatarUrl,
        onboardingCompleted: false,
      });
      applyProfile(profile);
      navigation.navigate("VerifyingEmail");
    } catch (cause: any) {
      console.error("Unable to complete profile:", cause);
      setError(describeError(cause?.message || ""));
    }
  };

  const sendEmail = async () => {
    if (!userEmail) return;
    const { error: resendError } = await supabase.auth.resend({
      type: "email_change",
      email: userEmail,
    });
    if (resendError) setError(describeError(resendError.message));
  };

  const verifyEmailVerification = async (interval: ReturnType<typeof setInterval>) => {
    const {
      data: { user: authUser },
      error: currentUserError,
    } = await supabase.auth.getUser();
    if (currentUserError || !authUser?.email_confirmed_at || !user) return;

    const profile = await saveProfile({ ...user, onboardingCompleted: true });
    applyProfile(profile);
    clearInterval(interval);
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  const linkGoogleIdentity = async () => {
    if (!user) {
      setError("Sign in before linking a Google account.");
      return;
    }

    try {
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error: linkError } = await supabase.auth.linkIdentity({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (linkError) throw linkError;
      if (!data?.url) throw new Error("Google linking could not be started.");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success") {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          result.url
        );
        if (exchangeError) throw exchangeError;
      }
    } catch (cause: any) {
      setError(describeError(cause?.message || ""));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        error,
        loading,
        isAuthenticated,
        OTP,
        setOTP,
        isOTPVerified,
        setIsOTPVerified,
        userEmail,
        setUserEmail,
        userPhone,
        setUserPhone,
        user,
        setUser,
        login,
        logout,
        checkAuth: loadSession,
        sendOTP,
        verifyOTP,
        createUser,
        sendEmail,
        verifyEmailVerification,
        linkGoogleIdentity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
