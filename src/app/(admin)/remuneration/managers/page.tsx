'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  inputClass,
} from '@/components/remuneration/ui';
import { initialsOf } from '@/lib/remuneration/format';
import type { ManagerProfile } from '@/lib/remuneration/types';
import {
  fetchManagers,
  fetchStructure,
  saveManagerAssignment,
  updateManagerAssignment,
  type ManagersResponse,
  type StructureResponse,
} from '@/services/RemunerationService';

interface FormState {
  id: string | null;
  userId: number | null;
  fullName: string;
  email: string;
  roleId: string;
  scopeType: 'office' | 'district' | 'province';
  scopeId: string;
  appointmentDate: string;
  acting: boolean;
  effectiveFrom: string;
  effectiveTo: string;
  previousTier: string;
  registeredId: string | null;
}

const emptyForm: FormState = {
  id: null,
  userId: null,
  fullName: '',
  email: '',
  roleId: 'branch_manager',
  scopeType: 'office',
  scopeId: '',
  appointmentDate: '',
  acting: false,
  effectiveFrom: '',
  effectiveTo: '',
  previousTier: '',
  registeredId: null,
};

export default function RemunerationManagersPage() {
  const [data, setData] = useState<ManagersResponse | null>(null);
  const [structure, setStructure] = useState<StructureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [managersResponse, structureResponse] = await Promise.all([
        fetchManagers(),
        fetchStructure(),
      ]);
      setData(managersResponse);
      setStructure(structureResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load the manager registry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const provinces = useMemo(() => {
    const map = new Map<number, string>();
    (data?.offices ?? []).forEach((office) => {
      if (office.province_id && !map.has(office.province_id)) {
        map.set(office.province_id, `Province ${office.province_id}`);
      }
    });
    (data?.districts ?? []).forEach((district) => {
      if (district.provinceId && !map.has(district.provinceId)) {
        map.set(district.provinceId, `Province ${district.provinceId}`);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const scopeOptions = useMemo(() => {
    if (form.scopeType === 'office') {
      return (data?.offices ?? []).map((office) => ({
        id: String(office.id),
        label: office.name,
      }));
    }
    if (form.scopeType === 'district') {
      return (data?.districts ?? []).map((district) => ({
        id: String(district.id),
        label: district.name,
      }));
    }
    return provinces.map(([id, label]) => ({ id: String(id), label }));
  }, [data, form.scopeType, provinces]);

  const branchCountForScope = useCallback(
    (scopeType: FormState['scopeType'], scopeId: string): number => {
      if (!scopeId) return 0;
      const id = Number(scopeId);
      const offices = data?.offices ?? [];
      if (scopeType === 'office') return offices.some((office) => office.id === id) ? 1 : 0;
      if (scopeType === 'district') {
        return offices.filter((office) => office.district_id === id).length;
      }
      return offices.filter((office) => office.province_id === id).length;
    },
    [data]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.managers ?? [])
      .filter((manager) => (roleFilter === 'all' ? true : manager.roleId === roleFilter))
      .filter((manager) => {
        if (!term) return true;
        return [
          manager.fullName,
          manager.email ?? '',
          manager.roleName,
          manager.scope.officeName ?? '',
          manager.scope.districtName ?? '',
          manager.scope.provinceName ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);
      });
  }, [data, roleFilter, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormOpen(true);
    setNotice(null);
  };

  const openEdit = (manager: ManagerProfile) => {
    const scopeType: FormState['scopeType'] = manager.scope.officeId
      ? 'office'
      : manager.scope.districtId
      ? 'district'
      : 'province';
    const scopeId = String(
      manager.scope.officeId ?? manager.scope.districtId ?? manager.scope.provinceId ?? ''
    );
    setForm({
      id: manager.id,
      userId: manager.userId,
      fullName: manager.fullName,
      email: manager.email ?? '',
      roleId: manager.roleId,
      scopeType,
      scopeId,
      appointmentDate: manager.appointmentDate ?? '',
      acting: manager.acting,
      effectiveFrom: manager.effectiveFrom ?? '',
      effectiveTo: manager.effectiveTo ?? '',
      previousTier: manager.previousTier !== null ? String(manager.previousTier) : '',
      registeredId: manager.registeredId ?? null,
    });
    setFormOpen(true);
    setNotice(null);
  };

  /** Loads an existing manager from the staff records into the assignment form. */
  const selectFromRegistry = (managerId: string) => {
    const manager = (data?.managers ?? []).find((entry) => entry.id === managerId);
    if (!manager) return;
    openEdit(manager);
  };

  const submit = async () => {
    if (!form.fullName.trim()) {
      setNotice('The manager name is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const scopeOption = scopeOptions.find((option) => option.id === form.scopeId);
      const branchCount = branchCountForScope(form.scopeType, form.scopeId);
      const office =
        form.scopeType === 'office'
          ? (data?.offices ?? []).find((entry) => entry.id === Number(form.scopeId))
          : undefined;
      const district =
        form.scopeType === 'district'
          ? (data?.districts ?? []).find((entry) => entry.id === Number(form.scopeId))
          : undefined;
      const provinceId =
        form.scopeType === 'province'
          ? Number(form.scopeId)
          : (office?.province_id ?? district?.provinceId ?? null);

      const payload = {
        id: form.registeredId ?? undefined,
        userId: form.userId,
        fullName: form.fullName,
        email: form.email || null,
        roleId: form.roleId,
        scope: {
          officeId: form.scopeType === 'office' ? Number(form.scopeId) || null : null,
          officeName: form.scopeType === 'office' ? scopeOption?.label ?? null : null,
          districtId: form.scopeType === 'district' ? Number(form.scopeId) || null : null,
          districtName: form.scopeType === 'district' ? scopeOption?.label ?? null : null,
          provinceId: provinceId ?? null,
          provinceName: provinceId ? `Province ${provinceId}` : null,
          department: null,
          branchCount,
        },
        appointmentDate: form.appointmentDate || null,
        acting: form.acting,
        effectiveFrom: form.effectiveFrom || null,
        effectiveTo: form.effectiveTo || null,
        previousTier: form.previousTier ? Number(form.previousTier) : null,
      };

      if (form.registeredId) {
        await updateManagerAssignment(form.registeredId, payload);
        setNotice('Manager assignment updated.');
      } else {
        await saveManagerAssignment(payload);
        setNotice(
          form.userId
            ? 'Assignment registered against the staff record.'
            : 'Manager assignment registered.'
        );
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save the assignment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Managerial remuneration"
        title="Manager profiles and assignments"
        description="Select a manager from the staff records, or register the managerial position, the province, district or branch scope, the appointment date, acting status and the effective remuneration period."
        actions={
          <PrimaryButton onClick={openCreate}>Register an assignment</PrimaryButton>
        }
      />

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}

      {formOpen ? (
        <SectionCard
          title={form.registeredId ? 'Edit assignment' : 'Register a managerial assignment'}
          description="The assignment links the manager to a remuneration role, a scope and an effective period."
          actions={
            <SecondaryButton onClick={() => setFormOpen(false)}>Cancel</SecondaryButton>
          }
        >
          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <Field
              label="Select a manager from the staff records"
              hint="Choosing a manager links the assignment to their staff profile."
            >
              <select
                value={form.id ?? ''}
                onChange={(event) => selectFromRegistry(event.target.value)}
                className={inputClass}
              >
                <option value="">Enter a new manager below</option>
                {(data?.managers ?? []).map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName} — {manager.roleName}
                    {manager.scope.officeName ? ` (${manager.scope.officeName})` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Manager name">
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                placeholder="e.g. Takazo Siyunda"
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="name@company.com"
                className={inputClass}
              />
            </Field>
            <Field label="Managerial position">
              <select
                value={form.roleId}
                onChange={(event) => setForm({ ...form, roleId: event.target.value })}
                className={inputClass}
              >
                {(structure?.roles ?? []).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Scope type">
              <select
                value={form.scopeType}
                onChange={(event) =>
                  setForm({ ...form, scopeType: event.target.value as FormState['scopeType'], scopeId: '' })
                }
                className={inputClass}
              >
                <option value="office">Branch / office</option>
                <option value="district">District</option>
                <option value="province">Province</option>
              </select>
            </Field>
            <Field
              label="Scope"
              hint={`${
                branchCountForScope(form.scopeType, form.scopeId) || 0
              } branch(es) in this scope`}
            >
              <select
                value={form.scopeId}
                onChange={(event) => setForm({ ...form, scopeId: event.target.value })}
                className={inputClass}
              >
                <option value="">Select a scope</option>
                {scopeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tier earned last period" hint="Drives the housing continuity rule.">
              <select
                value={form.previousTier}
                onChange={(event) => setForm({ ...form, previousTier: event.target.value })}
                className={inputClass}
              >
                <option value="">Not recorded</option>
                {[1, 2, 3, 4, 5, 6].map((tier) => (
                  <option key={tier} value={tier}>
                    Tier {tier}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Appointment date">
              <input
                type="date"
                value={form.appointmentDate}
                onChange={(event) => setForm({ ...form, appointmentDate: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Effective from">
              <input
                type="date"
                value={form.effectiveFrom}
                onChange={(event) => setForm({ ...form, effectiveFrom: event.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Effective to">
              <input
                type="date"
                value={form.effectiveTo}
                onChange={(event) => setForm({ ...form, effectiveTo: event.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.acting}
              onChange={(event) => setForm({ ...form, acting: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            The manager is acting — apply the acting or junior-tier rules
          </label>

          <div className="mt-5 flex justify-end gap-3">
            <SecondaryButton onClick={() => setFormOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={submit} disabled={saving}>
              {saving ? 'Saving…' : form.registeredId ? 'Save changes' : 'Register assignment'}
            </PrimaryButton>
          </div>
        </SectionCard>
      ) : null}

      {error ? <ErrorState message={error} onRetry={load} /> : null}

      {loading ? (
        <LoadingState label="Loading the manager registry…" />
      ) : (
        <SectionCard
          title="Manager registry"
          description={`${data?.counts.total ?? 0} managers · ${data?.counts.registered ?? 0} registered assignments · ${data?.counts.acting ?? 0} acting`}
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, office, district or province…"
              className={inputClass}
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className={inputClass}
            >
              <option value="all">All managerial roles</option>
              {(structure?.roles ?? []).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No managers match"
              description="Adjust the filters or register a managerial assignment."
              action={<PrimaryButton onClick={openCreate}>Register an assignment</PrimaryButton>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700">
                    <th className="pb-3 pr-4 font-semibold">Manager</th>
                    <th className="pb-3 pr-4 font-semibold">Managerial position</th>
                    <th className="pb-3 pr-4 font-semibold">Scope</th>
                    <th className="pb-3 pr-4 text-right font-semibold">Branches</th>
                    <th className="pb-3 pr-4 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.slice(0, 200).map((manager) => (
                    <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                            {initialsOf(manager.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900 dark:text-white">
                              {manager.fullName}
                            </p>
                            <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                              {manager.email ?? 'No email on record'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-200">
                        {manager.roleName}
                        <span className="ml-1 text-xs text-gray-400">
                          ({manager.source.replace('_', ' ')})
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">
                        {manager.scope.officeName ??
                          manager.scope.districtName ??
                          manager.scope.provinceName ??
                          'Not assigned'}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-gray-300">
                        {manager.scope.branchCount || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              manager.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                            }`}
                          >
                            {manager.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          {manager.acting ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                              Acting
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(manager)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 200 ? (
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Showing the first 200 of {filtered.length} managers. Refine the search to narrow
                  the list.
                </p>
              ) : null}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
