import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/kpi-scores/month1-default-rate
 * Calculate Month-1 Default Rate KPI score
 * Returns: KPI score information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, positionId } = body;

    // Call external API to get Month-1 Default Rate score
    const response = await fetch(
      'https://smartbackend.whencefinancesystem.com/api/kpi-scores/month1-default-rate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          position_id: positionId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to calculate Month-1 Default Rate score' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calculating Month-1 Default Rate score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
