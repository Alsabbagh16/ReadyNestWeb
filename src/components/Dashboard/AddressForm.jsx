
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog"; // Assuming DialogFooter is used here

const AddressForm = ({ address, onSave, onCancel }) => {
  const [street, setStreet] = useState(address?.street || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [zip, setZip] = useState(address?.zip || address?.zip_code || '');
  const [label, setLabel] = useState(address?.label || '');
  const [isDefault, setIsDefault] = useState(address?.is_default || false);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) {
        alert("Please fill all required address fields (Street, City, State, Zip).");
        return;
    }
    onSave({ id: address?.id, street, city, state, zip, label, is_default: isDefault });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 dark:text-slate-300">
      <div>
        <Label htmlFor="addr-label">Label (Optional)</Label>
        <Input id="addr-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Home, Work" className="dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
      </div>
      <div>
        <Label htmlFor="addr-street">Street Address</Label>
        <Input id="addr-street" value={street} onChange={(e) => setStreet(e.target.value)} required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="addr-city">City</Label>
          <Input id="addr-city" value={city} onChange={(e) => setCity(e.target.value)} required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
        </div>
        <div>
          <Label htmlFor="addr-state">State</Label>
          <Input id="addr-state" value={state} onChange={(e) => setState(e.target.value)} required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
        </div>
      </div>
      <div>
        <Label htmlFor="addr-zip">Zip Code</Label>
        <Input id="addr-zip" value={zip} onChange={(e) => setZip(e.target.value)} required className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
      </div>
       <div className="flex items-center space-x-2">

      </div>
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600">Cancel</Button>
        <Button type="submit" className="dark:bg-primary dark:hover:bg-primary/90">Save Address</Button>
      </DialogFooter>
    </form>
  );
};

export default AddressForm;
