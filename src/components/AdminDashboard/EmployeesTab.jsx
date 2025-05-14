
import React, { useState, useEffect, useCallback } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/storage/employeeStorage';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Terminal } from 'lucide-react';
import EmployeeTable from '@/components/AdminDashboard/EmployeeTable';
import EmployeeDialog from '@/components/AdminDashboard/EmployeeDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState(null);
  const { toast } = useToast();

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
      setFormError(errorMessage); // Keep dialog open by setting formError
      // Do not close dialog here, let user see the error
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
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
    setEditingEmployee(employee);
    setFormError(null);
    setIsDialogOpen(true);
  };

   const openNewDialog = () => {
    setEditingEmployee(null);
    setFormError(null);
    setIsDialogOpen(true);
  };
  
  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingEmployee(null);
      setFormError(null); // Clear error when dialog is explicitly closed
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading employees...</div>;
  }

  return (
    <div className="p-6">
       <div className="flex justify-end mb-4">
            <Button onClick={openNewDialog} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
            </Button>
       </div>
        <Alert className="mb-4 bg-yellow-50 border-yellow-300 text-yellow-700">
            <Terminal className="h-4 w-4 stroke-yellow-600" />
            <AlertTitle className="font-semibold text-yellow-800">Important Notes:</AlertTitle>
            <AlertDescription className="text-sm">
                <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Adding an employee also creates a corresponding Supabase Auth user with the provided email and password.</li>
                    <li>Deleting an employee also deletes their Supabase Auth user. This action is irreversible.</li>
                    <li>Updating an employee's password will change their Supabase Auth login password. This feature requires appropriate admin permissions in Supabase (RLS on `auth.users` or an Edge Function). If it fails, check Supabase logs.</li>
                </ul>
            </AlertDescription>
        </Alert>
      <EmployeeTable 
        employees={employees}
        onEdit={openEditDialog}
        onDelete={handleDeleteEmployee}
      />
      {isDialogOpen && (
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
