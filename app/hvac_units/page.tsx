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

import { CustomerReport } from "./components/CustomerReport";

import { SmartReadingsVoice, VoiceTextArea, VoiceInputButton } from "./components/VoiceInput";

import { RefrigerantLog } from "./components/RefrigerantLog";

import { SystemHealthScore } from "./components/SystemHealthScore";
import { UnitProfilePanel } from "./components/UnitProfilePanel";

import { StepProgressBar } from "./components/StepProgressBar";

import { calcSystemHealthScore } from "./lib/systemHealthScore";
import type { ParsedReading } from "./components/VoiceInput";

import { readFileAsDataUrl, makeId } from "./lib/fileHelpers";

import { convertToStandard, guessDefaultUnit } from "./lib/unitHelpers";

import { escapeHtml, formatRawOutput } from "./lib/textHelpers";

import { toNumber, round1 } from "./lib/basicHelpers";

import {
  refrigerantOptions,
  unitOptions,
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

type Diagnosis = {
  summary?: string;
  likely_causes?: {
    cause: string;
    probability_percent?: number;
    why?: string;
    what_points_to_it?: string[];
    what_rules_it_out?: string[];
  }[];
  field_measurements_to_collect?: {
    measurement: string;
    where?: string;
    how?: string;
    expected_range?: string;
    why_it_matters?: string;
  }[];
  decision_tree?: {
    step: number;
    check: string;
    how?: string;
    pass_condition?: string;
    fail_condition?: string;
    if_pass_next_step?: number;
    if_fail_next_step?: number;
    notes?: string;
  }[];
  parts_to_check?: {
    part: string;
    why_suspect?: string;
    quick_test?: string;
    common_failure_modes?: string[];
    priority?: "High" | "Medium" | "Low" | string;
  }[];
  safety_notes?: string[];
  when_to_escalate?: string[];
};

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

type ChargeAnalysis = {
  deltaT: number | null;
  superheat: number | null;
  subcool: number | null;
  evapSat: number | null;
  condSat: number | null;
  evapSatSource: "entered" | "pt-chart" | "gauge-photo" | "none";
  condSatSource: "entered" | "pt-chart" | "gauge-photo" | "none";
  summary: string;
  findings: string[];
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

type AirflowAnalysis = {
  totalExternalStatic: number | null;
  returnStatic: number | null;
  supplyStatic: number | null;
  filterDrop: number | null;
  coilDrop: number | null;
  summary: string;
  findings: string[];
};

type EquipmentMemoryInsight = {
  relatedCount: number;
  summary: string;
  repeatedSymptoms: string[];
  repeatedCauses: string[];
  repeatedMeasurementPatterns: string[];
  suggestedFirstChecks: string[];
  commonConfirmedFixes: string[];
  callbackWarnings: string[];
  similarCases: {
  savedAt: string;
  symptom: string;
  finalConfirmedCause: string;
  actualFixPerformed: string;
  outcomeStatus: string;
  callbackOccurred: string;
}[];
};

type PTPoint = { psi: number; tempF: number };

const PT_TABLES: Record<string, PTPoint[]> = {
  "R-410A": [
    { psi: 40, tempF: 1 },
    { psi: 50, tempF: 8 },
    { psi: 60, tempF: 15 },
    { psi: 70, tempF: 22 },
    { psi: 80, tempF: 27 },
    { psi: 90, tempF: 32 },
    { psi: 100, tempF: 36 },
    { psi: 110, tempF: 40 },
    { psi: 118, tempF: 43 },
    { psi: 125, tempF: 45 },
    { psi: 135, tempF: 49 },
    { psi: 145, tempF: 52 },
    { psi: 155, tempF: 55 },
    { psi: 170, tempF: 60 },
    { psi: 190, tempF: 66 },
    { psi: 220, tempF: 75 },
    { psi: 250, tempF: 84 },
    { psi: 280, tempF: 92 },
    { psi: 300, tempF: 98 },
    { psi: 320, tempF: 103 },
    { psi: 340, tempF: 108 },
    { psi: 360, tempF: 113 },
    { psi: 380, tempF: 118 },
    { psi: 418, tempF: 125 },
    { psi: 450, tempF: 131 },
  ],
  "R-22": [
    { psi: 40, tempF: 17 },
    { psi: 50, tempF: 26 },
    { psi: 58, tempF: 32 },
    { psi: 68, tempF: 38 },
    { psi: 76, tempF: 43 },
    { psi: 84, tempF: 47 },
    { psi: 96, tempF: 53 },
    { psi: 106, tempF: 58 },
    { psi: 118, tempF: 64 },
    { psi: 130, tempF: 69 },
    { psi: 146, tempF: 76 },
    { psi: 160, tempF: 81 },
    { psi: 178, tempF: 88 },
    { psi: 196, tempF: 94 },
    { psi: 211, tempF: 99 },
    { psi: 226, tempF: 104 },
    { psi: 242, tempF: 109 },
    { psi: 260, tempF: 114 },
    { psi: 278, tempF: 119 },
    { psi: 296, tempF: 124 },
  ],
  "R-134a": [
    { psi: 10, tempF: 1 },
    { psi: 18, tempF: 18 },
    { psi: 22, tempF: 24 },
    { psi: 26, tempF: 30 },
    { psi: 32, tempF: 38 },
    { psi: 36, tempF: 43 },
    { psi: 40, tempF: 47 },
    { psi: 45, tempF: 52 },
    { psi: 50, tempF: 57 },
    { psi: 57, tempF: 64 },
    { psi: 64, tempF: 70 },
    { psi: 71, tempF: 76 },
    { psi: 79, tempF: 82 },
    { psi: 88, tempF: 88 },
    { psi: 97, tempF: 94 },
    { psi: 107, tempF: 100 },
    { psi: 118, tempF: 106 },
    { psi: 130, tempF: 112 },
    { psi: 143, tempF: 118 },
    { psi: 156, tempF: 123 },
  ],
  "R-404A": [
    { psi: 20, tempF: -14 },
    { psi: 30, tempF: -5 },
    { psi: 40, tempF: 3 },
    { psi: 50, tempF: 10 },
    { psi: 60, tempF: 17 },
    { psi: 70, tempF: 23 },
    { psi: 80, tempF: 28 },
    { psi: 90, tempF: 33 },
    { psi: 100, tempF: 38 },
    { psi: 110, tempF: 42 },
    { psi: 125, tempF: 49 },
    { psi: 140, tempF: 55 },
    { psi: 160, tempF: 62 },
    { psi: 180, tempF: 68 },
    { psi: 200, tempF: 74 },
    { psi: 225, tempF: 81 },
    { psi: 250, tempF: 87 },
    { psi: 275, tempF: 93 },
    { psi: 300, tempF: 99 },
  ],
  "R-407C": [
    { psi: 40, tempF: 11 },
    { psi: 50, tempF: 19 },
    { psi: 60, tempF: 26 },
    { psi: 70, tempF: 32 },
    { psi: 80, tempF: 38 },
    { psi: 90, tempF: 43 },
    { psi: 100, tempF: 48 },
    { psi: 110, tempF: 52 },
    { psi: 120, tempF: 56 },
    { psi: 130, tempF: 60 },
    { psi: 145, tempF: 66 },
    { psi: 160, tempF: 72 },
    { psi: 180, tempF: 79 },
    { psi: 200, tempF: 86 },
    { psi: 220, tempF: 92 },
    { psi: 240, tempF: 98 },
    { psi: 260, tempF: 104 },
    { psi: 280, tempF: 109 },
    { psi: 300, tempF: 114 },
  ],
};

function normalizeLabel(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

function getObservationValue(
  observations: Observation[],
  matcher: (label: string) => boolean,
  preferredUnit?: string
): number | null {
  for (let i = observations.length - 1; i >= 0; i--) {
    const o = observations[i];
    const label = normalizeLabel(o.label);
    if (!matcher(label)) continue;

    const n = toNumber(o.value);
    if (n === null) continue;

    if (!preferredUnit || o.unit === preferredUnit) return n;

    const converted = convertToStandard(n, o.unit);
    if (converted && converted.unit === preferredUnit) return converted.value;
  }
  return null;
}

function ptEstimateTempF(refrigerant: string, psi: number): number | null {
  const table = PT_TABLES[refrigerant];
  if (!table || !table.length || !Number.isFinite(psi)) return null;

  if (psi <= table[0].psi) return table[0].tempF;
  if (psi >= table[table.length - 1].psi) return table[table.length - 1].tempF;

  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (psi >= a.psi && psi <= b.psi) {
      const ratio = (psi - a.psi) / (b.psi - a.psi);
      return round1(a.tempF + (b.tempF - a.tempF) * ratio);
    }
  }

  return null;
}

function analyzeCharge(
  observations: Observation[],
  equipmentType: string,
  refrigerantType: string
): ChargeAnalysis {
  const returnAir =
    getObservationValue(
      observations,
      (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
      "°F"
    ) ??
    getObservationValue(observations, (l) => l.includes("box temp"), "°F");

  const supplyAir =
    getObservationValue(
      observations,
      (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
      "°F"
    ) ??
    getObservationValue(observations, (l) => l.includes("evap coil temp"), "°F");

  const suctionPressure = getObservationValue(
    observations,
    (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
    "psi"
  );

  const liquidPressure = getObservationValue(
    observations,
    (l) =>
      l === "liquid pressure" ||
      l === "head pressure" ||
      ((l.includes("liquid") || l.includes("head")) && l.includes("pressure")),
    "psi"
  );

  const suctionLineTemp =
    getObservationValue(observations, (l) => l.includes("suction line temp"), "°F") ??
    getObservationValue(observations, (l) => l.includes("suction temp"), "°F");

  const liquidLineTemp =
    getObservationValue(observations, (l) => l.includes("liquid line temp"), "°F") ??
    getObservationValue(observations, (l) => l.includes("liquid temp"), "°F");

  const enteredEvapSat =
    getObservationValue(observations, (l) => l.includes("suction saturation temp"), "°F") ??
    getObservationValue(observations, (l) => l.includes("evap saturation temp"), "°F") ??
    getObservationValue(observations, (l) => l.includes("evaporator saturation temp"), "°F");

  const enteredCondSat =
    getObservationValue(observations, (l) => l.includes("condensing saturation temp"), "°F") ??
    getObservationValue(observations, (l) => l.includes("liquid saturation temp"), "°F") ??
    getObservationValue(observations, (l) => l.includes("condenser saturation temp"), "°F");

  const enteredSuperheat = getObservationValue(
    observations,
    (l) => l === "superheat" || l.includes(" superheat"),
    "°F"
  );

  const enteredSubcool = getObservationValue(
    observations,
    (l) => l === "subcool" || l.includes("subcool"),
    "°F"
  );

  const ptEvapSat =
    enteredEvapSat === null && suctionPressure !== null && refrigerantType !== "Unknown"
      ? ptEstimateTempF(refrigerantType, suctionPressure)
      : null;

  const ptCondSat =
    enteredCondSat === null && liquidPressure !== null && refrigerantType !== "Unknown"
      ? ptEstimateTempF(refrigerantType, liquidPressure)
      : null;

  const evapSat = enteredEvapSat ?? ptEvapSat ?? null;
  const condSat = enteredCondSat ?? ptCondSat ?? null;

  const evapSatSource: ChargeAnalysis["evapSatSource"] =
    enteredEvapSat !== null ? "entered" : ptEvapSat !== null ? "pt-chart" : "none";

  const condSatSource: ChargeAnalysis["condSatSource"] =
    enteredCondSat !== null ? "entered" : ptCondSat !== null ? "pt-chart" : "none";

  const deltaT =
    returnAir !== null && supplyAir !== null ? round1(returnAir - supplyAir) : null;

  const superheat =
    enteredSuperheat !== null
      ? round1(enteredSuperheat)
      : suctionLineTemp !== null && evapSat !== null
      ? round1(suctionLineTemp - evapSat)
      : null;

  const subcool =
    enteredSubcool !== null
      ? round1(enteredSubcool)
      : condSat !== null && liquidLineTemp !== null
      ? round1(condSat - liquidLineTemp)
      : null;

  const findings: string[] = [];
  let summary = "Need more readings.";

  const isCoolingType =
    !equipmentType.toLowerCase().includes("furnace") &&
    !equipmentType.toLowerCase().includes("boiler");

  if (evapSatSource === "pt-chart") {
    findings.push(`Evap saturation estimated from ${refrigerantType} PT chart.`);
  }
  if (condSatSource === "pt-chart") {
    findings.push(`Condensing saturation estimated from ${refrigerantType} PT chart.`);
  }

  if (deltaT !== null) {
    if (deltaT < 12) {
      findings.push(
        "Delta-T is low, which can point to low capacity, high airflow, or charge/load issues."
      );
    } else if (deltaT > 22) {
      findings.push(
        "Delta-T is high, which can point to low airflow or a heavily loaded coil."
      );
    } else {
      findings.push("Delta-T is in a typical cooling range.");
    }
  }

  if (superheat !== null) {
    if (superheat > 20) {
      findings.push(
        "Superheat is high, which points toward undercharge, restriction, or starving evaporator."
      );
    } else if (superheat < 5) {
      findings.push(
        "Superheat is very low, which points toward overfeeding, floodback risk, or low airflow."
      );
    } else {
      findings.push("Superheat is in a usable normal range.");
    }
  }

  if (subcool !== null) {
    if (subcool < 5) {
      findings.push("Subcool is low, which points toward undercharge or flash gas.");
    } else if (subcool > 18) {
      findings.push(
        "Subcool is high, which points toward overcharge, restriction, or backed-up liquid."
      );
    } else {
      findings.push("Subcool is in a usable normal range.");
    }
  }

  if (isCoolingType) {
    if (superheat !== null && subcool !== null) {
      if (superheat > 18 && subcool < 5) {
        summary = "Likely undercharged system.";
      } else if (superheat < 6 && subcool > 15) {
        summary = "Likely overcharged system or overfeeding condition.";
      } else if (superheat > 18 && subcool > 15) {
        summary = "Possible restriction or metering issue.";
      } else if (superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
        summary = "Charge looks reasonably close based on entered readings.";
      } else {
        summary = "Charge condition is mixed; verify airflow and saturation temps.";
      }
    } else if (superheat !== null) {
      if (superheat > 18) {
        summary = "High superheat suggests undercharge or restriction.";
      } else if (superheat < 6) {
        summary = "Low superheat suggests floodback, overfeed, or airflow issue.";
      } else {
        summary = "Superheat looks reasonable, but subcool is still needed.";
      }
    } else if (subcool !== null) {
      if (subcool < 5) {
        summary = "Low subcool suggests undercharge.";
      } else if (subcool > 15) {
        summary = "High subcool suggests overcharge or restriction.";
      } else {
        summary = "Subcool looks reasonable, but superheat is still needed.";
      }
    } else if (
      suctionPressure !== null &&
      liquidPressure !== null &&
      refrigerantType !== "Unknown"
    ) {
      summary = "PT chart estimated saturation temps. Add line temps for full SH/SC diagnosis.";
    }
  } else {
    summary = "Charge calculator is mainly intended for cooling / refrigeration systems.";
  }

  return {
    deltaT,
    superheat,
    subcool,
    evapSat,
    condSat,
    evapSatSource,
    condSatSource,
    summary,
    findings,
  };
}

function analyzeAirflow(observations: Observation[]): AirflowAnalysis {
  const returnStatic =
    getObservationValue(
      observations,
      (l) => l === "return static" || l.includes("return static"),
      "inWC"
    ) ??
    getObservationValue(observations, (l) => l.includes("return pressure"), "inWC");

  const supplyStatic =
    getObservationValue(
      observations,
      (l) => l === "supply static" || l.includes("supply static"),
      "inWC"
    ) ??
    getObservationValue(observations, (l) => l.includes("supply pressure"), "inWC");

  const filterDrop = getObservationValue(
    observations,
    (l) => l === "filter pressure drop" || l.includes("filter pressure drop"),
    "inWC"
  );

  const coilDrop = getObservationValue(
    observations,
    (l) => l === "coil pressure drop" || l.includes("coil pressure drop"),
    "inWC"
  );

  const totalExternalStatic =
    returnStatic !== null && supplyStatic !== null
      ? round1(Math.abs(returnStatic) + Math.abs(supplyStatic))
      : null;

  const findings: string[] = [];
  let summary = "Need more static readings.";

  if (totalExternalStatic !== null) {
    if (totalExternalStatic <= 0.5) {
      findings.push("Total external static is in a typical range for many systems.");
    } else if (totalExternalStatic <= 0.8) {
      findings.push("Total external static is elevated. Airflow may be reduced.");
    } else {
      findings.push("Total external static is high. Strong airflow restriction is likely.");
    }
  }

  if (returnStatic !== null && supplyStatic !== null) {
    const returnAbs = Math.abs(returnStatic);
    const supplyAbs = Math.abs(supplyStatic);

    if (returnAbs > supplyAbs * 1.35) {
      findings.push("Return side is carrying more restriction than supply side.");
    } else if (supplyAbs > returnAbs * 1.35) {
      findings.push("Supply side is carrying more restriction than return side.");
    } else {
      findings.push("Return and supply static are fairly balanced.");
    }
  }

  if (filterDrop !== null) {
    if (filterDrop < 0.08) {
      findings.push("Filter pressure drop is low.");
    } else if (filterDrop <= 0.18) {
      findings.push("Filter pressure drop is moderate.");
    } else {
      findings.push(
        "Filter pressure drop is high. Dirty filter or undersized filter section is likely."
      );
    }
  }

  if (coilDrop !== null) {
    if (coilDrop < 0.2) {
      findings.push("Coil pressure drop is low to moderate.");
    } else if (coilDrop <= 0.35) {
      findings.push("Coil pressure drop is elevated.");
    } else {
      findings.push(
        "Coil pressure drop is high. Dirty evaporator coil, wet coil loading, or airflow bottleneck is likely."
      );
    }
  }

  if (totalExternalStatic !== null) {
    if (totalExternalStatic > 0.8) {
      if ((filterDrop ?? 0) > 0.18) {
        summary =
          "High static with high filter drop. Check filter, rack, and return air path first.";
      } else if ((coilDrop ?? 0) > 0.35) {
        summary = "High static with high coil drop. Check evaporator coil and blower setup.";
      } else if (
        returnStatic !== null &&
        supplyStatic !== null &&
        Math.abs(returnStatic) > Math.abs(supplyStatic) * 1.35
      ) {
        summary = "High static with return-side burden. Look for return restriction.";
      } else if (
        returnStatic !== null &&
        supplyStatic !== null &&
        Math.abs(supplyStatic) > Math.abs(returnStatic) * 1.35
      ) {
        summary = "High static with supply-side burden. Look for supply duct or coil restriction.";
      } else {
        summary = "Static is high. Airflow restriction is likely somewhere in the system.";
      }
    } else if (totalExternalStatic > 0.5) {
      summary =
        "Static is somewhat elevated. Verify blower speed and inspect filter/coil/duct path.";
    } else {
      summary = "Static looks reasonably normal.";
    }
  }

  return {
    totalExternalStatic,
    returnStatic,
    supplyStatic,
    filterDrop,
    coilDrop,
    summary,
    findings,
  };
}

function analyzeDefrost(
  observations: Observation[],
  equipmentType: string,
  symptom: string
) {
  const timerStateRaw = observations
    .slice()
    .reverse()
    .find((o) => normalizeLabel(o.label).includes("defrost timer state"))?.value;

  const terminationStateRaw = observations
    .slice()
    .reverse()
    .find((o) => normalizeLabel(o.label).includes("termination stat state"))?.value;

  const heaterAmps = getObservationValue(
    observations,
    (l) => l.includes("defrost heater amps"),
    "amps"
  );

  const boxTemp = getObservationValue(
    observations,
    (l) => l.includes("box temp"),
    "°F"
  );

  const evapCoilTemp = getObservationValue(
    observations,
    (l) => l.includes("evap coil temp"),
    "°F"
  );

  const timerState = (timerStateRaw || "").toString().trim().toLowerCase();
  const terminationState = (terminationStateRaw || "").toString().trim().toLowerCase();
  const symptomLow = symptom.toLowerCase();
  const equipmentLow = equipmentType.toLowerCase();

  const findings: string[] = [];
  let summary = "Need more defrost readings.";

  const isRefrigeration =
    equipmentLow.includes("cooler") ||
    equipmentLow.includes("freezer") ||
    equipmentLow.includes("merchandiser");

  if (!isRefrigeration) {
    return {
      summary: "Defrost intelligence is mainly intended for refrigeration equipment.",
      findings: [] as string[],
    };
  }

  const likelyDefrostComplaint =
    symptomLow.includes("defrost") ||
    symptomLow.includes("iced") ||
    symptomLow.includes("ice") ||
    symptomLow.includes("frost") ||
    symptomLow.includes("coil freezing") ||
    symptomLow.includes("iced evaporator");

  if (likelyDefrostComplaint) {
    findings.push("Symptom points toward a possible defrost-related issue.");
  }

  if (timerState) {
    if (
      timerState.includes("defrost") ||
      timerState.includes("in defrost") ||
      timerState.includes("active")
    ) {
      findings.push("Control appears to be calling for defrost.");
    } else if (
      timerState.includes("cool") ||
      timerState.includes("refrigeration") ||
      timerState.includes("run")
    ) {
      findings.push("Control appears to be in refrigeration mode, not defrost.");
    } else {
      findings.push(`Defrost timer/control state entered as: ${timerStateRaw}`);
    }
  }

  if (heaterAmps !== null) {
    if (heaterAmps > 0.2) {
      findings.push("Defrost heater amperage is present.");
    } else {
      findings.push("Defrost heater amperage is essentially zero.");
    }
  }

  if (terminationState) {
    if (
      terminationState.includes("closed") ||
      terminationState.includes("made") ||
      terminationState.includes("continuity")
    ) {
      findings.push("Termination control appears closed / made.");
    } else if (
      terminationState.includes("open") ||
      terminationState.includes("tripped")
    ) {
      findings.push("Termination control appears open.");
    } else {
      findings.push(`Termination state entered as: ${terminationStateRaw}`);
    }
  }

  if (evapCoilTemp !== null) {
    if (evapCoilTemp < 20) {
      findings.push("Evaporator coil temperature is very low / frozen-range.");
    } else if (evapCoilTemp > 40) {
      findings.push("Evaporator coil temperature is warm enough that termination may be expected.");
    }
  }

  if (boxTemp !== null) {
    if (equipmentLow.includes("freezer") && boxTemp > 10) {
      findings.push("Freezer box temperature is high.");
    } else if (equipmentLow.includes("cooler") && boxTemp > 40) {
      findings.push("Cooler box temperature is high.");
    }
  }

  if (
    (timerState.includes("defrost") || timerState.includes("active")) &&
    heaterAmps !== null &&
    heaterAmps < 0.2
  ) {
    summary =
      "Unit appears to be in defrost, but heater amps are not present. Likely heater circuit, heater, limit, relay, contactor, or wiring issue.";
  } else if (
    likelyDefrostComplaint &&
    timerState &&
    (timerState.includes("cool") || timerState.includes("run"))
  ) {
    summary =
      "Defrost complaint is present, but the unit appears to remain in refrigeration mode. Likely defrost initiation / timer / board / controller issue.";
  } else if (
    heaterAmps !== null &&
    heaterAmps > 0.2 &&
    terminationState &&
    (terminationState.includes("open") || terminationState.includes("tripped")) &&
    evapCoilTemp !== null &&
    evapCoilTemp < 25
  ) {
    summary =
      "Defrost heat is present, but termination appears open too early for a still-cold coil. Likely bad termination stat / sensor or placement issue.";
  } else if (
    likelyDefrostComplaint &&
    heaterAmps !== null &&
    heaterAmps > 0.2 &&
    evapCoilTemp !== null &&
    evapCoilTemp > 40
  ) {
    summary =
      "Defrost appears to be functioning. Check drain restriction, airflow, door infiltration, or fan delay issues.";
  } else if (
    likelyDefrostComplaint &&
    !timerState &&
    heaterAmps === null &&
    !terminationState
  ) {
    summary =
      "Need timer/board state, heater amps, and termination state to diagnose defrost properly.";
  } else {
    summary =
      "Defrost condition is mixed. Verify timer/board initiation, heater amps, termination control, drain condition, and door infiltration.";
  }

  return { summary, findings };
}

function buildDefrostRepairGuidance(
  observations: Observation[],
  equipmentType: string,
  symptom: string
) {
  const timerStateRaw = observations
    .slice()
    .reverse()
    .find((o) => normalizeLabel(o.label).includes("defrost timer state"))?.value;

  const terminationStateRaw = observations
    .slice()
    .reverse()
    .find((o) => normalizeLabel(o.label).includes("termination stat state"))?.value;

  const heaterAmps = getObservationValue(
    observations,
    (l) => l.includes("defrost heater amps"),
    "amps"
  );

  const evapCoilTemp = getObservationValue(
    observations,
    (l) => l.includes("evap coil temp"),
    "°F"
  );

  const boxTemp = getObservationValue(
    observations,
    (l) => l.includes("box temp"),
    "°F"
  );

  const timerState = (timerStateRaw || "").toString().trim().toLowerCase();
  const terminationState = (terminationStateRaw || "").toString().trim().toLowerCase();
  const symptomLow = symptom.toLowerCase();
  const equipmentLow = equipmentType.toLowerCase();

  const isRefrigeration =
    equipmentLow.includes("cooler") ||
    equipmentLow.includes("freezer") ||
    equipmentLow.includes("merchandiser");

  const repairItems: {
    part: string;
    why: string;
    nextTest: string;
    quickCheck: string;
    priority: "High" | "Medium" | "Low";
  }[] = [];

  if (!isRefrigeration) {
    return repairItems;
  }

  const likelyDefrostComplaint =
    symptomLow.includes("defrost") ||
    symptomLow.includes("iced") ||
    symptomLow.includes("ice") ||
    symptomLow.includes("frost");

  if (
    (timerState.includes("defrost") || timerState.includes("active")) &&
    heaterAmps !== null &&
    heaterAmps < 0.2
  ) {
    repairItems.push({
      part: "Defrost heater circuit",
      why: "Unit appears to be in defrost but heater amps are not present.",
      nextTest: "Check heater voltage and continuity through the heater circuit.",
      quickCheck: "Ohm heater, limits, and wiring. Verify voltage reaches heater during defrost.",
      priority: "High",
    });

    repairItems.push({
      part: "Defrost relay / contactor / board output",
      why: "Defrost may be commanded, but power may not be getting to the heaters.",
      nextTest: "Check output voltage from timer/board/relay to heater circuit.",
      quickCheck: "Measure line voltage at relay output while in defrost.",
      priority: "High",
    });
  }

  if (
    likelyDefrostComplaint &&
    timerState &&
    (timerState.includes("cool") || timerState.includes("run"))
  ) {
    repairItems.push({
      part: "Defrost timer / control board / controller",
      why: "Complaint suggests defrost issue, but unit appears to remain in refrigeration mode.",
      nextTest: "Force a defrost cycle and verify initiation output.",
      quickCheck: "Advance timer manually or command board into defrost.",
      priority: "High",
    });
  }

  if (
    heaterAmps !== null &&
    heaterAmps > 0.2 &&
    terminationState &&
    (terminationState.includes("open") || terminationState.includes("tripped")) &&
    evapCoilTemp !== null &&
    evapCoilTemp < 25
  ) {
    repairItems.push({
      part: "Termination stat / sensor",
      why: "Termination appears open too early while coil is still very cold.",
      nextTest: "Check termination control state against actual coil temperature.",
      quickCheck: "Measure continuity / resistance and compare to expected cut-out temperature.",
      priority: "High",
    });
  }

  if (
    likelyDefrostComplaint &&
    heaterAmps !== null &&
    heaterAmps > 0.2 &&
    evapCoilTemp !== null &&
    evapCoilTemp > 40
  ) {
    repairItems.push({
      part: "Drain line / drain pan / drain heater",
      why: "Defrost heat appears present, so remaining icing may be from drainage problems.",
      nextTest: "Check drain flow and drain heater operation if equipped.",
      quickCheck: "Pour warm water through drain and inspect for freeze-back.",
      priority: "Medium",
    });

    repairItems.push({
      part: "Door gaskets / infiltration / fan delay",
      why: "If defrost works, re-icing may be caused by moisture infiltration or fan timing.",
      nextTest: "Inspect door seal, traffic pattern, strip curtain, and fan restart timing.",
      quickCheck: "Look for frost concentrated near door opening or fan blow pattern.",
      priority: "Medium",
    });
  }

  if (
    likelyDefrostComplaint &&
    !timerState &&
    heaterAmps === null &&
    !terminationState
  ) {
    repairItems.push({
      part: "Defrost controls not yet verified",
      why: "Key defrost measurements are missing.",
      nextTest: "Collect timer state, heater amps, and termination stat state.",
      quickCheck: "Add those three measurements and rerun diagnosis.",
      priority: "High",
    });
  }

  if (boxTemp !== null && equipmentLow.includes("freezer") && boxTemp > 15) {
    repairItems.push({
      part: "Door infiltration / heavy load / evaporator airflow",
      why: "Box temperature is high, which may be adding excessive frost load.",
      nextTest: "Inspect door opening frequency, gasket sealing, and evap fan airflow.",
      quickCheck: "Check for snow/ice near entry and weak airflow across coil.",
      priority: "Medium",
    });
  }

  const deduped = new Map<string, (typeof repairItems)[number]>();
  for (const item of repairItems) {
    if (!deduped.has(item.part)) deduped.set(item.part, item);
  }

  return [...deduped.values()];
}

function parseDiagnosis(rawResult: string): Diagnosis | null {
  if (!rawResult) return null;
  try {
    const start = rawResult.indexOf("{");
    const end = rawResult.lastIndexOf("}");
    const slice = start >= 0 && end > start ? rawResult.slice(start, end + 1) : rawResult;
    return JSON.parse(slice) as Diagnosis;
  } catch {
    return null;
  }
}

function isRelatedRecord(
  current: {
    customerName: string;
    siteName: string;
    unitNickname: string;
    model: string;
    manufacturer: string;
    equipmentType: string;
  },
  record: SavedUnitRecord
) {
  const customerMatch =
    current.customerName.trim() &&
    record.customerName.trim() &&
    current.customerName.trim().toLowerCase() === record.customerName.trim().toLowerCase();

  const siteMatch =
    current.siteName.trim() &&
    record.siteName.trim() &&
    current.siteName.trim().toLowerCase() === record.siteName.trim().toLowerCase();

  const unitMatch =
    current.unitNickname.trim() &&
    record.unitNickname.trim() &&
    current.unitNickname.trim().toLowerCase() === record.unitNickname.trim().toLowerCase();

  const modelMatch =
    current.model.trim() &&
    record.model.trim() &&
    current.model.trim().toLowerCase() === record.model.trim().toLowerCase();

  const manufacturerMatch =
    current.manufacturer.trim() &&
    record.manufacturer.trim() &&
    current.manufacturer.trim().toLowerCase() === record.manufacturer.trim().toLowerCase();

  const equipmentMatch =
    current.equipmentType.trim() &&
    record.equipmentType.trim() &&
    current.equipmentType.trim().toLowerCase() === record.equipmentType.trim().toLowerCase();

  if (customerMatch && siteMatch && unitMatch) return true;
  if (customerMatch && siteMatch && modelMatch && manufacturerMatch) return true;
  if (siteMatch && unitMatch) return true;
  if (modelMatch && manufacturerMatch && equipmentMatch && siteMatch) return true;

  return false;
}

function topCounts(items: string[], minCount = 2, maxItems = 3) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([label, count]) => `${label} (${count}x)`);
}

function deriveMeasurementPatterns(records: SavedUnitRecord[]) {
  const patterns: string[] = [];

  for (const r of records) {
    const charge = analyzeCharge(
      r.observations || [],
      r.equipmentType || "",
      r.refrigerantType || "Unknown"
    );
    const airflow = analyzeAirflow(r.observations || []);

    if (charge.summary.toLowerCase().includes("undercharged")) patterns.push("Undercharge pattern");
    if (charge.summary.toLowerCase().includes("overcharged")) patterns.push("Overcharge pattern");
    if (charge.summary.toLowerCase().includes("restriction"))
      patterns.push("Restriction / metering pattern");
    if (charge.superheat !== null && charge.superheat > 20) patterns.push("High superheat");
    if (charge.subcool !== null && charge.subcool < 5) patterns.push("Low subcool");
    if (charge.deltaT !== null && charge.deltaT < 12) patterns.push("Low delta-T");
    if (charge.deltaT !== null && charge.deltaT > 22) patterns.push("High delta-T");

    if (airflow.totalExternalStatic !== null && airflow.totalExternalStatic > 0.8) {
      patterns.push("High total external static");
    }
    if (airflow.filterDrop !== null && airflow.filterDrop > 0.18) {
      patterns.push("High filter pressure drop");
    }
    if (airflow.coilDrop !== null && airflow.coilDrop > 0.35) {
      patterns.push("High coil pressure drop");
    }
    if (airflow.summary.toLowerCase().includes("return-side")) {
      patterns.push("Return-side restriction");
    }
    if (airflow.summary.toLowerCase().includes("supply-side")) {
      patterns.push("Supply-side restriction");
    }
  }

  return topCounts(patterns, 2, 4);
}

function buildEquipmentMemoryInsight(
  savedUnits: SavedUnitRecord[],
  current: {
    id?: string;
    customerName: string;
    siteName: string;
    unitNickname: string;
    model: string;
    manufacturer: string;
    equipmentType: string;
  }
): EquipmentMemoryInsight {
  const related = savedUnits.filter(
    (r) => r.id !== current.id && isRelatedRecord(current, r)
  );

  if (!related.length) {
    return {
      relatedCount: 0,
      summary: "No prior matching history found yet for this unit.",
      repeatedSymptoms: [],
      repeatedCauses: [],
      repeatedMeasurementPatterns: [],
      suggestedFirstChecks: [],
      commonConfirmedFixes: [],
      callbackWarnings: [],
      similarCases: [],
    };
  }

  const symptomItems = related.map((r) => (r.symptom || "").trim()).filter(Boolean);

  const causeItems = related.flatMap((r) => {
    const parsed = parseDiagnosis(r.rawResult || "");
    return (parsed?.likely_causes || [])
      .map((c) => (c.cause || "").trim())
      .filter(Boolean);
  });

  const repeatedSymptoms = topCounts(symptomItems, 1, 4);
  const repeatedCauses = topCounts(causeItems, 1, 4);
  const repeatedMeasurementPatterns = deriveMeasurementPatterns(related);

  const suggestionPool: string[] = [];

  for (const p of repeatedMeasurementPatterns) {
    const low = p.toLowerCase();
    if (low.includes("high total external static")) {
      suggestionPool.push("Inspect filter, coil, and blower speed first");
    }
    if (low.includes("high coil pressure drop")) {
      suggestionPool.push("Inspect evaporator coil and blower setup");
    }
    if (low.includes("high filter pressure drop")) {
      suggestionPool.push("Check filter size, condition, and rack sealing");
    }
    if (low.includes("return-side restriction")) {
      suggestionPool.push("Check return duct, filter section, and return grilles");
    }
    if (low.includes("supply-side restriction")) {
      suggestionPool.push("Check supply duct restrictions and coil discharge path");
    }
    if (low.includes("undercharge pattern")) {
      suggestionPool.push("Leak check refrigerant circuit before adding charge");
    }
    if (low.includes("restriction / metering pattern")) {
      suggestionPool.push("Check TXV / metering device and liquid line restrictions");
    }
    if (low.includes("high superheat")) {
      suggestionPool.push("Verify evaporator feed and refrigerant charge");
    }
    if (low.includes("low subcool")) {
      suggestionPool.push("Verify charge level and liquid line integrity");
    }
  }

  for (const c of repeatedCauses) {
    const low = c.toLowerCase();
    if (low.includes("fan")) {
      suggestionPool.push("Inspect fan motor, blade, capacitor, and rotation");
    }
    if (low.includes("airflow")) {
      suggestionPool.push("Check airflow before condemning refrigeration parts");
    }
    if (low.includes("capacitor")) {
      suggestionPool.push("Test run capacitor and amp draw");
    }
    if (low.includes("contactor")) {
      suggestionPool.push("Inspect contactor points and coil voltage");
    }
    if (low.includes("compressor")) {
      suggestionPool.push("Verify compressor amps, voltage, and overload condition");
    }
    if (low.includes("thermostat") || low.includes("control")) {
      suggestionPool.push("Verify thermostat signal and control sequence");
    }
  }

  const dedupedSuggestions = [...new Set(suggestionPool)].slice(0, 4);

  let summary = `Found ${related.length} related prior service entr${
    related.length === 1 ? "y" : "ies"
  } for this unit or matching equipment.`;

  if (repeatedMeasurementPatterns.length) {
    summary = `This unit shows repeated pattern history. Most common pattern: ${repeatedMeasurementPatterns[0]}.`;
  } else if (repeatedCauses.length) {
    summary = `This unit has repeat issue history. Most common likely cause: ${repeatedCauses[0]}.`;
  } else if (repeatedSymptoms.length) {
    summary = `This unit has repeated complaint history. Most common symptom: ${repeatedSymptoms[0]}.`;
  }

  return {
    relatedCount: related.length,
    summary,
    repeatedSymptoms,
    repeatedCauses,
    repeatedMeasurementPatterns,
    suggestedFirstChecks: dedupedSuggestions,
    commonConfirmedFixes: topCounts(
      related
        .map((r) => `${r.finalConfirmedCause || ""} -> ${r.actualFixPerformed || ""}`.trim())
        .filter((x) => x && x !== "->"),
      1,
      5
    ),
    callbackWarnings: topCounts(
      related
        .filter((r) => (r.callbackOccurred || "").toLowerCase() === "yes")
        .map((r) => `${r.finalConfirmedCause || "Unknown issue"} -> ${r.actualFixPerformed || "Unknown fix"}`),
      1,
      5
    ),
    similarCases: related.slice(0, 5).map((r) => ({
      savedAt: r.savedAt || "",
      symptom: r.symptom || "",
      finalConfirmedCause: r.finalConfirmedCause || "",
      actualFixPerformed: r.actualFixPerformed || "",
      outcomeStatus: r.outcomeStatus || "",
      callbackOccurred: r.callbackOccurred || "",
    })),
  };
}

  function buildServiceReportHtml(args: {
  customerName: string;
  siteName: string;
  siteAddress: string;
  unitNickname: string;
  propertyType: string;
  equipmentType: string;
  manufacturer: string;
  model: string;
  refrigerantType: string;
  symptom: string;
  observations: Observation[];
  parsed: Diagnosis | null;
  nameplate: NameplateResult | null;
  chargeAnalysis: ChargeAnalysis;
  airflowAnalysis: AirflowAnalysis;
  equipmentMemory: EquipmentMemoryInsight;
}) {

  const {
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
  } = args;

  const now = new Date().toLocaleString();

  const obsRows = observations.length
    ? observations
        .map(
          (o) => `
            <tr>
              <td>${escapeHtml(o.label)}</td>
              <td>${escapeHtml(`${o.value} ${o.unit}`)}</td>
              <td>${escapeHtml(o.note || "")}</td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="3">No measurements entered.</td></tr>`;

  const likelyCauseRows =
    parsed?.likely_causes?.length
      ? parsed.likely_causes
          .map(
            (c) => `
              <li>
                <strong>${escapeHtml(c.cause || "Cause")}</strong>
                ${typeof c.probability_percent === "number" ? ` — ${c.probability_percent}%` : ""}
                ${c.why ? `<div class="muted">${escapeHtml(c.why)}</div>` : ""}
              </li>
            `
          )
          .join("")
      : `<li>No likely causes available yet.</li>`;

  const memoryRows =
    equipmentMemory.suggestedFirstChecks.length
      ? equipmentMemory.suggestedFirstChecks
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("")
      : `<li>No prior unit history suggestions yet.</li>`;

  const airflowRows =
    airflowAnalysis.findings.length
      ? airflowAnalysis.findings.map((f) => `<li>${escapeHtml(f)}</li>`).join("")
      : `<li>No airflow findings yet.</li>`;

  const chargeRows =
    chargeAnalysis.findings.length
      ? chargeAnalysis.findings.map((f) => `<li>${escapeHtml(f)}</li>`).join("")
      : `<li>No charge findings yet.</li>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HVAC Service Report</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 24px; line-height: 1.35; }
    h1, h2 { margin: 0 0 8px 0; }
    .header { display:flex; justify-content:space-between; align-items:start; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:18px; }
    .section { margin-top:18px; border:1px solid #ddd; border-radius:10px; padding:12px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 18px; }
    .label { font-weight:700; }
    .muted { color:#555; font-size:12px; margin-top:4px; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    th, td { border:1px solid #ddd; padding:8px; text-align:left; vertical-align:top; font-size:13px; }
    ul { margin:8px 0 0 18px; padding:0; }
    .pill { display:inline-block; border:1px solid #bbb; border-radius:999px; padding:2px 8px; font-size:12px; margin-left:6px; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>HVAC Service Report</h1>
      <div class="muted">Generated ${escapeHtml(now)}</div>
    </div>
    <div style="text-align:right">
      <div><span class="label">Property Type:</span> ${escapeHtml(propertyType || "-")}</div>
      <div><span class="label">Equipment Type:</span> ${escapeHtml(equipmentType || "-")}</div>
    </div>
  </div>

  <div class="section">
    <h2>Customer / Site / Unit</h2>
    <div class="grid">
      <div><span class="label">Customer:</span> ${escapeHtml(customerName || "-")}</div>
      <div><span class="label">Site:</span> ${escapeHtml(siteName || "-")}</div>
      <div><span class="label">Address:</span> ${escapeHtml(siteAddress || "-")}</div>
      <div><span class="label">Unit Tag:</span> ${escapeHtml(unitNickname || "-")}</div>
      <div><span class="label">Manufacturer:</span> ${escapeHtml(manufacturer || "-")}</div>
      <div><span class="label">Model:</span> ${escapeHtml(model || "-")}</div>
      <div><span class="label">Refrigerant:</span> ${escapeHtml(refrigerantType || "-")}</div>
      <div><span class="label">Nameplate Serial:</span> ${escapeHtml(nameplate?.serial || "-")}</div>
    </div>
  </div>

  <div class="section">
    <h2>Customer Complaint / Symptom</h2>
    <div>${escapeHtml(symptom || "-")}</div>
  </div>

  <div class="section">
    <h2>Diagnosis Summary</h2>
    <div>${escapeHtml(parsed?.summary || "No AI diagnosis summary available yet.")}</div>
  </div>

  <div class="section">
    <h2>Likely Causes</h2>
    <ul>${likelyCauseRows}</ul>
  </div>

  <div class="section">
    <h2>Charge Analysis</h2>
    <div>
      <span class="label">Delta-T:</span> ${chargeAnalysis.deltaT !== null ? `${chargeAnalysis.deltaT}°F` : "—"}
      <span class="pill">Evap Sat: ${chargeAnalysis.evapSat !== null ? `${chargeAnalysis.evapSat}°F` : "—"} / ${escapeHtml(chargeAnalysis.evapSatSource)}</span>
      <span class="pill">Cond Sat: ${chargeAnalysis.condSat !== null ? `${chargeAnalysis.condSat}°F` : "—"} / ${escapeHtml(chargeAnalysis.condSatSource)}</span>
      <span class="pill">SH: ${chargeAnalysis.superheat !== null ? `${chargeAnalysis.superheat}°F` : "—"}</span>
      <span class="pill">SC: ${chargeAnalysis.subcool !== null ? `${chargeAnalysis.subcool}°F` : "—"}</span>
    </div>
    <div style="margin-top:8px"><span class="label">Summary:</span> ${escapeHtml(chargeAnalysis.summary)}</div>
    <ul>${chargeRows}</ul>
  </div>

  <div class="section">
    <h2>Airflow Analysis</h2>
    <div>
      <span class="pill">TESP: ${airflowAnalysis.totalExternalStatic !== null ? `${airflowAnalysis.totalExternalStatic} inWC` : "—"}</span>
      <span class="pill">Return: ${airflowAnalysis.returnStatic !== null ? `${airflowAnalysis.returnStatic} inWC` : "—"}</span>
      <span class="pill">Supply: ${airflowAnalysis.supplyStatic !== null ? `${airflowAnalysis.supplyStatic} inWC` : "—"}</span>
      <span class="pill">Filter Drop: ${airflowAnalysis.filterDrop !== null ? `${airflowAnalysis.filterDrop} inWC` : "—"}</span>
      <span class="pill">Coil Drop: ${airflowAnalysis.coilDrop !== null ? `${airflowAnalysis.coilDrop} inWC` : "—"}</span>
    </div>
    <div style="margin-top:8px"><span class="label">Summary:</span> ${escapeHtml(airflowAnalysis.summary)}</div>
    <ul>${airflowRows}</ul>
  </div>

  <div class="section">
    <h2>Equipment Memory AI</h2>
    <div><span class="label">Summary:</span> ${escapeHtml(equipmentMemory.summary)}</div>
    <div class="muted">Related prior entries: ${equipmentMemory.relatedCount}</div>
    <ul>${memoryRows}</ul>
  </div>

  <div class="section">
    <h2>Measurements / Observations</h2>
    <table>
      <thead>
        <tr>
          <th>Measurement</th>
          <th>Value</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>${obsRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Recommended Next Actions</h2>
    <ul>
      ${
        equipmentMemory.suggestedFirstChecks.length
          ? equipmentMemory.suggestedFirstChecks
              .map((s) => `<li>${escapeHtml(s)}</li>`)
              .join("")
          : "<li>Continue collecting measurements and verify the sequence of operation.</li>"
      }
    </ul>
  </div>
</body>
</html>`;
}

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
  const [historyFilter, setHistoryFilter] = useState("");

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
      const [unitTimelineComponentFilter, setUnitTimelineComponentFilter] = useState("all");
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

      function getComponentAwareLikelyParts() {
        const componentLabel = normalizeComponentAssistText(getCurrentAffectedComponentLabelForAssist());
        const equipment = normalizeComponentAssistText(equipmentType);
        const issue = normalizeComponentAssistText(symptom);
        const priorParts = getRecentSameComponentPartsForAssist();

        const parts: string[] = [...priorParts];

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          parts.push(
            "Evaporator fan motor",
            "Fan blade / wheel",
            "Defrost heater",
            "Defrost termination / sensor",
            "TXV / EEV",
            "Drain heater",
            "Drain pan heater",
            "Distributor / nozzle / check distributor circuit",
          );
        }

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          parts.push(
            "Contactor",
            "Run capacitor",
            "Condenser fan motor",
            "Fan blade",
            "Pressure control",
            "Compressor overload / start components",
            "Crankcase heater",
          );
        }

        if (componentLabel.includes("furnace")) {
          parts.push(
            "Control board",
            "Ignitor",
            "Flame sensor",
            "Pressure switch",
            "Inducer motor",
            "Gas valve",
            "Limit switch",
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          parts.push(
            "Blower motor",
            "Blower capacitor / module",
            "Fan relay / board",
            "Electric heat sequencer",
            "Float switch",
            "Control board",
          );
        }

        if (equipment.includes("walk-in")) {
          parts.push(
            "Defrost timer / board",
            "Defrost termination",
            "Door heater / frame heater",
            "Drain line heat",
            "Evaporator fan delay",
          );
        }

        if (equipment.includes("ice machine")) {
          parts.push(
            "Water valve",
            "Water pump",
            "Bin control",
            "Hot gas valve",
            "Thermistor / probe",
            "Curtain switch / sensor",
          );
        }

        if (issue.includes("no cool") || issue.includes("not cooling")) {
          parts.push(
            "Contactor",
            "Capacitor",
            "Fan motor",
            "Control board / relay",
            "TXV / metering device",
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          parts.push(
            "Defrost heater",
            "Defrost control",
            "Fan motor",
            "TXV / EEV",
            "Drain heater",
          );
        }

        if (issue.includes("heat")) {
          parts.push(
            "Ignitor",
            "Flame sensor",
            "Pressure switch",
            "Gas valve",
            "Heat relay / sequencer",
          );
        }

        return uniqueAssistList(parts).slice(0, 10);
      }

      function getComponentAwareVerifyFirst() {
        const componentLabel = normalizeComponentAssistText(getCurrentAffectedComponentLabelForAssist());
        const equipment = normalizeComponentAssistText(equipmentType);
        const issue = normalizeComponentAssistText(symptom);

        const steps: string[] = [
          "Verify the call is tied to the correct affected component before ordering parts.",
          "Compare the current symptom against prior same-component history first.",
        ];

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          steps.push(
            "Verify line voltage, contactor pull-in, capacitor value, and condenser fan operation.",
            "Check condenser coil condition and airflow before condemning refrigeration components.",
          );
        }

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          steps.push(
            "Verify fan operation, coil condition, drain condition, and any defrost circuit before replacing parts.",
            "Check for airflow / frost pattern issues before condemning TXV or refrigerant charge.",
          );
        }

        if (componentLabel.includes("furnace")) {
          steps.push(
            "Verify call for heat, board outputs, safeties, ignitor, and flame sense before replacing parts.",
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          steps.push(
            "Verify blower operation, board / relay outputs, and drain safety before replacing indoor components.",
          );
        }

        if (equipment.includes("walk-in")) {
          steps.push(
            "Verify box temp, defrost schedule, fan delay, and door / drain heat conditions before ordering parts.",
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          steps.push(
            "Check airflow, fan operation, defrost operation, and frost pattern before replacing refrigeration parts.",
          );
        }

        if (issue.includes("no cool") || issue.includes("not cooling")) {
          steps.push(
            "Verify power, controls, airflow, and obvious electrical failures before replacing higher-cost parts.",
          );
        }

        return uniqueAssistList(steps).slice(0, 8);
      }

      function getComponentAwareManualTargets() {
        const componentLabel = normalizeComponentAssistText(getCurrentAffectedComponentLabelForAssist());
        const equipment = normalizeComponentAssistText(equipmentType);

        const targets: string[] = [
          "OEM installation / service manual for the exact model",
          "Wiring diagram for the affected component",
        ];

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          targets.push(
            "Condenser section electrical diagram",
            "Compressor and condenser fan motor wiring / sequence of operation",
          );
        }

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          targets.push(
            "Evaporator / indoor section wiring and fan circuit",
            "Defrost sequence and sensor / termination information",
            "TXV / metering device information and refrigerant circuit diagram",
          );
        }

        if (componentLabel.includes("furnace")) {
          targets.push(
            "Furnace ignition sequence / safety diagram",
            "Board pinout / pressure switch / inducer wiring information",
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          targets.push(
            "Indoor blower section wiring diagram",
            "Electric heat / sequencer / blower relay information",
          );
        }

        if (equipment.includes("walk-in")) {
          targets.push(
            "Walk-in defrost control sequence",
            "Evaporator fan delay / heater / drain heat documentation",
          );
        }

        if (equipment.includes("ice machine")) {
          targets.push(
            "Harvest / freeze sequence chart",
            "Water system and sensor diagnostic chart",
          );
        }

        return uniqueAssistList(targets).slice(0, 8);
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

      function getComponentAwareTroubleshootingHints() {
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const history = getSameComponentHistoryForTroubleshooting();

        const hints: string[] = [];
        const recentFixes = history
          .map((event) => String(event?.actual_fix_performed || "").trim())
          .filter(Boolean);

        const recentCauses = history
          .map((event) => String(event?.final_confirmed_cause || "").trim())
          .filter(Boolean);

        const callbackCount = history.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        hints.push("Verify the call is tied to the correct affected component before changing parts.");

        if (history.length) {
          hints.push(
            `This component has ${history.length} prior service entr${history.length === 1 ? "y" : "ies"} in history.`
          );
        }

        if (callbackCount) {
          hints.push(
            `This component has ${callbackCount} prior callback entr${callbackCount === 1 ? "y" : "ies"}. Slow down and verify root cause before replacing parts.`
          );
        }

        if (recentCauses.length) {
          hints.push(`Recent same-component cause: ${recentCauses[0]}`);
        }

        if (recentFixes.length) {
          hints.push(`Recent same-component fix: ${recentFixes[0]}`);
        }

        if (
          componentLabel.includes("condensing") ||
          componentLabel.includes("outdoor") ||
          componentLabel.includes("condenser")
        ) {
          hints.push(
            "Check line voltage, contactor state, capacitor value, condenser fan operation, and coil condition before condemning the compressor or refrigeration circuit."
          );
          hints.push(
            "If this is a no-cool complaint, verify outdoor section power and fan operation first."
          );
        }

        if (componentLabel.includes("evaporator") || componentLabel.includes("indoor head")) {
          hints.push(
            "Check fan operation, coil condition, drain / ice condition, and any defrost circuit before replacing refrigeration parts."
          );
          hints.push(
            "Read the frost pattern before condemning TXV, charge, or control parts."
          );
        }

        if (componentLabel.includes("furnace")) {
          hints.push(
            "Check call for heat, ignition sequence, safeties, inducer, pressure switch, and flame sense before replacing the board or gas valve."
          );
        }

        if (componentLabel.includes("air handler") || componentLabel.includes("indoor unit")) {
          hints.push(
            "Check blower operation, relay / board output, and drain safety before replacing indoor components."
          );
        }

        if (equipment.includes("walk-in")) {
          hints.push(
            "On walk-ins, verify defrost schedule, termination, fan delay, drain heat, and box conditions before replacing parts."
          );
        }

        if (equipment.includes("ice machine")) {
          hints.push(
            "On ice machines, separate water-side, freeze/harvest sequence, and refrigeration-side issues before replacing components."
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          hints.push(
            "For no-cool complaints, verify power, controls, airflow, and obvious electrical failures before replacing expensive components."
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          hints.push(
            "For icing complaints, check airflow, fan operation, defrost operation, and frost pattern before condemning refrigeration parts."
          );
        }

        if (issue.includes("heat")) {
          hints.push(
            "For heating complaints, verify sequence of operation and safety chain first."
          );
        }

        const seen = new Set<string>();
        return hints.filter((hint) => {
          const key = hint.trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 10);
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
            warnings.push(`Repeat symptom on this component: "${symptomValue}" (${count} times)`);
          }
        });

        const callbackCount = history.filter((event) => {
          const value = String(event?.callback_occurred || "").trim().toLowerCase();
          return value === "yes" || value === "true";
        }).length;

        if (callbackCount >= 1) {
          warnings.push(`Callback history on this component: ${callbackCount}`);
        }

        const recentParts = getRecentSameComponentPartsForAssist();
        if (recentParts.length >= 2) {
          warnings.push(`Multiple prior parts tied to this component: ${recentParts.join(" • ")}`);
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

      function browserSupportsTechCloseoutDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

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
            ? `Primary component — ${unitProfileUnit.unitNickname}`
            : "Primary component");

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
          setFailureDashboardError("Could not load failure intelligence dashboard.");
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
              (unit?.unitNickname ? `Primary component — ${unit.unitNickname}` : "Primary component")
          ).trim() || "Primary component";

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
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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
          title: "Confirm the target component and active call",
          tool: "Visual check + meter",
          why: "Do not waste time testing the wrong section of the system.",
          how:
            "Verify the selected affected component, confirm there is an active call on that component, and check disconnect / breaker / fuse / board output before deeper diagnosis.",
        });

        // Readings-aware paths
        if (superheat !== null && subcool !== null && superheat > 18 && subcool < 5) {
          tests.push({
            title: "High SH + low SC path",
            tool: "Gauges + line temperatures + airflow check",
            why: "This pattern leans toward underfeed, undercharge, or restriction.",
            how:
              "Verify airflow first, then check refrigerant feed path, obvious restrictions, and whether the system may be undercharged before replacing major parts.",
          });
        }

        if (superheat !== null && subcool !== null && superheat < 6 && subcool > 15) {
          tests.push({
            title: "Low SH + high SC path",
            tool: "Gauges + airflow + metering/device check",
            why: "This pattern can point toward floodback, overfeed, or an airflow problem.",
            how:
              "Verify indoor / evaporator airflow, blower or fan operation, and metering behavior before condemning the compressor or charge condition.",
          });
        }

        if (superheat !== null && subcool !== null && superheat > 18 && subcool > 15) {
          tests.push({
            title: "High SH + high SC path",
            tool: "Gauges + liquid line temperature + restriction check",
            why: "This pattern can indicate a liquid-line restriction or a feed problem.",
            how:
              "Check liquid line temperature drop, filter drier / restriction points, and the metering path before replacing components.",
          });
        }

        if (superheat !== null && subcool !== null && superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
          tests.push({
            title: "Readings are not screaming charge problem first",
            tool: "Meter + airflow / controls check",
            why: "When SH/SC look reasonable, the next win is often electrical, control, or airflow related.",
            how:
              "Shift the next tests toward controls, fan operation, relays/contactors, safeties, and component-specific sequence checks before changing refrigerant-side parts.",
          });
        }

        if (deltaT !== null && deltaT < 14 && (issue.includes("not cooling") || issue.includes("no cool"))) {
          tests.push({
            title: "Low air temperature split path",
            tool: "Thermometer + airflow check",
            why: "A weak split often points toward airflow, control, or charge/feed issues.",
            how:
              "Verify blower / fan operation, filter / coil condition, indoor airflow, and then compare refrigerant readings before replacing parts.",
          });
        }

        if (deltaT !== null && deltaT > 24) {
          tests.push({
            title: "High air temperature split path",
            tool: "Thermometer + airflow / freeze check",
            why: "A very high split can point toward airflow restriction, icing, or low load conditions.",
            how:
              "Check filter / coil condition, fan performance, frost pattern, and actual load conditions before deciding the system is fixed or before replacing feed components.",
          });
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          tests.push({
            title: "Heat rejection check first",
            tool: "Gauges + visual condenser check",
            why: "Head pressure is running hot against ambient conditions.",
            how:
              "Check condenser coil condition, fan operation, rotation, airflow blockage, and ambient / load conditions before condemning the refrigerant circuit.",
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat > 20) {
          tests.push({
            title: "Low-feed evaporator path",
            tool: "Gauges + line temps + visual coil check",
            why: "Low suction with high superheat leans toward a starved evaporator.",
            how:
              "Check airflow, frost pattern, metering device feed, and restriction points before replacing major components.",
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat < 5) {
          tests.push({
            title: "Floodback / overfeed path",
            tool: "Gauges + airflow + metering check",
            why: "Low superheat says do not rush to add charge or change compressors.",
            how:
              "Check evaporator airflow, metering device behavior, and whether the coil is overfeeding before making a major repair decision.",
          });
        }

        if (boxTemp !== null && equipment.includes("walk-in")) {
          tests.push({
            title: "Use actual box temperature to set the next move",
            tool: "Thermometer + control / defrost check",
            why: "Walk-in decisions should track the real box condition, not just the complaint.",
            how:
              `Box temp is ${boxTemp}°F. Compare that against setpoint, product load, and defrost behavior before ordering parts.`,
          });
        }

        // Component / symptom / history aware paths
        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          tests.push({
            title: "Verify outdoor electrical operation first",
            tool: "Meter + capacitor tester",
            why: "A lot of no-cool calls are found here before refrigerant diagnosis starts.",
            how:
              "Check line voltage, contactor pull-in, capacitor value, condenser fan operation, and obvious coil fouling before condemning compressor or charge.",
          });

          tests.push({
            title: "Check heat rejection before refrigerant diagnosis",
            tool: "Visual + gauges",
            why: "Dirty coil / bad fan / low ambient problems can distort the pressure story.",
            how:
              "Verify condenser airflow, fan direction, coil cleanliness, and ambient conditions before trusting head-pressure conclusions.",
          });
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          tests.push({
            title: "Check fan / ice / drain condition first",
            tool: "Visual + amp check",
            why: "Evap-side airflow and frost issues cause a lot of false TXV / charge calls.",
            how:
              "Check fan operation, blade condition, drain condition, ice pattern, and any defrost circuit before replacing refrigeration parts.",
          });

          tests.push({
            title: "Read the frost pattern before changing parts",
            tool: "Visual + temperatures / gauges",
            why: "The frost pattern tells you whether this is airflow, feed, or defrost related.",
            how:
              "Compare coil pattern, suction / line temp, and box condition before condemning TXV, EEV, or charge.",
          });
        }

        if (componentLabelLower.includes("furnace")) {
          tests.push({
            title: "Run the heat sequence in order",
            tool: "Meter + visual",
            why: "Furnace issues are usually found in the sequence / safety chain.",
            how:
              "Verify call for heat, inducer, pressure switch, ignitor, flame sense, limits, and board outputs before replacing the board or gas valve.",
          });
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          tests.push({
            title: "Check indoor airflow and safeties first",
            tool: "Meter + visual",
            why: "Indoor blower and drain safeties often mimic bigger failures.",
            how:
              "Verify blower motor operation, board / relay output, capacitor / module condition, and drain safety before replacing indoor components.",
          });
        }

        if (equipment.includes("walk-in")) {
          tests.push({
            title: "Verify walk-in control and defrost operation",
            tool: "Visual + control check",
            why: "Walk-in callbacks often come from defrost / delay / drain heat issues.",
            how:
              "Check box temp, defrost schedule, termination, fan delay, drain heat, and door / frame heat before ordering parts.",
          });
        }

        if (equipment.includes("ice machine")) {
          tests.push({
            title: "Separate water-side from refrigeration-side issues",
            tool: "Visual + sequence check",
            why: "Ice machines waste time when the sequence is not separated clearly.",
            how:
              "Check freeze / harvest sequence, water flow, water level, and sensor states before blaming refrigeration components.",
          });
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          tests.push({
            title: "Prove power and controls before expensive parts",
            tool: "Meter",
            why: "No-cool complaints often get over-diagnosed.",
            how:
              "Verify control call, line voltage, obvious electrical failures, and airflow first. Do not jump straight to compressor, TXV, or charge.",
          });
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          tests.push({
            title: "Treat icing as airflow / defrost / feed until proven otherwise",
            tool: "Visual + temperatures + controls",
            why: "Icing problems are often repeat issues when the wrong thing is replaced.",
            how:
              "Check airflow, fan operation, defrost operation, drain condition, and frost pattern before condemning refrigerant-side parts.",
          });
        }

        if (issue.includes("heat")) {
          tests.push({
            title: "Follow the heating safety chain",
            tool: "Meter + visual",
            why: "Heating failures are usually sequence-related before they are part-related.",
            how:
              "Verify the full sequence of operation and each safety before replacing a board, valve, or ignitor.",
          });
        }

        if (sameComponentHistory.length) {
          tests.push({
            title: "Compare with same-component history before replacing parts",
            tool: "History + current readings",
            why: "Repeat failures often come back because the root cause was not verified.",
            how:
              `Review the ${sameComponentHistory.length} prior same-component event(s), compare current conditions to the last repair, and verify the previous fix path before repeating it.`,
          });
        }

        if (recentParts.length || recentFix) {
          tests.push({
            title: "Verify the last repair path did not fail again",
            tool: "Visual + electrical / temperature checks",
            why: "A repeated fix can hide the real root cause.",
            how:
              `Recent same-component parts/fix history: ${[recentParts.join(", "), recentFix].filter(Boolean).join(" • ") || "See history"}. Confirm the replaced part, wiring, setup, and operating conditions before changing it again.`,
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
            notes.push("High superheat with low subcool points toward underfeed, undercharge, restriction, or airflow verification.");
            followUpItems.push("Verify airflow and refrigerant feed path before repeating major part replacement.");
          } else if (superheat < 6 && subcool > 15) {
            notes.push("Low superheat with high subcool points toward floodback, overfeed, or an airflow-related issue.");
            followUpItems.push("Check airflow and metering behavior before condemning compressor or charge condition.");
          } else if (superheat > 18 && subcool > 15) {
            notes.push("High superheat with high subcool can point toward a liquid-line restriction or feed issue.");
            followUpItems.push("Check for restriction points and liquid line temperature drop before replacing components.");
          } else if (superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
            notes.push("Superheat and subcool look reasonably balanced, so controls, airflow, or electrical checks may matter more than a major charge correction.");
          }
        } else {
          if (superheat !== null) {
            if (superheat > 20) {
              notes.push("High superheat suggests the evaporator may be starved or airflow may need verified.");
              followUpItems.push("Verify feed path, airflow, and possible restriction before changing major parts.");
            } else if (superheat < 5) {
              notes.push("Low superheat suggests floodback, overfeed, or airflow issues should be checked.");
              followUpItems.push("Check evaporator airflow and metering behavior before adding charge or replacing compressors.");
            }
          }

          if (subcool !== null) {
            if (subcool < 5) {
              notes.push("Low subcool suggests undercharge or liquid feed verification may still be needed.");
            } else if (subcool > 15) {
              notes.push("High subcool suggests overcharge or a restriction should be ruled out.");
            }
          }
        }

        if (deltaT !== null) {
          if (deltaT < 14) {
            notes.push("The return-to-supply temperature split is weak, which points toward airflow, control, or charge/feed verification.");
            followUpItems.push("Verify indoor airflow and compare current split against operating conditions before closing the call.");
          } else if (deltaT > 24) {
            notes.push("The return-to-supply temperature split is very high, so airflow restriction, icing, or low-load conditions should be considered.");
            followUpItems.push("Check filter, coil, fan performance, and frost pattern before repeating the same repair.");
          }
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          notes.push("Head pressure is high relative to ambient, which points toward heat rejection issues first.");
          followUpItems.push("Verify condenser airflow, fan operation, coil cleanliness, and ambient/load conditions.");
        }

        if (boxTemp !== null && String(equipmentType || "").toLowerCase().includes("walk-in")) {
          notes.push(`Box temperature is ${boxTemp}°F, so defrost performance, control strategy, and actual box load should be part of the closeout decision.`);
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
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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
        const siteLabel = String(siteName || siteAddress || customerName || "this site").trim();
        const followUpItems: string[] = [];

        if (callback.toLowerCase() === "yes") {
          followUpItems.push("Watch closely for callback risk because this issue has repeated.");
        }

        if (recentHistoryCount > 0) {
          followUpItems.push(
            `This component has ${recentHistoryCount} prior same-component event${recentHistoryCount === 1 ? "" : "s"} in history.`
          );
        }

        if (warnings.length) {
          followUpItems.push(...warnings);
        }

        if (readingsFollowUp.length) {
          followUpItems.push(...readingsFollowUp);
        }

        if (outcome && outcome !== "Not Set") {
          followUpItems.push(`Current outcome status: ${outcome}.`);
        }

        if (!followUpItems.length) {
          followUpItems.push("No immediate follow-up flags were identified from the current call data.");
        }

        const customerSummaryLines = [
          `At ${siteLabel}, the reported issue was ${currentSymptom || "an equipment problem"} on ${targetComponent}.`,
          cause
            ? `The likely confirmed cause was ${cause}.`
            : "A confirmed cause has not been documented yet.",
          fix
            ? `Work performed: ${fix}.`
            : "A final repair action has not been documented yet.",
          outcome && outcome !== "Not Set"
            ? `Current system status: ${outcome}.`
            : "",
          readingsInterpretation ? `Reading interpretation: ${readingsInterpretation}` : "",
          readingsSummary ? `Key field readings: ${readingsSummary}.` : "",
        ].filter(Boolean);

        const internalSummaryLines = [
          `Affected component: ${targetComponent}`,
          currentSymptom ? `Complaint/symptom: ${currentSymptom}` : "",
          cause ? `Confirmed cause: ${cause}` : "Confirmed cause: not documented",
          fix ? `Actual fix: ${fix}` : "Actual fix: not documented",
          readingsInterpretation ? `Readings meaning: ${readingsInterpretation}` : "",
          readingsSummary ? `Key readings: ${readingsSummary}` : "",
          outcome && outcome !== "Not Set" ? `Outcome: ${outcome}` : "",
          callback ? `Callback flag: ${callback}` : "",
          recentHistoryCount
            ? `Same-component history count: ${recentHistoryCount}`
            : "",
        ].filter(Boolean);

        const followUpLines = followUpItems.map((item) => `- ${item}`);

        setDiagnosticCloseoutDrafts({
          customerSummary: customerSummaryLines.join(" "),
          internalSummary: internalSummaryLines.join("\n"),
          followUp: followUpLines.join("\n"),
        });

        setDiagnosticCloseoutMessage("Closeout drafts generated.");
      }

      async function copyDiagnosticCloseoutText(
        key: "customerSummary" | "internalSummary" | "followUp"
      ) {
        const value = diagnosticCloseoutDrafts[key];
        if (!value.trim()) {
          setDiagnosticCloseoutMessage("Generate the closeout drafts first.");
          return;
        }

        try {
          await navigator.clipboard.writeText(value);
          setDiagnosticCloseoutMessage("Copied to clipboard.");
        } catch (err) {
          console.error("COPY DIAGNOSTIC CLOSEOUT FAILED", err);
          setDiagnosticCloseoutMessage("Could not copy to clipboard.");
        }
      }

      function pushInternalSummaryToTechCloseoutNotes() {
        const internalSummary = diagnosticCloseoutDrafts.internalSummary.trim();
        if (!internalSummary) {
          setDiagnosticCloseoutMessage("Generate the closeout drafts first.");
          return;
        }

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), internalSummary].filter(Boolean).join("\n\n")
        );
        setDiagnosticCloseoutMessage("Internal summary added to Tech Closeout Notes.");
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
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
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
            setSymptomDictationMessage("Listening for Symptom...");
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
            setSymptomDictationMessage("Dictation added to Symptom.");
          };

          recognition.onerror = (event: any) => {
            setSymptomListening(false);
            w.__symptomRecognition = null;
            setSymptomDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
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
          setSymptomDictationMessage("Could not start dictation.");
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

      // final-confirmed-cause-dictation-v1
      const [causeListening, setCauseListening] = useState(false);
      const [causeDictationMessage, setCauseDictationMessage] = useState("");

      function browserSupportsCauseDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startCauseDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setCauseDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__causeRecognition && causeListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__causeRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setCauseListening(true);
            setCauseDictationMessage("Listening for Final Confirmed Cause...");
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

            setFinalConfirmedCause((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setCauseDictationMessage("Dictation added to Final Confirmed Cause.");
          };

          recognition.onerror = (event: any) => {
            setCauseListening(false);
            w.__causeRecognition = null;
            setCauseDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setCauseListening(false);
            w.__causeRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setCauseListening(false);
          (window as any).__causeRecognition = null;
          setCauseDictationMessage("Could not start dictation.");
          console.error("CAUSE DICTATION FAILED", err);
        }
      }

      function stopCauseDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__causeRecognition) {
          try {
            w.__causeRecognition.stop();
          } catch (err) {
            console.error("CAUSE DICTATION STOP FAILED", err);
          }
        }
        setCauseListening(false);
      }

      // actual-fix-performed-dictation-v1
      const [actualFixListening, setActualFixListening] = useState(false);
      const [actualFixDictationMessage, setActualFixDictationMessage] = useState("");

      function browserSupportsActualFixDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

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

      function getTargetedLikelyPartsV2() {
        const target = getTargetedComponentRecordForAssist();
        const role = String(target.role || "").toLowerCase();
        const issue = String(symptom || "").toLowerCase();
        const priorParts = getRecentSameComponentPartsForAssist();
        const items: string[] = [];

        if (priorParts.length) {
          items.push(...priorParts.map((part) => `${part} — already seen on this component`));
        }

        if (role.includes("condensing") || role.includes("outdoor") || role.includes("condenser")) {
          items.push(
            "Contactor — verify pull-in, contact wear, and voltage drop",
            "Run capacitor — verify actual value under load",
            "Condenser fan motor — verify amps, rotation, and blade condition",
            "Pressure control / fan cycling control — verify sequence and cut-in/cut-out",
            "Compressor protection / start components — verify before condemning compressor"
          );
        }

        if (role.includes("evaporator") || role.includes("indoor_head")) {
          items.push(
            "Evaporator fan motor — verify amps, rotation, and blade condition",
            "Defrost heater — verify continuity / amp draw during defrost",
            "Defrost termination / sensor — verify actual termination behavior",
            "Drain heater / drain path — verify water can clear during defrost",
            "TXV / EEV path — verify feed problem before replacement"
          );
        }

        if (role.includes("furnace")) {
          items.push(
            "Ignitor — verify operation during sequence",
            "Flame sensor — verify cleaning / flame rectification",
            "Pressure switch — verify actual pressure and tubing condition",
            "Inducer motor — verify start, amps, and wheel condition",
            "Board / gas valve path — verify outputs before replacement"
          );
        }

        if (role.includes("air_handler") || role.includes("indoor_unit")) {
          items.push(
            "Blower motor / module — verify amps and control signal",
            "Blower capacitor — verify actual capacitance",
            "Fan relay / board output — verify command and voltage",
            "Drain safety / float switch — verify open/closed state",
            "Electric heat sequencer / relay — verify call and output"
          );
        }

        if (String(equipmentType || "").toLowerCase().includes("walk-in")) {
          items.push(
            "Defrost timer / board — verify schedule and outputs",
            "Fan delay / defrost relay — verify fan restart timing",
            "Door heater / frame heater — verify operation if sweating or ice is present"
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          items.push(
            "Control / call path — verify before major parts",
            "Airflow-related failure points — verify before refrigerant-side changes"
          );
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          items.push(
            "Defrost path — verify operation before replacing refrigeration parts",
            "Airflow / fan path — verify before condemning TXV or charge",
            "Drain / ice management path — verify before repeat repair"
          );
        }

        return uniqueAssistList(items).slice(0, 10);
      }

      function getTargetedManualQueriesV2() {
        const target = getTargetedComponentRecordForAssist();
        const role = String(target.role || "").toLowerCase();
        const makeModel = [target.manufacturer, target.model].filter(Boolean).join(" ").trim();
        const queries: string[] = [];

        if (makeModel) {
          queries.push(
            `${makeModel} service manual`,
            `${makeModel} wiring diagram`,
            `${makeModel} sequence of operation`
          );
        } else {
          queries.push("OEM service manual for the exact equipment", "OEM wiring diagram");
        }

        if (role.includes("condensing") || role.includes("outdoor") || role.includes("condenser")) {
          queries.push(
            "Outdoor / condensing section wiring diagram",
            "Contactor / capacitor / condenser fan circuit page",
            "Compressor protection / high-low pressure control page"
          );
        }

        if (role.includes("evaporator") || role.includes("indoor_head")) {
          queries.push(
            "Evaporator / indoor section wiring diagram",
            "Defrost sequence / termination / fan delay page",
            "Fan motor circuit and drain heat page",
            "TXV / EEV / feed circuit page"
          );
        }

        if (role.includes("furnace")) {
          queries.push(
            "Ignition sequence and safety chain page",
            "Board pinout / inducer / pressure switch wiring page"
          );
        }

        if (role.includes("air_handler") || role.includes("indoor_unit")) {
          queries.push(
            "Blower circuit / relay / board page",
            "Drain safety / float switch page",
            "Electric heat sequencer / strip heat page"
          );
        }

        if (String(equipmentType || "").toLowerCase().includes("walk-in")) {
          queries.push(
            "Walk-in defrost control page",
            "Walk-in evaporator fan delay / heater / drain heat page"
          );
        }

        return uniqueAssistList(queries).slice(0, 10);
      }

      function getTargetedVerifyChecklistV2() {
        const target = getTargetedComponentRecordForAssist();
        const role = String(target.role || "").toLowerCase();
        const items: string[] = [...getComponentAwareVerifyFirst()];

        if (target.tag) {
          items.unshift(`Verify you are on the correct tagged component: ${target.tag}.`);
        }

        if (role.includes("condensing") || role.includes("outdoor") || role.includes("condenser")) {
          items.push(
            "Verify line voltage, contactor status, capacitor value, and condenser fan operation before replacing parts.",
            "Verify condenser airflow / coil condition before refrigerant-side conclusions."
          );
        }

        if (role.includes("evaporator") || role.includes("indoor_head")) {
          items.push(
            "Verify fan operation, ice pattern, drain condition, and defrost behavior before ordering parts.",
            "Verify airflow and frost pattern before condemning TXV / EEV / charge."
          );
        }

        if (role.includes("furnace")) {
          items.push(
            "Verify the entire heat sequence and safety chain before replacing the board or valve."
          );
        }

        if (role.includes("air_handler") || role.includes("indoor_unit")) {
          items.push(
            "Verify blower output, motor operation, and drain safety before replacing indoor components."
          );
        }

        return uniqueAssistList(items).slice(0, 10);
      }

      function getTargetedHistoryBiasV2() {
        const history = getSameComponentHistoryForAssist();
        const items: string[] = [];
        const recentFix = getMostRecentSameComponentFixForAssist();
        const recentParts = getRecentSameComponentPartsForAssist();

        if (history.length) {
          items.push(
            `This component has ${history.length} prior same-component event${history.length === 1 ? "" : "s"}.`
          );
        }

        if (recentFix) {
          items.push(`Recent same-component fix: ${recentFix}`);
        }

        if (recentParts.length) {
          items.push(`Recent same-component parts: ${recentParts.join(" • ")}`);
        }

        const warnings = getComponentAwareWarningSignals();
        if (warnings.length) {
          items.push(...warnings);
        }

        return uniqueAssistList(items).slice(0, 8);
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

        const componentLabel = String(target.label || "Primary component").trim();
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

      function browserSupportsPartsReplacedDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

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

      function browserSupportsFollowUpDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

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
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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
          `${photoCount ? `${photoCount} photo${photoCount === 1 ? "" : "s"} attached` : "No photos attached yet"}.`
        );
        summaryParts.push(`Target component: ${targetComponent}.`);

        const selectedPart = String(selectedVerificationPart || "").trim();
        const selectedOutcome = String(selectedVerificationOutcome || "").trim();

        if (selectedPart) {
          summaryParts.push(`Selected verification part: ${selectedPart}.`);
        }

        if (selectedOutcome) {
          summaryParts.push(`Verification outcome focus: ${selectedOutcome}.`);
        }

        if (sameComponentHistory.length) {
          summaryParts.push(
            `This component has ${sameComponentHistory.length} prior same-component event${sameComponentHistory.length === 1 ? "" : "s"} in history.`
          );
        }

        if (photoAssistSubject === "iced_coil") {
          inspect.push(
            "Look for a full frost pattern versus a partial frost pattern.",
            "Check whether the fan is running and whether airflow is blocked by dirt or ice.",
            "Look for drain issues, ice bridging, and signs of repeated icing."
          );
          verifyNext.push(
            "Verify fan operation, airflow, and defrost operation before condemning charge or TXV/EEV.",
            "Compare frost pattern to current suction, superheat, and box/load condition."
          );
          repairDecisionEmphasis.push(
            "Do not move into a refrigerant-side repair decision until airflow, drain, and defrost are checked.",
            "Use the frost pattern to decide whether this is airflow/defrost versus feed/restriction."
          );
          partsToVerifyEmphasis.push(
            "Evaporator Fan Motor",
            "Defrost Heater",
            "Defrost Termination / Defrost Control",
            "TXV / EEV / Metering Device"
          );
          photoCanSupport.push(
            "Frost pattern clues",
            "Airflow restriction clues",
            "Drain/defrost pattern clues"
          );
          photoCannotProve.push(
            "Exact TXV/EEV failure by itself",
            "Exact refrigerant charge by itself"
          );
          watchOuts.push(
            "Do not jump straight to refrigerant-side parts if the photo points more toward airflow or defrost."
          );
        }

        if (photoAssistSubject === "contactor_capacitor") {
          inspect.push(
            "Look for pitted contacts, burnt insulation, swelling, oil leakage, or heat discoloration.",
            "Check wire terminations, loose lugs, and signs of overheating."
          );
          verifyNext.push(
            "Meter line/load voltage, verify coil pull-in, and test capacitor value before replacing other parts.",
            "Confirm the failed part is the root cause and not the result of another electrical problem."
          );
          repairDecisionEmphasis.push(
            "Bias the repair decision toward electrical verification first before refrigerant-side conclusions.",
            "Prove whether the contactor/capacitor is the failure or a symptom of motor/compressor load."
          );
          partsToVerifyEmphasis.push(
            "Contactor",
            "Run Capacitor",
            "Condenser Fan Motor",
            "Compressor"
          );
          photoCanSupport.push(
            "Burnt contacts",
            "Heat damage",
            "Swollen/leaking capacitor clues",
            "Loose lug / overheated wire clues"
          );
          photoCannotProve.push(
            "Actual voltage drop under load",
            "Actual coil control signal",
            "Actual capacitance value"
          );
          watchOuts.push(
            "A bad contactor or capacitor can be the symptom of motor/compressor issues, not always the root cause."
          );
        }

        if (photoAssistSubject === "control_board") {
          inspect.push(
            "Look for burnt traces, loose plugs, water intrusion, and failed relays.",
            "Check whether the board is actually receiving the correct inputs before condemning it."
          );
          verifyNext.push(
            "Verify incoming power, control signals, safeties, and outputs with a meter before replacing the board."
          );
          repairDecisionEmphasis.push(
            "Push the repair decision toward proving inputs and outputs instead of replacing the board from appearance alone."
          );
          partsToVerifyEmphasis.push(
            "Control Board",
            "Relay / Sequencer",
            "Pressure Switch",
            "Ignitor / Flame Sensor"
          );
          photoCanSupport.push(
            "Burnt trace clues",
            "Water intrusion clues",
            "Loose connector clues"
          );
          photoCannotProve.push(
            "Correct board inputs",
            "Correct board outputs",
            "Board failure by appearance alone"
          );
          watchOuts.push(
            "Board replacement without verifying inputs/outputs often creates callbacks."
          );
        }

        if (photoAssistSubject === "wiring") {
          inspect.push(
            "Look for rubbed insulation, burnt conductors, loose terminations, and wrong landed wires.",
            "Check for signs of field modifications or bypassed safeties."
          );
          verifyNext.push(
            "Ohm/check continuity only after confirming safe isolation. Then verify live voltage path as needed."
          );
          repairDecisionEmphasis.push(
            "Pause any part replacement until wiring integrity and landed connections are verified."
          );
          partsToVerifyEmphasis.push(
            "Contactor",
            "Control Board",
            "Relay / Sequencer",
            "Pressure Switch"
          );
          photoCanSupport.push(
            "Loose connection clues",
            "Heat damage clues",
            "Miswired field modification clues"
          );
          photoCannotProve.push(
            "Actual live voltage path by appearance alone",
            "Intermittent open under load by appearance alone"
          );
          watchOuts.push(
            "A wiring photo can explain repeated intermittent failures if connections are loose or heat damaged."
          );
        }

        if (photoAssistSubject === "nameplate_tag") {
          inspect.push(
            "Confirm model, serial, refrigerant, electrical data, and any internal/paired component relationship.",
            "Check whether the nameplate supports the selected affected component and equipment type."
          );
          verifyNext.push(
            "Use the tag to tighten parts/manuals lookup and confirm the correct system section is being diagnosed."
          );
          repairDecisionEmphasis.push(
            "Use the tag to narrow the repair path to the correct system section before ordering or replacing anything."
          );
          partsToVerifyEmphasis.push(
            "Model-specific OEM part verification",
            "Correct paired-equipment part lookup"
          );
          photoCanSupport.push(
            "Correct model/serial identification",
            "Correct paired-equipment side identification"
          );
          photoCannotProve.push(
            "That the selected part is bad by itself",
            "That the wrong side of the system is the failure"
          );
          watchOuts.push(
            "Do not order parts off the wrong tag when paired equipment is involved."
          );
        }

        if (photoAssistSubject === "drain_defrost") {
          inspect.push(
            "Look for blocked drains, failed heat, ice build-up, and wiring/sensor issues in the defrost path.",
            "Check whether fan delay, termination, or schedule issues show up in the photo context."
          );
          verifyNext.push(
            "Verify defrost controls, termination, heaters, drain heat, and fan delay before replacing refrigeration parts."
          );
          repairDecisionEmphasis.push(
            "Lean the repair decision toward the complete defrost path before refrigerant-side replacement."
          );
          partsToVerifyEmphasis.push(
            "Defrost Heater",
            "Defrost Termination",
            "Defrost Control",
            "Drain Heater"
          );
          photoCanSupport.push(
            "Drain blockage clues",
            "Ice pattern clues around defrost path",
            "Heater/termination wiring clues"
          );
          photoCannotProve.push(
            "Actual control timing by appearance alone",
            "Actual heater continuity by appearance alone"
          );
          watchOuts.push(
            "Repeated icing or water issues often come back if the defrost path is not fully checked."
          );
        }

        if (photoAssistSubject === "dirty_coil_airflow") {
          inspect.push(
            "Look for heavy dirt loading, matted fins, blocked return/supply path, and fan problems.",
            "Check whether the photo supports an airflow-driven complaint."
          );
          verifyNext.push(
            "Verify airflow and cleanliness first, then compare readings before calling charge/feed issues."
          );
          repairDecisionEmphasis.push(
            "Push the repair path toward airflow correction before refrigerant-side parts replacement."
          );
          partsToVerifyEmphasis.push(
            "Condenser Fan Motor",
            "Evaporator Fan Motor",
            "Blower Motor"
          );
          photoCanSupport.push(
            "Dirty coil clues",
            "Blocked airflow path clues",
            "Fan/blower airflow restriction clues"
          );
          photoCannotProve.push(
            "Charge condition by appearance alone",
            "Metering-device failure by appearance alone"
          );
          watchOuts.push(
            "Dirty coil / airflow problems can distort pressures, split, box temp, and frost pattern."
          );
        }

        if (photoAssistSubject === "compressor_section") {
          inspect.push(
            "Look for oil staining, overheated terminals, damaged insulation, and start component condition.",
            "Check whether the compressor area photo suggests electrical failure versus system condition."
          );
          verifyNext.push(
            "Verify voltage, amp draw, start components, and compressor protection before condemning the compressor."
          );
          repairDecisionEmphasis.push(
            "Keep the repair decision on electrical and protection verification before calling the compressor."
          );
          partsToVerifyEmphasis.push(
            "Run Capacitor",
            "Contactor",
            "Compressor Protection",
            "Compressor"
          );
          photoCanSupport.push(
            "Overheated terminal clues",
            "Oil-stain clues",
            "Start-component area clues"
          );
          photoCannotProve.push(
            "Internal compressor mechanical failure by appearance alone",
            "Correct amp draw by appearance alone"
          );
          watchOuts.push(
            "Do not call a compressor from a photo alone. Verify electrically and against system conditions."
          );
        }

        if (issue.includes("ice") || issue.includes("icing") || issue.includes("freeze")) {
          verifyNext.push(
            "Because the complaint involves icing/freezing, compare the photo with fan operation, airflow, drain condition, and defrost behavior."
          );
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          verifyNext.push(
            "Because this is a no-cool complaint, use the photo to support or eliminate electrical, airflow, and heat-rejection issues before major part replacement."
          );
        }

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          verifyNext.push(
            "Outdoor/condensing-side photos should be tied back to contactor, capacitor, fan, coil, and heat rejection checks first."
          );
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          verifyNext.push(
            "Evaporator/indoor-side photos should be tied back to fan, ice pattern, drain, airflow, and defrost/feed checks first."
          );
        }

        if (equipment.includes("walk-in")) {
          verifyNext.push(
            "For walk-ins, compare the photo against actual box temp, defrost schedule, door openings, and load."
          );
        }

        for (const warning of warnings) {
          watchOuts.push(warning);
        }

        const selectedPartLower = selectedPart.toLowerCase();

        if (selectedPartLower.includes("contactor") && photoAssistSubject === "contactor_capacitor") {
          photoPartTieIn.push("This photo should help support burnt contacts, heat damage, and lug condition on the contactor.");
          photoCannotProve.push("This photo cannot prove coil voltage or contact drop under load.");
          verifyNext.push("Use the photo as visual support, then meter line/load and coil voltage before replacement.");
        }

        if (selectedPartLower.includes("capacitor") && photoAssistSubject === "contactor_capacitor") {
          photoPartTieIn.push("This photo should help support visible capacitor swelling, leakage, and terminal condition.");
          photoCannotProve.push("This photo cannot prove actual µF value.");
          verifyNext.push("Use the photo as visual support, then test actual capacitance before replacement.");
        }

        if (
          (selectedPartLower.includes("txv") || selectedPartLower.includes("eev") || selectedPartLower.includes("metering")) &&
          photoAssistSubject === "iced_coil"
        ) {
          photoPartTieIn.push("This photo may support frost pattern clues that help decide whether feed/restriction is even in play.");
          photoCannotProve.push("This photo cannot prove TXV/EEV failure by itself.");
          verifyNext.push("Tie the frost pattern back to airflow, SH/SC, and restriction checks before replacing the metering device.");
        }

        if (
          (selectedPartLower.includes("defrost") || selectedPartLower.includes("drain heater")) &&
          (photoAssistSubject === "iced_coil" || photoAssistSubject === "drain_defrost")
        ) {
          photoPartTieIn.push("This photo should help support icing pattern, drain issues, and overall defrost-path clues.");
          photoCannotProve.push("This photo cannot prove the exact failed defrost component by itself.");
          verifyNext.push("Use the photo to support the defrost pattern, then verify heater/control/termination electrically.");
        }

        if (selectedPartLower.includes("control board") && photoAssistSubject === "control_board") {
          photoPartTieIn.push("This photo should help support burnt trace, water intrusion, and connector condition clues.");
          photoCannotProve.push("This photo cannot prove correct inputs/outputs by itself.");
          verifyNext.push("Use the photo to support board suspicion, then verify inputs and outputs with a meter before replacement.");
        }

        if (
          (selectedPartLower.includes("blower motor") || selectedPartLower.includes("evaporator fan motor") || selectedPartLower.includes("condenser fan motor")) &&
          photoAssistSubject === "dirty_coil_airflow"
        ) {
          photoPartTieIn.push("This photo should help support airflow restriction or dirty-coil context around the motor decision.");
          photoCannotProve.push("This photo cannot prove the motor is electrically failed by itself.");
          verifyNext.push("Use the photo to support airflow context, then verify motor voltage/amp draw before replacement.");
        }

        if (selectedOutcome === "Tested good") {
          photoPartTieIn.push("Current outcome says the selected part tested good, so use the photo to help rule it out rather than justify replacement.");
        }

        if (selectedOutcome === "Replaced") {
          photoPartTieIn.push("Current outcome says the selected part was replaced, so the photo should support why the repair path made sense.");
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
          setPhotoAssistMessage("No photo assist guidance was generated.");
          return;
        }
        setPhotoAssistMessage("Photo diagnostic assist refreshed.");
      }

      function addPhotoAssistToTechCloseoutNotes() {
        const payload = buildPhotoDrivenDiagnosticAssistPayload();
        const text = [
          "Photo Diagnostic Assist",
          payload.summary,
          payload.inspect.length ? "Inspect:\n- " + payload.inspect.join("\n- ") : "",
          payload.verifyNext.length ? "Verify Next:\n- " + payload.verifyNext.join("\n- ") : "",
          payload.watchOuts.length ? "Watch-Outs:\n- " + payload.watchOuts.join("\n- ") : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), text].filter(Boolean).join("\n\n")
        );
        setPhotoAssistMessage("Photo assist added to Tech Closeout Notes.");
      }

      // repair-decision-panel-v2
      function buildRepairDecisionPanelItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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

      // suggested-parts-to-verify-v1
      function buildSuggestedPartsToVerifyItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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

      // tighter-parts-manuals-assist-v3
      function buildTighterPartsManualsAssist() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = targetComponent.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const photoSubject = String(photoAssistSubject || "").trim().toLowerCase();
        const modelContext = [manufacturer, model].filter(Boolean).join(" ").trim();

        const manualSections: string[] = [];
        const partsFocus: string[] = [];
        const lookupBiases: string[] = [];
        const boundaries: string[] = [];

        const addUnique = (items: string[], value: string) => {
          const clean = String(value || "").trim();
          if (!clean) return;
          if (!items.some((item) => item.trim().toLowerCase() === clean.toLowerCase())) {
            items.push(clean);
          }
        };

        addUnique(lookupBiases, modelContext ? `Bias lookup to model-specific information for ${modelContext}.` : "Bias lookup to the currently entered make/model before using generic parts ideas.");
        addUnique(boundaries, `Stay on the selected component first: ${targetComponent}.`);

        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          addUnique(manualSections, "Outdoor/condensing unit wiring and sequence sections");
          addUnique(manualSections, "Contactor, capacitor, condenser fan, and compressor circuit sections");
          addUnique(partsFocus, "Contactor");
          addUnique(partsFocus, "Run Capacitor");
          addUnique(partsFocus, "Condenser Fan Motor");
          addUnique(partsFocus, "Compressor protection / start path");
          addUnique(boundaries, "Do not drift into evaporator/indoor parts unless readings or history clearly support that side.");
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          addUnique(manualSections, "Evaporator airflow, drain, frost pattern, and defrost sections");
          addUnique(manualSections, "Metering device and feed-path sections");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "Defrost Heater");
          addUnique(partsFocus, "Defrost Termination / Defrost Control");
          addUnique(partsFocus, "TXV / EEV / Metering Device");
          addUnique(boundaries, "Do not jump to condensing-side parts when the selected component is evap/indoor.");
        }

        if (componentLabelLower.includes("furnace")) {
          addUnique(manualSections, "Heating sequence of operation and safety-chain sections");
          addUnique(manualSections, "Ignition, flame proving, inducer, and pressure-switch sections");
          addUnique(partsFocus, "Ignitor");
          addUnique(partsFocus, "Flame Sensor");
          addUnique(partsFocus, "Pressure Switch");
          addUnique(partsFocus, "Inducer-related proving path");
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          addUnique(manualSections, "Indoor blower, relay/board output, and drain safety sections");
          addUnique(partsFocus, "Blower Motor / Module");
          addUnique(partsFocus, "Float Switch / Drain Safety");
          addUnique(partsFocus, "Relay / Sequencer");
        }

        if (equipment.includes("walk-in")) {
          addUnique(manualSections, "Walk-in defrost schedule, fan delay, drain heat, and box-control sections");
          addUnique(partsFocus, "Defrost Termination");
          addUnique(partsFocus, "Defrost Control");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(boundaries, "Keep the lookup focused on box temp, defrost path, and evap-side issues before broad refrigeration swaps.");
        }

        if (equipment.includes("ice machine")) {
          addUnique(manualSections, "Freeze/harvest sequence and water-system sections");
          addUnique(partsFocus, "Water Valve");
          addUnique(partsFocus, "Water Pump");
          addUnique(partsFocus, "Sensor / probe path");
          addUnique(boundaries, "Separate water-side sequence from refrigeration-side decisions.");
        }

        if (photoSubject == "nameplate_tag") {
          addUnique(lookupBiases, "Bias hard toward OEM model/serial lookup and the exact paired-equipment side shown on the tag.");
          addUnique(manualSections, "Nameplate/model-specific exploded views and parts lists");
        }

        if (photoSubject == "contactor_capacitor") {
          addUnique(lookupBiases, "Bias toward electrical service parts and wiring sections first.");
          addUnique(partsFocus, "Contactor");
          addUnique(partsFocus, "Run Capacitor");
          addUnique(partsFocus, "Condenser Fan Motor");
        }

        if (photoSubject == "control_board") {
          addUnique(lookupBiases, "Bias toward board input/output verification sections before replacement.");
          addUnique(partsFocus, "Control Board");
          addUnique(partsFocus, "Relay / Sequencer");
          addUnique(boundaries, "Do not call the board from appearance alone. Use the manual to verify inputs and outputs.");
        }

        if (photoSubject == "iced_coil" || photoSubject == "drain_defrost") {
          addUnique(lookupBiases, "Bias toward defrost, airflow, drain, and evap-side service sections.");
          addUnique(partsFocus, "Defrost Heater");
          addUnique(partsFocus, "Defrost Termination / Defrost Control");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "TXV / EEV / Metering Device");
        }

        if (photoSubject == "dirty_coil_airflow") {
          addUnique(lookupBiases, "Bias toward airflow, fan, and coil-cleaning related service sections first.");
          addUnique(partsFocus, "Condenser Fan Motor");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "Blower Motor");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(manualSections, "Freeze-up, defrost, drain, and frost-pattern troubleshooting sections");
          addUnique(boundaries, "Keep the lookup anchored to airflow/defrost/feed verification before broad part swapping.");
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          addUnique(manualSections, "No-cool electrical checks and airflow/refrigerant decision sections");
          addUnique(boundaries, "Use the selected component and current readings to stay on the correct side of the system.");
        }

        if (issue.includes("heat")) {
          addUnique(manualSections, "Heat sequence and safety proving sections");
        }

        return {
          modelContext,
          targetComponent,
          photoSubjectLabel: photoSubject ? photoSubject.replaceAll("_", " ") : "not selected",
          manualSections: manualSections.slice(0, 6),
          partsFocus: partsFocus.slice(0, 6),
          lookupBiases: lookupBiases.slice(0, 5),
          boundaries: boundaries.slice(0, 5),
        };
      }

      // part-verification-checklist-v1
      const [selectedVerificationPart, setSelectedVerificationPart] = useState("");

      function buildPartVerificationChecklistItems() {
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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
          add("Verify line voltage into the contactor.");
          add("Verify coil voltage when the call is present.");
          add("Check line-to-load contact drop under load.");
          add("Inspect for pitted contacts, overheated wires, and loose lugs.");
          addNote("Do not replace the contactor without checking whether compressor/fan load caused the failure.");
        }

        if (partLower.includes("capacitor")) {
          add("Test actual capacitance and compare against the rated µF.");
          add("Verify supply voltage to the motor/compressor circuit.");
          add("Check amp draw on the connected motor/compressor.");
          add("Inspect for swelling, oil leakage, or overheated terminals.");
          addNote("A failed capacitor can be the symptom of a weak motor or compressor.");
        }

        if (partLower.includes("condenser fan motor")) {
          add("Verify proper voltage to the fan motor.");
          add("Check fan rotation and blade condition.");
          add("Compare motor amp draw to expected operation.");
          add("Inspect the coil for dirt and confirm heat rejection is not the root issue.");
          if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
            addNote("High head relative to ambient supports heat-rejection verification before condemning the motor.");
          }
        }

        if (partLower.includes("evaporator fan motor")) {
          add("Verify fan operation and correct rotation.");
          add("Check voltage at the motor and any speed/module output.");
          add("Inspect blade/wheel condition and airflow path.");
          add("Check for ice, drain problems, and defrost issues affecting airflow.");
          if (deltaT !== null && deltaT < 14) {
            addNote("Weak split supports airflow/fan verification before deeper refrigerant-side part swaps.");
          }
        }

        if (partLower.includes("defrost heater")) {
          add("Ohm the heater for continuity with power isolated.");
          add("Verify control/board output to the heater during defrost.");
          add("Check termination and timer/schedule path.");
          add("Inspect drain and ice pattern to verify the heater failure matches the symptom.");
          addNote("A heater alone may not solve the issue if termination or schedule logic is wrong.");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          add("Verify the defrost schedule and control output.");
          add("Check termination state and whether the heater circuit is actually being commanded.");
          add("Verify fan delay and drain heat path if applicable.");
          add("Compare the timing logic to the actual icing pattern and box condition.");
          addNote("Defrost control decisions should match the full sequence, not just the ice complaint.");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          add("Verify airflow before condemning the metering device.");
          add("Compare frost pattern to superheat/subcool and overall load.");
          add("Check for restriction points such as a filter drier or liquid-line issue.");
          add("Confirm feed behavior matches the complaint before replacement.");
          if (superheat !== null && subcool !== null) {
            addNote(`Current SH/SC context: SH ${superheat}°F, SC ${subcool}°F.`);
          }
        }

        if (partLower.includes("blower motor")) {
          add("Verify board/relay/module output to the blower.");
          add("Check capacitor/module condition and motor amp draw.");
          add("Inspect wheel cleanliness and airflow restrictions.");
          add("Confirm drain safeties are not interrupting the indoor section.");
          if (deltaT !== null) {
            addNote(`Current air split is ${deltaT}°F, which should be considered before replacing the blower.`);
          }
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          add("Verify the drain condition and water level.");
          add("Confirm switch continuity/open state matches the actual drain condition.");
          add("Check whether the safety is interrupting the control circuit.");
          add("Rule out a real drain issue before replacing the safety.");
        }

        if (partLower.includes("ignitor")) {
          add("Verify call for heat and full ignition sequence.");
          add("Check ignitor resistance/current draw as appropriate.");
          add("Confirm board output to the ignitor.");
          add("Verify the pressure switch and safety chain before replacing.");
        }

        if (partLower.includes("flame sensor")) {
          add("Verify flame signal / proving before replacement.");
          add("Inspect flame quality and burner carryover.");
          add("Clean/test the sensor and confirm the board is receiving proof.");
          add("Verify the issue is not upstream in ignition or gas delivery.");
        }

        if (partLower.includes("pressure switch")) {
          add("Verify inducer operation and tubing condition.");
          add("Confirm pressure switch closure/opening against actual draft conditions.");
          add("Check venting and condensate traps if applicable.");
          add("Verify board input state before replacing the switch.");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          add("Separate sequence issues from actual component failure.");
          add("Verify power/control to the component.");
          add("Check the component response during the expected cycle.");
          add("Confirm the symptom is water-side before replacing refrigeration-related parts.");
        }

        if (!checklist.length) {
          add("Verify the selected part actually matches the target component and complaint.");
          add("Check control call, power path, and the strongest repair-decision items first.");
          add("Use readings/history/photo context before making a blind replacement.");
        }

        if (issue) {
          addNote(`Current symptom context: ${issue}.`);
        }
        addNote(`Target component: ${targetComponent}.`);

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
          "Verification Outcome",
          `Part: ${selectedPart}`,
          `Outcome: ${outcome}`,
          symptom ? `Symptom: ${symptom}` : "",
          getCurrentAffectedComponentLabelForAssist()
            ? `Component: ${getCurrentAffectedComponentLabelForAssist()}`
            : "",
          verificationOutcomeNote.trim() ? `Note: ${verificationOutcomeNote.trim()}` : "",
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

        setVerificationOutcomeMessage("Verification outcome added to Tech Closeout Notes.");
      }

      // selected-part-manuals-focus-assist-v1
      function buildSelectedPartManualsFocusAssist() {
        const partChecklist = buildPartVerificationChecklistItems();
        const selectedPart = String(partChecklist.selectedPart || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLower = targetComponent.toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const photoSubject = String(photoAssistSubject || "").trim().toLowerCase();
        const modelContext = [manufacturer, model].filter(Boolean).join(" ").trim();

        const manualFocus: string[] = [];
        const partsFocus: string[] = [];
        const sideFocus: string[] = [];
        const warnings: string[] = [];

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
            modelContext,
            manualFocus,
            partsFocus,
            sideFocus,
            warnings,
          };
        }

        const partLower = selectedPart.toLowerCase();

        addUnique(sideFocus, `Target component: ${targetComponent}`);
        addUnique(sideFocus, modelContext ? `Model context: ${modelContext}` : "Use current make/model before broad lookup.");

        if (partLower.includes("contactor")) {
          addUnique(manualFocus, "Condensing unit electrical sequence and contactor circuit");
          addUnique(manualFocus, "Line/load voltage path and contactor coil path");
          addUnique(partsFocus, "Contactor");
          addUnique(partsFocus, "Electrical service parts");
          addUnique(sideFocus, "Condensing / outdoor electrical side");
        }

        if (partLower.includes("capacitor")) {
          addUnique(manualFocus, "Run capacitor wiring and motor/compressor run circuit");
          addUnique(partsFocus, "Run Capacitor");
          addUnique(partsFocus, "Start / run electrical parts");
          addUnique(sideFocus, "Condensing / outdoor electrical side");
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(manualFocus, "Condenser fan wiring and heat-rejection section");
          addUnique(partsFocus, "Condenser Fan Motor");
          addUnique(partsFocus, "Outdoor airflow / heat-rejection parts");
          addUnique(sideFocus, "Condensing / outdoor airflow side");
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(manualFocus, "Evaporator airflow and fan circuit section");
          addUnique(manualFocus, "Drain / ice / airflow related service section");
          addUnique(partsFocus, "Evaporator Fan Motor");
          addUnique(partsFocus, "Evaporator airflow parts");
          addUnique(sideFocus, "Evaporator / indoor airflow side");
        }

        if (partLower.includes("defrost heater")) {
          addUnique(manualFocus, "Defrost heater circuit and defrost sequence section");
          addUnique(partsFocus, "Defrost Heater");
          addUnique(partsFocus, "Defrost system parts");
          addUnique(sideFocus, "Evaporator / defrost side");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(manualFocus, "Defrost control / termination / fan delay section");
          addUnique(partsFocus, "Defrost Termination");
          addUnique(partsFocus, "Defrost Control");
          addUnique(sideFocus, "Evaporator / defrost control side");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(manualFocus, "Metering device / feed path / distributor section");
          addUnique(manualFocus, "Restriction and evaporator feed verification section");
          addUnique(partsFocus, "TXV / EEV / Metering Device");
          addUnique(sideFocus, "Evaporator / feed side");
        }

        if (partLower.includes("blower motor")) {
          addUnique(manualFocus, "Indoor blower circuit and airflow sequence section");
          addUnique(partsFocus, "Blower Motor / Module");
          addUnique(partsFocus, "Indoor airflow parts");
          addUnique(sideFocus, "Indoor / air-handler airflow side");
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(manualFocus, "Drain safety / condensate interrupt section");
          addUnique(partsFocus, "Float Switch / Drain Safety");
          addUnique(sideFocus, "Indoor drain / safety side");
        }

        if (partLower.includes("ignitor")) {
          addUnique(manualFocus, "Heating sequence / ignition section");
          addUnique(partsFocus, "Ignitor");
          addUnique(partsFocus, "Heating ignition parts");
          addUnique(sideFocus, "Furnace heating sequence side");
        }

        if (partLower.includes("flame sensor")) {
          addUnique(manualFocus, "Flame proving / ignition verification section");
          addUnique(partsFocus, "Flame Sensor");
          addUnique(partsFocus, "Heating proving parts");
          addUnique(sideFocus, "Furnace flame-proving side");
        }

        if (partLower.includes("pressure switch")) {
          addUnique(manualFocus, "Inducer / pressure proving / vent safety section");
          addUnique(partsFocus, "Pressure Switch");
          addUnique(partsFocus, "Heating proving parts");
          addUnique(sideFocus, "Furnace draft / proving side");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(manualFocus, "Water system / freeze-harvest sequence section");
          addUnique(partsFocus, selectedPart);
          addUnique(sideFocus, "Ice machine water / sequence side");
        }

        if (equipment.includes("walk-in")) {
          addUnique(sideFocus, "Walk-in refrigeration / box-control context");
        }

        if (photoSubject === "nameplate_tag") {
          addUnique(manualFocus, "Model-specific parts list / exploded view / OEM lookup");
          addUnique(warnings, "Use the photographed tag/model to avoid pulling the wrong paired-equipment parts.");
        }

        if (photoSubject === "contactor_capacitor") {
          addUnique(warnings, "Stay on electrical verification first before shifting into refrigerant-side lookup.");
        }

        if (photoSubject === "iced_coil" || photoSubject === "drain_defrost") {
          addUnique(warnings, "Freeze-up photo context means airflow/defrost/feed sections should stay ahead of broad part swapping.");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(warnings, "The complaint is freeze/icing-related, so keep lookup anchored to airflow/defrost/feed verification.");
        }

        if (componentLower.includes("condensing") || componentLower.includes("outdoor")) {
          if (
            partLower.includes("evaporator") ||
            partLower.includes("defrost") ||
            partLower.includes("txv") ||
            partLower.includes("blower")
          ) {
            addUnique(warnings, "Selected part does not match the current outdoor/condensing-side focus. Re-check the target component.");
          }
        }

        if (componentLower.includes("evaporator") || componentLower.includes("indoor")) {
          if (
            partLower.includes("contactor") ||
            partLower.includes("capacitor") ||
            partLower.includes("condenser fan") ||
            partLower == "compressor"
          ) {
            addUnique(warnings, "Selected part does not match the current evap/indoor-side focus. Re-check the target component.");
          }
        }

        return {
          selectedPart,
          modelContext,
          manualFocus: manualFocus.slice(0, 5),
          partsFocus: partsFocus.slice(0, 5),
          sideFocus: sideFocus.slice(0, 5),
          warnings: warnings.slice(0, 4),
        };
      }

      // suggested-follow-up-watchlist-v1
      const [followUpWatchlistMessage, setFollowUpWatchlistMessage] = useState("");

      function buildSuggestedFollowUpWatchlist() {
        const checklist = buildPartVerificationChecklistItems();
        const selectedPart = String(checklist.selectedPart || selectedVerificationPart || "").trim();
        const selectedOutcome = String(selectedVerificationOutcome || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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

        addUnique(watchNext, `Selected part path: ${selectedPart || "No part selected yet"}.`);
        addUnique(watchNext, `Target component: ${targetComponent}.`);

        if (selectedOutcome) {
          addUnique(monitoringNote, `Verification outcome: ${selectedOutcome}.`);
        }

        const partLower = selectedPart.toLowerCase();

        if (partLower.includes("contactor")) {
          addUnique(watchNext, "Watch compressor and condenser fan operation after the call is satisfied.");
          addUnique(recheckItems, "Recheck line/load voltage and contact drop under load.");
          addUnique(recheckItems, "Inspect wire heat damage and lug tightness after operation.");
          addUnique(callbackRisk, "A new contactor can fail again if the real issue is motor/compressor load or wire heat.");
        }

        if (partLower.includes("capacitor")) {
          addUnique(watchNext, "Watch the motor/compressor start and run behavior after startup.");
          addUnique(recheckItems, "Recheck actual µF if symptoms return.");
          addUnique(recheckItems, "Compare connected motor/compressor amp draw after the repair.");
          addUnique(callbackRisk, "Capacitors often fail again when the attached motor/compressor is weak.");
        }

        if (partLower.includes("condenser fan motor")) {
          addUnique(watchNext, "Watch head pressure trend and condenser airflow after repair.");
          addUnique(recheckItems, "Recheck fan rotation, amp draw, and coil cleanliness.");
          if (headPressure !== null && ambientTemp !== null) {
            addUnique(monitoringNote, `Head/ambient context at diagnosis: ${headPressure} psi head with ${ambientTemp}°F ambient.`);
          }
          addUnique(callbackRisk, "Outdoor airflow callbacks happen when coil condition or voltage issues are missed.");
        }

        if (partLower.includes("evaporator fan motor")) {
          addUnique(watchNext, "Watch airflow, frost return, and drain condition after operation.");
          addUnique(recheckItems, "Recheck fan operation and airflow path after the box or space pulls down.");
          if (deltaT !== null) {
            addUnique(monitoringNote, `Air split context at diagnosis: ${deltaT}°F.`);
          }
          addUnique(callbackRisk, "Fan-related callbacks happen when the real issue is still defrost, drain, or blocked airflow.");
        }

        if (partLower.includes("defrost heater")) {
          addUnique(watchNext, "Watch the next full defrost cycle and confirm the ice pattern does not return.");
          addUnique(recheckItems, "Recheck termination, control output, and drain path.");
          if (boxTemp !== null) {
            addUnique(monitoringNote, `Box temperature context: ${boxTemp}°F.`);
          }
          addUnique(callbackRisk, "Heater replacement alone may not solve the call if termination/control logic is wrong.");
        }

        if (partLower.includes("defrost termination") || partLower.includes("defrost control")) {
          addUnique(watchNext, "Watch the next timed/initiated defrost and confirm heater/fan sequence.");
          addUnique(recheckItems, "Recheck fan delay, termination state, and drain heat path.");
          addUnique(callbackRisk, "Defrost callbacks happen when timing logic is not verified against actual ice pattern.");
        }

        if (partLower.includes("txv") || partLower.includes("eev") || partLower.includes("metering")) {
          addUnique(watchNext, "Watch superheat/subcool trend and frost pattern after the system stabilizes.");
          addUnique(recheckItems, "Recheck airflow and restriction path before assuming the feed path is fixed.");
          if (superheat !== null && subcool !== null) {
            addUnique(monitoringNote, `SH/SC context at diagnosis: SH ${superheat}°F, SC ${subcool}°F.`);
          }
          addUnique(callbackRisk, "Metering-device callbacks happen when airflow or restriction was the real cause.");
        }

        if (partLower.includes("blower motor")) {
          addUnique(watchNext, "Watch airflow, split, and drain safety behavior after the repair.");
          addUnique(recheckItems, "Recheck amp draw, wheel condition, and board/relay output.");
          if (deltaT !== null) {
            addUnique(monitoringNote, `Air split context at diagnosis: ${deltaT}°F.`);
          }
          addUnique(callbackRisk, "Blower callbacks happen when the true issue is control output or drain interruption.");
        }

        if (partLower.includes("float switch") || partLower.includes("drain safety")) {
          addUnique(watchNext, "Watch drain flow and whether the control interruption returns.");
          addUnique(recheckItems, "Recheck actual drain condition and switch state.");
          addUnique(callbackRisk, "Drain safety callbacks happen when the water problem was not corrected.");
        }

        if (partLower.includes("ignitor")) {
          addUnique(watchNext, "Watch the next heat cycle through ignition and flame prove.");
          addUnique(recheckItems, "Recheck board output and full heat sequence if symptoms return.");
          addUnique(callbackRisk, "Ignition callbacks happen when the full safety chain is not checked.");
        }

        if (partLower.includes("flame sensor")) {
          addUnique(watchNext, "Watch flame proving through multiple heat cycles.");
          addUnique(recheckItems, "Recheck flame signal, burner carryover, and ignition quality.");
          addUnique(callbackRisk, "Flame-sense callbacks happen when ignition quality or grounding is still weak.");
        }

        if (partLower.includes("pressure switch")) {
          addUnique(watchNext, "Watch the next full heat call and confirm pressure-proving stays stable.");
          addUnique(recheckItems, "Recheck inducer operation, tubing, venting, and condensate path.");
          addUnique(callbackRisk, "Pressure-switch callbacks happen when draft or drain issues were not corrected.");
        }

        if (partLower.includes("water valve") || partLower.includes("water pump") || partLower.includes("sensor")) {
          addUnique(watchNext, "Watch the next full sequence and confirm water-side timing stays correct.");
          addUnique(recheckItems, "Recheck component response during the expected cycle.");
          addUnique(callbackRisk, "Sequence callbacks happen when the wrong side of the system was blamed.");
        }

        if (equipment.includes("walk-in")) {
          addUnique(watchNext, "Watch actual box pull-down and next defrost cycle.");
        }

        if (issue.includes("icing") || issue.includes("freeze") || issue.includes("ice")) {
          addUnique(watchNext, "Watch for return ice pattern, drain issues, and airflow drop after the repair.");
          addUnique(callbackRisk, "Freeze-up complaints often return if airflow/defrost/feed verification was incomplete.");
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          addUnique(watchNext, "Watch temperature pull-down and whether the full call completes normally.");
        }

        if (selectedOutcome === "Tested good") {
          addUnique(monitoringNote, "Selected part tested good, so watch the stronger alternate path instead of replacing this part.");
        }

        if (selectedOutcome === "Needs more testing") {
          addUnique(monitoringNote, "More testing is still needed before committing the repair path.");
        }

        if (note) {
          addUnique(monitoringNote, `Tech note: ${note}`);
        }

        if (!watchNext.length) {
          addUnique(watchNext, "Watch system operation after the repair path is verified.");
        }

        if (!recheckItems.length) {
          addUnique(recheckItems, "Recheck the strongest measurement and sequence item tied to the selected part.");
        }

        if (!callbackRisk.length) {
          addUnique(callbackRisk, "Blind replacement without proving the full path is the main callback risk.");
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
          "Suggested Follow-Up Watchlist",
          payload.selectedPart ? `Part: ${payload.selectedPart}` : "",
          payload.selectedOutcome ? `Outcome: ${payload.selectedOutcome}` : "",
          payload.watchNext.length ? "Watch Next:\n- " + payload.watchNext.join("\n- ") : "",
          payload.recheckItems.length ? "Recheck Items:\n- " + payload.recheckItems.join("\n- ") : "",
          payload.callbackRisk.length ? "Callback Risk:\n- " + payload.callbackRisk.join("\n- ") : "",
          payload.monitoringNote.length ? "Monitoring Notes:\n- " + payload.monitoringNote.join("\n- ") : "",
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

        setFollowUpWatchlistMessage("Suggested watchlist added to Follow-Up and Tech Closeout Notes.");
      }

      // repair-execution-assist-v1
      function buildRepairExecutionAssist() {
        const checklist = buildPartVerificationChecklistItems();
        const selectedPart = String(checklist.selectedPart || selectedVerificationPart || "").trim();
        const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
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

const [showBulkImportTools, setShowBulkImportTools] = useState(false);

  const [workOrderImportText, setWorkOrderImportText] = useState("");
  const [workOrderImportRows, setWorkOrderImportRows] = useState<Record<string, string>[]>([]);
  const [workOrderImportMessage, setWorkOrderImportMessage] = useState("");
  const [workOrderImportLoading, setWorkOrderImportLoading] = useState(false);
  const [workOrderImportResults, setWorkOrderImportResults] = useState<
  { rowNumber: number; action: string; unitId: string }[]
>([]);

  const [repairGuidanceMode, setRepairGuidanceMode] =
  useState<"apprentice" | "experienced">("apprentice");

  const supabase = createSupabaseClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
const [needsCompanyOnboarding, setNeedsCompanyOnboarding] = useState(false);
const [onboardingCompanyName, setOnboardingCompanyName] = useState("");
const [onboardingBusy, setOnboardingBusy] = useState(false);
const [onboardingMessage, setOnboardingMessage] = useState("");
const [addTechEmail, setAddTechEmail] = useState("");
const [addTechBusy, setAddTechBusy] = useState(false);
const [addTechMessage, setAddTechMessage] = useState("");
const [showAddTechTools, setShowAddTechTools] = useState(false);
const [companyMembers, setCompanyMembers] = useState<
  { id: string; user_id: string; email: string; full_name: string; role: string; status: string; created_at?: string }[]
>([]);
const [companyMembersBusy, setCompanyMembersBusy] = useState(false);
const [companyMembersMessage, setCompanyMembersMessage] = useState("");
const [showCompanyTeam, setShowCompanyTeam] = useState(false);
const [serviceEventPhotoUrls, setServiceEventPhotoUrls] = useState<string[]>([]);
const [serviceEventPhotoBusy, setServiceEventPhotoBusy] = useState(false);
const [serviceEventPhotoMessage, setServiceEventPhotoMessage] = useState("");
const [editingServiceEventId, setEditingServiceEventId] = useState("");
const [showServiceEventPhotos, setShowServiceEventPhotos] = useState(false);
const [historicalEntryMode, setHistoricalEntryMode] = useState(false);
const [showQuickStartInline, setShowQuickStartInline] = useState(true);

const siteUnitsAtLocation = savedUnits.filter((u) => {
  const sameCustomer =
    String(u.customerName || "").trim().toLowerCase() ===
    String(customerName || "").trim().toLowerCase();

  const sameSite =
    String(u.siteName || "").trim().toLowerCase() ===
    String(siteName || "").trim().toLowerCase();

  return Boolean(customerName.trim() && siteName.trim() && sameCustomer && sameSite);
});

 const [showAdvancedAiOutput, setShowAdvancedAiOutput] = useState(false);

  const [showAiChatBot, setShowAiChatBot] = useState(false);

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
    const membership = await getCurrentUserMembership();
    setNeedsCompanyOnboarding(!membership);
    setAuthChecked(true);
  });
}, [supabase]);

  const parsed = useMemo(() => parseDiagnosis(rawResult), [rawResult]);

  const chargeAnalysis = useMemo(
    () => analyzeCharge(observations, equipmentType, refrigerantType),
    [observations, equipmentType, refrigerantType]
  );

  const airflowAnalysis = useMemo(() => analyzeAirflow(observations), [observations]);

