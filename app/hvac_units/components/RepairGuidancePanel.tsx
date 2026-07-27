"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import type { RepairGuidanceItem, RepairGuidanceMode } from "../lib/repairGuidance";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function RepairGuidancePanel({
  items,
  mode,
}: {
  items: RepairGuidanceItem[];
  mode: RepairGuidanceMode;
}) {
  const { lang } = useLang();
  return (
    <>
      {items.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {item.title}
                {typeof item.confidence === "number" ? (
                  <Badge text={`${item.confidence}%`} />
                ) : null}
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_suspected_part", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.suspectedPart}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_why_suspect", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.why}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_confirm_test", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.confirmTest}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_quick_field_check", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.fieldCheck}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_likely_fix", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.likelyFix}</SmallHint>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_common_mistake", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.commonMistake}</SmallHint>
              </div>

              {mode === "apprentice" ? (
                <>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_tool_to_use", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.toolToUse}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_expected_reading", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.expectedReading}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_if_test_passes", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.passInterpretation}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_if_test_fails", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.failInterpretation}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_next_if_fail", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.nextIfFail}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_quick_field_check", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.fieldCheck}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_common_mistake", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.commonMistake}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_safety_note", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.safetyNote}</SmallHint>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_tool_to_use", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.toolToUse}</SmallHint>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_next_if_fail", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{item.nextIfFail}</SmallHint>
                  </div>
                </>
              )}

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 900 }}>{t("label_safety_note", lang)}</div>
                <SmallHint style={{ marginTop: 4 }}>{item.safetyNote}</SmallHint>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <SmallHint>
          {t("repair_guidance_empty", lang)}
        </SmallHint>
      )}
    </>
  );
}
