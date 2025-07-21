"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/" }) => {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (auth.loading) {
      return;
    }

    // Check if user is authenticated
    if (!auth.isLoggedIn || !auth.token) {
      router.push(redirectTo);
      return;
    }

    // Check if user has the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
      // Redirect based on user's role if they don't have permission
      if (auth.role === "seller") {
        router.push("/seller");
      } else if (auth.role === "financier") {
        router.push("/financier");
      } else {
        router.push(redirectTo);
      }
      return;
    }
  }, [auth, router, allowedRoles, redirectTo]);

  // Show loading while auth is being checked
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-600">Loading...</h1>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not authorized
  if (!auth.isLoggedIn || !auth.token) {
    return null;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
