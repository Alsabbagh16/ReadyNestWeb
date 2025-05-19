
import { supabase } from '@/lib/supabase';

export const handleAuthError = (error, contextMessage, toast, setUserCallback) => {
  console.error(`[AuthUtils] ${contextMessage} error:`, error.message, error);
  if (error.message && (error.message.includes("Invalid Refresh Token") || error.message.includes("Refresh Token Not Found") || error.message.includes("invalid_grant")) || (error.code && error.code === 'refresh_token_not_found')) {
    toast({ title: "Session Expired", description: "Your session has expired. Please log in again.", variant: "destructive" });
    if (setUserCallback) setUserCallback(null);
  } else if (error.message && error.message.includes("Email link is invalid or has expired")) {
    toast({ title: "Verification Link Error", description: "The email verification link is invalid or has expired. Please try again or request a new link.", variant: "destructive" });
  } else if (error.message && error.message.includes("User not found")) {
     toast({ title: "Authentication Error", description: "User not found. Please check your credentials or sign up.", variant: "destructive" });
     if (setUserCallback) setUserCallback(null);
  }
  else {
    toast({ title: `Auth Error (${contextMessage})`, description: error.message, variant: "destructive" });
    if (setUserCallback) setUserCallback(null);
  }
};

export const processUserSession = (sessionUser, context) => {
  if (sessionUser) {
    console.log(`[AuthUtils] ${context}: User session found:`, sessionUser.id, "Email:", sessionUser.email);
    if (!sessionUser.email_confirmed_at) {
      console.warn(`[AuthUtils] ${context}: User session exists but email not confirmed:`, sessionUser.email);
    }
  } else {
    console.log(`[AuthUtils] ${context}: No active session found.`);
  }
};
  