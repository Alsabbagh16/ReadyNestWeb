
export const services = [
  {
    id: "vacation-rental-turnover",
    name: "Vacation Rental Turnover Cleaning",
    description: "Quick, efficient cleaning between guest stays including linen change, trash removal, and guest-ready resets.",
    basePrice: 8,
    image: "vacation-rental"
  },
  {
    id: "home-villa-cleaning",
    name: "Home & Villa Cleaning",
    description: "Deep, thorough cleaning for families and homeowners — ideal for regular or one-time refreshes of larger spaces.",
    basePrice: 15,
    image: "home-villa"
  },
  {
    id: "residential-apartment",
    name: "Residential Apartment Cleaning",
    description: "Tailored for studios and compact spaces — smart, space-efficient cleaning designed for busy urban residents.",
    basePrice: 8,
    image: "apartment"
  }
];

export const personalSubscriptionPlans = [
  {
    id: "weekly",
    name: "Weekly Plan",
    description: "Best for families who want a consistently clean home.",
    type: "personal",
    cleanings: 8,
    price: 100,
    frequency: "month",
    popular: true
  },
  {
    id: "bi-weekly",
    name: "Bi-Weekly Plan",
    description: "Ideal for general home upkeep.",
    type: "personal",
    cleanings: 4,
    price: 60,
    frequency: "month"
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    description: "Great for light refreshes or smaller households.",
    type: "personal",
    cleanings: 1,
    price: 25,
    frequency: "month"
  }
];

export const businessSubscriptionPlans = [
  {
    id: "host-starter",
    name: "Host Starter",
    description: "For standard turnovers",
    type: "business",
    cleanings: 4,
    price: 32,
    features: ["Standard cleaning", "Basic turnover service", "Guest-ready preparation"]
  },
  {
    id: "host-plus",
    name: "Host Plus",
    description: "Enhanced turnover service with linen change",
    type: "business",
    cleanings: 4,
    price: 45,
    features: ["Standard cleaning", "Linen change service", "Guest-ready preparation", "Quality inspection"],
    popular: true
  },
  {
    id: "host-pro",
    name: "Host Pro",
    description: "Complete turnover service with full restocking",
    type: "business",
    cleanings: 4,
    price: 60,
    features: ["Deep cleaning", "Linen change service", "Amenity restocking", "Tissue replenishment", "Quality inspection"]
  }
];

export const allSubscriptionPlans = [...personalSubscriptionPlans, ...businessSubscriptionPlans];

// Calculate price based on service, plan, and home size
export const calculatePrice = (serviceId, planId = null) => {
  // Find the selected service
  const service = services.find(s => s.id === serviceId);
  if (!service) return 0;

  // If no plan is selected (single booking), return base price
  if (!planId) return service.basePrice;

  // Find the selected plan
  const personalPlan = personalSubscriptionPlans.find(p => p.id === planId);
  const businessPlan = businessSubscriptionPlans.find(p => p.id === planId);
  const plan = personalPlan || businessPlan;

  if (!plan) return service.basePrice;

  // Return plan price for subscription
  return plan.price;
};

export const testimonials = [
  // ... existing testimonials code
];

export const faqs = [
  // ... existing FAQs code
];
