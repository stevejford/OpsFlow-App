'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DocumentSettings {
  aiSearchEnabled: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  autoSaveSearches: boolean;
  maxRecentSearches: number;
  enableDocumentVersioning: boolean;
  defaultFolderPermissions: string;
  enableAIChat: boolean;
  chatSuggestedQuestions: string[];
}

interface DocumentSettingsContextType {
  settings: DocumentSettings;
  updateSettings: (newSettings: Partial<DocumentSettings>) => void;
  saveSettings: () => void;
}

const defaultSettings: DocumentSettings = {
  aiSearchEnabled: true,
  maxFileSize: 100,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'ppt', 'pptx'],
  autoSaveSearches: true,
  maxRecentSearches: 10,
  enableDocumentVersioning: true,
  defaultFolderPermissions: 'inherit',
  enableAIChat: true,
  chatSuggestedQuestions: [
    "What are the key points in this document?",
    "Can you summarize this document?",
    "What are the action items mentioned?",
    "Who are the stakeholders mentioned?",
    "What are the deadlines mentioned?"
  ]
};

const DocumentSettingsContext = createContext<DocumentSettingsContextType | undefined>(undefined);

export function DocumentSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DocumentSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('documentSettings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        } catch (error) {
          console.error('Error loading document settings:', error);
        }
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<DocumentSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('documentSettings', JSON.stringify(settings));
    }
  };

  return (
    <DocumentSettingsContext.Provider value={{ settings, updateSettings, saveSettings }}>
      {children}
    </DocumentSettingsContext.Provider>
  );
}

export function useDocumentSettings() {
  const context = useContext(DocumentSettingsContext);
  if (context === undefined) {
    throw new Error('useDocumentSettings must be used within a DocumentSettingsProvider');
  }
  return context;
}
