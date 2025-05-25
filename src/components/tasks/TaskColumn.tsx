// Component with client-side interactivity

import React, { useEffect } from 'react';
import { Task } from '@/types/task';
import { TaskCard } from '.';
import feather from 'feather-icons';

interface TaskColumnProps {
  status: string;
  tasks: Task[];
  isEditing?: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: string) => void;
  onDeleteColumn?: (status: string) => void;
  onAddTask?: (status: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  isEditing = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  onDeleteColumn,
  onAddTask,
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      feather.replace();
    }
  }, []);

  // Get the status info
  const statusInfo = {
    todo: { label: 'To Do', color: 'blue-500', bgColor: 'blue-50', icon: 'clipboard' },
    inProgress: { label: 'In Progress', color: 'yellow-500', bgColor: 'yellow-50', icon: 'loader' },
    review: { label: 'In Review', color: 'purple-500', bgColor: 'purple-50', icon: 'eye' },
    done: { label: 'Done', color: 'green-500', bgColor: 'green-50', icon: 'check-circle' }
  }[status] || { label: status, color: 'gray-500', bgColor: 'gray-50', icon: 'circle' };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 w-full flex flex-col"
      data-column={status}
    >
      <div className={`p-4 bg-${statusInfo.bgColor} border-b border-gray-200 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <span className={`w-3 h-3 bg-${statusInfo.color} rounded-full mr-2`}></span>
            {statusInfo.label} ({tasks.length})
          </h3>
          {isEditing && onDeleteColumn && (
            <div className="flex items-center space-x-1">
              <button 
                className="column-edit-btn text-gray-400 hover:text-red-600 transition-colors" 
                onClick={() => onDeleteColumn(status)}
                aria-label={`Delete ${statusInfo.label} column`}
              >
                <i data-feather="trash-2" className="w-4 h-4"></i>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div 
        className="p-4 space-y-4 min-h-[300px] flex-grow bg-gray-50 rounded-b-lg"
        id={`${status}Column`}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(e);
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-4">
            <i data-feather={statusInfo.icon} className="w-6 h-6 mb-2"></i>
            <p className="text-sm text-center">No tasks in this column</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDragStart={(e) => {
                onDragStart(e, task.id);
                if (onDragEnd) {
                  e.currentTarget.addEventListener('dragend', (event) => {
                    // Cast to unknown first, then to the required type
                    onDragEnd(event as unknown as React.DragEvent<HTMLDivElement>);
                  }, { once: true });
                }
              }}
            />
          ))
        )}
        <button 
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-center mt-4"
          onClick={() => onAddTask && onAddTask(status)}
        >
          <i data-feather="plus" className="w-4 h-4 mr-1"></i> Add task
        </button>
      </div>
    </div>
  );
};
