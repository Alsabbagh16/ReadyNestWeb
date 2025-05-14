
import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, Tag, DollarSign, CreditCard } from 'lucide-react';

const ServiceDetailCard = ({ booking, getServiceName, getPlanName }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Service Info</h3>
      <div className="flex items-center space-x-3">
        <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span>{booking.date ? format(new Date(booking.date), 'EEEE, MMMM d, yyyy') : 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-3">
        <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span>{booking.time || 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-3">
         <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
         <span>{booking.address}</span>
      </div>
       <div className="flex items-center space-x-3">
        <Tag className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span>{getServiceName(booking.serviceId)} ({getPlanName(booking.planId, booking.planCategory)})</span>
      </div>
      <div className="flex items-center space-x-3">
        {booking.paidWithCredits > 0 ? <CreditCard className="h-5 w-5 text-gray-500 flex-shrink-0" /> : <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />}
        <span>
          {booking.paidWithCredits > 0 ? `Paid with ${booking.paidWithCredits} Credits` : `Price: $${booking.price?.toFixed(2)}`}
          {booking.status === 'refunded' && <span className="text-red-600 ml-1">(Refunded)</span>}
        </span>
      </div>
    </div>
  );
};

export default ServiceDetailCard;
  