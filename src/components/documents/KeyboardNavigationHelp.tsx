'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface KeyboardNavigationHelpProps {
  className?: string;
}

export default function KeyboardNavigationHelp({ className }: KeyboardNavigationHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    { key: '↑↓', description: 'Navigate up/down' },
    { key: '←→', description: 'Navigate left/right (grid view) or expand/collapse folders' },
    { key: 'Enter', description: 'Open selected item' },
    { key: 'Space', description: 'Select item' },
    { key: 'Ctrl+Click', description: 'Multi-select' },
    { key: 'Right-click', description: 'Open context menu' }
  ];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
        aria-expanded={isExpanded}
        aria-controls="keyboard-shortcuts"
      >
        <svg 
          className="w-4 h-4 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Keyboard shortcuts
        <svg 
          className={cn("w-4 h-4 ml-1 transition-transform", isExpanded && "transform rotate-180")} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div 
          id="keyboard-shortcuts"
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-3"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-2">Keyboard Navigation</h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex justify-between">
                <span className="text-xs text-gray-600">{shortcut.description}</span>
                <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
