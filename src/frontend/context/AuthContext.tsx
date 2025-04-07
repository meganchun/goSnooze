import React, { createContext, useContext, useState } from "react";
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
  signInWithPhoneNumber,
} from "@/src/backend/firebase";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

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
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      const confirmationResponse: ConfirmationResult =
        await signInWithPhoneNumber(auth, phoneNumber);
      setConfirmation(confirmationResponse);
      setUserPhone(phoneNumber);
      setError(null);
    } catch (error: any) {
      console.log("Error sending OTP: ", error.message);
      setError("Failed to send OTP. Please try again.");
    } finally {
      navigation.navigate("OTP");
    }
  };

  const verifyOTP = async () => {
    if (confirmation) {
      if (OTP.length !== 6) setError("Please enter full OTP");
      else {
        try {
          await confirmation.confirm(OTP);
          setIsOTPVerified(true);
          setError(null);
        } catch (error: any) {
          console.error("Error verifying OTP:", error.message);
          setError("Failed to verify OTP. Please try again.");
        }
      }
    } else console.error("Failed to verify OTP. Please try again.");
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
