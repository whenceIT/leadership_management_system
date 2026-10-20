import { NextRequest, NextResponse } from 'next/server';

import { buildRegistry } from '@/lib/remuneration/registry';
import { getAdapter, makeId } from '@/lib/remuneration/store';
import { ROLES_BY_ID } from '@/lib/remuneration/structure';
import type { ManagerProfile, ManagerScope } from '@/lib/remuneration/types';

/**
 * GET /api/remuneration/managers
 *
 * Query parameters:
 *  - role     filter by remuneration role id
 *  - search   filter by manager name, email or office
 *  - scope    `registered` returns only administrator maintained assignments
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const search = (searchParams.get('search') ?? '').trim().toLowerCase();
    const scopeFilter = searchParams.get('scope');

    const adapter = await getAdapter();
    const registered = await adapter.listProfiles();
    const snapshot = await buildRegistry(registered);

    let profiles = snapshot.profiles;

    if (roleFilter) profiles = profiles.filter((p) => p.roleId === roleFilter);
    if (scopeFilter === 'registered') {
      profiles = profiles.filter((p) => p.source === 'registered');
    }
    if (search) {
      profiles = profiles.filter((profile) => {
        const haystack = [
          profile.fullName,
          profile.email ?? '',
          profile.roleName,
          profile.scope.officeName ?? '',
          profile.scope.districtName ?? '',
          profile.scope.provinceName ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        managers: profiles,
        offices: snapshot.offices,
        districts: snapshot.districts,
        counts: {
          total: profiles.length,
          registered: profiles.filter((p) => p.source === 'registered').length,
          acting: profiles.filter((p) => p.acting).length,
        },
      },
    });
  } catch (error) {
    console.error('Error loading remuneration managers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the manager registry.' },
      { status: 500 }
    );
  }
}

interface ManagerPayload {
  userId?: number | null;
  fullName?: string;
  email?: string | null;
  roleId?: string;
  scope?: Partial<ManagerScope>;
  appointmentDate?: string | null;
  acting?: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  status?: 'active' | 'inactive';
  previousTier?: number | null;
  id?: string;
}

/**
 * POST /api/remuneration/managers
 *
 * Registers a managerial assignment: the manager, the managerial position, the
 * province / district / branch scope, the appointment date, acting status and
 * the effective remuneration period.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ManagerPayload;

    if (!body.fullName?.trim()) {
      return NextResponse.json(
        { success: false, message: 'The manager name is required.' },
        { status: 400 }
      );
    }
    if (!body.roleId || !ROLES_BY_ID[body.roleId]) {
      return NextResponse.json(
        { success: false, message: 'Select a valid managerial position.' },
        { status: 400 }
      );
    }

    const role = ROLES_BY_ID[body.roleId];
    const adapter = await getAdapter();
    const profiles = await adapter.listProfiles();
    const existing =
      (body.id ? profiles.find((p) => p.id === body.id) : undefined) ??
      (body.userId ? profiles.find((p) => p.userId === body.userId) : undefined);

    const now = new Date().toISOString();
    const scope: ManagerScope = {
      ...(existing?.scope ?? {
        officeId: null,
        officeName: null,
        districtId: null,
        districtName: null,
        provinceId: null,
        provinceName: null,
        department: null,
        branchCount: 0,
      }),
      ...(body.scope ?? {}),
    };

    const profile: ManagerProfile = {
      id: existing?.id ?? makeId('mgr'),
      userId: body.userId ?? existing?.userId ?? null,
      fullName: body.fullName.trim(),
      email: body.email ?? existing?.email ?? null,
      roleId: role.id,
      roleName: role.name,
      scope,
      appointmentDate: body.appointmentDate ?? existing?.appointmentDate ?? null,
      acting: body.acting ?? existing?.acting ?? false,
      effectiveFrom: body.effectiveFrom ?? existing?.effectiveFrom ?? null,
      effectiveTo: body.effectiveTo ?? existing?.effectiveTo ?? null,
      status: body.status ?? existing?.status ?? 'active',
      source: 'registered',
      previousTier: body.previousTier ?? existing?.previousTier ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await adapter.saveProfile(profile);
    await adapter.saveAudit({
      id: makeId('aud'),
      statementId: null,
      managerId: profile.id,
      action: existing ? 'manager.updated' : 'manager.registered',
      actor: 'Administrator',
      detail: `${profile.fullName} assigned to ${profile.roleName} (${scope.officeName ?? scope.districtName ?? scope.provinceName ?? 'no scope'}).`,
      at: now,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error registering remuneration manager:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register the manager assignment.' },
      { status: 500 }
    );
  }
}
