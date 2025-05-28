"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { AppNavbar } from '@/components/layout';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="h-screen sticky top-0">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <AppNavbar 
          showBreadcrumbs={false} 
        />
        <main className="flex-1 px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
