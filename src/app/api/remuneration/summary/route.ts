import { NextRequest, NextResponse } from 'next/server';

import {
  groupByRole,
  groupByTier,
  statementsToCsv,
  summarise,
} from '@/lib/remuneration/reporting';
import { getAdapter } from '@/lib/remuneration/store';

/**
 * GET /api/remuneration/summary
 *
 * Query parameters:
 *  - period  filter by pay period (YYYY-MM); omit for every period
 *  - format  `csv` returns the payroll ready export instead of JSON
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const format = searchParams.get('format');

    const adapter = await getAdapter();
    const statements = await adapter.listStatements();
    const filtered = period
      ? statements.filter((statement) => statement.period === period)
      : statements;

    if (format === 'csv') {
      const csv = statementsToCsv(filtered);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="managerial-remuneration${
            period ? `-${period}` : ''
          }.csv"`,
        },
      });
    }

    const byStatus = ['draft', 'pending_approval', 'approved', 'rejected', 'finalised'].map(
      (status) => ({
        status,
        count: filtered.filter((statement) => statement.status === status).length,
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        period,
        totals: summarise(filtered),
        byRole: groupByRole(filtered),
        byTier: groupByTier(filtered),
        byStatus,
        periods: Array.from(new Set(statements.map((s) => s.period))).sort().reverse(),
        statements: filtered,
      },
    });
  } catch (error) {
    console.error('Error loading remuneration summary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the remuneration summary.' },
      { status: 500 }
    );
  }
}
