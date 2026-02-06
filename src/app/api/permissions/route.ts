import { NextRequest, NextResponse } from 'next/server';

// Mock data for permissions
const mockPermissions = [
  { id: 1, name: 'View Users', slug: 'users.view', description: 'View user list and details' },
  { id: 2, name: 'Create Users', slug: 'users.create', description: 'Create new users' },
  { id: 3, name: 'Edit Users', slug: 'users.edit', description: 'Edit user details' },
  { id: 4, name: 'Delete Users', slug: 'users.delete', description: 'Delete users' },
  { id: 5, name: 'View Roles', slug: 'roles.view', description: 'View roles list and details' },
  { id: 6, name: 'Create Roles', slug: 'roles.create', description: 'Create new roles' },
  { id: 7, name: 'Edit Roles', slug: 'roles.edit', description: 'Edit role details' },
  { id: 8, name: 'Delete Roles', slug: 'roles.delete', description: 'Delete roles' },
  { id: 9, name: 'View Permissions', slug: 'permissions.view', description: 'View permissions list' },
  { id: 10, name: 'Manage Permissions', slug: 'permissions.manage', description: 'Assign permissions to roles' },
  { id: 11, name: 'View Settings', slug: 'settings.view', description: 'View system settings' },
  { id: 12, name: 'Edit Settings', slug: 'settings.edit', description: 'Edit system settings' },
  { id: 13, name: 'View Reports', slug: 'reports.view', description: 'View reports and analytics' },
  { id: 14, name: 'Export Reports', slug: 'reports.export', description: 'Export reports' },
  { id: 15, name: 'View Profile', slug: 'profile.view', description: 'View own profile' },
  { id: 16, name: 'Edit Profile', slug: 'profile.edit', description: 'Edit own profile' },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockPermissions,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
