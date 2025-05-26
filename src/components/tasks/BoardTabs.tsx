'use client';

import React from 'react';

interface BoardTabsProps {
  activeBoard: string;
  onBoardChange: (board: string) => void;
}

export const BoardTabs: React.FC<BoardTabsProps> = ({ activeBoard, onBoardChange }) => {
  return (
    <div className="bg-blue-500 w-full border-b border-blue-400">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center overflow-x-auto" id="boardTabs">
          <button 
            className={`board-tab ${activeBoard === 'main' ? 'active' : ''} px-4 py-3 text-sm font-medium ${activeBoard === 'main' ? 'text-white' : 'text-blue-100'} whitespace-nowrap`} 
            data-board="main"
            onClick={() => onBoardChange('main')}
          >
            Development Sprint
          </button>
          <button 
            className={`board-tab ${activeBoard === 'marketing' ? 'active' : ''} px-4 py-3 text-sm font-medium ${activeBoard === 'marketing' ? 'text-white' : 'text-blue-100'} whitespace-nowrap`} 
            data-board="marketing"
            onClick={() => onBoardChange('marketing')}
          >
            Marketing Tasks
          </button>
          <button 
            className={`board-tab ${activeBoard === 'hr' ? 'active' : ''} px-4 py-3 text-sm font-medium ${activeBoard === 'hr' ? 'text-white' : 'text-blue-100'} whitespace-nowrap`} 
            data-board="hr"
            onClick={() => onBoardChange('hr')}
          >
            HR & Admin
          </button>
        </div>
      </div>
    </div>
  );
};
