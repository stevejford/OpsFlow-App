'use client';

import React, { useState, useEffect } from 'react';
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
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInduction, setSelectedInduction] = useState<Induction | null>(null);
  
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
    const induction = inductions.find(induction => induction.id === inductionId);
    if (induction) {
      setSelectedInduction(induction);
      setIsDetailsModalOpen(true);
    }
  };

  const handleRemindInduction = (inductionId: string) => {
    toast.success(`Reminder sent for induction #${inductionId}`);
    // Implement reminder logic here
  };

  const handleRescheduleInduction = (inductionId: string) => {
    const induction = inductions.find(induction => induction.id === inductionId);
    if (induction) {
      setSelectedInduction(induction);
      setIsRescheduleModalOpen(true);
    }
  };

  const handleRescheduleSubmit = (inductionId: string, newDueDate: string) => {
    // Update induction due date
    const updatedInductions = inductions.map(induction => {
      if (induction.id === inductionId) {
        return {
          ...induction, 
          dueDate: newDueDate,
          status: 'in-progress' as InductionStatus // Change status from overdue to in-progress
        };
      }
      return induction;
    });
    
    setInductions(updatedInductions);
    
    // Remove from critical inductions if it was there
    const updatedCriticalInductions = criticalInductions.filter(
      induction => induction.id !== inductionId
    );
    
    setCriticalInductions(updatedCriticalInductions);
    
    toast.success(`Induction rescheduled successfully`);
    setIsRescheduleModalOpen(false);
  };

  const handleContinueInduction = (inductionId: string) => {
    toast.info(`Continuing induction #${inductionId}`);
    // Implement continue logic here
  };

  const handleEditInduction = (inductionId: string) => {
    toast.info(`Editing induction #${inductionId}`);
    // Implement edit logic here
  };

  const handleStartInduction = (inductionId: string) => {
    // Update induction status to in-progress
    const updatedInductions = inductions.map(induction => {
      if (induction.id === inductionId) {
        return {
          ...induction,
          status: 'in-progress' as InductionStatus,
          progress: 10 // Start with some progress
        };
      }
      return induction;
    });
    
    setInductions(updatedInductions);
    toast.success(`Induction started successfully`);
  };

  const handleCertificateInduction = (inductionId: string) => {
    toast.info(`Viewing certificate for induction #${inductionId}`);
    // Implement certificate view logic here
  };

  const handleArchiveInduction = (inductionId: string) => {
    toast.info(`Archiving induction #${inductionId}`);
    // Implement archive logic here
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
    setIsAddModalOpen(false);
  };

  const handleBulkAssign = () => {
    setIsAddModalOpen(true);
  };

  const handleExportReport = () => {
    toast.success('Induction report exported successfully');
    // Implement export logic here
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
              onClick={() => setIsAddModalOpen(true)}
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
              onClick={() => setIsAddModalOpen(true)}
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
          onView={handleViewInduction}
          onRemind={handleRemindInduction}
          onContinue={handleContinueInduction}
          onEdit={handleEditInduction}
          onStart={handleStartInduction}
          onCertificate={handleCertificateInduction}
          onArchive={handleArchiveInduction}
          onSelectAll={handleSelectAll}
          onSelectInduction={handleSelectInduction}
          selectedInductions={selectedInductions}
          onBulkAction={handleBulkAction}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      ) : (
        <InductionGrid 
          inductions={currentItems}
          onView={handleViewInduction}
          onRemind={handleRemindInduction}
          onContinue={handleContinueInduction}
          onEdit={handleEditInduction}
          onStart={handleStartInduction}
          onCertificate={handleCertificateInduction}
          onArchive={handleArchiveInduction}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modals */}
      <AddInductionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        employees={employees}
        inductionTypes={inductionTypes}
        onSubmit={handleAddInduction}
      />

      <RescheduleInductionModal 
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        induction={selectedInduction}
        onSubmit={handleRescheduleSubmit}
      />

      <InductionDetails 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        induction={selectedInduction}
        onDownloadCertificate={handleDownloadCertificate}
      />
    </div>
  );
}
