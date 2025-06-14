'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';
import { toast } from 'sonner';

interface InductionGridProps {
  inductions: Induction[];
  currentPage?: number;
  totalPages?: number;
  baseUrl?: string;
}

export default function InductionGrid({
  inductions,
  currentPage = 1,
  totalPages = 1,
  baseUrl = '/induction-tracking'
}: InductionGridProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  
  // Handle view action - navigate to detail page
  const handleView = (inductionId: string) => {
    router.push(`${baseUrl}/inductions/${inductionId}`);
  };
  
  // Handle edit action - navigate to edit page
  const handleEdit = (inductionId: string) => {
    router.push(`${baseUrl}/inductions/${inductionId}/edit`);
  };
  
  // Handle API actions
  const handleApiAction = async (inductionId: string, action: string) => {
    setIsLoading(prev => ({ ...prev, [inductionId]: true }));
    
    try {
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
  
  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`${baseUrl}?page=${page}`);
  };
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'scheduled':
        return 'status-scheduled';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon name="fas fa-check-circle" className="text-green-600" />;
      case 'in-progress':
        return <Icon name="fas fa-clock" className="text-blue-600" />;
      case 'scheduled':
        return <Icon name="fas fa-calendar" className="text-purple-600" />;
      case 'overdue':
        return <Icon name="fas fa-exclamation-triangle" className="text-red-600" />;
      default:
        return null;
    }
  };

  const getActionButtons = (induction: Induction) => {
    // Check if this induction has an ongoing action
    const isActionLoading = isLoading[induction.id] || false;
    
    switch (induction.status) {
      case 'completed':
        return (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              onClick={() => handleView(induction.id)}
              disabled={isActionLoading}
              title="View Details"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-eye" />}
            </button>
            <button 
              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              onClick={() => handleApiAction(induction.id, 'certificate')}
              disabled={isActionLoading}
              title="View Certificate"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-certificate" />}
            </button>
            <button 
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
              onClick={() => handleApiAction(induction.id, 'archive')}
              disabled={isActionLoading}
              title="Archive"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-archive" />}
            </button>
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              onClick={() => handleView(induction.id)}
              disabled={isActionLoading}
              title="View Details"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-eye" />}
            </button>
            <button 
              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              onClick={() => handleApiAction(induction.id, 'continue')}
              disabled={isActionLoading}
              title="Continue Training"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-play" />}
            </button>
            <button 
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
              onClick={() => handleEdit(induction.id)}
              disabled={isActionLoading}
              title="Edit"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-edit" />}
            </button>
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              onClick={() => handleView(induction.id)}
              disabled={isActionLoading}
              title="View Details"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-eye" />}
            </button>
            <button 
              className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200"
              onClick={() => handleApiAction(induction.id, 'start')}
              disabled={isActionLoading}
              title="Start Training"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-play" />}
            </button>
            <button 
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
              onClick={() => handleEdit(induction.id)}
              disabled={isActionLoading}
              title="Edit"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-edit" />}
            </button>
          </div>
        );
      case 'overdue':
        return (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              onClick={() => handleView(induction.id)}
              disabled={isActionLoading}
              title="View Details"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-eye" />}
            </button>
            <button 
              className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200"
              onClick={() => handleApiAction(induction.id, 'remind')}
              disabled={isActionLoading}
              title="Send Reminder"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-bell" />}
            </button>
            <button 
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
              onClick={() => handleEdit(induction.id)}
              disabled={isActionLoading}
              title="Edit"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-edit" />}
            </button>
          </div>
        );
      default:
        return (
          <div className="flex justify-center space-x-2 mt-4">
            <button 
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
              onClick={() => handleView(induction.id)}
              disabled={isActionLoading}
              title="View Details"
            >
              {isActionLoading ? <Icon name="fas fa-spinner fa-spin" /> : <Icon name="fas fa-eye" />}
            </button>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {inductions.map(induction => (
          <div 
            key={induction.id} 
            className={`induction-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden fade-in`}
          >
            <div className={`p-4 ${getStatusClass(induction.status)}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${
                    induction.status === 'completed' ? 'bg-green-600' : 
                    induction.status === 'in-progress' ? 'bg-blue-600' : 
                    induction.status === 'scheduled' ? 'bg-purple-600' : 
                    'bg-orange-600'
                  } rounded-full flex items-center justify-center mr-3`}>
                    <span className="text-white text-xs font-medium">
                      {induction.employeeName.split(' ').map(name => name[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">{induction.employeeName}</h3>
                    <p className="text-xs text-gray-600">{induction.employeePosition}</p>
                  </div>
                </div>
                <div>
                  {getStatusIcon(induction.status)}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-gray-900">{induction.type}</h4>
              <p className="text-sm text-gray-600 mb-3">{induction.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  <p className="font-medium">Scheduled:</p>
                  <p>{induction.scheduledDate}</p>
                </div>
                <div>
                  <p className="font-medium">Due:</p>
                  <p>{induction.dueDate}</p>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Progress</span>
                  <span className="text-xs text-gray-600">{induction.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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
              </div>
              
              <div className="flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  induction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  induction.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                  induction.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : 
                  'bg-red-100 text-red-800 alert-blink'
                }`}>
                  {getStatusIcon(induction.status)}
                  <span className="ml-1">
                    {induction.status === 'completed' ? 'Completed' : 
                     induction.status === 'in-progress' ? 'In Progress' : 
                     induction.status === 'scheduled' ? 'Scheduled' : 
                     'Overdue'}
                  </span>
                </span>
              </div>
              
              {getActionButtons(induction)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 mb-8">
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
  );
}
