import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test without any imports
    return NextResponse.json({ 
      success: true, 
      message: 'API route working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'API route failed' },
      { status: 500 }
    );
  }
}
