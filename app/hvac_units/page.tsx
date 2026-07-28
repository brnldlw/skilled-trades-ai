/* top-measurements-observations-block-v1 */
/* deemphasize-lower-legacy-context-area-v1 */
/* top-site-units-block-v1 */
/* stop-floating-current-loaded-unit-v1 */
/* top-evidence-quick-entry-v1 */
/* top-affected-component-selector-v1 */
/* top-complaint-evidence-block-v1 */
/* deemphasize-lower-legacy-equipment-entry-v2 */
/* top-equipment-details-block-v1 */
/* top-identify-equipment-block-v1 */
/* loadunit-cleanup-no-fail-v1 */
/* top-surface-simplification-no-fail-v1 */
/* safe-cleanup-pass-current-file-v1 */
/* circuit-persistence-safe-patch-v1 */
/* repair-execution-assist-visibility-cleanup-v1 */
/* circuit-wiring-cleanup-pass1-v3 */
/* replace-old-loaded-unit-banner-v1 */
"use client";

import { createClient as createSupabaseClient } from "../lib/supabase/client";

import { buildErrorCodeGuidance } from "./lib/errorCodeGuidance";

import { buildMeasurementCoaching } from "./lib/measurementCoaching";

import { buildRepairGuidance } from "./lib/repairGuidance";

import { safeJson } from "./lib/networkHelpers";

import { ProbBar } from "./components/ProbBar";

import { SectionCard } from "./components/SectionCard";

import { PillButton } from "./components/PillButton";

import { SmallHint } from "./components/SmallHint";

import { Badge } from "./components/Badge";

import { AiChatBot } from "./components/AiChatBot";

import { HvacCalculators } from "./components/HvacCalculators";

import { NavMenu } from "../components/NavMenu";

import { JobIdentityProvider } from "./context/JobIdentity";

import { CompanyAdminPanel } from "./components/CompanyAdminPanel";
import { HistoricalEntryModeToggle } from "./components/HistoricalEntryModeToggle";
import { HelpQuickStart } from "./components/HelpQuickStart";
import { PartsManualsAssist } from "./components/PartsManualsAssist";
import { RepairDecisionPanel } from "./components/RepairDecisionPanel";
import { UnitServiceTimeline } from "./components/UnitServiceTimeline";
import { SavedUnitHistory } from "./components/SavedUnitHistory";
import { SiteUnitsAtLocation } from "./components/SiteUnitsAtLocation";
import { NameplateReader } from "./components/NameplateReader";
import { SymptomPacks } from "./components/SymptomPacks";
import { ServiceEventPhotos } from "./components/ServiceEventPhotos";
import { CurrentLoadedUnit } from "./components/CurrentLoadedUnit";
import { AffectedComponentSelect } from "./components/AffectedComponentSelect";
import { RepairExecutionAssist } from "./components/RepairExecutionAssist";
import { PartVerificationChecklist } from "./components/PartVerificationChecklist";
import { SuggestedFollowUpWatchlist } from "./components/SuggestedFollowUpWatchlist";
import { VerificationOutcomeRepairCommit } from "./components/VerificationOutcomeRepairCommit";
import { MeasurementsObservations } from "./components/MeasurementsObservations";
import { FinalConfirmedCauseField } from "./components/FinalConfirmedCauseField";
import { PartsReplacedField } from "./components/PartsReplacedField";
import { ActualFixPerformedField } from "./components/ActualFixPerformedField";
import { OutcomeCallbackFields } from "./components/OutcomeCallbackFields";
import { SimilarPriorCases } from "./components/SimilarPriorCases";
import { DiagnosticCloseoutBuilder } from "./components/DiagnosticCloseoutBuilder";
import { PhotoAssistPanel } from "./components/PhotoAssistPanel";
import { PhotoDrivenDiagnosticAssist } from "./components/PhotoDrivenDiagnosticAssist";
import { TechCloseoutNotesField } from "./components/TechCloseoutNotesField";
import { PtChartChargeDiagnosis } from "./components/PtChartChargeDiagnosis";
import { AirflowIntelligence } from "./components/AirflowIntelligence";
import { DefrostIntelligence } from "./components/DefrostIntelligence";
import { DefrostRepairGuidance } from "./components/DefrostRepairGuidance";
import { RealFlowchartEngine } from "./components/RealFlowchartEngine";
import { ManualsPartsResults } from "./components/ManualsPartsResults";
import { AdvancedAiOutput } from "./components/AdvancedAiOutput";
import { DiagnosisSummaryAndCauses } from "./components/DiagnosisSummaryAndCauses";
import { RepairGuidancePanel } from "./components/RepairGuidancePanel";
import { RecommendedMeasurementsPanel } from "./components/RecommendedMeasurementsPanel";
import { ErrorCodeGuidancePanel } from "./components/ErrorCodeGuidancePanel";
import { AdminWorkTools } from "./components/AdminWorkTools";

import { CustomerReport } from "./components/CustomerReport";

import { SmartReadingsVoice, VoiceTextArea, VoiceInputButton } from "./components/VoiceInput";

import { RefrigerantLog } from "./components/RefrigerantLog";

import { UpgradePrompt, AiLimitWarning } from "./components/UpgradePrompt";

import { useSubscription } from "./hooks/useSubscription";

import { SystemHealthScore } from "./components/SystemHealthScore";
import { UnitProfilePanel } from "./components/UnitProfilePanel";

import { LearningHub } from "./components/LearningHub";
import { CallbackPreventionChecklist } from "./components/CallbackPreventionChecklist";
import { PartsLookup } from "./components/PartsLookup";
import { BeltReference } from "./components/BeltReference";
import { PartsReferenceHub } from "./components/PartsReferenceHub";
import { FilterReference } from "./components/FilterReference";
import { RefrigerantReference } from "./components/RefrigerantReference";
import { WiringReference } from "./components/WiringReference";
import { PMFormFiller } from "./components/PMFormFiller";
import { EstimatorSection } from "./components/EstimatorSection";
import { ExpertHotline } from "./components/ExpertHotline";

import { FailurePredictionDashboard } from "../components/FailurePredictionDashboard";

import { StepProgressBar } from "./components/StepProgressBar";
import { OnboardingTour } from "./components/OnboardingTour";
import { useLang, type Language } from "../components/LanguageContext";
import { t, type TranslationKey } from "../lib/translations";

