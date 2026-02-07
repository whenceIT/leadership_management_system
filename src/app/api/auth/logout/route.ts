import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';
import { createLogoutResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Delete session server-side
    await deleteSession(request);

    // Create logout response with cookie deletion
    return createLogoutResponse();
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
