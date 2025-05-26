"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployeesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Number of employees per page
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [indexOfFirstEmployee, setIndexOfFirstEmployee] = useState(0);
  const [indexOfLastEmployee, setIndexOfLastEmployee] = useState(0);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  
  const handleAddEmployee = () => {
    router.push('/employees/new');
  };
  
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch employees from the API
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/employees');
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      
      // Transform the API data to match our EmployeeData interface
      const transformedData: EmployeeData[] = data.map((employee: any) => ({
        id: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        position: employee.position || 'Not specified',
        department: employee.department || 'Not specified',
        status: employee.status || 'Active',
        licenses: employee.licenses_count || Math.floor(Math.random() * 5), // Use actual count or random for demo
        documents: employee.documents_count || Math.floor(Math.random() * 8),
        inductions: employee.inductions_count || Math.floor(Math.random() * 3),
        alerts: [],
        initials: `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase(),
        color: getRandomColor()
      }));
      
      setEmployees(transformedData);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again later.');
      setEmployees([]);
      // No fallback data, just show an empty state with error message
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to generate random colors for employee avatars
  const getRandomColor = () => {
    const colors = ['blue', 'green', 'purple', 'red', 'orange', 'teal', 'indigo', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Filter employees and handle pagination
  useEffect(() => {
    const filtered = employees.filter(employee => {
      const matchesSearch = searchTerm === "" || 
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = department === "All Departments" || 
        employee.department === department;
      
      const matchesStatus = status === "All Status" || 
        employee.status === status;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    setFilteredEmployees(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [employees, searchTerm, department, status, itemsPerPage]);
  
  // Update pagination indexes when current page changes
  useEffect(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    
    setIndexOfLastEmployee(lastIndex);
    setIndexOfFirstEmployee(firstIndex);
  }, [currentPage, itemsPerPage]);
  
  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setAvailableDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);
  
  // Fetch employees when the component mounts or when navigating back to this page
  useEffect(() => {
    fetchEmployees();
    
    // Add event listener for focus to refresh data when returning to the page
    const handleFocus = () => {
      fetchEmployees();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Functions for pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  // Toggle employee details
  const toggleEmployeeDetails = (empId: string) => {
    const details = document.getElementById(`${empId}-details`);
    const collapsed = document.getElementById(`${empId}-collapsed`);
    const chevron = document.getElementById(`${empId}-chevron`);
    
    if (details && collapsed && chevron) {
      if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        collapsed.classList.add('hidden');
        chevron.style.transform = 'rotate(180deg)';
      } else {
        details.classList.add('hidden');
        collapsed.classList.remove('hidden');
        chevron.style.transform = 'rotate(0deg)';
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {/* Page Title and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600 mt-1">Manage employee profiles, documents, licenses, and inductions</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
              onClick={handleAddEmployee}
            >
              <i data-feather="user-plus" className="h-4 w-4 mr-2"></i>
              <span>Add Employee</span>
            </button>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center"
              onClick={fetchEmployees}
              disabled={isLoading}
            >
              <i data-feather="refresh-cw" className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <i data-feather="alert-circle" className="h-5 w-5 mr-2"></i>
              <span>{error}</span>
            </div>
            <button 
              className="text-red-700 hover:text-red-900"
              onClick={() => setError(null)}
            >
              <i data-feather="x" className="h-4 w-4"></i>
            </button>
          </div>
        )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search employees..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option>All Departments</option>
            {availableDepartments.map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending Induction</option>
          </select>
        </div>
      </div>

      {/* Employee Cards Grid */}
      
      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                <div className="h-3 bg-gray-300 rounded w-4/6"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <div className="h-8 bg-gray-300 rounded w-2/5"></div>
                  <div className="h-8 bg-gray-300 rounded w-2/5"></div>
                </div>
              </div>
            </div>
          ))
        ) : filteredEmployees.length > 0 ? (
          // Employee cards
          filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee).map(employee => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee} 
              toggleDetails={() => toggleEmployeeDetails(employee.id)}
            />
          ))
        ) : (
          // No results message
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <i data-feather="users" className="h-16 w-16 text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No results for "${searchTerm}"` : 'No employees match the selected filters'}
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setDepartment('All Departments');
                setStatus('All Status');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {filteredEmployees.length > 0 ? (
            <>Showing <span className="font-medium">{indexOfFirstEmployee + 1}</span> to <span className="font-medium">{Math.min(indexOfLastEmployee, filteredEmployees.length)}</span> of <span className="font-medium">{filteredEmployees.length}</span> employees</>
          ) : (
            <>No employees found</>
          )}
        </div>
        {filteredEmployees.length > 0 && (
          <div className="flex space-x-2">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'} bg-white border border-gray-300 rounded-md`}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button 
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`px-3 py-2 text-sm font-medium ${currentPage === pageNum ? 'text-white bg-blue-600 border-transparent hover:bg-blue-700' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'} border rounded-md`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'} bg-white border border-gray-300 rounded-md`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

interface Alert {
  type: "danger" | "warning" | "success";
  message: string;
  icon: string;
}

interface EmployeeData {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  status: string;
  licenses: number;
  documents: number;
  inductions: number;
  alerts: Alert[];
  initials: string;
  color: string;
}

interface EmployeeCardProps {
  employee: EmployeeData;
  toggleDetails: () => void;
}

function EmployeeCard({ employee, toggleDetails }: EmployeeCardProps) {
  const getStatusClass = (status: string) => {
    switch(status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending Induction":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status: string) => {
    switch(status) {
      case "Active":
        return "bg-green-400";
      case "Pending Induction":
        return "bg-yellow-400";
      case "Inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getInitialsColor = (color: string) => {
    switch(color) {
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "purple":
        return "bg-purple-500";
      case "red":
        return "bg-red-500";
      case "orange":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAlertClass = (type: string) => {
    switch(type) {
      case "danger":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-orange-600 bg-orange-50";
      case "success":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Employee Header */}
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 ${getInitialsColor(employee.color)} rounded-full flex items-center justify-center text-white font-medium text-lg`}>
            {employee.initials}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{employee.firstName} {employee.lastName}</h3>
            <p className="text-sm text-gray-600">{employee.position}</p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(employee.status)}`}>
                <div className={`w-1.5 h-1.5 ${getStatusDot(employee.status)} rounded-full mr-1`}></div>
                {employee.status}
              </span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600" onClick={toggleDetails}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" id={`${employee.id}-chevron`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-xl font-medium text-gray-900">{employee.licenses}</p>
            <p className="text-xs text-gray-600">Licenses</p>
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900">{employee.documents}</p>
            <p className="text-xs text-gray-600">Documents</p>
          </div>
          <div>
            <p className="text-xl font-medium text-gray-900">{employee.inductions}</p>
            <p className="text-xs text-gray-600">Inductions</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2 mb-4">
          {employee.alerts.map((alert, index) => (
            <div key={index} className={`flex items-center ${getAlertClass(alert.type)} px-3 py-2 rounded-lg`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {alert.icon === "alert-triangle" && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                )}
                {alert.icon === "clock" && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
                {alert.icon === "check-circle" && (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>

        {/* Expandable Details - Hidden by default */}
        <div id={`${employee.id}-details`} className="hidden border-t pt-4">
          {/* Contact Information */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {employee.firstName.toLowerCase()}.{employee.lastName.toLowerCase()}@company.com
              </p>
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +1 (555) 123-4567
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Jane {employee.lastName} (Spouse)</p>
              <p>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +1 (555) 987-6543
              </p>
            </div>
          </div>

          {/* HR Information */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">HR Information</h4>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Employee ID:</strong> EMP00{employee.id}</p>
                  <p><strong>Start Date:</strong> January 15, 2022</p>
                  <p><strong>Department:</strong> {employee.department}</p>
                  <p><strong>BambooHR:</strong> Active Profile</p>
                  <p><strong>Annual Review:</strong> Due 01/15/2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4 border-t">
            <Link 
              href={`/employees/${employee.id}/edit`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
            <Link 
              href={`/employees/${employee.id}`}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              View Profile
            </Link>
          </div>
        </div>

        {/* Collapsed View Actions */}
        <div id={`${employee.id}-collapsed`} className="flex space-x-2">
          <Link 
            href={`/employees/${employee.id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors text-center"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
