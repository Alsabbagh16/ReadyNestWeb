
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthCore } from '@/hooks/useAuthCore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserAddresses } from '@/hooks/useUserAddresses';
import { useLoading } from '@/contexts/LoadingContext';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

export const useAuthDataManagement = () => {
  const { 
    user, 
    authContextLoading: coreAuthLoading, 
    login: coreLogin, 
    signup: coreSignup, 
    logout: coreLogout,
    _setUserRawCore
  } = useAuthCore();
  
  const { toast } = useToast();
  const { addLoadingMessage, removeLoadingMessage } = useLoading();
  const navigate = useNavigate();

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [profileCheckTimeoutId, setProfileCheckTimeoutId] = useState(null);
  const [overallLoadingMsgId, setOverallLoadingMsgId] = useState(null);


  const resetUserSpecificData = useCallback(() => {
    console.log('[AuthDataManagement] resetUserSpecificData called.');
    resetUserProfileHook();
    resetUserAddressesHook();
  }, [resetUserProfileHook, resetUserAddressesHook]);

  useEffect(() => {
    if (isOverallLoading && !overallLoadingMsgId) {
      const newMsgId = addLoadingMessage("AuthData: Initializing session data...");
      setOverallLoadingMsgId(newMsgId);
    } else if (!isOverallLoading && overallLoadingMsgId) {
      removeLoadingMessage(overallLoadingMsgId);
      setOverallLoadingMsgId(null);
    }
    
    return () => {
      if (overallLoadingMsgId) {
        removeLoadingMessage(overallLoadingMsgId);
        setOverallLoadingMsgId(null);
      }
    };
  }, [isOverallLoading, addLoadingMessage, removeLoadingMessage, overallLoadingMsgId]);

  useEffect(() => {
    console.log(`[AuthDataManagement] State Update Evaluation: user=${user === undefined ? 'undefined' : (user ? user.id : 'null')}, coreAuthLoading=${coreAuthLoading}, loadingProfile=${loadingProfile}, profile=${profile ? profile.id : 'null'}, loadingAddresses=${loadingAddresses}, current isOverallLoading=${isOverallLoading}, current initialLoadComplete=${initialLoadComplete}`);
    
    let newOverallLoadingState;
    if (user === undefined || coreAuthLoading) {
      newOverallLoadingState = true;
      console.log(`[AuthDataManagement] Calculated newOverallLoadingState = true (Reason: user undefined or coreAuthLoading)`);
    } else if (user !== null) { 
      newOverallLoadingState = loadingProfile || (profile !== null && loadingAddresses);
      console.log(`[AuthDataManagement] Calculated newOverallLoadingState = ${newOverallLoadingState} (Reason: user authenticated, depends on profile/address loading)`);
    } else { 
      newOverallLoadingState = false;
      console.log(`[AuthDataManagement] Calculated newOverallLoadingState = false (Reason: user is null and not coreAuthLoading)`);
    }

    if (isOverallLoading !== newOverallLoadingState) {
      console.log(`[AuthDataManagement] OverallLoading changing from ${isOverallLoading} to ${newOverallLoadingState}`);
      setIsOverallLoading(newOverallLoadingState);
    }
    
    if (!newOverallLoadingState && !initialLoadComplete && user !== undefined) {
      console.log('[AuthDataManagement] Initial load sequence COMPLETE. Setting initialLoadComplete to true.');
      setInitialLoadComplete(true);
      console.log(`[AuthDataManagement] Status after setInitialLoadComplete(true): initialLoadComplete is now true. User=${user ? user.id : 'null'}, Profile=${profile ? profile.id : 'null'}`);
    }

  }, [user, coreAuthLoading, loadingProfile, profile, loadingAddresses, isOverallLoading, initialLoadComplete]);
  
  useEffect(() => {
    console.log(`[AuthDataManagement] Profile Check Effect Triggered. Current initialLoadComplete=${initialLoadComplete}`);
    if (profileCheckTimeoutId) {
      clearTimeout(profileCheckTimeoutId);
      setProfileCheckTimeoutId(null);
      console.log("[AuthDataManagement] Profile Check: Cleared existing timeout due to effect re-run.");
    }

    console.log(`[AuthDataManagement] Profile Check EVALUATION: initialLoadComplete=${initialLoadComplete}, user=${!!user}, profile=${!!profile}, coreAuthLoading=${coreAuthLoading}, loadingProfile=${loadingProfile}, isOverallLoading=${isOverallLoading}`);

    if (initialLoadComplete && user && !profile && !coreAuthLoading && !loadingProfile && !isOverallLoading) {
      console.log("[AuthDataManagement] Profile Check: Conditions MET. Setting 2s timeout for logout.");
      const newTimeoutId = setTimeout(async () => {
        console.warn('[AuthDataManagement] Profile Check: TIMEOUT EXECUTING. User exists but profile is missing after all loading. Logging out.');
        
        if (user && !profile && !loadingProfile) { 
          toast({
            title: "Profile Not Found",
            description: "Your user profile could not be found. Logging you out.",
            variant: "destructive",
          });
          
          await coreLogout({ showToast: false }); 
          resetUserSpecificData(); 
          if (_setUserRawCore) {
            _setUserRawCore(null); 
          }
          
          navigate('/auth', { replace: true });
        } else {
          console.log("[AuthDataManagement] Profile Check: TIMEOUT - Profile found, user changed, or loading state changed during timeout. Aborting logout.");
        }
      }, 2000); 
      setProfileCheckTimeoutId(newTimeoutId);
    } else if (initialLoadComplete) {
      console.log("[AuthDataManagement] Profile Check: Conditions NOT MET or profile found. (initialLoadComplete=true, but other conditions failed or profile exists)");
    } else {
      console.log("[AuthDataManagement] Profile Check: initialLoadComplete is FALSE. Conditions not evaluated for timeout.");
    }
    
    return () => {
      if (profileCheckTimeoutId) {
        clearTimeout(profileCheckTimeoutId);
        console.log("[AuthDataManagement] Profile Check: Cleanup - Cleared timeout due to effect cleanup or re-run.");
        setProfileCheckTimeoutId(null); 
      }
    };
  }, [initialLoadComplete, user, profile, coreAuthLoading, loadingProfile, isOverallLoading, coreLogout, toast, resetUserSpecificData, _setUserRawCore, navigate, profileCheckTimeoutId]); 
  
  useEffect(() => {
    if (initialLoadComplete && !user && !coreAuthLoading && !isOverallLoading) { 
        console.log('[AuthDataManagement] User Null Check: User is null and all loading complete. Calling resetUserSpecificData.');
        resetUserSpecificData();
    }
  }, [initialLoadComplete, user, coreAuthLoading, isOverallLoading, resetUserSpecificData]);

  const authData = useMemo(() => ({
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

  return authData;
};
  