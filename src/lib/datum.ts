const MAANDEN: Record<string, number> = {
  januari: 0, februari: 1, maart: 2, april: 3, mei: 4, juni: 5,
  juli: 6, augustus: 7, september: 8, oktober: 9, november: 10, december: 11,
};

/** Zelfde gedrag als parseNLDatum() in de oude main.js: "12 januari 2026" -> timestamp, anders 0. */
export function parseNLDatum(d: string | undefined | null): number {
  if (!d) return 0;
  const delen = d.trim().split(/\s+/);
  if (delen.length >= 2) {
    const dag = parseInt(delen[0], 10);
    const maand = MAANDEN[delen[1].toLowerCase()];
    const jaar = delen.length >= 3 ? parseInt(delen[2], 10) : new Date().getFullYear();
    if (!isNaN(dag) && maand !== undefined && !isNaN(jaar)) return new Date(jaar, maand, dag).getTime();
  }
  return 0;
}
