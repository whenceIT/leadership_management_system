import { NextRequest, NextResponse } from 'next/server';

import { RemunerationError, computeForManager } from '@/lib/remuneration/service';
import { getAdapter, makeId } from '@/lib/remuneration/store';
import type { RemunerationStatement, StatementStatus } from '@/lib/remuneration/types';

interface StatementPayload {
  managerId?: string;
  period?: string;
  performance?: Parameters<typeof computeForManager>[0]['performance'];
  statutory?: Parameters<typeof computeForManager>[0]['statutory'];
  previousTier?: number | null;
  status?: StatementStatus;
  createdBy?: string;
}

/**
 * GET /api/remuneration/statements
 *
 * Query parameters:
 *  - period  filter by pay period (YYYY-MM)
 *  - status  filter by workflow status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const status = searchParams.get('status');

    const adapter = await getAdapter();
    const statements = await adapter.listStatements();

    const filtered = statements.filter((statement) => {
      if (period && statement.period !== period) return false;
      if (status && statement.status !== status) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: {
        statements: filtered,
        counts: {
          total: filtered.length,
          pendingApproval: filtered.filter((s) => s.status === 'pending_approval').length,
          approved: filtered.filter((s) => s.status === 'approved').length,
          rejected: filtered.filter((s) => s.status === 'rejected').length,
          finalised: filtered.filter((s) => s.status === 'finalised').length,
        },
      },
    });
  } catch (error) {
    console.error('Error loading remuneration statements:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the calculation history.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/remuneration/statements
 *
 * Saves a calculated statement. The calculation is always re-run on the server
 * so the stored statement matches the approved engine and structure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StatementPayload;

    if (!body.managerId) {
      return NextResponse.json(
        { success: false, message: 'managerId is required.' },
        { status: 400 }
      );
    }

    const { computation, manager, scopeLabel } = await computeForManager({
      managerId: body.managerId,
      period: body.period,
      performance: body.performance,
      statutory: body.statutory,
      previousTier: body.previousTier,
    });

    const adapter = await getAdapter();
    const existing = (await adapter.listStatements()).find(
      (statement) =>
        statement.managerId === body.managerId && statement.period === computation.period
    );

    const now = new Date().toISOString();
    const status: StatementStatus = body.status ?? 'pending_approval';
    const statement: RemunerationStatement = {
      ...computation,
      id: existing?.id ?? makeId('stmt'),
      status,
      scopeLabel,
      createdBy: body.createdBy ?? 'Administrator',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedBy: existing?.approvedBy ?? null,
      approvedAt: existing?.approvedAt ?? null,
      rejectionReason: existing?.rejectionReason ?? null,
    };

    await adapter.saveStatement(statement);
    await adapter.saveAudit({
      id: makeId('aud'),
      statementId: statement.id,
      managerId: statement.managerId,
      action: existing ? 'statement.recalculated' : 'statement.created',
      actor: statement.createdBy,
      detail: `${statement.managerName} — ${statement.roleName}, ${statement.qualification.label}, net ${statement.netCashPay.toLocaleString('en-ZM')}.`,
      at: now,
    });

    return NextResponse.json({ success: true, data: statement });
  } catch (error) {
    if (error instanceof RemunerationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error('Error saving remuneration statement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save the remuneration statement.' },
      { status: 500 }
    );
  }
}
