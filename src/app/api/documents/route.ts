import { db } from '@/lib/db/neon-operations';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');
    
    let documents;
    
    if (search) {
      // Search documents
      documents = await db.documentFiles.search(search, folderId && folderId !== 'root' ? folderId : undefined);
    } else if (folderId && folderId !== 'root') {
      // Get documents by specific folder (only if it's a valid UUID)
      documents = await db.documentFiles.getByFolderId(folderId);
    } else {
      // Get all documents (for root folder or no folder specified)
      documents = await db.documentFiles.getAll();
    }
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const documentData = await request.json();
    
    // Basic validation
    if (!documentData.folder_id || !documentData.name || !documentData.file_url) {
      return NextResponse.json(
        { error: 'Folder ID, name, and file URL are required' },
        { status: 400 }
      );
    }

    // Validate that folder exists
    const folder = await db.folders.getById(documentData.folder_id);
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 400 }
      );
    }

    const newDocument = await db.documentFiles.create(documentData);
    
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
