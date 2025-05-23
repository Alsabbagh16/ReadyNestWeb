
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCcw, Download, Edit, XCircle, ShoppingCart, ExternalLink, Phone } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const formatDateSafe = (dateString, includeTime = true) => {
  try {
    if (!dateString || isNaN(new Date(dateString).getTime())) return 'N/A';
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

const PurchaseRow = ({ purchase, onUpdateStatus }) => {
  return (
    <TableRow key={purchase.purchase_ref_id}>
      <TableCell className="font-mono">
        <Link 
            to={`/admin-dashboard/purchase/${purchase.purchase_ref_id}`} 
            className="text-primary hover:underline flex items-center"
        >
            {purchase.purchase_ref_id} <ExternalLink className="h-3 w-3 ml-1"/>
        </Link>
      </TableCell>
      <TableCell className="whitespace-nowrap">{formatDateSafe(purchase.created_at)}</TableCell>
      <TableCell>
        <div>{purchase.name || 'Guest'}</div>
        <div className="text-xs text-muted-foreground">{purchase.email || 'N/A'}</div>
        <div className="text-xs text-muted-foreground flex items-center">
            <Phone className="h-3 w-3 mr-1" /> 
            <span className="font-medium mr-1">Phone:</span>
            {purchase.user_phone || (purchase.profiles?.phone) || 'N/A'}
        </div>
      </TableCell>
      <TableCell>{purchase.product_name || 'N/A'}</TableCell>
      <TableCell>${purchase.paid_amount?.toFixed(2) || '0.00'}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(purchase.status)} className="capitalize">
          {purchase.status || 'Unknown'}
        </Badge>
      </TableCell>
      <TableCell className="text-right space-x-1 whitespace-nowrap">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin-dashboard/purchase/${purchase.purchase_ref_id}`}>
            <Edit className="h-3 w-3 mr-1" /> Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600 border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700"
              disabled={purchase.status === 'Refunded' || purchase.status === 'Cancelled'}
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Refund
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this purchase (Ref: {purchase.purchase_ref_id}) as refunded? This action will update its status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-yellow-500 hover:bg-yellow-600"
                onClick={() => onUpdateStatus(purchase.purchase_ref_id, 'Refunded', `Purchase ${purchase.purchase_ref_id} marked as refunded.`)}
              >
                Confirm Refund
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructiveOutline"
              size="sm"
              className="text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700"
              disabled={purchase.status === 'Cancelled' || purchase.status === 'Refunded' || purchase.status === 'Completed'}
            >
              <XCircle className="h-3 w-3 mr-1" /> Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this purchase (Ref: {purchase.purchase_ref_id})? This action will update its status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onUpdateStatus(purchase.purchase_ref_id, 'Cancelled', `Purchase ${purchase.purchase_ref_id} marked as cancelled.`)}
              >
                Confirm Cancellation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};


const RecentPurchasesTab = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          purchase_ref_id,
          created_at,
          name, 
          email,
          user_phone,
          product_name,
          paid_amount,
          status,
          user_id,
          address,
          payment_type,
          selected_addons,
          preferred_booking_date,
          additional_preferred_dates,
          profiles ( phone ) 
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast({ title: "Error", description: "Could not fetch purchases.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const updatePurchaseStatusInList = async (purchaseRefId, newStatus, successMessage) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('purchase_ref_id', purchaseRefId);
      if (error) throw error;
      toast({ title: "Success", description: successMessage });
      fetchPurchases(); 
    } catch (error) {
      console.error(`Error updating status to ${newStatus}:`, error);
      toast({ title: "Error", description: `Could not update purchase status to ${newStatus}.`, variant: "destructive" });
    }
  };
  
  const handleExport = () => {
    if (purchases.length === 0) {
      toast({ title: "No Data", description: "There are no purchases to export." });
      return;
    }
    const headers = ["Ref No.", "Date", "Customer Name", "Customer Email", "Customer Phone", "Product", "Amount", "Status", "User ID", "Payment Type", "Address", "Booking Date", "Addons"];
    const csvRows = [headers.join(",")];

    purchases.forEach(p => {
      const phoneToExport = p.user_phone || p.profiles?.phone || 'N/A';
      const row = [
        p.purchase_ref_id,
        formatDateSafe(p.created_at),
        `"${p.name || 'N/A'}"`,
        p.email || 'N/A',
        phoneToExport,
        `"${p.product_name || 'N/A'}"`,
        p.paid_amount?.toFixed(2) || '0.00',
        p.status || 'N/A',
        p.user_id || 'N/A',
        p.payment_type || 'N/A',
        `"${p.address ? `${p.address.street || ''}, ${p.address.city || ''}, ${p.address.state || ''} ${p.address.zip || ''}`.trim() : 'N/A'}"`,
        p.preferred_booking_date ? formatDateSafe(p.preferred_booking_date, false) : 'N/A',
        `"${p.selected_addons ? p.selected_addons.map(a => a.name).join('; ') : 'None'}"`
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `purchases_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: "Purchases CSV file downloaded." });
  };


  if (loading) {
    return <div className="p-6 text-center">Loading recent purchases...</div>;
  }

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
          <ShoppingCart className="mr-3 h-7 w-7 text-primary" />
          Recent Purchases
        </CardTitle>
        <CardDescription>View and manage all customer purchases.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button onClick={handleExport} size="sm" variant="outline" disabled={purchases.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        {purchases.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">No purchases recorded yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <PurchaseRow 
                    key={purchase.purchase_ref_id} 
                    purchase={purchase} 
                    onUpdateStatus={updatePurchaseStatusInList}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPurchasesTab;
