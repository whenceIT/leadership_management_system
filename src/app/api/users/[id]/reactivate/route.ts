import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // In a real app, you would update the user status in the database
    console.log(`Reactivating user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'User reactivated successfully',
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}