// ── View As Banner (admin impersonation) ─────────────────────
function ViewAsBanner() {
  const [viewAs, setViewAs] = React.useState<any>(null);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_view_as");
      if (stored) setViewAs(JSON.parse(stored));
    } catch {}
  }, []);

  if (!viewAs) return null;

  function exitViewAs() {
    localStorage.removeItem("admin_view_as");
    window.location.href = "/admin";
  }

  return (
    <div style={{
      background: "#7c3aed",
      color: "#fff",
      padding: "10px 16px",
      marginBottom: 12,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap" as const,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>👁</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            Viewing as: {viewAs.email}
          </div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            Tier: {viewAs.tier} — This is how the app looks for this user
          </div>
        </div>
      </div>
      <button onClick={exitViewAs} style={{
        padding: "6px 14px",
        background: "rgba(255,255,255,0.2)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.4)",
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "inherit",
        flexShrink: 0,
      }}>
        ✕ Exit View As
      </button>
    </div>
  );
}

// ── Trial Banner (inline component) ──────────────────────────
function TrialBanner() {
  const { lang } = useLang();
  const es = lang === "es";

  const [profile, setProfile] = React.useState<any>(null);
  React.useEffect(() => {
    import("../lib/supabase/subscription").then(m => m.getUserProfile()).then(p => setProfile(p));
  }, []);

  if (!profile?.override_tier || profile.override_tier === "free") return null;
  if (!profile.override_expires_at) return null;

  const expiry = new Date(profile.override_expires_at);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
  if (daysLeft <= 0) return null;

  const isLastDay = daysLeft <= 3;
  const dayWord = daysLeft === 1 ? (es ? "día" : "day") : (es ? "días" : "days");

  return (
    <div style={{ background: isLastDay ? "#fef2f2" : "#eff6ff", border: `1px solid ${isLastDay ? "#fecaca" : "#bae6fd"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{isLastDay ? "⏰" : "🎉"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: isLastDay ? "#dc2626" : "#1d4ed8" }}>
            {isLastDay
              ? (es ? `Tu prueba gratuita termina en ${daysLeft} ${dayWord}` : `Your free trial ends in ${daysLeft} ${dayWord}`)
              : (es ? `Prueba gratuita — ${daysLeft} ${dayWord} restantes` : `Free trial — ${daysLeft} ${dayWord} remaining`)}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
            {isLastDay
              ? (es ? "Suscríbete para mantener acceso completo." : "Subscribe to keep full access to all features.")
              : (es ? "Acceso completo — sin tarjeta. Suscríbete cuando quieras." : "Full access — no card needed. Subscribe anytime.")}
          </div>
        </div>
      </div>
      <a href="/checkout" style={{ padding: "7px 16px", background: isLastDay ? "#dc2626" : "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 12, textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" as const }}>
        {isLastDay ? (es ? "Suscribirse Ahora" : "Subscribe Now") : (es ? "Ver Planes" : "See Plans")}
      </a>
    </div>
  );
}

import { calcSystemHealthScore } from "./lib/systemHealthScore";
import type { ParsedReading } from "./components/VoiceInput";

import { readFileAsDataUrl, makeId } from "./lib/fileHelpers";

import { convertToStandard, guessDefaultUnit } from "./lib/unitHelpers";

import { escapeHtml, formatRawOutput } from "./lib/textHelpers";

import { toNumber, round1 } from "./lib/basicHelpers";

import {
  refrigerantOptions,
  unitOptions,
  equipmentTypeGroups,
  translateEquipmentType,
  translateEquipmentGroupLabel,
  coolingPresets,
  heatingPresets,
  refrigerationPresets,
  miniSplitPresets,
  iceMachinePresets,
} from "./data/presets";

import React, { useEffect, useMemo, useRef, useState } from "react";

if (typeof window !== "undefined") {
  const _hvacScrollOnLoad = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 900);
    }
  };
  if (document.readyState === "complete") {
    _hvacScrollOnLoad();
  } else {
    window.addEventListener("load", _hvacScrollOnLoad, { once: true });
  }
}
import {
  deleteUnit,
  listUnits,
  saveUnit,
  type Observation,
  type NameplateResult,
  type SavedUnitRecord,
} from "../lib/unit-store";

import {
  getObservationValue,
  analyzeCharge,
  analyzeAirflow,
  analyzeDefrost,
  buildDefrostRepairGuidance,
  parseDiagnosis,
  buildEquipmentMemoryInsight,
  buildServiceReportHtml,
  type Diagnosis,
} from "./lib/diagnosisAnalysis";

import {
  createCompanyForCurrentUser,
  createServiceEventForCurrentUser,
  listServiceEventsForCurrentUser,
  createUnitForCurrentUser,
  deleteUnitForCurrentUser,
  findStrongUnitMatchForCurrentUser,
  getCurrentUserMembership,
  listServiceEventsForUnitForCurrentUser,
  listUnitsForCurrentUser,
  updateServiceEventForCurrentUser,
  updateUnitForCurrentUser,
} from "../lib/supabase/work-orders";

type LinkItem = { title: string; url: string; note?: string };

type ManualsParts = {
  summary: string;
  suggested_search_terms: string[];
  manuals: LinkItem[];
  parts: LinkItem[];
  probable_parts_to_check: { part: string; why: string }[];
};

type FlowNode = {
  id: string;
  title: string;
  question: string;
  how?: string;
  passLabel?: string;
  failLabel?: string;
  passNext?: string | null;
  failNext?: string | null;
  hint?: string;
  suggestedMeasurement?: string;
  terminal?: boolean;
};

type SymptomPack = {
  id: string;
  label: string;
  defaultSymptom: string;
  nodes: FlowNode[];
};

type GaugeReadResult = {
  suction_psi: number | null;
  head_psi: number | null;
  low_sat_f: number | null;
  high_sat_f: number | null;
  quick_diagnosis: string;
  notes: string;
  confidence: "high" | "medium" | "low";
};

const SYMPTOM_PACKS: SymptomPack[] = [
  {
    id: "no_cooling",
    label: "No Cooling",
    defaultSymptom: "Unit not cooling. Space temperature stays high.",
    nodes: [
      {
        id: "a",
        title: "No Cooling",
        question: "Is there an active call for cooling?",
        how: "Verify thermostat / control board / Y signal.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Control Voltage (R-C)",
      },
      {
        id: "b",
        title: "Cooling Call",
        question: "Is the indoor blower moving adequate air?",
        how: "Check filter, blower, wheel, belt, speed, and airflow.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "External Static Pressure",
      },
      {
        id: "c",
        title: "Airflow",
        question: "Is the compressor and outdoor section running normally?",
        how: "Check contactor, capacitor, fan motor, amps, overload, and voltage.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d",
        failNext: "c_end",
        suggestedMeasurement: "Compressor Amps",
      },
      {
        id: "d",
        title: "Refrigeration",
        question: "Do pressures and line temps suggest charge / metering issues?",
        how: "Check suction, liquid, superheat, subcool, delta-T.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d_end",
        failNext: "e",
        suggestedMeasurement: "Suction Pressure",
      },
      {
        id: "e",
        title: "Controls / Load",
        question: "Is economizer / damper / control logic affecting capacity?",
        how: "Verify damper position, outside air, and staging logic.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "e_end",
        failNext: "f_end",
        suggestedMeasurement: "Return Air Temp",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question:
          "No cooling call found. Focus on thermostat, wiring, low voltage, or board logic.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question:
          "Airflow issue likely. Fix filter, coil, blower, belt, or static restriction first.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Electrical / compressor / condenser section issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Likely Direction",
        question:
          "Charge, metering, or restriction issue likely. Confirm with superheat/subcool.",
        terminal: true,
      },
      {
        id: "e_end",
        title: "Likely Direction",
        question: "Control / economizer / ventilation issue likely.",
        terminal: true,
      },
      {
        id: "f_end",
        title: "Done",
        question: "Collect more readings and run Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "freezing_up",
    label: "Freezing Up",
    defaultSymptom: "Evaporator / suction line freezing up.",
    nodes: [
      {
        id: "a",
        title: "Freezing Up",
        question: "Is airflow restricted?",
        how: "Check filter, blower, coil, registers, and static.",
        passLabel: "No",
        failLabel: "Yes",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "External Static Pressure",
      },
      {
        id: "b",
        title: "Airflow OK",
        question: "Is suction pressure low and superheat high?",
        how: "Check suction, line temp, saturation temp.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b_end",
        failNext: "c",
        suggestedMeasurement: "Superheat",
      },
      {
        id: "c",
        title: "Refrigeration",
        question: "Is TXV / metering device feeding poorly or hunting?",
        how: "Compare SH/SC and bulb / equalizer condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Subcool",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Airflow restriction likely caused the freeze-up.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Low charge or restriction likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Metering device issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Use more readings and Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "no_heat_gas",
    label: "No Heat (Gas)",
    defaultSymptom: "Gas heat not working.",
    nodes: [
      {
        id: "a",
        title: "No Heat",
        question: "Is there a call for heat?",
        how: "Verify W call and thermostat state.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Control Voltage (R-W)",
      },
      {
        id: "b",
        title: "Heat Call",
        question: "Does inducer start and pressure switch prove?",
        how: "Check venting, tubing, switch, draft.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Pressure Switch Status",
      },
      {
        id: "c",
        title: "Ignition",
        question: "Does the igniter light burners and does flame prove?",
        how: "Check igniter, gas valve, flame sensor µA.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d",
        failNext: "c_end",
        suggestedMeasurement: "Flame Sensor",
      },
      {
        id: "d",
        title: "Heat Delivery",
        question: "Is airflow / heat rise normal without tripping limit?",
        how: "Check heat rise, blower, filter, static.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d_end",
        failNext: "e_end",
        suggestedMeasurement: "Heat Rise",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "No heat call found. Focus on thermostat, wiring, or board.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Inducer / pressure switch / venting issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Ignition, gas valve, or flame proving issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Sequence is normal. Re-check complaint details and staging.",
        terminal: true,
      },
      {
        id: "e_end",
        title: "Likely Direction",
        question: "Airflow / limit trip issue likely.",
        terminal: true,
      },
    ],
  },
  {
    id: "box_warm_refrigeration",
    label: "Box Warm",
    defaultSymptom: "Refrigeration box temperature is too warm.",
    nodes: [
      {
        id: "a",
        title: "Box Warm",
        question: "Is the box temp above setpoint and calling for cooling?",
        how: "Verify thermostat/controller call and actual box temp.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Box Temp",
      },
      {
        id: "b",
        title: "Cooling Call",
        question: "Is the evaporator fan running and moving air?",
        how: "Check evaporator fan motors, blade rotation, door switch, and ice blockage.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Evap Coil Temp",
      },
      {
        id: "c",
        title: "Refrigeration Circuit",
        question: "Are suction/head readings consistent with normal refrigeration?",
        how: "Check suction pressure, head pressure, superheat, subcool, and line temps.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d",
        failNext: "c_end",
        suggestedMeasurement: "Suction Pressure",
      },
      {
        id: "d",
        title: "Box Load / Defrost",
        question: "Is defrost, door infiltration, or high product load causing the warm box?",
        how: "Check defrost operation, door gaskets, door openings, and product loading.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d_end",
        failNext: "e_end",
        suggestedMeasurement: "Defrost Timer State",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "No active cooling demand. Check control, sensor, or setpoint issue.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Evaporator airflow issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Charge, metering, compressor, or restriction issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Likely Direction",
        question: "Defrost, infiltration, or load issue likely.",
        terminal: true,
      },
      {
        id: "e_end",
        title: "Done",
        question: "Collect more readings and run Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "iced_evap",
    label: "Iced Evaporator",
    defaultSymptom: "Evaporator coil is iced up / frosted over.",
    nodes: [
      {
        id: "a",
        title: "Iced Coil",
        question: "Is evaporator airflow restricted?",
        how: "Check fan motors, fan blades, dirty coil, blocked discharge, and ice coverage.",
        passLabel: "No",
        failLabel: "Yes",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Evap Coil Temp",
      },
      {
        id: "b",
        title: "Airflow OK",
        question: "Is the system failing to defrost?",
        how: "Check timer/board, heaters, termination stat, and drain condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b_end",
        failNext: "c",
        suggestedMeasurement: "Defrost Heater Amps",
      },
      {
        id: "c",
        title: "Refrigeration Feed",
        question: "Do readings suggest low charge or underfeeding evaporator?",
        how: "Check suction pressure, superheat, and liquid feed condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Superheat",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Airflow problem likely caused the icing.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Defrost failure likely caused the icing.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Low charge, restriction, or metering issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Use more readings and Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "defrost_failure",
    label: "Defrost Failure",
    defaultSymptom: "Unit is not defrosting correctly.",
    nodes: [
      {
        id: "a",
        title: "Defrost Failure",
        question: "Is the unit entering defrost?",
        how: "Check timer, board, controller, and programmed schedule.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Defrost Timer State",
      },
      {
        id: "b",
        title: "In Defrost",
        question: "Are defrost heaters energized?",
        how: "Check heater amps, voltage, and continuity.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Defrost Heater Amps",
      },
      {
        id: "c",
        title: "Termination",
        question: "Is the termination control ending defrost correctly?",
        how: "Check termination stat / sensor and coil temp response.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Termination Stat State",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Defrost initiation control issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Defrost heater circuit issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Done",
        question:
          "Defrost sequence appears functional. Check load, infiltration, and drain issues.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Likely Direction",
        question: "Termination sensor / thermostat issue likely.",
        terminal: true,
      },
    ],
  },
  {
    id: "short_cycling_refrigeration",
    label: "Short Cycling",
    defaultSymptom: "Refrigeration system is short cycling.",
    nodes: [
      {
        id: "a",
        title: "Short Cycling",
        question: "Is control demand rapidly opening and closing?",
        how: "Check thermostat/controller differential and sensor placement.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "a_end",
        failNext: "b",
        suggestedMeasurement: "Box Temp",
      },
      {
        id: "b",
        title: "Compressor Cycling",
        question: "Is the compressor tripping on overload or protection?",
        how: "Check amps, voltage, capacitor, condenser airflow, and discharge conditions.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b_end",
        failNext: "c",
        suggestedMeasurement: "Compressor Amps",
      },
      {
        id: "c",
        title: "Pressure Related",
        question: "Are pressure controls or refrigeration conditions causing cycling?",
        how: "Check head pressure, suction pressure, low ambient control, and charge condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Head Pressure",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Controller / sensor / differential issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Compressor protection / electrical issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Pressure control, charge, airflow, or ambient issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Collect more readings and run Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "compressor_not_starting_ref",
    label: "Compressor Not Starting",
    defaultSymptom: "Refrigeration compressor will not start.",
    nodes: [
      {
        id: "a",
        title: "Compressor Not Starting",
        question: "Is there a call for cooling from the control?",
        how: "Check controller output, thermostat, contactor coil, and safeties.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Control Voltage (R-C)",
      },
      {
        id: "b",
        title: "Call Present",
        question: "Is line voltage present at the compressor circuit?",
        how: "Check disconnect, contactor, breaker, wiring, and overload path.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "c",
        title: "Electrical Start",
        question: "Are capacitor, relay, or compressor windings preventing start?",
        how: "Check capacitor, start components, winding resistance, and locked rotor condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Compressor Amps",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "No cooling call or control path issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Power supply / contactor / safety circuit issue likely.",
        terminal: true,
      },
       {
          id: "c_end",
          title: "Likely Direction",
          question: "Capacitor, relay, overload, or compressor failure likely.",
          terminal: true,
        },
        {
          id: "d_end",
          title: "Done",
          question: "Collect more electrical readings and run Diagnose again.",
          terminal: true,
        },
      ],
    },
    {
      id: "mini_split_no_cool",
    label: "Mini-Split No Cool",
    defaultSymptom: "Mini-split runs but does not cool properly.",
    nodes: [
      {
        id: "a",
        title: "Mini-Split No Cool",
        question: "Is the indoor unit blowing air and responding to the remote/controller?",
        how: "Check power, controller, mode setting, fan operation, and louvers.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Return Air Temp",
      },
      {
        id: "b",
        title: "Indoor Operation",
        question: "Is the outdoor unit running normally?",
        how: "Check disconnect, board, inverter startup, fan, compressor, and error lights.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "c",
        title: "Refrigeration",
        question: "Do temperatures and pressures suggest charge or flow problems?",
        how: "Check suction pressure, line temps, superheat, subcool, and coil condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d",
        suggestedMeasurement: "Suction Pressure",
      },
      {
        id: "d",
        title: "Airflow / Coil",
        question: "Is airflow or coil fouling reducing capacity?",
        how: "Check blower wheel, filter screens, coil cleanliness, and discharge temp split.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d_end",
        failNext: "e_end",
        suggestedMeasurement: "Supply Air Temp",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Indoor control / power / fan issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Outdoor electrical / board / inverter / compressor issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Charge, restriction, or refrigerant flow issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Likely Direction",
        question: "Indoor airflow or dirty coil issue likely.",
        terminal: true,
      },
      {
        id: "e_end",
        title: "Done",
        question: "Collect more readings and run Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "mini_split_no_heat",
    label: "Mini-Split No Heat",
    defaultSymptom: "Mini-split does not heat properly.",
    nodes: [
      {
        id: "a",
        title: "Mini-Split No Heat",
        question: "Is the unit definitely in heat mode and calling?",
        how: "Check controller mode, setpoint, standby delay, and ambient conditions.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Return Air Temp",
      },
      {
        id: "b",
        title: "Heating Call",
        question: "Is the outdoor unit entering normal heat operation?",
        how: "Check fan behavior, compressor operation, board lights, and line temps.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "c",
        title: "Capacity",
        question: "Do refrigerant readings and line temps suggest charge or flow issues?",
        how: "Check pressures, line temps, reversing valve behavior, and coil condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Suction Pressure",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Mode, control, or user setting issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Outdoor board / inverter / compressor / power issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Charge, reversing valve, or refrigeration issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Collect more readings and run Diagnose again for tighter guidance.",
        terminal: true,
      },
    ],
  },
  {
    id: "mini_split_water_leak",
    label: "Mini-Split Water Leak",
    defaultSymptom: "Mini-split indoor unit is leaking water.",
    nodes: [
      {
        id: "a",
        title: "Water Leak",
        question: "Is the drain line restricted or backing up?",
        how: "Check drain pan, drain hose, pump, pitch, and slime buildup.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "a_end",
        failNext: "b",
        suggestedMeasurement: "Evap Coil Temp",
      },
      {
        id: "b",
        title: "Drain Appears OK",
        question: "Is the evaporator icing and then melting off?",
        how: "Check airflow, coil cleanliness, fan speed, and refrigerant conditions.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b_end",
        failNext: "c_end",
        suggestedMeasurement: "Evap Coil Temp",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Drain blockage / slope / pump issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Freeze-up causing water overflow likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Done",
        question: "Inspect pan fit, cabinet seal, blower throw, and installation level.",
        terminal: true,
      },
    ],
  },
    {
    id: "mini_split_error_code",
    label: "Mini-Split Error Code",
    defaultSymptom: "Mini-split is showing an error code or fault light.",
    nodes: [
      {
        id: "a",
        title: "Error Code",
        question: "Do you have the exact code from the indoor or outdoor unit?",
        how: "Check display, blinking lights, board LEDs, and service manual lookup.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "a_end",
        failNext: "b",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "b",
        title: "No Exact Code",
        question: "Is there communication, board, or power instability?",
        how: "Check supply voltage, comm wiring, polarity, grounds, and board indicators.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b_end",
        failNext: "c_end",
        suggestedMeasurement: "Control Voltage (R-C)",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Use exact code plus model lookup for the fastest diagnosis path.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Communication / board / power issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Done",
        question: "Collect exact code, board lights, and model info, then rerun diagnosis.",
        terminal: true,
      },
    ],
  },
    {
    id: "ice_machine_not_making_ice",
    label: "Ice Machine Not Making Ice",
    defaultSymptom: "Ice machine is not producing ice.",
    nodes: [
      {
        id: "a",
        title: "Call for Ice",
        question: "Is the machine powered and calling for an ice-making cycle?",
        how: "Check control state, display, selector, bin control, and incoming power.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "b",
        title: "Water Supply",
        question: "Does the machine have proper water supply and fill?",
        how: "Check water inlet valve, filter, pressure, reservoir fill, and float behavior.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Water Fill Time",
      },
      {
        id: "c",
        title: "Refrigeration / Freeze Cycle",
        question: "Does the machine enter and maintain a normal freeze cycle?",
        how: "Check compressor, condenser airflow, freeze plate/evaporator temp, and ice formation.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d",
        failNext: "c_end",
        suggestedMeasurement: "Evap Coil Temp",
      },
      {
        id: "d",
        title: "Release / Harvest",
        question: "Does the ice release correctly during harvest?",
        how: "Check harvest assist, hot gas function if applicable, plate condition, and control timing.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d_end",
        failNext: "e_end",
        suggestedMeasurement: "Harvest Cycle Time",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Power, control, bin control, or machine enable issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Water supply, inlet valve, filter, or fill control issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Freeze cycle / refrigeration / condenser / compressor issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Basic ice-making sequence appears normal. Recheck complaint details and production expectations.",
        terminal: true,
      },
      {
        id: "e_end",
        title: "Likely Direction",
        question: "Harvest / release / plate / hot gas / control timing issue likely.",
        terminal: true,
      },
    ],
  },
  {
    id: "ice_machine_low_production",
    label: "Ice Machine Low Production",
    defaultSymptom: "Ice machine is making ice but production is low.",
    nodes: [
      {
        id: "a",
        title: "Low Production",
        question: "Is condenser airflow or heat rejection reduced?",
        how: "Check condenser coil, fan motor, water-cooled condenser flow if applicable, and ambient conditions.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "a_end",
        failNext: "b",
        suggestedMeasurement: "Head Pressure",
      },
      {
        id: "b",
        title: "Water System",
        question: "Is water distribution, fill, or scale affecting the freeze cycle?",
        how: "Check distributor, trough, float, fill valve, sump, and scale buildup.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b_end",
        failNext: "c",
        suggestedMeasurement: "Water Fill Time",
      },
      {
        id: "c",
        title: "Freeze Efficiency",
        question: "Are refrigeration readings and evaporator conditions normal for a strong freeze cycle?",
        how: "Check suction pressure, evap temp, ice thickness pattern, and cycle time.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d",
        failNext: "c_end",
        suggestedMeasurement: "Suction Pressure",
      },
      {
        id: "d",
        title: "Harvest Efficiency",
        question: "Is harvest taking too long or leaving incomplete release?",
        how: "Check harvest timing, plate condition, assist operation, and slab/cube release pattern.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "d_end",
        failNext: "e_end",
        suggestedMeasurement: "Harvest Cycle Time",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Condenser / ambient / heat rejection issue likely reducing production.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Water supply / scale / distribution issue likely reducing production.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Refrigeration / freeze cycle performance issue likely.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Likely Direction",
        question: "Harvest inefficiency likely causing low production.",
        terminal: true,
      },
      {
        id: "e_end",
        title: "Done",
        question: "Production issue may be load, ambient, maintenance, or setup related. Gather more cycle details.",
        terminal: true,
      },
    ],
  },
  {
    id: "ice_machine_harvest_problem",
    label: "Ice Machine Harvest Problem",
    defaultSymptom: "Ice machine freezes but has trouble harvesting or releasing ice.",
    nodes: [
      {
        id: "a",
        title: "Harvest Problem",
        question: "Is the machine entering harvest when expected?",
        how: "Check board timing, thermistor/sensor input, thickness control, and control sequence.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Harvest Cycle Time",
      },
      {
        id: "b",
        title: "Release Action",
        question: "Is the harvest assist / hot gas / release method functioning correctly?",
        how: "Check actuator, hot gas valve if applicable, water assist, and control output.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "c",
        title: "Mechanical Release",
        question: "Are scale, plate condition, or cube/slab formation preventing release?",
        how: "Inspect evaporator/plate surface, scale, bridging, thickness, and freeze pattern.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Evap Coil Temp",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Harvest initiation / board / sensor / thickness control issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Harvest assist / hot gas / release mechanism issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Likely Direction",
        question: "Scale, surface condition, or improper ice formation likely preventing harvest.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Done",
        question: "Harvest sequence appears mostly normal. Recheck cycle timing and complaint details.",
        terminal: true,
      },
    ],
  },
  {
    id: "ice_machine_water_fill_problem",
    label: "Ice Machine Water Fill Problem",
    defaultSymptom: "Ice machine is not filling correctly with water.",
    nodes: [
      {
        id: "a",
        title: "Water Fill Problem",
        question: "Is incoming water supply present and adequate?",
        how: "Check shutoff, filter, pressure, inlet screen, and supply line condition.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "b",
        failNext: "a_end",
        suggestedMeasurement: "Water Fill Time",
      },
      {
        id: "b",
        title: "Valve / Control",
        question: "Is the inlet valve being energized when the machine calls for fill?",
        how: "Check control output, valve coil voltage, and board sequence.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c",
        failNext: "b_end",
        suggestedMeasurement: "Line Voltage",
      },
      {
        id: "c",
        title: "Reservoir Response",
        question: "Is the float / level system responding correctly once water enters?",
        how: "Check float switch, reservoir, overflow, scale, and sticking components.",
        passLabel: "Yes",
        failLabel: "No",
        passNext: "c_end",
        failNext: "d_end",
        suggestedMeasurement: "Water Fill Time",
      },
      {
        id: "a_end",
        title: "Likely Direction",
        question: "Incoming water supply / filter / pressure issue likely.",
        terminal: true,
      },
      {
        id: "b_end",
        title: "Likely Direction",
        question: "Fill control / board / valve command issue likely.",
        terminal: true,
      },
      {
        id: "c_end",
        title: "Done",
        question: "Basic fill sequence appears normal. Recheck complaint details and actual cycle timing.",
        terminal: true,
      },
      {
        id: "d_end",
        title: "Likely Direction",
        question: "Float / reservoir / scale / level control issue likely.",
        terminal: true,
      },
    ],
  },
];

export default function HVACUnitsPage() {
  const { lang } = useLang();
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [unitNickname, setUnitNickname] = useState("");

  const [propertyType, setPropertyType] = useState("Commercial");
  const [equipmentType, setEquipmentType] = useState("RTU");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorCodeSource, setErrorCodeSource] = useState("Control Board");
  const [symptom, setSymptom] = useState("");

  const [finalConfirmedCause, setFinalConfirmedCause] = useState("");
  const [partsReplaced, setPartsReplaced] = useState("");
  const [actualFixPerformed, setActualFixPerformed] = useState("");
  const [outcomeStatus, setOutcomeStatus] = useState("Not Set");
  const [callbackOccurred, setCallbackOccurred] = useState("No");
  const [techCloseoutNotes, setTechCloseoutNotes] = useState("");

  const [refrigerantType, setRefrigerantType] = useState<string>("Unknown");

  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [observations, setObservations] = useState<Observation[]>([]);
  const [obsLabel, setObsLabel] = useState("");
  const [obsValue, setObsValue] = useState("");
  const [obsUnit, setObsUnit] = useState("psi");
  const [obsNote, setObsNote] = useState("");
  const [autoConvert, setAutoConvert] = useState(true);

  const [nameplateImage, setNameplateImage] = useState("");
  const [nameplate, setNameplate] = useState<NameplateResult | null>(null);
  const [nameplateBusy, setNameplateBusy] = useState(false);
  const [nameplateErr, setNameplateErr] = useState("");

  const [mpBusy, setMpBusy] = useState(false);
  const [mpErr, setMpErr] = useState("");
  const [manualsParts, setManualsParts] = useState<ManualsParts | null>(null);

  const [photoImage, setPhotoImage] = useState("");
  const [photoResult, setPhotoResult] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [gaugeImage, setGaugeImage] = useState("");
  const [gaugeBusy, setGaugeBusy] = useState(false);
  const [gaugeErr, setGaugeErr] = useState("");
  const [gaugeRead, setGaugeRead] = useState<GaugeReadResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const gaugeInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedPackId, setSelectedPackId] = useState("no_cooling");
  const selectedPack = useMemo(
    () => SYMPTOM_PACKS.find((p) => p.id === selectedPackId) || SYMPTOM_PACKS[0],
    [selectedPackId]
  );
  const [flowNodeId, setFlowNodeId] = useState<string>(selectedPack.nodes[0]?.id || "");
  const [flowHistory, setFlowHistory] = useState<
    { nodeId: string; choice: "PASS" | "FAIL"; nextId: string | null }[]
  >([]);

  const [savedUnits, setSavedUnits] = useState<SavedUnitRecord[]>([]);

  const [currentLoadedUnitId, setCurrentLoadedUnitId] = useState<string>("");

  const [serviceDate, setServiceDate] = useState(
  new Date().toISOString().slice(0, 10)
);

  const [showUnitLibrary, setShowUnitLibrary] = useState(false);
const [showSavedUnitHistory, setShowSavedUnitHistory] = useState(false);
  const [unitLibrarySearch, setUnitLibrarySearch] = useState("");
  const [unitLibraryMode, setUnitLibraryMode] = useState<"recent" | "all">("recent");
  const [unitLibraryDateFrom, setUnitLibraryDateFrom] = useState("");
  const [unitLibraryDateTo, setUnitLibraryDateTo] = useState("");

  const [unitLibraryEquipmentType, setUnitLibraryEquipmentType] = useState("");
  const [unitLibraryManufacturer, setUnitLibraryManufacturer] = useState("");
  const [unitLibraryModel, setUnitLibraryModel] = useState("");
  const [unitLibraryCompany, setUnitLibraryCompany] = useState("");

  const [showUnitProfile, setShowUnitProfile] = useState(false);
  const [unitProfileUnit, setUnitProfileUnit] = useState<SavedUnitRecord | null>(null);
  const [unitProfileTimeline, setUnitProfileTimeline] = useState<
  import("../lib/supabase/work-orders").ServiceEventRow[]
>([]);
  const [unitProfileLoading, setUnitProfileLoading] = useState(false);
  const [unitProfileMessage, setUnitProfileMessage] = useState("");

  const [unitServiceTimeline, setUnitServiceTimeline] = useState<
  import("../lib/supabase/work-orders").ServiceEventRow[]
>([]);
  const [unitServiceTimelineLoading, setUnitServiceTimelineLoading] = useState(false);
  const [unitServiceTimelineMessage, setUnitServiceTimelineMessage] = useState("");

// system-structure-state-v2
const [systemType, setSystemType] = useState<
  "single" | "split_system" | "furnace_ac" | "heat_pump_air_handler" | "walk_in" | "mini_split" | "other_multi"
>("single");
const [primaryComponentRole, setPrimaryComponentRole] = useState("unit");
const [primaryTagStatus, setPrimaryTagStatus] = useState<"readable" | "partial" | "unreadable">("readable");
const [primaryTagIssueReason, setPrimaryTagIssueReason] = useState("");
const [primaryCheckedInsideForInternalLabel, setPrimaryCheckedInsideForInternalLabel] = useState(false);

const [linkedEquipmentComponents, setLinkedEquipmentComponents] = useState<
  Array<{
    id: string;
    role: string;
    tag: string;
    manufacturer: string;
    model: string;
    serial: string;
    tagStatus: "readable" | "partial" | "unreadable";
    tagIssueReason: string;
    checkedInsideForInternalLabel: boolean;
  }>
>([]);

const systemStructureDefaults: Record<
  string,
  { primaryRole: string; linkedRole: string; linkedLabel: string }
> = {
  single: { primaryRole: "unit", linkedRole: "linked_component", linkedLabel: "Linked Component" },
  split_system: { primaryRole: "outdoor_unit", linkedRole: "indoor_unit", linkedLabel: "Indoor Unit" },
  furnace_ac: { primaryRole: "outdoor_unit", linkedRole: "furnace", linkedLabel: "Furnace" },
  heat_pump_air_handler: { primaryRole: "outdoor_unit", linkedRole: "air_handler", linkedLabel: "Air Handler" },
  walk_in: { primaryRole: "condensing_unit", linkedRole: "evaporator", linkedLabel: "Evaporator" },
  mini_split: { primaryRole: "outdoor_unit", linkedRole: "indoor_head", linkedLabel: "Indoor Head" },
  other_multi: { primaryRole: "primary_component", linkedRole: "linked_component", linkedLabel: "Linked Component" },
};

const linkedEquipmentRoleOptions = [
  { value: "linked_component", label: "Linked Component" },
  { value: "indoor_unit", label: "Indoor Unit" },
  { value: "outdoor_unit", label: "Outdoor Unit" },
  { value: "furnace", label: "Furnace" },
  { value: "air_handler", label: "Air Handler" },
  { value: "condensing_unit", label: "Condensing Unit" },
  { value: "evaporator", label: "Evaporator" },
  { value: "indoor_head", label: "Indoor Head" },
  { value: "other", label: "Other" },
] as const;

const ROLE_LABEL_KEYS: Record<string, TranslationKey> = {
  "Linked Component": "role_linked_component",
  "Indoor Unit": "role_indoor_unit",
  "Outdoor Unit": "role_outdoor_unit",
  "Furnace": "role_furnace",
  "Air Handler": "role_air_handler",
  "Condensing Unit": "role_condensing_unit",
  "Evaporator": "role_evaporator",
  "Indoor Head": "role_indoor_head",
  "Other": "role_other",
};
function translateRoleLabel(label: string, lang: Language): string {
  const key = ROLE_LABEL_KEYS[label];
  return key ? t(key, lang) : label;
}

const SYMPTOM_PACK_LABEL_KEYS: Record<string, TranslationKey> = {
  "No Cooling": "pack_no_cooling",
  "Freezing Up": "pack_freezing_up",
  "No Heat (Gas)": "pack_no_heat_gas",
  "Box Warm": "pack_box_warm",
  "Iced Evaporator": "pack_iced_evaporator",
  "Defrost Failure": "pack_defrost_failure",
  "Short Cycling": "pack_short_cycling",
  "Compressor Not Starting": "pack_compressor_not_starting",
  "Mini-Split No Cool": "pack_minisplit_no_cool",
  "Mini-Split No Heat": "pack_minisplit_no_heat",
  "Mini-Split Water Leak": "pack_minisplit_water_leak",
  "Mini-Split Error Code": "pack_minisplit_error_code",
  "Ice Machine Not Making Ice": "pack_ice_not_making",
  "Ice Machine Low Production": "pack_ice_low_production",
  "Ice Machine Harvest Problem": "pack_ice_harvest_problem",
  "Ice Machine Water Fill Problem": "pack_ice_water_fill_problem",
};
function translateSymptomPackLabel(label: string, lang: Language): string {
  const key = SYMPTOM_PACK_LABEL_KEYS[label];
  return key ? t(key, lang) : label;
}

const addLinkedEquipmentComponent = (roleOverride?: string) => {
  const defaults = systemStructureDefaults[systemType] || systemStructureDefaults.single;
  const nextRole = roleOverride || defaults.linkedRole;
  setLinkedEquipmentComponents((prev) => [
    ...prev,
    {
      id: `${Date.now()}-${prev.length + 1}`,
      role: nextRole,
      tag: "",
      manufacturer: "",
      model: "",
      serial: "",
      tagStatus: "readable",
      tagIssueReason: "",
      checkedInsideForInternalLabel: false,
    },
  ]);
};

const updateLinkedEquipmentComponent = (
  id: string,
  field:
    | "role"
    | "tag"
    | "manufacturer"
    | "model"
    | "serial"
    | "tagStatus"
    | "tagIssueReason"
    | "checkedInsideForInternalLabel",
  value: string | boolean
) => {
  setLinkedEquipmentComponents((prev) =>
    prev.map((component) =>
      component.id === id
        ? ({
            ...component,
            [field]: value,
          } as typeof component)
        : component
    )
  );
};

const removeLinkedEquipmentComponent = (id: string) => {
  setLinkedEquipmentComponents((prev) => prev.filter((component) => component.id !== id));
};


// paired-equipment-state-v2
const [pairedEquipmentType, setPairedEquipmentType] = useState("none");
const [secondaryUnitTag, setSecondaryUnitTag] = useState("");
const [unitTagStatus, setUnitTagStatus] = useState<"readable" | "partial" | "unreadable">("readable");
const [tagIssueReason, setTagIssueReason] = useState("");
const [checkedInsideForInternalLabel, setCheckedInsideForInternalLabel] = useState(false);

        // linked-equipment-overlay-v3
      type LinkedEquipmentOverlayRecord = Pick<
        SavedUnitRecord,
        | "systemType"
        | "primaryComponentRole"
        | "primaryTagStatus"
        | "primaryTagIssueReason"
        | "primaryCheckedInsideForInternalLabel"
        | "linkedEquipmentComponents"
      >;

      const LINKED_EQUIPMENT_OVERLAY_KEY = "skilled_trades_ai_linked_equipment_overlay_v3";

      function loadLinkedEquipmentOverlayMap(): Record<string, LinkedEquipmentOverlayRecord> {
        if (typeof window === "undefined") return {};
        try {
          const raw = localStorage.getItem(LINKED_EQUIPMENT_OVERLAY_KEY);
          if (!raw) return {};
          const parsed = JSON.parse(raw);
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      }

      function saveLinkedEquipmentOverlayMap(map: Record<string, LinkedEquipmentOverlayRecord>) {
        if (typeof window === "undefined") return;
        localStorage.setItem(LINKED_EQUIPMENT_OVERLAY_KEY, JSON.stringify(map));
      }

      function buildLinkedEquipmentOverlay(): LinkedEquipmentOverlayRecord {
        return {
          systemType,
          primaryComponentRole,
          primaryTagStatus,
          primaryTagIssueReason,
          primaryCheckedInsideForInternalLabel,
          linkedEquipmentComponents: Array.isArray(linkedEquipmentComponents)
            ? linkedEquipmentComponents.map((component) => ({ ...component }))
            : [],
        };
      }

      function saveLinkedEquipmentOverlayForUnit(unitId: string) {
        if (!unitId) return;
        const map = loadLinkedEquipmentOverlayMap();
        map[unitId] = buildLinkedEquipmentOverlay();
        saveLinkedEquipmentOverlayMap(map);
      }

      function mergeLinkedEquipmentOverlayIntoSavedUnit(record: SavedUnitRecord): SavedUnitRecord {
        const map = loadLinkedEquipmentOverlayMap();
        const overlay = map[record.id];
        if (!overlay) return record;
        return {
          ...record,
          ...overlay,
          linkedEquipmentComponents: Array.isArray(overlay.linkedEquipmentComponents)
            ? overlay.linkedEquipmentComponents.map((component) => ({ ...component }))
            : [],
        };
      }

      function mergeLinkedEquipmentOverlays(records: SavedUnitRecord[]): SavedUnitRecord[] {
        return records.map((record) => mergeLinkedEquipmentOverlayIntoSavedUnit(record));
      }

      // affected-component-overlay-v1
      const [affectedComponentId, setAffectedComponentId] = useState("");
      const [affectedComponentLabel, setAffectedComponentLabel] = useState("");

      type AffectedComponentOverlayRecord = {
        affectedComponentId: string;
        affectedComponentLabel: string;
      };

      const AFFECTED_COMPONENT_OVERLAY_KEY = "skilled_trades_ai_affected_component_overlay_v1";

      function loadAffectedComponentOverlayMap(): Record<string, AffectedComponentOverlayRecord> {
        if (typeof window === "undefined") return {};
        try {
          const raw = localStorage.getItem(AFFECTED_COMPONENT_OVERLAY_KEY);
          if (!raw) return {};
          const parsed = JSON.parse(raw);
          return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
          return {};
        }
      }

      function saveAffectedComponentOverlayMap(map: Record<string, AffectedComponentOverlayRecord>) {
        if (typeof window === "undefined") return;
        localStorage.setItem(AFFECTED_COMPONENT_OVERLAY_KEY, JSON.stringify(map));
      }

      function getPrimaryAffectedComponentLabel() {
        const roleLabel =
          primaryComponentRole
            ? primaryComponentRole.replaceAll("_", " ")
            : "primary component";

        const detail = [
          unitNickname || "",
          manufacturer || "",
          model || "",
          serialNumber || "",
        ].filter(Boolean).join(" • ");

        return detail ? `${roleLabel} — ${detail}` : roleLabel;
      }

      function getAffectedComponentOptions(): Array<{ id: string; label: string }> {
        const options: Array<{ id: string; label: string }> = [
          {
            id: "primary",
            label: getPrimaryAffectedComponentLabel(),
          },
        ];

        if (Array.isArray(linkedEquipmentComponents)) {
          for (const component of linkedEquipmentComponents) {
            const labelBits = [
              component.role ? String(component.role).replaceAll("_", " ") : "linked component",
              component.tag || "",
              component.manufacturer || "",
              component.model || "",
              component.serial || "",
            ].filter(Boolean);

            options.push({
              id: String(component.id || ""),
              label: labelBits.join(" • "),
            });
          }
        }

        return options.filter((option) => option.id && option.label);
      }

      function resolveAffectedComponentSelection() {
        const options = getAffectedComponentOptions();

        if (affectedComponentId.trim()) {
          const selected = options.find((option) => option.id === affectedComponentId.trim());
          return {
            id: affectedComponentId.trim(),
            label: affectedComponentLabel.trim() || selected?.label || affectedComponentId.trim(),
          };
        }

        if (systemType === "single" && options.length) {
          return options[0];
        }

        return { id: "", label: "" };
      }

      function saveAffectedComponentOverlayForEvent(eventId: string, componentId: string, componentLabel: string) {
        if (!eventId) return;
        const map = loadAffectedComponentOverlayMap();
        map[eventId] = {
          affectedComponentId: componentId,
          affectedComponentLabel: componentLabel,
        };
        saveAffectedComponentOverlayMap(map);
      }

      function getAffectedComponentOverlayForEvent(eventId: string) {
        if (!eventId) return null;
        const map = loadAffectedComponentOverlayMap();
        return map[eventId] || null;
      }

      function getAffectedComponentDisplayForEvent(event: any) {
        if (!event?.id) return "";
        const overlay = getAffectedComponentOverlayForEvent(String(event.id));
        return overlay?.affectedComponentLabel || "";
      }

      // component-filter-helpers-v1
      const [unitProfileTimelineComponentFilter, setUnitProfileTimelineComponentFilter] = useState("all");

      function normalizeComponentFilterValue(value: string) {
        return String(value || "").trim().toLowerCase();
      }

      function getTimelineComponentFilterOptions(events: any[]) {
        const seen = new Set<string>();
        const options: Array<{ value: string; label: string }> = [
          { value: "all", label: "All components" },
        ];

        for (const event of Array.isArray(events) ? events : []) {
          const label = getAffectedComponentDisplayForEvent(event);
          if (!label) continue;
          const value = normalizeComponentFilterValue(label);
          if (!value || seen.has(value)) continue;
          seen.add(value);
          options.push({ value, label });
        }

        return options;
      }

      function timelineEventMatchesComponentFilter(event: any, filterValue: string) {
        const normalizedFilter = normalizeComponentFilterValue(filterValue);
        if (!normalizedFilter || normalizedFilter === "all") return true;
        const label = getAffectedComponentDisplayForEvent(event);
        return normalizeComponentFilterValue(label) === normalizedFilter;
      }

      // component-aware-parts-manuals-helpers-v1
      function normalizeComponentAssistText(value: unknown) {
        return String(value || "").trim().toLowerCase();
      }

      function getCurrentAffectedComponentLabelForAssist() {
        return String(affectedComponentLabel || "").trim() || getPrimaryAffectedComponentLabel();
      }

      function getSameComponentHistoryForAssist() {
        const allEvents = Array.isArray(unitServiceTimeline) ? unitServiceTimeline : [];
        if (systemType === "single") return allEvents;

        const selectedLabel = String(affectedComponentLabel || "").trim();
        if (!selectedLabel) return [];

        return allEvents.filter((event) => {
          const label = String(getAffectedComponentDisplayForEvent(event) || "").trim();
          return label === selectedLabel;
        });
      }

      function getRecentSameComponentPartsForAssist() {
        const history = getSameComponentHistoryForAssist();
        const seen = new Set<string>();
        const parts: string[] = [];

        for (const event of history) {
          const raw = String(event?.parts_replaced || "").trim();
          if (!raw) continue;

          for (const part of raw.split(/[;,]/)) {
            const cleaned = part.trim();
            const key = cleaned.toLowerCase();
            if (!cleaned || seen.has(key)) continue;
            seen.add(key);
            parts.push(cleaned);
          }
        }

        return parts.slice(0, 6);
      }

      function getMostRecentSameComponentFixForAssist() {
        const history = getSameComponentHistoryForAssist();
        if (!history.length) return "";
        const sorted = [...history].sort((a, b) => {
          const aTime = a?.service_date ? new Date(String(a.service_date)).getTime() : 0;
          const bTime = b?.service_date ? new Date(String(b.service_date)).getTime() : 0;
          return bTime - aTime;
        });
        return String(sorted[0]?.actual_fix_performed || "").trim();
      }

      function uniqueAssistList(items: string[]) {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const item of items) {
          const cleaned = item.trim();
          const key = cleaned.toLowerCase();
          if (!cleaned || seen.has(key)) continue;
          seen.add(key);
          out.push(cleaned);
        }
        return out;
      }

      // component-aware-troubleshooting-helpers-v1
      function getSameComponentHistoryForTroubleshooting() {
        const allEvents = Array.isArray(unitServiceTimeline) ? unitServiceTimeline : [];
        if (systemType === "single") return allEvents;

        const selectedLabel = String(affectedComponentLabel || "").trim();
        if (!selectedLabel) return [];

        return allEvents.filter((event) => {
          const label = String(getAffectedComponentDisplayForEvent(event) || "").trim();
          return label === selectedLabel;
        });
      }

      function getComponentAwareWarningSignals() {
        const history = getSameComponentHistoryForTroubleshooting();
        const warnings: string[] = [];

        const symptomCounts: Record<string, number> = {};
        for (const event of history) {
          const symptomValue = String(event?.symptom || "").trim();
          if (!symptomValue) continue;
          const key = symptomValue.toLowerCase();
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }

        Object.entries(symptomCounts).forEach(([symptomValue, count]) => {
          if (count >= 2) {
            warnings.push(
              t("caw_repeat_symptom", lang).replace("{symptom}", symptomValue).replace("{count}", String(count))
            );
          }
        });

        const callbackCount = history.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        if (callbackCount >= 1) {
          warnings.push(t("caw_callback_history", lang).replace("{count}", String(callbackCount)));
        }

        const recentParts = getRecentSameComponentPartsForAssist();
        if (recentParts.length >= 2) {
          warnings.push(t("caw_multiple_parts", lang).replace("{value}", recentParts.join(" • ")));
        }

        return warnings.slice(0, 6);
      }

      // smart-readings-parser-helpers-v1
      const [smartReadingsInput, setSmartReadingsInput] = useState("");
      const [smartReadingsListening, setSmartReadingsListening] = useState(false);
      const [smartReadingsMessage, setSmartReadingsMessage] = useState("");

      function parseSmartReadingsInput(input: string) {
        const text = String(input || "").toLowerCase();

        const findValue = (patterns: RegExp[]) => {
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
              return match[1];
            }
          }
          return null;
        };

        return {
          suctionPressure: findValue([
            // broader-parser-vocabulary-v1
            /(?:suction\s*pressure|suction\s*psi|suction|low\s*side\s*pressure|low\s*side\s*psi|low\s*side|low\s*pressure|low\s*psi|low)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:psi)?\s*(?:on\s*)?(?:suction|low\s*side|low)\b/i,
          ]),
          headPressure: findValue([
            /(?:head\s*pressure|head\s*psi|head|high\s*side\s*pressure|high\s*side\s*psi|high\s*side|high\s*pressure|high\s*psi|high|discharge\s*pressure|discharge\s*psi|discharge)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:psi)?\s*(?:on\s*)?(?:head|high\s*side|high|discharge)\b/i,
          ]),
          superheat: findValue([
            /(?:superheat|sh)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:of\s*)?(?:superheat|sh)\b/i,
          ]),
          subcool: findValue([
            /(?:subcool|sub\s*cool|sc|subcooling)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:of\s*)?(?:subcool|sub\s*cool|sc|subcooling)\b/i,
          ]),
          suctionTemp: findValue([
            /(?:suction\s*temp|suction\s*line\s*temp|suction\s*line|vapor\s*line\s*temp|vapor\s*line|slt)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:on\s*)?(?:suction\s*line|suction\s*temp|vapor\s*line|slt)\b/i,
          ]),
          liquidTemp: findValue([
            /(?:liquid\s*temp|liquid\s*line\s*temp|liquid\s*line|llt)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:on\s*)?(?:liquid\s*line|liquid\s*temp|llt)\b/i,
          ]),
          returnAir: findValue([
            /(?:return\s*air\s*temp|return\s*air|return\s*temp|return)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:return\s*air|return\s*temp|return)\b/i,
          ]),
          supplyAir: findValue([
            /(?:supply\s*air\s*temp|supply\s*air|supply\s*temp|supply)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:supply\s*air|supply\s*temp|supply)\b/i,
          ]),
          boxTemp: findValue([
            /(?:box\s*temp|box|space\s*temp|case\s*temp|room\s*temp|beer\s*temp|product\s*temp)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:box|box\s*temp|space\s*temp|case\s*temp|room\s*temp|beer\s*temp|product\s*temp)\b/i,
          ]),
          ambientTemp: findValue([
            /(?:ambient\s*temp|ambient|outside\s*temp|outdoor\s*ambient|outdoor\s*temp|oa\s*temp)\s*(?:is|at|of)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
            /(-?\d+(?:\.\d+)?)\s*(?:degrees?|°f|f)?\s*(?:ambient|outside\s*temp|outdoor\s*ambient|outdoor\s*temp|oa\s*temp)\b/i,
          ]),
        };
      }

      function applySmartReadingsParser(inputOverride?: string) {
        // smart-readings-parser-observations-v1
        // smart-readings-auto-parse-v1
        // smart-readings-preview-v2
        const parserInput =
          typeof inputOverride === "string" ? inputOverride : smartReadingsInput;
        const parsed = parseSmartReadingsInput(parserInput);
        const applied: string[] = [];

        const observationDefinitions = [
          { key: "suctionPressure", label: "Suction Pressure", unit: "psi" },
          { key: "headPressure", label: "Head Pressure", unit: "psi" },
          { key: "superheat", label: "Superheat", unit: "°F" },
          { key: "subcool", label: "Subcool", unit: "°F" },
          { key: "suctionTemp", label: "Suction Line Temp", unit: "°F" },
          { key: "liquidTemp", label: "Liquid Line Temp", unit: "°F" },
          { key: "returnAir", label: "Return Air Temp", unit: "°F" },
          { key: "supplyAir", label: "Supply Air Temp", unit: "°F" },
          { key: "boxTemp", label: "Box Temp", unit: "°F" },
          { key: "ambientTemp", label: "Ambient Temp", unit: "°F" },
        ] as const;

        const parsedObservationRows = observationDefinitions
          .map((definition) => {
            const value = parsed[definition.key as keyof typeof parsed];
            if (value === null || value === undefined || String(value).trim() === "") return null;

            applied.push(`${definition.label}: ${value}`);

            return {
              label: definition.label,
              value: String(value),
              unit: definition.unit,
              note: "Added by Smart Readings Parser",
            };
          })
          .filter(Boolean) as Observation[];

        if (!applied.length) {
          setSmartReadingsPreviewRows([]);
          setSmartReadingsMessage(
            "Nothing was recognized. Try entries like: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58 box 10"
          );
          return;
        }

        setSmartReadingsPreviewRows(parsedObservationRows);
        setSmartReadingsMessage("Preview ready: " + applied.join(" • "));
      }

function clearSmartReadingsParser() {
        setSmartReadingsInput("");
        setSmartReadingsMessage("");
        setSmartReadingsPreviewRows([]);
      }

function browserSupportsSmartReadingsDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startSmartReadingsDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setSmartReadingsMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__smartReadingsRecognition && smartReadingsListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__smartReadingsRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setSmartReadingsListening(true);
            setSmartReadingsMessage(
              "Listening... say readings like suction 50 head 175 superheat 18 subcool 7"
            );
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            const nextText = [String(smartReadingsInput || "").trim(), cleaned]
              .filter(Boolean)
              .join(" ");

            setSmartReadingsInput(nextText);
            applySmartReadingsParser(nextText);
            setSmartReadingsMessage(
              "Dictation captured and auto-parsed. Review the parser result below."
            );
          };

          recognition.onerror = (event: any) => {
            setSmartReadingsListening(false);
            w.__smartReadingsRecognition = null;
            setSmartReadingsMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setSmartReadingsListening(false);
            w.__smartReadingsRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setSmartReadingsListening(false);
          (window as any).__smartReadingsRecognition = null;
          setSmartReadingsMessage("Could not start dictation.");
          console.error("SMART READINGS DICTATION FAILED", err);
        }
      }

      function stopSmartReadingsDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__smartReadingsRecognition) {
          try {
            w.__smartReadingsRecognition.stop();
          } catch (err) {
            console.error("SMART READINGS DICTATION STOP FAILED", err);
          }
        }
        setSmartReadingsListening(false);
      }

      // smart-readings-undo-v1
      const [smartReadingsUndoSnapshot, setSmartReadingsUndoSnapshot] = useState<Observation[] | null>(null);

      function undoLastSmartReadingsParse() {
        if (!smartReadingsUndoSnapshot) {
          setSmartReadingsMessage("No parsed readings to undo.");
          return;
        }

        setObservations(
          Array.isArray(smartReadingsUndoSnapshot)
            ? smartReadingsUndoSnapshot.map((item) => ({ ...item }))
            : []
        );
        setSmartReadingsUndoSnapshot(null);
        setSmartReadingsMessage("Last parsed readings were undone.");
      }

      // smart-readings-preview-v2
      const [smartReadingsPreviewRows, setSmartReadingsPreviewRows] = useState<Observation[]>([]);

      function mergeSmartReadingRows(
        base: Observation[],
        rows: Observation[]
      ): Observation[] {
        const next = [...base];

        for (const row of rows) {
          const normalizedLabel = row.label.trim().toLowerCase();
          const existingIndex = next.findIndex(
            (item) => String(item?.label || "").trim().toLowerCase() === normalizedLabel
          );

          if (existingIndex >= 0) {
            next[existingIndex] = row;
          } else {
            next.push(row);
          }
        }

        return next;
      }

      function applySmartReadingsPreview() {
        if (!smartReadingsPreviewRows.length) {
          setSmartReadingsMessage("No parsed readings are waiting for confirmation.");
          return;
        }

        setSmartReadingsUndoSnapshot(
          Array.isArray(observations) ? observations.map((item) => ({ ...item })) : []
        );

        setObservations((prev) => mergeSmartReadingRows(prev, smartReadingsPreviewRows));
        setSmartReadingsMessage(
          "Applied to observations: " +
            smartReadingsPreviewRows
              .map((row) => `${row.label}: ${row.value}${row.unit ? ` ${row.unit}` : ""}`)
              .join(" • ")
        );
        setSmartReadingsPreviewRows([]);
      }

      function cancelSmartReadingsPreview() {
        setSmartReadingsPreviewRows([]);
        setSmartReadingsMessage("Parsed readings preview cleared.");
      }

      // closeout-note-dictation-v1
      const [techCloseoutListening, setTechCloseoutListening] = useState(false);
      const [techCloseoutDictationMessage, setTechCloseoutDictationMessage] = useState("");

      function startTechCloseoutDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setTechCloseoutDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__techCloseoutRecognition && techCloseoutListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__techCloseoutRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setTechCloseoutListening(true);
            setTechCloseoutDictationMessage(
              "Listening... describe what you found, what you replaced, and how the equipment performed after repair."
            );
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setTechCloseoutNotes((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setTechCloseoutDictationMessage(
              "Dictation captured and added to Tech Closeout Notes."
            );
          };

          recognition.onerror = (event: any) => {
            setTechCloseoutListening(false);
            w.__techCloseoutRecognition = null;
            setTechCloseoutDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setTechCloseoutListening(false);
            w.__techCloseoutRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setTechCloseoutListening(false);
          (window as any).__techCloseoutRecognition = null;
          setTechCloseoutDictationMessage("Could not start dictation.");
          console.error("TECH CLOSEOUT DICTATION FAILED", err);
        }
      }

      function stopTechCloseoutDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__techCloseoutRecognition) {
          try {
            w.__techCloseoutRecognition.stop();
          } catch (err) {
            console.error("TECH CLOSEOUT DICTATION STOP FAILED", err);
          }
        }
        setTechCloseoutListening(false);
      }

      // unit-profile-component-intelligence-helpers-v3
      function getTopCountEntry(counts: Record<string, number>) {
        const entries = Object.entries(counts).filter(([key]) => key.trim());
        if (!entries.length) return "";
        entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
        return entries[0][0];
      }

      function buildUnitProfileComponentIntelligence() {
        const events = Array.isArray(unitProfileTimeline) ? unitProfileTimeline : [];
        const groups: Record<
          string,
          {
            label: string;
            eventCount: number;
            callbackCount: number;
            lastServiceDate: string;
            symptomCounts: Record<string, number>;
            causeCounts: Record<string, number>;
            fixCounts: Record<string, number>;
            partCounts: Record<string, number>;
          }
        > = {};

        const primaryLabel =
          (unitProfileUnit?.unitNickname
            ? t("label_primary_component_dash", lang).replace("{value}", unitProfileUnit.unitNickname)
            : t("fallback_primary_component", lang));

        for (const event of events) {
          const label = String(
            getAffectedComponentDisplayForEvent(event) ||
              event?.affected_component_label_snapshot ||
              primaryLabel
          ).trim() || primaryLabel;

          if (!groups[label]) {
            groups[label] = {
              label,
              eventCount: 0,
              callbackCount: 0,
              lastServiceDate: "",
              symptomCounts: {},
              causeCounts: {},
              fixCounts: {},
              partCounts: {},
            };
          }

          const group = groups[label];
          group.eventCount += 1;

          const callbackValue = String(event?.callback_occurred || "").trim().toLowerCase();
          if (callbackValue === "yes" || callbackValue === "true") {
            group.callbackCount += 1;
          }

          const serviceDate = String(event?.service_date || "").trim();
          if (serviceDate) {
            if (!group.lastServiceDate) {
              group.lastServiceDate = serviceDate;
            } else {
              const currentMs = new Date(group.lastServiceDate).getTime();
              const nextMs = new Date(serviceDate).getTime();
              if (Number.isFinite(nextMs) && nextMs > currentMs) {
                group.lastServiceDate = serviceDate;
              }
            }
          }

          const symptom = String(event?.symptom || "").trim();
          const cause = String(event?.final_confirmed_cause || "").trim();
          const fix = String(event?.actual_fix_performed || "").trim();
          const parts = String(event?.parts_replaced || "").trim();

          if (symptom) {
            group.symptomCounts[symptom] = (group.symptomCounts[symptom] || 0) + 1;
          }

          if (cause) {
            group.causeCounts[cause] = (group.causeCounts[cause] || 0) + 1;
          }

          if (fix) {
            group.fixCounts[fix] = (group.fixCounts[fix] || 0) + 1;
          }

          if (parts) {
            for (const rawPart of parts.split(/[;,]/)) {
              const part = rawPart.trim();
              if (!part) continue;
              group.partCounts[part] = (group.partCounts[part] || 0) + 1;
            }
          }
        }

        return Object.values(groups)
          .map((group) => ({
            ...group,
            topSymptom: getTopCountEntry(group.symptomCounts),
            topCause: getTopCountEntry(group.causeCounts),
            topFix: getTopCountEntry(group.fixCounts),
            topPart: getTopCountEntry(group.partCounts),
          }))
          .sort((a, b) => {
            const callbackDiff = b.callbackCount - a.callbackCount;
            if (callbackDiff) return callbackDiff;
            const eventDiff = b.eventCount - a.eventCount;
            if (eventDiff) return eventDiff;
            const aMs = a.lastServiceDate ? new Date(a.lastServiceDate).getTime() : 0;
            const bMs = b.lastServiceDate ? new Date(b.lastServiceDate).getTime() : 0;
            return bMs - aMs;
          });
      }

      // failure-intelligence-dashboard-v1
      const [failureDashboardEvents, setFailureDashboardEvents] = useState<
        import("../lib/supabase/work-orders").ServiceEventRow[]
      >([]);
      const [failureDashboardLoading, setFailureDashboardLoading] = useState(false);
      const [failureDashboardError, setFailureDashboardError] = useState("");
      const [failureDashboardRefreshedAt, setFailureDashboardRefreshedAt] = useState("");

      async function loadFailureIntelligenceDashboardData() {
        setFailureDashboardLoading(true);
        setFailureDashboardError("");

        try {
          const rows = await listServiceEventsForCurrentUser();
          setFailureDashboardEvents(Array.isArray(rows) ? rows : []);
          setFailureDashboardRefreshedAt(new Date().toISOString());
        } catch (err) {
          console.error("LOAD FAILURE DASHBOARD FAILED", err);
          setFailureDashboardError(t("fid_load_failed", lang));
        } finally {
          setFailureDashboardLoading(false);
        }
      }

      function buildFailureIntelligenceDashboard() {
        const unitMap = new Map(savedUnits.map((unit) => [unit.id, unit]));
        const events = Array.isArray(failureDashboardEvents) ? failureDashboardEvents : [];

        const componentCounts: Record<string, number> = {};
        const componentCallbackCounts: Record<string, number> = {};
        const equipmentCounts: Record<string, number> = {};
        const siteCounts: Record<string, number> = {};
        const symptomCounts: Record<string, number> = {};
        const causeFixCounts: Record<string, number> = {};
        const partCounts: Record<string, number> = {};

        for (const event of events) {
          const unit = unitMap.get(String(event.unit_id || "")) || null;
          const componentLabel = String(
            event.affected_component_label_snapshot ||
              getAffectedComponentDisplayForEvent(event) ||
              (unit?.unitNickname ? t("label_primary_component_dash", lang).replace("{value}", unit.unitNickname) : t("fallback_primary_component", lang))
          ).trim() || t("fallback_primary_component", lang);

          const siteLabel = String(unit?.siteName || unit?.siteAddress || "Unknown site").trim();
          const equipmentLabel = String(unit?.equipmentType || "Unknown equipment").trim();
          const symptomLabel = String(event?.symptom || "").trim();
          const causeLabel = String(event?.final_confirmed_cause || "").trim();
          const fixLabel = String(event?.actual_fix_performed || "").trim();
          const callbackValue = String(event?.callback_occurred || "").trim().toLowerCase();
          const causeFixLabel = [causeLabel, fixLabel].filter(Boolean).join(" → ");

          componentCounts[componentLabel] = (componentCounts[componentLabel] || 0) + 1;
          equipmentCounts[equipmentLabel] = (equipmentCounts[equipmentLabel] || 0) + 1;
          siteCounts[siteLabel] = (siteCounts[siteLabel] || 0) + 1;

          if (callbackValue === "yes" || callbackValue === "true") {
            componentCallbackCounts[componentLabel] = (componentCallbackCounts[componentLabel] || 0) + 1;
          }

          if (symptomLabel) {
            symptomCounts[symptomLabel] = (symptomCounts[symptomLabel] || 0) + 1;
          }

          if (causeFixLabel) {
            causeFixCounts[causeFixLabel] = (causeFixCounts[causeFixLabel] || 0) + 1;
          }

          const rawParts = String(event?.parts_replaced || "").trim();
          if (rawParts) {
            for (const rawPart of rawParts.split(/[;,]/)) {
              const part = rawPart.trim();
              if (!part) continue;
              partCounts[part] = (partCounts[part] || 0) + 1;
            }
          }
        }

        const sortCounts = (counts: Record<string, number>) =>
          Object.entries(counts)
            .filter(([key]) => key.trim())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

        const totalEvents = events.length;
        const callbackEvents = events.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        return {
          totalEvents,
          callbackEvents,
          topComponents: sortCounts(componentCounts).slice(0, 5),
          topCallbackComponents: sortCounts(componentCallbackCounts).slice(0, 5),
          topEquipmentTypes: sortCounts(equipmentCounts).slice(0, 5),
          topSites: sortCounts(siteCounts).slice(0, 5),
          topSymptoms: sortCounts(symptomCounts).slice(0, 5),
          topCauseFixes: sortCounts(causeFixCounts).slice(0, 5),
          topParts: sortCounts(partCounts).slice(0, 5),
        };
      }

      const [showFailureDashboard, setShowFailureDashboard] = useState(false);
      // guided-next-test-engine-v2
      function buildGuidedNextTests() {
        // guided-next-test-engine-v3
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const componentLabelLower = componentLabel.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const recentParts = getRecentSameComponentPartsForAssist();
        const recentFix = getMostRecentSameComponentFixForAssist();

        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const tests: Array<{
          title: string;
          tool: string;
          why: string;
          how: string;
        }> = [];

        tests.push({
          title: t("gnt_confirm_target_title", lang),
          tool: t("gnt_confirm_target_tool", lang),
          why: t("gnt_confirm_target_why", lang),
          how: t("gnt_confirm_target_how", lang),
        });

        // Readings-aware paths
        if (superheat !== null && subcool !== null && superheat > 18 && subcool < 5) {
          tests.push({
            title: t("gnt_high_sh_low_sc_title", lang),
            tool: t("gnt_high_sh_low_sc_tool", lang),
            why: t("gnt_high_sh_low_sc_why", lang),
            how: t("gnt_high_sh_low_sc_how", lang),
          });
        }

        if (superheat !== null && subcool !== null && superheat < 6 && subcool > 15) {
          tests.push({
            title: t("gnt_low_sh_high_sc_title", lang),
            tool: t("gnt_low_sh_high_sc_tool", lang),
            why: t("gnt_low_sh_high_sc_why", lang),
            how: t("gnt_low_sh_high_sc_how", lang),
          });
        }

        if (superheat !== null && subcool !== null && superheat > 18 && subcool > 15) {
          tests.push({
            title: t("gnt_high_sh_high_sc_title", lang),
            tool: t("gnt_high_sh_high_sc_tool", lang),
            why: t("gnt_high_sh_high_sc_why", lang),
            how: t("gnt_high_sh_high_sc_how", lang),
          });
        }

        if (superheat !== null && subcool !== null && superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
          tests.push({
            title: t("gnt_readings_ok_title", lang),
            tool: t("gnt_readings_ok_tool", lang),
            why: t("gnt_readings_ok_why", lang),
            how: t("gnt_readings_ok_how", lang),
          });
        }

        if (deltaT !== null && deltaT < 14 && (issue.includes("not cooling") || issue.includes("no cool"))) {
          tests.push({
            title: t("gnt_low_split_title", lang),
            tool: t("gnt_low_split_tool", lang),
            why: t("gnt_low_split_why", lang),
            how: t("gnt_low_split_how", lang),
          });
        }

        if (deltaT !== null && deltaT > 24) {
          tests.push({
            title: t("gnt_high_split_title", lang),
            tool: t("gnt_high_split_tool", lang),
            why: t("gnt_high_split_why", lang),
            how: t("gnt_high_split_how", lang),
          });
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          tests.push({
            title: t("gnt_heat_rejection_title", lang),
            tool: t("gnt_heat_rejection_tool", lang),
            why: t("gnt_heat_rejection_why", lang),
            how: t("gnt_heat_rejection_how", lang),
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat > 20) {
          tests.push({
            title: t("gnt_low_feed_evap_title", lang),
            tool: t("gnt_low_feed_evap_tool", lang),
            why: t("gnt_low_feed_evap_why", lang),
            how: t("gnt_low_feed_evap_how", lang),
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat < 5) {
          tests.push({
            title: t("gnt_floodback_title", lang),
            tool: t("gnt_floodback_tool", lang),
            why: t("gnt_floodback_why", lang),
            how: t("gnt_floodback_how", lang),
          });
        }

        if (boxTemp !== null && equipment.includes("walk-in")) {
          tests.push({
            title: t("gnt_box_temp_title", lang),
            tool: t("gnt_box_temp_tool", lang),
            why: t("gnt_box_temp_why", lang),
            how: t("gnt_box_temp_how", lang).replace("{value}", String(boxTemp)),
          });
        }

        // Component / symptom / history aware paths
        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          tests.push({
            title: t("gnt_outdoor_electrical_title", lang),
            tool: t("gnt_outdoor_electrical_tool", lang),
            why: t("gnt_outdoor_electrical_why", lang),
            how: t("gnt_outdoor_electrical_how", lang),
          });

          tests.push({
            title: t("gnt_check_heat_rejection_title", lang),
            tool: t("gnt_check_heat_rejection_tool", lang),
            why: t("gnt_check_heat_rejection_why", lang),
            how: t("gnt_check_heat_rejection_how", lang),
          });
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          tests.push({
            title: t("gnt_fan_ice_drain_title", lang),
            tool: t("gnt_fan_ice_drain_tool", lang),
            why: t("gnt_fan_ice_drain_why", lang),
            how: t("gnt_fan_ice_drain_how", lang),
          });

          tests.push({
            title: t("gnt_frost_pattern_title", lang),
            tool: t("gnt_frost_pattern_tool", lang),
            why: t("gnt_frost_pattern_why", lang),
            how: t("gnt_frost_pattern_how", lang),
          });
        }

        if (componentLabelLower.includes("furnace")) {
          tests.push({
            title: t("gnt_furnace_sequence_title", lang),
            tool: t("gnt_furnace_sequence_tool", lang),
            why: t("gnt_furnace_sequence_why", lang),
            how: t("gnt_furnace_sequence_how", lang),
          });
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          tests.push({
            title: t("gnt_indoor_airflow_safeties_title", lang),
            tool: t("gnt_indoor_airflow_safeties_tool", lang),
            why: t("gnt_indoor_airflow_safeties_why", lang),
            how: t("gnt_indoor_airflow_safeties_how", lang),
          });
        }

        if (equipment.includes("walk-in")) {
          tests.push({
            title: t("gnt_walkin_control_defrost_title", lang),
            tool: t("gnt_walkin_control_defrost_tool", lang),
            why: t("gnt_walkin_control_defrost_why", lang),
            how: t("gnt_walkin_control_defrost_how", lang),
          });
        }

        if (equipment.includes("ice machine")) {
          tests.push({
            title: t("gnt_ice_machine_separate_title", lang),
            tool: t("gnt_ice_machine_separate_tool", lang),
            why: t("gnt_ice_machine_separate_why", lang),
            how: t("gnt_ice_machine_separate_how", lang),
          });
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          tests.push({
            title: t("gnt_no_cool_power_controls_title", lang),
            tool: t("gnt_no_cool_power_controls_tool", lang),
            why: t("gnt_no_cool_power_controls_why", lang),
            how: t("gnt_no_cool_power_controls_how", lang),
          });
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          tests.push({
            title: t("gnt_icing_airflow_title", lang),
            tool: t("gnt_icing_airflow_tool", lang),
            why: t("gnt_icing_airflow_why", lang),
            how: t("gnt_icing_airflow_how", lang),
          });
        }

        if (issue.includes("heat")) {
          tests.push({
            title: t("gnt_heating_safety_chain_title", lang),
            tool: t("gnt_heating_safety_chain_tool", lang),
            why: t("gnt_heating_safety_chain_why", lang),
            how: t("gnt_heating_safety_chain_how", lang),
          });
        }

        if (sameComponentHistory.length) {
          tests.push({
            title: t("gnt_same_component_history_title", lang),
            tool: t("gnt_same_component_history_tool", lang),
            why: t("gnt_same_component_history_why", lang),
            how: t("gnt_same_component_history_how", lang).replace("{count}", String(sameComponentHistory.length)),
          });
        }

        if (recentParts.length || recentFix) {
          tests.push({
            title: t("gnt_last_repair_path_title", lang),
            tool: t("gnt_last_repair_path_tool", lang),
            why: t("gnt_last_repair_path_why", lang),
            how: t("gnt_last_repair_path_how", lang).replace(
              "{value}",
              [recentParts.join(", "), recentFix].filter(Boolean).join(" • ") || t("gnt_history_fallback", lang)
            ),
          });
        }

        const seen = new Set<string>();
        return tests.filter((test) => {
          const key = `${test.title}|${test.how}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 6);
      }

      // diagnostic-closeout-builder-v1
      const [diagnosticCloseoutDrafts, setDiagnosticCloseoutDrafts] = useState({
        customerSummary: "",
        internalSummary: "",
        followUp: "",
      });
      const [diagnosticCloseoutMessage, setDiagnosticCloseoutMessage] = useState("");

      function buildCloseoutReadingsSummary() {
        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const parts: string[] = [];

        if (suctionPressure !== null) parts.push(`Suction ${suctionPressure} psi`);
        if (headPressure !== null) parts.push(`Head ${headPressure} psi`);
        if (chargeAnalysis?.superheat !== null) parts.push(`SH ${chargeAnalysis.superheat}°F`);
        if (chargeAnalysis?.subcool !== null) parts.push(`SC ${chargeAnalysis.subcool}°F`);
        if (returnAirTemp !== null) parts.push(`Return ${returnAirTemp}°F`);
        if (supplyAirTemp !== null) parts.push(`Supply ${supplyAirTemp}°F`);
        if (boxTemp !== null) parts.push(`Box ${boxTemp}°F`);

        return parts.join(" • ");
      }

      // readings-aware-closeout-builder-v2
      function buildPlainEnglishCloseoutReadingsInterpretation() {
        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;
        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const notes: string[] = [];
        const followUpItems: string[] = [];

        if (superheat !== null && subcool !== null) {
          if (superheat > 18 && subcool < 5) {
            notes.push(t("pce_high_sh_low_sc_note", lang));
            followUpItems.push(t("pce_high_sh_low_sc_followup", lang));
          } else if (superheat < 6 && subcool > 15) {
            notes.push(t("pce_low_sh_high_sc_note", lang));
            followUpItems.push(t("pce_low_sh_high_sc_followup", lang));
          } else if (superheat > 18 && subcool > 15) {
            notes.push(t("pce_high_sh_high_sc_note", lang));
            followUpItems.push(t("pce_high_sh_high_sc_followup", lang));
          } else if (superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
            notes.push(t("pce_sh_sc_balanced_note", lang));
          }
        } else {
          if (superheat !== null) {
            if (superheat > 20) {
              notes.push(t("pce_high_sh_only_note", lang));
              followUpItems.push(t("pce_high_sh_only_followup", lang));
            } else if (superheat < 5) {
              notes.push(t("pce_low_sh_only_note", lang));
              followUpItems.push(t("pce_low_sh_only_followup", lang));
            }
          }

          if (subcool !== null) {
            if (subcool < 5) {
              notes.push(t("pce_low_sc_only_note", lang));
            } else if (subcool > 15) {
              notes.push(t("pce_high_sc_only_note", lang));
            }
          }
        }

        if (deltaT !== null) {
          if (deltaT < 14) {
            notes.push(t("pce_low_split_note", lang));
            followUpItems.push(t("pce_low_split_followup", lang));
          } else if (deltaT > 24) {
            notes.push(t("pce_high_split_note", lang));
            followUpItems.push(t("pce_high_split_followup", lang));
          }
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          notes.push(t("pce_head_ambient_note", lang));
          followUpItems.push(t("pce_head_ambient_followup", lang));
        }

        if (boxTemp !== null && String(equipmentType || "").toLowerCase().includes("walk-in")) {
          notes.push(t("pce_box_temp_note", lang).replace("{value}", String(boxTemp)));
        }

        const uniqueNotes: string[] = [];
        const uniqueNoteSet = new Set<string>();
        for (const note of notes) {
          const key = note.trim().toLowerCase();
          if (!key || uniqueNoteSet.has(key)) continue;
          uniqueNoteSet.add(key);
          uniqueNotes.push(note);
        }

        const uniqueFollowUps: string[] = [];
        const uniqueFollowUpSet = new Set<string>();
        for (const item of followUpItems) {
          const key = item.trim().toLowerCase();
          if (!key || uniqueFollowUpSet.has(key)) continue;
          uniqueFollowUpSet.add(key);
          uniqueFollowUps.push(item);
        }

        return {
          summary: uniqueNotes.join(" "),
          followUpItems: uniqueFollowUps,
        };
      }

      function buildDiagnosticCloseoutDrafts() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const cause = String(finalConfirmedCause || "").trim();
        const fix = String(actualFixPerformed || "").trim();
        const currentSymptom = String(symptom || "").trim();
        const outcome = String(outcomeStatus || "Not Set").trim();
        const callback = String(callbackOccurred || "No").trim();
        const recentHistoryCount = getSameComponentHistoryForTroubleshooting().length;
        const warnings = getComponentAwareWarningSignals().slice(0, 2);
        const readingsSummary = buildCloseoutReadingsSummary();
        const readingsInterpretationResult = buildPlainEnglishCloseoutReadingsInterpretation();
        const readingsInterpretation = readingsInterpretationResult.summary;
        const readingsFollowUp = readingsInterpretationResult.followUpItems;
        const siteLabel = String(siteName || siteAddress || customerName || t("fallback_this_site", lang)).trim();
        const followUpItems: string[] = [];

        if (callback.toLowerCase() === "yes") {
          followUpItems.push(t("dcd_followup_callback", lang));
        }

        if (recentHistoryCount > 0) {
          followUpItems.push(
            t("dcd_followup_history_count", lang).replace("{count}", String(recentHistoryCount))
          );
        }

        if (warnings.length) {
          followUpItems.push(...warnings);
        }

        if (readingsFollowUp.length) {
          followUpItems.push(...readingsFollowUp);
        }

        if (outcome && outcome !== "Not Set") {
          followUpItems.push(t("dcd_followup_outcome_status", lang).replace("{value}", outcome));
        }

        if (!followUpItems.length) {
          followUpItems.push(t("dcd_followup_none", lang));
        }

        const customerSummaryLines = [
          t("dcd_cs_reported_issue", lang)
            .replace("{site}", siteLabel)
            .replace("{symptom}", currentSymptom || t("dcd_cs_equipment_problem_fallback", lang))
            .replace("{component}", targetComponent),
          cause
            ? t("dcd_cs_cause_known", lang).replace("{value}", cause)
            : t("dcd_cs_cause_unknown", lang),
          fix
            ? t("dcd_cs_fix_known", lang).replace("{value}", fix)
            : t("dcd_cs_fix_unknown", lang),
          outcome && outcome !== "Not Set"
            ? t("dcd_cs_status", lang).replace("{value}", outcome)
            : "",
          readingsInterpretation ? t("dcd_cs_reading_interpretation", lang).replace("{value}", readingsInterpretation) : "",
          readingsSummary ? t("dcd_cs_key_readings", lang).replace("{value}", readingsSummary) : "",
        ].filter(Boolean);

        const internalSummaryLines = [
          t("dcd_is_affected_component", lang).replace("{value}", targetComponent),
          currentSymptom ? t("dcd_is_complaint", lang).replace("{value}", currentSymptom) : "",
          cause ? t("dcd_is_cause_known", lang).replace("{value}", cause) : t("dcd_is_cause_unknown", lang),
          fix ? t("dcd_is_fix_known", lang).replace("{value}", fix) : t("dcd_is_fix_unknown", lang),
          readingsInterpretation ? t("dcd_is_readings_meaning", lang).replace("{value}", readingsInterpretation) : "",
          readingsSummary ? t("dcd_is_key_readings", lang).replace("{value}", readingsSummary) : "",
          outcome && outcome !== "Not Set" ? t("dcd_is_outcome", lang).replace("{value}", outcome) : "",
          callback ? t("dcd_is_callback_flag", lang).replace("{value}", callback) : "",
          recentHistoryCount
            ? t("dcd_is_history_count", lang).replace("{value}", String(recentHistoryCount))
            : "",
        ].filter(Boolean);

        const followUpLines = followUpItems.map((item) => `- ${item}`);

        setDiagnosticCloseoutDrafts({
          customerSummary: customerSummaryLines.join(" "),
          internalSummary: internalSummaryLines.join("\n"),
          followUp: followUpLines.join("\n"),
        });

        setDiagnosticCloseoutMessage(t("dcd_drafts_generated", lang));
      }

      async function copyDiagnosticCloseoutText(
        key: "customerSummary" | "internalSummary" | "followUp"
      ) {
        const value = diagnosticCloseoutDrafts[key];
        if (!value.trim()) {
          setDiagnosticCloseoutMessage(t("dcd_generate_first", lang));
          return;
        }

        try {
          await navigator.clipboard.writeText(value);
          setDiagnosticCloseoutMessage(t("dcd_copied", lang));
        } catch (err) {
          console.error("COPY DIAGNOSTIC CLOSEOUT FAILED", err);
          setDiagnosticCloseoutMessage(t("dcd_copy_failed", lang));
        }
      }

      function pushInternalSummaryToTechCloseoutNotes() {
        const internalSummary = diagnosticCloseoutDrafts.internalSummary.trim();
        if (!internalSummary) {
          setDiagnosticCloseoutMessage(t("dcd_generate_first", lang));
          return;
        }

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), internalSummary].filter(Boolean).join("\n\n")
        );
        setDiagnosticCloseoutMessage(t("dcd_internal_added", lang));
      }

      // symptom-dictation-v1
      const [symptomListening, setSymptomListening] = useState(false);
      const [symptomDictationMessage, setSymptomDictationMessage] = useState("");

      function browserSupportsSymptomDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startSymptomDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setSymptomDictationMessage(
            t("symptom_dictation_not_supported", lang)
          );
          return;
        }

        try {
          if (w.__symptomRecognition && symptomListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__symptomRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setSymptomListening(true);
            setSymptomDictationMessage(t("symptom_dictation_listening", lang));
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setSymptom((prev) => [String(prev || "").trim(), cleaned].filter(Boolean).join(" "));
            setSymptomDictationMessage(t("symptom_dictation_added", lang));
          };

          recognition.onerror = (event: any) => {
            setSymptomListening(false);
            w.__symptomRecognition = null;
            setSymptomDictationMessage(
              event?.error
                ? t("symptom_dictation_error", lang).replace("{value}", String(event.error))
                : t("symptom_dictation_failed", lang)
            );
          };

          recognition.onend = () => {
            setSymptomListening(false);
            w.__symptomRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setSymptomListening(false);
          (window as any).__symptomRecognition = null;
          setSymptomDictationMessage(t("symptom_dictation_could_not_start", lang));
          console.error("SYMPTOM DICTATION FAILED", err);
        }
      }

      function stopSymptomDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__symptomRecognition) {
          try {
            w.__symptomRecognition.stop();
          } catch (err) {
            console.error("SYMPTOM DICTATION STOP FAILED", err);
          }
        }
        setSymptomListening(false);
      }

      // actual-fix-performed-dictation-v1
      const [actualFixListening, setActualFixListening] = useState(false);
      const [actualFixDictationMessage, setActualFixDictationMessage] = useState("");

      function startActualFixDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setActualFixDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__actualFixRecognition && actualFixListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__actualFixRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setActualFixListening(true);
            setActualFixDictationMessage("Listening for Actual Fix Performed...");
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setActualFixPerformed((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setActualFixDictationMessage("Dictation added to Actual Fix Performed.");
          };

          recognition.onerror = (event: any) => {
            setActualFixListening(false);
            w.__actualFixRecognition = null;
            setActualFixDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setActualFixListening(false);
            w.__actualFixRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setActualFixListening(false);
          (window as any).__actualFixRecognition = null;
          setActualFixDictationMessage("Could not start dictation.");
          console.error("ACTUAL FIX DICTATION FAILED", err);
        }
      }

      function stopActualFixDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__actualFixRecognition) {
          try {
            w.__actualFixRecognition.stop();
          } catch (err) {
            console.error("ACTUAL FIX DICTATION STOP FAILED", err);
          }
        }
        setActualFixListening(false);
      }

      // auto-grow-dictation-textareas-v1
      function autoGrowTextarea(event: any) {
        const el = event?.target as HTMLTextAreaElement | undefined;
        if (!el) return;
        el.style.minHeight = "120px";
        el.style.resize = "vertical";
        el.style.height = "auto";
        el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
      }

      function refreshAutoGrowTextareas() {
        if (typeof document === "undefined") return;
        const nodes = Array.from(
          document.querySelectorAll('textarea[data-auto-grow="true"]')
        ) as HTMLTextAreaElement[];

        for (const el of nodes) {
          el.style.minHeight = "120px";
          el.style.resize = "vertical";
          el.style.height = "auto";
          el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
        }
      }

      // targeted-parts-manuals-assist-v2
      function getTargetedComponentRecordForAssist() {
        const selectedId = String(affectedComponentId || "").trim();

        if (selectedId && Array.isArray(linkedEquipmentComponents)) {
          const linkedMatch = linkedEquipmentComponents.find(
            (component) => String(component?.id || "").trim() === selectedId
          );

          if (linkedMatch) {
            return {
              source: "linked",
              label: getCurrentAffectedComponentLabelForAssist(),
              role: String(linkedMatch.role || "").trim(),
              tag: String(linkedMatch.tag || "").trim(),
              manufacturer: String(linkedMatch.manufacturer || "").trim(),
              model: String(linkedMatch.model || "").trim(),
              serial: String(linkedMatch.serial || "").trim(),
            };
          }
        }

        return {
          source: "primary",
          label: getCurrentAffectedComponentLabelForAssist(),
          role: String(primaryComponentRole || "unit").trim(),
          tag: String(unitNickname || "").trim(),
          manufacturer: String(manufacturer || "").trim(),
          model: String(model || "").trim(),
          serial: String(serialNumber || nameplate?.serial || "").trim(),
        };
      }

      // photo-assist-panel-v1
      const [photoAssistType, setPhotoAssistType] = useState("general");
      const [photoAssistDraft, setPhotoAssistDraft] = useState({
        summary: "",
        checks: "",
        closeout: "",
      });
      const [photoAssistMessage, setPhotoAssistMessage] = useState("");

      function getLatestServiceEventPhotoUrl() {
        if (!Array.isArray(serviceEventPhotoUrls) || !serviceEventPhotoUrls.length) return "";
        return String(serviceEventPhotoUrls[serviceEventPhotoUrls.length - 1] || "").trim();
      }

      function buildPhotoAssistDraft() {
        const target = typeof getTargetedComponentRecordForAssist === "function"
          ? getTargetedComponentRecordForAssist()
          : {
              label: getCurrentAffectedComponentLabelForAssist(),
              role: String(primaryComponentRole || "unit"),
              tag: String(unitNickname || ""),
              manufacturer: String(manufacturer || ""),
              model: String(model || ""),
              serial: String(serialNumber || nameplate?.serial || ""),
            };

        const componentLabel = String(target.label || t("fallback_primary_component", lang)).trim();
        const componentRole = String(target.role || "").toLowerCase();
        const issue = String(symptom || "").trim();
        const readingsSummary =
          typeof buildCloseoutReadingsSummary === "function" ? buildCloseoutReadingsSummary() : "";
        const historyCount =
          typeof getSameComponentHistoryForAssist === "function"
            ? getSameComponentHistoryForAssist().length
            : 0;
        const recentFix =
          typeof getMostRecentSameComponentFixForAssist === "function"
            ? getMostRecentSameComponentFixForAssist()
            : "";
        const warnings =
          typeof getComponentAwareWarningSignals === "function"
            ? getComponentAwareWarningSignals().slice(0, 2)
            : [];

        let summary = "";
        let checks: string[] = [];
        let closeout = "";

        if (photoAssistType === "board_wiring") {
          summary = `Use this board / wiring photo to verify the control path on ${componentLabel}, confirm what components are actually present, and document terminal / wiring condition before replacing parts.`;
          checks = [
            "Match the board / wiring photo to the exact component you are working on.",
            "Verify the call path, incoming voltage, outputs, safeties, and any burnt / loose / bypassed wiring shown in the photo.",
            "Compare the photo against the wiring diagram before replacing boards, relays, contactors, or safety controls.",
          ];
          closeout = `Board / wiring photo captured for ${componentLabel} to document terminal and control condition during diagnosis.`;
        } else if (photoAssistType === "ice_pattern") {
          summary = `Use this ice / frost pattern photo to document how ${componentLabel} is icing and to support airflow, defrost, drain, or feed-path diagnosis.`;
          checks = [
            "Read the frost pattern before condemning TXV / EEV / charge.",
            "Check fan operation, drain condition, defrost behavior, and airflow before replacing refrigeration parts.",
            "Compare the photo to current readings and box / supply-return conditions.",
          ];
          closeout = `Ice / frost pattern photo captured on ${componentLabel} to support airflow / defrost / feed-path diagnosis.`;
        } else if (photoAssistType === "coil_condition") {
          summary = `Use this coil condition photo to document airflow blockage, dirt, damage, oil residue, or other visible coil issues on ${componentLabel}.`;
          checks = [
            "Verify coil cleanliness, damage, and any signs of oil or repeated icing.",
            "Use the photo to support whether airflow / heat rejection should be corrected before major part replacement.",
            "Compare visible condition to current pressures, temperatures, and symptom.",
          ];
          closeout = `Coil condition photo captured on ${componentLabel} to document visible airflow / heat-transfer condition during diagnosis.`;
        } else if (photoAssistType === "data_plate") {
          summary = `Use this data plate / tag photo to confirm make, model, serial, electrical data, refrigerant, and exact component identity before ordering parts or opening manuals.`;
          checks = [
            "Verify that the photo matches the exact affected component and tag.",
            "Use the tag photo to tighten manual lookup, wiring lookup, and parts targeting.",
            "If the tag is damaged, use the photo to document what is still readable.",
          ];
          closeout = `Data plate / tag photo captured for ${componentLabel} to confirm identity and support parts/manual lookup.`;
        } else if (photoAssistType === "failed_part") {
          summary = `Use this failed-part photo to document the actual condition of the removed / suspect part on ${componentLabel} and compare it to the repeat-history path.`;
          checks = [
            "Document obvious burn, swelling, rust, physical failure, or wiring damage.",
            "Compare the failed part photo to prior same-component history before repeating the same repair.",
            "Use the photo to support the final confirmed cause and replacement decision.",
          ];
          closeout = `Failed-part photo captured for ${componentLabel} to document the suspected / removed part condition.`;
        } else {
          summary = `Use this photo to document the condition of ${componentLabel} and support the current diagnostic path.`;
          checks = [
            "Confirm the photo supports the actual component being diagnosed.",
            "Tie what is visible in the photo back to the current symptom, readings, and next test path.",
            "Use the photo to support the closeout note and future history on this component.",
          ];
          closeout = `Diagnostic photo captured for ${componentLabel} to support the current service path.`;
        }

        if (
          componentRole.includes("condensing") ||
          componentRole.includes("outdoor") ||
          componentRole.includes("condenser")
        ) {
          checks.push("Use the photo to verify contactor, capacitor, condenser fan, wiring condition, and coil/airflow condition on the outdoor side.");
        }

        if (componentRole.includes("evaporator") || componentRole.includes("indoor_head")) {
          checks.push("Use the photo to verify fan condition, ice pattern, drain condition, and any defrost-related clues on the evaporator side.");
        }

        if (componentRole.includes("furnace")) {
          checks.push("Use the photo to verify board, safeties, inducer path, pressure switch tubing, and ignition sequence hardware.");
        }

        if (String(equipmentType || "").toLowerCase().includes("walk-in")) {
          checks.push("On walk-ins, use the photo to support defrost / fan delay / drain heat / box condition decisions.");
        }

        if (issue) {
          checks.push(`Tie the photo back to the reported symptom: ${issue}.`);
        }

        if (readingsSummary) {
          checks.push(`Compare visible condition to current readings: ${readingsSummary}.`);
        }

        if (historyCount > 0) {
          checks.push(`This component has ${historyCount} prior same-component event${historyCount === 1 ? "" : "s"}; use the photo to verify the problem path is really repeating.`);
        }

        if (recentFix) {
          checks.push(`Recent same-component fix to compare against: ${recentFix}.`);
        }

        if (warnings.length) {
          checks.push(...warnings);
        }

        const uniqueChecks: string[] = [];
        const seen = new Set<string>();
        for (const item of checks) {
          const key = item.trim().toLowerCase();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          uniqueChecks.push(item);
        }

        setPhotoAssistDraft({
          summary,
          checks: uniqueChecks.map((item) => `- ${item}`).join("\n"),
          closeout,
        });
        setPhotoAssistMessage("Photo assist draft generated.");
      }

      async function copyPhotoAssistText(key: "summary" | "checks" | "closeout") {
        const value = String(photoAssistDraft[key] || "").trim();
        if (!value) {
          setPhotoAssistMessage("Generate the photo assist draft first.");
          return;
        }

        try {
          await navigator.clipboard.writeText(value);
          setPhotoAssistMessage("Copied to clipboard.");
        } catch (err) {
          console.error("COPY PHOTO ASSIST FAILED", err);
          setPhotoAssistMessage("Could not copy to clipboard.");
        }
      }

      function pushPhotoAssistCloseoutToTechNotes() {
        const value = String(photoAssistDraft.closeout || "").trim();
        if (!value) {
          setPhotoAssistMessage("Generate the photo assist draft first.");
          return;
        }

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), value].filter(Boolean).join("\n\n")
        );
        setPhotoAssistMessage("Photo closeout note added to Tech Closeout Notes.");
      }

      // parts-replaced-dictation-v1
      const [partsReplacedListening, setPartsReplacedListening] = useState(false);
      const [partsReplacedDictationMessage, setPartsReplacedDictationMessage] = useState("");

      function startPartsReplacedDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setPartsReplacedDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__partsReplacedRecognition && partsReplacedListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__partsReplacedRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setPartsReplacedListening(true);
            setPartsReplacedDictationMessage("Listening for Parts Replaced...");
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setPartsReplaced((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setPartsReplacedDictationMessage("Dictation added to Parts Replaced.");
          };

          recognition.onerror = (event: any) => {
            setPartsReplacedListening(false);
            w.__partsReplacedRecognition = null;
            setPartsReplacedDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setPartsReplacedListening(false);
            w.__partsReplacedRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setPartsReplacedListening(false);
          (window as any).__partsReplacedRecognition = null;
          setPartsReplacedDictationMessage("Could not start dictation.");
          console.error("PARTS REPLACED DICTATION FAILED", err);
        }
      }

      function stopPartsReplacedDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__partsReplacedRecognition) {
          try {
            w.__partsReplacedRecognition.stop();
          } catch (err) {
            console.error("PARTS REPLACED DICTATION STOP FAILED", err);
          }
        }
        setPartsReplacedListening(false);
      }

      // core-field-dictation-v1
            const [confirmedCauseListening, setConfirmedCauseListening] = useState(false);
      
            const [confirmedCauseDictationMessage, setConfirmedCauseDictationMessage] = useState("");
      
      function browserSupportsFieldDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function stopSharedFieldDictationInstance(instanceKey: string) {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w[instanceKey]) {
          try {
            w[instanceKey].stop();
          } catch (err) {
            console.error("FIELD DICTATION STOP FAILED", err);
          }
          w[instanceKey] = null;
        }
      }

      function startFieldDictation(config: {
        instanceKey: string;
        setListening: (value: boolean) => void;
        setMessage: (value: string) => void;
        getCurrentValue: () => string;
        setValue: (value: string) => void;
        listening: boolean;
        listeningMessage: string;
        successMessage: string;
      }) {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          config.setMessage("Speech recognition is not supported in this browser. Try Chrome or Edge.");
          return;
        }

        try {
          if (w[config.instanceKey] && config.listening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w[config.instanceKey] = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            config.setListening(true);
            config.setMessage(config.listeningMessage);
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            config.setValue(
              [String(config.getCurrentValue() || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            config.setMessage(config.successMessage);
          };

          recognition.onerror = (event: any) => {
            config.setListening(false);
            w[config.instanceKey] = null;
            config.setMessage(
              event?.error ? `Dictation error: ${String(event.error)}` : "Dictation failed."
            );
          };

          recognition.onend = () => {
            config.setListening(false);
            w[config.instanceKey] = null;
          };

          recognition.start();
        } catch (err) {
          config.setListening(false);
          w[config.instanceKey] = null;
          config.setMessage("Could not start dictation.");
          console.error("FIELD DICTATION START FAILED", err);
        }
      }

                  function startConfirmedCauseDictation() {
        startFieldDictation({
          instanceKey: "__confirmedCauseRecognition",
          setListening: setConfirmedCauseListening,
          setMessage: setConfirmedCauseDictationMessage,
          getCurrentValue: () => String(finalConfirmedCause || ""),
          setValue: setFinalConfirmedCause,
          listening: confirmedCauseListening,
          listeningMessage: "Listening... describe the confirmed cause.",
          successMessage: "Dictation captured and added to Confirmed Cause.",
        });
      }

      function stopConfirmedCauseDictation() {
        stopSharedFieldDictationInstance("__confirmedCauseRecognition");
        setConfirmedCauseListening(false);
      }

                  // parts-replaced-dictation-only-v1
            
                        // follow-up-dictation-only-v1
      const [followUpListening, setFollowUpListening] = useState(false);
      const [followUpDictationMessage, setFollowUpDictationMessage] = useState("");

      function startFollowUpDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setFollowUpDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__followUpRecognition && followUpListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__followUpRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setFollowUpListening(true);
            setFollowUpDictationMessage(
              "Listening... describe the recommended follow-up."
            );
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setDiagnosticCloseoutDrafts((prev) => ({
              ...prev,
              followUp: [String(prev.followUp || "").trim(), cleaned].filter(Boolean).join("\n"),
            }));
            setFollowUpDictationMessage(
              "Dictation captured and added to Recommended Follow-Up."
            );
          };

          recognition.onerror = (event: any) => {
            setFollowUpListening(false);
            w.__followUpRecognition = null;
            setFollowUpDictationMessage(
              event?.error ? `Dictation error: ${String(event.error)}` : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setFollowUpListening(false);
            w.__followUpRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setFollowUpListening(false);
          w.__followUpRecognition = null;
          setFollowUpDictationMessage("Could not start dictation.");
          console.error("FOLLOW-UP DICTATION FAILED", err);
        }
      }

      function stopFollowUpDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__followUpRecognition) {
          try {
            w.__followUpRecognition.stop();
          } catch (err) {
            console.error("FOLLOW-UP DICTATION STOP FAILED", err);
          }
          w.__followUpRecognition = null;
        }
        setFollowUpListening(false);
      }

      // photo-driven-diagnostic-assist-v1
      const [photoAssistSubject, setPhotoAssistSubject] = useState("iced_coil");
      
      function buildPhotoDrivenDiagnosticAssistPayload() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const componentLabelLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const warnings = getComponentAwareWarningSignals().slice(0, 3);
        const photoCount = Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0;

        const inspect: string[] = [];
        const verifyNext: string[] = [];
        const watchOuts: string[] = [];
        const repairDecisionEmphasis: string[] = [];
        const partsToVerifyEmphasis: string[] = [];
        const photoCanSupport: string[] = [];
        const photoCannotProve: string[] = [];
        const photoPartTieIn: string[] = [];
        const summaryParts: string[] = [];

        summaryParts.push(
          photoCount
            ? t("pds_photos_attached_count", lang).replace("{count}", String(photoCount))
            : t("pds_no_photos_yet", lang)
        );
        summaryParts.push(t("pvc_note_target_component", lang).replace("{value}", targetComponent));

        const selectedPart = String(selectedVerificationPart || "").trim();
        const selectedOutcome = String(selectedVerificationOutcome || "").trim();

        if (selectedPart) {
          summaryParts.push(t("pds_selected_verification_part", lang).replace("{value}", selectedPart));
        }

        if (selectedOutcome) {
          summaryParts.push(t("pds_verification_outcome_focus", lang).replace("{value}", selectedOutcome));
        }

        if (sameComponentHistory.length) {
          summaryParts.push(
            t("pds_prior_events_component", lang).replace("{count}", String(sameComponentHistory.length))
          );
        }

        if (photoAssistSubject === "iced_coil") {
          inspect.push(
            t("pds_ice_inspect1", lang),
            t("pds_ice_inspect2", lang),
            t("pds_ice_inspect3", lang)
          );
          verifyNext.push(
            t("pds_ice_verify1", lang),
            t("pds_ice_verify2", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_ice_repair1", lang),
            t("pds_ice_repair2", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_evap_fan_motor", lang),
            t("pds_part_defrost_heater", lang),
            t("pds_part_defrost_term_control", lang),
            t("pds_part_txv_eev_metering", lang)
          );
          photoCanSupport.push(
            t("pds_ice_support1", lang),
            t("pds_ice_support2", lang),
            t("pds_ice_support3", lang)
          );
          photoCannotProve.push(
            t("pds_ice_cannot1", lang),
            t("pds_ice_cannot2", lang)
          );
          watchOuts.push(
            t("pds_ice_watch1", lang)
          );
        }

        if (photoAssistSubject === "contactor_capacitor") {
          inspect.push(
            t("pds_cc_inspect1", lang),
            t("pds_cc_inspect2", lang)
          );
          verifyNext.push(
            t("pds_cc_verify1", lang),
            t("pds_cc_verify2", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_cc_repair1", lang),
            t("pds_cc_repair2", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_contactor", lang),
            t("pds_part_run_capacitor", lang),
            t("pds_part_condenser_fan_motor", lang),
            t("pds_part_compressor", lang)
          );
          photoCanSupport.push(
            t("pds_cc_support1", lang),
            t("pds_cc_support2", lang),
            t("pds_cc_support3", lang),
            t("pds_cc_support4", lang)
          );
          photoCannotProve.push(
            t("pds_cc_cannot1", lang),
            t("pds_cc_cannot2", lang),
            t("pds_cc_cannot3", lang)
          );
          watchOuts.push(
            t("pds_cc_watch1", lang)
          );
        }

        if (photoAssistSubject === "control_board") {
          inspect.push(
            t("pds_cb_inspect1", lang),
            t("pds_cb_inspect2", lang)
          );
          verifyNext.push(
            t("pds_cb_verify1", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_cb_repair1", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_control_board", lang),
            t("pds_part_relay_sequencer", lang),
            t("pds_part_pressure_switch", lang),
            t("pds_part_ignitor_flame_sensor", lang)
          );
          photoCanSupport.push(
            t("pds_cb_support1", lang),
            t("pds_cb_support2", lang),
            t("pds_cb_support3", lang)
          );
          photoCannotProve.push(
            t("pds_cb_cannot1", lang),
            t("pds_cb_cannot2", lang),
            t("pds_cb_cannot3", lang)
          );
          watchOuts.push(
            t("pds_cb_watch1", lang)
          );
        }

        if (photoAssistSubject === "wiring") {
          inspect.push(
            t("pds_wire_inspect1", lang),
            t("pds_wire_inspect2", lang)
          );
          verifyNext.push(
            t("pds_wire_verify1", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_wire_repair1", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_contactor", lang),
            t("pds_part_control_board", lang),
            t("pds_part_relay_sequencer", lang),
            t("pds_part_pressure_switch", lang)
          );
          photoCanSupport.push(
            t("pds_wire_support1", lang),
            t("pds_wire_support2", lang),
            t("pds_wire_support3", lang)
          );
          photoCannotProve.push(
            t("pds_wire_cannot1", lang),
            t("pds_wire_cannot2", lang)
          );
          watchOuts.push(
            t("pds_wire_watch1", lang)
          );
        }

        if (photoAssistSubject === "nameplate_tag") {
          inspect.push(
            t("pds_tag_inspect1", lang),
            t("pds_tag_inspect2", lang)
          );
          verifyNext.push(
            t("pds_tag_verify1", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_tag_repair1", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_tag_parts1", lang),
            t("pds_tag_parts2", lang)
          );
          photoCanSupport.push(
            t("pds_tag_support1", lang),
            t("pds_tag_support2", lang)
          );
          photoCannotProve.push(
            t("pds_tag_cannot1", lang),
            t("pds_tag_cannot2", lang)
          );
          watchOuts.push(
            t("pds_tag_watch1", lang)
          );
        }

        if (photoAssistSubject === "drain_defrost") {
          inspect.push(
            t("pds_drain_inspect1", lang),
            t("pds_drain_inspect2", lang)
          );
          verifyNext.push(
            t("pds_drain_verify1", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_drain_repair1", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_defrost_heater2", lang),
            t("pds_part_defrost_termination", lang),
            t("pds_part_defrost_control", lang),
            t("pds_part_drain_heater", lang)
          );
          photoCanSupport.push(
            t("pds_drain_support1", lang),
            t("pds_drain_support2", lang),
            t("pds_drain_support3", lang)
          );
          photoCannotProve.push(
            t("pds_drain_cannot1", lang),
            t("pds_drain_cannot2", lang)
          );
          watchOuts.push(
            t("pds_drain_watch1", lang)
          );
        }

        if (photoAssistSubject === "dirty_coil_airflow") {
          inspect.push(
            t("pds_dirty_inspect1", lang),
            t("pds_dirty_inspect2", lang)
          );
          verifyNext.push(
            t("pds_dirty_verify1", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_dirty_repair1", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_condenser_fan_motor", lang),
            t("pds_part_evap_fan_motor", lang),
            t("pds_part_blower_motor", lang)
          );
          photoCanSupport.push(
            t("pds_dirty_support1", lang),
            t("pds_dirty_support2", lang),
            t("pds_dirty_support3", lang)
          );
          photoCannotProve.push(
            t("pds_dirty_cannot1", lang),
            t("pds_dirty_cannot2", lang)
          );
          watchOuts.push(
            t("pds_dirty_watch1", lang)
          );
        }

        if (photoAssistSubject === "compressor_section") {
          inspect.push(
            t("pds_comp_inspect1", lang),
            t("pds_comp_inspect2", lang)
          );
          verifyNext.push(
            t("pds_comp_verify1", lang)
          );
          repairDecisionEmphasis.push(
            t("pds_comp_repair1", lang)
          );
          partsToVerifyEmphasis.push(
            t("pds_part_run_capacitor", lang),
            t("pds_part_contactor", lang),
            t("pds_part_compressor_protection", lang),
            t("pds_part_compressor", lang)
          );
          photoCanSupport.push(
            t("pds_comp_support1", lang),
            t("pds_comp_support2", lang),
            t("pds_comp_support3", lang)
          );
          photoCannotProve.push(
            t("pds_comp_cannot1", lang),
            t("pds_comp_cannot2", lang)
          );
          watchOuts.push(
            t("pds_comp_watch1", lang)
          );
        }

        if (issue.includes("ice") || issue.includes("icing") || issue.includes("freeze")) {
          verifyNext.push(
            t("pds_issue_icing_verify", lang)
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          verifyNext.push(
            t("pds_issue_nocool_verify", lang)
          );
        }

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          verifyNext.push(
            t("pds_comp_outdoor_verify", lang)
          );
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          verifyNext.push(
            t("pds_comp_evap_verify", lang)
          );
        }

        if (equipment.includes("walk-in")) {
          verifyNext.push(
            t("pds_walkin_verify", lang)
          );
        }

        for (const warning of warnings) {
          watchOuts.push(warning);
        }

        const selectedPartLower = selectedPart.toLowerCase();

        if (selectedPartLower.includes("contactor") && photoAssistSubject === "contactor_capacitor") {
          photoPartTieIn.push(t("pds_tiein_contactor_support", lang));
          photoCannotProve.push(t("pds_tiein_contactor_cannot", lang));
          verifyNext.push(t("pds_tiein_contactor_verify", lang));
        }

        if (selectedPartLower.includes("capacitor") && photoAssistSubject === "contactor_capacitor") {
          photoPartTieIn.push(t("pds_tiein_capacitor_support", lang));
          photoCannotProve.push(t("pds_tiein_capacitor_cannot", lang));
          verifyNext.push(t("pds_tiein_capacitor_verify", lang));
        }

        if (
          (selectedPartLower.includes("txv") || selectedPartLower.includes("eev") || selectedPartLower.includes("metering")) &&
          photoAssistSubject === "iced_coil"
        ) {
          photoPartTieIn.push(t("pds_tiein_txv_support", lang));
          photoCannotProve.push(t("pds_tiein_txv_cannot", lang));
          verifyNext.push(t("pds_tiein_txv_verify", lang));
        }

        if (
          (selectedPartLower.includes("defrost") || selectedPartLower.includes("drain heater")) &&
          (photoAssistSubject === "iced_coil" || photoAssistSubject === "drain_defrost")
        ) {
          photoPartTieIn.push(t("pds_tiein_defrost_support", lang));
          photoCannotProve.push(t("pds_tiein_defrost_cannot", lang));
          verifyNext.push(t("pds_tiein_defrost_verify", lang));
        }

        if (selectedPartLower.includes("control board") && photoAssistSubject === "control_board") {
          photoPartTieIn.push(t("pds_tiein_board_support", lang));
          photoCannotProve.push(t("pds_tiein_board_cannot", lang));
          verifyNext.push(t("pds_tiein_board_verify", lang));
        }

        if (
          (selectedPartLower.includes("blower motor") || selectedPartLower.includes("evaporator fan motor") || selectedPartLower.includes("condenser fan motor")) &&
          photoAssistSubject === "dirty_coil_airflow"
        ) {
          photoPartTieIn.push(t("pds_tiein_motor_support", lang));
          photoCannotProve.push(t("pds_tiein_motor_cannot", lang));
          verifyNext.push(t("pds_tiein_motor_verify", lang));
        }

        if (selectedOutcome === "Tested good") {
          photoPartTieIn.push(t("pds_tiein_outcome_tested_good", lang));
        }

        if (selectedOutcome === "Replaced") {
          photoPartTieIn.push(t("pds_tiein_outcome_replaced", lang));
        }

        const dedupe = (items: string[]) => {
          const seen = new Set<string>();
          return items.filter((item) => {
            const key = item.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };

        return {
          summary: summaryParts.join(" "),
          inspect: dedupe(inspect).slice(0, 5),
          verifyNext: dedupe(verifyNext).slice(0, 5),
          repairDecisionEmphasis: dedupe(repairDecisionEmphasis).slice(0, 5),
          partsToVerifyEmphasis: dedupe(partsToVerifyEmphasis).slice(0, 5),
          photoCanSupport: dedupe(photoCanSupport).slice(0, 5),
          photoCannotProve: dedupe(photoCannotProve).slice(0, 5),
          photoPartTieIn: dedupe(photoPartTieIn).slice(0, 5),
          watchOuts: dedupe(watchOuts).slice(0, 5),
        };
      }

      function generatePhotoDrivenDiagnosticAssist() {
        const payload = buildPhotoDrivenDiagnosticAssistPayload();
        if (!payload.inspect.length && !payload.verifyNext.length && !payload.watchOuts.length) {
          setPhotoAssistMessage(t("pds_no_guidance_generated", lang));
          return;
        }
        setPhotoAssistMessage(t("pds_refreshed", lang));
      }

      function addPhotoAssistToTechCloseoutNotes() {
        const payload = buildPhotoDrivenDiagnosticAssistPayload();
        const text = [
          t("pds_notes_title", lang),
          payload.summary,
          payload.inspect.length ? t("pds_notes_inspect", lang) + payload.inspect.join("\n- ") : "",
          payload.verifyNext.length ? t("pds_notes_verify_next", lang) + payload.verifyNext.join("\n- ") : "",
          payload.watchOuts.length ? t("pds_notes_watch_outs", lang) + payload.watchOuts.join("\n- ") : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), text].filter(Boolean).join("\n\n")
        );
        setPhotoAssistMessage(t("pds_added_to_notes", lang));
      }

      // repair-decision-panel-v2
      function buildRepairDecisionPanelItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const componentLabelLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const recentParts = getRecentSameComponentPartsForAssist();
        const recentFix = getMostRecentSameComponentFixForAssist();

        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;
        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const decisions: Array<{
          part: string;
          why: string;
          verifyFirst: string;
          blindRisk: string;
        }> = [];

        function addDecision(part: string, why: string, verifyFirst: string, blindRisk: string) {
          decisions.push({ part, why, verifyFirst, blindRisk });
        }

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          addDecision(
            "Contactor",
            "Outdoor / condensing section selected and many no-cool failures land on electrical switching first.",
            "Verify line/load voltage, coil voltage, contact drop, and whether the contactor is actually the failed point.",
            "Replacing a contactor without checking fan/compressor load can create a callback."
          );

          addDecision(
            "Run Capacitor",
            "Outdoor fan or compressor start/run complaints often track back to weak capacitor value.",
            "Test actual capacitance and compare against motor/compressor condition before replacing.",
            "A failed capacitor can be a symptom of a motor/compressor issue, not always the root cause."
          );

          addDecision(
            "Condenser Fan Motor",
            "Outdoor section and heat-rejection issues often drive high head and repeated no-cool calls.",
            "Verify fan rotation, amp draw, capacitor, voltage, and coil cleanliness before condemning the motor.",
            "Calling the fan motor too early can miss coil, control, or capacitor problems."
          );
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          addDecision(
            "Evaporator Fan Motor",
            "Evaporator-side airflow, icing, and weak box pull-down often start here.",
            "Verify fan operation, blade condition, voltage, amp draw, and airflow before replacing.",
            "Replacing the fan motor blindly can miss defrost, drain, or control problems."
          );

          addDecision(
            "Defrost Heater / Defrost Control",
            "Icing and repeat freeze-up patterns often point toward the defrost path on evaporator-side problems.",
            "Verify heater continuity, control output, termination, schedule, and drain condition before replacing.",
            "A repeated freeze-up will come back if the full defrost path is not checked."
          );

          addDecision(
            "TXV / EEV / Metering Device",
            "Evaporator-side feed issues are possible when frost pattern and readings suggest starvation or overfeed.",
            "Check airflow, frost pattern, superheat/subcool, restriction points, and feed behavior before condemning the metering device.",
            "Metering devices are overcalled when airflow or defrost is the real problem."
          );
        }

        if (componentLabelLower.includes("furnace")) {
          addDecision(
            "Ignitor / Flame Sensor",
            "Heat-sequence failures frequently land on ignition or flame proving before major boards/valves.",
            "Verify ignition sequence, flame sense signal, and safety chain first.",
            "Replacing boards or valves before checking ignition proof creates callbacks."
          );

          addDecision(
            "Pressure Switch / Inducer Path",
            "Heat complaints often fail in the draft/pressure proving side.",
            "Verify inducer operation, tubing, switch closure, venting, and board input before replacing.",
            "A pressure-switch swap without checking the full inducer path often does not solve the problem."
          );
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          addDecision(
            "Blower Motor / Module",
            "Indoor airflow complaints commonly track to blower operation or control.",
            "Verify board/relay output, module power, motor amp draw, and wheel/airflow condition.",
            "Calling a blower motor too early can miss relay, board, or drain safety problems."
          );

          addDecision(
            "Float Switch / Drain Safety",
            "Indoor no-cool and intermittent shutdowns are often caused by drain safeties.",
            "Verify drain condition, switch operation, and control interruption before replacing bigger parts.",
            "Ignoring drain safety creates easy callbacks."
          );
        }

        if (equipment.includes("walk-in")) {
          addDecision(
            "Defrost Termination / Defrost Board",
            "Walk-ins with icing or poor box pull-down often point to control/termination issues.",
            "Verify schedule, termination, fan delay, drain heat, and actual box condition before replacing parts.",
            "Replacing refrigeration parts without verifying defrost logic leads to repeat calls."
          );
        }

        if (equipment.includes("ice machine")) {
          addDecision(
            "Water Valve / Water Pump / Sensor",
            "Ice-machine problems often come from sequence and water-side faults before refrigeration parts.",
            "Separate freeze/harvest sequence, water flow, fill, and sensor response before replacing refrigeration components.",
            "Calling refrigeration parts from an ice complaint without separating the sequence is risky."
          );
        }

        if (superheat !== null && subcool !== null && superheat > 18 && subcool < 5) {
          addDecision(
            "Metering Device / Restriction Path",
            "High superheat with low subcool leans toward underfeed, undercharge, or restriction.",
            "Verify airflow first, then check filter drier / restriction points and liquid feed path before replacing.",
            "Blind metering-device replacement can miss undercharge or airflow as the real problem."
          );
        }

        if (superheat !== null && subcool !== null && superheat < 6 && subcool > 15) {
          addDecision(
            "Airflow / Overfeed Verification Before Part Swap",
            "Low superheat with high subcool leans toward floodback, overfeed, or airflow trouble.",
            "Verify fan/blower operation and metering behavior before changing compressor or charge-related parts.",
            "A compressor or charge decision made here without airflow checks is high risk."
          );
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          addDecision(
            "Condenser Airflow / Heat Rejection Path",
            "Head pressure is high against ambient, which points to heat rejection first.",
            "Verify coil cleanliness, fan operation, rotation, and airflow blockage before replacing refrigerant-side parts.",
            "Blind part replacement can miss the actual heat-rejection problem."
          );
        }

        if (deltaT !== null && deltaT < 14 && (issue.includes("not cooling") || issue.includes("no cool"))) {
          addDecision(
            "Indoor Airflow / Control Path",
            "Weak split says verify airflow and control path before calling a major refrigerant-side repair.",
            "Check filter, coil, fan/blower, relay/board outputs, and compare against current readings.",
            "Replacing expensive parts with a weak split and no airflow verification is callback-prone."
          );
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addDecision(
            "Defrost / Fan / Drain Path",
            "The complaint itself says this may be more than just a part failure.",
            "Treat the repair decision as airflow/defrost/drain/feed verification until proven otherwise.",
            "Icing complaints come back when the root cause is not verified."
          );
        }

        if (recentParts.length || recentFix) {
          addDecision(
            "Re-verify the last repair path",
            `Recent same-component history exists: ${[recentParts.join(", "), recentFix].filter(Boolean).join(" • ") || "See history"}.`,
            "Check whether the previously replaced part failed again or whether operating conditions are causing repeated failure.",
            "Repeating the same replacement without proving why it failed again creates callbacks."
          );
        }

        const seen = new Set<string>();
        return decisions.filter((item) => {
          const key = item.part.trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 6);
      }

      // quick-parts-chips-v1
      function buildQuickPartsChips() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "").toLowerCase();
        const equipment = String(equipmentType || "").toLowerCase();
        const issue = String(symptom || "").toLowerCase();

        const suggestedFromRepairPanel = buildRepairDecisionPanelItems().map((item) => item.part);

        const chips: string[] = [];

        for (const item of suggestedFromRepairPanel) {
          if (item && !chips.includes(item)) chips.push(item);
        }

        const addChip = (label: string) => {
          if (label && !chips.includes(label)) chips.push(label);
        };

        if (
          targetComponent.includes("condensing") ||
          targetComponent.includes("outdoor") ||
          targetComponent.includes("condenser")
        ) {
          addChip("Contactor");
          addChip("Run Capacitor");
          addChip("Condenser Fan Motor");
        }

        if (targetComponent.includes("evaporator") || targetComponent.includes("indoor head")) {
          addChip("Evaporator Fan Motor");
          addChip("Defrost Heater");
          addChip("TXV");
        }

        if (targetComponent.includes("furnace")) {
          addChip("Ignitor");
          addChip("Flame Sensor");
          addChip("Pressure Switch");
        }

        if (targetComponent.includes("air handler") || targetComponent.includes("indoor unit")) {
          addChip("Blower Motor");
          addChip("Float Switch");
          addChip("Relay / Sequencer");
        }

        if (equipment.includes("walk-in")) {
          addChip("Defrost Termination");
          addChip("Defrost Control");
          addChip("Evaporator Fan Motor");
        }

        if (equipment.includes("ice machine")) {
          addChip("Water Valve");
          addChip("Water Pump");
          addChip("Sensor");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addChip("Defrost Heater");
          addChip("Defrost Termination");
          addChip("Drain Heater");
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          addChip("Contactor");
          addChip("Run Capacitor");
          addChip("Blower Motor");
        }

        return chips;
      }

      // suggested-parts-to-verify-v1
      function buildSuggestedPartsToVerifyItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const decisions = buildRepairDecisionPanelItems();

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const items = decisions.map((decision) => {
          let score = 1;
          const reasons: string[] = [];
          const prove: string[] = [];
          const partLower = decision.part.toLowerCase();

          reasons.push(`Target component: ${targetComponent}`);
          if (issue) reasons.push(`Current symptom: ${issue}`);

          prove.push(decision.verifyFirst);

          if (sameComponentHistory.length) {
            score += 1;
            reasons.push(
              `${sameComponentHistory.length} prior same-component event${sameComponentHistory.length === 1 ? "" : "s"}`
            );
          }

          if (
            partLower.includes("contactor") &&
            (targetComponent.toLowerCase().includes("condensing") ||
              targetComponent.toLowerCase().includes("outdoor") ||
              issue.includes("no cool") ||
              issue.includes("not cooling"))
          ) {
            score += 2;
            reasons.push("Outdoor / no-cool electrical path matches this part");
          }

          if (
            (partLower.includes("capacitor") || partLower.includes("run capacitor")) &&
            targetComponent.toLowerCase().includes("condensing")
          ) {
            score += 2;
            reasons.push("Condensing-side start/run failure pattern matches capacitor verification");
          }

          if (
            (partLower.includes("fan motor") || partLower.includes("blower motor")) &&
            ((deltaT !== null && deltaT < 14) ||
              issue.includes("ice") ||
              issue.includes("icing") ||
              issue.includes("freeze"))
          ) {
            score += 2;
            reasons.push("Airflow / freeze pattern says motor verification is important");
          }

          if (
            (partLower.includes("defrost") || partLower.includes("drain heater")) &&
            (issue.includes("ice") || issue.includes("icing") || issue.includes("freeze"))
          ) {
            score += 2;
            reasons.push("Freeze-up complaint supports defrost-path verification");
          }

          if (
            (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) &&
            superheat !== null &&
            subcool !== null &&
            ((superheat > 18 && subcool < 5) || (superheat > 18 && subcool > 15))
          ) {
            score += 2;
            reasons.push("Readings pattern supports feed / restriction verification");
          }

          if (
            partLower.includes("condenser fan motor") &&
            headPressure !== null &&
            ambientTemp !== null &&
            headPressure > ambientTemp * 3.2
          ) {
            score += 2;
            reasons.push("High head relative to ambient supports heat-rejection checks");
          }

          if (
            (partLower.includes("float switch") || partLower.includes("drain")) &&
            targetComponent.toLowerCase().includes("air handler")
          ) {
            score += 1;
            reasons.push("Indoor unit / drain safety path is in play");
          }

          if (
            (partLower.includes("ignitor") ||
              partLower.includes("flame sensor") ||
              partLower.includes("pressure switch")) &&
            targetComponent.toLowerCase().includes("furnace")
          ) {
            score += 2;
            reasons.push("Heating sequence path supports this verification");
          }

          let confidence = "Verify first";
          if (score >= 4) confidence = "High confidence";
          if (score <= 1) confidence = "Low confidence / callback risk";

          if (confidence === "High confidence") {
            prove.push("Prove this with meter/sequence/readings before replacing, but it is strongly in play.");
          } else if (confidence === "Verify first") {
            prove.push("This is in play, but the system still needs verification before a blind swap.");
          } else {
            prove.push("Do not replace this blindly unless you eliminate the stronger paths first.");
          }

          const seenReasons = new Set<string>();
          const dedupedReasons = reasons.filter((reason) => {
            const key = reason.trim().toLowerCase();
            if (!key || seenReasons.has(key)) return false;
            seenReasons.add(key);
            return true;
          });

          const seenProve = new Set<string>();
          const dedupedProve = prove.filter((entry) => {
            const key = entry.trim().toLowerCase();
            if (!key || seenProve.has(key)) return false;
            seenProve.add(key);
            return true;
          });

          return {
            part: decision.part,
            confidence,
            reasons: dedupedReasons.slice(0, 3),
            prove: dedupedProve.slice(0, 3),
            blindRisk: decision.blindRisk,
            score,
          };
        });

        return items.sort((a, b) => b.score - a.score || a.part.localeCompare(b.part)).slice(0, 6);
      }

      // part-verification-checklist-v1
      const [selectedVerificationPart, setSelectedVerificationPart] = useState("");

      function buildPartVerificationChecklistItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const issue = String(symptom || "").trim();
        const suggestions = buildSuggestedPartsToVerifyItems();
        const suggestedPartNames = suggestions.map((item) => item.part);
        const selectedPart =
          String(selectedVerificationPart || "").trim() ||
          (suggestedPartNames.length ? suggestedPartNames[0] : "");

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const checklist: string[] = [];
        const notes: string[] = [];

        const add = (value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!checklist.some((item) => item.toLowerCase() === clean.toLowerCase())) {
            checklist.push(clean);
          }
        };

        const addNote = (value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!notes.some((item) => item.toLowerCase() === clean.toLowerCase())) {
            notes.push(clean);
          }
        };

        const partLower = selectedPart.toLowerCase();

        if (partLower.includes("contactor")) {
          add(t("pvc_contactor_1", lang));
          add(t("pvc_contactor_2", lang));
          add(t("pvc_contactor_3", lang));
          add(t("pvc_contactor_4", lang));
          addNote(t("pvc_note_contactor", lang));
        }

        if (partLower.includes("capacitor")) {
          add(t("pvc_capacitor_1", lang));
          add(t("pvc_capacitor_2", lang));
          add(t("pvc_capacitor_3", lang));
          add(t("pvc_capacitor_4", lang));
          addNote(t("pvc_note_capacitor", lang));
        }

        if (partLower.includes("condenser fan motor")) {
          add(t("pvc_cond_fan_1", lang));
          add(t("pvc_cond_fan_2", lang));
          add(t("pvc_cond_fan_3", lang));
          add(t("pvc_cond_fan_4", lang));
          if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
            addNote(t("pvc_note_cond_fan_head", lang));
          }
        }

        if (partLower.includes("evaporator fan motor")) {
          add(t("pvc_evap_fan_1", lang));
          add(t("pvc_evap_fan_2", lang));
          add(t("pvc_evap_fan_3", lang));
          add(t("pvc_evap_fan_4", lang));
          if (deltaT !== null && deltaT < 14) {
            addNote(t("pvc_note_evap_fan_split", lang));
          }
        }

        if (partLower.includes("defrost heater")) {
          add(t("pvc_defrost_heater_1", lang));
          add(t("pvc_defrost_heater_2", lang));
          add(t("pvc_defrost_heater_3", lang));
          add(t("pvc_defrost_heater_4", lang));
          addNote(t("pvc_note_defrost_heater", lang));
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          add(t("pvc_defrost_term_1", lang));
          add(t("pvc_defrost_term_2", lang));
          add(t("pvc_defrost_term_3", lang));
          add(t("pvc_defrost_term_4", lang));
          addNote(t("pvc_note_defrost_term", lang));
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          add(t("pvc_txv_1", lang));
          add(t("pvc_txv_2", lang));
          add(t("pvc_txv_3", lang));
          add(t("pvc_txv_4", lang));
          if (superheat !== null && subcool !== null) {
            addNote(t("pvc_note_txv_shsc", lang).replace("{sh}", String(superheat)).replace("{sc}", String(subcool)));
          }
        }

        if (partLower.includes("blower motor")) {
          add(t("pvc_blower_1", lang));
          add(t("pvc_blower_2", lang));
          add(t("pvc_blower_3", lang));
          add(t("pvc_blower_4", lang));
          if (deltaT !== null) {
            addNote(t("pvc_note_blower_split", lang).replace("{value}", String(deltaT)));
          }
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          add(t("pvc_float_1", lang));
          add(t("pvc_float_2", lang));
          add(t("pvc_float_3", lang));
          add(t("pvc_float_4", lang));
        }

        if (partLower.includes("ignitor")) {
          add(t("pvc_ignitor_1", lang));
          add(t("pvc_ignitor_2", lang));
          add(t("pvc_ignitor_3", lang));
          add(t("pvc_ignitor_4", lang));
        }

        if (partLower.includes("flame sensor")) {
          add(t("pvc_flame_1", lang));
          add(t("pvc_flame_2", lang));
          add(t("pvc_flame_3", lang));
          add(t("pvc_flame_4", lang));
        }

        if (partLower.includes("pressure switch")) {
          add(t("pvc_press_switch_1", lang));
          add(t("pvc_press_switch_2", lang));
          add(t("pvc_press_switch_3", lang));
          add(t("pvc_press_switch_4", lang));
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          add(t("pvc_water_1", lang));
          add(t("pvc_water_2", lang));
          add(t("pvc_water_3", lang));
          add(t("pvc_water_4", lang));
        }

        if (!checklist.length) {
          add(t("pvc_fallback_1", lang));
          add(t("pvc_fallback_2", lang));
          add(t("pvc_fallback_3", lang));
        }

        if (issue) {
          addNote(t("pvc_note_symptom_context", lang).replace("{value}", issue));
        }
        addNote(t("pvc_note_target_component", lang).replace("{value}", targetComponent));

        return {
          selectedPart,
          availableParts: suggestedPartNames,
          checklist: checklist.slice(0, 6),
          notes: notes.slice(0, 4),
        };
      }

      // verification-outcome-repair-commit-v1
      const [selectedVerificationOutcome, setSelectedVerificationOutcome] = useState("");
      const [verificationOutcomeNote, setVerificationOutcomeNote] = useState("");
      const [verificationOutcomeMessage, setVerificationOutcomeMessage] = useState("");

      function applyVerificationOutcomeAndRepairCommit() {
        const payload = buildPartVerificationChecklistItems();
        const selectedPart = String(payload.selectedPart || "").trim();
        const outcome = String(selectedVerificationOutcome || "").trim();

        if (!selectedPart) {
          setVerificationOutcomeMessage("Choose a part in Part Verification Checklist first.");
          return;
        }

        if (!outcome) {
          setVerificationOutcomeMessage("Choose a verification outcome first.");
          return;
        }

        const lines = [
          t("voc_note_title", lang),
          t("voc_note_part", lang).replace("{value}", selectedPart),
          t("voc_note_outcome", lang).replace("{value}", outcome),
          symptom ? t("voc_note_symptom", lang).replace("{value}", symptom) : "",
          getCurrentAffectedComponentLabelForAssist()
            ? t("voc_note_component", lang).replace("{value}", String(getCurrentAffectedComponentLabelForAssist()))
            : "",
          verificationOutcomeNote.trim() ? t("voc_note_note", lang).replace("{value}", verificationOutcomeNote.trim()) : "",
        ].filter(Boolean);

        const block = lines.join("\n");

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), block].filter(Boolean).join("\n\n")
        );

        if (outcome === "Replaced") {
          setPartsReplaced((prev) => {
            const current = String(prev || "").trim();
            const existing = current
              .split(/[;,]/)
              .map((entry) => entry.trim().toLowerCase())
              .filter(Boolean);

            if (existing.includes(selectedPart.toLowerCase())) {
              return current;
            }

            return [current, selectedPart].filter(Boolean).join(", ");
          });

          setActualFixPerformed((prev) => {
            const current = String(prev || "").trim();
            const repairLine = `Replaced ${selectedPart}`;
            if (current.toLowerCase().includes(repairLine.toLowerCase())) {
              return current;
            }
            return [current, repairLine].filter(Boolean).join("; ");
          });
        }

        setVerificationOutcomeMessage(t("voc_added_to_notes", lang));
      }

      // suggested-follow-up-watchlist-v1
      const [followUpWatchlistMessage, setFollowUpWatchlistMessage] = useState("");

      function buildSuggestedFollowUpWatchlist() {
        const checklist = buildPartVerificationChecklistItems();
        const selectedPart = String(checklist.selectedPart || selectedVerificationPart || "").trim();
        const selectedOutcome = String(selectedVerificationOutcome || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const issue = String(symptom || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const note = String(verificationOutcomeNote || "").trim();

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const watchNext: string[] = [];
        const callbackRisk: string[] = [];
        const recheckItems: string[] = [];
        const monitoringNote: string[] = [];

        const addUnique = (items: string[], value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!items.some((item) => item.trim().toLowerCase() === clean.toLowerCase())) {
            items.push(clean);
          }
        };

        addUnique(watchNext, t("sfw_selected_part_path", lang).replace("{value}", selectedPart || t("sfw_no_part_selected", lang)));
        addUnique(watchNext, t("pvc_note_target_component", lang).replace("{value}", targetComponent));

        if (selectedOutcome) {
          addUnique(monitoringNote, t("sfw_verification_outcome", lang).replace("{value}", selectedOutcome));
        }

        const partLower = selectedPart.toLowerCase();

        if (partLower.includes("contactor")) {
          addUnique(watchNext, t("sfw_watch_contactor", lang));
          addUnique(recheckItems, t("sfw_recheck_contactor1", lang));
          addUnique(recheckItems, t("sfw_recheck_contactor2", lang));
          addUnique(callbackRisk, t("sfw_risk_contactor", lang));
        }

        if (partLower.includes("capacitor")) {
          addUnique(watchNext, t("sfw_watch_capacitor", lang));
          addUnique(recheckItems, t("sfw_recheck_capacitor1", lang));
          addUnique(recheckItems, t("sfw_recheck_capacitor2", lang));
          addUnique(callbackRisk, t("sfw_risk_capacitor", lang));
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(watchNext, t("sfw_watch_cond_fan", lang));
          addUnique(recheckItems, t("sfw_recheck_cond_fan", lang));
          if (headPressure !== null && ambientTemp !== null) {
            addUnique(monitoringNote, t("sfw_note_head_ambient", lang).replace("{head}", String(headPressure)).replace("{ambient}", String(ambientTemp)));
          }
          addUnique(callbackRisk, t("sfw_risk_cond_fan", lang));
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(watchNext, t("sfw_watch_evap_fan", lang));
          addUnique(recheckItems, t("sfw_recheck_evap_fan", lang));
          if (deltaT !== null) {
            addUnique(monitoringNote, t("sfw_note_air_split", lang).replace("{value}", String(deltaT)));
          }
          addUnique(callbackRisk, t("sfw_risk_evap_fan", lang));
        }

        if (partLower.includes("defrost heater")) {
          addUnique(watchNext, t("sfw_watch_defrost_heater", lang));
          addUnique(recheckItems, t("sfw_recheck_defrost_heater", lang));
          if (boxTemp !== null) {
            addUnique(monitoringNote, t("sfw_note_box_temp", lang).replace("{value}", String(boxTemp)));
          }
          addUnique(callbackRisk, t("sfw_risk_defrost_heater", lang));
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(watchNext, t("sfw_watch_defrost_term", lang));
          addUnique(recheckItems, t("sfw_recheck_defrost_term", lang));
          addUnique(callbackRisk, t("sfw_risk_defrost_term", lang));
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(watchNext, t("sfw_watch_txv", lang));
          addUnique(recheckItems, t("sfw_recheck_txv", lang));
          if (superheat !== null && subcool !== null) {
            addUnique(monitoringNote, t("sfw_note_shsc", lang).replace("{sh}", String(superheat)).replace("{sc}", String(subcool)));
          }
          addUnique(callbackRisk, t("sfw_risk_txv", lang));
        }

        if (partLower.includes("blower motor")) {
          addUnique(watchNext, t("sfw_watch_blower", lang));
          addUnique(recheckItems, t("sfw_recheck_blower", lang));
          if (deltaT !== null) {
            addUnique(monitoringNote, t("sfw_note_air_split", lang).replace("{value}", String(deltaT)));
          }
          addUnique(callbackRisk, t("sfw_risk_blower", lang));
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(watchNext, t("sfw_watch_float", lang));
          addUnique(recheckItems, t("sfw_recheck_float", lang));
          addUnique(callbackRisk, t("sfw_risk_float", lang));
        }

        if (partLower.includes("ignitor")) {
          addUnique(watchNext, t("sfw_watch_ignitor", lang));
          addUnique(recheckItems, t("sfw_recheck_ignitor", lang));
          addUnique(callbackRisk, t("sfw_risk_ignitor", lang));
        }

        if (partLower.includes("flame sensor")) {
          addUnique(watchNext, t("sfw_watch_flame", lang));
          addUnique(recheckItems, t("sfw_recheck_flame", lang));
          addUnique(callbackRisk, t("sfw_risk_flame", lang));
        }

        if (partLower.includes("pressure switch")) {
          addUnique(watchNext, t("sfw_watch_pressure_switch", lang));
          addUnique(recheckItems, t("sfw_recheck_pressure_switch", lang));
          addUnique(callbackRisk, t("sfw_risk_pressure_switch", lang));
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(watchNext, t("sfw_watch_water", lang));
          addUnique(recheckItems, t("sfw_recheck_water", lang));
          addUnique(callbackRisk, t("sfw_risk_water", lang));
        }

        if (equipment.includes("walk-in")) {
          addUnique(watchNext, t("sfw_watch_walkin", lang));
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(watchNext, t("sfw_watch_icing", lang));
          addUnique(callbackRisk, t("sfw_risk_icing", lang));
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          addUnique(watchNext, t("sfw_watch_nocool", lang));
        }

        if (selectedOutcome === "Tested good") {
          addUnique(monitoringNote, t("sfw_note_tested_good", lang));
        }

        if (selectedOutcome === "Needs more testing") {
          addUnique(monitoringNote, t("sfw_note_needs_testing", lang));
        }

        if (note) {
          addUnique(monitoringNote, t("sfw_note_tech_note", lang).replace("{value}", note));
        }

        if (!watchNext.length) {
          addUnique(watchNext, t("sfw_watch_fallback", lang));
        }

        if (!recheckItems.length) {
          addUnique(recheckItems, t("sfw_recheck_fallback", lang));
        }

        if (!callbackRisk.length) {
          addUnique(callbackRisk, t("sfw_risk_fallback", lang));
        }

        return {
          selectedPart,
          selectedOutcome,
          watchNext: watchNext.slice(0, 5),
          callbackRisk: callbackRisk.slice(0, 4),
          recheckItems: recheckItems.slice(0, 5),
          monitoringNote: monitoringNote.slice(0, 4),
        };
      }

      function applySuggestedFollowUpWatchlist() {
        const payload = buildSuggestedFollowUpWatchlist();

        const text = [
          t("sfw_notes_title", lang),
          payload.selectedPart ? t("sfw_notes_part", lang).replace("{value}", payload.selectedPart) : "",
          payload.selectedOutcome ? t("sfw_notes_outcome", lang).replace("{value}", payload.selectedOutcome) : "",
          payload.watchNext.length ? t("sfw_notes_watch_next", lang) + payload.watchNext.join("\n- ") : "",
          payload.recheckItems.length ? t("sfw_notes_recheck_items", lang) + payload.recheckItems.join("\n- ") : "",
          payload.callbackRisk.length ? t("sfw_notes_callback_risk", lang) + payload.callbackRisk.join("\n- ") : "",
          payload.monitoringNote.length ? t("sfw_notes_monitoring", lang) + payload.monitoringNote.join("\n- ") : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        setDiagnosticCloseoutDrafts((prev) => ({
          ...prev,
          followUp: [String(prev.followUp || "").trim(), text].filter(Boolean).join("\n\n"),
        }));

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), text].filter(Boolean).join("\n\n")
        );

        setFollowUpWatchlistMessage(t("sfw_added_to_notes", lang));
      }

      // repair-execution-assist-v1
      function buildRepairExecutionAssist() {
        const checklist = buildPartVerificationChecklistItems();
        const selectedPart = String(checklist.selectedPart || selectedVerificationPart || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || t("fallback_primary_component", lang)).trim();
        const componentLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim();
        const equipmentLower = equipment.toLowerCase();
        const currentSymptom = String(symptom || "").trim();
        const makeModel = [manufacturer, model].filter(Boolean).join(" ").trim();
        const photoSubjectLabel = String(photoAssistSubject || "").trim().replaceAll("_", " ");
        const outcome = String(selectedVerificationOutcome || "").trim();

        const verifyFirst: string[] = [];
        const replaceSteps: string[] = [];
        const safety: string[] = [];
        const mistakes: string[] = [];
        const watchAfterRepair: string[] = [];

        const addUnique = (items: string[], value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!items.some((item) => item.trim().toLowerCase() === clean.toLowerCase())) {
            items.push(clean);
          }
        };

        if (!selectedPart) {
          return {
            selectedPart: "",
            title: "",
            verifyFirst,
            replaceSteps,
            safety,
            mistakes,
            watchAfterRepair,
            youtubeSearchUrl: "",
            webSearchUrl: "",
            searchQuery: "",
          };
        }

        const partLower = selectedPart.toLowerCase();

        addUnique(safety, "De-energize and verify power is actually off before opening or moving wires/components.");
        addUnique(safety, "Take a clear photo of wiring and component orientation before removal.");
        addUnique(safety, "Verify you are on the correct component side of the system before replacing parts.");

        if (partLower.includes("contactor")) {
          addUnique(verifyFirst, "Verify line voltage into the contactor.");
          addUnique(verifyFirst, "Verify coil voltage when there is an active call.");
          addUnique(verifyFirst, "Check contact drop and confirm the contactor is actually failing under load.");
          addUnique(replaceSteps, "Label/photograph wires before removal.");
          addUnique(replaceSteps, "Match coil voltage, pole configuration, and amp rating.");
          addUnique(replaceSteps, "Move one wire at a time and tighten all lugs properly.");
          addUnique(replaceSteps, "Recheck operation with the call active.");
          addUnique(mistakes, "Replacing the contactor without checking whether motor/compressor load caused the failure.");
          addUnique(mistakes, "Using the wrong coil voltage or mislanding line/load wires.");
          addUnique(watchAfterRepair, "Watch compressor and fan startup, line/load voltage, and wire heat after repair.");
        }

        if (partLower.includes("capacitor")) {
          addUnique(verifyFirst, "Test actual capacitance first.");
          addUnique(verifyFirst, "Compare connected motor/compressor amp draw to expected operation.");
          addUnique(replaceSteps, "Discharge capacitor safely before handling.");
          addUnique(replaceSteps, "Match capacitance and voltage rating exactly.");
          addUnique(replaceSteps, "Reconnect terminals carefully using your before photo.");
          addUnique(mistakes, "Swapping a capacitor before checking if the motor/compressor is causing repeat failure.");
          addUnique(mistakes, "Installing the wrong µF rating.");
          addUnique(watchAfterRepair, "Watch startup behavior, amp draw, and whether the symptom returns quickly.");
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(verifyFirst, "Verify voltage to the motor and correct fan rotation.");
          addUnique(verifyFirst, "Check capacitor, blade condition, and amp draw before replacement.");
          addUnique(replaceSteps, "Match RPM, horsepower, voltage, rotation, shaft, and mounting.");
          addUnique(replaceSteps, "Transfer blade carefully and set the blade height correctly.");
          addUnique(replaceSteps, "Verify capacitor sizing and wiring after installation.");
          addUnique(mistakes, "Calling the motor before checking coil condition, capacitor, and voltage.");
          addUnique(watchAfterRepair, "Watch head pressure, airflow, amp draw, and coil heat rejection after repair.");
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(verifyFirst, "Verify fan command, voltage, and airflow path.");
          addUnique(verifyFirst, "Check for ice, drain issues, and defrost problems before replacement.");
          addUnique(replaceSteps, "Match voltage, rotation, speed/module type, and mounting.");
          addUnique(replaceSteps, "Verify blade/wheel position and airflow direction after replacement.");
          addUnique(mistakes, "Replacing the motor when the real issue is defrost, drain, or blocked airflow.");
          addUnique(watchAfterRepair, "Watch airflow, frost return, drain performance, and temperature pull-down.");
        }

        if (partLower.includes("defrost heater")) {
          addUnique(verifyFirst, "Check heater continuity and verify the control is actually calling for heat.");
          addUnique(verifyFirst, "Check termination/control path and drain condition.");
          addUnique(replaceSteps, "Confirm the replacement heater matches length, wattage, voltage, and mounting style.");
          addUnique(replaceSteps, "Route and secure wiring away from sharp edges and heat damage points.");
          addUnique(mistakes, "Replacing the heater without proving the defrost control/termination path.");
          addUnique(watchAfterRepair, "Watch the next full defrost cycle and confirm the ice pattern does not return.");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(verifyFirst, "Verify actual defrost timing, termination state, and heater output.");
          addUnique(replaceSteps, "Match the replacement control/termination part to the exact application.");
          addUnique(replaceSteps, "Verify fan delay / termination logic after installation.");
          addUnique(mistakes, "Changing control logic without verifying the actual sequence problem.");
          addUnique(watchAfterRepair, "Watch the next defrost cycle, fan delay, and box recovery.");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(verifyFirst, "Verify airflow first.");
          addUnique(verifyFirst, "Compare frost pattern, superheat, subcool, and restriction path before replacement.");
          addUnique(replaceSteps, "Use proper pump-down/recovery procedure as applicable.");
          addUnique(replaceSteps, "Protect the valve from overheating during brazing and follow OEM installation practice.");
          addUnique(replaceSteps, "Recheck airflow and SH/SC after the system stabilizes.");
          addUnique(mistakes, "Replacing the metering device when airflow or restriction was the real issue.");
          addUnique(watchAfterRepair, "Watch SH/SC trend, frost pattern, and system pull-down after repair.");
        }

        if (partLower.includes("blower motor")) {
          addUnique(verifyFirst, "Verify board/relay/module output and drain safety first.");
          addUnique(verifyFirst, "Check wheel, airflow restriction, and amp draw.");
          addUnique(replaceSteps, "Match speed/module type, voltage, rotation, and mounting.");
          addUnique(replaceSteps, "Verify blower wheel condition and correct wheel depth after install.");
          addUnique(mistakes, "Replacing the blower when the real issue is control output or drain interruption.");
          addUnique(watchAfterRepair, "Watch airflow, split, amp draw, and drain safety behavior.");
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(verifyFirst, "Verify actual drain condition before replacing the switch.");
          addUnique(replaceSteps, "Install the switch so it trips at the correct water level and does not interfere with service access.");
          addUnique(mistakes, "Replacing the switch without fixing the actual drain problem.");
          addUnique(watchAfterRepair, "Watch drain flow and confirm the circuit no longer trips unexpectedly.");
        }

        if (partLower.includes("ignitor")) {
          addUnique(verifyFirst, "Verify the full heat call and board output first.");
          addUnique(replaceSteps, "Handle the ignitor carefully and avoid contaminating the element.");
          addUnique(mistakes, "Changing the ignitor without checking pressure-switch / board / flame-proving issues.");
          addUnique(watchAfterRepair, "Watch multiple ignition cycles and flame establishment.");
        }

        if (partLower.includes("flame sensor")) {
          addUnique(verifyFirst, "Verify flame signal and burner carryover before replacement.");
          addUnique(replaceSteps, "Use the correct sensor and confirm good grounding / flame contact path.");
          addUnique(mistakes, "Replacing the sensor when the real issue is ignition quality or grounding.");
          addUnique(watchAfterRepair, "Watch multiple heat cycles for stable flame proving.");
        }

        if (partLower.includes("pressure switch")) {
          addUnique(verifyFirst, "Verify inducer operation, tubing, venting, and condensate path first.");
          addUnique(replaceSteps, "Match the replacement switch to the correct pressure rating/application.");
          addUnique(mistakes, "Replacing the switch when the draft or drainage problem still exists.");
          addUnique(watchAfterRepair, "Watch the full heat cycle and verify pressure proving stays stable.");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(verifyFirst, "Separate sequence/control issues from actual component failure.");
          addUnique(replaceSteps, "Match the replacement part to the exact water-side function and sequence location.");
          addUnique(mistakes, "Replacing water-side parts before confirming the correct sequence fault.");
          addUnique(watchAfterRepair, "Watch the next full sequence and verify correct timing/response.");
        }

        if (!verifyFirst.length) {
          addUnique(verifyFirst, "Verify the selected part matches the complaint, component, and strongest test results first.");
          addUnique(replaceSteps, "Document wiring/orientation before removal and verify the exact replacement match.");
          addUnique(mistakes, "Do not replace the part blindly without proving the failure path.");
          addUnique(watchAfterRepair, "Watch the equipment through a full operating cycle after the repair.");
        }

        if (componentLower.includes("condensing") || componentLower.includes("outdoor")) {
          addUnique(safety, "Use extra caution around line voltage, condenser fan blade hazards, and compressor terminals.");
        }

        if (componentLower.includes("evaporator") || componentLower.includes("indoor")) {
          addUnique(safety, "Watch for ice, wet surfaces, and drain/water issues while servicing the indoor/evap side.");
        }

        if (equipmentLower.includes("walk-in")) {
          addUnique(safety, "Confirm box/product conditions and avoid creating a long outage during the replacement.");
        }

        if (currentSymptom) {
          addUnique(watchAfterRepair, `Confirm the original complaint "${currentSymptom}" is actually resolved before leaving.`);
        }

        const queryParts = [
          manufacturer,
          model,
          equipment,
          targetComponent,
          selectedPart,
          photoSubjectLabel,
          "repair"
        ].filter(Boolean);

        const searchQuery = queryParts.join(" ");
        const youtubeSearchUrl = selectedPart
          ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
          : "";
        const webSearchUrl = selectedPart
          ? `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
          : "";

        return {
          selectedPart,
          title: `${selectedPart} Repair Execution Assist`,
          verifyFirst: verifyFirst.slice(0, 5),
          replaceSteps: replaceSteps.slice(0, 5),
          safety: safety.slice(0, 4),
          mistakes: mistakes.slice(0, 4),
          watchAfterRepair: watchAfterRepair.slice(0, 5),
          youtubeSearchUrl,
          webSearchUrl,
          searchQuery,
        };
      }

      // circuit-awareness-v1
      const [circuitCount, setCircuitCount] = useState("1");
      const [selectedCircuit, setSelectedCircuit] = useState("Circuit 1");
      const [customCircuitLabel, setCustomCircuitLabel] = useState("");

      function buildCircuitOptions(countValue: string) {
        const n = Number.parseInt(String(countValue || "1"), 10);
        const safeCount = Number.isFinite(n) && n > 0 ? Math.min(n, 8) : 1;
        const options: string[] = [];
        for (let i = 1; i <= safeCount; i += 1) {
          options.push(`Circuit ${i}`);
        }
        options.push("Custom");
        return options;
      }

      function getSelectedCircuitDisplay() {
        if (selectedCircuit === "Custom") {
          return String(customCircuitLabel || "").trim();
        }
        return String(selectedCircuit || "").trim();
      }

      function stripCircuitLineFromNotes(text: string) {
        return String(text || "")
          .split("\n")
          .filter((line) => !line.trim().toLowerCase().startsWith("circuit:"))
          .join("\n")
          .trim();
      }

      function buildTechNotesWithCircuit(baseText: string) {
        const clean = stripCircuitLineFromNotes(baseText);
        const circuitLabel = getSelectedCircuitDisplay();
        return [circuitLabel ? `Circuit: ${circuitLabel}` : "", clean].filter(Boolean).join("\n");
      }

      function hydrateCircuitFromNotes(text: string) {
        const raw = String(text || "");
        const lines = raw.split("\n");
        const circuitLine = lines.find((line) => line.trim().toLowerCase().startsWith("circuit:"));

        if (!circuitLine) {
          setSelectedCircuit("Circuit 1");
          setCustomCircuitLabel("");
          return stripCircuitLineFromNotes(raw);
        }

        const value = circuitLine.split(":").slice(1).join(":").trim();
        const match = /^Circuit\s+(\d+)$/i.exec(value);

        if (match) {
          const num = Number.parseInt(match[1], 10);
          if (Number.isFinite(num) && num > 0) {
            setCircuitCount(String(Math.max(num, Number.parseInt(String(circuitCount || "1"), 10) || 1)));
            setSelectedCircuit(`Circuit ${num}`);
            setCustomCircuitLabel("");
          } else {
            setSelectedCircuit("Circuit 1");
            setCustomCircuitLabel("");
          }
        } else if (value) {
          setSelectedCircuit("Custom");
          setCustomCircuitLabel(value);
        } else {
          setSelectedCircuit("Circuit 1");
          setCustomCircuitLabel("");
        }

        return stripCircuitLineFromNotes(raw);
      }

  const [repairGuidanceMode, setRepairGuidanceMode] =
  useState<"apprentice" | "experienced">("apprentice");

  const supabase = createSupabaseClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
const [needsCompanyOnboarding, setNeedsCompanyOnboarding] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<"create" | "join">("create");
  const [joinCode, setJoinCode] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
const [onboardingCompanyName, setOnboardingCompanyName] = useState("");
const [onboardingBusy, setOnboardingBusy] = useState(false);
const [onboardingMessage, setOnboardingMessage] = useState("");
const [serviceEventPhotoUrls, setServiceEventPhotoUrls] = useState<string[]>([]);
const [serviceEventPhotoBusy, setServiceEventPhotoBusy] = useState(false);
const [serviceEventPhotoMessage, setServiceEventPhotoMessage] = useState("");
const [editingServiceEventId, setEditingServiceEventId] = useState("");
const [historicalEntryMode, setHistoricalEntryMode] = useState(false);

const siteUnitsAtLocation = savedUnits.filter((u) => {
  const sameCustomer =
    String(u.customerName || "").trim().toLowerCase() ===
    String(customerName || "").trim().toLowerCase();

  const sameSite =
    String(u.siteName || "").trim().toLowerCase() ===
    String(siteName || "").trim().toLowerCase();

  return Boolean(customerName.trim() && siteName.trim() && sameCustomer && sameSite);
});

  const [showAiChatBot, setShowAiChatBot] = useState(false);

  const { tier, isPaid, isAdmin, can, loading: subLoading } = useSubscription();

  const [showHvacCalculators, setShowHvacCalculators] = useState(false);

  useEffect(() => {
  listUnitsForCurrentUser()
    .then((rows: import("../lib/supabase/work-orders").UnitRow[]) => {
      const mapped = rows.map((r: import("../lib/supabase/work-orders").UnitRow) => ({
        id: r.id,
        savedAt: r.created_at || "",
        customerName: r.customer_name || "",
        siteName: r.site_name || "",
        siteAddress: r.site_address || "",
        unitNickname: r.unit_nickname || "",
        propertyType: r.property_type || "",
        equipmentType: r.equipment_type || "",
        manufacturer: r.manufacturer || "",
        model: r.model || "",
        refrigerantType: r.refrigerant_type || "",
        symptom: "",
        errorCode: "",
        errorCodeSource: "",
        selectedPackId: "",
        flowNodeId: "",
        flowHistory: [],
        observations: [],
        rawResult: "",
        nameplate: null,
        finalConfirmedCause: "",
        actualFixPerformed: "",
        outcomeStatus: "Not Set",
        callbackOccurred: "No",
        techCloseoutNotes: "",
      }));
      setSavedUnits(mapped);
    })
    .catch(() => setSavedUnits([]));
}, []);

useEffect(() => {
  supabase.auth.getSession().then(async ({ data }: { data: { session: { user?: { email?: string | null } } | null } }) => {
    setIsLoggedIn(!!data.session);
    setUserEmail(data.session?.user?.email || "");
    try {
      const membership = await getCurrentUserMembership();
      const needs = !membership;
      setNeedsCompanyOnboarding(needs);
    } catch(e) {
      console.error('Membership check failed:', e);
      setNeedsCompanyOnboarding(false);
    }
    setAuthChecked(true);
  });
}, [supabase]);

  const parsed = useMemo(() => parseDiagnosis(rawResult), [rawResult]);

  const chargeAnalysis = useMemo(
    () => analyzeCharge(observations, equipmentType, refrigerantType, lang),
    [observations, equipmentType, refrigerantType, lang]
  );

  const airflowAnalysis = useMemo(() => analyzeAirflow(observations, lang), [observations, lang]);

const defrostAnalysis = useMemo(
  () => analyzeDefrost(observations, equipmentType, symptom, lang),
  [observations, equipmentType, symptom, lang]
);

const defrostRepairGuidance = useMemo(
  () => buildDefrostRepairGuidance(observations, equipmentType, symptom, lang),
  [observations, equipmentType, symptom, lang]
);

  const equipmentMemory = useMemo(
    () =>
      buildEquipmentMemoryInsight(savedUnits, {
        customerName,
        siteName,
        unitNickname,
        model,
        manufacturer,
        equipmentType,
      }, lang),
    [savedUnits, customerName, siteName, unitNickname, model, manufacturer, equipmentType, lang]
  );

  const currentFlowNode = useMemo(
    () => selectedPack.nodes.find((n) => n.id === flowNodeId) || selectedPack.nodes[0],
    [selectedPack, flowNodeId]
  );

const errorCodeGuidance = useMemo(
  () =>
    buildErrorCodeGuidance({
      manufacturer,
      model,
      equipmentType,
      errorCode,
      errorCodeSource,
    }),
  [manufacturer, model, equipmentType, errorCode, errorCodeSource]
);

  const libraryEquipmentTypeOptions = useMemo(
  () =>
    Array.from(
      new Set(savedUnits.map((u) => (u.equipmentType || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b)),
  [savedUnits]
);

const libraryManufacturerOptions = useMemo(
  () =>
    Array.from(
      new Set(savedUnits.map((u) => (u.manufacturer || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b)),
  [savedUnits]
);

const libraryModelOptions = useMemo(
  () =>
    Array.from(
      new Set(savedUnits.map((u) => (u.model || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b)),
  [savedUnits]
);

const libraryCompanyOptions = useMemo(
  () =>
    Array.from(
      new Set(savedUnits.map((u) => (u.companyName || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b)),
  [savedUnits]
);

  const filteredLibraryUnits = useMemo(() => {
  const q = unitLibrarySearch.trim().toLowerCase();

  const fromTs = unitLibraryDateFrom
    ? new Date(`${unitLibraryDateFrom}T00:00:00`).getTime()
    : null;

  const toTs = unitLibraryDateTo
    ? new Date(`${unitLibraryDateTo}T23:59:59`).getTime()
    : null;

  let rows = [...savedUnits];

  if (unitLibraryMode === "recent") {
    rows = rows.slice(0, 25);
  }

  if (q) {
    rows = rows.filter((u) =>
      [
        u.customerName,
        u.siteName,
        u.siteAddress,
        u.unitNickname,
        u.equipmentType,
        u.manufacturer,
        u.model,
        u.refrigerantType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  if (unitLibraryEquipmentType) {
    rows = rows.filter((u) => (u.equipmentType || "") === unitLibraryEquipmentType);
  }

  if (unitLibraryManufacturer) {
    rows = rows.filter((u) => (u.manufacturer || "") === unitLibraryManufacturer);
  }

  if (unitLibraryModel) {
    rows = rows.filter((u) => (u.model || "") === unitLibraryModel);
  }

  if (unitLibraryCompany) {
    rows = rows.filter((u) => (u.companyName || "") === unitLibraryCompany);
  }

  if (fromTs || toTs) {
    rows = rows.filter((u) => {
      const ts = u.savedAt ? new Date(u.savedAt).getTime() : null;
      if (!ts) return false;
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      return true;
    });
  }

  return rows;
}, [
  savedUnits,
  unitLibrarySearch,
  unitLibraryMode,
  unitLibraryDateFrom,
  unitLibraryDateTo,
  unitLibraryEquipmentType,
  unitLibraryManufacturer,
  unitLibraryModel,
  unitLibraryCompany,
]);

  const repairGuidance = useMemo(
  () => buildRepairGuidance(parsed, equipmentType),
  [parsed, equipmentType]
);

  const measurementOptions =
    parsed?.field_measurements_to_collect?.map((m) => m.measurement) || [];

  const measurementCoaching = useMemo(
    () => buildMeasurementCoaching(measurementOptions),
    [measurementOptions]
  );

  function resetFlowForPack(packId: string) {
    const pack = SYMPTOM_PACKS.find((p) => p.id === packId) || SYMPTOM_PACKS[0];
    setFlowNodeId(pack.nodes[0]?.id || "");
    setFlowHistory([]);
  }

  function selectPack(packId: string) {
    const pack = SYMPTOM_PACKS.find((p) => p.id === packId) || SYMPTOM_PACKS[0];
    setSelectedPackId(pack.id);
    setSymptom(pack.defaultSymptom);
    resetFlowForPack(pack.id);
    if (pack.nodes[0]?.suggestedMeasurement) {
      setObsLabel(pack.nodes[0].suggestedMeasurement);
      setObsUnit(guessDefaultUnit(pack.nodes[0].suggestedMeasurement));
    }
  }

  function advanceFlow(choice: "PASS" | "FAIL") {
    if (!currentFlowNode) return;
    const nextId =
      choice === "PASS"
        ? currentFlowNode.passNext ?? null
        : currentFlowNode.failNext ?? null;
    setFlowHistory((prev) => [...prev, { nodeId: currentFlowNode.id, choice, nextId }]);
    if (nextId) {
      setFlowNodeId(nextId);
      const nextNode = selectedPack.nodes.find((n) => n.id === nextId);
      if (nextNode?.suggestedMeasurement) {
        setObsLabel(nextNode.suggestedMeasurement);
        setObsUnit(guessDefaultUnit(nextNode.suggestedMeasurement));
      }
    }
  }

  function applyPreset(label: string, unit: string) {
    setObsLabel(label);
    setObsUnit(unit);
    setObsValue("");
    setObsNote("");
  }

  function addSuggestedMeasurementFromFlow() {
    if (!currentFlowNode?.suggestedMeasurement) return;
    setObsLabel(currentFlowNode.suggestedMeasurement);
    setObsUnit(guessDefaultUnit(currentFlowNode.suggestedMeasurement));
  }

  function addMeasurement() {
    const label = obsLabel.trim();
    const rawValue = obsValue.trim();
    const unit = obsUnit.trim();
    if (!label || !rawValue) return;

    const n = toNumber(rawValue);
    let chosenUnit = unit === "other" ? guessDefaultUnit(label) : unit;
    let finalValue = rawValue;
    let finalUnit = chosenUnit;
    let finalNote = (obsNote.trim() || "").trim();

    if (autoConvert && n !== null) {
      const converted = convertToStandard(n, chosenUnit);
      if (converted) {
        const rounded = Math.round(converted.value * 10) / 10;
        finalValue = String(rounded);
        finalUnit = converted.unit;
        const original = `${rawValue} ${chosenUnit}`.trim();
        const convNote = `entered ${original} (converted to ${rounded} ${converted.unit})`;
        finalNote = finalNote ? `${finalNote}; ${convNote}` : convNote;
      }
    }

    setObservations((prev) => [
      ...prev,
      { label, value: finalValue, unit: finalUnit, note: finalNote || undefined },
    ]);
    setObsValue("");
    setObsNote("");
  }

  function addGaugeReadingsToMeasurements() {
    if (!gaugeRead) return;

    const next: Observation[] = [];
    if (gaugeRead.suction_psi !== null) {
      next.push({
        label: "Suction Pressure",
        value: String(gaugeRead.suction_psi),
        unit: "psi",
        note: "Imported from gauge photo",
      });
    }
    if (gaugeRead.head_psi !== null) {
      next.push({
        label: "Liquid Pressure",
        value: String(gaugeRead.head_psi),
        unit: "psi",
        note: "Imported from gauge photo",
      });
    }
    if (gaugeRead.low_sat_f !== null) {
      next.push({
        label: "Suction Saturation Temp",
        value: String(gaugeRead.low_sat_f),
        unit: "°F",
        note: "Imported from gauge photo",
      });
    }
    if (gaugeRead.high_sat_f !== null) {
      next.push({
        label: "Condensing Saturation Temp",
        value: String(gaugeRead.high_sat_f),
        unit: "°F",
        note: "Imported from gauge photo",
      });
    }

    if (next.length) {
      setObservations((prev) => [...prev, ...next]);
    }
  }

  function removeObservation(idx: number) {
    setObservations((prev) => prev.filter((_, i) => i !== idx));
  }

  function clearCurrentForm() {
    setCompanyName("");
    setCustomerName("");
    setSiteName("");
    setSiteAddress("");
    setUnitNickname("");
    setPropertyType("Commercial");
    setEquipmentType("RTU");
    setManufacturer("");
    setModel("");
    setSymptom("");
    setRefrigerantType("Unknown");
    setObservations([]);
    setRawResult("");
    setNameplate(null);
    setNameplateImage("");
    setManualsParts(null);
    setMpErr("");
    setNameplateErr("");
    setPhotoImage("");
    setPhotoResult("");
    setPhotoError("");
    setGaugeImage("");
    setGaugeErr("");
    setGaugeRead(null);
    setSelectedPackId("no_cooling");
    setErrorCode("");
    setErrorCodeSource("Control Board");
    setFinalConfirmedCause("");
    setActualFixPerformed("");
    setPartsReplaced("");
    setOutcomeStatus("Not Set");
    setCallbackOccurred("No");
    setTechCloseoutNotes("");
    setCurrentLoadedUnitId("");
    setServiceDate(new Date().toISOString().slice(0, 10));
    const pack = SYMPTOM_PACKS.find((p) => p.id === "no_cooling") || SYMPTOM_PACKS[0];
    setFlowNodeId(pack.nodes[0]?.id || "");
    setFlowHistory([]);
  }

  
  async function postDiagnose(payload: any) {
    const res = await fetch("/api/hvac-diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await safeJson(res);

    if (!res.ok) {
      setRawResult(data?.result || data?.error || `Server error (${res.status})`);
      return;
    }
    setRawResult(data?.result || "No result returned.");
  }

async function handleDiagnose() {
    const m = manufacturer.trim();
    const s = symptom.trim();
    if (!m || !s) {
      setRawResult("Please fill in at least Manufacturer and Symptom.");
      return;
    }

    setLoading(true);
    setRawResult("");
    try {
      await postDiagnose({
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        errorCode: errorCode.trim(),
        errorCodeSource,
        symptom: s,
        refrigerantType,
        observations,
        flowPack: selectedPack.label,
        flowHistory,
        chargeAnalysis,
        airflowAnalysis,
        equipmentMemory,
        lang,
      });
    } finally {
      setLoading(false);
    }
  }

async function updateDiagnosisNow() {
    const m = manufacturer.trim();
    const s = symptom.trim();
    if (!m || !s) {
      setRawResult("Please fill in at least Manufacturer and Symptom.");
      return;
    }

    setLoading(true);
    try {
      await postDiagnose({
        propertyType,
        equipmentType,
        manufacturer: m,
        model: model.trim(),
        symptom: s,
        refrigerantType,
        observations,
        flowPack: selectedPack.label,
        flowHistory,
        chargeAnalysis,
        airflowAnalysis,
        equipmentMemory,
        lang,
      });
    } finally {
      setLoading(false);
    }
  }

async function findManualsParts() {
    setMpBusy(true);
    setMpErr("");
    setManualsParts(null);
    try {
      const res = await fetch("/api/manuals-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          equipmentType,
          symptom: symptom.trim(),
          serial: nameplate?.serial || "",
          nameplate,
          query: symptom.trim(),
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        setMpErr(data?.result || data?.error || `Server error (${res.status})`);
        return;
      }

      if (typeof data?.result === "string") {
        try {
          setManualsParts(JSON.parse(data.result));
        } catch {
          setMpErr(data.result);
        }
      } else if (data?.data) {
        setManualsParts(data.data as ManualsParts);
      } else {
        setMpErr("Manuals/parts route returned an unexpected shape.");
      }
    } finally {
      setMpBusy(false);
    }
  }

async function onPickNameplateFile(file: File) {
    setNameplateErr("");
    setNameplate(null);
    const dataUrl = await readFileAsDataUrl(file);
    setNameplateImage(dataUrl);
  }

async function parseNameplate() {
    if (!nameplateImage) return;
    setNameplateBusy(true);
    setNameplateErr("");
    try {
      const res = await fetch("/api/nameplate-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: nameplateImage, equipmentType }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data?.ok) {
        setNameplateErr(data?.error || `Server error (${res.status})`);
        return;
      }
      const np = data.data as NameplateResult;
      setNameplate(np);

      if (np.manufacturer && !manufacturer.trim()) setManufacturer(np.manufacturer);
      if (np.model && !model.trim()) setModel(np.model);
      if (np.equipment_type && !equipmentType.trim()) setEquipmentType(np.equipment_type);
      if (np.refrigerant && refrigerantType === "Unknown") setRefrigerantType(np.refrigerant);
    } finally {
      setNameplateBusy(false);
    }
  }

async function analyzeGaugePhoto() {
    if (!gaugeImage) return;
    setGaugeBusy(true);
    setGaugeErr("");
    setGaugeRead(null);

    try {
      const res = await fetch("/api/gauge-photo-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: gaugeImage }),
      });
      const data = await safeJson(res);

      if (!res.ok || !data?.ok) {
        setGaugeErr(data?.error || data?.result || `Server error (${res.status})`);
        return;
      }

      setGaugeRead(data.data as GaugeReadResult);
    } finally {
      setGaugeBusy(false);
    }
  }

async function analyzePhoto() {
    if (!photoImage) return;
    setPhotoLoading(true);
    setPhotoError("");
    setPhotoResult("");

    try {
      const res = await fetch("/api/photo-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photoImage }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        setPhotoError(data?.error || data?.result || `Server error (${res.status})`);
        return;
      }

      setPhotoResult(data?.result || "No result returned.");
    } finally {
      setPhotoLoading(false);
    }
  }


function findLikelyDuplicateWithoutSerial() {
  const serialValue = serialNumber.trim();
  if (serialValue) return null;

  const customer = customerName.trim().toLowerCase();
  const site = siteName.trim().toLowerCase();
  const make = manufacturer.trim().toLowerCase();
  const modelValue = model.trim().toLowerCase();
  const tag = unitNickname.trim().toLowerCase();

  if (!customer || !site || !make || !modelValue) return null;

  return (
    savedUnits.find((u) => {
      const sameCustomer = (u.customerName || "").trim().toLowerCase() === customer;
      const sameSite = (u.siteName || "").trim().toLowerCase() === site;
      const sameMake = (u.manufacturer || "").trim().toLowerCase() === make;
      const sameModel = (u.model || "").trim().toLowerCase() === modelValue;
      const existingTag = (u.unitNickname || "").trim().toLowerCase();

      const needsReview =
        !tag || !existingTag || existingTag !== tag;

      return sameCustomer && sameSite && sameMake && sameModel && needsReview;
    }) || null
  );
}



  useEffect(() => {
    void loadFailureIntelligenceDashboardData();
  }, [savedUnits]);


  useEffect(() => {
    const id = requestAnimationFrame(() => refreshAutoGrowTextareas());
    return () => cancelAnimationFrame(id);
  }, [
    smartReadingsInput,
    symptom,
    finalConfirmedCause,
    actualFixPerformed,
    techCloseoutNotes,
    diagnosticCloseoutDrafts.customerSummary,
    diagnosticCloseoutDrafts.internalSummary,
    diagnosticCloseoutDrafts.followUp,
  ]);

async function updateCurrentLoadedUnit() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first.");
    return;
  }

  try {
    const updated = await updateUnitForCurrentUser(currentLoadedUnitId, {
      company_name: companyName || "",
      customer_name: customerName || "",
      site_name: siteName || "",
      site_address: siteAddress || "",
      unit_nickname: unitNickname || "",
      property_type: propertyType || "",
      equipment_type: equipmentType || "",
      manufacturer: manufacturer || "",
      model: model || "",
      serial: serialNumber || nameplate?.serial || "",
      refrigerant_type: refrigerantType || "",
    });

    saveLinkedEquipmentOverlayForUnit(updated.id || currentLoadedUnitId);
    setCurrentLoadedUnitId(updated.id || currentLoadedUnitId);

    alert("Loaded unit updated.");
  } catch (err) {
    console.error("UPDATE LOADED UNIT FAILED", err);
    alert("Could not update loaded unit. Check browser console.");
  }
}

async function saveCurrentUnit() {

// system-structure-save-guard-v2
const __systemType = String(systemType ?? "single").trim();
const __primaryTagState = String(primaryTagStatus ?? "readable").trim();
const __primaryTagReason = String(primaryTagIssueReason ?? "").trim();
const __primaryHasSupportId =
  String(unitNickname ?? "").trim().length > 0 ||
  String(manufacturer ?? "").trim().length > 0 ||
  String(model ?? "").trim().length > 0 ||
  String(serialNumber ?? "").trim().length > 0 ||
  String(nameplate?.serial ?? "").trim().length > 0;

const __linkedComponents = Array.isArray(linkedEquipmentComponents) ? linkedEquipmentComponents : [];
const __requiresLinkedComponents = __systemType !== "single";

if (__primaryTagState !== "readable") {
  if (!primaryCheckedInsideForInternalLabel) {
    window.alert(
      "Before saving a partial or unreadable primary component tag, check inside the electrical, fan, or control area for an internal label and confirm that step."
    );
    return;
  }

  if (!__primaryTagReason) {
    window.alert(
      "Add a short reason explaining why the primary component tag is partial or unreadable before saving."
    );
    return;
  }

  if (!__primaryHasSupportId) {
    window.alert(
      "Do not save a damaged or unreadable primary component tag without at least one supporting identifier like unit tag, manufacturer, model, or serial."
    );
    return;
  }
}

if (__requiresLinkedComponents && __linkedComponents.length === 0) {
  window.alert(
    "This system type requires linked equipment to be entered before saving. Add the indoor unit, furnace, air handler, evaporator, or other linked component(s) first."
  );
  return;
}

if (
  __systemType === "walk_in" &&
  !__linkedComponents.some((component) => String(component.role ?? "").trim() === "evaporator")
) {
  window.alert(
    "Walk-in systems must include at least one evaporator in the linked equipment section before saving."
  );
  return;
}

if (
  __systemType === "mini_split" &&
  !__linkedComponents.some((component) => String(component.role ?? "").trim() === "indoor_head")
) {
  window.alert(
    "Mini-split systems must include at least one indoor head in the linked equipment section before saving."
  );
  return;
}

for (const component of __linkedComponents) {
  const __role = String(component.role ?? "").trim();
  const __tag = String(component.tag ?? "").trim();
  const __manufacturer = String(component.manufacturer ?? "").trim();
  const __model = String(component.model ?? "").trim();
  const __serial = String(component.serial ?? "").trim();
  const __tagStatus = String(component.tagStatus ?? "readable").trim();
  const __tagReason = String(component.tagIssueReason ?? "").trim();

  if (!__role) {
    window.alert("Each linked component must have a component role before saving.");
    return;
  }

  if (!__tag && !__manufacturer && !__model && !__serial) {
    window.alert(
      "Each linked component must include at least one identifier like a tag, manufacturer, model, or serial before saving."
    );
    return;
  }

  if (__tagStatus !== "readable") {
    if (!component.checkedInsideForInternalLabel) {
      window.alert(
        "Before saving a partial or unreadable linked component tag, check inside the electrical, fan, or control area for an internal label and confirm that step."
      );
      return;
    }

    if (!__tagReason) {
      window.alert(
        "Add a short reason explaining why the linked component tag is partial or unreadable before saving."
      );
      return;
    }
  }
}

    // unit-tag-save-guard-v1
    const __unitTagGuardCustomer = String(customerName ?? "").trim();
    const __unitTagGuardSite = String(siteName ?? "").trim();
    const __unitTagGuardTag = String(unitNickname ?? "").trim();
    const __unitTagGuardSiteUnits = Array.isArray(siteUnitsAtLocation) ? siteUnitsAtLocation : [];
    if (
      __unitTagGuardCustomer &&
      __unitTagGuardSite &&
      __unitTagGuardSiteUnits.length >= 2 &&
      !__unitTagGuardTag
    ) {
      const proceedWithoutTag = window.confirm(
        "This site already has multiple saved units. Saving without a Unit Nickname / Tag can mix units up. Use a clear tag like RTU-1, RTU-2, WIC-1, Reach-In 3, or Merchandiser 2. Save anyway?"
      );
      if (!proceedWithoutTag) return;
    }


  
// paired-equipment-save-guard-v2
const __pairedType = String(pairedEquipmentType ?? "").trim();
const __secondaryTag = String(secondaryUnitTag ?? "").trim();
const __unitTagState = String(unitTagStatus ?? "readable").trim();
const __tagIssueReason = String(tagIssueReason ?? "").trim();
const __hasPrimaryTag = String(unitNickname ?? "").trim().length > 0;
const __hasSupportId =
  String(manufacturer ?? "").trim().length > 0 ||
  String(model ?? "").trim().length > 0 ||
  String(nameplate?.serial ?? "").trim().length > 0 ||
  __secondaryTag.length > 0;

if (__pairedType && __pairedType !== "none" && !__secondaryTag) {
  const continueWithoutMateTag = window.confirm(
    "This looks like paired equipment. Add the secondary / mate tag if available so linked equipment does not get mixed up. Save anyway without the mate tag?"
  );
  if (!continueWithoutMateTag) return;
}

if (__unitTagState !== "readable") {
  if (!checkedInsideForInternalLabel) {
    window.alert(
      "Before saving a partial or unreadable tag, check inside the electrical, fan, or control area for an internal label and confirm that step."
    );
    return;
  }

  if (!__tagIssueReason) {
    window.alert(
      "Add a short reason explaining why the tag is partial or unreadable before saving."
    );
    return;
  }

  if (!__hasPrimaryTag && !__hasSupportId) {
    window.alert(
      "Do not save a damaged or unreadable tag without at least one supporting identifier like manufacturer, model, serial, or mate tag."
    );
    return;
  }
}
const siteUnitCount = siteUnitsAtLocation.length;
  if (
    customerName.trim() &&
    siteName.trim() &&
    siteUnitCount > 1 &&
    !unitNickname.trim()
  ) {
    alert(
      "This site already has multiple saved units. Add a clear Unit Nickname / Tag before saving so this unit does not get confused with others at the same location."
    );
    return;
  }

  const likelyDuplicateWithoutSerial = findLikelyDuplicateWithoutSerial();
  if (likelyDuplicateWithoutSerial) {
    alert(
      "Serial number is blank and this looks like an existing unit at this site.\n\n" +
      `Customer: ${likelyDuplicateWithoutSerial.customerName || "-"}\n` +
      `Site: ${likelyDuplicateWithoutSerial.siteName || "-"}\n` +
      `Unit Tag: ${likelyDuplicateWithoutSerial.unitNickname || "-"}\n` +
      `Make/Model: ${likelyDuplicateWithoutSerial.manufacturer || "-"} ${likelyDuplicateWithoutSerial.model || "-"}\n\n` +
      "Load the existing unit if this is the same machine, or add a stronger identifier like serial number or a clear unit tag before saving."
    );
    return;
  }

    console.log("SAVE UNIT CLICKED");

    try {
      const record: SavedUnitRecord = {
        id: makeId(),
        savedAt: new Date().toISOString(),
        companyName,
        customerName,
        siteName,
        siteAddress,
        unitNickname,
        propertyType,
        equipmentType,
        manufacturer,
        model,
        serialNumber,
        refrigerantType,
        symptom,
        selectedPackId,
        flowNodeId,
        flowHistory,
        finalConfirmedCause,
        actualFixPerformed,
        outcomeStatus,
        callbackOccurred,
        techCloseoutNotes,
        observations,
        rawResult,
        nameplate,
        errorCode,
        errorCodeSource,
        systemType,
        primaryComponentRole,
        primaryTagStatus,
        primaryTagIssueReason,
        primaryCheckedInsideForInternalLabel,
        linkedEquipmentComponents: Array.isArray(linkedEquipmentComponents)
          ? linkedEquipmentComponents.map((component) => ({ ...component }))
          : [],
      };

      console.log("ABOUT TO SAVE RECORD", record);

      const createdUnit = await createUnitForCurrentUser({
        id: record.id,
        customer_name: record.customerName,
        company_name: record.companyName || "",
        site_name: record.siteName,
        site_address: record.siteAddress,
        unit_nickname: record.unitNickname,
        property_type: record.propertyType,
        equipment_type: record.equipmentType,
        manufacturer: record.manufacturer,
        model: record.model,
        serial: record.serialNumber || record.nameplate?.serial || "",
        refrigerant_type: record.refrigerantType,
      });

      saveLinkedEquipmentOverlayForUnit(createdUnit.id || record.id);

      const refreshed = await listUnitsForCurrentUser();
      const mapped = refreshed.map(
        (r: import("../lib/supabase/work-orders").UnitRow) => ({
          id: r.id,
          savedAt: r.created_at || "",
          customerName: r.customer_name || "",
          companyName: r.company_name || "",
          siteName: r.site_name || "",
          siteAddress: r.site_address || "",
          unitNickname: r.unit_nickname || "",
          propertyType: r.property_type || "",
          equipmentType: r.equipment_type || "",
          manufacturer: r.manufacturer || "",
          model: r.model || "",
          serialNumber: r.serial || "",
          refrigerantType: r.refrigerant_type || "",
          symptom: "",
          errorCode: "",
          errorCodeSource: "",
          selectedPackId: "",
          flowNodeId: "",
          flowHistory: [],
          observations: [],
          rawResult: "",
          nameplate: null,
          finalConfirmedCause: "",
          actualFixPerformed: "",
          outcomeStatus: "Not Set",
          callbackOccurred: "No",
          techCloseoutNotes: "",
        })
      );

      setSavedUnits(mergeLinkedEquipmentOverlays(mapped));
      setCurrentLoadedUnitId(createdUnit.id || record.id);
      alert("Unit saved.");
      console.log("SAVE UNIT SUCCESS");
    } catch (err) {
      console.error("SAVE UNIT FAILED", err);
      alert("Save Unit failed. Check browser console.");
    }
  }

  
function loadServiceEventIntoForm(event: any) {
  const overlay = getAffectedComponentOverlayForEvent(String(event?.id || ""));
  setEditingServiceEventId(event.id || "");
  setServiceDate(event.service_date ? String(event.service_date).slice(0, 10) : new Date().toISOString().slice(0, 10));
  setSymptom(event.symptom || "");
  setFinalConfirmedCause(event.final_confirmed_cause || "");
  setActualFixPerformed(event.actual_fix_performed || "");
  setPartsReplaced(event.parts_replaced || "");
  setOutcomeStatus(event.outcome_status || "Not Set");
  setCallbackOccurred(event.callback_occurred || "No");
  setTechCloseoutNotes(hydrateCircuitFromNotes(event.tech_closeout_notes || ""));
  setServiceEventPhotoUrls(Array.isArray(event.photo_urls) ? event.photo_urls : []);
  setServiceEventPhotoMessage("");
  setAffectedComponentId(overlay?.affectedComponentId || "");
  setAffectedComponentLabel(overlay?.affectedComponentLabel || "");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEditingServiceEvent() {
  setEditingServiceEventId("");
  setServiceDate(new Date().toISOString().slice(0, 10));
  setSymptom("");
  setFinalConfirmedCause("");
  setActualFixPerformed("");
  setPartsReplaced("");
  setOutcomeStatus("Not Set");
  setCallbackOccurred("No");
  setTechCloseoutNotes("");
  setCircuitCount("1");
  setSelectedCircuit("Circuit 1");
  setCustomCircuitLabel("");
  setServiceEventPhotoUrls([]);
  setServiceEventPhotoMessage("");
  setAffectedComponentId("");
  setAffectedComponentLabel("");
}

async function updateCurrentServiceEvent() {
  if (!editingServiceEventId) {
    alert("No service event is being edited.");
    return;
  }

  if (!currentLoadedUnitId) {
    alert("Load a unit first.");
    return;
  }

  const affectedSelection = resolveAffectedComponentSelection();

  if (systemType !== "single" && !affectedSelection.id) {
    alert("Select the affected component before updating this service event.");
    return;
  }

  try {
    const updatedEvent = await updateServiceEventForCurrentUser(editingServiceEventId, {
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: partsReplaced || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),
      photo_urls: serviceEventPhotoUrls,
    });

    saveAffectedComponentOverlayForEvent(
      updatedEvent?.id || editingServiceEventId,
      affectedSelection.id,
      affectedSelection.label
    );

    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    alert("Service event updated.");
    cancelEditingServiceEvent();
  } catch (err) {
    console.error("UPDATE SERVICE EVENT FAILED", err);
    alert("Could not update service event. Check browser console.");
  }
}

async function saveCurrentCallAsServiceEvent() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first, or save the unit before saving the current call.");
    return;
  }

  const affectedSelection = resolveAffectedComponentSelection();

  if (systemType !== "single" && !affectedSelection.id) {
    alert("Select the affected component before saving this service event.");
    return;
  }

  try {
    const createdEvent = await createServiceEventForCurrentUser({
      id: makeId(),
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
      ? new Date(`${serviceDate}T12:00:00`).toISOString()
      : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: partsReplaced || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),
      photo_urls: serviceEventPhotoUrls,
    });

    saveAffectedComponentOverlayForEvent(
      createdEvent?.id || "",
      affectedSelection.id,
      affectedSelection.label
    );

    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setServiceEventPhotoUrls([]);
    setServiceEventPhotoMessage("");
    setAffectedComponentId(systemType === "single" ? "" : affectedSelection.id);
    setAffectedComponentLabel(systemType === "single" ? "" : affectedSelection.label);
    alert("Current call saved to the unit timeline.");
  } catch (err) {
    console.error("SAVE CURRENT CALL FAILED", err);
    alert("Could not save current call. Check browser console.");
  }
}

async function saveHistoricalCallAndReset() {
  if (!currentLoadedUnitId) {
    alert("Load a unit first, or save the unit before saving the current call.");
    return;
  }

  const affectedSelection = resolveAffectedComponentSelection();

  if (systemType !== "single" && !affectedSelection.id) {
    alert("Select the affected component before saving this historical service event.");
    return;
  }

  try {
    const createdEvent = await createServiceEventForCurrentUser({
      id: makeId(),
      unit_id: currentLoadedUnitId,
      company_name: companyName || "",
      service_date: serviceDate
        ? new Date(`${serviceDate}T12:00:00`).toISOString()
        : new Date().toISOString(),
      symptom: symptom || "",
      diagnosis_summary: parsed?.summary || "",
      final_confirmed_cause: finalConfirmedCause || "",
      parts_replaced: actualFixPerformed || "",
      actual_fix_performed: actualFixPerformed || "",
      outcome_status: outcomeStatus || "Not Set",
      callback_occurred: callbackOccurred || "No",
      tech_closeout_notes: buildTechNotesWithCircuit(techCloseoutNotes || ""),
      photo_urls: serviceEventPhotoUrls,
    });

    saveAffectedComponentOverlayForEvent(
      createdEvent?.id || "",
      affectedSelection.id,
      affectedSelection.label
    );

    await loadUnitServiceTimeline(currentLoadedUnitId);
    await loadFailureIntelligenceDashboardData();
    setServiceDate(new Date().toISOString().slice(0, 10));
    setSymptom("");
    setFinalConfirmedCause("");
    setActualFixPerformed("");
    setOutcomeStatus("Not Set");
    setCallbackOccurred("No");
    setTechCloseoutNotes("");
    setAffectedComponentId("");
    setAffectedComponentLabel("");
    setServiceEventPhotoUrls([]);
    setServiceEventPhotoMessage("");
    alert("Historical call saved. Enter the next call for this same unit.");
  } catch (err) {
    console.error("SAVE HISTORICAL CALL FAILED", err);
    alert("Could not save historical call. Check browser console.");
  }
}


async function openUnitProfile(record: SavedUnitRecord) {
  setShowUnitProfile(true);
  setUnitProfileUnit(record);
  setUnitProfileLoading(true);
  setUnitProfileMessage("");
  setUnitProfileTimeline([]);

  try {
    const events = (await listServiceEventsForUnitForCurrentUser(record.id)) || [];
    setUnitProfileTimeline(events);
    setUnitProfileMessage(
      events.length ? "" : "No prior service events found for this unit."
    );
  } catch (err) {
    console.error(err);
    setUnitProfileTimeline([]);
    setUnitProfileMessage("Could not load unit profile timeline.");
  } finally {
    setUnitProfileLoading(false);
  }
}

  async function loadUnitServiceTimeline(unitId: string) {
  if (!unitId) {
    setUnitServiceTimeline([]);
    setUnitServiceTimelineMessage("No unit selected.");
    return;
  }

  setUnitServiceTimelineLoading(true);
  setUnitServiceTimelineMessage("");

  try {
   const events = (await listServiceEventsForUnitForCurrentUser(unitId)) || [];
  setUnitServiceTimeline(events);
  setUnitServiceTimelineMessage(
  events.length ? "" : "No prior service events found for this unit."
);
  } catch (err) {
    console.error(err);
    setUnitServiceTimeline([]);
    setUnitServiceTimelineMessage("Could not load service timeline.");
  } finally {
    setUnitServiceTimelineLoading(false);
  }
}

  function loadUnit(record: SavedUnitRecord) {
    const mergedRecord = mergeLinkedEquipmentOverlayIntoSavedUnit(record);

    setCurrentLoadedUnitId(mergedRecord.id);
    setCompanyName(mergedRecord.companyName || "");
    setCustomerName(mergedRecord.customerName || "");
    setSiteName(mergedRecord.siteName || "");
    setSiteAddress(mergedRecord.siteAddress || "");
    setUnitNickname(mergedRecord.unitNickname || "");
    setPropertyType(mergedRecord.propertyType || "Commercial");
    setEquipmentType(mergedRecord.equipmentType || "RTU");
    setManufacturer(mergedRecord.manufacturer || "");
    setModel(mergedRecord.model || "");
    setSerialNumber(mergedRecord.serialNumber || "");
    setRefrigerantType(mergedRecord.refrigerantType || "Unknown");
    setSymptom(mergedRecord.symptom || "");
    setSelectedPackId(mergedRecord.selectedPackId || "no_cooling");
    setFlowNodeId(mergedRecord.flowNodeId || "");
    setFlowHistory(mergedRecord.flowHistory || []);
    setObservations(mergedRecord.observations || []);
    setRawResult(mergedRecord.rawResult || "");
    setNameplate(mergedRecord.nameplate || null);
    setErrorCode(mergedRecord.errorCode || "");
    setErrorCodeSource(mergedRecord.errorCodeSource || "Control Board");
    setFinalConfirmedCause(mergedRecord.finalConfirmedCause || "");
    setPartsReplaced("");
    setActualFixPerformed(mergedRecord.actualFixPerformed || "");
    setOutcomeStatus(mergedRecord.outcomeStatus || "Not Set");
    setCallbackOccurred(mergedRecord.callbackOccurred || "No");
    setTechCloseoutNotes(hydrateCircuitFromNotes(mergedRecord.techCloseoutNotes || ""));

    setSystemType(mergedRecord.systemType || "single");
    setPrimaryComponentRole(mergedRecord.primaryComponentRole || "unit");
    setPrimaryTagStatus(mergedRecord.primaryTagStatus || "readable");
    setPrimaryTagIssueReason(mergedRecord.primaryTagIssueReason || "");
    setPrimaryCheckedInsideForInternalLabel(Boolean(mergedRecord.primaryCheckedInsideForInternalLabel));
    setLinkedEquipmentComponents(
      Array.isArray(mergedRecord.linkedEquipmentComponents)
        ? mergedRecord.linkedEquipmentComponents.map((component) => ({ ...component }))
        : []
    );

    loadUnitServiceTimeline(mergedRecord.id);
}

  
  async function removeSavedUnit(id: string) {
    await deleteUnitForCurrentUser(id);

    const refreshed = await listUnitsForCurrentUser();
    const mapped = refreshed.map(
      (r: import("../lib/supabase/work-orders").UnitRow) => ({
        id: r.id,
        savedAt: r.created_at || "",
        customerName: r.customer_name || "",
        companyName: r.company_name || "",
        siteName: r.site_name || "",
        siteAddress: r.site_address || "",
        unitNickname: r.unit_nickname || "",
        propertyType: r.property_type || "",
        equipmentType: r.equipment_type || "",
        manufacturer: r.manufacturer || "",
        model: r.model || "",
        refrigerantType: r.refrigerant_type || "",
        symptom: "",
        errorCode: "",
        errorCodeSource: "",
        selectedPackId: "",
        flowNodeId: "",
        flowHistory: [],
        observations: [],
        rawResult: "",
        nameplate: null,
        finalConfirmedCause: "",
        actualFixPerformed: "",
        outcomeStatus: "Not Set",
        callbackOccurred: "No",
        techCloseoutNotes: "",
      })
    );

    setSavedUnits(mapped);
  }

async function handleCreateCompanyOnboarding() {
  const company = onboardingCompanyName.trim();
  if (!company) {
    setOnboardingMessage("Enter your company name.");
    return;
  }

  try {
    setOnboardingBusy(true);
    setOnboardingMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("User is not logged in.");

    const res = await fetch("/api/onboarding/create-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: company,
        userId: user.id,
        email: user.email || userEmail || "",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Server error (${res.status})`);
    }

    setNeedsCompanyOnboarding(false);
    setOnboardingCompanyName("");
    setOnboardingMessage("");
    window.location.reload();
  } catch (err) {
    console.error("CREATE COMPANY ONBOARDING FAILED", err);

    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);

    setOnboardingMessage(`Create company failed: ${msg}`);
  } finally {
    setOnboardingBusy(false);
  }
}

