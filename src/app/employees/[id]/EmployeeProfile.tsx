import { notFound } from 'next/navigation';
import { getEmployeeData } from '@/components/employees/EmployeeProfileServer';
import dynamic from 'next/dynamic';
import { EmployeeBasicInfo } from '@/types/employee';

// Create a client component wrapper to pass the data
export default async function EmployeeProfile({ id }: { id: string }) {
  try {
    let transformedData;
    
    try {
      // Try to fetch the real data from the server
      const rawData = await getEmployeeData(id);
      
      // Transform the data to match the expected types
      const transformEmployeeData = (employee: any): EmployeeBasicInfo => {
        // Ensure we have required fields with defaults
        const defaultEmployee: Partial<EmployeeBasicInfo> = {
          mobilePhone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          manager: 'Not specified',
          annualReviewDate: new Date().toISOString().split('T')[0],
          initials: `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
        };

        return {
          ...defaultEmployee,
          ...employee,
          // Map any field name differences
          startDate: employee.hire_date || employee.startDate,
          employeeId: employee.employee_id || employee.id,
          // Ensure required fields are not undefined
          phone: employee.phone || '',
          position: employee.position || 'Not specified',
          department: employee.department || 'Not specified',
          status: ['Active', 'Inactive', 'On Leave', 'Terminated', 'Pending'].includes(employee.status)
            ? employee.status
            : 'Active'
        } as EmployeeBasicInfo;
      };

      // Helper functions to convert data types
      const convertLicense = (license: any) => ({
        id: license.id || '',
        name: license.name || 'Unnamed License',
        status: license.status || 'Active',
        licenseNumber: license.license_number || 'N/A',
        issueDate: license.issue_date || new Date().toISOString(),
        expiryDate: license.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        issuingAuthority: license.issuing_authority || 'N/A',
        document: license.document || '',
        ...license
      });

      const convertInduction = (induction: any) => ({
        id: induction.id || '',
        name: induction.name || 'Unnamed Induction',
        status: induction.status || 'Completed',
        company: induction.provider || 'N/A',
        platform: induction.platform || 'N/A',
        username: induction.username || 'N/A',
        password: induction.password || 'N/A',
        expiryDate: induction.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        ...induction
      });
      const convertDocument = (doc: any) => ({
        id: doc.id || '',
        name: doc.name || 'Unnamed Document',
        size: doc.size || '0 KB',
        uploadDate: doc.upload_date || new Date().toISOString(),
        ...doc
      });

      transformedData = {
        ...rawData,
        employee: transformEmployeeData(rawData.employee),
        // Convert all arrays to ensure they match our types
        licenses: Array.isArray(rawData.licenses) 
          ? rawData.licenses.map(convertLicense) 
          : [],
        inductions: Array.isArray(rawData.inductions) 
          ? rawData.inductions.map(convertInduction) 
          : [],
        documents: Array.isArray(rawData.documents) 
          ? rawData.documents.map(convertDocument) 
          : []
      };
    } catch (error) {
      console.error('Error fetching employee data:', error);
      // Return notFound() instead of using mock data
      notFound();
    }

    // Import the client component dynamically
    const EmployeeProfileClient = dynamic<{ data: typeof transformedData }>(
      () => import('@/app/employees/[id]/EmployeeProfileClient'),
      { 
        ssr: false,
        loading: () => (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )
      }
    );

    return <EmployeeProfileClient data={transformedData} />;
  } catch (error) {
    console.error('Error in EmployeeProfile:', error);
    // Return a user-friendly error page instead of notFound()
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Employee</h1>
          <p className="text-gray-600 mb-6">We couldn't load the employee profile. Please try again later.</p>
          <a href="/employees" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Return to Employees List
          </a>
        </div>
      </div>
    );
  }
}
