/**
 * Persistence for the remuneration module.
 *
 * Statements, manager assignments and the audit trail are written to MySQL
 * when the schema is available and fall back to an in-process store when the
 * database cannot be reached. The adapter is chosen once and reused so a
 * request never pays the connection cost twice.
 */

import { query, queryOne } from '@/lib/db';
import type { AuditEntry, ManagerProfile, RemunerationStatement } from './types';

interface Adapter {
  readonly persistent: boolean;
  listProfiles(): Promise<ManagerProfile[]>;
  saveProfile(profile: ManagerProfile): Promise<ManagerProfile>;
  listStatements(): Promise<RemunerationStatement[]>;
  saveStatement(statement: RemunerationStatement): Promise<RemunerationStatement>;
  listAudit(): Promise<AuditEntry[]>;
  saveAudit(entry: AuditEntry): Promise<void>;
}

const globalStore = globalThis as unknown as {
  __remunerationMemory?: {
    profiles: ManagerProfile[];
    statements: RemunerationStatement[];
    audit: AuditEntry[];
  };
  __remunerationAdapter?: Adapter | null;
};

function memory(): Required<typeof globalStore>['__remunerationMemory'] {
  if (!globalStore.__remunerationMemory) {
    globalStore.__remunerationMemory = { profiles: [], statements: [], audit: [] };
  }
  return globalStore.__remunerationMemory;
}

/* -------------------------------------------------------------------------- */
/* MySQL adapter                                                                */
/* -------------------------------------------------------------------------- */

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS remuneration_manager_profiles (
     id VARCHAR(64) PRIMARY KEY,
     user_id INT NULL,
     full_name VARCHAR(160) NOT NULL,
     email VARCHAR(160) NULL,
     role_id VARCHAR(64) NOT NULL,
     role_name VARCHAR(120) NOT NULL,
     scope JSON NULL,
     appointment_date DATE NULL,
     acting TINYINT(1) NOT NULL DEFAULT 0,
     effective_from DATE NULL,
     effective_to DATE NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'active',
     previous_tier INT NULL,
     payload JSON NULL,
     created_at DATETIME NOT NULL,
     updated_at DATETIME NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS remuneration_statements (
     id VARCHAR(64) PRIMARY KEY,
     period VARCHAR(10) NOT NULL,
     manager_id VARCHAR(64) NOT NULL,
     manager_name VARCHAR(160) NOT NULL,
     role_id VARCHAR(64) NOT NULL,
     role_name VARCHAR(120) NOT NULL,
     scope_label VARCHAR(255) NULL,
     tier INT NULL,
     tier_label VARCHAR(40) NULL,
     gross_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
     employee_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
     net_cash_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
     housing DECIMAL(14,2) NOT NULL DEFAULT 0,
     benefits DECIMAL(14,2) NOT NULL DEFAULT 0,
     bonus DECIMAL(14,2) NOT NULL DEFAULT 0,
     employer_costs DECIMAL(14,2) NOT NULL DEFAULT 0,
     total_company_cost DECIMAL(14,2) NOT NULL DEFAULT 0,
     status VARCHAR(24) NOT NULL DEFAULT 'draft',
     payload JSON NULL,
     created_by VARCHAR(160) NULL,
     created_at DATETIME NOT NULL,
     updated_at DATETIME NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS remuneration_audit_log (
     id VARCHAR(64) PRIMARY KEY,
     statement_id VARCHAR(64) NULL,
     manager_id VARCHAR(64) NULL,
     action VARCHAR(80) NOT NULL,
     actor VARCHAR(160) NOT NULL,
     detail TEXT NULL,
     created_at DATETIME NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

class DatabaseAdapter implements Adapter {
  readonly persistent = true;

  private async ensureSchema(): Promise<void> {
    for (const statement of SCHEMA) {
      await query(statement);
    }
  }

  async listProfiles(): Promise<ManagerProfile[]> {
    const rows = await query(
      'SELECT payload FROM remuneration_manager_profiles ORDER BY updated_at DESC'
    );
    return (rows as { payload: string | ManagerProfile }[]).map((row) =>
      typeof row.payload === 'string' ? (JSON.parse(row.payload) as ManagerProfile) : row.payload
    );
  }

  async saveProfile(profile: ManagerProfile): Promise<ManagerProfile> {
    await this.ensureSchema();
    await query(
      `INSERT INTO remuneration_manager_profiles
        (id, user_id, full_name, email, role_id, role_name, scope, appointment_date, acting,
         effective_from, effective_to, status, previous_tier, payload, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id), full_name = VALUES(full_name), email = VALUES(email),
         role_id = VALUES(role_id), role_name = VALUES(role_name), scope = VALUES(scope),
         appointment_date = VALUES(appointment_date), acting = VALUES(acting),
         effective_from = VALUES(effective_from), effective_to = VALUES(effective_to),
         status = VALUES(status), previous_tier = VALUES(previous_tier),
         payload = VALUES(payload), updated_at = VALUES(updated_at)`,
      [
        profile.id,
        profile.userId,
        profile.fullName,
        profile.email,
        profile.roleId,
        profile.roleName,
        JSON.stringify(profile.scope),
        profile.appointmentDate,
        profile.acting ? 1 : 0,
        profile.effectiveFrom,
        profile.effectiveTo,
        profile.status,
        profile.previousTier,
        JSON.stringify(profile),
        profile.createdAt,
        profile.updatedAt,
      ]
    );
    return profile;
  }

  async listStatements(): Promise<RemunerationStatement[]> {
    const rows = await query(
      'SELECT payload FROM remuneration_statements ORDER BY created_at DESC LIMIT 500'
    );
    return (rows as { payload: string | RemunerationStatement }[]).map((row) =>
      typeof row.payload === 'string' ? (JSON.parse(row.payload) as RemunerationStatement) : row.payload
    );
  }

  async saveStatement(statement: RemunerationStatement): Promise<RemunerationStatement> {
    await this.ensureSchema();
    await query(
      `INSERT INTO remuneration_statements
        (id, period, manager_id, manager_name, role_id, role_name, scope_label, tier, tier_label,
         gross_pay, employee_deductions, net_cash_pay, housing, benefits, bonus, employer_costs,
         total_company_cost, status, payload, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         period = VALUES(period), scope_label = VALUES(scope_label), tier = VALUES(tier),
         tier_label = VALUES(tier_label), gross_pay = VALUES(gross_pay),
         employee_deductions = VALUES(employee_deductions), net_cash_pay = VALUES(net_cash_pay),
         housing = VALUES(housing), benefits = VALUES(benefits), bonus = VALUES(bonus),
         employer_costs = VALUES(employer_costs), total_company_cost = VALUES(total_company_cost),
         status = VALUES(status), payload = VALUES(payload), updated_at = VALUES(updated_at)`,
      [
        statement.id,
        statement.period,
        statement.managerId,
        statement.managerName,
        statement.roleId,
        statement.roleName,
        statement.scopeLabel,
        statement.qualification.tier,
        statement.qualification.label,
        statement.grossPay,
        statement.deductions.total,
        statement.netCashPay,
        statement.benefits.housing,
        statement.benefits.total,
        statement.bonus.amount,
        statement.employerCosts.total,
        statement.totalCompanyCost,
        statement.status,
        JSON.stringify(statement),
        statement.createdBy,
        statement.createdAt,
        statement.updatedAt,
      ]
    );
    return statement;
  }

  async listAudit(): Promise<AuditEntry[]> {
    const rows = await query(
      'SELECT id, statement_id, manager_id, action, actor, detail, created_at FROM remuneration_audit_log ORDER BY created_at DESC LIMIT 500'
    );
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      statementId: (row.statement_id as string) ?? null,
      managerId: (row.manager_id as string) ?? null,
      action: String(row.action),
      actor: String(row.actor),
      detail: (row.detail as string) ?? '',
      at: new Date(String(row.created_at)).toISOString(),
    }));
  }

  async saveAudit(entry: AuditEntry): Promise<void> {
    await this.ensureSchema();
    await query(
      `INSERT INTO remuneration_audit_log (id, statement_id, manager_id, action, actor, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE detail = VALUES(detail)`,
      [
        entry.id,
        entry.statementId,
        entry.managerId,
        entry.action,
        entry.actor,
        entry.detail,
        entry.at,
      ]
    );
  }
}

