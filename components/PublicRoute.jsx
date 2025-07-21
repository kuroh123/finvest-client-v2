"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const PublicRoute = ({ children, redirectTo = null }) => {
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (auth.loading) {
      return;
    }

    // If user is already logged in, redirect them
    if (auth.isLoggedIn && auth.token) {
      const redirectPath =
        redirectTo ||
        (auth.role === "seller"
          ? "/seller"
          : auth.role === "financier"
          ? "/financier"
          : "/");
      router.push(redirectPath);
      return;
    }
  }, [auth, router, redirectTo]);

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

  // Don't render children if user is logged in (will redirect)
  if (auth.isLoggedIn && auth.token) {
    return null;
  }

  return children;
};

export default PublicRoute;
