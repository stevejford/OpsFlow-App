import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from '@vercel/postgres';
import { UTApi } from 'uploadthing/server';

// Initialize the UploadThing API
const utapi = new UTApi();

interface RouteParams {
  params: {
    licenseId: string;
  };
}

// POST to renew a license
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { licenseId } = params;
    
    // Parse the form data
    const formData = await request.formData();
    const expiryDate = formData.get('expiryDate') as string;
    const document = formData.get('document') as File | null;
    
    // Validate required fields
    if (!expiryDate) {
      return NextResponse.json(
        { error: 'Missing required field: expiryDate' },
        { status: 400 }
      );
    }
    
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
    
    // Handle document upload if provided
    let documentUrl;
    if (document) {
      try {
        // Convert File to Buffer for uploadthing
        const arrayBuffer = await document.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Upload the document
        const uploadResult = await utapi.uploadFiles({
          files: [buffer],
          metadata: {
            licenseId,
            uploadedAt: new Date().toISOString(),
            type: 'license-renewal'
          },
          fileTypes: ['image/*', 'application/pdf']
        });
        
        if (uploadResult[0].data) {
          documentUrl = uploadResult[0].data.url;
        }
      } catch (uploadError) {
        console.error('Error uploading document:', uploadError);
        // Continue with renewal even if upload fails
      }
    }
    
    // Build the update query
    let updateQuery = 'UPDATE licenses SET expiry_date = $1';
    const queryParams: any[] = [expiryDate];
    
    // Add document URL to update if available
    if (documentUrl) {
      updateQuery += ', document_url = $2';
      queryParams.push(documentUrl);
    }
    
    // Complete the query
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
    const expiryDateObj = new Date(license.expiry_date);
    const today = new Date();
    const diffTime = expiryDateObj.getTime() - today.getTime();
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
    console.error('Error renewing license:', error);
    return NextResponse.json(
      { error: 'Failed to renew license', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
