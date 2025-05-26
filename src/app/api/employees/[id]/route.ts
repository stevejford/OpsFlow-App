import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { UpdateEmployee } from '@/lib/db/schema';
import { logActivity, getRequestMetadata } from '@/lib/utils/activityLogger';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const employee = await db.employees.getById(id);
    
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const updates: UpdateEmployee = await request.json();
    
    // Basic validation
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Get the current employee data before updating
    const currentEmployee = await db.employees.getById(id);
    if (!currentEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const updatedEmployee = await db.employees.update(id, updates);
    
    if (!updatedEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }
    
    // Log the activity
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await logActivity({
      userId: id, // In a real app, this would be the authenticated user's ID
      action: 'update',
      entityType: 'employee',
      entityId: id,
      oldValues: {
        firstName: currentEmployee.first_name,
        lastName: currentEmployee.last_name,
        email: currentEmployee.email,
        position: currentEmployee.position,
        department: currentEmployee.department,
        status: currentEmployee.status
      },
      newValues: {
        ...(updates.first_name && { firstName: updates.first_name }),
        ...(updates.last_name && { lastName: updates.last_name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.position && { position: updates.position }),
        ...(updates.department && { department: updates.department }),
        ...(updates.status && { status: updates.status })
      },
      ipAddress,
      userAgent
    });
    
    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // Get the employee data before deleting
    const employee = await db.employees.getById(id);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const success = await db.employees.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete employee' },
        { status: 500 }
      );
    }
    
    // Log the activity
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await logActivity({
      userId: id, // In a real app, this would be the authenticated user's ID
      action: 'delete',
      entityType: 'employee',
      entityId: id,
      oldValues: {
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        status: employee.status
      },
      ipAddress,
      userAgent
    });
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
