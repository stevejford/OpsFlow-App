import React from 'react';
import Icon from '@/components/ui/Icon';

interface LicenseStatsProps {
  totalLicenses: number;
  activeLicenses: number;
  expiringSoon: number;
  expired: number;
}

export default function LicenseStats({ 
  totalLicenses, 
  activeLicenses, 
  expiringSoon, 
  expired 
}: LicenseStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="fas fa-certificate" className="text-blue-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Total Licenses</p>
            <p className="text-2xl font-bold text-gray-900">{totalLicenses}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="fas fa-check-circle" className="text-green-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeLicenses}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Icon name="fas fa-exclamation-triangle" className="text-yellow-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <p className="text-2xl font-bold text-yellow-600">{expiringSoon}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Icon name="fas fa-times-circle" className="text-red-600 text-xl" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="text-2xl font-bold text-red-600">{expired}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
