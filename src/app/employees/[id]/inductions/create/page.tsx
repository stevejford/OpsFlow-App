import { Metadata } from 'next';
import InductionFormWrapper from './InductionFormWrapper';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Induction - OpsFlow',
  description: 'Create a new induction record for an employee',
};

export default function InductionCreatePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href={`/employees/${params.id}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Employee Profile
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Create New Induction</h1>
      
      <InductionFormWrapper employeeId={params.id} />
    </div>
  );
}
