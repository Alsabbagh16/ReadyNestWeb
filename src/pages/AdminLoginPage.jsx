
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin, isAdmin, adminUser, loading: adminContextOverallLoading, adminAuthLoading } = useAdminAuth(); // Use adminAuthLoading for page readiness
  const { user, loading: authContextOverallLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // This effect handles redirection AFTER login attempts or if users are already logged in.
    // It relies on the overall loading states of both contexts to ensure all checks are done.
    if (!authContextOverallLoading && user && !adminUser) { 
      toast({ title: "Access Denied", description: "This login is for administrators. Redirecting to your dashboard.", variant: "warning" });
      navigate('/dashboard');
    } else if (!adminContextOverallLoading && isAdmin && adminUser) { 
      navigate('/admin-dashboard');
    }
  }, [user, adminUser, isAdmin, authContextOverallLoading, adminContextOverallLoading, navigate, toast]);


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(email, password);
      // Redirection is handled by useEffect
    } catch (error) {
      console.error("Admin login failed:", error);
      // Toast is handled within adminLogin function
    }
  };

  // Page specific loading: true if AdminAuthContext hasn't determined adminUser status (null or object)
  const pageLoading = adminAuthLoading || adminUser === undefined;
  // Form submission loading: true if either context is busy with an auth operation or subsequent data fetch
  const formSubmissionLoading = adminContextOverallLoading || authContextOverallLoading;


   if (pageLoading) {
     return <div className="flex justify-center items-center min-h-screen">Loading admin authentication status...</div>;
   }

   // If user/admin status is determined, allow useEffect to handle redirection.
   if ((user && !adminUser) || (isAdmin && adminUser)) {
       return <div className="flex justify-center items-center min-h-screen">Processing...</div>;
   }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px] shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>Login to manage the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={formSubmissionLoading}>
                {formSubmissionLoading ? 'Processing...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
  