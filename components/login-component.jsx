"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export function LoginComponent() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login/`, {
      method: "POST",
      credentials: "include", // needed to receive cookies
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const user = await res.json();
      login(user.token, user.role, user);
      router.push(`/${user.role}`); // seller or financier
    } else {
      alert("Login failed");
    }
  };

  const handleSignup = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register/`,
      {
        method: "POST",
        credentials: "include", // needed to receive cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, email, password }),
      }
    );

    if (res.ok) {
      const user = await res.json();
      login(user.token, user.role, user);
      router.push(`/${user.role}`); // seller or financier
    } else {
      alert("Signup failed");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Finvest</h1>
        <p className="text-slate-600">Invoice Financing Platform</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Access your dashboard" : "Join our platform"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs
            defaultValue="login"
            value={isLogin ? "login" : "signup"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" onClick={() => setIsLogin(true)}>
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium">I am a:</Label>
                <div className="grid grid-cols-1 gap-3">
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      role === "seller" ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setRole("seller")}
                  >
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Business Seller
                          </h3>
                          <p className="text-sm text-slate-600">
                            Upload invoices for financing
                          </p>
                        </div>
                        <Badge variant="secondary">Seller</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      role === "financier"
                        ? "ring-2 ring-teal-500 bg-teal-50"
                        : ""
                    }`}
                    onClick={() => setRole("financier")}
                  >
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Financier
                          </h3>
                          <p className="text-sm text-slate-600">
                            Invest in invoices and earn returns
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-teal-100 text-teal-800"
                        >
                          Financier
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isLogin ? (
            <Button className="w-full" onClick={handleLogin}>
              Sign In
            </Button>
          ) : (
            <Button className="w-full" onClick={handleSignup} disabled={!role}>
              Create Account
            </Button>
          )}

          <div className="text-center">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
