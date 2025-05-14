
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAdminAuth } from "@/contexts/AdminAuthContext"; // Import useAdminAuth

const Layout = () => {
  const { isAdmin } = useAdminAuth(); // Check if admin is logged in

  return (
    <div className="min-h-screen flex flex-col relative"> {/* Added relative positioning */}
      {/* The Navbar already has an "ADMIN MODE ACTIVE" banner.
          The additional "ADMIN MODE" label here was redundant. */}
      <Navbar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
  