
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { updatePurchaseStatus } from '@/lib/storage/purchaseStorage';
import { Loader2, CheckCircle } from 'lucide-react';

const purchaseStatusOptions = [
  { value: 'Pending Confirmation', label: 'Pending Confirmation' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'Pending Payment', label: 'Pending Payment' },
];

const PurchaseEditDialog = ({ isOpen, onClose, purchaseData, onSuccess }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState(''); // Example additional field
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (purchaseData) {
      setStatus(purchaseData.status || '');
      // Assuming you might add an 'admin_notes' field to purchases table
      setAdminNotes(purchaseData.admin_notes || ''); 
    }
  }, [purchaseData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!purchaseData || !purchaseData.purchase_ref_id) {
        toast({ title: "Error", description: "No purchase data to update.", variant: "destructive"});
        setIsLoading(false);
        return;
    }
    
    try {
      const updatedDetails = {
        // admin_notes: adminNotes, // Example: if you add this field
      };
      await updatePurchaseStatus(purchaseData.purchase_ref_id, status, updatedDetails);
      toast({ title: "Purchase Updated", description: `Purchase ${purchaseData.purchase_ref_id} updated successfully.`, className: "bg-green-500 text-white" });
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to update purchase.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">Modify Purchase: {purchaseData?.purchase_ref_id}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Update the status and other details for this purchase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="purchase-status" className="dark:text-slate-300">Status*</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger id="purchase-status" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                {purchaseStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Example of an additional field if you want to add notes to purchase */}
          {/* <div>
            <Label htmlFor="admin-notes" className="dark:text-slate-300">Admin Notes</Label>
            <Textarea 
                id="admin-notes" 
                value={adminNotes} 
                onChange={(e) => setAdminNotes(e.target.value)} 
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Internal notes for this purchase..."
            />
          </div> */}
        </form>
        <DialogFooter className="mt-6 pt-4 border-t dark:border-slate-700">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseEditDialog;
