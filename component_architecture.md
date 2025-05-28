# Component Architecture Guide - Document Management System

## Component Design Philosophy

The component architecture for our document management system extends the established OpsFlow patterns while introducing specialized components for hierarchical data display, file management, and AI interaction. Understanding the architectural principles will help you build components that integrate seamlessly while providing the complex functionality that document management requires.

Our component design follows a composition-over-inheritance approach where complex interfaces are built by combining smaller, specialized components rather than creating monolithic components that handle multiple responsibilities. This approach makes individual components easier to test, maintain, and reuse while creating consistent user experiences across different parts of the document management system.

The separation between smart and presentational components remains central to our architecture, with smart components handling data fetching, state management, and business logic while presentational components focus on rendering and user interaction. This separation becomes particularly important in document management where the same data might need to be displayed in multiple formats such as list views, tree structures, and search results.

State management follows the established URL-based pattern for navigation and modal states while using React hooks for component-specific state that does not need to persist across page loads. Document management introduces some unique state challenges around folder navigation, file selection, and upload progress that require careful coordination between multiple components.

## Hierarchical Navigation Components

The folder tree navigation represents one of the most complex interface challenges in document management because it needs to handle both shallow and deep hierarchies efficiently while providing intuitive interaction patterns. The tree component design breaks down into several specialized sub-components that work together to create a responsive, accessible navigation experience.

### FolderTreeView Component

The main FolderTreeView component manages the overall tree structure and coordinates interactions between tree nodes. This component handles the recursive rendering of folder hierarchies while implementing performance optimizations like virtualization for large folder structures and lazy loading for deeply nested hierarchies.

```typescript
interface FolderTreeViewProps {
  folders: FolderHierarchy[];
  selectedFolderId?: string;
  onFolderSelect: (folderId: string) => void;
  onFolderExpand: (folderId: string) => void;
  onFolderContextMenu: (folderId: string, event: React.MouseEvent) => void;
  expandedFolders: Set<string>;
  permissions: Record<string, FolderPermissions>;
}

// The component handles complex interaction patterns
export function FolderTreeView({ folders, selectedFolderId, onFolderSelect, ...props }: FolderTreeViewProps) {
  // State management for tree expansion and selection
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  
  // Keyboard navigation support for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent, folderId: string) => {
    switch (event.key) {
      case 'ArrowRight':
        // Expand folder or move to first child
        handleFolderExpansion(folderId, true);
        break;
      case 'ArrowLeft':
        // Collapse folder or move to parent
        handleFolderCollapse(folderId);
        break;
      case 'Enter':
      case ' ':
        // Select folder
        onFolderSelect(folderId);
        break;
    }
  }, [onFolderSelect]);
  
  // Drag and drop handling for folder reorganization
  const handleDragStart = useCallback((folderId: string) => {
    setDraggedFolder(folderId);
  }, []);
  
  return (
    <div className="folder-tree-view" role="tree">
      {folders.map(folder => (
        <FolderTreeNode
          key={folder.id}
          folder={folder}
          level={0}
          isSelected={folder.id === selectedFolderId}
          isExpanded={props.expandedFolders.has(folder.id)}
          onSelect={onFolderSelect}
          onExpand={props.onFolderExpand}
          onKeyDown={handleKeyDown}
          onDragStart={handleDragStart}
          permissions={props.permissions[folder.id]}
        />
      ))}
    </div>
  );
}
```

The FolderTreeView component implements several performance optimizations that become important as folder hierarchies grow. Virtual scrolling techniques render only visible tree nodes when dealing with hundreds or thousands of folders, while lazy loading capabilities fetch child folders on-demand rather than loading entire hierarchies upfront.

Accessibility support includes comprehensive keyboard navigation that follows standard tree widget patterns, with arrow keys for navigation, Enter and Space for selection, and appropriate ARIA attributes for screen reader compatibility. The tree supports both single and multiple selection modes depending on the operational context.

### FolderTreeNode Component

Individual tree nodes handle the display and interaction for single folders while supporting the recursive structure needed for hierarchical display. Each node manages its own expansion state and visual indicators while coordinating with the parent tree component for selection and navigation operations.

