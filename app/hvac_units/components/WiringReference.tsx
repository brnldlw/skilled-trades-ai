"use client";

import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";
import { t, type TranslationKey } from "../../lib/translations";

type WiringDiagram = {
  id: string;
  titleKey: TranslationKey;
  category: "cooling" | "heating" | "heatpump" | "refrigeration" | "controls";
  equipmentKeys: TranslationKey[];
  descKey: TranslationKey;
  components: { nameKey: TranslationKey; fnKey: TranslationKey }[];
  sequence: { step: number; actionKey: TranslationKey; voltage: string; voltageKey?: TranslationKey; noteKey?: TranslationKey }[];
  commonFaults: { symptomKey: TranslationKey; causeKey: TranslationKey; testKey: TranslationKey }[];
  tipKeys: TranslationKey[];
};

const DIAGRAMS: WiringDiagram[] = [
  {
    id: "single-stage-cooling",
    titleKey: "wr1_title",
    category: "cooling",
    equipmentKeys: ["wr_equip_res_split", "wr_equip_package_unit", "wr_equip_rtu_single"],
    descKey: "wr1_desc",
    components: [
      { nameKey: "wr1_comp1_name", fnKey: "wr1_comp1_fn" },
      { nameKey: "wr1_comp2_name", fnKey: "wr1_comp2_fn" },
      { nameKey: "wr1_comp3_name", fnKey: "wr1_comp3_fn" },
      { nameKey: "wr1_comp4_name", fnKey: "wr1_comp4_fn" },
      { nameKey: "wr1_comp5_name", fnKey: "wr1_comp5_fn" },
      { nameKey: "wr1_comp6_name", fnKey: "wr1_comp6_fn" },
    ],
    sequence: [
      { step: 1, actionKey: "wr1_seq1_action", voltage: "24V", noteKey: "wr1_seq1_note" },
      { step: 2, actionKey: "wr1_seq2_action", voltage: "24V", noteKey: "wr1_seq2_note" },
      { step: 3, actionKey: "wr1_seq3_action", voltage: "24V coil / 240V line", noteKey: "wr1_seq3_note" },
      { step: 4, actionKey: "wr1_seq4_action", voltage: "208-240V", noteKey: "wr1_seq4_note" },
      { step: 5, actionKey: "wr1_seq5_action", voltage: "24V", noteKey: "wr1_seq5_note" },
      { step: 6, actionKey: "wr1_seq6_action", voltage: "Continuous", voltageKey: "wr1_seq_continuous", noteKey: "wr1_seq6_note" },
    ],
    commonFaults: [
      { symptomKey: "wr1_fault1_symptom", causeKey: "wr1_fault1_cause", testKey: "wr1_fault1_test" },
      { symptomKey: "wr1_fault2_symptom", causeKey: "wr1_fault2_cause", testKey: "wr1_fault2_test" },
      { symptomKey: "wr1_fault3_symptom", causeKey: "wr1_fault3_cause", testKey: "wr1_fault3_test" },
      { symptomKey: "wr1_fault4_symptom", causeKey: "wr1_fault4_cause", testKey: "wr1_fault4_test" },
      { symptomKey: "wr1_fault5_symptom", causeKey: "wr1_fault5_cause", testKey: "wr1_fault5_test" },
    ],
    tipKeys: ["wr1_tip1", "wr1_tip2", "wr1_tip3", "wr1_tip4", "wr1_tip5"],
  },

  {
    id: "heat-pump-basic",
    titleKey: "wr2_title",
    category: "heatpump",
    equipmentKeys: ["wr_equip_res_hp", "wr_equip_package_hp", "wr_equip_minisplit_hp"],
    descKey: "wr2_desc",
    components: [
      { nameKey: "wr2_comp1_name", fnKey: "wr2_comp1_fn" },
      { nameKey: "wr2_comp2_name", fnKey: "wr2_comp2_fn" },
      { nameKey: "wr2_comp3_name", fnKey: "wr2_comp3_fn" },
      { nameKey: "wr2_comp4_name", fnKey: "wr2_comp4_fn" },
      { nameKey: "wr2_comp5_name", fnKey: "wr2_comp5_fn" },
      { nameKey: "wr2_comp6_name", fnKey: "wr2_comp6_fn" },
    ],
    sequence: [
      { step: 1, actionKey: "wr2_seq1_action", voltage: "24V", noteKey: "wr2_seq1_note" },
      { step: 2, actionKey: "wr2_seq2_action", voltage: "240V", noteKey: "wr2_seq2_note" },
      { step: 3, actionKey: "wr2_seq3_action", voltage: "Signal", noteKey: "wr2_seq3_note" },
      { step: 4, actionKey: "wr2_seq4_action", voltage: "24V", noteKey: "wr2_seq4_note" },
      { step: 5, actionKey: "wr2_seq5_action", voltage: "240V", noteKey: "wr2_seq5_note" },
      { step: 6, actionKey: "wr2_seq6_action", voltage: "Signal", noteKey: "wr2_seq6_note" },
    ],
    commonFaults: [
      { symptomKey: "wr2_fault1_symptom", causeKey: "wr2_fault1_cause", testKey: "wr2_fault1_test" },
      { symptomKey: "wr2_fault2_symptom", causeKey: "wr2_fault2_cause", testKey: "wr2_fault2_test" },
      { symptomKey: "wr2_fault3_symptom", causeKey: "wr2_fault3_cause", testKey: "wr2_fault3_test" },
      { symptomKey: "wr2_fault4_symptom", causeKey: "wr2_fault4_cause", testKey: "wr2_fault4_test" },
      { symptomKey: "wr2_fault5_symptom", causeKey: "wr2_fault5_cause", testKey: "wr2_fault5_test" },
    ],
    tipKeys: ["wr2_tip1", "wr2_tip2", "wr2_tip3", "wr2_tip4"],
  },

  {
    id: "gas-furnace",
    titleKey: "wr3_title",
    category: "heating",
    equipmentKeys: ["wr_equip_res_furnace", "wr_equip_comm_furnace", "wr_equip_package_gas"],
    descKey: "wr3_desc",
    components: [
      { nameKey: "wr3_comp1_name", fnKey: "wr3_comp1_fn" },
      { nameKey: "wr3_comp2_name", fnKey: "wr3_comp2_fn" },
      { nameKey: "wr3_comp3_name", fnKey: "wr3_comp3_fn" },
      { nameKey: "wr3_comp4_name", fnKey: "wr3_comp4_fn" },
      { nameKey: "wr3_comp5_name", fnKey: "wr3_comp5_fn" },
      { nameKey: "wr3_comp6_name", fnKey: "wr3_comp6_fn" },
      { nameKey: "wr3_comp7_name", fnKey: "wr3_comp7_fn" },
      { nameKey: "wr3_comp8_name", fnKey: "wr3_comp8_fn" },
    ],
    sequence: [
      { step: 1, actionKey: "wr3_seq1_action", voltage: "24V", noteKey: "wr3_seq1_note" },
      { step: 2, actionKey: "wr3_seq2_action", voltage: "120V", noteKey: "wr3_seq2_note" },
      { step: 3, actionKey: "wr3_seq3_action", voltage: "24V signal", noteKey: "wr3_seq3_note" },
      { step: 4, actionKey: "wr3_seq4_action", voltage: "120V", noteKey: "wr3_seq4_note" },
      { step: 5, actionKey: "wr3_seq5_action", voltage: "24V", noteKey: "wr3_seq5_note" },
      { step: 6, actionKey: "wr3_seq6_action", voltage: "Microamps (0.5-4µA typical)", voltageKey: "wr3_seq_microamps", noteKey: "wr3_seq6_note" },
      { step: 7, actionKey: "wr3_seq7_action", voltage: "120V", noteKey: "wr3_seq7_note" },
    ],
    commonFaults: [
      { symptomKey: "wr3_fault1_symptom", causeKey: "wr3_fault1_cause", testKey: "wr3_fault1_test" },
      { symptomKey: "wr3_fault2_symptom", causeKey: "wr3_fault2_cause", testKey: "wr3_fault2_test" },
      { symptomKey: "wr3_fault3_symptom", causeKey: "wr3_fault3_cause", testKey: "wr3_fault3_test" },
      { symptomKey: "wr3_fault4_symptom", causeKey: "wr3_fault4_cause", testKey: "wr3_fault4_test" },
      { symptomKey: "wr3_fault5_symptom", causeKey: "wr3_fault5_cause", testKey: "wr3_fault5_test" },
    ],
    tipKeys: ["wr3_tip1", "wr3_tip2", "wr3_tip3", "wr3_tip4", "wr3_tip5"],
  },

  {
    id: "walk-in-refrigeration",
    titleKey: "wr4_title",
    category: "refrigeration",
    equipmentKeys: ["wr_equip_walkin_cooler", "wr_equip_walkin_freezer", "wr_equip_reachin_cooler"],
    descKey: "wr4_desc",
    components: [
      { nameKey: "wr4_comp1_name", fnKey: "wr4_comp1_fn" },
      { nameKey: "wr4_comp2_name", fnKey: "wr4_comp2_fn" },
      { nameKey: "wr4_comp3_name", fnKey: "wr4_comp3_fn" },
      { nameKey: "wr4_comp4_name", fnKey: "wr4_comp4_fn" },
      { nameKey: "wr4_comp5_name", fnKey: "wr4_comp5_fn" },
      { nameKey: "wr4_comp6_name", fnKey: "wr4_comp6_fn" },
      { nameKey: "wr4_comp7_name", fnKey: "wr4_comp7_fn" },
    ],
    sequence: [
      { step: 1, actionKey: "wr4_seq1_action", voltage: "24V or 120V/240V", noteKey: "wr4_seq1_note" },
      { step: 2, actionKey: "wr4_seq2_action", voltage: "120V or 208V", noteKey: "wr4_seq2_note" },
      { step: 3, actionKey: "wr4_seq3_action", voltage: "Off", noteKey: "wr4_seq3_note" },
      { step: 4, actionKey: "wr4_seq4_action", voltage: "Switches", voltageKey: "wr4_seq_switches", noteKey: "wr4_seq4_note" },
      { step: 5, actionKey: "wr4_seq5_action", voltage: "240V typically", noteKey: "wr4_seq5_note" },
      { step: 6, actionKey: "wr4_seq6_action", voltage: "Off", noteKey: "wr4_seq6_note" },
      { step: 7, actionKey: "wr4_seq7_action", voltage: "120V/208V", noteKey: "wr4_seq7_note" },
    ],
    commonFaults: [
      { symptomKey: "wr4_fault1_symptom", causeKey: "wr4_fault1_cause", testKey: "wr4_fault1_test" },
      { symptomKey: "wr4_fault2_symptom", causeKey: "wr4_fault2_cause", testKey: "wr4_fault2_test" },
      { symptomKey: "wr4_fault3_symptom", causeKey: "wr4_fault3_cause", testKey: "wr4_fault3_test" },
      { symptomKey: "wr4_fault4_symptom", causeKey: "wr4_fault4_cause", testKey: "wr4_fault4_test" },
      { symptomKey: "wr4_fault5_symptom", causeKey: "wr4_fault5_cause", testKey: "wr4_fault5_test" },
    ],
    tipKeys: ["wr4_tip1", "wr4_tip2", "wr4_tip3", "wr4_tip4", "wr4_tip5", "wr4_tip6"],
  },

  {
    id: "low-voltage-troubleshooting",
    titleKey: "wr5_title",
    category: "controls",
    equipmentKeys: ["wr_equip_all_24v"],
    descKey: "wr5_desc",
    components: [
      { nameKey: "wr5_comp1_name", fnKey: "wr5_comp1_fn" },
      { nameKey: "wr5_comp2_name", fnKey: "wr5_comp2_fn" },
      { nameKey: "wr5_comp3_name", fnKey: "wr5_comp3_fn" },
      { nameKey: "wr5_comp4_name", fnKey: "wr5_comp4_fn" },
      { nameKey: "wr5_comp5_name", fnKey: "wr5_comp5_fn" },
    ],
    sequence: [
      { step: 1, actionKey: "wr5_seq1_action", voltage: "24V AC ±10%", noteKey: "wr5_seq1_note" },
      { step: 2, actionKey: "wr5_seq2_action", voltage: "24V AC", noteKey: "wr5_seq2_note" },
      { step: 3, actionKey: "wr5_seq3_action", voltage: "24V AC", noteKey: "wr5_seq3_note" },
      { step: 4, actionKey: "wr5_seq4_action", voltage: "24V AC", noteKey: "wr5_seq4_note" },
      { step: 5, actionKey: "wr5_seq5_action", voltage: "24V AC at coil/solenoid", noteKey: "wr5_seq5_note" },
    ],
    commonFaults: [
      { symptomKey: "wr5_fault1_symptom", causeKey: "wr5_fault1_cause", testKey: "wr5_fault1_test" },
      { symptomKey: "wr5_fault2_symptom", causeKey: "wr5_fault2_cause", testKey: "wr5_fault2_test" },
      { symptomKey: "wr5_fault3_symptom", causeKey: "wr5_fault3_cause", testKey: "wr5_fault3_test" },
      { symptomKey: "wr5_fault4_symptom", causeKey: "wr5_fault4_cause", testKey: "wr5_fault4_test" },
      { symptomKey: "wr5_fault5_symptom", causeKey: "wr5_fault5_cause", testKey: "wr5_fault5_test" },
    ],
    tipKeys: ["wr5_tip1", "wr5_tip2", "wr5_tip3", "wr5_tip4", "wr5_tip5", "wr5_tip6"],
  },
];

