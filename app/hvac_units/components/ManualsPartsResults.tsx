"use client";

import { SmallHint } from "./SmallHint";

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
  return (
    <>
      {error ? (
        <div style={{ color: "crimson", fontWeight: 800 }}>{error}</div>
      ) : null}
      {!manualsParts ? (
        <SmallHint>
          Press "Parts & Manuals" after filling Manufacturer / Model / Symptom.
        </SmallHint>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 900 }}>{manualsParts.summary}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900 }}>Manuals</div>
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
              <div style={{ fontWeight: 900 }}>Parts</div>
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
