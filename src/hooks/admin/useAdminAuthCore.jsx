
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { findEmployeeById } from '@/lib/storage/employeeStorage';
import { useLoading } from '@/contexts/LoadingContext';

export const useAdminAuthCore = () => {
  const [adminUser, setAdminUser] = useState(undefined);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  const [adminProfileLoading, setAdminProfileLoading] = useState(false);
  const { toast } = useToast();
  const { addLoadingMessage, removeLoadingMessage } = useLoading();

  const resetAdminStateInternal = useCallback((setAuthLoadingFalse = true) => {
    console.log('[useAdminAuthCore] resetAdminStateInternal called.');
    setAdminUser(null);
    setAdminProfile(null);
    setIsAdmin(false);
    if (setAuthLoadingFalse) {
      setAdminAuthLoading(false);
    }
    setAdminProfileLoading(false);
  }, []);

  const fetchAdminProfileAndUpdateStateInternal = useCallback(async (supabaseUserId, isExplicitAdminLogin = false) => {
    console.log(`[useAdminAuthCore] fetchAdminProfileAndUpdateStateInternal called for ID: ${supabaseUserId}. ExplicitAdminLogin: ${isExplicitAdminLogin}`);
    if (!supabaseUserId) {
      console.log('[useAdminAuthCore] No Supabase User ID provided, resetting admin state parts.');
      setAdminProfile(null);
      setIsAdmin(false);
      setAdminProfileLoading(false);
      return { success: false, profile: null, isAdmin: false };
    }

    const profileMsgId = addLoadingMessage("Fetching admin profile (useAdminAuthCore)...");
    setAdminProfileLoading(true);
    console.log('[useAdminAuthCore] setAdminProfileLoading to true.');

    try {
      const employeeProfile = await findEmployeeById(supabaseUserId);
      console.log('[useAdminAuthCore] Fetched employeeProfile:', employeeProfile);
      if (employeeProfile && (employeeProfile.role === 'admin' || employeeProfile.role === 'superadmin')) {
        setAdminProfile(employeeProfile);
        setIsAdmin(true);
        console.log('[useAdminAuthCore] Admin profile found and set. IsAdmin: true.');
        return { success: true, profile: employeeProfile, isAdmin: true };
      } else {
        setAdminProfile(null);
        setIsAdmin(false);
        console.log('[useAdminAuthCore] Admin profile not found or not admin role. IsAdmin: false.');
        if (isExplicitAdminLogin && employeeProfile) {
          toast({ title: "Access Denied", description: "You do not have admin privileges.", variant: "destructive" });
        } else if (isExplicitAdminLogin && !employeeProfile) {
          toast({ title: "Login Failed", description: "Admin account not found in employee records.", variant: "destructive" });
        }
        return { success: false, profile: null, isAdmin: false };
      }
    } catch (error) {
      console.error('[useAdminAuthCore] Error fetching admin profile:', error.message);
      if (isExplicitAdminLogin || (error.code && error.code !== 'PGRST116')) { // PGRST116 = no rows found, not necessarily an error for non-admin checks
        toast({ title: "Admin Profile Error", description: `Could not fetch admin details: ${error.message}`, variant: "destructive" });
      } else if (error.code === 'PGRST116') {
         console.log('[useAdminAuthCore] findEmployeeById returned no rows (PGRST116), likely not an admin. Handled gracefully.');
      }
      setAdminProfile(null);
      setIsAdmin(false);
      return { success: false, profile: null, isAdmin: false };
    } finally {
      removeLoadingMessage(profileMsgId);
      setAdminProfileLoading(false);
      console.log('[useAdminAuthCore] setAdminProfileLoading to false.');
    }
  }, [toast, addLoadingMessage, removeLoadingMessage]);

  useEffect(() => {
    console.log('[useAdminAuthCore] Initializing: setting adminAuthLoading to true.');
    setAdminAuthLoading(true);
    const initialAdminSessionMsgId = addLoadingMessage("Checking admin session (useAdminAuthCore)...");
    
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('[useAdminAuthCore] getSession .then()');
      if (error) {
        console.error('[useAdminAuthCore] getSession error:', error.message);
        toast({ title: "Admin Session Error", description: error.message, variant: "destructive" });
        resetAdminStateInternal();
      } else {
        const supabaseSessUser = session?.user ?? null;
        setAdminUser(supabaseSessUser);
        console.log('[useAdminAuthCore] getSession success. setAdminUser to:', supabaseSessUser ? supabaseSessUser.id : 'null');
        if (supabaseSessUser) {
          await fetchAdminProfileAndUpdateStateInternal(supabaseSessUser.id);
        } else {
          resetAdminStateInternal(false); // Don't set auth loading false yet, finally will do it.
        }
      }
    }).catch(error => {
      console.error('[useAdminAuthCore] getSession .catch() error:', error.message);
      toast({ title: "Admin Session Error", description: "An unexpected error occurred.", variant: "destructive" });
      resetAdminStateInternal();
    }).finally(() => {
      removeLoadingMessage(initialAdminSessionMsgId);
      setAdminAuthLoading(false);
      console.log('[useAdminAuthCore] getSession .finally(). adminAuthLoading set to false.');
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[useAdminAuthCore] onAuthStateChange triggered. Event:', _event, 'Session User:', session?.user?.id);
        const adminAuthChangeMsgId = addLoadingMessage("Processing admin authentication state (useAdminAuthCore)...");
        setAdminAuthLoading(true); // Indicate that auth state is being processed
        
        const supabaseSessUser = session?.user ?? null;
        const previousAdminUserId = adminUser?.id;
        setAdminUser(supabaseSessUser); // Update the Supabase user immediately

        if (supabaseSessUser) {
          console.log(`[useAdminAuthCore] onAuthStateChange: User ${supabaseSessUser.id} detected. Fetching profile.`);
          await fetchAdminProfileAndUpdateStateInternal(supabaseSessUser.id);
        } else {
          console.log('[useAdminAuthCore] onAuthStateChange: No session user. Resetting admin state.');
          resetAdminStateInternal(false); // Reset state, auth loading will be handled by finally block of this handler
        }
        
        removeLoadingMessage(adminAuthChangeMsgId);
        setAdminAuthLoading(false); // Processing of this auth change is complete
        console.log('[useAdminAuthCore] onAuthStateChange: adminAuthLoading set to false.');
      }
    );
    
    return () => {
      console.log('[useAdminAuthCore] Unsubscribing auth listener.');
      authListener?.unsubscribe();
    };
  // adminUser is removed from dependency array to avoid re-running on every adminUser change, which can cause loops
  // resetAdminStateInternal and fetchAdminProfileAndUpdateStateInternal are stable due to useCallback
  }, [addLoadingMessage, removeLoadingMessage, toast, fetchAdminProfileAndUpdateStateInternal, resetAdminStateInternal]);

  const overallContextAndDataLoading = adminUser === undefined || adminAuthLoading || (adminUser !== null && adminProfileLoading);

  console.log(`[useAdminAuthCore] State Update. 
    AdminUser: ${adminUser === undefined ? 'undefined' : (adminUser === null ? 'null' : adminUser.id)}, 
    AdminProfile: ${adminProfile === undefined ? 'undefined' : (adminProfile === null ? 'null' : (adminProfile?.id || 'exists'))}, 
    IsAdmin: ${isAdmin}, 
    AdminAuthLoading: ${adminAuthLoading}, 
    AdminProfileLoading: ${adminProfileLoading}, 
    OverallLoading: ${overallContextAndDataLoading}`);

  return {
    adminUser,
    setAdminUser,
    adminProfile,
    setAdminProfile,
    isAdmin,
    setIsAdmin,
    adminAuthLoading,
    setAdminAuthLoading,
    adminProfileLoading,
    setAdminProfileLoading,
    fetchAdminProfileAndUpdateStateInternal,
    resetAdminStateInternal,
    overallContextAndDataLoading,
  };
};
