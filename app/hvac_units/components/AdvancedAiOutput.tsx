"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import { formatRawOutput } from "../lib/textHelpers";

export function AdvancedAiOutput({ rawResult }: { rawResult: string }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow((v) => !v)}
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
        {show ? "Hide Advanced AI Output" : "Show Advanced AI Output"}
      </button>

      {show ? (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {formatRawOutput(rawResult || "No results yet.")}
          </div>
        </div>
      ) : (
        <SmallHint style={{ marginTop: 12 }}>
          Advanced AI output is hidden by default to keep the field workflow clean.
        </SmallHint>
      )}
    </>
  );
}
