
// app/lib/flowcharts.ts

export type FlowNode = {
  step: number; // 1..N
  check: string;
  how?: string;
  pass_condition?: string;
  fail_condition?: string;
  if_pass_next_step: number; // 0 = end
  if_fail_next_step: number; // 0 = end
  notes?: string;

  // Optional hints for UI
  suggested_measurement?: { label: string; unit: string };
};

export type Flowchart = {
  id: string;
  title: string;
  equipmentTypes: string[];
  tags: string[];
  intro: string;
  steps: FlowNode[];
};

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreFlowchart(flow: Flowchart, equipmentType: string, symptomText: string) {
  const eq = normalize(equipmentType);
  const sym = normalize(symptomText);

  let score = 0;

  // equipment match boost
  if (flow.equipmentTypes.map(normalize).includes(eq)) score += 12;

  // tag match
  for (const t of flow.tags) {
    const tt = normalize(t);
    if (!tt) continue;

    if (sym.includes(tt)) score += 5;

    const words = tt.split(" ").filter(Boolean);
    for (const w of words) {
      if (w.length >= 4 && sym.includes(w)) score += 1;
    }
  }

  // common phrases
  const has = (x: string) => sym.includes(x);
  if (has("not cooling") || has("no cooling") || has("no cool") || has("warm air")) score += flow.tags.some((t) => normalize(t).includes("cool")) ? 2 : 0;
  if (has("not heating") || has("no heat") || has("heat not working")) score += flow.tags.some((t) => normalize(t).includes("heat")) ? 2 : 0;
  if (has("iced") || has("ice") || has("freezing")) score += flow.tags.some((t) => normalize(t).includes("ice")) ? 3 : 0;

  return score;
}

