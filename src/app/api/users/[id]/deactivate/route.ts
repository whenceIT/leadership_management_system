import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    // In a real app, you would update the user status in the database
    console.log(`Deactivating user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
