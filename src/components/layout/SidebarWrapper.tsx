"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { AppNavbar } from '@/components/layout';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Define the event name constants
  const TOGGLE_SIDEBAR_EVENT = 'toggle-sidebar';
  const TOGGLE_MOBILE_MENU_EVENT = 'toggle-mobile-menu';
  
  // Set up event listeners
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };
    
    const handleToggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };
    
    // Add event listeners
    window.addEventListener(TOGGLE_SIDEBAR_EVENT, handleToggleSidebar);
    window.addEventListener(TOGGLE_MOBILE_MENU_EVENT, handleToggleMobileMenu);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener(TOGGLE_SIDEBAR_EVENT, handleToggleSidebar);
      window.removeEventListener(TOGGLE_MOBILE_MENU_EVENT, handleToggleMobileMenu);
    };
  }, [sidebarCollapsed, mobileMenuOpen]);

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={TOGGLE_SIDEBAR_EVENT} 
      />
      
      {/* Main Content */}
      <div className={`main-content w-full ${sidebarCollapsed ? 'expanded' : ''}`}>
        <AppNavbar 
          showBreadcrumbs={false} 
          onToggleSidebar={TOGGLE_SIDEBAR_EVENT}
        />
        <main className="px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
