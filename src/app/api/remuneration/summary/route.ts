import { NextRequest, NextResponse } from 'next/server';

import { backendHealth } from '@/lib/remuneration/backend';
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

    /* The remuneration service holds the payroll side of the framework. Only a
     * statement the engine qualified carries a comparable service figure, so
     * the two columns add up to the same set of managers. */
    const health = await backendHealth();
    const serviceTotals = filtered.reduce(
      (totals, statement) => {
        const payroll = statement.payroll;
        if (!payroll) return totals;
        if (statement.qualification.tier === null) {
          totals.unqualified += 1;
          return totals;
        }
        totals.statements += 1;
        totals.grossPay = Math.round((totals.grossPay + payroll.grossPay) * 100) / 100;
        totals.netCashPay =
          Math.round((totals.netCashPay + payroll.netCashPay) * 100) / 100;
        totals.housing = Math.round((totals.housing + payroll.housing) * 100) / 100;
        totals.employerContributions =
          Math.round((totals.employerContributions + payroll.employerContributions) * 100) /
          100;
        totals.totalCompanyCost =
          Math.round((totals.totalCompanyCost + payroll.totalCompanyCost) * 100) / 100;
        return totals;
      },
      {
        statements: 0,
        unqualified: 0,
        grossPay: 0,
        netCashPay: 0,
        housing: 0,
        employerContributions: 0,
        totalCompanyCost: 0,
      }
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
        service: {
          connected: health.connected,
          error: health.error,
          overview: health.overview,
          totals: serviceTotals,
        },
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
