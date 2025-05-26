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
    const emergencyContacts = await db.emergencyContacts.getByEmployeeId(id);
    return NextResponse.json(emergencyContacts);
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const contactData = await request.json();
    
    // Basic validation
    if (!contactData.name || !contactData.relationship || !contactData.phone) {
      return NextResponse.json(
        { error: 'Name, relationship, and phone are required' },
        { status: 400 }
      );
    }

    // If this is being set as primary, handle it properly
    if (contactData.is_primary) {
      // The database operation will handle unsetting other primary contacts
      contactData.is_primary = true;
    }

    const newContact = await db.emergencyContacts.create({
      ...contactData,
      employee_id: id,
    });
    
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    return NextResponse.json(
      { error: 'Failed to create emergency contact' },
      { status: 500 }
    );
  }
}
