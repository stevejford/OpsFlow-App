import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { query } from '@/lib/db/neon-db';
import { logActivity, getRequestMetadata } from '@/lib/utils/activityLogger';

interface Params {
  params: {
    id: string;
    licenseId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, licenseId } = params;
    
    // Get all licenses for the employee
    const licenses = await db.licenses.getByEmployeeId(id);
    
    // Find the specific license
    const license = licenses.find(license => license.id === licenseId);
    
    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(license);
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id, licenseId } = params;
    const licenseData = await request.json();
    
    console.log('License update data received:', JSON.stringify(licenseData, null, 2));
    
    // Basic validation
    if (Object.keys(licenseData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // First get the current license data for logging
    const getLicenseQuery = `
      SELECT * FROM licenses 
      WHERE id = $1 AND employee_id = $2
    `;
    
    const { rows: licenseRows } = await query(getLicenseQuery, [licenseId, id]);
    
    if (licenseRows.length === 0) {
      console.log(`License not found or doesn't belong to employee ${id}`);
      return NextResponse.json(
        { error: 'License not found for this employee' },
        { status: 404 }
      );
    }
    
    const currentLicense = licenseRows[0];
    
    // Define interface for notes data
    interface NotesObject {
      issuing_authority?: string;
      document_url?: string;
      document_name?: string;
      [key: string]: any;
    }
    
    // Parse the original notes from the request if available
    let notesObject: NotesObject = {};
    if (licenseData.notes) {
      try {
        notesObject = JSON.parse(licenseData.notes) as NotesObject;
      } catch (e) {
        console.log('Error parsing notes from update data:', e);
      }
    }
    
    // Format the data for the database update
    const dbUpdateData: any = {};
    
    // Only include fields that are provided in the update
    if (licenseData.name) dbUpdateData.name = licenseData.name;
    if (licenseData.license_number !== undefined) dbUpdateData.license_number = licenseData.license_number;
    if (licenseData.issue_date) dbUpdateData.issue_date = new Date(licenseData.issue_date);
    if (licenseData.expiry_date) dbUpdateData.expiry_date = new Date(licenseData.expiry_date);
    if (licenseData.status) {
      dbUpdateData.status = ['Valid', 'Expired', 'Expiring Soon', 'Renewal Pending'].includes(licenseData.status) 
        ? licenseData.status 
        : 'Valid';
    }
    if (licenseData.notes) dbUpdateData.notes = licenseData.notes;
    
    // Always update the updated_at timestamp
    dbUpdateData.updated_at = new Date();
    
    console.log('Formatted license update data for DB:', JSON.stringify(dbUpdateData, null, 2));
    
    // Build the SQL update query dynamically based on which fields are being updated
    const updateFields = Object.keys(dbUpdateData);
    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = [...updateFields.map(field => dbUpdateData[field]), licenseId];
    
    const updateQuery = `
      UPDATE licenses 
      SET ${setClause} 
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    console.log('Update query:', updateQuery);
    console.log('Update values:', values);
    
    try {
      const { rows } = await query(updateQuery, values);
      
      if (rows.length > 0) {
        console.log(`Successfully updated license ${licenseId}`);
        
        // Fetch the updated license
        const updatedLicense = {
          ...currentLicense,
          ...dbUpdateData
        };
        
        console.log('License updated successfully:', updatedLicense);
        
        // Log the activity
        const { ipAddress, userAgent } = getRequestMetadata(request);
        await logActivity({
          userId: id,
          action: 'update',
          entityType: 'license',
          entityId: licenseId,
          oldValues: {
            name: currentLicense.name,
            licenseNumber: currentLicense.license_number,
            issueDate: currentLicense.issue_date,
            expiryDate: currentLicense.expiry_date,
            status: currentLicense.status
          },
          newValues: {
            name: updatedLicense.name,
            licenseNumber: updatedLicense.license_number,
            issueDate: updatedLicense.issue_date,
            expiryDate: updatedLicense.expiry_date,
            status: updatedLicense.status
          },
          ipAddress,
          userAgent
        });
        
        return NextResponse.json(updatedLicense);
      } else {
        console.error(`No rows affected when updating license ${licenseId}`);
        return NextResponse.json(
          { error: 'Failed to update license' },
          { status: 500 }
        );
      }
    } catch (updateError: any) {
      console.error('Error in UPDATE query:', updateError);
      return NextResponse.json(
        { error: `Database error: ${updateError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json(
      { error: `Failed to update license: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id, licenseId } = params;
    
    console.log(`Attempting to delete license with ID: ${licenseId}`);
    
    // First, get the license data for logging
    const getLicenseQuery = `
      SELECT * FROM licenses 
      WHERE id = $1
    `;
    
    const { rows: licenseRows } = await query(getLicenseQuery, [licenseId]);
    
    if (licenseRows.length === 0) {
      console.log(`No license found with ID: ${licenseId}`);
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    
    const licenseToDelete = licenseRows[0];
    
    // Now delete the license
    try {
      const deleteQuery = `DELETE FROM licenses WHERE id = $1 RETURNING id`;
      console.log(`Executing delete query: ${deleteQuery} with ID: ${licenseId}`);
      
      const { rows: result } = await query(deleteQuery, [licenseId]);
      console.log('Delete result:', result);
      
      if (result && result.length > 0) {
        console.log(`Successfully deleted license ${licenseId}`);
        
        // Log the activity
        const { ipAddress, userAgent } = getRequestMetadata(request);
        await logActivity({
          userId: id,
          action: 'delete',
          entityType: 'license',
          entityId: licenseId,
          oldValues: {
            name: licenseToDelete.name,
            licenseNumber: licenseToDelete.license_number,
            issueDate: licenseToDelete.issue_date,
            expiryDate: licenseToDelete.expiry_date,
            status: licenseToDelete.status
          },
          ipAddress,
          userAgent
        });
        
        return NextResponse.json({ success: true, message: 'License deleted successfully' });
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
      { error: `Failed to delete license: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
