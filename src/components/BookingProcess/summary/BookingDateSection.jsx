
import React from 'react';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';

const BookingDateSection = ({ bookingDate, onBookingDateChange }) => {
  return (
    <div className="space-y-4">
       <h4 className="text-xl font-semibold text-foreground mb-3 flex items-center dark:text-white">
          <CalendarDays className="h-5 w-5 mr-2 text-primary dark:text-sky-400" /> Preferred Booking Date
        </h4>
        <div className="p-4 border border-border rounded-lg bg-background/70 dark:bg-slate-700/50 dark:border-slate-600">
          <Input 
              type="date" 
              value={bookingDate} 
              onChange={(e) => onBookingDateChange(e.target.value)} 
              className="w-full dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:[color-scheme:dark]"
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
          />
          <p className="text-xs text-muted-foreground mt-2 dark:text-slate-400">A team member will contact you to confirm the exact time and availability.</p>
        </div>
    </div>
  );
};

export default BookingDateSection;
