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
    const folder = await db.folders.getById(id);
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
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
    
    const updatedFolder = await db.folders.update(id, updates);
    
    if (!updatedFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    // Check if folder exists
    const folder = await db.folders.getById(id);
    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }
    
    const deleted = await db.folders.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
