"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: string; // Using a string action name that can be serialized
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  
  // Client-side loading only - no server/client mismatch
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className={`sidebar fixed left-0 top-0 h-full shadow-lg border-r border-gray-200 z-40 ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200 h-16">
        <div className="flex items-center overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          <div className="sidebar-text ml-3">
            <h1 className="text-lg font-bold text-gray-900">OpsFlow</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 px-4">
        <div className="space-y-1">
          {/* Dashboard */}
          <Link href="/dashboard" 
            className={`sidebar-item flex items-center px-3 py-2.5 rounded-lg ${isActive('/dashboard') ? 'active text-white' : 'text-gray-700'}`}
            data-tooltip="Dashboard"
          >
            <div className="sidebar-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="sidebar-text ml-3 font-medium">Dashboard</span>
          </Link>

          {/* HR Management Section */}
          <div className="pt-4">
            <div className="flex items-center px-3 py-2">
              <div className="sidebar-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="sidebar-text ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">HR Management</span>
            </div>
            <div className="mt-2 space-y-1 ml-2">
              <Link href="/employees" 
                className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/employees') ? 'active text-white' : 'text-gray-700'}`}
                data-tooltip="Employees"
              >
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Employee Profiles</span>
              </Link>
              <Link 
                href="/license-tracking" 
                className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/license-tracking') ? 'active text-white' : 'text-gray-700'}`}
                data-tooltip="License Tracking"
              >
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">License Tracking</span>
              </Link>
              <Link 
                href="/induction-tracking" 
                className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/induction-tracking') ? 'active text-white' : 'text-gray-700'}`}
                data-tooltip="Induction Tracking"
              >
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Induction Tracking</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Credentials Vault</span>
              </Link>
              <Link href="/tasks" 
                className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/tasks') ? 'active text-white' : 'text-gray-700'}`}
                data-tooltip="Tasks"
              >
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Task Management</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Documents</span>
              </Link>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="pt-4">
            <div className="flex items-center px-3 py-2">
              <div className="sidebar-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-400">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <span className="sidebar-text ml-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Inventory</span>
            </div>
            <div className="mt-2 space-y-1 ml-2">
              <Link href="/inventory/search" 
                className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/inventory/search') ? 'active text-white' : 'text-gray-700'}`}
                data-tooltip="Inventory Search"
              >
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Inventory Search</span>
              </Link>
              <Link href="/inventory/add" 
                className={`sidebar-item flex items-center px-3 py-2 rounded-lg ${isActive('/inventory/add') ? 'active text-white' : 'text-gray-700'}`}
                data-tooltip="Add Products"
              >
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Add Products</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Low Stock Alerts</span>
              </Link>
              <Link href="#" className="sidebar-item flex items-center px-3 py-2 rounded-lg text-gray-700">
                <div className="sidebar-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <span className="sidebar-text ml-3">Reports</span>
              </Link>
            </div>
          </div>

          {/* Settings Section */}
          <div className="sidebar-section pt-6">
            <Link href="#" className="sidebar-item flex items-center px-3 py-2.5 rounded-lg text-gray-700" data-tooltip="Settings">
              <div className="sidebar-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <span className="sidebar-text ml-3 font-medium">Settings</span>
            </Link>
            <Link href="#" className="sidebar-item flex items-center px-3 py-2.5 rounded-lg text-gray-700">
              <div className="sidebar-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <span className="sidebar-text ml-3 font-medium">Help & Support</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 user-profile">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <div className="sidebar-text ml-3 flex-1 overflow-hidden">
            <div className="text-sm font-medium text-gray-900 truncate">John Doe</div>
            <div className="text-xs text-gray-500 truncate">Admin</div>
          </div>
          <button className="sidebar-text flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
            <div className="sidebar-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
