import { NextResponse } from 'next/server';
import { setupDatabase } from '@/lib/db/init';

export async function POST() {
  try {
    await setupDatabase();
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
