
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const EditServiceDialog = ({ isOpen, onOpenChange, booking, onSave }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (booking) {
            // Initialize form data when booking data is available or changes
            setFormData({
                date: booking.date || '',
                time: booking.time || '',
                address: booking.address || '',
                phone: booking.phone || '', // Add other editable fields as needed
                name: booking.name || '',
            });
        }
    }, [booking, isOpen]); // Re-initialize if booking changes or dialog opens

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic Validation
        if (!formData.date || !formData.time || !formData.address || !formData.name) {
             toast({
                title: "Missing Information",
                description: "Please fill in Date, Time, Address, and Customer Name.",
                variant: "destructive",
            });
            return;
        }
        onSave(formData);
    };

    if (!booking) return null; // Don't render if no booking data

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Service Details</DialogTitle>
                    <DialogDescription>
                        Make changes to the booking details for ID: {booking.id}. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="edit-name">Customer Name</Label>
                        <Input id="edit-name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-date">Date</Label>
                            <Input id="edit-date" name="date" type="date" value={formData.date || ''} onChange={handleChange} required/>
                        </div>
                        <div>
                            <Label htmlFor="edit-time">Time</Label>
                            <Input id="edit-time" name="time" type="time" value={formData.time || ''} onChange={handleChange} required />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="edit-address">Address</Label>
                        <Input id="edit-address" name="address" value={formData.address || ''} onChange={handleChange} required />
                    </div>
                     <div>
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input id="edit-phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditServiceDialog;
  