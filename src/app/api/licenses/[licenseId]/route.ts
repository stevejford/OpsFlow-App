import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from '@vercel/postgres';

interface RouteParams {
  params: {
    licenseId: string;
  };
}

// GET a specific license
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { licenseId } = params;
    
    // Fetch the license data
    const result = await sql.query(
      `
      SELECT 
        l.id, 
        l.employee_id, 
        l.license_type_id, 
        l.description, 
        l.issue_date, 
        l.expiry_date, 
        l.document_url,
        e.name as employee_name,
        e.position as employee_position,
        lt.name as license_type_name
      FROM licenses l
      JOIN employees e ON l.employee_id = e.id
      JOIN license_types lt ON l.license_type_id = lt.id
      WHERE l.id = $1
      `,
      [licenseId]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    
    const license = result.rows[0];
    
    // Calculate status and days until expiry
    const expiryDate = new Date(license.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status;
    if (diffDays < 0) {
      status = 'Expired';
    } else if (diffDays <= 30) {
      status = 'Expiring Soon';
    } else {
      status = 'Active';
    }
    
    return NextResponse.json({
      license: {
        id: license.id,
        employeeId: license.employee_id,
        employeeName: license.employee_name,
        employeePosition: license.employee_position,
        licenseTypeId: license.license_type_id,
        licenseType: license.license_type_name,
        description: license.description,
        issueDate: license.issue_date,
        expiryDate: license.expiry_date,
        documentUrl: license.document_url,
        status,
        daysUntilExpiry: diffDays
      }
    });
  } catch (error) {
    console.error('Error fetching license:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT (update) a license
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { licenseId } = params;
    const body = await request.json();
    const { licenseTypeId, description, issueDate, expiryDate, documentUrl } = body;
    
    // Check if license exists
    const licenseResult = await sql.query(
      'SELECT id FROM licenses WHERE id = $1',
      [licenseId]
    );
    
    if (licenseResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    
    // Build the update query dynamically based on provided fields
    let updateQuery = 'UPDATE licenses SET';
    const queryParams: any[] = [];
    const updateFields: string[] = [];
    
    if (licenseTypeId !== undefined) {
      queryParams.push(licenseTypeId);
      updateFields.push(` license_type_id = $${queryParams.length}`);
    }
    
    if (description !== undefined) {
      queryParams.push(description);
      updateFields.push(` description = $${queryParams.length}`);
    }
    
    if (issueDate !== undefined) {
      queryParams.push(issueDate);
      updateFields.push(` issue_date = $${queryParams.length}`);
    }
    
    if (expiryDate !== undefined) {
      queryParams.push(expiryDate);
      updateFields.push(` expiry_date = $${queryParams.length}`);
    }
    
    if (documentUrl !== undefined) {
      queryParams.push(documentUrl);
      updateFields.push(` document_url = $${queryParams.length}`);
    }
    
    // If no fields to update, return early
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Complete the query
    updateQuery += updateFields.join(',');
    queryParams.push(licenseId);
    updateQuery += ` WHERE id = $${queryParams.length} RETURNING id`;
    
    // Execute the update
    await sql.query(updateQuery, queryParams);
    
    // Fetch the updated license
    const result = await sql.query(
      `
      SELECT 
        l.id, 
        l.employee_id, 
        l.license_type_id, 
        l.description, 
        l.issue_date, 
        l.expiry_date, 
        l.document_url,
        e.name as employee_name,
        e.position as employee_position,
        lt.name as license_type_name
      FROM licenses l
      JOIN employees e ON l.employee_id = e.id
      JOIN license_types lt ON l.license_type_id = lt.id
      WHERE l.id = $1
      `,
      [licenseId]
    );
    
    const license = result.rows[0];
    
    // Calculate status and days until expiry
    const expiryDate = new Date(license.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status;
    if (diffDays < 0) {
      status = 'Expired';
    } else if (diffDays <= 30) {
      status = 'Expiring Soon';
    } else {
      status = 'Active';
    }
    
    return NextResponse.json({
      license: {
        id: license.id,
        employeeId: license.employee_id,
        employeeName: license.employee_name,
        employeePosition: license.employee_position,
        licenseTypeId: license.license_type_id,
        licenseType: license.license_type_name,
        description: license.description,
        issueDate: license.issue_date,
        expiryDate: license.expiry_date,
        documentUrl: license.document_url,
        status,
        daysUntilExpiry: diffDays
      }
    });
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { error: 'Failed to update license', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE a license
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { licenseId } = params;
    
    // Check if license exists
    const licenseResult = await sql.query(
      'SELECT id FROM licenses WHERE id = $1',
      [licenseId]
    );
    
    if (licenseResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    
    // Delete the license
    await sql.query(
      'DELETE FROM licenses WHERE id = $1',
      [licenseId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { error: 'Failed to delete license', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
