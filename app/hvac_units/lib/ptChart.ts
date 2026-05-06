/**
 * ptChart.ts
 * Offline-capable pressure-temperature lookup for major HVAC/R refrigerants.
 * Data represents saturated vapor pressure (PSIG) at temperature (°F).
 * Sources: ASHRAE Fundamentals, manufacturer PT charts.
 */

export type PTEntry = {
  tempF: number;
  psig: number;
};

// ─────────────────────────────────────────────────────────────
// Refrigerant PT Tables (saturated, °F → PSIG)
// ─────────────────────────────────────────────────────────────

export const PT_TABLES: Record<string, PTEntry[]> = {
  "R-410A": [
    { tempF: -40, psig: 13.5 }, { tempF: -30, psig: 21.4 }, { tempF: -20, psig: 31.6 },
    { tempF: -10, psig: 44.3 }, { tempF: 0, psig: 59.9 }, { tempF: 5, psig: 69.0 },
    { tempF: 10, psig: 78.9 }, { tempF: 15, psig: 89.7 }, { tempF: 20, psig: 101.6 },
    { tempF: 25, psig: 114.5 }, { tempF: 30, psig: 128.6 }, { tempF: 35, psig: 143.9 },
    { tempF: 40, psig: 160.5 }, { tempF: 45, psig: 178.5 }, { tempF: 50, psig: 198.0 },
    { tempF: 55, psig: 218.9 }, { tempF: 60, psig: 241.4 }, { tempF: 65, psig: 265.6 },
    { tempF: 70, psig: 291.5 }, { tempF: 75, psig: 319.2 }, { tempF: 80, psig: 348.7 },
    { tempF: 85, psig: 380.2 }, { tempF: 90, psig: 413.6 }, { tempF: 95, psig: 449.1 },
    { tempF: 100, psig: 486.8 }, { tempF: 105, psig: 526.7 }, { tempF: 110, psig: 568.9 },
    { tempF: 115, psig: 613.7 }, { tempF: 120, psig: 660.9 }, { tempF: 130, psig: 762.3 },
    { tempF: 140, psig: 874.3 },
  ],
  "R-22": [
    { tempF: -40, psig: 0.5 }, { tempF: -30, psig: 4.9 }, { tempF: -20, psig: 10.1 },
    { tempF: -10, psig: 16.6 }, { tempF: 0, psig: 24.8 }, { tempF: 5, psig: 29.4 },
    { tempF: 10, psig: 34.6 }, { tempF: 15, psig: 40.4 }, { tempF: 20, psig: 46.7 },
    { tempF: 25, psig: 53.8 }, { tempF: 30, psig: 61.5 }, { tempF: 35, psig: 69.9 },
    { tempF: 40, psig: 79.0 }, { tempF: 45, psig: 88.9 }, { tempF: 50, psig: 99.6 },
    { tempF: 55, psig: 111.2 }, { tempF: 60, psig: 123.7 }, { tempF: 65, psig: 137.2 },
    { tempF: 70, psig: 151.7 }, { tempF: 75, psig: 167.3 }, { tempF: 80, psig: 184.0 },
    { tempF: 85, psig: 201.9 }, { tempF: 90, psig: 221.1 }, { tempF: 95, psig: 241.5 },
    { tempF: 100, psig: 263.2 }, { tempF: 105, psig: 286.4 }, { tempF: 110, psig: 311.0 },
    { tempF: 115, psig: 337.1 }, { tempF: 120, psig: 364.7 }, { tempF: 130, psig: 424.8 },
    { tempF: 140, psig: 491.5 },
  ],
  "R-404A": [
    { tempF: -40, psig: 12.0 }, { tempF: -30, psig: 19.0 }, { tempF: -20, psig: 27.8 },
    { tempF: -10, psig: 38.8 }, { tempF: 0, psig: 52.0 }, { tempF: 5, psig: 59.8 },
    { tempF: 10, psig: 68.2 }, { tempF: 15, psig: 77.4 }, { tempF: 20, psig: 87.5 },
    { tempF: 25, psig: 98.5 }, { tempF: 30, psig: 110.5 }, { tempF: 35, psig: 123.4 },
    { tempF: 40, psig: 137.4 }, { tempF: 45, psig: 152.6 }, { tempF: 50, psig: 168.8 },
    { tempF: 55, psig: 186.4 }, { tempF: 60, psig: 205.1 }, { tempF: 65, psig: 225.2 },
    { tempF: 70, psig: 246.7 }, { tempF: 75, psig: 269.6 }, { tempF: 80, psig: 293.9 },
    { tempF: 85, psig: 319.9 }, { tempF: 90, psig: 347.3 }, { tempF: 95, psig: 376.5 },
    { tempF: 100, psig: 407.3 }, { tempF: 110, psig: 474.3 }, { tempF: 120, psig: 548.3 },
  ],
  "R-134a": [
    { tempF: -40, psig: 0 }, { tempF: -30, psig: 2.4 }, { tempF: -20, psig: 5.9 },
    { tempF: -10, psig: 10.8 }, { tempF: 0, psig: 17.1 }, { tempF: 5, psig: 20.7 },
    { tempF: 10, psig: 24.6 }, { tempF: 15, psig: 29.0 }, { tempF: 20, psig: 33.9 },
    { tempF: 25, psig: 39.3 }, { tempF: 30, psig: 45.2 }, { tempF: 35, psig: 51.7 },
    { tempF: 40, psig: 58.8 }, { tempF: 45, psig: 66.5 }, { tempF: 50, psig: 74.9 },
    { tempF: 55, psig: 83.9 }, { tempF: 60, psig: 93.7 }, { tempF: 65, psig: 104.2 },
    { tempF: 70, psig: 115.5 }, { tempF: 75, psig: 127.6 }, { tempF: 80, psig: 140.6 },
    { tempF: 85, psig: 154.5 }, { tempF: 90, psig: 169.3 }, { tempF: 95, psig: 185.0 },
    { tempF: 100, psig: 201.7 }, { tempF: 110, psig: 237.7 }, { tempF: 120, psig: 277.4 },
    { tempF: 130, psig: 321.2 }, { tempF: 140, psig: 369.7 },
  ],
  "R-407C": [
    { tempF: -40, psig: 5.0 }, { tempF: -30, psig: 11.0 }, { tempF: -20, psig: 18.8 },
    { tempF: -10, psig: 28.3 }, { tempF: 0, psig: 39.7 }, { tempF: 5, psig: 46.0 },
    { tempF: 10, psig: 52.9 }, { tempF: 15, psig: 60.5 }, { tempF: 20, psig: 68.8 },
    { tempF: 25, psig: 77.8 }, { tempF: 30, psig: 87.6 }, { tempF: 35, psig: 98.3 },
    { tempF: 40, psig: 109.8 }, { tempF: 45, psig: 122.2 }, { tempF: 50, psig: 135.5 },
    { tempF: 55, psig: 149.8 }, { tempF: 60, psig: 165.2 }, { tempF: 65, psig: 181.7 },
    { tempF: 70, psig: 199.3 }, { tempF: 75, psig: 218.2 }, { tempF: 80, psig: 238.3 },
    { tempF: 85, psig: 259.7 }, { tempF: 90, psig: 282.5 }, { tempF: 95, psig: 306.8 },
    { tempF: 100, psig: 332.6 }, { tempF: 110, psig: 388.5 }, { tempF: 120, psig: 450.9 },
  ],
  "R-448A": [
    { tempF: -40, psig: 8.9 }, { tempF: -30, psig: 15.6 }, { tempF: -20, psig: 24.0 },
    { tempF: -10, psig: 34.3 }, { tempF: 0, psig: 46.6 }, { tempF: 5, psig: 53.6 },
    { tempF: 10, psig: 61.3 }, { tempF: 15, psig: 69.6 }, { tempF: 20, psig: 78.8 },
    { tempF: 25, psig: 88.8 }, { tempF: 30, psig: 99.7 }, { tempF: 35, psig: 111.5 },
    { tempF: 40, psig: 124.4 }, { tempF: 45, psig: 138.3 }, { tempF: 50, psig: 153.3 },
    { tempF: 55, psig: 169.5 }, { tempF: 60, psig: 186.9 }, { tempF: 65, psig: 205.7 },
    { tempF: 70, psig: 225.8 }, { tempF: 75, psig: 247.4 }, { tempF: 80, psig: 270.5 },
    { tempF: 85, psig: 295.1 }, { tempF: 90, psig: 321.4 }, { tempF: 95, psig: 349.3 },
    { tempF: 100, psig: 378.9 }, { tempF: 110, psig: 443.1 }, { tempF: 120, psig: 514.2 },
  ],
  "R-449A": [
    { tempF: -40, psig: 9.0 }, { tempF: -30, psig: 15.8 }, { tempF: -20, psig: 24.3 },
    { tempF: -10, psig: 34.7 }, { tempF: 0, psig: 47.2 }, { tempF: 5, psig: 54.3 },
    { tempF: 10, psig: 62.1 }, { tempF: 15, psig: 70.6 }, { tempF: 20, psig: 79.9 },
    { tempF: 25, psig: 90.1 }, { tempF: 30, psig: 101.2 }, { tempF: 35, psig: 113.2 },
    { tempF: 40, psig: 126.3 }, { tempF: 45, psig: 140.4 }, { tempF: 50, psig: 155.7 },
    { tempF: 55, psig: 172.2 }, { tempF: 60, psig: 189.9 }, { tempF: 65, psig: 209.0 },
    { tempF: 70, psig: 229.5 }, { tempF: 75, psig: 251.5 }, { tempF: 80, psig: 275.1 },
    { tempF: 85, psig: 300.3 }, { tempF: 90, psig: 327.1 }, { tempF: 95, psig: 355.7 },
    { tempF: 100, psig: 386.1 }, { tempF: 110, psig: 452.1 }, { tempF: 120, psig: 524.8 },
  ],
  "R-32": [
    { tempF: -40, psig: 10.5 }, { tempF: -30, psig: 18.3 }, { tempF: -20, psig: 27.9 },
    { tempF: -10, psig: 39.6 }, { tempF: 0, psig: 54.0 }, { tempF: 5, psig: 62.2 },
    { tempF: 10, psig: 71.3 }, { tempF: 15, psig: 81.2 }, { tempF: 20, psig: 92.2 },
    { tempF: 25, psig: 104.2 }, { tempF: 30, psig: 117.3 }, { tempF: 35, psig: 131.6 },
    { tempF: 40, psig: 147.1 }, { tempF: 45, psig: 163.9 }, { tempF: 50, psig: 182.2 },
    { tempF: 55, psig: 201.8 }, { tempF: 60, psig: 223.0 }, { tempF: 65, psig: 245.9 },
    { tempF: 70, psig: 270.5 }, { tempF: 75, psig: 296.8 }, { tempF: 80, psig: 325.0 },
    { tempF: 85, psig: 355.1 }, { tempF: 90, psig: 387.2 }, { tempF: 95, psig: 421.4 },
    { tempF: 100, psig: 457.7 }, { tempF: 110, psig: 537.2 }, { tempF: 120, psig: 625.0 },
  ],
  "R-454B": [
    { tempF: -40, psig: 12.8 }, { tempF: -30, psig: 20.5 }, { tempF: -20, psig: 30.4 },
    { tempF: -10, psig: 42.4 }, { tempF: 0, psig: 57.1 }, { tempF: 5, psig: 65.7 },
    { tempF: 10, psig: 75.1 }, { tempF: 15, psig: 85.5 }, { tempF: 20, psig: 96.9 },
    { tempF: 25, psig: 109.4 }, { tempF: 30, psig: 123.0 }, { tempF: 35, psig: 137.9 },
    { tempF: 40, psig: 154.1 }, { tempF: 45, psig: 171.6 }, { tempF: 50, psig: 190.5 },
    { tempF: 55, psig: 211.0 }, { tempF: 60, psig: 232.9 }, { tempF: 65, psig: 256.5 },
    { tempF: 70, psig: 281.7 }, { tempF: 75, psig: 308.6 }, { tempF: 80, psig: 337.4 },
    { tempF: 85, psig: 367.9 }, { tempF: 90, psig: 400.4 }, { tempF: 95, psig: 434.8 },
    { tempF: 100, psig: 471.2 }, { tempF: 110, psig: 551.3 }, { tempF: 120, psig: 640.2 },
  ],
};

