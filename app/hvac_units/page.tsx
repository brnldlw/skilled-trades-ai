"use client";

import { buildMeasurementCoaching } from "./lib/measurementCoaching";

import { buildRepairGuidance } from "./lib/repairGuidance";

import { safeJson } from "./lib/networkHelpers";

import { ProbBar } from "./components/ProbBar";

import { SectionCard } from "./components/SectionCard";

import { PillButton } from "./components/PillButton";

import { SmallHint } from "./components/SmallHint";

import { Badge } from "./components/Badge";

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
    if (low.includes("fan")) suggestionPool.push("Inspect fan motor, blade, capacitor, and rotation");
    if (low.includes("airflow"))
      suggestionPool.push("Check airflow before condemning refrigeration parts");
    if (low.includes("capacitor")) suggestionPool.push("Test run capacitor and amp draw");
    if (low.includes("contactor")) suggestionPool.push("Inspect contactor points and coil voltage");
    if (low.includes("compressor"))
      suggestionPool.push("Verify compressor amps, voltage, and overload condition");
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
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [unitNickname, setUnitNickname] = useState("");

  const [propertyType, setPropertyType] = useState("Commercial");
  const [equipmentType, setEquipmentType] = useState("RTU");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [errorCodeSource, setErrorCodeSource] = useState("Control Board");
  const [symptom, setSymptom] = useState("");

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

  const [repairGuidanceMode, setRepairGuidanceMode] =
  useState<"apprentice" | "experienced">("apprentice");

  useEffect(() => {
    listUnits().then(setSavedUnits).catch(() => setSavedUnits([]));
  }, []);

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
    const pack = SYMPTOM_PACKS.find((p) => p.id === "no_cooling") || SYMPTOM_PACKS[0];
    setFlowNodeId(pack.nodes[0]?.id || "");
    setFlowHistory([]);
  }

  async function saveCurrentUnit() {
    const record: SavedUnitRecord = {
      id: makeId(),
      savedAt: new Date().toISOString(),
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
      selectedPackId,
      flowNodeId,
      flowHistory,
      observations,
      rawResult,
      nameplate,
      errorCode,
      errorCodeSource,
    };

    await saveUnit(record);
    const refreshed = await listUnits();
    setSavedUnits(refreshed);
  }

  function loadUnit(record: SavedUnitRecord) {
    setCustomerName(record.customerName || "");
    setSiteName(record.siteName || "");
    setSiteAddress(record.siteAddress || "");
    setUnitNickname(record.unitNickname || "");
    setPropertyType(record.propertyType || "Commercial");
    setEquipmentType(record.equipmentType || "RTU");
    setManufacturer(record.manufacturer || "");
    setModel(record.model || "");
    setRefrigerantType(record.refrigerantType || "Unknown");
    setSymptom(record.symptom || "");
    setSelectedPackId(record.selectedPackId || "no_cooling");
    setFlowNodeId(record.flowNodeId || "");
    setFlowHistory(record.flowHistory || []);
    setObservations(record.observations || []);
    setRawResult(record.rawResult || "");
    setNameplate(record.nameplate || null);
    setErrorCode(record.errorCode || "");
    setErrorCodeSource(record.errorCodeSource || "Control Board");
  }

  async function removeSavedUnit(id: string) {
    await deleteUnit(id);
    const refreshed = await listUnits();
    setSavedUnits(refreshed);
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

  return (
    <div style={{ padding: 20, maxWidth: 1220, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>
        Skilled Trades AI — HVAC Diagnose
      </h1>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <SectionCard title="Customer / Site / Unit">
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
                placeholder="RTU-1, Office Furnace, Walk-in Cooler"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <PillButton text="Save Current Unit" onClick={saveCurrentUnit} />
            <PillButton text="Clear Current Form" onClick={clearCurrentForm} />
          </div>
        </SectionCard>

        <SectionCard title="Saved Unit History" right={<Badge text={`${savedUnits.length} saved`} />}>
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

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 900 }}>Symptom</label>
            <br />
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              style={{ width: "100%", padding: 8, minHeight: 90 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button
            onClick={handleDiagnose}
            disabled={loading}
            style={{ padding: "10px 14px", fontWeight: 900 }}
          >
            {loading ? "Diagnosing..." : "Diagnose"}
          </button>

          <button
            onClick={updateDiagnosisNow}
            disabled={loading}
            style={{ padding: "10px 14px", fontWeight: 900 }}
          >
            Update diagnosis (with measurements)
          </button>

          <button
            onClick={findManualsParts}
            disabled={mpBusy || !manufacturer.trim()}
            style={{ padding: "10px 14px", fontWeight: 900 }}
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

        <SectionCard
          title="Nameplate Photo Reader"
          right={<PillButton text="Choose photo" onClick={() => fileInputRef.current?.click()} />}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
      </div>

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

        <SectionCard title="Measurements / Observations">
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
              <button onClick={addMeasurement} style={{ padding: "10px 14px", fontWeight: 900 }}>
                Add measurement
              </button>
              <button
                onClick={() => setObservations([])}
                style={{ padding: "10px 14px", fontWeight: 900 }}
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

            <SectionCard title="Raw output">
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
    {formatRawOutput(rawResult)}
  </div>
</SectionCard>
          </div>
        ) : (
          <SectionCard title="Raw output">
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              {rawResult || "No results yet."}
            </pre>
          </SectionCard>
        )}
      </div>
    </div>
  );
}