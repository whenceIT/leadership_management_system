import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://smart.whencefinancesystem.com';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    
    // Proxy request to external API
    const response = await fetch(`${API_BASE_URL}/user-tiers/${userId}`);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch user tier data'
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user tier data'
    }, { status: 500 });
  }
}
