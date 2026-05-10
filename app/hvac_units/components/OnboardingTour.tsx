"use client";

import React, { useState, useEffect } from "react";

const TOUR_KEY = "mhvacr_tour_v1_complete";

type TourStep = {
  id: string;
  icon: string;
  title: string;
  body: string;
  tip?: string;
  anchor?: string; // section ID to highlight
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    icon: "👋",
    title: "Welcome to My HVAC/R Tool",
    body: "Built by a 30-year field tech, this is your complete digital toolbox. Everything you need on a job — in one place, on your phone, works offline.",
    tip: "This tour takes about 60 seconds. You can skip it anytime.",
  },
  {
    id: "job_form",
    icon: "🔧",
    title: "Start every job here",
    body: "Fill in the equipment info at the top — manufacturer, model, equipment type, what's wrong. The more detail you put in, the smarter every AI feature gets. Garbage in, garbage out.",
    tip: "Tap the microphone icon to speak readings instead of typing.",
    anchor: "new-job",
  },
  {
    id: "ai_diagnosis",
    icon: "🤖",
    title: "AI Diagnosis Assistant",
    body: "Describe the symptom and get expert-level guidance specific to this unit. The AI knows this unit's service history, your readings, and the equipment specs. It's like calling tech support that actually knows the job.",
    tip: "Photo the nameplate and the AI reads it automatically — no typing the model number.",
    anchor: "ai-chat",
  },
  {
    id: "reference_tools",
    icon: "🧰",
    title: "Full reference library in the menu",
    body: "Tap the ☰ menu to access PT charts, belt cross-reference, parts cross-reference, filter sizes, refrigerant quick-reference, wiring diagrams, and more. Everything you used to have to look up is in there.",
    tip: "The belt cross-reference works by part number OR by dimensions. Type what's on the old belt.",
  },
  {
    id: "unit_history",
    icon: "📋",
    title: "Unit library — every unit, every job",
    body: "Every unit you work on gets saved with its full history — every reading, every part, every callback. Next time you're on that unit you'll know exactly what's been done to it.",
    tip: "The health score tracks each unit over time. Low score = high risk of failure.",
    anchor: "unit-library",
  },
  {
    id: "closeout",
    icon: "✅",
    title: "Before you leave — closeout tools",
    body: "The Callback Prevention Checklist generates automatically from what you fixed. The PM Form Filler reads the nameplate and fills your company's forms. The Refrigerant Log is EPA 608 compliant.",
    tip: "The checklist knows if you replaced a capacitor vs a compressor and gives you different checks. It's specific, not generic.",
    anchor: "callback-checklist",
  },
  {
    id: "estimator",
    icon: "💰",
    title: "Replacement Quote Estimator",
    body: "When you're looking at a replacement job, the estimator walks you through a 5-step survey, analyzes your job site video for obstacles, and generates a complete scope of work and pricing estimate. Available as an add-on.",
    tip: "The video analysis catches things techs miss — overhead lines, tight doorways, gas lines in the crane path.",
    anchor: "estimator",
  },
  {
    id: "ready",
    icon: "🚀",
    title: "You're ready",
    body: "Start your first job, use the AI on a call you're on right now, or explore the reference library. The app is free for 14 days — full access, no card required.",
    tip: "Found something broken or missing? The thumbs-down icon sends feedback directly. This app is built by a working tech and it gets better from real feedback.",
  },
];

type Props = {
  onComplete?: () => void;
};

export function OnboardingTour({ onComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) setVisible(true);
    } catch {}
  }, []);

  function completeTour() {
    try { localStorage.setItem(TOUR_KEY, "1"); } catch {}
    setVisible(false);
    onComplete?.();
  }

  function nextStep() {
    if (step < TOUR_STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(s => s + 1);
        setAnimating(false);
        // Scroll to anchor if present
        const next = TOUR_STEPS[step + 1];
        if (next.anchor) {
          const el = document.getElementById(next.anchor);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else {
      completeTour();
    }
  }

  function prevStep() {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStep(s => s - 1);
        setAnimating(false);
      }, 150);
    }
  }

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const pct = Math.round(((step + 1) / TOUR_STEPS.length) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={completeTour}
        style={{
          position: "fixed" as const,
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 9998,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Tour card */}
      <div
        style={{
          position: "fixed" as const,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: "0 0 env(safe-area-inset-bottom, 0)",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            padding: "20px 24px 32px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.25)",
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.15s, transform 0.15s",
            maxHeight: "80vh",
            overflowY: "auto" as const,
          }}
        >
          {/* Progress bar */}
          <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#f97316", borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>

          {/* Step counter + skip */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
              {step + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={completeTour}
              style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
            >
              Skip tour
            </button>
          </div>

          {/* Icon */}
          <div style={{ fontSize: 48, marginBottom: 14, lineHeight: 1 }}>{current.icon}</div>

          {/* Title */}
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0f1f3d", marginBottom: 10, lineHeight: 1.2 }}>
            {current.title}
          </div>

          {/* Body */}
          <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.65, marginBottom: 14 }}>
            {current.body}
          </div>

          {/* Tip */}
          {current.tip && (
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "#92400e",
              lineHeight: 1.55,
              marginBottom: 20,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}>
              <span style={{ flexShrink: 0, fontSize: 15 }}>💡</span>
              {current.tip}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={prevStep}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "#f1f5f9",
                  color: "#374151",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={nextStep}
              style={{
                flex: 2,
                padding: "13px",
                background: isLast ? "#16a34a" : "#0f1f3d",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: isLast ? "0 4px 16px rgba(22,163,74,0.35)" : "0 4px 16px rgba(15,31,61,0.25)",
              }}
            >
              {isLast ? "🚀 Start using the app" : "Next →"}
            </button>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? "#f97316" : "#e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Hook to reset tour for testing ───────────────────────────
export function resetTour() {
  try { localStorage.removeItem(TOUR_KEY); } catch {}
}