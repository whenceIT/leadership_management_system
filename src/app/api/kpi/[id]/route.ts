import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/kpi/[id]
 * Update an existing KPI
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.position_id && body.position_id !== 0) {
      return NextResponse.json(
        { error: 'position_id is required' },
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
    const response = await fetch(`https://smartbackend.whencefinancesystem.com/kpi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to update KPI' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'KPI updated successfully',
      kpiId: id,
      kpi: {
        ...payload,
        id: id,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating KPI:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
