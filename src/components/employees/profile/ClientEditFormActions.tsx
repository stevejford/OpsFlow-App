"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';

interface ClientEditFormActionsProps {
  employeeId: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function ClientEditFormActions({ 
  employeeId, 
  isSubmitting,
  onCancel,
}: ClientEditFormActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Initialize feather icons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('feather-icons').then(feather => {
        feather.default.replace();
      });
    }
  }, []);

  const handleSave = async () => {
    // Trigger form submission
    const form = document.getElementById('employee-edit-form') as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel();
  };

  const handleDelete = async () => {
    try {
      // Handle delete logic here
      console.log('Deleting employee:', employeeId);
      router.push('/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Handle actions from URL search params
  useEffect(() => {
    const action = searchParams.get('action');
    
    const handleAction = async () => {
      switch (action) {
        case 'save':
          await handleSave();
          break;
        case 'delete':
          setShowDeleteModal(true);
          break;
        case 'cancel':
          onCancel();
          break;
      }
    };

    if (action) {
      handleAction();
      // Clear the action from URL after handling
      const params = new URLSearchParams(searchParams.toString());
      params.delete('action');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, pathname, router, onCancel]);

  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={handleCancelClick}
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="employee-edit-form"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Delete
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete employee
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this employee? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
