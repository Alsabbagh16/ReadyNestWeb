
import { supabase } from '@/lib/supabase';

export const fetchAllPurchases = async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      user:profiles (first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all purchases:', error);
    throw error;
  }
  return data.map(purchase => ({
    ...purchase,
    customer_name: purchase.user ? `${purchase.user.first_name || ''} ${purchase.user.last_name || ''}`.trim() : purchase.name,
    customer_email: purchase.user ? purchase.user.email : purchase.email,
  }));
};


export const fetchAllPurchasesLight = async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select('purchase_ref_id, product_name, user_id, name, email')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching light purchases:', error);
    throw error;
  }
  return data;
};


export const updatePurchaseStatus = async (purchaseRefId, newStatus, updatedDetails = {}) => {
  const payload = { 
    status: newStatus,
    updated_at: new Date().toISOString(),
    ...updatedDetails 
  };
  
  const { data, error } = await supabase
    .from('purchases')
    .update(payload)
    .eq('purchase_ref_id', purchaseRefId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating purchase ${purchaseRefId} status:`, error);
    throw error;
  }
  return data;
};
