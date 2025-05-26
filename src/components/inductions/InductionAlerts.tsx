'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { AlertInduction } from '@/lib/data/inductions';

interface InductionAlertsProps {
  criticalInductions: AlertInduction[];
  onRemind: (inductionId: string) => void;
  onReschedule: (inductionId: string) => void;
}

export default function InductionAlerts({ 
  criticalInductions, 
  onRemind, 
  onReschedule 
}: InductionAlertsProps) {
  if (criticalInductions.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
      <div className="flex items-start">
        <Icon name="fas fa-clock" className="text-orange-500 text-xl mr-4 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">Overdue Training Alerts</h3>
          <div className="space-y-2">
            {criticalInductions.map(induction => (
              <div key={induction.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-200">
                <div>
                  <span className="font-medium text-orange-900">
                    {induction.employeeName} - {induction.type}
                  </span>
                  <span className="text-orange-700 text-sm ml-2">
                    Due {induction.daysOverdue} days ago ({induction.dueDate})
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                    onClick={() => onRemind(induction.id)}
                  >
                    Remind
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    onClick={() => onReschedule(induction.id)}
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
