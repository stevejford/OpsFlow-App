"use client";

interface EmploymentInformationFormProps {
  formData: {
    employeeId: string;
    position: string;
    department: string;
    employmentType: string;
    manager: string;
    startDate: string;
    endDate: string;
    status: string;
    workLocation: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function EmploymentInformationForm({ formData, onInputChange }: EmploymentInformationFormProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Employment Information</h3>
        <p className="mt-1 text-sm text-gray-500">Work-related details and status.</p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
              Employee ID
            </label>
            <input
              type="text"
              name="employeeId"
              id="employeeId"
              value={formData.employeeId}
              onChange={onInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
              disabled
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              name="position"
              id="position"
              value={formData.position}
              onChange={onInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={onInputChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={onInputChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="manager" className="block text-sm font-medium text-gray-700">
              Manager
            </label>
            <input
              type="text"
              name="manager"
              id="manager"
              value={formData.manager}
              onChange={onInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Employment Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onInputChange}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate}
              onChange={onInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formData.endDate}
              onChange={onInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={formData.status === 'Active'}
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
              Work Location
            </label>
            <input
              type="text"
              name="workLocation"
              id="workLocation"
              value={formData.workLocation}
              onChange={onInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
