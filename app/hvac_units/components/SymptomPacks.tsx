"use client";

import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type SymptomPackOption = {
  id: string;
  label: string;
};

export function SymptomPacks({
  packs,
  selectedPackId,
  onSelectPack,
}: {
  packs: SymptomPackOption[];
  selectedPackId: string;
  onSelectPack: (packId: string) => void;
}) {
  const { lang } = useLang();
  return (
    <>
      <SmallHint>{t("symptom_packs_hint", lang)}</SmallHint>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {packs.map((pack) => (
          <PillButton
            key={pack.id}
            text={pack.label}
            active={pack.id === selectedPackId}
            onClick={() => onSelectPack(pack.id)}
          />
        ))}
      </div>
    </>
  );
}
