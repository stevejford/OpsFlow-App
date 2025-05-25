'use server';

import { db } from '@/lib/db/neon-operations';

export async function getEmployeeData(id: string) {
  try {
    // Get employee data
    const employee = await db.employees.getById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get related data in parallel
    const [licenses, inductions, documents, emergencyContacts] = await Promise.all([
      db.licenses.getByEmployeeId(id),
      db.inductions.getByEmployeeId(id),
      db.documents.getByEmployeeId(id),
      db.emergencyContacts.getByEmployeeId(id)
    ]);

    // Format the data to match the expected shape
    return {
      employee: {
        id: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        startDate: employee.hire_date,
        status: employee.status,
        employeeId: employee.employee_id || `EMP${employee.id.padStart(4, '0')}`,
        initials: `${employee.first_name[0]}${employee.last_name[0]}`,
        // Add any additional fields needed by your components
      },
      licenses,
      inductions,
      documents,
      emergencyContacts: emergencyContacts.length > 0 ? emergencyContacts[0] : null,
      // Add any additional data needed by your components
    };
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw error;
  }
}
