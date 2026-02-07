import { NextRequest, NextResponse } from 'next/server';
import { getValidatedSession, getUserById, clearSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get validated session (checks if session is valid and not expired)
    const session = await getValidatedSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    // Get full user data from database
    const user = await getUserById(session.userId) as any;

    if (!user) {
      // User not found, clear session
      await clearSession(request);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is blocked
    if (user && 'blocked' in user && user.blocked) {
      await clearSession(request);
      return NextResponse.json(
        { success: false, message: 'User account is blocked' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        session: {
          userId: session.userId,
          email: session.email,
          name: `${session.first_name} ${session.last_name}`,
          status: session.status,
        },
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          status: user.status,
          phone: user.phone,
          gender: user.gender,
          office_id: user.office_id,
          enable_google2fa: user.enable_google2fa,
          permissions: user.permissions,
          last_login: user.last_login,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
