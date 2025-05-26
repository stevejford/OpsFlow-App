'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';
import { toast } from 'sonner';

interface RescheduleInductionModalProps {
  induction: Induction;
  returnUrl?: string;
}

export default function RescheduleInductionModal({
  induction,
  returnUrl = '/induction-tracking'
}: RescheduleInductionModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if modal should be shown based on URL params
  const showModal = searchParams.get('reschedule') === induction.id;
  
  useEffect(() => {
    if (induction) {
      setDueDate(induction.dueDate);
    }
  }, [induction]);
  
  // Close modal by removing the query parameter
  const handleClose = () => {
    router.push(returnUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/inductions/${induction.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dueDate }),
      });
      
      if (response.ok) {
        toast.success('Induction rescheduled successfully');
        router.push(returnUrl);
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reschedule induction');
      }
    } catch (error) {
      console.error('Error rescheduling induction:', error);
      toast.error('An error occurred while rescheduling the induction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Reschedule Induction</h2>
          <button 
            onClick={handleClose}
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
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon name="fas fa-spinner fa-spin" className="mr-2" />
                  Rescheduling...
                </>
              ) : (
                'Reschedule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
