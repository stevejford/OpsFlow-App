'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbNavProps {
  homeHref?: string;
  customCrumbs?: {
    label: string;
    path: string;
    isLast?: boolean;
  }[];
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ 
  homeHref = '/dashboard',
  customCrumbs
}) => {
  const pathname = usePathname();
  
  // Using our custom Icon component instead of Feather icons
  
  // Generate breadcrumbs based on current path or use custom crumbs
  const breadcrumbs = customCrumbs || (() => {
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
  })();

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href={homeHref} className="text-gray-500 hover:text-gray-700">
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
  );
};
