import { NextRequest, NextResponse } from 'next/server';

// Mock data for client users
const mockClientUsers = [
  {
    id: 1,
    client_id: 101,
    account_no: 'ACC001',
    client_first_name: 'Robert',
    client_last_name: 'Chanda',
    client_full_name: null,
    client_type: 'individual',
    client_status: 'active',
    office_name: 'Head Office',
    user_id: 1,
    user_email: 'john@example.com',
    user_first_name: 'John',
    user_last_name: 'Admin',
    user_status: 'Active',
    linked_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    client_id: 102,
    account_no: 'ACC002',
    client_first_name: 'Grace',
    client_last_name: 'Mwansa',
    client_full_name: null,
    client_type: 'business',
    client_status: 'active',
    office_name: 'Branch Office - Lusaka',
    user_id: 2,
    user_email: 'sarah@example.com',
    user_first_name: 'Sarah',
    user_last_name: 'Manager',
    user_status: 'Active',
    linked_at: '2024-01-16T11:30:00Z',
  },
  {
    id: 3,
    client_id: 103,
    account_no: 'ACC003',
    client_first_name: null,
    client_last_name: null,
    client_full_name: 'Tech Solutions Ltd',
    client_type: 'business',
    client_status: 'pending',
    office_name: 'Branch Office - Kitwe',
    user_id: null,
    user_email: null,
    user_first_name: null,
    user_last_name: null,
    user_status: null,
    linked_at: '2024-01-17T14:00:00Z',
  },
  {
    id: 4,
    client_id: 104,
    account_no: 'ACC004',
    client_first_name: 'Mary',
    client_last_name: 'Phiri',
    client_full_name: null,
    client_type: 'individual',
    client_status: 'active',
    office_name: 'Branch Office - Ndola',
    user_id: 3,
    user_email: 'mike@example.com',
    user_first_name: 'Mike',
    user_last_name: 'Johnson',
    user_status: 'Active',
    linked_at: '2024-01-18T09:15:00Z',
  },
  {
    id: 5,
    client_id: 105,
    account_no: 'ACC005',
    client_first_name: null,
    client_last_name: null,
    client_full_name: 'Hope Foundation',
    client_type: 'ngo',
    client_status: 'active',
    office_name: 'Regional Office - Copperbelt',
    user_id: 4,
    user_email: 'emily@example.com',
    user_first_name: 'Emily',
    user_last_name: 'Davis',
    user_status: 'Active',
    linked_at: '2024-01-19T16:45:00Z',
  },
  {
    id: 6,
    client_id: 106,
    account_no: 'ACC006',
    client_first_name: 'Peter',
    client_last_name: 'Soko',
    client_full_name: null,
    client_type: 'individual',
    client_status: 'inactive',
    office_name: 'Head Office',
    user_id: 5,
    user_email: 'david@example.com',
    user_first_name: 'David',
    user_last_name: 'Wilson',
    user_status: 'Active',
    linked_at: '2024-01-20T08:30:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const clientType = searchParams.get('clientType') || '';
    const status = searchParams.get('status') || '';

    let filteredClientUsers = [...mockClientUsers];
    
    if (search) {
      filteredClientUsers = filteredClientUsers.filter(cu => 
        cu.client_first_name?.toLowerCase().includes(search.toLowerCase()) ||
        cu.client_last_name?.toLowerCase().includes(search.toLowerCase()) ||
        cu.client_full_name?.toLowerCase().includes(search.toLowerCase()) ||
        cu.account_no?.toLowerCase().includes(search.toLowerCase()) ||
        cu.user_email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (clientType) {
      filteredClientUsers = filteredClientUsers.filter(cu => cu.client_type === clientType);
    }

    if (status) {
      filteredClientUsers = filteredClientUsers.filter(cu => cu.client_status === status);
    }

    const total = filteredClientUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedClientUsers = filteredClientUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedClientUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching client users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch client users' },
      { status: 500 }
    );
  }
}
