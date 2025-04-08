import React, { createContext, useContext, useRef, useState } from "react";
import { User } from "../types/userTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/MainNavigation";
import {
  auth,
  ConfirmationResult,
  createUserWithEmailAndPassword,
  db,
} from "@/src/backend/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

interface AuthContextType {
  login: (userData: User, token: string) => void;
  logout: () => void;
  error: string | null;
  checkAuth: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  OTP: string;
  setOTP: (OTP: string) => void;
  isOTPVerified: boolean;
  setIsOTPVerified: (isOTPVerified: boolean) => void;
  sendOTP: (userPhone: string) => void;
  verifyOTP: () => void;
  userEmail: string | null;
  setUserEmail: (userEmail: string) => void;
  userPhone: string | null;
  setUserPhone: (userPhone: string) => void;
  createUser: (
    email: string,
    name: string,
    profilePicture: string | undefined
  ) => void;
  user: User | null;
  setUser: (user: User) => void;
}

type AuthNavigationProp = StackNavigationProp<RootStackParamList>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigation = useNavigation<AuthNavigationProp>();

  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [OTP, setOTP] = useState<string>("");
  const [isOTPVerified, setIsOTPVerified] = useState<boolean>(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const recaptchaVerifier = useRef(null);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await SecureStore.deleteItemAsync("userToken");
      await setUser(null);
      await setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigation.navigate("Login");
    }
  };

  const login = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await SecureStore.setItemAsync("userToken", token);
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);

      const userRef = doc(db, "users", userData.email || userData.phone || "");
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userFromFirestore = docSnap.data();
        setUser({
          ...userData,
          firstName: userFromFirestore.name,
          email: userFromFirestore.email,
          phone: userFromFirestore.phoneNumber,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
        navigation.navigate("Main");
      } else console.log("No such document!");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          setError(null);
          navigation.navigate("Main");
        }
      } else {
        setIsAuthenticated(false);
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      if (recaptchaVerifier.current) {
        const phoneProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneProvider.verifyPhoneNumber(
          phoneNumber,
          recaptchaVerifier.current
        );
        setVerificationId(verificationId);
        setUserPhone(phoneNumber);
        setError(null);
        navigation.navigate("OTP");
      }
    } catch (error: any) {
      console.log("Error sending OTP: ", error.message);
      setError("Failed to send OTP. Please try again.");
      navigation.navigate("PhoneNumber");
    }
  };

  const verifyOTP = async () => {
    if (verificationId) {
      if (OTP.length !== 6) {
        setError("Please enter full OTP.");
        return;
      } else {
        try {
          const credential = PhoneAuthProvider.credential(verificationId, OTP);
          await signInWithCredential(auth, credential);
          setIsOTPVerified(true);
          setError(null);
          setOTP("");
          navigation.navigate("ProfileDetails");
        } catch (error: any) {
          setError("Incorrect OTP.");
          console.log("Error verifying OTP:", error.message);
        }
      }
    } else console.log("Missing verification ID. Please try again.");
  };

  const createUser = async (
    email: string,
    name: string,
    profilePicture: string | undefined
  ) => {
    if (email && userPhone) {
      setUserEmail(email);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          userPhone
        );
        const token = await userCredential.user.getIdToken();
        const userRef = collection(db, "users");

        await addDoc(userRef, {
          name,
          email,
          phoneNumber: userPhone,
          profilePicture,
        });

        const userData: User = {
          email: userCredential.user.email || "",
          firstName: userCredential.user.displayName || "",
          lastName: "",
          phone: userCredential.user.phoneNumber || "",
        };
        await login(userData, token);
        setError(null);
      } catch (error: any) {
        console.error("Failed to create user.");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        OTP,
        setOTP,
        isOTPVerified,
        setIsOTPVerified,
        sendOTP,
        verifyOTP,
        userEmail,
        setUserEmail,
        userPhone,
        setUserPhone,
        user,
        setUser,
        checkAuth,
        createUser,
        loading,
        error,
        login,
        logout,
      }}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
      />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
