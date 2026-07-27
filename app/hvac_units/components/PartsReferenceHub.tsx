"use client";

import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";
import { t, type Language } from "../../lib/translations";

// ─── CAPACITOR CROSS-REFERENCE ────────────────────────────────
type CapResult = {
  mfd: string;
  voltage: string;
  type: string;
  terminals: string;
  commonUse: string;
  suppliers: { name: string; partNote: string }[];
};

function findCapacitor(mfd: string, voltage: string, type: string, lang: Language): CapResult | null {
  if (!mfd || !voltage) return null;
  const mfdNum = parseFloat(mfd);

  const suppliers = [
    { name: "Johnstone Supply", partNote: `Search: ${mfd}MFD ${voltage}V ${type} capacitor` },
    { name: "Grainger", partNote: `Search: capacitor ${mfd} MFD ${voltage} volt ${type}` },
    { name: "Amazon", partNote: `Search: HVAC run capacitor ${mfd}uf ${voltage}v ${type}` },
  ];

  return {
    mfd,
    voltage,
    type,
    terminals: type === "Dual Run" ? t("prh_terminals_dual", lang) : t("prh_terminals_two", lang),
    commonUse: type === "Dual Run"
      ? t("prh_cap_use_dual", lang)
      : mfdNum > 40
        ? t("prh_cap_use_start_large", lang)
        : mfdNum > 10
          ? t("prh_cap_use_run_single", lang)
          : t("prh_cap_use_fan_single", lang),
    suppliers,
  };
}

// ─── MOTOR CROSS-REFERENCE ────────────────────────────────────
type MotorResult = {
  hp: string;
  rpm: string;
  voltage: string;
  frame: string;
  rotation: string;
  enclosure: string;
  commonParts: { brand: string; series: string; note: string }[];
  searchTerms: string;
};

function findMotor(hp: string, rpm: string, voltage: string, frame: string, motorType: string, lang: Language): MotorResult | null {
  if (!hp || !rpm || !voltage) return null;

  const hpNum = parseFloat(hp);

  let commonParts: { brand: string; series: string; note: string }[] = [];
  let enclosure = t("prh_enclosure_teao", lang);

  if (motorType === "condenser") {
    enclosure = t("prh_enclosure_teao_short", lang);
    commonParts = [
      { brand: "Fasco", series: "D series", note: `D${Math.round(hpNum * 100).toString().padStart(3, "0")} — ${t("prh_motor_note_fasco_d", lang)}` },
      { brand: "Century / Genteq", series: "C series", note: "C" + Math.round(hpNum * 100).toString().padStart(3, "0") },
      { brand: "AO Smith", series: "ORM series", note: t("prh_motor_note_aosmith", lang) },
    ];
  } else if (motorType === "blower") {
    enclosure = t("prh_enclosure_odp_psc", lang);
    commonParts = [
      { brand: "Fasco", series: "7000/8000 series", note: t("prh_motor_note_fasco_blower", lang) },
      { brand: "Century / Genteq", series: "Evergreen series", note: t("prh_motor_note_evergreen", lang) },
      { brand: "US Motors", series: "Rescue EZ series", note: t("prh_motor_note_rescue", lang) },
    ];
  } else {
    enclosure = t("prh_enclosure_odp_tefc", lang);
    commonParts = [
      { brand: "Leeson", series: "C face motors", note: t("prh_motor_note_leeson", lang) },
      { brand: "Marathon", series: "Blue Max series", note: t("prh_motor_note_marathon", lang) },
      { brand: "Baldor", series: "Super-E series", note: t("prh_motor_note_baldor", lang) },
    ];
  }

  return {
    hp,
    rpm,
    voltage,
    frame,
    rotation: t("prh_motor_rotation", lang),
    enclosure,
    commonParts,
    searchTerms: `${hp} HP ${rpm} RPM ${voltage}V ${motorType} motor ${frame ? frame + " frame" : ""}`.trim(),
  };
}

