'use client';

import React from 'react';

interface BoardStatsProps {
  todoCount: number;
  progressCount: number;
  reviewCount: number;
  doneCount: number;
}

export const BoardStats: React.FC<BoardStatsProps> = ({ 
  todoCount, 
  progressCount, 
  reviewCount, 
  doneCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" id="boardStats">
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <i data-feather="clock" className="w-5 h-5 text-gray-600"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">To Do</p>
            <p className="text-2xl font-bold text-gray-900" id="todoCount">{todoCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i data-feather="play" className="w-5 h-5 text-blue-600"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-gray-900" id="progressCount">{progressCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i data-feather="eye" className="w-5 h-5 text-yellow-600"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Review</p>
            <p className="text-2xl font-bold text-gray-900" id="reviewCount">{reviewCount}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <i data-feather="check-circle" className="w-5 h-5 text-green-600"></i>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Done</p>
            <p className="text-2xl font-bold text-gray-900" id="doneCount">{doneCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
