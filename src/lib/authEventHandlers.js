
import { supabase } from '@/lib/supabase';

export const handleOAuthSignIn = async (sessionUser, toast) => {
  console.log(`[AuthEventHandlers] SIGNED_IN (OAuth): Attempting to fetch profile from 'profiles' for user ID: ${sessionUser.id}`);
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("[AuthEventHandlers] SIGNED_IN (OAuth): Error fetching profile:", profileError);
      toast({ title: "Profile Fetch Error", description: `Could not fetch your profile: ${profileError.message}`, variant: "destructive" });
    } else if (!profile && sessionUser.email) {
      console.log("[AuthEventHandlers] SIGNED_IN (OAuth): No profile found, creating one:", sessionUser.id);
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
      console.log(`[AuthEventHandlers] SIGNED_IN (OAuth): Attempting to insert new profile into 'profiles':`, newProfileData);
      const { error: insertError } = await supabase.from('profiles').insert(newProfileData);
      if (insertError) {
        console.error("[AuthEventHandlers] SIGNED_IN (OAuth): Error creating profile:", insertError);
        toast({ title: "Profile Creation Failed", description: `Could not create user profile: ${insertError.message}`, variant: "destructive" });
      } else {
        console.log("[AuthEventHandlers] SIGNED_IN (OAuth): Profile created successfully:", newProfileData.id);
      }
    } else if (profile) {
       console.log("[AuthEventHandlers] SIGNED_IN (OAuth): Profile found:", profile.id);
    }
  } catch (error) {
    console.error("[AuthEventHandlers] SIGNED_IN (OAuth): Exception during profile handling:", error);
    toast({ title: "OAuth Error", description: "An unexpected error occurred during Google Sign-In.", variant: "destructive" });
  }
};
  