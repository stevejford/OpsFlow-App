import db from '@/lib/db/index';

export async function getDashboardData() {
  try {
    // Get total number of employees
    const { rows: [{ count: totalEmployees }] } = await db.query(
      'SELECT COUNT(*) as count FROM employees'
    );

    // Get active employees (status = 'Active')
    const { rows: [{ count: activeEmployees }] } = await db.query(
      "SELECT COUNT(*) as count FROM employees WHERE status = 'Active'"
    );

    // Get total licenses
    const { rows: [{ count: totalLicenses }] } = await db.query(
      'SELECT COUNT(*) as count FROM licenses'
    );

    // Get expiring licenses (expiring in the next 30 days)
    const { rows: [{ count: expiringLicenses }] } = await db.query(
      'SELECT COUNT(*) as count FROM licenses WHERE expiry_date <= NOW() + INTERVAL \'30 days\' AND expiry_date >= NOW() AND status IN (\'Valid\', \'Expiring Soon\')'
    );

    // Get total tasks
    const { rows: [{ count: totalTasks }] } = await db.query(
      'SELECT COUNT(*) as count FROM tasks'
    );

    // Get pending tasks (status = 'Todo')
    const { rows: [{ count: pendingTasks }] } = await db.query(
      "SELECT COUNT(*) as count FROM tasks WHERE status = 'Todo'"
    );
    
    // Get recent activities from activity log (last 20)
    const { rows: recentActivities } = await db.query(
      `SELECT 
          al.id,
          al.entity_id as "entityId",
          al.entity_type as "entityType",
          al.action,
          al.created_at as "date",
          al.old_values as "oldValues",
          al.new_values as "newValues",
          e.first_name as "userFirstName",
          e.last_name as "userLastName",
          CASE 
            WHEN al.entity_type = 'employee' THEN 'Employee Profile'
            WHEN al.entity_type = 'license' THEN 'License'
            WHEN al.entity_type = 'task' THEN 'Task'
            WHEN al.entity_type = 'document' THEN 'Document'
            WHEN al.entity_type = 'induction' THEN 'Induction'
            WHEN al.entity_type = 'credential' THEN 'Credential'
            ELSE al.entity_type
          END as "entityName",
          -- Get the name of the entity if available
          CASE 
            WHEN al.entity_type = 'employee' THEN 
              (SELECT first_name || ' ' || last_name FROM employees WHERE id = al.entity_id)
            WHEN al.entity_type = 'license' THEN 
              (SELECT name FROM licenses WHERE id = al.entity_id)
            WHEN al.entity_type = 'task' THEN 
              (SELECT title FROM tasks WHERE id = al.entity_id)
            ELSE al.entity_id::text
          END as "entityDisplayName"
        FROM activity_log al
        LEFT JOIN employees e ON al.user_id = e.id
        ORDER BY al.created_at DESC
        LIMIT 20`
    );

    // Format the recent activities for the UI
    const formattedActivities = recentActivities.map(activity => {
      // Format the action message
      let actionMessage = '';
      const action = activity.action.toLowerCase();
      const entityType = activity.entityType.toLowerCase();
      
      // Create a more descriptive action message
      if (action === 'create') {
        actionMessage = `added a new ${entityType}`;
      } else if (action === 'update') {
        actionMessage = `updated ${entityType} ${activity.entityDisplayName || ''}`;
      } else if (action === 'delete') {
        actionMessage = `deleted ${entityType} ${activity.entityDisplayName || ''}`;
      } else {
        actionMessage = `${action} ${entityType} ${activity.entityDisplayName || ''}`;
      }
      
      // Determine the URL based on entity type
      let entityUrl = '#';
      if (activity.entityId) {
        switch(activity.entityType) {
          case 'employee':
            entityUrl = `/employees/${activity.entityId}`;
            break;
          case 'license':
            entityUrl = `/license-tracking/${activity.entityId}`;
            break;
          case 'task':
            entityUrl = `/tasks/${activity.entityId}`;
            break;
          // Add more entity types as needed
        }
      }
      
      return {
        id: activity.id,
        entityId: activity.entityId,
        entityType: activity.entityType,
        entityName: activity.entityName,
        entityDisplayName: activity.entityDisplayName,
        entityUrl,
        action: activity.action,
        actionMessage,
        date: new Date(activity.date),
        user: {
          firstName: activity.userFirstName || 'System',
          lastName: activity.userLastName || ''
        },
        oldValues: activity.oldValues || {},
        newValues: activity.newValues || {}
      };
    });
    
    // Get expiring licenses for the alert
    const { rows: expiringLicensesList } = await db.query(
      `SELECT 
        l.id,
        l.name,
        l.expiry_date as "expiryDate",
        e.first_name as "firstName",
        e.last_name as "lastName"
      FROM licenses l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.expiry_date <= NOW() + INTERVAL '30 days'
        AND l.expiry_date >= NOW()
        AND l.status IN ('Valid', 'Expiring Soon')
      ORDER BY l.expiry_date ASC
      LIMIT 3`
    );
    
    // Get task completion trends for the last 7 days
    const { rows: taskTrends } = await db.query(
      `SELECT 
          COUNT(*) FILTER (WHERE status = 'Completed' AND created_at >= NOW() - INTERVAL '7 days') as completed_tasks,
          COUNT(*) FILTER (WHERE status = 'Todo' AND created_at >= NOW() - INTERVAL '7 days') as pending_tasks,
          COUNT(*) FILTER (created_at >= NOW() - INTERVAL '7 days') as total_tasks
       FROM tasks`
    );

    const taskTrendsData = taskTrends[0] || {
      completed_tasks: 0,
      pending_tasks: 0,
      total_tasks: 0
    };

    return {
      metrics: {
        totalEmployees: parseInt(totalEmployees),
        activeEmployees: parseInt(activeEmployees),
        totalLicenses: parseInt(totalLicenses),
        expiringLicenses: parseInt(expiringLicenses),
        totalTasks: parseInt(totalTasks),
        pendingTasks: parseInt(pendingTasks)
      },
      taskTrends: {
        completed: parseInt(taskTrendsData.completed_tasks) || 0,
        pending: parseInt(taskTrendsData.pending_tasks) || 0,
        total: parseInt(taskTrendsData.total_tasks) || 0
      },
      recentActivities: formattedActivities,
      alerts: {
        expiringLicenses: expiringLicensesList.map(license => ({
          id: license.id,
          name: license.name,
          expiryDate: new Date(license.expiryDate),
          employee: {
            firstName: license.firstName,
            lastName: license.lastName
          }
        }))
      }
    };
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return default data instead of throwing an error
    return {
      metrics: {
        totalEmployees: 0,
        activeEmployees: 0,
        totalLicenses: 0,
        expiringLicenses: 0,
        totalTasks: 0,
        pendingTasks: 0
      },
      recentActivities: [],
      alerts: {
        expiringLicenses: []
      }
    };
  }
}
