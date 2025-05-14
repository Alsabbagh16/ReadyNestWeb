
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { useLoading } from '@/contexts/LoadingContext';

export const useAuthCore = () => {
  const [user, setUser] = useState(undefined);
  const [authContextLoading, setAuthContextLoading] = useState(true);
  const { toast } = useToast();
  const { addLoadingMessage, removeLoadingMessage } = useLoading();

  const handleAuthError = useCallback((error, contextMessage) => {
    console.error(`[AuthCore] ${contextMessage} error:`, error.message, error);
    if (error.message && (error.message.includes("Invalid Refresh Token") || error.message.includes("Refresh Token Not Found")) || (error.code && error.code === 'refresh_token_not_found')) {
      toast({ title: "Session Expired", description: "Your session has expired. Please log in again.", variant: "destructive" });
      setUser(null);
    } else {
      toast({ title: `Auth Error (${contextMessage})`, description: error.message, variant: "destructive" });
      setUser(null);
    }
  }, [toast]);

  useEffect(() => {
    setAuthContextLoading(true);
    const initialSessionMsgId = addLoadingMessage("Checking user session...");

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        handleAuthError(error, "getSession");
      } else {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
      }
    }).catch(error => {
      handleAuthError(error, "getSession");
    }).finally(() => {
      removeLoadingMessage(initialSessionMsgId);
      setAuthContextLoading(false);
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authChangeMsgId = addLoadingMessage("Processing authentication state...");
        setAuthContextLoading(true);
        
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        
        if (session?.error) {
          handleAuthError(session.error, "onAuthStateChange");
        }

        removeLoadingMessage(authChangeMsgId);
        setAuthContextLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [addLoadingMessage, removeLoadingMessage, handleAuthError]);

  const login = useCallback(async (email, password) => {
    setAuthContextLoading(true);
    const loginMsgId = addLoadingMessage("Logging in...");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      setUser(data.user);
      toast({ title: "Success", description: "Welcome back!" });
    } catch (error) {
      handleAuthError(error, "login");
      throw error;
    } finally {
      removeLoadingMessage(loginMsgId);
      setAuthContextLoading(false);
    }
  }, [toast, addLoadingMessage, removeLoadingMessage, handleAuthError]);

  const signup = useCallback(async (email, password, profileData) => {
    setAuthContextLoading(true);
    const signupMsgId = addLoadingMessage("Creating your account...");
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name
          }
        }
      });

      if (signUpError) throw signUpError;

      const newUser = signUpData.user;
      if (!newUser?.id) throw new Error("Signup failed - no user ID returned");

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newUser.id,
          email: email.toLowerCase(),
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          dob: profileData.dob,
          user_type: profileData.user_type,
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error("Failed to create user profile");
      }

      setUser(newUser);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });

    } catch (error) {
      console.error('Registration process error:', error);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      removeLoadingMessage(signupMsgId);
      setAuthContextLoading(false);
    }
  }, [toast, addLoadingMessage, removeLoadingMessage]);

  const logout = useCallback(async (options = { showToast: true }) => {
    setAuthContextLoading(true);
    const logoutMsgId = addLoadingMessage("Logging out...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (options.showToast) {
        toast({ title: "Success", description: "You have been logged out." });
      }
    } catch (error) {
      if (options.showToast) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setUser(null);
      removeLoadingMessage(logoutMsgId);
      setAuthContextLoading(false);
    }
  }, [toast, addLoadingMessage, removeLoadingMessage]);

  return {
    user,
    authContextLoading,
    login,
    signup,
    logout,
    _setUserRawCore: setUser,
  };
};
