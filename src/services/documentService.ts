// Mock document service - in a real app, this would connect to your backend API

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  owner: string;
  createdAt: string;
  modifiedAt: string;
  folderId: string;
  tags: string[];
  content?: string;
  excerpt?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  permissions: string;
  isPrivate: boolean;
  createdAt: string;
  owner: string;
}

export interface SearchResult {
  id: string;
  name: string;
  type: string;
  excerpt: string;
  relevanceScore: number;
  highlights: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  createdAt: string;
}

// Mock data
let mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employee Handbook.pdf',
    type: 'pdf',
    size: 2048000,
    owner: 'HR Department',
    createdAt: '2024-01-15T10:00:00Z',
    modifiedAt: '2024-01-15T10:00:00Z',
    folderId: 'hr-docs',
    tags: ['handbook', 'hr', 'policies'],
    content: 'This is the employee handbook containing all company policies and procedures...',
    excerpt: 'Employee handbook with company policies and procedures'
  },
  {
    id: '2',
    name: 'Safety Guidelines.docx',
    type: 'docx',
    size: 1024000,
    owner: 'Safety Team',
    createdAt: '2024-02-01T14:30:00Z',
    modifiedAt: '2024-02-01T14:30:00Z',
    folderId: 'safety-docs',
    tags: ['safety', 'guidelines', 'procedures'],
    content: 'Safety guidelines and procedures for all employees...',
    excerpt: 'Comprehensive safety guidelines for workplace safety'
  },
  {
    id: '3',
    name: 'Project Plan Q1.xlsx',
    type: 'xlsx',
    size: 512000,
    owner: 'Project Manager',
    createdAt: '2024-03-01T09:15:00Z',
    modifiedAt: '2024-03-15T16:45:00Z',
    folderId: 'projects',
    tags: ['project', 'planning', 'q1'],
    content: 'Q1 project planning spreadsheet with timelines and resources...',
    excerpt: 'Q1 project planning with timelines and resource allocation'
  }
];

let mockFolders: Folder[] = [
  {
    id: 'hr-docs',
    name: 'HR Documents',
    parentId: null,
    path: '/HR Documents',
    permissions: 'team',
    isPrivate: false,
    createdAt: '2024-01-01T00:00:00Z',
    owner: 'HR Department'
  },
  {
    id: 'safety-docs',
    name: 'Safety Documents',
    parentId: null,
    path: '/Safety Documents',
    permissions: 'public',
    isPrivate: false,
    createdAt: '2024-01-01T00:00:00Z',
    owner: 'Safety Team'
  },
  {
    id: 'projects',
    name: 'Projects',
    parentId: null,
    path: '/Projects',
    permissions: 'team',
    isPrivate: false,
    createdAt: '2024-01-01T00:00:00Z',
    owner: 'Project Manager'
  }
];

let mockSavedSearches: SavedSearch[] = [
  {
    id: '1',
    name: 'HR Policies',
    query: 'policies procedures handbook',
    filters: { fileType: ['pdf'], owner: 'HR Department' },
    createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Safety Documents',
    query: 'safety guidelines',
    filters: { fileType: ['pdf', 'docx'], tags: ['safety'] },
    createdAt: '2024-03-05T14:30:00Z'
  }
];

// Search suggestions
const searchSuggestions = [
  'employee handbook',
  'safety guidelines',
  'project plan',
  'hr policies',
  'procedures',
  'training materials',
  'company policies',
  'meeting notes',
  'reports',
  'contracts'
];