// ─────────────────────────────────────────────────────────────
// Interpolation utility
// ─────────────────────────────────────────────────────────────

/** Linear interpolation between two PT entries */
function lerp(a: PTEntry, b: PTEntry, t: number): number {
  return a.psig + (b.psig - a.psig) * t;
}

/**
 * Look up saturated pressure (PSIG) for a given refrigerant and temp (°F).
 * Returns null if refrigerant not in table or temp out of range.
 */
export function psigFromTemp(refrigerant: string, tempF: number): number | null {
  const table = PT_TABLES[refrigerant];
  if (!table) return null;

  if (tempF <= table[0].tempF) return table[0].psig;
  if (tempF >= table[table.length - 1].tempF) return table[table.length - 1].psig;

  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (tempF >= lo.tempF && tempF <= hi.tempF) {
      const t = (tempF - lo.tempF) / (hi.tempF - lo.tempF);
      return Math.round(lerp(lo, hi, t) * 10) / 10;
    }
  }
  return null;
}

/**
 * Look up saturated temp (°F) for a given refrigerant and pressure (PSIG).
 * Returns null if refrigerant not in table or pressure out of range.
 */
export function tempFromPsig(refrigerant: string, psig: number): number | null {
  const table = PT_TABLES[refrigerant];
  if (!table) return null;

  if (psig <= table[0].psig) return table[0].tempF;
  if (psig >= table[table.length - 1].psig) return table[table.length - 1].tempF;

  for (let i = 0; i < table.length - 1; i++) {
    const lo = table[i];
    const hi = table[i + 1];
    if (psig >= lo.psig && psig <= hi.psig) {
      const t = (psig - lo.psig) / (hi.psig - lo.psig);
      const tempResult = lo.tempF + (hi.tempF - lo.tempF) * t;
      return Math.round(tempResult * 10) / 10;
    }
  }
  return null;
}

