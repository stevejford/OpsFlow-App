'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
}

interface ActionBarProps {
  buttons: ActionButton[];
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
  buttons,
  className = ''
}) => {
  // Using our custom Icon component instead of Feather icons

  const getButtonClasses = (variant: string) => {
    const baseClasses = "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
      case 'danger':
        return `${baseClasses} bg-red-50 hover:bg-red-100 text-red-700 border border-red-200`;
      case 'success':
        return `${baseClasses} bg-green-50 hover:bg-green-100 text-green-700 border border-green-200`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200`;
      default:
        return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {buttons.map((button) => (
        <button 
          key={button.id}
          className={getButtonClasses(button.variant)}
          onClick={button.onClick}
        >
          {button.icon && (
            <Icon name={`fas ${button.icon}`} className="h-4 w-4 mr-2" />
          )}
          {button.label}
        </button>
      ))}
    </div>
  );
};
