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
    const documents = await db.documents.getByEmployeeId(id);
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const documentData = await request.json();
    
    // Basic validation
    if (!documentData.name || !documentData.type || !documentData.file_url) {
      return NextResponse.json(
        { error: 'Name, type, and file URL are required' },
        { status: 400 }
      );
    }

    const newDocument = await db.documents.create({
      ...documentData,
      employee_id: id,
    });
    
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
