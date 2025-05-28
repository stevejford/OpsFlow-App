'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: Folder[];
}

interface FolderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  folder: Folder | null;
  onClose: () => void;
  onCreateFolder: (parentId: string | null) => void;
  onRenameFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onExportFolder?: (folderId: string) => void;
  onManagePermissions?: (folderId: string) => void;
}

export default function FolderContextMenu({
  isOpen,
  position,
  folder,
  onClose,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onExportFolder,
  onManagePermissions
}: FolderContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the context menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close the context menu when pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Adjust position to ensure menu stays within viewport
  const adjustedPosition = () => {
    if (!menuRef.current) return position;
    
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let { x, y } = position;
    
    // Adjust horizontal position if menu would go off-screen
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }
    
    // Adjust vertical position if menu would go off-screen
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }
    
    return { x, y };
  };

  if (!isOpen) return null;

  const { x, y } = adjustedPosition();
  const isRoot = !folder;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-56 py-1 text-sm"
      style={{ left: `${x}px`, top: `${y}px` }}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
    >
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 mb-1">
        {isRoot ? 'All Documents' : folder.name}
      </div>
      
      <button
        className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
        onClick={() => {
          onCreateFolder(isRoot ? null : folder.id);
          onClose();
        }}
        role="menuitem"
      >
        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>New Folder</span>
      </button>
      
      {!isRoot && (
        <>
          {onRenameFolder && (
            <button
              className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                onRenameFolder(folder.id);
                onClose();
              }}
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Rename</span>
            </button>
          )}
          
          {onManagePermissions && (
            <button
              className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                onManagePermissions(folder.id);
                onClose();
              }}
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Manage Permissions</span>
            </button>
          )}
          
          {onExportFolder && (
            <button
              className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                onExportFolder(folder.id);
                onClose();
              }}
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
          )}
          
          <div className="border-t border-gray-100 my-1"></div>
          
          {onDeleteFolder && (
            <button
              className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => {
                onDeleteFolder(folder.id);
                onClose();
              }}
              role="menuitem"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
