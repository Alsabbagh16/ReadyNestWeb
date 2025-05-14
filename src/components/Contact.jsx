
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Simulate sending message
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setName("");
      setEmail("");
      setMessage("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section id="contact" className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-left max-w-3xl mx-auto mb-12 md:mb-16 md:text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
          <p className="text-lg text-gray-600">
            Have questions or need a custom quote? Get in touch with our friendly team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow border border-gray-100">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-6">Get In Touch</h3>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <textarea
                  id="contact-message"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] md:min-h-[120px] mt-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <Button type="submit" className="w-full text-base py-3" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-6">Contact Information</h3>

            <div className="space-y-5 md:space-y-6">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-3 md:mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1 text-sm md:text-base">Our Location</h4>
                  <p className="text-gray-600 text-sm">123 Cleaning Street, Suite 101<br />New York, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-primary mr-3 md:mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1 text-sm md:text-base">Phone</h4>
                  <p className="text-gray-600 text-sm">(555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-5 w-5 text-primary mr-3 md:mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1 text-sm md:text-base">Email</h4>
                  <p className="text-gray-600 text-sm">info@readynest.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary mr-3 md:mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1 text-sm md:text-base">Business Hours</h4>
                  <p className="text-gray-600 text-sm">
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 h-40 md:h-48 rounded-lg overflow-hidden border border-gray-200">
               <img  alt="Bright map showing office location" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1469288205312-804b99a8d717" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
  