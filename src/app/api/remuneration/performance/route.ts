import { NextRequest, NextResponse } from 'next/server';

import { resolvePerformance } from '@/lib/remuneration/performance';
import { buildRegistry } from '@/lib/remuneration/registry';
import { getAdapter } from '@/lib/remuneration/store';
import { ROLES_BY_ID } from '@/lib/remuneration/structure';
import { currentPeriod } from '@/lib/remuneration/format';

/**
 * GET /api/remuneration/performance
 *
 * Query parameters:
 *  - managerId  the manager profile to measure
 *  - period     pay period in YYYY-MM form (defaults to the current month)
 *
 * Returns the measured results used for tier qualification together with the
 * supporting evidence for efficiency and portfolio quality.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    const period = searchParams.get('period') || currentPeriod();

    if (!managerId) {
      return NextResponse.json(
        { success: false, message: 'managerId is required.' },
        { status: 400 }
      );
    }

    const adapter = await getAdapter();
    const registered = await adapter.listProfiles();
    const snapshot = await buildRegistry(registered);
    const manager = snapshot.profiles.find((profile) => profile.id === managerId);

    if (!manager) {
      return NextResponse.json(
        { success: false, message: 'Manager not found in the registry.' },
        { status: 404 }
      );
    }

    const role = ROLES_BY_ID[manager.roleId];
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'No remuneration role is linked to this manager.' },
        { status: 400 }
      );
    }

    const resolved = await resolvePerformance(manager, role, snapshot.offices, period);

    return NextResponse.json({
      success: true,
      data: {
        manager,
        role,
        performance: resolved.input,
        evidence: {
          revenue: resolved.revenue,
          efficiency: resolved.efficiency,
          portfolioQuality: resolved.portfolioQuality,
        },
        officesInScope: resolved.officeIds.length,
      },
    });
  } catch (error) {
    console.error('Error loading remuneration performance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load the performance result.' },
      { status: 500 }
    );
  }
}
