"use client";

import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import { PillButton } from "./PillButton";
import { useJobIdentity } from "../context/JobIdentity";
import { guessDefaultUnit } from "../lib/unitHelpers";
import {
  unitOptions,
  coolingPresets,
  heatingPresets,
  refrigerationPresets,
  miniSplitPresets,
  iceMachinePresets,
} from "../data/presets";

export function MeasurementsObservations({
  equipmentType,
  measurementOptions,
  obsLabel,
  onObsLabelChange,
  obsValue,
  onObsValueChange,
  obsUnit,
  onObsUnitChange,
  obsNote,
  onObsNoteChange,
  autoConvert,
  onAutoConvertChange,
  onApplyPreset,
  onAddMeasurement,
  onClearAll,
  onRemoveObservation,
}: {
  equipmentType: string;
  measurementOptions: string[];
  obsLabel: string;
  onObsLabelChange: (value: string) => void;
  obsValue: string;
  onObsValueChange: (value: string) => void;
  obsUnit: string;
  onObsUnitChange: (value: string) => void;
  obsNote: string;
  onObsNoteChange: (value: string) => void;
  autoConvert: boolean;
  onAutoConvertChange: (value: boolean) => void;
  onApplyPreset: (label: string, unit: string) => void;
  onAddMeasurement: () => void;
  onClearAll: () => void;
  onRemoveObservation: (idx: number) => void;
}) {
  const { symptom, observations } = useJobIdentity();

  const equipmentLower = equipmentType.toLowerCase();
  const presets = equipmentLower.includes("ice machine")
    ? iceMachinePresets
    : equipmentLower.includes("cooler") ||
      equipmentLower.includes("freezer") ||
      equipmentLower.includes("merchandiser")
    ? refrigerationPresets
    : equipmentLower.includes("mini-split")
    ? miniSplitPresets
    : symptom.toLowerCase().includes("heat")
    ? heatingPresets
    : coolingPresets;

  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {presets.map((p) => (
          <PillButton
            key={p.label}
            text={p.label}
            onClick={() => onApplyPreset(p.label, p.unit)}
          />
        ))}
        {measurementOptions.map((m) => (
          <PillButton
            key={m}
            text={m}
            onClick={() => onApplyPreset(m, guessDefaultUnit(m))}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 10,
          marginTop: 12,
        }}
      >
        <div>
          <label style={{ fontWeight: 900 }}>Label</label>
          <input
            value={obsLabel}
            onChange={(e) => onObsLabelChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 900 }}>Value</label>
          <input
            value={obsValue}
            onChange={(e) => onObsValueChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 900 }}>Unit</label>
          <select
            value={obsUnit}
            onChange={(e) => onObsUnitChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        <div>
          <label style={{ fontWeight: 900 }}>Note (optional)</label>
          <input
            value={obsNote}
            onChange={(e) => onObsNoteChange(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={autoConvert}
            onChange={(e) => onAutoConvertChange(e.target.checked)}
          />
          Auto-convert (kPa→psi, °C→°F, Pa→inWC)
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onAddMeasurement} style={{
          padding: "10px 14px",
          fontWeight: 900,
          border: "1px solid #cfcfcf",
          borderRadius: 10,
          background: "#ffffff",
          color: "#111",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}>
            Add measurement
          </button>
          <button
            onClick={onClearAll}
            style={{
          padding: "10px 14px",
          fontWeight: 900,
          border: "1px solid #cfcfcf",
          borderRadius: 10,
          background: "#ffffff",
          color: "#111",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
          >
            Clear all
          </button>
        </div>

        {observations.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {observations.map((o, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {o.label}
                    <Badge text={`${o.value} ${o.unit}`} />
                  </div>
                  {o.note ? <SmallHint>{o.note}</SmallHint> : null}
                </div>
                <button onClick={() => onRemoveObservation(idx)} style={{ fontWeight: 900 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <SmallHint>No measurements added yet.</SmallHint>
        )}
      </div>
    </>
  );
}
