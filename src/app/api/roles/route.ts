import { NextRequest, NextResponse } from 'next/server';

// Mock data for roles
const mockRoles: {
  id: number;
  name: string;
  slug: string;
  time_limit: number;
  from_time: string | null;
  to_time: string | null;
  access_days: string | null;
  permissions: string | null;
  user_count: number;
  created_at: string;
  updated_at: string;
}[] = [
  {
    id: 1,
    name: 'Administrator',
    slug: 'administrator',
    time_limit: 0,
    from_time: null,
    to_time: null,
    access_days: null,
    permissions: JSON.stringify(['users.view', 'users.create', 'users.edit', 'users.delete', 'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'permissions.view', 'settings.view', 'settings.edit']),
    user_count: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Manager',
    slug: 'manager',
    time_limit: 0,
    from_time: null,
    to_time: null,
    access_days: null,
    permissions: JSON.stringify(['users.view', 'roles.view', 'reports.view']),
    user_count: 3,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Employee',
    slug: 'employee',
    time_limit: 0,
    from_time: null,
    to_time: null,
    access_days: null,
    permissions: JSON.stringify(['profile.view', 'profile.edit']),
    user_count: 10,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    let filteredRoles = mockRoles;
    
    if (search) {
      filteredRoles = mockRoles.filter(role => 
        role.name.toLowerCase().includes(search.toLowerCase()) ||
        role.slug.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredRoles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedRoles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, time_limit, from_time, to_time, access_days, permissions } = body;

    const newRole = {
      id: mockRoles.length + 1,
      name,
      slug,
      time_limit: time_limit ? 1 : 0,
      from_time: from_time || null,
      to_time: to_time || null,
      access_days: access_days ? JSON.stringify(access_days) : null,
      permissions: permissions ? JSON.stringify(permissions) : null,
      user_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockRoles.push(newRole);

    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      data: newRole,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create role' },
      { status: 500 }
    );
  }
}
