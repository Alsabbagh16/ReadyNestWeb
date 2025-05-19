
import React from 'react';
import { motion } from 'framer-motion';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home } from 'lucide-react';
import SelectionCard from '@/components/BookingProcess/SelectionCard';

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

const Step2HomeSize = ({ onSelect, currentSelection }) => (
  <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepVariants.transition}>
    <CardHeader className="text-center mb-6">
      <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">What Size Is Your House?</CardTitle>
      <CardDescription className="mt-2 text-lg text-muted-foreground">Choose the option that best describes your home.</CardDescription>
    </CardHeader>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SelectionCard
        icon={<Home size={20} />}
        title="Small House"
        description="Approx. 1-2 bedrooms, up to 1000 sq ft."
        altText="Compact and tidy small house kitchen"
        imageDescription="A clean and well-organized kitchen in a small, modern house"
        selected={currentSelection === 'small'}
        onSelect={() => onSelect('small')}
      />
      <SelectionCard
        icon={<Home size={24} />}
        title="Medium House"
        description="Approx. 3-4 bedrooms, 1000-2500 sq ft."
        altText="Spacious medium-sized family home exterior"
        imageDescription="The exterior of a welcoming, medium-sized suburban family house"
        selected={currentSelection === 'medium'}
        onSelect={() => onSelect('medium')}
      />
      <SelectionCard
        icon={<Home size={28} />}
        title="Large House"
        description="Approx. 5+ bedrooms, over 2500 sq ft."
        altText="Luxurious large house with a swimming pool"
        imageDescription="An impressive large house featuring a beautiful backyard and swimming pool"
        selected={currentSelection === 'large'}
        onSelect={() => onSelect('large')}
      />
    </div>
  </motion.div>
);

export default Step2HomeSize;
  