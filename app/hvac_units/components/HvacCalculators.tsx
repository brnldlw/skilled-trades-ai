"use client";

import React, { useState, useMemo } from "react";
import {
  psigFromTemp,
  tempFromPsig,
  calcSuperheat,
  calcSubcool,
  availableRefrigerants,
} from "../lib/ptChart";

// ─── tiny shared styles ───────────────────────────────────────────────
const card: React.CSSProperties = {
  border: "1px solid #dde4f0",
  borderRadius: 10,
  padding: 14,
  background: "#fff",
  marginBottom: 12,
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#555",
  marginBottom: 4,
  marginTop: 10,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fafafa",
};

const select: React.CSSProperties = { ...input };

const resultBox = (ok: boolean): React.CSSProperties => ({
  marginTop: 12,
  padding: 12,
  borderRadius: 8,
  background: ok ? "#f0faf4" : "#fff7f0",
  border: `1px solid ${ok ? "#b2dfcc" : "#f5c6a0"}`,
  fontSize: 13,
  lineHeight: 1.6,
});

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 12,
  border: `1px solid ${active ? "#2563eb" : "#dde4f0"}`,
  borderRadius: 20,
  background: active ? "#2563eb" : "#fff",
  color: active ? "#fff" : "#444",
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
});

const sectionTitle: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 14,
  color: "#1a1a2e",
  marginBottom: 2,
};

// ─── helpers ─────────────────────────────────────────────────
function n(v: string): number { return parseFloat(v) || 0; }
function round1(v: number): number { return Math.round(v * 10) / 10; }

type Tab = "pt" | "shsc" | "deltat" | "cfm" | "ohm" | "mfd" | "gas";

