import type { Language, TranslationKey } from "../../lib/translations";
import { t } from "../../lib/translations";

export type PresetOption = {
  label: string;
  unit: string;
};

export const refrigerantOptions: string[] = [
  "Unknown",
  "R-410A",
  "R-22",
  "R-32",
  "R-454B",
  "R-134a",
  "R-407C",
  "R-404A",
  "R-448A",
  "R-449A",
  "R-290 (Propane)",
  "R-600a (Isobutane)",
];

export type EquipmentTypeGroup = {
  groupLabel: string;
  options: string[];
};

export const equipmentTypeGroups: EquipmentTypeGroup[] = [
  {
    groupLabel: "── Cooling / Heating ──",
    options: [
      "RTU",
      "Split System",
      "Heat Pump",
      "Packaged Heat Pump",
      "Mini-Split",
      "Multi-Zone Mini-Split",
      "VRF System",
      "Furnace",
      "Air Handler",
      "Boiler",
      "Chiller — Air Cooled",
      "Chiller — Water Cooled",
      "Make-Up Air Unit",
      "Energy Recovery Unit",
      "Fan Coil Unit",
      "Unit Heater",
      "PTAC / PTHP",
      "Ceiling Cassette",
      "Computer Room AC (CRAC)",
    ],
  },
  {
    groupLabel: "── Commercial Refrigeration ──",
    options: [
      "Walk-In Cooler",
      "Walk-In Freezer",
      "Reach-In Cooler",
      "Reach-In Freezer",
      "Merchandiser / Display Case",
      "Ice Machine — Cuber",
      "Ice Machine — Flaker",
      "Ice Machine — Nugget",
      "Ice Machine — Tube",
      "Remote Condensing Unit",
      "Remote Evaporator",
      "Beverage Cooler",
      "Prep Table / Cold Table",
      "Blast Chiller / Freezer",
      "Refrigerated Trailer",
      "Process Cooling Unit",
      "Server Room Cooling",
    ],
  },
  {
    groupLabel: "── Other ──",
    options: [
      "Dehumidifier — Commercial",
      "Dehumidifier — Residential",
      "Humidifier",
      "ERV / HRV",
      "Other",
    ],
  },
];

// equipmentTypeGroups' English strings are the canonical stored values
// (equipmentType state, saved to Supabase, matched against elsewhere in
// the app e.g. `.toLowerCase().includes("furnace")`) -- these maps only
// translate the *displayed* label, never the underlying value.
const EQUIPMENT_TYPE_GROUP_LABEL_KEYS: Record<string, TranslationKey> = {
  "── Cooling / Heating ──": "eqgroup_cooling_heating",
  "── Commercial Refrigeration ──": "eqgroup_commercial_refrigeration",
  "── Other ──": "eqgroup_other",
};

const EQUIPMENT_TYPE_KEYS: Record<string, TranslationKey> = {
  "RTU": "eq_rtu",
  "Split System": "eq_split_system",
  "Heat Pump": "eq_heat_pump",
  "Packaged Heat Pump": "eq_packaged_heat_pump",
  "Mini-Split": "eq_mini_split",
  "Multi-Zone Mini-Split": "eq_multi_zone_mini_split",
  "VRF System": "eq_vrf_system",
  "Furnace": "eq_furnace",
  "Air Handler": "eq_air_handler",
  "Boiler": "eq_boiler",
  "Chiller — Air Cooled": "eq_chiller_air",
  "Chiller — Water Cooled": "eq_chiller_water",
  "Make-Up Air Unit": "eq_makeup_air",
  "Energy Recovery Unit": "eq_energy_recovery",
  "Fan Coil Unit": "eq_fan_coil",
  "Unit Heater": "eq_unit_heater",
  "PTAC / PTHP": "eq_ptac_pthp",
  "Ceiling Cassette": "eq_ceiling_cassette",
  "Computer Room AC (CRAC)": "eq_crac",
  "Walk-In Cooler": "eq_walkin_cooler",
  "Walk-In Freezer": "eq_walkin_freezer",
  "Reach-In Cooler": "eq_reachin_cooler",
  "Reach-In Freezer": "eq_reachin_freezer",
  "Merchandiser / Display Case": "eq_merchandiser",
  "Ice Machine — Cuber": "eq_ice_cuber",
  "Ice Machine — Flaker": "eq_ice_flaker",
  "Ice Machine — Nugget": "eq_ice_nugget",
  "Ice Machine — Tube": "eq_ice_tube",
  "Remote Condensing Unit": "eq_remote_condensing",
  "Remote Evaporator": "eq_remote_evaporator",
  "Beverage Cooler": "eq_beverage_cooler",
  "Prep Table / Cold Table": "eq_prep_table",
  "Blast Chiller / Freezer": "eq_blast_chiller",
  "Refrigerated Trailer": "eq_refrigerated_trailer",
  "Process Cooling Unit": "eq_process_cooling",
  "Server Room Cooling": "eq_server_room",
  "Dehumidifier — Commercial": "eq_dehumidifier_commercial",
  "Dehumidifier — Residential": "eq_dehumidifier_residential",
  "Humidifier": "eq_humidifier",
  "ERV / HRV": "eq_erv_hrv",
  "Other": "equip_other",
};

