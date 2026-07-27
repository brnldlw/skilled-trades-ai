"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type Draft = {
  summary: string;
  checks: string;
  closeout: string;
};

const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontWeight: 900,
  border: "1px solid #cfcfcf",
  borderRadius: 10,
  background: "#ffffff",
  color: "#111",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

export function PhotoAssistPanel({
  photoCount,
  targetComponent,
  latestPhotoUrl,
  photoType,
  onPhotoTypeChange,
  onGenerate,
  onPushToTechNotes,
  message,
  draft,
  onDraftFieldChange,
  onCopy,
}: {
  photoCount: number;
  targetComponent: string;
  latestPhotoUrl: string;
  photoType: string;
  onPhotoTypeChange: (value: string) => void;
  onGenerate: () => void;
  onPushToTechNotes: () => void;
  message: string;
  draft: Draft;
  onDraftFieldChange: (field: keyof Draft, value: string) => void;
  onCopy: (field: keyof Draft) => void;
}) {
  const { lang } = useLang();
  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 12,
        background: "#fafafa",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>
        {t("photo_assist_title", lang)}
      </div>

      <SmallHint>
        {t("photo_assist_hint", lang)}
      </SmallHint>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_attached_photos", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {photoCount}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_target_component", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {targetComponent || t("fallback_primary_component", lang)}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
            {t("label_latest_photo", lang)}
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {latestPhotoUrl ? t("label_ready", lang) : t("label_no_photo_yet", lang)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label style={{ fontWeight: 900 }}>{t("label_photo_type", lang)}</label>
        <select
          value={photoType}
          onChange={(e) => onPhotoTypeChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="general">{t("photo_type_general", lang)}</option>
          <option value="board_wiring">{t("photo_type_board_wiring", lang)}</option>
          <option value="ice_pattern">{t("photo_type_ice_pattern", lang)}</option>
          <option value="coil_condition">{t("photo_type_coil_condition", lang)}</option>
          <option value="data_plate">{t("photo_type_data_plate", lang)}</option>
          <option value="failed_part">{t("photo_type_failed_part", lang)}</option>
        </select>
      </div>

      {latestPhotoUrl ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900 }}>{t("label_latest_photo_preview", lang)}</div>
          <img
            src={latestPhotoUrl}
            alt="Latest service event photo"
            style={{
              maxWidth: "100%",
              maxHeight: 260,
              objectFit: "contain",
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "#fff",
              padding: 8,
            }}
          />
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onGenerate} style={btnStyle}>
          {t("btn_generate_photo_assist", lang)}
        </button>

        <button type="button" onClick={onPushToTechNotes} style={btnStyle}>
          {t("btn_add_photo_note", lang)}
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>{t("label_photo_assist_colon", lang)}</b> {message}
        </SmallHint>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>{t("label_what_photo_should_verify", lang)}</div>
          <textarea
            value={draft.summary}
            onChange={(e) => onDraftFieldChange("summary", e.target.value)}
            rows={7}
            style={{ width: "100%", padding: 8, minHeight: 140, resize: "vertical" }}
          />
          <button type="button" onClick={() => onCopy("summary")} style={btnStyle}>
            {t("btn_copy_summary", lang)}
          </button>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>{t("label_what_to_check_next_photo", lang)}</div>
          <textarea
            value={draft.checks}
            onChange={(e) => onDraftFieldChange("checks", e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
          />
          <button type="button" onClick={() => onCopy("checks")} style={btnStyle}>
            {t("btn_copy_checks", lang)}
          </button>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 900 }}>{t("label_suggested_photo_closeout", lang)}</div>
          <textarea
            value={draft.closeout}
            onChange={(e) => onDraftFieldChange("closeout", e.target.value)}
            rows={7}
            style={{ width: "100%", padding: 8, minHeight: 140, resize: "vertical" }}
          />
          <button type="button" onClick={() => onCopy("closeout")} style={btnStyle}>
            {t("btn_copy_closeout_note", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
