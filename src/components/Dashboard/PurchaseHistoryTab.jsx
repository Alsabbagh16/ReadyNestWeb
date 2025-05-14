
import React, { useState, useEffect } from 'react';
import { getBookingsByUserId } from '@/lib/storage/bookingStorage'; // Use specific function
import { services, personalSubscriptionPlans, businessSubscriptionPlans } from '@/lib/services';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import Badge

// Helper function to format date or return 'N/A'
const formatDateSafe = (dateString) => {
    try {
        if (!dateString || isNaN(new Date(dateString).getTime())) return 'N/A';
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

// Helper function to determine Badge variant based on status
const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'success';
        case 'in-progress': return 'default';
        case 'scheduled': return 'outline';
        case 'pending': return 'secondary';
        case 'cancelled': return 'destructive';
        case 'quote requested': return 'secondary';
        case 'refunded': return 'destructive';
        default: return 'secondary';
    }
};


const PurchaseHistoryTab = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (!user || !user.id) { // Check for user and user.id
        setLoading(false);
        return;
    }
    // Use getBookingsByUserId for accuracy
    const userBookings = getBookingsByUserId(user.id)
        .sort((a, b) => {
             const dateA = a.createdAt ? new Date(a.createdAt) : 0;
             const dateB = b.createdAt ? new Date(b.createdAt) : 0;
             return dateB - dateA; // Sort descending
        });
    setBookings(userBookings);
    setLoading(false);
  }, [user]);

  const getServiceName = (serviceId) => {
    return services.find(s => s.id === serviceId)?.name || 'N/A';
  };

   const getPlanName = (planId, planCategory) => {
    if (!planId) return 'Single Cleaning';
    const plans = planCategory === 'business' ? businessSubscriptionPlans : personalSubscriptionPlans;
    return plans.find(p => p.id === planId)?.name || 'Unknown Plan';
  };

  // Use serviceStatus for display if available, otherwise fallback to status
   const getDisplayStatus = (booking) => {
       return booking.serviceStatus || booking.status || 'Unknown';
   };


  if (loading) {
    return <div className="p-6">Loading purchase history...</div>;
  }

  return (
     <Card className="border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
        <CardDescription>Review your past bookings, purchases, and quotes.</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
            <p>You have no past bookings or purchases.</p>
        ) : (
            <div className="overflow-x-auto border rounded-md">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="text-xs md:text-sm">Ref No.</TableHead>
                     <TableHead className="text-xs md:text-sm">Date</TableHead>
                     <TableHead className="text-xs md:text-sm">Type / Plan</TableHead>
                     <TableHead className="text-xs md:text-sm">Details</TableHead>
                     <TableHead className="text-xs md:text-sm">Amount</TableHead>
                     <TableHead className="text-xs md:text-sm">Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {bookings.map((booking) => (
                     <TableRow key={booking.id}>
                       <TableCell className="text-xs md:text-sm font-mono">{booking.id.substring(0, 6)}</TableCell>
                       <TableCell className="text-xs md:text-sm whitespace-nowrap">
                         {formatDateSafe(booking.createdAt)}
                        </TableCell>
                       <TableCell className="text-xs md:text-sm">{getPlanName(booking.planId, booking.planCategory)}</TableCell>
                       <TableCell className="text-xs md:text-sm">
                           {booking.type === 'subscription' && booking.planCategory === 'business' ? `Purchased Credits` : getServiceName(booking.serviceId)}
                           {booking.paidWithCredits > 0 && ` (Paid with ${booking.paidWithCredits} credit)`}
                       </TableCell>
                       <TableCell className="text-xs md:text-sm">
                           {booking.paidWithCredits > 0 ? `- ${booking.paidWithCredits} Cr` : `${booking.price?.toFixed(2) || '0.00'}`}
                           {booking.status === 'refunded' && <span className="text-red-600 ml-1">(R)</span>}
                       </TableCell>
                       <TableCell className="text-xs md:text-sm capitalize">
                           <Badge variant={getStatusBadgeVariant(getDisplayStatus(booking))} className="capitalize">
                                {getDisplayStatus(booking)}
                           </Badge>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistoryTab;
  