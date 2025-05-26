"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Tabs for different settings sections
const TABS = {
  DEPARTMENTS: "departments",
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
