'use client';

import React, { useState, useEffect } from 'react';
import { useDragDrop } from '@/hooks/useDragDrop';
import { TaskColumn } from './TaskColumn';
import { Task } from '@/types/task';

const initialTasks: Record<string, Task[]> = {
  todo: [
    {
      id: '1',
      title: 'Implement user authentication system',
      description: 'Set up OAuth integration and secure user login functionality for the platform',
      priority: 'high',
      assignee: { id: '1', name: 'John Smith', initials: 'JS', color: 'blue-500' },
      dueDate: '2023-12-20',
    },
    {
      id: '2',
      title: 'Design user dashboard mockups',
      description: 'Create wireframes and visual designs for the main dashboard interface',
      priority: 'medium',
      assignee: { id: '2', name: 'Sarah Wilson', initials: 'SW', color: 'green-500' },
      dueDate: '2023-12-22',
    },
    {
      id: '3',
      title: 'Update project documentation',
      description: 'Review and update the project README and API documentation',
      priority: 'low',
      assignee: { id: '3', name: 'Mike Johnson', initials: 'MJ', color: 'purple-500' },
      dueDate: '2023-12-25',
    },
  ],
  inProgress: [
    {
      id: '4',
      title: 'Database schema optimization',
      description: 'Optimize database queries and improve performance',
      priority: 'high',
      assignee: { id: '1', name: 'John Smith', initials: 'JS', color: 'blue-500' },
      dueDate: '2023-12-18',
    },
    {
      id: '5',
      title: 'API integration testing',
      description: 'Test all API endpoints and ensure proper error handling',
      priority: 'medium',
      assignee: { id: '3', name: 'Mike Johnson', initials: 'MJ', color: 'purple-500' },
      dueDate: '2023-12-19',
    },
  ],
  review: [
    {
      id: '6',
      title: 'Frontend component refactoring',
      description: 'Refactor React components for better reusability',
      priority: 'medium',
      assignee: { id: '2', name: 'Sarah Wilson', initials: 'SW', color: 'green-500' },
      dueDate: '2023-12-17',
    },
  ],
  done: [
    {
      id: '7',
      title: 'Set up CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      priority: 'low',
      assignee: { id: '1', name: 'John Smith', initials: 'JS', color: 'blue-500' },
      dueDate: '2023-12-15',
    },
    {
      id: '8',
      title: 'Security audit completion',
      description: 'Complete security review and fix vulnerabilities',
      priority: 'high',
      assignee: { id: '3', name: 'Mike Johnson', initials: 'MJ', color: 'purple-500' },
      dueDate: '2023-12-14',
    },
  ],
};

export const TaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const { handleDragStart, handleDragOver, handleDrop } = useDragDrop(tasks, setTasks);

  // Update task counts
  const taskCounts = {
    todo: tasks.todo.length,
    inProgress: tasks.inProgress.length,
    review: tasks.review.length,
    done: tasks.done.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Development Sprint</h1>
        <p className="text-gray-600 mt-1">Organize and track your team's workflow efficiently</p>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(taskCounts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className={`w-10 h-10 ${
                status === 'todo' ? 'bg-gray-100' : 
                status === 'inProgress' ? 'bg-blue-100' :
                status === 'review' ? 'bg-yellow-100' : 'bg-green-100'
              } rounded-lg flex items-center justify-center`}>
                <span className={`text-${
                  status === 'todo' ? 'gray' : 
                  status === 'inProgress' ? 'blue' :
                  status === 'review' ? 'yellow' : 'green'
                }-600`}>
                  {status === 'todo' ? '📝' : 
                   status === 'inProgress' ? '⚡' :
                   status === 'review' ? '👀' : '✅'}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 capitalize">
                  {status.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Object.entries(tasks).map(([status, tasks]) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
};
