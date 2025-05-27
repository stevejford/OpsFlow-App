'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { formatExpirationDate } from '@/lib/utils/dateFormats';

export interface AlertLicense {
  id: string;
  employeeName: string;
  licenseName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  isExpired: boolean;
}

interface LicenseAlertsProps {
  criticalLicenses: AlertLicense[];
  onNotify: (licenseId: string) => void;
}

export default function LicenseAlerts({ criticalLicenses, onNotify }: LicenseAlertsProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (criticalLicenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
      <div className="flex items-start">
        <Icon name="fas fa-exclamation-triangle" className="text-red-500 text-xl mr-4 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Critical License Alerts</h3>
          <div className="space-y-2">
            {criticalLicenses.map((license) => (
              <div key={license.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200">
                <div>
                  <span className="font-medium text-red-900">{license.employeeName} - {license.licenseName}</span>
                  <span className="text-red-700 text-sm ml-2">
                    {isClient ? (
                      license.isExpired 
                        ? `Expired ${Math.abs(license.daysUntilExpiry)} days ago`
                        : formatExpirationDate(license.expiryDate)
                    ) : (
                      // Fallback for server rendering - use a simple format
                      license.isExpired 
                        ? `Expired ${Math.abs(license.daysUntilExpiry)} days ago`
                        : `Expires in ${license.daysUntilExpiry} days`
                    )}
                  </span>
                </div>
                <button 
                  onClick={() => onNotify(license.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  {license.isExpired ? 'Urgent' : 'Notify'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
