
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, CreditCard, MapPin, History, LogOut } from 'lucide-react';
import AccountInfoTab from '@/components/Dashboard/AccountInfoTab';
import CurrentPlanTab from '@/components/Dashboard/CurrentPlanTab';
import PurchaseHistoryTab from '@/components/Dashboard/PurchaseHistoryTab';
import AddressesTab from '@/components/Dashboard/AddressesTab';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  const { user, profile, credits, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    console.log(`[DashboardPage] AuthLoading: ${authLoading}, User: ${user ? user.id : 'null'}, Profile: ${profile ? profile.id : 'null'}`);
    if (!authLoading && (user || profile)) {
      setLocalLoading(false);
    } else if (!authLoading && !user && !profile) {
       // If auth is done loading and there's no user/profile (e.g. after logout), also stop local loading
      setLocalLoading(false);
    }
  }, [authLoading, user, profile]);


  const tabs = [
    { id: 'account', label: 'Account Information', icon: User, component: <AccountInfoTab /> },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, component: <AddressesTab /> },
    { id: 'plan', label: 'Current Plan', icon: CreditCard, component: <CurrentPlanTab /> },
    { id: 'history', label: 'Purchase History', icon: History, component: <PurchaseHistoryTab /> },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (localLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="text-xl font-semibold">Loading Your Dashboard Data...</div>
      </div>
    );
  }
  
  if (!user && !profile) {
     return (
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <p className="text-xl font-semibold mb-4">You are not logged in.</p>
        <Button onClick={() => window.location.href = '/auth'}>Go to Login</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-10rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-8"
      >
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mb-6">
             <h2 className="text-lg font-semibold mb-1">Welcome, {profile?.first_name || user?.email || 'User'}!</h2>
             <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
             <div className="bg-primary/10 text-primary font-bold text-center py-2 px-3 rounded text-sm">
               Credits Available: {credits ?? 0}
             </div>
          </div>

          <nav className="space-y-1 bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-gray-100 shadow-sm">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${activeTab === tab.id ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                disabled={authLoading}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
             <Button
                variant='ghost'
                className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={logout}
                disabled={authLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
          </nav>
        </div>

        <div className="flex-1">
          <motion.div
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
          >
            {authLoading ? <div className="p-6 text-center">Loading tab content...</div> : ActiveComponent}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
  