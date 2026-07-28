"use client";

import React, { useState, useEffect, useRef } from "react";
import { getUserProfile, getEstimatorAccess, type EstimatorAccess } from "../../lib/supabase/subscription";
import { EstimatorLockedOverlay, EstimatorUpgradePrompt } from "./EstimatorUpgradePrompt";
import { useLang } from "../../components/LanguageContext";
import { t, type Language, type TranslationKey } from "../../lib/translations";

// ── Canonical survey option values → translation keys ─────────
// Values stored in survey state / sent to the AI stay English; only the
// displayed label is translated, via this content-lookup map.
const SURVEY_VALUE_KEYS: Record<string, TranslationKey> = {
  "RTU": "qe_val_rtu",
  "Split System": "qe_val_split_system",
  "Walk-in Cooler": "qe_val_walkin_cooler",
  "Walk-in Freezer": "qe_val_walkin_freezer",
  "Ice Machine": "qe_val_ice_machine",
  "Furnace": "qe_val_furnace",
  "Mini-Split": "qe_val_mini_split",
  "Chiller": "qe_val_chiller",
  "Other": "qe_val_other",
  "Routine — planning ahead": "qe_val_urgency_routine",
  "Soon — within 30 days": "qe_val_urgency_soon",
  "Emergency — unit down now": "qe_val_urgency_emergency",
  "Interior stair to roof hatch": "qe_val_roof_interior_stair",
  "Exterior ladder": "qe_val_roof_exterior_ladder",
  "Mechanical lift / scissor lift needed": "qe_val_roof_lift",
  "Ground level — no roof access needed": "qe_val_roof_ground_level",
  "Basement / crawlspace": "qe_val_roof_basement",
  "Elevator available": "qe_val_roof_elevator",
  "No — we can show up anytime": "qe_val_sched_no",
  "Yes — must call facility manager ahead": "qe_val_sched_facility_mgr",
  "Yes — must coordinate with property management": "qe_val_sched_property_mgmt",
  "Yes — tenant notification required": "qe_val_sched_tenant_notice",
  "Yes — multiple parties must be coordinated": "qe_val_sched_multi_party",
  "No restrictions — work anytime": "qe_val_hours_no_restrictions",
  "Weekdays only, normal business hours": "qe_val_hours_weekdays",
  "After hours only — weekday evenings": "qe_val_hours_after_hours",
  "Weekends only": "qe_val_hours_weekends",
  "Specific window — see notes": "qe_val_hours_specific_window",
  "Yes — must be out before business hours": "qe_val_crane_time_before_hours",
  "Yes — street closure window limited": "qe_val_crane_time_street_closure",
  "Yes — utility hold window is limited": "qe_val_crane_time_utility_hold",
  "Yes — see notes": "qe_val_crane_time_see_notes",
  "No — free access": "qe_val_escort_no",
  "Yes — call ahead required": "qe_val_escort_call_ahead",
  "Yes — escort required at all times": "qe_val_escort_always",
  "Yes — badge / key fob needed": "qe_val_escort_badge",
  "Yes — definitely needed": "qe_val_crane_yes",
  "No — can be hand-carried or used lift": "qe_val_crane_no_lift",
  "Not sure — need to check unit weight": "qe_val_crane_not_sure",
  "Parking lot": "qe_val_staging_parking_lot",
  "Street / lane closure needed": "qe_val_staging_street",
  "Alley": "qe_val_staging_alley",
  "Private property adjacent": "qe_val_staging_private",
  "No lines present": "qe_val_overhead_no_lines",
  "Yes — lines present, utility hold needed": "qe_val_overhead_hold_needed",
  "Yes — lines present, safe clearance available": "qe_val_overhead_clearance",
};
// "No restrictions" (crane time) collides in meaning but not in text with
// "No restrictions — work anytime" (work hours) — kept as a separate key
// below since the exact strings differ; this entry covers the bare one.
SURVEY_VALUE_KEYS["No restrictions"] = "qe_val_crane_time_no_restrictions";

function translateSurveyValue(value: string, lang: Language): string {
  const key = SURVEY_VALUE_KEYS[value];
  return key ? t(key, lang) : value;
}