const defrostAnalysis = useMemo(
  () => analyzeDefrost(observations, equipmentType, symptom),
  [observations, equipmentType, symptom]
);

const defrostRepairGuidance = useMemo(
  () => buildDefrostRepairGuidance(observations, equipmentType, symptom),
  [observations, equipmentType, symptom]
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
      }),
    [savedUnits, customerName, siteName, unitNickname, model, manufacturer, equipmentType]
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

  const filteredSavedUnits = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    if (!q) return savedUnits;
    return savedUnits.filter((u) =>
      [
        u.customerName,
        u.siteName,
        u.siteAddress,
        u.unitNickname,
        u.manufacturer,
        u.model,
        u.symptom,
        u.equipmentType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [savedUnits, historyFilter]);

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

  function parseSimpleCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });

    return row;
  });
}

async function importWorkOrderRows() {
  if (!workOrderImportRows.length) {
    setWorkOrderImportMessage("Nothing to import yet. Paste CSV and click Preview first.");
    return;
  }

  setWorkOrderImportLoading(true);
  setWorkOrderImportMessage("");
  setWorkOrderImportResults([]);

  try {
    const results: { rowNumber: number; action: string; unitId: string }[] = [];

    for (let i = 0; i < workOrderImportRows.length; i++) {
      const row = workOrderImportRows[i];

      let matchedUnit = await findStrongUnitMatchForCurrentUser({
        customer_name: row.customer_name || "",
        site_name: row.site_name || "",
        unit_nickname: row.unit_nickname || "",
        serial: row.serial || "",
      });

      let action = "matched-existing-unit";

      if (!matchedUnit) {
        matchedUnit = await createUnitForCurrentUser({
          id: makeId(),
          customer_name: row.customer_name || "",
          site_name: row.site_name || "",
          site_address: row.site_address || "",
          unit_nickname: row.unit_nickname || "",
          property_type: row.property_type || "",
          equipment_type: row.equipment_type || "",
          manufacturer: row.manufacturer || "",
          model: row.model || "",
          serial: row.serial || "",
          refrigerant_type: row.refrigerant_type || "",
        });

        action = "created-new-unit";
      }

      await createServiceEventForCurrentUser({
        id: makeId(),
        unit_id: matchedUnit.id,
        service_date: row.service_date || null,
        symptom: row.symptom || "",
        diagnosis_summary: row.diagnosis_summary || "",
        final_confirmed_cause: row.final_confirmed_cause || "",
        parts_replaced: row.parts_replaced || "",
        actual_fix_performed: row.actual_fix_performed || "",
        outcome_status: row.outcome_status || "",
        callback_occurred: row.callback_occurred || "",
        tech_closeout_notes: row.tech_closeout_notes || "",
      });

      results.push({
        rowNumber: i + 1,
        action,
        unitId: matchedUnit.id,
      });
    }

    setWorkOrderImportResults(results);
    setWorkOrderImportMessage(`Imported ${results.length} work-order row(s).`);
    setWorkOrderImportText("");
    setWorkOrderImportRows([]);
  } catch (err) {
    console.error(err);
    setWorkOrderImportMessage("Import failed.");
  } finally {
    setWorkOrderImportLoading(false);
  }
}

