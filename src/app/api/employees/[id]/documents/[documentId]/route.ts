import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

interface Params {
  params: {
    id: string;
    documentId: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, documentId } = params;
    
    // Get all documents for the employee
    const documents = await db.documents.getByEmployeeId(id);
    
    // Find the specific document
    const document = documents.find(doc => doc.id === documentId);
    
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
    const { id, documentId } = params;
    const updates = await request.json();
    
    // Basic validation
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Verify the document belongs to the employee
    const documents = await db.documents.getByEmployeeId(id);
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found for this employee' },
        { status: 404 }
      );
    }

    // Update the document
    const updatedDocument = await db.documents.update(documentId, updates);
    
    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
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
    const { id, documentId } = params;
    
    // Verify the document belongs to the employee
    const documents = await db.documents.getByEmployeeId(id);
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found for this employee' },
        { status: 404 }
      );
    }
    
    // Delete the document
    const success = await db.documents.delete(documentId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
