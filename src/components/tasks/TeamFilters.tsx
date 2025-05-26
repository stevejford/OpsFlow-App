'use client';

import React from 'react';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface TeamFiltersProps {
  teamMembers: TeamMember[];
  onSearch: () => void;
}

export const TeamFilters: React.FC<TeamFiltersProps> = ({ teamMembers, onSearch }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Team Members:</span>
            <div className="flex -space-x-2">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className={`w-8 h-8 bg-${member.color} rounded-full border-2 border-white flex items-center justify-center`}
                >
                  <span className="text-white text-xs font-medium">{member.initials}</span>
                </div>
              ))}
              <button className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:border-gray-400">
                <i data-feather="plus" className="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Assignees</option>
            <option>John Smith</option>
            <option>Sarah Wilson</option>
            <option>Mike Johnson</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button 
            onClick={onSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <i data-feather="search" className="w-4 h-4 inline mr-1"></i>
            Search
          </button>
        </div>
      </div>
    </div>
  );
};
