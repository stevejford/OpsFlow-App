'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';

interface RescheduleInductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  induction: Induction | null;
  onSubmit: (inductionId: string, newDueDate: string) => void;
}

export default function RescheduleInductionModal({
  isOpen,
  onClose,
  induction,
  onSubmit
}: RescheduleInductionModalProps) {
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (induction) {
      setDueDate(induction.dueDate);
    }
  }, [induction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (induction) {
      onSubmit(induction.id, dueDate);
    }
  };

  if (!isOpen || !induction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Reschedule Induction</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <Icon name="fas fa-times" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-gray-700 mb-4">
              Rescheduling <span className="font-medium">{induction.type}</span> for <span className="font-medium">{induction.employeeName}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Due Date</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                value={induction.dueDate}
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Due Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