// ── Mock preview content shown blurred behind the lock ────────
function EstimatorPreview() {
  const { lang } = useLang();
  const statLabels = [t("qe_stat_quotes_month", lang), t("qe_stat_avg_quote", lang), t("qe_stat_win_rate", lang)];
  const recentQuotes = [
    ["Riverside Commons", t("qe_val_rtu", lang) + " #3", "$18,400"],
    ["Lakewood Grocery", t("qe_val_walkin_freezer", lang), "$12,750"],
    ["City Hall HVAC", t("qe_val_split_system", lang), "$8,900"],
  ];
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {statLabels.map((label, i) => (
          <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", textAlign: "center" as const }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f1f3d" }}>{["12", "$14,200", "68%"][i]}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d", marginBottom: 12 }}>{t("qe_recent_quotes", lang)}</div>
        {recentQuotes.map(([name, equip, price]) => (
          <div key={name} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#374151", display: "flex", justifyContent: "space-between" }}>
            <span>{name} — {equip}</span>
            <span style={{ fontWeight: 700, color: "#16a34a" }}>{price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main estimator section ─────────────────────────────────────
export function EstimatorSection({
  unitId,
  manufacturer,
  model,
  equipmentType,
}: {
  unitId?: string;
  manufacturer?: string;
  model?: string;
  equipmentType?: string;
}) {
  const { lang } = useLang();
  const [access, setAccess] = useState<EstimatorAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) setAccess(getEstimatorAccess(profile));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" as const, color: "#94a3b8", fontSize: 13 }}>{t("loading", lang)}</div>;
  }

  // Not subscribed — show locked overlay
  if (!access?.canCreate) {
    return (
      <EstimatorLockedOverlay>
        <EstimatorPreview />
      </EstimatorLockedOverlay>
    );
  }

  // Subscribed — show the real estimator
  return (
    <EstimatorUnlocked
      access={access}
      unitId={unitId}
      manufacturer={manufacturer}
      model={model}
      equipmentType={equipmentType}
    />
  );
}

// ── Unlocked estimator for subscribers ────────────────────────
function EstimatorUnlocked({
  access,
  unitId,
  manufacturer,
  model,
  equipmentType,
}: {
  access: EstimatorAccess;
  unitId?: string;
  manufacturer?: string;
  model?: string;
  equipmentType?: string;
}) {
  const { lang } = useLang();
  const [view, setView] = useState<"dashboard" | "new_quote">("dashboard");

  return (
    <div>
      {/* Access badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#dcfce7", color: "#166534" }}>
            {access.tier === "monthly_unlimited"
              ? t("qe_unlimited_badge", lang)
              : access.tier === "single"
              ? t("qe_credits_badge", lang).replace("{count}", String(access.credits))
              : t("qe_used_badge", lang).replace("{used}", String(access.quotesUsedThisMonth)).replace("{limit}", String(access.monthlyLimit))}
          </span>
        </div>
        <button
          onClick={() => setView("new_quote")}
          style={{ padding: "9px 18px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          {t("btn_new_quote", lang)}
        </button>
      </div>

      {view === "dashboard" && <QuoteDashboard onNew={() => setView("new_quote")} />}
      {view === "new_quote" && (
        <NewQuoteFlow
          unitId={unitId}
          manufacturer={manufacturer}
          model={model}
          equipmentType={equipmentType}
          onBack={() => setView("dashboard")}
        />
      )}
    </div>
  );
}

// ── Quote dashboard ────────────────────────────────────────────
function QuoteDashboard({ onNew }: { onNew: () => void }) {
  const { lang } = useLang();
  return (
    <div>
      <div style={{ padding: "32px 0", textAlign: "center" as const, background: "#f8fafc", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{t("qe_no_quotes_yet", lang)}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
          {t("qe_start_new_quote_body", lang)}
        </div>
        <button onClick={onNew}
          style={{ padding: "10px 24px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          {t("btn_start_first_quote", lang)}
        </button>
      </div>
    </div>
  );
}

// ── New quote flow — guided survey ────────────────────────────
type SurveyStep = "job_setup" | "site_access" | "logistics" | "photos" | "generate";

function NewQuoteFlow({
  unitId, manufacturer, model, equipmentType, onBack,
}: {
  unitId?: string;
  manufacturer?: string;
  model?: string;
  equipmentType?: string;
  onBack: () => void;
}) {
  const { lang } = useLang();
  const [step, setStep] = useState<SurveyStep>("job_setup");
  const [generating, setGenerating] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [survey, setSurvey] = useState<Record<string, any>>({
    equipment_type: equipmentType || "",
    urgency: "",
    customer_name: "",
    site_address: "",
    unit_label: manufacturer && model ? `${manufacturer} ${model}` : "",
    roof_access: "",
    walk_distance: "",
    crane_required: "",
    staging_location: "",
    overhead_lines: "",
    notes: "",
  });

  const steps: { key: SurveyStep; label: string; icon: string }[] = [
    { key: "job_setup", label: t("qe_step_job_setup", lang), icon: "1" },
    { key: "site_access", label: t("qe_step_site_access", lang), icon: "2" },
    { key: "logistics", label: t("qe_step_logistics", lang), icon: "3" },
    { key: "photos", label: t("qe_step_photos", lang), icon: "4" },
    { key: "generate", label: t("qe_step_generate", lang), icon: "5" },
  ];

  const stepIdx = steps.findIndex(s => s.key === step);

  function updateSurvey(key: string, val: any) {
    setSurvey(prev => ({ ...prev, [key]: val }));
  }

  async function generateQuote() {
    setGenerating(true);
    try {
      const res = await fetch("/api/quote-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ survey, unitId, lang }),
      });
      const data = await res.json();
      if (data.ok) setQuoteResult(data.quote);
    } catch (e) {
      console.error("Quote generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa",
  };
  const sel: React.CSSProperties = { ...inp };
  const lbl: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: "#374151",
    marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.04em",
  };

  if (quoteResult) {
    return <QuoteResultView quote={quoteResult} survey={survey} onBack={() => setQuoteResult(null)} />;
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        {t("tour_back", lang)}
      </button>

      {/* Step progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= stepIdx ? "#0f1f3d" : "#e2e8f0", color: i <= stepIdx ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
              {i < stepIdx ? "✓" : s.icon}
            </div>
            <div style={{ fontSize: 9, color: i <= stepIdx ? "#0f1f3d" : "#94a3b8", fontWeight: 600, textAlign: "center" as const }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Step 1: Job Setup */}
      {step === "job_setup" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t("qe_step_job_setup", lang)}</div>
          <div><label style={lbl}>{t("qe_label_equipment_type", lang)}</label>
            <select style={sel} value={survey.equipment_type} onChange={e => updateSurvey("equipment_type", e.target.value)}>
              <option value="">{t("option_select_ellipsis", lang)}</option>
              {["RTU", "Split System", "Walk-in Cooler", "Walk-in Freezer", "Ice Machine", "Furnace", "Mini-Split", "Chiller", "Other"].map(v => <option key={v} value={v}>{translateSurveyValue(v, lang)}</option>)}
            </select>
          </div>
          <div><label style={lbl}>{t("qe_label_urgency", lang)}</label>
            <select style={sel} value={survey.urgency} onChange={e => updateSurvey("urgency", e.target.value)}>
              <option value="">{t("option_select_ellipsis", lang)}</option>
              <option value="Routine — planning ahead">{t("qe_val_urgency_routine", lang)}</option>
              <option value="Soon — within 30 days">{t("qe_val_urgency_soon", lang)}</option>
              <option value="Emergency — unit down now">{t("qe_val_urgency_emergency", lang)}</option>
            </select>
          </div>
          <div><label style={lbl}>{t("qe_label_customer_site_name", lang)}</label>
            <input style={inp} value={survey.customer_name} onChange={e => updateSurvey("customer_name", e.target.value)} placeholder="Riverside Commons" />
          </div>
          <div><label style={lbl}>{t("qe_label_site_address", lang)}</label>
            <input style={inp} value={survey.site_address} onChange={e => updateSurvey("site_address", e.target.value)} placeholder="123 Main St, Indianapolis IN" />
          </div>
          <div><label style={lbl}>{t("qe_label_unit_label", lang)}</label>
            <input style={inp} value={survey.unit_label} onChange={e => updateSurvey("unit_label", e.target.value)} placeholder="RTU #3 or Carrier 48XB009" />
          </div>
          <button onClick={() => setStep("site_access")} disabled={!survey.equipment_type || !survey.customer_name}
            style={{ padding: "12px", background: survey.equipment_type && survey.customer_name ? "#0f1f3d" : "#e2e8f0", color: survey.equipment_type && survey.customer_name ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            {t("btn_next_site_access", lang)}
          </button>
        </div>
      )}

      {/* Step 2: Site Access */}
      {step === "site_access" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t("qe_step_site_access", lang)}</div>

          <div><label style={lbl}>{t("qe_label_roof_access_method", lang)}</label>
            <select style={sel} value={survey.roof_access} onChange={e => updateSurvey("roof_access", e.target.value)}>
              <option value="">{t("option_select_ellipsis", lang)}</option>
              <option value="Interior stair to roof hatch">{t("qe_val_roof_interior_stair", lang)}</option>
              <option value="Exterior ladder">{t("qe_val_roof_exterior_ladder", lang)}</option>
              <option value="Mechanical lift / scissor lift needed">{t("qe_val_roof_lift", lang)}</option>
              <option value="Ground level — no roof access needed">{t("qe_val_roof_ground_level", lang)}</option>
              <option value="Basement / crawlspace">{t("qe_val_roof_basement", lang)}</option>
              <option value="Elevator available">{t("qe_val_roof_elevator", lang)}</option>
            </select>
          </div>

          <div><label style={lbl}>{t("qe_label_walk_distance", lang)}</label>
            <input style={inp} type="number" value={survey.walk_distance} onChange={e => updateSurvey("walk_distance", e.target.value)} placeholder={t("qe_walk_distance_placeholder", lang)} />
            {parseInt(survey.walk_distance) > 100 && (
              <div style={{ marginTop: 6, padding: "8px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, fontSize: 12, color: "#92400e" }}>
                {t("qe_over_100ft_warning", lang)}
              </div>
            )}
          </div>

          {/* Scheduling section */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f1f3d" }}>{t("qe_scheduling_restrictions", lang)}</div>

            <div><label style={lbl}>{t("qe_label_schedule_required", lang)}</label>
              <select style={sel} value={survey.schedule_required || ""} onChange={e => updateSurvey("schedule_required", e.target.value)}>
                <option value="">{t("option_select_ellipsis", lang)}</option>
                <option value="No — we can show up anytime">{t("qe_val_sched_no", lang)}</option>
                <option value="Yes — must call facility manager ahead">{t("qe_val_sched_facility_mgr", lang)}</option>
                <option value="Yes — must coordinate with property management">{t("qe_val_sched_property_mgmt", lang)}</option>
                <option value="Yes — tenant notification required">{t("qe_val_sched_tenant_notice", lang)}</option>
                <option value="Yes — multiple parties must be coordinated">{t("qe_val_sched_multi_party", lang)}</option>
              </select>
            </div>

            {survey.schedule_required && survey.schedule_required !== "No — we can show up anytime" && (
              <div><label style={lbl}>{t("qe_label_schedule_contact", lang)}</label>
                <input style={inp} value={survey.schedule_contact || ""} onChange={e => updateSurvey("schedule_contact", e.target.value)} placeholder={t("qe_schedule_contact_placeholder", lang)} />
              </div>
            )}

            <div><label style={lbl}>{t("qe_label_work_hours", lang)}</label>
              <select style={sel} value={survey.work_hours || ""} onChange={e => updateSurvey("work_hours", e.target.value)}>
                <option value="">{t("option_select_ellipsis", lang)}</option>
                <option value="No restrictions — work anytime">{t("qe_val_hours_no_restrictions", lang)}</option>
                <option value="Weekdays only, normal business hours">{t("qe_val_hours_weekdays", lang)}</option>
                <option value="After hours only — weekday evenings">{t("qe_val_hours_after_hours", lang)}</option>
                <option value="Weekends only">{t("qe_val_hours_weekends", lang)}</option>
                <option value="Specific window — see notes">{t("qe_val_hours_specific_window", lang)}</option>
              </select>
            </div>

            <div><label style={lbl}>{t("qe_label_crane_time_restriction", lang)}</label>
              <select style={sel} value={survey.crane_time_restriction || ""} onChange={e => updateSurvey("crane_time_restriction", e.target.value)}>
                <option value="">{t("option_select_ellipsis", lang)}</option>
                <option value="No restrictions">{t("qe_val_crane_time_no_restrictions", lang)}</option>
                <option value="Yes — must be out before business hours">{t("qe_val_crane_time_before_hours", lang)}</option>
                <option value="Yes — street closure window limited">{t("qe_val_crane_time_street_closure", lang)}</option>
                <option value="Yes — utility hold window is limited">{t("qe_val_crane_time_utility_hold", lang)}</option>
                <option value="Yes — see notes">{t("qe_val_crane_time_see_notes", lang)}</option>
              </select>
            </div>

            <div><label style={lbl}>{t("qe_label_work_restrictions", lang)}</label>
              <textarea value={survey.work_restrictions || ""} onChange={e => updateSurvey("work_restrictions", e.target.value)}
                placeholder={t("qe_work_restrictions_placeholder", lang)}
                rows={2} style={{ ...inp, resize: "vertical" as const }} />
            </div>
          </div>

          <div><label style={lbl}>{t("qe_label_security_escort", lang)}</label>
            <select style={sel} value={survey.security_escort} onChange={e => updateSurvey("security_escort", e.target.value)}>
              <option value="">{t("option_select_ellipsis", lang)}</option>
              <option value="No — free access">{t("qe_val_escort_no", lang)}</option>
              <option value="Yes — call ahead required">{t("qe_val_escort_call_ahead", lang)}</option>
              <option value="Yes — escort required at all times">{t("qe_val_escort_always", lang)}</option>
              <option value="Yes — badge / key fob needed">{t("qe_val_escort_badge", lang)}</option>
            </select>
          </div>

          <div><label style={lbl}>{t("qe_label_access_notes", lang)}</label>
            <input style={inp} value={survey.access_notes || ""} onChange={e => updateSurvey("access_notes", e.target.value)} placeholder={t("qe_access_notes_placeholder", lang)} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("job_setup")} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>{t("tour_back", lang)}</button>
            <button onClick={() => setStep("logistics")} style={{ flex: 2, padding: "10px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("btn_next_logistics", lang)}</button>
          </div>
        </div>
      )}

      {/* Step 3: Logistics */}
      {step === "logistics" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t("qe_removal_logistics", lang)}</div>
          <div><label style={lbl}>{t("qe_label_crane_required", lang)}</label>
            <select style={sel} value={survey.crane_required} onChange={e => updateSurvey("crane_required", e.target.value)}>
              <option value="">{t("option_select_ellipsis", lang)}</option>
              <option value="Yes — definitely needed">{t("qe_val_crane_yes", lang)}</option>
              <option value="No — can be hand-carried or used lift">{t("qe_val_crane_no_lift", lang)}</option>
              <option value="Not sure — need to check unit weight">{t("qe_val_crane_not_sure", lang)}</option>
            </select>
          </div>
          {survey.crane_required === "Yes — definitely needed" && (
            <>
              <div><label style={lbl}>{t("qe_label_staging_location", lang)}</label>
                <select style={sel} value={survey.staging_location} onChange={e => updateSurvey("staging_location", e.target.value)}>
                  <option value="">{t("option_select_ellipsis", lang)}</option>
                  <option value="Parking lot">{t("qe_val_staging_parking_lot", lang)}</option>
                  <option value="Street / lane closure needed">{t("qe_val_staging_street", lang)}</option>
                  <option value="Alley">{t("qe_val_staging_alley", lang)}</option>
                  <option value="Private property adjacent">{t("qe_val_staging_private", lang)}</option>
                </select>
              </div>
              <div><label style={lbl}>{t("qe_label_overhead_lines", lang)}</label>
                <select style={sel} value={survey.overhead_lines} onChange={e => updateSurvey("overhead_lines", e.target.value)}>
                  <option value="">{t("option_select_ellipsis", lang)}</option>
                  <option value="No lines present">{t("qe_val_overhead_no_lines", lang)}</option>
                  <option value="Yes — lines present, utility hold needed">{t("qe_val_overhead_hold_needed", lang)}</option>
                  <option value="Yes — lines present, safe clearance available">{t("qe_val_overhead_clearance", lang)}</option>
                </select>
              </div>
            </>
          )}
          <div><label style={lbl}>{t("qe_label_additional_notes", lang)}</label>
            <textarea
              value={survey.notes}
              onChange={e => updateSurvey("notes", e.target.value)}
              placeholder={t("qe_additional_notes_placeholder", lang)}
              rows={3}
              style={{ ...inp, resize: "vertical" as const }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("site_access")} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>{t("tour_back", lang)}</button>
            <button onClick={() => setStep("photos")} style={{ flex: 2, padding: "10px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{t("btn_next_photos", lang)}</button>
          </div>
        </div>
      )}

      {/* Step 4: Photos + Video */}
      {step === "photos" && (
        <PhotoVideoStep
          survey={survey}
          updateSurvey={updateSurvey}
          onBack={() => setStep("logistics")}
          onNext={() => setStep("generate")}
        />
      )}

      {/* Step 5: Generate */}
      {step === "generate" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t("qe_ready_to_generate", lang)}</div>

          {/* Summary */}
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 10 }}>{t("qe_quote_summary", lang)}</div>
            {[
              [t("qe_summary_equipment", lang), translateSurveyValue(survey.equipment_type, lang)],
              [t("qe_summary_customer", lang), survey.customer_name],
              [t("qe_summary_address", lang), survey.site_address],
              [t("qe_summary_unit", lang), survey.unit_label],
              [t("qe_summary_urgency", lang), translateSurveyValue(survey.urgency, lang)],
              [t("qe_summary_crane", lang), translateSurveyValue(survey.crane_required, lang)],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: "#64748b", width: 80, flexShrink: 0 }}>{k}:</span>
                <span style={{ color: "#1e293b", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 14px", background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
            <strong>{t("qe_ai_will_generate_bold", lang)}</strong> {t("qe_ai_will_generate_body", lang)}
          </div>

          {generating && (
            <div style={{ padding: 20, textAlign: "center" as const, background: "#f8fafc", borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d", marginBottom: 4 }}>{t("qe_generating_quote", lang)}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{t("qe_generating_quote_body", lang)}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("photos")} disabled={generating}
              style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>{t("tour_back", lang)}</button>
            <button onClick={generateQuote} disabled={generating}
              style={{ flex: 2, padding: "12px", background: generating ? "#e2e8f0" : "#f97316", color: generating ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {generating ? t("btn_generating", lang) : t("btn_generate_quote", lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quote result view ─────────────────────────────────────────
function QuoteResultView({ quote, survey, onBack }: { quote: any; survey?: any; onBack: () => void }) {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"obstacles" | "scope" | "equipment" | "tools" | "pricing">("obstacles");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [techNote, setTechNote] = useState(quote.tech_notes_suggested || "");

  async function handlePreviewPdf() {
    setGeneratingPdf(true);
    try {
      const res = await fetch("/api/quote-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: { ...quote, tech_notes_suggested: techNote }, survey, lang }),
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        // Trigger print dialog after content loads
        win.onload = () => setTimeout(() => win.print(), 500);
      }
    } catch (e: any) {
      alert(t("qe_pdf_generation_failed", lang).replace("{value}", e?.message || ""));
    } finally {
      setGeneratingPdf(false);
    }
  }

  const tabs = [
    { key: "obstacles", label: t("qe_tab_obstacles", lang) },
    { key: "scope", label: t("qe_tab_scope", lang) },
    { key: "equipment", label: t("qe_tab_equipment", lang) },
    { key: "tools", label: t("qe_tab_tools", lang) },
    { key: "pricing", label: t("qe_tab_pricing", lang) },
  ] as const;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        {t("btn_new_quote_arrow", lang)}
      </button>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" as const }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${activeTab === t.key ? "#0f1f3d" : "#e2e8f0"}`, background: activeTab === t.key ? "#0f1f3d" : "#fff", color: activeTab === t.key ? "#fff" : "#374151", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "obstacles" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {(quote.obstacles || []).map((o: any, i: number) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${o.severity === "blocker" ? "#fecaca" : o.severity === "warning" ? "#fde68a" : "#bae6fd"}`, borderLeft: `4px solid ${o.severity === "blocker" ? "#dc2626" : o.severity === "warning" ? "#ca8a04" : "#2563eb"}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: o.severity === "blocker" ? "#dc2626" : o.severity === "warning" ? "#92400e" : "#1d4ed8", marginBottom: 4 }}>
                {o.severity === "blocker" ? "🚫" : o.severity === "warning" ? "⚠️" : "ℹ️"} {o.title}
              </div>
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>{o.body}</div>
              <div style={{ fontSize: 12, color: "#16a34a" }}>→ {o.mitigation}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "scope" && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>{t("qe_removal", lang)}</div>
          {(quote.scope_removal || []).map((s: any) => (
            <div key={s.step} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "10px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0f1f3d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{s.title}</div><div style={{ fontSize: 12, color: "#64748b" }}>{s.description}</div></div>
            </div>
          ))}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8, marginTop: 14 }}>{t("qe_installation", lang)}</div>
          {(quote.scope_install || []).map((s: any) => (
            <div key={s.step} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "10px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{s.title}</div><div style={{ fontSize: 12, color: "#64748b" }}>{s.description}</div></div>
            </div>
          ))}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[[t("qe_summary_crew", lang), t("qe_techs_suffix", lang).replace("{count}", String(quote.crew_count || "?"))], [t("qe_summary_est_hours", lang), `${quote.estimated_hours_min}–${quote.estimated_hours_max}`], [t("qe_summary_crane_hours", lang), quote.crane_hours ? `${quote.crane_hours} hrs` : t("qe_none", lang)]].map(([l, v]) => (
              <div key={l} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px", textAlign: "center" as const }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d" }}>{v}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "equipment" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {(quote.equipment_options || []).map((eq: any) => (
            <div key={eq.rank} style={{ background: "#fff", border: `2px solid ${eq.rank === 1 ? "#f97316" : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px" }}>
              {eq.rank === 1 && <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", marginBottom: 6 }}>{t("qe_best_match", lang)}</div>}
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f1f3d" }}>{eq.manufacturer} {eq.model_number}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{eq.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
                {[`${eq.tonnage}T`, `SEER2: ${eq.seer2}`, eq.refrigerant_type, eq.in_stock ? t("qe_in_stock", lang) : t("qe_lead_days", lang).replace("{count}", String(eq.lead_time_days))].filter(Boolean).map(tag => (
                  <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: "#374151" }}>{tag}</span>
                ))}
                {eq.rebate_amount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#166534" }}>{t("qe_rebate_amount", lang).replace("{value}", String(eq.rebate_amount))}</span>}
              </div>
              {eq.compatibility_notes && <div style={{ fontSize: 12, color: "#64748b" }}>{eq.compatibility_notes}</div>}
              <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: "#0f1f3d" }}>${(eq.estimated_equipment_price || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "tools" && (
        <div>
          {(quote.tools_special || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>{t("qe_source_now", lang)}</div>
              {quote.tools_special.map((tool: any, i: number) => (
                <div key={i} style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{tool.name}</div>
                  {tool.notes && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{tool.notes}</div>}
                </div>
              ))}
            </div>
          )}
          {(quote.tools_standard || []).length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>{t("qe_standard_tools", lang)}</div>
              {quote.tools_standard.map((tool: any, i: number) => (
                <div key={i} style={{ padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 4, fontSize: 13, color: "#374151" }}>{tool.name}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "pricing" && (
        <div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            {(quote.line_items || []).map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
                <span style={{ color: "#374151" }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.item_type === "rebate" ? "#16a34a" : "#1e293b" }}>
                  {item.item_type === "rebate" ? "-" : ""}${(item.total || 0).toLocaleString()}
                </span>
              </div>
            ))}
            {quote.rebate_total > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#16a34a" }}>
                <span>{t("qe_rebates", lang)}</span><span style={{ fontWeight: 700 }}>-${quote.rebate_total.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px", background: "#0f1f3d" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{t("qe_total_estimate", lang)}</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#f97316" }}>${(quote.total_estimate || 0).toLocaleString()}</span>
            </div>
          </div>
          {quote.tech_notes_suggested && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>{t("qe_suggested_tech_note", lang)}</div>
              <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>{quote.tech_notes_suggested}</div>
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>{t("qe_tech_notes_editable", lang)}</div>
            <textarea
              value={techNote}
              onChange={e => setTechNote(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical" as const, background: "#fafafa" }}
              placeholder={t("qe_tech_notes_placeholder", lang)}
            />
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              onClick={handlePreviewPdf}
              disabled={generatingPdf}
              style={{ flex: 1, padding: "12px", background: generatingPdf ? "#e2e8f0" : "#0f1f3d", color: generatingPdf ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: generatingPdf ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {generatingPdf ? t("btn_generating", lang) : t("btn_preview_print_pdf", lang)}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
            {t("qe_pdf_footer_note", lang)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Photo + Video Step ────────────────────────────────────────
function PhotoVideoStep({ survey, updateSurvey, onBack, onNext }: {
  survey: Record<string, any>;
  updateSurvey: (key: string, val: any) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { lang } = useLang();
  const [videoAnalyzing, setVideoAnalyzing] = useState(false);
  const [videoFindings, setVideoFindings] = useState<any[]>([]);
  const [videoError, setVideoError] = useState("");
  const videoRef = useRef<HTMLInputElement>(null);

  async function handleVideoUpload(file: File) {
    if (!file) return;
    setVideoAnalyzing(true);
    setVideoError("");
    setVideoFindings([]);

    try {
      // Extract frames from video by converting to base64
      // We'll send the video file and let the API extract key frames
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const mimeType = file.type || "video/mp4";

      const res = await fetch("/api/video-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoBase64: base64,
          mimeType,
          lang,
          context: {
            equipment_type: survey.equipment_type,
            urgency: survey.urgency,
            location: survey.customer_name,
          },
        }),
      });

      const data = await res.json();
      if (data.ok && data.findings) {
        setVideoFindings(data.findings);
        updateSurvey("video_findings", data.findings);
        updateSurvey("video_analyzed", true);
      } else {
        setVideoError(data.error || t("qe_video_analysis_failed", lang));
      }
    } catch (e: any) {
      setVideoError(t("qe_analysis_failed_colon", lang).replace("{value}", e?.message || ""));
    } finally {
      setVideoAnalyzing(false);
    }
  }

  const severityConfig: Record<string, { bg: string; color: string; border: string; icon: string }> = {
    blocker: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", icon: "🚫" },
    warning: { bg: "#fffbeb", color: "#92400e", border: "#fde68a", icon: "⚠️" },
    info:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bae6fd", icon: "ℹ️" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t("qe_photos_video_title", lang)}</div>

      {/* Video walkthrough section */}
      <div style={{ background: "#0f1f3d", borderRadius: 12, padding: "16px", color: "#fff" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{t("qe_video_walkthrough_title", lang)}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 14 }}>
          {t("qe_video_walkthrough_body", lang)}
        </div>

        {!videoAnalyzing && videoFindings.length === 0 && (
          <label style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(255,255,255,0.08)", border: "2px dashed rgba(255,255,255,0.3)", borderRadius: 10, cursor: "pointer", gap: 8 }}>
            <span style={{ fontSize: 36 }}>🎬</span>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t("qe_tap_to_record_upload", lang)}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{t("qe_video_format_hint", lang)}</div>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
            />
          </label>
        )}

        {videoAnalyzing && (
          <div style={{ padding: "20px", textAlign: "center" as const, background: "rgba(255,255,255,0.08)", borderRadius: 10 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t("qe_ai_analyzing_walkthrough", lang)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
              {t("qe_ai_analyzing_body", lang)}
            </div>
          </div>
        )}

        {videoError && (
          <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.2)", borderRadius: 8, fontSize: 13, color: "#fca5a5" }}>
            {videoError}
            <button onClick={() => videoRef.current?.click()} style={{ marginLeft: 10, background: "none", border: "1px solid #fca5a5", color: "#fca5a5", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{t("btn_try_again", lang)}</button>
          </div>
        )}

        {videoFindings.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#f97316" }}>
              {t("qe_ai_found_items", lang).replace("{count}", String(videoFindings.length))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {videoFindings.map((f: any, i: number) => {
                const cfg = severityConfig[f.severity] || severityConfig.info;
                return (
                  <div key={i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color, marginBottom: 3 }}>
                      {cfg.icon} {f.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#374151", marginBottom: 3 }}>{f.description}</div>
                    {f.question && (
                      <div style={{ fontSize: 12, color: "#2563eb", fontStyle: "italic" as const }}>
                        💬 {f.question}
                      </div>
                    )}
                    {f.answer !== undefined && (
                      <input
                        style={{ marginTop: 6, width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontFamily: "inherit" }}
                        placeholder={t("qe_your_answer_placeholder", lang)}
                        value={f.answer || ""}
                        onChange={e => {
                          const updated = [...videoFindings];
                          updated[i] = { ...f, answer: e.target.value };
                          setVideoFindings(updated);
                          updateSurvey("video_findings", updated);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => { setVideoFindings([]); updateSurvey("video_analyzed", false); }}
              style={{ marginTop: 10, background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              {t("qe_reanalyze_different_video", lang)}
            </button>
          </div>
        )}
      </div>

      {/* Photo categories */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{t("qe_site_photos", lang)}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>
          {t("qe_site_photos_body", lang)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { cat: t("qe_photo_cat_front", lang), icon: "🏗️" },
            { cat: t("qe_photo_cat_rear", lang), icon: "🔧" },
            { cat: t("qe_photo_cat_nameplate", lang), icon: "🏷️" },
            { cat: t("qe_photo_cat_crane_staging", lang), icon: "🚛" },
            { cat: t("qe_photo_cat_overhead_lines", lang), icon: "⚡" },
            { cat: t("qe_photo_cat_disconnect", lang), icon: "🔌" },
            { cat: t("qe_photo_cat_ductwork", lang), icon: "💨" },
            { cat: t("qe_photo_cat_access_path", lang), icon: "🚪" },
          ].map(({ cat, icon }) => (
            <label key={cat} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "12px 8px", background: "#f8fafc", border: "1px dashed #e2e8f0", borderRadius: 10, cursor: "pointer", textAlign: "center" as const, fontSize: 11, color: "#374151", fontWeight: 600, gap: 5 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              {cat}
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} />
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>{t("tour_back", lang)}</button>
        <button onClick={onNext} style={{ flex: 2, padding: "10px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          {videoFindings.length > 0 ? t("qe_review_generate_flags", lang).replace("{count}", String(videoFindings.length)) : t("qe_review_generate", lang)}
        </button>
      </div>
    </div>
  );
}