export class DocumentService {
  // Search documents
  static async searchDocuments(query: string, filters?: any): Promise<SearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!query.trim()) return [];

    const results = mockDocuments
      .filter(doc => {
        // Text search
        const searchText = `${doc.name} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
        const queryMatch = query.toLowerCase().split(' ').some(term => searchText.includes(term));

        // Apply filters
        if (filters?.fileType && filters.fileType.length > 0) {
          if (!filters.fileType.includes(doc.type)) return false;
        }
        if (filters?.owner && !doc.owner.toLowerCase().includes(filters.owner.toLowerCase())) {
          return false;
        }
        if (filters?.dateFrom && new Date(doc.createdAt) < new Date(filters.dateFrom)) {
          return false;
        }
        if (filters?.dateTo && new Date(doc.createdAt) > new Date(filters.dateTo)) {
          return false;
        }

        return queryMatch;
      })
      .map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        excerpt: doc.excerpt || '',
        relevanceScore: Math.random() * 0.5 + 0.5, // Mock relevance score
        highlights: [doc.name] // Mock highlights
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  // Get search suggestions
  static async getSearchSuggestions(query: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!query.trim()) return [];

    return searchSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  // Save search
  static async saveSearch(name: string, query: string, filters: any): Promise<SavedSearch> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters,
      createdAt: new Date().toISOString()
    };

    mockSavedSearches.push(newSearch);
    return newSearch;
  }

  // Get saved searches
  static async getSavedSearches(): Promise<SavedSearch[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockSavedSearches];
  }

  // Delete saved search
  static async deleteSavedSearch(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    mockSavedSearches = mockSavedSearches.filter(search => search.id !== id);
  }

  // Get recent searches from localStorage
  static getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    
    const recent = localStorage.getItem('recentSearches');
    return recent ? JSON.parse(recent) : [];
  }

  // Add to recent searches
  static addRecentSearch(query: string, maxRecent: number = 10): void {
    if (typeof window === 'undefined') return;

    const recent = this.getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    const updated = [query, ...filtered].slice(0, maxRecent);
    
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }

  // Create folder
  static async createFolder(data: {
    name: string;
    description: string;
    parentId: string;
    inheritPermissions: boolean;
    isPrivate: boolean;
  }): Promise<Folder> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const parentFolder = mockFolders.find(f => f.id === data.parentId);
    const parentPath = parentFolder ? parentFolder.path : '';

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: data.name,
      parentId: data.parentId || null,
      path: `${parentPath}/${data.name}`,
      permissions: data.inheritPermissions ? (parentFolder?.permissions || 'inherit') : (data.isPrivate ? 'private' : 'team'),
      isPrivate: data.isPrivate,
      createdAt: new Date().toISOString(),
      owner: 'Current User'
    };

    mockFolders.push(newFolder);
    return newFolder;
  }

  // Get folders
  static async getFolders(): Promise<Folder[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockFolders];
  }

  // Get documents in folder
  static async getDocumentsInFolder(folderId: string): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDocuments.filter(doc => doc.folderId === folderId);
  }

  // AI Chat functionality
  static async sendChatMessage(message: string, context: any[]): Promise<{
    id: string;
    content: string;
    references?: {
      id: string;
      name: string;
      type: string;
      excerpt: string;
      relevanceScore: number;
    }[];
  }> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Mock AI responses based on message content
    const responses = [
      {
        content: "Based on the documents in context, I found several relevant pieces of information. The employee handbook outlines the key policies and procedures that all staff members should follow.",
        references: [
          {
            id: '1',
            name: 'Employee Handbook.pdf',
            type: 'pdf',
            excerpt: 'All employees must follow company policies regarding attendance, conduct, and safety procedures...',
            relevanceScore: 0.92
          }
        ]
      },
      {
        content: "I can help you understand the safety guidelines. The document emphasizes the importance of following proper safety protocols in all work environments.",
        references: [
          {
            id: '2',
            name: 'Safety Guidelines.docx',
            type: 'docx',
            excerpt: 'Safety is our top priority. All employees must wear appropriate protective equipment...',
            relevanceScore: 0.88
          }
        ]
      },
      {
        content: "The project plan for Q1 shows several key milestones and deliverables. Let me break down the main objectives and timelines for you.",
        references: [
          {
            id: '3',
            name: 'Project Plan Q1.xlsx',
            type: 'xlsx',
            excerpt: 'Q1 objectives include: 1) Complete product development phase, 2) Launch marketing campaign...',
            relevanceScore: 0.85
          }
        ]
      }
    ];

    // Select response based on message content or use a default
    let selectedResponse;
    if (message.toLowerCase().includes('handbook') || message.toLowerCase().includes('policy')) {
      selectedResponse = responses[0];
    } else if (message.toLowerCase().includes('safety') || message.toLowerCase().includes('guideline')) {
      selectedResponse = responses[1];
    } else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('plan')) {
      selectedResponse = responses[2];
    } else {
      // Generic helpful response
      selectedResponse = {
        content: `I understand you're asking about "${message}". Based on the available documents, I can provide information from the following sources. Could you be more specific about what you'd like to know?`,
        references: context.length > 0 ? context.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          excerpt: `This document contains relevant information about ${doc.name.toLowerCase().replace(/\.[^/.]+$/, "")}...`,
          relevanceScore: 0.75
        })) : []
      };
    }

    return {
      id: Date.now().toString(),
      ...selectedResponse
    };
  }
}
