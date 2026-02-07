import { NextRequest, NextResponse } from 'next/server';
import { createSession, createSessionResponse, getSessionById, deleteSession, getUserById } from '@/lib/auth';

const API_BASE_URL = 'https://smartbackend.whencefinancesystem.com';

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

    // Call external API for authentication
    const apiResponse = await fetch(`${API_BASE_URL}/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Authentication failed' 
        },
        { status: apiResponse.status }
      );
    }

    const user = await apiResponse.json();

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

    // Create session server-side
    const sessionId = await createSession(user.id, {
      office_id: user.office_id,
      role: user.role,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
    });

    // Return success response with session cookie
    return createSessionResponse(
      sessionId,
      {
        success: true,
        message: 'Login successful',
        user: user,
      },
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Please check your internet connection and try again.' },
      { status: 500 }
    );
  }
}
