"use client";

import React, { useState } from "react";

type WiringDiagram = {
  id: string;
  title: string;
  category: "cooling" | "heating" | "heatpump" | "refrigeration" | "controls";
  equipment: string[];
  description: string;
  components: { name: string; color: string; function: string }[];
  sequence: { step: number; action: string; voltage: string; note?: string }[];
  commonFaults: { symptom: string; cause: string; test: string }[];
  tips: string[];
};

const DIAGRAMS: WiringDiagram[] = [
  {
    id: "single-stage-cooling",
    title: "Single Stage Cooling — Low Voltage Control Circuit",
    category: "cooling",
    equipment: ["Residential split system", "Package unit", "RTU single stage"],
    description: "Standard 24V control circuit for single-stage cooling. Thermostat calls for cooling → contactor energizes compressor and condenser fan → air handler fan runs on Y call.",
    components: [
      { name: "R (24V Hot)", color: "#dc2626", function: "24V power from transformer secondary — always hot when system has power" },
      { name: "C (Common)", color: "#1d4ed8", function: "24V common from transformer — completes circuit back to transformer" },
      { name: "Y (Cooling)", color: "#ca8a04", function: "Thermostat cooling call — energizes contactor coil and air handler fan relay" },
      { name: "G (Fan)", color: "#16a34a", function: "Fan call — energizes indoor blower independently of cooling call" },
      { name: "W (Heat)", color: "#7c3aed", function: "Heat call — not used in cooling-only, used in heat/cool systems" },
      { name: "Contactor Coil", color: "#374151", function: "24V coil that closes high voltage contacts to power compressor and condenser fan" },
    ],
    sequence: [
      { step: 1, action: "Thermostat closes Y terminal to R", voltage: "24V", note: "Y wire goes hot — this is the cooling call" },
      { step: 2, action: "24V travels from Y to contactor coil", voltage: "24V", note: "Coil receives 24V between Y and C" },
      { step: 3, action: "Contactor coil energizes and pulls in", voltage: "24V coil / 240V line", note: "You should hear the 'click' of the contactor closing" },
      { step: 4, action: "Line voltage contacts close — compressor and condenser fan start", voltage: "208-240V", note: "Both run simultaneously off same contactor" },
      { step: 5, action: "G terminal energizes air handler blower", voltage: "24V", note: "Y also signals air handler — blower runs on cooling speed" },
      { step: 6, action: "System runs until thermostat is satisfied", voltage: "Continuous", note: "Thermostat opens Y → contactor drops out → compressor and fan stop" },
    ],
    commonFaults: [
      { symptom: "Contactor won't pull in", cause: "No 24V at Y, blown low voltage fuse, bad contactor coil, open high pressure switch", test: "Measure voltage at contactor coil terminals — should read 24V between Y and C during call" },
      { symptom: "Compressor hums but doesn't start", cause: "Bad capacitor, high head pressure, locked rotor", test: "Check capacitor MFD, check amp draw, check head pressure" },
      { symptom: "Condenser fan runs, compressor doesn't", cause: "Bad compressor capacitor (HERM section), open internal overload, bad compressor", test: "Check HERM capacitor section, wait 30 min for overload to reset, check compressor windings" },
      { symptom: "Compressor runs, indoor fan doesn't", cause: "Bad blower motor, bad fan relay on air handler control board, blown fuse", test: "Verify 24V on G at air handler, check fan relay output, check motor" },
      { symptom: "System short cycles", cause: "Dirty filter, low refrigerant, bad thermostat, low voltage issue", test: "Check filter, verify charge, measure 24V under load" },
    ],
    tips: [
      "Always verify 24V between R and C first — no 24V means transformer or fuse problem before anything else.",
      "Contactor not pulling in = measure at coil terminals first. If 24V is there and coil is good, the contactor is bad.",
      "If contactor is pitted or burned, replace it — don't just clean it. Pitted contacts cause voltage drop under load.",
      "High pressure lockout opens the Y circuit — if the compressor tripped on high pressure, the contactor won't pull in until the lockout resets.",
      "G and Y both go to the air handler — Y energizes the cooling relay and G energizes the fan relay. Thermostat always sends G with Y for cooling.",
    ],
  },

  {
    id: "heat-pump-basic",
    title: "Heat Pump — Reversing Valve and Defrost Control Circuit",
    category: "heatpump",
    equipment: ["Residential heat pump", "Package heat pump", "Mini-split heat pump"],
    description: "Heat pump control circuit adds reversing valve (O or B wire) to standard cooling circuit. Defrost board monitors outdoor coil temperature and ambient to initiate defrost cycle.",
    components: [
      { name: "O (Reversing Valve — Carrier/Trane/Rheem)", color: "#dc2626", function: "Energized in COOLING mode on most brands — de-energizes for heating" },
      { name: "B (Reversing Valve — Goodman/Lennox)", color: "#7c3aed", function: "Energized in HEATING mode on some brands — opposite of O" },
      { name: "Y (Compressor)", color: "#ca8a04", function: "Energizes compressor contactor — same as cooling-only systems" },
      { name: "W2/Aux (Aux/Emergency Heat)", color: "#374151", function: "Energizes electric heat strips when heat pump can't keep up or in emergency heat mode" },
      { name: "Defrost Board", color: "#1d4ed8", function: "Monitors outdoor coil temp and run time — initiates defrost when coil temp drops below threshold" },
      { name: "Reversing Valve Solenoid", color: "#16a34a", function: "4-way valve that shifts refrigerant flow direction — determines heating vs cooling mode" },
    ],
    sequence: [
      { step: 1, action: "Heating call — Y energizes compressor, O/B controls reversing valve direction", voltage: "24V", note: "On O-type: O de-energizes (valve shifts to heating). On B-type: B energizes." },
      { step: 2, action: "Compressor runs, condenser fan runs in heating mode", voltage: "240V", note: "In heating mode, outdoor unit is the evaporator — it's absorbing heat from outside air" },
      { step: 3, action: "Defrost board monitors outdoor coil temp sensor", voltage: "Signal", note: "Initiates defrost when coil temp drops below setpoint (typically 26-30°F) and timer expires" },
      { step: 4, action: "Defrost initiated — reversing valve shifts to cooling position", voltage: "24V", note: "Outdoor fan motor stops — compressor runs in cooling mode to push hot gas to outdoor coil" },
      { step: 5, action: "Electric heat strips energize to compensate during defrost", voltage: "240V", note: "Prevents cold air blowing into conditioned space during defrost cycle" },
      { step: 6, action: "Defrost terminates — coil temp rises above setpoint or time limit reached", voltage: "Signal", note: "Typically terminates at 57-65°F coil temp or after 10-14 minutes max" },
    ],
    commonFaults: [
      { symptom: "Unit stuck in heating mode, won't cool", cause: "Reversing valve stuck or solenoid not energized on O-type system", test: "Verify 24V at O terminal during cooling call. Tap reversing valve body lightly while system runs." },
      { symptom: "Unit stuck in cooling mode, blowing cold in heat mode", cause: "Reversing valve stuck or O/B wired wrong", test: "Verify O/B configuration matches thermostat setting. Check voltage at solenoid coil." },
      { symptom: "Defrost not initiating", cause: "Bad defrost sensor, bad defrost board, timer issue", test: "Check defrost sensor resistance vs temperature chart. Manually jump defrost pins on board to test." },
      { symptom: "Defrost runs constantly", cause: "Stuck defrost relay, bad termination sensor, bad board", test: "Check termination sensor, verify board is reading sensor correctly" },
      { symptom: "Aux heat runs all the time", cause: "Heat pump not keeping up, outdoor thermostat set wrong, low refrigerant", test: "Check charge, check outdoor lockout thermostat setting, verify heat pump is actually running in heat mode" },
    ],
    tips: [
      "O vs B is the most common heat pump wiring confusion. O = energized in cooling (Carrier, Trane, Rheem, York). B = energized in heating (Goodman, some Lennox). Wrong wiring means system heats when you want cooling.",
      "Reversing valve stuck mid-position = low suction AND low head pressure simultaneously. Compressor sounds different. Tap the valve body — sometimes unsticks a mechanically stuck valve.",
      "Defrost initiation is time AND temperature — most boards require BOTH the coil to be below setpoint AND the timer to have run before initiating. A unit that 'never defrosts' may just have a clean coil.",
      "Always check outdoor fan operation in defrost — fan MUST stop during defrost. Fan running during defrost means the fan contactor or defrost board isn't working correctly.",
    ],
  },

  {
    id: "gas-furnace",
    title: "Gas Furnace — Ignition and Safety Circuit",
    category: "heating",
    equipment: ["Residential gas furnace", "Commercial gas furnace", "Package unit gas heat"],
    description: "Modern gas furnace uses induced draft motor, hot surface igniter, and gas valve in sequence. Safety controls — limit switch, rollout switch, pressure switches — open the circuit if unsafe conditions exist.",
    components: [
      { name: "IFC (Integrated Furnace Control Board)", color: "#1d4ed8", function: "Sequences all components — monitors safety controls and runs ignition timing" },
      { name: "Inducer Motor", color: "#374151", function: "Starts first — pulls combustion gases through heat exchanger and proves pressure with switch" },
      { name: "Draft Pressure Switch", color: "#7c3aed", function: "Normally open — closes when inducer creates negative pressure. Board won't proceed if this doesn't close." },
      { name: "Hot Surface Igniter (HSI)", color: "#dc2626", function: "Silicon carbide or nitride element — heats to 1800°F+ to ignite gas. Fragile — don't touch." },
      { name: "Gas Valve", color: "#16a34a", function: "24V solenoid valve — opens to allow gas flow after igniter is at temperature" },
      { name: "Flame Sensor", color: "#ca8a04", function: "Rod in flame — rectifies AC to DC microamp signal. Board proves flame within 7-10 seconds or closes gas valve." },
      { name: "Limit Switch", color: "#dc2626", function: "Normally closed — opens on high heat. Causes board to shut off gas, run blower to cool down." },
      { name: "Rollout Switch", color: "#dc2626", function: "Manual reset — opens if flame rolls out of heat exchanger. Indicates cracked heat exchanger or blocked flue." },
    ],
    sequence: [
      { step: 1, action: "W call from thermostat — board receives heat call", voltage: "24V", note: "Board verifies all safety controls are closed before proceeding" },
      { step: 2, action: "Inducer motor energizes — prepares for ignition", voltage: "120V", note: "Board waits for pressure switch to close — typically 15-30 seconds" },
      { step: 3, action: "Pressure switch closes — board confirms draft is established", voltage: "24V signal", note: "If pressure switch doesn't close: check inducer operation, check pressure switch, check blocked flue" },
      { step: 4, action: "Hot surface igniter energizes — heat-up period", voltage: "120V", note: "Takes 15-40 seconds to reach ignition temperature. Board times this exactly." },
      { step: 5, action: "Gas valve opens — ignition occurs", voltage: "24V", note: "Board opens gas valve while igniter is still hot. Flame should light within 2-3 seconds." },
      { step: 6, action: "Flame sensor proves flame — gas valve stays open", voltage: "Microamps (0.5-4µA typical)", note: "If board doesn't see flame signal within 7-10 seconds, gas valve closes. Board retries 2-3 times then locks out." },
      { step: 7, action: "Blower delay — indoor fan starts after heat exchanger warms", voltage: "120V", note: "Typically 30-60 second blower delay prevents cold air from blowing at start of cycle" },
    ],
    commonFaults: [
      { symptom: "Inducer runs, igniter glows, no ignition", cause: "Bad gas valve, gas supply issue, igniter not hot enough", test: "Verify gas supply pressure, test gas valve with 24V direct, check igniter temperature rating" },
      { symptom: "Igniter glows, gas lights, then shuts off", cause: "Dirty or failed flame sensor, poor ground, flame sensor out of flame", test: "Clean flame sensor with fine steel wool, check microamp reading (should be 0.5µA+), verify sensor is in flame path" },
      { symptom: "Pressure switch won't close", cause: "Weak inducer motor, blocked flue or condensate drain, stuck pressure switch, cracked pressure switch hose", test: "Check inducer RPM, measure pressure at switch with manometer, verify hose integrity, jump switch to test (temporarily)" },
      { symptom: "Limit switch opens repeatedly", cause: "Dirty filter, blocked return, bad blower motor, cracked heat exchanger", test: "Check filter, verify blower operation and CFM, check for cracks in heat exchanger (CO test)" },
      { symptom: "Rollout switch open (manual reset)", cause: "CRACKED HEAT EXCHANGER — treat as serious. Also check for blocked flue.", test: "Do not reset and fire without inspecting heat exchanger thoroughly. Check for CO. Check flue for blockage." },
    ],
    tips: [
      "Rollout switch tripped = treat it as a cracked heat exchanger until proven otherwise. This is a CO risk. Don't just reset it.",
      "Flame sensor reading below 0.5µA is marginal — clean it. Below 0.1µA = no flame signal = lockout. Clean with fine steel wool, not sandpaper.",
      "Pressure switch hose is a common failure point — check for cracks, condensate in the hose, or hose pulled off the inducer port.",
      "Board error codes are your friend — count the LED flashes before you do anything else. Most boards code every fault condition.",
      "Igniter failure: silicon carbide igniters glow orange-red. Silicon nitride glow more of a dull red. If it doesn't glow at all in 30 seconds — bad igniter or no power to igniter.",
    ],
  },

  {
    id: "walk-in-refrigeration",
    title: "Walk-in Cooler / Freezer — Refrigeration Control Circuit",
    category: "refrigeration",
    equipment: ["Walk-in cooler", "Walk-in freezer", "Reach-in cooler"],
    description: "Walk-in refrigeration control circuit coordinates thermostat/controller, evaporator fan motors, defrost heaters, drain heater, and defrost termination. Defrost timing is critical.",
    components: [
      { name: "Box Thermostat / Controller", color: "#1d4ed8", function: "Controls when compressor/condensing unit runs based on box temperature setpoint" },
      { name: "Defrost Timer / Controller", color: "#374151", function: "Initiates defrost at programmed intervals — typically 2-6x per day depending on application" },
      { name: "Defrost Heaters", color: "#dc2626", function: "Electric elements that melt frost from evaporator coil during defrost cycle" },
      { name: "Defrost Termination Thermostat", color: "#ca8a04", function: "Normally closed — opens when coil reaches defrost termination temp (typically 55-65°F). Ends defrost." },
      { name: "Evaporator Fan Motors", color: "#16a34a", function: "Run continuously in coolers, cycle off during defrost and often off during compressor off cycle in freezers" },
      { name: "Drain Heater", color: "#7c3aed", function: "Prevents drain pan and drain line from freezing — runs continuously in most freezer applications" },
      { name: "Anti-Sweat Heaters", color: "#374151", function: "Door frame heaters on reach-ins — prevent condensation and ice on door gaskets" },
    ],
    sequence: [
      { step: 1, action: "Box temp rises above setpoint — thermostat/controller closes circuit to condensing unit", voltage: "24V or 120V/240V", note: "Controller energizes condensing unit contactor or directly switches the unit" },
      { step: 2, action: "Evaporator fans run — circulate cold air through box", voltage: "120V or 208V", note: "In freezers, fans often cycle with compressor. In coolers, fans typically run continuously." },
      { step: 3, action: "Box reaches setpoint — controller opens circuit, compressor stops", voltage: "Off", note: "Evaporator fans may continue or stop depending on controller settings" },
      { step: 4, action: "Defrost timer initiates defrost cycle", voltage: "Switches", note: "Compressor/condenser stops, evaporator fans stop, defrost heaters energize" },
      { step: 5, action: "Defrost heaters melt frost from evaporator coil", voltage: "240V typically", note: "Defrost continues until termination thermostat opens OR time limit reached — whichever comes first" },
      { step: 6, action: "Defrost termination — heaters off, drip delay begins", voltage: "Off", note: "Drip delay (typically 3-10 min) lets water drain before fans restart — prevents ice shards in box" },
      { step: 7, action: "Evaporator fans restart — normal refrigeration resumes", voltage: "120V/208V", note: "If box temp is above setpoint, compressor restarts immediately" },
    ],
    commonFaults: [
      { symptom: "Box temperature too warm, coil iced over", cause: "Defrost not working — heaters failed, termination thermostat stuck open, timer not initiating", test: "Manually initiate defrost. Check heater resistance (should not be open circuit). Check termination thermostat continuity when cold." },
      { symptom: "Defrost runs continuously", cause: "Defrost termination thermostat stuck closed or failed, defrost timer stuck", test: "Check termination thermostat — should open at defrost termination temp. Check timer advance." },
      { symptom: "Water on floor after defrost", cause: "Blocked drain, failed drain heater, drain too small for defrost load", test: "Check drain for ice blockage, verify drain heater is operating, check drain heater continuity" },
      { symptom: "Box too cold, product freezing in cooler", cause: "Thermostat out of calibration, thermostat bulb location wrong, controller setpoint wrong", test: "Verify thermostat bulb location and calibration, check setpoint vs actual box temp" },
      { symptom: "Ice on evaporator fan blades", cause: "Fans running during defrost, defrost not completing, air bypass around coil", test: "Verify fans shut off during defrost, check coil is fully defrosting, check for air bypass paths" },
    ],
    tips: [
      "Always manually initiate a defrost before leaving a walk-in call and verify it completes and terminates properly. This is the #1 callback preventer on walk-in work.",
      "Termination thermostat location matters — must be in the coldest part of the coil. If mounted wrong, defrost terminates before the bottom of the coil defrosts.",
      "Drain heater continuity check: open circuit drain heater = ice dam in drain pan = water on floor = angry customer.",
      "Defrost heater wiring: in series-parallel configurations, one failed heater often causes all heaters in that branch to fail. Check each heater individually.",
      "Fan delay after defrost is critical in freezers — restart fans too soon and water from defrost gets blown around the box and refreezes on product.",
      "Compressor short cycling on walk-ins is often a refrigerant or TXV issue — check superheat at evaporator outlet, not just box temperature.",
    ],
  },

  {
    id: "low-voltage-troubleshooting",
    title: "24V Control Circuit — Systematic Troubleshooting Guide",
    category: "controls",
    equipment: ["All HVAC systems with 24V control"],
    description: "Systematic approach to troubleshooting any 24V control circuit. Most HVAC control problems are in the low voltage circuit. Follow this sequence before condemning components.",
    components: [
      { name: "Transformer", color: "#dc2626", function: "Steps down 120V or 208-240V to 24V AC. Primary on line voltage side, secondary on 24V side. Common ratings: 40VA, 75VA." },
      { name: "Low Voltage Fuse", color: "#ca8a04", function: "Protects transformer secondary — usually 3-5A. Located on board or in-line. Blown fuse = shorted wire or component somewhere." },
      { name: "R Terminal", color: "#dc2626", function: "24V hot — always hot when system has power. Measure R to C to verify transformer is working." },
      { name: "C Terminal", color: "#1d4ed8", function: "24V common — must be connected at both thermostat and all components. Missing C wire is most common smart thermostat installation problem." },
      { name: "Safety Controls", color: "#374151", function: "High pressure switch, low pressure switch, freeze stat, limit switch — all wired in series in the R circuit. Any one open kills the call." },
    ],
    sequence: [
      { step: 1, action: "Verify 24V between R and C at the air handler/furnace", voltage: "24V AC ±10%", note: "No voltage here = transformer problem, blown fuse, or tripped breaker. Start here always." },
      { step: 2, action: "Verify 24V at thermostat R and C terminals", voltage: "24V AC", note: "Voltage at board but not thermostat = broken wire between board and thermostat" },
      { step: 3, action: "With a call active, verify 24V on the output terminal (Y, W, G) at the board", voltage: "24V AC", note: "24V at R but not at output terminal during call = bad thermostat or open safety control in series" },
      { step: 4, action: "Verify voltage arrives at the controlled component (contactor coil, gas valve, etc.)", voltage: "24V AC", note: "24V leaving board but not at component = broken wire in that circuit" },
      { step: 5, action: "Verify component responds to voltage", voltage: "24V AC at coil/solenoid", note: "24V present at component but no operation = failed component — contactor coil, gas valve, etc." },
    ],
    commonFaults: [
      { symptom: "No 24V at R — system completely dead", cause: "Blown transformer, tripped breaker, blown low voltage fuse, shorted wire", test: "Check breaker first. Check fuse on board. Measure primary voltage at transformer (should be 120V or 208-240V). If primary good and no secondary = bad transformer." },
      { symptom: "24V at board, no call response", cause: "Open safety control, bad thermostat, broken wire", test: "Jump R to Y (briefly, carefully) at the board to see if system responds. If yes = thermostat or wire. If no = board or contactor." },
      { symptom: "Fuse keeps blowing", cause: "Shorted wire, shorted component, wrong size fuse installed", test: "Disconnect loads one at a time to find short. Check wire insulation for damage. Verify correct fuse amperage." },
      { symptom: "System works at board but not at thermostat", cause: "Broken R or C wire, corroded thermostat connection, bad thermostat", test: "Measure 24V at thermostat R and C. Swap thermostat with a known good one." },
      { symptom: "Intermittent operation", cause: "Loose wire connection, marginal transformer output, thermostat drafts, intermittent safety control", test: "Wiggle all connections, measure transformer output under load, check safety control continuity when system acts up" },
    ],
    tips: [
      "Always measure R to C first. Every single time. Before you touch anything else. It takes 10 seconds and tells you if the transformer is working.",
      "Missing C wire is the #1 smart thermostat problem. Thermostat steals power from Y or G to power itself — causes erratic operation, short cycling, and false calls.",
      "Low voltage fuse blowing = there is a short somewhere. Find the short before replacing the fuse or the new fuse blows immediately.",
      "Safety controls in series means any open switch kills the call. High pressure, low pressure, limit, freeze stat — measure across each one with R to see which one is open.",
      "Jump R to Y at the board carefully and only momentarily to isolate thermostat vs board vs wiring. Never jump R to Y at the thermostat terminals.",
      "Voltage drop under load: a marginal transformer may read 26V with no load and drop to 18V under load. Measure with the system running, not just when the system is off.",
    ],
  },
];

