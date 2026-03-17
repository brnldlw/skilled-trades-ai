export function normalizeLabel(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getObservationValue(
  observations: { label: string; value: string }[],
  label: string
): number | null {
  const target = normalizeLabel(label);
  const found = observations.find((o) => normalizeLabel(o.label) === target);
  if (!found) return null;

  const n = Number(String(found.value).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function ptEstimateTempF(refrigerant: string, psi: number): number | null {
  const ref = refrigerant.trim().toUpperCase();

  const tables: Record<string, Array<[number, number]>> = {
    "R-22": [
      [58, 32],
      [84, 50],
      [144, 80],
      [211, 110],
    ],
    "R-410A": [
      [102, 32],
      [143, 50],
      [235, 80],
      [337, 110],
    ],
    "R-134A": [
      [18, 20],
      [35, 40],
      [71, 70],
      [124, 100],
    ],
    "R-404A": [
      [35, 10],
      [51, 20],
      [86, 40],
      [144, 70],
    ],
    "R-407C": [
      [70, 40],
      [109, 60],
      [172, 90],
      [247, 120],
    ],
  };

  const pts = tables[ref];
  if (!pts || pts.length < 2) return null;

  if (psi <= pts[0][0]) return pts[0][1];
  if (psi >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];

  for (let i = 1; i < pts.length; i++) {
    const [p2, t2] = pts[i];
    const [p1, t1] = pts[i - 1];
    if (psi <= p2) {
      const ratio = (psi - p1) / (p2 - p1);
      return Math.round((t1 + ratio * (t2 - t1)) * 10) / 10;
    }
  }

  return null;
}