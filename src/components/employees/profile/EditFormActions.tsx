import dynamic from 'next/dynamic';
import { EditFormActionsSkeleton } from './EditFormActionsSkeleton';

interface EditFormActionsProps {
  employeeId: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

const ClientEditFormActions = dynamic(
  () => import('./ClientEditFormActions'),
  { 
    loading: () => <EditFormActionsSkeleton />,
    ssr: false 
  }
);

export default function EditFormActions(props: EditFormActionsProps) {
  return <ClientEditFormActions {...props} />;
}
