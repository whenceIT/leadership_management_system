// Consolidated helper for counting actual Loan Consultants (filled positions).
// Mirrors ConsultantLevelView's `actualLCs = users.length` (the real number of
// active consultants). Used uniformly across province / district / branch levels
// so the "Total Staff" column is identical for Staff Adequacy Score and Vacancy Impact.
export function getActualLCs(data: any): number {
  if (!data) return 0;

  const direct = data.actual_lcs ?? data.total_actual_lcs ?? data.total_staff;
  if (typeof direct === 'number' && direct > 0) return direct;

  const branchArray: any[] = Array.isArray(data) ? data : (data.branches ?? []);
  if (branchArray.length > 0) {
    return branchArray.reduce(
      (sum: number, b: any) => sum + (Number(b.actual_lcs || b.total_staff || 0)),
      0
    );
  }

  return 0;
}
