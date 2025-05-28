'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type PermissionLevel = 'view' | 'edit' | 'admin' | 'none';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
}

interface Permission {
  id: string;
  entityId: string;
  entityType: 'user' | 'group';
  level: PermissionLevel;
  name: string;
  email?: string;
  memberCount?: number;
  avatar?: string;
}

interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType: 'document' | 'folder';
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
  users?: User[];
  groups?: Group[];
}

export default function PermissionsDialog({
  isOpen,
  onClose,
  itemName,
  itemType,
  permissions,
  onPermissionsChange,
  users = [],
  groups = []
}: PermissionsDialogProps) {
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'users' | 'groups'>('users');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePermissionChange = (id: string, level: PermissionLevel) => {
    setLocalPermissions(prev => 
      prev.map(permission => 
        permission.id === id ? { ...permission, level } : permission
      )
    );
  };

  const handleRemovePermission = (id: string) => {
    setLocalPermissions(prev => prev.filter(permission => permission.id !== id));
  };

  const handleAddPermission = (entity: User | Group, type: 'user' | 'group') => {
    // Check if permission already exists
    if (localPermissions.some(p => p.entityId === entity.id && p.entityType === type)) {
      toast.error(`${type === 'user' ? entity.name : entity.name} already has permissions`);
      return;
    }
    
    const newPermission: Permission = {
      id: `${type}-${entity.id}`,
      entityId: entity.id,
      entityType: type,
      level: 'view',
      name: entity.name,
      ...(type === 'user' ? { email: (entity as User).email, avatar: (entity as User).avatar } : { memberCount: (entity as Group).memberCount })
    };
    
    setLocalPermissions([...localPermissions, newPermission]);
    setShowAddMenu(false);
    setSearchQuery('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onPermissionsChange(localPermissions);
      toast.success('Permissions updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissionOptions: { value: PermissionLevel; label: string; description: string }[] = [
    { 
      value: 'view', 
      label: 'Viewer', 
      description: 'Can view and download, but not edit' 
    },
    { 
      value: 'edit', 
      label: 'Editor', 
      description: 'Can edit, but not manage permissions' 
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Can edit and manage permissions' 
    },
    { 
      value: 'none', 
      label: 'No access', 
      description: 'Cannot access this item' 
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {itemType === 'document' ? 'Document' : 'Folder'} Permissions: {itemName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {/* Owner info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Owner</h4>
            <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-medium">JD</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">John Doe (You)</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
              </div>
              <div className="ml-auto">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Owner
                </span>
              </div>
            </div>
          </div>
          
          {/* Who has access */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Who has access</h4>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add people or groups
                </button>
                
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users or groups"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      
                      <div className="flex mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTab('users')}
                          className={cn(
                            "flex-1 py-1 text-sm font-medium rounded-l-md",
                            selectedTab === 'users' 
                              ? "bg-blue-600 text-white" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          Users
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTab('groups')}
                          className={cn(
                            "flex-1 py-1 text-sm font-medium rounded-r-md",
                            selectedTab === 'groups' 
                              ? "bg-blue-600 text-white" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          Groups
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto p-2">
                      {selectedTab === 'users' ? (
                        filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <div 
                              key={user.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => handleAddPermission(user, 'user')}
                            >
                              {user.avatar ? (
                                <img 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  className="w-8 h-8 rounded-full mr-3"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                  <span className="text-gray-600 text-sm font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                              {user.role && (
                                <span className="ml-auto text-xs text-gray-500">
                                  {user.role}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 p-2">No users found</p>
                        )
                      ) : (
                        filteredGroups.length > 0 ? (
                          filteredGroups.map(group => (
                            <div 
                              key={group.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                              onClick={() => handleAddPermission(group, 'group')}
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{group.name}</p>
                                <p className="text-xs text-gray-500">{group.memberCount} members</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 p-2">No groups found</p>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {localPermissions.length > 0 ? (
                localPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      {permission.entityType === 'user' ? (
                        <>
                          {permission.avatar ? (
                            <img 
                              src={permission.avatar} 
                              alt={permission.name} 
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-600 text-sm font-medium">
                                {permission.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                            <p className="text-xs text-gray-500">{permission.email}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                            <p className="text-xs text-gray-500">{permission.memberCount} members</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={permission.level}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.value as PermissionLevel)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {permissionOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(permission.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic p-3 border border-gray-200 rounded-lg bg-gray-50">
                  No additional permissions set
                </p>
              )}
            </div>
          </div>
          
          {/* Permission levels explanation */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Permission levels</h4>
            <div className="space-y-2">
              {permissionOptions.map(option => (
                <div key={option.value} className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">{option.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-200 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-lg text-white transition-colors",
              isSaving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSaving ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
