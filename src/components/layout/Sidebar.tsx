import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type MenuItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  items?: MenuItem[];
};

type MenuCategory = {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    hr: true,
    inventory: false,
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const menuCategories: MenuCategory[] = [
    {
      title: 'HR Management',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      items: [
        {
          title: 'Employees',
          href: '/employees',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          ),
        },
        {
          title: 'License Tracking',
          href: '/license-tracking',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          ),
        },
        {
          title: 'Induction Tracking',
          href: '/induction-tracking',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          ),
        },
        {
          title: 'Credentials Vault',
          href: '/credentials',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <circle cx="12" cy="16" r="1"></circle>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          ),
        },
        {
          title: 'Task Management',
          href: '/tasks',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
          ),
        },
        {
          title: 'Documents',
          href: '/documents',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          ),
        },
        {
          title: 'Settings',
          href: '/settings',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Inventory',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
      items: [
        {
          title: 'Inventory Search',
          href: '/inventory',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          ),
        },
        {
          title: 'Add Products',
          href: '/inventory/add',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          ),
        },
        {
          title: 'Low Stock Alerts',
          href: '/inventory/alerts',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ),
        },
        {
          title: 'Reports',
          href: '/reports',
          icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          ),
        },
      ],
    },
  ];

  // Auto-expand category if current path matches any item in the category
  useEffect(() => {
    const newState = { ...openCategories };
    let shouldUpdate = false;

    menuCategories.forEach((category, index) => {
      const hasActiveItem = category.items.some(item => pathname.startsWith(item.href));
      const categoryKey = index === 0 ? 'hr' : 'inventory';
      
      if (hasActiveItem && !newState[categoryKey]) {
        newState[categoryKey] = true;
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      setOpenCategories(newState);
    }
  }, [pathname]);

  return (
    <div className={cn(
      "h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800">OpsFlow</h1>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {menuCategories.map((category, index) => {
          const categoryKey = index === 0 ? 'hr' : 'inventory';
          const isOpen = openCategories[categoryKey];
          
          if (collapsed) {
            // Collapsed view - show only icons
            return (
              <div key={category.title} className="mb-2">
                <div className="flex flex-col space-y-1">
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center p-3 rounded-lg transition-colors',
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                      title={item.title}
                    >
                      {item.icon}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={category.title} className="mb-2">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors',
                  isOpen && 'font-medium',
                  category.items.some(item => isActive(item.href)) && 'text-blue-600 bg-blue-50'
                )}
              >
                <div className="flex items-center">
                  <div className="mr-3 text-gray-500">
                    {category.icon}
                  </div>
                  <span>{category.title}</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={cn('overflow-hidden transition-all duration-200', isOpen ? 'max-h-96' : 'max-h-0')}>
                <div className="py-1 pl-8">
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm rounded-lg',
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span className="mr-2 text-gray-400">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
      
      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
              SU
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">Steve User</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Collapsed user profile */}
      {collapsed && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
            SU
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
