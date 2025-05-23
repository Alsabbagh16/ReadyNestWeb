
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

const BookingDateSection = ({ 
  bookingDate, 
  onBookingDateChange,
  additionalBookingDates,
  onAdditionalBookingDateChange,
  cleaningType 
}) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <h4 className="text-xl font-semibold text-foreground mb-3 flex items-center dark:text-white">
        <CalendarDays className="h-5 w-5 mr-2 text-primary dark:text-sky-400" /> Preferred Booking Date(s)
      </h4>
      <div className="p-4 border border-border rounded-lg bg-background/70 dark:bg-slate-700/50 dark:border-slate-600 space-y-4">
        <div>
          <Label htmlFor="bookingDate1" className="block text-sm font-medium text-muted-foreground mb-1 dark:text-slate-400">Preferred Date 1</Label>
          <Input 
            id="bookingDate1"
            type="date" 
            value={bookingDate} 
            onChange={(e) => onBookingDateChange(e.target.value)} 
            className="w-full dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:[color-scheme:dark]"
            min={today}
          />
        </div>
        
        {cleaningType === 'recurring' && (
          <>
            <div>
              <Label htmlFor="bookingDate2" className="block text-sm font-medium text-muted-foreground mb-1 dark:text-slate-400">Preferred Date 2 (approx. 1 week after Date 1)</Label>
              <Input 
                id="bookingDate2"
                type="date" 
                value={additionalBookingDates.date2} 
                onChange={(e) => onAdditionalBookingDateChange('date2', e.target.value)} 
                className="w-full dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:[color-scheme:dark]"
                min={today} 
              />
            </div>
            <div>
              <Label htmlFor="bookingDate3" className="block text-sm font-medium text-muted-foreground mb-1 dark:text-slate-400">Preferred Date 3 (approx. 2 weeks after Date 1)</Label>
              <Input 
                id="bookingDate3"
                type="date" 
                value={additionalBookingDates.date3} 
                onChange={(e) => onAdditionalBookingDateChange('date3', e.target.value)} 
                className="w-full dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:[color-scheme:dark]"
                min={today}
              />
            </div>
            <div>
              <Label htmlFor="bookingDate4" className="block text-sm font-medium text-muted-foreground mb-1 dark:text-slate-400">Preferred Date 4 (approx. 3 weeks after Date 1)</Label>
              <Input 
                id="bookingDate4"
                type="date" 
                value={additionalBookingDates.date4} 
                onChange={(e) => onAdditionalBookingDateChange('date4', e.target.value)} 
                className="w-full dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:[color-scheme:dark]"
                min={today}
              />
            </div>
          </>
        )}
        <p className="text-xs text-muted-foreground pt-2 dark:text-slate-400">A team member will contact you to confirm the exact times and availability for your selected dates.</p>
      </div>
    </div>
  );
};

export default BookingDateSection;
