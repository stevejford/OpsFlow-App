'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { toast } from 'sonner';
import LicenseStats from '@/components/licenses/LicenseStats';
import LicenseFilters from '@/components/licenses/LicenseFilters';
import LicenseAlerts, { AlertLicense } from '@/components/licenses/LicenseAlerts';
import LicenseTable, { License } from '@/components/licenses/LicenseTable';
import LicenseGrid from '@/components/licenses/LicenseGrid';
import LicenseDetails from '@/components/licenses/LicenseDetails';
import LicenseForm from '@/components/employees/LicenseForm';
import RenewLicenseModal from '@/components/licenses/RenewLicenseModal';
import AddLicenseModal from '@/components/licenses/AddLicenseModal';

interface Employee {
  id: string;
  name: string;
}

interface LicenseType {
  id: string;
  name: string;
}

interface LicenseTrackingClientProps {
  licenses: License[];
  employees: Employee[];
  licenseTypes: LicenseType[];
  stats: {
    totalLicenses: number;
    activeLicenses: number;
    expiringSoon: number;
    expired: number;
  };
  criticalLicenses: AlertLicense[];
}

export default function LicenseTrackingClient({
  licenses: initialLicenses,
  employees,
  licenseTypes,
  stats,
  criticalLicenses: initialCriticalLicenses
}: LicenseTrackingClientProps) {
  console.log('LicenseTrackingClient - Received licenses:', initialLicenses);
  console.log('LicenseTrackingClient - Received employees:', employees);
  console.log('LicenseTrackingClient - Received licenseTypes:', licenseTypes);

  // State
  const [licenses, setLicenses] = useState<License[]>(initialLicenses);
  const [criticalLicenses, setCriticalLicenses] = useState<AlertLicense[]>(initialCriticalLicenses);
  const [filteredLicenses, setFilteredLicenses] = useState<License[]>(initialLicenses);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...licenses];
    
    // Debug: Log unique status values in the licenses array
    const uniqueStatusesSet = new Set(licenses.map(license => license.status));
    const uniqueStatuses = Array.from(uniqueStatusesSet);
    console.log('Debug - Unique status values in licenses:', uniqueStatuses);
    console.log('Debug - Current status filter:', statusFilter);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(license => 
        license.employeeName.toLowerCase().includes(query) ||
        license.licenseType.toLowerCase().includes(query) ||
        license.licenseDescription.toLowerCase().includes(query)
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(license => license.licenseType === typeFilter);
    }
    
    if (statusFilter) {
      console.log('Debug - Applying status filter:', statusFilter);
      filtered = filtered.filter(license => {
        const match = license.status === statusFilter;
        console.log(`License ${license.id} status: ${license.status}, matches filter ${statusFilter}: ${match}`);
        return match;
      });
    }
    
    if (employeeFilter) {
      filtered = filtered.filter(license => license.employeeName === employeeFilter);
    }
    
    setFilteredLicenses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [licenses, searchQuery, typeFilter, statusFilter, employeeFilter]);
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLicenses = filteredLicenses.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterType = (type: string) => {
    setTypeFilter(type);
  };
  
  const handleFilterStatus = (status: string) => {
    setStatusFilter(status);
  };
  
  const handleFilterEmployee = (employee: string) => {
    setEmployeeFilter(employee);
  };
  
  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };
  
  const handleNotify = async (licenseId: string) => {
    try {
      // This would be an API call to notify the employee or manager
      // await fetch(`/api/licenses/${licenseId}/notify`, { method: 'POST' });
      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };
  
  const handleView = (licenseId: string) => {
    const license = licenses.find(l => l.id === licenseId);
    if (license) {
      setSelectedLicense(license);
      setIsDetailsModalOpen(true);
    } else {
      toast.error('License not found');
    }
  };
  
  const handleRenew = (licenseId: string) => {
    const license = licenses.find(l => l.id === licenseId);
    if (license) {
      setSelectedLicense(license);
      setIsRenewModalOpen(true);
    } else {
      toast.error('License not found');
    }
  };
  
  const handleEdit = (licenseId: string) => {
    const license = licenses.find(l => l.id === licenseId);
    if (license) {
      setSelectedLicense(license);
      setIsEditModalOpen(true);
    } else {
      toast.error('License not found');
    }
  };
  
  const handleEditSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call to update the license
      // const response = await fetch(`/api/licenses/${selectedLicense?.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const updatedLicense = await response.json();
      
      // For now, just update the local state
      const updatedLicenses = licenses.map(license => 
        license.id === selectedLicense?.id 
          ? { 
              ...license, 
              licenseType: data.name,
              licenseDescription: data.licenseNumber,
              issueDate: data.issueDate,
              expiryDate: data.expiryDate,
              status: data.status
            } 
          : license
      );
      
      setLicenses(updatedLicenses);
      setIsEditModalOpen(false);
      toast.success('License updated successfully');
    } catch (error) {
      console.error('Error updating license:', error);
      toast.error('Failed to update license');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLicenses(currentLicenses.map(license => license.id));
    } else {
      setSelectedLicenses([]);
    }
  };
  
  const handleSelectLicense = (licenseId: string, selected: boolean) => {
    if (selected) {
      setSelectedLicenses(prev => [...prev, licenseId]);
    } else {
      setSelectedLicenses(prev => prev.filter(id => id !== licenseId));
    }
  };
  
  const handleBulkAction = () => {
    // Handle bulk actions like bulk delete, bulk export, etc.
    toast.info(`Bulk action on ${selectedLicenses.length} licenses`);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleAddLicense = async (licenseData: any) => {
    try {
      // This would be an API call to add a new license
      // const response = await fetch('/api/licenses', {
      //   method: 'POST',
      //   body: JSON.stringify(licenseData),
      // });
      // const newLicense = await response.json();
      
      // For now, just mock the response
      const newLicense: License = {
        id: `new-${Date.now()}`,
        employeeName: employees.find(e => e.id === licenseData.employeeId)?.name || 'Unknown',
        employeeRole: 'Employee',
        employeeInitials: 'XX',
        employeeColor: 'blue',
        licenseType: licenseTypes.find(t => t.id === licenseData.licenseTypeId)?.name || 'Unknown',
        licenseDescription: licenseData.description,
        issueDate: licenseData.issueDate,
        expiryDate: licenseData.expiryDate,
        status: 'Active', // Explicitly typed as one of the allowed values
        daysUntilExpiry: 365, // Placeholder
        documentUrl: licenseData.document ? URL.createObjectURL(licenseData.document) : undefined
      };
      
      setLicenses(prev => [...prev, newLicense]);
      setIsAddModalOpen(false);
      toast.success('License added successfully');
    } catch (error) {
      console.error('Error adding license:', error);
      toast.error('Failed to add license');
    }
  };
  
  const handleRenewSubmit = async (licenseId: string, newExpiryDate: string, document: File | null) => {
    try {
      // This would be an API call to renew the license
      // const formData = new FormData();
      // formData.append('expiryDate', newExpiryDate);
      // if (document) {
      //   formData.append('document', document);
      // }
      // 
      // const response = await fetch(`/api/licenses/${licenseId}/renew`, {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      
      // For now, just update the license in the state
      setLicenses(prev => prev.map(license => {
        if (license.id === licenseId) {
          const newExpiryDateObj = new Date(newExpiryDate);
          const today = new Date();
          const diffTime = newExpiryDateObj.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determine the status based on days until expiry
          let newStatus: 'Active' | 'Expiring Soon' | 'Expired';
          if (diffDays < 0) {
            newStatus = 'Expired';
          } else if (diffDays <= 30) {
            newStatus = 'Expiring Soon';
          } else {
            newStatus = 'Active';
          }
          
          // Create a new license object with updated properties
          const updatedLicense: License = {
            ...license,
            expiryDate: newExpiryDate,
            status: newStatus,
            daysUntilExpiry: diffDays,
            documentUrl: document ? URL.createObjectURL(document) : license.documentUrl
          };
          
          return updatedLicense;
        }
        return license;
      }));
      
      // Update critical licenses list if needed
      // Find the updated license in the licenses array
      setTimeout(() => {
        const updatedLicense = licenses.find(l => l.id === licenseId);
        if (updatedLicense) {
          const isStillCritical = updatedLicense.status === 'Expired' || 
            (updatedLicense.status === 'Expiring Soon' && (updatedLicense.daysUntilExpiry || 0) <= 7);
            
          if (!isStillCritical) {
            setCriticalLicenses(prev => prev.filter(cl => cl.id !== licenseId));
          }
        }
      }, 0);
      
      setIsRenewModalOpen(false);
      toast.success('License renewed successfully');
    } catch (error) {
      console.error('Error renewing license:', error);
      toast.error('Failed to renew license');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">License Tracking</h1>
            <p className="mt-2 text-gray-600">Monitor and manage all employee licenses and certifications with automated expiry alerts.</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => toast.info('Bulk import functionality')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Icon name="fas fa-upload" className="mr-2" />Bulk Import
            </button>
            <button 
              onClick={() => toast.info('Export functionality')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Icon name="fas fa-download" className="mr-2" />Export
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="fas fa-plus" className="mr-2" />Add License
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <LicenseStats
        totalLicenses={stats.totalLicenses}
        activeLicenses={stats.activeLicenses}
        expiringSoon={stats.expiringSoon}
        expired={stats.expired}
      />

      {/* Filters and Search */}
      <LicenseFilters
        onSearch={handleSearch}
        onFilterType={handleFilterType}
        onFilterStatus={handleFilterStatus}
        onFilterEmployee={handleFilterEmployee}
        onViewChange={handleViewChange}
        currentView={currentView}
        employees={employees}
        licenseTypes={licenseTypes}
      />

      {/* Critical Alerts */}
      {criticalLicenses.length > 0 && (
        <LicenseAlerts
          criticalLicenses={criticalLicenses}
          onNotify={handleNotify}
        />
      )}

      {/* License List or Grid View */}
      {currentView === 'list' ? (
        <LicenseTable
          licenses={currentLicenses}
          onView={handleView}
          onRenew={handleRenew}
          onEdit={handleEdit}
          onSelectAll={handleSelectAll}
          onSelectLicense={handleSelectLicense}
          selectedLicenses={selectedLicenses}
          onBulkAction={handleBulkAction}
          currentPage={currentPage}
          totalLicenses={filteredLicenses.length}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      ) : (
        <div className="mb-8">
          <LicenseGrid
            licenses={currentLicenses}
            onView={handleView}
            onRenew={handleRenew}
            onEdit={handleEdit}
          />
          
          {/* Pagination for Grid View */}
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLicenses.length)} of {filteredLicenses.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className={`px-3 py-1 border border-gray-300 rounded text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(Math.ceil(filteredLicenses.length / itemsPerPage), 5) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button 
                    key={pageNumber}
                    className={`px-3 py-1 ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'} rounded text-sm`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button 
                className={`px-3 py-1 border border-gray-300 rounded text-sm ${currentPage === Math.ceil(filteredLicenses.length / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredLicenses.length / itemsPerPage)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add License Modal */}
      <AddLicenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLicense}
        employees={employees}
        licenseTypes={licenseTypes}
      />
      
      {/* License Details Modal */}
      {selectedLicense && (
        <LicenseDetails
          license={selectedLicense}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={handleEdit}
          onRenew={handleRenew}
        />
      )}
      
      {/* Renew License Modal */}
      {selectedLicense && (
        <RenewLicenseModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          license={selectedLicense}
          onRenew={handleRenewSubmit}
        />
      )}
      
      {/* Edit License Modal */}
      {selectedLicense && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isEditModalOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Edit License</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="fas fa-times" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Using part of the ID as employee ID */}
              <LicenseForm
                employeeId={selectedLicense.id.split('-')[0]}
                licenseData={{
                  name: selectedLicense.licenseType,
                  licenseNumber: selectedLicense.licenseDescription || '',
                  issueDate: selectedLicense.issueDate,
                  expiryDate: selectedLicense.expiryDate,
                  issuingAuthority: '',
                  status: selectedLicense.status,
                  document: selectedLicense.documentUrl || ''
                }}
                onSubmit={handleEditSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
