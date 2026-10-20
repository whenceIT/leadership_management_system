import { NextRequest, NextResponse } from 'next/server';

import { RemunerationError, computeForManager } from '@/lib/remuneration/service';
import type { StatutoryRules } from '@/lib/remuneration/types';

interface CalculatePayload {
  managerId?: string;
  period?: string;
  performance?: {
    value?: number | null;
    manualTier?: number | null;
    overrideReason?: string | null;
    efficiencyScore?: number | null;
    pduaScore?: number | null;
    branchCount?: number | null;
    source?: string;
    measures?: import('@/lib/remuneration/types').PerformanceMeasure[];
  };
  previousTier?: number | null;
  statutory?: Partial<StatutoryRules>;
}

/**
 * POST /api/remuneration/calculate
 *
 * Runs the calculation engine for one manager and pay period and returns the
 * full remuneration statement, including the tier qualification reasoning and
 * any validation flags that must be cleared before payroll.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CalculatePayload;

    if (!body.managerId) {
      return NextResponse.json(
        { success: false, message: 'managerId is required.' },
        { status: 400 }
      );
    }

    const result = await computeForManager({
      managerId: body.managerId,
      period: body.period,
      performance: body.performance,
      statutory: body.statutory,
      previousTier: body.previousTier,
    });

    return NextResponse.json({
      success: true,
      data: {
        computation: result.computation,
        scopeLabel: result.scopeLabel,
        manager: result.manager,
        performance: body.performance ?? null,
      },
    });
  } catch (error) {
    if (error instanceof RemunerationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error('Error calculating remuneration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to calculate the remuneration statement.' },
      { status: 500 }
    );
  }
}
