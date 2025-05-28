'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, faTimes, faCheck, faExclamationTriangle,
  faLock, faUsers, faInfo
} from '@fortawesome/free-solid-svg-icons';

interface NewFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderData: {
    name: string;
    description: string;
    inheritPermissions: boolean;
    isPrivate: boolean;
  }) => Promise<void>;
  parentFolderId: string;
  parentFolderPath: string;
  existingFolderNames: string[];
}

export default function NewFolderDialog({
  isOpen,
  onClose,
  onCreateFolder,
  parentFolderId,
  parentFolderPath,
  existingFolderNames
}: NewFolderDialogProps) {
  // State
  const [folderName, setFolderName] = useState('');
  const [description, setDescription] = useState('');
  const [inheritPermissions, setInheritPermissions] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setDescription('');
      setInheritPermissions(true);
      setIsPrivate(false);
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Validation rules
  const validateFolderName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Folder name is required';
    }

    if (name.trim().length < 1) {
      return 'Folder name must be at least 1 character';
    }

    if (name.trim().length > 255) {
      return 'Folder name must be less than 255 characters';
    }

    // Check for invalid characters
    const invalidChars = /[<>:"\/\\|?*\x00-\x1f]/;
    if (invalidChars.test(name)) {
      return 'Folder name contains invalid characters (< > : " / \\ | ? * or control characters)';
    }

    // Check for reserved names
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (reservedNames.includes(name.trim().toUpperCase())) {
      return 'This folder name is reserved and cannot be used';
    }

    // Check for duplicate names
    if (existingFolderNames.includes(name.trim())) {
      return 'A folder with this name already exists in this location';
    }

    // Check for names that start or end with spaces or dots
    if (name.startsWith(' ') || name.endsWith(' ') || name.startsWith('.') || name.endsWith('.')) {
      return 'Folder name cannot start or end with spaces or dots';
    }

    return null;
  };

  const validateDescription = (desc: string): string | null => {
    if (desc.length > 1000) {
      return 'Description must be less than 1000 characters';
    }
    return null;
  };

  // Handle input changes with validation
  const handleNameChange = (value: string) => {
    setFolderName(value);
    const error = validateFolderName(value);
    setErrors(prev => ({ ...prev, name: error || '' }));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    const error = validateDescription(value);
    setErrors(prev => ({ ...prev, description: error || '' }));
  };

  // Form validation
  const isFormValid = () => {
    const nameError = validateFolderName(folderName);
    const descError = validateDescription(description);
    
    return !nameError && !descError && folderName.trim().length > 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const nameError = validateFolderName(folderName);
    const descError = validateDescription(description);

    if (nameError || descError) {
      setErrors({
        name: nameError || '',
        description: descError || ''
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onCreateFolder({
        name: folderName.trim(),
        description: description.trim(),
        inheritPermissions,
        isPrivate
      });

      // Show success state
      setShowSuccess(true);
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating folder:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create folder. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faFolder} className="mr-2 text-blue-500" />
            Create New Folder
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 disabled:opacity-50"
            aria-label="Close dialog"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Success state */}
        {showSuccess && (
          <div className="p-4 bg-green-50 border-b border-green-200">
            <div className="flex items-center text-green-800">
              <FontAwesomeIcon icon={faCheck} className="mr-2 text-green-600" />
              <span className="font-medium">Folder created successfully!</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* General error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center text-red-800">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-red-600" />
                  <span className="text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Parent folder location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                <FontAwesomeIcon icon={faFolder} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-700 truncate" title={parentFolderPath}>
                  {parentFolderPath || 'Root'}
                </span>
              </div>
            </div>

            {/* Folder name */}
            <div>
              <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="folder-name"
                value={folderName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter folder name"
                maxLength={255}
                autoFocus
                disabled={isLoading}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {folderName.length}/255 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="folder-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="folder-description"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter folder description"
                rows={3}
                maxLength={1000}
                disabled={isLoading}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-600 flex items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Permission settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <FontAwesomeIcon icon={faLock} className="mr-2 text-gray-500" />
                Permission Settings
              </h3>

              {/* Inherit permissions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="inherit-permissions"
                    type="checkbox"
                    checked={inheritPermissions}
                    onChange={(e) => setInheritPermissions(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="inherit-permissions" className="text-sm font-medium text-gray-700">
                    Inherit permissions from parent folder
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Users with access to the parent folder will automatically have access to this folder
                  </p>
                </div>
              </div>

              {/* Private folder */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="private-folder"
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="private-folder" className="text-sm font-medium text-gray-700">
                    Make this folder private
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Only you and users you explicitly grant access will be able to see this folder
                  </p>
                </div>
              </div>

              {/* Info about conflicting settings */}
              {inheritPermissions && isPrivate && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <FontAwesomeIcon icon={faInfo} className="text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Conflicting settings</p>
                      <p className="mt-1">
                        Private folders typically don't inherit permissions. Consider unchecking one of these options.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faFolder} className="mr-2" />
                Create Folder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
