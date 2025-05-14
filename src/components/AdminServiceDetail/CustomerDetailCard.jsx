
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

const CustomerDetailCard = ({ booking, user }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Customer Info</h3>
      <div className="flex items-center space-x-3">
        <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span>{booking.name}</span>
      </div>
      <div className="flex items-center space-x-3">
        <Mail className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span className="break-all">{booking.email}</span>
      </div>
      <div className="flex items-center space-x-3">
        <Phone className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span>{booking.phone || 'N/A'}</span>
      </div>
       {user && (
           <div className="text-sm text-gray-500 pt-2 border-t">
             Registered User (Credits: {user.credits || 0})
           </div>
       )}
    </div>
  );
};

export default CustomerDetailCard;
  