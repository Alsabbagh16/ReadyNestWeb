
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, User, Briefcase, CalendarDays, Users, Hash, Phone, Mail, MapPin } from 'lucide-react';
import { generateJobRefId } from '@/lib/storage/jobStorage';


const today = new Date().toISOString().split('T')[0];

const JobCoreDetailsFormSection = ({ formData, handleInputChange, availableStatuses }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Job Details</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="job_ref_id">Job Reference ID</Label>
        <Input id="job_ref_id" name="job_ref_id" value={formData.job_ref_id} readOnly disabled className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"/>
      </div>
      <div>
        <Label htmlFor="preferred_date">Preferred Date <span className="text-red-500">*</span></Label>
        <Input id="preferred_date" name="preferred_date" type="date" value={formData.preferred_date} onChange={handleInputChange} min={today} required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
        <Select name="status" value={formData.status} onValueChange={(value) => handleInputChange({ target: { name: 'status', value } })} required>
          <SelectTrigger id="status" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
            {availableStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

const CustomerInfoFormSection = ({ formData, handleInputChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Customer Information</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="user_name">Full Name <span className="text-red-500">*</span></Label>
        <Input id="user_name" name="user_name" value={formData.user_name} onChange={handleInputChange} placeholder="Customer's full name" required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
      </div>
      <div>
        <Label htmlFor="user_email">Email <span className="text-red-500">*</span></Label>
        <Input id="user_email" name="user_email" type="email" value={formData.user_email} onChange={handleInputChange} placeholder="customer@example.com" required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
      </div>
      <div>
        <Label htmlFor="user_phone">Phone</Label>
        <Input id="user_phone" name="user_phone" type="tel" value={formData.user_phone} onChange={handleInputChange} placeholder="Customer's phone number" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
      </div>
    </CardContent>
  </Card>
);

const AddressFormSection = ({ formData, handleAddressChange }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" />Service Address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="street">Street <span className="text-red-500">*</span></Label>
                <Input id="street" name="street" value={formData.user_address.street} onChange={handleAddressChange} placeholder="123 Main St" required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </div>
            <div>
                <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                <Input id="city" name="city" value={formData.user_address.city} onChange={handleAddressChange} placeholder="Anytown" required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </div>
            <div>
                <Label htmlFor="state">State/Province <span className="text-red-500">*</span></Label>
                <Input id="state" name="state" value={formData.user_address.state} onChange={handleAddressChange} placeholder="CA" required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </div>
            <div>
                <Label htmlFor="zip">ZIP/Postal Code <span className="text-red-500">*</span></Label>
                <Input id="zip" name="zip" value={formData.user_address.zip} onChange={handleAddressChange} placeholder="90210" required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </div>
             <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.user_address.country} onChange={handleAddressChange} placeholder="USA" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
            </div>
        </CardContent>
    </Card>
);


const EmployeeAssignmentFormSection = ({ formData, handleEmployeeSelect, allEmployees }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Assign Employees</CardTitle>
    </CardHeader>
    <CardContent>
      {allEmployees.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-md dark:border-slate-600">
          {allEmployees.map(emp => (
            <div key={emp.id} className="flex items-center space-x-2">
              <Checkbox
                id={`emp-${emp.id}`}
                checked={formData.assigned_employees_ids.includes(emp.id)}
                onCheckedChange={() => handleEmployeeSelect(emp.id)}
                className="dark:border-slate-500 dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground"
              />
              <Label htmlFor={`emp-${emp.id}`} className="text-sm font-normal dark:text-slate-300">
                {emp.full_name} <span className="text-xs text-muted-foreground dark:text-slate-400">({emp.position || 'Employee'})</span>
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm dark:text-slate-400">No employees available for assignment. Add employees in the 'Employees' tab.</p>
      )}
    </CardContent>
  </Card>
);

const NotesFormSection = ({ formData, handleInputChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><Hash className="mr-2 h-5 w-5 text-primary" />Internal Notes</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        id="notes"
        name="notes"
        value={formData.notes}
        onChange={handleInputChange}
        placeholder="Add any internal notes for this job (e.g., special instructions, customer preferences)..."
        rows={4}
        className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      />
    </CardContent>
  </Card>
);


const AdminCreateJobPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const purchaseDataFromState = location.state?.purchaseData;

  const [formData, setFormData] = useState({
    job_ref_id: generateJobRefId(),
    purchase_ref_id: '',
    user_id: '',
    user_name: '',
    user_email: '',
    user_phone: '',
    user_address: { street: '', city: '', state: '', zip: '', country: '' },
    addons: [], 
    preferred_date: '',
    status: 'Pending Assignment',
    assigned_employees_ids: [],
    notes: '',
    document_urls: [], 
  });

  const [allEmployees, setAllEmployees] = useState([]);
  const [availablePurchases, setAvailablePurchases] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableStatuses = ["Pending Assignment", "Scheduled", "Assigned", "In Progress", "On Hold", "Completed", "Cancelled", "Failed"];

  const fetchPurchasesAndEmployees = useCallback(async () => {
    try {
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('purchase_ref_id, name, email, user_phone, address, product_name, preferred_booking_date, selected_addons, user_id, profiles(first_name, last_name, phone)')
        .order('created_at', { ascending: false })
        .limit(100); 
      if (purchasesError) throw purchasesError;
      setAvailablePurchases(purchasesData || []);

      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, full_name, position');
      if (employeesError) throw employeesError;
      setAllEmployees(employeesData || []);
    } catch (error) {
      console.error("Error fetching purchases or employees:", error);
      toast({ title: "Error", description: "Could not load necessary data.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchPurchasesAndEmployees();
  }, [fetchPurchasesAndEmployees]);

  const populateFormWithPurchaseData = useCallback((purchaseData) => {
    if (purchaseData) {
      setFormData(prev => {
        const newFormData = {
            ...prev,
            purchase_ref_id: purchaseData.purchase_ref_id || '',
            user_id: purchaseData.user_id || '',
            user_name: purchaseData.name || (purchaseData.profiles ? `${purchaseData.profiles.first_name || ''} ${purchaseData.profiles.last_name || ''}`.trim() : ''),
            user_email: purchaseData.email || '',
            user_phone: purchaseData.user_phone || (purchaseData.profiles?.phone) || '', 
            user_address: {
                street: purchaseData.address?.street || '',
                city: purchaseData.address?.city || '',
                state: purchaseData.address?.state || '',
                zip: purchaseData.address?.zip || purchaseData.address?.zip_code || '',
                country: purchaseData.address?.country || '',
            },
            addons: purchaseData.selected_addons || [],
            preferred_date: purchaseData.preferred_booking_date ? new Date(purchaseData.preferred_booking_date).toISOString().split('T')[0] : '',
            notes: `Job created from purchase ${purchaseData.purchase_ref_id}. Product: ${purchaseData.product_name || 'N/A'}.`.trim(),
        };
        return newFormData;
      });
    }
  }, []);

  useEffect(() => {
    if (purchaseDataFromState) {
      populateFormWithPurchaseData(purchaseDataFromState);
    }
  }, [purchaseDataFromState, populateFormWithPurchaseData]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      user_address: {
        ...prev.user_address,
        [name]: value
      }
    }));
  };

  const handleEmployeeSelect = (employeeId) => {
    setFormData(prev => {
      const newAssignedIds = prev.assigned_employees_ids.includes(employeeId)
        ? prev.assigned_employees_ids.filter(id => id !== employeeId)
        : [...prev.assigned_employees_ids, employeeId];
      return { ...prev, assigned_employees_ids: newAssignedIds };
    });
  };
  
  const handlePurchaseSelect = (purchaseRefId) => {
    const selected = availablePurchases.find(p => p.purchase_ref_id === purchaseRefId);
    if (selected) {
        populateFormWithPurchaseData(selected);
    } else {
        setFormData(prev => ({
            ...prev,
            purchase_ref_id: '',
            user_id: '',
            user_name: '',
            user_email: '',
            user_phone: '',
            user_address: { street: '', city: '', state: '', zip: '', country: '' },
            addons: [],
            notes: prev.notes.replace(/Job created from purchase [A-Z0-9-]+\. Product: [^\.]+\./, '').trim(),
        }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.preferred_date || !formData.user_name || !formData.user_email || !formData.user_address.street || !formData.user_address.city || !formData.user_address.state || !formData.user_address.zip) {
        toast({ title: "Missing Required Fields", description: "Please fill in all required fields (*).", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }

    try {
      const jobPayload = {
        ...formData,
        document_urls: [], // Ensure document_urls is an empty array on creation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('jobs')
        .insert([jobPayload]);

      if (error) throw error;

      toast({ title: "Success", description: `Job ${formData.job_ref_id} created successfully.` });
      navigate('/admin-dashboard/jobs');
    } catch (error) {
      console.error("Error creating job:", error);
      toast({ title: "Error", description: `Could not create job. ${error.message}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-0 md:p-6 dark:text-slate-300">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin-dashboard/jobs"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs</Link>
        </Button>
        <h1 className="text-2xl font-bold dark:text-white">Create New Job</h1>
      </div>

    <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center dark:text-white">Link to Existing Purchase (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
                 <Select onValueChange={handlePurchaseSelect} value={formData.purchase_ref_id || ""}>
                    <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        <SelectValue placeholder="Select a purchase to auto-fill details..." />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                        <SelectItem value="">None (Manual Entry)</SelectItem>
                        {availablePurchases.map(p => (
                            <SelectItem key={p.purchase_ref_id} value={p.purchase_ref_id}>
                                {p.purchase_ref_id} - {p.name || (p.profiles ? `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim() : p.email)} ({p.product_name})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {formData.purchase_ref_id && (
                    <p className="text-xs text-muted-foreground mt-1 dark:text-slate-400">Selected purchase details have been pre-filled.</p>
                )}
            </CardContent>
        </Card>

        <JobCoreDetailsFormSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
            availableStatuses={availableStatuses} 
        />
        <CustomerInfoFormSection 
            formData={formData} 
            handleInputChange={handleInputChange}
        />
        <AddressFormSection
            formData={formData}
            handleAddressChange={handleAddressChange}
        />
        <EmployeeAssignmentFormSection 
            formData={formData} 
            handleEmployeeSelect={handleEmployeeSelect} 
            allEmployees={allEmployees} 
        />
        <NotesFormSection 
            formData={formData} 
            handleInputChange={handleInputChange} 
        />

        <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin-dashboard/jobs')} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Job...
                </>
            ) : (
                <><Save className="mr-2 h-4 w-4" /> Create Job</>
            )}
            </Button>
        </div>
        </form>
    </div>
  );
};

export default AdminCreateJobPage;
