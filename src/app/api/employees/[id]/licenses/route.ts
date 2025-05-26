import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { License } from '@/lib/db/schema';
import { query, testConnection } from '@/lib/db/neon-db';
import { logActivity, getRequestMetadata } from '@/lib/utils/activityLogger';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    let licenses;
    
    // Fetch licenses from database
    licenses = await db.licenses.getByEmployeeId(id);
    
    // If no licenses found, return an empty array
    if (!licenses || !Array.isArray(licenses) || licenses.length === 0) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Error in licenses API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const licenseData = await request.json();
    
    console.log('License data received:', JSON.stringify(licenseData, null, 2));
    
    // Basic validation
    if (!licenseData.name || !licenseData.issue_date || !licenseData.expiry_date) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Name, issue date, and expiry date are required' },
        { status: 400 }
      );
    }

    // Extract additional data from the request
    console.log('Full license data received:', JSON.stringify(licenseData, null, 2));
    
    // Parse the notes field if it exists and is a string
    interface NotesData {
      issuing_authority?: string;
      document_url?: string;
      document_name?: string;
      [key: string]: any;
    }
    
    let notesData: NotesData = {};
    if (licenseData.notes && typeof licenseData.notes === 'string') {
      try {
        notesData = JSON.parse(licenseData.notes) as NotesData;
        console.log('Successfully parsed notes JSON:', notesData);
      } catch (e) {
        console.log('Notes is not valid JSON, will create new JSON object');
      }
    }
    
    // Define interface for notes data
    interface NotesObject {
      issuing_authority?: string;
      document_url?: string;
      document_name?: string;
      [key: string]: any;
    }
    
    // Parse the original notes from the request if available
    let originalNotes: NotesObject = {};
    try {
      if (licenseData.notes) {
        originalNotes = JSON.parse(licenseData.notes) as NotesObject;
      }
    } catch (e) {
      console.log('Error parsing original notes:', e);
    }
    
    // Create a comprehensive notes object with all additional data
    const notesObject: NotesObject = {
      // Use the issuing_authority from the parsed notes
      issuing_authority: originalNotes.issuing_authority || '',
      document_url: originalNotes.document_url || '',
      document_name: originalNotes.document_name || ''
    };
    
    console.log('Original notes object:', originalNotes);
    
    console.log('Notes object to be saved:', notesObject);
    
    // Format the data for the database
    const dbLicenseData = {
      employee_id: id,
      name: licenseData.name,
      license_number: licenseData.license_number || '',
      issue_date: new Date(licenseData.issue_date),
      expiry_date: new Date(licenseData.expiry_date),
      status: ['Valid', 'Expired', 'Expiring Soon', 'Renewal Pending'].includes(licenseData.status) ? licenseData.status : 'Valid',
      notes: JSON.stringify(notesObject)
    };
    
    console.log('Formatted license data for DB:', JSON.stringify(dbLicenseData, null, 2));
    
    // Direct database query approach
    const insertQuery = `
      INSERT INTO licenses (employee_id, name, license_number, issue_date, expiry_date, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    // Log the final data being sent to the database
    console.log('Final license data for DB:', {
      employee_id: id,
      name: dbLicenseData.name,
      license_number: dbLicenseData.license_number,
      issue_date: dbLicenseData.issue_date,
      expiry_date: dbLicenseData.expiry_date,
      status: dbLicenseData.status,
      notes: dbLicenseData.notes
    });
    
    const values = [
      id,
      dbLicenseData.name,
      dbLicenseData.license_number,
      dbLicenseData.issue_date,
      dbLicenseData.expiry_date,
      dbLicenseData.status,
      dbLicenseData.notes
    ];
    
    // Execute the query
    const result = await query(insertQuery, values);
    const newLicense = result.rows[0];
    
    console.log('License created successfully:', newLicense);
    
    // Log the activity
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await logActivity({
      userId: id, // In a real app, this would be the authenticated user's ID
      action: 'create',
      entityType: 'license',
      entityId: newLicense.id,
      newValues: {
        name: newLicense.name,
        licenseNumber: newLicense.license_number,
        issueDate: newLicense.issue_date,
        expiryDate: newLicense.expiry_date,
        status: newLicense.status
      },
      ipAddress,
      userAgent
    });
    
    return NextResponse.json(newLicense, { status: 201 });
    
  } catch (error) {
    console.error('Error creating license:', error);
    let errorMessage = 'Failed to create license';
    
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
