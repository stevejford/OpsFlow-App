'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Folder } from '@/types/document';

interface UploadModalProps {
  isOpen: boolean;
  onCloseEventName: string;
  onUploadCompleteEventName: string;
  currentFolderId: string;
  availableFolders: Folder[];
  maxFileSize: number; // in bytes
  allowedFileTypes?: string[]; // array of MIME types
}

type FileWithStatus = {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  folderId: string;
};

export default function UploadModal({
  isOpen,
  onCloseEventName,
  onUploadCompleteEventName,
  currentFolderId,
  availableFolders,
  maxFileSize,
  allowedFileTypes
}: UploadModalProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId);
  const [uploadCancelled, setUploadCancelled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find the current folder name from the available folders
  const currentFolderName = availableFolders.find(folder => folder.id === currentFolderId)?.name || 'Unknown Folder';

  if (!isOpen) return null;

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles: FileWithStatus[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Validate file size
      if (file.size > maxFileSize) {
        toast.error(`${file.name} exceeds the maximum file size (${formatFileSize(maxFileSize)})`);
        continue;
      }
      
      // Validate file type if allowedFileTypes is provided
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        const isAllowed = allowedFileTypes.some(allowedType => {
          if (allowedType.includes('*')) {
            // Handle wildcard patterns like 'image/*'
            const baseType = allowedType.split('/')[0];
            return file.type.startsWith(baseType + '/');
          }
          return allowedType === file.type;
        });
        
        if (!isAllowed) {
          toast.error(`${file.name} has an unsupported file type (${file.type})`);
          continue;
        }
      }
      
      // Check for duplicate files
      if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
        toast.error(`${file.name} is already in the upload list`);
        continue;
      }
      
      newFiles.push({
        file,
        progress: 0,
        status: 'pending',
        folderId: selectedFolderId
      });
    }
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolderId(e.target.value);
    
    // Update folder ID for all pending files
    setFiles(prevFiles => prevFiles.map(fileStatus => {
      if (fileStatus.status === 'pending') {
        return { ...fileStatus, folderId: e.target.value };
      }
      return fileStatus;
    }));
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, []);

  const handleRemoveFile = (fileToRemove: FileWithStatus) => {
    if (fileToRemove.status === 'uploading' && !uploadCancelled) return; // Don't remove files during active upload
    setFiles(prev => prev.filter(f => f !== fileToRemove));
  };

  // Handle close functionality
  const handleClose = useCallback(() => {
    if (isUploading) {
      // If uploading, ask for confirmation
      if (window.confirm('Upload is in progress. Are you sure you want to cancel?')) {
        setUploadCancelled(true);
        setIsUploading(false);
        // Dispatch close event
        window.dispatchEvent(new CustomEvent(onCloseEventName));
      }
    } else {
      // Dispatch close event
      window.dispatchEvent(new CustomEvent(onCloseEventName));
    }
  }, [isUploading, onCloseEventName]);

  // Handle click outside to close
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return;
    
    setIsUploading(true);
    setUploadCancelled(false);
    const pendingFiles = files.filter(f => f.status === 'pending');
    const successfulUploads: Array<{ id: string; name: string; folderId: string }> = [];
    
    try {
      // Simulate upload for each file
      for (const fileStatus of pendingFiles) {
        if (uploadCancelled) {
          // Mark remaining files as pending
          setFiles(prev => prev.map(f => 
            f === fileStatus ? { ...f, progress: 0 } : f
          ));
          continue;
        }
        
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f === fileStatus ? { ...f, status: 'uploading' } : f
        ));
        
        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 10) {
          if (uploadCancelled) break;
          
          await new Promise(resolve => setTimeout(resolve, 200));
          
          setFiles(prev => prev.map(f => 
            f === fileStatus ? { ...f, progress } : f
          ));
        }
        
        if (!uploadCancelled) {
          // Mark as success and add to successful uploads
          setFiles(prev => prev.map(f => 
            f === fileStatus ? { ...f, status: 'success' } : f
          ));
          
          // Generate a fake ID for the uploaded file
          const fileId = Math.random().toString(36).substring(2, 15);
          successfulUploads.push({
            id: fileId,
            name: fileStatus.file.name,
            folderId: fileStatus.folderId
          });
        }
      }
      
      if (successfulUploads.length > 0) {
        // Dispatch the upload complete event
        window.dispatchEvent(new CustomEvent(onUploadCompleteEventName, {
          detail: { uploadedFiles: successfulUploads }
        }));
        
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      }
    } catch (error) {
      // Handle errors
      toast.error('An error occurred during upload');
      console.error('Upload error:', error);
      
      // Mark failed files
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { 
          ...f, 
          status: 'error', 
          error: 'Network error or server issue' 
        } : f
      ));
    } finally {
      setIsUploading(false);
      setUploadCancelled(false);
    }
  };

  const handleCancelUpload = () => {
    setUploadCancelled(true);
    toast.info('Upload cancelled');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Upload Files</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Folder selection */}
          <div className="mb-4">
            <label htmlFor="folder-select" className="block text-sm font-medium text-gray-700 mb-1">
              Destination Folder
            </label>
            <select
              id="folder-select"
              value={selectedFolderId}
              onChange={handleFolderChange}
              disabled={isUploading}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {availableFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.path ? `${folder.path} / ${folder.name}` : folder.name}
                </option>
              ))}
            </select>
          </div>
          
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
              isUploading && "opacity-50 pointer-events-none"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <p className="text-lg font-medium text-gray-700 mb-1">Drag files here or click to browse</p>
            <p className="text-sm text-gray-500 mb-4">
              Upload to <span className="font-medium">{currentFolderName}</span>
            </p>
            
            {allowedFileTypes && allowedFileTypes.length > 0 && (
              <p className="text-xs text-gray-500 mb-2">
                Allowed file types: {allowedFileTypes.join(', ')}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mb-4">
              Maximum file size: {formatFileSize(maxFileSize)}
            </p>
            
            <button
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Browse Files
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
              multiple
              className="hidden"
              accept={allowedFileTypes?.join(',')}
            />
          </div>
          
          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-800">Selected Files ({files.length})</h3>
                {!isUploading && (
                  <button 
                    onClick={() => setFiles([])}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {files.map((fileStatus, index) => (
                  <div 
                    key={`${fileStatus.file.name}-${index}`}
                    className="flex items-center border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{fileStatus.file.name}</p>
                        <span className="text-xs text-gray-500">{formatFileSize(fileStatus.file.size)}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            fileStatus.status === 'success' ? "bg-green-500" : 
                            fileStatus.status === 'error' ? "bg-red-500" : "bg-blue-500"
                          )}
                          style={{ width: `${fileStatus.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs">
                          {fileStatus.status === 'pending' && 'Ready to upload'}
                          {fileStatus.status === 'uploading' && `Uploading: ${fileStatus.progress}%`}
                          {fileStatus.status === 'success' && 'Upload complete'}
                          {fileStatus.status === 'error' && (
                            <span className="text-red-600">{fileStatus.error || 'Upload failed'}</span>
                          )}
                        </span>
                        
                        {(fileStatus.status !== 'uploading' || uploadCancelled) && (
                          <button
                            onClick={() => handleRemoveFile(fileStatus)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Remove file"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-3">
          {isUploading ? (
            <button 
              onClick={handleCancelUpload}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Cancel Upload
            </button>
          ) : (
            <button 
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={handleUpload}
            disabled={isUploading || files.filter(f => f.status === 'pending').length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
