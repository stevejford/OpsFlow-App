import { NextResponse } from 'next/server';

// In a real application, this would be stored in a database
// For this demo, we'll use a simple in-memory store
let departments = [
  "Business Development",
  "Operations",
  "Administration",
  "Safety",
  "Maintenance",
  "Test Position",
];

export async function GET() {
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  try {
    const { department } = await request.json();
    
    if (!department || typeof department !== 'string') {
      return NextResponse.json(
        { error: 'Department name is required and must be a string' },
        { status: 400 }
      );
    }
    
    const trimmedDepartment = department.trim();
    
    if (!trimmedDepartment) {
      return NextResponse.json(
        { error: 'Department name cannot be empty' },
        { status: 400 }
      );
    }
    
    if (departments.includes(trimmedDepartment)) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      );
    }
    
    departments.push(trimmedDepartment);
    
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error('Error adding department:', error);
    return NextResponse.json(
      { error: 'Failed to add department' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { oldDepartment, newDepartment } = await request.json();
    
    if (!oldDepartment || !newDepartment || typeof oldDepartment !== 'string' || typeof newDepartment !== 'string') {
      return NextResponse.json(
        { error: 'Both old and new department names are required and must be strings' },
        { status: 400 }
      );
    }
    
    const trimmedNewDepartment = newDepartment.trim();
    
    if (!trimmedNewDepartment) {
      return NextResponse.json(
        { error: 'New department name cannot be empty' },
        { status: 400 }
      );
    }
    
    if (!departments.includes(oldDepartment)) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    if (departments.includes(trimmedNewDepartment) && oldDepartment !== trimmedNewDepartment) {
      return NextResponse.json(
        { error: 'Department already exists' },
        { status: 400 }
      );
    }
    
    departments = departments.map(d => d === oldDepartment ? trimmedNewDepartment : d);
    
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }
    
    if (!departments.includes(department)) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    departments = departments.filter(d => d !== department);
    
    return NextResponse.json({ success: true, departments });
  } catch (error) {
    console.error('Error removing department:', error);
    return NextResponse.json(
      { error: 'Failed to remove department' },
      { status: 500 }
    );
  }
}
