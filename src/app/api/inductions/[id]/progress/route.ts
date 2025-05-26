import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    // Get current authenticated user
    const user = await currentUser();
    
    // Check authentication
    if (!user || !user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
    // Get induction ID from params
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: 'Induction ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { progress, status, notes } = body;
    
    // Validate progress
    if (progress === undefined || progress < 0 || progress > 100) {
      return NextResponse.json(
        { message: 'Valid progress value (0-100) is required' },
        { status: 400 }
      );
    }
    
    // Validate status
    if (!['scheduled', 'in-progress', 'completed', 'overdue'].includes(status)) {
      return NextResponse.json(
        { message: 'Valid status is required' },
        { status: 400 }
      );
    }
    
    // Map UI status to DB status
    const statusMap: Record<string, string> = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'scheduled': 'Pending',
      'overdue': 'Expired'
    };
    
    // Get current date for completed_date if status is completed
    const completedDate = status === 'completed' ? new Date() : undefined;
    
    // Update induction in database
    const { rows: [updatedInduction] } = await db.query(
      `UPDATE inductions 
       SET status = $1, 
           ${completedDate ? 'completed_date = $2,' : ''} 
           ${notes ? `${completedDate ? 'notes = $3' : 'notes = $2'}` : ''} 
       WHERE id = $${notes ? (completedDate ? '4' : '3') : (completedDate ? '3' : '2')} 
       RETURNING *`,
      [
        statusMap[status],
        ...(completedDate ? [completedDate] : []),
        ...(notes ? [notes] : []),
        id
      ]
    );
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Induction progress updated successfully',
      induction: updatedInduction
    });
  } catch (error) {
    console.error('Error updating induction progress:', error);
    return NextResponse.json(
      { message: 'Failed to update induction progress' },
      { status: 500 }
    );
  }
}
