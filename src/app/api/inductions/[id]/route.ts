import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { query } from '@/lib/db/neon-db';
import { Induction, Employee } from '@/lib/db/schema';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // Get induction with employee data in a single query
    const { rows } = await query<Induction & Partial<Employee>>(
      `SELECT i.*, 
              e.first_name, 
              e.last_name, 
              e.position, 
              e.department
       FROM inductions i
       LEFT JOIN employees e ON i.employee_id = e.id
       WHERE i.id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Induction not found' },
        { status: 404 }
      );
    }
    
    const induction = rows[0];
    
    // Format the response to include employee information
    const response = {
      ...induction,
      employee: induction.first_name ? {
        first_name: induction.first_name,
        last_name: induction.last_name,
        position: induction.position,
        department: induction.department,
        full_name: `${induction.first_name} ${induction.last_name}`,
        position_department: `${induction.position}${induction.department ? ` - ${induction.department} Department` : ''}`
      } : null
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching induction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch induction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const updates = await request.json();
    
    // Basic validation
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Execute the update directly using the query function since inductionOperations is not available
    const { rows } = await query(
      `UPDATE inductions 
       SET status = $1, notes = $2, updated_at = NOW() 
       WHERE id = $3
       RETURNING *`,
      [updates.status, updates.notes, id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Induction not found' },
        { status: 404 }
      );
    }
    
    const updatedInduction = rows[0];
    
    return NextResponse.json(updatedInduction);
  } catch (error) {
    console.error('Error updating induction:', error);
    return NextResponse.json(
      { error: 'Failed to update induction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // Execute the delete directly using the query function since inductionOperations is not available
    const { rowCount } = await query('DELETE FROM inductions WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Induction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting induction:', error);
    return NextResponse.json(
      { error: 'Failed to delete induction' },
      { status: 500 }
    );
  }
}