// handleAddTechToCompany and loadCompanyMembers moved to CompanyAdminPanel.tsx

async function handleUploadServiceEventPhotos(files: File[] | FileList | null) {
  const fileArray = Array.isArray(files) ? files : files ? Array.from(files) : [];
  if (!fileArray.length) return;

  try {
    setServiceEventPhotoBusy(true);
    setServiceEventPhotoMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session?.access_token) throw new Error("No active session found.");

    const uploadedUrls: string[] = [];

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/photos/upload-service-event", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      if (data?.url) {
        uploadedUrls.push(data.url);
      }
    }

    setServiceEventPhotoUrls((prev) => [...prev, ...uploadedUrls]);
    setServiceEventPhotoMessage(
      uploadedUrls.length ? `Uploaded ${uploadedUrls.length} photo(s).` : ""
    );
  } catch (err) {
    console.error("SERVICE EVENT PHOTO UPLOAD FAILED", err);
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);

    setServiceEventPhotoMessage(`Photo upload failed: ${msg}`);
  } finally {
    setServiceEventPhotoBusy(false);
  }
}

async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = "/auth";
}

  function openPrintableReport() {
    const html = buildServiceReportHtml({
      customerName,
      siteName,
      siteAddress,
      unitNickname,
      propertyType,
      equipmentType,
      manufacturer,
      model,
      refrigerantType,
      symptom,
      observations,
      parsed,
      nameplate,
      chargeAnalysis,
      airflowAnalysis,
      equipmentMemory,
      lang,
    });

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer,width=1000,height=900");

    if (!win) {
      alert(t("alert_popup_blocked", lang));
      URL.revokeObjectURL(url);
      return;
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  }

  if (!authChecked) {
  return <div style={{ padding: 20 }}>Checking login...</div>;
}

if (!isLoggedIn) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0c1a2e 0%, #0f2440 50%, #0c1a2e 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, color: "#f97316", marginBottom: 16 }}>MY HVAC/R TOOL</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Sign in to access your tools</div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>AI diagnosis, PT charts, calculators, and more — all in one place.</div>
        <a href="/auth" style={{ display: "inline-block", padding: "14px 32px", background: "#f97316", color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}>
          🔧 Sign In
        </a>
        <div style={{ marginTop: 16 }}>
          <a href="/auth" style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>Don&apos;t have an account? Sign up free</a>
        </div>
      </div>
    </div>
  );
}

