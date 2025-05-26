// Mock data for inductions
import { format, addDays, subDays } from 'date-fns';

export type InductionStatus = 'completed' | 'in-progress' | 'scheduled' | 'overdue';

export interface Induction {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  type: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  completedDate?: string;
  completed_date?: string; // For database compatibility
  progress: number;
  status: InductionStatus;
  documentUrl?: string;
  document_url?: string; // For database compatibility
  notes?: string; // For storing additional information
  portal?: string; // For storing portal URL
  provider?: string; // For storing provider information
  position?: string; // For employee position (alternative field)
  name?: string; // Alternative field for type
  first_name?: string; // For database compatibility
  last_name?: string; // For database compatibility
  created_at?: string; // For database compatibility
  expiry_date?: string; // For database compatibility
}

export interface AlertInduction {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  dueDate: string;
  daysOverdue: number;
}

// Mock data function
export async function getInductions(): Promise<Induction[]> {
  const today = new Date();
  
  return [
    {
      id: '1',
      employeeId: '100',
      employeeName: 'Stephen Ford',
      first_name: 'Stephen',
      last_name: 'Ford',
      employeePosition: 'Operations Manager',
      type: 'Subject test',
      description: 'Test induction subject',
      scheduledDate: format(today, 'yyyy-MM-dd'),
      dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
      completedDate: format(today, 'yyyy-MM-dd'),
      progress: 50,
      status: 'in-progress',
      notes: 'Notes test',
      portal: 'https://rapid.com',
    },
    {
      id: '2',
      employeeId: '101',
      employeeName: 'Emma Davis',
      employeePosition: 'New Hire - Operations',
      type: 'Safety Induction',
      description: 'Workplace Safety & Protocols',
      scheduledDate: format(subDays(today, 7), 'yyyy-MM-dd'),
      dueDate: format(subDays(today, 5), 'yyyy-MM-dd'),
      progress: 25,
      status: 'overdue',
    },
    {
      id: '3',
      employeeId: '102',
      employeeName: 'Mike Rodriguez',
      employeePosition: 'Installation Technician',
      type: 'Technical Training',
      description: 'Advanced Equipment Handling',
      scheduledDate: format(subDays(today, 5), 'yyyy-MM-dd'),
      dueDate: format(addDays(today, 7), 'yyyy-MM-dd'),
      progress: 75,
      status: 'in-progress',
    },
    {
      id: '4',
      employeeId: '103',
      employeeName: 'Jessica Lee',
      employeePosition: 'Customer Service Rep',
      type: 'Company Orientation',
      description: 'Company Culture & Policies',
      scheduledDate: format(subDays(today, 14), 'yyyy-MM-dd'),
      dueDate: format(subDays(today, 7), 'yyyy-MM-dd'),
      completedDate: format(subDays(today, 8), 'yyyy-MM-dd'),
      progress: 100,
      status: 'completed',
      documentUrl: '/documents/certificate-jl-orientation.pdf',
    },
    {
      id: '5',
      employeeId: '104',
      employeeName: 'Robert Kim',
      employeePosition: 'New Hire - Installation',
      type: 'Equipment Training',
      description: 'Vehicle & Tool Certification',
      scheduledDate: format(addDays(today, 5), 'yyyy-MM-dd'),
      dueDate: format(addDays(today, 10), 'yyyy-MM-dd'),
      progress: 0,
      status: 'scheduled',
    },
    {
      id: '6',
      employeeId: '105',
      employeeName: 'Alex Thompson',
      employeePosition: 'Field Technician',
      type: 'Equipment Training',
      description: 'Heavy Machinery Operation',
      scheduledDate: format(subDays(today, 5), 'yyyy-MM-dd'),
      dueDate: format(subDays(today, 2), 'yyyy-MM-dd'),
      progress: 50,
      status: 'overdue',
    },
    // Add more mock data as needed
  ];
}

export async function getInductionById(id: string): Promise<Induction | null> {
  const inductions = await getInductions();
  return inductions.find(induction => induction.id === id) || null;
}

export async function getEmployeeInductions(employeeId: string): Promise<Induction[]> {
  const inductions = await getInductions();
  return inductions.filter(induction => induction.employeeId === employeeId);
}

export async function getCriticalInductions(): Promise<AlertInduction[]> {
  const inductions = await getInductions();
  const today = new Date();
  
  return inductions
    .filter(induction => induction.status === 'overdue')
    .map(induction => {
      const dueDate = new Date(induction.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: induction.id,
        employeeId: induction.employeeId,
        employeeName: induction.employeeName,
        type: induction.type,
        dueDate: induction.dueDate,
        daysOverdue,
      };
    });
}
