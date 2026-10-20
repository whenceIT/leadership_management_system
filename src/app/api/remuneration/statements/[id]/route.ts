import { NextRequest, NextResponse } from 'next/server';

import { getAdapter, makeId } from '@/lib/remuneration/store';
import type { StatementStatus } from '@/lib/remuneration/types';

const TRANSITIONS: Record<StatementStatus, StatementStatus[]> = {
  draft: ['pending_approval', 'rejected'],
  pending_approval: ['approved', 'rejected', 'draft'],
  approved: ['finalised', 'rejected'],
  finalised: [],
  rejected: ['pending_approval', 'draft'],
};

/**
 * GET /api/remuneration/statements/[id]
 *
 * Returns one saved statement together with its audit trail.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adapter = await getAdapter();
    const statements = await adapter.listStatements();
    const statement = statements.find((entry) => entry.id === id);

    if (!statement) {
      return NextResponse.json(
        { success: false, message: 'Statement not found.' },
        { status: 404 }
      );
    }

    const audit = (await adapter.listAudit()).filter(
      (entry) => entry.statementId === statement.id
    );

    return NextResponse.json({ success: true, data: { statement, audit } });
  } catch (error) {
    console.error('Error loading remuneration statement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the statement.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/remuneration/statements/[id]
 *
 * Moves a statement through the approval workflow: pending approval → approved
 * → finalised, or rejection with a reason. Every change is written to the
 * audit trail with the actor and time.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      status?: StatementStatus;
      reason?: string;
      actor?: string;
    };

    const adapter = await getAdapter();
    const statements = await adapter.listStatements();
    const statement = statements.find((entry) => entry.id === id);

    if (!statement) {
      return NextResponse.json(
        { success: false, message: 'Statement not found.' },
        { status: 404 }
      );
    }

    const nextStatus = body.status;
    if (!nextStatus) {
      return NextResponse.json(
        { success: false, message: 'A target status is required.' },
        { status: 400 }
      );
    }

    if (!TRANSITIONS[statement.status].includes(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `A ${statement.status.replace('_', ' ')} statement cannot move to ${nextStatus.replace('_', ' ')}.`,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const actor = body.actor ?? 'Administrator';

    const updated = {
      ...statement,
      status: nextStatus,
      approvedBy: nextStatus === 'approved' || nextStatus === 'finalised' ? actor : statement.approvedBy,
      approvedAt: nextStatus === 'approved' || nextStatus === 'finalised' ? now : statement.approvedAt,
      rejectionReason: nextStatus === 'rejected' ? body.reason ?? 'Rejected by approver' : null,
      updatedAt: now,
    };

    await adapter.saveStatement(updated);
    await adapter.saveAudit({
      id: makeId('aud'),
      statementId: updated.id,
      managerId: updated.managerId,
      action: `statement.${nextStatus}`,
      actor,
      detail:
        nextStatus === 'rejected'
          ? `Rejected: ${body.reason ?? 'no reason supplied'}.`
          : `${updated.managerName} moved to ${nextStatus.replace('_', ' ')}.`,
      at: now,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating remuneration statement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update the statement.' },
      { status: 500 }
    );
  }
}
