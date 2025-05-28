'use client';

import React, { useCallback } from 'react';
import UploadModal from './UploadModal';
import { Folder } from '@/types/document';

interface UploadModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (uploadedFiles: Array<{ id: string; name: string; folderId: string }>) => void;
  currentFolderId: string;
  availableFolders: Folder[];
  maxFileSize: number;
  allowedFileTypes?: string[];
}

export default function UploadModalWrapper(props: UploadModalWrapperProps) {
  const {
    isOpen,
    onClose,
    onUploadComplete,
    currentFolderId,
    availableFolders,
    maxFileSize,
    allowedFileTypes
  } = props;

  // Generate unique event names for this instance
  const eventNames = {
    close: `upload-modal-close-${Math.random().toString(36).substring(2, 9)}`,
    uploadComplete: `upload-modal-complete-${Math.random().toString(36).substring(2, 9)}`
  };

  // Set up event listeners for modal operations
  React.useEffect(() => {
    const handleClose = () => {
      onClose();
    };

    const handleUploadComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { uploadedFiles } = customEvent.detail;
      onUploadComplete(uploadedFiles);
    };

    // Add event listeners
    window.addEventListener(eventNames.close, handleClose);
    window.addEventListener(eventNames.uploadComplete, handleUploadComplete);

    // Clean up event listeners
    return () => {
      window.removeEventListener(eventNames.close, handleClose);
      window.removeEventListener(eventNames.uploadComplete, handleUploadComplete);
    };
  }, [eventNames, onClose, onUploadComplete]);

  return (
    <UploadModal
      isOpen={isOpen}
      onCloseEventName={eventNames.close}
      onUploadCompleteEventName={eventNames.uploadComplete}
      currentFolderId={currentFolderId}
      availableFolders={availableFolders}
      maxFileSize={maxFileSize}
      allowedFileTypes={allowedFileTypes}
    />
  );
}
