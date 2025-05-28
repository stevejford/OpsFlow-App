'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, description: string) => void;
  parentFolderName: string;
  existingFolderNames?: string[];
}

export default function NewFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
  parentFolderName,
  existingFolderNames = []
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateFolderName = () => {
    if (!folderName.trim()) {
      setError('Folder name is required');
      return false;
    }

    if (existingFolderNames.includes(folderName.trim())) {
      setError('A folder with this name already exists');
      return false;
    }

    // Check for invalid characters
    const invalidCharsRegex = /[<>:"\/\\|?*]/;
    if (invalidCharsRegex.test(folderName)) {
      setError('Folder name contains invalid characters (< > : " / \\ | ? *)');
      return false;
    }

    if (folderName.length > 255) {
      setError('Folder name is too long (maximum 255 characters)');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFolderName()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      onCreateFolder(folderName, description);
      toast.success('Folder created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Folder</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                Folder Name*
              </label>
              <input
                id="folderName"
                type="text"
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  error ? "border-red-300" : "border-gray-300"
                )}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter folder description"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                <span className="text-gray-700">{parentFolderName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end p-4 border-t border-gray-200 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderName.trim()}
              className={cn(
                "px-4 py-2 rounded-lg text-white transition-colors",
                isSubmitting || !folderName.trim()
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Folder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
