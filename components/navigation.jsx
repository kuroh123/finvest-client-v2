// components/Navbar.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReceiptText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Navigation() {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  const getNavItems = () => {
    if (auth.role === "seller") {
      return [
        { label: "Dashboard", path: "/seller" },
        { label: "My Invoices", path: "/seller/my-invoices" },
        { label: "Upload Invoice", path: "/seller/upload-invoice" },
      ];
    } else {
      return [
        { label: "Dashboard", path: "/financier" },
        { label: "My Offers", path: "/financier/my-offers" },
        { label: "Browse Invoices", path: "/financier/browse-invoices" },
      ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!auth.isLoggedIn) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link
            href={`/${auth.role}`}
            className="flex items-center gap-2 font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <ReceiptText className="size-5" />
            </div>
            Finvest
          </Link>

          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-slate-600 capitalize">
            {auth.user?.name} Account
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {auth.role === "seller" ? "S" : "F"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white"
              align="end"
              forceMount
            >
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
