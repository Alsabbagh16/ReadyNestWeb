
import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { motion } from 'framer-motion';
import { Users, ShoppingCart, Briefcase, LogOut, ListChecks, Settings2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminMyAccountTab from '@/components/AdminDashboard/AdminMyAccountTab';
import RegisteredAccountsTab from '@/components/AdminDashboard/RegisteredAccountsTab';
import RecentPurchasesTab from '@/components/AdminDashboard/RecentPurchasesTab';
import EmployeesTab from '@/components/AdminDashboard/EmployeesTab';
import RecentServicesTab from '@/components/AdminDashboard/RecentServicesTab';
import ManageServicesTab from '@/components/AdminDashboard/ManageServicesTab';
import AdminPurchaseDetailPage from '@/pages/AdminPurchaseDetailPage';
import AdminJobDetailPage from '@/pages/AdminJobDetailPage'; 
import AdminCreateJobPage from '@/pages/AdminCreateJobPage'; 
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AdminServiceDetailPage from '@/pages/AdminServiceDetailPage';
import AdminEmployeeProfilePage from '@/pages/AdminEmployeeProfilePage';
import AdminUserProfilePage from '@/pages/AdminUserProfilePage';
import AdminCreateServicePage from "@/pages/AdminCreateServicePage";
import AdminEditServicePage from "@/pages/AdminEditServicePage";
import AdminCreateAddonPage from "@/pages/AdminCreateAddonPage";

const PermissionDeniedPage = () => (
  <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg shadow">
    <h2 className="text-2xl font-semibold text-red-600 mb-4">Access Denied</h2>
    <p className="text-gray-700 mb-6">You do not have permission to view this page or perform this action.</p>
    <Button asChild variant="outline">
      <Link to="/admin-dashboard">Go to Dashboard Home</Link>
    </Button>
  </div>
);


const AdminDashboardPage = () => {
  const { adminUser, adminProfile, adminLogout } = useAdminAuth();
  const location = useLocation();

  const allTabs = [
    { id: 'my-account', label: 'My Account', icon: UserCircle, path: '/admin-dashboard/my-account', component: <AdminMyAccountTab />, roles: ['admin', 'superadmin', 'staff'] },
    { id: 'accounts', label: 'Registered Accounts', icon: Users, path: '/admin-dashboard/accounts', component: <RegisteredAccountsTab />, roles: ['admin', 'superadmin'] },
    { id: 'purchases', label: 'Recent Purchases', icon: ShoppingCart, path: '/admin-dashboard/purchases', component: <RecentPurchasesTab />, roles: ['admin', 'superadmin'] },
    { id: 'jobs', label: 'Jobs', icon: ListChecks, path: '/admin-dashboard/jobs', component: <RecentServicesTab />, roles: ['admin', 'superadmin', 'staff'] },
    { id: 'employees', label: 'Employees', icon: Briefcase, path: '/admin-dashboard/employees', component: <EmployeesTab />, roles: ['admin', 'superadmin'] },
    { id: 'manage-services', label: 'Create/Edit Services', icon: Settings2, path: '/admin-dashboard/manage-services', component: <ManageServicesTab />, roles: ['admin', 'superadmin'] },
  ];

  const [visibleTabs, setVisibleTabs] = useState([]);
  
  useEffect(() => {
    if (adminProfile) {
      const filteredTabs = allTabs.filter(tab => tab.roles.includes(adminProfile.role));
      setVisibleTabs(filteredTabs);
    }
  }, [adminProfile]);

  const getCurrentTabId = () => {
    const pathSegments = location.pathname.split('/');
    const currentTabSlug = pathSegments[2];

    if (currentTabSlug === 'service' && pathSegments[3] && pathSegments[2] !== 'manage-services') return 'jobs'; 
    if (currentTabSlug === 'job' && pathSegments[3] && pathSegments[3] !== 'create') return 'jobs'; 
    if (currentTabSlug === 'job' && pathSegments[3] === 'create') return 'jobs'; 
    if (currentTabSlug === 'employee') return 'employees';
    if (currentTabSlug === 'user') return 'accounts';
    if (currentTabSlug === 'purchase' && pathSegments[3]) return 'purchases';
    
    const tabExists = visibleTabs.find(tab => tab.id === currentTabSlug);
    return tabExists ? currentTabSlug : (visibleTabs.length > 0 ? visibleTabs[0].id : '');
  };
  
  const [activeTabId, setActiveTabId] = useState(getCurrentTabId());

  useEffect(() => {
     setActiveTabId(getCurrentTabId());
  }, [location.pathname, visibleTabs]);

  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments[2] === 'service' && pathSegments[3] && pathSegments[2] !== 'manage-services') return 'Service Details (Legacy)';
    if (pathSegments[2] === 'job' && pathSegments[3] === 'create') return 'Create New Job';
    if (pathSegments[2] === 'job' && pathSegments[3]) return 'Job Details';
    if (pathSegments[2] === 'employee' && pathSegments[3]) return 'Employee Profile';
    if (pathSegments[2] === 'user' && pathSegments[3]) return 'User Profile';
    if (pathSegments[2] === 'purchase' && pathSegments[3]) return 'Purchase Details';
    if (pathSegments[2] === 'manage-services' && pathSegments[3] === 'create-service') return 'Create New Service';
    if (pathSegments[2] === 'manage-services' && pathSegments[3] === 'edit-service' && pathSegments[4]) return 'Edit Service';
    if (pathSegments[2] === 'manage-services' && pathSegments[3] === 'create-addon') return 'Create New Add-on';
    
    const currentActiveTabInfo = visibleTabs.find(tab => tab.id === activeTabId);
    return currentActiveTabInfo?.label || 'Admin Dashboard';
  };

  if (visibleTabs.length === 0 && adminProfile) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <p className="text-xl text-gray-700">No accessible tabs for your role.</p>
            <Button onClick={adminLogout} className="mt-4">Logout</Button>
        </div>
    );
  }
   if (visibleTabs.length === 0 && !adminProfile) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard permissions...</div>;
  }


  const isSpecialPage = (pathname) => {
    const specialPatterns = [
      '/admin-dashboard/purchase/',
      '/admin-dashboard/job/', 
      '/admin-dashboard/create-', 
      '/admin-dashboard/edit-'   
    ];
    return specialPatterns.some(pattern => pathname.startsWith(pattern)) || pathname.includes('/create/') || pathname.includes('/edit/');
  };
  
  const canAccessRoute = (roles) => {
    if (!adminProfile) return false;
    return roles.includes(adminProfile.role);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold text-primary">ReadyNest</Link>
          <p className="text-xs text-gray-400 mt-1">Admin Panel ({adminProfile?.role})</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTabId === tab.id && !isSpecialPage(location.pathname) ? 'secondary' : 'ghost'}
              className={`w-full justify-start text-white hover:bg-gray-700 ${activeTabId === tab.id && !isSpecialPage(location.pathname) ? 'bg-gray-700' : ''}`}
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

      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="bg-white shadow-sm p-4 flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-800">
                {getPageTitle()}
            </h1>
         </header>
         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <motion.div
             key={location.pathname}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
            >
              <Routes>
                  {visibleTabs.map(tab => (
                      <Route key={tab.id} path={tab.id} element={
                          <div className="bg-white rounded-lg shadow overflow-hidden">
                              {tab.component}
                          </div>
                      }/>
                  ))}
                  <Route path="service/:id" element={<AdminServiceDetailPage />}/> 
                  <Route path="employee/:id" element={canAccessRoute(['admin', 'superadmin', 'staff']) ? <AdminEmployeeProfilePage /> : <PermissionDeniedPage />} />
                  
                  <Route path="user/:id" element={canAccessRoute(['admin', 'superadmin']) ? <AdminUserProfilePage /> : <PermissionDeniedPage />} />
                  
                  <Route path="purchase/:purchaseRefId" element={canAccessRoute(['admin', 'superadmin']) ? <AdminPurchaseDetailPage /> : <PermissionDeniedPage />} />
                  
                  <Route path="job/create" element={canAccessRoute(['admin', 'superadmin']) ? <AdminCreateJobPage /> : <PermissionDeniedPage />} />
                  <Route path="job/:jobRefId" element={canAccessRoute(['admin', 'superadmin', 'staff']) ? <AdminJobDetailPage /> : <PermissionDeniedPage />} />
                  
                  <Route path="manage-services/create-service" element={canAccessRoute(['admin', 'superadmin']) ? <AdminCreateServicePage /> : <PermissionDeniedPage />} />
                  <Route path="manage-services/edit-service/:productId" element={canAccessRoute(['admin', 'superadmin']) ? <AdminEditServicePage /> : <PermissionDeniedPage />} />
                  <Route path="manage-services/create-addon" element={canAccessRoute(['admin', 'superadmin']) ? <AdminCreateAddonPage /> : <PermissionDeniedPage />} />

                   <Route index element={<Navigate to={visibleTabs.length > 0 ? visibleTabs[0].path : '/admin-panel'} replace />} />
                   <Route path="*" element={<Navigate to={visibleTabs.length > 0 ? visibleTabs[0].path : '/admin-panel'} replace />} />
              </Routes>
            </motion.div>
         </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
