
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info, Sparkles } from 'lucide-react';

const BookingItemsSection = ({ selections, addonTemplates, selectedAddons, onAddonToggle }) => {
  return (
    <>
      <div className="space-y-4">
        <h4 className="text-xl font-semibold text-foreground mb-3 flex items-center dark:text-white">
          <Info className="h-5 w-5 mr-2 text-primary dark:text-sky-400" /> Your Choices
        </h4>
        <div className="p-4 border border-border rounded-lg bg-background/70 space-y-2 dark:bg-slate-700/50 dark:border-slate-600">
          <p className="text-md dark:text-slate-300"><strong className="text-muted-foreground dark:text-slate-400">Property Type:</strong> <span className="font-medium text-foreground dark:text-white">{selections.propertyType === 'home' ? 'My Home' : 'My Airbnb Rentals'}</span></p>
          {selections.propertyType === 'home' && (
            <>
              <p className="text-md dark:text-slate-300"><strong className="text-muted-foreground dark:text-slate-400">Home Size:</strong> <span className="font-medium text-foreground dark:text-white">{selections.homeSize?.charAt(0).toUpperCase() + selections.homeSize?.slice(1)} House</span></p>
              <p className="text-md dark:text-slate-300"><strong className="text-muted-foreground dark:text-slate-400">Cleaning Type:</strong> <span className="font-medium text-foreground dark:text-white">{selections.cleaningType === 'one-time' ? 'One Time Service' : 'Weekly or Scheduled Routine'}</span></p>
            </>
          )}
        </div>
      </div>

      {addonTemplates && addonTemplates.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-foreground mb-3 flex items-center dark:text-white">
            <Sparkles className="h-5 w-5 mr-2 text-accent dark:text-yellow-400" /> Optional Addons
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-background/70 dark:bg-slate-700/50 dark:border-slate-600">
            {addonTemplates.map(addon => (
              <div key={addon.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors dark:hover:bg-slate-600/50">
                <Checkbox
                  id={`addon-${addon.id}`}
                  checked={selectedAddons.includes(addon.id)}
                  onCheckedChange={() => onAddonToggle(addon.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50 dark:border-primary/70 dark:data-[state=checked]:bg-sky-500"
                />
                <Label htmlFor={`addon-${addon.id}`} className="flex-grow text-sm font-medium text-foreground cursor-pointer dark:text-slate-300">
                  {addon.name}
                </Label>
                <span className="text-sm text-muted-foreground dark:text-slate-400">${Number(addon.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingItemsSection;
