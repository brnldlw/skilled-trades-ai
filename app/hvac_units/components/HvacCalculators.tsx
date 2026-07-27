"use client";

import React, { useState, useMemo } from "react";
import {
  psigFromTemp,
  tempFromPsig,
  calcSuperheat,
  calcSubcool,
  availableRefrigerants,
} from "../lib/ptChart";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

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
  const { lang } = useLang();
  const refOpts = availableRefrigerants();
  const [ref, setRef] = useState("R-410A");
  const [mode, setMode] = useState<"psig_to_temp" | "temp_to_psig">("psig_to_temp");
  const [psigVal, setPsigVal] = useState("");
  const [tempVal, setTempVal] = useState("");

  const result = useMemo(() => {
    if (mode === "psig_to_temp") {
      const p = n(psigVal);
      if (!psigVal) return null;
      const tp = tempFromPsig(ref, p);
      return tp !== null ? t("calc_pt_result_sat_temp", lang).replace("{value}", String(tp)) : t("calc_pt_out_of_range", lang);
    } else {
      const tv = n(tempVal);
      if (!tempVal) return null;
      const p = psigFromTemp(ref, tv);
      return p !== null ? t("calc_pt_result_sat_pressure", lang).replace("{value}", String(p)) : t("calc_pt_out_of_range", lang);
    }
  }, [ref, mode, psigVal, tempVal, lang]);

  return (
    <div>
      <div style={sectionTitle}>{t("calc_pt_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_pt_hint", lang)}
      </p>

      <label style={label}>{t("calc_label_refrigerant", lang)}</label>
      <select style={select} value={ref} onChange={(e) => setRef(e.target.value)}>
        {refOpts.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <label style={label}>{t("calc_label_convert", lang)}</label>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button style={tabBtn(mode === "psig_to_temp")} onClick={() => setMode("psig_to_temp")}>
          {t("calc_psig_to_temp", lang)}
        </button>
        <button style={tabBtn(mode === "temp_to_psig")} onClick={() => setMode("temp_to_psig")}>
          {t("calc_temp_to_psig", lang)}
        </button>
      </div>

      {mode === "psig_to_temp" ? (
        <>
          <label style={label}>{t("calc_label_gauge_pressure", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 120" value={psigVal}
            onChange={(e) => setPsigVal(e.target.value)} />
        </>
      ) : (
        <>
          <label style={label}>{t("calc_label_temperature", lang)}</label>
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
  const { lang } = useLang();
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
    return calcSuperheat(ref, n(suctionPsig), n(suctionLineTemp), metering, lang);
  }, [ref, mode, metering, suctionPsig, suctionLineTemp, lang]);

  const scResult = useMemo(() => {
    if (mode !== "sc" || !liquidPsig || !liquidLineTemp) return null;
    return calcSubcool(ref, n(liquidPsig), n(liquidLineTemp), lang);
  }, [ref, mode, liquidPsig, liquidLineTemp, lang]);

  const statusColor = (s: string) => {
    if (s === "normal") return true;
    return false;
  };

  const statusLabel = (s: string) => {
    if (s === "low") return t("calc_status_low", lang);
    if (s === "normal") return t("calc_status_normal", lang);
    if (s === "high") return t("calc_status_high", lang);
    if (s === "very_high") return t("calc_status_very_high", lang);
    return t("calc_status_unknown", lang);
  };

  return (
    <div>
      <div style={sectionTitle}>{t("calc_shsc_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_shsc_hint", lang)}
      </p>

      <label style={label}>{t("calc_label_refrigerant", lang)}</label>
      <select style={select} value={ref} onChange={(e) => setRef(e.target.value)}>
        {refOpts.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button style={tabBtn(mode === "sh")} onClick={() => setMode("sh")}>{t("calc_tab_superheat", lang)}</button>
        <button style={tabBtn(mode === "sc")} onClick={() => setMode("sc")}>{t("calc_tab_subcooling", lang)}</button>
      </div>

      {mode === "sh" && (
        <>
          <label style={label}>{t("calc_label_metering_device", lang)}</label>
          <select style={select} value={metering} onChange={(e) => setMetering(e.target.value as any)}>
            <option value="txv">{t("calc_metering_txv", lang)}</option>
            <option value="fixed_orifice">{t("calc_metering_fixed", lang)}</option>
          </select>
          <label style={label}>{t("calc_label_suction_pressure", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 120" value={suctionPsig}
            onChange={(e) => setSuctionPsig(e.target.value)} />
          <label style={label}>{t("calc_label_suction_line_temp", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 52" value={suctionLineTemp}
            onChange={(e) => setSuctionLineTemp(e.target.value)} />
          {shResult && (
            <div style={resultBox(statusColor(shResult.status))}>
              <div><strong>{t("calc_label_sat_suction_temp", lang)}</strong> {shResult.suctionSatTempF}°F</div>
              <div><strong>{t("calc_label_superheat", lang)}</strong> {shResult.superheatF}°F
                <span style={{ marginLeft: 8, fontWeight: 700, color: shResult.status === "normal" ? "#16a34a" : "#d97706" }}>
                  [{statusLabel(shResult.status)}]
                </span>
              </div>
              <div style={{ marginTop: 8, color: "#444" }}>{shResult.note}</div>
            </div>
          )}
        </>
      )}

      {mode === "sc" && (
        <>
          <label style={label}>{t("calc_label_liquid_pressure", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 380" value={liquidPsig}
            onChange={(e) => setLiquidPsig(e.target.value)} />
          <label style={label}>{t("calc_label_liquid_line_temp", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 98" value={liquidLineTemp}
            onChange={(e) => setLiquidLineTemp(e.target.value)} />
          {scResult && (
            <div style={resultBox(statusColor(scResult.status))}>
              <div><strong>{t("calc_label_sat_cond_temp", lang)}</strong> {scResult.condSatTempF}°F</div>
              <div><strong>{t("calc_label_subcooling", lang)}</strong> {scResult.subcoolF}°F
                <span style={{ marginLeft: 8, fontWeight: 700, color: scResult.status === "normal" ? "#16a34a" : "#d97706" }}>
                  [{statusLabel(scResult.status)}]
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
  const { lang } = useLang();
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
        note = t("deltat_note_normal_wb", lang).replace("{dt}", String(dt)).replace("{wb}", String(wbN));
      } else if (dt < expectedDT - 2) {
        status = "LOW";
        note = t("deltat_note_low_wb", lang).replace("{value}", String(expectedDT)).replace("{wb}", String(wbN));
      } else {
        status = "HIGH";
        note = t("deltat_note_high_wb", lang);
      }
    } else {
      if (dt >= 15 && dt <= 22) {
        status = "NORMAL";
        note = t("deltat_note_normal", lang).replace("{dt}", String(dt));
      } else if (dt < 15) {
        status = "LOW";
        note = t("deltat_note_low", lang);
      } else {
        status = "HIGH";
        note = t("deltat_note_high", lang);
      }
    }

    return { dt, status, note };
  }, [ret, sup, wb, hasWb, lang]);

  const statusLabel = (s: string) => {
    if (s === "NORMAL") return t("calc_status_normal", lang);
    if (s === "LOW") return t("calc_status_low", lang);
    if (s === "HIGH") return t("calc_status_high", lang);
    return s;
  };

  return (
    <div>
      <div style={sectionTitle}>{t("calc_deltat_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_deltat_hint", lang)}
      </p>

      <label style={label}>{t("calc_label_return_temp", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 76" value={ret} onChange={(e) => setRet(e.target.value)} />
      <label style={label}>{t("calc_label_supply_temp", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 58" value={sup} onChange={(e) => setSup(e.target.value)} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <input type="checkbox" id="hasWb" checked={hasWb} onChange={(e) => setHasWb(e.target.checked)} />
        <label htmlFor="hasWb" style={{ fontSize: 13, cursor: "pointer" }}>{t("calc_label_have_wb", lang)}</label>
      </div>

      {hasWb && (
        <>
          <label style={label}>{t("calc_label_return_wb", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 63" value={wb} onChange={(e) => setWb(e.target.value)} />
        </>
      )}

      {result && (
        <div style={resultBox(result.status === "NORMAL")}>
          <div><strong>{t("calc_label_deltat", lang)}</strong> {result.dt}°F
            <span style={{ marginLeft: 8, fontWeight: 700, color: result.status === "NORMAL" ? "#16a34a" : "#d97706" }}>
              [{statusLabel(result.status)}]
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
  const { lang } = useLang();
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
      <div style={sectionTitle}>{t("calc_cfm_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_cfm_hint", lang)}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
        <button style={tabBtn(mode === "duct")} onClick={() => setMode("duct")}>{t("calc_tab_duct_size", lang)}</button>
        <button style={tabBtn(mode === "btuh")} onClick={() => setMode("btuh")}>{t("calc_tab_btuh_method", lang)}</button>
        <button style={tabBtn(mode === "fpm")} onClick={() => setMode("fpm")}>{t("calc_tab_fpm_area", lang)}</button>
      </div>

      {mode === "duct" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button style={tabBtn(!isRound)} onClick={() => setIsRound(false)}>{t("calc_tab_rectangular", lang)}</button>
            <button style={tabBtn(isRound)} onClick={() => setIsRound(true)}>{t("calc_tab_round", lang)}</button>
          </div>
          {isRound ? (
            <>
              <label style={label}>{t("calc_label_duct_diameter", lang)}</label>
              <input style={input} type="number" placeholder="e.g. 12" value={ductD} onChange={(e) => setDuctD(e.target.value)} />
            </>
          ) : (
            <>
              <label style={label}>{t("calc_label_duct_width", lang)}</label>
              <input style={input} type="number" placeholder="e.g. 20" value={ductW} onChange={(e) => setDuctW(e.target.value)} />
              <label style={label}>{t("calc_label_duct_height", lang)}</label>
              <input style={input} type="number" placeholder="e.g. 16" value={ductH} onChange={(e) => setDuctH(e.target.value)} />
            </>
          )}
          <label style={label}>{t("calc_label_air_velocity", lang)}</label>
          <input style={input} type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} />
          {ductResult !== null && (
            <div style={resultBox(true)}><strong>CFM ≈ {ductResult}</strong> {t("calc_cfm_at_fpm", lang).replace("{value}", velocity)}</div>
          )}
        </>
      )}

      {mode === "btuh" && (
        <>
          <label style={label}>{t("calc_label_system_capacity", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 36000" value={btuh} onChange={(e) => setBtuh(e.target.value)} />
          <label style={label}>{t("calc_label_deltat_default", lang)}</label>
          <input style={input} type="number" value={dt} onChange={(e) => setDt(e.target.value)} />
          {btuhResult !== null && (
            <div style={resultBox(true)}>
              <strong>{t("calc_required_cfm", lang).replace("{value}", String(btuhResult))}</strong>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{t("calc_formula_btuh", lang)}</div>
            </div>
          )}
        </>
      )}

      {mode === "fpm" && (
        <>
          <label style={label}>{t("calc_label_air_velocity_anemometer", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 750" value={fpm} onChange={(e) => setFpm(e.target.value)} />
          <label style={label}>{t("calc_label_grille_area", lang)}</label>
          <input style={input} type="number" placeholder="e.g. 96" value={areaIn} onChange={(e) => setAreaIn(e.target.value)} />
          {fpmResult !== null && (
            <div style={resultBox(true)}>
              <strong>CFM ≈ {fpmResult}</strong>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{t("calc_free_area_correction", lang)}</div>
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
  const { lang } = useLang();
  const [solve, setSolve] = useState<"V" | "I" | "R" | "W">("W");
  const [v, setV] = useState(""); const [i, setI] = useState("");
  const [r, setR] = useState(""); const [w, setW] = useState("");

  const result = useMemo(() => {
    const vN = n(v); const iN = n(i); const rN = n(r); const wN = n(w);
    switch (solve) {
      case "V": if (iN && rN) return { label: t("calc_ohm_voltage", lang), value: round1(iN * rN), unit: "V" }; break;
      case "I": if (vN && rN) return { label: t("calc_ohm_current", lang), value: round1(vN / rN), unit: "A" }; break;
      case "R": if (vN && iN) return { label: t("calc_ohm_resistance", lang), value: round1(vN / iN), unit: "Ω" }; break;
      case "W": if (vN && iN) return { label: t("calc_ohm_power", lang), value: round1(vN * iN), unit: "W" }; break;
    }
    return null;
  }, [solve, v, i, r, w, lang]);

  const fields: { key: "V"|"I"|"R"|"W", labelKey: Parameters<typeof t>[0], unit: string, ph: string }[] = [
    { key: "V", labelKey: "calc_label_voltage_v", unit: "volts", ph: "e.g. 240" },
    { key: "I", labelKey: "calc_label_current_i", unit: "amps", ph: "e.g. 18" },
    { key: "R", labelKey: "calc_label_resistance_r", unit: "ohms", ph: "e.g. 13.3" },
    { key: "W", labelKey: "calc_label_power_w", unit: "watts", ph: "e.g. 4320" },
  ];

  const vals = { V: v, I: i, R: r, W: w };
  const setters = { V: setV, I: setI, R: setR, W: setW };

  return (
    <div>
      <div style={sectionTitle}>{t("calc_ohm_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_ohm_hint", lang)}
      </p>
      <label style={label}>{t("calc_label_solve_for", lang)}</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {(["V","I","R","W"] as const).map((k) => (
          <button key={k} style={tabBtn(solve === k)} onClick={() => setSolve(k)}>
            {k === "V" ? t("calc_ohm_voltage", lang) : k === "I" ? t("calc_ohm_current", lang) : k === "R" ? t("calc_ohm_resistance", lang) : t("calc_ohm_power", lang)}
          </button>
        ))}
      </div>
      {fields.filter((f) => f.key !== solve).map((f) => (
        <div key={f.key}>
          <label style={label}>{t(f.labelKey, lang)}</label>
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
  const { lang } = useLang();
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
        ? t("mfd_note_pass", lang)
        : t("mfd_note_fail", lang).replace("{value}", String(Math.abs(pct))),
    };
  }, [rated, measured, lang]);

  return (
    <div>
      <div style={sectionTitle}>{t("calc_mfd_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_mfd_hint", lang)}
      </p>
      <label style={label}>{t("calc_label_rated_mfd", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 35" value={rated} onChange={(e) => setRated(e.target.value)} />
      <label style={label}>{t("calc_label_measured_mfd", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 31.2" value={measured} onChange={(e) => setMeasured(e.target.value)} />
      {result && (
        <div style={resultBox(result.pass)}>
          <div><strong>{t("calc_label_deviation", lang)}</strong> {result.pct} ({result.diff})</div>
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
  const { lang } = useLang();
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
      note = t("gas_note_low", lang).replace("{value}", String(actualRise));
    } else if (actualRise > normalMax) {
      note = t("gas_note_high", lang).replace("{value}", String(actualRise));
    } else {
      note = t("gas_note_normal", lang).replace("{value}", String(actualRise));
    }

    return { actualRise, expectedRise, pass, note };
  }, [ret, sup, cfm, inputBtu, effPct, lang]);

  return (
    <div>
      <div style={sectionTitle}>{t("calc_gas_title", lang)}</div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {t("calc_gas_hint", lang)}
      </p>
      <label style={label}>{t("calc_label_return_temp", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 68" value={ret} onChange={(e) => setRet(e.target.value)} />
      <label style={label}>{t("calc_label_supply_temp_outlet", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 125" value={sup} onChange={(e) => setSup(e.target.value)} />
      <label style={{ ...label, color: "#999", marginTop: 14 }}>{t("calc_label_optional_expected_rise", lang)}</label>
      <label style={label}>{t("calc_label_input_btuh", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 80000" value={inputBtu} onChange={(e) => setInputBtu(e.target.value)} />
      <label style={label}>{t("calc_label_efficiency", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 80" value={effPct} onChange={(e) => setEffPct(e.target.value)} />
      <label style={label}>{t("calc_label_system_airflow", lang)}</label>
      <input style={input} type="number" placeholder="e.g. 1200" value={cfm} onChange={(e) => setCfm(e.target.value)} />

      {result && (
        <div style={resultBox(result.pass)}>
          <div><strong>{t("calc_label_actual_heat_rise", lang)}</strong> {result.actualRise}°F
            <span style={{ marginLeft: 8, fontWeight: 700, color: result.pass ? "#16a34a" : "#d97706" }}>
              [{result.pass ? t("calc_status_normal", lang) : t("calc_status_out_of_range", lang)}]
            </span>
          </div>
          {result.expectedRise !== null && (
            <div><strong>{t("calc_label_expected_rise", lang)}</strong> {result.expectedRise}°F</div>
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
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>("pt");

  const tabs: { id: Tab; label: string }[] = [
    { id: "pt", label: t("calc_tab_pt", lang) },
    { id: "shsc", label: t("calc_tab_shsc", lang) },
    { id: "deltat", label: t("calc_tab_deltat", lang) },
    { id: "cfm", label: t("calc_tab_cfm", lang) },
    { id: "ohm", label: t("calc_tab_ohm", lang) },
    { id: "mfd", label: t("calc_tab_mfd", lang) },
    { id: "gas", label: t("calc_tab_gas", lang) },
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
        {tabs.map((tb) => (
          <button key={tb.id} style={tabBtn(activeTab === tb.id)} onClick={() => setActiveTab(tb.id)}>
            {tb.label}
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
