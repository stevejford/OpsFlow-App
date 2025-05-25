'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Induction } from '@/lib/data/inductions';

interface InductionDetailsProps {
  induction: Induction;
  onClose: () => void;
  onDownloadCertificate?: (inductionId: string) => void;
  returnUrl?: string;
}

export default function InductionDetails({
  induction,
  onClose,
  onDownloadCertificate,
  returnUrl = '/induction-tracking'
}: InductionDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if modal should be shown based on URL params
  const viewId = searchParams.get('view');
  const showModal = viewId === induction.id;
  
  // Handle close action
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push(returnUrl);
    }
  };
  
  if (!showModal) return null;

  // Parse notes field if it's a JSON string
  const parsedNotes = React.useMemo(() => {
    if (!induction.notes) return null;
    
    try {
      if (typeof induction.notes === 'string' && induction.notes.startsWith('{')) {
        return JSON.parse(induction.notes);
      }
      return null;
    } catch (e) {
      console.error('Failed to parse induction notes:', e);
      return null;
    }
  }, [induction.notes]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Induction Details</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <Icon name="fas fa-times" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-900">{induction.type || induction.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(induction.status)}`}>
                {induction.status}
              </span>
            </div>
            <p className="text-gray-600">{induction.description || induction.provider}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <Icon name="fas fa-user" className="text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">Employee Information</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className={`w-10 h-10 ${
                      induction.status === 'Completed' ? 'bg-green-600' : 
                      induction.status === 'In Progress' ? 'bg-blue-600' : 
                      induction.status === 'Scheduled' ? 'bg-purple-600' : 
                      'bg-orange-600'
                    } rounded-full flex items-center justify-center mr-3`}>
                      <span className="text-white text-xs font-medium">
                        {induction.employeeName ? 
                          induction.employeeName.split(' ').map(name => name[0]).join('') : 
                          (induction.first_name && induction.last_name) ? 
                            `${induction.first_name[0]}${induction.last_name[0]}` : 'UE'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {induction.employeeName || 
                         (induction.first_name && induction.last_name) ? 
                           `${induction.first_name} ${induction.last_name}` : 'Unknown Employee'}
                      </p>
                      <p className="text-sm text-gray-600">{induction.employeePosition || induction.position || 'Unknown Position'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Icon name="fas fa-calendar-alt" className="text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">Schedule Information</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Scheduled Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {induction.scheduledDate || 
                         (induction.created_at ? new Date(induction.created_at).toLocaleDateString() : '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {induction.dueDate || 
                         (induction.expiry_date ? new Date(induction.expiry_date).toLocaleDateString() : '')}
                      </p>
                    </div>
                    {(induction.completedDate || induction.completed_date) && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Completed Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {induction.completedDate || 
                           (induction.completed_date ? new Date(induction.completed_date).toLocaleDateString() : '')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <Icon name="fas fa-clipboard-check" className="text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">Progress</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Completion</span>
                      <span className="text-xs text-gray-600">
                        {induction.progress || (induction.status === 'Completed' ? 100 : induction.status === 'In Progress' ? 50 : 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${
                          induction.status === 'Completed' ? 'bg-green-600' : 
                          induction.status === 'In Progress' ? 'bg-blue-600' : 
                          induction.status === 'Scheduled' ? 'bg-gray-400' : 
                          'bg-orange-600'
                        } h-2 rounded-full`} 
                        style={{ width: `${induction.progress || (induction.status === 'Completed' ? 100 : induction.status === 'In Progress' ? 50 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {induction.status === 'Completed' && (
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Training Completed Successfully
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {(induction.documentUrl || induction.document_url || (parsedNotes && parsedNotes.document_url)) && (
                <div>
                  <div className="flex items-center mb-2">
                    <Icon name="fas fa-file-alt" className="text-gray-400 mr-2" />
                    <h4 className="text-sm font-medium text-gray-700">Documents</h4>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completion Certificate</p>
                        <p className="text-xs text-gray-500">PDF Document</p>
                      </div>
                      <a 
                        href={induction.documentUrl || induction.document_url || (parsedNotes && parsedNotes.document_url) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        onClick={(e) => {
                          if (!induction.documentUrl && !induction.document_url && (!parsedNotes || !parsedNotes.document_url)) {
                            e.preventDefault();
                            onDownloadCertificate && onDownloadCertificate(induction.id);
                          }
                        }}
                      >
                        <Icon name="fas fa-download" className="mr-1" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Portal Information */}
          {parsedNotes && (parsedNotes.portal_url || parsedNotes.username || parsedNotes.password) && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Icon name="fas fa-globe" className="text-gray-400 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">Portal Information</h4>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {parsedNotes.portal_url && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Portal URL</p>
                    <a 
                      href={parsedNotes.portal_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all"
                    >
                      {parsedNotes.portal_url}
                    </a>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {parsedNotes.username && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Username</p>
                      <p className="text-sm font-medium text-gray-900">{parsedNotes.username}</p>
                    </div>
                  )}
                  
                  {parsedNotes.password && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Password</p>
                      <p className="text-sm font-medium text-gray-900">••••••••</p>
                    </div>
                  )}
                </div>
                
                {parsedNotes.additional_notes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                    <p className="text-sm text-gray-700">{parsedNotes.additional_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
