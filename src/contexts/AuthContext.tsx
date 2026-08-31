import React, { createContext, useContext, useEffect, useState } from "react";
import type { Profile, AuthState } from "../types";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    profile: null,
    token: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Load from localStorage
    const token = localStorage.getItem("auth_token");
    const profileJson = localStorage.getItem("auth_profile");
    if (token && profileJson) {
      setAuthState({
        profile: JSON.parse(profileJson),
        token,
        isLoading: false,
        error: null,
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const res = await fetch("/.netlify/functions/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_profile", JSON.stringify(data.profile));

      setAuthState({
        profile: data.profile,
        token: data.token,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_profile");
    setAuthState({
      profile: null,
      token: null,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
