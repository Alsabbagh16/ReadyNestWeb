
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ArrowLeft, Save, UserCircle, ShoppingBag, CalendarDays, DollarSign, MapPin, List, Edit2, Briefcase, Phone } from 'lucide-react';

const formatDateSafe = (dateString, includeTime = true, placeholder = 'N/A') => {
  try {
    if (!dateString || isNaN(new Date(dateString).getTime())) return placeholder;
    return format(new Date(dateString), includeTime ? 'MMM d, yyyy, HH:mm' : 'MMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return 'success';
      case 'pending confirmation':
      case 'pending payment':
      case 'pending':
        return 'default';
      case 'processing':
        return 'outline';
      case 'cancelled':
      case 'failed':
      case 'refunded':
        return 'destructive';
      default: return 'secondary';
    }
};

const availableStatuses = ["Pending Confirmation", "Confirmed", "Processing", "Completed", "Cancelled", "Refunded", "Failed"];

const PurchaseCustomerInfo = ({ purchase, customerName, isEditing, editableFields, onInputChange }) => (
  <Section title="Customer Information" icon={<UserCircle className="h-5 w-5 text-primary"/>}>
    <DetailItem label="Name" value={customerName || 'Guest'} />
    <DetailItem label="Email" value={purchase.email || 'N/A'} />
    {isEditing ? (
        <div>
            <Label htmlFor="user_phone" className="text-sm font-medium text-gray-500 dark:text-gray-400 w-36 shrink-0">Customer Phone</Label>
            <Input 
                id="user_phone" 
                name="user_phone" 
                value={editableFields.user_phone} 
                onChange={onInputChange} 
                className="mt-1 text-sm"
                placeholder="Customer phone"
            />
        </div>
    ) : (
        <>
            <DetailItem label="Purchase Phone" value={purchase.user_phone || 'N/A'} icon={<Phone className="h-4 w-4 text-muted-foreground"/>} />
            {purchase.profiles?.phone && purchase.profiles.phone !== purchase.user_phone && (
                 <DetailItem label="Profile Phone" value={purchase.profiles.phone} icon={<Phone className="h-4 w-4 text-muted-foreground"/>} />
            )}
        </>
    )}
    {purchase.user_id && <DetailItem label="User ID" value={purchase.user_id} />}
  </Section>
);

const PurchaseServicePaymentInfo = ({ purchase, isEditing, editableFields, onInputChange }) => (
  <Section title="Service & Payment" icon={<ShoppingBag className="h-5 w-5 text-primary"/>}>
    {isEditing ? (
        <>
            <div>
                <Label htmlFor="product_name" className="text-sm font-medium text-gray-500 dark:text-gray-400 w-36 shrink-0">Product Name</Label>
                <Input id="product_name" name="product_name" value={editableFields.product_name} onChange={onInputChange} className="mt-1 text-sm"/>
            </div>
            <div>
                <Label htmlFor="paid_amount" className="text-sm font-medium text-gray-500 dark:text-gray-400 w-36 shrink-0">Paid Amount ($)</Label>
                <Input id="paid_amount" name="paid_amount" type="number" step="0.01" value={editableFields.paid_amount} onChange={onInputChange} className="mt-1 text-sm"/>
            </div>
        </>
    ) : (
        <>
            <DetailItem label="Product Name" value={purchase.product_name || 'N/A'} />
            <DetailItem label="Paid Amount" value={`${purchase.paid_amount?.toFixed(2) || '0.00'}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground"/>} />
        </>
    )}
    <DetailItem label="Payment Type" value={purchase.payment_type || 'N/A'} />
  </Section>
);

const PurchaseAddonsInfo = ({ purchase }) => {
  if (!purchase.selected_addons || purchase.selected_addons.length === 0) return null;
  return (
    <Section title="Selected Add-ons" icon={<List className="h-5 w-5 text-primary"/>}>
      <ul className="list-disc pl-5 space-y-1">
        {purchase.selected_addons.map((addon, index) => (
          <li key={index} className="text-sm">
            {addon.name} - ${Number(addon.price).toFixed(2)} (Qty: {addon.quantity || 1})
          </li>
        ))}
      </ul>
    </Section>
  );
};

const PurchaseBookingDatesInfo = ({ purchase }) => (
  <Section title="Booking Dates" icon={<CalendarDays className="h-5 w-5 text-primary"/>}>
    <DetailItem label="Preferred Date 1" value={formatDateSafe(purchase.preferred_booking_date, false)} />
    {purchase.additional_preferred_dates && Object.keys(purchase.additional_preferred_dates).length > 0 && (
      Object.entries(purchase.additional_preferred_dates).map(([key, date], index) => (
        <DetailItem key={key} label={`Preferred Date ${index + 2}`} value={formatDateSafe(date, false)} />
      ))
    )}
  </Section>
);

const PurchaseAddressInfo = ({ purchase }) => {
  const address = purchase.address;
  if (!address) return (
    <Section title="Service Address" icon={<MapPin className="h-5 w-5 text-primary"/>}>
      <p className="text-sm text-gray-700 dark:text-gray-300">N/A</p>
    </Section>
  );

  const addressString = `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/, , /g, ', ').replace(/, $/,'').trim() || 'N/A';

  return (
    <Section title="Service Address" icon={<MapPin className="h-5 w-5 text-primary"/>}>
      <p className="text-sm text-gray-700 dark:text-gray-300">{addressString}</p>
      {address.phone && (
        <DetailItem label="Address Phone" value={address.phone} icon={<Phone className="h-4 w-4 text-muted-foreground"/>} />
      )}
      {address.alt_phone && (
        <DetailItem label="Address Alt. Phone" value={address.alt_phone} icon={<Phone className="h-4 w-4 text-muted-foreground"/>} />
      )}
    </Section>
  );
};


const AdminPurchaseDetailPage = () => {
  const { purchaseRefId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editableFields, setEditableFields] = useState({
    status: '',
    product_name: '',
    paid_amount: '',
    user_phone: '',
  });

  const fetchPurchaseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *, 
          profiles (first_name, last_name, phone)
        `)
        .eq('purchase_ref_id', purchaseRefId)
        .single();

      if (error) throw error;
      if (data) {
        setPurchase(data);
        setEditableFields({
            status: data.status || '',
            product_name: data.product_name || '',
            paid_amount: data.paid_amount?.toString() || '0',
            user_phone: data.user_phone || (data.profiles?.phone) || '',
        });
      } else {
        toast({ title: "Error", description: "Purchase not found.", variant: "destructive" });
        navigate("/admin-dashboard/purchases");
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      toast({ title: "Error", description: "Could not fetch purchase details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [purchaseRefId, toast, navigate]);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [fetchPurchaseDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableFields(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setEditableFields(prev => ({ ...prev, status: value }));
  };
  
  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updateData = {
        status: editableFields.status,
        product_name: editableFields.product_name,
        paid_amount: parseFloat(editableFields.paid_amount) || 0,
        user_phone: editableFields.user_phone,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('purchases')
        .update(updateData)
        .eq('purchase_ref_id', purchaseRefId);

      if (error) throw error;
      toast({ title: "Success", description: "Purchase details updated successfully." });
      setIsEditing(false);
      fetchPurchaseDetails(); 
    } catch (error) {
      console.error("Error updating purchase details:", error);
      toast({ title: "Error", description: "Could not update purchase details.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateJobFromPurchase = () => {
    if (purchase) {
      const jobCreationData = { ...purchase };
      if (!jobCreationData.user_phone && purchase.profiles?.phone) {
        jobCreationData.user_phone = purchase.profiles.phone;
      }
      navigate('/admin-dashboard/job/create', { state: { purchaseData: jobCreationData } });
    } else {
      toast({ title: "Error", description: "Purchase data not loaded. Cannot create job.", variant: "destructive"});
    }
  };

  if (loading && !purchase) {
    return <div className="p-6 text-center">Loading purchase details...</div>;
  }

  if (!purchase) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Purchase not found or an error occurred.</p>
        <Button asChild variant="outline">
          <Link to="/admin-dashboard/purchases"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Purchases</Link>
        </Button>
      </div>
    );
  }

  const customerName = purchase.profiles ? `${purchase.profiles.first_name || ''} ${purchase.profiles.last_name || ''}`.trim() : purchase.name;
  const currentDisplayedStatus = isEditing ? editableFields.status : purchase.status;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin-dashboard/purchases"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Purchases</Link>
        </Button>
        <div className="flex space-x-2">
            {!isEditing && (
                <Button onClick={handleCreateJobFromPurchase} size="sm" variant="outline">
                    <Briefcase className="mr-2 h-4 w-4" /> Create Job from Purchase
                </Button>
            )}
            {!isEditing && (
                <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Purchase
                </Button>
            )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center text-2xl">
                    <ShoppingBag className="mr-3 h-7 w-7 text-primary"/>
                    Purchase: {purchase.purchase_ref_id}
                </CardTitle>
                <CardDescription>Created on: {formatDateSafe(purchase.created_at)}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(currentDisplayedStatus)} className="text-sm px-3 py-1 capitalize">{currentDisplayedStatus}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-semibold mb-2">Edit Details</h3>
                
                <PurchaseCustomerInfo purchase={purchase} customerName={customerName} isEditing={isEditing} editableFields={editableFields} onInputChange={handleInputChange} />
                <PurchaseServicePaymentInfo purchase={purchase} isEditing={isEditing} editableFields={editableFields} onInputChange={handleInputChange} />

                <div className="md:col-span-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-500 dark:text-gray-400 w-36 shrink-0">Status</Label>
                    <Select value={editableFields.status} onValueChange={handleStatusChange}>
                        <SelectTrigger id="status" className="mt-1 text-sm">
                        <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                        {availableStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                 <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => {
                        setIsEditing(false);
                        setEditableFields({ 
                            status: purchase.status || '',
                            product_name: purchase.product_name || '',
                            paid_amount: purchase.paid_amount?.toString() || '0',
                            user_phone: purchase.user_phone || (purchase.profiles?.phone) || '',
                        });
                    }}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={loading}>
                        {loading ? 'Saving...' : <><Save className="mr-2 h-4 w-4"/> Save Changes</>}
                    </Button>
                 </div>
            </div>
          ) : (
            <>
                <PurchaseCustomerInfo purchase={purchase} customerName={customerName} />
                <PurchaseServicePaymentInfo purchase={purchase} />
                <PurchaseAddonsInfo purchase={purchase} />
                <PurchaseBookingDatesInfo purchase={purchase} />
                <PurchaseAddressInfo purchase={purchase} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <h3 className="text-md font-semibold mb-3 flex items-center text-gray-800 dark:text-gray-200">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
        </h3>
        <div className="space-y-2 pl-2">{children}</div>
    </div>
);

const DetailItem = ({ label, value, icon }) => (
    <div className="flex items-start text-sm py-1">
        <dt className="font-medium text-gray-500 dark:text-gray-400 w-36 shrink-0">{label}:</dt>
        <dd className="text-gray-700 dark:text-gray-300 flex items-center">
            {icon && <span className="mr-1.5 mt-0.5">{icon}</span>}
            {value}
        </dd>
    </div>
);


export default AdminPurchaseDetailPage;