function previewWorkOrderImport() {
  try {
    const rows = parseSimpleCsv(workOrderImportText);
    setWorkOrderImportRows(rows);
    setWorkOrderImportResults([]);
    setWorkOrderImportMessage(
      rows.length
        ? `Parsed ${rows.length} row(s). Review before import.`
        : "No valid rows found. Make sure the first row contains headers."
    );
  } catch {
    setWorkOrderImportRows([]);
    setWorkOrderImportResults([]);
    setWorkOrderImportMessage("Could not parse CSV text.");
  }
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

  async function handleAddTechToCompany() {
  const email = addTechEmail.trim().toLowerCase();
  if (!email) {
    setAddTechMessage("Enter the tech email.");
    return;
  }

  try {
    setAddTechBusy(true);
    setAddTechMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session?.access_token) throw new Error("No active session found.");

    const res = await fetch("/api/company/add-member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email,
        role: "tech",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Server error (${res.status})`);
    }

    if (data?.alreadyMember) {
      setAddTechMessage("That user is already attached to this company.");
    } else {
      setAddTechMessage("Tech added to company.");
    }

    setAddTechEmail("");
    await loadCompanyMembers();
  } catch (err) {
    console.error("ADD TECH FAILED", err);
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);

    setAddTechMessage(`Add tech failed: ${msg}`);
  } finally {
    setAddTechBusy(false);
  }
}

async function loadCompanyMembers() {
  try {
    setCompanyMembersBusy(true);
    setCompanyMembersMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session?.access_token) throw new Error("No active session found.");

    const res = await fetch("/api/company/list-members", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Server error (${res.status})`);
    }

    setCompanyMembers(data.members || []);
  } catch (err) {
    console.error("LOAD COMPANY MEMBERS FAILED", err);
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);

    setCompanyMembersMessage(`Could not load company team: ${msg}`);
    setCompanyMembers([]);
  } finally {
    setCompanyMembersBusy(false);
  }
}

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
    });

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "noopener,noreferrer,width=1000,height=900");

    if (!win) {
      alert("Popup blocked. Please allow popups for this site.");
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
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>My HVACR Tool</h1>
      <p>You need to log in first.</p>
      <a
  href="/auth"
  style={{
    display: "inline-block",
    marginTop: 12,
    padding: "10px 14px",
    fontWeight: 900,
    border: "1px solid #ddd",
    borderRadius: 10,
    textDecoration: "none",
    color: "#111",
    background: "#fafafa",
  }}
>
  Let&apos;s Diagnose
</a>
    </div>
  );
}

