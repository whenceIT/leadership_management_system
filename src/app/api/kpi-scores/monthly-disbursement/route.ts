import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/kpi-scores/monthly-disbursement
 * Calculate Monthly Disbursement KPI score
 * Returns: KPI score information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, positionId } = body;

    // Call external API to get Monthly Disbursement score
    const response = await fetch(
      'https://smartbackend.whencefinancesystem.com/api/kpi-scores/monthly-disbursement',
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
        { error: data.message || 'Failed to calculate Monthly Disbursement score' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calculating Monthly Disbursement score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