export function matchFlowcharts(equipmentType: string, symptomText: string, limit = 6) {
  const scored = FLOWCHARTS.map((f) => ({ f, score: scoreFlowchart(f, equipmentType, symptomText) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function validateFlow(flow: Flowchart) {
  const steps = flow.steps.slice().sort((a, b) => a.step - b.step);
  const stepNums = new Set(steps.map((s) => s.step));
  if (steps.length === 0) return { ok: false as const, reason: "No steps" };

  for (const s of steps) {
    if (s.step < 1) return { ok: false as const, reason: "Step < 1" };
    if (typeof s.if_pass_next_step !== "number" || typeof s.if_fail_next_step !== "number") {
      return { ok: false as const, reason: "Missing next step" };
    }
    if (s.if_pass_next_step !== 0 && !stepNums.has(s.if_pass_next_step)) {
      return { ok: false as const, reason: `Step ${s.step} pass points to missing step ${s.if_pass_next_step}` };
    }
    if (s.if_fail_next_step !== 0 && !stepNums.has(s.if_fail_next_step)) {
      return { ok: false as const, reason: `Step ${s.step} fail points to missing step ${s.if_fail_next_step}` };
    }
  }
  return { ok: true as const };
}

/* =========================================================
   FLOWCHART LIBRARY (A2)
   Goal: “tech usable” flows that feel like field logic.
   Keep steps ~7 so Guided Mode stays fast.
========================================================= */

export const FLOWCHARTS: Flowchart[] = [
  // -----------------------------
  // RTU COOLING — COMPRESSOR NOT RUNNING
  // -----------------------------
  {
    id: "rtu_cool_no_cool_compressor_not_running",
    title: "RTU Cooling — No Cooling (Compressor NOT running)",
    equipmentTypes: ["RTU"],
    tags: ["not cooling", "no cooling", "no cool", "warm air", "compressor not running", "compressor off", "outdoor fan off"],
    intro:
      "Use this when the space is warm and the compressor is not running. Focus: call, safeties, contactor, capacitor, overload, wiring.",
    steps: [
      {
        step: 1,
        check: "Thermostat calling for cooling?",
        how: "Confirm COOL mode, setpoint below room temp, verify Y is energized (Y-C).",
        pass_condition: "Y is energized (call present).",
        fail_condition: "No call or thermostat misconfigured.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Fix call before anything else.",
        suggested_measurement: { label: "Control Voltage (Y-C)", unit: "volts" },
      },
      {
        step: 2,
        check: "Control power + board status OK?",
        how: "Check 24V transformer output, fuse, and board LEDs/error codes.",
        pass_condition: "24V steady and no lockout.",
        fail_condition: "No/low 24V or lockout present.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Reset lockout only after correcting cause.",
        suggested_measurement: { label: "Control Voltage (R-C)", unit: "volts" },
      },
      {
        step: 3,
        check: "Contactor pulled in when calling?",
        how: "Confirm contactor coil energized and contacts closed.",
        pass_condition: "Contactor pulls in.",
        fail_condition: "Contactor does not pull in.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "If coil not energized, trace through safeties (HP/LP, freezestat, economizer enable).",
      },
      {
        step: 4,
        check: "Line voltage present at contactor output?",
        how: "Measure L1/L2 in and T1/T2 out with contactor energized.",
        pass_condition: "Correct voltage at output.",
        fail_condition: "No/low voltage at output.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Bad contactor/loose lugs/burnt contacts.",
        suggested_measurement: { label: "Line Voltage", unit: "volts" },
      },
      {
        step: 5,
        check: "Compressor starts or just hums/trips?",
        how: "Listen/observe; if hum then trips, suspect capacitor, hard-start, or mechanical lock.",
        pass_condition: "Compressor starts and runs.",
        fail_condition: "Hums, trips overload, or won’t start.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "Do not keep cycling power; test start components.",
      },
      {
        step: 6,
        check: "Start components OK (capacitor / hard-start)?",
        how: "Inspect bulge/leak, test µF; verify correct rating and wiring.",
        pass_condition: "Capacitor in range and wiring correct.",
        fail_condition: "Capacitor failed/out of range.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Most common failure: run cap out of spec.",
      },
      {
        step: 7,
        check: "If start parts good: compressor winding/overload issue?",
        how: "Check winding resistance/meg; verify overload not open; confirm correct supply voltage under load.",
        pass_condition: "Windings/overload appear normal.",
        fail_condition: "Winding open/short/grounded or overload open.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "Escalate if windings fail or repeated overload trips.",
        suggested_measurement: { label: "Compressor Amps", unit: "amps" },
      },
    ],
  },

  // -----------------------------
  // RTU COOLING — COMPRESSOR RUNNING BUT NOT COOLING
  // -----------------------------
  {
    id: "rtu_cool_compressor_running_low_delta",
    title: "RTU Cooling — Compressor Running (Low/No Cooling)",
    equipmentTypes: ["RTU"],
    tags: ["not cooling", "warm air", "compressor running", "low delta", "not cold", "weak cooling"],
    intro:
      "Use this when the compressor runs but cooling is weak. Focus: airflow first, then economizer/mixed air, then refrigerant diagnosis (pressures, SH/SC).",
    steps: [
      {
        step: 1,
        check: "Airflow acceptable (filter/coil/blower)?",
        how: "Inspect filter, blower, belt, evap coil; confirm strong supply airflow.",
        pass_condition: "Airflow strong and coil not iced.",
        fail_condition: "Airflow weak or coil iced/dirty.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Fix airflow before interpreting pressures/temps.",
        suggested_measurement: { label: "External Static Pressure", unit: "inWC" },
      },
      {
        step: 2,
        check: "Economizer/mixed air not flooding warm air?",
        how: "Verify OA damper position; ensure it closes when it should; check mixed air temp.",
        pass_condition: "Economizer behaves correctly.",
        fail_condition: "Damper stuck open / incorrect operation.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Stuck OA damper can kill delta-T even if refrigeration is OK.",
      },
      {
        step: 3,
        check: "Measure suction + liquid/head pressures",
        how: "Record pressures and ambient; compare to expected for refrigerant and conditions.",
        pass_condition: "Pressures normal-ish.",
        fail_condition: "Suction/head abnormal.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "Abnormal pressures drive the next checks (SH/SC, restriction, condenser).",
        suggested_measurement: { label: "Suction Pressure", unit: "psi" },
      },
      {
        step: 4,
        check: "Check superheat and subcool",
        how: "Calculate SH/SC and compare to target for system type (TXV/FXO).",
        pass_condition: "SH/SC normal for system type.",
        fail_condition: "SH/SC indicates low charge or restriction.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Low charge often = low suction + high SH; restriction often = low suction + low SC (varies).",
        suggested_measurement: { label: "Superheat", unit: "°F" },
      },
      {
        step: 5,
        check: "Condenser condition OK?",
        how: "Inspect coil cleanliness and condenser fan(s); verify airflow across condenser and normal head pressure behavior.",
        pass_condition: "Condenser clean and fans OK.",
        fail_condition: "Dirty condenser or fan problem.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "Dirty condenser elevates head pressure and reduces capacity.",
        suggested_measurement: { label: "Discharge / Head Pressure", unit: "psi" },
      },
      {
        step: 6,
        check: "Compressor performance (amps/overheating)?",
        how: "Compare compressor amps to RLA and check for overheating or short-cycling.",
        pass_condition: "Amps normal and stable run.",
        fail_condition: "Amps abnormal or short cycling.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Low amps + poor cooling can indicate low load or failing compressor; high amps can indicate high head/mechanical issues.",
        suggested_measurement: { label: "Compressor Amps", unit: "amps" },
      },
      {
        step: 7,
        check: "Verify supply/return delta-T after corrections",
        how: "Measure return vs supply temp at steady run; typical 15–22°F depending on humidity/load.",
        pass_condition: "Delta-T acceptable.",
        fail_condition: "Delta-T still low.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "If delta remains low with normal refrigerant readings: re-check mixed air/economizer, bypass, duct leakage, or sensor location.",
        suggested_measurement: { label: "Delta T (Return-Supply)", unit: "°F" },
      },
    ],
  },

  // -----------------------------
  // RTU COOLING — COIL ICING / FREEZING
  // -----------------------------
  {
    id: "rtu_cool_coil_icing",
    title: "Cooling — Coil Icing / Freezing",
    equipmentTypes: ["RTU", "Split System", "Heat Pump", "Mini-Split"],
    tags: ["ice", "iced coil", "freezing", "coil icing", "frost", "frozen", "low airflow", "low suction"],
    intro:
      "Use this when the evaporator is icing. Priority: airflow + low load, then refrigerant charge/restriction, then controls.",
    steps: [
      {
        step: 1,
        check: "Airflow restriction present?",
        how: "Check filter, blower wheel, coil dirt, closed registers/dampers; verify strong airflow.",
        pass_condition: "Airflow good.",
        fail_condition: "Airflow restricted.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Airflow restriction is the most common cause of icing.",
        suggested_measurement: { label: "External Static Pressure", unit: "inWC" },
      },
      {
        step: 2,
        check: "Return air temp too low / low load?",
        how: "Confirm return air temp not abnormally low; check for short cycling or oversized unit.",
        pass_condition: "Return air temp normal for cooling call.",
        fail_condition: "Return air too low / low load condition.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Low load + long runtimes can freeze coils even with correct charge.",
        suggested_measurement: { label: "Return Air Temp", unit: "°F" },
      },
      {
        step: 3,
        check: "Suction pressure low?",
        how: "Measure suction and compare to expected saturation for refrigerant and load.",
        pass_condition: "Suction not abnormally low.",
        fail_condition: "Suction low.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "Low suction can drive coil temp below freezing.",
        suggested_measurement: { label: "Suction Pressure", unit: "psi" },
      },
      {
        step: 4,
        check: "Superheat indicates low charge or restriction?",
        how: "If SH high: suspect low charge/leak; if SH erratic/very low with low suction: suspect restriction/TXV issues.",
        pass_condition: "Superheat normal.",
        fail_condition: "Superheat abnormal.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Don’t add refrigerant without confirming airflow and SH/SC patterns.",
        suggested_measurement: { label: "Superheat", unit: "°F" },
      },
      {
        step: 5,
        check: "TXV / metering device responding?",
        how: "Check bulb placement/insulation, equalizer line, and signs of hunting; verify SC for TXV systems.",
        pass_condition: "Metering device appears normal.",
        fail_condition: "Suspect TXV stuck/hunting or restriction.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "A restricted metering device can cause low suction and icing.",
        suggested_measurement: { label: "Subcool", unit: "°F" },
      },
      {
        step: 6,
        check: "Defrost/control/low-temp cutout issues?",
        how: "Verify freezestat/coil sensor location and that it opens when coil temp drops too low (where applicable).",
        pass_condition: "Controls operate correctly.",
        fail_condition: "Sensor/freezestat fault suspected.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Bad sensors can allow icing without a shutdown.",
      },
      {
        step: 7,
        check: "After thaw + fixes: re-check delta-T",
        how: "Run steady and verify normal cooling delta-T and stable pressures.",
        pass_condition: "Stable normal operation.",
        fail_condition: "Icing returns.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "If icing returns after airflow + charge checks, escalate for deeper restriction/compressor performance diagnostics.",
      },
    ],
  },

  // -----------------------------
  // RTU COOLING — HIGH HEAD PRESSURE
  // -----------------------------
  {
    id: "cool_high_head_pressure",
    title: "Cooling — High Head Pressure / High Discharge",
    equipmentTypes: ["RTU", "Split System", "Heat Pump"],
    tags: ["high head", "high pressure", "high discharge", "tripping high pressure", "hp switch", "overheating", "head pressure"],
    intro:
      "Use this when head pressure is high or HP switch trips. Priority: condenser airflow, coil cleanliness, fan, overcharge/non-condensables, restrictions.",
    steps: [
      {
        step: 1,
        check: "Condenser coil clean and unobstructed?",
        how: "Inspect coil for dirt/grease; verify no blocked airflow (cottonwood, trash).",
        pass_condition: "Coil clean and airflow clear.",
        fail_condition: "Coil dirty/blocked.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Dirty condenser is #1 high head cause.",
      },
      {
        step: 2,
        check: "Condenser fans operating correctly?",
        how: "Verify fans run, correct rotation, and amps are reasonable; check fan capacitor if PSC.",
        pass_condition: "Fans OK.",
        fail_condition: "Fan not running/weak/reversed.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Fan failure drives head pressure up fast.",
        suggested_measurement: { label: "Condenser Fan Amps", unit: "amps" },
      },
      {
        step: 3,
        check: "Confirm actual head pressure (not sensor error)",
        how: "Measure head pressure with gauges and compare to any sensor reading.",
        pass_condition: "Gauge confirms high head.",
        fail_condition: "Gauge normal; sensor may be wrong.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "Don’t chase phantom head pressure.",
        suggested_measurement: { label: "Discharge / Head Pressure", unit: "psi" },
      },
      {
        step: 4,
        check: "Subcooling high (possible overcharge)?",
        how: "Check SC; high SC with high head can indicate overcharge or condenser flooding issues.",
        pass_condition: "Subcool not abnormally high.",
        fail_condition: "Subcool high.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Overcharge and non-condensables can look similar; use full pattern.",
        suggested_measurement: { label: "Subcool", unit: "°F" },
      },
      {
        step: 5,
        check: "Restriction on liquid line?",
        how: "Look for large temp drop across filter-drier/solenoid; check sight glass if present.",
        pass_condition: "No restriction signs.",
        fail_condition: "Restriction suspected.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "Restrictions can elevate head and starve evap.",
      },
      {
        step: 6,
        check: "Ambient conditions and condenser sizing considered?",
        how: "Confirm ambient not extreme; verify condenser not short-cycling hot air (recirculation).",
        pass_condition: "Ambient/recirc not a factor.",
        fail_condition: "Recirculation or extreme ambient.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Hot air recirculation can mimic dirty coil.",
      },
      {
        step: 7,
        check: "If still high: suspect non-condensables or metering issues",
        how: "Consider non-condensables/air in system or incorrect refrigerant; escalate for recovery/evac/recharge.",
        pass_condition: "Resolved.",
        fail_condition: "Still high head.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "Escalate: recovery + weigh-in charge, deep evacuation, verify refrigerant type.",
      },
    ],
  },

  // -----------------------------
  // COOLING — LOW SUCTION / LOW CAPACITY
  // -----------------------------
  {
    id: "cool_low_suction",
    title: "Cooling — Low Suction / Starved Evaporator",
    equipmentTypes: ["RTU", "Split System", "Heat Pump"],
    tags: ["low suction", "low pressure", "starved", "restriction", "low charge", "poor cooling", "low head"],
    intro:
      "Use this when suction is low and capacity is poor. Pattern matters: SH/SC + airflow.",
    steps: [
      {
        step: 1,
        check: "Airflow correct?",
        how: "Confirm filter/coil/blower and proper airflow; check static if needed.",
        pass_condition: "Airflow OK.",
        fail_condition: "Airflow not OK.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Low airflow can cause low suction and icing.",
        suggested_measurement: { label: "External Static Pressure", unit: "inWC" },
      },
      {
        step: 2,
        check: "Measure suction pressure + superheat",
        how: "Record suction and SH; compare to expected for system type and load.",
        pass_condition: "Readings stable and interpretable.",
        fail_condition: "Readings unstable/unknown.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Get SH to distinguish low charge vs restriction/TXV behavior.",
        suggested_measurement: { label: "Superheat", unit: "°F" },
      },
      {
        step: 3,
        check: "Low charge pattern?",
        how: "Low suction + high SH often indicates low charge/leak (verify SC usually low).",
        pass_condition: "Pattern NOT low-charge.",
        fail_condition: "Pattern matches low-charge/leak.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "If leak suspected, leak-check before topping off.",
        suggested_measurement: { label: "Subcool", unit: "°F" },
      },
      {
        step: 4,
        check: "Restriction pattern?",
        how: "Restrictions can show low suction with abnormal SC and temperature drops across drier/solenoid.",
        pass_condition: "Restriction unlikely.",
        fail_condition: "Restriction likely.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Feel for cold spot/frosting across a restriction.",
      },
      {
        step: 5,
        check: "TXV / metering device working?",
        how: "Check bulb placement/insulation, equalizer, and signs of hunting or stuck valve.",
        pass_condition: "TXV appears normal.",
        fail_condition: "TXV issue suspected.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "TXV problems can masquerade as low charge.",
      },
      {
        step: 6,
        check: "Check liquid line / drier temperature drop",
        how: "Measure temp in/out of drier; significant drop suggests restriction.",
        pass_condition: "No significant drop.",
        fail_condition: "Temp drop indicates restriction.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Replace drier if confirmed and follow proper procedures.",
      },
      {
        step: 7,
        check: "Confirm capacity (delta-T) after corrections",
        how: "Verify return/supply delta-T and stable pressures/temps.",
        pass_condition: "Capacity restored.",
        fail_condition: "Still poor.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "Escalate for compressor performance test or deeper system analysis.",
        suggested_measurement: { label: "Delta T (Return-Supply)", unit: "°F" },
      },
    ],
  },

  // -----------------------------
  // RTU HEATING — NO HEAT GAS SEQUENCE (expanded)
  // -----------------------------
  {
    id: "rtu_heat_no_heat_gas_sequence",
    title: "RTU/Furnace — No Heat (Gas sequence & lockout)",
    equipmentTypes: ["RTU", "Furnace"],
    tags: ["no heat", "not heating", "lockout", "ignition", "pressure switch", "flame sensor", "short cycling", "rollout"],
    intro:
      "Use this when gas heat won’t light or won’t stay lit. Follow the call-for-heat sequence and isolate where it fails.",
    steps: [
      {
        step: 1,
        check: "Thermostat calling for heat?",
        how: "Confirm HEAT mode, setpoint above room temp, verify W is energized (R-W).",
        pass_condition: "Heat call present.",
        fail_condition: "No call present.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Fix thermostat/wiring first.",
        suggested_measurement: { label: "Control Voltage (R-W)", unit: "volts" },
      },
      {
        step: 2,
        check: "Inducer runs and pressure switch proves?",
        how: "Verify inducer start and switch closure; inspect tubing and venting.",
        pass_condition: "Switch proves reliably.",
        fail_condition: "Does not prove or drops out.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Common: blocked vent, water in tubing, cracked hose, weak inducer.",
        suggested_measurement: { label: "Inducer Amps", unit: "amps" },
      },
      {
        step: 3,
        check: "Ignition device active?",
        how: "Verify spark or hot surface igniter glows and is commanded.",
        pass_condition: "Ignition present.",
        fail_condition: "No ignition.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "HSI cracks are common; confirm voltage and resistance per spec.",
      },
      {
        step: 4,
        check: "Gas valve energized + inlet gas available?",
        how: "Confirm 24V to gas valve and inlet gas pressure within expected range.",
        pass_condition: "Valve energized and inlet gas OK.",
        fail_condition: "No 24V or inlet gas not OK.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "If no 24V to valve, board/safeties are stopping it.",
        suggested_measurement: { label: "Gas Inlet Pressure", unit: "inWC" },
      },
      {
        step: 5,
        check: "Flame established and flame signal stable?",
        how: "Verify microamps and grounding; clean sensor if low.",
        pass_condition: "Flame signal stable.",
        fail_condition: "Drops out/weak signal.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "Dirty flame sensor/grounding is very common.",
        suggested_measurement: { label: "Flame Sensor", unit: "µA" },
      },
      {
        step: 6,
        check: "Limits/rollouts staying closed?",
        how: "Confirm airflow and blower operation; verify limits remain closed during heating run.",
        pass_condition: "Limits stable.",
        fail_condition: "Limit opens / rollout trips.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Limit trips: airflow restriction, blower speed, duct static, overfire, exchanger issues.",
        suggested_measurement: { label: "External Static Pressure", unit: "inWC" },
      },
      {
        step: 7,
        check: "Heat rise within nameplate range?",
        how: "Measure return vs supply temperature after steady operation and compare to nameplate.",
        pass_condition: "Heat rise in range.",
        fail_condition: "Heat rise out of range.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "Out of range: airflow or gas input issue; escalate if exchanger suspected.",
        suggested_measurement: { label: "Heat Rise", unit: "°F" },
      },
    ],
  },

  // -----------------------------
  // HEAT PUMP — NOT HEATING (defrost / reversing valve)
  // -----------------------------
  {
    id: "heatpump_not_heating_defrost_rv",
    title: "Heat Pump — Not Heating (Defrost / Reversing Valve)",
    equipmentTypes: ["Heat Pump"],
    tags: ["not heating", "no heat", "heat pump", "blowing cold", "defrost", "reversing valve", "aux heat"],
    intro:
      "Use this for heat pumps blowing cool air in HEAT mode. Focus: call, O/B, defrost behavior, aux heat enable, airflow.",
    steps: [
      {
        step: 1,
        check: "Thermostat calling for HEAT and correct O/B setting?",
        how: "Confirm thermostat is configured for the heat pump brand (O or B logic) and a heat call is present.",
        pass_condition: "Heat call and O/B logic correct.",
        fail_condition: "Incorrect O/B setting or no call.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Wrong O/B setting can keep unit in cooling.",
      },
      {
        step: 2,
        check: "Reversing valve energized correctly?",
        how: "Verify O/B output and whether valve should be energized in HEAT for this system.",
        pass_condition: "Valve behavior matches system design.",
        fail_condition: "Valve behavior incorrect.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "If valve stuck, you may see symptoms like cooling in heat mode.",
      },
      {
        step: 3,
        check: "Outdoor unit running and not in a fault/lockout?",
        how: "Check outdoor board status, pressure switches, and whether compressor is running.",
        pass_condition: "Outdoor unit runs.",
        fail_condition: "Outdoor unit not running or locked out.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "Resolve outdoor faults first.",
      },
      {
        step: 4,
        check: "Defrost stuck or frequent defrost?",
        how: "Confirm defrost sensor/board operation; check for constant defrost or failure to exit.",
        pass_condition: "Defrost normal.",
        fail_condition: "Defrost abnormal.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Bad defrost sensor can cause poor heating performance.",
      },
      {
        step: 5,
        check: "Aux/E-heat coming on when needed?",
        how: "Verify aux heat enable and sequencer/relay operation; check strips current draw.",
        pass_condition: "Aux heat operates when commanded.",
        fail_condition: "Aux heat not operating.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "If outdoor capacity low, aux heat may be required.",
      },
      {
        step: 6,
        check: "Indoor airflow correct?",
        how: "Check filter, blower speed, and static pressure for heating mode.",
        pass_condition: "Airflow correct.",
        fail_condition: "Airflow restricted.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "Airflow issues reduce delivered heat.",
        suggested_measurement: { label: "External Static Pressure", unit: "inWC" },
      },
      {
        step: 7,
        check: "Verify supply/return temperature rise",
        how: "Measure supply and return temps at steady state; compare to expected for heat pump + aux status.",
        pass_condition: "Temp rise acceptable.",
        fail_condition: "Temp rise low.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "If low rise persists, escalate for refrigerant/compressor performance checks.",
      },
    ],
  },

  // -----------------------------
  // AIRFLOW — LOW AIRFLOW GENERIC
  // -----------------------------
  {
    id: "airflow_low_generic",
    title: "Low Airflow — Any System (fast airflow isolation)",
    equipmentTypes: ["RTU", "Split System", "Heat Pump", "Furnace", "Mini-Split", "Make-Up Air Unit"],
    tags: ["low airflow", "weak airflow", "no airflow", "high static", "filter", "blower", "dirty coil"],
    intro:
      "Use this when airflow is weak. Fix airflow first — it corrupts heating/cooling diagnosis.",
    steps: [
      {
        step: 1,
        check: "Filter/return restrictions?",
        how: "Inspect filter, return grilles, dampers, obstructions.",
        pass_condition: "Filter clean and return open.",
        fail_condition: "Restriction found.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Clogged filter is the most common airflow issue.",
      },
      {
        step: 2,
        check: "Blower running at correct speed?",
        how: "Verify blower operation; confirm correct tap/VFD/ECM; check belt tension.",
        pass_condition: "Blower speed correct.",
        fail_condition: "Blower not running or wrong speed.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Common: cap, belt slip, ECM module, VFD command.",
      },
      {
        step: 3,
        check: "Static pressure excessive?",
        how: "Measure ESP; compare to rated max and typical targets.",
        pass_condition: "Static normal.",
        fail_condition: "Static high.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "High static: duct restriction, closed dampers, dirty coil, undersized duct.",
        suggested_measurement: { label: "External Static Pressure", unit: "inWC" },
      },
      {
        step: 4,
        check: "Evaporator coil or blower wheel dirty/iced?",
        how: "Inspect coil and blower wheel; look for ice and dirt.",
        pass_condition: "Clean and not iced.",
        fail_condition: "Dirty or iced.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Icing can be airflow or refrigerant; fix airflow first.",
      },
      {
        step: 5,
        check: "Supply duct restrictions / dampers?",
        how: "Check takeoffs, dampers, collapsed flex, zoning dampers.",
        pass_condition: "Duct open and balanced.",
        fail_condition: "Restriction found.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "After airflow is corrected, re-run heating/cooling diagnosis.",
      },
    ],
  },

  // -----------------------------
  // ECONOMIZER — STUCK OPEN / WRONG MODE
  // -----------------------------
  {
    id: "rtu_economizer_stuck_open",
    title: "RTU — Economizer Stuck Open / Mixed Air Problem",
    equipmentTypes: ["RTU", "Make-Up Air Unit"],
    tags: ["economizer", "damper stuck", "mixed air", "warm air", "not cooling", "oa damper", "outside air"],
    intro:
      "Use this when cooling is weak but refrigeration seems okay. Economizer problems can mimic low capacity.",
    steps: [
      {
        step: 1,
        check: "OA damper position correct for conditions?",
        how: "Visually inspect damper position while calling for cooling; confirm it closes when it should.",
        pass_condition: "Damper behaves normally.",
        fail_condition: "Damper stuck open or incorrect.",
        if_pass_next_step: 2,
        if_fail_next_step: 0,
        notes: "Stuck open OA damper can destroy delta-T.",
      },
      {
        step: 2,
        check: "Mixed air temp matches expectations?",
        how: "Measure mixed air temp entering coil; compare to OA/RA temps.",
        pass_condition: "Mixed air temp reasonable.",
        fail_condition: "Mixed air temp too warm/cold.",
        if_pass_next_step: 3,
        if_fail_next_step: 0,
        notes: "Bad sensors or actuator issues can cause wrong damper control.",
      },
      {
        step: 3,
        check: "Actuator drives smoothly and linkages intact?",
        how: "Command open/close and observe motion; inspect linkage/slop.",
        pass_condition: "Actuator/linkage good.",
        fail_condition: "Actuator/linkage failing.",
        if_pass_next_step: 4,
        if_fail_next_step: 0,
        notes: "Mechanical binding is common.",
      },
      {
        step: 4,
        check: "Economizer controller sensors OK?",
        how: "Check OA/RA sensors readings and wiring; compare to actual temp.",
        pass_condition: "Sensors accurate.",
        fail_condition: "Sensor inaccurate/open/short.",
        if_pass_next_step: 5,
        if_fail_next_step: 0,
        notes: "Bad sensor = wrong logic.",
      },
      {
        step: 5,
        check: "Minimum position set correctly?",
        how: "Verify minimum OA setting not excessively open for current load/conditions.",
        pass_condition: "Min position reasonable.",
        fail_condition: "Min position too high.",
        if_pass_next_step: 6,
        if_fail_next_step: 0,
        notes: "Too much OA can cause comfort problems and energy waste.",
      },
      {
        step: 6,
        check: "After correction: verify delta-T and comfort",
        how: "Confirm supply/return delta-T improves and discharge air temp is stable.",
        pass_condition: "Performance restored.",
        fail_condition: "Still weak.",
        if_pass_next_step: 7,
        if_fail_next_step: 0,
        notes: "If still weak, shift to refrigeration flow (pressures/SH/SC).",
      },
      {
        step: 7,
        check: "Escalate if controls integration issue suspected",
        how: "If BAS/controls are driving damper incorrectly, escalate to controls technician.",
        pass_condition: "Resolved.",
        fail_condition: "Not resolved.",
        if_pass_next_step: 0,
        if_fail_next_step: 0,
        notes: "Document sensor readings and commanded positions for the controls team.",
      },
    ],
  },
];