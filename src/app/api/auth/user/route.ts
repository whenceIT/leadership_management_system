import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://smartbackend.whencefinancesystem.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Call external API to get user data
    const apiResponse = await fetch(`${API_BASE_URL}/get-user/${encodeURIComponent(email)}`);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || 'Failed to fetch user data' 
        },
        { status: apiResponse.status }
      );
    }

    const user = await apiResponse.json();

    return NextResponse.json(
      {
        success: true,
        user: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
