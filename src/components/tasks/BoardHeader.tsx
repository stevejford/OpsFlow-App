'use client';

import React from 'react';

interface BoardHeaderProps {
  title: string;
  onAddColumn: () => void;
  onToggleColumnEdit: () => void;
  isEditing: boolean;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ 
  title, 
  onAddColumn, 
  onToggleColumnEdit,
  isEditing 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" id="boardTitle">{title}</h1>
        <p className="text-gray-600 mt-1">Organize and track your team's workflow efficiently</p>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          onClick={onAddColumn} 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md"
        >
          <i data-feather="plus" className="h-4 w-4 inline mr-1"></i>
          Add Column
        </button>
        <button 
          onClick={onToggleColumnEdit} 
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md" 
          id="editColumnsBtn"
        >
          <i data-feather={isEditing ? "check" : "edit"} className="h-4 w-4 inline mr-1"></i>
          {isEditing ? 'Done Editing' : 'Edit Columns'}
        </button>
      </div>
    </div>
  );
};
