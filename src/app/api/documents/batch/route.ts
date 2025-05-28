import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

export async function POST(request: Request) {
  try {
    const { action, documentIds, targetFolderId } = await request.json();
    
    if (!action || !documentIds || !Array.isArray(documentIds)) {
      return NextResponse.json(
        { error: 'Action and documentIds array are required' },
        { status: 400 }
      );
    }

    let result;
    
    switch (action) {
      case 'delete':
        result = await db.documentFiles.batchDelete(documentIds);
        return NextResponse.json({ 
          message: `${result} documents deleted successfully`,
          deletedCount: result 
        });
        
      case 'move':
        if (!targetFolderId) {
          return NextResponse.json(
            { error: 'Target folder ID is required for move operation' },
            { status: 400 }
          );
        }
        
        // Validate target folder exists
        const targetFolder = await db.folders.getById(targetFolderId);
        if (!targetFolder) {
          return NextResponse.json(
            { error: 'Target folder not found' },
            { status: 400 }
          );
        }
        
        result = await db.documentFiles.batchMove(documentIds, targetFolderId);
        return NextResponse.json({ 
          message: `${result} documents moved successfully`,
          movedCount: result 
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: delete, move' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing batch operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch operation' },
      { status: 500 }
    );
  }
}
