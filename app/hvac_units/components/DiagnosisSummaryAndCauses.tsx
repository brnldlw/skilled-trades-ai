"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import { ProbBar } from "./ProbBar";
import { SectionCard } from "./SectionCard";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type LikelyCause = {
  cause: string;
  probability_percent?: number;
  why?: string;
};

type Diagnosis = {
  summary?: string;
  likely_causes?: LikelyCause[];
};

export function DiagnosisSummaryAndCauses({ parsed }: { parsed: Diagnosis }) {
  const { lang } = useLang();
  return (
    <>
      <SectionCard title={t("label_summary", lang)}>
        <div style={{ fontWeight: 900 }}>{parsed.summary || "—"}</div>
      </SectionCard>

      <SectionCard title={t("label_likely_causes", lang)}>
        {parsed.likely_causes?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {parsed.likely_causes.map((c, idx) => (
              <div
                key={idx}
                style={{
                  borderTop: idx ? "1px solid #eee" : "none",
                  paddingTop: idx ? 10 : 0,
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {c.cause || t("label_cause_fallback", lang)}
                  {typeof c.probability_percent === "number" ? (
                    <Badge text={`${c.probability_percent}%`} />
                  ) : null}
                </div>
                {typeof c.probability_percent === "number" ? (
                  <ProbBar pct={c.probability_percent} />
                ) : null}
                {c.why ? <SmallHint style={{ marginTop: 6 }}>{c.why}</SmallHint> : null}
              </div>
            ))}
          </div>
        ) : (
          <SmallHint>{t("no_likely_causes", lang)}</SmallHint>
        )}
      </SectionCard>
    </>
  );
}