if (needsCompanyOnboarding) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c1a2e 0%, #0f2440 50%, #0c1a2e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>

        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 3, color: "#f97316", marginBottom: 6 }}>
            MY HVAC/R TOOL
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>
            Welcome aboard! 👋
          </div>
          <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
            Let&apos;s get your account set up in 30 seconds.<br />
            Signed in as <span style={{ color: "#94a3b8", fontWeight: 600 }}>{userEmail}</span>
          </div>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {[
            { num: 1, label: "Company" },
            { num: 2, label: "Ready" },
          ].map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{s.label}</div>
              </div>
              {i < 1 && <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 16 }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "rgba(15,36,64,0.8)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 16, padding: "28px 24px", backdropFilter: "blur(12px)", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

          {/* Toggle: Create or Join */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button onClick={() => setOnboardingMode("create")}
              style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", background: onboardingMode === "create" ? "#f97316" : "rgba(255,255,255,0.08)", color: "#fff" }}>
              🏢 New Company
            </button>
            <button onClick={() => setOnboardingMode("join")}
              style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", background: onboardingMode === "join" ? "#2563eb" : "rgba(255,255,255,0.08)", color: "#fff" }}>
              🔑 Join with Code
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
            {onboardingMode === "create" ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 2 }}>
                  What&apos;s the name of your company or shop?
                </div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                  Solo techs can use your own name. Your company gets a join code to share with your team.
                </div>
                <input
                  value={onboardingCompanyName}
                  onChange={(e) => setOnboardingCompanyName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !onboardingBusy) handleCreateCompanyOnboarding(); }}
                  placeholder="e.g. ABC HVAC Services or John Smith HVAC"
                  style={{ width: "100%", padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#f8fafc", fontSize: 15, fontFamily: "inherit", outline: "none" }}
                />
              </>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 2 }}>
                  Your manager gave you a 6-character join code
                </div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                  Enter it below to join your company and see shared unit history.
                </div>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  placeholder="e.g. ABC123"
                  style={{ width: "100%", padding: "13px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#f8fafc", fontSize: 22, fontFamily: "monospace", outline: "none", letterSpacing: "0.3em", textAlign: "center" as const }}
                />
                {joinCodeError && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
                    {joinCodeError}
                  </div>
                )}
              </>
            )}

            {onboardingMessage && (
              <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
                {onboardingMessage}
              </div>
            )}

            <button
              onClick={onboardingMode === "create" ? handleCreateCompanyOnboarding : async () => {
                if (joinCode.length !== 6) { setJoinCodeError("Enter the full 6-character code."); return; }
                setOnboardingBusy(true);
                setJoinCodeError("");
                try {
                  const res = await fetch("/api/onboarding/join-company", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ joinCode, userId: (await supabase.auth.getUser()).data.user?.id || "", email: userEmail }),
                  });
                  const data = await res.json();
                  if (data.ok) {
                    setNeedsCompanyOnboarding(false);
                  } else {
                    setJoinCodeError(data.error || "Invalid code. Check with your manager.");
                  }
                } catch {
                  setJoinCodeError("Something went wrong. Try again.");
                } finally {
                  setOnboardingBusy(false);
                }
              }}
              disabled={onboardingBusy}
              style={{ width: "100%", padding: "14px", background: onboardingBusy ? "rgba(249,115,22,0.5)" : onboardingMode === "join" ? "#2563eb" : "#f97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: onboardingBusy ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
            >
              {onboardingBusy ? "Setting up..." : onboardingMode === "create" ? "🔧 Create Company" : "🔑 Join Company"}
            </button>

            {/* What to expect bullets */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {[
                { icon: "🤖", text: "AI diagnosis — describe symptoms, get answers" },
                { icon: "📊", text: "PT charts + 7 calculators — all offline capable" },
                { icon: "📋", text: "Unit history — every job, every reading, forever" },
              ].map(f => (
                <div key={f.icon} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#64748b" }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={handleSignOut} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}



return (
  <JobIdentityProvider value={{ manufacturer, model, symptom, observations }}>
  <div key={lang} style={{ paddingTop: 98 }}>
    <NavMenu currentPath="/hvac_units" />
    <OnboardingTour />
    <TrialBanner />
    <StepProgressBar />
  <div style={{ padding: "12px 14px 48px", maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 4 }}>
        {t("app_title", lang)}
      </h1>

      <div
  style={{
    marginTop: 10,
    padding: 10,
    border: "1px solid #e5e5e5",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    background: "#fafafa",
  }}
>
  <div>
    <b>{t("logged_in_as", lang)}</b> {userEmail || t("unknown_user", lang)}
  </div>

  <button
  onClick={() => setShowUnitLibrary(true)}
  style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
>
  {t("btn_load_unit", lang)}
</button>

  <button
    onClick={() => setShowSavedUnitHistory((v) => !v)}
    style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
  >
    {showSavedUnitHistory ? t("btn_hide_history", lang) : t("btn_show_history", lang)}
  </button>

  <button onClick={handleSignOut} style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
    {t("btn_sign_out", lang)}
  </button>
</div>

{/* repeat-call-banner-v4 */}
{(() => {
  const __repeatCallAllHistory =
    (Array.isArray(unitServiceTimeline) && unitServiceTimeline.length
      ? unitServiceTimeline
      : Array.isArray(unitProfileTimeline)
        ? unitProfileTimeline
        : []);

  if (!__repeatCallAllHistory.length) return null;

  const __repeatCallGetRecord = (event: unknown): Record<string, unknown> | null => {
    if (event && typeof event === "object") {
      return event as Record<string, unknown>;
    }
    return null;
  };

  const __repeatCallGetString = (event: unknown, keys: string[]) => {
    const record = __repeatCallGetRecord(event);
    if (!record) return "";
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number") return String(value);
    }
    return "";
  };

  const __repeatCallGetBool = (event: unknown, keys: string[]) => {
    const record = __repeatCallGetRecord(event);
    if (!record) return false;
    for (const key of keys) {
      const value = record[key];
      if (
        value === true ||
        value === "true" ||
        value === "yes" ||
        value === "Yes" ||
        value === 1 ||
        value === "1"
      ) {
        return true;
      }
    }
    return false;
  };

  const __repeatCallGetTime = (event: unknown) => {
    const raw =
      __repeatCallGetString(event, ["service_date", "created_at", "updated_at", "date"]) || "";
    if (!raw) return 0;
    const ms = new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  const __repeatCallSelectedComponentId = String(affectedComponentId || "").trim();
  const __repeatCallSelectedComponentLabel = String(affectedComponentLabel || "").trim();

  const __repeatCallMatchingComponentHistory =
    systemType !== "single" && (__repeatCallSelectedComponentId || __repeatCallSelectedComponentLabel)
      ? __repeatCallAllHistory.filter((event) => {
          const overlay = getAffectedComponentOverlayForEvent(String((event as { id?: string | number } | null)?.id || ""));
          if (!overlay) return false;

          if (__repeatCallSelectedComponentId && overlay.affectedComponentId === __repeatCallSelectedComponentId) {
            return true;
          }

          if (
            __repeatCallSelectedComponentLabel &&
            overlay.affectedComponentLabel === __repeatCallSelectedComponentLabel
          ) {
            return true;
          }

          return false;
        })
      : [];

  const __repeatCallHasComponentFocus =
    systemType !== "single" && !!(__repeatCallSelectedComponentId || __repeatCallSelectedComponentLabel);

  const __repeatCallHistory =
    __repeatCallHasComponentFocus && __repeatCallMatchingComponentHistory.length
      ? __repeatCallMatchingComponentHistory
      : __repeatCallAllHistory;

  const __repeatCallIsSystemFallback =
    __repeatCallHasComponentFocus && __repeatCallMatchingComponentHistory.length === 0;

  const __repeatCallSorted = [...__repeatCallHistory].sort(
    (a, b) => __repeatCallGetTime(b) - __repeatCallGetTime(a)
  );

  const __repeatCallLast = __repeatCallSorted[0] ?? null;
  const __repeatCallLastDateRaw =
    __repeatCallGetString(__repeatCallLast, ["service_date", "created_at", "updated_at", "date"]) || "";
  const __repeatCallLastDateLabel = __repeatCallLastDateRaw
    ? new Date(__repeatCallLastDateRaw).toLocaleDateString()
    : "";

  const __repeatCallLastSymptom =
    __repeatCallGetString(__repeatCallLast, ["symptom", "customer_complaint", "complaint"]) || "";

  const __repeatCallLastCause =
    __repeatCallGetString(__repeatCallLast, [
      "final_confirmed_cause",
      "confirmed_cause",
      "confirmedCause",
      "cause",
      "diagnosis",
      "root_cause",
      "rootCause",
    ]) || "";

  const __repeatCallLastFix =
    __repeatCallGetString(__repeatCallLast, [
      "actual_fix_performed",
      "actual_fix",
      "actualFix",
      "fix",
      "repair_action",
      "repairAction",
      "resolution",
    ]) || "";

  const __repeatCallLastParts =
    __repeatCallGetString(__repeatCallLast, [
      "parts_replaced",
      "partsReplaced",
      "parts_used",
      "partsUsed",
      "parts",
      "part",
    ]) || "";

  const __repeatCallSameSymptomCount = __repeatCallLastSymptom
    ? __repeatCallHistory.filter((event) => {
        const symptom =
          __repeatCallGetString(event, ["symptom", "customer_complaint", "complaint"]) || "";
        return symptom && symptom.toLowerCase() === __repeatCallLastSymptom.toLowerCase();
      }).length
    : 0;

  const __repeatCallHasCallbackHistory = __repeatCallHistory.some((event) =>
    __repeatCallGetBool(event, [
      "callback",
      "is_callback",
      "isCallback",
      "callback_visit",
      "callbackVisit",
      "callback_occurred",
    ])
  );

  const __repeatCallScopeLabel = __repeatCallHasComponentFocus
    ? (__repeatCallSelectedComponentLabel || "Selected component")
    : (systemType === "single" ? "Primary component" : "System-wide history");

  const __repeatCallScopeMessage = __repeatCallHasComponentFocus
    ? (
        __repeatCallIsSystemFallback
          ? `No prior visits were found for ${__repeatCallScopeLabel}. Showing system-wide history instead.`
          : `Showing prior visits for ${__repeatCallScopeLabel}.`
      )
    : (
        systemType === "single"
          ? "Showing prior visits for the primary component."
          : "Select an affected component to see component-specific prior visits."
      );

  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #f0c36d",
        borderRadius: 12,
        padding: 12,
        background: "#fff8e8",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16 }}>
        Repeat Call / Prior Visit Signal
      </div>

      <div style={{ marginTop: 4, fontSize: 13, color: "#555" }}>
        {__repeatCallScopeMessage}
      </div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Scope
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallScopeLabel || "System-wide history"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Last Call Date
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastDateLabel || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Last Symptom
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastSymptom || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Most Recent Cause
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastCause || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Most Recent Fix
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastFix || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            Last Parts Used
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>{__repeatCallLastParts || "—"}</div>
        </div>

        <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
            History Signal
          </div>
          <div style={{ marginTop: 4, fontWeight: 700 }}>
            {__repeatCallSameSymptomCount > 1
              ? `${__repeatCallSameSymptomCount} similar symptom calls`
              : "Prior service history found"}
            {__repeatCallHasCallbackHistory ? " • Callback history" : ""}
          </div>
        </div>

        {__repeatCallHasComponentFocus ? (
          <div style={{ border: "1px solid #ead9a4", borderRadius: 10, padding: 10, background: "#fffdf7" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
              Component History Count
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              {__repeatCallMatchingComponentHistory.length}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
})()}
{!historicalEntryMode ? (
      <div style={{ marginTop: 10 }}>
        <CompanyAdminPanel />
      </div>
      ) : null}

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
        }}
      >
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_historical_entry_mode", lang)}>
          <HistoricalEntryModeToggle
            enabled={historicalEntryMode}
            onToggle={() => setHistoricalEntryMode((v) => !v)}
          />
        </SectionCard>
      </div>

        <div style={{ marginTop: 10 }}>
          <SectionCard title={t("card_title_help_quick_start", lang)}>
            <HelpQuickStart />
          </SectionCard>
        </div>

        <SectionCard title={t("intake_title", lang)} id="new-job">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 900 }}>{t("job_form_customer", lang)}</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>{t("intake_company_name", lang)}</label>
              <br />
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("intake_company_placeholder", lang)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>{t("intake_site_name", lang)}</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: 900 }}>{t("intake_site_address", lang)}</label>
              <input
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900, fontSize: 16 }}>{t("intake_unit_tag_required", lang)}</label>
          <SmallHint>
            {t("intake_unit_tag_hint", lang)}
          </SmallHint>
              <input
                value={unitNickname}
                onChange={(e) => setUnitNickname(e.target.value)}
                placeholder={t("intake_unit_tag_placeholder", lang)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>

          
{/* system-structure-ui-v2 */}
<div
  style={{
    marginTop: 12,
    border: "1px solid #d7d7d7",
    borderRadius: 12,
    padding: 12,
    background: "#fbfbfb",
    display: "grid",
    gap: 12,
  }}
>
  <div style={{ fontWeight: 900, fontSize: 16 }}>
    {t("sysstruct_title", lang)}
  </div>

  <SmallHint>
    {t("sysstruct_hint", lang)}
  </SmallHint>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 10,
    }}
  >
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 900 }}>{t("sysstruct_system_type", lang)}</span>
      <select
        value={systemType}
        onChange={(e) => {
          const nextType = e.target.value as
            | "single"
            | "split_system"
            | "furnace_ac"
            | "heat_pump_air_handler"
            | "walk_in"
            | "mini_split"
            | "other_multi";
          setSystemType(nextType);
          setPrimaryComponentRole(systemStructureDefaults[nextType]?.primaryRole || "unit");

          if (nextType === "single") {
            setLinkedEquipmentComponents([]);
          } else if (!linkedEquipmentComponents.length) {
            const defaults = systemStructureDefaults[nextType] || systemStructureDefaults.single;
            setLinkedEquipmentComponents([
              {
                id: `${Date.now()}-1`,
                role: defaults.linkedRole,
                tag: "",
                manufacturer: "",
                model: "",
                serial: "",
                tagStatus: "readable",
                tagIssueReason: "",
                checkedInsideForInternalLabel: false,
              },
            ]);
          }
        }}
        style={{ width: "100%", padding: 8 }}
      >
        <option value="single">{t("sysstruct_type_single", lang)}</option>
        <option value="split_system">{t("sysstruct_type_split", lang)}</option>
        <option value="furnace_ac">{t("sysstruct_type_furnace_ac", lang)}</option>
        <option value="heat_pump_air_handler">{t("sysstruct_type_heat_pump_ah", lang)}</option>
        <option value="walk_in">{t("sysstruct_type_walkin", lang)}</option>
        <option value="mini_split">{t("sysstruct_type_mini_split", lang)}</option>
        <option value="ice_machine_remote">{t("sysstruct_type_ice_remote", lang)}</option>
        <option value="reach_in_remote">{t("sysstruct_type_reachin_remote", lang)}</option>
        <option value="other_multi">{t("sysstruct_type_other_multi", lang)}</option>
      </select>
    </label>

    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 900 }}>{t("sysstruct_primary_role", lang)}</span>
      <select
        value={primaryComponentRole}
        onChange={(e) => setPrimaryComponentRole(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      >
        <option value="unit">{t("role_unit", lang)}</option>
        <option value="outdoor_unit">{t("role_outdoor_unit", lang)}</option>
        <option value="indoor_unit">{t("role_indoor_unit", lang)}</option>
        <option value="furnace">{t("role_furnace", lang)}</option>
        <option value="air_handler">{t("role_air_handler", lang)}</option>
        <option value="condensing_unit">{t("role_condensing_unit", lang)}</option>
        <option value="evaporator">{t("role_evaporator", lang)}</option>
        <option value="indoor_head">{t("role_indoor_head", lang)}</option>
        <option value="primary_component">{t("role_primary_component", lang)}</option>
      </select>
    </label>

    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 900 }}>{t("tag_status_label", lang)}</span>
      <select
        value={primaryTagStatus}
        onChange={(e) =>
          setPrimaryTagStatus(e.target.value as "readable" | "partial" | "unreadable")
        }
        style={{ width: "100%", padding: 8 }}
      >
        <option value="readable">{t("tag_status_readable", lang)}</option>
        <option value="partial">{t("tag_status_partial", lang)}</option>
        <option value="unreadable">{t("tag_status_unreadable", lang)}</option>
      </select>
    </label>
  </div>

  {primaryTagStatus !== "readable" ? (
    <div
      style={{
        border: "1px solid #f0c36d",
        borderRadius: 10,
        padding: 12,
        background: "#fff8e8",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 900 }}>{t("tag_issue_title", lang)}</div>

      <SmallHint>
        {t("tag_issue_hint", lang)}
      </SmallHint>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 900 }}>{t("tag_issue_reason_label", lang)}</span>
        <textarea
          value={primaryTagIssueReason}
          onChange={(e) => setPrimaryTagIssueReason(e.target.value)}
          rows={3}
          placeholder={t("tag_issue_reason_placeholder", lang)}
          style={{ width: "100%", padding: 8 }}
        />
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
        }}
      >
        <input
          type="checkbox"
          checked={primaryCheckedInsideForInternalLabel}
          onChange={(e) => setPrimaryCheckedInsideForInternalLabel(e.target.checked)}
        />
        {t("tag_issue_checkbox", lang)}
      </label>
    </div>
  ) : null}

  {systemType !== "single" ? (
    <div
      style={{
        border: "1px solid #d7d7d7",
        borderRadius: 12,
        padding: 12,
        background: "#fff",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900 }}>{t("linked_equip_title", lang)}</div>
          <SmallHint>
            {t("linked_equip_hint", lang)}
          </SmallHint>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => addLinkedEquipmentComponent()}
            style={{
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              cursor: "pointer",
            }}
          >
            {t("linked_equip_add_prefix", lang)} {translateRoleLabel(systemStructureDefaults[systemType]?.linkedLabel || "Linked Component", lang)}
          </button>

          {systemType === "walk_in" ? (
            <button
              type="button"
              onClick={() => addLinkedEquipmentComponent("evaporator")}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: "pointer",
              }}
            >
              {t("linked_equip_add_evaporator", lang)}
            </button>
          ) : null}

          {systemType === "mini_split" ? (
            <button
              type="button"
              onClick={() => addLinkedEquipmentComponent("indoor_head")}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: "pointer",
              }}
            >
              {t("linked_equip_add_indoor_head", lang)}
            </button>
          ) : null}
        </div>
      </div>

      {!linkedEquipmentComponents.length ? (
        <div
          style={{
            border: "1px solid #f0c36d",
            borderRadius: 10,
            padding: 10,
            background: "#fff8e8",
            fontWeight: 700,
          }}
        >
          {t("linked_equip_needed_warning", lang)}
        </div>
      ) : null}

      {linkedEquipmentComponents.map((component, idx) => (
        <div
          key={component.id}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 900 }}>{t("linked_equip_component_n", lang)} {idx + 1}</div>

            <button
              type="button"
              onClick={() => removeLinkedEquipmentComponent(component.id)}
              style={{
                padding: "6px 10px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: "pointer",
              }}
            >
              {t("btn_remove", lang)}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>{t("linked_equip_role", lang)}</span>
              <select
                value={component.role}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "role", e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                {linkedEquipmentRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {translateRoleLabel(option.label, lang)}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>{t("linked_equip_tag", lang)}</span>
              <input
                value={component.tag}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "tag", e.target.value)}
                placeholder={t("linked_equip_tag_placeholder", lang)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>{t("job_form_manufacturer", lang)}</span>
              <input
                value={component.manufacturer}
                onChange={(e) =>
                  updateLinkedEquipmentComponent(component.id, "manufacturer", e.target.value)
                }
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>{t("job_form_model", lang)}</span>
              <input
                value={component.model}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "model", e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>{t("job_form_serial", lang)}</span>
              <input
                value={component.serial}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "serial", e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>{t("linked_equip_tag_status", lang)}</span>
              <select
                value={component.tagStatus}
                onChange={(e) =>
                  updateLinkedEquipmentComponent(component.id, "tagStatus", e.target.value)
                }
                style={{ width: "100%", padding: 8 }}
              >
                <option value="readable">{t("tag_status_readable", lang)}</option>
                <option value="partial">{t("tag_status_partial", lang)}</option>
                <option value="unreadable">{t("tag_status_unreadable", lang)}</option>
              </select>
            </label>
          </div>

          {component.tagStatus !== "readable" ? (
            <div
              style={{
                border: "1px solid #f0c36d",
                borderRadius: 10,
                padding: 12,
                background: "#fff8e8",
                display: "grid",
                gap: 10,
              }}
            >
              <SmallHint>
                {t("linked_equip_tag_issue_hint", lang)}
              </SmallHint>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900 }}>{t("linked_equip_tag_issue_reason", lang)}</span>
                <textarea
                  value={component.tagIssueReason}
                  onChange={(e) =>
                    updateLinkedEquipmentComponent(component.id, "tagIssueReason", e.target.value)
                  }
                  rows={3}
                  style={{ width: "100%", padding: 8 }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={component.checkedInsideForInternalLabel}
                  onChange={(e) =>
                    updateLinkedEquipmentComponent(
                      component.id,
                      "checkedInsideForInternalLabel",
                      e.target.checked
                    )
                  }
                />
                {t("tag_issue_checkbox", lang)}
              </label>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ) : null}
