"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Tabs for different settings sections
const TABS = {
  DEPARTMENTS: "departments",
  DOCUMENTS: "documents",
  GENERAL: "general",
  NOTIFICATIONS: "notifications",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(TABS.DEPARTMENTS);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Document settings state
  const [documentSettings, setDocumentSettings] = useState({
    aiSearchEnabled: true,
    maxFileSize: 100, // MB
    allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'ppt', 'pptx'],
    autoSaveSearches: true,
    maxRecentSearches: 10,
    enableDocumentVersioning: true,
    defaultFolderPermissions: 'inherit',
    enableAIChat: true,
    chatSuggestedQuestions: [
      "What are the key points in this document?",
      "Can you summarize this document?",
      "What are the action items mentioned?",
      "Who are the stakeholders mentioned?",
      "What are the deadlines mentioned?"
    ]
  });

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/departments');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Load document settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('documentSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setDocumentSettings(prev => ({ ...prev, ...parsedSettings }));
      } catch (error) {
        console.error('Error loading document settings:', error);
      }
    }
  }, []);

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }

    if (departments.includes(newDepartment.trim())) {
      toast.error("Department already exists");
      return;
    }

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department: newDepartment.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add department');
      }

      const data = await response.json();
      setDepartments(data.departments);
      setNewDepartment("");
      toast.success("Department added successfully");
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add department');
    }
  };

  const handleRemoveDepartment = async (department: string) => {
    // Show confirmation dialog
    if (confirm(`Are you sure you want to remove "${department}"?`)) {
      try {
        const response = await fetch(`/api/departments?department=${encodeURIComponent(department)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove department');
        }

        const data = await response.json();
        setDepartments(data.departments);
        toast.success("Department removed successfully");
      } catch (error) {
        console.error('Error removing department:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to remove department');
      }
    }
  };

  const startEditing = (department: string) => {
    setIsEditing(department);
    setEditValue(department);
  };

  const handleEditDepartment = async () => {
    if (!editValue.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }

    if (departments.includes(editValue.trim()) && editValue.trim() !== isEditing) {
      toast.error("Department already exists");
      return;
    }

    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          oldDepartment: isEditing,
          newDepartment: editValue.trim() 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update department');
      }

      const data = await response.json();
      setDepartments(data.departments);
      setIsEditing(null);
      toast.success("Department updated successfully");
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update department');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === TABS.DEPARTMENTS
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(TABS.DEPARTMENTS)}
            >
              Departments
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === TABS.DOCUMENTS
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(TABS.DOCUMENTS)}
            >
              Documents
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === TABS.GENERAL
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(TABS.GENERAL)}
            >
              General
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === TABS.NOTIFICATIONS
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(TABS.NOTIFICATIONS)}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Department Settings */}
        {activeTab === TABS.DEPARTMENTS && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Departments</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add, edit, or remove departments for employee profiles. These departments will be available when creating or editing employee profiles.
            </p>

            {/* Add Department Form */}
            <div className="flex mb-6">
              <input
                type="text"
                placeholder="Enter new department name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddDepartment()}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
                onClick={handleAddDepartment}
              >
                Add Department
              </button>
            </div>

            {/* Departments List */}
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading departments...
                      </td>
                    </tr>
                  ) : departments.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                        No departments found. Add your first department above.
                      </td>
                    </tr>
                  ) : (
                    departments.map((department) => (
                    <tr key={department}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing === department ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleEditDepartment()}
                            autoFocus
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {department}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing === department ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleEditDepartment}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditing(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => startEditing(department)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveDepartment(department)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Settings */}
        {activeTab === TABS.DOCUMENTS && (
          <div className="space-y-6">
            {/* Search Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Search Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">AI-Enhanced Search</label>
                    <p className="text-sm text-gray-500">Enable AI-powered search suggestions and results</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={documentSettings.aiSearchEnabled}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, aiSearchEnabled: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-save Searches</label>
                    <p className="text-sm text-gray-500">Automatically save search queries for quick access</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={documentSettings.autoSaveSearches}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, autoSaveSearches: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Recent Searches
                  </label>
                  <select
                    value={documentSettings.maxRecentSearches}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, maxRecentSearches: parseInt(e.target.value) }))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </div>

            {/* File Upload Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">File Upload Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <select
                    value={documentSettings.maxFileSize}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={50}>50 MB</option>
                    <option value={100}>100 MB</option>
                    <option value={200}>200 MB</option>
                    <option value={500}>500 MB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif'].map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={documentSettings.allowedFileTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDocumentSettings(prev => ({ 
                                ...prev, 
                                allowedFileTypes: [...prev.allowedFileTypes, type] 
                              }));
                            } else {
                              setDocumentSettings(prev => ({ 
                                ...prev, 
                                allowedFileTypes: prev.allowedFileTypes.filter(t => t !== type) 
                              }));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">.{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Folder Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Folder Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Document Versioning</label>
                    <p className="text-sm text-gray-500">Keep track of document versions when files are updated</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={documentSettings.enableDocumentVersioning}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, enableDocumentVersioning: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Folder Permissions
                  </label>
                  <select
                    value={documentSettings.defaultFolderPermissions}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, defaultFolderPermissions: e.target.value }))}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inherit">Inherit from parent</option>
                    <option value="private">Private (owner only)</option>
                    <option value="team">Team access</option>
                    <option value="public">Public access</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Chat Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Chat Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable AI Chat</label>
                    <p className="text-sm text-gray-500">Allow users to chat with AI about documents</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={documentSettings.enableAIChat}
                    onChange={(e) => setDocumentSettings(prev => ({ ...prev, enableAIChat: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {documentSettings.enableAIChat && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Questions
                    </label>
                    <div className="space-y-2">
                      {documentSettings.chatSuggestedQuestions.map((question, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={question}
                            onChange={(e) => {
                              const newQuestions = [...documentSettings.chatSuggestedQuestions];
                              newQuestions[index] = e.target.value;
                              setDocumentSettings(prev => ({ ...prev, chatSuggestedQuestions: newQuestions }));
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => {
                              const newQuestions = documentSettings.chatSuggestedQuestions.filter((_, i) => i !== index);
                              setDocumentSettings(prev => ({ ...prev, chatSuggestedQuestions: newQuestions }));
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setDocumentSettings(prev => ({ 
                            ...prev, 
                            chatSuggestedQuestions: [...prev.chatSuggestedQuestions, ""] 
                          }));
                        }}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // Save document settings
                    localStorage.setItem('documentSettings', JSON.stringify(documentSettings));
                    toast.success('Document settings saved successfully');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* General Settings */}
        {activeTab === TABS.GENERAL && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            <p className="text-gray-500 mb-6">Configure general application settings.</p>
            
            <div className="text-center text-gray-500 py-8">
              General settings will be implemented in a future update.
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === TABS.NOTIFICATIONS && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
            <p className="text-gray-500 mb-6">Configure notification preferences.</p>
            
            <div className="text-center text-gray-500 py-8">
              Notification settings will be implemented in a future update.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
