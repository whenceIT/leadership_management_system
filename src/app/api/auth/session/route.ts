import { NextRequest, NextResponse } from 'next/server';
import { resolveSession, getSessionById, deleteSession, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Session Resolver: Reads cookie, fetches session, returns null if invalid
    const session = await resolveSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    // Get full user data from database
    const user = await getUserById(session.user_id) as any;

    if (!user) {
      // User not found, clear session
      await deleteSession(request);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is blocked
    if (user && 'blocked' in user && user.blocked) {
      await deleteSession(request);
      return NextResponse.json(
        { success: false, message: 'User account is blocked' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        session: {
          user_id: session.user_id,
          office_id: session.office_id,
          role: session.role,
          email: session.email,
          name: `${session.first_name} ${session.last_name}`,
          status: session.status,
          expires_at: session.expires_at,
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
