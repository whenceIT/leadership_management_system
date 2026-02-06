import { NextRequest, NextResponse } from 'next/server';

// Mock data for roles
const mockRoles = [
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    
    const role = mockRoles.find(r => r.id === roleId);
    
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    const body = await request.json();
    
    const roleIndex = mockRoles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    const updatedRole = {
      ...mockRoles[roleIndex],
      ...body,
      id: roleId,
      updated_at: new Date().toISOString(),
    };

    // Handle permissions array
    if (body.permissions && Array.isArray(body.permissions)) {
      updatedRole.permissions = JSON.stringify(body.permissions);
    }

    mockRoles[roleIndex] = updatedRole;

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roleId = parseInt(id);
    
    const roleIndex = mockRoles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      );
    }

    mockRoles.splice(roleIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
