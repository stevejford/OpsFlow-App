import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const inductions = await db.inductions.getByEmployeeId(id);
    return NextResponse.json(inductions);
  } catch (error) {
    console.error('Error fetching inductions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inductions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const inductionData = await request.json();
    
    // Basic validation
    if (!inductionData.company || !inductionData.subject || !inductionData.due_date) {
      return NextResponse.json(
        { error: 'Company name, subject, and due date are required' },
        { status: 400 }
      );
    }

    // Format data for database
    const dbData = {
      employee_id: id,
      name: inductionData.subject, // Use subject as the name
      completed_date: new Date(), // Default to today
      expiry_date: new Date(inductionData.due_date),
      status: 'In Progress' as 'In Progress' | 'Completed' | 'Pending' | 'Expired',
      provider: inductionData.company, // Use company as provider
      notes: JSON.stringify({
        portal_url: inductionData.portal_url,
        username: inductionData.username,
        password: inductionData.password,
        document_url: inductionData.document_url,
        additional_notes: inductionData.notes
      })
    };

    const newInduction = await db.inductions.create(dbData);
    
    return NextResponse.json(newInduction, { status: 201 });
  } catch (error) {
    console.error('Error creating induction:', error);
    return NextResponse.json(
      { error: 'Failed to create induction' },
      { status: 500 }
    );
  }
}