export function translateEquipmentType(value: string, lang: Language): string {
  const key = EQUIPMENT_TYPE_KEYS[value];
  return key ? t(key, lang) : value;
}

export function translateEquipmentGroupLabel(label: string, lang: Language): string {
  const key = EQUIPMENT_TYPE_GROUP_LABEL_KEYS[label];
  return key ? t(key, lang) : label;
}

// Measurement preset labels are stored verbatim as the canonical
// Observation.label value (matched against elsewhere via
// getObservationValue's substring checks, e.g. l.includes("suction")) --
// like equipment types, only the *displayed* label is translated.
const MEASUREMENT_LABEL_KEYS: Record<string, TranslationKey> = {
  "Suction Pressure": "measure_suction_pressure",
  "Liquid Pressure": "measure_liquid_pressure",
  "Return Air Temp": "measure_return_air_temp",
  "Supply Air Temp": "measure_supply_air_temp",
  "Suction Line Temp": "measure_suction_line_temp",
  "Liquid Line Temp": "measure_liquid_line_temp",
  "Suction Saturation Temp": "measure_suction_sat_temp",
  "Condensing Saturation Temp": "measure_condensing_sat_temp",
  "Superheat": "measure_superheat",
  "Subcool": "measure_subcool",
  "Delta T (Return-Supply)": "measure_delta_t_return_supply",
  "Return Static": "measure_return_static",
  "Supply Static": "measure_supply_static",
  "Filter Pressure Drop": "measure_filter_pressure_drop",
  "Coil Pressure Drop": "measure_coil_pressure_drop",
  "External Static Pressure": "measure_external_static_pressure",
  "Compressor Amps": "measure_compressor_amps",
  "Line Voltage": "measure_line_voltage",
  "Control Voltage (R-C)": "measure_control_voltage_rc",
  "Low Pressure Switch Status": "measure_low_pressure_switch_status",
  "High Pressure Switch Status": "measure_high_pressure_switch_status",
  "Gas Inlet Pressure": "measure_gas_inlet_pressure",
  "Manifold Pressure": "measure_manifold_pressure",
  "Heat Rise": "measure_heat_rise",
  "Inducer Amps": "measure_inducer_amps",
  "Flame Sensor": "measure_flame_sensor",
  "Limit Switch Continuity": "measure_limit_switch_continuity",
  "Control Voltage (R-W)": "measure_control_voltage_rw",
  "Pressure Switch Status": "measure_pressure_switch_status",
  "Limit Switch Status": "measure_limit_switch_status",
  "Rollout Switch Status": "measure_rollout_switch_status",
  "Condensate Safety Status": "measure_condensate_safety_status",
  "Box Temp": "measure_box_temp",
  "Evap Coil Temp": "measure_evap_coil_temp",
  "Head Pressure": "measure_head_pressure",
  "Defrost Heater Amps": "measure_defrost_heater_amps",
  "Termination Stat State": "measure_termination_stat_state",
  "Defrost Timer State": "measure_defrost_timer_state",
  "Water Fill Time": "measure_water_fill_time",
  "Harvest Cycle Time": "measure_harvest_cycle_time",
  "Water Supply Pressure": "measure_water_supply_pressure",
  "Water Temp": "measure_water_temp",
  "Bin Thermostat State": "measure_bin_thermostat_state",
  "Hot Gas Valve Voltage": "measure_hot_gas_valve_voltage",
  "Bin Control Status": "measure_bin_control_status",
  "Water Level Control Status": "measure_water_level_control_status",
};

export function translateMeasurementLabel(label: string, lang: Language): string {
  const key = MEASUREMENT_LABEL_KEYS[label];
  return key ? t(key, lang) : label;
}

export const unitOptions: string[] = [
  "psi",
  "kPa",
  "bar",
  "°F",
  "°C",
  "amps",
  "volts",
  "inWC",
  "Pa",
  "ohms",
  "µA",
  "%",
  "other",
];

