import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserById } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get full user data from database
    const user = await getUserById(session.userId) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
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
