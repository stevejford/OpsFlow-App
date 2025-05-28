# Document Management System Component Prompts

This file contains individual prompts for each component of the document management system. You can copy and paste each prompt separately to get HTML back from another LLM, which I will then help integrate into your existing OpsFlow UI.

## Prompt 1: Main Document Browser Page

```
Create a Next.js client component for a document management system's main browser page using Tailwind CSS and React. The component should follow these specifications:

1. Use 'use client' directive at the top
2. Import necessary Next.js components (useRouter, useSearchParams)
3. The layout should have:
   - A left sidebar for folder navigation (30% width)
   - A main content area for document display (70% width)
   - A top action bar with upload button, view toggle, and search
   - Support for both list and grid views of documents

4. Include state for:
   - Current folder selection
   - Selected documents (multi-select)
   - View mode (list/grid)
   - Search query
   - Sort order

5. The component should handle:
   - Folder navigation
   - Document selection
   - View toggling
   - Basic search
   - Sorting options (name, date, size, type)

6. Use Tailwind CSS for styling with a clean, professional look matching these color schemes:
   - Primary: blue-600 (#2563eb)
   - Secondary: gray-200 to gray-800 for UI elements
   - Accent: green-500 for success, red-500 for errors/deletion
   - Background: white for main areas, gray-50/gray-100 for sidebars/headers

7. Include empty states for:
   - Empty folders
   - No search results

8. Use SVG icons for common actions (upload, new folder, view options, etc.)

9. Make the component responsive with appropriate breakpoints

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application with TypeScript and Tailwind CSS.
```

## Prompt 2: Folder Tree Navigation Component

```
Create a React component for a hierarchical folder tree navigation using Tailwind CSS. This component will be used in a document management system and should:

1. Support a nested folder structure with unlimited depth
2. Allow folder selection with highlighted active state
3. Support expanding/collapsing folders
4. Show folder icons and appropriate visual cues
5. Handle keyboard navigation (arrow keys, Enter)
6. Support right-click context menu
7. Include appropriate accessibility attributes

The component should accept these props:
- folders: An array of folder objects with id, name, children (array of subfolders)
- selectedFolderId: The currently selected folder ID
- expandedFolders: Set or array of IDs of expanded folders
- onFolderSelect: Callback when a folder is selected
- onFolderExpand: Callback when a folder is expanded/collapsed
- onContextMenu: Callback for right-click menu

Use Tailwind CSS for styling with these guidelines:
- Selected folder: bg-blue-100 text-blue-700
- Hover state: bg-gray-100
- Folder icons: text-gray-500, text-blue-500 when selected
- Appropriate indentation for hierarchy levels
- Smooth transitions for expand/collapse

Include TypeScript interfaces for all props and state. The component should be optimized for performance when handling large folder structures.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 3: Document Grid/List View Component

```
Create a React component that can display documents in both grid and list views for a document management system. The component should:

1. Support toggling between grid view (thumbnails) and list view (rows)
2. Allow document selection with checkboxes for bulk actions
3. Show document thumbnails for common file types (PDF, images, docs, etc.)
4. Display metadata like name, size, modified date, and type
5. Support sorting by different columns
6. Include hover actions for each document (preview, share, more options)
7. Handle empty states gracefully

The component should accept these props:
- documents: Array of document objects with id, name, type, size, modifiedDate, thumbnailUrl
- viewMode: 'grid' or 'list'
- selectedDocuments: Array of selected document IDs
- onDocumentSelect: Callback when a document is selected
- onDocumentOpen: Callback when a document is opened
- onViewModeChange: Callback when view mode is toggled
- sortConfig: Object with field and direction
- onSortChange: Callback when sort is changed

Use Tailwind CSS for styling with these guidelines:
- Grid view: Responsive grid with 2-6 columns depending on screen size
- List view: Clean rows with appropriate column alignment
- Selection: Subtle checkbox design with blue accent when checked
- Hover effects: Subtle background change with action buttons appearing
- File type icons: Colorful icons based on file type

Include TypeScript interfaces for all props and state. Ensure the component handles large numbers of documents efficiently.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 4: Upload Modal Component

