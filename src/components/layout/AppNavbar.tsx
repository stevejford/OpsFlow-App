'use client';

import React, { useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';

interface AppNavbarProps {
  title?: string;
  actions?: React.ReactNode;
  tabs?: {
    id: string;
    label: string;
    active: boolean;
    onClick: () => void;
  }[];
  showBreadcrumbs?: boolean;
  onToggleSidebar?: string; // Using a string event name for serialization
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ 
  title,
  actions,
  tabs,
  showBreadcrumbs = true,
  onToggleSidebar
}) => {
  const { isSignedIn } = useAuth();
  // No need for Feather icons initialization since we're using our custom Icon component

  const pathname = usePathname();
  
  // Define main navigation items
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Employees", href: "/employees" },
    { name: "Tasks", href: "/tasks" },
  ];
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    if (!pathname) return [];
    
    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    return segments.map((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format the segment for display (capitalize, replace hyphens)
      const formattedSegment = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      return {
        label: formattedSegment,
        path: currentPath,
        isLast: index === segments.length - 1
      };
    });
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="bg-white shadow">
      {/* Single Integrated Navbar */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo and Main Navigation */}
            <div className="flex items-center">
              {onToggleSidebar && (
                <button 
                  onClick={() => {
                    // Dispatch a custom event that the sidebar can listen for
                    const event = new CustomEvent(onToggleSidebar);
                    window.dispatchEvent(event);
                  }}
                  className="mr-4 p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center relative z-50"
                  aria-label="Toggle Sidebar"
                  style={{ position: 'absolute', left: '16px' }}
                >
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Link href="/dashboard" className="flex-shrink-0 py-4">
                <span className="text-xl font-bold">OpsFlow</span>
              </Link>
            </div>
            
            {/* Main Navigation Links */}
            <div className="hidden md:flex h-full">
              {navItems.map((item) => {
                const isActive = 
                  (item.href === "/dashboard" && pathname === "/dashboard") || 
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className={`px-5 py-4 transition-colors ${isActive 
                      ? "text-white bg-blue-700 border-b-2 border-white" 
                      : "text-blue-100 hover:text-white hover:bg-blue-700 border-transparent border-b-2"}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Icon name="fas fa-bell" className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-blue-700 transition-colors">
                <Icon name="fas fa-question-circle" className="h-5 w-5" />
              </button>
              {isSignedIn ? (
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8"
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">JS</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation - Now part of the main navbar */}
      {tabs && (
        <div className="bg-blue-500 border-b border-blue-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-x-auto">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    tab.active 
                      ? 'text-white border-b-2 border-white' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-600 border-b-2 border-transparent'
                  }`}
                  onClick={tab.onClick}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumbs and Action Buttons - Only shown when showBreadcrumbs is true */}
      {showBreadcrumbs && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                        <Icon name="fas fa-home" className="h-4 w-4" />
                      </Link>
                    </li>
                    
                    {breadcrumbs.map((crumb, index) => (
                      <li key={`${crumb.path}-${index}`} className="flex items-center">
                        <Icon name="fas fa-chevron-right" className="h-4 w-4 text-gray-400 mx-1" />
                        {crumb.isLast ? (
                          <span className="text-sm font-medium text-gray-800">{crumb.label}</span>
                        ) : (
                          <Link 
                            href={crumb.path} 
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                          >
                            {crumb.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
                
                {title && (
                  <div className="ml-4">
                    <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
