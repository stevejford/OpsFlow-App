import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

interface Params {
  params: {
    id: string;
    contactId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, contactId } = params;
    
    // Get all emergency contacts for the employee
    const contacts = await db.emergencyContacts.getByEmployeeId(id);
    
    // Find the specific contact
    const contact = contacts.find(contact => contact.id === contactId);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Emergency contact not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency contact' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id, contactId } = params;
    const updates = await request.json();
    
    // Basic validation
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Verify the contact belongs to the employee
    const contacts = await db.emergencyContacts.getByEmployeeId(id);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Emergency contact not found for this employee' },
        { status: 404 }
      );
    }

    // If this is being set as primary, handle it properly
    if (updates.is_primary === true) {
      // The database operation will handle unsetting other primary contacts
      updates.is_primary = true;
    } else if (updates.is_primary === false && contact.is_primary) {
      // Check if this is the only primary contact
      const primaryContacts = contacts.filter(c => c.is_primary && c.id !== contactId);
      if (primaryContacts.length === 0) {
        return NextResponse.json(
          { error: 'Cannot unset the only primary contact. Set another contact as primary first.' },
          { status: 400 }
        );
      }
    }

    // Update the contact
    const updatedContact = await db.emergencyContacts.update(contactId, updates);
    
    if (!updatedContact) {
      return NextResponse.json(
        { error: 'Failed to update emergency contact' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id, contactId } = params;
    
    // Verify the contact belongs to the employee
    const contacts = await db.emergencyContacts.getByEmployeeId(id);
    const contact = contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Emergency contact not found for this employee' },
        { status: 404 }
      );
    }

    // Don't allow deleting the only primary contact
    if (contact.is_primary) {
      const primaryContacts = contacts.filter(c => c.is_primary && c.id !== contactId);
      if (primaryContacts.length === 0) {
        return NextResponse.json(
          { error: 'Cannot delete the only primary contact. Set another contact as primary first.' },
          { status: 400 }
        );
      }
    }
    
    // Delete the contact
    const success = await db.emergencyContacts.delete(contactId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete emergency contact' },
        { status: 500 }
      );
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete emergency contact' },
      { status: 500 }
    );
  }
}