if (needsCompanyOnboarding) {
  return (
    <div style={{ padding: "16px", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Set Up Your Company</h1>
      <p style={{ marginTop: 8 }}>
        Before using the HVAC tool, create your company workspace.
      </p>

      <div
        style={{
          marginTop: 16,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 16,
          background: "#fafafa",
          display: "grid",
          gap: 12,
        }}
      >
        <div>
          <label style={{ fontWeight: 900 }}>Company Name</label>
          <br />
          <input
            value={onboardingCompanyName}
            onChange={(e) => setOnboardingCompanyName(e.target.value)}
            placeholder="Example: Caplinger Company"
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        {userEmail ? (
          <SmallHint>
            Signed in as: <b>{userEmail}</b>
          </SmallHint>
        ) : null}

        {onboardingMessage ? (
          <SmallHint>{onboardingMessage}</SmallHint>
        ) : (
          <SmallHint>
            This will create your company and attach your account as the company admin.
          </SmallHint>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleCreateCompanyOnboarding}
            disabled={onboardingBusy}
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
            {onboardingBusy ? "Creating Company..." : "Create Company"}
          </button>

          <button
            onClick={handleSignOut}
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
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}



return (
  <div style={{ paddingTop: 96 }}>
    <NavMenu currentPath="/hvac_units" />
    <StepProgressBar />
  <div style={{ padding: "16px 16px 40px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 4 }}>
        My HVACR Tool — Diagnose
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
    <b>Logged in:</b> {userEmail || "Unknown user"}
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
  Load Unit
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
    {showSavedUnitHistory ? "Hide History" : "Show History"}
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
    Sign out
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
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Company Admin / Add Tech">
          <button
            onClick={() => setShowAddTechTools((v) => !v)}
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
            {showAddTechTools ? "Hide Add Tech" : "Show Add Tech"}
          </button>

          {showAddTechTools ? (
            <div style={{ marginTop: 12 }}>
              <SmallHint>
                Add an existing user account to your company as a tech.
              </SmallHint>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Tech Email</label>
                  <br />
                  <input
                    value={addTechEmail}
                    onChange={(e) => setAddTechEmail(e.target.value)}
                    placeholder="tech@example.com"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <button
                  onClick={handleAddTechToCompany}
                  disabled={addTechBusy}
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
                  {addTechBusy ? "Adding..." : "Add Tech"}
                </button>
              </div>

              {addTechMessage ? (
                <SmallHint style={{ marginTop: 10 }}>{addTechMessage}</SmallHint>
              ) : null}
            </div>
          ) : (
            <SmallHint style={{ marginTop: 12 }}>
              Hidden by default to keep the main workflow clean.
            </SmallHint>
          )}
        </SectionCard>
      </div>
      ) : null}

{!historicalEntryMode ? (
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Company Team">
          <button
            onClick={() => setShowCompanyTeam((v) => !v)}
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
            {showCompanyTeam ? "Hide Team" : "Show Team"}
          </button>

          {showCompanyTeam ? (
            <div style={{ marginTop: 12 }}>
              {companyMembersBusy ? (
                <SmallHint>Loading company team...</SmallHint>
              ) : companyMembers.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {companyMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {member.full_name || member.email || member.user_id}
                      </div>
                      <SmallHint style={{ marginTop: 4 }}>
                        {member.email || "No email"} • {member.role || "-"} • {member.status || "-"}
                      </SmallHint>
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>
                  {companyMembersMessage || "No company members found yet."}
                </SmallHint>
              )}
            </div>
          ) : (
            <SmallHint style={{ marginTop: 12 }}>
              Hidden by default to keep the main workflow clean.
            </SmallHint>
          )}
        </SectionCard>
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
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Historical Entry Mode">
          <button
            onClick={() => setHistoricalEntryMode((v) => !v)}
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
            {historicalEntryMode ? "Turn Historical Entry Mode Off" : "Turn Historical Entry Mode On"}
          </button>

          <SmallHint style={{ marginTop: 12 }}>
            {historicalEntryMode
              ? "Historical Entry Mode is ON. Company/admin sections are hidden so you can enter past calls faster."
              : "Turn this on when entering old service calls. It hides company/admin clutter and keeps the screen cleaner."}
          </SmallHint>
        </SectionCard>
      </div>

        
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Help / Quick Start">
            <button
              onClick={() => setShowQuickStartInline((v) => !v)}
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
              {showQuickStartInline ? "Hide Quick Start" : "Show Quick Start"}
            </button>

            {showQuickStartInline ? (

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>1. Quick Start</div>
                <SmallHint>Save a new unit or load an existing one. Enter the symptom, use the hints, add photos if needed, then save the call to the timeline.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>2. Historical Entry</div>
                <SmallHint>Load the unit first whenever possible. Turn on Historical Entry Mode to reduce clutter. Enter service date, symptom, cause, fix, outcome, callback, and notes. Use Save & Add Another for multiple old calls on the same unit.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>3. Photos</div>
                <SmallHint>Open Service Event Photos, take or attach photos, then save the call so the photos stay with that service event and appear later in timeline/profile history.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>4. Editing</div>
                <SmallHint>Load a unit and use Update Loaded Unit to correct unit details. In Unit Service Timeline, use Edit Event to fix a saved service entry, then use Update Event to save changes.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>5. Parts / Manuals / Hints</div>
                <SmallHint>Unit History Troubleshooting Hints uses saved history from that unit. Parts & Manuals Assist gives broad search and history-aware suggestions. History is guidance only and does not stop you from chasing a brand-new issue.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>FAQ</div>
                <SmallHint><b>How do I avoid duplicates?</b> Load the unit first when possible. Serial number is the strongest identifier.</SmallHint>
                <SmallHint><b>How do I correct a unit?</b> Load it, change the fields, then click Update Loaded Unit.</SmallHint>
                <SmallHint><b>How do I fix a saved call?</b> Use Edit Event in the Unit Service Timeline.</SmallHint>
                <SmallHint><b>How do I enter lots of old calls fast?</b> Use Historical Entry Mode and Save & Add Another.</SmallHint>
                <SmallHint><b>Where do photos go?</b> Photos attach to the service event and show in the timeline/profile later.</SmallHint>
              </div>
            </div>
            ) : (
              <SmallHint style={{ marginTop: 12 }}>
                Hidden to keep the main workflow clean.
              </SmallHint>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Customer / Site / Unit" id="new-job">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 900 }}>Customer Name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Company Name</label>
              <br />
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Example: ABC Mechanical"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Site Name</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: 900 }}>Site Address</label>
              <input
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900, fontSize: 16 }}>Unit Nickname / Tag *</label>
          <SmallHint>
            Use a clear unit tag like RTU-1, RTU-2, WIC-1, Reach-In 3, or Merchandiser 2.
          </SmallHint>
              <input
                value={unitNickname}
                onChange={(e) => setUnitNickname(e.target.value)}
                placeholder="RTU-1, Office Furnace, Walk-in Cooler"
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
    System Structure / Linked Equipment
  </div>

  <SmallHint>
    The Unit Tag / Manufacturer / Model / Serial fields above are the primary piece of equipment for
    this call. Use this section when the system has linked equipment like outdoor + indoor, furnace +
    AC, condensing unit + evaporator, or multiple evaporators / indoor heads.
  </SmallHint>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 10,
    }}
  >
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 900 }}>System Type</span>
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
        <option value="single">Single piece of equipment</option>
        <option value="split_system">Split system</option>
        <option value="furnace_ac">Furnace + AC</option>
        <option value="heat_pump_air_handler">Heat pump + air handler</option>
        <option value="walk_in">Walk-in condensing unit + evaporator(s)</option>
        <option value="mini_split">Mini-split outdoor + indoor head(s)</option>
        <option value="other_multi">Other multi-component system</option>
      </select>
    </label>

    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 900 }}>Primary Component Role</span>
      <select
        value={primaryComponentRole}
        onChange={(e) => setPrimaryComponentRole(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      >
        <option value="unit">Unit</option>
        <option value="outdoor_unit">Outdoor Unit</option>
        <option value="indoor_unit">Indoor Unit</option>
        <option value="furnace">Furnace</option>
        <option value="air_handler">Air Handler</option>
        <option value="condensing_unit">Condensing Unit</option>
        <option value="evaporator">Evaporator</option>
        <option value="indoor_head">Indoor Head</option>
        <option value="primary_component">Primary Component</option>
      </select>
    </label>

    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 900 }}>Primary Tag Status</span>
      <select
        value={primaryTagStatus}
        onChange={(e) =>
          setPrimaryTagStatus(e.target.value as "readable" | "partial" | "unreadable")
        }
        style={{ width: "100%", padding: 8 }}
      >
        <option value="readable">Readable</option>
        <option value="partial">Partial / damaged</option>
        <option value="unreadable">Unreadable / destroyed</option>
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
      <div style={{ fontWeight: 900 }}>Primary component damaged or unreadable tag workflow</div>

      <SmallHint>
        Check inside the electrical, fan, or control area for an internal label before saving
        incomplete primary component information.
      </SmallHint>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 900 }}>Reason primary tag could not be fully read</span>
        <textarea
          value={primaryTagIssueReason}
          onChange={(e) => setPrimaryTagIssueReason(e.target.value)}
          rows={3}
          placeholder="Example: Outdoor tag sun-faded. Checked inside control panel and found partial serial only."
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
        I checked inside the electrical / fan / control area for an internal label.
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
          <div style={{ fontWeight: 900 }}>Linked Equipment Components</div>
          <SmallHint>
            Add every linked piece of equipment for this system so history does not get mixed up.
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
            Add {systemStructureDefaults[systemType]?.linkedLabel || "Linked Component"}
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
              Add Evaporator
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
              Add Indoor Head
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
          This system type needs linked equipment entered before save.
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
            <div style={{ fontWeight: 900 }}>Linked Component {idx + 1}</div>

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
              Remove
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
              <span style={{ fontWeight: 900 }}>Component Role</span>
              <select
                value={component.role}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "role", e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                {linkedEquipmentRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Component Tag</span>
              <input
                value={component.tag}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "tag", e.target.value)}
                placeholder="Example: EVAP-2, Indoor Head 3"
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Manufacturer</span>
              <input
                value={component.manufacturer}
                onChange={(e) =>
                  updateLinkedEquipmentComponent(component.id, "manufacturer", e.target.value)
                }
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Model</span>
              <input
                value={component.model}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "model", e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Serial</span>
              <input
                value={component.serial}
                onChange={(e) => updateLinkedEquipmentComponent(component.id, "serial", e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 900 }}>Tag Status</span>
              <select
                value={component.tagStatus}
                onChange={(e) =>
                  updateLinkedEquipmentComponent(component.id, "tagStatus", e.target.value)
                }
                style={{ width: "100%", padding: 8 }}
              >
                <option value="readable">Readable</option>
                <option value="partial">Partial / damaged</option>
                <option value="unreadable">Unreadable / destroyed</option>
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
                Check inside the electrical, fan, or control area for another label for this linked
                component before saving incomplete information.
              </SmallHint>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 900 }}>Reason tag could not be fully read</span>
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
                I checked inside the electrical / fan / control area for an internal label.
              </label>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ) : null}
