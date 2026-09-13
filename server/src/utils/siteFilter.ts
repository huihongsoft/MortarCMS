// Admin content lists can optionally be filtered by site. Accepted values for
// the `siteId` query parameter:
//   (absent) / 'all' → every site (no filter)
//   'global'         → only content not bound to a site (siteId IS NULL)
//   <site id>        → only that site's content
// The column name is injectable so callers can pass an aliased column
// ('p.siteId'); it is never taken from user input.
export function siteFilterClause(value: unknown, column = 'siteId'): { clause: string; params: any[] } {
  const v = value === undefined || value === null ? 'all' : String(value);
  if (v === '' || v === 'all') return { clause: '', params: [] };
  if (v === 'global') return { clause: ` AND ${column} IS NULL`, params: [] };
  return { clause: ` AND ${column} = ?`, params: [v] };
}
