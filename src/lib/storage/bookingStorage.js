
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const generateShortId = () => {
    return uuidv4().substring(0, 6).toUpperCase();
};

export const getBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      profile:profiles (id, first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  return data.map(b => ({
    ...b,
    id: b.id, // Ensure id is the short one from DB
    reference_number: b.reference_number || b.id, // Fallback for older data if any
    customerName: b.profile ? `${b.profile.first_name || ''} ${b.profile.last_name || ''}`.trim() : b.contact_name || 'N/A',
    customerEmail: b.profile ? b.profile.email : b.contact_email || 'N/A',
  }));
};

export const addBooking = async (bookingData) => {
  const shortId = generateShortId();
  const bookingPayload = {
    id: shortId, // Use generated shortId for the primary key
    reference_number: shortId, // Also set reference_number explicitly
    user_id: bookingData.userId || null,
    service_type: bookingData.service,
    service_details: {
      homeSize: bookingData.homeSize,
      extras: bookingData.extras,
      servicePlan: bookingData.servicePlan,
      bookingType: bookingData.bookingType,
    },
    booking_date: bookingData.dateTime,
    frequency: bookingData.frequency,
    contact_name: bookingData.name,
    contact_email: bookingData.email,
    contact_phone: bookingData.phone,
    contact_address: bookingData.address,
    price: bookingData.price,
    payment_method: bookingData.paymentMethod,
    paid_with_credits: bookingData.paidWithCredits || 0,
    status: bookingData.status, // e.g. 'booked_credit', 'quote_requested'
    service_status: bookingData.status === 'quote_requested' ? 'Quote Requested' : 'Pending',
    assigned_employee_ids: [],
    notes: bookingData.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingPayload)
    .select()
    .single();

  if (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
  return { ...data, id: data.id }; // Ensure returned object has the short ID
};

export const getBookingById = async (id) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      profile:profiles (id, first_name, last_name, email, phone),
      assigned_employees:employees (id, full_name, email)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching booking by ID:', error);
    return null;
  }
  if (!data) return null;

  return {
    ...data,
    id: data.id, // Ensure id is the short one
    reference_number: data.reference_number || data.id,
    customerName: data.profile ? `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim() : data.contact_name || 'N/A',
    customerEmail: data.profile ? data.profile.email : data.contact_email || 'N/A',
    customerPhone: data.profile ? data.profile.phone : data.contact_phone || 'N/A',
    // Map assigned_employee_ids to full employee objects if needed, or handle in component
  };
};

export const updateBooking = async (id, updatedData) => {
  // Ensure assignedEmployeeIds is an array, even if a single string is passed
  if (updatedData.assignedEmployeeIds && !Array.isArray(updatedData.assignedEmployeeIds)) {
    updatedData.assignedEmployeeIds = [updatedData.assignedEmployeeIds];
  } else if (updatedData.hasOwnProperty('assignedEmployeeIds') && updatedData.assignedEmployeeIds === null) {
    updatedData.assignedEmployeeIds = [];
  }


  const { data, error } = await supabase
    .from('bookings')
    .update({ ...updatedData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
  return { ...data, id: data.id };
};

export const updateAssignedEmployees = async (bookingId, employeeIds) => {
  // Here, employeeIds should be an array of UUIDs
  const { data, error } = await supabase
    .from('bookings')
    .update({ assigned_employee_ids: employeeIds, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating assigned employees:', error);
    throw error;
  }
  return { ...data, id: data.id };
};

export const updateBookingServiceStatus = async (bookingId, newStatus) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ service_status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking service status:', error);
    throw error;
  }
  return { ...data, id: data.id };
};

export const cancelBooking = async (bookingId) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      service_status: 'Cancelled',
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
  return { ...data, id: data.id };
};

export const refundBooking = async (bookingId) => {
  // Note: Refunding credits to user needs to be handled separately, possibly in AuthContext or a dedicated service
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'refunded',
      // service_status: 'Refunded', // Optionally update service status
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error refunding booking:', error);
    throw error;
  }
  return { ...data, id: data.id };
};

export const getBookingsByEmployeeId = async (employeeId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .contains('assigned_employee_ids', [employeeId]); // Check if array contains employeeId

  if (error) {
    console.error('Error fetching bookings by employee ID:', error);
    return [];
  }
  return data.map(b => ({ ...b, id: b.id }));
};

export const getBookingsByUserId = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings by user ID:', error);
    return [];
  }
  return data.map(b => ({ ...b, id: b.id, reference_number: b.reference_number || b.id }));
};

// This function is no longer needed as Supabase handles it via trigger
// export const saveBookings = (bookings) => { /* localStorage logic removed */ };
  