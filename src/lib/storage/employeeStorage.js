
import { supabase } from '@/lib/supabase';

export const getEmployees = async () => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employees:', error);
    if (error.message.includes("infinite recursion")) {
        throw new Error("Failed to fetch employees due to a Supabase RLS policy issue (infinite recursion). Please check your 'employees' table policies.");
    }
    throw error;
  }
  return data;
};

export const addEmployee = async (employeeData) => {
  if (!employeeData.email) {
    throw new Error("Email is required for new employees.");
  }
  if (!employeeData.id) {
    throw new Error("Employee ID (matching Supabase Auth user ID) is required.");
  }
  if (!employeeData.newPassword) {
      throw new Error("Initial password is required for new employees.");
  }

  try {
    const { data: user, error: signUpError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: employeeData.newPassword,
        options: {
            data: { 
                full_name: employeeData.fullName,
                role: employeeData.role || 'employee' 
            }
        }
    });

    if (signUpError) {
        console.error('Error creating Supabase auth user:', signUpError);
        throw new Error(`Failed to create auth user: ${signUpError.message}`);
    }
    
    if (!user || !user.user || !user.user.id) {
        throw new Error("Supabase auth user creation did not return expected user object.");
    }

    const employeePayload = {
        id: user.user.id, 
        email: employeeData.email,
        full_name: employeeData.fullName,
        mobile: employeeData.mobile,
        address: employeeData.address,
        position: employeeData.position,
        origin: employeeData.origin,
        sex: employeeData.sex,
        passport_number: employeeData.passportNumber,
        passport_issue_date: employeeData.passportIssueDate || null,
        passport_expiry_date: employeeData.passportExpiryDate || null,
        date_of_birth: employeeData.dateOfBirth || null,
        hire_date: employeeData.hireDate || null,
        visa_number: employeeData.visaNumber,
        visa_issuance_date: employeeData.visaIssuanceDate || null,
        visa_expiry_date: employeeData.visaExpiryDate || null,
        photo_url: employeeData.photoUrl,
        role: employeeData.role || 'employee',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const { data: employeeProfile, error: profileError } = await supabase
        .from('employees')
        .insert(employeePayload)
        .select()
        .single();

    if (profileError) {
        console.error('Error adding employee profile:', profileError);
        await supabase.auth.admin.deleteUser(user.user.id);
        throw new Error(`Failed to save employee profile: ${profileError.message}`);
    }
    return employeeProfile;

  } catch (error) {
      console.error('Full error in addEmployee:', error);
      throw error;
  }
};

export const updateEmployee = async (updatedData) => {
  const { id, newPassword, confirmNewPassword, ...employeeDetails } = updatedData;

  if (!id) {
    throw new Error("Employee ID is required for updates.");
  }

  if (newPassword) {
    if (newPassword !== confirmNewPassword) {
      throw new Error("New passwords do not match.");
    }
    try {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(id, {
        password: newPassword,
      });
      if (passwordError) {
        console.error('Error updating employee password in Supabase Auth:', passwordError);
        throw new Error(`Failed to update password: ${passwordError.message}. Ensure RLS policies on auth.users allow this admin action or use a Supabase Edge Function.`);
      }
    } catch (e) {
        console.error('Catch block for password update error:', e);
        throw e;
    }
  }

  const payloadToUpdate = {
    ...employeeDetails,
    full_name: updatedData.fullName || updatedData.full_name,
    passport_number: updatedData.passportNumber || updatedData.passport_number,
    passport_issue_date: updatedData.passportIssueDate || updatedData.passport_issue_date || null,
    passport_expiry_date: updatedData.passportExpiryDate || updatedData.passport_expiry_date || null,
    date_of_birth: updatedData.dateOfBirth || updatedData.date_of_birth || null,
    hire_date: updatedData.hireDate || updatedData.hire_date || null,
    visa_number: updatedData.visaNumber || updatedData.visa_number,
    visa_issuance_date: updatedData.visaIssuanceDate || updatedData.visa_issuance_date || null,
    visa_expiry_date: updatedData.visaExpiryDate || updatedData.visa_expiry_date || null,
    photo_url: updatedData.photoUrl || updatedData.photo_url,
    updated_at: new Date().toISOString(),
  };
  
  const validColumns = [
    'email', 'full_name', 'mobile', 'address', 'position', 'origin', 'sex', 
    'passport_number', 'passport_issue_date', 'passport_expiry_date', 
    'date_of_birth', 'hire_date', 'visa_number', 'visa_issuance_date', 'visa_expiry_date', 
    'photo_url', 'role', 'updated_at'
  ];

  const filteredPayload = Object.keys(payloadToUpdate)
    .filter(key => validColumns.includes(key) && payloadToUpdate[key] !== undefined) // Ensure undefined values are not sent
    .reduce((obj, key) => {
      obj[key] = payloadToUpdate[key];
      return obj;
    }, {});


  const { data, error } = await supabase
    .from('employees')
    .update(filteredPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating employee profile:', error);
    throw error;
  }
  if (!data) throw new Error("Employee not found for profile update");
  return data;
};

