import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/kpi-scores/lcs-at-k50k-tier
 * Calculate LCs at K50K+ Tier KPI score
 * Returns: KPI score information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, positionId } = body;

    // Call external API to get LCs at K50K+ Tier score
    const response = await fetch(
      'https://smartbackend.whencefinancesystem.com/api/kpi-scores/lcs-at-k50k-tier',
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
        { error: data.message || 'Failed to calculate LCs at K50K+ Tier score' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calculating LCs at K50K+ Tier score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