```typescript
interface FolderTreeNodeProps {
  folder: FolderNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (folderId: string) => void;
  onExpand: (folderId: string) => void;
  onKeyDown: (event: React.KeyboardEvent, folderId: string) => void;
  permissions: FolderPermissions;
}

export function FolderTreeNode({ folder, level, isSelected, isExpanded, ...props }: FolderTreeNodeProps) {
  // Visual indicators for folder state
  const hasChildren = folder.children && folder.children.length > 0;
  const canExpand = hasChildren && props.permissions.canRead;
  
  // Conditional rendering based on permissions and state
  return (
    <div 
      className={cn(
        "folder-tree-node",
        "flex items-center py-1 px-2 rounded cursor-pointer",
        isSelected && "bg-blue-100 dark:bg-blue-900",
        !props.permissions.canRead && "opacity-50"
      )}
      style={{ marginLeft: `${level * 16}px` }}
      onClick={() => props.onSelect(folder.id)}
      onKeyDown={(e) => props.onKeyDown(e, folder.id)}
      role="treeitem"
      aria-expanded={canExpand ? isExpanded : undefined}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
    >
      {/* Expansion toggle for folders with children */}
      {canExpand && (
        <button
          className="w-4 h-4 flex items-center justify-center mr-1"
          onClick={(e) => {
            e.stopPropagation();
            props.onExpand(folder.id);
          }}
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
        >
          <ChevronRight 
            size={12} 
            className={cn(
              "transition-transform",
              isExpanded && "rotate-90"
            )} 
          />
        </button>
      )}
      
      {/* Folder icon with visual state indicators */}
      <FolderIcon 
        size={16} 
        className={cn(
          "mr-2",
          isExpanded ? "text-blue-600" : "text-gray-600"
        )} 
      />
      
      {/* Folder name with overflow handling */}
      <span 
        className="flex-1 truncate text-sm"
        title={folder.name}
      >
        {folder.name}
      </span>
      
      {/* Permission and state indicators */}
      <div className="flex items-center ml-2 space-x-1">
        {!props.permissions.canWrite && (
          <Lock size={12} className="text-gray-400" />
        )}
        {folder.documentCount > 0 && (
          <span className="text-xs text-gray-500">
            {folder.documentCount}
          </span>
        )}
      </div>
    </div>
  );
}
```

The node component handles the complex visual states that folders can have including selection, expansion, permission restrictions, and loading states. The styling system uses conditional classes that provide clear visual feedback while maintaining consistency with the overall application design system.

Interaction handling includes preventing event bubbling for expansion toggles, supporting context menu operations through right-click events, and coordinating drag-and-drop operations for folder reorganization. The component ensures that all interactions respect permission boundaries by disabling or hiding functionality that the current user cannot perform.

## Document List and Grid Components

Document display components need to handle multiple view modes including list, grid, and tile layouts while supporting the complex interactions that users expect from modern file management interfaces. The component architecture separates display logic from interaction handling to enable consistent behavior across different view modes.

### DocumentListView Component

The list view provides detailed information about documents in a tabular format that supports sorting, filtering, and bulk operations. This component handles the complex state management needed for selection, sorting, and inline editing while maintaining performance with large document collections.

```typescript
interface DocumentListViewProps {
  documents: DocumentItem[];
  selectedDocuments: Set<string>;
  onDocumentSelect: (documentId: string, selected: boolean) => void;
  onDocumentOpen: (documentId: string) => void;
  onDocumentContextMenu: (documentId: string, event: React.MouseEvent) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  permissions: Record<string, DocumentPermissions>;
}

export function DocumentListView({ documents, selectedDocuments, ...props }: DocumentListViewProps) {
  // Table state management for sorting and column display
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    size: true,
    modified: true,
    author: true,
    type: true
  });
  
  // Keyboard navigation for accessibility
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent, documentId: string) => {
    switch (event.key) {
      case 'Enter':
        props.onDocumentOpen(documentId);
        break;
      case ' ':
        event.preventDefault();
        const isSelected = selectedDocuments.has(documentId);
        props.onDocumentSelect(documentId, !isSelected);
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        // Navigate between documents
        event.preventDefault();
        handleArrowNavigation(event.key, documentId);
        break;
    }
  }, [selectedDocuments, props.onDocumentSelect, props.onDocumentOpen]);
  
  return (
    <div className="document-list-view">
      {/* Column header with sorting controls */}
      <div className="document-list-header grid grid-cols-12 gap-4 p-3 border-b bg-gray-50 dark:bg-gray-800">
        <div className="col-span-1">
          <Checkbox
            checked={selectedDocuments.size === documents.length && documents.length > 0}
            indeterminate={selectedDocuments.size > 0 && selectedDocuments.size < documents.length}
            onChange={(checked) => handleSelectAll(checked)}
            aria-label="Select all documents"
          />
        </div>
        
        <SortableHeader
          label="Name"
          sortKey="name"
          currentSort={props.sortConfig}
          onSortChange={props.onSortChange}
          className="col-span-4"
        />
        
        <SortableHeader
          label="Size"
          sortKey="size"
          currentSort={props.sortConfig}
          onSortChange={props.onSortChange}
          className="col-span-2"
        />
        
        <SortableHeader
          label="Modified"
          sortKey="modified"
          currentSort={props.sortConfig}
          onSortChange={props.onSortChange}
          className="col-span-3"
        />
        
        <SortableHeader
          label="Type"
          sortKey="type"
          currentSort={props.sortConfig}
          onSortChange={props.onSortChange}
          className="col-span-2"
        />
      </div>
      
      {/* Document rows with virtualization for performance */}
      <div className="document-list-body">
        {documents.map(document => (
          <DocumentListRow
            key={document.id}
            document={document}
            isSelected={selectedDocuments.has(document.id)}
            isFocused={focusedRow === document.id}
            onSelect={props.onDocumentSelect}
            onOpen={props.onDocumentOpen}
            onContextMenu={props.onDocumentContextMenu}
            onKeyDown={handleKeyDown}
            permissions={props.permissions[document.id]}
          />
        ))}
      </div>
    </div>
  );
}
```

