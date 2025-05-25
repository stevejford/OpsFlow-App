import { format } from 'date-fns';
import { Induction as DbInduction } from '../db/schema';
import { Induction as UiInduction, InductionStatus } from '../data/inductions';

/**
 * Maps a database induction record to the UI induction format
 */
export function mapDbInductionToUiInduction(
  dbInduction: DbInduction, 
  employeeName?: string,
  employeePosition?: string
): UiInduction {
  // Map the status from DB to UI format
  const statusMap: Record<string, InductionStatus> = {
    'Completed': 'completed',
    'In Progress': 'in-progress',
    'Pending': 'scheduled',
    'Expired': 'overdue'
  };

  // Calculate progress based on status
  const progressMap: Record<string, number> = {
    'completed': 100,
    'in-progress': 50,
    'scheduled': 0,
    'overdue': 25
  };

  // Convert DB status to UI status, defaulting to 'scheduled' if unknown
  const status = statusMap[dbInduction.status] || 'scheduled';

  // Format dates consistently
  const formatDate = (date: Date | undefined | null) => {
    return date ? format(new Date(date), 'yyyy-MM-dd') : '';
  };

  return {
    id: dbInduction.id,
    employeeId: dbInduction.employee_id,
    employeeName: employeeName || 'Unknown Employee',
    employeePosition: employeePosition || 'Unknown Position',
    type: dbInduction.name,
    description: dbInduction.notes || dbInduction.provider || '',
    scheduledDate: formatDate(dbInduction.created_at),
    dueDate: formatDate(dbInduction.expiry_date),
    completedDate: formatDate(dbInduction.completed_date),
    progress: progressMap[status],
    status: status,
    documentUrl: '' // This would need to be fetched separately from documents table
  };
}

/**
 * Maps a UI induction to database format for saving
 */
export function mapUiInductionToDbInduction(uiInduction: UiInduction): Omit<DbInduction, 'id' | 'created_at' | 'updated_at'> {
  // Map the status from UI to DB format
  const statusMap: Record<string, string> = {
    'completed': 'Completed',
    'in-progress': 'In Progress',
    'scheduled': 'Pending',
    'overdue': 'Expired'
  };

  // Parse dates from string format to Date objects
  const parseDate = (dateStr: string | undefined) => {
    return dateStr ? new Date(dateStr) : undefined;
  };

  // Ensure the status is one of the allowed values in the DB schema
  const dbStatus = statusMap[uiInduction.status] as 'Completed' | 'In Progress' | 'Pending' | 'Expired';

  return {
    employee_id: uiInduction.employeeId,
    name: uiInduction.type,
    completed_date: parseDate(uiInduction.completedDate) || new Date(0),
    expiry_date: parseDate(uiInduction.dueDate),
    status: dbStatus || 'Pending',
    provider: uiInduction.description?.split('\n')[0] || '',
    notes: uiInduction.description || ''
  };
}

/**
 * Maps an array of database inductions to UI format
 */
export function mapDbInductionsToUiInductions(
  dbInductions: DbInduction[],
  employeeMap?: Map<string, { name: string, position: string }>
): UiInduction[] {
  return dbInductions.map(dbInduction => {
    const employee = employeeMap?.get(dbInduction.employee_id);
    return mapDbInductionToUiInduction(
      dbInduction,
      employee?.name,
      employee?.position
    );
  });
}
