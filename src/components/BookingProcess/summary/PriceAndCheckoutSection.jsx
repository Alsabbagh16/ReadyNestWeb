
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';


const PriceAndCheckoutSection = ({ totalPrice, onProceedToCheckout, isProceedDisabled }) => {
  const { user, loading: authLoading } = useAuth();
  const [internalShowGuestForm, setInternalShowGuestForm] = React.useState(false); // This state is local and might need to be lifted or synced if it determines global proceed logic

  // This effect is only for demonstration if this component were to control guest form visibility
  React.useEffect(() => {
    // If there's a parent component that controls showGuestForm, this component shouldn't independently manage it.
    // For now, assume isProceedDisabled considers the guest form state from the parent.
  }, []);


  return (
    <div className="pt-6 border-t border-border dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold text-foreground flex items-center dark:text-white">
          <DollarSign className="h-6 w-6 mr-2 text-primary dark:text-sky-400" /> Estimated Total:
        </p>
        <p className="text-3xl font-extrabold text-primary dark:text-sky-400">${totalPrice.toFixed(2)}</p>
      </div>
      <Button 
        onClick={onProceedToCheckout} 
        size="lg" 
        className="w-full text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-500/90 hover:to-emerald-600/90 text-white py-3"
        disabled={isProceedDisabled || authLoading}
      >
        <ShoppingCart className="mr-2 h-5 w-5" /> Proceed to Checkout
      </Button>
      {isProceedDisabled && !authLoading && <p className="text-xs text-center mt-2 text-muted-foreground dark:text-slate-400">Please login, register, or continue as guest and fill required fields to proceed.</p>}
    </div>
  );
};

export default PriceAndCheckoutSection;