export const deleteEmployee = async (employeeId) => {
  try {
    const { error: profileDeleteError, count } = await supabase
        .from('employees')
        .delete({ count: 'exact' })
        .eq('id', employeeId);

    if (profileDeleteError) {
        console.error('Error deleting employee profile:', profileDeleteError);
        throw profileDeleteError;
    }
    if (count === 0) {
        console.warn("Employee profile not found for deletion, or already deleted.");
    }
    
    const { error: authUserDeleteError } = await supabase.auth.admin.deleteUser(employeeId);
    if (authUserDeleteError) {
        console.error('Error deleting employee Supabase Auth user:', authUserDeleteError);
        if (authUserDeleteError.message.includes("User not found")) {
            console.warn("Supabase Auth user not found, may have been deleted already or mismatch.");
        } else {
          throw new Error(`Failed to delete Auth user: ${authUserDeleteError.message}. Profile was deleted if it existed.`);
        }
    }
    return true;
  } catch (error) {
      console.error('Full error in deleteEmployee:', error);
      throw error;
  }
};

export const findEmployeeByEmail = async (email) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email)
    .maybeSingle(); 

  if (error) {
    console.error('Error finding employee by email:', error);
     if (error.message.includes("infinite recursion")) {
        throw new Error("Failed to find employee due to a Supabase RLS policy issue (infinite recursion). Please check your 'employees' table policies.");
    }
    return null; 
  }
  return data;
};

export const findEmployeeById = async (id) => {
  if (!id) return null;
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error finding employee by ID:', error);
    if (error.message.includes("infinite recursion")) {
        throw new Error("Failed to find employee due to a Supabase RLS policy issue (infinite recursion). Please check your 'employees' table policies.");
    }
    // Do not throw error here, return null to allow UI to handle "not found"
    return null;
  }
  return data;
};

export const updateEmployeePhotoUrl = async (employeeId, photoUrl) => {
    if (!employeeId || !photoUrl) {
        throw new Error("Employee ID and Photo URL are required.");
    }
    const { data, error } = await supabase
        .from('employees')
        .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
        .eq('id', employeeId)
        .select()
        .single();

    if (error) {
        console.error('Error updating employee photo URL:', error);
        throw error;
    }
    return data;
};

// Conceptual: In a real app, this would likely involve a separate 'employee_documents' table
export const addEmployeeDocumentMetadata = async (employeeId, documentInfo) => {
    // documentInfo could be { name: 'passport.pdf', url: '...', type: 'passport', uploaded_at: ... }
    // This is a placeholder. You'd insert into your documents table.
    console.log('Conceptual: Adding document metadata for employee', employeeId, documentInfo);
    // Example:
    // const { data, error } = await supabase.from('employee_documents').insert({ employee_id: employeeId, ...documentInfo });
    // if (error) throw error;
    // return data;
    return Promise.resolve({ message: "Document metadata conceptually added." });
};
  