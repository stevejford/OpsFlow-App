'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { toast } from 'sonner';
import './induction-tracking.css';

import InductionStats from '@/components/inductions/InductionStats';
import InductionFilters from '@/components/inductions/InductionFilters';
import InductionAlerts from '@/components/inductions/InductionAlerts';
import InductionTable from '@/components/inductions/InductionTable';
import InductionGrid from '@/components/inductions/InductionGrid';
import InductionDetails from '@/components/inductions/InductionDetails';
import AddInductionModal from '@/components/inductions/AddInductionModal';
import RescheduleInductionModal from '@/components/inductions/RescheduleInductionModal';

import { Induction, AlertInduction, InductionStatus } from '@/lib/data/inductions';
import { Employee } from '@/lib/data/employees';
import { InductionType } from '@/lib/data/inductionTypes';

interface InductionTrackingClientProps {
  inductions: Induction[];
  employees: Employee[];
  inductionTypes: InductionType[];
  stats: {
    totalInductions: number;
    completedInductions: number;
    inProgressInductions: number;
    scheduledInductions: number;
    overdueInductions: number;
  };
  criticalInductions: AlertInduction[];
}

export default function InductionTrackingClient({
  inductions: initialInductions,
  employees,
  inductionTypes,
  stats,
  criticalInductions: initialCriticalInductions
}: InductionTrackingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [inductions, setInductions] = useState<Induction[]>(initialInductions);
  const [filteredInductions, setFilteredInductions] = useState<Induction[]>(initialInductions);
  const [criticalInductions, setCriticalInductions] = useState<AlertInduction[]>(initialCriticalInductions);
  const [selectedInductions, setSelectedInductions] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  // Check URL params for modal state
  const isAddModalOpen = searchParams.get('add') === 'true';
  const isDetailsModalOpen = Boolean(searchParams.get('view'));
  
  // Get the selected induction based on URL params
  const [selectedInduction, setSelectedInduction] = useState<Induction | null>(null);
  
  // Update selected induction based on URL parameters
  useEffect(() => {
    const viewId = searchParams.get('view');
    const rescheduleId = searchParams.get('reschedule');
    const targetId = viewId || rescheduleId;
    
    if (targetId) {
      const induction = inductions.find(ind => ind.id === targetId) || null;
      setSelectedInduction(induction);
    } else {
      setSelectedInduction(null);
    }
  }, [searchParams, inductions]);
  
  // Calculate total pages
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredInductions.length / itemsPerPage);
  
  // Current page items
  const currentItems = filteredInductions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Apply filters
  useEffect(() => {
    let result = [...inductions];
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(induction => 
        induction.employeeName.toLowerCase().includes(query) ||
        induction.type.toLowerCase().includes(query) ||
        induction.description.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (typeFilter) {
      result = result.filter(induction => induction.type === typeFilter);
    }
    
    // Status filter
    if (statusFilter) {
      result = result.filter(induction => induction.status === statusFilter);
    }
    
    // Department filter (based on employee position)
    if (departmentFilter) {
      result = result.filter(induction => 
        induction.employeePosition.includes(departmentFilter)
      );
    }
    
    setFilteredInductions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [inductions, searchQuery, typeFilter, statusFilter, departmentFilter]);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterByType = (type: string) => {
    setTypeFilter(type);
  };

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
  };

  const handleFilterByDepartment = (department: string) => {
    setDepartmentFilter(department);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedInductions(currentItems.map(induction => induction.id));
    } else {
      setSelectedInductions([]);
    }
  };

  const handleSelectInduction = (inductionId: string, selected: boolean) => {
    if (selected) {
      setSelectedInductions(prev => [...prev, inductionId]);
    } else {
      setSelectedInductions(prev => prev.filter(id => id !== inductionId));
    }
  };

  const handleBulkAction = () => {
    toast.info(`Bulk action for ${selectedInductions.length} inductions`);
    // Implement bulk action logic here
  };

  const handleViewInduction = (inductionId: string) => {
    // Navigate to the same page with view parameter
    router.push(`/induction-tracking?view=${inductionId}`);
  };

  const handleRemindInduction = async (inductionId: string) => {
    try {
      const response = await fetch(`/api/inductions/${inductionId}/remind`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success(`Reminder sent for induction #${inductionId}`);
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('An error occurred while sending the reminder');
    }
  };

  const handleRescheduleInduction = (inductionId: string) => {
    // Navigate to the same page with reschedule parameter
    router.push(`/induction-tracking?reschedule=${inductionId}`);
  };

  // This function is no longer needed as RescheduleInductionModal now handles its own submission
  // We keep it as a reference for the API structure
  const handleRescheduleSubmit = async (inductionId: string, newDueDate: string) => {
    try {
      const response = await fetch(`/api/inductions/${inductionId}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dueDate: newDueDate }),
      });
      
      if (response.ok) {
        toast.success('Induction rescheduled successfully');
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to reschedule induction');
      }
    } catch (error) {
      console.error('Error rescheduling induction:', error);
      toast.error('An error occurred while rescheduling the induction');
    }
  };

  const handleContinueInduction = async (inductionId: string) => {
    try {
      const response = await fetch(`/api/inductions/${inductionId}/continue`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success(`Continuing induction #${inductionId}`);
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to continue induction');
      }
    } catch (error) {
      console.error('Error continuing induction:', error);
      toast.error('An error occurred while continuing the induction');
    }
  };

  const handleEditInduction = (inductionId: string) => {
    // Navigate to edit page
    router.push(`/induction-tracking/inductions/${inductionId}/edit`);
  };

  const handleStartInduction = async (inductionId: string) => {
    try {
      const response = await fetch(`/api/inductions/${inductionId}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success(`Induction started successfully`);
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to start induction');
      }
    } catch (error) {
      console.error('Error starting induction:', error);
      toast.error('An error occurred while starting the induction');
    }
  };

  const handleCertificateInduction = (inductionId: string) => {
    // Navigate to certificate page
    router.push(`/induction-tracking/inductions/${inductionId}/certificate`);
  };

  const handleArchiveInduction = async (inductionId: string) => {
    try {
      const response = await fetch(`/api/inductions/${inductionId}/archive`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success(`Induction archived successfully`);
        router.refresh(); // Refresh the page data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to archive induction');
      }
    } catch (error) {
      console.error('Error archiving induction:', error);
      toast.error('An error occurred while archiving the induction');
    }
  };

  const handleDownloadCertificate = (inductionId: string) => {
    toast.success(`Certificate downloaded for induction #${inductionId}`);
    // Implement download logic here
  };

  const handleAddInduction = (data: {
    employeeId: string;
    type: string;
    description: string;
    scheduledDate: string;
    dueDate: string;
  }) => {
    // Find employee details
    const employee = employees.find(emp => emp.id === data.employeeId);
    
    if (!employee) {
      toast.error('Employee not found');
      return;
    }
    
    // Create new induction
    const newInduction: Induction = {
      id: `new-${Date.now()}`, // In a real app, this would be generated by the server
      employeeId: data.employeeId,
      employeeName: employee.name,
      employeePosition: employee.position,
      type: data.type,
      description: data.description,
      scheduledDate: data.scheduledDate,
      dueDate: data.dueDate,
      progress: 0,
      status: 'scheduled' as InductionStatus
    };
    
    // Add to inductions
    setInductions(prev => [newInduction, ...prev]);
    
    toast.success('Induction scheduled successfully');
    router.push('/induction-tracking'); // Close modal using URL-based navigation
  };

  const handleBulkAssign = () => {
    router.push('/induction-tracking?add=true');
  };

  const handleExportReport = () => {
    toast.success('Induction report exported successfully');
    // Implement export logic here
  };

  // Handler for opening the add induction modal
  const handleAddInductionClick = () => {
    router.push('/induction-tracking?add=true');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Induction Tracking</h1>
            <p className="mt-2 text-gray-600">
              Monitor employee onboarding progress and ensure all required training modules are completed on schedule.
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleBulkAssign}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Icon name="fas fa-upload" className="mr-2" />
              Bulk Assign
            </button>
            <button 
              onClick={handleExportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Icon name="fas fa-download" className="mr-2" />
              Export Report
            </button>
            <button 
              onClick={handleAddInductionClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="fas fa-plus" className="mr-2" />
              Schedule Induction
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <InductionStats stats={stats} />

      {/* Filters and Search */}
      <InductionFilters 
        inductionTypes={inductionTypes}
        onSearch={handleSearch}
        onFilterByType={handleFilterByType}
        onFilterByStatus={handleFilterByStatus}
        onFilterByDepartment={handleFilterByDepartment}
        onViewChange={handleViewChange}
        currentView={currentView}
      />

      {/* Critical Alerts */}
      <InductionAlerts 
        criticalInductions={criticalInductions}
        onRemind={handleRemindInduction}
        onReschedule={handleRescheduleInduction}
      />

      {/* Induction List/Grid */}
      {inductions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="fas fa-clipboard-list" className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Induction Data Available</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              There are currently no inductions in the database. Add your first induction to get started.
            </p>
            <button 
              onClick={handleAddInductionClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Icon name="fas fa-plus" className="mr-2" />
              Schedule Induction
            </button>
          </div>
        </div>
      ) : currentView === 'list' ? (
        <InductionTable 
          inductions={currentItems}
          selectedInductions={selectedInductions}
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/induction-tracking"
        />
      ) : (
        <InductionGrid 
          inductions={currentItems}
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/induction-tracking"
        />
      )}

      {/* Modals - Using URL-based state management */}
      {isAddModalOpen && (
        <AddInductionModal 
          employees={employees}
          inductionTypes={inductionTypes}
          returnUrl="/induction-tracking"
        />
      )}

      {selectedInduction && (
        <RescheduleInductionModal 
          induction={selectedInduction}
          returnUrl="/induction-tracking"
        />
      )}

      {/* InductionDetails - Using URL-based state management */}
      {selectedInduction && (
        <InductionDetails 
          induction={selectedInduction}
          onClose={() => router.push('/induction-tracking')}
          onDownloadCertificate={handleDownloadCertificate}
          returnUrl="/induction-tracking"
        />
      )}
    </div>
  );
}