// ═══════════════════════════════════════════════════════════════
// PT Chart Tab
// ═══════════════════════════════════════════════════════════════
function PTChartCalc() {
  const refOpts = availableRefrigerants();
  const [ref, setRef] = useState("R-410A");
  const [mode, setMode] = useState<"psig_to_temp" | "temp_to_psig">("psig_to_temp");
  const [psigVal, setPsigVal] = useState("");
  const [tempVal, setTempVal] = useState("");

  const result = useMemo(() => {
    if (mode === "psig_to_temp") {
      const p = n(psigVal);
      if (!psigVal) return null;
      const t = tempFromPsig(ref, p);
      return t !== null ? `Saturation Temp = ${t}°F` : "Out of range for this refrigerant.";
    } else {
      const t = n(tempVal);
      if (!tempVal) return null;
      const p = psigFromTemp(ref, t);
      return p !== null ? `Saturation Pressure = ${p} PSIG` : "Out of range for this refrigerant.";
    }
  }, [ref, mode, psigVal, tempVal]);

  return (
    <div>
      <div style={sectionTitle}>PT Chart — Saturation Lookup</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Convert between pressure and saturation temperature for any refrigerant. Works offline.
      </p>

      <label style={label}>Refrigerant</label>
      <select style={select} value={ref} onChange={(e) => setRef(e.target.value)}>
        {refOpts.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <label style={label}>Convert</label>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button style={tabBtn(mode === "psig_to_temp")} onClick={() => setMode("psig_to_temp")}>
          PSIG → Sat. Temp
        </button>
        <button style={tabBtn(mode === "temp_to_psig")} onClick={() => setMode("temp_to_psig")}>
          Temp → PSIG
        </button>
      </div>

      {mode === "psig_to_temp" ? (
        <>
          <label style={label}>Gauge Pressure (PSIG)</label>
          <input style={input} type="number" placeholder="e.g. 120" value={psigVal}
            onChange={(e) => setPsigVal(e.target.value)} />
        </>
      ) : (
        <>
          <label style={label}>Temperature (°F)</label>
          <input style={input} type="number" placeholder="e.g. 40" value={tempVal}
            onChange={(e) => setTempVal(e.target.value)} />
        </>
      )}

      {result && (
        <div style={resultBox(true)}>
          <strong>{ref}</strong> — {result}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Superheat / Subcooling Tab
// ═══════════════════════════════════════════════════════════════
function ShScCalc() {
  const refOpts = availableRefrigerants();
  const [ref, setRef] = useState("R-410A");
  const [mode, setMode] = useState<"sh" | "sc">("sh");
  const [metering, setMetering] = useState<"txv" | "fixed_orifice">("txv");

  // SH fields
  const [suctionPsig, setSuctionPsig] = useState("");
  const [suctionLineTemp, setSuctionLineTemp] = useState("");

  // SC fields
  const [liquidPsig, setLiquidPsig] = useState("");
  const [liquidLineTemp, setLiquidLineTemp] = useState("");

  const shResult = useMemo(() => {
    if (mode !== "sh" || !suctionPsig || !suctionLineTemp) return null;
    return calcSuperheat(ref, n(suctionPsig), n(suctionLineTemp), metering);
  }, [ref, mode, metering, suctionPsig, suctionLineTemp]);

  const scResult = useMemo(() => {
    if (mode !== "sc" || !liquidPsig || !liquidLineTemp) return null;
    return calcSubcool(ref, n(liquidPsig), n(liquidLineTemp));
  }, [ref, mode, liquidPsig, liquidLineTemp]);

  const statusColor = (s: string) => {
    if (s === "normal") return true;
    return false;
  };

  return (
    <div>
      <div style={sectionTitle}>Superheat / Subcooling Calculator</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Enter gauge readings to instantly calculate SH or SC with diagnosis.
      </p>

      <label style={label}>Refrigerant</label>
      <select style={select} value={ref} onChange={(e) => setRef(e.target.value)}>
        {refOpts.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button style={tabBtn(mode === "sh")} onClick={() => setMode("sh")}>Superheat</button>
        <button style={tabBtn(mode === "sc")} onClick={() => setMode("sc")}>Subcooling</button>
      </div>

      {mode === "sh" && (
        <>
          <label style={label}>Metering Device</label>
          <select style={select} value={metering} onChange={(e) => setMetering(e.target.value as any)}>
            <option value="txv">TXV / EEV</option>
            <option value="fixed_orifice">Fixed Orifice / Piston</option>
          </select>
          <label style={label}>Suction Pressure (PSIG)</label>
          <input style={input} type="number" placeholder="e.g. 120" value={suctionPsig}
            onChange={(e) => setSuctionPsig(e.target.value)} />
          <label style={label}>Suction Line Temp at Service Valve (°F)</label>
          <input style={input} type="number" placeholder="e.g. 52" value={suctionLineTemp}
            onChange={(e) => setSuctionLineTemp(e.target.value)} />
          {shResult && (
            <div style={resultBox(statusColor(shResult.status))}>
              <div><strong>Sat. Suction Temp:</strong> {shResult.suctionSatTempF}°F</div>
              <div><strong>Superheat:</strong> {shResult.superheatF}°F
                <span style={{ marginLeft: 8, fontWeight: 700, color: shResult.status === "normal" ? "#16a34a" : "#d97706" }}>
                  [{shResult.status.replace("_", " ").toUpperCase()}]
                </span>
              </div>
              <div style={{ marginTop: 8, color: "#444" }}>{shResult.note}</div>
            </div>
          )}
        </>
      )}

      {mode === "sc" && (
        <>
          <label style={label}>Liquid Line / Head Pressure (PSIG)</label>
          <input style={input} type="number" placeholder="e.g. 380" value={liquidPsig}
            onChange={(e) => setLiquidPsig(e.target.value)} />
          <label style={label}>Liquid Line Temp at Condenser Outlet (°F)</label>
          <input style={input} type="number" placeholder="e.g. 98" value={liquidLineTemp}
            onChange={(e) => setLiquidLineTemp(e.target.value)} />
          {scResult && (
            <div style={resultBox(statusColor(scResult.status))}>
              <div><strong>Sat. Condensing Temp:</strong> {scResult.condSatTempF}°F</div>
              <div><strong>Subcooling:</strong> {scResult.subcoolF}°F
                <span style={{ marginLeft: 8, fontWeight: 700, color: scResult.status === "normal" ? "#16a34a" : "#d97706" }}>
                  [{scResult.status.toUpperCase()}]
                </span>
              </div>
              <div style={{ marginTop: 8, color: "#444" }}>{scResult.note}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Delta-T Tab
// ═══════════════════════════════════════════════════════════════
function DeltaTCalc() {
  const [ret, setRet] = useState("");
  const [sup, setSup] = useState("");
  const [wb, setWb] = useState("");
  const [hasWb, setHasWb] = useState(false);

  const result = useMemo(() => {
    if (!ret || !sup) return null;
    const retN = n(ret);
    const supN = n(sup);
    const dt = round1(retN - supN);

    let status = "";
    let note = "";

    if (hasWb && wb) {
      const wbN = n(wb);
      const expectedDT = wbN >= 60 ? 18 : wbN >= 55 ? 17 : wbN >= 50 ? 15 : 14;
      if (dt >= expectedDT - 2 && dt <= expectedDT + 4) {
        status = "NORMAL";
        note = `Delta-T of ${dt}°F is within expected range for WB ${wbN}°F. System is likely performing correctly.`;
      } else if (dt < expectedDT - 2) {
        status = "LOW";
        note = `Delta-T is below expected ${expectedDT}°F for WB ${wbN}°F. Check airflow (dirty filter/coil), check charge.`;
      } else {
        status = "HIGH";
        note = `Delta-T is above expected for these conditions. Possible low airflow (duct restriction, dirty coil).`;
      }
    } else {
      if (dt >= 15 && dt <= 22) {
        status = "NORMAL";
        note = `Delta-T of ${dt}°F is in the typical comfort cooling range of 15–22°F.`;
      } else if (dt < 15) {
        status = "LOW";
        note = `Delta-T below 15°F — check airflow, charge, or that the unit is running in full cooling mode.`;
      } else {
        status = "HIGH";
        note = `Delta-T above 22°F — check for restricted airflow (dirty filter, blocked returns, closed supply dampers).`;
      }
    }

    return { dt, status, note };
  }, [ret, sup, wb, hasWb]);

  return (
    <div>
      <div style={sectionTitle}>Delta-T (Return / Supply) Calculator</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Measures system cooling performance. Normal sensible cooling: 15–22°F. Use WB for more accuracy.
      </p>

      <label style={label}>Return Air Temp (°F)</label>
      <input style={input} type="number" placeholder="e.g. 76" value={ret} onChange={(e) => setRet(e.target.value)} />
      <label style={label}>Supply Air Temp (°F)</label>
      <input style={input} type="number" placeholder="e.g. 58" value={sup} onChange={(e) => setSup(e.target.value)} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <input type="checkbox" id="hasWb" checked={hasWb} onChange={(e) => setHasWb(e.target.checked)} />
        <label htmlFor="hasWb" style={{ fontSize: 13, cursor: "pointer" }}>I have wet-bulb temp</label>
      </div>

      {hasWb && (
        <>
          <label style={label}>Return Air Wet Bulb (°F)</label>
          <input style={input} type="number" placeholder="e.g. 63" value={wb} onChange={(e) => setWb(e.target.value)} />
        </>
      )}

      {result && (
        <div style={resultBox(result.status === "NORMAL")}>
          <div><strong>Delta-T:</strong> {result.dt}°F
            <span style={{ marginLeft: 8, fontWeight: 700, color: result.status === "NORMAL" ? "#16a34a" : "#d97706" }}>
              [{result.status}]
            </span>
          </div>
          <div style={{ marginTop: 8 }}>{result.note}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CFM Calculator Tab
// ═══════════════════════════════════════════════════════════════
function CfmCalc() {
  const [mode, setMode] = useState<"duct" | "btuh" | "fpm">("duct");

  // Duct sizing
  const [ductW, setDuctW] = useState("");
  const [ductH, setDuctH] = useState("");
  const [ductD, setDuctD] = useState("");
  const [velocity, setVelocity] = useState("700");
  const [isRound, setIsRound] = useState(false);

  // BTU/h method
  const [btuh, setBtuh] = useState("");
  const [dt, setDt] = useState("20");

  // FPM method
  const [fpm, setFpm] = useState("");
  const [areaIn, setAreaIn] = useState("");

  const ductResult = useMemo(() => {
    const vel = n(velocity);
    if (isRound) {
      const d = n(ductD);
      if (!d || !vel) return null;
      const area = Math.PI * Math.pow(d / 12 / 2, 2);
      return round1(area * vel);
    } else {
      const w = n(ductW); const h = n(ductH);
      if (!w || !h || !vel) return null;
      const area = (w * h) / 144;
      return round1(area * vel);
    }
  }, [isRound, ductW, ductH, ductD, velocity]);

  const btuhResult = useMemo(() => {
    const b = n(btuh); const d = n(dt);
    if (!b || !d) return null;
    return round1(b / (1.085 * d));
  }, [btuh, dt]);

  const fpmResult = useMemo(() => {
    const f = n(fpm); const a = n(areaIn);
    if (!f || !a) return null;
    return round1(f * (a / 144));
  }, [fpm, areaIn]);

  return (
    <div>
      <div style={sectionTitle}>CFM Calculator</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Calculate airflow from duct size, BTU/h, or velocity measurements.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
        <button style={tabBtn(mode === "duct")} onClick={() => setMode("duct")}>Duct Size</button>
        <button style={tabBtn(mode === "btuh")} onClick={() => setMode("btuh")}>BTU/h Method</button>
        <button style={tabBtn(mode === "fpm")} onClick={() => setMode("fpm")}>FPM × Area</button>
      </div>

      {mode === "duct" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button style={tabBtn(!isRound)} onClick={() => setIsRound(false)}>Rectangular</button>
            <button style={tabBtn(isRound)} onClick={() => setIsRound(true)}>Round</button>
          </div>
          {isRound ? (
            <>
              <label style={label}>Duct Diameter (inches)</label>
              <input style={input} type="number" placeholder="e.g. 12" value={ductD} onChange={(e) => setDuctD(e.target.value)} />
            </>
          ) : (
            <>
              <label style={label}>Duct Width (inches)</label>
              <input style={input} type="number" placeholder="e.g. 20" value={ductW} onChange={(e) => setDuctW(e.target.value)} />
              <label style={label}>Duct Height (inches)</label>
              <input style={input} type="number" placeholder="e.g. 16" value={ductH} onChange={(e) => setDuctH(e.target.value)} />
            </>
          )}
          <label style={label}>Air Velocity (FPM) — typical supply: 600–900, return: 400–700</label>
          <input style={input} type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} />
          {ductResult !== null && (
            <div style={resultBox(true)}><strong>CFM ≈ {ductResult}</strong> at {velocity} FPM</div>
          )}
        </>
      )}

      {mode === "btuh" && (
        <>
          <label style={label}>System Capacity (BTU/h)</label>
          <input style={input} type="number" placeholder="e.g. 36000" value={btuh} onChange={(e) => setBtuh(e.target.value)} />
          <label style={label}>Delta-T (°F) — use 20°F default if unknown</label>
          <input style={input} type="number" value={dt} onChange={(e) => setDt(e.target.value)} />
          {btuhResult !== null && (
            <div style={resultBox(true)}>
              <strong>Required CFM ≈ {btuhResult}</strong>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>Formula: BTU/h ÷ (1.085 × ΔT)</div>
            </div>
          )}
        </>
      )}

      {mode === "fpm" && (
        <>
          <label style={label}>Air Velocity (FPM) — from anemometer or velometer</label>
          <input style={input} type="number" placeholder="e.g. 750" value={fpm} onChange={(e) => setFpm(e.target.value)} />
          <label style={label}>Opening / Grille Area (sq inches)</label>
          <input style={input} type="number" placeholder="e.g. 96" value={areaIn} onChange={(e) => setAreaIn(e.target.value)} />
          {fpmResult !== null && (
            <div style={resultBox(true)}>
              <strong>CFM ≈ {fpmResult}</strong>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>Multiply by 0.75 for free area correction on standard grilles.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Ohm's Law Tab
// ═══════════════════════════════════════════════════════════════
function OhmCalc() {
  const [solve, setSolve] = useState<"V" | "I" | "R" | "W">("W");
  const [v, setV] = useState(""); const [i, setI] = useState("");
  const [r, setR] = useState(""); const [w, setW] = useState("");

  const result = useMemo(() => {
    const vN = n(v); const iN = n(i); const rN = n(r); const wN = n(w);
    switch (solve) {
      case "V": if (iN && rN) return { label: "Voltage", value: round1(iN * rN), unit: "V" }; break;
      case "I": if (vN && rN) return { label: "Current", value: round1(vN / rN), unit: "A" }; break;
      case "R": if (vN && iN) return { label: "Resistance", value: round1(vN / iN), unit: "Ω" }; break;
      case "W": if (vN && iN) return { label: "Power", value: round1(vN * iN), unit: "W" }; break;
    }
    return null;
  }, [solve, v, i, r, w]);

  const fields: { key: "V"|"I"|"R"|"W", label: string, unit: string, ph: string }[] = [
    { key: "V", label: "Voltage (V)", unit: "volts", ph: "e.g. 240" },
    { key: "I", label: "Current (I)", unit: "amps", ph: "e.g. 18" },
    { key: "R", label: "Resistance (R)", unit: "ohms", ph: "e.g. 13.3" },
    { key: "W", label: "Power (W)", unit: "watts", ph: "e.g. 4320" },
  ];

  const vals = { V: v, I: i, R: r, W: w };
  const setters = { V: setV, I: setI, R: setR, W: setW };

  return (
    <div>
      <div style={sectionTitle}>Ohm's Law Calculator</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        V = IR · W = VI · Enter any two values to solve for a third.
      </p>
      <label style={label}>Solve for</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {(["V","I","R","W"] as const).map((k) => (
          <button key={k} style={tabBtn(solve === k)} onClick={() => setSolve(k)}>
            {k === "V" ? "Voltage" : k === "I" ? "Current" : k === "R" ? "Resistance" : "Power"}
          </button>
        ))}
      </div>
      {fields.filter((f) => f.key !== solve).map((f) => (
        <div key={f.key}>
          <label style={label}>{f.label}</label>
          <input style={input} type="number" placeholder={f.ph}
            value={vals[f.key]} onChange={(e) => setters[f.key](e.target.value)} />
        </div>
      ))}
      {result && (
        <div style={resultBox(true)}>
          <strong>{result.label}: {result.value} {result.unit}</strong>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Capacitor MFD Check Tab
// ═══════════════════════════════════════════════════════════════
function MfdCalc() {
  const [rated, setRated] = useState("");
  const [measured, setMeasured] = useState("");

  const result = useMemo(() => {
    const r = n(rated); const m = n(measured);
    if (!r || !m) return null;
    const pct = round1(((m - r) / r) * 100);
    const diff = round1(m - r);
    const pass = Math.abs(pct) <= 10;
    return {
      pct: pct > 0 ? `+${pct}%` : `${pct}%`,
      diff: diff > 0 ? `+${diff} MFD` : `${diff} MFD`,
      pass,
      note: pass
        ? `Capacitor is within ±10% tolerance. It is serviceable.`
        : `Capacitor is ${Math.abs(pct)}% out of tolerance (>10% = failed). Replace it.`,
    };
  }, [rated, measured]);

  return (
    <div>
      <div style={sectionTitle}>Capacitor MFD Checker</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Acceptable tolerance is ±6% (strict) to ±10% (common). Any reading beyond ±10% = failed capacitor.
      </p>
      <label style={label}>Rated MFD (from label)</label>
      <input style={input} type="number" placeholder="e.g. 35" value={rated} onChange={(e) => setRated(e.target.value)} />
      <label style={label}>Measured MFD (from meter)</label>
      <input style={input} type="number" placeholder="e.g. 31.2" value={measured} onChange={(e) => setMeasured(e.target.value)} />
      {result && (
        <div style={resultBox(result.pass)}>
          <div><strong>Deviation:</strong> {result.pct} ({result.diff})</div>
          <div style={{ marginTop: 6 }}>{result.note}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Gas Heat Rise Tab
// ═══════════════════════════════════════════════════════════════
function GasHeatCalc() {
  const [ret, setRet] = useState("");
  const [sup, setSup] = useState("");
  const [cfm, setCfm] = useState("");
  const [inputBtu, setInputBtu] = useState("");
  const [effPct, setEffPct] = useState("80");

  const result = useMemo(() => {
    const retN = n(ret); const supN = n(sup);
    const cfmN = n(cfm);
    const inputN = n(inputBtu);
    const effN = n(effPct) / 100;

    if (!retN || !supN) return null;
    const actualRise = round1(supN - retN);

    // Expected rise from BTU/h and CFM
    let expectedRise: number | null = null;
    if (inputN && cfmN && effN) {
      const outputBtu = inputN * effN;
      expectedRise = round1(outputBtu / (cfmN * 1.085));
    }

    const normalMin = 40; const normalMax = 70;
    const pass = actualRise >= normalMin && actualRise <= normalMax;

    let note = "";
    if (actualRise < normalMin) {
      note = `Heat rise of ${actualRise}°F is below the typical 40–70°F range. Check for: oversized unit, excessive airflow, inducer issue, or heat exchanger problem.`;
    } else if (actualRise > normalMax) {
      note = `Heat rise of ${actualRise}°F is above the typical 40–70°F range. Check for: low airflow (dirty filter/blower), restricted duct, or cracked heat exchanger.`;
    } else {
      note = `Heat rise of ${actualRise}°F is within the normal 40–70°F range.`;
    }

    return { actualRise, expectedRise, pass, note };
  }, [ret, sup, cfm, inputBtu, effPct]);

  return (
    <div>
      <div style={sectionTitle}>Gas Heat Rise Calculator</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Normal heat rise range is 40–70°F. Check manufacturer nameplate for specific allowed range.
      </p>
      <label style={label}>Return Air Temp (°F)</label>
      <input style={input} type="number" placeholder="e.g. 68" value={ret} onChange={(e) => setRet(e.target.value)} />
      <label style={label}>Supply Air Temp (°F) — measured at heat exchanger outlet</label>
      <input style={input} type="number" placeholder="e.g. 125" value={sup} onChange={(e) => setSup(e.target.value)} />
      <label style={{ ...label, color: "#999", marginTop: 14 }}>Optional — Expected Rise Check</label>
      <label style={label}>Input BTU/h (from nameplate)</label>
      <input style={input} type="number" placeholder="e.g. 80000" value={inputBtu} onChange={(e) => setInputBtu(e.target.value)} />
      <label style={label}>Efficiency (%)</label>
      <input style={input} type="number" placeholder="e.g. 80" value={effPct} onChange={(e) => setEffPct(e.target.value)} />
      <label style={label}>System Airflow CFM (if known)</label>
      <input style={input} type="number" placeholder="e.g. 1200" value={cfm} onChange={(e) => setCfm(e.target.value)} />

      {result && (
        <div style={resultBox(result.pass)}>
          <div><strong>Actual Heat Rise:</strong> {result.actualRise}°F
            <span style={{ marginLeft: 8, fontWeight: 700, color: result.pass ? "#16a34a" : "#d97706" }}>
              [{result.pass ? "NORMAL" : "OUT OF RANGE"}]
            </span>
          </div>
          {result.expectedRise !== null && (
            <div><strong>Expected Rise:</strong> {result.expectedRise}°F</div>
          )}
          <div style={{ marginTop: 8 }}>{result.note}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════════════
export function HvacCalculators() {
  const [activeTab, setActiveTab] = useState<Tab>("pt");

  const tabs: { id: Tab; label: string }[] = [
    { id: "pt", label: "PT Chart" },
    { id: "shsc", label: "SH / SC" },
    { id: "deltat", label: "Delta-T" },
    { id: "cfm", label: "CFM" },
    { id: "ohm", label: "Ohm's Law" },
    { id: "mfd", label: "Capacitor MFD" },
    { id: "gas", label: "Gas Heat Rise" },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "10px 14px",
          overflowX: "auto" as const,
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {tabs.map((t) => (
          <button key={t.id} style={tabBtn(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {activeTab === "pt" && <PTChartCalc />}
        {activeTab === "shsc" && <ShScCalc />}
        {activeTab === "deltat" && <DeltaTCalc />}
        {activeTab === "cfm" && <CfmCalc />}
        {activeTab === "ohm" && <OhmCalc />}
        {activeTab === "mfd" && <MfdCalc />}
        {activeTab === "gas" && <GasHeatCalc />}
      </div>
    </div>
  );
}