"use client";

import React, { useState } from "react";

// ─── CAPACITOR CROSS-REFERENCE ────────────────────────────────
type CapResult = {
  mfd: string;
  voltage: string;
  type: string;
  terminals: string;
  commonUse: string;
  suppliers: { name: string; partNote: string }[];
};

function findCapacitor(mfd: string, voltage: string, type: string): CapResult | null {
  if (!mfd || !voltage) return null;
  const mfdNum = parseFloat(mfd);
  const voltNum = parseInt(voltage);

  const suppliers = [
    { name: "Johnstone Supply", partNote: `Search: ${mfd}MFD ${voltage}V ${type} capacitor` },
    { name: "Grainger", partNote: `Search: capacitor ${mfd} MFD ${voltage} volt ${type}` },
    { name: "Amazon", partNote: `Search: HVAC run capacitor ${mfd}uf ${voltage}v ${type}` },
  ];

  return {
    mfd,
    voltage,
    type,
    terminals: type === "Dual Run" ? "C · FAN · HERM terminals" : "Two terminals",
    commonUse: type === "Dual Run"
      ? `Compressor (HERM) + condenser fan motor (FAN) on the same unit. Most common on residential equipment.`
      : mfdNum > 40
        ? "Compressor start or large compressor run."
        : mfdNum > 10
          ? "Compressor run — single section."
          : "Fan motor run — single section.",
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

function findMotor(hp: string, rpm: string, voltage: string, frame: string, motorType: string): MotorResult | null {
  if (!hp || !rpm || !voltage) return null;

  const hpNum = parseFloat(hp);
  const rpmNum = parseInt(rpm);

  let commonParts: { brand: string; series: string; note: string }[] = [];
  let enclosure = "TEAO (Totally Enclosed Air Over)";

  if (motorType === "condenser") {
    enclosure = "TEAO";
    commonParts = [
      { brand: "Fasco", series: "D series", note: `D${Math.round(hpNum * 100).toString().padStart(3, "0")} — verify frame and shaft specs` },
      { brand: "Century / Genteq", series: "C series", note: "C" + Math.round(hpNum * 100).toString().padStart(3, "0") },
      { brand: "AO Smith", series: "ORM series", note: "Outdoor rated — verify shaft diameter and length" },
    ];
  } else if (motorType === "blower") {
    enclosure = "Open Drip Proof (ODP) or PSC";
    commonParts = [
      { brand: "Fasco", series: "7000/8000 series", note: "ECM replacements available for most PSC blower motors" },
      { brand: "Century / Genteq", series: "Evergreen series", note: "Universal ECM replacement — highly recommended" },
      { brand: "US Motors", series: "Rescue EZ series", note: "Adjustable speed ECM — check torque specs" },
    ];
  } else {
    enclosure = "ODP or TEFC";
    commonParts = [
      { brand: "Leeson", series: "C face motors", note: "Verify frame, shaft, and mounting" },
      { brand: "Marathon", series: "Blue Max series", note: "Check HP, RPM, voltage, frame" },
      { brand: "Baldor", series: "Super-E series", note: "Premium efficiency — verify frame" },
    ];
  }

  return {
    hp,
    rpm,
    voltage,
    frame,
    rotation: "CW or CCW — verify existing motor rotation before ordering",
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

function findContactor(poles: string, amps: string, coilVoltage: string): ContactorResult | null {
  if (!poles || !amps || !coilVoltage) return null;

  const ampsNum = parseInt(amps);
  const coilV = coilVoltage.replace("V", "").trim();

  const commonParts: { brand: string; part: string; note: string }[] = [
    {
      brand: "Honeywell / Resideo",
      part: `R8${poles === "2" ? "242" : "222"}A${ampsNum <= 30 ? "1032" : "1040"}`,
      note: `${poles}-pole, ${amps}A, ${coilVoltage} coil — verify exact coil voltage`,
    },
    {
      brand: "Square D / Schneider",
      part: `LC1D${ampsNum <= 25 ? "18" : ampsNum <= 40 ? "32" : "50"}${coilV === "24" ? "BX" : "MX"}`,
      note: "IEC style — verify dimensional fit if replacing direct",
    },
    {
      brand: "Packard",
      part: `C${poles}${ampsNum}A${coilV}`,
      note: "OEM style replacement — widely available at HVAC distributors",
    },
  ];

  return {
    poles,
    amps,
    coilVoltage,
    type: poles === "1" ? "Single pole — typically used for small loads or fan circuits" : "Two pole — standard compressor contactor",
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
    { key: "capacitor", label: "Capacitors", icon: "⚡" },
    { key: "motor", label: "Motors", icon: "🔄" },
    { key: "contactor", label: "Contactors", icon: "🔌" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#0f1f3d" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── CAPACITOR ─────────────────────────────────────── */}
      {tab === "capacitor" && (
        <div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "#92400e" }}>
            <strong>⚠️ Always verify:</strong> MFD rating must be within ±6% of original. Voltage rating must meet or exceed original — never go lower.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={lbl}>MFD Rating</label>
              <input style={inp} type="number" placeholder="e.g. 45/5, 35, 7.5" value={capMfd} onChange={e => setCapMfd(e.target.value)} />
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>For dual run: enter as "45/5" or just the compressor MFD</div>
            </div>
            <div>
              <label style={lbl}>Voltage Rating</label>
              <select style={inp} value={capVoltage} onChange={e => setCapVoltage(e.target.value)}>
                <option value="370">370V — most common residential</option>
                <option value="440">440V — can replace 370V</option>
                <option value="370/440">370/440V — dual rated</option>
                <option value="250">250V — small motors</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Type</label>
              <select style={inp} value={capType} onChange={e => setCapType(e.target.value)}>
                <option>Dual Run</option>
                <option>Single Run — Compressor</option>
                <option>Single Run — Fan</option>
                <option>Start Capacitor</option>
              </select>
            </div>
          </div>
          <button style={searchBtn} onClick={() => setCapResult(findCapacitor(capMfd, capVoltage, capType))}>
            Find Capacitor
          </button>

          {capResult && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 6 }}>
                  {capResult.mfd} MFD · {capResult.voltage}V · {capResult.type}
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}><strong>Terminals:</strong> {capResult.terminals}</div>
                <div style={{ fontSize: 13, color: "#374151" }}><strong>Common use:</strong> {capResult.commonUse}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Search suppliers</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {capResult.suppliers.map(s => (
                  <button key={s.name} onClick={() => openSearch(s.partNote.replace("Search: ", ""), s.name.toLowerCase().includes("grainger") ? "grainger" : s.name.toLowerCase().includes("amazon") ? "amazon" : "johnstone")}
                    style={{ padding: "10px 12px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f1f3d" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Opens in new tab →</div>
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
            <strong>📋 Before ordering:</strong> Note shaft diameter, shaft length, rotation direction, and mounting type. ECM replacements available for most PSC blower motors — worth considering.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>Motor Type</label>
              <select style={inp} value={motorType} onChange={e => setMotorType(e.target.value)}>
                <option value="condenser">Condenser Fan Motor</option>
                <option value="blower">Blower / Air Handler Motor</option>
                <option value="exhaust">Exhaust / Ventilation Fan</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Horsepower (HP)</label>
              <select style={inp} value={motorHp} onChange={e => setMotorHp(e.target.value)}>
                <option value="">Select HP...</option>
                {["1/20","1/15","1/12","1/10","1/8","1/6","1/5","1/4","1/3","1/2","3/4","1","1.5","2","3","5"].map(h => (
                  <option key={h} value={h}>{h} HP</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>RPM</label>
              <select style={inp} value={motorRpm} onChange={e => setMotorRpm(e.target.value)}>
                <option value="825">825 RPM</option>
                <option value="1075">1075 RPM — most common</option>
                <option value="1100">1100 RPM</option>
                <option value="1200">1200 RPM</option>
                <option value="1550">1550 RPM</option>
                <option value="1625">1625 RPM</option>
                <option value="1800">1800 RPM</option>
                <option value="3450">3450 RPM</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Voltage</label>
              <select style={inp} value={motorVoltage} onChange={e => setMotorVoltage(e.target.value)}>
                <option value="115">115V</option>
                <option value="208-230">208-230V — most common</option>
                <option value="460">460V — 3-phase</option>
                <option value="208-230/460">208-230/460V — dual voltage</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Frame (optional — e.g. 48, 56)</label>
            <input style={inp} placeholder="e.g. 48, 56 — check motor nameplate" value={motorFrame} onChange={e => setMotorFrame(e.target.value)} />
          </div>
          <button style={searchBtn} onClick={() => setMotorResult(findMotor(motorHp, motorRpm, motorVoltage, motorFrame, motorType))} disabled={!motorHp}>
            Find Motor
          </button>

          {motorResult && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 4 }}>
                  {motorResult.hp} HP · {motorResult.rpm} RPM · {motorResult.voltage}V
                  {motorResult.frame ? ` · Frame ${motorResult.frame}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}><strong>Enclosure:</strong> {motorResult.enclosure}</div>
                <div style={{ fontSize: 12, color: "#dc2626" }}><strong>⚠ {motorResult.rotation}</strong></div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>Common replacements</div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {motorResult.commonParts.map(p => (
                    <div key={p.brand} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{p.brand} — {p.series}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.note}</div>
                      </div>
                      <button onClick={() => openSearch(motorResult.searchTerms)}
                        style={{ padding: "5px 12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                        Search →
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
            <strong>⚠️ Always verify:</strong> Coil voltage (almost always 24V on residential), amp rating, number of poles, and that contacts aren't just dirty — clean before condemning.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={lbl}>Number of Poles</label>
              <select style={inp} value={contPoles} onChange={e => setContPoles(e.target.value)}>
                <option value="1">1 Pole — single phase small load</option>
                <option value="2">2 Pole — standard compressor</option>
                <option value="3">3 Pole — 3-phase equipment</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Amp Rating (FLA)</label>
              <select style={inp} value={contAmps} onChange={e => setContAmps(e.target.value)}>
                {["20","25","30","40","50","60","75","90","100"].map(a => (
                  <option key={a} value={a}>{a}A</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Coil Voltage</label>
              <select style={inp} value={contCoil} onChange={e => setContCoil(e.target.value)}>
                <option value="24V">24V — standard residential/light commercial</option>
                <option value="120V">120V</option>
                <option value="208-240V">208-240V</option>
                <option value="480V">480V — 3-phase</option>
              </select>
            </div>
          </div>
          <button style={searchBtn} onClick={() => setContResult(findContactor(contPoles, contAmps, contCoil))}>
            Find Contactor
          </button>

          {contResult && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 10 }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 4 }}>
                  {contResult.poles}-Pole · {contResult.amps}A · {contResult.coilVoltage} Coil
                </div>
                <div style={{ fontSize: 12, color: "#374151" }}>{contResult.type}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 8 }}>Common replacements</div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {contResult.commonParts.map(p => (
                    <div key={p.brand} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{p.brand}</div>
                        <div style={{ fontSize: 12, color: "#374151", marginTop: 1 }}>Part ref: {p.part}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{p.note}</div>
                      </div>
                      <button onClick={() => openSearch(contResult.searchTerms)}
                        style={{ padding: "5px 12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                        Search →
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
        Cross-reference results are starting points — always verify part numbers and specs against the original nameplate before ordering.
      </div>
    </div>
  );
}