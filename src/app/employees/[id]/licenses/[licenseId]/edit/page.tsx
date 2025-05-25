"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import LicenseFormWrapper from "../../../../../../components/employees/LicenseFormWrapper";

export default function EditLicensePage() {
  const params = useParams();
  const employeeId = params.id as string;
  const licenseId = params.licenseId as string;
  const [licenseData, setLicenseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenseData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/employees/${employeeId}/licenses/${licenseId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch license data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match our component's expected format
        let formattedLicense = {
          id: data.id,
          name: data.name,
          licenseNumber: data.license_number || '',
          issueDate: data.issue_date ? new Date(data.issue_date).toISOString().split('T')[0] : '',
          expiryDate: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',
          status: data.status || 'Current',
          document: '',
          issuingAuthority: ''
        };
        
        // Try to extract additional data from notes field
        if (data.notes) {
          try {
            const additionalData = JSON.parse(data.notes);
            formattedLicense.issuingAuthority = additionalData.issuing_authority || '';
            formattedLicense.document = additionalData.document_url || '';
          } catch (e) {
            console.warn('Could not parse license notes:', e);
          }
        }
        
        setLicenseData(formattedLicense);
      } catch (error) {
        console.error('Error fetching license:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLicenseData();
  }, [employeeId, licenseId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            href={`/employees/${employeeId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Employee Profile
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Edit License</h1>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 p-4 border border-red-200 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : licenseData ? (
            <LicenseFormWrapper 
              employeeId={employeeId}
              licenseData={licenseData}
            />
          ) : (
            <div className="text-gray-600 p-4 border border-gray-200 bg-gray-50 rounded-lg">
              License not found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
