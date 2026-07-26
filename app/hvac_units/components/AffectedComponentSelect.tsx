"use client";

import { SmallHint } from "./SmallHint";

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
  return (
    <>
      <SmallHint>
        Select the exact piece of equipment this call is about. This is required for split systems,
        walk-ins, mini-splits, and any multi-component setup so history stays tied to the right component.
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
          <option value="">Select affected component</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        {affectedComponentId ? (
          <SmallHint>
            Selected: <b>{affectedComponentLabel || affectedComponentId}</b>
          </SmallHint>
        ) : systemType !== "single" ? (
          <SmallHint>
            Required for multi-component systems.
          </SmallHint>
        ) : (
          <SmallHint>
            For single-equipment calls this will default to the primary component if you leave it blank.
          </SmallHint>
        )}
      </div>
    </>
  );
}