const CATEGORY_CONFIG = {
  cooling:       { label: "Cooling",       color: "#2563eb", bg: "#dbeafe",  icon: "❄️" },
  heating:       { label: "Heating",       color: "#dc2626", bg: "#fee2e2",  icon: "🔥" },
  heatpump:      { label: "Heat Pump",     color: "#7c3aed", bg: "#f3e8ff",  icon: "🔄" },
  refrigeration: { label: "Refrigeration", color: "#0891b2", bg: "#cffafe",  icon: "🧊" },
  controls:      { label: "Controls",      color: "#374151", bg: "#f1f5f9",  icon: "🎛️" },
};

type Props = { equipmentType?: string };

export function WiringReference({ equipmentType }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sequence" | "faults" | "tips">("sequence");
  const [filter, setFilter] = useState<string>("all");

  const selectedDiagram = selected ? DIAGRAMS.find(d => d.id === selected) : null;

  // Auto-suggest based on equipment type
  const suggested = equipmentType
    ? DIAGRAMS.filter(d => d.equipment.some(e =>
        e.toLowerCase().includes(equipmentType.toLowerCase()) ||
        equipmentType.toLowerCase().includes(e.toLowerCase().split(" ")[0])
      ))
    : [];

  const filtered = DIAGRAMS.filter(d =>
    filter === "all" || d.category === filter
  );

  if (selectedDiagram) {
    const cat = CATEGORY_CONFIG[selectedDiagram.category];
    return (
      <div>
        <button onClick={() => setSelected(null)}
          style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
          ← Back to library
        </button>

        {/* Header */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, flexWrap: "wrap" as const }}>
            <span style={{ fontSize: 24 }}>{cat.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{selectedDiagram.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {selectedDiagram.equipment.map(e => (
                  <span key={e} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color }}>{e}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{selectedDiagram.description}</div>
        </div>

        {/* Components */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8 }}>Key components</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {selectedDiagram.components.map(c => (
              <div key={c.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, borderLeft: `3px solid ${c.color}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: c.color, width: 160, flexShrink: 0 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{c.function}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 12 }}>
          {(["sequence", "faults", "tips"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: activeTab === t ? "#fff" : "transparent", color: activeTab === t ? "#0f1f3d" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", boxShadow: activeTab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {t === "sequence" ? "🔢 Operation Sequence" : t === "faults" ? "⚠️ Common Faults" : "💡 Tech Tips"}
            </button>
          ))}
        </div>

        {/* Sequence */}
        {activeTab === "sequence" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {selectedDiagram.sequence.map(s => (
              <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0f1f3d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{s.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3 }}>{s.action}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20, background: "#f0fdf4", color: "#166534" }}>{s.voltage}</span>
                    {s.note && <span style={{ fontSize: 11, color: "#64748b" }}>{s.note}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Faults */}
        {activeTab === "faults" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {selectedDiagram.commonFaults.map((f, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>⚠ {f.symptom}</div>
                <div style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}><strong>Likely cause:</strong> {f.cause}</div>
                <div style={{ fontSize: 12, color: "#2563eb" }}><strong>Test:</strong> {f.test}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {activeTab === "tips" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {selectedDiagram.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #f97316", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{tip}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#1d4ed8" }}>
        <strong>📋 About this library:</strong> Generic control circuit logic for troubleshooting any system. Not manufacturer-specific — use these as a framework alongside the unit's actual wiring diagram. Always verify against the label diagram on the equipment.
      </div>

      {/* Suggested based on job */}
      {suggested.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8 }}>🎯 Suggested for your current job</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {suggested.map(d => {
              const cat = CATEGORY_CONFIG[d.category];
              return (
                <button key={d.id} onClick={() => { setSelected(d.id); setActiveTab("sequence"); }}
                  style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1f3d" }}>{d.title}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{d.equipment.join(" · ")}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 12 }}>
        <button onClick={() => setFilter("all")} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === "all" ? "#0f1f3d" : "#e2e8f0"}`, background: filter === "all" ? "#0f1f3d" : "#fff", color: filter === "all" ? "#fff" : "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>All</button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${filter === key ? cat.color : "#e2e8f0"}`, background: filter === key ? cat.bg : "#fff", color: filter === key ? cat.color : "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Diagram list */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {filtered.map(d => {
          const cat = CATEGORY_CONFIG[d.category];
          return (
            <div key={d.id} onClick={() => { setSelected(d.id); setActiveTab("sequence"); }}
              style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLDivElement).style.background = "#f0f9ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d" }}>{d.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: cat.bg, color: cat.color }}>{cat.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{d.description}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {d.equipment.map(e => (
                      <span key={e} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>{e}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: "#94a3b8", fontSize: 16 }}>→</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
        Always verify against the actual wiring diagram on the unit. These are generic circuit logic references — manufacturer implementations vary.
      </div>
    </div>
  );
}