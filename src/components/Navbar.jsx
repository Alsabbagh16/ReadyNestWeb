
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ShieldCheck } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext"; 

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout: userLogout, loading: userLoading } = useAuth();
  const { isAdmin, logout: adminLogout, loading: adminLoading } = useAdminAuth(); 
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/#our-values" }, 
    { name: "Pricing", href: "/#pricing" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "FAQ", href: "/#faq" },
    { name: "Contact", href: "/contact" },
  ];

  const handleHashLinkClick = (hash) => {
    setIsMenuOpen(false);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80, 
            behavior: 'smooth'
          });
        }
      }, 0);
    } else {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    if (isAdmin) {
        await adminLogout();
    } else if (user) {
        await userLogout();
    }
    navigate('/'); 
  };

  const isLoading = userLoading || adminLoading;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm shadow-sm">
      {isAdmin && (
         <div className="bg-accent text-accent-foreground text-xs font-semibold text-center py-1">
            ADMIN MODE ACTIVE
         </div>
      )}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
             <Link to="/" className="flex items-center space-x-2" onClick={() => handleHashLinkClick('')}>
               <span className="text-primary text-2xl font-bold">ReadyNest</span>
             </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => handleHashLinkClick(link.href.includes('#') ? link.href.substring(link.href.indexOf('#')) : '')}
                className="text-sm text-gray-700 hover:text-primary font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
             {isAdmin ? (
               <>
                  <Button asChild variant="secondary" size="sm">
                      <Link to="/admin-dashboard" className="flex items-center">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
               </>
             ) : user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoading}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link to="/book">Book Now</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Login / Register</Link>
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-700 hover:text-primary font-medium py-2 transition-colors duration-200"
                    onClick={() => handleHashLinkClick(link.href.includes('#') ? link.href.substring(link.href.indexOf('#')) : '')}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col space-y-3 pt-4 border-t">
                 {isAdmin ? (
                   <>
                     <Button asChild variant="secondary" onClick={() => setIsMenuOpen(false)}>
                       <Link to="/admin-dashboard" className="flex items-center justify-center">
                         <ShieldCheck className="mr-2 h-4 w-4" /> Admin Panel
                       </Link>
                     </Button>
                     <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
                       <LogOut className="mr-2 h-4 w-4" /> Logout
                     </Button>
                   </>
                 ) : user ? (
                  <>
                    <Button asChild variant="ghost" onClick={() => setIsMenuOpen(false)}>
                      <Link to="/dashboard" className="flex items-center justify-center">
                         <User className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
                       <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" onClick={() => setIsMenuOpen(false)}>
                      <Link to="/book">Book Now</Link>
                    </Button>
                     <Button asChild onClick={() => setIsMenuOpen(false)}>
                       <Link to="/auth">Login / Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
