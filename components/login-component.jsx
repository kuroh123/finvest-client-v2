"use client";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { LoginForm } from "./auth-components/login-form";
import { useState } from 'react';
import {Input} from '@/components/ui/input'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';



export function AuthFormWrapper() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">InvoiceFi</h1>
          <p className="text-slate-600">Invoice Financing Platform</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Access your dashboard' : 'Join our platform'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
          <Tabs defaultValue="login" value={isLogin ? 'login' : 'signup'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" onClick={() => setIsLogin(true)}>Sign In</TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" />
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input id="email-signup" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input id="password-signup" type="password" />
                </div>
              </TabsContent>
            </Tabs>
            <div className="space-y-4">
              <Label className="text-sm font-medium">I am a:</Label>
              <div className="grid grid-cols-1 gap-3">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === 'seller' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedRole('seller')}
                >
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">Business Seller</h3>
                        <p className="text-sm text-slate-600">Upload invoices for financing</p>
                      </div>
                      <Badge variant="secondary">Seller</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === 'financier' ? 'ring-2 ring-teal-500 bg-teal-50' : ''
                  }`}
                  onClick={() => setSelectedRole('financier')}
                >
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">Financier</h3>
                        <p className="text-sm text-slate-600">Invest in invoices and earn returns</p>
                      </div>
                      <Badge variant="secondary" className="bg-teal-100 text-teal-800">Financier</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => selectedRole && handleAuth(selectedRole)}
              disabled={!selectedRole}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center">
              <button 
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
}