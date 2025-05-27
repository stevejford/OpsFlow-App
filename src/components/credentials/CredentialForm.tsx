'use client';

import React, { useState, useEffect } from 'react';
import { Credential, CredentialFormValues } from '@/types/credential';

interface CredentialFormProps {
  initialValues?: Partial<CredentialFormValues>;
  onSubmit: (values: CredentialFormValues) => void;
  isEdit?: boolean;
}

export const CredentialForm: React.FC<CredentialFormProps> = ({
  initialValues = {},
  onSubmit,
  isEdit = false
}) => {
  const [values, setValues] = useState<CredentialFormValues>({
    name: '',
    category: 'business',
    username: '',
    password: '',
    confirmPassword: '',
    url: '',
    notes: '',
    tags: [],
    status: 'active',
    ...initialValues
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setValues({
        ...values,
        ...initialValues
      });
    }
  }, [initialValues]);

  useEffect(() => {
    // Calculate password strength
    const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
      if (!password) return 'weak';
      
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLongEnough = password.length >= 8;
      
      const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars, isLongEnough].filter(Boolean).length;
      
      if (score <= 2) return 'weak';
      if (score <= 4) return 'medium';
      return 'strong';
    };
    
    setPasswordStrength(calculatePasswordStrength(values.password));
  }, [values.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !values.tags?.includes(tagInput.trim())) {
      setValues({
        ...values,
        tags: [...(values.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValues({
      ...values,
      tags: values.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setValues({
      ...values,
      password,
      confirmPassword: password
    });
    
    setShowPassword(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!values.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!values.username) {
      newErrors.username = 'Username/Email is required';
    }
    
    if (!values.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!isEdit && values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (values.url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(values.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...submitValues } = values;
      onSubmit(submitValues);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={values.name}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-300' : ''}`}
              placeholder="e.g., Company Email"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <div className="mt-1">
            <select
              id="category"
              name="category"
              value={values.category}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="business">Business Login</option>
              <option value="website">Website Credential</option>
              <option value="employee">Employee Login</option>
              <option value="api">API Key</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username/Email *
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="username"
              id="username"
              value={values.username}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.username ? 'border-red-300' : ''}`}
              placeholder="username@example.com"
            />
            {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="url"
              id="url"
              value={values.url || ''}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.url ? 'border-red-300' : ''}`}
              placeholder="https://example.com"
            />
            {errors.url && <p className="mt-2 text-sm text-red-600">{errors.url}</p>}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <div className="mt-1 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              value={values.password}
              onChange={handleChange}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md pr-10 ${errors.password ? 'border-red-300' : ''}`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
              </svg>
            </button>
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>
          <div className="mt-2 flex items-center">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  passwordStrength === 'weak' ? 'bg-red-500 w-1/3' : 
                  passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 
                  'bg-green-500 w-full'
                }`} 
              />
            </div>
            <span className="ml-2 text-xs text-gray-500 capitalize">{passwordStrength}</span>
            <button
              type="button"
              onClick={generatePassword}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Generate
            </button>
          </div>
        </div>

        {!isEdit && (
          <div className="sm:col-span-3">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <div className="mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                value={values.confirmPassword || ''}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.confirmPassword ? 'border-red-300' : ''}`}
              />
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}

        <div className="sm:col-span-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={values.notes || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Additional information about this credential"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="mt-1">
            <div className="flex items-center">
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add tags and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            {values.tags && values.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {values.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-200"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
            Expiration Date
          </label>
          <div className="mt-1">
            <input
              type="date"
              name="expirationDate"
              id="expirationDate"
              value={values.expirationDate || ''}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={values.status}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};
