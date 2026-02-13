import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for KPIs
let kpiCache: {
  data: any[];
  timestamp: number;
} | null = null;

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * GET /api/kpi/all
 * Get all KPIs with caching for performance
 */
export async function GET(request: NextRequest) {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (kpiCache && (now - kpiCache.timestamp) < CACHE_DURATION) {
      // Return cached data, optionally filtered by position_id
      const searchParams = request.nextUrl.searchParams;
      const positionId = searchParams.get('position_id');
      
      if (positionId) {
        const filteredData = kpiCache.data.filter(kpi => kpi.position_id === parseInt(positionId));
        return NextResponse.json(filteredData);
      }
      
      return NextResponse.json(kpiCache.data);
    }

    // Call the external API for fresh data
    const response = await fetch('https://smartbackend.whencefinancesystem.com/all-kpis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch KPIs' },
        { status: response.status }
      );
    }

    // Update cache
    kpiCache = {
      data: Array.isArray(data) ? data : [],
      timestamp: now,
    };

    // Return data, optionally filtered by position_id
    const searchParams = request.nextUrl.searchParams;
    const positionId = searchParams.get('position_id');
    
    if (positionId) {
      const filteredData = kpiCache.data.filter(kpi => kpi.position_id === parseInt(positionId));
      return NextResponse.json(filteredData);
    }

    return NextResponse.json(kpiCache.data);

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    
    // Try to return cached data even if stale on error
    if (kpiCache) {
      return NextResponse.json(kpiCache.data);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
