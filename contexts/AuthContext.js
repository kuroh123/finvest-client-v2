"use client";
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    token: null,
    role: null,
    user: null,
    loading: true, // Add loading state
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    if (token && role) {
      setAuth({
        isLoggedIn: true,
        token,
        role,
        user,
        loading: false,
      });
    } else {
      setAuth({
        isLoggedIn: false,
        token: null,
        role: null,
        user: null,
        loading: false,
      });
    }
  }, []);

  const login = (token, role, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({
      isLoggedIn: true,
      token,
      role,
      user,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      isLoggedIn: false,
      token: null,
      role: null,
      user: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
