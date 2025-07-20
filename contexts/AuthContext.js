"use client";
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    token: null,
    role: null,
    user: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && role) {
      setAuth({
        isLoggedIn: true,
        token,
        role,
        user,
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
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      isLoggedIn: false,
      token: null,
      role: null,
      user: null,
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