const CATEGORY_CONFIG: Record<WiringDiagram["category"], { labelKey: TranslationKey; color: string; bg: string; icon: string }> = {
  cooling:       { labelKey: "wr_cat_cooling",       color: "#2563eb", bg: "#dbeafe",  icon: "❄️" },
  heating:       { labelKey: "wr_cat_heating",       color: "#dc2626", bg: "#fee2e2",  icon: "🔥" },
  heatpump:      { labelKey: "wr_cat_heatpump",      color: "#7c3aed", bg: "#f3e8ff",  icon: "🔄" },
  refrigeration: { labelKey: "wr_cat_refrigeration", color: "#0891b2", bg: "#cffafe",  icon: "🧊" },
  controls:      { labelKey: "wr_cat_controls",      color: "#374151", bg: "#f1f5f9",  icon: "🎛️" },
};

type Props = { equipmentType?: string };

export function WiringReference({ equipmentType }: Props) {
  const { lang } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sequence" | "faults" | "tips">("sequence");
  const [filter, setFilter] = useState<string>("all");

  const selectedDiagram = selected ? DIAGRAMS.find(d => d.id === selected) : null;

  // Auto-suggest based on equipment type
  const suggested = equipmentType
    ? DIAGRAMS.filter(d => d.equipmentKeys.some(k => {
        const e = t(k, lang);
        return e.toLowerCase().includes(equipmentType.toLowerCase()) ||
          equipmentType.toLowerCase().includes(e.toLowerCase().split(" ")[0]);
      }))
    : [];

  const filtered = DIAGRAMS.filter(d =>
    filter === "all" || d.category === filter
  );

  if (selectedDiagram) {
    const cat = CATEGORY_CONFIG[selectedDiagram.category];
    return (
      <div>
        <button onClick={() => setSelected(null)}
          style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
          {t("wr_back_to_library", lang)}
        </button>

        {/* Header */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 24 }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t(selectedDiagram.titleKey, lang)}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {selectedDiagram.equipmentKeys.map(k => (
                  <span key={k} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color }}>{t(k, lang)}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{t(selectedDiagram.descKey, lang)}</div>
        </div>

        {/* Components */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8 }}>{t("wr_key_components", lang)}</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {selectedDiagram.components.map(c => (
              <div key={c.nameKey} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${cat.color}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: cat.color, width: 160, flexShrink: 0 }}>{t(c.nameKey, lang)}</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{t(c.fnKey, lang)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 12 }}>
          {(["sequence", "faults", "tips"] as const).map(tb => (
            <button key={tb} onClick={() => setActiveTab(tb)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: activeTab === tb ? "#fff" : "transparent", color: activeTab === tb ? "#0f1f3d" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", boxShadow: activeTab === tb ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {tb === "sequence" ? t("wr_tab_sequence", lang) : tb === "faults" ? t("wr_tab_faults", lang) : t("wr_tab_tips", lang)}
            </button>
          ))}
        </div>

        {/* Sequence */}
        {activeTab === "sequence" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {selectedDiagram.sequence.map(s => (
              <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0f1f3d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>{t(s.actionKey, lang)}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20, background: "#f0fdf4", color: "#166534" }}>{s.voltageKey ? t(s.voltageKey, lang) : s.voltage}</span>
                    {s.noteKey && <span style={{ fontSize: 11, color: "#64748b" }}>{t(s.noteKey, lang)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Faults */}
        {activeTab === "faults" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {selectedDiagram.commonFaults.map((f, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>⚠ {t(f.symptomKey, lang)}</div>
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}><strong>{t("wr_likely_cause", lang)}</strong> {t(f.causeKey, lang)}</div>
                <div style={{ fontSize: 12, color: "#2563eb" }}><strong>{t("wr_test_colon", lang)}</strong> {t(f.testKey, lang)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {activeTab === "tips" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {selectedDiagram.tipKeys.map((tipKey, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #f97316", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{t(tipKey, lang)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#1d4ed8" }}>
        <strong>{t("wr_about_title", lang)}</strong> {t("wr_about_body", lang)}
      </div>

      {/* Suggested based on job */}
      {suggested.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8 }}>{t("wr_suggested_title", lang)}</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {suggested.map(d => {
              const cat = CATEGORY_CONFIG[d.category];
              return (
                <button key={d.id} onClick={() => { setSelected(d.id); setActiveTab("sequence"); }}
                  style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1f3d" }}>{t(d.titleKey, lang)}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{d.equipmentKeys.map(k => t(k, lang)).join(" · ")}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 12 }}>
        <button onClick={() => setFilter("all")} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === "all" ? "#0f1f3d" : "#e2e8f0"}`, background: filter === "all" ? "#0f1f3d" : "#fff", color: filter === "all" ? "#fff" : "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{t("wr_filter_all", lang)}</button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === key ? cat.color : "#e2e8f0"}`, background: filter === key ? cat.bg : "#fff", color: filter === key ? cat.color : "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {cat.icon} {t(cat.labelKey, lang)}
          </button>
        ))}
      </div>

      {/* Diagram list */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {filtered.map(d => {
          const cat = CATEGORY_CONFIG[d.category];
          return (
            <div key={d.id} onClick={() => { setSelected(d.id); setActiveTab("sequence"); }}
              style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLDivElement).style.background = "#f0f9ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d" }}>{t(d.titleKey, lang)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color }}>{t(cat.labelKey, lang)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{t(d.descKey, lang)}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {d.equipmentKeys.map(k => (
                      <span key={k} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>{t(k, lang)}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: "#94a3b8", fontSize: 16 }}>→</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
        {t("wr_footer_disclaimer", lang)}
      </div>
    </div>
  );
}
