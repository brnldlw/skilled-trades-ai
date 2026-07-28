"use client";

import type { RefObject } from "react";
import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";
import type { NameplateResult } from "../../lib/unit-store";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function NameplateReader({
  fileInputRef,
  image,
  nameplate,
  busy,
  error,
  onPickFile,
  onParse,
  onClear,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  image: string;
  nameplate: NameplateResult | null;
  busy: boolean;
  error: string;
  onPickFile: (file: File) => void | Promise<void>;
  onParse: () => void;
  onClear: () => void;
}) {
  const { lang } = useLang();
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onPickFile(f);
        }}
      />

      {image ? (
        <div style={{ display: "grid", gap: 10 }}>
          <img
            src={image}
            alt="Nameplate"
            style={{
              width: "100%",
              maxHeight: 260,
              objectFit: "contain",
              border: "1px solid #eee",
              borderRadius: 10,
            }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PillButton
              text={busy ? t("nr_reading", lang) : t("nr_read_nameplate", lang)}
              onClick={onParse}
              disabled={busy}
            />
            <PillButton text={t("btn_clear", lang)} onClick={onClear} />
          </div>
          {error ? (
            <div style={{ color: "crimson", fontWeight: 800 }}>{error}</div>
          ) : null}
          {nameplate ? (
            <div style={{ display: "grid", gap: 8 }}>
              <SmallHint>
                {t("nr_confidence_colon", lang)} <b>{nameplate.confidence}</b> — {nameplate.notes}
              </SmallHint>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><b>{t("label_manufacturer_colon", lang)}</b> {nameplate.manufacturer ?? "-"}</div>
                <div><b>{t("label_model_colon", lang)}</b> {nameplate.model ?? "-"}</div>
                <div><b>{t("label_serial_colon", lang)}</b> {nameplate.serial ?? "-"}</div>
                <div><b>{t("label_refrigerant_colon", lang)}</b> {nameplate.refrigerant ?? "-"}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <SmallHint>
          {t("nr_upload_hint", lang)}
        </SmallHint>
      )}
    </>
  );
}