The list view component implements several advanced interaction patterns including multi-select with keyboard shortcuts, bulk operations through header controls, and inline editing for document properties. The selection model supports both individual item selection and range selection using Shift+click patterns that users expect from desktop applications.

Performance optimizations include virtual scrolling for large document collections and intelligent re-rendering that updates only changed items when document metadata is modified. The component also implements efficient sorting and filtering that works with large datasets without blocking the user interface.

### DocumentGridView Component

The grid view presents documents as cards or tiles that emphasize visual recognition through thumbnails and icons while supporting the same interaction patterns as the list view. This component balances visual appeal with information density to help users quickly identify documents through visual cues.

```typescript
interface DocumentGridViewProps {
  documents: DocumentItem[];
  selectedDocuments: Set<string>;
  onDocumentSelect: (documentId: string, selected: boolean) => void;
  onDocumentOpen: (documentId: string) => void;
  viewMode: 'small' | 'medium' | 'large';
  permissions: Record<string, DocumentPermissions>;
}

export function DocumentGridView({ documents, selectedDocuments, viewMode, ...props }: DocumentGridViewProps) {
  // Grid layout calculations based on view mode
  const gridColumns = useMemo(() => {
    switch (viewMode) {
      case 'small': return 'grid-cols-8';
      case 'medium': return 'grid-cols-6';
      case 'large': return 'grid-cols-4';
      default: return 'grid-cols-6';
    }
  }, [viewMode]);
  
  // Drag and drop state for file operations
  const [draggedItems, setDraggedItems] = useState<Set<string>>(new Set());
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  
  return (
    <div className={cn("document-grid-view grid gap-4 p-4", gridColumns)}>
      {documents.map(document => (
        <DocumentGridCard
          key={document.id}
          document={document}
          isSelected={selectedDocuments.has(document.id)}
          viewMode={viewMode}
          onSelect={props.onDocumentSelect}
          onOpen={props.onDocumentOpen}
          permissions={props.permissions[document.id]}
        />
      ))}
    </div>
  );
}
```

The grid view adapts to different screen sizes and user preferences through responsive design techniques that adjust card sizes and grid columns based on available space. The component maintains consistent interaction patterns across different view modes so users can switch between list and grid views without learning new interaction methods.

## File Upload and Processing Components

File upload components handle the complex process of adding documents to folders while providing clear feedback about upload progress, processing status, and any errors that occur during the upload process. These components coordinate with UploadThing while managing the user experience throughout the upload lifecycle.

### FileUploadZone Component

The upload zone provides both drag-and-drop and traditional file selection interfaces while handling validation, progress tracking, and error reporting. This component needs to handle multiple simultaneous uploads while providing clear feedback about the status of each file.

