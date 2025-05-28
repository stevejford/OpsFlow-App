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
    const document = await db.documentFiles.getById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const updates = await request.json();
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;
    delete updates.upload_date;
    
    const updatedDocument = await db.documentFiles.update(id, updates);
    
    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // Check if document exists
    const document = await db.documentFiles.getById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const deleted = await db.documentFiles.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
