
import React from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { findEmployeeByEmail } from '@/lib/storage/employeeStorage';
import { useLoading } from '@/contexts/LoadingContext';

export const useAdminAuthActions = (
  setAdminUser,
  fetchAdminProfileAndUpdateStateInternal,
  setAdminAuthLoading,
  setAdminProfileLoading,
  setIsAdmin,
  setAdminProfile,
  resetAdminStateInternal // Pass resetAdminStateInternal
) => {
  const { toast } = useToast();
  const { addLoadingMessage, removeLoadingMessage } = useLoading();

  const adminLogin = async (email, password) => {
    console.log('[useAdminAuthActions] adminLogin attempt started.');
    setAdminAuthLoading(true);
    setAdminProfileLoading(true); // Start profile loading early
    const loginMsgId = addLoadingMessage("Admin logging in (useAdminAuthActions)...");
    try {
      const employee = await findEmployeeByEmail(email);
      if (!employee) {
        console.warn('[useAdminAuthActions] adminLogin: Employee not found by email.');
        throw new Error("Admin account not found or not registered as an employee.");
      }
      if (employee.role !== 'admin' && employee.role !== 'superadmin') {
        console.warn('[useAdminAuthActions] adminLogin: Employee role not admin/superadmin.');
        throw new Error("Access Denied: User is not an authorized administrator.");
      }
      console.log('[useAdminAuthActions] adminLogin: Employee found with correct role:', employee.id);

      const { data: { user: supabaseSessUser }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error('[useAdminAuthActions] adminLogin: Supabase signInWithPassword error:', signInError.message);
        throw signInError;
      }
      if (!supabaseSessUser) {
        console.error('[useAdminAuthActions] adminLogin: Supabase signInWithPassword no user returned.');
        throw new Error("Admin login failed with Supabase, please try again.");
      }
      console.log('[useAdminAuthActions] adminLogin: Supabase signInWithPassword successful for:', supabaseSessUser.id);
      
      // Set Supabase user immediately. The onAuthStateChange might also fire,
      // but this ensures adminUser is set before we proceed.
      setAdminUser(supabaseSessUser); 
      
      // Now fetch profile and update admin status based on this specific user
      const profileFetchResult = await fetchAdminProfileAndUpdateStateInternal(supabaseSessUser.id, true); 
      
      if (profileFetchResult.isAdmin && profileFetchResult.profile) {
         toast({ title: "Admin Login Successful", description: `Welcome back, ${profileFetchResult.profile.full_name || 'Admin'}!` });
         // setIsAdmin and setAdminProfile should have been set by fetchAdminProfileAndUpdateStateInternal
      } else {
          // If profile fetch failed or user is not admin, log them out from Supabase session
          // and reset all local admin states.
          await supabase.auth.signOut(); // Sign out from Supabase
          resetAdminStateInternal(false); // Reset local states, don't set authLoading to false yet
          console.warn('[useAdminAuthActions] Login successful but admin verification failed. User signed out.');
          throw new Error("Login successful but admin role or profile could not be verified. Please contact support.");
      }

    } catch (error) {
      toast({ title: "Admin Login Failed", description: error.message, variant: "destructive" });
      // resetAdminStateInternal(); // Ensure full reset on any error
      setAdminUser(null); // Clear Supabase user
      setAdminProfile(null); // Clear admin profile
      setIsAdmin(false); // Ensure isAdmin is false
      // No need to call supabase.auth.signOut() here if signInWithPassword failed
      // as there wouldn't be a session to clear.
      throw error; // Re-throw for the component to handle if needed
    } finally {
      removeLoadingMessage(loginMsgId);
      setAdminAuthLoading(false); 
      setAdminProfileLoading(false); // Ensure profile loading is also false
      console.log('[useAdminAuthActions] adminLogin .finally(). adminAuthLoading & adminProfileLoading set to false');
    }
  };

  const adminLogout = async (options = { showToast: true }) => {
    console.log('[useAdminAuthActions] adminLogout attempt started.');
    setAdminAuthLoading(true);
    const logoutMsgId = addLoadingMessage("Admin logging out (useAdminAuthActions)...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
         console.error('[useAdminAuthActions] adminLogout error:', error.message);
        throw error;
      }
      if (options.showToast) {
        toast({ title: "Admin Logged Out", description: "You have been successfully logged out." });
      }
      console.log('[useAdminAuthActions] adminLogout successful.');
    } catch (error) {
      if (options.showToast) {
        toast({ title: "Admin Logout Failed", description: error.message, variant: "destructive" });
      }
      console.error('[useAdminAuthActions] adminLogout catch error:', error.message);
    } finally {
      // resetAdminStateInternal will be called by onAuthStateChange
      // but we can also call it here for immediate UI update if needed.
      // However, to avoid race conditions, it's often better to let onAuthStateChange handle it.
      // For now, explicitly calling parts of reset:
      setAdminUser(null);
      setAdminProfile(null);
      setIsAdmin(false);
      removeLoadingMessage(logoutMsgId);
      setAdminAuthLoading(false);
      console.log('[useAdminAuthActions] adminLogout .finally(). States reset. adminAuthLoading set to false.');
    }
  };

  return { adminLogin, adminLogout };
};
