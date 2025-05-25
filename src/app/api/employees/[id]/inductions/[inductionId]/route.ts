import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

interface Params {
  params: {
    id: string;
    inductionId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, inductionId } = params;
    
    // Get all inductions for the employee
    const inductions = await db.inductions.getByEmployeeId(id);
    
    // Find the specific induction
    const induction = inductions.find(induction => induction.id === inductionId);
    
    if (!induction) {
      return NextResponse.json(
        { error: 'Induction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(induction);
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
    const { id, inductionId } = params;
    const inductionData = await request.json();
    
    console.log('Induction update data received:', JSON.stringify(inductionData, null, 2));
    
    // Basic validation
    if (Object.keys(inductionData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // First verify the induction exists using a direct query
    const verifyQuery = `
      SELECT id FROM inductions 
      WHERE id = $1 AND employee_id = $2
    `;
    
    try {
      const { rows: verifyRows } = await query(verifyQuery, [inductionId, id]);
      
      if (verifyRows.length === 0) {
        console.log(`Induction not found or doesn't belong to employee ${id}`);
        return NextResponse.json(
          { error: 'Induction not found for this employee' },
          { status: 404 }
        );
      }
      
      // Define interface for notes data
      interface NotesObject {
        portal_url?: string;
        username?: string;
        password?: string;
        additional_notes?: string;
        document_url?: string;
        [key: string]: any;
      }
      
      // Parse the original notes from the request if available
      let notesObject: NotesObject = {};
      if (inductionData.notes) {
        try {
          notesObject = JSON.parse(inductionData.notes) as NotesObject;
        } catch (e) {
          console.log('Error parsing notes from update data:', e);
        }
      }
      
      // Format the data for the database update
      const dbUpdateData: any = {};
      
      // Only include fields that are provided in the update
      if (inductionData.name) dbUpdateData.name = inductionData.name;
      if (inductionData.provider !== undefined) dbUpdateData.provider = inductionData.provider;
      if (inductionData.completed_date) dbUpdateData.completed_date = new Date(inductionData.completed_date);
      if (inductionData.expiry_date) dbUpdateData.expiry_date = new Date(inductionData.expiry_date);
      if (inductionData.status) dbUpdateData.status = inductionData.status;
      if (inductionData.notes) dbUpdateData.notes = inductionData.notes;
      
      // Always update the updated_at timestamp
      dbUpdateData.updated_at = new Date();
      
      console.log('Formatted induction update data for DB:', JSON.stringify(dbUpdateData, null, 2));
      
      // Build the SQL update query dynamically based on which fields are being updated
      const updateFields = Object.keys(dbUpdateData);
      const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const values = [...updateFields.map(field => dbUpdateData[field]), inductionId];
      
      const updateQuery = `
        UPDATE inductions 
        SET ${setClause} 
        WHERE id = $${values.length}
        RETURNING *
      `;
      
      console.log('Update query:', updateQuery);
      console.log('Update values:', values);
      
      const { rows } = await query(updateQuery, values);
      
      if (rows.length > 0) {
        console.log(`Successfully updated induction ${inductionId}`);
        return NextResponse.json(rows[0]);
      } else {
        console.error(`No rows affected when updating induction ${inductionId}`);
        return NextResponse.json(
          { error: 'Failed to update induction' },
          { status: 500 }
        );
      }
    } catch (queryError: any) {
      console.error('Error in database query:', queryError);
      return NextResponse.json(
        { error: `Database error: ${queryError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json(
      { error: `Failed to update induction: ${error.message}` },
      { status: 500 }
    );
  }
}

import { query } from '@/lib/db/neon-db';

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id, inductionId } = params;
    
    console.log(`Attempting to delete induction with ID: ${inductionId}`);
    
    // Use a single direct query to delete the induction
    try {
      // Use a direct SQL query for maximum reliability
      const deleteQuery = `DELETE FROM inductions WHERE id = $1 RETURNING id`;
      console.log(`Executing delete query: ${deleteQuery} with ID: ${inductionId}`);
      
      const { rows: result } = await query(deleteQuery, [inductionId]);
      console.log('Delete result:', result);
      
      if (result && result.length > 0) {
        console.log(`Successfully deleted induction ${inductionId}`);
        return NextResponse.json({ success: true, message: 'Induction deleted successfully' });
      } else {
        // If no rows returned, the induction wasn't found
        console.log(`No induction found with ID: ${inductionId}`);
        return NextResponse.json(
          { error: 'Induction not found' },
          { status: 404 }
        );
      }
    } catch (sqlError: any) {
      console.error('SQL Error in DELETE operation:', sqlError);
      return NextResponse.json(
        { error: `Database error: ${sqlError.message || 'Unknown SQL error'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json(
      { error: `Failed to delete induction: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
