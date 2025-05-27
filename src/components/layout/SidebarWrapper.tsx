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
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AppNavbar 
          showBreadcrumbs={false} 
        />
        <main className="flex-1 px-6 py-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
