/**
 * Manager registry.
 *
 * Builds the list of managers the remuneration module can calculate for by
 * combining the staff records held in the backend with the assignments
 * recorded by the administrator (role, scope, appointment date, acting status
 * and effective remuneration period).
 */

import { getRoleForPosition, ROLES_BY_ID } from './structure';
import {
  fetchOfficeManagers,
  fetchOffices,
  fetchStaff,
  type SourceOffice,
  type SourceStaff,
} from './source';
import type { ManagerProfile, ManagerScope, RoleDefinition } from './types';

const MANAGERS_API_BASE = 'https://smartbackend.whencefinancesystem.com/api/remuneration';

export interface ApiManager {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  office_id: number | null;
  office_name: string | null;
  district_id: number | null;
  district_name: string | null;
  province_id: number | null;
  province_name: string | null;
  job_position_id: number | null;
  job_position: string | null;
  role_id: number;
}

export async function fetchApiManagers(): Promise<ApiManager[]> {
  try {
    const response = await fetch(`${MANAGERS_API_BASE}/managers`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const payload = await response.json().catch(() => ({ success: false, data: [] }));
    if (!payload.success || !Array.isArray(payload.data)) return [];
    return payload.data;
  } catch {
    return [];
  }
}

function inferRoleFromPosition(jobPosition: string | null): RoleDefinition | null {
  if (!jobPosition) return null;
  const normalized = jobPosition.toLowerCase();

  if (
    normalized.includes('executive chairperson') ||
    normalized.includes('director') ||
    normalized.includes('department head')
  ) {
    const role = ROLES_BY_ID['provincial_manager'];
    if (role) return role;
  }
  if (
    normalized.includes('general operations administrator') ||
    normalized.includes('personnel') ||
    normalized.includes('recruit')
  ) {
    const role = ROLES_BY_ID['personnel_manager'];
    if (role) return role;
  }
  if (
    normalized.includes('performance operations administrator') ||
    normalized.includes('poua') ||
    normalized.includes('poa')
  ) {
    const role = ROLES_BY_ID['performance_manager'];
    if (role) return role;
  }
  if (normalized.includes('branch manager')) {
    const role = ROLES_BY_ID['branch_manager'];
    if (role) return role;
  }
  if (
    normalized.includes('district') &&
    (normalized.includes('manager') || normalized.includes('regional'))
  ) {
    const role = ROLES_BY_ID['district_manager'];
    if (role) return role;
  }
  if (normalized.includes('provincial') && normalized.includes('manager')) {
    const role = ROLES_BY_ID['provincial_manager'];
    if (role) return role;
  }
  if (normalized.includes('loan consultant')) {
    const role = ROLES_BY_ID['branch_manager'];
    if (role) return role;
  }
  if (normalized.includes('motor vehicle')) {
    const role = ROLES_BY_ID['motor_vehicle_manager'];
    if (role) return role;
  }
  if (normalized.includes('recoveries')) {
    const role = ROLES_BY_ID['recoveries_coordinator'];
    if (role) return role;
  }

  const defaultRole = ROLES_BY_ID['branch_manager'];
  return defaultRole ?? null;
}

function estimateBranchCount(
  officeId: number | null,
  districtId: number | null,
  provinceId: number | null
): number {
  if (!officeId) return 1;
  if (provinceId === 2) return 15;
  if (provinceId === 6 || provinceId === 3 || provinceId === 9) return 10;
  if (districtId === 65 || districtId === 20) return 5;
  return 1;
}

export function mapApiManager(manager: ApiManager): ManagerProfile {
  const fullName = `${manager.first_name} ${manager.last_name}`;
  const roleFromId =
    manager.job_position_id != null ? getRoleForPosition(manager.job_position_id) : null;
  const role = roleFromId ?? inferRoleFromPosition(manager.job_position);

  const roleId = role?.id ?? 'branch_manager';
  const roleName = role?.name ?? 'Branch Manager';
  const jobPosition = manager.job_position;

  const branchCount = estimateBranchCount(
    manager.office_id,
    manager.district_id,
    manager.province_id
  );
  const now = new Date().toISOString();

  return {
    id: `api-${manager.id}`,
    userId: manager.id,
    fullName,
    email: manager.email,
    roleId,
    roleName,
    jobPosition,
    scope: {
      officeId: manager.office_id,
      officeName: manager.office_name,
      districtId: manager.district_id,
      districtName: manager.district_name,
      provinceId: manager.province_id,
      provinceName: manager.province_name,
      department: null,
      branchCount,
    },
    appointmentDate: null,
    acting: false,
    effectiveFrom: null,
    effectiveTo: null,
    status: manager.status === 'Active' ? 'active' : 'inactive',
    source: 'registered',
    registeredId: null,
    previousTier: null,
    createdAt: now,
    updatedAt: now,
  };
}

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
    jobPosition: role.name,
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
    jobPosition: role.name,
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
        jobPosition: profile.jobPosition ?? existing.jobPosition,
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
  const [offices, staff, officeManagers, districts, apiManagers] = await Promise.all([
    safeSource('offices', fetchOffices, []),
    safeSource('staff', fetchStaff, []),
    safeSource('office managers', fetchOfficeManagers, []),
    safeSource('districts', fetchDistricts, []),
    safeSource('managers API', fetchApiManagers, []),
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

  for (const apiManager of apiManagers) {
    const profile = mapApiManager(apiManager);
    if (!derived.some((d) => d.userId === profile.userId)) {
      derived.push(profile);
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
