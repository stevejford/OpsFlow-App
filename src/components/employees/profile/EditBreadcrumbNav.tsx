"use client";

import Link from 'next/link';
import { useEffect } from 'react';

interface EditBreadcrumbNavProps {
  employeeId: string;
  employeeName: string;
}

export default function EditBreadcrumbNav({ employeeId, employeeName }: EditBreadcrumbNavProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('feather-icons').then(feather => {
        feather.default.replace();
      });
    }
  }, []);

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
            <i data-feather="home" className="h-5 w-5"></i>
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <i data-feather="chevron-right" className="h-5 w-5 text-gray-400"></i>
            <Link href="/employees" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
              Employees
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <i data-feather="chevron-right" className="h-5 w-5 text-gray-400"></i>
            <Link href={`/employees/${employeeId}`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
              {employeeName}
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <i data-feather="chevron-right" className="h-5 w-5 text-gray-400"></i>
            <span className="ml-4 text-sm font-medium text-gray-900">Edit Profile</span>
          </div>
        </li>
      </ol>
    </nav>
  );
}
