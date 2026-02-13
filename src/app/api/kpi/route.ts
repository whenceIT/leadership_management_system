import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/kpi
 * Add a new KPI for a position
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.position_id && body.position_id !== 0) {
      return NextResponse.json(
        { error: 'position_id is required' },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { error: 'KPI name is required' },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    const payload = {
      role: body.role || 1,
      position_id: body.position_id,
      name: body.name,
      description: body.description || '',
      scoring: body.scoring || 'percentage',
      target: body.target || '',
      category: body.category || '',
      weight: body.weight || '0'
    };

    // Call the external API
    const response = await fetch('https://smartbackend.whencefinancesystem.com/kpi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to add KPI' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'KPI added successfully',
      kpiId: data.kpiId || data.id,
      kpi: {
        ...payload,
        id: data.kpiId || data.id,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error adding KPI:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
