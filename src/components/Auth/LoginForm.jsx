
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';
import { Chrome } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect');
      const step = searchParams.get('step');
      if (redirectPath) {
        const targetPath = step ? `${redirectPath}?step=${step}` : redirectPath;
        navigate(targetPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Error toast is handled by useAuthCore
      console.error("Login failed in LoginForm:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const redirectQueryParam = searchParams.get('redirect');
      const stepQueryParam = searchParams.get('step');
      
      let redirectTo = window.location.origin;
      if (redirectQueryParam) {
        redirectTo += redirectQueryParam;
        if (stepQueryParam) {
          redirectTo += `?step=${stepQueryParam}`;
        }
      } else {
        redirectTo += '/dashboard';
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
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
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
      </div>
      <Button type="submit" className="w-full">Login</Button>
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Or continue with
      </div>
      <Button variant="outline" className="w-full mt-2 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700" onClick={handleGoogleLogin}>
        <Chrome className="mr-2 h-4 w-4" /> Sign in with Google
      </Button>
    </form>
  );
};

export default LoginForm;
