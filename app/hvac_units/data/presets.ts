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
    options: ["Dehumidifier — Commercial", "Dehumidifier — Residential", "Humidifier", "ERV / HRV", "Other"],
  },
];

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