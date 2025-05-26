import { notFound } from 'next/navigation';
import { getEmployeeData } from '@/components/employees/EmployeeProfileServer';
import EmployeeProfile from './EmployeeProfile';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Try to fetch employee data to verify it exists
    try {
      await getEmployeeData(id);
    } catch (dataError) {
      console.error('Error fetching employee data:', dataError);
      // If we're in development, log more details
      if (process.env.NODE_ENV === 'development') {
        console.error('Employee data fetch error details:', dataError);
      }
      // Re-throw the error to be caught by the outer try-catch
      throw dataError;
    }
    
    return (
      <div className="min-h-screen">
        <EmployeeProfile id={id} />
      </div>
    );
  } catch (error) {
    console.error('Error in EmployeeDetailPage:', error);
    // Show a user-friendly error page instead of 404
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Employee</h1>
          <p className="text-gray-600 mb-6">We couldn't load the employee profile. The employee may not exist or there might be a connection issue.</p>
          <a href="/employees" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
            Return to Employees List
          </a>
        </div>
      </div>
    );
  }
}
