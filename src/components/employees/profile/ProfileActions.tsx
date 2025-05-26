import React from 'react';
import Link from 'next/link';

interface ProfileActionsProps {
  employeeId: string;
}

export default function ProfileActions({ employeeId }: ProfileActionsProps) {
  return (
    <div className="flex items-center space-x-3">
      <Link 
        href={`/employees/${employeeId}/edit`}
        className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded text-sm font-medium transition-colors shadow-md flex items-center text-white"
      >
        <i data-feather="edit" className="h-4 w-4 inline mr-1"></i>
        <span>Edit Profile</span>
      </Link>
      <button className="bg-green-500 hover:bg-green-400 px-4 py-2 rounded text-sm font-medium transition-colors shadow-md flex items-center text-white">
        <i data-feather="download" className="h-4 w-4 inline mr-1"></i>
        <span>Export</span>
      </button>
    </div>
  );
}
