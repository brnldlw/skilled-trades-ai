"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type RepairExecutionPayload = {
  selectedPart: string;
  searchQuery: string;
  verifyFirst: string[];
  replaceSteps: string[];
  safety: string[];
  mistakes: string[];
  watchAfterRepair: string[];
  youtubeSearchUrl: string;
  webSearchUrl: string;
};

export function RepairExecutionAssist({ payload }: { payload: RepairExecutionPayload }) {
  const { lang } = useLang();
  if (!payload.selectedPart) {
    return (
      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
              {t("label_current_part_focus", lang)}
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              {t("label_none_selected_yet", lang)}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
              {t("label_what_unlocks_this", lang)}
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              {t("label_select_part_in_checklist", lang)}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 12,
            background: "#fffaf0",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>
            {t("repair_help_ready", lang)}
          </div>

          <SmallHint>{t("this_section_will_show", lang)}</SmallHint>

          <ul style={{ marginTop: 0, paddingLeft: 18 }}>
            <li><SmallHint>{t("label_verify_first", lang)}</SmallHint></li>
            <li><SmallHint>{t("label_replace_steps", lang)}</SmallHint></li>
            <li><SmallHint>{t("label_safety_shutdown", lang)}</SmallHint></li>
            <li><SmallHint>{t("label_common_mistakes", lang)}</SmallHint></li>
            <li><SmallHint>{t("label_watch_after_repair", lang)}</SmallHint></li>
            <li><SmallHint>{t("label_youtube_web_links", lang)}</SmallHint></li>
          </ul>

          <SmallHint>
            {t("pick_likely_part_prefix", lang)} <b>{t("part_verification_title", lang)}</b> {t("pick_likely_part_suffix", lang)}
          </SmallHint>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_selected_part", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.selectedPart}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_search_context", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {payload.searchQuery}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {payload.youtubeSearchUrl ? (
          <a
            href={payload.youtubeSearchUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {t("btn_open_youtube_search", lang)}
          </a>
        ) : null}

        {payload.webSearchUrl ? (
          <a
            href={payload.webSearchUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {t("btn_open_web_search", lang)}
          </a>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_verify_first", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.verifyFirst.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_replace_steps", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.replaceSteps.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_safety_shutdown", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.safety.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_common_mistakes", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.mistakes.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
          <div style={{ fontWeight: 900 }}>{t("label_watch_after_repair", lang)}</div>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {payload.watchAfterRepair.map((item, idx) => (
              <li key={idx}>
                <SmallHint>{item}</SmallHint>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
