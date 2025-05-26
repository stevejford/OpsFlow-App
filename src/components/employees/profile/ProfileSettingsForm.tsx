"use client";

import { useState, useRef, useEffect } from 'react';

interface ProfileSettingsFormProps {
  formData: {
    profilePhoto: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    twoFactorAuth: boolean;
    accessLevel: string;
    notes: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (file: File | null) => void;
}

export default function ProfileSettingsForm({ formData, onInputChange, onFileChange }: ProfileSettingsFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('feather-icons').then(feather => {
        feather.default.replace();
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileChange(file);
    } else {
      setPreview(null);
      onFileChange(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Customize profile and access settings.</p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden">
                  {preview || formData.profilePhoto ? (
                    <img 
                      src={preview || formData.profilePhoto} 
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <i data-feather="user" className="h-12 w-12"></i>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <i data-feather="upload" className="h-4 w-4 inline mr-1"></i>
                  Change Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <p className="mt-2 text-xs text-gray-500">
                  JPG, GIF or PNG. Max size 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="sm:col-span-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={onInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="smsNotifications"
                  name="smsNotifications"
                  type="checkbox"
                  checked={formData.smsNotifications}
                  onChange={onInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                  SMS Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="twoFactorAuth"
                  name="twoFactorAuth"
                  type="checkbox"
                  checked={formData.twoFactorAuth}
                  onChange={onInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                  Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700">
              Access Level
            </label>
            <select
              id="accessLevel"
              name="accessLevel"
              value={formData.accessLevel}
              onChange={onInputChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
              <option value="hr">HR Personnel</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Internal Notes
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={onInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Any additional notes or comments..."
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              These notes are only visible to HR and administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