</div>

<div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <PillButton text={t("btn_save_current_unit", lang)} onClick={saveCurrentUnit} />
              {currentLoadedUnitId ? <PillButton text={t("btn_update_loaded_unit", lang)} onClick={updateCurrentLoadedUnit} /> : null}
            <PillButton text={t("btn_clear_current_form", lang)} onClick={clearCurrentForm} />
          </div>
        </SectionCard>

        <div
          style={{
            marginTop: 16,
          }}
        >
          <SectionCard title={t("clu_title", lang)}>
            <CurrentLoadedUnit
              currentLoadedUnitId={currentLoadedUnitId}
              customerName={customerName}
              siteName={siteName}
              unitNickname={unitNickname}
              serialNumber={serialNumber}
              systemType={systemType}
              primaryComponentRole={primaryComponentRole}
              linkedEquipmentComponents={linkedEquipmentComponents}
            />
          </SectionCard>
        </div>

      {/* affected-component-ui-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("affected_component_title", lang)}>
          <AffectedComponentSelect
            options={getAffectedComponentOptions()}
            affectedComponentId={affectedComponentId}
            affectedComponentLabel={affectedComponentLabel}
            systemType={systemType}
            onSelect={(id, label) => {
              setAffectedComponentId(id);
              setAffectedComponentLabel(label);
            }}
          />
        </SectionCard>
      </div>

                                          
      {/* step-wrappers-page-reflow-v1-step-4 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>{t("step4_title", lang)}</div>
          <SmallHint>
            {t("step4_hint", lang)}
          </SmallHint>
        </div>
      </div>

{/* repair-execution-assist-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("repair_execution_title", lang)}>
          <SmallHint>
            {t("repair_execution_hint", lang)}
          </SmallHint>

          <RepairExecutionAssist payload={buildRepairExecutionAssist()} />
        </SectionCard>
      </div>

{/* part-verification-checklist-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("part_verification_title", lang)}>
          <SmallHint>
            {t("part_verification_hint", lang)}
          </SmallHint>

          <PartVerificationChecklist
            payload={buildPartVerificationChecklistItems()}
            onSelectPart={setSelectedVerificationPart}
            onAddPartsReplaced={(part) =>
              setPartsReplaced((prev) => {
                const current = String(prev || "").trim();
                const existing = current
                  .split(/[;,]/)
                  .map((entry) => entry.trim().toLowerCase())
                  .filter(Boolean);

                if (existing.includes(part.trim().toLowerCase())) {
                  return current;
                }

                return [current, part].filter(Boolean).join(", ");
              })
            }
          />
        </SectionCard>
      </div>

            
      {/* failure-prediction-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_fleet_failure_prediction", lang)} id="failure-prediction">
          <SmallHint>
            {t("card_hint_fleet_failure_prediction", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <FailurePredictionDashboard maxItems={10} />
          </div>
        </SectionCard>
      </div>

{/* learning-hub-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_learning_hub", lang)} id="learning-hub">
          <SmallHint>
            {t("card_hint_learning_hub", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <LearningHub
              currentSymptom={symptom}
              currentCause={finalConfirmedCause}
              equipmentType={equipmentType}
            />
          </div>
        </SectionCard>
      </div>

{/* refrigerant-log-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_refrigerant_log", lang)} id="refrigerant-log">
          <SmallHint>
            {t("card_hint_refrigerant_log", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            {!can("refrigerant_log") ? (
              <UpgradePrompt
                feature={t("up_feature_refrigerant_log", lang)}
                reason={t("up_reason_refrigerant_log", lang)}
              />
            ) : (
            <RefrigerantLog
              refrigerantType={refrigerantType}
              equipmentType={equipmentType}
              manufacturer={manufacturer}
              model={model}
              customerName={customerName}
              siteName={siteName}
              serviceDate={serviceDate}
              unitId={""}
            />
            )}
          </div>
        </SectionCard>
      </div>

{/* step-wrappers-page-reflow-v1-step-5 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>{t("step5_title", lang)}</div>
          <SmallHint>
            {t("step5_hint", lang)}
          </SmallHint>
        </div>
      </div>

{/* customer-report-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={`📄 ${t("customer_report_section_title", lang)}`} id="customer-report">
          <SmallHint>
            {t("customer_report_hint", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            {!can("customer_reports") ? (
              <UpgradePrompt
                feature={t("up_feature_customer_reports", lang)}
                reason={t("up_reason_customer_reports", lang)}
              />
            ) : (
            <CustomerReport
              customerName={customerName}
              siteName={siteName}
              siteAddress={siteAddress}
              serviceDate={serviceDate}
              equipmentType={equipmentType}
              manufacturer={manufacturer}
              model={model}
              serialNumber={serialNumber}
              refrigerantType={refrigerantType}
              symptom={symptom}
              finalConfirmedCause={finalConfirmedCause}
              actualFixPerformed={actualFixPerformed}
              partsReplaced={partsReplaced}
              outcomeStatus={outcomeStatus}
              techCloseoutNotes={techCloseoutNotes}
              observations={observations}
            />
            )}
          </div>
        </SectionCard>
      </div>

{/* callback-prevention-checklist-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={`✅ ${t("callback_checklist_section_title", lang)}`} id="callback-checklist">
          <SmallHint>
            {t("callback_checklist_hint", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <CallbackPreventionChecklist
              finalConfirmedCause={finalConfirmedCause}
              actualFixPerformed={actualFixPerformed}
              partsReplaced={partsReplaced}
              equipmentType={equipmentType}
              refrigerantType={refrigerantType}
              symptom={symptom}
            />
          </div>
        </SectionCard>
      </div>

{/* parts-lookup-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_parts_lookup", lang)} id="parts-lookup">
          <SmallHint>
            {t("card_hint_parts_lookup", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <PartsLookup
              manufacturer={manufacturer}
              model={model}
              equipmentType={equipmentType}
              finalConfirmedCause={finalConfirmedCause}
              partsReplaced={partsReplaced}
            />
          </div>
        </SectionCard>
      </div>

{/* suggested-follow-up-watchlist-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("followup_watchlist_title", lang)}>
          <SmallHint>
            {t("followup_watchlist_hint", lang)}
          </SmallHint>

          <SuggestedFollowUpWatchlist
            payload={buildSuggestedFollowUpWatchlist()}
            message={followUpWatchlistMessage}
            onApply={applySuggestedFollowUpWatchlist}
          />
        </SectionCard>
      </div>

{/* verification-outcome-repair-commit-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("verification_outcome_title", lang)}>
          <SmallHint>
            {t("verification_outcome_hint", lang)}
          </SmallHint>

          <VerificationOutcomeRepairCommit
            selectedPart={buildPartVerificationChecklistItems().selectedPart}
            selectedOutcome={selectedVerificationOutcome}
            onSelectOutcome={setSelectedVerificationOutcome}
            note={verificationOutcomeNote}
            onNoteChange={setVerificationOutcomeNote}
            onApply={applyVerificationOutcomeAndRepairCommit}
            message={verificationOutcomeMessage}
          />
        </SectionCard>
      </div>

{/* suggested-parts-to-verify-v1 */}
      
      {/* top-measurements-observations-block-v1 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>{t("step2b_title", lang)}</div>
          <SmallHint>
            {t("step2b_hint", lang)}
          </SmallHint>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <label style={{ fontWeight: 900 }}>{t("field_label", lang)}</label>
              <input
                value={obsLabel}
                onChange={(e) => setObsLabel(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>{t("field_value", lang)}</label>
              <input
                value={obsValue}
                onChange={(e) => setObsValue(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>{t("field_unit", lang)}</label>
              <select
                value={obsUnit}
                onChange={(e) => setObsUnit(e.target.value)}
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

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 900 }}>{t("field_note_optional", lang)}</label>
              <input
                value={obsNote}
                onChange={(e) => setObsNote(e.target.value)}
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
                onChange={(e) => setAutoConvert(e.target.checked)}
              />
              {t("auto_convert_label", lang)}
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={addMeasurement}
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
                {t("btn_add_measurement", lang)}
              </button>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #cfcfcf",
                  background: "#fafafa",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {t("observations_entered_count", lang)} {Array.isArray(observations) ? observations.length : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

              <div style={{ marginTop: 16 }}>
        <SmartReadingsVoice
          onReadings={(readings: ParsedReading[]) => {
            readings.forEach((r) => {
              setObservations((prev: Observation[]) => {
                const exists = prev.some(
                  (o) => o.label.toLowerCase() === r.label.toLowerCase()
                );
                if (exists) {
                  return prev.map((o) =>
                    o.label.toLowerCase() === r.label.toLowerCase()
                      ? { ...o, value: r.value, unit: r.unit }
                      : o
                  );
                }
                return [
                  ...prev,
                  { id: String(Date.now()), label: r.label, value: r.value, unit: r.unit, note: "" },
                ];
              });
            });
          }}
        />
      </div>
      <SectionCard title={t("measurements_title", lang)} id="measurements">
          <MeasurementsObservations
            equipmentType={equipmentType}
            measurementOptions={measurementOptions}
            obsLabel={obsLabel}
            onObsLabelChange={setObsLabel}
            obsValue={obsValue}
            onObsValueChange={setObsValue}
            obsUnit={obsUnit}
            onObsUnitChange={setObsUnit}
            obsNote={obsNote}
            onObsNoteChange={setObsNote}
            autoConvert={autoConvert}
            onAutoConvertChange={setAutoConvert}
            onApplyPreset={applyPreset}
            onAddMeasurement={addMeasurement}
            onClearAll={() => setObservations([])}
            onRemoveObservation={removeObservation}
          />
        </SectionCard>

<SectionCard title={t("nav_parts_manuals_assist", lang)} id="parts-manuals">
            <PartsManualsAssist equipmentType={equipmentType} serviceHistory={unitServiceTimeline} />
          </SectionCard>
          
             <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <SectionCard
          title={t("gpr_title", lang)}
          right={<PillButton text={t("btn_choose_gauge_photo", lang)} onClick={() => gaugeInputRef.current?.click()} />}
        >
          <input
            ref={gaugeInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const dataUrl = await readFileAsDataUrl(f);
              setGaugeImage(dataUrl);
              setGaugeErr("");
              setGaugeRead(null);
            }}
          />

          {gaugeImage ? (
            <div style={{ display: "grid", gap: 10 }}>
              <img
                src={gaugeImage}
                alt="Gauge photo"
                style={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                  border: "1px solid #eee",
                  borderRadius: 10,
                }}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <PillButton
                  text={gaugeBusy ? t("btn_reading_ellipsis", lang) : t("btn_read_gauges", lang)}
                  onClick={analyzeGaugePhoto}
                  disabled={gaugeBusy}
                />
                <PillButton
                  text={t("btn_clear", lang)}
                  onClick={() => {
                    setGaugeImage("");
                    setGaugeErr("");
                    setGaugeRead(null);
                  }}
                />
              </div>

              {gaugeErr ? (
                <div style={{ color: "crimson", fontWeight: 800 }}>{gaugeErr}</div>
              ) : null}

              {gaugeRead ? (
                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 900 }}>
                    {t("gpr_gauge_read", lang)}
                    <Badge text={gaugeRead.confidence} />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <div>
                      <b>{t("gpr_suction", lang)}</b>{" "}
                      {gaugeRead.suction_psi !== null ? `${gaugeRead.suction_psi} psi` : "—"}
                    </div>
                    <div>
                      <b>{t("gpr_head", lang)}</b>{" "}
                      {gaugeRead.head_psi !== null ? `${gaugeRead.head_psi} psi` : "—"}
                    </div>
                    <div>
                      <b>{t("gpr_low_sat", lang)}</b>{" "}
                      {gaugeRead.low_sat_f !== null ? `${gaugeRead.low_sat_f} °F` : "—"}
                    </div>
                    <div>
                      <b>{t("gpr_high_sat", lang)}</b>{" "}
                      {gaugeRead.high_sat_f !== null ? `${gaugeRead.high_sat_f} °F` : "—"}
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 900 }}>{t("gpr_quick_diagnosis", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{gaugeRead.quick_diagnosis}</SmallHint>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 900 }}>{t("label_notes", lang)}</div>
                    <SmallHint style={{ marginTop: 4 }}>{gaugeRead.notes}</SmallHint>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <PillButton
                      text={t("btn_add_readings_to_measurements", lang)}
                      onClick={addGaugeReadingsToMeasurements}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <SmallHint>
              {t("gpr_empty_state", lang)}
            </SmallHint>
          )}
        </SectionCard>

        <SectionCard title={t("pt_chart_intelligence_title", lang)}>
          <PtChartChargeDiagnosis chargeAnalysis={chargeAnalysis} />
        </SectionCard>
      </div>

           <div style={{ marginTop: 10 }}>
        <SectionCard title={t("airflow_intelligence_title", lang)}>
          <AirflowIntelligence airflowAnalysis={airflowAnalysis} />
        </SectionCard>
      </div>

        <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >

        <div style={{ marginTop: 10 }}>
  <SectionCard title={t("defrost_intelligence_title", lang)}>
    <DefrostIntelligence defrostAnalysis={defrostAnalysis} />
  </SectionCard>
</div>

<div style={{ marginTop: 10 }}>
  <SectionCard title={t("defrost_repair_guidance_title", lang)}>
    <DefrostRepairGuidance guidance={defrostRepairGuidance} />
  </SectionCard>
</div>

   <SectionCard
          title={t("pd_title", lang)}
          id="photo-diagnose"
          right={<PillButton text={t("btn_choose_photo", lang)} onClick={() => photoInputRef.current?.click()} />}
        >
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const dataUrl = await readFileAsDataUrl(f);
              setPhotoImage(dataUrl);
              setPhotoResult("");
              setPhotoError("");
            }}
          />

          {photoImage ? (
            <div style={{ display: "grid", gap: 10 }}>
              <img
                src={photoImage}
                alt="Diagnostic photo"
                style={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                  border: "1px solid #eee",
                  borderRadius: 10,
                }}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <PillButton
                  text={photoLoading ? t("btn_analyzing_ellipsis", lang) : t("btn_analyze_photo", lang)}
                  onClick={analyzePhoto}
                  disabled={photoLoading}
                />
                <PillButton
                  text={t("btn_clear", lang)}
                  onClick={() => {
                    setPhotoImage("");
                    setPhotoResult("");
                    setPhotoError("");
                  }}
                />
              </div>
              {photoError ? (
                <div style={{ color: "crimson", fontWeight: 800 }}>{photoError}</div>
              ) : null}
              {photoResult ? (
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 10,
                    background: "#fafafa",
                  }}
                >
                  {photoResult}
                </pre>
              ) : null}
            </div>
          ) : (
            <SmallHint>
              {t("pd_empty_state", lang)}
            </SmallHint>
          )}
        </SectionCard>

{/* step-wrappers-page-reflow-v1-step-3 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #dfe7f3",
            borderRadius: 12,
            padding: 12,
            background: "#f8fbff",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>{t("step3_title", lang)}</div>
          <SmallHint>
            {t("step3_hint", lang)}
          </SmallHint>
        </div>
      </div>

      {/* AI Diagnosis Assistant */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={`🤖 ${t("ai_assistant_title", lang)}`} id="ai-chat">
          <SmallHint>
            {t("ai_chat_full_hint", lang)}
          </SmallHint>
          <div style={{ marginTop: 8, padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <span style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
              {t("ai_gigo_full", lang)}
            </span>
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setShowAiChatBot((v) => !v)}
              style={{
                padding: "10px 16px",
                fontWeight: 900,
                fontSize: 14,
                border: "2px solid #1e3a5f",
                borderRadius: 10,
                background: showAiChatBot ? "#1e3a5f" : "#fff",
                color: showAiChatBot ? "#fff" : "#1e3a5f",
                cursor: "pointer",
              }}
            >
              {showAiChatBot ? `▲ ${t("ai_hide_assistant", lang)}` : `▼ ${t("ai_open_assistant", lang)}`}
            </button>
            {showAiChatBot && (
              <div style={{ marginTop: 12 }}>
                {!can("ai_queries_per_day") ? (
                  <UpgradePrompt
                    feature={t("up_feature_unlimited_ai", lang)}
                    reason={t("up_reason_unlimited_ai", lang)}
                  />
                ) : (
                <AiChatBot
                  equipmentType={equipmentType}
                  manufacturer={manufacturer}
                  model={model}
                  refrigerantType={refrigerantType}
                  symptom={symptom}
                  propertyType={propertyType}
                  observations={observations}
                  serviceHistory={unitServiceTimeline}
                />
                )}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* HVAC Calculators */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_hvac_calculators", lang)} id="calculators">
          <SmallHint>
            {t("card_hint_hvac_calculators", lang)}
          </SmallHint>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setShowHvacCalculators((v) => !v)}
              style={{
                padding: "10px 16px",
                fontWeight: 900,
                fontSize: 14,
                border: "2px solid #16a34a",
                borderRadius: 10,
                background: showHvacCalculators ? "#16a34a" : "#fff",
                color: showHvacCalculators ? "#fff" : "#16a34a",
                cursor: "pointer",
              }}
            >
              {showHvacCalculators ? t("btn_hide_calculators", lang) : t("btn_open_calculators", lang)}
            </button>
            {showHvacCalculators && (
              <div style={{ marginTop: 12 }}>
                {!can("sh_sc_calculator") ? (
                  <UpgradePrompt
                    feature={t("up_feature_full_calc_suite", lang)}
                    reason={t("up_reason_full_calc_suite", lang)}
                  />
                ) : (
                  <HvacCalculators />
                )}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      

{/* belt-reference-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_belt_reference", lang)} id="belt-reference">
          <SmallHint>
            {t("card_hint_belt_reference", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <BeltReference />
          </div>
        </SectionCard>
      </div>

{/* parts-reference-hub-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_parts_reference", lang)} id="parts-reference">
          <SmallHint>
            {t("card_hint_parts_reference", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <PartsReferenceHub />
          </div>
        </SectionCard>
      </div>

{/* filter-reference-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_filter_reference", lang)} id="filter-reference">
          <SmallHint>
            {t("card_hint_filter_reference", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <FilterReference />
          </div>
        </SectionCard>
      </div>

{/* refrigerant-reference-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_refrigerant_reference", lang)} id="refrigerant-reference">
          <SmallHint>
            {t("card_hint_refrigerant_reference", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <RefrigerantReference />
          </div>
        </SectionCard>
      </div>

{/* wiring-reference-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_wiring_reference", lang)} id="wiring-reference">
          <SmallHint>
            {t("card_hint_wiring_reference", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <WiringReference equipmentType={equipmentType} />
          </div>
        </SectionCard>
      </div>

{/* pm-form-filler-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_pm_form_filler", lang)} id="pm-forms">
          <SmallHint>
            {t("card_hint_pm_form_filler", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <PMFormFiller
              manufacturer={manufacturer}
              model={model}
              serial={serialNumber}
              refrigerantType={refrigerantType}
              equipmentType={equipmentType}
            />
          </div>
        </SectionCard>
      </div>

{/* estimator-section-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_estimator", lang)} id="estimator">
          <SmallHint>
            {t("card_hint_estimator", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <EstimatorSection
              manufacturer={manufacturer}
              model={model}
              equipmentType={equipmentType}
            />
          </div>
        </SectionCard>
      </div>

      {/* expert-hotline-v1 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("card_title_expert_hotline", lang)} id="expert-hotline">
          <SmallHint>
            {t("card_hint_expert_hotline", lang)}
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <ExpertHotline />
          </div>
        </SectionCard>
      </div>

{/* repair-decision-panel-v2 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("repair_decision_title", lang)} id="repair">
          <SmallHint>
            {t("repair_decision_hint", lang)}
          </SmallHint>

          <RepairDecisionPanel
            decisions={buildRepairDecisionPanelItems()}
            targetComponent={getCurrentAffectedComponentLabelForAssist()}
            sameComponentHistoryCount={getSameComponentHistoryForTroubleshooting().length}
            onAddPartsReplaced={(part) =>
              setPartsReplaced((prev) =>
                [String(prev || "").trim(), part].filter(Boolean).join(", ")
              )
            }
          />
        </SectionCard>
      </div>

{/* guided-next-test-engine-v2 */}
      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("guided_next_test_title", lang)} id="guided-diagnosis">
          <SmallHint>
            {t("guided_next_test_hint", lang)}
          </SmallHint>

          {(() => {
            const tests = buildGuidedNextTests();
            const targetComponent = getCurrentAffectedComponentLabelForAssist();
            const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
            const warningSignals = getComponentAwareWarningSignals();

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      {t("label_target_component", lang)}
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetComponent || t("fallback_primary_component", lang)}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      {t("label_current_symptom", lang)}
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      {t("label_same_component_history", lang)}
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>
                </div>

                {warningSignals.length ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fff8e8",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{t("label_pattern_warnings", lang)}</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {warningSignals.slice(0, 3).map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div style={{ display: "grid", gap: 12 }}>
                  {tests.map((test, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                        background: "#fafafa",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {t("label_test_n", lang)} {idx + 1}: {test.title}
                      </div>

                      <SmallHint><b>{t("label_tool", lang)}</b> {test.tool}</SmallHint>
                      <SmallHint><b>{t("label_why", lang)}</b> {test.why}</SmallHint>
                      <SmallHint><b>{t("label_what_to_do", lang)}</b> {test.how}</SmallHint>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

        <div style={{ marginTop: 10 }}>
        <SectionCard title={t("suggested_parts_title", lang)}>
          <SmallHint>
            {t("suggested_parts_hint", lang)}
          </SmallHint>

          {(() => {
            const items = buildSuggestedPartsToVerifyItems();

            if (!items.length) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>{t("suggested_parts_empty", lang)}</SmallHint>
                </div>
              );
            }

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                {items.map((item, idx) => (
                  <div
                    key={`${item.part}-${idx}`}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fafafa",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900 }}>
                        {t("label_part_n", lang)} {idx + 1}: {item.part}
                      </div>

                      <div
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 800,
                          background:
                            item.confidence === "High confidence"
                              ? "#eef6ff"
                              : item.confidence === "Verify first"
                                ? "#fff8e8"
                                : "#fff1f1",
                        }}
                      >
                        {item.confidence === "High confidence"
                          ? t("confidence_high", lang)
                          : item.confidence === "Verify first"
                            ? t("confidence_verify_first", lang)
                            : t("confidence_low_callback", lang)}
                      </div>
                    </div>

                    <div>
                      <SmallHint><b>{t("label_why_part_in_play", lang)}</b></SmallHint>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {item.reasons.map((reason, reasonIdx) => (
                          <li key={reasonIdx}>
                            <SmallHint>{reason}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <SmallHint><b>{t("label_prove_before_replacing", lang)}</b></SmallHint>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {item.prove.map((entry, proveIdx) => (
                          <li key={proveIdx}>
                            <SmallHint>{entry}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <SmallHint><b>{t("label_blind_replace_risk", lang)}</b> {item.blindRisk}</SmallHint>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setPartsReplaced((prev) => {
                            const current = String(prev || "").trim();
                            const existing = current
                              .split(/[;,]/)
                              .map((entry) => entry.trim().toLowerCase())
                              .filter(Boolean);

                            if (existing.includes(item.part.trim().toLowerCase())) {
                              return current;
                            }

                            return [current, item.part].filter(Boolean).join(", ");
                          })
                        }
                        style={{
                          padding: "8px 12px",
                          fontWeight: 900,
                          border: "1px solid #cfcfcf",
                          borderRadius: 10,
                          background: "#ffffff",
                          color: "#111",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      >
                        {t("btn_add_part_to_replaced", lang)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </SectionCard>
      </div>

      {/* step-wrappers-page-reflow-v1-step-6 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            border: "1px solid #f0e6c8",
            borderRadius: 12,
            padding: 12,
            background: "#fffaf0",
            display: "grid",
            gap: 6,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>{t("step6_advanced_title", lang)}</div>
          <SmallHint>
            {t("step6_advanced_hint", lang)}
          </SmallHint>
        </div>
      </div>

{/* failure-dashboard-toggle-only-v1 */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: showFailureDashboard ? 10 : 0,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            {t("fid_title", lang)}
          </div>

          <button
            type="button"
            onClick={() => setShowFailureDashboard((prev) => !prev)}
            style={{
              padding: "8px 12px",
              fontWeight: 900,
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {showFailureDashboard ? t("btn_hide_dashboard", lang) : t("btn_open_dashboard", lang)}
          </button>
        </div>

        {showFailureDashboard ? (
          <SectionCard title={t("fid_title", lang)}>
            <SmallHint>
              {t("fid_hint", lang)}
            </SmallHint>

            {failureDashboardLoading ? (
              <div style={{ marginTop: 12 }}>
                <SmallHint>{t("fid_loading", lang)}</SmallHint>
              </div>
            ) : failureDashboardError ? (
              <div style={{ marginTop: 12 }}>
                <SmallHint>{failureDashboardError}</SmallHint>
              </div>
            ) : (() => {
              const data = buildFailureIntelligenceDashboard();

              if (!data.totalEvents) {
                return (
                  <div style={{ marginTop: 12 }}>
                    <SmallHint>{t("fid_no_history", lang)}</SmallHint>
                  </div>
                );
              }

              const renderList = (title: string, items: Array<[string, number]>) => (
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 12,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{title}</div>
                  {items.length ? (
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {items.map(([label, count], idx) => (
                        <li key={`${title}-${idx}`}>
                          <SmallHint>
                            {label} — <b>{count}</b>
                          </SmallHint>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <SmallHint style={{ marginTop: 8 }}>{t("fid_no_data_yet", lang)}</SmallHint>
                  )}
                </div>
              );

              return (
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        {t("fid_total_service_events", lang)}
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>{data.totalEvents}</div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        {t("fid_callback_events", lang)}
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>{data.callbackEvents}</div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        {t("fid_top_failing_component", lang)}
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {data.topComponents.length ? data.topComponents[0][0] : "-"}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        {t("fid_top_repeat_site", lang)}
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {data.topSites.length ? data.topSites[0][0] : "-"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => void loadFailureIntelligenceDashboardData()}
                      style={{
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      {t("btn_refresh_dashboard", lang)}
                    </button>

                    <SmallHint>
                      {t("fid_last_refreshed", lang)}{" "}
                      {failureDashboardRefreshedAt
                        ? new Date(failureDashboardRefreshedAt).toLocaleString()
                        : "-"}
                    </SmallHint>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {renderList(t("fid_top_failing_components", lang), data.topComponents)}
                    {renderList(t("fid_callback_hotspots", lang), data.topCallbackComponents)}
                    {renderList(t("fid_top_equipment_types", lang), data.topEquipmentTypes)}
                    {renderList(t("fid_top_repeat_sites", lang), data.topSites)}
                    {renderList(t("fid_top_repeat_symptoms", lang), data.topSymptoms)}
                    {renderList(t("fid_top_cause_fix", lang), data.topCauseFixes)}
                    {renderList(t("fid_most_replaced_parts", lang), data.topParts)}
                  </div>
                </div>
              );
            })()}
          </SectionCard>
        ) : null}
      </div>

<div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>
  {/* system-health-score-v1 */}
{unitServiceTimeline.length > 0 && (() => {
  const __healthResult = calcSystemHealthScore(unitServiceTimeline, undefined, lang);
  return (
    <div style={{ marginBottom: 16 }}>
      <SystemHealthScore
        result={__healthResult}
        unitName={undefined}
      />
    </div>
  );
})()}
<SectionCard title={t("card_title_unit_service_timeline", lang)}>
    <UnitServiceTimeline
      loading={unitServiceTimelineLoading}
      events={unitServiceTimeline}
      message={unitServiceTimelineMessage}
      getComponentFilterOptions={getTimelineComponentFilterOptions}
      eventMatchesComponentFilter={timelineEventMatchesComponentFilter}
      getComponentDisplayForEvent={getAffectedComponentDisplayForEvent}
      onEditEvent={loadServiceEventIntoForm}
    />
  </SectionCard>
</div>
      <div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>

        <SectionCard title={t("card_title_saved_unit_history", lang)} id="unit-library" right={<Badge text={t("badge_saved_count", lang).replace("{count}", String(savedUnits.length))} />}>
          <SavedUnitHistory
            savedUnits={savedUnits}
            onLoadUnit={loadUnit}
            onRemoveUnit={removeSavedUnit}
          />
        </SectionCard>
      </div>
      </div>

      <div style={{ marginTop: 16 }}>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 900 }}>{"Property Type"}</label>
            <br />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>{"Equipment Type"}</label>
            <br />
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              {equipmentTypeGroups.map((group) => (
                <optgroup key={group.groupLabel} label={translateEquipmentGroupLabel(group.groupLabel, lang)}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>
                      {translateEquipmentType(option, lang)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>{"Manufacturer"}</label>
            <br />
            <input
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>{"Model (optional)"}</label>
            <br />
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
  <label style={{ fontWeight: 900 }}>{"Serial Number"}</label>
  <br />
  <input
    value={serialNumber}
    onChange={(e) => setSerialNumber(e.target.value)}
    placeholder="Example: S12345AB789"
    style={{ width: "100%", padding: 8 }}
  />
</div> 

          <div>
            <label style={{ fontWeight: 900 }}>{"Refrigerant Type"}</label>
            <br />
            <select
              value={refrigerantType}
              onChange={(e) => setRefrigerantType(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              {refrigerantOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          
          {/* top-identify-equipment-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>{t("step1_title", lang)}</div>
              <SmallHint>
                {t("step1_hint", lang)}
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_customer", lang)}</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("intake_site_name", lang)}</label>
                  <input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>{t("intake_site_address", lang)}</label>
                  <input
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("intake_unit_tag", lang)}</label>
                  <input
                    value={unitNickname}
                    onChange={(e) => setUnitNickname(e.target.value)}
                    placeholder="RTU-1, WIC-1, AHU-2, Circuit A"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_property_type", lang)}</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="Commercial">{t("property_type_commercial", lang)}</option>
                    <option value="Residential">{t("property_type_residential", lang)}</option>
                    <option value="Industrial">{t("property_type_industrial", lang)}</option>
                    <option value="Institutional">{t("property_type_institutional", lang)}</option>
                    <option value="Mixed Use">{t("property_type_mixed_use", lang)}</option>
                    <option value="Other">{t("property_type_other", lang)}</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_equipment_type", lang)}</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {equipmentTypeGroups.map((group) => (
                      <optgroup key={group.groupLabel} label={translateEquipmentGroupLabel(group.groupLabel, lang)}>
                        {group.options.map((option) => (
                          <option key={option} value={option}>
                            {translateEquipmentType(option, lang)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>



          {/* top-site-units-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <SectionCard title={t("site_units_title", lang)}>
              <SiteUnitsAtLocation
                customerName={customerName}
                siteName={siteName}
                siteUnitsAtLocation={siteUnitsAtLocation}
                currentLoadedUnitId={currentLoadedUnitId}
                onLoadUnit={loadUnit}
              />
            </SectionCard>
          </div>

{/* top-equipment-details-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>{t("step1b_title", lang)}</div>
              <SmallHint>
                {t("step1b_hint", lang)}
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_manufacturer", lang)}</label>
                  <input
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_model", lang)}</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_serial", lang)}</label>
                  <input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_refrigerant_type", lang)}</label>
                  <select
                    value={refrigerantType}
                    onChange={(e) => setRefrigerantType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {refrigerantOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

      <SectionCard
          title={t("npr_title", lang)}
          id="nameplate-reader"
          right={<PillButton text={t("btn_choose_photo", lang)} onClick={() => fileInputRef.current?.click()} />}
        >
          <NameplateReader
            fileInputRef={fileInputRef}
            image={nameplateImage}
            nameplate={nameplate}
            busy={nameplateBusy}
            error={nameplateErr}
            onPickFile={onPickNameplateFile}
            onParse={parseNameplate}
            onClear={() => {
              setNameplateImage("");
              setNameplate(null);
              setNameplateErr("");
            }}
          />
        </SectionCard>

         <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <SectionCard title={t("symptom_packs_title", lang)} right={<Badge text={translateSymptomPackLabel(selectedPack.label, lang)} />}>
          <SymptomPacks
            packs={SYMPTOM_PACKS.map((p) => ({ id: p.id, label: translateSymptomPackLabel(p.label, lang) }))}
            selectedPackId={selectedPackId}
            onSelectPack={selectPack}
          />
        </SectionCard>

        </div>

          {/* top-complaint-evidence-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>{t("step2_title", lang)}</div>
              <SmallHint>
                {t("step2_hint", lang)}
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_service_date", lang)}</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("job_form_affected_component", lang)}</label>
                  {(() => {
                    const options = getAffectedComponentOptions();
                    return (
                      <div style={{ display: "grid", gap: 8 }}>
                        <select
                          value={affectedComponentId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            const selected = options.find((option) => option.id === nextId);
                            setAffectedComponentId(nextId);
                            setAffectedComponentLabel(selected?.label || "");
                          }}
                          style={{ width: "100%", padding: 8 }}
                        >
                          <option value="">{t("affected_component_select_placeholder", lang)}</option>
                          {options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <div
                          style={{
                            width: "100%",
                            padding: 8,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            background: "#fff",
                            minHeight: 38,
                          }}
                        >
                          {getCurrentAffectedComponentLabelForAssist() || t("affected_component_select_default", lang)}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>{t("job_form_symptom", lang)}</label>
                  <textarea
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    rows={4}
                    placeholder={t("symptom_placeholder", lang)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* top-evidence-quick-entry-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 10 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>{t("step2a_title", lang)}</div>
              <SmallHint>
                {t("step2a_hint", lang)}
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>{t("photo_subject_label", lang)}</label>
                  <select
                    value={photoAssistSubject}
                    onChange={(e) => setPhotoAssistSubject(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="iced_coil">{t("photo_subject_iced_coil", lang)}</option>
                    <option value="contactor_capacitor">{t("photo_subject_contactor_capacitor", lang)}</option>
                    <option value="control_board">{t("photo_subject_control_board", lang)}</option>
                    <option value="wiring">{t("photo_subject_wiring", lang)}</option>
                    <option value="nameplate_tag">{t("photo_subject_nameplate_tag", lang)}</option>
                    <option value="drain_defrost">{t("photo_subject_drain_defrost", lang)}</option>
                    <option value="dirty_coil_airflow">{t("photo_subject_dirty_coil_airflow", lang)}</option>
                    <option value="compressor_section">{t("photo_subject_compressor_section", lang)}</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("photos_attached_label", lang)}</label>
                  <div
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                      minHeight: 38,
                    }}
                  >
                    {Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>{t("observations_entered_label", lang)}</label>
                  <div
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                      minHeight: 38,
                    }}
                  >
                    {Array.isArray(observations) ? observations.length : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

{/* restore-error-code-top-section-v1 */}
          <div id="error-codes" style={{ gridColumn: "1 / -1", marginTop: 12, scrollMarginTop: 64 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Step 1A — Error Codes
              </div>

              <SmallHint>
                Enter the active error code early if the board, controller, thermostat, or display is showing one.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Error Code(s)</label>
                  <textarea
                    value={errorCode}
                    onChange={(e) => setErrorCode(e.target.value)}
                    placeholder={"Enter one or more codes. Example:\nE1\nHPS\n3 Flash"}
                    rows={4}
                    style={{ width: "100%", padding: 8 }}
                  />
                  <SmallHint>
                    Enter multiple active codes one per line. The app will store them together in the current Error Code field.
                  </SmallHint>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Error Code Source</label>
                  <select
                    value={errorCodeSource}
                    onChange={(e) => setErrorCodeSource(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="Control Board">Control Board</option>
                    <option value="Thermostat / Controller">Thermostat / Controller</option>
                    <option value="Display / HMI">Display / HMI</option>
                    <option value="VFD / Drive">VFD / Drive</option>
                    <option value="Sensor / Safety Circuit">Sensor / Safety Circuit</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                  background: "#fafafa",
                }}
              >
                {errorCode.trim() ? (
                  <SmallHint>
                    <b>Current Error Code(s):</b> {errorCode.trim()} • <b>Source:</b> {errorCodeSource || "Unknown"}
                  </SmallHint>
                ) : (
                  <SmallHint>No error code entered yet.</SmallHint>
                )}
              </div>
            </div>
          </div>

          {/* circuit-awareness-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Step 1B — Circuit Awareness
              </div>

              <SmallHint>
                Use this when the unit has more than one refrigeration circuit so the complaint, readings, and repair stay tied to the right circuit.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Circuit Count</label>
                  <select
                    value={circuitCount}
                    onChange={(e) => {
                      const next = e.target.value;
                      setCircuitCount(next);
                      const options = buildCircuitOptions(next);
                      if (!options.includes(selectedCircuit)) {
                        setSelectedCircuit(options[0] || "Circuit 1");
                      }
                    }}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="1">1 Circuit</option>
                    <option value="2">2 Circuits</option>
                    <option value="3">3 Circuits</option>
                    <option value="4">4 Circuits</option>
                    <option value="5">5 Circuits</option>
                    <option value="6">6 Circuits</option>
                    <option value="7">7 Circuits</option>
                    <option value="8">8 Circuits</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Selected Circuit</label>
                  <select
                    value={selectedCircuit}
                    onChange={(e) => setSelectedCircuit(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {buildCircuitOptions(circuitCount).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCircuit === "Custom" ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontWeight: 900 }}>Custom Circuit Label</label>
                    <input
                      value={customCircuitLabel}
                      onChange={(e) => setCustomCircuitLabel(e.target.value)}
                      placeholder="Example: Circuit A, Lead Circuit, Compressor Circuit 3"
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 10,
                  background: "#fafafa",
                }}
              >
                <SmallHint>
                  <b>Current Circuit Context:</b> {getSelectedCircuitDisplay() || "Not set"}
                </SmallHint>
              </div>
            </div>
          </div>



          <div style={{ gridColumn: "1 / -1", marginTop: 10 }}>
            <div
              style={{
                border: "1px dashed #d6d6d6",
                borderRadius: 10,
                padding: 10,
                background: "#f7f7f7",
              }}
            >
              <SmallHint>
                <b>Legacy lower equipment entry area:</b> Use <b>Step 1 — Identify Equipment</b> and <b>Step 1B — Equipment Details</b> at the top of the page as the main place to enter equipment information. These older lower fields remain for continuity while the page is being cleaned up.
              </SmallHint>
            </div>
          </div>

                              {/* sticky-mini-summary-banner-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "2px solid #7fb3ff",
                borderRadius: 12,
                padding: 10,
                background: "#eef6ff",
                display: "grid",
                gap: 8,
                position: "sticky",
                top: 8,
                zIndex: 21,
                boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                ⚡ Current Call Summary
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Unit:</b>{" "}
                    {currentLoadedUnitId
                      ? unitNickname || [manufacturer, model].filter(Boolean).join(" ") || "Loaded unit"
                      : "No unit loaded"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Site:</b> {siteName || siteAddress || customerName || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>{t("label_component_colon", lang)}</b> {getCurrentAffectedComponentLabelForAssist() || primaryComponentRole || t("fallback_primary_component", lang)}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Symptom:</b> {symptom || "-"}
                  </SmallHint>
                </div>

                
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Circuit:</b> {getSelectedCircuitDisplay() || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Circuit:</b> {getSelectedCircuitDisplay() || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Circuit:</b> {getSelectedCircuitDisplay() || "-"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Mode:</b>{" "}
                    {editingServiceEventId
                      ? "Editing Event"
                      : historicalEntryMode
                        ? "Historical Entry"
                        : "Live Call"}
                  </SmallHint>
                </div>

                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 999,
                    padding: "6px 10px",
                    background: "#fff",
                  }}
                >
                  <SmallHint>
                    <b>Dashboard:</b> {showFailureDashboard ? "Open" : "Hidden"}
                  </SmallHint>
                </div>
              </div>
            </div>
          </div>

{/* field-action-bar-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                display: "grid",
                gap: 10,
                position: "sticky",
                top: 76,
                zIndex: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  Field Action Bar
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {currentLoadedUnitId ? (
                    <span
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#fafafa",
                      }}
                    >
                      Loaded Unit
                    </span>
                  ) : null}

                  {editingServiceEventId ? (
                    <span
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#fff8e8",
                      }}
                    >
                      Editing Event
                    </span>
                  ) : null}

                  {historicalEntryMode ? (
                    <span
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 999,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#eef6ff",
                      }}
                    >
                      Historical Mode
                    </span>
                  ) : null}
                </div>
              </div>

              <SmallHint>
                Quick access to the main actions a tech uses on the live call.
              </SmallHint>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => applySmartReadingsParser()}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Parse Readings
                </button>

                <button
                  type="button"
                  onClick={buildDiagnosticCloseoutDrafts}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Generate Closeout
                </button>

                {!editingServiceEventId ? (
                  <button
                    type="button"
                    onClick={() => void saveCurrentCallAsServiceEvent()}
                    disabled={!currentLoadedUnitId}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: currentLoadedUnitId ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: currentLoadedUnitId ? 1 : 0.7,
                    }}
                  >
                    Save Current Call
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void updateCurrentServiceEvent()}
                    disabled={!currentLoadedUnitId}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: currentLoadedUnitId ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: currentLoadedUnitId ? 1 : 0.7,
                    }}
                  >
                    Update Event
                  </button>
                )}

                {editingServiceEventId ? (
                  <button
                    type="button"
                    onClick={cancelEditingServiceEvent}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    Cancel Edit
                  </button>
                ) : null}

                {historicalEntryMode ? (
                  <button
                    type="button"
                    onClick={() => void saveHistoricalCallAndReset()}
                    disabled={!currentLoadedUnitId}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: currentLoadedUnitId ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: currentLoadedUnitId ? 1 : 0.7,
                    }}
                  >
                    Save & Add Another
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setShowFailureDashboard((prev) => !prev);
                    if (!showFailureDashboard) {
                      void loadFailureIntelligenceDashboardData();
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  {showFailureDashboard ? "Hide Dashboard" : "Open Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={() => void loadFailureIntelligenceDashboardData()}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Refresh Dashboard
                </button>

          {/* step-wrappers-page-reflow-v1-step-2 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 16 }}>
            <div
              style={{
                border: "1px solid #dfe7f3",
                borderRadius: 12,
                padding: 12,
                background: "#f8fbff",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>Step 2 — Complaint + Evidence</div>
              <SmallHint>
                Enter the complaint, select the affected component, and capture readings / photo / observations before using the deeper guidance tools.
              </SmallHint>
            </div>
          </div>

              </div>
            </div>
          </div>

{/* smart-readings-parser-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: "#fafafa",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                Smart Readings Parser
              </div>

              <SmallHint>
                Paste or type readings in one line and the app will auto-fill the matching fields it recognizes.
                Example: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58
              </SmallHint>

              <textarea data-auto-grow="true" onInput={autoGrowTextarea}
                value={smartReadingsInput}
                onChange={(e) => setSmartReadingsInput(e.target.value)}
                placeholder="Example: suction 50 head 175 superheat 18 subcool 7 return 74 supply 58 box 10"
                rows={3}
                style={{ width: "100%", padding: 8 }}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => applySmartReadingsParser()}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Parse Readings
                </button>


                <button
                  type="button"
                  onClick={undoLastSmartReadingsParse}
                  disabled={!smartReadingsUndoSnapshot}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: smartReadingsUndoSnapshot ? "pointer" : "not-allowed",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: smartReadingsUndoSnapshot ? 1 : 0.7,
                  }}
                >
                  Undo Last Parse
                </button>

                <button
                  type="button"
                  onClick={startSmartReadingsDictation}
                  disabled={!browserSupportsSmartReadingsDictation() || smartReadingsListening}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: smartReadingsListening ? "#f7f7f7" : "#ffffff",
                    color: "#111",
                    cursor:
                      !browserSupportsSmartReadingsDictation() || smartReadingsListening
                        ? "not-allowed"
                        : "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity:
                      !browserSupportsSmartReadingsDictation() || smartReadingsListening ? 0.7 : 1,
                  }}
                >
                  {smartReadingsListening ? "Listening..." : "Start Dictation"}
                </button>

                <button
                  type="button"
                  onClick={stopSmartReadingsDictation}
                  disabled={!smartReadingsListening}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: smartReadingsListening ? "pointer" : "not-allowed",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: smartReadingsListening ? 1 : 0.7,
                  }}
                >
                  Stop Dictation
                </button>

                <button
                  type="button"
                  onClick={clearSmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Clear Parser
                </button>
              </div>

              {!browserSupportsSmartReadingsDictation() ? (
                <SmallHint>
                  Dictation is not supported in this browser. Try Chrome or Edge.
                </SmallHint>
              ) : null}

              {smartReadingsMessage ? (
                <SmallHint>
                  <b>Parser Result:</b> {smartReadingsMessage}
                </SmallHint>
              ) : null}

              {smartReadingsPreviewRows.length ? (
                <div
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 10,
                    padding: 12,
                    background: "#fffdf7",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    Parsed Readings Preview
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {smartReadingsPreviewRows.map((row, idx) => (
                      <div
                        key={`${row.label}-${idx}`}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 10,
                          padding: 10,
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>
                          {row.label}
                        </div>
                        <div style={{ marginTop: 4, fontWeight: 700 }}>
                          {row.value}{row.unit ? ` ${row.unit}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={applySmartReadingsPreview}
                      style={{
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Apply Parsed Readings
                    </button>

                    <button
                      type="button"
                      onClick={cancelSmartReadingsPreview}
                      style={{
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Cancel Preview
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 900 }}>{t("label_symptom", lang)}</label>
            <br />
            <textarea data-auto-grow="true" onInput={autoGrowTextarea}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />

          {/* core-field-dictation-v1-symptom */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startSymptomDictation}
              disabled={!browserSupportsFieldDictation() || symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: symptomListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor: !browserSupportsFieldDictation() || symptomListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !browserSupportsFieldDictation() || symptomListening ? 0.7 : 1,
              }}
            >
              {symptomListening ? t("dictation_listening", lang) : t("btn_start_symptom_dictation", lang)}
            </button>

            <button
              type="button"
              onClick={stopSymptomDictation}
              disabled={!symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: symptomListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: symptomListening ? 1 : 0.7,
              }}
            >
              {t("btn_stop_dictation", lang)}
            </button>
          </div>

          {!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              {t("dictation_not_supported", lang)}
            </SmallHint>
          ) : null}

          {symptomDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>{t("label_symptom_dictation_colon", lang)}</b> {symptomDictationMessage}
            </SmallHint>
          ) : null}


          {/* symptom-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startSymptomDictation}
              disabled={!browserSupportsSymptomDictation() || symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: symptomListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsSymptomDictation() || symptomListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsSymptomDictation() || symptomListening ? 0.7 : 1,
              }}
            >
              {symptomListening ? t("dictation_listening", lang) : t("btn_start_symptom_dictation", lang)}
            </button>

            <button
              type="button"
              onClick={stopSymptomDictation}
              disabled={!symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: symptomListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: symptomListening ? 1 : 0.7,
              }}
            >
              {t("btn_stop_dictation", lang)}
            </button>
          </div>

          {!browserSupportsSymptomDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              {t("dictation_not_supported", lang)}
            </SmallHint>
          ) : null}

          {symptomDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>{t("label_symptom_dictation_colon", lang)}</b> {symptomDictationMessage}
            </SmallHint>
          ) : null}


            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <button
                onClick={() => setSymptom("No Cooling")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_no_cooling", lang)}
              </button>

              <button
                onClick={() => setSymptom("No Heat")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_no_heat", lang)}
              </button>

              <button
                onClick={() => setSymptom("Water Leak")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_water_leak", lang)}
              </button>

              <button
                onClick={() => setSymptom("Not Running")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_not_running", lang)}
              </button>

              <button
                onClick={() => setSymptom("Low Temp")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_low_temp", lang)}
              </button>

              <button
                onClick={() => setSymptom("High Temp")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_high_temp", lang)}
              </button>

              <button
                onClick={() => setSymptom("Noise")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_noise", lang)}
              </button>

              <button
                onClick={() => setSymptom("Maintenance")}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                {t("symptom_maintenance", lang)}
              </button>
            </div>

            <input
              style={{ width: "100%", padding: 8, minHeight: 90 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button
            onClick={handleDiagnose}
            disabled={loading}
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
            {loading ? t("btn_diagnosing", lang) : t("btn_diagnose", lang)}
          </button>

          <button
            onClick={updateDiagnosisNow}
            disabled={loading}
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
            {t("btn_update_diagnosis", lang)}
          </button>

          <button
            onClick={findManualsParts}
            disabled={mpBusy || !manufacturer.trim()}
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
            {mpBusy ? t("btn_finding", lang) : t("btn_parts_manuals", lang)}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <SectionCard
          title={t("service_report_gen_title", lang)}
          right={<PillButton text={t("btn_open_printable_report", lang)} onClick={openPrintableReport} />}
        >
          <SmallHint>
            {t("service_report_gen_hint", lang)}
          </SmallHint>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 12,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>{t("label_report_preview", lang)}</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 10,
              }}
            >
              <div><b>{t("label_customer_colon", lang)}</b> {customerName || "-"}</div>
              <div><b>{t("label_company_colon", lang)}</b> {unitProfileUnit?.companyName || "-"}</div>
              <div><b>{t("label_site_colon", lang)}</b> {siteName || "-"}</div>
              <div><b>{t("label_address_colon", lang)}</b> {siteAddress || "-"}</div>
              <div><b>{t("label_unit_tag_colon", lang)}</b> {unitNickname || "-"}</div>
              <div><b>{t("label_manufacturer_colon", lang)}</b> {manufacturer || "-"}</div>
              <div><b>{t("label_model_colon", lang)}</b> {model || "-"}</div>
              <div><b>{t("label_equipment_type_colon", lang)}</b> {equipmentType || "-"}</div>
              <div><b>{t("label_refrigerant_colon", lang)}</b> {refrigerantType || "-"}</div>
            </div>

            <div>
  <label style={{ fontWeight: 900 }}>{t("label_error_code_optional", lang)}</label>
  <br />
  <input
    value={errorCode}
    onChange={(e) => setErrorCode(e.target.value)}
    placeholder={t("placeholder_error_code_example", lang)}
    style={{ width: "100%", padding: 8 }}
  />
</div>

<div>
  <label style={{ fontWeight: 900 }}>{t("label_error_code_source", lang)}</label>
  <br />
  <select
    value={errorCodeSource}
    onChange={(e) => setErrorCodeSource(e.target.value)}
    style={{ width: "100%", padding: 8 }}
  >
    <option value="Control Board">{t("error_source_control_board", lang)}</option>
    <option value="Thermostat">{t("error_source_thermostat", lang)}</option>
    <option value="Indoor Unit">{t("error_source_indoor_unit", lang)}</option>
    <option value="Outdoor Unit">{t("error_source_outdoor_unit", lang)}</option>
    <option value="Display Panel">{t("error_source_display_panel", lang)}</option>
    <option value="Blink Code">{t("error_source_blink_code", lang)}</option>
    <option value="Unknown">{t("error_source_unknown", lang)}</option>
  </select>
</div>

<div style={{ marginTop: 16 }}>
  
<div style={{ marginTop: 16 }}>
  
        <div style={{ marginTop: 16 }}>
          
        {/* duplicate "Site Units at This Location" card removed - see top-site-units-block-v1 near the top of the page for the live copy; this was the legacy duplicate flagged by the "Legacy lower context area" notice below */}


<div style={{ marginTop: 12 }}>
  <div
    style={{
      border: "1px dashed #d6d6d6",
      borderRadius: 10,
      padding: 10,
      background: "#f7f7f7",
    }}
  >
    <SmallHint>
      <b>Legacy lower context area:</b> The primary equipment identity and site-unit workflow now lives higher on the page. Use the top <b>Customer / Site / Unit</b>, <b>Site Units at This Location</b>, <b>Step 1 — Identify Equipment</b>, and <b>Step 1B — Equipment Details</b> sections first.
    </SmallHint>
  </div>
</div>

        </div>

<SectionCard title={t("service_event_photos_title", lang)}>
    <ServiceEventPhotos
      photoUrls={serviceEventPhotoUrls}
      busy={serviceEventPhotoBusy}
      message={serviceEventPhotoMessage}
      onUploadPhotos={handleUploadServiceEventPhotos}
      onRemovePhoto={(index) =>
        setServiceEventPhotoUrls((prev) => prev.filter((_, idx) => idx !== index))
      }
    />
  </SectionCard>
</div>

<SectionCard title={t("case_outcome_title", lang)}>
    {editingServiceEventId ? (
      <div style={{ marginTop: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid #cfcfcf",
            background: "#fff3e8",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {t("editing_saved_event", lang)}
        </span>
      </div>
    ) : null}
    <SmallHint>
      {t("case_outcome_hint", lang)}
    </SmallHint>

    <div
      style={{
        marginTop: 12,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      <div style={{ gridColumn: "1 / -1" }}>
        <FinalConfirmedCauseField
          value={finalConfirmedCause}
          onChange={setFinalConfirmedCause}
          onAutoGrow={autoGrowTextarea}
          listening={confirmedCauseListening}
          dictationMessage={confirmedCauseDictationMessage}
          onStartDictation={startConfirmedCauseDictation}
          onStopDictation={stopConfirmedCauseDictation}
        />
      </div>

 <div style={{ gridColumn: "1 / -1" }}>
  <label style={{ fontWeight: 900 }}>{t("job_form_service_date", lang)}</label>
  <br />
  <input
    type="date"
    value={serviceDate}
    onChange={(e) => setServiceDate(e.target.value)}
    style={{ width: "100%", padding: 8 }}
  />
</div>

<div style={{ gridColumn: "1 / -1" }}>
        <PartsReplacedField
          value={partsReplaced}
          onChange={setPartsReplaced}
          listening={partsReplacedListening}
          dictationMessage={partsReplacedDictationMessage}
          onStartDictation={startPartsReplacedDictation}
          onStopDictation={stopPartsReplacedDictation}
          chips={buildQuickPartsChips()}
          onAddChip={(chip) =>
            setPartsReplaced((prev) => {
              const current = String(prev || "").trim();
              const existing = current
                .split(/[;,]/)
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean);

              if (existing.includes(chip.trim().toLowerCase())) {
                return current;
              }

              return [current, chip].filter(Boolean).join(", ");
            })
          }
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <ActualFixPerformedField
          value={actualFixPerformed}
          onChange={setActualFixPerformed}
          onAutoGrow={autoGrowTextarea}
          listening={actualFixListening}
          dictationMessage={actualFixDictationMessage}
          onStartDictation={startActualFixDictation}
          onStopDictation={stopActualFixDictation}
        />
      </div>

      <OutcomeCallbackFields
        outcomeStatus={outcomeStatus}
        onOutcomeStatusChange={setOutcomeStatus}
        callbackOccurred={callbackOccurred}
        onCallbackOccurredChange={setCallbackOccurred}
      />

      <SimilarPriorCases cases={equipmentMemory.similarCases} />

      <div style={{ gridColumn: "1 / -1" }}>
        <DiagnosticCloseoutBuilder
          drafts={diagnosticCloseoutDrafts}
          onDraftFieldChange={(field, value) =>
            setDiagnosticCloseoutDrafts((prev) => ({ ...prev, [field]: value }))
          }
          message={diagnosticCloseoutMessage}
          onGenerate={buildDiagnosticCloseoutDrafts}
          onPushInternalSummary={pushInternalSummaryToTechCloseoutNotes}
          onCopy={(field) => void copyDiagnosticCloseoutText(field)}
          onAutoGrow={autoGrowTextarea}
          followUpListening={followUpListening}
          followUpDictationMessage={followUpDictationMessage}
          onStartFollowUpDictation={startFollowUpDictation}
          onStopFollowUpDictation={stopFollowUpDictation}
        />

        <PhotoAssistPanel
          photoCount={Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
          targetComponent={getCurrentAffectedComponentLabelForAssist()}
          latestPhotoUrl={getLatestServiceEventPhotoUrl()}
          photoType={photoAssistType}
          onPhotoTypeChange={setPhotoAssistType}
          onGenerate={buildPhotoAssistDraft}
          onPushToTechNotes={pushPhotoAssistCloseoutToTechNotes}
          message={photoAssistMessage}
          draft={photoAssistDraft}
          onDraftFieldChange={(field, value) =>
            setPhotoAssistDraft((prev) => ({ ...prev, [field]: value }))
          }
          onCopy={(field) => void copyPhotoAssistText(field)}
        />

        <PhotoDrivenDiagnosticAssist
          payload={buildPhotoDrivenDiagnosticAssistPayload()}
          photoCount={Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
          targetComponent={getCurrentAffectedComponentLabelForAssist()}
          photoSubject={photoAssistSubject}
          onPhotoSubjectChange={setPhotoAssistSubject}
          onRefresh={generatePhotoDrivenDiagnosticAssist}
          onAddToTechNotes={addPhotoAssistToTechCloseoutNotes}
          message={photoAssistMessage}
        />

        <TechCloseoutNotesField
          value={techCloseoutNotes}
          onChange={setTechCloseoutNotes}
          onAutoGrow={autoGrowTextarea}
          listening={techCloseoutListening}
          dictationMessage={techCloseoutDictationMessage}
          onStartDictation={startTechCloseoutDictation}
          onStopDictation={stopTechCloseoutDictation}
        />
      </div>
    </div>
  </SectionCard>
</div>

<div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
  <button
    onClick={saveCurrentCallAsServiceEvent}
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
    {t("btn_save_call_to_timeline", lang)}
  </button>
              <button
                onClick={saveHistoricalCallAndReset}
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
                {t("btn_save_add_another", lang)}
              </button>
              {editingServiceEventId ? (
                <button
                  onClick={updateCurrentServiceEvent}
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
                  {t("btn_update_event", lang)}
                </button>
              ) : null}

              {editingServiceEventId ? (
                <button
                  onClick={cancelEditingServiceEvent}
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
                  {t("btn_cancel_edit", lang)}
                </button>
              ) : null}

  {!currentLoadedUnitId ? (
    <SmallHint>
      {t("save_call_hint_no_unit", lang)}
    </SmallHint>
  ) : (
    <SmallHint>
      {t("save_call_hint_with_unit", lang)}
    </SmallHint>
  )}
</div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>{t("label_complaint", lang)}</div>
              <SmallHint style={{ marginTop: 4 }}>
                {symptom || t("no_complaint_yet", lang)}
              </SmallHint>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>{t("label_diagnosis_summary", lang)}</div>
              <SmallHint style={{ marginTop: 4 }}>
                {parsed?.summary || t("no_ai_summary_yet", lang)}
              </SmallHint>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>{t("label_measurements_included", lang)}</div>
              <SmallHint style={{ marginTop: 4 }}>
                {observations.length
                  ? `${observations.length} ${t("measurements_included_count", lang)}`
                  : t("no_measurements_yet", lang)}
              </SmallHint>
            </div>
          </div>
        </SectionCard>
      </div>

      <div style={{ marginTop: 10 }}>
        <SectionCard
          title={t("emai_title", lang)}
          right={<Badge text={t("emai_prior_matches_badge", lang).replace("{count}", String(equipmentMemory.relatedCount))} />}
        >
          <SmallHint>
            {t("emai_hint", lang)}
          </SmallHint>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>{t("emai_summary_title", lang)}</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
              {equipmentMemory.summary}
            </div>

            {equipmentMemory.repeatedSymptoms.length ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900 }}>{t("emai_repeated_symptoms", lang)}</div>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {equipmentMemory.repeatedSymptoms.map((item, i) => (
                    <li key={i}>
                      <SmallHint>{item}</SmallHint>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {equipmentMemory.repeatedCauses.length ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900 }}>{t("emai_repeated_causes", lang)}</div>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {equipmentMemory.repeatedCauses.map((item, i) => (
                    <li key={i}>
                      <SmallHint>{item}</SmallHint>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {equipmentMemory.repeatedMeasurementPatterns.length ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900 }}>{t("emai_repeated_patterns", lang)}</div>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {equipmentMemory.repeatedMeasurementPatterns.map((item, i) => (
                    <li key={i}>
                      <SmallHint>{item}</SmallHint>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {equipmentMemory.suggestedFirstChecks.length ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900 }}>{t("emai_suggested_checks", lang)}</div>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {equipmentMemory.suggestedFirstChecks.map((item, i) => (
                    <li key={i}>
                      <SmallHint>{item}</SmallHint>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <SmallHint style={{ marginTop: 12 }}>
                {t("emai_empty_state", lang)}
              </SmallHint>
            )}
          </div>
        </SectionCard>
      </div>

        <SectionCard title={t("real_flowchart_title", lang)}>
          <RealFlowchartEngine
            node={currentFlowNode}
            onPass={() => advanceFlow("PASS")}
            onFail={() => advanceFlow("FAIL")}
            onUseSuggestedReading={addSuggestedMeasurementFromFlow}
            onResetFlow={() => resetFlowForPack(selectedPackId)}
            onDiagnoseNow={handleDiagnose}
          />
        </SectionCard>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <SectionCard title={t("manuals_parts_title", lang)}>
          <ManualsPartsResults error={mpErr} manualsParts={manualsParts} />
        </SectionCard>


      </div>

      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <DiagnosisSummaryAndCauses parsed={parsed} />

<SectionCard
  title={t("repair_guidance_title", lang)}
  right={
    <div style={{ display: "flex", gap: 8 }}>
      <PillButton
        text={t("pill_apprentice", lang)}
        active={repairGuidanceMode === "apprentice"}
        onClick={() => setRepairGuidanceMode("apprentice")}
      />
      <PillButton
        text={t("pill_experienced", lang)}
        active={repairGuidanceMode === "experienced"}
        onClick={() => setRepairGuidanceMode("experienced")}
      />
    </div>
  }
>
  <RepairGuidancePanel items={repairGuidance} mode={repairGuidanceMode} />
</SectionCard>

<SectionCard title={t("recommended_measurements_title", lang)}>
  <RecommendedMeasurementsPanel items={measurementCoaching} />
</SectionCard>

<SectionCard title={t("error_code_guidance_title", lang)}>
  <ErrorCodeGuidancePanel guidance={errorCodeGuidance} />
</SectionCard>

                    <SectionCard title={t("card_title_advanced_ai_output", lang)}>
                      <AdvancedAiOutput rawResult={rawResult} />
                    </SectionCard>
            </div>
          ) : (
            <SectionCard title={t("card_title_advanced_ai_output", lang)}>
              <AdvancedAiOutput rawResult={rawResult} />
            </SectionCard>
          )}
      </div>

      <SectionCard title={t("card_title_admin_work_tools", lang)}>
        <AdminWorkTools />
      </SectionCard>
</div>

      {showUnitProfile && (
        <UnitProfilePanel
          unit={unitProfileUnit}
          timeline={unitProfileTimeline}
          loading={unitProfileLoading}
          message={unitProfileMessage}
          onClose={() => setShowUnitProfile(false)}
          onLoad={(u) => { loadUnit(u); setShowUnitProfile(false); }}
        />
      )}

{showUnitLibrary ? (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      zIndex: 2000,
    }}
  >
    <div
      style={{
        width: "min(1100px, 96vw)",
        maxHeight: "90vh",
        overflow: "auto",
        background: "#fff",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{t("ul_title", lang)}</div>
          <SmallHint>{t("ul_hint", lang)}</SmallHint>
        </div>

        <button
          onClick={() => setShowUnitLibrary(false)}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {t("btn_close", lang)}
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr auto auto auto",
          gap: 10,
        }}
      >
        <input
          value={unitLibrarySearch}
          onChange={(e) => setUnitLibrarySearch(e.target.value)}
          placeholder={t("ul_search_placeholder", lang)}
          style={{ width: "100%", padding: 8 }}
        />

        <select
          value={unitLibraryEquipmentType}
          onChange={(e) => setUnitLibraryEquipmentType(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">{t("ul_all_equipment_types", lang)}</option>
          {libraryEquipmentTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={unitLibraryManufacturer}
          onChange={(e) => setUnitLibraryManufacturer(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">{t("ul_all_manufacturers", lang)}</option>
          {libraryManufacturerOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={unitLibraryModel}
          onChange={(e) => setUnitLibraryModel(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">{t("ul_all_models", lang)}</option>
          {libraryModelOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={unitLibraryCompany}
          onChange={(e) => setUnitLibraryCompany(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">{t("ul_all_companies", lang)}</option>
          {libraryCompanyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={unitLibraryDateFrom}
          onChange={(e) => setUnitLibraryDateFrom(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />

        <input
          type="date"
          value={unitLibraryDateTo}
          onChange={(e) => setUnitLibraryDateTo(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />

        <button
          onClick={() => setUnitLibraryMode("recent")}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {t("btn_recent", lang)}
        </button>

        <button
          onClick={() => setUnitLibraryMode("all")}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {t("btn_all_units", lang)}
        </button>

        <button
          onClick={() => {
            setUnitLibrarySearch("");
            setUnitLibraryMode("recent");
            setUnitLibraryDateFrom("");
            setUnitLibraryDateTo("");
            setUnitLibraryEquipmentType("");
            setUnitLibraryManufacturer("");
            setUnitLibraryModel("");
            setUnitLibraryCompany("");
          }}
          style={{
            padding: "8px 12px",
            fontWeight: 900,
            border: "1px solid #cfcfcf",
            borderRadius: 10,
            background: "#ffffff",
            color: "#111",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {t("btn_reset_filters", lang)}
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <SmallHint>
          {t("ul_showing_units_mode", lang)
            .replace("{count}", String(filteredLibraryUnits.length))
            .replace("{value}", unitLibraryMode === "recent" ? t("ul_mode_recent_25", lang) : t("ul_mode_all", lang))}
        </SmallHint>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gap: 10,
          maxHeight: "60vh",
          overflow: "auto",
        }}
      >
        {filteredLibraryUnits.length ? (
          filteredLibraryUnits.map((u) => (
            <div
              key={u.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 10,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {u.customerName || t("ul_no_customer", lang)}
                {u.unitNickname ? <Badge text={u.unitNickname} /> : null}
              </div>

              <SmallHint style={{ marginTop: 4 }}>
                {u.siteName || "-"} • {u.manufacturer || "-"} {u.model || "-"} •{" "}
                {u.equipmentType || "-"}
              </SmallHint>

              <SmallHint style={{ marginTop: 4 }}>
                {t("ul_saved_colon", lang).replace("{value}", u.savedAt ? new Date(u.savedAt).toLocaleString() : "-")}
              </SmallHint>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                <PillButton
                  text={t("btn_view_profile", lang)}
                  onClick={() => {
                    setShowUnitLibrary(false);
                    openUnitProfile(u);
                  }}
                />
                <PillButton
                  text={t("btn_load", lang)}
                  onClick={() => {
                    loadUnit(u);
                    setShowUnitLibrary(false);
                  }}
                />
                <PillButton text={t("btn_delete", lang)} onClick={() => removeSavedUnit(u.id)} />
              </div>
            </div>
          ))
        ) : (
          <SmallHint>{t("ul_no_units_matched", lang)}</SmallHint>
        )}
      </div>
    </div>
  </div>
) : null}

  </div>
  </div>
  </JobIdentityProvider>
  );
}