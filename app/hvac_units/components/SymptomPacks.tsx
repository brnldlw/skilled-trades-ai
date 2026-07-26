"use client";

import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";

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
  return (
    <>
      <SmallHint>Choose a symptom pack to load a tech-style flowchart.</SmallHint>
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
