'use client';

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  children: Folder[];
}

interface FolderTreeViewProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  onFolderExpand?: (folderId: string, isExpanded: boolean) => void;
  onContextMenu?: (folder: Folder | null, e: React.MouseEvent) => void;
  onCreateFolder?: (parentId: string | null) => void;
  className?: string;
  expandedFolders?: Set<string> | string[];
}

export default function FolderTreeView({
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderExpand,
  onContextMenu,
  onCreateFolder,
  className,
  expandedFolders: initialExpandedFolders = []
}: FolderTreeViewProps) {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    initialExpandedFolders instanceof Set 
      ? initialExpandedFolders 
      : new Set(initialExpandedFolders)
  );
  const [focusedFolderId, setFocusedFolderId] = useState<string | null>(null);
  const folderRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Find root folders (those with no parent)
  const rootFolders = folders.filter(folder => folder.parentId === null);

  // Flatten folder structure for keyboard navigation
  const flattenedFolders = useRef<Folder[]>([]);
  
  useEffect(() => {
    const flattened: Folder[] = [];
    
    const flatten = (folderList: Folder[]) => {
      folderList.forEach(folder => {
        flattened.push(folder);
        if (folder.children.length > 0 && expandedFolderIds.has(folder.id)) {
          flatten(folder.children);
        }
      });
    };
    
    flatten(rootFolders);
    flattenedFolders.current = flattened;
  }, [rootFolders, expandedFolderIds]);

  const toggleFolder = (folderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    setExpandedFolderIds(prev => {
      const newExpanded = new Set(prev);
      const isCurrentlyExpanded = newExpanded.has(folderId);
      
      if (isCurrentlyExpanded) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      
      if (onFolderExpand) {
        onFolderExpand(folderId, !isCurrentlyExpanded);
      }
      
      return newExpanded;
    });
  };

  // Auto-expand parent folders of the selected folder
  useEffect(() => {
    if (!selectedFolderId) return;
    
    const expandParents = (folderId: string) => {
      const folder = folders.find(f => f.id === folderId);
      if (folder && folder.parentId) {
        setExpandedFolderIds(prev => {
          const newExpanded = new Set(prev);
          newExpanded.add(folder.parentId!);
          return newExpanded;
        });
        expandParents(folder.parentId);
      }
    };
    
    expandParents(selectedFolderId);
    setFocusedFolderId(selectedFolderId);
  }, [selectedFolderId, folders]);

  // Scroll focused folder into view
  useEffect(() => {
    if (focusedFolderId) {
      const element = folderRefs.current.get(focusedFolderId);
      if (element) {
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        element.focus();
      }
    }
  }, [focusedFolderId]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, folder: Folder) => {
    e.stopPropagation();
    
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const currentIndex = flattenedFolders.current.findIndex(f => f.id === folder.id);
        if (currentIndex < flattenedFolders.current.length - 1) {
          setFocusedFolderId(flattenedFolders.current[currentIndex + 1].id);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const currentIndex = flattenedFolders.current.findIndex(f => f.id === folder.id);
        if (currentIndex > 0) {
          setFocusedFolderId(flattenedFolders.current[currentIndex - 1].id);
        }
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (folder.children.length > 0 && !expandedFolderIds.has(folder.id)) {
          toggleFolder(folder.id);
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (expandedFolderIds.has(folder.id)) {
          toggleFolder(folder.id);
        } else if (folder.parentId) {
          setFocusedFolderId(folder.parentId);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        onFolderSelect(folder.id);
        break;
      }
    }
  };

  const handleRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (flattenedFolders.current.length > 0) {
          setFocusedFolderId(flattenedFolders.current[0].id);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        onFolderSelect('root');
        break;
      }
    }
  };

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedFolderIds.has(folder.id);
    const isSelected = folder.id === selectedFolderId;
    const isFocused = folder.id === focusedFolderId;
    const hasChildren = folder.children.length > 0;
    
    return (
      <div key={folder.id} className="select-none">
        <div 
          ref={el => el && folderRefs.current.set(folder.id, el)}
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer transition-colors group",
            isSelected ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100",
            isFocused && !isSelected && "ring-2 ring-blue-300",
            depth > 0 && "ml-4"
          )}
          onClick={() => onFolderSelect(folder.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onContextMenu) onContextMenu(folder, e);
          }}
          onKeyDown={(e) => handleKeyDown(e, folder)}
          tabIndex={0}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={isSelected}
          aria-level={depth + 1}
        >
          <div 
            className="mr-1 w-4 h-4 flex items-center justify-center"
            onClick={(e) => hasChildren && toggleFolder(folder.id, e)}
          >
            {hasChildren && (
              <svg 
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded ? "transform rotate-90" : ""
                )}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </div>
          
          <svg 
            className={cn(
              "w-5 h-5 mr-2 transition-colors", 
              isSelected ? "text-blue-500" : "text-gray-500"
            )}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          
          <span className="flex-1 truncate text-sm">
            {folder.name}
          </span>
          
          {onCreateFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(folder.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-opacity"
              title="Create subfolder"
              aria-label={`Create subfolder in ${folder.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-2 pl-2 border-l border-gray-200" role="group">
            {folder.children.map(childFolder => renderFolder(childFolder, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={cn("py-2", className)}
      role="tree"
      aria-label="Folder navigation"
    >
      {/* Root level */}
      <div 
        ref={el => el && folderRefs.current.set('root', el)}
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer transition-colors mb-1 group",
          selectedFolderId === 'root' ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100",
          focusedFolderId === 'root' && selectedFolderId !== 'root' && "ring-2 ring-blue-300"
        )}
        onClick={() => onFolderSelect('root')}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onContextMenu) onContextMenu(null, e);
        }}
        onKeyDown={handleRootKeyDown}
        tabIndex={0}
        role="treeitem"
        aria-selected={selectedFolderId === 'root'}
        aria-level={1}
      >
        <svg 
          className={cn(
            "w-5 h-5 mr-2 transition-colors",
            selectedFolderId === 'root' ? "text-blue-500" : "text-gray-500"
          )}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="flex-1 truncate text-sm font-medium">All Documents</span>
        
        {onCreateFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder(null);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-opacity"
            title="Create folder"
            aria-label="Create root level folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Folders */}
      {rootFolders.map(folder => renderFolder(folder))}
      
      {rootFolders.length === 0 && (
        <div className="py-2 px-3 text-sm text-gray-500 italic">
          No folders yet
        </div>
      )}
    </div>
  );
}
