import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { CreateEmployee } from '@/lib/db/schema';
import { logActivity, getRequestMetadata } from '@/lib/utils/activityLogger';

export async function GET() {
  try {
    const employees = await db.employees.getAll();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const employeeData: CreateEmployee = await request.json();
    
    // Basic validation
    if (!employeeData.first_name || !employeeData.last_name || !employeeData.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    const newEmployee = await db.employees.create(employeeData);
    
    // Log the activity
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await logActivity({
      userId: newEmployee.id, // Assuming the authenticated user's ID is available here
      action: 'create',
      entityType: 'employee',
      entityId: newEmployee.id,
      newValues: {
        firstName: newEmployee.first_name,
        lastName: newEmployee.last_name,
        email: newEmployee.email,
        position: newEmployee.position,
        department: newEmployee.department,
        status: newEmployee.status
      },
      ipAddress,
      userAgent
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
