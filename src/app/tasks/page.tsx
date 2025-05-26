"use client";

import React, { useState, useEffect, useRef } from 'react';
import feather from 'feather-icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Script from 'next/script';
// Import components
import { AppNavbar, ActionBar } from '@/components/layout';
import { BoardStats } from '@/components/tasks/BoardStats';
import { TeamFilters } from '@/components/tasks/TeamFilters';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { Task } from '@/types/task';
import { getTasks } from '@/lib/data/tasks';

export default function TasksPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [activeBoard, setActiveBoard] = useState('main');
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState<any>({
    main: { todo: [], inProgress: [], review: [], done: [] }
  });
  const [boards, setBoards] = useState([
    { id: 'main', label: 'All Tasks' }
  ]);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('');
  const [loading, setLoading] = useState(true);

  // Team members for the filters
  const teamMembers = [
    { id: '1', name: 'John Smith', initials: 'JS', color: 'blue-500' },
    { id: '2', name: 'Sarah Wilson', initials: 'SW', color: 'green-500' },
    { id: '3', name: 'Mike Johnson', initials: 'MJ', color: 'purple-500' },
  ];
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: teamMembers[0]
  });
  
  // State for custom dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Add click outside listener for dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      feather.replace();
    }
  }, [isClient, activeBoard, showNewBoardModal, showNewTaskModal, dropdownOpen]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        
        // Organize tasks by status
        const organizedTasks = {
          main: {
            todo: data.filter((task: any) => task.status === 'pending'),
            inProgress: data.filter((task: any) => task.status === 'in_progress'),
            review: data.filter((task: any) => task.status === 'review'),
            done: data.filter((task: any) => task.status === 'completed')
          }
        };
        
        setTasks(organizedTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Handle board change
  const handleBoardChange = (board: string) => {
    setActiveBoard(board);
  };
  
  // Handle adding a new board
  const handleAddBoard = () => {
    setShowNewBoardModal(true);
  };
  
  // Handle creating a new board
  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      const newBoardId = newBoardName.toLowerCase().replace(/\s+/g, '-');
      
      // Add the new board to the boards array
      setBoards([...boards, { id: newBoardId, label: newBoardName.trim() }]);
      
      // Initialize empty tasks for the new board
      setTasks({
        ...tasks,
        [newBoardId]: {
          todo: [],
          inProgress: [],
          review: [],
          done: []
        }
      });
      
      // Switch to the new board
      setActiveBoard(newBoardId);
      
      // Reset the form
      setNewBoardName('');
      setShowNewBoardModal(false);
    }
  };

  // Handle column edit toggle
  const handleToggleColumnEdit = () => {
    setIsEditing(!isEditing);
  };

  // Handle column add
  const handleAddColumn = () => {
    console.log('Adding new column');
    // Implementation would go here
  };

  // Handle column delete
  const handleDeleteColumn = (status: string) => {
    console.log(`Deleting column: ${status}`);
    // Implementation would go here
  };
  
  // Handle opening the new task modal
  const handleAddTask = (columnStatus: string) => {
    setNewTaskColumn(columnStatus);
    setShowNewTaskModal(true);
  };
  
  // Handle creating a new task
  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const newTaskId = `task-${Date.now()}`;
      const taskToAdd = {
        id: newTaskId,
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        assignee: newTask.assignee,
        dueDate: new Date().toISOString().split('T')[0]
      };
      
      // Add the new task to the specified column
      setTasks(prevTasks => {
        const updatedTasks = { ...prevTasks };
        updatedTasks[activeBoard][newTaskColumn] = [
          ...updatedTasks[activeBoard][newTaskColumn],
          taskToAdd
        ];
        return updatedTasks;
      });
      
      // Reset the form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignee: teamMembers[0]
      });
      setShowNewTaskModal(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    console.log('Searching tasks');
    // Implementation would go here
  };

  // Temporarily bypass authentication check for development
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-md h-28">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Temporarily bypass authentication check
  // if (!userId) {
  //   router.push('/sign-in');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeBoard === 'main' ? 'Development Sprint' : 
             activeBoard === 'marketing' ? 'Marketing Tasks' : 'HR & Admin'}
          </h1>
          <ActionBar 
            buttons={[
              {
                id: 'add-column',
                label: 'Add Column',
                icon: 'plus-circle',
                variant: 'primary',
                onClick: handleAddColumn
              },
              {
                id: 'edit-columns',
                label: isEditing ? 'Done' : 'Edit Columns',
                icon: isEditing ? 'check' : 'edit-2',
                variant: 'secondary',
                onClick: handleToggleColumnEdit
              }
            ]}
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex flex-1 overflow-x-auto space-x-4 pr-4">
              {boards.map(board => (
                <button 
                  key={board.id}
                  className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${activeBoard === board.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  onClick={() => handleBoardChange(board.id)}
                >
                  {board.label}
                </button>
              ))}
            </div>
            <button 
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={handleAddBoard}
            >
              <i data-feather="plus-circle" className="h-4 w-4 mr-1"></i>
              New Board
            </button>
          </div>
        </div>
        
        {/* New Board Modal */}
        {showNewBoardModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Board</h3>
              <div className="mb-4">
                <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Board Name
                </label>
                <input
                  type="text"
                  id="boardName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  onClick={() => {
                    setNewBoardName('');
                    setShowNewBoardModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim()}
                >
                  Create Board
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-8">
          {/* Board Stats */}
          <BoardStats 
            todoCount={tasks[activeBoard]?.todo.length || 0}
            progressCount={tasks[activeBoard]?.inProgress.length || 0}
            reviewCount={tasks[activeBoard]?.review.length || 0}
            doneCount={tasks[activeBoard]?.done.length || 0}
          />

          {/* Team & Filters */}
          <TeamFilters 
            teamMembers={teamMembers}
            onSearch={handleSearch}
          />
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-md h-28">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <KanbanBoard 
            tasks={tasks} 
            activeBoard={activeBoard} 
            isEditing={isEditing}
            onDeleteColumn={handleDeleteColumn}
            onAddTask={handleAddTask}
            setTasks={setTasks}
          />
        )}
        
        {/* New Task Modal */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Task to {newTaskColumn === 'todo' ? 'To Do' : 
                               newTaskColumn === 'inProgress' ? 'In Progress' : 
                               newTaskColumn === 'review' ? 'Review' : 'Done'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="taskTitle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="taskDescription"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description"
                  />
                </div>
                
                <div>
                  <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="taskPriority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="relative">
                  <label htmlFor="taskAssignee" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    {/* Custom dropdown button */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 bg-${newTask.assignee.color} rounded-full flex items-center justify-center mr-2`}>
                          <span className="text-white text-xs font-medium">{newTask.assignee.initials}</span>
                        </div>
                        <span>{newTask.assignee.name}</span>
                      </div>
                      <i data-feather={dropdownOpen ? "chevron-down" : "chevron-up"} className="h-4 w-4 text-gray-500"></i>
                    </button>
                    
                    {/* Dropdown options - positioned above */}
                    {dropdownOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                        <ul className="py-1">
                          {teamMembers.map(member => (
                            <li 
                              key={member.id} 
                              className={`px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer ${member.id === newTask.assignee.id ? 'bg-blue-50' : ''}`}
                              onClick={() => {
                                setNewTask({...newTask, assignee: member});
                                setDropdownOpen(false);
                              }}
                            >
                              <div className={`w-6 h-6 bg-${member.color} rounded-full flex items-center justify-center mr-2`}>
                                <span className="text-white text-xs font-medium">{member.initials}</span>
                              </div>
                              <span>{member.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  onClick={() => {
                    setNewTask({
                      title: '',
                      description: '',
                      priority: 'medium',
                      assignee: teamMembers[0]
                    });
                    setShowNewTaskModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim()}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for the task board */}
      <style jsx global>{`
        /* Task Card Styling */
        .task-card { 
          transition: all 0.3s ease; 
          max-height: 300px;
          overflow: hidden;
        }
        
        .task-card.expanded { 
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15); 
          z-index: 10;
          position: relative;
        }
        
        .task-card:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
        }
        
        .task-card.expanded:hover {
          transform: scale(1.02);
        }
        
        /* Priority Indicators */
        .priority-high { border-left: 4px solid #ef4444; }
        .priority-medium { border-left: 4px solid #f59e0b; }
        .priority-low { border-left: 4px solid #10b981; }
        
        /* Drag and Drop */
        .dragging {
          opacity: 0.7;
          transform: scale(1.02);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .drag-over {
          background-color: #f0f9ff !important;
          border: 2px dashed #3b82f6 !important;
        }
        
        /* Equal column sizes */
        #kanbanBoard {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          width: 100%;
        }
        
        .column-container {
          width: 100%;
          min-width: 0;
        }
        
        /* Modal */
        .modal { display: none; }
        .modal.active { display: flex; }
        
        /* Board Tabs */
        .board-tab { transition: all 0.2s ease; }
        .board-tab:hover { background-color: rgba(255,255,255,0.1); }
        .board-tab.active { background-color: rgba(255,255,255,0.2); border-bottom: 2px solid white; }
      `}</style>
    </div>
  );
}
