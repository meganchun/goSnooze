import React, { createContext, useContext, useState } from "react";
import { User } from "../types/userTypes";

interface UserContextType {
  user: User | null;
  login: (userInfo: User) => void;
  logout: () => void;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = (userInfo: User) => {
    setUser(userInfo);
    setError(null);
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
