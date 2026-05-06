"use client";

import React, { useState } from "react";
import type { HealthScoreResult, HealthFactor } from "../lib/systemHealthScore";

type SystemHealthScoreProps = {
  result: HealthScoreResult;
  unitName?: string;
  compact?: boolean;
};

// ── Gauge SVG ─────────────────────────────────────────────────
function ScoreGauge({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;
  const gap = circumference - progress;

  return (
    <svg width="140" height="80" viewBox="0 0 140 80" style={{ overflow: "visible" }}>
      {/* Background arc */}
      <path
        d="M 10 75 A 60 60 0 0 1 130 75"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Score arc */}
      <path
        d="M 10 75 A 60 60 0 0 1 130 75"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${gap}`}
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      {/* Score text */}
      <text
        x="70"
        y="68"
        textAnchor="middle"
        style={{
          fontSize: 28,
          fontWeight: 800,
          fill: color,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {score}
      </text>
    </svg>
  );
}

// ── Factor row ────────────────────────────────────────────────
function FactorRow({ factor }: { factor: HealthFactor }) {
  const isPositive = factor.impact > 0;
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "8px 0",
      borderBottom: "1px solid #f1f5f9",
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: isPositive ? "#dcfce7" : "#fee2e2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        flexShrink: 0,
        marginTop: 1,
      }}>
        {isPositive ? "✓" : "↓"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#1e293b",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
        }}>
          <span>{factor.label}</span>
          <span style={{
            fontSize: 12,
            fontWeight: 800,
            color: isPositive ? "#16a34a" : "#dc2626",
            flexShrink: 0,
          }}>
            {isPositive ? `+${factor.impact}` : factor.impact}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>
          {factor.detail}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function SystemHealthScore({
  result,
  unitName,
  compact = false,
}: SystemHealthScoreProps) {
  const [showFactors, setShowFactors] = useState(false);

  if (compact) {
    return (
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px",
        background: result.bgColor,
        borderRadius: 20,
        border: `1px solid ${result.color}40`,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: result.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 11,
          color: "#fff",
          flexShrink: 0,
        }}>
          {result.score}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: result.color }}>
            {result.label}
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Health Score</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: result.bgColor,
      border: `1px solid ${result.color}40`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap" as const,
      }}>
        {/* Gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <ScoreGauge score={result.score} color={result.color} />
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: result.color,
            marginTop: 2,
          }}>
            {result.label}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>
              System Health Score
            </div>
          </div>
          {unitName && (
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>{unitName}</div>
          )}
          <div style={{
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.6,
            marginBottom: 10,
          }}>
            {result.summary}
          </div>

          {/* Recommendation box */}
          <div style={{
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${result.color}30`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            color: "#1e293b",
            lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 700, color: result.color }}>Recommendation: </span>
            {result.recommendation}
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ padding: "0 20px 4px" }}>
        <div style={{
          height: 6,
          background: "rgba(255,255,255,0.5)",
          borderRadius: 3,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${result.score}%`,
            background: result.color,
            borderRadius: 3,
            transition: "width 1s ease",
          }} />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#94a3b8",
          marginTop: 3,
          padding: "0 2px",
        }}>
          <span>Critical</span>
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Factors toggle */}
      {result.factors.length > 0 && (
        <div style={{
          borderTop: `1px solid ${result.color}20`,
          background: "rgba(255,255,255,0.5)",
        }}>
          <button
            onClick={() => setShowFactors(v => !v)}
            style={{
              width: "100%",
              padding: "10px 20px",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              fontFamily: "inherit",
            }}
          >
            <span>
              {showFactors ? "▲" : "▼"} Score breakdown ({result.factors.length} factor{result.factors.length !== 1 ? "s" : ""})
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
              Starts at 100
            </span>
          </button>

          {showFactors && (
            <div style={{ padding: "0 20px 16px" }}>
              {result.factors.map((f, i) => (
                <FactorRow key={i} factor={f} />
              ))}
              <div style={{
                marginTop: 10,
                padding: "8px 12px",
                background: result.bgColor,
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Final Score</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: result.color }}>{result.score}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                Score calculated from service history. Updates automatically after each service visit is logged.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}