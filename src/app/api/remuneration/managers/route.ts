import { NextRequest, NextResponse } from 'next/server';

import { createBackendAssignment } from '@/lib/remuneration/backend';
import { buildRegistry, fetchApiManagers, mapApiManager } from '@/lib/remuneration/registry';
import {
  loadServiceAssignments,
  loadServiceStructure,
  resolveServiceConfig,
} from '@/lib/remuneration/payroll';
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

    const apiManagers = await fetchApiManagers();
    const apiProfiles = apiManagers.map(mapApiManager);

    for (const profile of apiProfiles) {
      await adapter.saveProfile(profile);
    }

    const registered = await adapter.listProfiles();
    const [snapshot, structure, serviceAssignments] = await Promise.all([
      buildRegistry(registered),
      loadServiceStructure(),
      loadServiceAssignments(),
    ]);

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

    const assignments = Array.from(serviceAssignments.values()).map((entry) => ({
      userId: entry.assignment.user_id,
      assignmentId: entry.assignment.id,
      approvalStatus: entry.assignment.approval_status,
      actingCapacity: entry.assignment.acting_capacity === 1,
      effectiveFrom: entry.assignment.effective_from,
      effectiveTo: entry.assignment.effective_to,
      positionId: entry.assignment.job_position_id,
      positionName: entry.assignment.position_name,
      configId: entry.assignment.remuneration_config_id,
      tier: entry.tier?.tier_number ?? null,
      tierName: entry.tier?.name ?? null,
      grossPay: entry.config?.gross_pay ?? null,
      notes: entry.assignment.notes,
    }));

    return NextResponse.json({
      success: true,
      data: {
        managers: profiles,
        offices: snapshot.offices,
        districts: snapshot.districts,
        service: {
          connected: structure.connected,
          error: structure.error,
          assignments,
          counts: {
            total: assignments.length,
            approved: assignments.filter((a) => a.approvalStatus === 'approved')
              .length,
            pending: assignments.filter((a) => a.approvalStatus === 'pending')
              .length,
          },
        },
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
      jobPosition: role.name,
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

    /* Mirror the assignment into the remuneration service so the payroll run
     * picks it up. The service assignment carries the employee, the managerial
     * position and the salary package. */
    let serviceAssignmentId: number | null = null;
    if (profile.userId !== null) {
      const structure = await loadServiceStructure();
      const assignments = await loadServiceAssignments(structure);
      const current = assignments.get(profile.userId);

      if (current) {
        serviceAssignmentId = current.assignment.id;
      } else {
        const positionId = role.positionIds[0];
        const config = resolveServiceConfig(
          structure,
          positionId,
          profile.previousTier
        );
        if (config) {
          const created = await createBackendAssignment({
            user_id: profile.userId,
            job_position_id: positionId,
            remuneration_config_id: config.id,
            acting_capacity: profile.acting,
            effective_from:
              profile.effectiveFrom ?? profile.appointmentDate ?? '2026-01-01',
            effective_to: profile.effectiveTo,
            approval_status: 'pending',
            notes: `${profile.fullName} — ${role.name} (${scope.officeName ?? scope.districtName ?? scope.provinceName ?? 'no scope'}).`,
          });
          if (created.ok && created.data) {
            serviceAssignmentId = created.data.id;
            await adapter.saveAudit({
              id: makeId('aud'),
              statementId: null,
              managerId: profile.id,
              action: 'manager.service_assigned',
              actor: 'Administrator',
              detail: `Remuneration service assignment ${created.data.id} created for ${profile.fullName} on configuration ${config.id}.`,
              at: now,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...profile, serviceAssignmentId },
    });
  } catch (error) {
    console.error('Error registering remuneration manager:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to register the manager assignment.' },
      { status: 500 }
    );
  }
}
