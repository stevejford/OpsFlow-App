'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Import all the advanced components that were previously implemented
import NewFolderDialog from '@/components/documents/NewFolderDialog';
import AdvancedSearchComponent from '@/components/documents/AdvancedSearchComponent';
import AIChatInterface from '@/components/documents/AIChatInterface';
import FolderTreeView from '@/components/documents/FolderTreeView';
import DocumentGridView from '@/components/documents/DocumentGridView';
import DocumentListView from '@/components/documents/DocumentListView';
import DocumentTableView from '@/components/documents/DocumentTableView';
import UploadModal from '@/components/documents/UploadModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import ShareDocumentModal from '@/components/documents/ShareDocumentModal';
import PermissionsDialog from '@/components/documents/PermissionsDialog';
import FolderContextMenu from '@/components/documents/FolderContextMenu';
import KeyboardNavigationHelp from '@/components/documents/KeyboardNavigationHelp';
import DocumentSearch from '@/components/documents/DocumentSearch';

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  children?: FolderType[];
}

interface DocumentFileType {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folderId: string | null;
  createdAt: string;
  modifiedAt: string;
  thumbnailUrl?: string;
  tags?: string[];
  description?: string;
}

export default function DocumentsClient() {
  const [mounted, setMounted] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<DocumentFileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'ai'>('browse');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [selectedFolder, setSelectedFolder] = useState<string>('root');
  
  // View and display states
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentFileType[]>([]);
  
  // Modal and operation states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Selection and context states
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [focusedDocumentId, setFocusedDocumentId] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentFileType | null>(null);
  const [shareDocument, setShareDocument] = useState<DocumentFileType | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'folder' | 'document';
    id: string;
    data?: any;
  } | null>(null);
  
  // Breadcrumb navigation
  const [breadcrumbs, setBreadcrumbs] = useState<FolderType[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Initialize default folders
  const initializeDefaultFolders = () => {
    const defaultFolders: FolderType[] = [
      {
        id: 'root',
        name: 'All Documents',
        parentId: null,
        path: '/',
        description: 'Root folder containing all documents',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: []
      },
      {
        id: 'contracts',
        name: 'Contracts',
        parentId: 'root',
        path: '/contracts',
        description: 'Employee contracts and agreements',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: []
      },
      {
        id: 'hr-policies',
        name: 'HR Policies',
        parentId: 'root',
        path: '/hr-policies',
        description: 'Human resources policies and procedures',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: []
      },
      {
        id: 'training-materials',
        name: 'Training Materials',
        parentId: 'root',
        path: '/training-materials',
        description: 'Training documents and resources',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        children: []
      }
    ];
    
    setFolders(defaultFolders);
    setLoading(false);
  };

  // Data fetching functions
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      if (response.ok) {
        const folders = await response.json();
        // Transform the API response to match our FolderType interface
        const transformedFolders = folders.map((folder: any) => ({
          id: folder.id,
          name: folder.name,
          parentId: folder.parent_id,
          path: folder.path,
          description: folder.description || '',
          createdAt: folder.created_at,
          modifiedAt: folder.updated_at,
          children: []
        }));
        setFolders(transformedFolders);
      } else {
        console.error('Failed to fetch folders:', response.statusText);
        setError('Failed to load folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Failed to load folders');
    }
  };

  const fetchDocuments = async (folderId?: string) => {
    try {
      const url = folderId && folderId !== 'root' 
        ? `/api/documents?folderId=${folderId}` 
        : '/api/documents';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents:', response.statusText);
        setError('Failed to load documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    }
  };

  // Fetch folders from API
  const fetchFoldersFromAPI = async () => {
    try {
      const response = await fetch('/api/folders');
      if (response.ok) {
        const data = await response.json();
        // Transform flat folder data into hierarchical structure
        const hierarchicalFolders = buildFolderHierarchy(data);
        setFolders(hierarchicalFolders);
        updateBreadcrumbs(selectedFolder, hierarchicalFolders);
      } else {
        console.log('No folders found, using defaults');
        initializeDefaultFolders();
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      initializeDefaultFolders();
    }
  };

  // Build hierarchical folder structure
  const buildFolderHierarchy = (flatFolders: any[]): FolderType[] => {
    const folderMap = new Map<string, FolderType>();
    const rootFolders: FolderType[] = [];

    // First pass: create all folder objects
    flatFolders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: []
      });
    });

    // Second pass: build hierarchy
    flatFolders.forEach(folder => {
      const folderObj = folderMap.get(folder.id)!;
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children!.push(folderObj);
        }
      } else {
        rootFolders.push(folderObj);
      }
    });

    return rootFolders;
  };

  // Update breadcrumbs based on current folder
  const updateBreadcrumbs = (folderId: string, folderList: FolderType[]) => {
    const breadcrumbPath: FolderType[] = [];
    
    const findPath = (folders: FolderType[], targetId: string, path: FolderType[]): boolean => {
      for (const folder of folders) {
        const currentPath = [...path, folder];
        if (folder.id === targetId) {
          breadcrumbPath.push(...currentPath);
          return true;
        }
        if (folder.children && findPath(folder.children, targetId, currentPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(folderList, folderId, []);
    setBreadcrumbs(breadcrumbPath);
  };

  // Fetch documents from API
  const fetchDocumentsFromAPI = async (folderId: string = 'root') => {
    try {
      const response = await fetch(`/api/documents?folderId=${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        setFilteredDocuments(data);
      } else {
        setDocuments([]);
        setFilteredDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setFilteredDocuments([]);
    }
  };

  // Search and filter documents
  const filterDocuments = (query: string, docs: DocumentFileType[]) => {
    if (!query.trim()) {
      setFilteredDocuments(docs);
      return;
    }

    const filtered = docs.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.type.toLowerCase().includes(query.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) ||
      (doc.description && doc.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredDocuments(filtered);
  };

  // Sort documents
  const sortDocuments = (docs: DocumentFileType[], sortField: string, order: 'asc' | 'desc') => {
    const sorted = [...docs].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.modifiedAt);
          bValue = new Date(b.modifiedAt);
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };

  // Utility function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Transform documents to add missing properties
  const transformDocumentsForView = (docs: DocumentFileType[]) => {
    return docs.map(doc => ({
      ...doc,
      modified: doc.modifiedAt || doc.createdAt,
      size: typeof doc.size === 'number' ? formatFileSize(doc.size) : doc.size
    }));
  };

  // Initialize data on component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const loadData = async () => {
      setLoading(true);
      await fetchFolders();
      await fetchDocuments();
      setLoading(false);
    };
    
    loadData();
  }, [currentFolderId, mounted]);

  // Handle search query changes
  useEffect(() => {
    filterDocuments(searchQuery, documents);
  }, [searchQuery, documents]);

  // Handle sorting changes
  useEffect(() => {
    const sorted = sortDocuments(filteredDocuments, sortBy, sortOrder);
    setFilteredDocuments(sorted);
  }, [sortBy, sortOrder]);

  // Navigation functions
  const navigateToFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedFolder(folderId);
    setSelectedDocuments(new Set());
    fetchDocuments(folderId);
    updateBreadcrumbs(folderId, folders);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Document operations
  const handleDocumentSelection = (id: string, checked: boolean, multiSelect: boolean = false) => {
    const newSelected = new Set(selectedDocuments);
    
    if (!multiSelect) {
      newSelected.clear();
    }
    
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
    }
  };

  const handleOpenDocument = (doc: DocumentFileType) => {
    setPreviewDocument(doc);
    setShowPreviewModal(true);
  };

  const handleShareDocument = (doc: DocumentFileType) => {
    setShareDocument(doc);
    setShowShareModal(true);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const newDocuments = documents.filter(doc => doc.id !== id);
        setDocuments(newDocuments);
        setSelectedDocuments(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (!confirm(`Delete ${selectedDocuments.size} selected documents?`)) return;
    
    try {
      const response = await fetch('/api/documents/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedDocuments) })
      });
      
      if (response.ok) {
        const newDocuments = documents.filter(doc => !selectedDocuments.has(doc.id));
        setDocuments(newDocuments);
        setSelectedDocuments(new Set());
      }
    } catch (error) {
      console.error('Error deleting documents:', error);
    }
  };

  // Context menu handlers
  const handleDocumentContextMenu = (e: React.MouseEvent, doc: DocumentFileType) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'document',
      id: doc.id,
      data: doc
    });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folder: FolderType) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'folder',
      id: folder.id,
      data: folder
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setSelectedDocuments(new Set());
        setFocusedDocumentId(null);
      }
      
      if (e.key === 'Delete' && selectedDocuments.size > 0) {
        handleBatchDelete();
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            handleSelectAll();
            break;
          case 'u':
            e.preventDefault();
            setShowUploadModal(true);
            break;
          case 'n':
            e.preventDefault();
            setShowNewFolderDialog(true);
            break;
          case '/':
            e.preventDefault();
            // Focus search input
            break;
          case '?':
            e.preventDefault();
            setShowKeyboardHelp(true);
            break;
        }
      }
    };

    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedDocuments, filteredDocuments]);

  // Folder operations
  const handleCreateFolder = async (folderData: any) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...folderData,
          parentId: selectedFolder === 'root' ? null : selectedFolder
        })
      });
      
      if (response.ok) {
        await fetchFoldersFromAPI();
        setShowNewFolderDialog(false);
      } else {
        const errorData = await response.json();
        console.error('Error creating folder:', errorData);
        throw new Error(errorData.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;
    
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchFoldersFromAPI();
        if (selectedFolder === folderId) {
          navigateToFolder('root');
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // Upload handlers
  const handleUploadComplete = () => {
    fetchDocumentsFromAPI(currentFolderId);
    setShowUploadModal(false);
  };

  // Transform folders for tree view (add children property)
  const transformFoldersForTreeView = (folders: FolderType[]): FolderType[] => {
    return folders.map(folder => ({
      ...folder,
      children: folders.filter(f => f.parentId === folder.id)
    }));
  };

  // Get root folders for tree view
  const rootFolders = transformFoldersForTreeView(folders).filter(f => f.parentId === null);

  // Handle upload modal events
  useEffect(() => {
    const handleUploadClose = () => {
      setShowUploadModal(false);
    };

    const handleUploadComplete = () => {
      setShowUploadModal(false);
      // Refresh documents after upload
      fetchDocumentsFromAPI();
    };

    if (showUploadModal) {
      window.addEventListener('upload-close', handleUploadClose);
      window.addEventListener('upload-complete', handleUploadComplete);
      
      return () => {
        window.removeEventListener('upload-close', handleUploadClose);
        window.removeEventListener('upload-complete', handleUploadComplete);
      };
    }
  }, [showUploadModal]);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    mounted && (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header with tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-folder-open mr-2"></i>
                Browse
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-search mr-2"></i>
                Advanced Search
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-robot mr-2"></i>
                AI Assistant
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Keyboard shortcuts"
              >
                <i className="fas fa-keyboard"></i>
              </button>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-upload mr-2"></i>
                Upload
              </button>
              
              <button
                onClick={() => setShowNewFolderDialog(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-folder-plus mr-2"></i>
                New Folder
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'browse' && (
            <>
              {/* Sidebar with folder tree */}
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Folders</h3>
                  
                  {/* Breadcrumbs */}
                  {breadcrumbs.length > 0 && (
                    <nav className="flex mb-3" aria-label="Breadcrumb">
                      <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        {breadcrumbs.map((folder, index) => (
                          <li key={folder.id} className="inline-flex items-center">
                            {index > 0 && (
                              <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                            )}
                            <button
                              onClick={() => navigateToFolder(folder.id)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {folder.name}
                            </button>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <FolderTreeView
                    folders={rootFolders}
                    selectedFolderId={selectedFolder}
                    expandedFolders={Array.from(expandedFolders)}
                    onFolderSelect={navigateToFolder}
                    onFolderExpand={(folderId, isExpanded) => {
                      const newExpanded = new Set(expandedFolders);
                      if (isExpanded) {
                        newExpanded.add(folderId);
                      } else {
                        newExpanded.delete(folderId);
                      }
                      setExpandedFolders(newExpanded);
                    }}
                    onContextMenu={(folder, e) => {
                      if (folder) {
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          type: 'folder',
                          id: folder.id,
                          data: folder
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Main document area */}
              <div className="flex-1 flex flex-col">
                {/* Document toolbar */}
                <div className="bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {folders.find(f => f.id === selectedFolder)?.name || 'Documents'}
                      </h2>
                      
                      {selectedDocuments.size > 0 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {selectedDocuments.size} selected
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Search */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search documents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                        />
                        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                      </div>
                      
                      {/* Sort dropdown */}
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-');
                          setSortBy(field as any);
                          setSortOrder(order as any);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="date-desc">Newest first</option>
                        <option value="date-asc">Oldest first</option>
                        <option value="size-desc">Largest first</option>
                        <option value="size-asc">Smallest first</option>
                        <option value="type-asc">Type A-Z</option>
                      </select>
                      
                      {/* View mode toggle */}
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded ${
                            viewMode === 'grid'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="Grid view"
                        >
                          <i className="fas fa-th"></i>
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded ${
                            viewMode === 'list'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="List view"
                        >
                          <i className="fas fa-list"></i>
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`p-2 rounded ${
                            viewMode === 'table'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="Table view"
                        >
                          <i className="fas fa-table"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Batch actions toolbar */}
                  {selectedDocuments.size > 0 && (
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleSelectAll}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {selectedDocuments.size === filteredDocuments.length ? 'Deselect all' : 'Select all'}
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleBatchDelete}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Delete ({selectedDocuments.size})
                        </button>
                        
                        <button
                          onClick={() => setSelectedDocuments(new Set())}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Document content area */}
                <div className="flex-1 overflow-auto p-4">
                  {filteredDocuments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <i className="fas fa-folder-open text-6xl mb-4 text-gray-300"></i>
                      <h3 className="text-lg font-medium mb-2">No documents found</h3>
                      <p className="text-sm text-center">
                        {searchQuery 
                          ? 'Try adjusting your search terms or browse a different folder.'
                          : 'This folder is empty. Upload some documents to get started.'
                        }
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => setShowUploadModal(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <i className="fas fa-upload mr-2"></i>
                          Upload Documents
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {viewMode === 'grid' && (
                        <DocumentGridView
                          documents={transformDocumentsForView(filteredDocuments)}
                          selectedDocumentIds={Array.from(selectedDocuments)}
                          focusedDocumentId={focusedDocumentId}
                          onDocumentSelect="document-select"
                          onDocumentOpen="document-open"
                          onContextMenu="document-context"
                          onKeyDown="document-keydown"
                          documentRefsId="document-refs"
                        />
                      )}
                      
                      {viewMode === 'list' && (
                        <DocumentListView
                          documents={transformDocumentsForView(filteredDocuments)}
                          selectedDocumentIds={Array.from(selectedDocuments)}
                          focusedDocumentId={focusedDocumentId}
                          onDocumentSelect="document-select"
                          onDocumentOpen="document-open"
                          onContextMenu="document-context"
                          onKeyDown="document-keydown"
                          documentRefsId="document-refs"
                        />
                      )}
                      
                      {viewMode === 'table' && (
                        <DocumentTableView
                          documents={transformDocumentsForView(filteredDocuments)}
                          selectedDocumentIds={Array.from(selectedDocuments)}
                          focusedDocumentId={focusedDocumentId}
                          onDocumentSelect="document-select"
                          onDocumentOpen="document-open"
                          onContextMenu="document-context"
                          onKeyDown="document-keydown"
                          documentRefsId="document-refs"
                          sortConfig={{ field: sortBy, direction: sortOrder }}
                          onSortChange={(field, direction) => {
                            setSortBy(field);
                            setSortOrder(direction);
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'search' && (
            <div className="flex-1 p-6">
              <AdvancedSearchComponent
                onSearchResults={(results) => {
                  setDocuments(results);
                  setFilteredDocuments(results);
                }}
                currentFolderId={currentFolderId}
                folders={folders}
              />
            </div>
          )}
          
          {activeTab === 'ai' && (
            <div className="flex-1 p-6">
              <AIChatInterface
                documents={documents}
                currentFolderId={currentFolderId}
                folders={folders}
              />
            </div>
          )}
        </div>

        {/* Modals and dialogs */}
        {showNewFolderDialog && (
          <NewFolderDialog
            isOpen={showNewFolderDialog}
            onClose={() => setShowNewFolderDialog(false)}
            onCreateFolder={handleCreateFolder}
            parentFolderId={currentFolderId}
            parentFolderPath={breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].path : '/'}
            existingFolderNames={folders
              .filter(f => f.parentId === currentFolderId)
              .map(f => f.name)
            }
          />
        )}
        
        {showUploadModal && (
          <UploadModal
            isOpen={showUploadModal}
            onCloseEventName="upload-close"
            onUploadCompleteEventName="upload-complete"
            currentFolderId={currentFolderId}
            availableFolders={folders}
            maxFileSize={100 * 1024 * 1024} // 100MB
            allowedFileTypes={[]} // Allow all file types
          />
        )}
        
        {showPreviewModal && previewDocument && (
          <DocumentPreviewModal
            isOpen={showPreviewModal}
            onClose={() => {
              setShowPreviewModal(false);
              setPreviewDocument(null);
            }}
            document={previewDocument}
          />
        )}
        
        {showShareModal && shareDocument && (
          <ShareDocumentModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setShareDocument(null);
            }}
            document={shareDocument}
          />
        )}
        
        {showPermissionsDialog && (
          <PermissionsDialog
            isOpen={showPermissionsDialog}
            onClose={() => setShowPermissionsDialog(false)}
            resourceId={selectedFolder}
            resourceType="folder"
          />
        )}
        
        {showKeyboardHelp && (
          <KeyboardNavigationHelp
            isOpen={showKeyboardHelp}
            onClose={() => setShowKeyboardHelp(false)}
          />
        )}
        
        {contextMenu && (
          <FolderContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            folder={contextMenu.data}
            onClose={() => setContextMenu(null)}
            onEdit={() => {
              // Handle edit
              setContextMenu(null);
            }}
            onDelete={() => {
              if (contextMenu.type === 'folder') {
                handleDeleteFolder(contextMenu.id);
              } else {
                handleDeleteDocument(contextMenu.id);
              }
              setContextMenu(null);
            }}
            onShare={() => {
              if (contextMenu.type === 'document') {
                handleShareDocument(contextMenu.data);
              }
              setContextMenu(null);
            }}
            onPermissions={() => {
              setShowPermissionsDialog(true);
              setContextMenu(null);
            }}
          />
        )}
      </div>
    )
  );
}
