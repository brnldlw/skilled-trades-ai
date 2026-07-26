"use client";

import type { RefObject } from "react";
import { SmallHint } from "./SmallHint";
import { PillButton } from "./PillButton";
import type { NameplateResult } from "../../lib/unit-store";

export function NameplateReader({
  fileInputRef,
  image,
  nameplate,
  busy,
  error,
  onPickFile,
  onParse,
  onClear,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  image: string;
  nameplate: NameplateResult | null;
  busy: boolean;
  error: string;
  onPickFile: (file: File) => void | Promise<void>;
  onParse: () => void;
  onClear: () => void;
}) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onPickFile(f);
        }}
      />

      {image ? (
        <div style={{ display: "grid", gap: 10 }}>
          <img
            src={image}
            alt="Nameplate"
            style={{
              width: "100%",
              maxHeight: 260,
              objectFit: "contain",
              border: "1px solid #eee",
              borderRadius: 10,
            }}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PillButton
              text={busy ? "Reading..." : "Read nameplate"}
              onClick={onParse}
              disabled={busy}
            />
            <PillButton text="Clear" onClick={onClear} />
          </div>
          {error ? (
            <div style={{ color: "crimson", fontWeight: 800 }}>{error}</div>
          ) : null}
          {nameplate ? (
            <div style={{ display: "grid", gap: 8 }}>
              <SmallHint>
                Confidence: <b>{nameplate.confidence}</b> — {nameplate.notes}
              </SmallHint>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><b>Manufacturer:</b> {nameplate.manufacturer ?? "-"}</div>
                <div><b>Model:</b> {nameplate.model ?? "-"}</div>
                <div><b>Serial:</b> {nameplate.serial ?? "-"}</div>
                <div><b>Refrigerant:</b> {nameplate.refrigerant ?? "-"}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <SmallHint>
          Upload a clear nameplate photo to extract manufacturer/model/serial/refrigerant.
        </SmallHint>
      )}
    </>
  );
}
