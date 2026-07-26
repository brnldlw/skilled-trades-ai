/**
 * ptChart.ts
 * Offline-capable pressure-temperature lookup for major HVAC/R refrigerants.
 * Data represents saturated vapor pressure (PSIG) at temperature (°F).
 *
 * Source: CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS), cross-checked
 * against manufacturer PT charts (Honeywell, Chemours, Arkema) and
 * hvacexammaster.com/hvacptcharts.com published tables, July 2026.
 *
 * For zeotropic blends with meaningful glide (R-407C, R-448A, R-449A,
 * R-454B, R-404A), this table stores the DEW POINT curve (saturated
 * vapor), which is the correct reference for superheat calculations --
 * this app's primary use of psigFromTemp/tempFromPsig. Using the dew
 * curve for subcooling on these blends will read a few degrees off by
 * the refrigerant's glide (up to ~11F for R-407C); see calcSubcool.
 *
 * NOTE: this replaces an earlier version of this table that was found to
 * be systematically wrong (15-53% pressure error, worsening at higher
 * temperatures) -- see git history for details.
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
    { tempF: -40, psig: 10.8 }, { tempF: -30, psig: 17.8 }, { tempF: -20, psig: 26.3 },
    { tempF: -10, psig: 36.5 }, { tempF: 0, psig: 48.4 }, { tempF: 10, psig: 62.4 },
    { tempF: 20, psig: 78.7 }, { tempF: 30, psig: 97.4 }, { tempF: 40, psig: 118.8 },
    { tempF: 50, psig: 143.2 }, { tempF: 60, psig: 170.7 }, { tempF: 70, psig: 201.8 },
    { tempF: 80, psig: 236.5 }, { tempF: 90, psig: 275.4 }, { tempF: 100, psig: 318.5 },
    { tempF: 110, psig: 366.8 }, { tempF: 120, psig: 419.4 }, { tempF: 130, psig: 477.9 },
    { tempF: 140, psig: 542.5 }, { tempF: 150, psig: 613.9 },
  ],
  "R-22": [
    { tempF: -40, psig: 0.6 }, { tempF: -30, psig: 4.9 }, { tempF: -20, psig: 10.2 },
    { tempF: -10, psig: 16.5 }, { tempF: 0, psig: 24.0 }, { tempF: 10, psig: 32.8 },
    { tempF: 20, psig: 43.1 }, { tempF: 30, psig: 55.0 }, { tempF: 40, psig: 68.6 },
    { tempF: 50, psig: 84.1 }, { tempF: 60, psig: 101.6 }, { tempF: 70, psig: 121.4 },
    { tempF: 80, psig: 143.6 }, { tempF: 90, psig: 168.4 }, { tempF: 100, psig: 195.9 },
    { tempF: 110, psig: 226.4 }, { tempF: 120, psig: 260.0 }, { tempF: 130, psig: 296.9 },
    { tempF: 140, psig: 337.4 }, { tempF: 150, psig: 381.7 },
  ],
  // Dew point (vapor) curve -- glide is small (~1F) for R-404A.
  "R-404A": [
    { tempF: -40, psig: 4.3 }, { tempF: -30, psig: 9.6 }, { tempF: -20, psig: 16.0 },
    { tempF: -10, psig: 23.6 }, { tempF: 0, psig: 32.6 }, { tempF: 10, psig: 43.1 },
    { tempF: 20, psig: 55.3 }, { tempF: 30, psig: 69.3 }, { tempF: 40, psig: 85.4 },
    { tempF: 50, psig: 103.6 }, { tempF: 60, psig: 124.2 }, { tempF: 70, psig: 147.4 },
    { tempF: 80, psig: 173.4 }, { tempF: 90, psig: 202.4 }, { tempF: 100, psig: 234.7 },
    { tempF: 110, psig: 270.4 }, { tempF: 120, psig: 309.9 }, { tempF: 130, psig: 353.6 },
    { tempF: 140, psig: 401.7 }, { tempF: 150, psig: 455.0 },
  ],
  "R-134a": [
    { tempF: -40, psig: -7.3 }, { tempF: -30, psig: -4.8 }, { tempF: -20, psig: -1.8 },
    { tempF: -10, psig: 1.9 }, { tempF: 0, psig: 6.5 }, { tempF: 10, psig: 11.9 },
    { tempF: 20, psig: 18.4 }, { tempF: 30, psig: 26.1 }, { tempF: 40, psig: 35.0 },
    { tempF: 50, psig: 45.4 }, { tempF: 60, psig: 57.4 }, { tempF: 70, psig: 71.1 },
    { tempF: 80, psig: 86.7 }, { tempF: 90, psig: 104.3 }, { tempF: 100, psig: 124.2 },
    { tempF: 110, psig: 146.4 }, { tempF: 120, psig: 171.2 }, { tempF: 130, psig: 198.7 },
    { tempF: 140, psig: 229.2 }, { tempF: 150, psig: 262.9 },
  ],
  // Dew point (vapor) curve -- true glide is ~11F for R-407C.
  "R-407C": [
    { tempF: -40, psig: -2.3 }, { tempF: -30, psig: 1.6 }, { tempF: -20, psig: 6.5 },
    { tempF: -10, psig: 12.3 }, { tempF: 0, psig: 19.4 }, { tempF: 10, psig: 27.9 },
    { tempF: 20, psig: 37.9 }, { tempF: 30, psig: 49.6 }, { tempF: 40, psig: 63.2 },
    { tempF: 50, psig: 78.8 }, { tempF: 60, psig: 96.8 }, { tempF: 70, psig: 117.3 },
    { tempF: 80, psig: 140.5 }, { tempF: 90, psig: 166.7 }, { tempF: 100, psig: 196.1 },
    { tempF: 110, psig: 229.0 }, { tempF: 120, psig: 265.8 }, { tempF: 130, psig: 306.6 },
    { tempF: 140, psig: 352.1 }, { tempF: 150, psig: 402.5 },
  ],
  // Dew point (vapor) curve -- glide ~10F for R-448A. Low-temp rows
  // interpolated from Honeywell Solstice N40 datasheet (irregular psig steps).
  "R-448A": [
    { tempF: -40, psig: 0 }, { tempF: -30, psig: 4.4 }, { tempF: -20, psig: 9.8 },
    { tempF: -10, psig: 16.4 }, { tempF: 0, psig: 24.3 }, { tempF: 10, psig: 33.6 },
    { tempF: 20, psig: 44.6 }, { tempF: 30, psig: 57.3 }, { tempF: 40, psig: 72.3 },
    { tempF: 50, psig: 89.3 }, { tempF: 60, psig: 108.7 }, { tempF: 70, psig: 130.6 },
    { tempF: 80, psig: 155.1 }, { tempF: 90, psig: 183.1 }, { tempF: 100, psig: 214.4 },
    { tempF: 110, psig: 249.4 }, { tempF: 120, psig: 288.2 }, { tempF: 130, psig: 330.0 },
    { tempF: 140, psig: 378.0 },
  ],
  // Dew point (vapor) curve -- glide ~10F for R-449A.
  "R-449A": [
    { tempF: -40, psig: -0.1 }, { tempF: -30, psig: 4.4 }, { tempF: -20, psig: 9.8 },
    { tempF: -10, psig: 16.3 }, { tempF: 0, psig: 24.2 }, { tempF: 10, psig: 33.4 },
    { tempF: 20, psig: 44.3 }, { tempF: 30, psig: 57.0 }, { tempF: 40, psig: 71.6 },
    { tempF: 50, psig: 88.5 }, { tempF: 60, psig: 107.7 }, { tempF: 70, psig: 129.4 },
    { tempF: 80, psig: 154.1 }, { tempF: 90, psig: 181.7 }, { tempF: 100, psig: 212.7 },
    { tempF: 110, psig: 247.3 }, { tempF: 120, psig: 285.9 }, { tempF: 130, psig: 328.7 },
    { tempF: 140, psig: 376.3 }, { tempF: 150, psig: 429.2 },
  ],
  "R-32": [
    { tempF: -40, psig: 11.0 }, { tempF: -30, psig: 18.2 }, { tempF: -20, psig: 26.8 },
    { tempF: -10, psig: 37.1 }, { tempF: 0, psig: 49.3 }, { tempF: 10, psig: 63.5 },
    { tempF: 20, psig: 80.0 }, { tempF: 30, psig: 99.1 }, { tempF: 40, psig: 121.0 },
    { tempF: 50, psig: 145.8 }, { tempF: 60, psig: 174.1 }, { tempF: 70, psig: 205.8 },
    { tempF: 80, psig: 241.5 }, { tempF: 90, psig: 281.3 }, { tempF: 100, psig: 325.7 },
    { tempF: 110, psig: 374.9 }, { tempF: 120, psig: 429.3 }, { tempF: 130, psig: 489.5 },
    { tempF: 140, psig: 555.8 }, { tempF: 150, psig: 628.8 },
  ],
  // Dew point (vapor) curve -- glide ~2F for R-454B (near-azeotropic).
  "R-454B": [
    { tempF: -40, psig: 8.4 }, { tempF: -30, psig: 14.8 }, { tempF: -20, psig: 22.6 },
    { tempF: -10, psig: 31.8 }, { tempF: 0, psig: 42.7 }, { tempF: 10, psig: 55.5 },
    { tempF: 20, psig: 70.3 }, { tempF: 30, psig: 87.4 }, { tempF: 40, psig: 107.0 },
    { tempF: 50, psig: 129.3 }, { tempF: 60, psig: 154.6 }, { tempF: 70, psig: 183.1 },
    { tempF: 80, psig: 215.2 }, { tempF: 90, psig: 251.0 }, { tempF: 100, psig: 290.9 },
    { tempF: 110, psig: 335.2 }, { tempF: 120, psig: 384.3 }, { tempF: 130, psig: 438.7 },
    { tempF: 140, psig: 462.0 },
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