```
Create a React component for a file upload modal in a document management system. The modal should:

1. Support both file selection via button and drag-and-drop
2. Show upload progress with a progress bar
3. Allow folder selection for upload destination
4. Support multi-file uploads
5. Validate files before upload (size, type)
6. Show success/error states for each file
7. Allow cancellation of uploads in progress

The component should accept these props:
- isOpen: Boolean to control modal visibility
- onClose: Function to call when modal is closed
- onUploadComplete: Callback when uploads finish
- currentFolderId: The ID of the current folder for default destination
- availableFolders: Array of folder objects for destination selection
- maxFileSize: Maximum allowed file size in bytes
- allowedFileTypes: Array of allowed MIME types (optional)

Use Tailwind CSS for styling with these guidelines:
- Clean, modern modal design with appropriate padding
- Drag area with dashed border and color change when dragging
- Progress bars with blue color for progress
- Success indicators in green, errors in red
- Clear, accessible button designs
- Responsive layout that works on different screen sizes

Include proper error handling for:
- File too large
- Invalid file type
- Upload failures
- Network issues

Use TypeScript for type safety and include animations for drag-and-drop interactions.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 5: Document Preview Modal Component

```
Create a React component for a document preview modal in a document management system. The modal should:

1. Display document previews for various file types (PDF, images, text, etc.)
2. Include a header with document name and actions (download, share, close)
3. Support navigation between multiple documents (prev/next)
4. Show document metadata in a side panel (size, created date, modified date, owner)
5. Include zoom controls for applicable document types
6. Handle loading states and errors gracefully

The component should accept these props:
- isOpen: Boolean to control modal visibility
- onClose: Function to call when modal is closed
- document: The current document object with id, name, type, url, size, metadata
- documents: Array of document objects (for prev/next navigation)
- currentIndex: Index of current document in the array
- onDownload: Callback for download action
- onShare: Callback for share action
- onNavigate: Callback when navigating between documents

Use Tailwind CSS for styling with these guidelines:
- Full-screen modal with semi-transparent backdrop
- Clean white background for content area
- Clear navigation controls
- Appropriate rendering based on file type
- Loading spinner for documents being loaded
- Error state for unsupported file types or loading failures

Include specialized preview handling for:
- Images: Zoomable with pan support
- PDFs: Page navigation
- Text files: Syntax highlighting if possible
- Office documents: Basic rendering or fallback message

Use TypeScript for type safety and ensure the component is accessible.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 6: Share Dialog Component

```
Create a React component for a document sharing dialog in a document management system. The dialog should:

1. Generate shareable links with customizable settings
2. Allow setting an expiration date/time for the link
3. Include permission options (view only, edit, etc.)
4. Provide a copy link button
5. Include an option to email the link directly
6. Show existing shares for the document if any
7. Allow revoking existing shared links

The component should accept these props:
- isOpen: Boolean to control dialog visibility
- onClose: Function to call when dialog is closed
- document: The document object being shared (id, name, type)
- existingShares: Array of existing share objects (id, url, expires, permissions)
- onCreateShare: Callback when a new share is created
- onRevokeShare: Callback when a share is revoked
- onCopyLink: Callback when link is copied
- onEmailLink: Callback when email option is selected

Use Tailwind CSS for styling with these guidelines:
- Clean dialog design with appropriate sections
- Toggle switches for options
- Date picker for expiration
- Radio buttons or dropdown for permission levels
- Clear, accessible button designs
- List view for existing shares with revoke buttons
- Success confirmation when link is copied

Include these permission options:
- View only (default)
- Download allowed
- Edit allowed (if applicable to document type)
- Comment allowed (if applicable)

Use TypeScript for type safety and ensure the component handles all states properly (loading, error, success).

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 7: Permission Management Dialog Component

```
Create a React component for a permission management dialog in a document management system. The dialog should:

1. Display current permissions for a document or folder
2. Allow adding new users/groups with specific permission levels
3. Support editing existing permissions
4. Include an option for inheritance (apply to subfolders/files)
5. Show permission inheritance status
6. Provide a way to remove permissions
7. Include a search field to find users/groups

