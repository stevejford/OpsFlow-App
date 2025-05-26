"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';

const InventorySidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <div id="sidebar" className={`sidebar fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-50 ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <div className="sidebar-text ml-3">
            <h1 className="text-lg font-bold text-gray-900">OpsFlow</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
        <button onClick={toggleSidebar} className={`menu-toggle p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${collapsed ? 'rotated' : ''}`}>
          <Icon name="fas fa-chevron-left" className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {/* Dashboard */}
          <Link href="/dashboard" className={`sidebar-item flex items-center px-3 py-2.5 rounded-lg ${isActive('/dashboard') ? 'active' : 'text-gray-700'}`}>
            <Icon name="fas fa-home" className="h-5 w-5 flex-shrink-0" />
            <span className="sidebar-text ml-3 font-medium">Dashboard</span>
          </Link>

          {/* HR Management Section */}
          <div className="pt-4">
            <div className="flex items-center px-3 py-2">
              <Icon name="fas fa-users" className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="sidebar-text ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">HR Management</span>
            </div>
            <div className="mt-2 space-y-1 ml-2">
              <Link href="/employees" className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/employees') ? 'active' : 'text-gray-700'}`}>
                <Icon name="fas fa-user-plus" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Employee Profiles</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <Icon name="fas fa-award" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">License Tracking</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <Icon name="fas fa-shield-alt" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Credentials Vault</span>
              </Link>
              <Link href="/tasks" className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/tasks') ? 'active' : 'text-gray-700'}`}>
                <Icon name="fas fa-tasks" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Task Management</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <Icon name="fas fa-folder" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Documents</span>
              </Link>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="pt-4">
            <div className="flex items-center px-3 py-2">
              <Icon name="fas fa-boxes" className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="sidebar-text ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Inventory</span>
            </div>
            <div className="mt-2 space-y-1 ml-2">
              <Link href="/inventory/search" className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/inventory/search') ? 'active' : 'text-gray-700'}`}>
                <Icon name="fas fa-search" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Inventory Search</span>
              </Link>
              <Link href="/inventory/add" className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/inventory/add') ? 'active' : 'text-gray-700'}`}>
                <Icon name="fas fa-plus-circle" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Add Products</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <Icon name="fas fa-exclamation-triangle" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Low Stock Alerts</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <Icon name="fas fa-chart-bar" className="h-4 w-4 flex-shrink-0" />
                <span className="sidebar-text ml-3">Reports</span>
              </Link>
            </div>
          </div>

          {/* Settings Section */}
          <div className="pt-6">
            <Link href="#" className="sidebar-item flex items-center px-3 py-2.5 rounded-lg text-gray-700">
              <Icon name="fas fa-cog" className="h-5 w-5 flex-shrink-0" />
              <span className="sidebar-text ml-3 font-medium">Settings</span>
            </Link>
            <Link href="#" className="sidebar-item flex items-center px-3 py-2.5 rounded-lg text-gray-700">
              <Icon name="fas fa-question-circle" className="h-5 w-5 flex-shrink-0" />
              <span className="sidebar-text ml-3 font-medium">Help & Support</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="sidebar-text ml-3 flex-1 overflow-hidden">
            <div className="text-sm font-medium text-gray-900 truncate">John Doe</div>
            <div className="text-xs text-gray-500 truncate">Admin</div>
          </div>
          <button className="sidebar-text flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
            <Icon name="fas fa-sign-out-alt" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventorySidebar;
