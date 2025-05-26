import db from '@/lib/db';

type LogActivityParams = {
  userId?: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'upload' | 'download' | 'login' | 'logout';
  entityType: 'employee' | 'license' | 'task' | 'document' | 'induction' | 'credential';
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
};

export async function logActivity(params: LogActivityParams) {
  const {
    userId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress,
    userAgent
  } = params;

  try {
    await db.query(
      `INSERT INTO activity_log 
       (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId || null,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress || null,
        userAgent || null
      ]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw the error to avoid breaking the main operation
  }
}

// Helper function to get the current request's IP and User-Agent
export function getRequestMetadata(req: Request) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
  const userAgent = req.headers.get('user-agent') || '';
  
  return { ipAddress, userAgent };
}
