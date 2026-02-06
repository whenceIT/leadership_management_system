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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignmentId = parseInt(id);
    
    const assignmentIndex = mockRoleUsers.findIndex(ru => ru.id === assignmentId);
    
    if (assignmentIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Role assignment not found' },
        { status: 404 }
      );
    }

    mockRoleUsers.splice(assignmentIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Role assignment removed successfully',
    });
  } catch (error) {
    console.error('Error removing role assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove role assignment' },
      { status: 500 }
    );
  }
}
