import { NextRequest, NextResponse } from 'next/server';

// Mock data for offices
const mockOffices = [
  { id: 1, name: 'Head Office' },
  { id: 2, name: 'Branch Office - Lusaka' },
  { id: 3, name: 'Branch Office - Kitwe' },
  { id: 4, name: 'Branch Office - Ndola' },
  { id: 5, name: 'Regional Office - Copperbelt' },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockOffices,
    });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch offices' },
      { status: 500 }
    );
  }
}