```typescript
interface FileUploadZoneProps {
  folderId: string;
  onUploadComplete: (documents: DocumentItem[]) => void;
  onUploadError: (errors: UploadError[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

export function FileUploadZone({ folderId, onUploadComplete, ...props }: FileUploadZoneProps) {
  // Upload state management
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);
  
  // File validation before upload
  const validateFiles = useCallback((files: File[]) => {
    const errors: UploadError[] = [];
    const validFiles: File[] = [];
    
    files.forEach(file => {
      // Size validation
      if (props.maxFileSize && file.size > props.maxFileSize) {
        errors.push({
          filename: file.name,
          error: `File size exceeds ${formatFileSize(props.maxFileSize)} limit`
        });
        return;
      }
      
      // Type validation
      if (props.acceptedFileTypes && !props.acceptedFileTypes.includes(file.type)) {
        errors.push({
          filename: file.name,
          error: `File type ${file.type} is not supported`
        });
        return;
      }
      
      validFiles.push(file);
    });
    
    return { validFiles, errors };
  }, [props.maxFileSize, props.acceptedFileTypes]);
  
  // Drag and drop handlers
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(event.dataTransfer.files);
    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      setUploadErrors(errors);
    }
    
    if (validFiles.length > 0) {
      initiateUpload(validFiles);
    }
  }, [validateFiles]);
  
  // UploadThing integration with progress tracking
  const initiateUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const uploadId = generateUploadId();
        
        // Track upload progress
        const onProgress = (progress: number) => {
          setUploadProgress(prev => ({
            ...prev,
            [uploadId]: progress
          }));
        };
        
        // Upload to UploadThing
        const result = await uploadToUploadThing(file, {
          onProgress,
          metadata: { folderId }
        });
        
        return result;
      });
      
      const results = await Promise.allSettled(uploadPromises);
      
      // Process results and create document records
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<UploadResult> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      const failures = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected'
        )
        .map(result => ({
          filename: 'Unknown',
          error: result.reason.message
        }));
      
      if (successfulUploads.length > 0) {
        onUploadComplete(successfulUploads);
      }
      
      if (failures.length > 0) {
        props.onUploadError(failures);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      props.onUploadError([{
        filename: 'Multiple files',
        error: 'Upload process failed'
      }]);
    }
  };
  
  return (
    <div
      className={cn(
        "file-upload-zone",
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragActive 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
          : "border-gray-300 dark:border-gray-600",
        "hover:border-gray-400 dark:hover:border-gray-500"
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setIsDragActive(true)}
      onDragLeave={() => setIsDragActive(false)}
    >
      <Upload size={48} className="mx-auto mb-4 text-gray-400" />
      
      <h3 className="text-lg font-medium mb-2">
        Drop files here or click to browse
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Supported formats: PDF, Word, Excel, PowerPoint, Images
      </p>
      
      <input
        type="file"
        multiple
        className="hidden"
        id="file-input"
        onChange={handleFileSelect}
        accept={props.acceptedFileTypes?.join(',')}
      />
      
      <label
        htmlFor="file-input"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
      >
        Choose Files
      </label>
      
      {/* Upload progress display */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-6 space-y-2">
          {Object.entries(uploadProgress).map(([uploadId, progress]) => (
            <div key={uploadId} className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Error display */}
      {uploadErrors.length > 0 && (
        <div className="mt-4 text-left">
          {uploadErrors.map((error, index) => (
            <div key={index} className="text-red-600 text-sm">
              {error.filename}: {error.error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

The upload zone component provides comprehensive error handling that validates files before upload begins and provides clear feedback about any issues that prevent successful uploads. The validation includes file size limits, file type restrictions, and organizational policy checks that help users understand and resolve upload problems.

Progress tracking provides real-time feedback during upload operations, showing individual file progress for multiple simultaneous uploads. The progress display includes cancel functionality that allows users to abort uploads if needed while maintaining the integrity of partially completed upload batches.

## Search and Discovery Interface Components

Search components need to handle both traditional keyword search and semantic search while providing an interface that helps users understand and refine their queries. The search architecture supports progressive disclosure where basic search functionality is immediately available while advanced features become accessible as users need them.

### SearchInterface Component

The main search interface combines a search input with filtering controls and result display in a cohesive experience that adapts to different search types and result patterns. This component coordinates between multiple search methods while presenting unified results to users.

```typescript
interface SearchInterfaceProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  searchResults: SearchResult[];
  isLoading: boolean;
  searchType: 'traditional' | 'semantic' | 'hybrid';
  onSearchTypeChange: (type: SearchInterfaceProps['searchType']) => void;
}

