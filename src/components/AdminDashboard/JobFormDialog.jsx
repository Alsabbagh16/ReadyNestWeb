
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createJob, updateJob } from '@/lib/storage/jobStorage';
import { fetchAllUsers } from '@/lib/storage/userStorage';
import { fetchAllPurchasesLight } from '@/lib/storage/purchaseStorage'; 
import { getEmployees as fetchAllEmployees } from '@/lib/storage/employeeStorage'; // Corrected import
import { Loader2, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const generateJobRefId = () => {
  const prefix = "JOB-";
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
};

const jobStatusOptions = [
  { value: 'Pending Assignment', label: 'Pending Assignment' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Failed', label: 'Failed' },
];

const JobFormDialog = ({ isOpen, onClose, jobData, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isFetchingDropdowns, setIsFetchingDropdowns] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      job_ref_id: jobData?.job_ref_id || generateJobRefId(),
      purchase_ref_id: jobData?.purchase_ref_id || '',
      user_id: jobData?.user_id || '',
      user_name: jobData?.user_name || '',
      user_email: jobData?.user_email || '',
      user_phone: jobData?.user_phone || '',
      user_address: jobData?.user_address ? (typeof jobData.user_address === 'string' ? JSON.parse(jobData.user_address) : jobData.user_address) : { street: '', city: '', state: '', zip: '', country: '' },
      preferred_date: jobData?.preferred_date ? format(parseISO(jobData.preferred_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      status: jobData?.status || 'Pending Assignment',
      notes: jobData?.notes || '',
      assigned_employees_ids: jobData?.assigned_employees_ids || [], 
      addons: jobData?.addons || [],
    });
  }, [jobData]);


  useEffect(() => {
    resetForm();
  }, [jobData, isOpen, resetForm]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      setIsFetchingDropdowns(true);
      try {
        const [fetchedUsers, fetchedPurchases, fetchedEmployees] = await Promise.all([
          fetchAllUsers(),
          fetchAllPurchasesLight(),
          fetchAllEmployees()
        ]);
        setUsers(fetchedUsers);
        setPurchases(fetchedPurchases);
        setEmployees(fetchedEmployees);
      } catch (error) {
        toast({ title: "Error fetching data", description: "Could not load users, purchases, or employees for the form.", variant: "destructive" });
      } finally {
        setIsFetchingDropdowns(false);
      }
    };
    fetchData();
  }, [isOpen, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      user_address: { ...prev.user_address, [name]: value }
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'user_id' && value) {
        const selectedUser = users.find(u => u.id === value);
        if (selectedUser) {
            setFormData(prev => ({
                ...prev,
                user_name: `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim(),
                user_email: selectedUser.email,
                user_phone: selectedUser.phone || '', 
            }));
             if (selectedUser.addresses && selectedUser.addresses.length > 0) {
                const defaultAddress = selectedUser.addresses.find(a => a.is_default) || selectedUser.addresses[0];
                if(defaultAddress) {
                    setFormData(prev => ({
                        ...prev,
                        user_address: {
                            street: defaultAddress.street || '',
                            city: defaultAddress.city || '',
                            state: defaultAddress.state || '',
                            zip: defaultAddress.zip_code || defaultAddress.zip || '',
                            country: defaultAddress.country || ''
                        }
                    }));
                }
            }
        }
    }
  };
  
  const handleMultiSelectChange = (name, selectedValues) => {
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (typeof payload.user_address !== 'object') {
        payload.user_address = JSON.parse(payload.user_address || '{}');
      }
      
      if (!Array.isArray(payload.assigned_employees_ids)) {
        payload.assigned_employees_ids = payload.assigned_employees_ids ? [payload.assigned_employees_ids] : [];
      }


      if (jobData?.job_ref_id) {
        await updateJob(jobData.job_ref_id, payload);
        toast({ title: "Job Updated", description: `Job ${jobData.job_ref_id} updated successfully.`, className: "bg-green-500 text-white" });
      } else {
        await createJob(payload);
        toast({ title: "Job Created", description: `Job ${payload.job_ref_id} created successfully.`, className: "bg-green-500 text-white" });
      }
      onSuccess();
    } catch (error) {
      console.error("Job form submission error:", error);
      toast({ title: "Error", description: error.message || "Failed to save job.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{jobData?.job_ref_id ? `Edit Job: ${jobData.job_ref_id}` : "Create New Job"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Fill in the details for the job. Required fields are marked with an asterisk.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
          <div>
            <Label htmlFor="job_ref_id" className="dark:text-slate-300">Job Reference ID*</Label>
            <Input id="job_ref_id" name="job_ref_id" value={formData.job_ref_id || ''} onChange={handleChange} required disabled className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>

          <div>
            <Label htmlFor="user_id" className="dark:text-slate-300">User*</Label>
            <Select name="user_id" value={formData.user_id || ''} onValueChange={(value) => handleSelectChange('user_id', value)} required disabled={isFetchingDropdowns}>
              <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                {isFetchingDropdowns ? <SelectItem value="loading" disabled>Loading users...</SelectItem> : 
                 users.map(user => <SelectItem key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="purchase_ref_id" className="dark:text-slate-300">Purchase (Optional)</Label>
            <Select name="purchase_ref_id" value={formData.purchase_ref_id || ''} onValueChange={(value) => handleSelectChange('purchase_ref_id', value)} disabled={isFetchingDropdowns}>
              <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="Select Associated Purchase" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                 {isFetchingDropdowns ? <SelectItem value="loading" disabled>Loading purchases...</SelectItem> : 
                 purchases.map(purchase => <SelectItem key={purchase.purchase_ref_id} value={purchase.purchase_ref_id}>{purchase.purchase_ref_id} - {purchase.product_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="user_name" className="dark:text-slate-300">Customer Name*</Label>
            <Input id="user_name" name="user_name" value={formData.user_name || ''} onChange={handleChange} required className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <Label htmlFor="user_email" className="dark:text-slate-300">Customer Email*</Label>
            <Input id="user_email" name="user_email" type="email" value={formData.user_email || ''} onChange={handleChange} required className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div>
            <Label htmlFor="user_phone" className="dark:text-slate-300">Customer Phone</Label>
            <Input id="user_phone" name="user_phone" value={formData.user_phone || ''} onChange={handleChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          
          <fieldset className="border p-3 rounded-md dark:border-slate-700">
            <legend className="text-sm font-medium px-1 dark:text-slate-300">Service Address</legend>
            <div className="space-y-2">
                <Label htmlFor="user_address_street" className="dark:text-slate-300">Street</Label>
                <Input id="user_address_street" name="street" value={formData.user_address?.street || ''} onChange={handleAddressChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Label htmlFor="user_address_city" className="dark:text-slate-300">City</Label>
                <Input id="user_address_city" name="city" value={formData.user_address?.city || ''} onChange={handleAddressChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Label htmlFor="user_address_state" className="dark:text-slate-300">State</Label>
                <Input id="user_address_state" name="state" value={formData.user_address?.state || ''} onChange={handleAddressChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Label htmlFor="user_address_zip" className="dark:text-slate-300">Zip Code</Label>
                <Input id="user_address_zip" name="zip" value={formData.user_address?.zip || ''} onChange={handleAddressChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                <Label htmlFor="user_address_country" className="dark:text-slate-300">Country</Label>
                <Input id="user_address_country" name="country" value={formData.user_address?.country || ''} onChange={handleAddressChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </div>
          </fieldset>

          <div>
            <Label htmlFor="preferred_date" className="dark:text-slate-300">Preferred Date*</Label>
            <Input id="preferred_date" name="preferred_date" type="date" value={formData.preferred_date || ''} onChange={handleChange} required className="dark:bg-slate-800 dark:border-slate-700 dark:text-white [color-scheme:dark]" />
          </div>

          <div>
            <Label htmlFor="status" className="dark:text-slate-300">Status*</Label>
            <Select name="status" value={formData.status || ''} onValueChange={(value) => handleSelectChange('status', value)} required>
              <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                {jobStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assigned_employees_ids" className="dark:text-slate-300">Assign Employees</Label>
            <Select
                name="assigned_employees_ids"
                value={formData.assigned_employees_ids || []}
                onValueChange={(value) => handleMultiSelectChange('assigned_employees_ids', Array.isArray(value) ? value : (value ? [value] : []))} 
                disabled={isFetchingDropdowns}
            >
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                     <SelectValue placeholder="Select Employees (multiple)" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                     {isFetchingDropdowns ? <SelectItem value="loading" disabled>Loading employees...</SelectItem> :
                     employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</SelectItem>)}
                </SelectContent>
            </Select>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple. This UI is basic; a multi-select component would be better.</p>
          </div>

          <div>
            <Label htmlFor="notes" className="dark:text-slate-300">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>

        </form>
        <DialogFooter className="mt-6 pt-4 border-t dark:border-slate-700">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading || isFetchingDropdowns} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {jobData?.job_ref_id ? "Save Changes" : "Create Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobFormDialog;
