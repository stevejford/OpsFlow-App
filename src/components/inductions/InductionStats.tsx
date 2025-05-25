'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface InductionStatsProps {
  stats: {
    totalInductions: number;
    completedInductions: number;
    inProgressInductions: number;
    scheduledInductions: number;
    overdueInductions: number;
  };
}

export default function InductionStats({ stats }: InductionStatsProps) {
  return (
    <div className="flex flex-wrap justify-between gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[180px]">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3">
            <Icon name="fas fa-clipboard-list" className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Inductions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalInductions}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[180px]">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center mr-3">
            <Icon name="fas fa-check-circle" className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completedInductions}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[180px]">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center mr-3">
            <Icon name="fas fa-clock" className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgressInductions}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[180px]">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center mr-3">
            <Icon name="fas fa-calendar" className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Scheduled</p>
            <p className="text-3xl font-bold text-purple-600">{stats.scheduledInductions}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 min-w-[180px]">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center mr-3">
            <Icon name="fas fa-exclamation-triangle" className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-3xl font-bold text-red-600">{stats.overdueInductions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
