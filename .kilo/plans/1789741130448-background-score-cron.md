# Plan: Monthly Background Health-Score Cron (no auth)

## Goal
Automatically compute an institutional health score (0-100) for **every office (branch), every province, and every district** on a monthly schedule and save each as a checkpoint, so score history is complete without manual "Save Checkpoint" clicks.

## Trigger (decided)
**Option A** - an external scheduler hits a web URL once a month. Reuse the existing `/api/cron/overall-score` route.

**NO PASSWORD AUTH** - the route's `CRON_SECRET` Bearer check is **removed** so the AI copilot can implement and run it directly with no credentials. If you later want to re-add protection, gate it behind an env var that defaults to off.

## Scope (decided)
Branch (office), province, district. Institution/company-wide and consultant levels are **out of scope** for this pass.

## Score source (decided)
Re-run the **frontend's own 6-parameter scoring** server-side, per entity:
- Fetch each entity's 16 KPIs from the existing per-level endpoints (`/KPI/{id}`, `/KPI/province/{id}`, `/KPI/district/{id}`).
- Aggregate into the 6 parameters (`aggregateBranchStructureKPIs`, `aggregateLoanConsultantPerformanceKPIs`, `aggregateLoanProductsKPIs`, `aggregateRiskManagementKPIs`, `aggregateRevenuePerformanceKPIs`, `aggregateCashLiquidityManagementKPIs`).
- Apply `calculateHeadlineCurrentAverage` -> 0-100 score.

To avoid logic drift, extract these pure functions into a shared module imported by **both** the dashboard and the cron route.

## Data flow
1. Route POST is called -> **no auth check**.
2. Enumerate hierarchy:
   - Provinces: 10 entries from `ProvinceService` / `/api/provinces`.
   - Districts: `GET https://smartbackend.whencefinancesystem.com/districts` (each has `province_id`).
   - Offices: `GET https://smartbackend.whencefinancesystem.com/offices` (each has `province_id`, `district_id`).
3. For each entity, fetch all 16 KPIs at its level (branch/province/district variants exist for every KPI - confirmed in `src/services/*`).
4. Compute score via the shared scoring module.
5. Save checkpoint: `POST https://smartbackend.whencefinancesystem.com/overall-score-checkpoint` with `{ office_id, score, type }` where `type` = `branch` / `province` / `district`.
6. Return a summary (counts, successes/failures per entity).

## Ordered tasks
1. **Create shared scoring module** `src/lib/overallScore.ts`:
   - Move the pure functions out of `InstitutionalHealthSummary.tsx`: `getScore`, `getAggregateScore`, `getAggregateWeight`, `formatAvg`, `getKpiInstitutionalAvg`, `getFixedKpiInstitutionalAvg`, `calculateSimpleAverage`, `calculateHeadlineCurrentAverage`, `calculateHeadlineInstitutionalAverage`, the 6 `aggregate*` functions, `getParameterKPIs`, and the `ParameterSummary`/`KPI` type imports.
   - Export a single `computeOverallScore(kpisByParameter, userLevel)` returning the 0-100 number.
2. **Refactor the dashboard** to import from the shared module (no behavior change; verify build/lint).
3. **Rewrite `/api/cron/overall-score/route.ts`**:
   - **Remove the `CRON_SECRET` const and the Bearer-token `authorization` check entirely** - no password auth.
   - Accept a `mode` param (e.g., `full`).
   - In `full` mode: walk the hierarchy, fetch KPIs, compute, save checkpoints, return summary.
   - Keep existing single-score logging behavior intact for backward compatibility.
4. **Add KPI fetch helpers** for the cron context (server-side `fetch`, no client cache). Reuse existing `src/services/*` functions where possible; they already target the right per-level URLs.
5. **Error handling**: per-entity try/catch so one bad entity does not abort the whole run; collect failures into the response; consider a run-log table if persistence is desired later (out of scope unless cheap).
6. **Document the schedule**: instruct the user to point an external cron at `POST /api/cron/overall-score` with body `{"mode":"full"}`, monthly. No auth header needed.

## Validation
- Run the route manually (curl/Postman, no auth header) and confirm it returns a summary with the expected entity counts and no per-entity errors.
- Spot-check 2-3 saved checkpoints against the same entity's dashboard "Overall Health Score" - they should match (this is the point of reusing the frontend math).
- Run `npm run lint` and `npm run build` after the refactor.

## Open / out of scope
- Institution and consultant levels - not included this pass.
- Persisting run logs to a DB table - deferred.
- Choosing the exact day/time of the month - depends on the external scheduler.
- Re-adding password protection - optional, gate behind an env var defaulting to off.