import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://smart.whencefinancesystem.com';

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    // Proxy request to external API
    const response = await fetch(`${API_BASE_URL}/user-tiers/${userId}/portfolio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update portfolio value'
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error updating portfolio value:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update portfolio value'
    }, { status: 500 });
  }
}