"use client";

import React, { useState } from "react";

type Resource = {
  title: string;
  source: string;
  type: "video" | "article" | "forum" | "manual" | "course";
  url: string;
  tags: string[];
  description: string;
  free: boolean;
};

const RESOURCES: Resource[] = [
  // Video / YouTube — all verified YouTube channel URLs
  { title: "HVAC School — Bryan Orr", source: "YouTube + hvacrschool.com", type: "video", url: "https://www.youtube.com/@HVACRSchool", tags: ["general", "diagnosis", "refrigerant", "controls", "fundamentals"], description: "Bryan Orr's HVAC School — the gold standard for tech education. Covers refrigerant fundamentals, diagnosis, controls, heat pumps, and everything in between. Free podcast and articles at hvacrschool.com.", free: true },
  { title: "Refrigeration Mentor", source: "YouTube", type: "video", url: "https://www.youtube.com/@RefrigerationMentor", tags: ["refrigeration", "commercial", "walk-in", "ice machine", "refrigerant", "superheat", "subcooling"], description: "Deep dives into commercial refrigeration — walk-ins, ice machines, superheat/subcooling, and refrigerant recovery. Great for commercial refrigeration techs.", free: true },
  { title: "AC Service Tech", source: "YouTube", type: "video", url: "https://www.youtube.com/@AcServiceTech", tags: ["heat pump", "diagnosis", "refrigerant", "superheat", "subcooling", "residential"], description: "Heat pump and cooling system diagnosis. Excellent superheat and subcooling tutorials with real equipment.", free: true },
  { title: "The HVAC Nerd", source: "YouTube", type: "video", url: "https://www.youtube.com/@TheHVACNerd", tags: ["controls", "wiring", "diagnosis", "troubleshooting", "electrical"], description: "Wiring diagrams, control boards, and systematic troubleshooting explained clearly. Great for electrical diagnosis and controls work.", free: true },
  { title: "HVAC Know It All", source: "YouTube", type: "video", url: "https://www.youtube.com/@HVACKnowItAll", tags: ["general", "diagnosis", "commercial", "refrigerant", "residential"], description: "Field tech perspective — real jobs, real diagnosis, real fixes. Commercial and residential coverage.", free: true },
  { title: "Word of Advice TV", source: "YouTube", type: "video", url: "https://www.youtube.com/@WordofAdviceTV", tags: ["residential", "diagnosis", "maintenance", "troubleshooting"], description: "Clear diagnostic walkthroughs for residential systems. Good for explaining issues to homeowners.", free: true },
  { title: "Kalos Services HVAC", source: "YouTube", type: "video", url: "https://www.youtube.com/@KalosServices", tags: ["fundamentals", "refrigerant", "diagnosis", "electrical", "controls"], description: "Technical deep dives from Bryan Orr's company. Covers fundamentals, refrigerant cycles, and electrical diagnosis at a high level.", free: true },
  { title: "HVAC Shop Talk", source: "YouTube", type: "video", url: "https://www.youtube.com/@HVACShopTalk", tags: ["general", "business", "commercial", "troubleshooting"], description: "Field experience and business perspective. Real commercial calls, diagnostic thinking, and trade talk.", free: true },

  // Technical Forums
  { title: "HVAC-Talk Forums", source: "HVAC-Talk.com", type: "forum", url: "https://hvac-talk.com", tags: ["general", "diagnosis", "commercial", "troubleshooting", "refrigerant", "walk-in", "ice machine"], description: "The largest HVAC/R professional forum. Search any symptom or error code — someone has dealt with it. Active community of experienced techs.", free: true },
  { title: "Reddit r/HVAC", source: "Reddit", type: "forum", url: "https://www.reddit.com/r/hvac", tags: ["general", "diagnosis", "residential", "troubleshooting"], description: "Active community of techs and DIYers. Good for quick questions and real-world experiences from current techs.", free: true },
  { title: "Reddit r/refrigeration", source: "Reddit", type: "forum", url: "https://www.reddit.com/r/refrigeration", tags: ["refrigeration", "commercial", "walk-in", "ice machine", "reach-in"], description: "Commercial refrigeration focused community — walk-ins, ice machines, reach-ins, display cases.", free: true },

  // Technical Training / Courses
  { title: "RSES Technical Training", source: "RSES", type: "course", url: "https://www.rses.org/education", tags: ["certification", "general", "refrigerant", "electrical", "commercial"], description: "Refrigeration Service Engineers Society — formal training, certifications, and technical manuals. Industry-recognized credentials.", free: false },
  { title: "ESCO Institute — EPA 608", source: "ESCO Institute", type: "course", url: "https://www.escoinst.com/epa-608", tags: ["epa", "certification", "refrigerant", "regulations", "a2l"], description: "EPA 608 certification prep, practice exams, and regulatory updates. Also covers A2L transition requirements.", free: false },
  { title: "Goodman/Daikin Tech Training", source: "Goodman/Daikin", type: "course", url: "https://www.goodmanmfg.com/resources/training", tags: ["manufacturer", "residential", "heat pump", "mini-split"], description: "Free manufacturer training from Goodman/Daikin. Product-specific training for residential systems and mini-splits.", free: true },
  { title: "Carrier University", source: "Carrier", type: "course", url: "https://www.carrieruniversity.com", tags: ["carrier", "manufacturer", "commercial", "controls", "diagnosis"], description: "Carrier's official training portal. Product training, controls, and diagnostic courses for Carrier, Bryant, and Payne equipment.", free: false },

  // Technical References / Articles
  { title: "EPA Refrigerant Regulations", source: "EPA.gov", type: "article", url: "https://www.epa.gov/section608", tags: ["epa", "refrigerant", "regulations", "608", "a2l", "phasedown"], description: "Official EPA Section 608 regulations, A2L transition guidance, GWP phasedown timeline, and refrigerant handling requirements.", free: true },
  { title: "Emerson — Copeland Compressor Ref", source: "Emerson / Copeland", type: "article", url: "https://www.emerson.com/en-us/commercial-residential/copeland", tags: ["compressor", "refrigerant", "commercial", "diagnosis", "refrigeration"], description: "Copeland compressor selection guides, application bulletins, and diagnostic resources. Essential for commercial refrigeration work.", free: true },
  { title: "Sporlan Technical Reference", source: "Parker/Sporlan", type: "article", url: "https://www.sporlan.com/technical-literature", tags: ["txv", "expansion valve", "refrigerant", "commercial", "refrigeration"], description: "Sporlan TXV and refrigeration component technical bulletins. Covers expansion valve selection, superheat adjustment, and troubleshooting.", free: true },
  { title: "ACCA Manual J — Load Calc", source: "ACCA", type: "manual", url: "https://www.acca.org/technical/manualj", tags: ["load calculation", "sizing", "residential", "fundamentals"], description: "Industry standard for residential load calculations. Essential for equipment sizing and replacement recommendations.", free: false },
  { title: "ASHRAE — Technical Resources", source: "ASHRAE", type: "manual", url: "https://www.ashrae.org/technical-resources", tags: ["fundamentals", "psychrometrics", "load calculation", "refrigeration", "commercial"], description: "ASHRAE technical resources including Handbook previews, standards, and industry guidelines.", free: false },
  { title: "Heatcraft Refrigeration Engineering", source: "Heatcraft", type: "article", url: "https://www.heatcraftrpd.com/resources/engineering-data", tags: ["refrigeration", "commercial", "walk-in", "evaporator", "condenser"], description: "Heatcraft engineering data for commercial refrigeration — evaporator and condenser selection, application guides.", free: true },
];

