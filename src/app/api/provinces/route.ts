import { NextRequest, NextResponse } from 'next/server';

// Province data from the user's database table
const PROVINCES = [
  { id: 1, name: 'LUSAKA' },
  { id: 2, name: 'COPPERBELT' },
  { id: 3, name: 'EASTERN' },
  { id: 4, name: 'CENTRAL' },
  { id: 5, name: 'MUCHINGA' },
  { id: 6, name: 'NORTHERN' },
  { id: 7, name: 'NORTH WESTERN' },
  { id: 8, name: 'WESTERN' },
  { id: 9, name: 'SOUTHERN' },
  { id: 10, name: 'LUAPULA' }
];

export async function GET(request: NextRequest) {
  try {
    // Extract search query from URL parameters
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    
    let filteredProvinces = PROVINCES;
    
    if (searchQuery) {
      filteredProvinces = PROVINCES.filter(province => 
        province.name.toLowerCase().includes(searchQuery)
      );
    }
    
    // Extract sort parameter (default: id)
    const sortBy = searchParams.get('sort') || 'id';
    
    if (sortBy === 'name') {
      filteredProvinces.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return NextResponse.json(filteredProvinces);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}

// Optional: Add POST method if needed in the future
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Province creation request:', body);
    
    return NextResponse.json(
      { message: 'Province creation endpoint not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating province:', error);
    return NextResponse.json(
      { error: 'Failed to create province' },
      { status: 500 }
    );
  }
}
