'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';

interface InductionTableProps {
  inductions: Induction[];
  onView: (inductionId: string) => void;
  onRemind: (inductionId: string) => void;
  onContinue: (inductionId: string) => void;
  onEdit: (inductionId: string) => void;
  onStart: (inductionId: string) => void;
  onCertificate: (inductionId: string) => void;
  onArchive: (inductionId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onSelectInduction: (inductionId: string, selected: boolean) => void;
  selectedInductions: string[];
  onBulkAction: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function InductionTable({
  inductions,
  onView,
  onRemind,
  onContinue,
  onEdit,
  onStart,
  onCertificate,
  onArchive,
  onSelectAll,
  onSelectInduction,
  selectedInductions,
  onBulkAction,
  currentPage,
  totalPages,
  onPageChange
}: InductionTableProps) {
  const allSelected = inductions.length > 0 && selectedInductions.length === inductions.length;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Icon name="fas fa-check-circle" className="mr-1" />Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Icon name="fas fa-clock" className="mr-1" />In Progress
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Icon name="fas fa-calendar" className="mr-1" />Scheduled
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 alert-blink">
            <Icon name="fas fa-exclamation-triangle" className="mr-1" />
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButtons = (induction: Induction) => {
    const viewButton = (
      <button 
        className="text-blue-600 hover:text-blue-900 mr-3"
        onClick={() => onView(induction.id)}
      >
        View
      </button>
    );

    switch (induction.status) {
      case 'completed':
        return (
          <>
            {viewButton}
            <button 
              className="text-green-600 hover:text-green-900 mr-3"
              onClick={() => onCertificate(induction.id)}
            >
              Certificate
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => onArchive(induction.id)}
            >
              Archive
            </button>
          </>
        );
      case 'in-progress':
        return (
          <>
            {viewButton}
            <button 
              className="text-green-600 hover:text-green-900 mr-3"
              onClick={() => onContinue(induction.id)}
            >
              Continue
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => onEdit(induction.id)}
            >
              Edit
            </button>
          </>
        );
      case 'scheduled':
        return (
          <>
            {viewButton}
            <button 
              className="text-purple-600 hover:text-purple-900 mr-3"
              onClick={() => onStart(induction.id)}
            >
              Start
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => onEdit(induction.id)}
            >
              Edit
            </button>
          </>
        );
      case 'overdue':
        return (
          <>
            {viewButton}
            <button 
              className="text-orange-600 hover:text-orange-900 mr-3"
              onClick={() => onRemind(induction.id)}
            >
              Remind
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => onEdit(induction.id)}
            >
              Edit
            </button>
          </>
        );
      default:
        return viewButton;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">All Inductions ({inductions.length})</h2>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="rounded border-gray-300"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
            <span className="text-sm text-gray-600">Select All</span>
            <button 
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              onClick={onBulkAction}
              disabled={selectedInductions.length === 0}
            >
              Bulk Action
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inductions.map(induction => (
              <tr key={induction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedInductions.includes(induction.id)}
                    onChange={(e) => onSelectInduction(induction.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 ${induction.status === 'completed' ? 'bg-green-600' : 
                                            induction.status === 'in-progress' ? 'bg-blue-600' : 
                                            induction.status === 'scheduled' ? 'bg-purple-600' : 
                                            'bg-orange-600'} rounded-full flex items-center justify-center mr-3`}>
                      <span className="text-white text-xs font-medium">
                        {induction.employeeName.split(' ').map(name => name[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{induction.employeeName}</div>
                      <div className="text-sm text-gray-500">{induction.employeePosition}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{induction.type}</div>
                  <div className="text-sm text-gray-500">{induction.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{induction.scheduledDate}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{induction.dueDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`${
                          induction.status === 'completed' ? 'bg-green-600' : 
                          induction.status === 'in-progress' ? 'bg-blue-600' : 
                          induction.status === 'scheduled' ? 'bg-gray-400' : 
                          'bg-orange-600'
                        } h-2 rounded-full progress-bar`} 
                        style={{ width: `${induction.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{induction.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(induction.status)}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {getActionButtons(induction)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {inductions.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, inductions.length)} of {inductions.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} rounded text-sm`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            const page = i + 1;
            return (
              <button 
                key={page}
                className={`px-3 py-1 ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'} rounded text-sm`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            );
          })}
          
          <button 
            className={`px-3 py-1 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} rounded text-sm`}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
