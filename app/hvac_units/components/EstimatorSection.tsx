"use client";

import React, { useState, useEffect } from "react";
import { getUserProfile, getEstimatorAccess, type EstimatorAccess } from "../../lib/supabase/subscription";
import { EstimatorLockedOverlay, EstimatorUpgradePrompt } from "./EstimatorUpgradePrompt";

// ── Mock preview content shown blurred behind the lock ────────
function EstimatorPreview() {
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {["Quotes This Month", "Avg. Quote Value", "Win Rate"].map((label, i) => (
          <div key={label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", textAlign: "center" as const }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f1f3d" }}>{["12", "$14,200", "68%"][i]}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d", marginBottom: 12 }}>Recent Quotes</div>
        {["Riverside Commons — RTU #3 — $18,400", "Lakewood Grocery — Walk-in Freezer — $12,750", "City Hall HVAC — Split System — $8,900"].map(q => (
          <div key={q} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#374151", display: "flex", justifyContent: "space-between" }}>
            <span>{q.split("—")[0]}</span>
            <span style={{ fontWeight: 700, color: "#16a34a" }}>{q.split("—")[2]}</span>
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
  const [access, setAccess] = useState<EstimatorAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile) setAccess(getEstimatorAccess(profile));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" as const, color: "#94a3b8", fontSize: 13 }}>Loading...</div>;
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
  const [view, setView] = useState<"dashboard" | "new_quote">("dashboard");

  return (
    <div>
      {/* Access badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#dcfce7", color: "#166534" }}>
            {access.tier === "monthly_unlimited" ? "✓ Unlimited" : access.tier === "single" ? `✓ ${access.credits} credit${access.credits !== 1 ? "s" : ""}` : `✓ ${access.quotesUsedThisMonth}/${access.monthlyLimit} used`}
          </span>
        </div>
        <button
          onClick={() => setView("new_quote")}
          style={{ padding: "9px 18px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          + New Quote
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
  return (
    <div>
      <div style={{ padding: "32px 0", textAlign: "center" as const, background: "#f8fafc", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No quotes yet</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
          Start a new quote from this job or from any saved unit.
        </div>
        <button onClick={onNew}
          style={{ padding: "10px 24px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Start First Quote
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
    { key: "job_setup", label: "Job Setup", icon: "1" },
    { key: "site_access", label: "Site Access", icon: "2" },
    { key: "logistics", label: "Logistics", icon: "3" },
    { key: "photos", label: "Photos", icon: "4" },
    { key: "generate", label: "Generate", icon: "5" },
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
        body: JSON.stringify({ survey, unitId }),
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
    return <QuoteResultView quote={quoteResult} onBack={() => setQuoteResult(null)} />;
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        ← Back
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
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>Job Setup</div>
          <div><label style={lbl}>Equipment Type</label>
            <select style={sel} value={survey.equipment_type} onChange={e => updateSurvey("equipment_type", e.target.value)}>
              <option value="">Select...</option>
              {["RTU", "Split System", "Walk-in Cooler", "Walk-in Freezer", "Ice Machine", "Furnace", "Mini-Split", "Chiller", "Other"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Urgency</label>
            <select style={sel} value={survey.urgency} onChange={e => updateSurvey("urgency", e.target.value)}>
              <option value="">Select...</option>
              <option>Routine — planning ahead</option>
              <option>Soon — within 30 days</option>
              <option>Emergency — unit down now</option>
            </select>
          </div>
          <div><label style={lbl}>Customer / Site Name</label>
            <input style={inp} value={survey.customer_name} onChange={e => updateSurvey("customer_name", e.target.value)} placeholder="Riverside Commons" />
          </div>
          <div><label style={lbl}>Site Address</label>
            <input style={inp} value={survey.site_address} onChange={e => updateSurvey("site_address", e.target.value)} placeholder="123 Main St, Indianapolis IN" />
          </div>
          <div><label style={lbl}>Unit Label</label>
            <input style={inp} value={survey.unit_label} onChange={e => updateSurvey("unit_label", e.target.value)} placeholder="RTU #3 or Carrier 48XB009" />
          </div>
          <button onClick={() => setStep("site_access")} disabled={!survey.equipment_type || !survey.customer_name}
            style={{ padding: "12px", background: survey.equipment_type && survey.customer_name ? "#0f1f3d" : "#e2e8f0", color: survey.equipment_type && survey.customer_name ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
            Next: Site Access →
          </button>
        </div>
      )}

      {/* Step 2: Site Access */}
      {step === "site_access" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>Site Access</div>

          <div><label style={lbl}>Roof/Site Access Method</label>
            <select style={sel} value={survey.roof_access} onChange={e => updateSurvey("roof_access", e.target.value)}>
              <option value="">Select...</option>
              <option>Interior stair to roof hatch</option>
              <option>Exterior ladder</option>
              <option>Mechanical lift / scissor lift needed</option>
              <option>Ground level — no roof access needed</option>
              <option>Basement / crawlspace</option>
              <option>Elevator available</option>
            </select>
          </div>

          <div><label style={lbl}>Walk Distance to Unit (approximate feet)</label>
            <input style={inp} type="number" value={survey.walk_distance} onChange={e => updateSurvey("walk_distance", e.target.value)} placeholder="e.g. 150" />
            {parseInt(survey.walk_distance) > 100 && (
              <div style={{ marginTop: 6, padding: "8px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, fontSize: 12, color: "#92400e" }}>
                ⚠️ Over 100ft — plan for equipment transport. Consider rooftop cart or additional labor.
              </div>
            )}
          </div>

          {/* Scheduling section */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f1f3d" }}>📅 Scheduling & Restrictions</div>

            <div><label style={lbl}>Does this job need to be scheduled with anyone?</label>
              <select style={sel} value={survey.schedule_required || ""} onChange={e => updateSurvey("schedule_required", e.target.value)}>
                <option value="">Select...</option>
                <option>No — we can show up anytime</option>
                <option>Yes — must call facility manager ahead</option>
                <option>Yes — must coordinate with property management</option>
                <option>Yes — tenant notification required</option>
                <option>Yes — multiple parties must be coordinated</option>
              </select>
            </div>

            {survey.schedule_required && survey.schedule_required !== "No — we can show up anytime" && (
              <div><label style={lbl}>Scheduling Contact Name & Phone</label>
                <input style={inp} value={survey.schedule_contact || ""} onChange={e => updateSurvey("schedule_contact", e.target.value)} placeholder="e.g. Mike Johnson — (317) 555-0100" />
              </div>
            )}

            <div><label style={lbl}>Any work hour restrictions?</label>
              <select style={sel} value={survey.work_hours || ""} onChange={e => updateSurvey("work_hours", e.target.value)}>
                <option value="">Select...</option>
                <option>No restrictions — work anytime</option>
                <option>Weekdays only, normal business hours</option>
                <option>After hours only — weekday evenings</option>
                <option>Weekends only</option>
                <option>Specific window — see notes</option>
              </select>
            </div>

            <div><label style={lbl}>Crane time restrictions? (in/out by a certain time)</label>
              <select style={sel} value={survey.crane_time_restriction || ""} onChange={e => updateSurvey("crane_time_restriction", e.target.value)}>
                <option value="">Select...</option>
                <option>No restrictions</option>
                <option>Yes — must be out before business hours</option>
                <option>Yes — street closure window limited</option>
                <option>Yes — utility hold window is limited</option>
                <option>Yes — see notes</option>
              </select>
            </div>

            <div><label style={lbl}>Any other work restrictions or special conditions?</label>
              <textarea value={survey.work_restrictions || ""} onChange={e => updateSurvey("work_restrictions", e.target.value)}
                placeholder="e.g. No drilling on Sundays, hospital quiet hours 10pm-6am, food prep area nearby..."
                rows={2} style={{ ...inp, resize: "vertical" as const }} />
            </div>
          </div>

          <div><label style={lbl}>Security / Escort Required?</label>
            <select style={sel} value={survey.security_escort} onChange={e => updateSurvey("security_escort", e.target.value)}>
              <option value="">Select...</option>
              <option>No — free access</option>
              <option>Yes — call ahead required</option>
              <option>Yes — escort required at all times</option>
              <option>Yes — badge / key fob needed</option>
            </select>
          </div>

          <div><label style={lbl}>Access Notes</label>
            <input style={inp} value={survey.access_notes || ""} onChange={e => updateSurvey("access_notes", e.target.value)} placeholder="Gate codes, parking instructions, check-in procedures..." />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("job_setup")} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>← Back</button>
            <button onClick={() => setStep("logistics")} style={{ flex: 2, padding: "10px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Next: Logistics →</button>
          </div>
        </div>
      )}

      {/* Step 3: Logistics */}
      {step === "logistics" && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>Removal Logistics</div>
          <div><label style={lbl}>Crane Required?</label>
            <select style={sel} value={survey.crane_required} onChange={e => updateSurvey("crane_required", e.target.value)}>
              <option value="">Select...</option>
              <option>Yes — definitely needed</option>
              <option>No — can be hand-carried or used lift</option>
              <option>Not sure — need to check unit weight</option>
            </select>
          </div>
          {survey.crane_required === "Yes — definitely needed" && (
            <>
              <div><label style={lbl}>Crane Staging Location</label>
                <select style={sel} value={survey.staging_location} onChange={e => updateSurvey("staging_location", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Parking lot</option>
                  <option>Street / lane closure needed</option>
                  <option>Alley</option>
                  <option>Private property adjacent</option>
                </select>
              </div>
              <div><label style={lbl}>Overhead Power Lines Near Staging?</label>
                <select style={sel} value={survey.overhead_lines} onChange={e => updateSurvey("overhead_lines", e.target.value)}>
                  <option value="">Select...</option>
                  <option>No lines present</option>
                  <option>Yes — lines present, utility hold needed</option>
                  <option>Yes — lines present, safe clearance available</option>
                </select>
              </div>
            </>
          )}
          <div><label style={lbl}>Additional Notes</label>
            <textarea
              value={survey.notes}
              onChange={e => updateSurvey("notes", e.target.value)}
              placeholder="Any other obstacles, special conditions, or important details..."
              rows={3}
              style={{ ...inp, resize: "vertical" as const }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("site_access")} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>← Back</button>
            <button onClick={() => setStep("photos")} style={{ flex: 2, padding: "10px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Next: Photos →</button>
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
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>Ready to Generate</div>

          {/* Summary */}
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 10 }}>Quote Summary</div>
            {[
              ["Equipment", survey.equipment_type],
              ["Customer", survey.customer_name],
              ["Address", survey.site_address],
              ["Unit", survey.unit_label],
              ["Urgency", survey.urgency],
              ["Crane", survey.crane_required],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: "#64748b", width: 80, flexShrink: 0 }}>{k}:</span>
                <span style={{ color: "#1e293b", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 14px", background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
            <strong>What the AI will generate:</strong> Obstacles, scope of work, equipment options with pricing, crane requirements, special tools list, and a professional PDF ready to send to the customer.
          </div>

          {generating && (
            <div style={{ padding: 20, textAlign: "center" as const, background: "#f8fafc", borderRadius: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d", marginBottom: 4 }}>Generating your quote...</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Analyzing survey data, estimating obstacles, selecting equipment options. This takes 15-30 seconds.</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStep("photos")} disabled={generating}
              style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>← Back</button>
            <button onClick={generateQuote} disabled={generating}
              style={{ flex: 2, padding: "12px", background: generating ? "#e2e8f0" : "#f97316", color: generating ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {generating ? "Generating..." : "🤖 Generate Quote"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quote result view ─────────────────────────────────────────
function QuoteResultView({ quote, onBack }: { quote: any; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"obstacles" | "scope" | "equipment" | "tools" | "pricing">("obstacles");

  const tabs = [
    { key: "obstacles", label: "⚠️ Obstacles" },
    { key: "scope", label: "📋 Scope" },
    { key: "equipment", label: "🔧 Equipment" },
    { key: "tools", label: "🛠️ Tools" },
    { key: "pricing", label: "💰 Pricing" },
  ] as const;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        ← New Quote
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
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Removal</div>
          {(quote.scope_removal || []).map((s: any) => (
            <div key={s.step} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "10px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0f1f3d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{s.title}</div><div style={{ fontSize: 12, color: "#64748b" }}>{s.description}</div></div>
            </div>
          ))}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8, marginTop: 14 }}>Installation</div>
          {(quote.scope_install || []).map((s: any) => (
            <div key={s.step} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "10px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{s.title}</div><div style={{ fontSize: 12, color: "#64748b" }}>{s.description}</div></div>
            </div>
          ))}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[["Crew", `${quote.crew_count || "?"} techs`], ["Est. Hours", `${quote.estimated_hours_min}–${quote.estimated_hours_max}`], ["Crane Hours", quote.crane_hours ? `${quote.crane_hours} hrs` : "None"]].map(([l, v]) => (
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
              {eq.rank === 1 && <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", marginBottom: 6 }}>⭐ BEST MATCH</div>}
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f1f3d" }}>{eq.manufacturer} {eq.model_number}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{eq.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 8 }}>
                {[`${eq.tonnage}T`, `SEER2: ${eq.seer2}`, eq.refrigerant_type, eq.in_stock ? "✓ In Stock" : `${eq.lead_time_days}d lead`].filter(Boolean).map(tag => (
                  <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: "#374151" }}>{tag}</span>
                ))}
                {eq.rebate_amount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#166534" }}>💰 ${eq.rebate_amount} rebate</span>}
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
              <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>🚨 Source Now</div>
              {quote.tools_special.map((t: any, i: number) => (
                <div key={i} style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{t.name}</div>
                  {t.notes && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.notes}</div>}
                </div>
              ))}
            </div>
          )}
          {(quote.tools_standard || []).length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Standard Tools</div>
              {quote.tools_standard.map((t: any, i: number) => (
                <div key={i} style={{ padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 4, fontSize: 13, color: "#374151" }}>{t.name}</div>
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
                <span>Rebates</span><span style={{ fontWeight: 700 }}>-${quote.rebate_total.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px", background: "#0f1f3d" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Total Estimate</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#f97316" }}>${(quote.total_estimate || 0).toLocaleString()}</span>
            </div>
          </div>
          {quote.tech_notes_suggested && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>SUGGESTED TECH NOTE</div>
              <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>{quote.tech_notes_suggested}</div>
            </div>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              📄 Preview PDF
            </button>
            <button style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Send to Customer →
            </button>
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
        setVideoError(data.error || "Video analysis failed. Try a shorter clip or different format.");
      }
    } catch (e: any) {
      setVideoError("Analysis failed: " + e?.message);
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
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>Photos & Video</div>

      {/* Video walkthrough section */}
      <div style={{ background: "#0f1f3d", borderRadius: 12, padding: "16px", color: "#fff" }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🎥 AI Video Walkthrough Analysis</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 14 }}>
          Shoot a 30-60 second walkthrough showing: how the unit comes out, the path it travels, any tight spots, doorways, stairwells, hallways, gas lines, conduit, obstacles. AI will flag everything it sees that could affect the job.
        </div>

        {!videoAnalyzing && videoFindings.length === 0 && (
          <label style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(255,255,255,0.08)", border: "2px dashed rgba(255,255,255,0.3)", borderRadius: 10, cursor: "pointer", gap: 8 }}>
            <span style={{ fontSize: 36 }}>🎬</span>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Tap to record or upload walkthrough video</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>MP4, MOV, or HEVC — up to 50MB</div>
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
            <div style={{ fontSize: 14, fontWeight: 700 }}>AI is analyzing your walkthrough...</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
              Identifying obstacles, clearances, hazards, and anything that could affect the job. 20-30 seconds.
            </div>
          </div>
        )}

        {videoError && (
          <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.2)", borderRadius: 8, fontSize: 13, color: "#fca5a5" }}>
            {videoError}
            <button onClick={() => videoRef.current?.click()} style={{ marginLeft: 10, background: "none", border: "1px solid #fca5a5", color: "#fca5a5", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Try again</button>
          </div>
        )}

        {videoFindings.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "#f97316" }}>
              🔍 AI found {videoFindings.length} item{videoFindings.length !== 1 ? "s" : ""} to flag
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
                        placeholder="Your answer..."
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
              Re-analyze different video
            </button>
          </div>
        )}
      </div>

      {/* Photo categories */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>📷 Site Photos</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>
          Capture key photos for the quote. Each one helps AI provide more accurate obstacle detection and equipment recommendations.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { cat: "Full unit — front", icon: "🏗️" },
            { cat: "Full unit — rear", icon: "🔧" },
            { cat: "Nameplate / data tag", icon: "🏷️" },
            { cat: "Crane staging area", icon: "🚛" },
            { cat: "Overhead lines", icon: "⚡" },
            { cat: "Electrical disconnect", icon: "🔌" },
            { cat: "Ductwork / curb", icon: "💨" },
            { cat: "Access path / hallway", icon: "🚪" },
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
        <button onClick={onBack} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>← Back</button>
        <button onClick={onNext} style={{ flex: 2, padding: "10px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          {videoFindings.length > 0 ? `Review & Generate (${videoFindings.length} AI flags) →` : "Review & Generate →"}
        </button>
      </div>
    </div>
  );
}