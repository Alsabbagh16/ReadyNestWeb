
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '@/lib/storage/bookingStorage';
import { services, personalSubscriptionPlans, businessSubscriptionPlans } from '@/lib/services';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Helper function to determine Badge variant based on status
const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed': return 'success';
        case 'in-progress': return 'default';
        case 'scheduled': return 'outline';
        case 'pending': return 'secondary';
        case 'cancelled': return 'destructive';
        case 'quote requested': return 'secondary';
        case 'refunded': return 'destructive'; // Added refunded variant
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


const RecentServicesTab = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('newest'); // newest, completed, credit, regular, refunded, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [activeFilter, allBookings]);

  const fetchBookings = () => {
    setLoading(true);
    setTimeout(() => {
      const bookingsData = getBookings();
      setAllBookings(bookingsData);
      setLoading(false);
    }, 300);
  };

  const filterBookings = () => {
    let filtered = [...allBookings];

    switch (activeFilter) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'completed':
        filtered = filtered.filter(b => b.serviceStatus?.toLowerCase() === 'completed');
        break;
      case 'credit':
        filtered = filtered.filter(b => b.paidWithCredits > 0);
        break;
      case 'regular': // Assuming regular means not paid with credits
        filtered = filtered.filter(b => !(b.paidWithCredits > 0));
        break;
      case 'refunded':
        filtered = filtered.filter(b => b.status?.toLowerCase() === 'refunded');
        break;
      case 'cancelled':
        filtered = filtered.filter(b => b.serviceStatus?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'cancelled');
        break;
      default:
         filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFilteredBookings(filtered);
  };

  const getServiceName = (serviceId) => services.find(s => s.id === serviceId)?.name || 'N/A';
  const getPlanName = (planId, planCategory) => {
    if (!planId) return 'Single Cleaning';
    const plans = planCategory === 'business' ? businessSubscriptionPlans : personalSubscriptionPlans;
    return plans.find(p => p.id === planId)?.name || 'Unknown Plan';
  };

  if (loading) {
    return <div className="p-6">Loading recent services...</div>;
  }

  return (
    <div className="p-6">
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="credit">Paid (Credits)</TabsTrigger>
          <TabsTrigger value="regular">Paid (Regular)</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredBookings.length === 0 ? (
        <p>No services found for the selected filter.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref No.</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service/Plan</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Service Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                     <Link to={`/admin-dashboard/service/${booking.id}`} className="text-blue-600 hover:underline font-mono">
                        {booking.id.substring(0, 6)}
                     </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{booking.date ? `${formatDateSafe(booking.date)} ${booking.time || ''}` : 'N/A'}</TableCell>
                  <TableCell>{booking.name} ({booking.email})</TableCell>
                  <TableCell>{getPlanName(booking.planId, booking.planCategory)} - {getServiceName(booking.serviceId)}</TableCell>
                  <TableCell>
                      {booking.paidWithCredits > 0 ? `${booking.paidWithCredits} Credits` : `${booking.price?.toFixed(2) || '0.00'}`}
                      {booking.status === 'refunded' && <span className="text-red-600 ml-1">(Refunded)</span>}
                  </TableCell>
                  <TableCell>
                     <Badge variant={getStatusBadgeVariant(booking.serviceStatus)} className="capitalize">
                        {booking.serviceStatus || 'Unknown'}
                     </Badge>
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

export default RecentServicesTab;
  