The component should accept these props:
- isOpen: Boolean to control dialog visibility
- onClose: Function to call when dialog is closed
- item: The document or folder object (id, name, type)
- isFolder: Boolean indicating if item is a folder
- currentPermissions: Array of permission objects (id, userOrGroupId, userOrGroupName, level, inherited)
- availableUsers: Array of user objects for selection
- availableGroups: Array of group objects for selection
- onAddPermission: Callback when a permission is added
- onUpdatePermission: Callback when a permission is updated
- onRemovePermission: Callback when a permission is removed
- onUpdateInheritance: Callback when inheritance setting is changed

Use Tailwind CSS for styling with these guidelines:
- Clean dialog design with clear sections
- Table layout for existing permissions
- Form controls for adding new permissions
- Dropdown for permission level selection
- Checkbox for inheritance options
- Search input with results dropdown
- Appropriate icons for users vs groups
- Visual indicators for inherited permissions

Include these permission levels:
- Viewer: Can only view
- Commenter: Can view and comment
- Editor: Can view, comment, and edit
- Manager: Can view, comment, edit, and manage permissions
- Owner: Full control

Use TypeScript for type safety and ensure the component is accessible.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 8: Advanced Search Component

```
Create a React component for an advanced search interface in a document management system. The component should:

1. Include a main search input with typeahead suggestions
2. Provide expandable advanced filters section
3. Support filtering by file type, date ranges, size, and owner
4. Allow saving searches for future use
5. Display recent searches
6. Include an AI-enhanced search toggle
7. Show search results with highlighted matches

The component should accept these props:
- onSearch: Callback when search is executed
- onFilterChange: Callback when filters are changed
- initialQuery: Initial search query string
- initialFilters: Initial filter settings
- recentSearches: Array of recent search objects
- savedSearches: Array of saved search objects
- isLoading: Boolean for loading state
- searchResults: Array of result objects
- onSaveSearch: Callback when search is saved
- onDeleteSavedSearch: Callback when saved search is deleted
- onToggleAISearch: Callback when AI search is toggled

Use Tailwind CSS for styling with these guidelines:
- Clean, modern search bar with appropriate icons
- Collapsible advanced filters panel
- Date pickers for date range filters
- Checkboxes for file type filters
- Sliders or inputs for size ranges
- Dropdown for owner selection
- Toggle switch for AI search enhancement
- Saved searches as chips or in a dropdown
- Loading indicator during search
- Clear all filters button

Include TypeScript interfaces for all props and state. Make sure the component handles all states properly (empty, loading, results, no results).

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 9: AI Chat Interface Component

```
Create a React component for an AI chat interface in a document management system. The component should:

1. Display a conversation thread between user and AI
2. Include a message input area with send button
3. Show typing indicators when AI is generating responses
4. Support markdown formatting in messages
5. Include document references/citations in AI responses
6. Allow users to ask follow-up questions
7. Provide suggested questions as chips
8. Include a way to reset the conversation
9. Show which documents the AI is using for context

The component should accept these props:
- onSendMessage: Callback when user sends a message
- messages: Array of message objects (id, content, sender, timestamp)
- isTyping: Boolean indicating if AI is "typing"
- suggestedQuestions: Array of suggested question strings
- documentContext: Array of document objects being referenced
- onResetConversation: Callback when conversation is reset
- onDocumentClick: Callback when a document reference is clicked
- onFeedback: Callback when user provides feedback on response

Use Tailwind CSS for styling with these guidelines:
- Clean chat interface with user messages right-aligned
- AI messages left-aligned with different styling
- Subtle background colors to differentiate message types
- Proper spacing between messages
- Modern input area with send button
- Subtle typing indicator animation
- Chip-style suggested questions
- Document references with icons based on file type
- Markdown rendering for formatted text, code blocks, lists
- Responsive design that works on all screen sizes

Include TypeScript interfaces for all props and state. Ensure the component handles long conversations efficiently and maintains scroll position appropriately.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 10: New Folder Dialog Component

