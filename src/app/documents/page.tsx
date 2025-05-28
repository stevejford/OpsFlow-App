import { Suspense } from 'react';
import DocumentsClient from './DocumentsClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Document Management - OpsFlow',
  description: 'Manage and organize your documents',
};

export default function DocumentsPage() {
  // This is a server component that loads the client component
  // In a real implementation, you would fetch initial data here
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DocumentsClient />
    </Suspense>
  );
}
