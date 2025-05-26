import { useState, useCallback } from 'react';
import { Task } from '@/types/task';

export const useDragDrop = (
  initialTasks: Record<string, Task[]>,
  setTasks: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>
) => {
  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromStatus: string } | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.stopPropagation();
    const fromStatus = (e.currentTarget.closest('[data-status]') as HTMLElement)?.dataset.status || '';
    setDraggedTask({ taskId, fromStatus });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toStatus: string) => {
      e.preventDefault();
      
      if (!draggedTask) return;
      
      const { taskId, fromStatus } = draggedTask;
      
      if (fromStatus === toStatus) {
        setDraggedTask(null);
        return;
      }

      setTasks((prevTasks) => {
        const fromTasks = [...(prevTasks[fromStatus as keyof typeof prevTasks] || [])];
        const toTasks = [...(prevTasks[toStatus as keyof typeof prevTasks] || [])];
        
        const taskIndex = fromTasks.findIndex((task) => task.id === taskId);
        if (taskIndex === -1) return prevTasks;
        
        const [movedTask] = fromTasks.splice(taskIndex, 1);
        toTasks.push(movedTask);
        
        return {
          ...prevTasks,
          [fromStatus]: fromTasks,
          [toStatus]: toTasks,
        };
      });

      setDraggedTask(null);
    },
    [draggedTask, setTasks]
  );

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
};