/* -------------------------------------------------------------------------- */
/* In-memory adapter                                                            */
/* -------------------------------------------------------------------------- */

class MemoryAdapter implements Adapter {
  readonly persistent = false;

  async listProfiles(): Promise<ManagerProfile[]> {
    return [...memory().profiles];
  }

  async saveProfile(profile: ManagerProfile): Promise<ManagerProfile> {
    const store = memory();
    const index = store.profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) store.profiles[index] = profile;
    else store.profiles.push(profile);
    return profile;
  }

  async listStatements(): Promise<RemunerationStatement[]> {
    return [...memory().statements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async saveStatement(statement: RemunerationStatement): Promise<RemunerationStatement> {
    const store = memory();
    const index = store.statements.findIndex((s) => s.id === statement.id);
    if (index >= 0) store.statements[index] = statement;
    else store.statements.unshift(statement);
    return statement;
  }

  async listAudit(): Promise<AuditEntry[]> {
    return [...memory().audit].sort((a, b) => b.at.localeCompare(a.at));
  }

  async saveAudit(entry: AuditEntry): Promise<void> {
    memory().audit.unshift(entry);
  }
}

/* -------------------------------------------------------------------------- */
/* Adapter selection                                                           */
/* -------------------------------------------------------------------------- */

export async function getAdapter(): Promise<Adapter> {
  if (globalStore.__remunerationAdapter) return globalStore.__remunerationAdapter;
  try {
    const row = await queryOne('SELECT 1 AS ok');
    if (row) {
      const adapter = new DatabaseAdapter();
      await adapter.listStatements();
      globalStore.__remunerationAdapter = adapter;
      return adapter;
    }
  } catch (error) {
    console.warn(
      'Remuneration store falling back to the in-process store (database unavailable):',
      error instanceof Error ? error.message : error
    );
  }
  const adapter = new MemoryAdapter();
  globalStore.__remunerationAdapter = adapter;
  return adapter;
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
