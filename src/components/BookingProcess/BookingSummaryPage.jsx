
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import UserDetailsSection from './summary/UserDetailsSection';
import BookingItemsSection from './summary/BookingItemsSection';
import BookingDateSection from './summary/BookingDateSection';
import PriceAndCheckoutSection from './summary/PriceAndCheckoutSection';

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

const BookingSummaryPage = ({ selections, addonTemplates }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const [guestDetails, setGuestDetails] = useState({
    fullName: '', email: '', phone: '', street: '', city: '', state: '', zip: ''
  });
  const [bookingDate, setBookingDate] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  
  // This state specifically tracks if the "Continue as Guest" button was clicked
  // to reveal the guest form, as UserDetailsSection handles its own internal 'showGuestForm'
  // for rendering, but parent needs to know this choice was made for validation.
  const [isGuestFlowActive, setIsGuestFlowActive] = useState(false); 

  const handleAddonToggle = useCallback((addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  }, []);

  const handleGuestDetailsChange = useCallback((newDetails) => {
    setGuestDetails(newDetails);
    // If guest details are being filled, it implies guest flow is active.
    // This might need refinement if guest form can be shown then hidden without clearing details.
    if (Object.values(newDetails).some(val => val !== '')) {
        setIsGuestFlowActive(true); 
    }
  }, []);
  
  const handleAddressSelect = useCallback((addressId) => {
    setSelectedAddressId(addressId);
  }, []);

  const handleBookingDateChange = useCallback((date) => {
    setBookingDate(date);
  }, []);

  const calculatePrice = useCallback(() => {
    let basePrice = 0;
    if (selections.propertyType === 'home') {
      if (selections.homeSize === 'small') basePrice = 100;
      else if (selections.homeSize === 'medium') basePrice = 150;
      else if (selections.homeSize === 'large') basePrice = 200;
      if (selections.cleaningType === 'recurring') basePrice *= 0.9;
    } else if (selections.propertyType === 'airbnb') {
      basePrice = 120;
    }
    const addonsPrice = selectedAddons.reduce((total, addonId) => {
      const addon = addonTemplates.find(a => a.id === addonId);
      return total + (addon ? Number(addon.price) : 0);
    }, 0);
    return basePrice + addonsPrice;
  }, [selections, selectedAddons, addonTemplates]);

  const isCheckoutDisabled = () => {
    if (!bookingDate) return true;
    if (user) {
      return !selectedAddressId;
    }
    // For guest flow, ensure guestDetails are complete
    // We rely on UserDetailsSection to show the form, but here we check if it's been activated
    // and if the details are actually filled.
    if (isGuestFlowActive) { 
        const requiredGuestFields = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zip'];
        for (const field of requiredGuestFields) {
            if (!guestDetails[field]) return true; // Disable if any required field is empty
        }
        return false; // All guest fields filled
    }
    // If not user and not active guest flow, disable (meaning login/register/continue as guest not chosen)
    return true; 
  };


  const handleProceedToCheckout = () => {
    if (!bookingDate) {
        toast({ title: "Missing Information", description: "Please select a preferred booking date.", variant: "destructive" });
        return;
    }

    if (user && !selectedAddressId) {
        toast({ title: "Missing Information", description: "Please select or add a service address.", variant: "destructive" });
        return;
    }
    
    // Check guest details only if user is not logged in AND guest flow is active
    if (!user && isGuestFlowActive) {
        const requiredGuestFields = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zip'];
        for (const field of requiredGuestFields) {
            if (!guestDetails[field]) {
                toast({ title: "Missing Information", description: `Please fill in all guest details, including ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`, variant: "destructive" });
                return;
            }
        }
    } else if (!user && !isGuestFlowActive) {
        // This case means user is not logged in, and hasn't opted for guest flow yet.
        // The button should ideally be disabled by isCheckoutDisabled, but double check here.
        toast({ title: "Action Required", description: "Please login, register, or choose to continue as a guest.", variant: "info" });
        return;
    }

    const bookingData = {
        selections,
        selectedAddons: selectedAddons.map(id => addonTemplates.find(a => a.id === id)),
        totalPrice: calculatePrice(),
        preferredBookingDate: bookingDate,
        ...(user && selectedAddressId && { userId: user.id, addressId: selectedAddressId }),
        ...(!user && isGuestFlowActive && { guestInfo: guestDetails })
    };
    
    toast({
      title: "Proceeding to Checkout",
      description: "This feature is coming soon! Your selections have been captured.",
      variant: "default"
    });
    console.log("Booking Data:", bookingData);
  };

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepVariants.transition}>
      <Card className="bg-card/90 backdrop-blur-sm shadow-xl border-primary/30 dark:bg-slate-800/80 dark:border-primary/50">
        <CardHeader className="text-center border-b border-border pb-6 dark:border-slate-700">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl dark:text-white">Booking Summary</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground dark:text-slate-400">Review your selections before proceeding.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <BookingItemsSection 
            selections={selections} 
            addonTemplates={addonTemplates} 
            selectedAddons={selectedAddons}
            onAddonToggle={handleAddonToggle}
          />
          <UserDetailsSection 
            onAddressSelect={handleAddressSelect}
            onGuestDetailsChange={handleGuestDetailsChange}
            currentSelectedAddressId={selectedAddressId}
            currentGuestDetails={guestDetails}
            // This prop tells UserDetailsSection that guest flow is active by parent decision
            // It's a bit indirect, better if UserDetailsSection reported its state up.
            // For now, we use isGuestFlowActive to determine if form should be validated.
            // setIsGuestFlowActive will be called implicitly when guest details change via onGuestDetailsChange
          />
          <BookingDateSection 
            bookingDate={bookingDate}
            onBookingDateChange={handleBookingDateChange}
          />
          <PriceAndCheckoutSection 
            totalPrice={calculatePrice()}
            onProceedToCheckout={handleProceedToCheckout}
            isProceedDisabled={isCheckoutDisabled()}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingSummaryPage;
