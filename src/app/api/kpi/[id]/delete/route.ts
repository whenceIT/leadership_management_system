import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`https://smartbackend.whencefinancesystem.com/kpi/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ message: 'KPI deleted' });
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to delete KPI' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error deleting KPI:', error);
    return NextResponse.json(
      { error: 'Failed to delete KPI' },
      { status: 500 }
    );
  }
}