const TYPE_ICONS: Record<Resource["type"], string> = {
  video: "▶️",
  article: "📄",
  forum: "💬",
  manual: "📚",
  course: "🎓",
};

const TYPE_COLORS: Record<Resource["type"], { bg: string; color: string }> = {
  video:   { bg: "#fee2e2", color: "#dc2626" },
  article: { bg: "#dbeafe", color: "#2563eb" },
  forum:   { bg: "#dcfce7", color: "#16a34a" },
  manual:  { bg: "#f3e8ff", color: "#7c3aed" },
  course:  { bg: "#fef9c3", color: "#ca8a04" },
};

const ALL_TAGS = [
  "All", "diagnosis", "refrigerant", "superheat", "subcooling",
  "commercial", "residential", "heat pump", "controls",
  "electrical", "wiring", "a2l", "epa", "certification",
  "walk-in", "ice machine", "compressor", "manufacturer",
];

type LearningHubProps = {
  currentSymptom?: string;
  currentCause?: string;
  equipmentType?: string;
};

export function LearningHub({ currentSymptom, currentCause, equipmentType }: LearningHubProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [activeType, setActiveType] = useState<Resource["type"] | "all">("all");

  // Suggest resources based on current job context
  function getSuggestedTags(): string[] {
    const tags: string[] = [];
    const ctx = `${currentSymptom || ""} ${currentCause || ""} ${equipmentType || ""}`.toLowerCase();

    if (ctx.includes("heat pump")) tags.push("heat pump");
    if (ctx.includes("refrigerant") || ctx.includes("charge") || ctx.includes("leak")) tags.push("refrigerant");
    if (ctx.includes("walk-in") || ctx.includes("cooler") || ctx.includes("freezer")) tags.push("walk-in");
    if (ctx.includes("ice")) tags.push("ice machine");
    if (ctx.includes("board") || ctx.includes("control") || ctx.includes("wiring")) tags.push("controls");
    if (ctx.includes("compressor")) tags.push("compressor");
    if (ctx.includes("r-32") || ctx.includes("r-454") || ctx.includes("a2l")) tags.push("a2l");

    return tags;
  }

  const suggestedTags = getSuggestedTags();

  const filtered = RESOURCES.filter(r => {
    const matchesTag = activeTag === "All" || r.tags.includes(activeTag);
    const matchesType = activeType === "all" || r.type === activeType;
    const matchesSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(t => t.includes(search.toLowerCase()));
    return matchesTag && matchesType && matchesSearch;
  });

  // Sort — free first, then suggested tag matches first
  const sorted = [...filtered].sort((a, b) => {
    const aMatch = suggestedTags.some(t => a.tags.includes(t)) ? 0 : 1;
    const bMatch = suggestedTags.some(t => b.tags.includes(t)) ? 0 : 1;
    return aMatch - bMatch;
  });

  function replayTour() {
    try { localStorage.removeItem("mhvacr_tour_v1_complete"); } catch {}
    window.location.reload();
  }

  return (
    <div>
      <div style={{ marginBottom: 14, padding: "12px 14px", background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>📱 App Tour</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Replay the guided intro to see all features</div>
        </div>
        <button onClick={replayTour}
          style={{ padding: "7px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
          Replay Tour
        </button>
      </div>
      {/* Job context suggestion */}
      {suggestedTags.length > 0 && (
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>🎯 Based on your current job:</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {suggestedTags.map(t => (
              <button key={t} onClick={() => setActiveTag(t)} style={{ padding: "3px 10px", borderRadius: 20, border: "none", background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search resources..."
        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", marginBottom: 10, background: "#fafafa" }}
      />

      {/* Type filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {(["all", "video", "forum", "article", "course", "manual"] as const).map(t => (
          <button key={t} onClick={() => setActiveType(t)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${activeType === t ? "#0f1f3d" : "#e2e8f0"}`, background: activeType === t ? "#0f1f3d" : "#fff", color: activeType === t ? "#fff" : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            {t !== "all" && <span>{TYPE_ICONS[t]}</span>}
            {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 14 }}>
        {ALL_TAGS.map(t => (
          <button key={t} onClick={() => setActiveTag(t)} style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${activeTag === t ? "#2563eb" : "#e2e8f0"}`, background: activeTag === t ? "#dbeafe" : "#fff", color: activeTag === t ? "#1d4ed8" : "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
            No resources found. Try a different search or tag.
          </div>
        )}
        {sorted.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12, transition: "all 0.15s", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLDivElement).style.background = "#f0f9ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: TYPE_COLORS[r.type].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {TYPE_ICONS[r.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{r.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: TYPE_COLORS[r.type].bg, color: TYPE_COLORS[r.type].color }}>
                    {r.type.toUpperCase()}
                  </span>
                  {r.free ? (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#16a34a" }}>FREE</span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: "#64748b" }}>PAID</span>
                  )}
                  {suggestedTags.some(t => r.tags.includes(t)) && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#eff6ff", color: "#2563eb" }}>🎯 Relevant to your job</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{r.source}</div>
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{r.description}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginTop: 6 }}>
                  {r.tags.slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#f1f5f9", color: "#64748b" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 16, color: "#94a3b8", flexShrink: 0 }}>→</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
        All external links open in a new tab. My HVAC/R Tool is not affiliated with these resources — they're curated by techs, for techs.
      </div>
    </div>
  );
}