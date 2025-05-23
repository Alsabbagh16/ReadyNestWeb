
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShoppingBag, CalendarDays, Tag, CheckSquare, DollarSign } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formatDateSafe = (dateString) => {
    try {
        if (!dateString || isNaN(new Date(dateString).getTime())) return 'N/A';
        return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
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
             return 'default';
        case 'processing':
             return 'outline';
        case 'shipped':
             return 'info';
        case 'cancelled':
        case 'failed':
             return 'destructive';
        default: return 'secondary';
    }
};

const PurchaseHistoryTab = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPurchases = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }
      setPurchases(data || []);
    } catch (e) {
      console.error("Error fetching purchase history:", e);
      setError(e.message || "Failed to fetch purchase history.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  if (loading) {
    return <div className="p-6 text-center">Loading your purchase history...</div>;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-none rounded-none">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>Review your past bookings and purchases.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-700 dark:text-red-300 font-semibold">Oops! Something went wrong.</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
     <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
            <ShoppingBag className="mr-3 h-7 w-7 text-primary" />
            Purchase History
        </CardTitle>
        <CardDescription>Review your past bookings and purchases.</CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
            <div className="text-center py-10">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">You have no past purchases.</p>
                <p className="text-sm text-muted-foreground">Ready to book your next cleaning service?</p>
            </div>
        ) : (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {purchases.map((purchase) => (
                <AccordionItem value={purchase.purchase_ref_id} key={purchase.purchase_ref_id} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left">
                        <div className="flex-1 mb-2 md:mb-0">
                            <p className="font-semibold text-primary text-sm md:text-base dark:text-sky-400">{purchase.product_name || 'Custom Service'}</p>
                            <p className="text-xs text-muted-foreground">Ref: {purchase.purchase_ref_id}</p>
                        </div>
                        <div className="flex items-center space-x-4 md:space-x-6 text-xs md:text-sm">
                            <span className="text-muted-foreground whitespace-nowrap">{formatDateSafe(purchase.created_at)}</span>
                            <Badge variant={getStatusBadgeVariant(purchase.status)} className="capitalize text-xs px-2 py-0.5">{purchase.status || 'Unknown'}</Badge>
                            <span className="font-semibold text-foreground dark:text-white">${Number(purchase.paid_amount).toFixed(2)}</span>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border-t border-border dark:border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-muted-foreground mb-1 flex items-center"><Tag className="h-4 w-4 mr-2 text-primary dark:text-sky-400" />Service Details</h4>
                            <p><strong className="text-foreground dark:text-slate-300">Product:</strong> {purchase.product_name || 'N/A'}</p>
                            <p><strong className="text-foreground dark:text-slate-300">Payment Type:</strong> {purchase.payment_type || 'N/A'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground mb-1 flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-primary dark:text-sky-400" />Booking Dates</h4>
                            <p><strong className="text-foreground dark:text-slate-300">Preferred Date 1:</strong> {purchase.preferred_booking_date ? formatDateSafe(purchase.preferred_booking_date) : 'N/A'}</p>
                            {purchase.additional_preferred_dates && (
                                <>
                                    {purchase.additional_preferred_dates.date2 && <p><strong className="text-foreground dark:text-slate-300">Date 2:</strong> {formatDateSafe(purchase.additional_preferred_dates.date2)}</p>}
                                    {purchase.additional_preferred_dates.date3 && <p><strong className="text-foreground dark:text-slate-300">Date 3:</strong> {formatDateSafe(purchase.additional_preferred_dates.date3)}</p>}
                                    {purchase.additional_preferred_dates.date4 && <p><strong className="text-foreground dark:text-slate-300">Date 4:</strong> {formatDateSafe(purchase.additional_preferred_dates.date4)}</p>}
                                </>
                            )}
                        </div>
                        {purchase.selected_addons && purchase.selected_addons.length > 0 && (
                            <div className="md:col-span-2">
                                <h4 className="font-semibold text-muted-foreground mb-1 flex items-center"><CheckSquare className="h-4 w-4 mr-2 text-primary dark:text-sky-400" />Selected Add-ons</h4>
                                <ul className="list-disc list-inside pl-1">
                                    {purchase.selected_addons.map((addon, index) => (
                                        <li key={index}>{addon.name} - ${Number(addon.price).toFixed(2)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                         <div className="md:col-span-2">
                            <h4 className="font-semibold text-muted-foreground mb-1 flex items-center"><DollarSign className="h-4 w-4 mr-2 text-primary dark:text-sky-400" />Customer & Address</h4>
                            <p><strong className="text-foreground dark:text-slate-300">Name:</strong> {purchase.name || 'N/A'}</p>
                            <p><strong className="text-foreground dark:text-slate-300">Email:</strong> {purchase.email || 'N/A'}</p>
                            {purchase.address && (
                                <p><strong className="text-foreground dark:text-slate-300">Address:</strong> 
                                    {`${purchase.address.street || ''}, ${purchase.address.city || ''}, ${purchase.address.state || ''} ${purchase.address.zip || ''} ${purchase.address.country || ''}`.replace(/, , /g, ', ').replace(/, $/, '').trim() || 'N/A'}
                                </p>
                            )}
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistoryTab;