</div>

<div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <PillButton text="Save Current Unit" onClick={saveCurrentUnit} />
              {currentLoadedUnitId ? <PillButton text="Update Loaded Unit" onClick={updateCurrentLoadedUnit} /> : null}
            <PillButton text="Clear Current Form" onClick={clearCurrentForm} />
          </div>
        </SectionCard>

        <div
          style={{
            marginTop: 16,
          }}
        >
          <SectionCard title="Current Loaded Unit">
            <div
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                padding: 12,
                background: currentLoadedUnitId ? "#f7fbff" : "#fafafa",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid #cfcfcf",
                    background: currentLoadedUnitId ? "#eefaf0" : "#f7f7f7",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {currentLoadedUnitId ? "UNIT LOADED" : "NO UNIT LOADED"}
                </span>

                {currentLoadedUnitId ? (
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
                    ID: {currentLoadedUnitId.slice(0, 8)}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div><b>Customer:</b> {customerName || "-"}</div>
                <div><b>Site:</b> {siteName || "-"}</div>
                <div><b>Unit Tag:</b> {unitNickname || "-"}</div>
                <div><b>Manufacturer:</b> {manufacturer || "-"}</div>
                <div><b>Model:</b> {model || "-"}</div>
                <div><b>Serial:</b> {serialNumber || "-"}</div>
                <div><b>System Type:</b> {systemType || "single"}</div>
                <div><b>Primary Role:</b> {primaryComponentRole || "unit"}</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  {/* linked-equipment-summary-v3 */}
                  <b>Linked Equipment:</b>{" "}
                  {linkedEquipmentComponents.length
                    ? linkedEquipmentComponents.map((component, idx) => {
                        const bits = [
                          component.role || `component ${idx + 1}`,
                          component.tag || "",
                          component.manufacturer || "",
                          component.model || "",
                          component.serial || "",
                        ].filter(Boolean);
                        return bits.join(" • ");
                      }).join(" | ")
                    : "None"}
                </div>
              </div>

              <SmallHint style={{ marginTop: 10 }}>
                Always verify this banner before saving historical calls so they stay attached to the correct unit.
              </SmallHint>
            </div>
          </SectionCard>
        </div>

      {/* affected-component-ui-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Affected Component for This Call">
          <SmallHint>
            Select the exact piece of equipment this call is about. This is required for split systems,
            walk-ins, mini-splits, and any multi-component setup so history stays tied to the right component.
          </SmallHint>

          {(() => {
            const options = getAffectedComponentOptions();
            return (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
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
            );
          })()}
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
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 4 — Repair</div>
          <SmallHint>
            Once a part is selected, use these sections to verify it correctly, focus on the right manual/parts area, and execute the repair safely.
          </SmallHint>
        </div>
      </div>

{/* repair-execution-assist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Repair Execution Assist">
          <SmallHint>
            For the selected part, shows what to verify first, how to approach replacement, safety/watch-outs, common mistakes, and quick video/search links.
          </SmallHint>

          {(() => {
            const payload = buildRepairExecutionAssist();

            if (!payload.selectedPart) {
              return (
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Current Part Focus
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        None selected yet
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
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        What Unlocks This
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        Select a part in Part Verification Checklist
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fffaf0",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>
                      Repair help is ready once a part is selected.
                    </div>

                    <SmallHint>This section will show:</SmallHint>

                    <ul style={{ marginTop: 0, paddingLeft: 18 }}>
                      <li><SmallHint>Verify First</SmallHint></li>
                      <li><SmallHint>Replace Steps</SmallHint></li>
                      <li><SmallHint>Safety / Shutdown</SmallHint></li>
                      <li><SmallHint>Common Mistakes</SmallHint></li>
                      <li><SmallHint>Watch After Repair</SmallHint></li>
                      <li><SmallHint>YouTube / Web repair search links</SmallHint></li>
                    </ul>

                    <SmallHint>
                      Pick a likely part in <b>Part Verification Checklist</b> and this section will automatically fill in.
                    </SmallHint>
                  </div>
                </div>
              );
            }

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
                      Selected Part
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedPart}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Search Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.searchQuery}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {payload.youtubeSearchUrl ? (
                    <a
                      href={payload.youtubeSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        textDecoration: "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Open YouTube Repair Search
                    </a>
                  ) : null}

                  {payload.webSearchUrl ? (
                    <a
                      href={payload.webSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        textDecoration: "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      Open Web Search
                    </a>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Verify First</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.verifyFirst.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Replace Steps</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.replaceSteps.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Safety / Shutdown</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.safety.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Common Mistakes</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.mistakes.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Watch After Repair</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.watchAfterRepair.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* part-verification-checklist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Part Verification Checklist">
          <SmallHint>
            Pick a likely part and the app gives the exact checks to perform before replacing it.
          </SmallHint>

          {(() => {
            const payload = buildPartVerificationChecklistItems();

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontWeight: 900 }}>Selected Part To Verify</label>
                    <select
                      value={payload.selectedPart}
                      onChange={(e) => setSelectedVerificationPart(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    >
                      <option value="">Choose a part</option>
                      {payload.availableParts.map((part) => (
                        <option key={part} value={part}>
                          {part}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Part Focus
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedPart || "Choose a part"}
                    </div>
                  </div>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 900 }}>Verification Checklist</div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {payload.checklist.map((item, idx) => (
                      <li key={idx}>
                        <SmallHint>{item}</SmallHint>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 900 }}>Context Notes</div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {payload.notes.map((item, idx) => (
                      <li key={idx}>
                        <SmallHint>{item}</SmallHint>
                      </li>
                    ))}
                  </ul>
                </div>

                {payload.selectedPart ? (
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

                          if (existing.includes(payload.selectedPart.trim().toLowerCase())) {
                            return current;
                          }

                          return [current, payload.selectedPart].filter(Boolean).join(", ");
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
                      Add Selected Part to Parts Replaced
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </SectionCard>
      </div>

            
      {/* refrigerant-log-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="🧪 Refrigerant Log" id="refrigerant-log">
          <SmallHint>
            EPA 608 compliant refrigerant tracking. Log every pound added or recovered.
            Export a compliance CSV at any time. A2L safety warnings included.
          </SmallHint>
          <div style={{ marginTop: 12 }}>
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
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 5 — Closeout + Follow-Up</div>
          <SmallHint>
            Commit what was verified or replaced, generate the closeout, and leave with a follow-up watchlist that lowers callback risk.
          </SmallHint>
        </div>
      </div>

{/* customer-report-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="📄 Customer Service Report" id="customer-report">
          <SmallHint>
            Generate a professional, plain-English service report to share with the customer. One tap — no jargon.
          </SmallHint>
          <div style={{ marginTop: 12 }}>
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
          </div>
        </SectionCard>
      </div>

{/* suggested-follow-up-watchlist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Suggested Follow-Up Watchlist">
          <SmallHint>
            Builds a watchlist from the verified repair path so the tech knows what to monitor next and what may still trigger a callback.
          </SmallHint>

          {(() => {
            const payload = buildSuggestedFollowUpWatchlist();

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
                      Selected Part
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedPart || "Choose a part in Part Verification Checklist"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Verification Outcome
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {payload.selectedOutcome || "Choose an outcome in Verification Outcome + Repair Commit"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Watch Next</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.watchNext.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Recheck Items</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.recheckItems.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Callback Risk</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.callbackRisk.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Monitoring Notes</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {payload.monitoringNote.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={applySuggestedFollowUpWatchlist}
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
                    Add Watchlist to Follow-Up + Tech Notes
                  </button>
                </div>

                {followUpWatchlistMessage ? (
                  <SmallHint>
                    <b>Watchlist:</b> {followUpWatchlistMessage}
                  </SmallHint>
                ) : null}
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* verification-outcome-repair-commit-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Verification Outcome + Repair Commit">
          <SmallHint>
            Mark what happened after you checked the part so the app can document the decision path and commit the repair more cleanly.
          </SmallHint>

          {(() => {
            const payload = buildPartVerificationChecklistItems();
            const selectedPart = String(payload.selectedPart || "").trim();
            const outcomes = [
              "Verified bad",
              "Tested good",
              "Needs more testing",
              "Replaced",
              "Not the cause",
            ];

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
                      Current Part Focus
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {selectedPart || "Choose a part in Part Verification Checklist"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Outcome
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {selectedVerificationOutcome || "Not selected"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {outcomes.map((outcome) => {
                    const active = selectedVerificationOutcome === outcome;
                    return (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => setSelectedVerificationOutcome(outcome)}
                        style={{
                          padding: "8px 12px",
                          fontWeight: 900,
                          border: "1px solid #cfcfcf",
                          borderRadius: 999,
                          background: active ? "#eef6ff" : "#ffffff",
                          color: "#111",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      >
                        {outcome}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontWeight: 900 }}>Verification Note (optional)</label>
                  <textarea
                    value={verificationOutcomeNote}
                    onChange={(e) => setVerificationOutcomeNote(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: 8 }}
                    placeholder="Example: coil voltage present, contacts burnt, replaced contactor and rechecked operation"
                  />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={applyVerificationOutcomeAndRepairCommit}
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
                    Apply Verification Outcome
                  </button>
                </div>

                {verificationOutcomeMessage ? (
                  <SmallHint>
                    <b>Verification Outcome:</b> {verificationOutcomeMessage}
                  </SmallHint>
                ) : null}
              </div>
            );
          })()}
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
          <div style={{ fontWeight: 900, fontSize: 16 }}>Step 2B — Quick Measurements / Observations</div>
          <SmallHint>
            Add the first key reading(s) here before going deeper into diagnosis.
          </SmallHint>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <label style={{ fontWeight: 900 }}>Label</label>
              <input
                value={obsLabel}
                onChange={(e) => setObsLabel(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Value</label>
              <input
                value={obsValue}
                onChange={(e) => setObsValue(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Unit</label>
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
              <label style={{ fontWeight: 900 }}>Note (optional)</label>
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
              Auto-convert (kPa→psi, °C→°F, Pa→inWC)
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
                Add Measurement
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
                Observations Entered: {Array.isArray(observations) ? observations.length : 0}
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
      <SectionCard title="Measurements / Observations" id="measurements">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(

  equipmentType.toLowerCase().includes("ice machine")
    ? iceMachinePresets
    : equipmentType.toLowerCase().includes("cooler") ||
      equipmentType.toLowerCase().includes("freezer") ||
      equipmentType.toLowerCase().includes("merchandiser")
    ? refrigerationPresets
    : equipmentType.toLowerCase().includes("mini-split")
    ? miniSplitPresets
    : symptom.toLowerCase().includes("heat")
    ? heatingPresets
    : coolingPresets
).map((p) => (
              <PillButton
                key={p.label}
                text={p.label}
                onClick={() => applyPreset(p.label, p.unit)}
              />
            ))}
            {measurementOptions.map((m) => (
              <PillButton
                key={m}
                text={m}
                onClick={() => applyPreset(m, guessDefaultUnit(m))}
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
                onChange={(e) => setObsLabel(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Value</label>
              <input
                value={obsValue}
                onChange={(e) => setObsValue(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 900 }}>Unit</label>
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

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            <div>
              <label style={{ fontWeight: 900 }}>Note (optional)</label>
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
              Auto-convert (kPa→psi, °C→°F, Pa→inWC)
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={addMeasurement} style={{
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
                onClick={() => setObservations([])}
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
                    <button onClick={() => removeObservation(idx)} style={{ fontWeight: 900 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <SmallHint>No measurements added yet.</SmallHint>
            )}
          </div>
        </SectionCard>

<SectionCard title="Parts & Manuals Assist" id="parts-manuals">
            {(() => {
              const baseUnitQuery = [manufacturer, model, equipmentType]
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

              const cleanedSymptom = String(symptom || "").trim();

              const causeCounts = unitServiceTimeline.reduce<Record<string, number>>((acc, event) => {
                const key = String(event.final_confirmed_cause || "").trim();
                if (key) acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {});

              const fixCounts = unitServiceTimeline.reduce<Record<string, number>>((acc, event) => {
                const key = String(
                  event.parts_replaced || event.actual_fix_performed || ""
                ).trim();
                if (key) acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {});

              const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0];
              const topFix = Object.entries(fixCounts).sort((a, b) => b[1] - a[1])[0];

              const manualSearchQuery = `${baseUnitQuery} service manual pdf`
                .replace(/\s+/g, " ")
                .trim();

              const broadPartsSearchQuery = `${baseUnitQuery} ${cleanedSymptom || "parts"}`
                .replace(/\s+/g, " ")
                .trim();

              const historyAwarePartsSearchQuery = `${baseUnitQuery} ${topCause?.[0] || topFix?.[0] || cleanedSymptom || "parts"}`
                .replace(/\s+/g, " ")
                .trim();

              const likelyCheck = topCause?.[0] || topFix?.[0] || cleanedSymptom || "-";

              const partCounts = unitServiceTimeline.reduce<Record<string, number>>((acc, event) => {
                const raw = String(
                  event.parts_replaced || event.actual_fix_performed || ""
                ).trim();

                if (!raw) return acc;

                raw
                  .split(/,|\/|;|\band\b/gi)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .forEach((part) => {
                    acc[part] = (acc[part] || 0) + 1;
                  });

                return acc;
              }, {});

              const historyTopParts = Object.entries(partCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([name]) => name);

              const inferLikelyParts = (value: string) => {
                const v = String(value || "").toLowerCase();
                const out: string[] = [];

                if (v.includes("capacitor")) out.push("Capacitor");
                if (v.includes("contactor")) out.push("Contactor");
                if (v.includes("motor") || v.includes("blower") || v.includes("fan")) out.push("Motor");
                if (v.includes("compressor")) out.push("Compressor");
                if (v.includes("refrigerant") || v.includes("low charge") || v.includes("low temp")) out.push("Refrigerant Circuit");
                if (v.includes("drier") || v.includes("filter")) out.push("Filter/Drier");
                if (v.includes("sensor")) out.push("Sensor");
                if (v.includes("control") || v.includes("board")) out.push("Control Board");
                if (v.includes("drain") || v.includes("water leak") || v.includes("float")) out.push("Drain / Float Switch");
                if (v.includes("txv")) out.push("TXV");

                return out;
              };

              const suggestedParts = Array.from(
                new Set([
                  ...historyTopParts,
                  ...inferLikelyParts(topCause?.[0] || ""),
                  ...inferLikelyParts(topFix?.[0] || ""),
                  ...inferLikelyParts(cleanedSymptom || ""),
                ])
              ).slice(0, 6);

              return !baseUnitQuery ? (
                <SmallHint>
                  Enter manufacturer, model, and equipment type to improve manual and parts suggestions.
                </SmallHint>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <b>Manual Search:</b> {manualSearchQuery || "-"}
                    </div>
                    <div>
                      <b>Current Symptom Search:</b> {broadPartsSearchQuery || "-"}
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fafafa",
                    }}
                  >
                    <SmallHint>
                      <b>History hint:</b> Based on this unit’s saved history, start by checking{" "}
                      <b>{likelyCheck}</b>.
                    </SmallHint>
                  </div>

                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>History-Based Likely Parts</div>

                    {suggestedParts.length ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {suggestedParts.map((part) => (
                          <span
                            key={part}
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
                            {part}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <SmallHint>No likely parts yet. Add more history or a symptom to improve suggestions.</SmallHint>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(manualSearchQuery)}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
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
                      Open Manual Search
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(broadPartsSearchQuery)}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
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
                      Open Broad Parts Search
                    </button>

                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(historyAwarePartsSearchQuery)}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
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
                      Open History-Aware Parts Search
                    </button>
                  </div>
                </div>
              );
            })()}
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
          title="Gauge Photo Reader"
          right={<PillButton text="Choose gauge photo" onClick={() => gaugeInputRef.current?.click()} />}
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
                  text={gaugeBusy ? "Reading..." : "Read Gauges"}
                  onClick={analyzeGaugePhoto}
                  disabled={gaugeBusy}
                />
                <PillButton
                  text="Clear"
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
                    Gauge Read
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
                      <b>Suction:</b>{" "}
                      {gaugeRead.suction_psi !== null ? `${gaugeRead.suction_psi} psi` : "—"}
                    </div>
                    <div>
                      <b>Head:</b>{" "}
                      {gaugeRead.head_psi !== null ? `${gaugeRead.head_psi} psi` : "—"}
                    </div>
                    <div>
                      <b>Low Sat:</b>{" "}
                      {gaugeRead.low_sat_f !== null ? `${gaugeRead.low_sat_f} °F` : "—"}
                    </div>
                    <div>
                      <b>High Sat:</b>{" "}
                      {gaugeRead.high_sat_f !== null ? `${gaugeRead.high_sat_f} °F` : "—"}
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 900 }}>Quick diagnosis</div>
                    <SmallHint style={{ marginTop: 4 }}>{gaugeRead.quick_diagnosis}</SmallHint>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 900 }}>Notes</div>
                    <SmallHint style={{ marginTop: 4 }}>{gaugeRead.notes}</SmallHint>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <PillButton
                      text="Add these readings to measurements"
                      onClick={addGaugeReadingsToMeasurements}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <SmallHint>
              Upload a clear photo of the gauge set. The app will try to read low side,
              high side, and saturation temps.
            </SmallHint>
          )}
        </SectionCard>

        <SectionCard title="PT Chart Intelligence + Charge Diagnosis">
          <SmallHint>
            If saturation temps are not entered, the app will estimate them from pressure
            and refrigerant type using a PT chart approximation.
          </SmallHint>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Delta-T</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {chargeAnalysis.deltaT !== null ? `${chargeAnalysis.deltaT}°F` : "—"}
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Superheat</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {chargeAnalysis.superheat !== null ? `${chargeAnalysis.superheat}°F` : "—"}
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Subcool</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {chargeAnalysis.subcool !== null ? `${chargeAnalysis.subcool}°F` : "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 10,
            }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>
                Evap Saturation
                <Badge text={chargeAnalysis.evapSatSource} />
              </div>
              <div style={{ marginTop: 6 }}>
                {chargeAnalysis.evapSat !== null ? `${chargeAnalysis.evapSat}°F` : "—"}
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>
                Condensing Saturation
                <Badge text={chargeAnalysis.condSatSource} />
              </div>
              <div style={{ marginTop: 6 }}>
                {chargeAnalysis.condSat !== null ? `${chargeAnalysis.condSat}°F` : "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>Charge Condition</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
              {chargeAnalysis.summary}
            </div>
            {chargeAnalysis.findings.length ? (
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {chargeAnalysis.findings.map((f, i) => (
                  <li key={i}>
                    <SmallHint>{f}</SmallHint>
                  </li>
                ))}
              </ul>
            ) : (
              <SmallHint style={{ marginTop: 8 }}>
                Add more refrigeration readings to tighten the diagnosis.
              </SmallHint>
            )}
          </div>
        </SectionCard>
      </div>

           <div style={{ marginTop: 16 }}>
        <SectionCard title="Airflow Intelligence">
          <SmallHint>
            Add return static, supply static, filter pressure drop, and coil pressure drop
            to diagnose airflow restrictions.
          </SmallHint>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginTop: 12,
            }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Total External Static</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {airflowAnalysis.totalExternalStatic !== null
                  ? `${airflowAnalysis.totalExternalStatic} inWC`
                  : "—"}
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Return Static</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {airflowAnalysis.returnStatic !== null
                  ? `${airflowAnalysis.returnStatic} inWC`
                  : "—"}
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Supply Static</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                {airflowAnalysis.supplyStatic !== null
                  ? `${airflowAnalysis.supplyStatic} inWC`
                  : "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 10,
            }}
          >
            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Filter Drop</div>
              <div style={{ marginTop: 6 }}>
                {airflowAnalysis.filterDrop !== null
                  ? `${airflowAnalysis.filterDrop} inWC`
                  : "—"}
              </div>
            </div>

            <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
              <div style={{ fontWeight: 900 }}>Coil Drop</div>
              <div style={{ marginTop: 6 }}>
                {airflowAnalysis.coilDrop !== null
                  ? `${airflowAnalysis.coilDrop} inWC`
                  : "—"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>Airflow Summary</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
              {airflowAnalysis.summary}
            </div>
            {airflowAnalysis.findings.length ? (
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {airflowAnalysis.findings.map((f, i) => (
                  <li key={i}>
                    <SmallHint>{f}</SmallHint>
                  </li>
                ))}
              </ul>
            ) : (
              <SmallHint style={{ marginTop: 8 }}>
                Add static readings to identify filter, coil, blower, or duct restrictions.
              </SmallHint>
            )}
          </div>
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

        <div style={{ marginTop: 16 }}>
  <SectionCard title="Defrost Intelligence">
    <SmallHint>
      Uses defrost timer state, heater amps, termination state, box temp, and coil temp
      to spot refrigeration defrost problems.
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
      <div style={{ fontWeight: 900 }}>Defrost Summary</div>
      <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
        {defrostAnalysis.summary}
      </div>

      {defrostAnalysis.findings.length ? (
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {defrostAnalysis.findings.map((f, i) => (
            <li key={i}>
              <SmallHint>{f}</SmallHint>
            </li>
          ))}
        </ul>
      ) : (
        <SmallHint style={{ marginTop: 8 }}>
          Add defrost timer state, heater amps, termination stat state, box temp,
          and evap coil temp for tighter refrigeration diagnosis.
        </SmallHint>
      )}
    </div>
  </SectionCard>
</div>

<div style={{ marginTop: 16 }}>
  <SectionCard title="Defrost Repair Guidance">
    <SmallHint>
      Shows likely failed parts, why they are suspect, and the next field check to perform.
    </SmallHint>

    {defrostRepairGuidance.length ? (
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {defrostRepairGuidance.map((item, idx) => (
          <div
            key={`${item.part}-${idx}`}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              {item.part}
              <Badge text={item.priority} />
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 900 }}>Why it is suspect</div>
              <SmallHint style={{ marginTop: 4 }}>{item.why}</SmallHint>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 900 }}>Next test</div>
              <SmallHint style={{ marginTop: 4 }}>{item.nextTest}</SmallHint>
            </div>

            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 900 }}>Quick field check</div>
              <SmallHint style={{ marginTop: 4 }}>{item.quickCheck}</SmallHint>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div
        style={{
          marginTop: 12,
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 10,
          background: "#fafafa",
        }}
      >
        <SmallHint>
          Add defrost-related measurements or enter a refrigeration icing / defrost complaint
          to generate repair guidance.
        </SmallHint>
      </div>
    )}
  </SectionCard>
</div>

   <SectionCard
          title="Photo Diagnosis"
          right={<PillButton text="Choose photo" onClick={() => photoInputRef.current?.click()} />}
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
                  text={photoLoading ? "Analyzing..." : "Analyze Photo"}
                  onClick={analyzePhoto}
                  disabled={photoLoading}
                />
                <PillButton
                  text="Clear"
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
              Upload a photo of a control board, capacitor, contactor, iced coil, wiring,
              gauges, or error code and let the app analyze it.
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
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 3 — Diagnose</div>
          <SmallHint>
            Use these sections to decide what to test next, which parts are really in play, and what still needs to be proven before replacement.
          </SmallHint>
        </div>
      </div>

      {/* AI Diagnosis Assistant */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="🤖 AI Diagnosis Assistant" id="ai-chat">
          <SmallHint>
            Chat with a Claude-powered master technician. Describe symptoms, share readings, and get
            step-by-step guidance tailored to this exact job. Your field readings are automatically included.
          </SmallHint>
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
              {showAiChatBot ? "▲ Hide AI Assistant" : "▼ Open AI Assistant"}
            </button>
            {showAiChatBot && (
              <div style={{ marginTop: 12 }}>
                <AiChatBot
                  equipmentType={equipmentType}
                  manufacturer={manufacturer}
                  model={model}
                  refrigerantType={refrigerantType}
                  symptom={symptom}
                  propertyType={propertyType}
                  observations={observations}
                />
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* HVAC Calculators */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="🧮 HVAC Calculators" id="calculators">
          <SmallHint>
            Offline-capable calculators: PT chart lookup, superheat/subcooling, delta-T, CFM, Ohm's law,
            capacitor MFD check, and gas heat rise. Works without internet.
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
              {showHvacCalculators ? "▲ Hide Calculators" : "▼ Open Calculators"}
            </button>
            {showHvacCalculators && (
              <div style={{ marginTop: 12 }}>
                <HvacCalculators />
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      

{/* repair-decision-panel-v2 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Repair Decision Panel" id="repair">
          <SmallHint>
            Helps move from diagnosis into a smarter repair decision by showing likely parts to verify,
            why they are in play, what to prove first, and the callback risk if replaced blindly.
          </SmallHint>

          {(() => {
            const decisions = buildRepairDecisionPanelItems();
            const targetComponent = getCurrentAffectedComponentLabelForAssist();
            const sameComponentHistory = getSameComponentHistoryForTroubleshooting();

            if (!decisions.length) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>No repair decision items were generated yet. Add symptom, component, or readings to tighten the panel.</SmallHint>
                </div>
              );
            }

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
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetComponent || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Symptom
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {decisions.map((item, idx) => (
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
                          Decision {idx + 1}: {item.part}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setPartsReplaced((prev) =>
                              [String(prev || "").trim(), item.part].filter(Boolean).join(", ")
                            )
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
                          Add Part Name to Parts Replaced
                        </button>
                      </div>

                      <SmallHint><b>Why this is in play:</b> {item.why}</SmallHint>
                      <SmallHint><b>Verify before replacing:</b> {item.verifyFirst}</SmallHint>
                      <SmallHint><b>Blind replace risk:</b> {item.blindRisk}</SmallHint>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* guided-next-test-engine-v2 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Guided Next-Test Engine">
          <SmallHint>
            Uses the selected affected component, current symptom, and same-component history to suggest
            the next field checks instead of making the tech guess.
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
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetComponent || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Symptom
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History
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
                    <div style={{ fontWeight: 900 }}>Pattern Warnings</div>
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
                        Test {idx + 1}: {test.title}
                      </div>

                      <SmallHint><b>Tool:</b> {test.tool}</SmallHint>
                      <SmallHint><b>Why:</b> {test.why}</SmallHint>
                      <SmallHint><b>What to do:</b> {test.how}</SmallHint>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

        <div style={{ marginTop: 16 }}>
        <SectionCard title="Suggested Parts to Verify Before Replacing">
          <SmallHint>
            Ranks suggested parts by confidence so the tech can verify the strongest repair path before making a blind swap.
          </SmallHint>

          {(() => {
            const items = buildSuggestedPartsToVerifyItems();

            if (!items.length) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>No suggested parts are ready yet. Add component, symptom, or readings to tighten the list.</SmallHint>
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
                        Part {idx + 1}: {item.part}
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
                        {item.confidence}
                      </div>
                    </div>

                    <div>
                      <SmallHint><b>Why this part is in play:</b></SmallHint>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {item.reasons.map((reason, reasonIdx) => (
                          <li key={reasonIdx}>
                            <SmallHint>{reason}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <SmallHint><b>Prove before replacing:</b></SmallHint>
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {item.prove.map((entry, proveIdx) => (
                          <li key={proveIdx}>
                            <SmallHint>{entry}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <SmallHint><b>Blind replace risk:</b> {item.blindRisk}</SmallHint>

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
                        Add Part Name to Parts Replaced
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </SectionCard>
      </div>

                  {/* selected-part-manuals-focus-assist-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Selected Part → Manual / Parts Focus Assist">
          <SmallHint>
            Uses the selected part to point the tech toward the right manual section, parts category, and side of the system.
          </SmallHint>

          {(() => {
            const assist = buildSelectedPartManualsFocusAssist();

            if (!assist.selectedPart) {
              return (
                <div style={{ marginTop: 12 }}>
                  <SmallHint>Select a part in Part Verification Checklist first.</SmallHint>
                </div>
              );
            }

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
                      Selected Part
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.selectedPart}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Model Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.modelContext || "Use current make/model"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Manual Section Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.manualFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Parts Category Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.partsFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>System Side Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.sideFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Warnings</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.warnings.length ? (
                        assist.warnings.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))
                      ) : (
                        <li>
                          <SmallHint>No special focus warnings.</SmallHint>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* tighter-parts-manuals-assist-v3 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Tighter Parts & Manuals Assist">
          <SmallHint>
            Uses the selected component, equipment type, symptom, and photo subject to keep manuals and parts lookup on the right side of the system.
          </SmallHint>

          {(() => {
            const assist = buildTighterPartsManualsAssist();

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
                      Model Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.modelContext || "Use current make/model fields"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.targetComponent || "Primary component"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Photo Subject
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {assist.photoSubjectLabel}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Manual Section Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.manualSections.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Parts Category Focus</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.partsFocus.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Lookup Bias</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.lookupBiases.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <div style={{ fontWeight: 900 }}>Keep These Boundaries</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {assist.boundaries.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* targeted-parts-manuals-assist-v2 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Targeted Parts & Manuals Assist v2">
          <SmallHint>
            Focuses the tech on the exact component, the right make/model context, likely part bucket,
            what to verify before replacing, and what manual/wiring section to open first.
          </SmallHint>

          {(() => {
            const target = getTargetedComponentRecordForAssist();
            const likelyParts = getTargetedLikelyPartsV2();
            const manualQueries = getTargetedManualQueriesV2();
            const verifyChecklist = getTargetedVerifyChecklistV2();
            const historyBias = getTargetedHistoryBiasV2();
            const targetMakeModel = [target.manufacturer, target.model].filter(Boolean).join(" ").trim();

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
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{target.label || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Target Make / Model
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{targetMakeModel || "Use exact tag/manual when available"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Tag / Serial Context
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {[target.tag, target.serial].filter(Boolean).join(" • ") || "-"}
                    </div>
                  </div>
                </div>

                {systemType !== "single" && !affectedComponentLabel ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fff8e8",
                    }}
                  >
                    <SmallHint>
                      Select an affected component to tighten the target make/model and parts/manuals suggestions.
                    </SmallHint>
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Likely Part Bucket</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {likelyParts.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Open These Manuals / Pages First</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {manualQueries.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Verify Before Replacing</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {verifyChecklist.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>History Bias</div>
                    {historyBias.length ? (
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {historyBias.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <SmallHint style={{ marginTop: 8 }}>
                        No component-specific history bias yet.
                      </SmallHint>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* component-aware-troubleshooting-hints-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Component-Aware Troubleshooting Hints">
          <SmallHint>
            Uses the selected affected component, same-component history, callbacks, and current symptom
            to point you toward the next checks for this exact part of the system.
          </SmallHint>

          {(() => {
            const componentLabel = getCurrentAffectedComponentLabelForAssist();
            const hints = getComponentAwareTroubleshootingHints();
            const warningSignals = getComponentAwareWarningSignals();
            const sameComponentHistory = getSameComponentHistoryForTroubleshooting();

            return (
              <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Troubleshooting Target
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{componentLabel || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Symptom
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{symptom || "—"}</div>
                  </div>
                </div>

                {systemType !== "single" && !affectedComponentLabel ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fff8e8",
                      fontWeight: 700,
                    }}
                  >
                    Select an affected component to tighten the troubleshooting hints for this system.
                  </div>
                ) : null}

                {warningSignals.length ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fff8e8",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Warning Signals</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {warningSignals.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                  <div style={{ fontWeight: 900 }}>What to Check Next on This Component</div>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {hints.map((item, idx) => (
                      <li key={idx}>
                        <SmallHint>{item}</SmallHint>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>

{/* component-aware-parts-manuals-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Component-Aware Parts & Manuals Target">
          <SmallHint>
            Uses the selected affected component, system structure, symptom, and same-component history
            to point you toward the most likely parts and the most useful manuals / info to open first.
          </SmallHint>

          {(() => {
            const componentLabel = getCurrentAffectedComponentLabelForAssist();
            const sameComponentHistory = getSameComponentHistoryForAssist();
            const likelyParts = getComponentAwareLikelyParts();
            const verifyFirst = getComponentAwareVerifyFirst();
            const manualTargets = getComponentAwareManualTargets();
            const priorParts = getRecentSameComponentPartsForAssist();
            const recentFix = getMostRecentSameComponentFixForAssist();

            return (
              <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Target Component
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{componentLabel || "Primary component"}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Same-Component History Count
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{sameComponentHistory.length}</div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Recent Same-Component Fix
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>{recentFix || "—"}</div>
                  </div>
                </div>

                {systemType !== "single" && !affectedComponentLabel ? (
                  <div
                    style={{
                      border: "1px solid #f0c36d",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fff8e8",
                      fontWeight: 700,
                    }}
                  >
                    Select an affected component to tighten the parts/manuals targeting for this system.
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Likely Parts for This Component</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {likelyParts.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Verify First Before Replacing</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {verifyFirst.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Manuals / Info to Open First</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      {manualTargets.map((item, idx) => (
                        <li key={idx}>
                          <SmallHint>{item}</SmallHint>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {priorParts.length ? (
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900 }}>Recent Same-Component Parts History</div>
                    <SmallHint style={{ marginTop: 6 }}>
                      {priorParts.join(" • ")}
                    </SmallHint>
                  </div>
                ) : null}
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
          <div style={{ fontWeight: 900, fontSize: 18 }}>Step 6 — Advanced / Optional</div>
          <SmallHint>
            These sections are useful, but they are not the main live-call path. Use them when you need extra intelligence or deeper context.
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
            Failure Intelligence Dashboard
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
            {showFailureDashboard ? "Hide Dashboard" : "Open Dashboard"}
          </button>
        </div>

        {showFailureDashboard ? (
          <SectionCard title="Failure Intelligence Dashboard">
            <SmallHint>
              Company-wide pattern view across saved service history. Shows callback hotspots, repeat symptoms,
              common cause/fix combinations, and the components getting hit most often.
            </SmallHint>

            {failureDashboardLoading ? (
              <div style={{ marginTop: 12 }}>
                <SmallHint>Loading failure intelligence...</SmallHint>
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
                    <SmallHint>No service event history found yet.</SmallHint>
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
                    <SmallHint style={{ marginTop: 8 }}>No data yet.</SmallHint>
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
                        Total Service Events
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>{data.totalEvents}</div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Callback Events
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>{data.callbackEvents}</div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Top Failing Component
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {data.topComponents.length ? data.topComponents[0][0] : "-"}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Top Repeat Site
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
                      Refresh Dashboard
                    </button>

                    <SmallHint>
                      Last refreshed:{" "}
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
                    {renderList("Top Failing Components", data.topComponents)}
                    {renderList("Callback Hotspots", data.topCallbackComponents)}
                    {renderList("Top Equipment Types", data.topEquipmentTypes)}
                    {renderList("Top Repeat Sites", data.topSites)}
                    {renderList("Top Repeat Symptoms", data.topSymptoms)}
                    {renderList("Top Cause / Fix Combinations", data.topCauseFixes)}
                    {renderList("Most Replaced Parts", data.topParts)}
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
  const __healthResult = calcSystemHealthScore(unitServiceTimeline);
  return (
    <div style={{ marginBottom: 16 }}>
      <SystemHealthScore
        result={__healthResult}
        unitName={undefined}
      />
    </div>
  );
})()}
<SectionCard title="Unit Service Timeline">
    <SmallHint>
      Shows prior service events for the currently loaded unit.
    </SmallHint>

    {unitServiceTimelineLoading ? (
      <div style={{ marginTop: 12 }}>
        <SmallHint>Loading service timeline...</SmallHint>
      </div>
    ) : unitServiceTimeline.length ? (
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {(() => {
          const __options = getTimelineComponentFilterOptions(unitServiceTimeline);
          const __activeFilter = __options.some((option) => option.value === unitTimelineComponentFilter)
            ? unitTimelineComponentFilter
            : "all";
          const __filteredEvents = unitServiceTimeline.filter((event) =>
            timelineEventMatchesComponentFilter(event, __activeFilter)
          );

          return (
            <>
              <div style={{ marginBottom: 10, display: "grid", gap: 6 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontWeight: 900 }}>Filter Timeline by Component</span>
                  <select
                    value={__activeFilter}
                    onChange={(e) => setUnitTimelineComponentFilter(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {__options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {__filteredEvents.length ? (
                __filteredEvents.map((event) => (
          <div
            key={event.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 10,
              background: "#fafafa",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              {event.service_date
                ? new Date(event.service_date).toLocaleDateString()
                : "Unknown service date"}
            </div>

            <div style={{ marginTop: 8 }}>
              <SmallHint><b>Symptom:</b> {event.symptom || "-"}</SmallHint>
            </div>

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Diagnosis:</b> {event.diagnosis_summary || "-"}</SmallHint>
            </div>

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Confirmed Cause:</b> {event.final_confirmed_cause || "-"}</SmallHint>
            </div>

            {getAffectedComponentDisplayForEvent(event) ? (
              <div style={{ marginTop: 4 }}>
                <SmallHint>
                  {/* affected-component-display-v1 */ /* component-filter-ui-current-timeline-v1 */}
                  <b>Affected Component:</b> {getAffectedComponentDisplayForEvent(event)}
                </SmallHint>
              </div>
            ) : null}

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Parts Replaced:</b> {event.parts_replaced || "-"}</SmallHint>
            </div>

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Actual Fix:</b> {event.actual_fix_performed || "-"}</SmallHint>
            </div>

            <div style={{ marginTop: 4 }}>
              <SmallHint>
                <b>Outcome:</b> {event.outcome_status || "-"} • <b>Callback:</b> {event.callback_occurred || "-"}
              </SmallHint>
            </div>

            <div style={{ marginTop: 4 }}>
              <SmallHint><b>Notes:</b> {event.tech_closeout_notes || "-"}</SmallHint>

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => loadServiceEventIntoForm(event)}
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
                  Edit Event
                </button>
              </div>
            </div>
          </div>
                ))
              ) : (
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 10,
                    background: "#fafafa",
                  }}
                >
                  <SmallHint>No service events match the selected component filter.</SmallHint>
                </div>
              )}
            </>
          );
        })()}
      </div>
    ) : (
      <div style={{ marginTop: 12 }}>
        <SmallHint>
          {unitServiceTimelineMessage || "Load a saved unit to view its service timeline."}
        </SmallHint>
      </div>
    )}
  </SectionCard>
