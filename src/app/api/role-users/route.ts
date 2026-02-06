import { NextRequest, NextResponse } from 'next/server';

// Mock data for role-user assignments
const mockRoleUsers = [
  {
    id: 1,
    user_id: 1,
    role_id: 1,
    first_name: 'John',
    last_name: 'Admin',
    email: 'john@example.com',
    role_name: 'Administrator',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    user_id: 2,
    role_id: 1,
    first_name: 'Sarah',
    last_name: 'Manager',
    email: 'sarah@example.com',
    role_name: 'Administrator',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    user_id: 3,
    role_id: 2,
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike@example.com',
    role_name: 'Manager',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 4,
    user_id: 4,
    role_id: 2,
    first_name: 'Emily',
    last_name: 'Davis',
    email: 'emily@example.com',
    role_name: 'Manager',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 5,
    user_id: 5,
    role_id: 2,
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david@example.com',
    role_name: 'Manager',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    let filteredRoleUsers = mockRoleUsers;
    
    if (search) {
      filteredRoleUsers = mockRoleUsers.filter(ru => 
        ru.first_name.toLowerCase().includes(search.toLowerCase()) ||
        ru.last_name.toLowerCase().includes(search.toLowerCase()) ||
        ru.email.toLowerCase().includes(search.toLowerCase()) ||
        ru.role_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredRoleUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRoleUsers = filteredRoleUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedRoleUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching role-users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch role-user assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, role_id } = body;

    const roleNames: Record<number, string> = {
      1: 'Administrator',
      2: 'Manager',
      3: 'Employee',
    };

    const newRoleUser = {
      id: mockRoleUsers.length + 1,
      user_id,
      role_id,
      first_name: 'New',
      last_name: 'User',
      email: 'newuser@example.com',
      role_name: roleNames[role_id] || 'Unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockRoleUsers.push(newRoleUser);

    return NextResponse.json({
      success: true,
      message: 'Role assigned successfully',
      data: newRoleUser,
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to assign role' },
      { status: 500 }
    );
  }
}
