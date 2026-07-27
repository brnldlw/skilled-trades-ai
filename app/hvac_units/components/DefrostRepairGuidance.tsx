"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type GuidanceItem = {
  part: string;
  priority: string;
  why: string;
  nextTest: string;
  quickCheck: string;
};

export function DefrostRepairGuidance({ guidance }: { guidance: GuidanceItem[] }) {
  const { lang } = useLang();
  return (
    <>
      <SmallHint>
        {t("defrost_repair_hint", lang)}
      </SmallHint>

      {guidance.length ? (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {guidance.map((item, idx) => (
            <div
              key={`${item.part}-${idx}`}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {item.part}
                <Badge text={item.priority} />
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_why_suspect", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.why}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_next_test", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.nextTest}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_quick_field_check", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.quickCheck}</SmallHint>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
          }}
        >
          <SmallHint>
            {t("defrost_repair_empty", lang)}
          </SmallHint>
        </div>
      )}
    </>
  );
}
