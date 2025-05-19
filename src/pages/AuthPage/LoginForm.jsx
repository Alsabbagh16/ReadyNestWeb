
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { Chrome } from 'lucide-react';

const LoginForm = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
    } catch (error) {
      console.error("Login failed:", error);
      // Toast is handled by useAuthCore
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard' 
        }
      });
      if (error) {
        toast({
          title: "Google Sign-In Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Google Sign-In Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      console.error("Google login error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Or continue with
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={handleGoogleLogin}>
          <Chrome className="mr-2 h-4 w-4" /> Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
  