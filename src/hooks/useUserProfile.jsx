
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

export const useUserProfile = (userId, initialProfile = null, initialCredits = 0) => {
  const [profile, setProfile] = useState(initialProfile);
  const [credits, setCredits] = useState(initialCredits);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (idToFetch) => {
    console.log(`[useUserProfile] fetchUserProfile called for ID: ${idToFetch}`);
    if (!idToFetch) {
      console.log('[useUserProfile] No ID to fetch, resetting profile and credits.');
      setProfile(null);
      setCredits(0);
      return;
    }
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', idToFetch)
        .maybeSingle(); // Using maybeSingle() instead of single() to avoid the PGRST116 error

      if (error) {
        console.error('[useUserProfile] fetchUserProfile error:', error.message);
        throw error;
      }
      
      if (data) {
        console.log('[useUserProfile] Profile data found:', data);
        setProfile(data);
        setCredits(data.credits || 0);
      } else {
        console.log('[useUserProfile] No profile data found for ID:', idToFetch);
        setProfile(null);
        setCredits(0);
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
      setProfile(null);
      setCredits(0);
    } finally {
      setLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    } else {
      setProfile(null);
      setCredits(0);
    }
  }, [userId, fetchUserProfile]);

  const updateUserProfileData = useCallback(async (updatedData) => {
    if (!userId) {
      toast({ title: "Update Failed", description: "User not available.", variant: "destructive" });
      return null;
    }
    setLoadingProfile(true);
    try {
      // Handle password update if included
      if (updatedData.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: updatedData.password
        });
        if (passwordError) throw passwordError;
      }

      // Remove password-related fields from profile update
      const { password, currentPassword, confirmPassword, ...profileData } = updatedData;

      // Update profile data
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          dob: profileData.dob,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (data) {
        setProfile(data);
        toast({ title: "Success", description: "Profile updated successfully" });
        return data;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoadingProfile(false);
    }
  }, [userId, toast]);

  const updateUserCredits = useCallback(async (amount) => {
    if (!userId || !profile) {
      toast({ title: "Credit Update Failed", description: "User not available.", variant: "destructive" });
      throw new Error("User not available");
    }
    setLoadingProfile(true);
    try {
      const newCreditsTotal = (profile.credits || 0) + amount;
      if (newCreditsTotal < 0) {
        throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: newCreditsTotal, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setCredits(data.credits);
        return data.credits;
      }
    } catch (error) {
      toast({ title: "Credit Update Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setLoadingProfile(false);
    }
  }, [userId, profile, toast]);

  const resetProfile = useCallback(() => {
    setProfile(null);
    setCredits(0);
  }, []);

  return {
    profile,
    credits,
    loadingProfile,
    fetchUserProfile,
    updateUserProfile: updateUserProfileData,
    updateCredits: updateUserCredits,
    setProfile: setProfile,
    setCredits: setCredits,
    resetProfile,
  };
};
