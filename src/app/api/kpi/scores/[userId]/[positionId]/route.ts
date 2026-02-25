import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for KPI scores
let kpiScoresCache: {
  [key: string]: {
    data: any[];
    timestamp: number;
  };
} = {};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * GET /api/kpi/scores/[userId]/[positionId]
 * Get KPI scores for a specific user and position
 * Returns: Array of KPI objects with scores and targets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; positionId: string } }
) {
  try {
    const { userId, positionId } = params;
    const cacheKey = `${userId}-${positionId}`;
    const now = Date.now();

    // Check if we have valid cached data
    if (
      kpiScoresCache[cacheKey] &&
      (now - kpiScoresCache[cacheKey].timestamp) < CACHE_DURATION
    ) {
      return NextResponse.json(kpiScoresCache[cacheKey].data);
    }

    // Call the external API for fresh data
    const response = await fetch(
      `https://smartbackend.whencefinancesystem.com/smart-kpi-scores/${userId}/${positionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch KPI scores' },
        { status: response.status }
      );
    }

    // Update cache
    kpiScoresCache[cacheKey] = {
      data: Array.isArray(data) ? data : [],
      timestamp: now,
    };

    return NextResponse.json(kpiScoresCache[cacheKey].data);
  } catch (error) {
    console.error('Error fetching KPI scores:', error);

    // Try to return cached data even if stale on error
    const { userId, positionId } = params;
    const cacheKey = `${userId}-${positionId}`;
    if (kpiScoresCache[cacheKey]) {
      return NextResponse.json(kpiScoresCache[cacheKey].data);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
