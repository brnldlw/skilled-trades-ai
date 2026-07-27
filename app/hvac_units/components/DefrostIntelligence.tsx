"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type DefrostAnalysis = {
  summary: string;
  findings: string[];
};

export function DefrostIntelligence({ defrostAnalysis }: { defrostAnalysis: DefrostAnalysis }) {
  const { lang } = useLang();
  return (
    <>
      <SmallHint>
        {t("defrost_hint", lang)}
      </SmallHint>

      <div
        style={{
          marginTop: 12,
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 900 }}>{t("label_defrost_summary", lang)}</div>
        <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
          {defrostAnalysis.summary}
        </div>

        {defrostAnalysis.findings.length ? (
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {defrostAnalysis.findings.map((f, i) => (
              <li key={i}>
                <SmallHint>{f}</SmallHint>
              </li>
            ))}
          </ul>
        ) : (
          <SmallHint style={{ marginTop: 8 }}>
            {t("defrost_more_readings", lang)}
          </SmallHint>
        )}
      </div>
    </>
  );
}
