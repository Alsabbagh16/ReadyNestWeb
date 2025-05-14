
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
    } else if (error.message && error.message.includes("Email link is invalid or has expired")) {
      toast({ title: "Verification Link Error", description: "The email verification link is invalid or has expired. Please try again or request a new link.", variant: "destructive" });
    }
    else {
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
        if (sessionUser && !sessionUser.email_confirmed_at) {
          console.warn("[AuthCore] User session exists but email not confirmed:", sessionUser.email);
        }
      }
    }).catch(error => {
      handleAuthError(error, "getSession catch");
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
        } else if (_event === "SIGNED_IN" && sessionUser) {
          console.log("[AuthCore] User SIGNED_IN:", sessionUser.id, sessionUser.email);
          if (!sessionUser.email_confirmed_at) {
            console.warn("[AuthCore] User signed in but email not confirmed:", sessionUser.email);
          }
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (profileError) {
            console.error("[AuthCore] Error fetching profile after OAuth sign-in:", profileError);
          } else if (!profile && sessionUser.email) {
            console.log("[AuthCore] No profile found for OAuth user, creating one:", sessionUser.id);
            const userMetadata = sessionUser.user_metadata;
            const newProfileData = {
              id: sessionUser.id,
              email: sessionUser.email.toLowerCase(),
              first_name: userMetadata?.first_name || userMetadata?.full_name?.split(' ')[0] || sessionUser.email.split('@')[0],
              last_name: userMetadata?.last_name || userMetadata?.full_name?.split(' ').slice(1).join(' ') || '',
              user_type: 'home_owner', 
              credits: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            const { error: insertError } = await supabase.from('profiles').insert(newProfileData);
            if (insertError) {
              console.error("[AuthCore] Error creating profile for OAuth user:", insertError);
              toast({ title: "Profile Creation Failed", description: "Could not create your user profile after Google Sign-In.", variant: "destructive" });
            } else {
              console.log("[AuthCore] Profile created successfully for OAuth user:", newProfileData.id);
            }
          } else if (profile) {
             console.log("[AuthCore] Profile found for OAuth user:", profile.id);
          }
        } else if (_event === "SIGNED_OUT") {
          console.log("[AuthCore] User SIGNED_OUT");
        } else if (_event === "USER_UPDATED" && sessionUser) {
          console.log("[AuthCore] User USER_UPDATED:", sessionUser.id);
        } else if (_event === "PASSWORD_RECOVERY") {
          console.log("[AuthCore] Password recovery event");
        } else if (_event === "TOKEN_REFRESHED") {
          console.log("[AuthCore] Token refreshed");
        }


        removeLoadingMessage(authChangeMsgId);
        setAuthContextLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [addLoadingMessage, removeLoadingMessage, handleAuthError, toast]);

  const login = useCallback(async (email, password) => {
    setAuthContextLoading(true);
    const loginMsgId = addLoadingMessage("Logging in...");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
      });
      
      if (error) throw error;
      
      if (data.user && !data.user.email_confirmed_at) {
        toast({ title: "Email Not Verified", description: "Please check your email to verify your account before logging in.", variant: "destructive" });
        await supabase.auth.signOut(); 
        setUser(null);
        throw new Error("Email not verified");
      }
      
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
        await supabase.auth.admin.deleteUser(newUser.id);
        throw new Error("Failed to create user profile. Your auth account might have been created, please try logging in or contact support if issue persists.");
      }

      setUser(newUser);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully! Please check your email to verify your account.",
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
  