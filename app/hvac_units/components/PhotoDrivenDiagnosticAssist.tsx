"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type Payload = {
  summary: string;
  inspect: string[];
  verifyNext: string[];
  repairDecisionEmphasis: string[];
  partsToVerifyEmphasis: string[];
  photoCanSupport: string[];
  photoCannotProve: string[];
  photoPartTieIn: string[];
  watchOuts: string[];
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

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        {items.map((item, idx) => (
          <li key={idx}>
            <SmallHint>{item}</SmallHint>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PhotoDrivenDiagnosticAssist({
  payload,
  photoCount,
  targetComponent,
  photoSubject,
  onPhotoSubjectChange,
  onRefresh,
  onAddToTechNotes,
  message,
}: {
  payload: Payload;
  photoCount: number;
  targetComponent: string;
  photoSubject: string;
  onPhotoSubjectChange: (value: string) => void;
  onRefresh: () => void;
  onAddToTechNotes: () => void;
  message: string;
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
        {t("photo_driven_title", lang)}
      </div>

      <SmallHint>
        {t("photo_driven_hint", lang)}
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
            {t("label_attached_service_photos", lang)}
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
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <label style={{ fontWeight: 900 }}>{t("label_what_is_photo_of", lang)}</label>
        <select
          value={photoSubject}
          onChange={(e) => onPhotoSubjectChange(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="iced_coil">{t("photo_subj2_iced_coil", lang)}</option>
          <option value="contactor_capacitor">{t("photo_subj2_contactor", lang)}</option>
          <option value="control_board">{t("photo_subj2_control_board", lang)}</option>
          <option value="wiring">{t("photo_subj2_wiring", lang)}</option>
          <option value="nameplate_tag">{t("photo_subj2_nameplate", lang)}</option>
          <option value="drain_defrost">{t("photo_subj2_drain", lang)}</option>
          <option value="dirty_coil_airflow">{t("photo_subj2_dirty_coil", lang)}</option>
          <option value="compressor_section">{t("photo_subj2_compressor", lang)}</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onRefresh} style={btnStyle}>
          {t("btn_refresh_photo_assist", lang)}
        </button>

        <button type="button" onClick={onAddToTechNotes} style={btnStyle}>
          {t("btn_add_photo_assist_to_notes", lang)}
        </button>
      </div>

      {message ? (
        <SmallHint>
          <b>{t("label_photo_assist_colon", lang)}</b> {message}
        </SmallHint>
      ) : null}

      <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
        <SmallHint>{payload.summary}</SmallHint>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <List title={t("list_what_to_inspect", lang)} items={payload.inspect} />
        <List title={t("list_what_to_verify_next", lang)} items={payload.verifyNext} />
        <List title={t("list_repair_decision_emphasis", lang)} items={payload.repairDecisionEmphasis} />
        <List title={t("list_parts_to_verify_emphasis", lang)} items={payload.partsToVerifyEmphasis} />
        <List title={t("list_photo_can_support", lang)} items={payload.photoCanSupport} />
        <List title={t("list_photo_cannot_prove", lang)} items={payload.photoCannotProve} />
        <List title={t("list_selected_part_tiein", lang)} items={payload.photoPartTieIn} />
        <List title={t("list_watch_outs", lang)} items={payload.watchOuts} />
      </div>
    </div>
  );
}
