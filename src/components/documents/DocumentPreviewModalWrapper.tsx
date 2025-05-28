'use client';

import React, { useCallback } from 'react';
import DocumentPreviewModal from './DocumentPreviewModal';

interface DocumentPreviewModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: string;
    modified: string;
  } | null;
  onDownload?: () => void;
  onShare?: () => void;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export default function DocumentPreviewModalWrapper(props: DocumentPreviewModalWrapperProps) {
  const {
    isOpen,
    onClose,
    document,
    onDownload,
    onShare,
    documents,
    currentIndex,
    onNavigate
  } = props;

  // Generate unique event names for this instance
  const eventNames = {
    close: `document-preview-close-${Math.random().toString(36).substring(2, 9)}`,
    download: onDownload ? `document-preview-download-${Math.random().toString(36).substring(2, 9)}` : undefined,
    share: onShare ? `document-preview-share-${Math.random().toString(36).substring(2, 9)}` : undefined,
    navigate: onNavigate ? `document-preview-navigate-${Math.random().toString(36).substring(2, 9)}` : undefined
  };

  // Set up event listeners for document operations
  React.useEffect(() => {
    const handleClose = () => {
      onClose();
    };

    const handleDownload = () => {
      if (onDownload) onDownload();
    };

    const handleShare = () => {
      if (onShare) onShare();
    };

    const handleNavigate = (e: Event) => {
      if (!onNavigate) return;
      const customEvent = e as CustomEvent;
      const { index } = customEvent.detail;
      onNavigate(index);
    };

    // Add event listeners
    window.addEventListener(eventNames.close, handleClose);
    if (eventNames.download) {
      window.addEventListener(eventNames.download, handleDownload);
    }
    if (eventNames.share) {
      window.addEventListener(eventNames.share, handleShare);
    }
    if (eventNames.navigate) {
      window.addEventListener(eventNames.navigate, handleNavigate);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener(eventNames.close, handleClose);
      if (eventNames.download) {
        window.removeEventListener(eventNames.download, handleDownload);
      }
      if (eventNames.share) {
        window.removeEventListener(eventNames.share, handleShare);
      }
      if (eventNames.navigate) {
        window.removeEventListener(eventNames.navigate, handleNavigate);
      }
    };
  }, [eventNames, onClose, onDownload, onShare, onNavigate]);

  return (
    <DocumentPreviewModal
      isOpen={isOpen}
      onCloseEventName={eventNames.close}
      document={document}
      onDownloadEventName={eventNames.download}
      onShareEventName={eventNames.share}
      documents={documents}
      currentIndex={currentIndex}
      onNavigateEventName={eventNames.navigate}
    />
  );
}