```
Create a React component for a "New Folder" dialog in a document management system. The dialog should:

1. Allow users to enter a folder name
2. Include an optional description field
3. Show the parent folder location
4. Include permission inheritance options
5. Validate the folder name (no special characters, etc.)
6. Show appropriate error messages
7. Include create and cancel buttons

The component should accept these props:
- isOpen: Boolean to control dialog visibility
- onClose: Function to call when dialog is closed
- onCreateFolder: Callback when folder creation is confirmed
- parentFolderId: ID of the parent folder
- parentFolderPath: Path string of the parent folder
- existingFolderNames: Array of existing folder names (for validation)

Use Tailwind CSS for styling with these guidelines:
- Clean, simple dialog design
- Form inputs with appropriate styling
- Clear error messages
- Disabled submit button until valid input is provided
- Loading state during folder creation
- Success confirmation before closing

Include validation for:
- Required folder name
- No duplicate names in the same parent folder
- No special characters that would be invalid for folders
- Maximum length restrictions

Use TypeScript for type safety and ensure the component is accessible with proper labels and ARIA attributes.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 11: Batch Operations Component

```
Create a React component for batch operations in a document management system. This component should appear when multiple files or folders are selected and allow users to perform actions on them collectively. The component should:

1. Show the number of items selected
2. Provide buttons for common batch actions (move, copy, delete, share, etc.)
3. Include a way to deselect all items
4. Show a preview of selected items (thumbnails or names)
5. Support responsive design for different screen sizes

The component should accept these props:
- selectedItems: Array of selected item objects (id, name, type, isFolder)
- onBatchMove: Callback for move action
- onBatchCopy: Callback for copy action
- onBatchDelete: Callback for delete action
- onBatchShare: Callback for share action
- onBatchDownload: Callback for download action
- onBatchTag: Callback for tagging action
- onClearSelection: Callback to clear selection
- visibleItemCount: Number of items to show in preview (rest shown as count)

Use Tailwind CSS for styling with these guidelines:
- Floating action bar that appears at the bottom of the screen
- Clean, minimal design that doesn't obstruct the main interface
- Action buttons with appropriate icons
- Hover states for buttons
- Condensed preview of selected items
- Clear "X" button to dismiss/deselect
- Responsive layout that adapts to screen width

Include TypeScript interfaces for all props and state. Ensure the component handles large selections efficiently.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Prompt 12: Document Details Sidebar Component

```
Create a React component for a document details sidebar in a document management system. The sidebar should:

1. Display comprehensive metadata about a selected document
2. Show file preview thumbnail
3. Include sections for basic info, sharing status, version history
4. Allow editing document name and description
5. Display activity history/timeline
6. Show related documents if any
7. Include quick action buttons (download, share, move, etc.)

The component should accept these props:
- document: The selected document object with comprehensive metadata
- isVisible: Boolean to control sidebar visibility
- onClose: Function to call when sidebar is closed
- onUpdateDocument: Callback when document metadata is updated
- onDownload: Callback for download action
- onShare: Callback for share action
- onMove: Callback for move action
- onDelete: Callback for delete action
- activityHistory: Array of activity objects for the document
- relatedDocuments: Array of related document objects
- versions: Array of version objects if versioning is supported

Use Tailwind CSS for styling with these guidelines:
- Clean sidebar design with appropriate width (320-400px)
- Collapsible sections for different metadata categories
- Subtle background color to differentiate from main content
- Proper spacing between sections
- Inline editing for editable fields
- Activity timeline with appropriate icons for different actions
- Thumbnail preview with file type indicator
- Quick action buttons with hover states
- Responsive adjustments for smaller screens

Include these metadata sections:
- Basic info (name, type, size, created/modified dates)
- Location (folder path)
- Sharing status (who has access)
- Version history (if applicable)
- Custom metadata/properties
- Activity history

Use TypeScript for type safety and ensure the component is accessible.

Return only the complete TSX code for the component, properly formatted and ready to use in a Next.js 14 application.
```

## Integration Instructions

After you receive the HTML/TSX code for each component from another LLM, I'll help you integrate them into your existing OpsFlow application. Here's what we'll need to do:

1. Create the necessary files in your project structure
2. Link the new document management system to the existing Documents menu item in your sidebar
3. Ensure all components work together properly
4. Add the required API routes and backend functionality
5. Test the integration to make sure everything works as expected

The integration will build on your existing sidebar navigation and maintain the same design language as the rest of your application.
