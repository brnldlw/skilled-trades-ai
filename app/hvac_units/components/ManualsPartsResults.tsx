"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type LinkItem = { title: string; url: string; note?: string };

type ManualsParts = {
  summary: string;
  manuals: LinkItem[];
  parts: LinkItem[];
};

export function ManualsPartsResults({
  error,
  manualsParts,
}: {
  error: string;
  manualsParts: ManualsParts | null;
}) {
  const { lang } = useLang();
  return (
    <>
      {error ? (
        <div style={{ color: "crimson", fontWeight: 800 }}>{error}</div>
      ) : null}
      {!manualsParts ? (
        <SmallHint>
          {t("manuals_parts_prompt", lang)}
        </SmallHint>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>{manualsParts.summary}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>{t("label_manuals", lang)}</div>
              <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                {manualsParts.manuals.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 10,
                      textDecoration: "none",
                      color: "#111",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{l.title}</div>
                    {l.note ? <SmallHint>{l.note}</SmallHint> : null}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>{t("label_parts", lang)}</div>
              <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                {manualsParts.parts.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 10,
                      textDecoration: "none",
                      color: "#111",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{l.title}</div>
                    {l.note ? <SmallHint>{l.note}</SmallHint> : null}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
