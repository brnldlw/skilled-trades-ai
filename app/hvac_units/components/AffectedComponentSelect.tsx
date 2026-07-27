"use client";

import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type ComponentOption = {
  id: string;
  label: string;
};

export function AffectedComponentSelect({
  options,
  affectedComponentId,
  affectedComponentLabel,
  systemType,
  onSelect,
}: {
  options: ComponentOption[];
  affectedComponentId: string;
  affectedComponentLabel: string;
  systemType: string;
  onSelect: (id: string, label: string) => void;
}) {
  const { lang } = useLang();
  return (
    <>
      <SmallHint>
        {t("affected_component_hint", lang)}
      </SmallHint>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <select
          value={affectedComponentId}
          onChange={(e) => {
            const nextId = e.target.value;
            const selected = options.find((option) => option.id === nextId);
            onSelect(nextId, selected?.label || "");
          }}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">{t("affected_component_select_placeholder", lang)}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        {affectedComponentId ? (
          <SmallHint>
            {t("affected_component_selected", lang)} <b>{affectedComponentLabel || affectedComponentId}</b>
          </SmallHint>
        ) : systemType !== "single" ? (
          <SmallHint>
            {t("affected_component_required_multi", lang)}
          </SmallHint>
        ) : (
          <SmallHint>
            {t("affected_component_default_single", lang)}
          </SmallHint>
        )}
      </div>
    </>
  );
}
