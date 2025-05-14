
import React, { createContext, useContext, useEffect, useCallback, useState, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuthCore } from '@/hooks/useAuthCore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserAddresses } from '@/hooks/useUserAddresses';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const {
    user,
    authContextLoading: coreAuthLoading,
    login: coreLogin,
    signup: coreSignup,
    logout: coreLogout,
    _setUserRawCore
  } = useAuthCore();

  const { toast } = useToast();

  const {
    profile,
    credits,
    loadingProfile,
    fetchUserProfile,
    updateUserProfile,
    updateCredits,
    resetProfile: resetUserProfileHook,
    setProfile: setUserProfileHook,
    setCredits: setUserCreditsHook,
  } = useUserProfile(user?.id);

  const {
    addresses,
    loadingAddresses,
    fetchUserAddresses,
    addAddressHook,
    updateAddressHook,
    deleteAddressHook,
    resetAddresses: resetUserAddressesHook,
    setAddresses: setUserAddressesHook,
  } = useUserAddresses(user?.id);

  const [isOverallLoading, setIsOverallLoading] = useState(true);

  const resetUserSpecificData = useCallback(() => {
    console.log('[AuthContext] resetUserSpecificData called.');
    resetUserProfileHook();
    resetUserAddressesHook();
  }, [resetUserProfileHook, resetUserAddressesHook]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log(`[AuthContext] Profile Deletion/Missing Check Effect. User: ${user ? user.id : 'null'}, CoreAuthLoading: ${coreAuthLoading}, LoadingProfile: ${loadingProfile}, Profile: ${profile ? 'exists' : 'null'}`);
      if (user && !coreAuthLoading && !loadingProfile && !profile) {
        console.warn('[AuthContext] User exists but profile is missing after loading. Logging out.');
        toast({
          title: "Profile Not Found",
          description: "Your user profile could not be found. Logging you out.",
          variant: "destructive",
        });
        coreLogout({ showToast: false });
        resetUserSpecificData();
        if (_setUserRawCore) {
          _setUserRawCore(null);
        }
      }
    }, 1000); // wait for 1 second

    return () => clearTimeout(timeoutId);
  }, [user, profile, coreAuthLoading, loadingProfile, coreLogout, toast, resetUserSpecificData, _setUserRawCore]);
  useEffect(() => {
    console.log(`[AuthContext] User Null Check Effect. User: ${user ? user.id : 'null'}, CoreAuthLoading: ${coreAuthLoading}`);
    if (!user && !coreAuthLoading) {
      console.log('[AuthContext] User is null and coreAuthLoading is false. Calling resetUserSpecificData.');
      resetUserSpecificData();
    }
  }, [user, coreAuthLoading, resetUserSpecificData]);

  useEffect(() => {
    const newOverallLoadingState =
      user === undefined ||
      coreAuthLoading ||
      (user !== null && loadingProfile) ||
      (user !== null && profile !== null && loadingAddresses);

    if (isOverallLoading !== newOverallLoadingState) {
      console.log(`[AuthContext] OverallLoading changed from ${isOverallLoading} to ${newOverallLoadingState}. 
        Details: user: ${user === undefined ? 'undefined' : (user === null ? 'null' : 'exists')}, 
        coreAuthLoading: ${coreAuthLoading}, 
        loadingProfile: ${loadingProfile}, 
        loadingAddresses: ${loadingAddresses}`);
      setIsOverallLoading(newOverallLoadingState);
    }
  }, [user, coreAuthLoading, loadingProfile, profile, loadingAddresses, isOverallLoading]);


  console.log(`[AuthContext] Render/Re-render. 
    User: ${user === undefined ? 'undefined' : (user === null ? 'null' : user.id)}, 
    Profile: ${profile === undefined ? 'undefined' : (profile === null ? 'null' : profile.id)}, 
    CoreAuthLoading: ${coreAuthLoading}, 
    LoadingProfile: ${loadingProfile}, 
    LoadingAddresses: ${loadingAddresses}, 
    OverallLoading: ${isOverallLoading}`);

  const contextValue = useMemo(() => ({
    user,
    profile,
    credits,
    addresses,
    loading: isOverallLoading,
    authContextLoading: coreAuthLoading,
    loadingProfile,
    loadingAddresses,
    login: coreLogin,
    signup: coreSignup,
    logout: coreLogout,
    updateProfile: updateUserProfile,
    addAddress: addAddressHook,
    updateAddress: updateAddressHook,
    deleteAddress: deleteAddressHook,
    updateUserCredits: updateCredits,
    fetchUserProfile,
    fetchUserAddresses,
    _setUserRaw: _setUserRawCore,
    _setProfileRaw: setUserProfileHook,
    _setCreditsRaw: setUserCreditsHook,
    _setAddressesRaw: setUserAddressesHook,
  }), [
    user, profile, credits, addresses, isOverallLoading, coreAuthLoading, loadingProfile, loadingAddresses,
    coreLogin, coreSignup, coreLogout, updateUserProfile, addAddressHook, updateAddressHook, deleteAddressHook,
    updateCredits, fetchUserProfile, fetchUserAddresses, _setUserRawCore, setUserProfileHook, setUserCreditsHook, setUserAddressesHook
  ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