/** List all refrigerants that have PT data */
export function availableRefrigerants(): string[] {
  return Object.keys(PT_TABLES);
}

/** Get the full table for display */
export function getPTTable(refrigerant: string): PTEntry[] | null {
  return PT_TABLES[refrigerant] ?? null;
}

// ─────────────────────────────────────────────────────────────
// Superheat / Subcooling helpers
// ─────────────────────────────────────────────────────────────

export type SuperheatResult = {
  suctionSatTempF: number | null;
  superheatF: number | null;
  status: "low" | "normal" | "high" | "very_high" | "unknown";
  note: string;
};

export type SubcoolResult = {
  condSatTempF: number | null;
  subcoolF: number | null;
  status: "low" | "normal" | "high" | "unknown";
  note: string;
};

/**
 * Calculate superheat from suction pressure + suction line temp.
 * TXV systems: target 8–12°F. Fixed orifice: use manufacturer chart.
 */
export function calcSuperheat(
  refrigerant: string,
  suctionPsig: number,
  suctionLineTempF: number,
  metering: "txv" | "fixed_orifice" = "txv"
): SuperheatResult {
  const satTemp = tempFromPsig(refrigerant, suctionPsig);
  if (satTemp === null) {
    return { suctionSatTempF: null, superheatF: null, status: "unknown", note: "Refrigerant PT data unavailable." };
  }

  const sh = Math.round((suctionLineTempF - satTemp) * 10) / 10;

  let status: SuperheatResult["status"];
  let note: string;

  if (metering === "txv") {
    if (sh < 4) { status = "low"; note = "Superheat dangerously low — risk of liquid slugging the compressor. Check TXV bulb charge, TXV setting, or overcharge."; }
    else if (sh < 8) { status = "low"; note = "Slightly low superheat. Possible overcharge, poor TXV bulb contact, or low load condition."; }
    else if (sh <= 12) { status = "normal"; note = "Superheat within normal TXV range (8–12°F). System is likely properly charged."; }
    else if (sh <= 20) { status = "high"; note = "High superheat. Suspect low charge, restricted filter-drier, TXV starving, or low evaporator airflow."; }
    else { status = "very_high"; note = "Very high superheat. Check for significant low charge, badly restricted metering device, or evaporator coil restriction."; }
  } else {
    // Fixed orifice: target varies by outdoor + return air temp, rough normal is 10–20°F
    if (sh < 5) { status = "low"; note = "Very low superheat on fixed orifice — possible overcharge or flooding."; }
    else if (sh <= 20) { status = "normal"; note = "Superheat in typical fixed orifice range. Verify against manufacturer target chart for ambient + return air conditions."; }
    else if (sh <= 30) { status = "high"; note = "High superheat. Check charge level, airflow, and metering device for restrictions."; }
    else { status = "very_high"; note = "Very high superheat — significant undercharge or metering device restriction."; }
  }

  return { suctionSatTempF: satTemp, superheatF: sh, status, note };
}

/**
 * Calculate subcooling from liquid line pressure + liquid line temp.
 * Normal range: 10–20°F for most TXV systems. Low SC = undercharge, high SC = overcharge or restrictions.
 */
export function calcSubcool(
  refrigerant: string,
  liquidLinePsig: number,
  liquidLineTempF: number
): SubcoolResult {
  const satTemp = tempFromPsig(refrigerant, liquidLinePsig);
  if (satTemp === null) {
    return { condSatTempF: null, subcoolF: null, status: "unknown", note: "Refrigerant PT data unavailable." };
  }

  const sc = Math.round((satTemp - liquidLineTempF) * 10) / 10;

  let status: SubcoolResult["status"];
  let note: string;

  if (sc < 5) { status = "low"; note = "Low subcooling — indicates undercharge or liquid line restriction causing flash gas before the metering device."; }
  else if (sc <= 20) { status = "normal"; note = "Subcooling within normal range (10–20°F). Charge level is likely correct."; }
  else { status = "high"; note = "High subcooling — possible overcharge, liquid line too long, or condenser subcooling coil issue."; }

  return { condSatTempF: satTemp, subcoolF: sc, status, note };
}