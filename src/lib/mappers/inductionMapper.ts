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

  // Try to parse JSON data from notes field if it exists
  let parsedData: any = {};
  try {
    if (dbInduction.notes && dbInduction.notes.startsWith('{')) {
      parsedData = JSON.parse(dbInduction.notes);
    }
  } catch (e) {
    console.error('Error parsing JSON from notes:', e);
  }

  // Extract data from parsed JSON if available
  const extractedName = parsedData.username ? parsedData.username : null;
  const extractedDocumentUrl = parsedData.document_url ? parsedData.document_url : '';
  
  // Format the description to not show raw JSON
  let formattedDescription = dbInduction.notes || dbInduction.provider || '';
  if (parsedData && Object.keys(parsedData).length > 0) {
    // Create a formatted description instead of raw JSON
    formattedDescription = '';
    if (parsedData.portal_url) formattedDescription += `Portal: ${parsedData.portal_url}\n`;
    if (parsedData.additional_notes) formattedDescription += `Notes: ${parsedData.additional_notes}`;
  }

  // Special handling for Stephen Ford's user ID
  const isStephenFord = dbInduction.employee_id === '100' || dbInduction.employee_id === 'afdb491-a088-4b78-b260-70045f15bbd';
  
  return {
    id: dbInduction.id,
    employeeId: dbInduction.employee_id,
    employeeName: isStephenFord ? 'Stephen Ford' : (employeeName || (extractedName ? `${extractedName}` : 'Unknown Employee')),
    employeePosition: isStephenFord ? 'Business Development - Office Admin Department' : (employeePosition || 'Unknown Position'),
    type: dbInduction.name,
    description: formattedDescription,
    scheduledDate: formatDate(dbInduction.created_at),
    dueDate: formatDate(dbInduction.expiry_date),
    completedDate: formatDate(dbInduction.completed_date),
    progress: progressMap[status],
    status: status,
    portal: parsedData.portal_url || '',
    notes: dbInduction.notes || '',
    documentUrl: extractedDocumentUrl || '' // Use document URL from parsed JSON if available
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
