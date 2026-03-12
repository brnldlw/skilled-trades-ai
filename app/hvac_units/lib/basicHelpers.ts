export function toNumber(s: string): number | null {
  const n = Number(String(s).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
