/**
 * Manager registry.
 *
 * Builds the list of managers the remuneration module can calculate for by
 * combining the staff records held in the backend with the assignments
 * recorded by the administrator (role, scope, appointment date, acting status
 * and effective remuneration period).
 */

import { getRoleForPosition } from './structure';
import {
  fetchOfficeManagers,
  fetchOffices,
  fetchStaff,
  type SourceOffice,
  type SourceStaff,
} from './source';
import type { ManagerProfile, ManagerScope, RoleDefinition } from './types';

export const PROVINCE_NAMES: Record<number, string> = {
  1: 'Lusaka',
  2: 'Copperbelt',
  3: 'Eastern',
  4: 'Central',
  5: 'Muchinga',
  6: 'Northern',
  7: 'North Western',
  8: 'Western',
  9: 'Southern',
  10: 'Luapula',
};

export interface DistrictRecord {
  id: number;
  name: string;
  provinceId: number | null;
}

export interface RegistrySnapshot {
  profiles: ManagerProfile[];
  offices: SourceOffice[];
  districts: DistrictRecord[];
  generatedAt: string;
}

async function fetchDistricts(): Promise<DistrictRecord[]> {
  try {
    const response = await fetch('https://smartbackend.whencefinancesystem.com/districts', {
      cache: 'force-cache',
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      name: String(row.name),
      provinceId: row.province_id === null ? null : Number(row.province_id),
    }));
  } catch (error) {
    console.error('Remuneration: unable to load districts:', error);
    return [];
  }
}

function scopeFor(
  role: RoleDefinition,
  office: SourceOffice | undefined,
  offices: SourceOffice[],
  districts: DistrictRecord[]
): ManagerScope {
  const provinceId = office?.province_id ?? null;
  const districtId = office?.district_id ?? null;

  const provinceOffices = offices.filter((o) => o.province_id === provinceId);
  const districtOffices = offices.filter((o) => o.district_id === districtId);

  const districtName =
    districts.find((d) => d.id === districtId)?.name ??
    (office?.name && districtId ? `${office.name} district` : null);

  if (role.category === 'province') {
    return {
      officeId: null,
      officeName: null,
      districtId: null,
      districtName: null,
      provinceId,
      provinceName: provinceId ? PROVINCE_NAMES[provinceId] ?? `Province ${provinceId}` : null,
      department: null,
      branchCount: provinceOffices.length,
    };
  }

  if (role.category === 'district') {
    return {
      officeId: null,
      officeName: null,
      districtId,
      districtName,
      provinceId,
      provinceName: provinceId ? PROVINCE_NAMES[provinceId] ?? `Province ${provinceId}` : null,
      department: null,
      branchCount: districtOffices.length,
    };
  }

  return {
    officeId: office?.id ?? null,
    officeName: office?.name ?? null,
    districtId,
    districtName,
    provinceId,
    provinceName: provinceId ? PROVINCE_NAMES[provinceId] ?? `Province ${provinceId}` : null,
    department: office?.name ?? null,
    branchCount: 1,
  };
}

function profileFromStaff(
  staff: SourceStaff,
  role: RoleDefinition,
  offices: SourceOffice[],
  districts: DistrictRecord[]
): ManagerProfile {
  const office = offices.find((o) => o.id === staff.office_id);
  const now = new Date().toISOString();
  return {
    id: `staff-${staff.id}`,
    userId: staff.id,
    fullName: `${staff.first_name} ${staff.last_name}`.trim(),
    email: staff.email,
    roleId: role.id,
    roleName: role.name,
    scope: scopeFor(role, office, offices, districts),
    appointmentDate: null,
    acting: false,
    effectiveFrom: null,
    effectiveTo: null,
    status: staff.status === 'Active' ? 'active' : 'inactive',
    source: 'staff_record',
    registeredId: null,
    previousTier: null,
    createdAt: now,
    updatedAt: now,
  };
}

function profileFromOfficeAppointment(
  manager: { id: number; first_name: string; last_name: string; email: string },
  office: SourceOffice,
  role: RoleDefinition,
  offices: SourceOffice[],
  districts: DistrictRecord[]
): ManagerProfile {
  const now = new Date().toISOString();
  return {
    id: `office-${manager.id}`,
    userId: manager.id,
    fullName: `${manager.first_name} ${manager.last_name}`.trim(),
    email: manager.email,
    roleId: role.id,
    roleName: role.name,
    scope: scopeFor(role, office, offices, districts),
    appointmentDate: null,
    acting: false,
    effectiveFrom: null,
    effectiveTo: null,
    status: 'active',
    source: 'office_appointment',
    registeredId: null,
    previousTier: null,
    createdAt: now,
    updatedAt: now,
  };
}

function mergeProfiles(
  derived: ManagerProfile[],
  registered: ManagerProfile[]
): ManagerProfile[] {
  const merged = new Map<string, ManagerProfile>();

  for (const profile of derived) {
    merged.set(profile.id, profile);
  }

  for (const profile of registered) {
    const existing = profile.userId
      ? derived.find((d) => d.userId === profile.userId)
      : undefined;

    if (existing) {
      merged.set(existing.id, {
        ...existing,
        ...profile,
        id: existing.id,
        source: 'registered',
        registeredId: profile.id,
        scope: {
          ...existing.scope,
          ...profile.scope,
          branchCount: profile.scope.branchCount || existing.scope.branchCount,
        },
      });
    } else {
      merged.set(profile.id, { ...profile, registeredId: profile.id });
    }
  }

  return Array.from(merged.values());
}

/**
 * Runs a source lookup and falls back to an empty result when the upstream
 * system is unreachable, so the registry stays available for the
 * administrator maintained assignments.
 */
async function safeSource<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`Remuneration registry source failed for ${label}:`, error);
    return fallback;
  }
}

export async function buildRegistry(
  registeredProfiles: ManagerProfile[] = []
): Promise<RegistrySnapshot> {
  const [offices, staff, officeManagers, districts] = await Promise.all([
    safeSource('offices', fetchOffices, []),
    safeSource('staff', fetchStaff, []),
    safeSource('office managers', fetchOfficeManagers, []),
    safeSource('districts', fetchDistricts, []),
  ]);

  const derived: ManagerProfile[] = [];

  for (const member of staff) {
    const positionId = member.job_position ?? member.position_id ?? null;
    if (!positionId) continue;
    const role = getRoleForPosition(positionId);
    if (!role) continue;
    derived.push(profileFromStaff(member, role, offices, districts));
  }

  const branchRole = getRoleForPosition(5);
  if (branchRole) {
    for (const entry of officeManagers) {
      const office = offices.find((o) => o.id === entry.officeId);
      if (!office) continue;
      for (const manager of entry.managers) {
        if (derived.some((d) => d.userId === manager.id)) continue;
        derived.push(profileFromOfficeAppointment(manager, office, branchRole, offices, districts));
      }
    }
  }

  return {
    profiles: mergeProfiles(derived, registeredProfiles),
    offices,
    districts,
    generatedAt: new Date().toISOString(),
  };
}

export function scopeLabel(scope: ManagerScope): string {
  if (scope.officeName) return scope.officeName;
  if (scope.districtName) return scope.districtName;
  if (scope.provinceName) return scope.provinceName;
  return 'Unassigned scope';
}
