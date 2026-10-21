import { NextResponse } from 'next/server';

import { loadServiceStructure } from '@/lib/remuneration/payroll';
import {
  ALLOWANCE_POLICY,
  BONUS_RULES,
  CONFIRMATION_CHECKLIST,
  HOUSING_BANDS,
  HOUSING_POLICY,
  INCREMENT_POLICY,
  PAY_BLOCKS,
  ROLES,
  STATUTORY_DEFAULTS,
} from '@/lib/remuneration/structure';
import { getAdapter } from '@/lib/remuneration/store';

/**
 * GET /api/remuneration/structure
 *
 * Returns the approved remuneration structure: managerial roles, tiers, pay
 * blocks, the housing policy, bonus rules, statutory rules and the decisions
 * management still has to confirm.
 *
 * The `service` block holds the configuration held by the remuneration service
 * — the tiers, the position salary packages, the components, the component
 * values, the qualifying criteria, the housing bands and the bonus rules the
 * service actually pays from.
 */
export async function GET() {
  try {
    const [adapter, service] = await Promise.all([
      getAdapter(),
      loadServiceStructure(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        roles: ROLES,
        payBlocks: PAY_BLOCKS,
        housingBands: HOUSING_BANDS,
        housingPolicy: HOUSING_POLICY,
        bonusRules: BONUS_RULES,
        statutory: STATUTORY_DEFAULTS,
        incrementPolicy: INCREMENT_POLICY,
        allowancePolicy: ALLOWANCE_POLICY,
        confirmationChecklist: CONFIRMATION_CHECKLIST,
        persistence: adapter.persistent ? 'mysql' : 'in-process',
        service: {
          connected: service.connected,
          error: service.error,
          counts: service.counts,
          tiers: service.tiers,
          configs: service.configs,
          components: service.components,
          componentValues: service.componentValues,
          criteria: service.criteria,
          housingBands: service.housingBands,
          bonusRules: service.bonusRules,
        },
      },
    });
  } catch (error) {
    console.error('Error loading remuneration structure:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the remuneration structure.' },
      { status: 500 }
    );
  }
}
