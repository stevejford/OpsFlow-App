import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LicenseDetailPage({ params }: PageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  const { id } = params;
  
  // This would be replaced with actual data fetching from the database
  // For now, we'll use mock data based on the ID
  const license = {
    id,
    name: "Driver's License",
    licenseNumber: "DL12345",
    issuedBy: "Department of Motor Vehicles",
    issuedDate: "2020-01-15",
    expiryDate: "2025-01-15",
    status: "Active",
    notes: "Commercial driver's license with endorsements for passenger transport.",
    employeeId: "1",
    employeeName: "John Doe",
  };
  
  // Mock documents for this license
  const documents = [
    { id: "doc1", name: "License Scan.pdf", fileType: "application/pdf", fileSize: 1024 * 1024 * 2, uploadDate: "2020-01-16" },
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">License Details</h1>
        <div className="flex space-x-4">
          <Link
            href={`/licenses/${id}/edit`}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit
          </Link>
          <Link
            href="/licenses"
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {license.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">License #{license.licenseNumber}</p>
        </div>
        
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">License Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${license.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      license.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {license.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Issued By</dt>
                <dd className="mt-1 text-sm text-gray-900">{license.issuedBy}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Issued Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(license.issuedDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(license.expiryDate).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Employee</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link href={`/employees/${license.employeeId}`} className="text-blue-600 hover:text-blue-800">
                    {license.employeeName}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
          
          {license.notes && (
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-900">{license.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Documents */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
          <button
            className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Upload Document
          </button>
        </div>
        
        <div className="px-6 py-5">
          {documents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {documents.map((document) => (
                <li key={document.id} className="py-4 flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{document.name}</p>
                    <p className="text-sm text-gray-500">
                      {document.fileType.split('/')[1].toUpperCase()} - {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-4">
                      Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                    </span>
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Download
                    </button>
                    <button
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No documents uploaded for this license.</p>
          )}
        </div>
      </div>
      
      {/* Expiry Alert Settings */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Expiry Alerts</h2>
        </div>
        
        <div className="px-6 py-5">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="alert-30"
                name="alert-30"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="alert-30" className="ml-3 text-sm text-gray-700">
                30 days before expiry
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="alert-7"
                name="alert-7"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="alert-7" className="ml-3 text-sm text-gray-700">
                7 days before expiry
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="alert-1"
                name="alert-1"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="alert-1" className="ml-3 text-sm text-gray-700">
                1 day before expiry
              </label>
            </div>
            <div className="mt-4">
              <button
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Alert Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
