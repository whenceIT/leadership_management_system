import { NextRequest, NextResponse } from 'next/server';

import {
  approveBackendAssignment,
  createBackendAssessment,
  fetchBackendAssessments,
} from '@/lib/remuneration/backend';
import { periodEnd } from '@/lib/remuneration/format';
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

    /* The assessments recorded in the remuneration service for this manager. */
    const assessments = statement.payroll?.assignmentId
      ? (await fetchBackendAssessments({
          employee_remuneration_assignment_id: statement.payroll.assignmentId,
        })).data ?? []
      : [];

    return NextResponse.json({
      success: true,
      data: { statement, audit, assessments },
    });
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

    /* A statement that still carries an unresolved error cannot be approved or
     * finalised. The error has to be cleared — a confirmed tier, the missing
     * performance result — and the statement recalculated first. */
    if (nextStatus === 'approved' || nextStatus === 'finalised') {
      const errors = statement.flags.filter((flag) => flag.severity === 'error');
      if (errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `This statement cannot be approved while ${
              errors.length > 1 ? `${errors.length} validation errors stand` : 'a validation error stands'
            }. ${errors.map((flag) => flag.message).join(' ')}`,
            errors: errors.map((flag) => ({ code: flag.code, message: flag.message })),
          },
          { status: 409 }
        );
      }
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

    /* Record the decision in the remuneration service: the assignment is
     * approved for payroll and the monthly assessment is written so the
     * service holds the review record. */
    const serviceActions: string[] = [];
    const assignmentId = updated.payroll?.assignmentId ?? null;

    if (assignmentId && (nextStatus === 'approved' || nextStatus === 'finalised')) {
      const approved = await approveBackendAssignment(assignmentId, null);
      serviceActions.push(
        approved.ok
          ? `Remuneration service assignment ${assignmentId} approved.`
          : `Remuneration service assignment ${assignmentId} could not be approved (${approved.error}).`
      );

      const assessment = await createBackendAssessment({
        employee_remuneration_assignment_id: assignmentId,
        assessment_period: periodEnd(updated.period),
        actual_performance: {
          value: updated.qualification.achievementPct,
          tier: updated.qualification.tier,
          gross_pay: updated.grossPay,
          net_cash_pay: updated.netCashPay,
        },
        achievement_percentage: updated.qualification.achievementPct,
        assessment_status:
          nextStatus === 'finalised'
            ? 'passed'
            : updated.qualification.tier === null
            ? 'failed'
            : 'under review',
        decision: nextStatus === 'finalised' ? 'maintain' : null,
        decision_notes: `${updated.qualification.label} — ${updated.qualification.reason}`,
      });
      serviceActions.push(
        assessment.ok
          ? `Assessment ${assessment.data?.id} recorded in the remuneration service.`
          : `The assessment could not be recorded in the remuneration service (${assessment.error}).`
      );
    }

    if (serviceActions.length > 0) {
      await adapter.saveAudit({
        id: makeId('aud'),
        statementId: updated.id,
        managerId: updated.managerId,
        action: 'statement.service_sync',
        actor,
        detail: serviceActions.join(' '),
        at: now,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating remuneration statement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update the statement.' },
      { status: 500 }
    );
  }
}
