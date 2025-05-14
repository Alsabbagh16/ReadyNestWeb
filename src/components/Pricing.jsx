
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { personalSubscriptionPlans, businessSubscriptionPlans } from "@/lib/services";

const Pricing = () => {
  const [planType, setPlanType] = useState("personal");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const renderPersonalPlans = () => (
    <motion.div
      className="grid md:grid-cols-3 gap-6 md:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {personalSubscriptionPlans.map((plan) => (
        <motion.div
          key={plan.id}
          variants={itemVariants}
          className="pricing-card"
        >
          <Card className={`h-full flex flex-col ${plan.popular ? 'pricing-popular' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                Most Popular
              </div>
            )}
            <CardHeader>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-primary">BD {plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>{plan.cleanings} cleanings per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Flexible scheduling</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Professional cleaning team</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Satisfaction guaranteed</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/book">Subscribe Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderBusinessPlans = () => (
    <motion.div
      className="grid md:grid-cols-3 gap-6 md:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {businessSubscriptionPlans.map((plan) => (
        <motion.div
          key={plan.id}
          variants={itemVariants}
          className="pricing-card"
        >
          <Card className={`h-full flex flex-col ${plan.popular ? 'pricing-popular' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                Most Popular
              </div>
            )}
            <CardHeader>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 mb-2">
                <span className="text-4xl font-bold text-primary">BD {plan.price}</span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/book">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <section id="pricing" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your cleaning needs
          </p>
          <Tabs defaultValue="personal" value={planType} onValueChange={setPlanType} className="max-w-xs mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">For Homeowners</TabsTrigger>
              <TabsTrigger value="business">For Hosts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-16">
          {planType === "personal" ? renderPersonalPlans() : renderBusinessPlans()}
        </div>

        {/* Property Managers Section */}
        <div className="max-w-3xl mx-auto text-center bg-muted rounded-xl p-8 mt-16">
          <h3 className="text-2xl font-bold mb-4">For Property Managers & Buildings</h3>
          <p className="text-lg mb-6">
            For buildings and multi-unit portfolios, pricing depends on scale and frequency. Contact us for a custom quote.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
