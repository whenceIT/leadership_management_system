import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, comparePassword, setSession, updateLastLogin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(email) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is blocked
    if (user.blocked === 1) {
      return NextResponse.json(
        { success: false, message: 'Account is blocked. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Check if user is inactive
    if (user.status !== 'Active') {
      return NextResponse.json(
        { success: false, message: 'Account is not active. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await updateLastLogin(user.id);

    // Set session cookies
    await setSession(user.id, {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
