
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';


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

const generatePurchaseRefId = () => {
  return `CS-${uuidv4().substring(0, 8).toUpperCase()}`;
};

const BookingSummaryPage = ({ addonTemplates: allAddonTemplates }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { toast } = useToast();
  const { user, profile, addresses } = useAuth();
  const { selections, matchedProduct, loadingProductMatch, resetSelections: resetBookingContextSelections } = useBooking();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guestDetails, setGuestDetails] = useState({
    fullName: '', email: '', phone: '', street: '', city: '', state: '', zip: ''
  });
  const [bookingDate, setBookingDate] = useState('');
  const [additionalBookingDates, setAdditionalBookingDates] = useState({ date2: '', date3: '', date4: '' });
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isGuestFlowActive, setIsGuestFlowActive] = useState(false);

  const [currentAddonTemplates, setCurrentAddonTemplates] = useState([]);

  useEffect(() => {
    if (user && addresses && addresses.length > 0) {
        const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
        if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
        }
    }
  }, [user, addresses]);

  useEffect(() => {
    if (matchedProduct && matchedProduct.linked_addons) {
      setCurrentAddonTemplates(matchedProduct.linked_addons);
      // Reset selected addons if they are not part of the new linked addons
      setSelectedAddons(prev => prev.filter(addonId => 
        matchedProduct.linked_addons.some(linkedAddon => linkedAddon.id === addonId)
      ));
    } else {
      // Fallback or default behavior if no product is matched or no linked_addons
      // For now, if no product match, show all addons. This could be changed.
      setCurrentAddonTemplates(allAddonTemplates || []);
    }
  }, [matchedProduct, allAddonTemplates]);


  const handleAddonToggle = useCallback((addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  }, []);

  const handleGuestDetailsChange = useCallback((newDetails) => {
    setGuestDetails(newDetails);
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

  const handleAdditionalBookingDateChange = useCallback((dateKey, value) => {
    setAdditionalBookingDates(prev => ({...prev, [dateKey]: value}));
  }, []);


  const calculatePrice = useCallback(() => {
    let basePrice = 0;
    if (matchedProduct && matchedProduct.price) {
      basePrice = Number(matchedProduct.price);
    } else {
      if (selections.propertyType === 'home') {
        if (selections.homeSize === 'small') basePrice = 100;
        else if (selections.homeSize === 'medium') basePrice = 150;
        else if (selections.homeSize === 'large') basePrice = 200;
      } else if (selections.propertyType === 'airbnb') {
        if (selections.homeSize === 'small') basePrice = 120; 
        else if (selections.homeSize === 'medium') basePrice = 180; 
        else if (selections.homeSize === 'large') basePrice = 250; 
      }
      if (selections.cleaningType === 'recurring' && !(matchedProduct && matchedProduct.price)) {
         basePrice *= 0.9; 
      }
    }
    
    const addonsPrice = selectedAddons.reduce((total, addonId) => {
      const addon = currentAddonTemplates.find(a => a.id === addonId);
      return total + (addon ? Number(addon.price) : 0);
    }, 0);
    return basePrice + addonsPrice;
  }, [selections, selectedAddons, currentAddonTemplates, matchedProduct]);

  const isCheckoutDisabled = () => {
    if (loadingProductMatch || isSubmitting) return true;
    if (!bookingDate) return true;

    if (selections.cleaningType === 'recurring') {
      if (!additionalBookingDates.date2 || !additionalBookingDates.date3 || !additionalBookingDates.date4) {
        return true;
      }
    }

    if (user) {
      return !selectedAddressId;
    }
    if (isGuestFlowActive) { 
        const requiredGuestFields = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zip'];
        for (const field of requiredGuestFields) {
            if (!guestDetails[field]) return true;
        }
        return false; 
    }
    return true; 
  };

  const handleProceedToCheckout = async () => {
    if (isCheckoutDisabled()) {
        toast({ title: "Missing Information", description: "Please complete all required fields.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    const purchaseRefId = generatePurchaseRefId();
    const finalPrice = calculatePrice();
    
    let purchaseData = {
      purchase_ref_id: purchaseRefId,
      product_id: matchedProduct?.id || null,
      product_name: matchedProduct?.name || `Custom ${selections.propertyType === 'home' ? 'Home' : 'Airbnb'} Booking`,
      payment_type: 'Placeholder - Pending Payment', 
      paid_amount: finalPrice,
      status: 'Pending Confirmation', 
      selected_addons: selectedAddons.map(id => currentAddonTemplates.find(a => a.id === id)).filter(Boolean),
      preferred_booking_date: bookingDate,
      additional_preferred_dates: selections.cleaningType === 'recurring' ? additionalBookingDates : null,
      raw_selections: {
        propertyType: selections.propertyType,
        size: selections.homeSize, 
        cleaningType: selections.cleaningType,
      }
    };

    if (user && profile) {
      purchaseData.user_id = user.id;
      purchaseData.email = profile.email || user.email;
      purchaseData.name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email;
      const userAddress = addresses.find(addr => addr.id === selectedAddressId);
      purchaseData.address = userAddress ? { 
        street: userAddress.street, 
        city: userAddress.city, 
        state: userAddress.state, 
        zip: userAddress.zip || userAddress.zip_code,
        country: userAddress.country,
        label: userAddress.label
      } : null;
    } else if (isGuestFlowActive) {
      purchaseData.email = guestDetails.email;
      purchaseData.name = guestDetails.fullName;
      purchaseData.address = {
        street: guestDetails.street,
        city: guestDetails.city,
        state: guestDetails.state,
        zip: guestDetails.zip,
      };
    }

    console.log("Attempting to save purchase:", purchaseData);

    try {
      const { data: insertedPurchase, error } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select()
        .single();

      if (error) {
        console.error("Error saving purchase:", error);
        toast({
          title: "Booking Failed",
          description: `Could not save your booking. ${error.message}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Purchase saved successfully:", insertedPurchase);
      toast({
        title: "Booking Submitted!",
        description: "Your booking request has been submitted. Redirecting to confirmation...",
      });
      
      resetBookingContextSelections();
      setSelectedAddons([]);
      setGuestDetails({ fullName: '', email: '', phone: '', street: '', city: '', state: '', zip: '' });
      setBookingDate('');
      setAdditionalBookingDates({ date2: '', date3: '', date4: '' });
      setSelectedAddressId(null);
      setIsGuestFlowActive(false);

      navigate('/booking-confirmation', { state: { purchaseDetails: insertedPurchase } });

    } catch (e) {
      console.error("Unexpected error during checkout:", e);
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          {loadingProductMatch && (
            <div className="flex items-center justify-center text-primary dark:text-sky-400">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Matching your service...
            </div>
          )}
          {matchedProduct && !loadingProductMatch && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-md text-green-700 text-sm dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
              Service: {matchedProduct.name} (Price: ${Number(matchedProduct.price).toFixed(2)})
            </div>
          )}
          {!matchedProduct && !loadingProductMatch && (selections.propertyType === 'home' || selections.propertyType === 'airbnb') && (
             <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700 text-sm dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
              No direct product match found. Price estimated. Proceeding with general booking.
            </div>
          )}

          <BookingItemsSection 
            selections={selections} 
            addonTemplates={currentAddonTemplates} 
            selectedAddons={selectedAddons}
            onAddonToggle={handleAddonToggle}
            matchedProduct={matchedProduct}
          />
          <UserDetailsSection 
            onAddressSelect={handleAddressSelect}
            onGuestDetailsChange={handleGuestDetailsChange}
            currentSelectedAddressId={selectedAddressId}
            currentGuestDetails={guestDetails}
            onIsGuestFlowActiveChange={setIsGuestFlowActive}
          />
          <BookingDateSection 
            bookingDate={bookingDate}
            onBookingDateChange={handleBookingDateChange}
            additionalBookingDates={additionalBookingDates}
            onAdditionalBookingDateChange={handleAdditionalBookingDateChange}
            cleaningType={selections.cleaningType}
          />
          <PriceAndCheckoutSection 
            totalPrice={calculatePrice()}
            onProceedToCheckout={handleProceedToCheckout}
            isProceedDisabled={isCheckoutDisabled()}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingSummaryPage;
