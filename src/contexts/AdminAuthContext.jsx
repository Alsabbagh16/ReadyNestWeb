
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { findEmployeeById, findEmployeeByEmail } from '@/lib/storage/employeeStorage';
import { useLoading } from '@/contexts/LoadingContext';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(undefined); 
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true); 
  const [adminProfileLoading, setAdminProfileLoading] = useState(false); 
  const { toast } = useToast();
  const { addLoadingMessage, removeLoadingMessage } = useLoading();

  const resetAdminState = useCallback(() => {
    console.log('[AdminAuthContext] resetAdminState called.');
    setAdminProfile(null);
    setIsAdmin(false);
    setAdminProfileLoading(false); 
  }, []);

  const fetchAdminProfileAndUpdateState = useCallback(async (supabaseUserId, isExplicitAdminLogin = false) => {
    console.log(`[AdminAuthContext] fetchAdminProfileAndUpdateState called for ID: ${supabaseUserId}. ExplicitAdminLogin: ${isExplicitAdminLogin}`);
    if (!supabaseUserId) {
      console.log('[AdminAuthContext] No Supabase User ID provided, resetting admin state.');
      resetAdminState();
      return;
    }

    const profileMsgId = addLoadingMessage("Fetching admin profile details (AdminAuthContext)...");
    setAdminProfileLoading(true);
    console.log('[AdminAuthContext] setAdminProfileLoading to true.');

    try {
      const employeeProfile = await findEmployeeById(supabaseUserId);
      console.log('[AdminAuthContext] Fetched employeeProfile:', employeeProfile);
      if (employeeProfile && (employeeProfile.role === 'admin' || employeeProfile.role === 'superadmin')) {
        setAdminProfile(employeeProfile);
        setIsAdmin(true);
        console.log('[AdminAuthContext] Admin profile found and set. IsAdmin: true.');
      } else {
        resetAdminState();
        console.log('[AdminAuthContext] Admin profile not found or not admin role. IsAdmin: false.');
        if (isExplicitAdminLogin && employeeProfile) { 
           toast({ title: "Access Denied", description: "You do not have admin privileges.", variant: "destructive" });
        } else if (isExplicitAdminLogin && !employeeProfile) {
           toast({ title: "Login Failed", description: "Admin account not found in employee records.", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error('[AdminAuthContext] Error fetching admin profile:', error.message);
      if (isExplicitAdminLogin || (error.code && error.code !== 'PGRST116') ) { 
        toast({ title: "Admin Profile Error", description: `Could not fetch admin details: ${error.message}`, variant: "destructive" });
      } else if (error.code === 'PGRST116'){
        console.log('[AdminAuthContext] findEmployeeById returned no rows (PGRST116), likely not an admin. Handled gracefully.');
      }
      resetAdminState();
    } finally {
      removeLoadingMessage(profileMsgId);
      setAdminProfileLoading(false);
      console.log('[AdminAuthContext] setAdminProfileLoading to false.');
    }
  }, [toast, addLoadingMessage, removeLoadingMessage, resetAdminState]);

  useEffect(() => {
    console.log('[AdminAuthContext] Initializing: setting adminAuthLoading to true.');
    setAdminAuthLoading(true);
    const initialAdminSessionMsgId = addLoadingMessage("Checking admin session (AdminAuthContext)...");
    console.log('[AdminAuthContext] Attempting to get session...');

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      console.log('[AdminAuthContext] getSession .then()');
      if (error) {
        console.error('[AdminAuthContext] getSession error:', error.message);
        toast({ title: "Admin Session Error", description: error.message, variant: "destructive" });
        setAdminUser(null);
        resetAdminState();
      } else {
        const supabaseSessUser = session?.user ?? null;
        setAdminUser(supabaseSessUser);
        console.log('[AdminAuthContext] getSession success. setAdminUser to:', supabaseSessUser ? supabaseSessUser.id : 'null');
      }
    }).catch(error => {
      console.error('[AdminAuthContext] getSession .catch() error:', error.message);
      toast({ title: "Admin Session Error", description: "An unexpected error occurred.", variant: "destructive" });
      setAdminUser(null);
      resetAdminState();
    }).finally(() => {
      removeLoadingMessage(initialAdminSessionMsgId);
      setAdminAuthLoading(false);
      console.log('[AdminAuthContext] getSession .finally(). adminAuthLoading set to false.');
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[AdminAuthContext] onAuthStateChange triggered. Event:', _event);
        const adminAuthChangeMsgId = addLoadingMessage("Processing admin authentication state (AdminAuthContext)...");
        setAdminAuthLoading(true);
        console.log('[AdminAuthContext] onAuthStateChange: setting adminAuthLoading to true.');

        const supabaseSessUser = session?.user ?? null;
        setAdminUser(supabaseSessUser);
        console.log('[AdminAuthContext] onAuthStateChange: setAdminUser to:', supabaseSessUser ? supabaseSessUser.id : 'null');

        if (!supabaseSessUser) {
          resetAdminState();
        }
        
        removeLoadingMessage(adminAuthChangeMsgId);
        setAdminAuthLoading(false);
        console.log('[AdminAuthContext] onAuthStateChange: adminAuthLoading set to false.');
      }
    );
    
    return () => {
      console.log('[AdminAuthContext] Unsubscribing auth listener.');
      authListener?.unsubscribe();
    };
  }, [addLoadingMessage, removeLoadingMessage, resetAdminState, toast]);


  const adminLogin = async (email, password) => {
    console.log('[AdminAuthContext] adminLogin attempt started.');
    setAdminAuthLoading(true);
    const loginMsgId = addLoadingMessage("Admin logging in (AdminAuthContext)...");
    try {
      const employee = await findEmployeeByEmail(email);
      if (!employee) {
        console.warn('[AdminAuthContext] adminLogin: Employee not found by email.');
        throw new Error("Admin account not found or not registered as an employee.");
      }
      if (employee.role !== 'admin' && employee.role !== 'superadmin') {
        console.warn('[AdminAuthContext] adminLogin: Employee role not admin/superadmin.');
        throw new Error("Access Denied: User is not an authorized administrator.");
      }
      console.log('[AdminAuthContext] adminLogin: Employee found with correct role:', employee.id);

      const { data: { user: supabaseSessUser, session }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error('[AdminAuthContext] adminLogin: Supabase signInWithPassword error:', signInError.message);
        throw signInError;
      }
      if (!supabaseSessUser) {
        console.error('[AdminAuthContext] adminLogin: Supabase signInWithPassword no user returned.');
        throw new Error("Admin login failed with Supabase, please try again.");
      }
      console.log('[AdminAuthContext] adminLogin: Supabase signInWithPassword successful for:', supabaseSessUser.id);
      
      setAdminUser(supabaseSessUser); // Set user immediately
      await fetchAdminProfileAndUpdateState(supabaseSessUser.id, true); // Explicitly fetch profile for admin login
      
      if (isAdmin && adminProfile) { // Check if fetchAdminProfileAndUpdateState was successful
         toast({ title: "Admin Login Successful", description: `Welcome back, ${adminProfile.full_name || 'Admin'}!` });
      } else if (!isAdmin && !adminProfileLoading) { // If fetch completed but user is not admin
          await adminLogout(); // Force logout if not a valid admin after all checks
          throw new Error("Admin login succeeded but employee record or role is invalid.");
      }

    } catch (error) {
      toast({ title: "Admin Login Failed", description: error.message, variant: "destructive" });
      setAdminAuthLoading(false); 
      console.log('[AdminAuthContext] adminLogin failed in catch block. adminAuthLoading set to false.');
      throw error;
    } finally {
      removeLoadingMessage(loginMsgId);
      setAdminAuthLoading(false); 
      console.log('[AdminAuthContext] adminLogin .finally(). adminAuthLoading set to false');
    }
  };

  const adminLogout = async () => {
    console.log('[AdminAuthContext] adminLogout attempt started.');
    setAdminAuthLoading(true);
    const logoutMsgId = addLoadingMessage("Admin logging out (AdminAuthContext)...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
         console.error('[AdminAuthContext] adminLogout error:', error.message);
        throw error;
      }
      toast({ title: "Admin Logged Out", description: "You have been successfully logged out." });
      console.log('[AdminAuthContext] adminLogout successful.');
    } catch (error) {
      toast({ title: "Admin Logout Failed", description: error.message, variant: "destructive" });
      console.error('[AdminAuthContext] adminLogout catch error:', error.message);
    } finally {
      setAdminUser(null);
      resetAdminState();
      removeLoadingMessage(logoutMsgId);
      setAdminAuthLoading(false);
      console.log('[AdminAuthContext] adminLogout .finally(). adminAuthLoading set to false.');
    }
  };
  
  const overallContextAndDataLoading = adminUser === undefined || adminAuthLoading || (adminUser !== null && adminProfileLoading);

  console.log(`[AdminAuthContext] Render/Re-render. 
    AdminUser: ${adminUser === undefined ? 'undefined' : (adminUser === null ? 'null' : adminUser.id)}, 
    AdminProfile: ${adminProfile === undefined ? 'undefined' : (adminProfile === null ? 'null' : adminProfile.id)}, 
    IsAdmin: ${isAdmin}, 
    AdminAuthLoading: ${adminAuthLoading}, 
    AdminProfileLoading: ${adminProfileLoading}, 
    OverallLoading: ${overallContextAndDataLoading}`);


  const value = {
    adminUser,
    adminProfile,
    isAdmin,
    loading: overallContextAndDataLoading, 
    adminAuthLoading, 
    adminProfileLoading,
    adminLogin,
    adminLogout,
    fetchAdminProfile: fetchAdminProfileAndUpdateState, 
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
  