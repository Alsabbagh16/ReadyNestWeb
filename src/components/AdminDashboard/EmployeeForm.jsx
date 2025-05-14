
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import EmployeeFormFields from '@/components/AdminDashboard/EmployeeFormFields';

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const { toast } = useToast();
  const isEditingEmployee = !!employee;

  const initialFormData = {
    id: '',
    email: '',
    mobile: '',
    address: '',
    position: '',
    fullName: '',
    origin: '',
    sex: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    dateOfBirth: '',
    hireDate: '',
    visaNumber: '',
    visaIssuanceDate: '',
    visaExpiryDate: '',
    photoUrl: '',
    role: 'employee', 
    newPassword: '',
    confirmNewPassword: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id || '',
        email: employee.email || '',
        mobile: employee.mobile || '',
        address: employee.address || '',
        position: employee.position || '',
        fullName: employee.full_name || employee.fullName || '',
        origin: employee.origin || '',
        sex: employee.sex || '',
        passportNumber: employee.passport_number || employee.passportNumber || '',
        passportIssueDate: employee.passport_issue_date || employee.passportIssueDate || '',
        passportExpiryDate: employee.passport_expiry_date || employee.passportExpiryDate || '',
        dateOfBirth: employee.date_of_birth || employee.dateOfBirth || '',
        hireDate: employee.hire_date || employee.hireDate || '',
        visaNumber: employee.visa_number || employee.visaNumber || '',
        visaIssuanceDate: employee.visa_issuance_date || employee.visaIssuanceDate || '',
        visaExpiryDate: employee.visa_expiry_date || employee.visaExpiryDate || '',
        photoUrl: employee.photo_url || employee.photoUrl || '',
        role: employee.role || 'employee',
        newPassword: '',
        confirmNewPassword: '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.role) {
      toast({ title: "Validation Error", description: "Full Name, Email, and Role are required.", variant: "destructive" });
      return;
    }
    if (!isEditingEmployee && !formData.id) {
      toast({ title: "Validation Error", description: "Employee ID is required for new employees. This should match their Supabase Auth User ID.", variant: "destructive" });
      return;
    }
    if (!isEditingEmployee && !formData.newPassword) {
        toast({title: "Validation Error", description: "Password is required for new employees.", variant: "destructive"});
        return;
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      toast({ title: "Validation Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    
    const dataToSave = { ...formData };
    if (isEditingEmployee && employee?.id) {
      dataToSave.id = employee.id;
    }
    
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
      <EmployeeFormFields
        formData={formData}
        handleChange={handleChange}
        isEditingEmployee={isEditingEmployee}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
      />
      <DialogFooter className="pt-6 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Employee</Button>
      </DialogFooter>
    </form>
  );
};

export default EmployeeForm;
  