// ─── CONTACTOR CROSS-REFERENCE ────────────────────────────────
type ContactorResult = {
  poles: string;
  amps: string;
  coilVoltage: string;
  type: string;
  commonParts: { brand: string; part: string; note: string }[];
  searchTerms: string;
};

function findContactor(poles: string, amps: string, coilVoltage: string, lang: Language): ContactorResult | null {
  if (!poles || !amps || !coilVoltage) return null;

  const ampsNum = parseInt(amps);
  const coilV = coilVoltage.replace("V", "").trim();

  const commonParts: { brand: string; part: string; note: string }[] = [
    {
      brand: "Honeywell / Resideo",
      part: `R8${poles === "2" ? "242" : "222"}A${ampsNum <= 30 ? "1032" : "1040"}`,
      note: `${poles}-pole, ${amps}A, ${coilVoltage} coil — ${t("prh_cont_note_honeywell", lang)}`,
    },
    {
      brand: "Square D / Schneider",
      part: `LC1D${ampsNum <= 25 ? "18" : ampsNum <= 40 ? "32" : "50"}${coilV === "24" ? "BX" : "MX"}`,
      note: t("prh_cont_note_square_d", lang),
    },
    {
      brand: "Packard",
      part: `C${poles}${ampsNum}A${coilV}`,
      note: t("prh_cont_note_packard", lang),
    },
  ];

  return {
    poles,
    amps,
    coilVoltage,
    type: poles === "1" ? t("prh_cont_type_single", lang) : t("prh_cont_type_two", lang),
    commonParts,
    searchTerms: `${poles} pole contactor ${amps} amp ${coilVoltage} coil HVAC`,
  };
}

