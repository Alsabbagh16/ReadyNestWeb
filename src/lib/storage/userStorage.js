
import { supabase } from '@/lib/supabase';

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
  return data.map(u => ({
    ...u,
    createdAt: u.created_at ? new Date(u.created_at) : null,
    dob: u.dob ? new Date(u.dob) : null,
    name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
  }));
};

export const findUserById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      addresses (*),
      user_notes (*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
  return data ? { 
    ...data, 
    createdAt: data.created_at ? new Date(data.created_at) : null,
    dob: data.dob ? new Date(data.dob) : null,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    notes: data.user_notes && data.user_notes.length > 0 ? data.user_notes[0].notes : ''
  } : null;
};

export const findUserByEmail = async (email) => {
  if (!email) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      addresses (*),
      user_notes (*)
    `)
    .eq('email', email)
    .maybeSingle(); 

  if (error) {
    console.error(`Error fetching user by email ${email}:`, error);
    return null;
  }
  return data ? { 
    ...data, 
    createdAt: data.created_at ? new Date(data.created_at) : null,
    dob: data.dob ? new Date(data.dob) : null,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    notes: data.user_notes && data.user_notes.length > 0 ? data.user_notes[0].notes : ''
  } : null;
};


export const adminUpdateUserProfile = async (userId, updatedData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updatedData, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    throw error;
  }
  return data;
};

export const adminAddAddress = async (userId, addressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .insert([{ ...addressData, user_id: userId }])
    .select();
  if (error) throw error;
  return data;
};

export const adminUpdateAddress = async (addressId, updatedAddressData) => {
  const { data, error } = await supabase
    .from('addresses')
    .update({ ...updatedAddressData, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .select();
  if (error) throw error;
  return data;
};

export const adminDeleteAddress = async (addressId) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);
  if (error) throw error;
  return true;
};

export const adminUpdateCredits = async (userId, newCreditsTotal) => {
  if (newCreditsTotal < 0) throw new Error("Credits cannot be negative.");
  const { data, error } = await supabase
    .from('profiles')
    .update({ credits: newCreditsTotal, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, credits')
    .single();
  if (error) throw error;
  return data.credits;
};

export const deleteUser = async (userId) => {
  await supabase.from('addresses').delete().eq('user_id', userId);
  await supabase.from('user_notes').delete().eq('user_id', userId);
  await supabase.from('bookings').update({ user_id: null }).eq('user_id', userId);

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error(`Error deleting profile for user ${userId}:`, profileError);
    throw profileError;
  }
  
  return true;
};

export const saveUserNotes = async (userId, notes) => {
  const { data: existingNotes, error: fetchError } = await supabase
    .from('user_notes')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') { 
     console.error('Error fetching user notes:', fetchError);
     throw fetchError;
  }

  if (existingNotes) {
    const { error: updateError } = await supabase
      .from('user_notes')
      .update({ notes: notes, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('user_notes')
      .insert({ user_id: userId, notes: notes });
    if (insertError) throw insertError;
  }
};

export const getUserNotes = async (userId) => {
  const { data, error } = await supabase
    .from('user_notes')
    .select('notes')
    .eq('user_id', userId)
    .maybeSingle(); 

  if (error && error.code !== 'PGRST116') { 
    console.error('Error fetching user notes:', error);
    return ''; 
  }
  return data ? data.notes : '';
};
  