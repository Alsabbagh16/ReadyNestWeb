
import React, { useState, useEffect, useCallback } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/storage/employeeStorage';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Terminal, ShieldAlert } from 'lucide-react';
import EmployeeTable from '@/components/AdminDashboard/EmployeeTable';
import EmployeeDialog from '@/components/AdminDashboard/EmployeeDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState(null);
  const { toast } = useToast();
  const { adminProfile } = useAdminAuth();

  const canManageEmployees = adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'superadmin');

  const fetchEmployeesCallback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (error) {
      toast({ title: "Error Fetching Employees", description: error.message, variant: "destructive" });
      setEmployees([]); 
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployeesCallback();
  }, [fetchEmployeesCallback]);

  const handleSaveEmployee = async (employeeData) => {
    if (!canManageEmployees) {
      toast({ title: "Permission Denied", description: "You do not have permission to manage employees.", variant: "destructive" });
      return;
    }
    setFormError(null); 
    try {
      if (editingEmployee) {
        await updateEmployee(employeeData);
        toast({ title: "Employee Updated", description: `Details for ${employeeData.fullName || employeeData.email} saved.` });
      } else {
        await addEmployee(employeeData);
        toast({ title: "Employee Added", description: `${employeeData.fullName || employeeData.email} added and Supabase Auth user created.` });
      }
      setIsDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployeesCallback(); 
    } catch (error) {
      let errorMessage = error.message || "An unexpected error occurred.";
      if (error.message && error.message.includes("User already registered")) {
        errorMessage = "This email is already registered as a Supabase user.";
      } else if (error.message && error.message.includes("already exists")) {
        errorMessage = error.message; 
      }
      toast({ title: "Error Saving Employee", description: errorMessage, variant: "destructive" });
      setFormError(errorMessage);
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
     if (!canManageEmployees) {
      toast({ title: "Permission Denied", description: "You do not have permission to delete employees.", variant: "destructive" });
      return;
    }
     if (window.confirm(`Are you sure you want to delete employee ${employeeName}? This will also delete their Supabase Auth user and cannot be undone.`)) {
        try {
            await deleteEmployee(employeeId);
            toast({ title: "Employee Deleted", description: `${employeeName} and their Auth account removed.` });
            fetchEmployeesCallback(); 
        } catch (error) {
            toast({ title: "Error Deleting Employee", description: error.message, variant: "destructive" });
        }
     }
  };

  const openEditDialog = (employee) => {
    if (!canManageEmployees) {
      toast({ title: "Permission Denied", description: "You do not have permission to edit employees.", variant: "destructive" });
      return;
    }
    setEditingEmployee(employee);
    setFormError(null);
    setIsDialogOpen(true);
  };

   const openNewDialog = () => {
    if (!canManageEmployees) {
      toast({ title: "Permission Denied", description: "You do not have permission to add employees.", variant: "destructive" });
      return;
    }
    setEditingEmployee(null);
    setFormError(null);
    setIsDialogOpen(true);
  };
  
  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingEmployee(null);
      setFormError(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading employees...</div>;
  }

  return (
    <div className="p-6">
       {canManageEmployees && (
         <div className="flex justify-end mb-4">
              <Button onClick={openNewDialog} size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
              </Button>
         </div>
       )}
       {!canManageEmployees && (
         <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2" />
            <p className="text-sm">Your role ('staff') does not permit adding, editing, or deleting employees.</p>
        </div>
       )}
        <Alert className="mb-4 bg-blue-50 border-blue-300 text-blue-700">
            <Terminal className="h-4 w-4 stroke-blue-600" />
            <AlertTitle className="font-semibold text-blue-800">Important Notes:</AlertTitle>
            <AlertDescription className="text-sm">
                <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Adding an employee creates a Supabase Auth user.</li>
                    <li>Deleting an employee also deletes their Supabase Auth user (irreversible).</li>
                    <li>Password updates change Supabase Auth login (requires RLS/Edge Function for `auth.users`).</li>
                </ul>
            </AlertDescription>
        </Alert>
      <EmployeeTable 
        employees={employees}
        onEdit={openEditDialog}
        onDelete={handleDeleteEmployee}
        canManage={canManageEmployees}
      />
      {isDialogOpen && canManageEmployees && (
        <EmployeeDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingEmployee={editingEmployee}
            onSave={handleSaveEmployee}
            formError={formError}
            setFormError={setFormError}
        />
      )}
    </div>
  );
};

export default EmployeesTab;
  