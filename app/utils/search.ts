export function matchesQuery(fields: (string | null)[], lowerQuery: string): boolean {
  if (!lowerQuery) return true;
  return fields.some((f) => f != null && f.toLowerCase().includes(lowerQuery));
}
