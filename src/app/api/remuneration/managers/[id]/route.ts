import { NextRequest, NextResponse } from 'next/server';

import { approveBackendAssignment } from '@/lib/remuneration/backend';
import { loadServiceAssignments } from '@/lib/remuneration/payroll';
import { buildRegistry } from '@/lib/remuneration/registry';
import { getAdapter, makeId } from '@/lib/remuneration/store';
import { ROLES_BY_ID } from '@/lib/remuneration/structure';
import type { ManagerProfile, ManagerScope } from '@/lib/remuneration/types';

/**
 * PATCH /api/remuneration/managers/[id]
 *
 * Updates the managerial position, scope, appointment date, acting status,
 * effective remuneration period or the tier earned in the previous period.
 *
 * `approveServiceAssignment: true` approves the manager's assignment in the
 * remuneration service so the payroll run can pick it up.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<ManagerProfile> & {
      approveServiceAssignment?: boolean;
    };

    const adapter = await getAdapter();
    const profiles = await adapter.listProfiles();
    let existing = profiles.find((profile) => profile.id === id);

    if (!existing) {
      // The row may come from the staff records; resolve the administrator
      // maintained assignment for the same person.
      const snapshot = await buildRegistry(profiles);
      const derived = snapshot.profiles.find((profile) => profile.id === id);
      const registered = derived?.userId
        ? profiles.find((profile) => profile.userId === derived.userId)
        : undefined;
      if (registered) existing = registered;
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Manager assignment not found.' },
        { status: 404 }
      );
    }

    const roleId = body.roleId ?? existing.roleId;
    const role = ROLES_BY_ID[roleId];
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Select a valid managerial position.' },
        { status: 400 }
      );
    }

    const scope: ManagerScope = {
      ...existing.scope,
      ...(body.scope ?? {}),
    };

    const updated: ManagerProfile = {
      ...existing,
      fullName: body.fullName?.trim() || existing.fullName,
      email: body.email ?? existing.email,
      roleId: role.id,
      roleName: role.name,
      scope,
      appointmentDate: body.appointmentDate ?? existing.appointmentDate,
      acting: body.acting ?? existing.acting,
      effectiveFrom: body.effectiveFrom ?? existing.effectiveFrom,
      effectiveTo: body.effectiveTo ?? existing.effectiveTo,
      status: body.status ?? existing.status,
      previousTier:
        body.previousTier === undefined ? existing.previousTier : body.previousTier,
      updatedAt: new Date().toISOString(),
    };

    await adapter.saveProfile(updated);
    await adapter.saveAudit({
      id: makeId('aud'),
      statementId: null,
      managerId: updated.id,
      action: 'manager.updated',
      actor: 'Administrator',
      detail: `${updated.fullName} updated — ${updated.roleName}${updated.acting ? ' (acting)' : ''}.`,
      at: updated.updatedAt,
    });

    /* Approve the manager's assignment in the remuneration service. */
    let serviceApproved = false;
    if (body.approveServiceAssignment && updated.userId !== null) {
      const assignments = await loadServiceAssignments();
      const entry = assignments.get(updated.userId);
      if (entry) {
        const approved = await approveBackendAssignment(entry.assignment.id, null);
        serviceApproved = approved.ok;
        await adapter.saveAudit({
          id: makeId('aud'),
          statementId: null,
          managerId: updated.id,
          action: 'manager.service_approved',
          actor: 'Administrator',
          detail: approved.ok
            ? `Remuneration service assignment ${entry.assignment.id} approved for ${updated.fullName}.`
            : `Remuneration service assignment ${entry.assignment.id} could not be approved (${approved.error}).`,
          at: updated.updatedAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...updated, serviceApproved },
    });
  } catch (error) {
    console.error('Error updating remuneration manager:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update the manager assignment.' },
      { status: 500 }
    );
  }
}
