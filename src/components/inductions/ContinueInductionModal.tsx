'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';

interface ContinueInductionModalProps {
  induction?: Induction;
  onClose?: () => void;
  onContinue?: (inductionId: string, progress: number) => Promise<boolean>;
  returnUrl?: string;
}

export default function ContinueInductionModal({
  induction,
  onClose,
  onContinue,
  returnUrl = '/induction-tracking'
}: ContinueInductionModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const continueId = searchParams.get('continue');
  
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize progress when induction prop changes
  useEffect(() => {
    if (induction) {
      setProgress(induction.progress || 0);
    }
  }, [induction]);

  // Handle close action
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push(returnUrl);
    }
  };

  // Handle progress change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(parseInt(e.target.value));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!induction?.id) {
        toast.error('Induction ID is missing');
        return;
      }

      // If onContinue prop is provided, use it
      if (onContinue) {
        const success = await onContinue(induction.id, progress);
        if (success) {
          toast.success('Induction progress updated');
          handleClose();
        }
      } else {
        // Otherwise, use the API directly
        const response = await fetch(`/api/inductions/${induction.id}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            progress, 
            notes,
            status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'scheduled'
          }),
        });

        if (response.ok) {
          toast.success('Induction progress updated');
          router.refresh();
          handleClose();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to update induction progress');
        }
      }
    } catch (error) {
      console.error('Error updating induction progress:', error);
      toast.error('An error occurred while updating the induction progress');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no continue ID or induction
  if (!continueId || (continueId && !induction)) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Continue Induction</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <Icon name="fas fa-times" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 ${
                induction?.status === 'completed' ? 'bg-green-600' : 
                induction?.status === 'in-progress' ? 'bg-blue-600' : 
                induction?.status === 'scheduled' ? 'bg-purple-600' : 
                'bg-orange-600'
              } rounded-full flex items-center justify-center mr-3`}>
                <span className="text-white text-xs font-medium">
                  {induction?.employeeName ? 
                    induction.employeeName.split(' ').map(name => name[0]).join('') : 'UE'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{induction?.employeeName || 'Unknown Employee'}</p>
                <p className="text-sm text-gray-600">{induction?.type || 'Unknown Induction'}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-700 mb-2">Current Progress: {induction?.progress || 0}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`${
                    induction?.status === 'completed' ? 'bg-green-600' : 
                    induction?.status === 'in-progress' ? 'bg-blue-600' : 
                    induction?.status === 'scheduled' ? 'bg-gray-400' : 
                    'bg-orange-600'
                  } h-2 rounded-full`} 
                  style={{ width: `${induction?.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Progress: {progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={handleProgressChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Progress Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add notes about the progress..."
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