</div>
      <div style={{ marginTop: 16, display: showSavedUnitHistory ? "block" : "none" }}>

        <SectionCard title="Saved Unit History" id="unit-library" right={<Badge text={`${savedUnits.length} saved`} />}>
          <input
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            placeholder="Search customer, site, model, symptom..."
            style={{ width: "100%", padding: 8 }}
          />

          <div
            style={{
              marginTop: 10,
              display: "grid",
              gap: 8,
              maxHeight: 320,
              overflow: "auto",
            }}
          >
            {filteredSavedUnits.length ? (
              filteredSavedUnits.map((u) => (
                <div
                  key={u.id}
                  style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}
                >
                  <div style={{ fontWeight: 900 }}>
                    {u.customerName || "No Customer"}
                    {u.companyName ? <Badge text={u.companyName} /> : null}
                    {u.unitNickname ? <Badge text={u.unitNickname} /> : null}
                  </div>
                  <SmallHint style={{ marginTop: 4 }}>
                    {u.siteName || "-"} • {u.manufacturer || "-"} {u.model || "-"} •{" "}
                    {u.equipmentType || "-"}
                  </SmallHint>
                  <SmallHint style={{ marginTop: 4 }}>
                    Saved: {new Date(u.savedAt).toLocaleString()}
                  </SmallHint>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                    <PillButton text="Load" onClick={() => loadUnit(u)} />
                    <PillButton text="Delete" onClick={() => removeSavedUnit(u.id)} />
                  </div>
                </div>
              ))
            ) : (
              <SmallHint>No saved units yet.</SmallHint>
            )}
          </div>
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
            <label style={{ fontWeight: 900 }}>Property Type</label>
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
            <label style={{ fontWeight: 900 }}>Equipment Type</label>
            <br />
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              <option>RTU</option>
              <option>Split System</option>
              <option>Heat Pump</option>
              <option>Furnace</option>
              <option>Mini-Split</option>
              <option>Boiler</option>
              <option>Chiller</option>
              <option>Make-Up Air Unit</option>
              <option>Ice Machine</option>
              <option>Walk-In Cooler</option>
              <option>Walk-In Freezer</option>
              <option>Reach-In Cooler</option>
              <option>Reach-In Freezer</option>
              <option>Merchandiser</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Manufacturer</label>
            <br />
            <input
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 900 }}>Model (optional)</label>
            <br />
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
  <label style={{ fontWeight: 900 }}>Serial Number</label>
  <br />
  <input
    value={serialNumber}
    onChange={(e) => setSerialNumber(e.target.value)}
    placeholder="Example: S12345AB789"
    style={{ width: "100%", padding: 8 }}
  />
