import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { CreateEmployee } from '@/lib/db/schema';

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

export async function POST(request: Request) {
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
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
