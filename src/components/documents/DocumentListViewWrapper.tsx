'use client';

import React, { useCallback } from 'react';
import { Document } from '@/types/document';
import DocumentListView from './DocumentListView';

interface DocumentListViewWrapperProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  selectedDocumentIds: string[];
  onDocumentSelect: (documentId: string, multiSelect?: boolean) => void;
  onDocumentOpen: (document: Document) => void;
  onContextMenu?: (document: Document, e: React.MouseEvent) => void;
  isLoading?: boolean;
  emptyStateMessage?: string;
  className?: string;
  showKeyboardHelp?: boolean;
}

export default function DocumentListViewWrapper(props: DocumentListViewWrapperProps) {
  const {
    documents,
    viewMode,
    selectedDocumentIds,
    onDocumentSelect,
    onDocumentOpen,
    onContextMenu,
    isLoading,
    emptyStateMessage,
    className,
    showKeyboardHelp
  } = props;

  // Generate unique event names for this instance
  const eventNames = {
    select: `document-select-${Math.random().toString(36).substring(2, 9)}`,
    open: `document-open-${Math.random().toString(36).substring(2, 9)}`,
    contextMenu: onContextMenu ? `document-context-menu-${Math.random().toString(36).substring(2, 9)}` : undefined
  };

  // Set up event listeners for document operations
  React.useEffect(() => {
    const handleDocumentSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { documentId, multiSelect } = customEvent.detail;
      onDocumentSelect(documentId, multiSelect);
    };

    const handleDocumentOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { document } = customEvent.detail;
      onDocumentOpen(document);
    };

    const handleContextMenu = (e: Event) => {
      if (!onContextMenu || !eventNames.contextMenu) return;
      const customEvent = e as CustomEvent;
      const { document, x, y } = customEvent.detail;
      onContextMenu(document, { clientX: x, clientY: y } as React.MouseEvent);
    };

    // Add event listeners
    window.addEventListener(eventNames.select, handleDocumentSelect);
    window.addEventListener(eventNames.open, handleDocumentOpen);
    if (eventNames.contextMenu) {
      window.addEventListener(eventNames.contextMenu, handleContextMenu);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener(eventNames.select, handleDocumentSelect);
      window.removeEventListener(eventNames.open, handleDocumentOpen);
      if (eventNames.contextMenu) {
        window.removeEventListener(eventNames.contextMenu, handleContextMenu);
      }
    };
  }, [eventNames, onDocumentSelect, onDocumentOpen, onContextMenu]);

  return (
    <DocumentListView
      documents={documents}
      viewMode={viewMode}
      selectedDocumentIds={selectedDocumentIds}
      isLoading={isLoading}
      emptyStateMessage={emptyStateMessage}
      className={className}
      showKeyboardHelp={showKeyboardHelp}
      documentSelectEventName={eventNames.select}
      documentOpenEventName={eventNames.open}
      contextMenuEventName={eventNames.contextMenu}
    />
  );
}
