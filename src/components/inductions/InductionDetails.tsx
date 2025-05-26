'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Induction } from '@/lib/data/inductions';
import Icon from '@/components/ui/Icon';

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
  
  // For production environment, we'll fetch employee data from the database
  const [employeeData, setEmployeeData] = useState<{
    position: string;
    department: string;
    full_name: string;
    position_department: string;
  } | null>(null);

  // Fetch employee data when the induction is viewed
  useEffect(() => {
    if (showModal && induction.id) {
      // Fetch induction details with employee data
      fetch(`/api/inductions/${induction.id}`)
        .then(response => response.json())
        .then(data => {
          if (data.employee) {
            setEmployeeData({
              position: data.employee.position || '',
              department: data.employee.department || '',
              full_name: data.employee.full_name || '',
              position_department: data.employee.position_department || ''
            });
          }
        })
        .catch(error => {
          console.error('Error fetching employee data:', error);
        });
    }
  }, [showModal, induction.id]);
  
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
  
  // Check if we need to display the raw notes
  const displayRawNotes = React.useMemo(() => {
    return typeof induction.notes === 'string' && !induction.notes.startsWith('{');
  }, [induction.notes]);

  // State for password visibility and copy feedback
  const [showPassword, setShowPassword] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<{url: boolean, password: boolean}>({url: false, password: false});
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string, type: 'url' | 'password') => {
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      setCopyFeedback(prev => ({ ...prev, [type]: true }));
      
      // Hide feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, [type]: false }));
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };
  
  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
      case 'pending':
        return 'bg-purple-100 text-purple-800';
      case 'overdue':
      case 'expired':
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
                    <div className={`w-10 h-10 ${induction.status.toLowerCase() === 'completed' ? 'bg-green-600' : 
                      induction.status.toLowerCase() === 'in-progress' || induction.status.toLowerCase() === 'in progress' ? 'bg-blue-600' : 
                      induction.status.toLowerCase() === 'scheduled' || induction.status.toLowerCase() === 'pending' ? 'bg-purple-600' : 
                      'bg-orange-600'} rounded-full flex items-center justify-center mr-3`}>
                      <span className="text-white text-xs font-medium">
                        {employeeData?.full_name ? 
                          employeeData.full_name.split(' ').map(name => name[0]).join('') : 
                          induction.employeeName ? 
                            induction.employeeName.split(' ').map(name => name[0]).join('') : 
                            (induction.first_name && induction.last_name) ? 
                              `${induction.first_name[0]}${induction.last_name[0]}` : 'UE'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {employeeData?.full_name || 
                         induction.employeeName || 
                         ((induction.first_name && induction.last_name) ? 
                           `${induction.first_name} ${induction.last_name}` : 'Unknown Employee')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {employeeData?.position_department || 
                         induction.employeePosition || 
                         induction.position || 
                         'Unknown Position'}
                      </p>
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
                        {induction.progress || (induction.status.toLowerCase() === 'completed' ? 100 : induction.status.toLowerCase() === 'in-progress' || induction.status.toLowerCase() === 'in progress' ? 50 : 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${induction.status.toLowerCase() === 'completed' ? 'bg-green-600' : 
                          induction.status.toLowerCase() === 'in-progress' || induction.status.toLowerCase() === 'in progress' ? 'bg-blue-600' : 
                          induction.status.toLowerCase() === 'scheduled' || induction.status.toLowerCase() === 'pending' ? 'bg-gray-400' : 
                          'bg-orange-600'} h-2 rounded-full`} 
                        style={{ width: `${induction.progress || (induction.status.toLowerCase() === 'completed' ? 100 : induction.status.toLowerCase() === 'in-progress' || induction.status.toLowerCase() === 'in progress' ? 50 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {induction.status.toLowerCase() === 'completed' && (
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
          {(induction.portal || (parsedNotes && (parsedNotes.portal_url || parsedNotes.username || parsedNotes.password))) && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Icon name="fas fa-globe" className="text-gray-400 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">Portal Information</h4>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {(induction.portal || (parsedNotes && parsedNotes.portal_url)) && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Portal URL</p>
                    <div className="flex items-center">
                      <a 
                        href={induction.portal || (parsedNotes && parsedNotes.portal_url) || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 break-all inline-flex items-center mr-2"
                      >
                        <span className="mr-1">{induction.portal || (parsedNotes && parsedNotes.portal_url) || ''}</span>
                        <Icon name="fas fa-external-link-alt" className="text-xs" />
                      </a>
                      <button 
                        onClick={() => copyToClipboard(induction.portal || (parsedNotes && parsedNotes.portal_url) || '', 'url')}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copy URL"
                      >
                        {copyFeedback.url ? 
                          <Icon name="fas fa-check" className="text-green-500" /> : 
                          <Icon name="fas fa-copy" />}
                      </button>
                    </div>
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
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 mr-2">
                          {showPassword ? parsedNotes.password : '••••••••'}
                        </p>
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors mr-1"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          <Icon name={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                        </button>
                        <button 
                          onClick={() => copyToClipboard(parsedNotes.password, 'password')}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Copy password"
                        >
                          {copyFeedback.password ? 
                            <Icon name="fas fa-check" className="text-green-500" /> : 
                            <Icon name="fas fa-copy" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {(induction.notes || (parsedNotes && parsedNotes.additional_notes)) && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                      {typeof induction.notes === 'string' && !induction.notes.startsWith('{') 
                        ? induction.notes 
                        : (parsedNotes && parsedNotes.additional_notes) 
                          ? parsedNotes.additional_notes 
                          : ''}
                    </div>
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
