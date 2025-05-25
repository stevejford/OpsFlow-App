// Component with client-side interactivity

import React, { useState } from 'react';
import { TaskColumn } from './TaskColumn';
import { Task } from '@/types/task';

interface KanbanBoardProps {
  tasks: {
    [key: string]: {
      todo: Task[];
      inProgress: Task[];
      review: Task[];
      done: Task[];
    };
  };
  activeBoard: string;
  isEditing: boolean;
  onDeleteColumn?: (status: string) => void;
  onAddTask?: (status: string) => void;
  setTasks?: (tasks: any) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  activeBoard,
  isEditing,
  onDeleteColumn,
  onAddTask,
  setTasks
}) => {
  // Get the current board's tasks
  const currentBoardTasks = tasks[activeBoard] || {
    todo: [],
    inProgress: [],
    review: [],
    done: []
  };
  const [draggedTask, setDraggedTask] = useState<{ id: string; fromStatus: string } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    // Add a class to the dragged element for styling
    const element = e.currentTarget as HTMLElement;
    element.classList.add('dragging');
    
    // Set effectAllowed to move to show the correct cursor
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a drag image (optional)
    const dragImage = document.createElement('div');
    dragImage.textContent = 'Moving Task';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Add a visual indicator for the drop target
    const element = e.currentTarget as HTMLElement;
    element.classList.add('drag-over');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove the visual indicator when dragging leaves the drop target
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Clean up any remaining drag classes
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('dragging');
    
    // Remove drag-over class from all columns
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, toStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    // Remove the drag-over class
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
    
    // Find which status the task is currently in
    let fromStatus: string | null = null;
    let taskToMove: Task | null = null;
    
    Object.entries(currentBoardTasks).forEach(([status, taskList]) => {
      const task = taskList.find(t => t.id === taskId);
      if (task) {
        fromStatus = status;
        taskToMove = task;
      }
    });
    
    if (fromStatus && taskToMove && fromStatus !== toStatus) {
      // Create a deep copy of the tasks
      const updatedTasks = JSON.parse(JSON.stringify(tasks));
      
      // Remove from original status
      updatedTasks[activeBoard][fromStatus] = updatedTasks[activeBoard][fromStatus].filter(
        (t: Task) => t.id !== taskId
      );
      
      // Add to new status
      updatedTasks[activeBoard][toStatus].push(taskToMove);
      
      // Update state
      if (setTasks) {
        setTasks(updatedTasks);
      }
    }
  };

  return (
    <div id="kanbanBoard" className="grid grid-cols-4 gap-4 overflow-x-auto pb-4">
      <TaskColumn 
        status="todo"
        tasks={currentBoardTasks.todo}
        isEditing={isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDeleteColumn={onDeleteColumn}
        onAddTask={onAddTask}
      />
      <TaskColumn 
        status="inProgress"
        tasks={currentBoardTasks.inProgress}
        isEditing={isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDeleteColumn={onDeleteColumn}
        onAddTask={onAddTask}
      />
      <TaskColumn 
        status="review"
        tasks={currentBoardTasks.review}
        isEditing={isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDeleteColumn={onDeleteColumn}
        onAddTask={onAddTask}
      />
      <TaskColumn 
        status="done"
        tasks={currentBoardTasks.done}
        isEditing={isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDeleteColumn={onDeleteColumn}
        onAddTask={onAddTask}
      />
    </div>
  );
};
