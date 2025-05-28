'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
  } | null;
}

type Permission = 'view' | 'edit' | 'comment' | 'none';

type ShareRecipient = {
  id: string;
  name: string;
  email: string;
  permission: Permission;
  avatar?: string;
};

export default function ShareDocumentModal({
  isOpen,
  onClose,
  document
}: ShareDocumentModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkPermission, setLinkPermission] = useState<Permission>('view');
  const [linkExpiration, setLinkExpiration] = useState<string>('never');
  const [recipients, setRecipients] = useState<ShareRecipient[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      permission: 'edit',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      permission: 'view',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  ]);

  if (!isOpen || !document) return null;

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Check if email already exists
    if (recipients.some(r => r.email === email.trim())) {
      toast.error('This email has already been added');
      return;
    }
    
    const newRecipient: ShareRecipient = {
      id: Date.now().toString(),
      name: email.split('@')[0], // Use part of email as name
      email: email.trim(),
      permission
    };
    
    setRecipients([...recipients, newRecipient]);
    setEmail('');
    
    toast.success(`Added ${email} with ${permission} access`);
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const handlePermissionChange = (id: string, newPermission: Permission) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, permission: newPermission } : r
    ));
  };

  const handleGenerateLink = () => {
    setIsGeneratingLink(true);
    
    // Simulate API call
    setTimeout(() => {
      const randomToken = Math.random().toString(36).substring(2, 15);
      setShareLink(`https://opsflow.app/shared/${document.id}/${randomToken}`);
      setIsGeneratingLink(false);
      
      toast.success('Share link generated successfully');
    }, 1000);
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    
    navigator.clipboard.writeText(shareLink)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleDeleteLink = () => {
    setShareLink(null);
    toast.success('Share link deleted');
  };

  const renderPermissionSelector = (currentPermission: Permission, onChange: (permission: Permission) => void) => (
    <select
      value={currentPermission}
      onChange={(e) => onChange(e.target.value as Permission)}
      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      <option value="view">View</option>
      <option value="comment">Comment</option>
      <option value="edit">Edit</option>
      <option value="none">No access</option>
    </select>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Share "{document.name}"</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {/* Add people form */}
          <form onSubmit={handleAddRecipient} className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Add people
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                id="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="w-32">
                {renderPermissionSelector(permission, setPermission)}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          </form>
          
          {/* People with access */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">People with access</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recipients.length > 0 ? (
                recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {recipient.avatar ? (
                        <img 
                          src={recipient.avatar} 
                          alt={recipient.name} 
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-600 text-sm font-medium">
                            {recipient.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                        <p className="text-xs text-gray-500">{recipient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-28">
                        {renderPermissionSelector(
                          recipient.permission,
                          (newPermission) => handlePermissionChange(recipient.id, newPermission)
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveRecipient(recipient.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No one has access yet</p>
              )}
            </div>
          </div>
          
          {/* Get link */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Get a shareable link</h4>
            
            {shareLink ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none sm:text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title="Copy link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                  <button
                    onClick={handleDeleteLink}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                    title="Delete link"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="linkPermission" className="block text-xs font-medium text-gray-700 mb-1">
                      Permission
                    </label>
                    {renderPermissionSelector(linkPermission, setLinkPermission)}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="linkExpiration" className="block text-xs font-medium text-gray-700 mb-1">
                      Expires
                    </label>
                    <select
                      id="linkExpiration"
                      value={linkExpiration}
                      onChange={(e) => setLinkExpiration(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="never">Never</option>
                      <option value="1day">1 day</option>
                      <option value="7days">7 days</option>
                      <option value="30days">30 days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateLink}
                disabled={isGeneratingLink}
                className={cn(
                  "w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                  isGeneratingLink && "opacity-50 cursor-not-allowed"
                )}
              >
                {isGeneratingLink ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                    Generate link
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
