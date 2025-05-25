// Component with client-side interactivity

import React, { useEffect, useState } from 'react';
import { Task } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('feather-icons').then(feather => {
        feather.default.replace();
      });
    }
  }, [expanded]);
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent drag start when clicking to expand
    e.stopPropagation();
    
    // Don't expand if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    setExpanded(!expanded);
  };
  
  // Handle drag start - don't allow dragging when expanded
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (expanded) {
      e.preventDefault();
      return;
    }
    onDragStart(e, task.id);
  };
  return (
    <div
      draggable={!expanded}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      className={`task-card priority-${task.priority} bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all ${expanded ? 'expanded' : ''}`}
      data-task-id={task.id}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm flex-1">{task.title}</h4>
        <span className={`bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-100 text-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-800 px-2 py-1 rounded-full text-xs font-medium ml-2 flex items-center`}>
          <i data-feather={task.priority === 'high' ? 'alert-circle' : task.priority === 'medium' ? 'alert-triangle' : 'check-circle'} className="w-3 h-3 mr-1"></i>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>
      <p className={`text-gray-600 text-sm mb-3 ${expanded ? '' : 'line-clamp-2'}`}>{task.description}</p>
      
      {/* Additional details shown when expanded */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            
            {task.dueDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Due Date</span>
                <span className="text-sm text-gray-600">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Priority</span>
              <span className={`text-sm px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Edit functionality would go here');
                }}
              >
                <i data-feather="edit-2" className="w-3 h-3 inline mr-1"></i>
                Edit
              </button>
              <button 
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
              >
                <i data-feather="minimize-2" className="w-3 h-3 inline mr-1"></i>
                Collapse
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {task.assignee && (
            <div 
              className={`w-6 h-6 bg-${task.assignee.color} rounded-full flex items-center justify-center`}
              title={task.assignee.name}
            >
              <span className="text-white text-xs font-medium">
                {task.assignee.initials}
              </span>
            </div>
          )}
          {task.assignee && (
            <span className="text-gray-500 text-xs">
              {task.assignee.name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-gray-400">
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <i data-feather="calendar" className="w-3 h-3"></i>
              <span className="text-xs">
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
          <button className="text-gray-400 hover:text-blue-500 transition-colors">
            <i data-feather="more-vertical" className="w-3 h-3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
