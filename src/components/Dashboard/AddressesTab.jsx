
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const AddressForm = ({ address, onSave, onCancel }) => {
  const [street, setStreet] = useState(address?.street || '');
  const [city, setCity] = useState(address?.city || '');
  const [state, setState] = useState(address?.state || '');
  const [zip, setZip] = useState(address?.zip || '');
  const [label, setLabel] = useState(address?.label || ''); // e.g., 'Home', 'Work'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) {
        alert("Please fill all address fields.");
        return;
    }
    onSave({ id: address?.id, street, city, state, zip, label });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="addr-label">Label (Optional)</Label>
        <Input id="addr-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Home, Work" />
      </div>
      <div>
        <Label htmlFor="addr-street">Street Address</Label>
        <Input id="addr-street" value={street} onChange={(e) => setStreet(e.target.value)} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label htmlFor="addr-city">City</Label>
          <Input id="addr-city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="addr-state">State</Label>
          <Input id="addr-state" value={state} onChange={(e) => setState(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="addr-zip">Zip Code</Label>
        <Input id="addr-zip" value={zip} onChange={(e) => setZip(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Address</Button>
      </DialogFooter>
    </form>
  );
};


const AddressesTab = () => {
  const { user, addresses, addAddress, updateAddress, deleteAddress, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null for new, address object for editing

  const handleSaveAddress = async (addressData) => {
    if (editingAddress) {
      await updateAddress(addressData.id, addressData);
    } else {
      await addAddress(addressData);
    }
    setIsDialogOpen(false);
    setEditingAddress(null);
    // Address list updates are handled by AuthContext
  };

  const handleDeleteAddress = async (addressId) => {
     if (window.confirm("Are you sure you want to delete this address?")) {
        await deleteAddress(addressId);
        // Address list updates are handled by AuthContext
     }
  };

  const openEditDialog = (address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

   const openNewDialog = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading addresses...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-semibold">Saved Addresses</h2>
         <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) setEditingAddress(null); // Reset editing state on close
            setIsDialogOpen(open);
         }}>
           <DialogTrigger asChild>
             <Button onClick={openNewDialog} size="sm">
               <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
             </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[425px]">
             <DialogHeader>
               <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
               <DialogDescription>
                 {editingAddress ? 'Update the details for this address.' : 'Enter the details for the new address.'}
               </DialogDescription>
             </DialogHeader>
             <AddressForm
               address={editingAddress}
               onSave={handleSaveAddress}
               onCancel={() => { setIsDialogOpen(false); setEditingAddress(null); }}
             />
           </DialogContent>
         </Dialog>
       </div>

      {addresses && addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                 <CardTitle className="text-sm font-medium">
                    {addr.label || `${addr.street.substring(0, 20)}...`}
                 </CardTitle>
                 <div className="space-x-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(addr)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                     </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleDeleteAddress(addr.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                     </Button>
                 </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {addr.street}<br />
                  {addr.city}, {addr.state} {addr.zip}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>You haven't saved any addresses yet.</p>
      )}
    </div>
  );
};

export default AddressesTab;
  