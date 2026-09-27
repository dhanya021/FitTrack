import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { MobileDrawer, BottomNav } from './MobileNav';

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
