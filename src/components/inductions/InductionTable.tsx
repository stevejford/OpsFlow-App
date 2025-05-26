'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';
import { toast } from 'sonner';

interface InductionTableProps {
  inductions: Induction[];
  selectedInductions?: string[];
  currentPage?: number;
  totalPages?: number;
  baseUrl?: string;
}

export default function InductionTable({
  inductions,
  selectedInductions: initialSelectedInductions = [],
  currentPage = 1,
  totalPages = 1,
  baseUrl = '/induction-tracking',
}: InductionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for selections and employee data
  const [selectedInductions, setSelectedInductions] = useState<string[]>(initialSelectedInductions);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const [employeeData, setEmployeeData] = useState<{[key: string]: {
    full_name: string;
    position_department: string;
  }}>({});

  // Fetch employee data for each induction
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Create an array of promises for each induction
        const promises = inductions.map(induction => 
          fetch(`/api/inductions/${induction.id}`)
            .then(response => response.json())
            .then(data => {
              if (data.employee) {
                return {
                  inductionId: induction.id,
                  employee: {
                    full_name: data.employee.full_name || '',
                    position_department: data.employee.position_department || ''
                  }
                };
              }
              return null;
            })
            .catch(error => {
              console.error(`Error fetching data for induction ${induction.id}:`, error);
              return null;
            })
        );

        // Wait for all promises to resolve
        const results = await Promise.all(promises);
        
        // Update the state with the fetched data
        const newEmployeeData: {[key: string]: any} = {};
        results.forEach(result => {
          if (result) {
            newEmployeeData[result.inductionId] = result.employee;
          }
        });
        
        setEmployeeData(newEmployeeData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    if (inductions.length > 0) {
      fetchEmployeeData();
    }
  }, [inductions]);

  const allSelected = inductions.length > 0 && selectedInductions.length === inductions.length;

  // Handle view action - navigate to detail page
  const handleView = (inductionId: string) => {
    router.push(`${baseUrl}?view=${inductionId}`);
  };

  // Handle edit action - navigate to edit page
  const handleEdit = (inductionId: string) => {
    router.push(`${baseUrl}?edit=${inductionId}`);
  };

  // Handle API actions
  const handleApiAction = async (inductionId: string, action: string) => {
    setIsLoading(prev => ({ ...prev, [inductionId]: true }));

    try {
      // Special handling for continue action
      if (action === 'continue') {
        router.push(`${baseUrl}?continue=${inductionId}`);
        return;
      }
      
      const response = await fetch(`/api/inductions/${inductionId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Induction ${action} action successful`);
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${action} induction`);
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`An error occurred while performing the ${action} action`);
    } finally {
      setIsLoading(prev => ({ ...prev, [inductionId]: false }));
    }
  };

  // Handle selection of a single induction
  const handleSelectInduction = (inductionId: string, selected: boolean) => {
    if (selected) {
      setSelectedInductions(prev => [...prev, inductionId]);
    } else {
      setSelectedInductions(prev => prev.filter(id => id !== inductionId));
    }
  };

  // Handle selection of all inductions
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedInductions(inductions.map(induction => induction.id));
    } else {
      setSelectedInductions([]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedInductions.length === 0) {
      toast.error('No inductions selected');
      return;
    }

    // Show a modal or dropdown for bulk actions
    router.push(`${baseUrl}?bulkAction=true&ids=${selectedInductions.join(',')}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`${baseUrl}?page=${page}`);
  };

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
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
    // Check if this induction has an ongoing action
    const isActionLoading = isLoading[induction.id] || false;
    
    const viewButton = (
      <button 
        className="text-blue-600 hover:text-blue-900 mr-3"
        onClick={() => handleView(induction.id)}
        disabled={isActionLoading}
      >
        {isActionLoading ? (
          <Icon name="fas fa-spinner fa-spin" className="mr-1" />
        ) : 'View'}
      </button>
    );

    switch (induction.status) {
      case 'completed':
        return (
          <>
            {viewButton}
            <button 
              className="text-green-600 hover:text-green-900 mr-3"
              onClick={() => handleApiAction(induction.id, 'certificate')}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Certificate'}
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => handleApiAction(induction.id, 'archive')}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Archive'}
            </button>
          </>
        );
      case 'in-progress':
        return (
          <>
            {viewButton}
            <button 
              className="text-green-600 hover:text-green-900 mr-3"
              onClick={() => handleApiAction(induction.id, 'continue')}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Continue'}
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => handleEdit(induction.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Edit'}
            </button>
          </>
        );
      case 'scheduled':
        return (
          <>
            {viewButton}
            <button 
              className="text-purple-600 hover:text-purple-900 mr-3"
              onClick={() => handleApiAction(induction.id, 'start')}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Start'}
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => handleEdit(induction.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Edit'}
            </button>
          </>
        );
      case 'overdue':
        return (
          <>
            {viewButton}
            <button 
              className="text-orange-600 hover:text-orange-900 mr-3"
              onClick={() => handleApiAction(induction.id, 'remind')}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Remind'}
            </button>
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => handleEdit(induction.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Icon name="fas fa-spinner fa-spin" className="mr-1" />
              ) : 'Edit'}
            </button>
          </>
        );
      default:
        return viewButton;
    }
  };

  // No dynamic CSS needed
  
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
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className="text-sm text-gray-600">Select All</span>
            <button 
              className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              onClick={handleBulkAction}
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
                  onChange={(e) => handleSelectAll(e.target.checked)}
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
                    onChange={(e) => handleSelectInduction(induction.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: induction.status === 'completed' ? '#16a34a' : 
                                        induction.status === 'in-progress' ? '#2563eb' : 
                                        induction.status === 'scheduled' ? '#9333ea' : 
                                        '#f97316',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      overflow: 'hidden'
                    }}>
                      <span className="text-white text-xs font-medium">
                        {employeeData[induction.id]?.full_name ? 
                          employeeData[induction.id].full_name.split(' ').map(name => name[0]).join('') : 
                          induction.employeeName ? 
                            induction.employeeName.split(' ').map(name => name[0]).join('') : 
                            'UE'}
                      </span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {employeeData[induction.id]?.full_name || induction.employeeName || 'Unknown Employee'}
                      </div>
                      <div className="text-sm text-gray-500 truncate" style={{ maxWidth: '200px' }}>
                        {employeeData[induction.id]?.position_department || induction.employeePosition || 'Unknown Position'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{induction.type}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{induction.scheduledDate}</td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{induction.dueDate}</td>
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
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            );
          })}
          
          <button 
            className={`px-3 py-1 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'} rounded text-sm`}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