</div> 

          <div>
            <label style={{ fontWeight: 900 }}>Refrigerant Type</label>
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
              <div style={{ fontWeight: 900, fontSize: 18 }}>Step 1 — Identify Equipment</div>
              <SmallHint>
                Fill out the site, unit tag, property type, and equipment type first so the rest of the call stays tied to the right machine.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Customer Name</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Site Name</label>
                  <input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Site Address</label>
                  <input
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Unit Nickname / Tag</label>
                  <input
                    value={unitNickname}
                    onChange={(e) => setUnitNickname(e.target.value)}
                    placeholder="RTU-1, WIC-1, AHU-2, Circuit A"
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Residential">Residential</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Equipment Type</label>
                  <select
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    {unitOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>


          
          {/* top-site-units-block-v1 */}
          <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
            <SectionCard title="Site Units at This Location">
              {!customerName.trim() || !siteName.trim() ? (
                <SmallHint>
                  Enter customer and site to see other units already saved at this location.
                </SmallHint>
              ) : !siteUnitsAtLocation.length ? (
                <SmallHint>
                  No saved units found yet for this customer/site.
                </SmallHint>
              ) : (
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
                        <PillButton text="Load This Unit" onClick={() => loadUnit(unit)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div style={{ fontWeight: 900, fontSize: 16 }}>Step 1B — Equipment Details</div>
              <SmallHint>
                Fill in the make, model, serial, and refrigerant early so diagnosis, manuals, and parts guidance stay tied to the correct equipment.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Manufacturer</label>
                  <input
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Model</label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Serial Number</label>
                  <input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Refrigerant Type</label>
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
          title="Nameplate Photo Reader"
          right={<PillButton text="Choose photo" onClick={() => fileInputRef.current?.click()} />}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await onPickNameplateFile(f);
            }}
          />

          {nameplateImage ? (
            <div style={{ display: "grid", gap: 10 }}>
              <img
                src={nameplateImage}
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
                  text={nameplateBusy ? "Reading..." : "Read nameplate"}
                  onClick={parseNameplate}
                  disabled={nameplateBusy}
                />
                <PillButton
                  text="Clear"
                  onClick={() => {
                    setNameplateImage("");
                    setNameplate(null);
                    setNameplateErr("");
                  }}
                />
              </div>
              {nameplateErr ? (
                <div style={{ color: "crimson", fontWeight: 800 }}>{nameplateErr}</div>
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
        </SectionCard>

         <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <SectionCard title="Symptom Packs" right={<Badge text={selectedPack.label} />}>
          <SmallHint>Choose a symptom pack to load a tech-style flowchart.</SmallHint>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {SYMPTOM_PACKS.map((pack) => (
              <PillButton
                key={pack.id}
                text={pack.label}
                active={pack.id === selectedPackId}
                onClick={() => selectPack(pack.id)}
              />
            ))}
          </div>
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
              <div style={{ fontWeight: 900, fontSize: 16 }}>Step 2 — Complaint + Evidence</div>
              <SmallHint>
                Enter the service date and complaint here first. Use the lower troubleshooting sections for deeper guidance.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Service Date</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Affected Component</label>
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
                          <option value="">Select affected component</option>
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
                          {getCurrentAffectedComponentLabelForAssist() || "Select the exact component for this call"}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontWeight: 900 }}>Symptom / Complaint</label>
                  <textarea
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    rows={4}
                    placeholder="Example: not cooling, high head pressure, circuit 2 freezing, repeated defrost issue"
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
              <div style={{ fontWeight: 900, fontSize: 16 }}>Step 2A — Quick Evidence</div>
              <SmallHint>
                Set the photo subject early and quickly confirm whether photos and observations have been added for this call.
              </SmallHint>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontWeight: 900 }}>Photo Subject</label>
                  <select
                    value={photoAssistSubject}
                    onChange={(e) => setPhotoAssistSubject(e.target.value)}
                    style={{ width: "100%", padding: 8 }}
                  >
                    <option value="iced_coil">Iced Coil</option>
                    <option value="contactor_capacitor">Contactor / Capacitor</option>
                    <option value="control_board">Control Board</option>
                    <option value="wiring">Wiring</option>
                    <option value="nameplate_tag">Nameplate / Tag</option>
                    <option value="drain_defrost">Drain / Defrost</option>
                    <option value="dirty_coil_airflow">Dirty Coil / Airflow</option>
                    <option value="compressor_section">Compressor Section</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: 900 }}>Photos Attached</label>
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
                  <label style={{ fontWeight: 900 }}>Observations Entered</label>
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
                    <b>Component:</b> {getCurrentAffectedComponentLabelForAssist() || primaryComponentRole || "Primary component"}
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
            <label style={{ fontWeight: 900 }}>Symptom</label>
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
              {symptomListening ? "Listening..." : "Start Symptom Dictation"}
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
              Stop Dictation
            </button>
          </div>

          {!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {symptomDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Symptom Dictation:</b> {symptomDictationMessage}
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
              {symptomListening ? "Listening..." : "Start Symptom Dictation"}
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
              Stop Dictation
            </button>
          </div>

          {!browserSupportsSymptomDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {symptomDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Symptom Dictation:</b> {symptomDictationMessage}
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
                No Cooling
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
                No Heat
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
                Water Leak
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
                Not Running
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
                Low Temp
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
                High Temp
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
                Noise
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
                Maintenance
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
            {loading ? "Diagnosing..." : "Diagnose"}
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
            Update diagnosis (with measurements)
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
            {mpBusy ? "Finding..." : "Parts & Manuals"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <SectionCard
          title="Service Report Generator"
          right={<PillButton text="Open printable report" onClick={openPrintableReport} />}
        >
          <SmallHint>
            Opens a clean service report in a new tab. From there you can print it or save it as PDF.
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
            <div style={{ fontWeight: 900 }}>Report Preview</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 10,
              }}
            >
              <div><b>Customer:</b> {customerName || "-"}</div>
              <div><b>Company:</b> {unitProfileUnit?.companyName || "-"}</div>
              <div><b>Site:</b> {siteName || "-"}</div>
              <div><b>Address:</b> {siteAddress || "-"}</div>
              <div><b>Unit Tag:</b> {unitNickname || "-"}</div>
              <div><b>Manufacturer:</b> {manufacturer || "-"}</div>
              <div><b>Model:</b> {model || "-"}</div>
              <div><b>Equipment Type:</b> {equipmentType || "-"}</div>
              <div><b>Refrigerant:</b> {refrigerantType || "-"}</div>
            </div>

            <div>
  <label style={{ fontWeight: 900 }}>Error Code (optional)</label>
  <br />
  <input
    value={errorCode}
    onChange={(e) => setErrorCode(e.target.value)}
    placeholder="Example: E1, F2, 3 flashes, P4"
    style={{ width: "100%", padding: 8 }}
  />
</div>

<div>
  <label style={{ fontWeight: 900 }}>Error Code Source</label>
  <br />
  <select
    value={errorCodeSource}
    onChange={(e) => setErrorCodeSource(e.target.value)}
    style={{ width: "100%", padding: 8 }}
  >
    <option>Control Board</option>
    <option>Thermostat</option>
    <option>Indoor Unit</option>
    <option>Outdoor Unit</option>
    <option>Display Panel</option>
    <option>Blink Code</option>
    <option>Unknown</option>
  </select>
</div>

<div style={{ marginTop: 16 }}>
  
<div style={{ marginTop: 16 }}>
  
        <div style={{ marginTop: 16 }}>
          
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Site Units at This Location">
            {!customerName.trim() || !siteName.trim() ? (
              <SmallHint>
                Enter customer and site to see other units already saved at this location.
              </SmallHint>
            ) : !siteUnitsAtLocation.length ? (
              <SmallHint>
                No saved units found yet for this customer/site.
              </SmallHint>
            ) : (
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
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>


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

<SectionCard title="Service Event Photos">
    <button
      onClick={() => setShowServiceEventPhotos((v) => !v)}
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
      {showServiceEventPhotos ? "Hide Photos" : "Show Photos"}
    </button>

    {showServiceEventPhotos ? (
      <div style={{ marginTop: 12 }}>
        <SmallHint>
          Attach field photos to this service event so the next tech can see what happened.
        </SmallHint>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                e.currentTarget.value = "";
                handleUploadServiceEventPhotos(files);
              }}
              style={{ width: "100%" }}
            />
          </div>

          {serviceEventPhotoMessage ? (
            <SmallHint>{serviceEventPhotoMessage}</SmallHint>
          ) : null}

          {serviceEventPhotoBusy ? (
            <SmallHint>Uploading photo(s)...</SmallHint>
          ) : null}

          {serviceEventPhotoUrls.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {serviceEventPhotoUrls.map((url, i) => (
                <div
                  key={url + i}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 8,
                    background: "#fafafa",
                  }}
                >
                  <button
                    onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                    style={{
                      width: "100%",
                      padding: 0,
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                      background: "#fff",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    title="Open full photo"
                  >
                    <img
                      src={url}
                      alt={`Service event photo ${i + 1}`}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "contain",
                        borderRadius: 8,
                        display: "block",
                        background: "#fff",
                      }}
                    />
                  </button>
                  <button
                    onClick={() =>
                      setServiceEventPhotoUrls((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    style={{
                      marginTop: 8,
                      width: "100%",
                      padding: "8px 10px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    Remove Photo
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <SmallHint>No service event photos attached yet.</SmallHint>
          )}
        </div>
      </div>
    ) : (
      <SmallHint style={{ marginTop: 12 }}>
        Hidden by default to keep the main workflow clean.
      </SmallHint>
    )}
  </SectionCard>
</div>

<SectionCard title="Case Outcome / Learning Feedback">
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
          EDITING SAVED EVENT
        </span>
      </div>
    ) : null}
    <SmallHint>
      Use this after the job is diagnosed or completed. This is how the app starts learning what actually fixed the unit.
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
        <label style={{ fontWeight: 900 }}>Final Confirmed Cause</label>
        <br />
        <textarea data-auto-grow="true" onInput={autoGrowTextarea}
          rows={6}
                  style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
                  value={finalConfirmedCause}
          onChange={(e) => setFinalConfirmedCause(e.target.value)}
        ></textarea>

          {/* core-field-dictation-v1-confirmed-cause */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startConfirmedCauseDictation}
              disabled={!browserSupportsFieldDictation() || confirmedCauseListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: confirmedCauseListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor: !browserSupportsFieldDictation() || confirmedCauseListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !browserSupportsFieldDictation() || confirmedCauseListening ? 0.7 : 1,
              }}
            >
              {confirmedCauseListening ? "Listening..." : "Start Confirmed Cause Dictation"}
            </button>

            <button
              type="button"
              onClick={stopConfirmedCauseDictation}
              disabled={!confirmedCauseListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: confirmedCauseListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: confirmedCauseListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {confirmedCauseDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Confirmed Cause Dictation:</b> {confirmedCauseDictationMessage}
            </SmallHint>
          ) : null}


          {/* final-confirmed-cause-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startCauseDictation}
              disabled={!browserSupportsCauseDictation() || causeListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: causeListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsCauseDictation() || causeListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsCauseDictation() || causeListening ? 0.7 : 1,
              }}
            >
              {causeListening ? "Listening..." : "Start Cause Dictation"}
            </button>

            <button
              type="button"
              onClick={stopCauseDictation}
              disabled={!causeListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: causeListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: causeListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsCauseDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {causeDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Cause Dictation:</b> {causeDictationMessage}
            </SmallHint>
          ) : null}


        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setFinalConfirmedCause("Bad Capacitor")}
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
            Bad Capacitor
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Failed Contactor")}
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
            Failed Contactor
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Failed Motor")}
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
            Failed Motor
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Low Refrigerant")}
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
            Low Refrigerant
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Dirty Condenser")}
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
            Dirty Condenser
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Restricted Filter/Drier")}
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
            Restricted Filter/Drier
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Drain Issue")}
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
            Drain Issue
          </button>

          <button
            onClick={() => setFinalConfirmedCause("Sensor / Control Issue")}
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
            Sensor / Control Issue
          </button>
        </div>

        <input
          placeholder="Example: failed dual run capacitor, restricted filter-drier, dirty condenser, bad float switch"
          style={{ width: "100%", padding: 8 }}
        />
      </div>

 <div style={{ gridColumn: "1 / -1" }}>
  <label style={{ fontWeight: 900 }}>Service Date</label>
  <br />
  <input
    type="date"
    value={serviceDate}
    onChange={(e) => setServiceDate(e.target.value)}
    style={{ width: "100%", padding: 8 }}
  />
</div>

<div style={{ gridColumn: "1 / -1" }}>
  <label style={{ fontWeight: 900 }}>Parts Replaced</label>
  <br />
  <input
    value={partsReplaced}
    onChange={(e) => setPartsReplaced(e.target.value)}
    placeholder="Example: dual run capacitor, condenser fan motor, TXV, contactor"
    style={{ width: "100%", padding: 8 }}
  />

          {/* parts-replaced-dictation-only-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startPartsReplacedDictation}
              disabled={!browserSupportsPartsReplacedDictation() || partsReplacedListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: partsReplacedListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsPartsReplacedDictation() || partsReplacedListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsPartsReplacedDictation() || partsReplacedListening ? 0.7 : 1,
              }}
            >
              {partsReplacedListening ? "Listening..." : "Start Parts Replaced Dictation"}
            </button>

            <button
              type="button"
              onClick={stopPartsReplacedDictation}
              disabled={!partsReplacedListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: partsReplacedListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: partsReplacedListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsPartsReplacedDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {partsReplacedDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Parts Replaced Dictation:</b> {partsReplacedDictationMessage}
            </SmallHint>
          ) : null}

          {/* quick-parts-chips-v1 */}
          {(() => {
            const targetComponent = String(getCurrentAffectedComponentLabelForAssist() || "").toLowerCase();
            const equipment = String(equipmentType || "").toLowerCase();
            const issue = String(symptom || "").toLowerCase();

            const suggestedFromRepairPanel =
              typeof buildRepairDecisionPanelItems === "function"
                ? buildRepairDecisionPanelItems().map((item) => item.part)
                : [];

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

            if (!chips.length) return null;

            return (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                <SmallHint>
                  <b>Quick Parts Chips:</b> Tap to add common replacement parts faster.
                </SmallHint>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {chips.slice(0, 10).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
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
                      style={{
                        padding: "6px 10px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 999,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}


          {/* parts-replaced-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startPartsReplacedDictation}
              disabled={!browserSupportsPartsReplacedDictation() || partsReplacedListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: partsReplacedListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsPartsReplacedDictation() || partsReplacedListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsPartsReplacedDictation() || partsReplacedListening ? 0.7 : 1,
              }}
            >
              {partsReplacedListening ? "Listening..." : "Start Parts Dictation"}
            </button>

            <button
              type="button"
              onClick={stopPartsReplacedDictation}
              disabled={!partsReplacedListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: partsReplacedListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: partsReplacedListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsPartsReplacedDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {partsReplacedDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Parts Dictation:</b> {partsReplacedDictationMessage}
            </SmallHint>
          ) : null}

</div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ fontWeight: 900 }}>Actual Fix Performed</label>
        <br />
        <textarea data-auto-grow="true" onInput={autoGrowTextarea}
          rows={6}
                  style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
                  value={actualFixPerformed}
          onChange={(e) => setActualFixPerformed(e.target.value)}
        ></textarea>

          {/* core-field-dictation-v1-actual-fix */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startActualFixDictation}
              disabled={!browserSupportsFieldDictation() || actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: actualFixListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor: !browserSupportsFieldDictation() || actualFixListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !browserSupportsFieldDictation() || actualFixListening ? 0.7 : 1,
              }}
            >
              {actualFixListening ? "Listening..." : "Start Actual Fix Dictation"}
            </button>

            <button
              type="button"
              onClick={stopActualFixDictation}
              disabled={!actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: actualFixListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: actualFixListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {actualFixDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Actual Fix Dictation:</b> {actualFixDictationMessage}
            </SmallHint>
          ) : null}


          {/* actual-fix-performed-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startActualFixDictation}
              disabled={!browserSupportsActualFixDictation() || actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: actualFixListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsActualFixDictation() || actualFixListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsActualFixDictation() || actualFixListening ? 0.7 : 1,
              }}
            >
              {actualFixListening ? "Listening..." : "Start Fix Dictation"}
            </button>

            <button
              type="button"
              onClick={stopActualFixDictation}
              disabled={!actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: actualFixListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: actualFixListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsActualFixDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {actualFixDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Fix Dictation:</b> {actualFixDictationMessage}
            </SmallHint>
          ) : null}


        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setActualFixPerformed("Replaced Capacitor")}
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
            Replaced Capacitor
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Contactor")}
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
            Replaced Contactor
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Motor")}
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
            Replaced Motor
          </button>

          <button
            onClick={() => setActualFixPerformed("Added Refrigerant")}
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
            Added Refrigerant
          </button>

          <button
            onClick={() => setActualFixPerformed("Cleaned Condenser")}
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
            Cleaned Condenser
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Filter/Drier")}
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
            Replaced Filter/Drier
          </button>

          <button
            onClick={() => setActualFixPerformed("Cleared Drain")}
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
            Cleared Drain
          </button>

          <button
            onClick={() => setActualFixPerformed("Replaced Sensor / Control")}
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
            Replaced Sensor / Control
          </button>
        </div>

        <input
          placeholder="Example: replaced 45/5 capacitor, cleaned condenser, replaced water inlet valve"
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div>
        <label style={{ fontWeight: 900 }}>Outcome Status</label>
        <br />
        <select
          value={outcomeStatus}
          onChange={(e) => setOutcomeStatus(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option>Not Set</option>
          <option>Fixed</option>
          <option>Partially Fixed</option>
          <option>Needs More Work</option>
          <option>Monitoring</option>
        </select>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <button
              onClick={() => setOutcomeStatus("Fixed")}
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
              Fixed
            </button>

            <button
              onClick={() => setOutcomeStatus("Needs Follow-Up")}
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
              Needs Follow-Up
            </button>

            <button
              onClick={() => setOutcomeStatus("Partial")}
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
              Partial
            </button>

            <button
              onClick={() => setOutcomeStatus("Not Set")}
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
              Not Set
            </button>
          </div>
      </div>

      <div>
        <label style={{ fontWeight: 900 }}>Callback Occurred</label>
        <br />
        <select
          value={callbackOccurred}
          onChange={(e) => setCallbackOccurred(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option>No</option>
          <option>Yes</option>
        </select>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <button
              onClick={() => setCallbackOccurred("No")}
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
              Callback No
            </button>

            <button
              onClick={() => setCallbackOccurred("Yes")}
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
              Callback Yes
            </button>
          </div>
      </div>

      {equipmentMemory.similarCases.length ? (
  <div style={{ marginTop: 12 }}>
    <div style={{ fontWeight: 900 }}>Similar prior cases</div>
    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
      {equipmentMemory.similarCases.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
          }}
        >
          <SmallHint>
            <b>Saved:</b> {item.savedAt ? new Date(item.savedAt).toLocaleString() : "-"}
          </SmallHint>
          <SmallHint style={{ marginTop: 4 }}>
            <b>Symptom:</b> {item.symptom || "-"}
          </SmallHint>
          <SmallHint style={{ marginTop: 4 }}>
            <b>Confirmed cause:</b> {item.finalConfirmedCause || "-"}
          </SmallHint>
          <SmallHint style={{ marginTop: 4 }}>
            <b>Actual fix:</b> {item.actualFixPerformed || "-"}
          </SmallHint>
          <SmallHint style={{ marginTop: 4 }}>
            <b>Outcome:</b> {item.outcomeStatus || "-"} • <b>Callback:</b> {item.callbackOccurred || "-"}
          </SmallHint>
        </div>
      ))}
    </div>
  </div>
) : null}

      <div style={{ gridColumn: "1 / -1" }}>
                  {/* diagnostic-closeout-builder-v1 */}
          <div
            style={{
              marginTop: 12,
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              background: "#fafafa",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              One-Tap Diagnostic Closeout Builder
            </div>

            <SmallHint>
              Builds a customer-friendly explanation, an internal tech summary, and a follow-up note from the current call data.
            </SmallHint>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                Generate Closeout Drafts
              </button>

              <button
                type="button"
                onClick={pushInternalSummaryToTechCloseoutNotes}
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
                Add Internal Summary to Tech Notes
              </button>
            </div>

            {diagnosticCloseoutMessage ? (
              <SmallHint>
                <b>Closeout Builder:</b> {diagnosticCloseoutMessage}
              </SmallHint>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Customer Summary</div>
                <textarea data-auto-grow="true" onInput={autoGrowTextarea}
                  value={diagnosticCloseoutDrafts.customerSummary}
                  onChange={(e) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      customerSummary: e.target.value,
                    }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8 }}
                />
                <button
                  type="button"
                  onClick={() => void copyDiagnosticCloseoutText("customerSummary")}
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
                  Copy Customer Summary
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Internal Tech Summary</div>
                <textarea data-auto-grow="true" onInput={autoGrowTextarea}
                  value={diagnosticCloseoutDrafts.internalSummary}
                  onChange={(e) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      internalSummary: e.target.value,
                    }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8 }}
                />
                <button
                  type="button"
                  onClick={() => void copyDiagnosticCloseoutText("internalSummary")}
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
                  Copy Internal Summary
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Recommended Follow-Up</div>
                <textarea data-auto-grow="true" onInput={autoGrowTextarea}
                  value={diagnosticCloseoutDrafts.followUp}
                  onChange={(e) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      followUp: e.target.value,
                    }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8 }}
                />

                {/* follow-up-dictation-only-v1 */}
                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={startFollowUpDictation}
                    disabled={!browserSupportsFollowUpDictation() || followUpListening}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: followUpListening ? "#f7f7f7" : "#ffffff",
                      color: "#111",
                      cursor:
                        !browserSupportsFollowUpDictation() || followUpListening
                          ? "not-allowed"
                          : "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity:
                        !browserSupportsFollowUpDictation() || followUpListening ? 0.7 : 1,
                    }}
                  >
                    {followUpListening ? "Listening..." : "Start Follow-Up Dictation"}
                  </button>

                  <button
                    type="button"
                    onClick={stopFollowUpDictation}
                    disabled={!followUpListening}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: followUpListening ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: followUpListening ? 1 : 0.7,
                    }}
                  >
                    Stop Dictation
                  </button>
                </div>

                {!browserSupportsFollowUpDictation() ? (
                  <SmallHint style={{ marginTop: 6 }}>
                    Dictation is not supported in this browser. Try Chrome or Edge.
                  </SmallHint>
                ) : null}

                {followUpDictationMessage ? (
                  <SmallHint style={{ marginTop: 6 }}>
                    <b>Follow-Up Dictation:</b> {followUpDictationMessage}
                  </SmallHint>
                ) : null}

                <button
                  type="button"
                  onClick={() => void copyDiagnosticCloseoutText("followUp")}
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
                  Copy Follow-Up
                </button>
              </div>
            </div>
          </div>

          {/* photo-assist-panel-v1 */}
          <div
            style={{
              marginTop: 12,
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              background: "#fafafa",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              Photo Assist
            </div>

            <SmallHint>
              Use the attached photo plus the current component, symptom, readings, and history to generate
              what the photo should help verify, what to check next, and a closeout note.
            </SmallHint>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                  Attached Photos
                </div>
                <div style={{ marginTop: 4, fontWeight: 700 }}>
                  {Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
                </div>
              </div>

              <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                  Target Component
                </div>
                <div style={{ marginTop: 4, fontWeight: 700 }}>
                  {getCurrentAffectedComponentLabelForAssist() || "Primary component"}
                </div>
              </div>

              <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                  Latest Photo
                </div>
                <div style={{ marginTop: 4, fontWeight: 700 }}>
                  {getLatestServiceEventPhotoUrl() ? "Ready" : "No photo yet"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontWeight: 900 }}>Photo Type</label>
              <select
                value={photoAssistType}
                onChange={(e) => setPhotoAssistType(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="general">General component photo</option>
                <option value="board_wiring">Board / wiring photo</option>
                <option value="ice_pattern">Ice / frost pattern photo</option>
                <option value="coil_condition">Coil condition photo</option>
                <option value="data_plate">Data plate / tag photo</option>
                <option value="failed_part">Failed part photo</option>
              </select>
            </div>

            {getLatestServiceEventPhotoUrl() ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 900 }}>Latest Attached Photo Preview</div>
                <img
                  src={getLatestServiceEventPhotoUrl()}
                  alt="Latest service event photo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 260,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    background: "#fff",
                    padding: 8,
                  }}
                />
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={buildPhotoAssistDraft}
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
                Generate Photo Assist
              </button>

              <button
                type="button"
                onClick={pushPhotoAssistCloseoutToTechNotes}
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
                Add Photo Note to Tech Notes
              </button>
            </div>

            {photoAssistMessage ? (
              <SmallHint>
                <b>Photo Assist:</b> {photoAssistMessage}
              </SmallHint>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>What This Photo Should Help Verify</div>
                <textarea
                  value={photoAssistDraft.summary}
                  onChange={(e) =>
                    setPhotoAssistDraft((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  rows={7}
                  style={{ width: "100%", padding: 8, minHeight: 140, resize: "vertical" }}
                />
                <button
                  type="button"
                  onClick={() => void copyPhotoAssistText("summary")}
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
                  Copy Summary
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>What To Check Next From The Photo</div>
                <textarea
                  value={photoAssistDraft.checks}
                  onChange={(e) =>
                    setPhotoAssistDraft((prev) => ({ ...prev, checks: e.target.value }))
                  }
                  rows={8}
                  style={{ width: "100%", padding: 8, minHeight: 160, resize: "vertical" }}
                />
                <button
                  type="button"
                  onClick={() => void copyPhotoAssistText("checks")}
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
                  Copy Checks
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  background: "#fff",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 900 }}>Suggested Photo Closeout Note</div>
                <textarea
                  value={photoAssistDraft.closeout}
                  onChange={(e) =>
                    setPhotoAssistDraft((prev) => ({ ...prev, closeout: e.target.value }))
                  }
                  rows={7}
                  style={{ width: "100%", padding: 8, minHeight: 140, resize: "vertical" }}
                />
                <button
                  type="button"
                  onClick={() => void copyPhotoAssistText("closeout")}
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
                  Copy Closeout Note
                </button>
              </div>
            </div>
          </div>

          {/* photo-driven-diagnostic-assist-v1 */}
          <div
            style={{
              marginTop: 12,
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              background: "#fafafa",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              Photo-Driven Diagnostic Assist
            </div>

            <SmallHint>
              Choose what the photo is of and the app will turn the current component, symptom, and history into practical inspection guidance.
            </SmallHint>

            {(() => {
              const payload = buildPhotoDrivenDiagnosticAssistPayload();

              return (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Attached Service Event Photos
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {Array.isArray(serviceEventPhotoUrls) ? serviceEventPhotoUrls.length : 0}
                      </div>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fff" }}>
                      <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                        Target Component
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 700 }}>
                        {getCurrentAffectedComponentLabelForAssist() || "Primary component"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <label style={{ fontWeight: 900 }}>What is this photo of?</label>
                    <select
                      value={photoAssistSubject}
                      onChange={(e) => setPhotoAssistSubject(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    >
                      <option value="iced_coil">Iced coil / frost pattern</option>
                      <option value="contactor_capacitor">Contactor / capacitor</option>
                      <option value="control_board">Control board</option>
                      <option value="wiring">Wiring</option>
                      <option value="nameplate_tag">Nameplate / tag</option>
                      <option value="drain_defrost">Drain / defrost issue</option>
                      <option value="dirty_coil_airflow">Dirty coil / airflow issue</option>
                      <option value="compressor_section">Compressor section</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={generatePhotoDrivenDiagnosticAssist}
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
                      Refresh Photo Assist
                    </button>

                    <button
                      type="button"
                      onClick={addPhotoAssistToTechCloseoutNotes}
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
                      Add Photo Assist to Tech Notes
                    </button>
                  </div>

                  {photoAssistMessage ? (
                    <SmallHint>
                      <b>Photo Assist:</b> {photoAssistMessage}
                    </SmallHint>
                  ) : null}

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                    <SmallHint>{payload.summary}</SmallHint>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What to Inspect</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.inspect.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What to Verify Next</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.verifyNext.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Repair Decision Emphasis</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.repairDecisionEmphasis.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Parts to Verify Emphasis</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.partsToVerifyEmphasis.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What This Photo Can Support</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.photoCanSupport.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>What This Photo Cannot Prove</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.photoCannotProve.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Selected Part Tie-In</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.photoPartTieIn.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ fontWeight: 900 }}>Watch-Outs</div>
                      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                        {payload.watchOuts.map((item, idx) => (
                          <li key={idx}>
                            <SmallHint>{item}</SmallHint>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

<label style={{ fontWeight: 900 }}>Tech Closeout Notes</label>
        <br />
        <textarea data-auto-grow="true" onInput={autoGrowTextarea}
          value={techCloseoutNotes}
          onChange={(e) => setTechCloseoutNotes(e.target.value)}
        />

          {/* closeout-note-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startTechCloseoutDictation}
              disabled={!browserSupportsTechCloseoutDictation() || techCloseoutListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: techCloseoutListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsTechCloseoutDictation() || techCloseoutListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsTechCloseoutDictation() || techCloseoutListening ? 0.7 : 1,
              }}
            >
              {techCloseoutListening ? "Listening..." : "Start Note Dictation"}
            </button>

            <button
              type="button"
              onClick={stopTechCloseoutDictation}
              disabled={!techCloseoutListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: techCloseoutListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: techCloseoutListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsTechCloseoutDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {techCloseoutDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Dictation:</b> {techCloseoutDictationMessage}
            </SmallHint>
          ) : null}


        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setTechCloseoutNotes("Verified operation after repair.")}
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
            Verified Operation
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Advised customer of findings and repair performed.")}
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
            Advised Customer
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Recommend follow-up.")}
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
            Recommend Follow-Up
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Monitor unit operation.")}
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
            Monitor Unit
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Temporary repair completed. Return visit may be needed.")}
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
            Temporary Repair
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Parts ordered. Return visit required after parts arrive.")}
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
            Parts Ordered
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Unit operating at departure.")}
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
            Operating At Departure
          </button>

          <button
            onClick={() => setTechCloseoutNotes("Customer declined additional repair at this time.")}
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
            Customer Declined
          </button>
        </div>

        <textarea
          placeholder="What proved the fault, what was replaced/repaired, any notes for the next tech, anything unusual"
          style={{ width: "100%", padding: 8, minHeight: 100 }}
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
    Save Current Call to Timeline
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
                Save & Add Another
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
                  Update Event
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
                  Cancel Edit
                </button>
              ) : null}

  {!currentLoadedUnitId ? (
    <SmallHint>
      Load a unit first or save the unit before saving the current call.
    </SmallHint>
  ) : (
    <SmallHint>
      This will add the current diagnosis/fix/outcome as a service event on the loaded unit.
    </SmallHint>
  )}
</div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>Complaint</div>
              <SmallHint style={{ marginTop: 4 }}>
                {symptom || "No complaint entered yet."}
              </SmallHint>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>Diagnosis Summary</div>
              <SmallHint style={{ marginTop: 4 }}>
                {parsed?.summary || "No AI diagnosis summary available yet."}
              </SmallHint>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>Measurements Included</div>
              <SmallHint style={{ marginTop: 4 }}>
                {observations.length
                  ? `${observations.length} measurement(s) will be included in the report.`
                  : "No measurements added yet."}
              </SmallHint>
            </div>
          </div>
        </SectionCard>
      </div>

      <div style={{ marginTop: 16 }}>
        <SectionCard
          title="Equipment Memory AI"
          right={<Badge text={`${equipmentMemory.relatedCount} prior matches`} />}
        >
          <SmallHint>
            This looks at saved history for matching customer/site/unit/model equipment and suggests what to check first today.
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
            <div style={{ fontWeight: 900 }}>AI Memory Summary</div>
            <div style={{ fontSize: 16, fontWeight: 900, marginTop: 6 }}>
              {equipmentMemory.summary}
            </div>

            {equipmentMemory.repeatedSymptoms.length ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900 }}>Repeated symptoms</div>
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
                <div style={{ fontWeight: 900 }}>Repeated likely causes</div>
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
                <div style={{ fontWeight: 900 }}>Repeated measurement patterns</div>
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
                <div style={{ fontWeight: 900 }}>Suggested first checks today</div>
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
                Save more service history on this unit and this section will get smarter.
              </SmallHint>
            )}
          </div>
        </SectionCard>
      </div>

        <SectionCard title="Real Flowchart Engine">
          <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 900 }}>{currentFlowNode.title}</div>
            <div style={{ marginTop: 6, fontSize: 16 }}>{currentFlowNode.question}</div>
            {currentFlowNode.how ? (
              <SmallHint style={{ marginTop: 8 }}>How: {currentFlowNode.how}</SmallHint>
            ) : null}
            {currentFlowNode.suggestedMeasurement ? (
              <SmallHint style={{ marginTop: 8 }}>
                Suggested next reading: <b>{currentFlowNode.suggestedMeasurement}</b>
              </SmallHint>
            ) : null}

            {!currentFlowNode.terminal ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <PillButton
                  text={currentFlowNode.passLabel || "PASS"}
                  onClick={() => advanceFlow("PASS")}
                />
                <PillButton
                  text={currentFlowNode.failLabel || "FAIL"}
                  onClick={() => advanceFlow("FAIL")}
                />
                <PillButton
                  text="Use suggested reading"
                  onClick={addSuggestedMeasurementFromFlow}
                  disabled={!currentFlowNode.suggestedMeasurement}
                />
                <PillButton
                  text="Reset flow"
                  onClick={() => resetFlowForPack(selectedPackId)}
                />
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <PillButton
                  text="Reset flow"
                  onClick={() => resetFlowForPack(selectedPackId)}
                />
                <PillButton text="Diagnose now" onClick={handleDiagnose} />
              </div>
            )}
          </div>
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
        <SectionCard title="Manuals + Parts Results">
          {mpErr ? (
            <div style={{ color: "crimson", fontWeight: 800 }}>{mpErr}</div>
          ) : null}
          {!manualsParts ? (
            <SmallHint>
              Press “Parts & Manuals” after filling Manufacturer / Model / Symptom.
            </SmallHint>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>{manualsParts.summary}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>Manuals</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                    {manualsParts.manuals.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 10,
                          padding: 10,
                          textDecoration: "none",
                          color: "#111",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{l.title}</div>
                        {l.note ? <SmallHint>{l.note}</SmallHint> : null}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 900 }}>Parts</div>
                  <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                    {manualsParts.parts.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 10,
                          padding: 10,
                          textDecoration: "none",
                          color: "#111",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{l.title}</div>
                        {l.note ? <SmallHint>{l.note}</SmallHint> : null}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>


      </div>

      <div style={{ marginTop: 16 }}>
        {parsed ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SectionCard title="Summary">
              <div style={{ fontWeight: 900 }}>{parsed.summary || "—"}</div>
            </SectionCard>

            <SectionCard title="Likely causes">
              {parsed.likely_causes?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {parsed.likely_causes.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        borderTop: idx ? "1px solid #eee" : "none",
                        paddingTop: idx ? 10 : 0,
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {c.cause || "Cause"}
                        {typeof c.probability_percent === "number" ? (
                          <Badge text={`${c.probability_percent}%`} />
                        ) : null}
                      </div>
                      {typeof c.probability_percent === "number" ? (
                        <ProbBar pct={c.probability_percent} />
                      ) : null}
                      {c.why ? <SmallHint style={{ marginTop: 6 }}>{c.why}</SmallHint> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>No likely causes returned.</SmallHint>
              )}
            </SectionCard>

<SectionCard
  title="Repair Guidance"
  right={
    <div style={{ display: "flex", gap: 8 }}>
      <PillButton
        text="Apprentice"
        active={repairGuidanceMode === "apprentice"}
        onClick={() => setRepairGuidanceMode("apprentice")}
      />
      <PillButton
        text="Experienced"
        active={repairGuidanceMode === "experienced"}
        onClick={() => setRepairGuidanceMode("experienced")}
      />
    </div>
  }
>
  {repairGuidance.length ? (
    <div style={{ display: "grid", gap: 10 }}>
      {repairGuidance.map((item, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 900 }}>
            {item.title}
            {typeof item.confidence === "number" ? (
              <Badge text={`${item.confidence}%`} />
            ) : null}
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Suspected part / system</div>
            <SmallHint style={{ marginTop: 4 }}>{item.suspectedPart}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Why it is suspect</div>
            <SmallHint style={{ marginTop: 4 }}>{item.why}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Confirm with this test</div>
            <SmallHint style={{ marginTop: 4 }}>{item.confirmTest}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Quick field check</div>
            <SmallHint style={{ marginTop: 4 }}>{item.fieldCheck}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Likely fix</div>
            <SmallHint style={{ marginTop: 4 }}>{item.likelyFix}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Common mistake</div>
            <SmallHint style={{ marginTop: 4 }}>{item.commonMistake}</SmallHint>
          </div>

{repairGuidanceMode === "apprentice" ? (
  <>
    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>Tool to use</div>
      <SmallHint style={{ marginTop: 4 }}>{item.toolToUse}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>Expected reading / condition</div>
      <SmallHint style={{ marginTop: 4 }}>{item.expectedReading}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>If test passes</div>
      <SmallHint style={{ marginTop: 4 }}>{item.passInterpretation}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>If test fails</div>
      <SmallHint style={{ marginTop: 4 }}>{item.failInterpretation}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>What to do next if it fails</div>
      <SmallHint style={{ marginTop: 4 }}>{item.nextIfFail}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>Quick field check</div>
      <SmallHint style={{ marginTop: 4 }}>{item.fieldCheck}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>Common mistake</div>
      <SmallHint style={{ marginTop: 4 }}>{item.commonMistake}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>Safety note</div>
      <SmallHint style={{ marginTop: 4 }}>{item.safetyNote}</SmallHint>
    </div>
  </>
) : (
  <>
    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>Tool to use</div>
      <SmallHint style={{ marginTop: 4 }}>{item.toolToUse}</SmallHint>
    </div>

    <div style={{ marginTop: 8 }}>
      <div style={{ fontWeight: 900 }}>What to do next if it fails</div>
      <SmallHint style={{ marginTop: 4 }}>{item.nextIfFail}</SmallHint>
    </div>
  </>
)}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Safety note</div>
            <SmallHint style={{ marginTop: 4 }}>{item.safetyNote}</SmallHint>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <SmallHint>
      Run a diagnosis to generate repair guidance and step-by-step field checks.
    </SmallHint>
  )}
</SectionCard>

<SectionCard title="Recommended Measurements">
  {measurementCoaching.length ? (
    <div style={{ display: "grid", gap: 10 }}>
      {measurementCoaching.map((item, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 900 }}>{item.measurement}</div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Tool to use</div>
            <SmallHint style={{ marginTop: 4 }}>{item.tool}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Where to measure</div>
            <SmallHint style={{ marginTop: 4 }}>{item.whereToMeasure}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>Expected reading / condition</div>
            <SmallHint style={{ marginTop: 4 }}>{item.expectedResult}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>If high</div>
            <SmallHint style={{ marginTop: 4 }}>{item.ifHigh}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>If low</div>
            <SmallHint style={{ marginTop: 4 }}>{item.ifLow}</SmallHint>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 900 }}>What to do next</div>
            <SmallHint style={{ marginTop: 4 }}>{item.nextStep}</SmallHint>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <SmallHint>
      Run a diagnosis to get recommended field measurements and coaching.
    </SmallHint>
  )}
</SectionCard>

<SectionCard title="Error Code Guidance">
  {errorCodeGuidance ? (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 10,
        background: "#fafafa",
      }}
    >
      <div style={{ fontWeight: 900 }}>{errorCodeGuidance.title}</div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>Summary</div>
        <SmallHint style={{ marginTop: 4 }}>{errorCodeGuidance.summary}</SmallHint>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>First checks</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {errorCodeGuidance.firstChecks.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>Warnings</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {errorCodeGuidance.warnings.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 900 }}>What to check next</div>
        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
          {errorCodeGuidance.nextSteps.map((item, idx) => (
            <li key={idx}>
              <SmallHint>{item}</SmallHint>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <SmallHint>
      Enter an error code to generate code-specific guidance.
    </SmallHint>
  )}
</SectionCard>

                    <SectionCard title="Advanced AI Output">
                <button
                  onClick={() => setShowAdvancedAiOutput((v) => !v)}
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
                  {showAdvancedAiOutput
                    ? "Hide Advanced AI Output"
                    : "Show Advanced AI Output"}
                </button>

                {showAdvancedAiOutput ? (
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
              </SectionCard>
            </div>
          ) : (
            <SectionCard title="Advanced AI Output">
              <button
                onClick={() => setShowAdvancedAiOutput((v) => !v)}
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
                {showAdvancedAiOutput
                  ? "Hide Advanced AI Output"
                  : "Show Advanced AI Output"}
              </button>

              {showAdvancedAiOutput ? (
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
            </SectionCard>
          )}
      </div>

      <SectionCard title="Admin / Work Tools">
    <button
      onClick={() => setShowBulkImportTools((v) => !v)}
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
      {showBulkImportTools ? "Hide Bulk Import" : "Show Bulk Import"}
    </button>

    {showBulkImportTools ? (
      <div style={{ marginTop: 12 }}>
        <SmallHint>
          Paste CSV with a header row. Required columns for best matching:
          customer_name,site_name,site_address,unit_nickname,property_type,equipment_type,manufacturer,model,serial,refrigerant_type,service_date,symptom,diagnosis_summary,final_confirmed_cause,parts_replaced,actual_fix_performed,outcome_status,callback_occurred,tech_closeout_notes
        </SmallHint>

        <div style={{ marginTop: 12 }}>
          <textarea
            value={workOrderImportText}
            onChange={(e) => setWorkOrderImportText(e.target.value)}
            placeholder="Paste work-order CSV here..."
            style={{ width: "100%", minHeight: 180, padding: 10 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button
            onClick={previewWorkOrderImport}
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
            Preview Import
          </button>

          <button
            onClick={importWorkOrderRows}
            disabled={workOrderImportLoading || !workOrderImportRows.length}
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
            {workOrderImportLoading ? "Importing..." : "Import Rows"}
          </button>
        </div>

        {workOrderImportMessage ? (
          <div style={{ marginTop: 12 }}>
            <SmallHint>{workOrderImportMessage}</SmallHint>
          </div>
        ) : null}

        {workOrderImportRows.length ? (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {Object.keys(workOrderImportRows[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                        padding: 8,
                        fontSize: 12,
                      }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workOrderImportRows.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(workOrderImportRows[0]).map((key) => (
                      <td
                        key={key}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: 8,
                          fontSize: 12,
                        }}
                      >
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <SmallHint style={{ marginTop: 8 }}>
              Showing first {Math.min(10, workOrderImportRows.length)} row(s) of {workOrderImportRows.length}.
            </SmallHint>
          </div>
        ) : null}

        {workOrderImportResults.length ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900 }}>Import Results</div>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              {workOrderImportResults.map((item, idx) => (
                <li key={idx}>
                  <SmallHint>
                    Row {item.rowNumber}: {item.action} → unit {item.unitId}
                  </SmallHint>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    ) : (
      <SmallHint style={{ marginTop: 12 }}>
        Bulk import is hidden by default to keep the field workflow clean.
      </SmallHint>
    )}
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
          <div style={{ fontSize: 22, fontWeight: 900 }}>Unit Library</div>
          <SmallHint>Search, filter, and load saved units.</SmallHint>
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
          Close
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
          placeholder="Search customer, site, address, tag, model..."
          style={{ width: "100%", padding: 8 }}
        />

        <select
          value={unitLibraryEquipmentType}
          onChange={(e) => setUnitLibraryEquipmentType(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">All Equipment Types</option>
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
          <option value="">All Manufacturers</option>
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
          <option value="">All Models</option>
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
          <option value="">All Companies</option>
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
          Recent
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
          All Units
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
          Reset Filters
        </button>
      </div>

      <div style={{ marginTop: 14 }}>
        <SmallHint>
          Showing {filteredLibraryUnits.length} unit(s) • Mode:{" "}
          {unitLibraryMode === "recent" ? "Recent 25" : "All"}
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
                {u.customerName || "No Customer"}
                {u.unitNickname ? <Badge text={u.unitNickname} /> : null}
              </div>

              <SmallHint style={{ marginTop: 4 }}>
                {u.siteName || "-"} • {u.manufacturer || "-"} {u.model || "-"} •{" "}
                {u.equipmentType || "-"}
              </SmallHint>

              <SmallHint style={{ marginTop: 4 }}>
                Saved: {u.savedAt ? new Date(u.savedAt).toLocaleString() : "-"}
              </SmallHint>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                <PillButton
                  text="View Profile"
                  onClick={() => {
                    setShowUnitLibrary(false);
                    openUnitProfile(u);
                  }}
                />
                <PillButton
                  text="Load"
                  onClick={() => {
                    loadUnit(u);
                    setShowUnitLibrary(false);
                  }}
                />
                <PillButton text="Delete" onClick={() => removeSavedUnit(u.id)} />
              </div>
            </div>
          ))
        ) : (
          <SmallHint>No units matched your search/filter.</SmallHint>
        )}
      </div>
    </div>
  </div>
) : null}

  </div>
  </div>
  );
}