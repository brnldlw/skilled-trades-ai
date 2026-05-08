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
  // Video / YouTube
  { title: "HVAC School Podcast + Videos", source: "HVAC School", type: "video", url: "https://hvacrschool.com", tags: ["general", "diagnosis", "refrigerant", "controls"], description: "Bryan Orr's HVAC School — the gold standard for tech education. Free videos, podcasts, and articles covering everything from refrigerant fundamentals to advanced diagnosis.", free: true },
  { title: "Refrigeration Mentor", source: "YouTube", type: "video", url: "https://www.youtube.com/@RefrigerationMentor", tags: ["refrigeration", "commercial", "walk-in", "ice machine", "refrigerant"], description: "Deep dives into commercial refrigeration — walk-ins, rack systems, superheat and subcooling, and refrigerant recovery.", free: true },
  { title: "The HVAC Nerd", source: "YouTube", type: "video", url: "https://www.youtube.com/@TheHVACNerd", tags: ["controls", "wiring", "diagnosis", "troubleshooting"], description: "Wiring diagrams, control boards, and systematic troubleshooting explained clearly. Great for electrical diagnosis.", free: true },
  { title: "AC Service Tech", source: "YouTube", type: "video", url: "https://www.youtube.com/@AcServiceTech", tags: ["heat pump", "diagnosis", "refrigerant", "superheat", "subcooling"], description: "Heat pump and cooling system diagnosis videos. Excellent superheat and subcooling tutorials.", free: true },
  { title: "Word of Advice TV", source: "YouTube", type: "video", url: "https://www.youtube.com/@WordofAdviceTV", tags: ["diy", "diagnosis", "residential", "maintenance"], description: "Clear diagnostic walkthroughs for residential systems. Good for explaining issues to homeowners.", free: true },

  // Technical Forums
  { title: "HVAC-Talk Forums", source: "HVAC-Talk.com", type: "forum", url: "https://hvac-talk.com/vbb", tags: ["general", "diagnosis", "commercial", "troubleshooting", "refrigerant"], description: "The largest HVAC/R professional forum online. Search any symptom or error code — chances are someone has dealt with it. Active community of experienced techs.", free: true },
  { title: "Reddit r/HVAC", source: "Reddit", type: "forum", url: "https://reddit.com/r/hvac", tags: ["general", "diagnosis", "residential", "troubleshooting"], description: "Active community of techs and DIYers. Good for quick questions and real-world experiences.", free: true },
  { title: "ESCO Institute Forums", source: "ESCO Institute", type: "forum", url: "https://www.escoinst.com", tags: ["epa", "certification", "refrigerant", "regulations"], description: "EPA 608 certification resources, refrigerant regulations, and industry compliance.", free: true },

  // Technical Training
  { title: "RSES Technical Training", source: "RSES", type: "course", url: "https://www.rses.org/education", tags: ["certification", "general", "refrigerant", "electrical", "commercial"], description: "Refrigeration Service Engineers Society — formal training, certifications, and technical manuals for serious techs.", free: false },
  { title: "Ferris State HVACR Program", source: "Ferris State", type: "course", url: "https://www.ferris.edu/HTMLS/colleges/teknology/hvacr", tags: ["certification", "general", "fundamentals"], description: "One of the top HVAC/R programs in the country offers free online resources and curriculum guides.", free: true },
  { title: "Johnstone Supply Tech Training", source: "Johnstone Supply", type: "course", url: "https://www.johnstonesupply.com/training", tags: ["general", "manufacturer", "equipment"], description: "Free manufacturer training courses from one of the largest HVAC/R distributors.", free: true },

  // Manuals / References
  { title: "ASHRAE Fundamentals Handbook", source: "ASHRAE", type: "manual", url: "https://www.ashrae.org/technical-resources/ashrae-handbook", tags: ["fundamentals", "psychrometrics", "load calculation", "refrigeration"], description: "The definitive technical reference for HVAC/R engineers and advanced techs. Psychrometrics, refrigeration cycles, and system design.", free: false },
  { title: "Refrigerant Safety Sheets (A2L)", source: "EPA", type: "article", url: "https://www.epa.gov/snap/substitutes-household-refrigerators-and-freezers", tags: ["refrigerant", "a2l", "safety", "epa", "r32", "r454b"], description: "EPA guidance on A2L refrigerant handling, safety requirements, and certified equipment requirements for R-32, R-454B, and other mildly flammable refrigerants.", free: true },
  { title: "ACCA Manual J Load Calculation", source: "ACCA", type: "manual", url: "https://www.acca.org/technical/manualj", tags: ["load calculation", "sizing", "residential"], description: "Industry standard for residential load calculations. Essential for equipment sizing and replacement.", free: false },

  // Articles / References
  { title: "Emerson Climate Tech Ref", source: "Emerson", type: "article", url: "https://climate.emerson.com/en-us/tools-resources", tags: ["compressor", "refrigerant", "commercial", "diagnosis"], description: "Emerson's technical reference library — compressor selection guides, application bulletins, and diagnostic tools.", free: true },
  { title: "Carrier Product Technotes", source: "Carrier", type: "article", url: "https://www.carrier.com/commercial/en/us/software-and-tools/product-and-technical-support/technical-support/", tags: ["carrier", "manufacturer", "diagnosis", "error codes"], description: "Carrier manufacturer technical bulletins, service notes, and diagnostic guides.", free: true },
  { title: "Trane Technical Reference", source: "Trane", type: "article", url: "https://www.trane.com/commercial/north-america/us/en/products-systems/systems/learning-center.html", tags: ["trane", "manufacturer", "controls", "diagnostics"], description: "Trane technical reference library including Tracer controls documentation and diagnostic guides.", free: true },
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

  return (
    <div>
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