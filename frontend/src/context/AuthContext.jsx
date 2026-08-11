import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { loginUser } from "../api/auth.api";


// =====================================================
// CREATE CONTEXT
// =====================================================

const AuthContext =
  createContext(null);


// =====================================================
// AUTH PROVIDER
// =====================================================

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // ---------------------------------------------------
  // Restore authentication on page refresh
  // ---------------------------------------------------

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(
          JSON.parse(storedUser)
        );
      } catch (error) {
        console.error(
          "Failed to restore user:",
          error
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );
      }
    }

    setLoading(false);
  }, []);


  // ---------------------------------------------------
  // Login
  // ---------------------------------------------------

  const login = async (
    email,
    password
  ) => {
    const data =
      await loginUser(
        email,
        password
      );

    if (
      !data.success ||
      !data.token ||
      !data.user
    ) {
      throw new Error(
        data.message ||
          "Login failed"
      );
    }

    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    setUser(data.user);

    return data;
  };


  // ---------------------------------------------------
  // Logout
  // ---------------------------------------------------

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };


  // ---------------------------------------------------
  // Context value
  // ---------------------------------------------------

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};


// =====================================================
// USE AUTH
// =====================================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};