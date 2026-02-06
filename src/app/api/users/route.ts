import { NextRequest, NextResponse } from 'next/server';

// Mock data for users
const mockUsers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Admin',
    email: 'john@example.com',
    phone: '+260 97 1234567',
    office_name: 'Head Office',
    status: 'Active',
    last_login: '2024-02-05T10:30:00Z',
  },
  {
    id: 2,
    first_name: 'Sarah',
    last_name: 'Manager',
    email: 'sarah@example.com',
    phone: '+260 97 2345678',
    office_name: 'Head Office',
    status: 'Active',
    last_login: '2024-02-05T09:15:00Z',
  },
  {
    id: 3,
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike@example.com',
    phone: '+260 97 3456789',
    office_name: 'Branch Office - Lusaka',
    status: 'Active',
    last_login: '2024-02-04T14:20:00Z',
  },
  {
    id: 4,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily@example.com',
    phone: '+260 97 4567890',
    office_name: 'Branch Office - Kitwe',
    status: 'Active',
    last_login: '2024-02-05T08:45:00Z',
  },
  {
    id: 5,
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david@example.com',
    phone: '+260 97 5678901',
    office_name: 'Branch Office - Ndola',
    status: 'Active',
    last_login: '2024-02-03T16:30:00Z',
  },
  {
    id: 6,
    first_name: 'Lisa',
    last_name: 'Brown',
    email: 'lisa@example.com',
    phone: '+260 97 6789012',
    office_name: 'Regional Office - Copperbelt',
    status: 'Active',
    last_login: '2024-02-05T07:00:00Z',
  },
  {
    id: 7,
    first_name: 'James',
    last_name: 'Taylor',
    email: 'james@example.com',
    phone: '+260 97 7890123',
    office_name: 'Head Office',
    status: 'Active',
    last_login: '2024-02-02T11:00:00Z',
  },
  {
    id: 8,
    first_name: 'Jennifer',
    last_name: 'Anderson',
    email: 'jennifer@example.com',
    phone: '+260 97 8901234',
    office_name: 'Branch Office - Lusaka',
    status: 'Inactive',
    last_login: '2024-01-15T09:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const officeId = searchParams.get('officeId') || '';

    let filteredUsers = mockUsers.filter(u => u.status === 'Active');
    
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
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
