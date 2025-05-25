import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';
import { query } from '@/lib/db/neon-db';

// GET all licenses
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    // Build the query to get all licenses with their relationships
    let sqlQuery = `
      SELECT 
        l.id, 
        l.employee_id, 
        l.license_type_id, 
        l.name,
        l.license_number,
        l.description, 
        l.issue_date, 
        l.expiry_date, 
        l.status,
        l.notes,
        e.name as employee_name,
        e.position as employee_position,
        lt.name as license_type_name
      FROM licenses l
      JOIN employees e ON l.employee_id = e.id
      JOIN license_types lt ON l.license_type_id = lt.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    if (employeeId) {
      sqlQuery += ` AND l.employee_id = $${queryParams.length + 1}`;
      queryParams.push(employeeId);
    }
    
    if (status) {
      // Handle status filtering (Active, Expiring Soon, Expired)
      const today = new Date();
      
      if (status === 'Active') {
        sqlQuery += ` AND l.expiry_date > $${queryParams.length + 1} AND l.expiry_date > (CURRENT_DATE + INTERVAL '30 days')`;
        queryParams.push(today.toISOString());
      } else if (status === 'Expiring Soon') {
        sqlQuery += ` AND l.expiry_date > $${queryParams.length + 1} AND l.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')`;
        queryParams.push(today.toISOString());
      } else if (status === 'Expired') {
        sqlQuery += ` AND l.expiry_date <= $${queryParams.length + 1}`;
        queryParams.push(today.toISOString());
      }
    }
    
    if (type) {
      sqlQuery += ` AND l.license_type_id = $${queryParams.length + 1}`;
      queryParams.push(type);
    }
    
    // Add ORDER BY clause
    sqlQuery += ` ORDER BY l.expiry_date ASC`;
    
    // Execute the query
    const { rows } = await query(sqlQuery, queryParams);
    
    // Calculate days until expiry and map to client-friendly format
    const licenses = rows.map(license => {
      const expiryDate = new Date(license.expiry_date);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Parse additional data from notes field if available
      let additionalData: { issuing_authority?: string; document_url?: string } = {};
      if (license.notes) {
        try {
          additionalData = JSON.parse(license.notes);
        } catch (e) {
          console.warn('Could not parse license notes:', e);
        }
      }
      
      // Generate initials from employee name
      const nameParts = license.employee_name.split(' ');
      const initials = nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0].substring(0, 2);

      // Assign a color based on the first letter of the name
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'gray'];
      const colorIndex = license.employee_name.charCodeAt(0) % colors.length;
      
      // Determine status based on expiry date
      let calculatedStatus;
      if (diffDays < 0) {
        calculatedStatus = 'Expired';
      } else if (diffDays <= 30) {
        calculatedStatus = 'Expiring Soon';
      } else {
        calculatedStatus = 'Active';
      }
      
      return {
        id: license.id,
        employeeId: license.employee_id,
        employeeName: license.employee_name,
        employeeRole: license.employee_position || 'Employee',
        employeeInitials: initials,
        employeeColor: colors[colorIndex],
        licenseType: license.license_type_name,
        licenseTypeId: license.license_type_id,
        name: license.name,
        licenseNumber: license.license_number || '',
        description: license.description || '',
        issuingAuthority: additionalData.issuing_authority || '',
        issueDate: license.issue_date,
        expiryDate: license.expiry_date,
        documentUrl: additionalData.document_url || '',
        status: calculatedStatus,
        daysUntilExpiry: diffDays,
      };
    });
    
    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
}

// POST a new license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['employeeId', 'licenseTypeId', 'name', 'issueDate', 'expiryDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    // Check if employee exists
    const { rows: employeeRows } = await query(
      'SELECT id FROM employees WHERE id = $1',
      [body.employeeId]
    );
    
    if (employeeRows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    // Check if license type exists
    const { rows: licenseTypeRows } = await query(
      'SELECT id FROM license_types WHERE id = $1',
      [body.licenseTypeId]
    );
    
    if (licenseTypeRows.length === 0) {
      return NextResponse.json({ error: 'License type not found' }, { status: 404 });
    }
    
    // Prepare additional data for notes field
    const additionalData = {
      issuing_authority: body.issuingAuthority || '',
      document_url: body.documentUrl || ''
    };
    
    // Insert the new license
    const { rows } = await query(
      `INSERT INTO licenses (
        employee_id, 
        license_type_id,
        name,
        license_number, 
        description, 
        issue_date, 
        expiry_date,
        status,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        body.employeeId,
        body.licenseTypeId,
        body.name,
        body.licenseNumber || '',
        body.description || '',
        new Date(body.issueDate),
        new Date(body.expiryDate),
        'Valid',
        JSON.stringify(additionalData)
      ]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create license' }, { status: 500 });
    }
    
    // Return the newly created license
    const newLicense = rows[0];
    
    return NextResponse.json({
      id: newLicense.id,
      employeeId: newLicense.employee_id,
      licenseTypeId: newLicense.license_type_id,
      name: newLicense.name,
      licenseNumber: newLicense.license_number,
      description: newLicense.description,
      issueDate: newLicense.issue_date,
      expiryDate: newLicense.expiry_date,
      status: newLicense.status,
      documentUrl: additionalData.document_url,
      issuingAuthority: additionalData.issuing_authority,
      message: 'License created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: 'Failed to create license', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