// ─── SUPPLIER SEARCH HELPER ───────────────────────────────────
function openSearch(query: string, supplier: string = "johnstone") {
  const urls: Record<string, string> = {
    johnstone: `https://www.johnstonesupply.com/search?q=${encodeURIComponent(query)}`,
    grainger: `https://www.grainger.com/search?searchQuery=${encodeURIComponent(query)}`,
    amazon: `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
  };
  window.open(urls[supplier] || urls.johnstone, "_blank", "noopener,noreferrer");
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
type Tab = "capacitor" | "motor" | "contactor";

export function PartsReferenceHub() {
  const { lang } = useLang();
  const [tab, setTab] = useState<Tab>("capacitor");

  // Capacitor state
  const [capMfd, setCapMfd] = useState("");
  const [capVoltage, setCapVoltage] = useState("370");
  const [capType, setCapType] = useState("Dual Run");
  const [capResult, setCapResult] = useState<CapResult | null>(null);

  // Motor state
  const [motorHp, setMotorHp] = useState("");
  const [motorRpm, setMotorRpm] = useState("1075");
  const [motorVoltage, setMotorVoltage] = useState("208-230");
  const [motorFrame, setMotorFrame] = useState("");
  const [motorType, setMotorType] = useState("condenser");
  const [motorResult, setMotorResult] = useState<MotorResult | null>(null);

  // Contactor state
  const [contPoles, setContPoles] = useState("2");
  const [contAmps, setContAmps] = useState("30");
  const [contCoil, setContCoil] = useState("24V");
  const [contResult, setContResult] = useState<ContactorResult | null>(null);

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", background: "#fafafa",
  };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#374151", marginBottom: 4, letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };
  const searchBtn: React.CSSProperties = {
    padding: "10px 20px", background: "#0f1f3d", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit", marginTop: 4,
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "capacitor", label: t("prh_tab_capacitors", lang), icon: "⚡" },
    { key: "motor", label: t("prh_tab_motors", lang), icon: "🔄" },
    { key: "contactor", label: t("prh_tab_contactors", lang), icon: "🔌" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 16 }}>
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: tab === tb.key ? "#fff" : "transparent", color: tab === tb.key ? "#0f1f3d" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: tab === tb.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>{tb.icon}</span><span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* ── CAPACITOR ─────────────────────────────────────── */}
      {tab === "capacitor" && (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
            <strong>{t("prh_cap_verify_title", lang)}</strong> {t("prh_cap_verify_body", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={lbl}>{t("prh_label_mfd", lang)}</label>
              <input style={inp} type="number" placeholder="e.g. 45/5, 35, 7.5" value={capMfd} onChange={e => setCapMfd(e.target.value)} />
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{t("prh_mfd_hint", lang)}</div>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_voltage_rating", lang)}</label>
              <select style={inp} value={capVoltage} onChange={e => setCapVoltage(e.target.value)}>
                <option value="370">{t("prh_v370", lang)}</option>
                <option value="440">{t("prh_v440", lang)}</option>
                <option value="370/440">{t("prh_v370_440", lang)}</option>
                <option value="250">{t("prh_v250", lang)}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_type", lang)}</label>
              <select style={inp} value={capType} onChange={e => setCapType(e.target.value)}>
                <option value="Dual Run">{t("prh_type_dual_run", lang)}</option>
                <option value="Single Run — Compressor">{t("prh_type_single_run_comp", lang)}</option>
                <option value="Single Run — Fan">{t("prh_type_single_run_fan", lang)}</option>
                <option value="Start Capacitor">{t("prh_type_start_cap", lang)}</option>
              </select>
            </div>
          </div>
          <button style={searchBtn} onClick={() => setCapResult(findCapacitor(capMfd, capVoltage, capType, lang))}>
            {t("btn_find_capacitor", lang)}
          </button>

          {capResult && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 6 }}>
                  {capResult.mfd} MFD · {capResult.voltage}V · {capResult.type}
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}><strong>{t("prh_label_terminals", lang)}</strong> {capResult.terminals}</div>
                <div style={{ fontSize: 13, color: "#374151" }}><strong>{t("prh_label_common_use", lang)}</strong> {capResult.commonUse}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{t("prh_search_suppliers", lang)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {capResult.suppliers.map(s => (
                  <button key={s.name} onClick={() => openSearch(s.partNote.replace("Search: ", ""), s.name.toLowerCase().includes("grainger") ? "grainger" : s.name.toLowerCase().includes("amazon") ? "amazon" : "johnstone")}
                    style={{ padding: "10px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f1f3d" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{t("prh_opens_new_tab", lang)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MOTOR ─────────────────────────────────────────── */}
      {tab === "motor" && (
        <div>
          <div style={{ background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#1d4ed8" }}>
            <strong>{t("prh_motor_before_ordering", lang)}</strong> {t("prh_motor_before_body", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>{t("prh_label_motor_type", lang)}</label>
              <select style={inp} value={motorType} onChange={e => setMotorType(e.target.value)}>
                <option value="condenser">{t("prh_motor_type_condenser", lang)}</option>
                <option value="blower">{t("prh_motor_type_blower", lang)}</option>
                <option value="exhaust">{t("prh_motor_type_exhaust", lang)}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_hp", lang)}</label>
              <select style={inp} value={motorHp} onChange={e => setMotorHp(e.target.value)}>
                <option value="">{t("prh_select_hp", lang)}</option>
                {["1/20","1/15","1/12","1/10","1/8","1/6","1/5","1/4","1/3","1/2","3/4","1","1.5","2","3","5"].map(h => (
                  <option key={h} value={h}>{h} HP</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_rpm", lang)}</label>
              <select style={inp} value={motorRpm} onChange={e => setMotorRpm(e.target.value)}>
                <option value="825">825 RPM</option>
                <option value="1075">{t("prh_rpm_most_common", lang)}</option>
                <option value="1100">1100 RPM</option>
                <option value="1200">1200 RPM</option>
                <option value="1550">1550 RPM</option>
                <option value="1625">1625 RPM</option>
                <option value="1800">1800 RPM</option>
                <option value="3450">3450 RPM</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_voltage", lang)}</label>
              <select style={inp} value={motorVoltage} onChange={e => setMotorVoltage(e.target.value)}>
                <option value="115">115V</option>
                <option value="208-230">{t("prh_v208_230_common", lang)}</option>
                <option value="460">{t("prh_v460_3ph", lang)}</option>
                <option value="208-230/460">{t("prh_v208_230_460", lang)}</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>{t("prh_label_frame", lang)}</label>
            <input style={inp} placeholder={t("prh_frame_placeholder", lang)} value={motorFrame} onChange={e => setMotorFrame(e.target.value)} />
          </div>
          <button style={searchBtn} onClick={() => setMotorResult(findMotor(motorHp, motorRpm, motorVoltage, motorFrame, motorType, lang))} disabled={!motorHp}>
            {t("btn_find_motor", lang)}
          </button>

          {motorResult && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 4 }}>
                  {motorResult.hp} HP · {motorResult.rpm} RPM · {motorResult.voltage}V
                  {motorResult.frame ? ` ${t("prh_label_frame_colon", lang)} ${motorResult.frame}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}><strong>{t("prh_label_enclosure", lang)}</strong> {motorResult.enclosure}</div>
                <div style={{ fontSize: 12, color: "#dc2626" }}><strong>⚠ {motorResult.rotation}</strong></div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>{t("prh_label_common_replacements", lang)}</div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {motorResult.commonParts.map(p => (
                    <div key={p.brand} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{p.brand} — {p.series}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.note}</div>
                      </div>
                      <button onClick={() => openSearch(motorResult.searchTerms)}
                        style={{ padding: "5px 12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                        {t("btn_search_arrow", lang)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CONTACTOR ─────────────────────────────────────── */}
      {tab === "contactor" && (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
            <strong>{t("prh_cont_verify_title", lang)}</strong> {t("prh_cont_verify_body", lang)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={lbl}>{t("prh_label_poles", lang)}</label>
              <select style={inp} value={contPoles} onChange={e => setContPoles(e.target.value)}>
                <option value="1">{t("prh_pole1", lang)}</option>
                <option value="2">{t("prh_pole2", lang)}</option>
                <option value="3">{t("prh_pole3", lang)}</option>
              </select>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_amp_rating", lang)}</label>
              <select style={inp} value={contAmps} onChange={e => setContAmps(e.target.value)}>
                {["20","25","30","40","50","60","75","90","100"].map(a => (
                  <option key={a} value={a}>{a}A</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>{t("prh_label_coil_voltage", lang)}</label>
              <select style={inp} value={contCoil} onChange={e => setContCoil(e.target.value)}>
                <option value="24V">{t("prh_coil_24v", lang)}</option>
                <option value="120V">120V</option>
                <option value="208-240V">208-240V</option>
                <option value="480V">{t("prh_coil_480v", lang)}</option>
              </select>
            </div>
          </div>
          <button style={searchBtn} onClick={() => setContResult(findContactor(contPoles, contAmps, contCoil, lang))}>
            {t("btn_find_contactor", lang)}
          </button>

          {contResult && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 4 }}>
                  {contResult.poles}-Pole · {contResult.amps}A · {contResult.coilVoltage} {t("prh_pole_coil", lang)}
                </div>
                <div style={{ fontSize: 12, color: "#374151" }}>{contResult.type}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>{t("prh_label_common_replacements", lang)}</div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {contResult.commonParts.map(p => (
                    <div key={p.brand} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{p.brand}</div>
                        <div style={{ fontSize: 12, color: "#374151", marginTop: 1 }}>{t("prh_part_ref", lang)} {p.part}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{p.note}</div>
                      </div>
                      <button onClick={() => openSearch(contResult.searchTerms)}
                        style={{ padding: "5px 12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                        {t("btn_search_arrow", lang)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
        {t("prh_footer_disclaimer", lang)}
      </div>
    </div>
  );
}
