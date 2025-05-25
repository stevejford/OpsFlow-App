import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CredentialsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  // This would be replaced with actual data fetching from the database
  const credentials = [
    { 
      id: "1", 
      name: "GitHub", 
      username: "johndoe", 
      employeeName: "John Doe", 
      lastUpdated: "2023-01-15"
    },
    { 
      id: "2", 
      name: "AWS Console", 
      username: "jane.smith", 
      employeeName: "Jane Smith", 
      lastUpdated: "2023-02-10"
    },
    { 
      id: "3", 
      name: "Salesforce", 
      username: "bob.johnson", 
      employeeName: "Bob Johnson", 
      lastUpdated: "2023-03-22"
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Credentials Vault</h1>
        <Link 
          href="/credentials/create" 
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Credential
        </Link>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or username"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="employee" className="block text-sm font-medium text-gray-700">Employee</label>
              <select
                id="employee"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
                <option value="3">Bob Johnson</option>
              </select>
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {credentials.map((credential) => (
              <tr key={credential.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{credential.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{credential.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{credential.employeeName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{new Date(credential.lastUpdated).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/credentials/${credential.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    View
                  </Link>
                  <Link href={`/credentials/${credential.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Security Information</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <strong>Encryption:</strong> All credentials stored in the vault are encrypted using AES-256 encryption.
          </p>
          <p>
            <strong>Access Control:</strong> Only authorized users can view and manage credentials.
          </p>
          <p>
            <strong>Audit Trail:</strong> All access to credentials is logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
