import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

export async function GET() {
  try {
    const folders = await db.folders.getAll();
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const folderData = await request.json();
    
    // Basic validation
    if (!folderData.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Map client data to database format
    const dbFolderData = {
      name: folderData.name,
      description: folderData.description || '',
      parent_id: folderData.parentId === 'root' ? null : folderData.parentId,
      path: folderData.parentId === 'root' ? `/${folderData.name}` : `/${folderData.name}`, // Will be updated with proper path logic
      created_at: new Date(),
      updated_at: new Date()
    };

    // Validate that parent exists if specified (only check if it's a valid UUID)
    if (dbFolderData.parent_id && isValidUUID(dbFolderData.parent_id)) {
      const parentFolder = await db.folders.getById(dbFolderData.parent_id);
      if (!parentFolder) {
        return NextResponse.json(
          { error: 'Parent folder not found' },
          { status: 400 }
        );
      }
      // Update path to include parent path
      dbFolderData.path = `${parentFolder.path}/${folderData.name}`;
    }

    const newFolder = await db.folders.create(dbFolderData);
    
    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

// Helper function to validate UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
