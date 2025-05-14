
import React from "react";
import { motion } from "framer-motion";
import { testimonials } from "@/lib/services";
import { Star } from "lucide-react";

const Testimonials = () => {
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

  return (
    <section id="testimonials" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-left max-w-3xl mx-auto mb-12 md:mb-16 md:text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600">
            Hear directly from clients who trust ReadyNest for their cleaning needs.
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card bg-background rounded-xl overflow-hidden shadow-lg p-6 border border-gray-100 flex flex-col"
              variants={itemVariants}
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                   <img  alt={`${testimonial.name} avatar`} class="w-12 h-12 rounded-full object-cover" src="https://images.unsplash.com/photo-1665113361900-b9720957d41a" />
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-base">{testimonial.name}</h4>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-accent fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm md:text-base flex-grow">{testimonial.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
  