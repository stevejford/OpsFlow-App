'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Employee } from '@/lib/data/employees';
import { InductionType } from '@/lib/data/inductionTypes';

interface AddInductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  inductionTypes: InductionType[];
  onSubmit: (data: {
    employeeId: string;
    type: string;
    description: string;
    scheduledDate: string;
    dueDate: string;
  }) => void;
}

export default function AddInductionModal({
  isOpen,
  onClose,
  employees,
  inductionTypes,
  onSubmit
}: AddInductionModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId,
      type,
      description,
      scheduledDate,
      dueDate
    });
    
    // Reset form
    setEmployeeId('');
    setType('');
    setDescription('');
    setScheduledDate('');
    setDueDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Induction</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <Icon name="fas fa-times" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Training Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Select Training Type</option>
                {inductionTypes.map(inductionType => (
                  <option key={inductionType.id} value={inductionType.name}>
                    {inductionType.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Description</label>
            <input 
              type="text" 
              placeholder="e.g., Workplace Safety and Emergency Procedures" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
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
              Schedule Induction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
