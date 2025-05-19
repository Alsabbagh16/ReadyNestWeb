
import React from 'react';
import { motion } from 'framer-motion';

const SelectionCard = ({ icon, title, description, selected, onSelect, imageDescription, altText }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--primary) / 0.1)" }}
    transition={{ type: "spring", stiffness: 300 }}
    className={`rounded-xl border-2 bg-card text-card-foreground shadow-lg cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${selected ? 'border-primary ring-2 ring-primary shadow-primary/30' : 'border-border hover:border-primary/50'}`}
    onClick={onSelect}
  >
    <div className="relative h-48 w-full">
      <img  alt={altText} className="absolute inset-0 w-full h-full object-cover" src="https://images.unsplash.com/photo-1694388001616-1176f534d72f" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <div className="flex items-center mb-1">
          {React.cloneElement(icon, { className: "h-7 w-7 text-white mr-2.5 flex-shrink-0" })}
          <h3 className="text-xl font-bold text-white truncate">{title}</h3>
        </div>
      </div>
    </div>
    {description && (
      <div className="p-4 bg-card border-t border-border">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    )}
  </motion.div>
);

export default SelectionCard;
  