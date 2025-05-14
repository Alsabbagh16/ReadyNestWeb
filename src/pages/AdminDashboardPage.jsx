
import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { motion } from 'framer-motion';
import { Users, ShoppingCart, Briefcase, LogOut, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RegisteredAccountsTab from '@/components/AdminDashboard/RegisteredAccountsTab';
import RecentPurchasesTab from '@/components/AdminDashboard/RecentPurchasesTab';
import EmployeesTab from '@/components/AdminDashboard/EmployeesTab';
import RecentServicesTab from '@/components/AdminDashboard/RecentServicesTab';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AdminServiceDetailPage from '@/pages/AdminServiceDetailPage';
import AdminEmployeeProfilePage from '@/pages/AdminEmployeeProfilePage';
import AdminUserProfilePage from '@/pages/AdminUserProfilePage'; // Import User Profile Page

const AdminDashboardPage = () => {
  const { adminUser, adminLogout } = useAdminAuth();
  const location = useLocation();

  const getCurrentTab = () => {
      const pathSegments = location.pathname.split('/');
      const mainPath = pathSegments[2] || 'accounts'; // Default to accounts
      if (mainPath === 'service') return 'jobs'; // Changed from 'services' to 'jobs'
      if (mainPath === 'employee') return 'employees';
      if (mainPath === 'user') return 'accounts'; // Highlight accounts tab when viewing user profile
      return mainPath;
  };
  const [activeTab, setActiveTab] = useState(getCurrentTab());

  const tabs = [
    { id: 'accounts', label: 'Registered Accounts', icon: Users, path: '/admin-dashboard/accounts', component: <RegisteredAccountsTab /> },
    { id: 'purchases', label: 'Recent Purchases', icon: ShoppingCart, path: '/admin-dashboard/purchases', component: <RecentPurchasesTab /> },
    { id: 'jobs', label: 'Jobs', icon: ListChecks, path: '/admin-dashboard/jobs', component: <RecentServicesTab /> }, // Changed label from 'Recent Services'
    { id: 'employees', label: 'Employees', icon: Briefcase, path: '/admin-dashboard/employees', component: <EmployeesTab /> },
  ];

  // Update activeTab state if location changes
   React.useEffect(() => {
        setActiveTab(getCurrentTab());
    }, [location.pathname]);

  const ActiveTabInfo = tabs.find(tab => tab.id === activeTab);

  const getPageTitle = () => {
      const pathSegments = location.pathname.split('/');
      if (pathSegments[2] === 'service' && pathSegments[3]) return 'Service Details';
      if (pathSegments[2] === 'employee' && pathSegments[3]) return 'Employee Profile';
      if (pathSegments[2] === 'user' && pathSegments[3]) return 'User Profile'; // Title for user profile
      if (activeTab === 'jobs' && pathSegments[2] === 'jobs') return 'Jobs'; // Ensure "Jobs" title for the Jobs tab
      return ActiveTabInfo?.label || 'Admin Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold text-primary">ReadyNest</Link>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-white hover:bg-gray-700 ${activeTab === tab.id ? 'bg-gray-700' : ''}`}
              asChild
            >
             <Link to={tab.path}>
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.label}
             </Link>
            </Button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
           <p className="text-sm text-gray-400 mb-2 truncate">Logged in as: {adminUser?.email}</p>
           <Button
              variant='ghost'
              className="w-full justify-start text-red-400 hover:bg-red-900/50 hover:text-red-300"
              onClick={adminLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="bg-white shadow-sm p-4 flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-800">
                {getPageTitle()}
            </h1>
         </header>
         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <motion.div
             key={location.pathname} // Animate based on the full path for route changes
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
            >
              {/* Nested Routes for Tabs and Detail Pages */}
              <Routes>
                  {tabs.map(tab => (
                      <Route key={tab.id} path={tab.id} element={
                          <div className="bg-white rounded-lg shadow overflow-hidden">
                              {tab.component}
                          </div>
                      }/>
                  ))}
                  <Route path="service/:id" element={<AdminServiceDetailPage />}/> {/* Keep service for URL, but points to jobs tab */}
                  <Route path="employee/:id" element={<AdminEmployeeProfilePage />}/>
                  <Route path="user/:id" element={<AdminUserProfilePage />}/> {/* User Profile Route */}
                   {/* Default route redirects to the first tab */}
                   <Route index element={<Navigate to={tabs[0].id} replace />} />
                   {/* Optional: Catch-all for unknown admin routes */}
                   <Route path="*" element={<Navigate to={tabs[0].id} replace />} />
              </Routes>
            </motion.div>
         </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
  