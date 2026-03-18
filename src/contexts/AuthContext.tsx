import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (token: string, refreshToken: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canManageTransactions: boolean;
  canManageMembers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(
    (() => {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    })(),
  );

  const login = (token: string, refreshToken: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        isManager: user?.role === "MANAGER",
        canManageTransactions:
          user?.role === "ADMIN" || user?.role === "MANAGER",
        canManageMembers: user?.role === "ADMIN" || user?.role === "MANAGER",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
