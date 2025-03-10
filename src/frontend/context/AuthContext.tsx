import React, { createContext, useContext, useState } from "react";
import { User } from "../types/userTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

interface AuthContextType {
  login: (userData: User, token: string) => void;
  logout: () => void;
  error: string | null;
  checkAuth: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  userEmail: string | null;
  setUserEmail: (userEmail: string | null) => void;
  userPhone: string | null;
  setUserPhone: (userPhone: string | null) => void;
  user: User | null;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await SecureStore.deleteItemAsync("userToken");

      setUser(null);
      setIsAuthenticated(false);
      //navigation.navigate("Login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const login = async (userData: User, token: string) => {
    try {
      // Save user data and token securely
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await SecureStore.setItemAsync("userToken", token);

      setUser(userData);
      setIsAuthenticated(true);
      //  navigation.navigate("Home");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");

      if (token) {
        // TODO: Fetch user data using token
        const storedUser = await AsyncStorage.getItem("userData");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          // navigation.navigate("Home");
        }
      } else {
        setIsAuthenticated(false);
        // navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        userEmail,
        setUserEmail,
        userPhone,
        setUserPhone,
        user,
        setUser,
        checkAuth,
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
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