export const coolingPresets: PresetOption[] = [
  { label: "Suction Pressure", unit: "psi" },
  { label: "Liquid Pressure", unit: "psi" },
  { label: "Return Air Temp", unit: "°F" },
  { label: "Supply Air Temp", unit: "°F" },
  { label: "Suction Line Temp", unit: "°F" },
  { label: "Liquid Line Temp", unit: "°F" },
  { label: "Suction Saturation Temp", unit: "°F" },
  { label: "Condensing Saturation Temp", unit: "°F" },
  { label: "Superheat", unit: "°F" },
  { label: "Subcool", unit: "°F" },
  { label: "Delta T (Return-Supply)", unit: "°F" },
  { label: "Return Static", unit: "inWC" },
  { label: "Supply Static", unit: "inWC" },
  { label: "Filter Pressure Drop", unit: "inWC" },
  { label: "Coil Pressure Drop", unit: "inWC" },
  { label: "External Static Pressure", unit: "inWC" },
  { label: "Compressor Amps", unit: "amps" },
  { label: "Line Voltage", unit: "volts" },
  { label: "Control Voltage (R-C)", unit: "volts" },
  { label: "Low Pressure Switch Status", unit: "other" },
  { label: "High Pressure Switch Status", unit: "other" },
];

export const heatingPresets: PresetOption[] = [
  { label: "Gas Inlet Pressure", unit: "inWC" },
  { label: "Manifold Pressure", unit: "inWC" },
  { label: "Heat Rise", unit: "°F" },
  { label: "Return Static", unit: "inWC" },
  { label: "Supply Static", unit: "inWC" },
  { label: "Filter Pressure Drop", unit: "inWC" },
  { label: "Coil Pressure Drop", unit: "inWC" },
  { label: "Inducer Amps", unit: "amps" },
  { label: "Flame Sensor", unit: "µA" },
  { label: "Limit Switch Continuity", unit: "ohms" },
  { label: "Line Voltage", unit: "volts" },
  { label: "Control Voltage (R-W)", unit: "volts" },
  { label: "Pressure Switch Status", unit: "other" },
  { label: "Limit Switch Status", unit: "other" },
  { label: "Rollout Switch Status", unit: "other" },
  { label: "Condensate Safety Status", unit: "other" },
];

export const refrigerationPresets: PresetOption[] = [
  { label: "Box Temp", unit: "°F" },
  { label: "Evap Coil Temp", unit: "°F" },
  { label: "Suction Pressure", unit: "psi" },
  { label: "Head Pressure", unit: "psi" },
  { label: "Liquid Pressure", unit: "psi" },
  { label: "Suction Line Temp", unit: "°F" },
  { label: "Liquid Line Temp", unit: "°F" },
  { label: "Suction Saturation Temp", unit: "°F" },
  { label: "Condensing Saturation Temp", unit: "°F" },
  { label: "Superheat", unit: "°F" },
  { label: "Subcool", unit: "°F" },
  { label: "Defrost Heater Amps", unit: "amps" },
  { label: "Termination Stat State", unit: "other" },
  { label: "Defrost Timer State", unit: "other" },
  { label: "Compressor Amps", unit: "amps" },
  { label: "Line Voltage", unit: "volts" },
  { label: "Control Voltage (R-C)", unit: "volts" },
  { label: "Low Pressure Switch Status", unit: "other" },
  { label: "High Pressure Switch Status", unit: "other" },
];

export const miniSplitPresets: PresetOption[] = [
  { label: "Return Air Temp", unit: "°F" },
  { label: "Supply Air Temp", unit: "°F" },
  { label: "Suction Pressure", unit: "psi" },
  { label: "Liquid Pressure", unit: "psi" },
  { label: "Suction Line Temp", unit: "°F" },
  { label: "Liquid Line Temp", unit: "°F" },
  { label: "Suction Saturation Temp", unit: "°F" },
  { label: "Condensing Saturation Temp", unit: "°F" },
  { label: "Superheat", unit: "°F" },
  { label: "Subcool", unit: "°F" },
  { label: "Compressor Amps", unit: "amps" },
  { label: "Line Voltage", unit: "volts" },
  { label: "Control Voltage (R-C)", unit: "volts" },
];

export const iceMachinePresets: PresetOption[] = [
  { label: "Water Fill Time", unit: "other" },
  { label: "Harvest Cycle Time", unit: "other" },
  { label: "Evap Coil Temp", unit: "°F" },
  { label: "Suction Pressure", unit: "psi" },
  { label: "Head Pressure", unit: "psi" },
  { label: "Liquid Pressure", unit: "psi" },
  { label: "Compressor Amps", unit: "amps" },
  { label: "Line Voltage", unit: "volts" },
  { label: "Water Supply Pressure", unit: "psi" },
  { label: "Water Temp", unit: "°F" },
  { label: "Bin Thermostat State", unit: "other" },
  { label: "Hot Gas Valve Voltage", unit: "volts" },
  { label: "Bin Control Status", unit: "other" },
  { label: "Water Level Control Status", unit: "other" },
];