'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';
import { format } from 'date-fns';

interface EditInductionModalProps {
  induction?: Induction;
  onClose?: () => void;
  onSave?: (updatedInduction: Partial<Induction>) => Promise<boolean>;
  returnUrl?: string;
}

export default function EditInductionModal({
  induction,
  onClose,
  onSave,
  returnUrl = '/induction-tracking'
}: EditInductionModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [formData, setFormData] = useState<Partial<Induction>>({
    type: '',
    description: '',
    status: 'scheduled',
    dueDate: '',
    progress: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when induction prop changes
  useEffect(() => {
    if (induction) {
      setFormData({
        id: induction.id,
        employeeId: induction.employeeId,
        employeeName: induction.employeeName,
        employeePosition: induction.employeePosition,
        type: induction.type,
        description: induction.description,
        status: induction.status,
        dueDate: induction.dueDate,
        scheduledDate: induction.scheduledDate,
        completedDate: induction.completedDate,
        progress: induction.progress,
        documentUrl: induction.documentUrl
      });
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

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle progress change
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({ 
      ...prev, 
      progress: value,
      // Update status based on progress
      status: value === 100 ? 'completed' : value > 0 ? 'in-progress' : 'scheduled'
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If onSave prop is provided, use it
      if (onSave) {
        const success = await onSave(formData);
        if (success) {
          toast.success('Induction updated successfully');
          handleClose();
        }
      } else {
        // Otherwise, use the API directly
        const response = await fetch(`/api/inductions/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('Induction updated successfully');
          router.refresh();
          handleClose();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to update induction');
        }
      }
    } catch (error) {
      console.error('Error updating induction:', error);
      toast.error('An error occurred while updating the induction');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no edit ID or induction
  if (!editId || (editId && !induction)) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Edit Induction</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <Icon name="fas fa-times" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Employee Info (read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <input
                type="text"
                value={formData.employeeName || ''}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
                disabled
              />
            </div>
            
            {/* Induction Type */}
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Induction Type</label>
              <input
                id="type"
                name="type"
                type="text"
                value={formData.type || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'scheduled'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            
            {/* Due Date */}
            <div className="mb-4">
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Progress */}
            <div className="mb-4">
              <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
                Progress: {formData.progress}%
              </label>
              <input
                id="progress"
                name="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress || 0}
                onChange={handleProgressChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            {/* Document URL */}
            <div className="mb-4">
              <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
              <input
                id="documentUrl"
                name="documentUrl"
                type="url"
                value={formData.documentUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/document.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
