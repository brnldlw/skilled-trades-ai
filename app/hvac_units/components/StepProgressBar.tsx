"use client";

import React, { useEffect, useState } from "react";

const STEPS = [
  { num: 1, label: "Identify", anchor: "new-job" },
  { num: 2, label: "Complaint", anchor: "measurements" },
  { num: 3, label: "Diagnose", anchor: "ai-chat" },
  { num: 4, label: "Repair", anchor: "repair" },
  { num: 5, label: "Closeout", anchor: "customer-report" },
];

export function StepProgressBar() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const sectionIds = STEPS.map((s) => s.anchor);

    function updateActive() {
      const navHeight = 52 + 44; // nav + progress bar
      let current = 1;

      for (const step of STEPS) {
        const el = document.getElementById(step.anchor);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= navHeight + 60) {
          current = step.num;
        }
      }

      setActiveStep(current);
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();
    return () => window.removeEventListener("scroll", updateActive);
  }, []);

  function goToStep(anchor: string) {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 52, // below nav bar
      left: 0,
      right: 0,
      height: 44,
      background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "stretch",
      zIndex: 850,
      boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
    }}>
      {STEPS.map((step, idx) => {
        const isActive = step.num === activeStep;
        const isDone = step.num < activeStep;
        return (
          <button
            key={step.num}
            onClick={() => goToStep(step.anchor)}
            style={{
              flex: 1,
              border: "none",
              background: isActive ? "#0f1f3d" : isDone ? "#f0fdf4" : "#fff",
              color: isActive ? "#fff" : isDone ? "#16a34a" : "#94a3b8",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              padding: "2px 4px",
              position: "relative",
              transition: "background 0.2s",
              borderRight: idx < STEPS.length - 1 ? "1px solid #e2e8f0" : "none",
            }}
          >
            {/* Step number */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: isActive ? "rgba(255,255,255,0.2)" : isDone ? "#16a34a" : "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
              color: isActive ? "#fff" : isDone ? "#fff" : "#94a3b8",
            }}>
              {isDone ? "✓" : step.num}
            </div>
            {/* Label */}
            <div style={{
              fontSize: 9,
              fontWeight: isActive ? 800 : 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              {step.label}
            </div>
            {/* Active indicator */}
            {isActive && (
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background: "#2563eb",
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}