export function SearchInterface({ onSearch, searchResults, isLoading, ...props }: SearchInterfaceProps) {
  // Search state management
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Search execution with debouncing
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string, searchFilters: SearchFilters) => {
      if (searchQuery.trim().length > 0) {
        onSearch(searchQuery, searchFilters);
        
        // Update recent searches
        setRecentSearches(prev => [
          searchQuery,
          ...prev.filter(s => s !== searchQuery).slice(0, 4)
        ]);
      }
    }, 300),
    [onSearch]
  );
  
  // Execute search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);
  
  return (
    <div className="search-interface space-y-4">
      {/* Main search input with suggestions */}
      <div className="relative">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents and folders..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {isLoading && (
            <Loader2 size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />
          )}
        </div>
        
        {/* Search suggestions and recent searches */}
        {query.length === 0 && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border rounded-lg mt-1 shadow-lg z-10">
            <div className="p-2">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent searches</div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setQuery(search)}
                >
                  <Clock size={16} className="inline mr-2 text-gray-400" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Search type selection */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Search type:</span>
          <select
            value={props.searchType}
            onChange={(e) => props.onSearchTypeChange(e.target.value as any)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="hybrid">Smart (Hybrid)</option>
            <option value="traditional">Traditional</option>
            <option value="semantic">Semantic</option>
          </select>
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvancedFilters ? 'Hide' : 'Show'} filters
        </button>
      </div>
      
      {/* Advanced filters */}
      {showAdvancedFilters && (
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}
      
      {/* Search results */}
      <SearchResults
        results={searchResults}
        isLoading={isLoading}
        searchQuery={query}
        searchType={props.searchType}
      />
    </div>
  );
}
```

The search interface implements intelligent query suggestions that help users discover effective search patterns and refine their queries based on available content. The suggestion system combines recent search history with content-based suggestions that help users explore their document library more effectively.

Filter integration provides progressive disclosure where basic search functionality is immediately available while advanced filtering options become accessible when users need more precise control over search results. The filter system supports common organizational patterns like date ranges, file types, and folder locations while maintaining a clean, uncluttered interface.

## AI Chat Interface Components

The AI chat interface represents the most sophisticated user interaction in the document management system, requiring components that handle conversational flow, source attribution, and context management while maintaining the security boundaries that govern document access.

### ChatInterface Component

The main chat interface manages conversation state, message history, and the complex interaction patterns that make AI assistance feel natural and helpful. This component coordinates between user input, AI processing, and result display while maintaining conversation context across multiple interactions.

```typescript
interface ChatInterfaceProps {
  onSendMessage: (message: string, context?: ChatContext) => Promise<ChatResponse>;
  conversationId?: string;
  initialContext?: ChatContext;
}

export function ChatInterface({ onSendMessage, conversationId, initialContext }: ChatInterfaceProps) {
  // Conversation state management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>(initialContext || {});
  
  // Message submission with context
  const handleSendMessage = async () => {
    if (currentMessage.trim().length === 0) return;
    
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    try {
      const response = await onSendMessage(currentMessage, context);
      
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        sources: response.sources,
        followUpSuggestions: response.followUpSuggestions
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-interface flex flex-col h-full">
      {/* Chat header with context controls */}
      <div className="chat-header p-4 border-b bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold">Document Assistant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ask questions about your documents and folders
        </p>
        
        {/* Context filtering controls */}
        <div className="mt-2 flex items-center space-x-4">
          <ChatContextControls
            context={context}
            onContextChange={setContext}
          />
        </div>
      </div>
      
      {/* Message history */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Start a conversation about your documents</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Try asking:</p>
              <div className="space-y-1 text-sm">
                <button 
                  className="block mx-auto text-blue-600 hover:text-blue-800"
                  onClick={() => setCurrentMessage("What documents do we have about the Q4 budget?")}
                >
                  "What documents do we have about the Q4 budget?"
                </button>
                <button 
                  className="block mx-auto text-blue-600 hover:text-blue-800"
                  onClick={() => setCurrentMessage("Find all employee training materials")}
                >
                  "Find all employee training materials"
                </button>
              </div>
            </div>
          </div>
        )}
        
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            message={message}
            onSourceClick={handleSourceClick}
            onFollowUpClick={handleFollowUpClick}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="chat-input p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question about your documents..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={isLoading || currentMessage.trim().length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

The chat interface maintains conversation context across multiple interactions, allowing users to ask follow-up questions and build on previous responses without repeating context. The context management includes document filters, time ranges, and folder restrictions that help focus AI responses on relevant information.

Source attribution integration provides transparency about which documents informed AI responses, enabling users to verify information and explore related content. The source display includes relevance indicators and direct links to source documents, making it easy for users to dive deeper into topics that interest them.

The conversational flow includes follow-up suggestions that encourage continued exploration and help users discover questions they might not have thought to ask. These suggestions are generated based on the current conversation context and available document content, providing natural pathways for deeper investigation of organizational knowledge.