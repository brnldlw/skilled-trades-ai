"use client";

import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";
import type { SavedUnitRecord } from "../../lib/unit-store";

export function SiteUnitsAtLocation({
  customerName,
  siteName,
  siteUnitsAtLocation,
  currentLoadedUnitId,
  onLoadUnit,
}: {
  customerName: string;
  siteName: string;
  siteUnitsAtLocation: SavedUnitRecord[];
  currentLoadedUnitId: string;
  onLoadUnit: (record: SavedUnitRecord) => void;
}) {
  if (!customerName.trim() || !siteName.trim()) {
    return (
      <SmallHint>
        Enter customer and site to see other units already saved at this location.
      </SmallHint>
    );
  }

  if (!siteUnitsAtLocation.length) {
    return (
      <SmallHint>
        No saved units found yet for this customer/site.
      </SmallHint>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <SmallHint>
        Saved units already at this site: <b>{siteUnitsAtLocation.length}</b>
      </SmallHint>

      {siteUnitsAtLocation.map((unit) => (
        <div
          key={unit.id}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 10,
            padding: 10,
            background:
              currentLoadedUnitId && currentLoadedUnitId === unit.id
                ? "#f7fbff"
                : "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              {unit.unitNickname || "No Unit Tag"}
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid #cfcfcf",
                background: "#f7f7f7",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {unit.equipmentType || "Unknown Type"}
            </span>

            {currentLoadedUnitId && currentLoadedUnitId === unit.id ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid #cfcfcf",
                  background: "#eefaf0",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                CURRENTLY LOADED
              </span>
            ) : null}
          </div>

          <SmallHint style={{ marginTop: 6 }}>
            {unit.manufacturer || "-"} {unit.model || "-"} • Serial: {unit.serialNumber || "-"}
          </SmallHint>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <PillButton text="Load This Unit" onClick={() => onLoadUnit(unit)} />
          </div>
        </div>
      ))}
    </div>
  );
}
