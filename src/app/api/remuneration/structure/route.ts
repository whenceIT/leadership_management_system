import { NextResponse } from 'next/server';

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
 */
export async function GET() {
  try {
    const adapter = await getAdapter();

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
