
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import BookingPage from "@/pages/BookingPage";
import ContactPage from "@/pages/ContactPage";
import QuotePage from "@/pages/QuotePage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminCreateServicePage from "@/pages/AdminCreateServicePage"; 
import AdminCreateAddonPage from "@/pages/AdminCreateAddonPage";
import AdminEditServicePage from "@/pages/AdminEditServicePage";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage"; // Import new page
import LoadingLog from "@/components/LoadingLog";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const CenteredLoader = ({ text = "Loading..." }) => (
  <div className="flex justify-center items-center h-screen w-full">
    <div className="text-xl font-semibold">{text}</div>
  </div>
);


function ProtectedRoute({ children }) {
  const { user, loading: userAuthContextLoading } = useAuth();

  if (userAuthContextLoading || user === undefined) {
    console.log(`[ProtectedRoute] Loading... User: ${user === undefined ? 'undefined' : user?.id}, Loading: ${userAuthContextLoading}`);
    return <CenteredLoader text="Loading Your Dashboard..." />;
  }
  
  if (!user) {
    console.log('[ProtectedRoute] No user, navigating to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('[ProtectedRoute] User authenticated, rendering children.');
  return children;
}

function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading: adminOverallLoading, adminUser, adminAuthLoading } = useAdminAuth();

  if (adminOverallLoading || adminUser === undefined || adminAuthLoading) {
     console.log(`[ProtectedAdminRoute] Loading... IsAdmin: ${isAdmin}, AdminOverallLoading: ${adminOverallLoading}, AdminUser: ${adminUser === undefined ? 'undefined' : adminUser?.id }, AdminAuthLoading: ${adminAuthLoading}`);
     return <CenteredLoader text="Loading Admin Access..."/>;
  }

  if (!isAdmin || !adminUser) {
     console.log('[ProtectedAdminRoute] Not an admin or no admin user, navigating to /admin-panel');
     return <Navigate to="/admin-panel" replace />;
  }

  console.log('[ProtectedAdminRoute] Admin authenticated, rendering children.');
  return children;
}


function App() {
  return (
    <>
      <Routes>
         <Route path="/admin-panel" element={<AdminLoginPage />} />
         <Route
            path="/admin-dashboard/*" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-dashboard/create-service"
            element={
              <ProtectedAdminRoute>
                <AdminCreateServicePage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-dashboard/edit-service/:productId"
            element={
              <ProtectedAdminRoute>
                <AdminEditServicePage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin-dashboard/create-addon"
            element={
              <ProtectedAdminRoute>
                <AdminCreateAddonPage />
              </ProtectedAdminRoute>
            }
          />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="quote" element={<QuotePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="booking-confirmation" element={<BookingConfirmationPage />} /> {/* Add new route */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
           <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
      <LoadingLog />
    </>
  );
}

export default App;
