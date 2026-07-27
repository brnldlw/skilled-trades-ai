import { round1, toNumber } from "./basicHelpers";
import { escapeHtml } from "./textHelpers";
import { convertToStandard } from "./unitHelpers";
import { tempFromPsig } from "./ptChart";
import type { Observation, SavedUnitRecord, NameplateResult } from "../../lib/unit-store";
import { t, type Language } from "../../lib/translations";

export type Diagnosis = {
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

export type ChargeAnalysis = {
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

export type AirflowAnalysis = {
  totalExternalStatic: number | null;
  returnStatic: number | null;
  supplyStatic: number | null;
  filterDrop: number | null;
  coilDrop: number | null;
  summary: string;
  findings: string[];
};

export type EquipmentMemoryInsight = {
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

function normalizeLabel(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getObservationValue(
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

export function analyzeCharge(
  observations: Observation[],
  equipmentType: string,
  refrigerantType: string,
  lang: Language = "en"
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
      ? tempFromPsig(refrigerantType, suctionPressure)
      : null;

  const ptCondSat =
    enteredCondSat === null && liquidPressure !== null && refrigerantType !== "Unknown"
      ? tempFromPsig(refrigerantType, liquidPressure)
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
  let summary = t("diag_charge_need_more_readings", lang);

  const isCoolingType =
    !equipmentType.toLowerCase().includes("furnace") &&
    !equipmentType.toLowerCase().includes("boiler");

  if (evapSatSource === "pt-chart") {
    findings.push(t("diag_evap_sat_from_pt_chart", lang).replace("{value}", refrigerantType));
  }
  if (condSatSource === "pt-chart") {
    findings.push(t("diag_cond_sat_from_pt_chart", lang).replace("{value}", refrigerantType));
  }

  if (deltaT !== null) {
    if (deltaT < 12) {
      findings.push(t("diag_deltat_low", lang));
    } else if (deltaT > 22) {
      findings.push(t("diag_deltat_high", lang));
    } else {
      findings.push(t("diag_deltat_normal", lang));
    }
  }

  if (superheat !== null) {
    if (superheat > 20) {
      findings.push(t("diag_superheat_high", lang));
    } else if (superheat < 5) {
      findings.push(t("diag_superheat_low", lang));
    } else {
      findings.push(t("diag_superheat_normal", lang));
    }
  }

  if (subcool !== null) {
    if (subcool < 5) {
      findings.push(t("diag_subcool_low", lang));
    } else if (subcool > 18) {
      findings.push(t("diag_subcool_high", lang));
    } else {
      findings.push(t("diag_subcool_normal", lang));
    }
  }

  if (isCoolingType) {
    if (superheat !== null && subcool !== null) {
      if (superheat > 18 && subcool < 5) {
        summary = t("diag_summary_undercharged", lang);
      } else if (superheat < 6 && subcool > 15) {
        summary = t("diag_summary_overcharged", lang);
      } else if (superheat > 18 && subcool > 15) {
        summary = t("diag_summary_restriction", lang);
      } else if (superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
        summary = t("diag_summary_charge_close", lang);
      } else {
        summary = t("diag_summary_charge_mixed", lang);
      }
    } else if (superheat !== null) {
      if (superheat > 18) {
        summary = t("diag_summary_high_sh_only", lang);
      } else if (superheat < 6) {
        summary = t("diag_summary_low_sh_only", lang);
      } else {
        summary = t("diag_summary_sh_ok_need_sc", lang);
      }
    } else if (subcool !== null) {
      if (subcool < 5) {
        summary = t("diag_summary_low_sc_only", lang);
      } else if (subcool > 15) {
        summary = t("diag_summary_high_sc_only", lang);
      } else {
        summary = t("diag_summary_sc_ok_need_sh", lang);
      }
    } else if (
      suctionPressure !== null &&
      liquidPressure !== null &&
      refrigerantType !== "Unknown"
    ) {
      summary = t("diag_summary_pt_only", lang);
    }
  } else {
    summary = t("diag_summary_not_cooling_type", lang);
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

export function analyzeAirflow(observations: Observation[], lang: Language = "en"): AirflowAnalysis {
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
  let summary = t("diag_airflow_need_more", lang);

  if (totalExternalStatic !== null) {
    if (totalExternalStatic <= 0.5) {
      findings.push(t("diag_tesp_normal", lang));
    } else if (totalExternalStatic <= 0.8) {
      findings.push(t("diag_tesp_elevated", lang));
    } else {
      findings.push(t("diag_tesp_high", lang));
    }
  }

  if (returnStatic !== null && supplyStatic !== null) {
    const returnAbs = Math.abs(returnStatic);
    const supplyAbs = Math.abs(supplyStatic);

    if (returnAbs > supplyAbs * 1.35) {
      findings.push(t("diag_return_more_restriction", lang));
    } else if (supplyAbs > returnAbs * 1.35) {
      findings.push(t("diag_supply_more_restriction", lang));
    } else {
      findings.push(t("diag_static_balanced", lang));
    }
  }

  if (filterDrop !== null) {
    if (filterDrop < 0.08) {
      findings.push(t("diag_filter_drop_low", lang));
    } else if (filterDrop <= 0.18) {
      findings.push(t("diag_filter_drop_moderate", lang));
    } else {
      findings.push(t("diag_filter_drop_high", lang));
    }
  }

  if (coilDrop !== null) {
    if (coilDrop < 0.2) {
      findings.push(t("diag_coil_drop_low", lang));
    } else if (coilDrop <= 0.35) {
      findings.push(t("diag_coil_drop_elevated", lang));
    } else {
      findings.push(t("diag_coil_drop_high", lang));
    }
  }

  if (totalExternalStatic !== null) {
    if (totalExternalStatic > 0.8) {
      if ((filterDrop ?? 0) > 0.18) {
        summary = t("diag_airflow_summary_high_filter", lang);
      } else if ((coilDrop ?? 0) > 0.35) {
        summary = t("diag_airflow_summary_high_coil", lang);
      } else if (
        returnStatic !== null &&
        supplyStatic !== null &&
        Math.abs(returnStatic) > Math.abs(supplyStatic) * 1.35
      ) {
        summary = t("diag_airflow_summary_return_burden", lang);
      } else if (
        returnStatic !== null &&
        supplyStatic !== null &&
        Math.abs(supplyStatic) > Math.abs(returnStatic) * 1.35
      ) {
        summary = t("diag_airflow_summary_supply_burden", lang);
      } else {
        summary = t("diag_airflow_summary_high_generic", lang);
      }
    } else if (totalExternalStatic > 0.5) {
      summary = t("diag_airflow_summary_elevated", lang);
    } else {
      summary = t("diag_airflow_summary_normal", lang);
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

export function analyzeDefrost(
  observations: Observation[],
  equipmentType: string,
  symptom: string,
  lang: Language = "en"
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
  let summary = t("diag_defrost_need_more", lang);

  const isRefrigeration =
    equipmentLow.includes("cooler") ||
    equipmentLow.includes("freezer") ||
    equipmentLow.includes("merchandiser");

  if (!isRefrigeration) {
    return {
      summary: t("diag_defrost_not_refrigeration", lang),
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
    findings.push(t("diag_defrost_symptom_hint", lang));
  }

  if (timerState) {
    if (
      timerState.includes("defrost") ||
      timerState.includes("in defrost") ||
      timerState.includes("active")
    ) {
      findings.push(t("diag_defrost_calling", lang));
    } else if (
      timerState.includes("cool") ||
      timerState.includes("refrigeration") ||
      timerState.includes("run")
    ) {
      findings.push(t("diag_defrost_in_refrig_mode", lang));
    } else {
      findings.push(t("diag_defrost_timer_state_entered", lang).replace("{value}", String(timerStateRaw)));
    }
  }

  if (heaterAmps !== null) {
    if (heaterAmps > 0.2) {
      findings.push(t("diag_defrost_heater_amps_present", lang));
    } else {
      findings.push(t("diag_defrost_heater_amps_zero", lang));
    }
  }

  if (terminationState) {
    if (
      terminationState.includes("closed") ||
      terminationState.includes("made") ||
      terminationState.includes("continuity")
    ) {
      findings.push(t("diag_defrost_term_closed", lang));
    } else if (
      terminationState.includes("open") ||
      terminationState.includes("tripped")
    ) {
      findings.push(t("diag_defrost_term_open", lang));
    } else {
      findings.push(t("diag_defrost_term_state_entered", lang).replace("{value}", String(terminationStateRaw)));
    }
  }

  if (evapCoilTemp !== null) {
    if (evapCoilTemp < 20) {
      findings.push(t("diag_defrost_coil_temp_low", lang));
    } else if (evapCoilTemp > 40) {
      findings.push(t("diag_defrost_coil_temp_warm", lang));
    }
  }

  if (boxTemp !== null) {
    if (equipmentLow.includes("freezer") && boxTemp > 10) {
      findings.push(t("diag_defrost_freezer_box_high", lang));
    } else if (equipmentLow.includes("cooler") && boxTemp > 40) {
      findings.push(t("diag_defrost_cooler_box_high", lang));
    }
  }

  if (
    (timerState.includes("defrost") || timerState.includes("active")) &&
    heaterAmps !== null &&
    heaterAmps < 0.2
  ) {
    summary = t("diag_defrost_summary_no_amps", lang);
  } else if (
    likelyDefrostComplaint &&
    timerState &&
    (timerState.includes("cool") || timerState.includes("run"))
  ) {
    summary = t("diag_defrost_summary_stuck_refrig", lang);
  } else if (
    heaterAmps !== null &&
    heaterAmps > 0.2 &&
    terminationState &&
    (terminationState.includes("open") || terminationState.includes("tripped")) &&
    evapCoilTemp !== null &&
    evapCoilTemp < 25
  ) {
    summary = t("diag_defrost_summary_early_term", lang);
  } else if (
    likelyDefrostComplaint &&
    heaterAmps !== null &&
    heaterAmps > 0.2 &&
    evapCoilTemp !== null &&
    evapCoilTemp > 40
  ) {
    summary = t("diag_defrost_summary_functioning", lang);
  } else if (
    likelyDefrostComplaint &&
    !timerState &&
    heaterAmps === null &&
    !terminationState
  ) {
    summary = t("diag_defrost_summary_need_data", lang);
  } else {
    summary = t("diag_defrost_summary_mixed", lang);
  }

  return { summary, findings };
}

export function buildDefrostRepairGuidance(
  observations: Observation[],
  equipmentType: string,
  symptom: string,
  lang: Language = "en"
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
      part: t("diag_repair_part_heater_circuit", lang),
      why: t("diag_repair_why_no_heater_amps", lang),
      nextTest: t("diag_repair_next_heater_voltage", lang),
      quickCheck: t("diag_repair_quick_heater_ohm", lang),
      priority: "High",
    });

    repairItems.push({
      part: t("diag_repair_part_relay_output", lang),
      why: t("diag_repair_why_relay_power", lang),
      nextTest: t("diag_repair_next_relay_voltage", lang),
      quickCheck: t("diag_repair_quick_relay_voltage", lang),
      priority: "High",
    });
  }

  if (
    likelyDefrostComplaint &&
    timerState &&
    (timerState.includes("cool") || timerState.includes("run"))
  ) {
    repairItems.push({
      part: t("diag_repair_part_timer_board", lang),
      why: t("diag_repair_why_stuck_refrig", lang),
      nextTest: t("diag_repair_next_force_defrost", lang),
      quickCheck: t("diag_repair_quick_advance_timer", lang),
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
      part: t("diag_repair_part_term_stat", lang),
      why: t("diag_repair_why_term_early", lang),
      nextTest: t("diag_repair_next_term_vs_coil", lang),
      quickCheck: t("diag_repair_quick_term_resistance", lang),
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
      part: t("diag_repair_part_drain", lang),
      why: t("diag_repair_why_drain", lang),
      nextTest: t("diag_repair_next_drain_flow", lang),
      quickCheck: t("diag_repair_quick_drain_water", lang),
      priority: "Medium",
    });

    repairItems.push({
      part: t("diag_repair_part_door_gaskets", lang),
      why: t("diag_repair_why_door_gaskets", lang),
      nextTest: t("diag_repair_next_door_inspect", lang),
      quickCheck: t("diag_repair_quick_door_frost", lang),
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
      part: t("diag_repair_part_not_verified", lang),
      why: t("diag_repair_why_missing_data", lang),
      nextTest: t("diag_repair_next_collect_data", lang),
      quickCheck: t("diag_repair_quick_add_measurements", lang),
      priority: "High",
    });
  }

  if (boxTemp !== null && equipmentLow.includes("freezer") && boxTemp > 15) {
    repairItems.push({
      part: t("diag_repair_part_door_load", lang),
      why: t("diag_repair_why_box_temp_high", lang),
      nextTest: t("diag_repair_next_door_freq", lang),
      quickCheck: t("diag_repair_quick_snow_entry", lang),
      priority: "Medium",
    });
  }

  const deduped = new Map<string, (typeof repairItems)[number]>();
  for (const item of repairItems) {
    if (!deduped.has(item.part)) deduped.set(item.part, item);
  }

  return [...deduped.values()];
}

export function parseDiagnosis(rawResult: string): Diagnosis | null {
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

export function buildEquipmentMemoryInsight(
  savedUnits: SavedUnitRecord[],
  current: {
    id?: string;
    customerName: string;
    siteName: string;
    unitNickname: string;
    model: string;
    manufacturer: string;
    equipmentType: string;
  },
  lang: Language = "en"
): EquipmentMemoryInsight {
  const related = savedUnits.filter(
    (r) => r.id !== current.id && isRelatedRecord(current, r)
  );

  if (!related.length) {
    return {
      relatedCount: 0,
      summary: t("diag_memory_no_history", lang),
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
      suggestionPool.push(t("diag_suggest_filter_coil_blower", lang));
    }
    if (low.includes("high coil pressure drop")) {
      suggestionPool.push(t("diag_suggest_evap_coil_blower", lang));
    }
    if (low.includes("high filter pressure drop")) {
      suggestionPool.push(t("diag_suggest_filter_size", lang));
    }
    if (low.includes("return-side restriction")) {
      suggestionPool.push(t("diag_suggest_return_duct", lang));
    }
    if (low.includes("supply-side restriction")) {
      suggestionPool.push(t("diag_suggest_supply_duct", lang));
    }
    if (low.includes("undercharge pattern")) {
      suggestionPool.push(t("diag_suggest_leak_check", lang));
    }
    if (low.includes("restriction / metering pattern")) {
      suggestionPool.push(t("diag_suggest_txv_check", lang));
    }
    if (low.includes("high superheat")) {
      suggestionPool.push(t("diag_suggest_evap_feed", lang));
    }
    if (low.includes("low subcool")) {
      suggestionPool.push(t("diag_suggest_charge_liquid_line", lang));
    }
  }

  for (const c of repeatedCauses) {
    const low = c.toLowerCase();
    if (low.includes("fan")) {
      suggestionPool.push(t("diag_suggest_fan_motor", lang));
    }
    if (low.includes("airflow")) {
      suggestionPool.push(t("diag_suggest_airflow_before_condemning", lang));
    }
    if (low.includes("capacitor")) {
      suggestionPool.push(t("diag_suggest_test_capacitor", lang));
    }
    if (low.includes("contactor")) {
      suggestionPool.push(t("diag_suggest_contactor_points", lang));
    }
    if (low.includes("compressor")) {
      suggestionPool.push(t("diag_suggest_compressor_amps", lang));
    }
    if (low.includes("thermostat") || low.includes("control")) {
      suggestionPool.push(t("diag_suggest_thermostat_signal", lang));
    }
  }

  const dedupedSuggestions = [...new Set(suggestionPool)].slice(0, 4);

  let summary = t("diag_memory_found_related", lang).replace("{count}", String(related.length));

  if (repeatedMeasurementPatterns.length) {
    summary = t("diag_memory_pattern_summary", lang).replace("{value}", repeatedMeasurementPatterns[0]);
  } else if (repeatedCauses.length) {
    summary = t("diag_memory_cause_summary", lang).replace("{value}", repeatedCauses[0]);
  } else if (repeatedSymptoms.length) {
    summary = t("diag_memory_symptom_summary", lang).replace("{value}", repeatedSymptoms[0]);
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

export function buildServiceReportHtml(args: {
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
  lang?: Language;
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
    lang = "en",
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
    : `<tr><td colspan="3">${escapeHtml(t("psr_no_measurements", lang))}</td></tr>`;

  const likelyCauseRows =
    parsed?.likely_causes?.length
      ? parsed.likely_causes
          .map(
            (c) => `
              <li>
                <strong>${escapeHtml(c.cause || t("psr_cause_fallback", lang))}</strong>
                ${typeof c.probability_percent === "number" ? ` — ${c.probability_percent}%` : ""}
                ${c.why ? `<div class="muted">${escapeHtml(c.why)}</div>` : ""}
              </li>
            `
          )
          .join("")
      : `<li>${escapeHtml(t("psr_no_likely_causes", lang))}</li>`;

  const memoryRows =
    equipmentMemory.suggestedFirstChecks.length
      ? equipmentMemory.suggestedFirstChecks
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("")
      : `<li>${escapeHtml(t("psr_no_memory_suggestions", lang))}</li>`;

  const airflowRows =
    airflowAnalysis.findings.length
      ? airflowAnalysis.findings.map((f) => `<li>${escapeHtml(f)}</li>`).join("")
      : `<li>${escapeHtml(t("psr_no_airflow_findings", lang))}</li>`;

  const chargeRows =
    chargeAnalysis.findings.length
      ? chargeAnalysis.findings.map((f) => `<li>${escapeHtml(f)}</li>`).join("")
      : `<li>${escapeHtml(t("psr_no_charge_findings", lang))}</li>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(t("psr_title", lang))}</title>
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
      <h1>${escapeHtml(t("psr_title", lang))}</h1>
      <div class="muted">${escapeHtml(t("psr_generated", lang))} ${escapeHtml(now)}</div>
    </div>
    <div style="text-align:right">
      <div><span class="label">${escapeHtml(t("psr_property_type", lang))}</span> ${escapeHtml(propertyType || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_equipment_type", lang))}</span> ${escapeHtml(equipmentType || "-")}</div>
    </div>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_customer_site_unit", lang))}</h2>
    <div class="grid">
      <div><span class="label">${escapeHtml(t("psr_customer", lang))}</span> ${escapeHtml(customerName || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_site", lang))}</span> ${escapeHtml(siteName || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_address", lang))}</span> ${escapeHtml(siteAddress || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_unit_tag", lang))}</span> ${escapeHtml(unitNickname || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_manufacturer", lang))}</span> ${escapeHtml(manufacturer || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_model", lang))}</span> ${escapeHtml(model || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_refrigerant", lang))}</span> ${escapeHtml(refrigerantType || "-")}</div>
      <div><span class="label">${escapeHtml(t("psr_nameplate_serial", lang))}</span> ${escapeHtml(nameplate?.serial || "-")}</div>
    </div>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_complaint", lang))}</h2>
    <div>${escapeHtml(symptom || "-")}</div>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_diagnosis_summary", lang))}</h2>
    <div>${escapeHtml(parsed?.summary || t("psr_no_ai_summary", lang))}</div>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_likely_causes", lang))}</h2>
    <ul>${likelyCauseRows}</ul>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_charge_analysis", lang))}</h2>
    <div>
      <span class="label">Delta-T:</span> ${chargeAnalysis.deltaT !== null ? `${chargeAnalysis.deltaT}°F` : "—"}
      <span class="pill">Evap Sat: ${chargeAnalysis.evapSat !== null ? `${chargeAnalysis.evapSat}°F` : "—"} / ${escapeHtml(chargeAnalysis.evapSatSource)}</span>
      <span class="pill">Cond Sat: ${chargeAnalysis.condSat !== null ? `${chargeAnalysis.condSat}°F` : "—"} / ${escapeHtml(chargeAnalysis.condSatSource)}</span>
      <span class="pill">SH: ${chargeAnalysis.superheat !== null ? `${chargeAnalysis.superheat}°F` : "—"}</span>
      <span class="pill">SC: ${chargeAnalysis.subcool !== null ? `${chargeAnalysis.subcool}°F` : "—"}</span>
    </div>
    <div style="margin-top:8px"><span class="label">${escapeHtml(t("psr_label_summary", lang))}</span> ${escapeHtml(chargeAnalysis.summary)}</div>
    <ul>${chargeRows}</ul>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_airflow_analysis", lang))}</h2>
    <div>
      <span class="pill">TESP: ${airflowAnalysis.totalExternalStatic !== null ? `${airflowAnalysis.totalExternalStatic} inWC` : "—"}</span>
      <span class="pill">Return: ${airflowAnalysis.returnStatic !== null ? `${airflowAnalysis.returnStatic} inWC` : "—"}</span>
      <span class="pill">Supply: ${airflowAnalysis.supplyStatic !== null ? `${airflowAnalysis.supplyStatic} inWC` : "—"}</span>
      <span class="pill">Filter Drop: ${airflowAnalysis.filterDrop !== null ? `${airflowAnalysis.filterDrop} inWC` : "—"}</span>
      <span class="pill">Coil Drop: ${airflowAnalysis.coilDrop !== null ? `${airflowAnalysis.coilDrop} inWC` : "—"}</span>
    </div>
    <div style="margin-top:8px"><span class="label">${escapeHtml(t("psr_label_summary", lang))}</span> ${escapeHtml(airflowAnalysis.summary)}</div>
    <ul>${airflowRows}</ul>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_equipment_memory", lang))}</h2>
    <div><span class="label">${escapeHtml(t("psr_label_summary", lang))}</span> ${escapeHtml(equipmentMemory.summary)}</div>
    <div class="muted">${escapeHtml(t("psr_related_entries", lang))} ${equipmentMemory.relatedCount}</div>
    <ul>${memoryRows}</ul>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_measurements", lang))}</h2>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(t("psr_table_measurement", lang))}</th>
          <th>${escapeHtml(t("psr_table_value", lang))}</th>
          <th>${escapeHtml(t("psr_table_note", lang))}</th>
        </tr>
      </thead>
      <tbody>${obsRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>${escapeHtml(t("psr_section_next_actions", lang))}</h2>
    <ul>
      ${
        equipmentMemory.suggestedFirstChecks.length
          ? equipmentMemory.suggestedFirstChecks
              .map((s) => `<li>${escapeHtml(s)}</li>`)
              .join("")
          : `<li>${escapeHtml(t("psr_next_actions_fallback", lang))}</li>`
      }
    </ul>
  </div>
</body>
</html>`;
}
