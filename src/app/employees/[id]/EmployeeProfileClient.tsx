'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  EmployeeHeader,
  AlertSection,
  ContactInformation,
  LicensesSection,
  InductionsSection,
  HRInformation,
  DocumentsSection,
  BreadcrumbNav,
  ProfileActions
} from '@/components/employees/profile';

// Import types from our custom type definitions
import { 
  EmployeeBasicInfo, 
  License, 
  Induction, 
  Document, 
  EmergencyContact 
} from '@/types/employee';

interface EmployeeProfileClientProps {
  data: {
    employee: EmployeeBasicInfo;
    licenses: License[];
    inductions: Induction[];
    documents: Document[];
    emergencyContact?: EmergencyContact;
  };
}

export default function EmployeeProfileClient({ data }: EmployeeProfileClientProps) {
  const router = useRouter();
  
  // Destructure data with defaults
  const { 
    employee, 
    licenses = [], 
    inductions = [], 
    documents = [], 
    emergencyContact = {
      name: 'Not specified',
      relationship: 'N/A',
      phone: 'N/A',
      email: 'N/A'
    }
  } = data;
  
  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: Employee data not found</div>
      </div>
    );
  }
  
  // Prepare contact info for the ContactInformation component
  const contactInfo = {
    email: employee.email || '',
    phone: employee.phone || '',
    mobilePhone: employee.mobilePhone || '',
    address: employee.address || '',
    city: employee.city || '',
    state: employee.state || '',
    zipCode: employee.zipCode || ''
  };
  
  // Prepare HR info for the HRInformation component
  const hrInfo = {
    employeeId: employee.employeeId || employee.id,
    startDate: typeof employee.startDate === 'string' 
      ? employee.startDate 
      : typeof employee.hire_date === 'string' 
        ? employee.hire_date 
        : '',
    department: employee.department || 'Not specified',
    position: employee.position || 'Not specified',
    manager: employee.manager || 'Not specified',
    annualReviewDate: typeof employee.annualReviewDate === 'string' 
      ? employee.annualReviewDate 
      : ''
  };

  useEffect(() => {
    // Initialize feather icons after component mounts
    if (typeof window !== 'undefined') {
      import('feather-icons').then(feather => {
        feather.default.replace();
      });
    }
  }, []);

  // Calculate counts for the header
  const licenseCount = licenses.length;
  const documentCount = documents.length;
  const inductionCount = inductions.length;

  // Prepare alerts for the AlertSection component
  const alerts = useMemo(() => {
    const alertItems: Array<{
      type: 'danger' | 'warning' | 'info' | 'success';
      title: string;
      message: string;
      icon: 'alert-triangle' | 'clock' | 'check' | 'info';
    }> = [];

    // Add alerts for expiring licenses
    const expiringLicenses = licenses.filter(license => 
      license.status === 'Expiring Soon' || license.status === 'Expired'
    );
    
    expiringLicenses.forEach(license => {
      alertItems.push({
        type: (license.status === 'Expired' ? 'danger' : 'warning') as 'danger' | 'warning',
        title: `License ${license.status}`,
        message: `${license.name} ${license.status.toLowerCase()}`,
        icon: 'alert-triangle'
      });
    });

    // Add alerts for expiring inductions
    const expiringInductions = inductions.filter(induction => 
      induction.status === 'Expiring Soon' || induction.status === 'Expired'
    );
    
    expiringInductions.forEach(induction => {
      alertItems.push({
        type: 'warning',
        title: 'Induction Expiring Soon',
        message: `${induction.name} expires soon`,
        icon: 'clock'
      });
    });

    return alertItems;
  }, [licenses, inductions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav 
        employeeId={employee.employeeId || employee.id}
        employeeName={`${employee.firstName} ${employee.lastName}`}
      />
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
          <ProfileActions employeeId={employee.employeeId || employee.id} />
        </div>
        
        <EmployeeHeader 
          employee={{
            // Only include the exact fields that EmployeeHeader expects
            id: employee.id,
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            position: employee.position || '',
            department: employee.department || '',
            status: employee.status || 'Active',
            employeeId: employee.employeeId || employee.id || '',
            startDate: typeof employee.startDate === 'string' 
              ? employee.startDate 
              : typeof employee.hire_date === 'string' 
                ? employee.hire_date 
                : new Date().toISOString(),
            initials: employee.initials || 
              `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase() || 'NA',
            // Optional avatar field
            avatar: employee.avatar
          }}
          licenseCount={licenseCount}
          documentCount={documentCount}
          inductionCount={inductionCount}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {alerts.length > 0 && <AlertSection alerts={alerts} />}
            
            <LicensesSection 
              licenses={licenses.map(license => {
                // Handle date conversions safely
                let formattedExpiryDate = 'N/A';
                let formattedIssueDate = 'N/A';
                
                // Handle expiryDate
                if (typeof license.expiryDate === 'string') {
                  formattedExpiryDate = license.expiryDate;
                } else if (license.expiryDate && typeof license.expiryDate === 'object') {
                  // Use type assertion to handle Date object
                  formattedExpiryDate = (license.expiryDate as Date).toLocaleDateString();
                } else if (license.expiry_date) {
                  formattedExpiryDate = typeof license.expiry_date === 'string' 
                    ? license.expiry_date 
                    : license.expiry_date && typeof license.expiry_date === 'object' 
                      ? (license.expiry_date as Date).toLocaleDateString() 
                      : 'N/A';
                }
                
                // Handle issueDate
                if (typeof license.issueDate === 'string') {
                  formattedIssueDate = license.issueDate;
                } else if (license.issueDate && typeof license.issueDate === 'object') {
                  // Use type assertion to handle Date object
                  formattedIssueDate = (license.issueDate as Date).toLocaleDateString();
                } else if (license.issue_date) {
                  formattedIssueDate = typeof license.issue_date === 'string' 
                    ? license.issue_date 
                    : license.issue_date && typeof license.issue_date === 'object' 
                      ? (license.issue_date as Date).toLocaleDateString() 
                      : 'N/A';
                }
                
                return {
                  id: license.id,
                  name: license.name || '',
                  status: license.status || '',
                  licenseNumber: license.licenseNumber || license.license_number || '',
                  expiryDate: formattedExpiryDate,
                  issueDate: formattedIssueDate,
                  issuingAuthority: license.issuingAuthority || license.issuing_authority || '',
                  document: license.document || ''
                };
              })} 
              employeeId={employee.employeeId || employee.id}
            />
            
            <InductionsSection 
              inductions={inductions} 
              employeeId={employee.id}
            />
            
            <DocumentsSection 
              documents={documents} 
              employeeId={employee.id}
            />
          </div>
          
          <div className="space-y-6">
            <ContactInformation 
              employee={employee} 
              emergencyContact={emergencyContact}
            />
            
            <HRInformation 
              employee={employee}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
