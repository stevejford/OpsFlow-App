'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import AdvancedSearchComponent from '@/components/documents/AdvancedSearchComponent';
import AIChatInterface from '@/components/documents/AIChatInterface';
import UploadModal from '@/components/documents/UploadModal';
import NewFolderDialog from '@/components/documents/NewFolderDialog';
import { cn } from '@/lib/utils';
import { Document, FolderType } from '@/types/document';

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  createdAt: string;
  modifiedAt: string;
}

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folderId: string | null;
  createdAt: string;
  modifiedAt: string;
}

export default function DocumentsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management - use safe defaults to prevent hydration errors
  const [activeTab, setActiveTab] = useState('browse');
  const [currentFolder, setCurrentFolder] = useState('root');
  const [currentPath, setCurrentPath] = useState('All Documents');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<{x: number, y: number, type: 'folder' | 'document', id: string} | null>(null);
  
  // Real data state
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
    // Set state from URL params after mounting
    const tab = searchParams.get('tab') || 'browse';
    const folder = searchParams.get('folder') || 'root';
    setActiveTab(tab);
    setCurrentFolder(folder);
  }, [searchParams]);

  // Load folders and documents
  useEffect(() => {
    if (mounted) {
      loadFolders();
      loadDocuments();
    }
  }, [mounted, currentFolder]);

  // Listen for upload completion events
  useEffect(() => {
    const handleUploadComplete = (event: CustomEvent) => {
      const uploadedFiles = event.detail;
      const newDocuments: Document[] = uploadedFiles.map((file: any) => ({
        id: file.fileKey,
        name: file.fileName,
        type: file.fileName.split('.').pop()?.toLowerCase() || 'unknown',
        size: `${Math.round(file.size / 1024)} KB`,
        modified: new Date().toLocaleDateString(),
        modifiedBy: 'current-user',
        createdAt: new Date().toISOString(),
        url: file.fileUrl,
        folderId: currentFolder
      }));
      
      // Create documents in database
      newDocuments.forEach(async (doc) => {
        try {
          await fetch('/api/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              folder_id: doc.folderId,
              name: doc.name,
              type: doc.type,
              size: parseInt(doc.size.replace(' KB', '')) * 1024,
              file_url: doc.url,
              notes: ''
            })
          });
        } catch (error) {
          console.error('Error saving document to database:', error);
        }
      });
      
      setDocuments(prev => [...prev, ...newDocuments]);
      setShowUploadModal(false);
      loadDocuments(); // Reload to get proper database IDs
    };

    const handleModalClose = () => {
      setShowUploadModal(false);
    };

    window.addEventListener('upload-complete', handleUploadComplete as EventListener);
    window.addEventListener('upload-modal-close', handleModalClose);

    return () => {
      window.removeEventListener('upload-complete', handleUploadComplete as EventListener);
      window.removeEventListener('upload-modal-close', handleModalClose);
    };
  }, [currentFolder]);

  // Load folders from API
  const loadFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      if (response.ok) {
        const foldersData = await response.json();
        setFolders(foldersData);
      } else {
        // Fallback to default folders if API fails
        initializeDefaultFolders();
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      initializeDefaultFolders();
    }
  };

  // Load documents from API
  const loadDocuments = async () => {
    try {
      if (currentFolder === 'root') {
        // For root, we might want to show all documents or handle differently
        setDocuments([]);
        return;
      }
      
      const response = await fetch(`/api/documents?folderId=${currentFolder}`);
      if (response.ok) {
        const documentsData = await response.json();
        const formattedDocs = documentsData.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: `${Math.round(doc.size / 1024)} KB`,
          modified: new Date(doc.upload_date).toLocaleDateString(),
          modifiedBy: doc.uploaded_by || 'Unknown',
          createdAt: doc.upload_date,
          url: doc.file_url,
          folderId: doc.folder_id
        }));
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showContextMenu) {
        setShowContextMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showContextMenu) {
        setShowContextMenu(null);
      }
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showContextMenu]);

  // Initialize default folders
  const initializeDefaultFolders = () => {
    const defaultFolders: FolderType[] = [
      {
        id: 'root',
        name: 'All Documents',
        parentId: null,
        path: '/',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      },
      {
        id: 'contracts',
        name: 'Contracts',
        parentId: 'root',
        path: '/contracts',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      },
      {
        id: 'hr-policies',
        name: 'HR Policies',
        parentId: 'root',
        path: '/hr-policies',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      },
      {
        id: 'invoices',
        name: 'Invoices',
        parentId: 'root',
        path: '/invoices',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      },
      {
        id: 'training',
        name: 'Training',
        parentId: 'root',
        path: '/training',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      }
    ];
    
    setFolders(defaultFolders);
    setLoading(false);
  };

  // Create new folder
  const handleCreateFolder = async (folderData: { 
    name: string; 
    description: string;
    inheritPermissions: boolean;
    isPrivate: boolean;
  }) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderData.name,
          parent_id: currentFolder === 'root' ? null : currentFolder,
          path: currentFolder === 'root' ? `/${folderData.name}` : `${getCurrentPath()}/${folderData.name}`,
          description: folderData.description || ''
        })
      });

      if (response.ok) {
        const newFolder = await response.json();
        setFolders(prev => [...prev, {
          id: newFolder.id,
          name: newFolder.name,
          parentId: newFolder.parent_id,
          path: newFolder.path,
          createdAt: newFolder.created_at,
          modifiedAt: newFolder.updated_at
        }]);
        setShowNewFolderDialog(false);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) {
      return;
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        // If we're currently in the deleted folder, navigate to parent
        if (currentFolder === folderId) {
          const folder = folders.find(f => f.id === folderId);
          setCurrentFolder(folder?.parentId || 'root');
        }
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError('Failed to delete folder');
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== documentId));
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    }
  };

  // Batch delete documents
  const handleBatchDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      return;
    }

    try {
      const response = await fetch('/api/documents/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          documentIds: selectedDocuments
        })
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(d => !selectedDocuments.includes(d.id)));
        setSelectedDocuments([]);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete documents');
      }
    } catch (error) {
      console.error('Error deleting documents:', error);
      setError('Failed to delete documents');
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'document', id: string) => {
    e.preventDefault();
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      id
    });
  };

  // Close context menu
  useEffect(() => {
    const handleClick = () => setShowContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Get current path for breadcrumbs
  const getCurrentPath = (): string => {
    if (currentFolder === 'root') return '/';
    const folder = folders.find(f => f.id === currentFolder);
    return folder?.path || '/';
  };

  // Get folders for current parent
  const getCurrentFolders = () => {
    return folders.filter(folder => folder.parentId === currentFolder);
  };

  // Get documents for current folder
  const getCurrentDocuments = () => {
    return documents.filter(doc => doc.folderId === currentFolder);
  };

  // Handle folder expansion
  const toggleFolderExpansion = (folderId: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderId)) {
      newExpandedFolders.delete(folderId);
    } else {
      newExpandedFolders.add(folderId);
    }
    setExpandedFolders(newExpandedFolders);
  };

  // Render folder tree
  const renderFolderTree = (folderList: FolderType[], level = 0) => {
    return folderList.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const isActive = currentFolder === folder.id;
      const childFolders = folders.filter(f => f.parentId === folder.id);
      const hasChildren = childFolders.length > 0;
      const documentCount = documents.filter(doc => doc.folderId === folder.id).length;

      return (
        <div key={folder.id} className="space-y-1">
          <button
            onClick={() => navigateToFolder(folder.id)}
            onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id)}
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
              isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {hasChildren && (
              <svg
                className={cn(
                  "w-4 h-4 mr-1 transition-transform",
                  isExpanded ? "transform rotate-90" : ""
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            )}
            
            <svg
              className={cn(
                "w-4 h-4 mr-2",
                isActive ? "text-blue-600" : "text-gray-500"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            
            <span className="flex-1">{folder.name}</span>
            
            {documentCount > 0 && (
              <span className={cn(
                "ml-auto text-xs",
                isActive ? "text-blue-600" : "text-gray-500"
              )}>
                {documentCount}
              </span>
            )}
          </button>
          
          {hasChildren && isExpanded && (
            <div className="ml-6 space-y-1">
              {renderFolderTree(childFolders, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Tab configuration
  const tabs = [
    { id: 'browse', label: 'Browse', icon: 'fas fa-folder' },
    { id: 'search', label: 'Advanced Search', icon: 'fas fa-search' },
    { id: 'ai-chat', label: 'AI Assistant', icon: 'fas fa-robot' }
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`/documents?${params.toString()}`);
  };

  // Current folder path from URL or default to All Documents
  const currentFolderId = searchParams.get('folder') || 'root';
  
  // Get breadcrumb path for current folder
  const getBreadcrumbPath = () => {
    // In a real app, this would be derived from the folder structure
    return [
      { id: 'root', name: 'All Documents' },
      { id: 'hr-policies', name: 'HR Policies' },
      { id: 'employee-handbooks', name: 'Employee Handbooks' }
    ];
  };
  
  // Navigate to folder
  const navigateToFolder = (folderId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('folder', folderId);
    router.push(`/documents?${params.toString()}`);
  };

  // Toggle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  // Toggle all documents selection
  const toggleAllDocuments = () => {
    setSelectedDocuments(prev => 
      prev.length === documents.length ? [] : documents.map(doc => doc.id)
    );
  };

  // Render documents grid
  const renderDocumentsGrid = () => {
    const currentDocs = getCurrentDocuments();
    
    if (currentDocs.length === 0) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <Icon name="fas fa-folder-open" className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No documents in this folder</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload Documents
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentDocs.map((document) => (
            <div
              key={document.id}
              className={cn(
                "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative",
                selectedDocuments.includes(document.id) ? "ring-2 ring-blue-500" : ""
              )}
              onClick={() => toggleDocumentSelection(document.id)}
              onContextMenu={(e) => handleContextMenu(e, 'document', document.id)}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(document.id)}
                  onChange={() => toggleDocumentSelection(document.id)}
                  className="rounded border-gray-300"
                />
              </div>

              {/* Document icon */}
              <div className="flex justify-center mb-3 mt-6">
                <Icon 
                  name={getDocumentIcon(document.type)} 
                  className="text-4xl text-blue-600" 
                />
              </div>
              
              {/* Document info */}
              <div className="text-center">
                <h3 className="font-medium text-gray-900 truncate mb-1">
                  {document.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">{document.size}</p>
                <p className="text-xs text-gray-400">
                  Modified {document.modified}
                </p>
              </div>

              {/* Quick actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(document.url, '_blank');
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Open document"
                >
                  <Icon name="fas fa-external-link-alt" className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render documents list
  const renderDocumentsList = () => {
    const currentDocs = getCurrentDocuments();
    
    if (currentDocs.length === 0) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <Icon name="fas fa-folder-open" className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No documents in this folder</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload Documents
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedDocuments.length === currentDocs.length && currentDocs.length > 0}
                onChange={toggleAllDocuments}
                className="rounded border-gray-300 mr-4"
              />
              <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-gray-700">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>
          
          {/* Table body */}
          <div className="divide-y divide-gray-200">
            {currentDocs.map((document) => (
              <div
                key={document.id}
                className={cn(
                  "px-6 py-4 hover:bg-gray-50 cursor-pointer",
                  selectedDocuments.includes(document.id) ? "bg-blue-50" : ""
                )}
                onClick={() => toggleDocumentSelection(document.id)}
                onContextMenu={(e) => handleContextMenu(e, 'document', document.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => toggleDocumentSelection(document.id)}
                    className="rounded border-gray-300 mr-4"
                  />
                  <div className="grid grid-cols-12 gap-4 w-full">
                    <div className="col-span-5 flex items-center">
                      <Icon 
                        name={getDocumentIcon(document.type)} 
                        className="text-blue-600 mr-3" 
                      />
                      <span className="font-medium text-gray-900 truncate">
                        {document.name}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {document.size}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500 capitalize">
                      {document.type}
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {document.modified}
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(document.url, '_blank');
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Open document"
                      >
                        <Icon name="fas fa-external-link-alt" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Get document icon based on file type
  const getDocumentIcon = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pdf')) return 'fas fa-file-pdf';
    if (lowerType.includes('doc') || lowerType.includes('word')) return 'fas fa-file-word';
    if (lowerType.includes('xls') || lowerType.includes('excel')) return 'fas fa-file-excel';
    if (lowerType.includes('ppt') || lowerType.includes('powerpoint')) return 'fas fa-file-powerpoint';
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return 'fas fa-file-image';
    if (lowerType.includes('video')) return 'fas fa-file-video';
    if (lowerType.includes('audio')) return 'fas fa-file-audio';
    if (lowerType.includes('zip') || lowerType.includes('rar')) return 'fas fa-file-archive';
    return 'fas fa-file';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!mounted ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Organize, search, and manage your documents with AI assistance
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center',
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <i className={`${tab.icon} mr-2`}></i>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Folders</h3>
                    <div className="space-y-2">
                      {renderFolderTree(folders.filter(f => f.parentId === null))}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  {/* Breadcrumb */}
                  <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                      <li className="inline-flex items-center">
                        <Link href="/documents" className="text-gray-700 hover:text-blue-600">
                          <Icon name="home" className="w-4 h-4" />
                        </Link>
                      </li>
                      {currentPath.split('/').filter(Boolean).map((segment, index, array) => (
                        <li key={index}>
                          <div className="flex items-center">
                            <Icon name="chevron-right" className="w-4 h-4 text-gray-400 mx-1" />
                            <span className={cn(
                              "text-sm font-medium",
                              index === array.length - 1 ? "text-gray-500" : "text-gray-700 hover:text-blue-600"
                            )}>
                              {segment}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </nav>

                  {/* Toolbar */}
                  <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Search */}
                      <div className="flex-1 max-w-lg">
                        <div className="relative">
                          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* View Controls */}
                      <div className="flex items-center space-x-4">
                        {/* New Folder Button */}
                        <button
                          onClick={() => setShowNewFolderDialog(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                        >
                          <Icon name="fas fa-folder-plus" className="w-4 h-4" />
                          <span>New Folder</span>
                        </button>

                        {/* Upload Button */}
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                          <Icon name="fas fa-upload" className="w-4 h-4" />
                          <span>Upload</span>
                        </button>

                        {/* Batch Actions */}
                        {selectedDocuments.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {selectedDocuments.length} selected
                            </span>
                            <button
                              onClick={handleBatchDelete}
                              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                            >
                              <Icon name="fas fa-trash" className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}

                        {/* Sort */}
                        <select
                          value={`${sortBy}-${sortOrder}`}
                          onChange={(e) => {
                            const [field, order] = e.target.value.split('-');
                            setSortBy(field as 'name' | 'modified' | 'size');
                            setSortOrder(order as 'asc' | 'desc');
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="name-asc">Name A-Z</option>
                          <option value="name-desc">Name Z-A</option>
                          <option value="modified-desc">Recently Modified</option>
                          <option value="modified-asc">Oldest First</option>
                          <option value="size-desc">Largest First</option>
                          <option value="size-asc">Smallest First</option>
                        </select>

                        {/* View Mode */}
                        <div className="flex border border-gray-300 rounded-lg">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                              "px-3 py-2 text-sm rounded-l-lg",
                              viewMode === 'grid' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <Icon name="fas fa-th" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                              "px-3 py-2 text-sm rounded-r-lg border-l border-gray-300",
                              viewMode === 'list' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <Icon name="fas fa-list" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Grid/List */}
                  <div className="bg-white rounded-lg shadow">
                    {viewMode === 'grid' ? renderDocumentsGrid() : renderDocumentsList()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <AdvancedSearchComponent />
            )}

            {activeTab === 'ai-chat' && (
              <AIChatInterface />
            )}
          </div>
        </>
      )}

      {/* Upload Modal - Always render to avoid hook order issues */}
      <UploadModal
        isOpen={showUploadModal && mounted}
        onCloseEventName="upload-modal-close"
        onUploadCompleteEventName="upload-complete"
        currentFolderId={currentFolder}
        availableFolders={folders}
        maxFileSize={100 * 1024 * 1024} // 100MB
        allowedFileTypes={['application/pdf', 'image/*', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
      />

      {/* New Folder Dialog */}
      <NewFolderDialog
        isOpen={showNewFolderDialog}
        onClose={() => setShowNewFolderDialog(false)}
        onCreateFolder={handleCreateFolder}
        parentFolderId={currentFolder}
        parentFolderPath={getCurrentPath()}
        existingFolderNames={getCurrentFolders().map(f => f.name)}
      />

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: showContextMenu.x,
            top: showContextMenu.y,
          }}
        >
          {showContextMenu.type === 'folder' ? (
            <>
              <button
                onClick={() => {
                  // Navigate to folder
                  setCurrentFolder(showContextMenu.id);
                  setShowContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Icon name="fas fa-folder-open" className="mr-2" />
                Open
              </button>
              <button
                onClick={() => {
                  handleDeleteFolder(showContextMenu.id);
                  setShowContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <Icon name="fas fa-trash" className="mr-2" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  const doc = documents.find(d => d.id === showContextMenu.id);
                  if (doc) window.open(doc.url, '_blank');
                  setShowContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Icon name="fas fa-external-link-alt" className="mr-2" />
                Open
              </button>
              <button
                onClick={() => {
                  const doc = documents.find(d => d.id === showContextMenu.id);
                  if (doc) {
                    const link = document.createElement('a');
                    link.href = doc.url;
                    link.download = doc.name;
                    link.click();
                  }
                  setShowContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Icon name="fas fa-download" className="mr-2" />
                Download
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  handleDeleteDocument(showContextMenu.id);
                  setShowContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <Icon name="fas fa-trash" className="mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <Icon name="fas fa-exclamation-triangle" className="mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <Icon name="fas fa-times" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
