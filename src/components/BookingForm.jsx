
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { services, personalSubscriptionPlans, businessSubscriptionPlans, calculatePrice } from "@/lib/services";
import { addBooking as saveBooking } from "@/lib/storage/bookingStorage"; // Import directly from bookingStorage
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import BookingTypeTabs from "@/components/BookingForm/BookingTypeTabs";
import ServicePlanSelection from "@/components/BookingForm/ServicePlanSelection";
import DateTimeSelection from "@/components/BookingForm/DateTimeSelection";
import ContactDetails from "@/components/BookingForm/ContactDetails";
import PaymentOptions from "@/components/BookingForm/PaymentOptions";
import { Button } from "@/components/ui/button"; // Import Button

const BookingForm = ({ isQuotePage = false }) => {
  const { toast } = useToast();
  const { user, credits, updateCredits, addresses } = useAuth(); // Get user, credits, update function, addresses

  const [formData, setFormData] = useState({
    bookingType: "single",
    planCategory: "personal",
    selectedService: services[0].id,
    selectedPlan: "",
    date: "",
    time: "",
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "", // Manual address input
    payWithCredits: false,
    isQuote: isQuotePage,
  });

  const [priceDetails, setPriceDetails] = useState({ basePrice: 0, totalPrice: 0 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const serviceCostInCredits = 1; // Assuming 1 credit per single cleaning

  // Initialize selectedPlan based on context/defaults
  useEffect(() => {
    if (formData.bookingType === 'subscription') {
      const defaultPlan = formData.planCategory === 'business'
        ? businessSubscriptionPlans.find(p => p.popular)?.id || businessSubscriptionPlans[0]?.id
        : personalSubscriptionPlans.find(p => p.popular)?.id || personalSubscriptionPlans[0]?.id;
      setFormData(prev => ({ ...prev, selectedPlan: defaultPlan || "" }));
    } else {
      setFormData(prev => ({ ...prev, selectedPlan: "" }));
    }
  }, [formData.planCategory, formData.bookingType]);

  // Pre-fill user details
  useEffect(() => {
     if (user) {
        setFormData(prev => ({
            ...prev,
            name: prev.name || user.name || "",
            email: prev.email || user.email || "",
        }));
     }
  }, [user]);

  // Update price calculation
  useEffect(() => {
    let calculatedPrice = 0;
    if (formData.bookingType === 'single') {
      calculatedPrice = calculatePrice(formData.selectedService, null, null);
    } else if (formData.bookingType === 'subscription') {
      if (formData.planCategory === 'personal') {
        calculatedPrice = calculatePrice(formData.selectedService, formData.selectedPlan, null);
      } else {
        const businessPlan = businessSubscriptionPlans.find(p => p.id === formData.selectedPlan);
        calculatedPrice = businessPlan ? businessPlan.price : 0;
      }
    }
    setPriceDetails({ basePrice: calculatedPrice, totalPrice: calculatedPrice }); // Assuming no extras for now
  }, [formData.selectedService, formData.selectedPlan, formData.bookingType, formData.planCategory]);

  // Reset useCredits if not applicable
  useEffect(() => {
    if (formData.bookingType !== 'single' || formData.isQuote) {
      setFormData(prev => ({ ...prev, payWithCredits: false }));
    }
  }, [formData.bookingType, formData.isQuote]);

  const validateForm = () => {
      const newErrors = {};
      if (!formData.date) newErrors.date = "Date is required.";
      if (!formData.time) newErrors.time = "Time is required.";
      if (!formData.name) newErrors.name = "Name is required.";
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required.";
      if (!formData.phone) newErrors.phone = "Phone number is required."; // Add more specific validation if needed
      if (!formData.address) newErrors.address = "Address is required.";
      if (formData.bookingType === 'subscription' && !formData.selectedPlan) newErrors.plan = "Subscription plan is required.";
      // Add payment validation if needed (e.g., Stripe elements loaded)

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
         toast({
            title: "Missing Information",
            description: "Please fill in all required fields correctly.",
            variant: "destructive",
          });
        return;
    }

    setLoading(true);

    // Credit payment check
    if (formData.payWithCredits && credits < serviceCostInCredits) {
       toast({
        title: "Insufficient Credits",
        description: `You need ${serviceCostInCredits} credit(s) for this service, but only have ${credits}.`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const bookingData = {
      type: formData.bookingType,
      planCategory: formData.bookingType === 'subscription' ? formData.planCategory : null,
      serviceId: formData.selectedService,
      planId: formData.bookingType === 'subscription' ? formData.selectedPlan : null,
      date: formData.date,
      time: formData.time,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address, // Address is now directly from formData
      price: formData.payWithCredits ? 0 : priceDetails.totalPrice,
      paidWithCredits: formData.payWithCredits ? serviceCostInCredits : 0,
      status: formData.isQuote ? 'quote_requested' : (formData.payWithCredits ? 'booked_credit' : 'booked_pending_payment')
    };

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700));

      const savedBooking = saveBooking(bookingData); // Use the imported saveBooking

      let successTitle = "Success!";
      let successDescription = "";

      if (formData.isQuote) {
        successTitle = "Quote Request Sent!";
        successDescription = `We've received your request for ${format(new Date(formData.date), "MMMM d, yyyy")} at ${formData.time}. We'll contact you shortly.`;
      } else if (formData.payWithCredits) {
        updateCredits(-serviceCostInCredits); // Deduct credits via context
        successTitle = "Booked with Credits!";
        successDescription = `Your cleaning using ${serviceCostInCredits} credit(s) is scheduled for ${format(new Date(formData.date), "MMMM d, yyyy")} at ${formData.time}.`;
      } else if (formData.bookingType === 'subscription' && formData.planCategory === 'business') {
         const plan = businessSubscriptionPlans.find(p => p.id === formData.selectedPlan);
         if (plan) updateCredits(plan.credits); // Add credits via context
         successTitle = "Business Plan Purchased!";
         successDescription = `Your ${plan?.name} plan is active. You now have ${credits + (plan?.credits || 0)} credits. Payment processing simulated.`;
         // TODO: Implement actual payment gateway redirection/handling here
      } else {
         successTitle = "Booking Pending Payment";
         successDescription = `Your cleaning for ${format(new Date(formData.date), "MMMM d, yyyy")} at ${formData.time} is reserved. Payment processing simulated.`;
         // TODO: Implement actual payment gateway redirection/handling here
      }

      toast({ title: successTitle, description: successDescription });

      // Reset form partially (keep user details if logged in)
      setFormData(prev => ({
          ...prev,
          date: "",
          time: "",
          address: user && addresses.length > 0 ? prev.address : "", // Keep selected address if user has saved ones
          phone: user ? prev.phone : "", // Keep phone if logged in? Decide based on UX preference
          payWithCredits: false,
          // Reset other fields if needed, e.g., back to default service/plan
          // selectedService: services[0].id,
          // selectedPlan: // reset based on bookingType/planCategory
      }));
      setErrors({});


    } catch (error) {
      console.error("Booking submission error:", error);
      toast({
        title: "Booking Error",
        description: `There was a problem submitting your booking: ${error.message}`,
        variant: "destructive",
      });
    } finally {
        setLoading(false);
    }
  };

  const pageTitle = formData.isQuote ? "Get a Cleaning Quote" : "Book Your Cleaning";
  const pageDescription = formData.isQuote
    ? "Fill out the form below to get a personalized quote."
    : "Schedule a cleaning service or subscribe to a plan.";
  const submitButtonText = formData.isQuote
    ? "Request Quote"
    : (formData.payWithCredits ? `Book with ${serviceCostInCredits} Credit(s)` : `Book Now ($${priceDetails.totalPrice.toFixed(2)})`);


  return (
    <section id="booking" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-left max-w-3xl mx-auto mb-12 md:mb-16 md:text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{pageTitle}</h2>
          <p className="text-lg text-gray-600">{pageDescription}</p>
        </div>

        <motion.div
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
             <div className="p-6 md:p-8 space-y-5 md:space-y-6">
               <BookingTypeTabs
                 bookingType={formData.bookingType}
                 setBookingType={(value) => setFormData(prev => ({ ...prev, bookingType: value }))}
                 planCategory={formData.planCategory}
                 setPlanCategory={(value) => setFormData(prev => ({ ...prev, planCategory: value }))}
               />
                <ServicePlanSelection
                  bookingType={formData.bookingType}
                  planCategory={formData.planCategory}
                  selectedService={formData.selectedService}
                  setSelectedService={(value) => setFormData(prev => ({ ...prev, selectedService: value }))}
                  selectedPlan={formData.selectedPlan}
                  setSelectedPlan={(value) => setFormData(prev => ({ ...prev, selectedPlan: value }))}
                  errors={errors}
                />
                <DateTimeSelection
                    date={formData.date}
                    setDate={(value) => setFormData(prev => ({ ...prev, date: value }))}
                    time={formData.time}
                    setTime={(value) => setFormData(prev => ({ ...prev, time: value }))}
                    errors={errors}
                />
                <ContactDetails
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                />
                <PaymentOptions
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  priceDetails={priceDetails}
                />
                 <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Processing...' : submitButtonText}
                    </Button>
                 </div>
             </div>
           </form>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingForm;
  