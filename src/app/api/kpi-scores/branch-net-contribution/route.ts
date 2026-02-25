import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/kpi-scores/branch-net-contribution
 * Calculate Branch Net Contribution KPI score
 * Returns: KPI score information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, positionId } = body;

    // Call external API to get Branch Net Contribution score
    const response = await fetch(
      'https://smartbackend.whencefinancesystem.com/api/kpi-scores/branch-net-contribution',
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
        { error: data.message || 'Failed to calculate Branch Net Contribution score' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calculating Branch Net Contribution score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
