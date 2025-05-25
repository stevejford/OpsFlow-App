"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import LicenseFormWrapper from "../../../../../components/employees/LicenseFormWrapper";

export default function CreateLicensePage() {
  const params = useParams();
  const employeeId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Link
            href={`/employees/${employeeId}`}
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            <i data-feather="arrow-left" className="h-4 w-4"></i>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New License</h1>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <LicenseFormWrapper 
            employeeId={employeeId} 
          />
        </div>
      </div>
    </div>
  );
}
