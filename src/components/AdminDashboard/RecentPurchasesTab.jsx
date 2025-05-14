
import React, { useState, useEffect } from 'react';
import { getBookings, refundBooking } from '@/lib/storage/bookingStorage';
import { services, personalSubscriptionPlans, businessSubscriptionPlans } from '@/lib/services';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCcw, Download } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link
import { Badge } from "@/components/ui/badge"; // Import Badge

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

// Helper function to format date or return 'N/A'
const formatDateSafe = (dateString) => {
    try {
        if (!dateString || isNaN(new Date(dateString).getTime())) return 'N/A';
        return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};


const RecentPurchasesTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      const allBookings = getBookings();
      // Sort by creation date, most recent first
      allBookings.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : 0;
          const dateB = b.createdAt ? new Date(b.createdAt) : 0;
          return dateB - dateA;
      });
      setBookings(allBookings);
      setLoading(false);
    }, 300);
  };

  const handleRefund = (bookingId) => {
     if (window.confirm("Are you sure you want to refund this purchase? This action cannot be undone.")) {
       try {
         refundBooking(bookingId);
         toast({ title: "Booking Refunded", description: `Booking Ref ${bookingId.substring(0, 6)} has been marked as refunded.` });
         fetchBookings(); // Refresh list
       } catch (error) {
         toast({ title: "Error", description: "Could not process refund.", variant: "destructive" });
       }
     }
  };

  const handleExport = () => {
      // Placeholder for CSV export functionality
      toast({ title: "Export Requested", description: "CSV export functionality is not yet implemented." });
  };

  const getServiceName = (serviceId) => services.find(s => s.id === serviceId)?.name || 'N/A';
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
    return <div className="p-6">Loading recent purchases...</div>;
  }

  return (
    <div className="p-6">
       <div className="flex justify-end mb-4">
         <Button onClick={handleExport} size="sm" variant="outline">
           <Download className="mr-2 h-4 w-4" /> Export CSV
         </Button>
       </div>

      {bookings.length === 0 ? (
        <p>No purchases recorded yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service/Plan</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                     <Link to={`/admin-dashboard/service/${booking.id}`} className="text-blue-600 hover:underline font-mono">
                        {booking.id.substring(0, 6)}
                     </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateSafe(booking.createdAt)}</TableCell>
                  <TableCell>{booking.name} ({booking.email})</TableCell>
                  <TableCell>{getPlanName(booking.planId, booking.planCategory)} - {getServiceName(booking.serviceId)}</TableCell>
                  <TableCell>
                      {booking.paidWithCredits > 0 ? `${booking.paidWithCredits} Credits` : `${booking.price?.toFixed(2) || '0.00'}`}
                      {booking.status === 'refunded' && <span className="text-red-600 ml-1">(Refunded)</span>}
                  </TableCell>
                  <TableCell>
                     <Badge variant={getStatusBadgeVariant(getDisplayStatus(booking))} className="capitalize">
                        {getDisplayStatus(booking)}
                     </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefund(booking.id)}
                      disabled={booking.status === 'refunded' || booking.status === 'quote_requested'}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" /> Refund
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecentPurchasesTab;
  