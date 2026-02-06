import { NextRequest, NextResponse } from 'next/server';

// Mock data for inactive users
const mockInactiveUsers = [
  {
    id: 8,
    first_name: 'Jennifer',
    last_name: 'Anderson',
    email: 'jennifer@example.com',
    phone: '+260 97 8901234',
    office_name: 'Branch Office - Lusaka',
    status: 'Inactive',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 9,
    first_name: 'Thomas',
    last_name: 'White',
    email: 'thomas@example.com',
    phone: '+260 97 9012345',
    office_name: 'Head Office',
    status: 'Inactive',
    created_at: '2024-01-10T14:30:00Z',
  },
  {
    id: 10,
    first_name: 'Amanda',
    last_name: 'Black',
    email: 'amanda@example.com',
    phone: '+260 97 0123456',
    office_name: 'Branch Office - Kitwe',
    status: 'Inactive',
    created_at: '2024-01-05T11:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const officeId = searchParams.get('officeId') || '';

    let filteredUsers = [...mockInactiveUsers];
    
    if (search) {
      filteredUsers = filteredUsers.filter(u => 
        u.first_name.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (officeId) {
      const offices = [
        { id: 1, name: 'Head Office' },
        { id: 2, name: 'Branch Office - Lusaka' },
        { id: 3, name: 'Branch Office - Kitwe' },
        { id: 4, name: 'Branch Office - Ndola' },
        { id: 5, name: 'Regional Office - Copperbelt' },
      ];
      const office = offices.find(o => o.id === parseInt(officeId));
      if (office) {
        filteredUsers = filteredUsers.filter(u => u.office_name === office.name);
      }
    }

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inactive users' },
      { status: 500 }
    );
  }
}
