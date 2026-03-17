export type RepairGuidanceMode = "apprentice" | "experienced";

export type RepairGuidanceItem = {
  title: string;
  suspectedPart: string;
  why: string;
  confirmTest: string;
  toolToUse: string;
  expectedReading: string;
  passInterpretation: string;
  failInterpretation: string;
  nextIfFail: string;
  fieldCheck: string;
  likelyFix: string;
  commonMistake: string;
  safetyNote: string;
  confidence?: number | null;
};

type LikelyCause = {
  cause?: string;
  probability_percent?: number;
  why?: string;
};

type DiagnosisLike = {
  likely_causes?: LikelyCause[];
};

function pickGuidanceFromCause(causeText: string, whyText: string, equipmentType: string): RepairGuidanceItem {
  const c = causeText.toLowerCase();
  const eq = equipmentType.toLowerCase();

   if (c.includes("capacitor")) {
    return {
      title: "Capacitor / start component guidance",
      suspectedPart: "Run capacitor / start capacitor / start assist components",
      why: whyText || "The diagnosis points toward a start or run component issue.",
      confirmTest: "Shut power off, discharge capacitor, verify actual capacitance against rating, and inspect for swelling or oil leakage.",
      toolToUse: "Multimeter with capacitance function",
      expectedReading: "Measured capacitance should be within the rated tolerance on the capacitor label.",
      passInterpretation: "If capacitance is in range and wiring is sound, the capacitor may not be the root cause.",
      failInterpretation: "If capacitance is weak, open, shorted, or the case is swollen/oily, the capacitor is failed.",
      nextIfFail: "Replace the failed capacitor with the exact rated replacement, then restart and verify motor/compressor operation and amp draw.",
      fieldCheck: "Check capacitor rating, wiring condition, contactor points, compressor/fan amp draw, and whether the motor is trying to start.",
      likelyFix: "Replace the failed capacitor or start component with the exact rated replacement and recheck operation.",
      commonMistake: "Replacing the capacitor without checking the motor amperage or verifying the motor is not the real problem.",
      safetyNote: "Capacitors can hold charge even with power off. Verify power is off and discharge safely before handling.",
    };
  }

    if (c.includes("contactor")) {
    return {
      title: "Contactor guidance",
      suspectedPart: "Contactor / power switching circuit",
      why: whyText || "The diagnosis points toward a switching or line-voltage delivery issue.",
      confirmTest: "Check for control voltage at the coil, verify line and load voltage, and inspect the contacts for pitting or failure to pull in.",
      toolToUse: "Multimeter",
      expectedReading: "Proper coil control voltage should be present on a call, and load-side voltage should match line-side voltage when the contactor is pulled in.",
      passInterpretation: "If the coil is energized and voltage passes through normally, the contactor is likely not the root issue.",
      failInterpretation: "If the coil has proper control voltage but does not pull in, or if there is major voltage drop across the contacts, the contactor is suspect.",
      nextIfFail: "Replace the contactor and verify the downstream motor/compressor is not overloading the circuit.",
      fieldCheck: "Look for burnt contacts, weak coil pull-in, loose wires, and voltage drop across the contactor.",
      likelyFix: "Replace the contactor if the coil or contacts are defective and verify proper control signal and downstream load condition.",
      commonMistake: "Replacing the contactor without checking whether a low-voltage control problem is the real cause.",
      safetyNote: "Live line voltage is present in this circuit. Use proper electrical safety procedures and verify readings carefully.",
    };
  }

    if (c.includes("low charge") || c.includes("undercharge")) {
    return {
      title: "Low charge guidance",
      suspectedPart: "Refrigerant circuit / leak-related charge loss",
      why: whyText || "The diagnosis points toward an undercharged system.",
      confirmTest: "Verify with superheat, subcool, saturation temperatures, and system behavior. Then leak check before adding refrigerant.",
      toolToUse: "Digital gauges, pipe clamps, refrigerant scale, leak detector",
      expectedReading: "Readings should consistently support undercharge, such as elevated superheat and low evaporator saturation relative to normal operation.",
      passInterpretation: "If the full set of readings does not support undercharge, look harder at airflow, restrictions, metering, or load conditions.",
      failInterpretation: "If the system clearly shows undercharge and leak evidence is present, the charge loss is real and must be corrected properly.",
      nextIfFail: "Leak check the system, repair the leak, evacuate if opened, and weigh in the proper charge per procedure.",
      fieldCheck: "Inspect braze joints, schrader cores, evaporator, condenser, and fittings for oil residue or leak evidence.",
      likelyFix: "Find and repair the leak, replace any failed leak point or schrader core, evacuate if opened, and charge properly by procedure.",
      commonMistake: "Adding refrigerant without confirming the leak source and system condition first.",
      safetyNote: "Handle refrigerant according to proper recovery and charging procedures. Do not vent refrigerant.",
    };
  }

   if (c.includes("restriction") || c.includes("metering")) {
    return {
      title: "Restriction / metering guidance",
      suspectedPart: "TXV, piston, filter-drier, or restricted liquid feed",
      why: whyText || "The diagnosis suggests a feed or restriction problem in the refrigeration circuit.",
      confirmTest: "Compare pressure, superheat, subcool, and temperature drop across possible restriction points such as driers or metering components.",
      toolToUse: "Digital gauges, temperature clamps, thermometer",
      expectedReading: "Abnormal superheat/subcool pattern or noticeable temperature drop across a restriction point can support a restriction diagnosis.",
      passInterpretation: "If temperatures and pressures do not support a restriction, recheck airflow and charge before condemning the metering device.",
      failInterpretation: "If readings strongly support restricted feed or abnormal metering behavior, isolate the exact point before opening the system.",
      nextIfFail: "Confirm whether the restriction is at the drier, metering device, or liquid line, then repair, evacuate, and recharge properly.",
      fieldCheck: "Check for high superheat, abnormal subcool, temperature drop across drier, bulb mounting, equalizer condition, and frost pattern.",
      likelyFix: "Correct the restriction source, replace failed drier or metering part if confirmed, evacuate if opened, and recharge properly.",
      commonMistake: "Condemning the TXV before verifying airflow, charge condition, and temperature drop across the drier.",
      safetyNote: "Opening the sealed system requires proper recovery, evacuation, and charging procedures.",
    };
  }

    if (c.includes("airflow") || c.includes("dirty coil") || c.includes("filter")) {
    return {
      title: "Airflow guidance",
      suspectedPart: eq.includes("furnace")
        ? "Blower / filter / duct / heat delivery path"
        : "Blower / filter / coil / duct airflow path",
      why: whyText || "The diagnosis points toward an airflow-related problem.",
      confirmTest: "Check static pressure, filter drop, coil drop, blower speed, and temperature split or heat rise as applicable.",
      toolToUse: "Manometer, thermometer, visual inspection light",
      expectedReading: "Static and temperature readings should fall within the equipment’s acceptable operating range after airflow issues are corrected.",
      passInterpretation: "If airflow measurements are normal, move back toward refrigeration, controls, or load-related causes.",
      failInterpretation: "If static or temperature readings show restriction or poor airflow, correct airflow before adjusting charge or replacing major parts.",
      nextIfFail: "Fix the restriction, clean the coil, correct blower setup, and retest static and temperature readings.",
      fieldCheck: "Inspect filter, blower wheel, indoor coil, evaporator condition, belt, motor speed tap, and blocked ducts/registers.",
      likelyFix: "Correct the airflow restriction, clean the coil, replace the filter, repair blower issues, and verify final static/temperature readings.",
      commonMistake: "Adjusting refrigerant charge before correcting obvious airflow problems.",
      safetyNote: "Shut off power before servicing blower assemblies or reaching into moving equipment.",
    };
  }

   if (c.includes("pressure switch") || c.includes("inducer") || c.includes("vent")) {
    return {
      title: "Heat draft / proving guidance",
      suspectedPart: "Inducer motor, pressure switch, tubing, or venting path",
      why: whyText || "The diagnosis points toward a heat proving or venting issue.",
      confirmTest: "Verify inducer operation, check pressure switch tubing and port, measure draft/proving conditions, and inspect venting.",
      toolToUse: "Multimeter, manometer, visual inspection",
      expectedReading: "The inducer should run, the proving path should be clear, and the pressure switch should make or break correctly under proper draft conditions.",
      passInterpretation: "If draft and switch proving are normal, continue deeper into ignition sequence or board logic.",
      failInterpretation: "If draft is weak, tubing/ports are blocked, or the switch does not respond correctly, the proving path problem must be corrected.",
      nextIfFail: "Correct venting/tubing/port issues first, then replace the inducer or switch only if direct testing proves the component failed.",
      fieldCheck: "Check for blocked venting, cracked tubing, weak inducer, water in the hose, plugged ports, and switch operation.",
      likelyFix: "Repair the venting/proving problem, replace the failed inducer or pressure switch only after confirming the real cause.",
      commonMistake: "Replacing the pressure switch when the actual issue is blocked venting or weak inducer performance.",
      safetyNote: "This involves combustion equipment. Verify safe venting and operation before leaving the unit in service.",
    };
  }

   if (c.includes("flame sensor") || c.includes("ignition") || c.includes("gas valve")) {
    return {
      title: "Ignition / flame proving guidance",
      suspectedPart: "Igniter, flame sensor, gas valve, or ignition sequence control",
      why: whyText || "The diagnosis points toward an ignition or flame proving issue.",
      confirmTest: "Verify call for heat, ignition sequence, igniter operation, gas valve signal, and flame sensor microamps.",
      toolToUse: "Multimeter, microamp meter or meter in series for flame signal, manometer if gas pressure needs checking",
      expectedReading: "The ignition sequence should progress correctly and flame signal should be strong enough for reliable proving.",
      passInterpretation: "If ignition and flame proving are normal, continue checking airflow, limits, or intermittent control behavior.",
      failInterpretation: "If ignition fails, flame is not sensed, or gas valve control is missing, isolate the failed sequence step before replacing parts.",
      nextIfFail: "Measure the failed step directly: igniter output, gas valve signal, flame microamps, grounding, burner carryover, and gas pressure.",
      fieldCheck: "Inspect flame sensor condition and ground path, igniter integrity, burner carryover, gas pressure, and board sequence.",
      likelyFix: "Clean/replace the failed ignition component, correct gas or grounding issues, and verify a full successful heating cycle.",
      commonMistake: "Replacing the flame sensor without measuring microamps or checking burner grounding and flame carryover.",
      safetyNote: "Use proper gas and electrical safety procedures when testing live heating circuits.",
    };
  }

   if (c.includes("defrost")) {
    return {
      title: "Defrost guidance",
      suspectedPart: "Defrost timer/board, heater circuit, termination control, or related refrigeration condition",
      why: whyText || "The diagnosis points toward a defrost-related issue.",
      confirmTest: "Check whether the unit enters defrost, whether heaters energize, and whether termination control behaves correctly.",
      toolToUse: "Multimeter, amp clamp, thermometer",
      expectedReading: "The unit should enter defrost when appropriate, heaters should energize when commanded, and termination should occur correctly.",
      passInterpretation: "If the defrost sequence behaves correctly, look harder at infiltration, load, drain, and refrigeration conditions.",
      failInterpretation: "If the sequence fails to initiate, heat, or terminate properly, isolate the failed defrost stage before replacing parts.",
      nextIfFail: "Identify whether the failure is initiation, heater circuit, or termination, then replace only the proven failed control/component.",
      fieldCheck: "Inspect heater amps, timer/board state, termination stat/sensor, box temp, coil temp, and heavy frost pattern.",
      likelyFix: "Replace the failed control or heater component only after confirming the defrost sequence failure point.",
      commonMistake: "Replacing a defrost timer without checking heater circuit continuity/amps or the termination control.",
      safetyNote: "Defrost circuits may involve line voltage and hot surfaces. Test carefully.",
    };
  }

    if (c.includes("water valve") || c.includes("fill valve") || c.includes("water fill")) {
    return {
      title: "Ice machine water fill guidance",
      suspectedPart: "Water inlet valve / fill circuit / water supply path",
      why: whyText || "The diagnosis points toward a water fill or inlet problem.",
      confirmTest: "Verify incoming water supply, check for valve command during fill, and confirm water actually enters the reservoir/trough correctly.",
      toolToUse: "Multimeter, water pressure gauge if available, visual inspection",
      expectedReading: "The valve should receive the proper command/voltage during fill and the machine should fill in a normal amount of time.",
      passInterpretation: "If the valve is energized and water flow is normal, look harder at float, level control, or scaling issues.",
      failInterpretation: "If the valve is not opening, not being energized, or water supply is weak/restricted, the fill path is the problem.",
      nextIfFail: "Check supply shutoff/filter/pressure first, then verify valve voltage and replace the failed valve/control only after proving the fault.",
      fieldCheck: "Inspect inlet screen, filter, water pressure, valve operation, fill timing, float movement, and trough/reservoir condition.",
      likelyFix: "Repair the water supply issue or replace the failed inlet valve/control component and verify a normal fill cycle.",
      commonMistake: "Replacing the inlet valve before checking water pressure, filter restriction, or board command.",
      safetyNote: "Use electrical safety when checking live valve circuits and shut water off before opening the water path.",
    };
  }

  if (c.includes("harvest") || c.includes("release")) {
    return {
      title: "Ice machine harvest guidance",
      suspectedPart: "Harvest control / release system / slab or cube release path",
      why: whyText || "The diagnosis points toward a harvest or release problem.",
      confirmTest: "Verify the machine enters harvest at the right time and confirm the release method is actually working.",
      toolToUse: "Multimeter, thermometer, visual inspection",
      expectedReading: "The machine should shift into harvest correctly and the slab/cubes should release in a normal pattern and time.",
      passInterpretation: "If harvest timing and release look normal, recheck freeze thickness, scaling, and complaint details.",
      failInterpretation: "If harvest starts late, fails to start, or release is incomplete, the harvest control/mechanism path is suspect.",
      nextIfFail: "Check board timing, harvest assist or hot gas action, scale condition, and release surface condition before replacing major parts.",
      fieldCheck: "Inspect release pattern, slab/cube thickness, plate condition, scale, hot gas assist if used, and control timing.",
      likelyFix: "Correct the failed harvest control or release issue and verify the machine completes repeated normal harvest cycles.",
      commonMistake: "Blaming refrigeration first when the real issue is harvest timing, scale, or release mechanism behavior.",
      safetyNote: "Use caution around moving parts, hot surfaces, and live controls during harvest testing.",
    };
  }

  if (c.includes("hot gas")) {
    return {
      title: "Hot gas valve guidance",
      suspectedPart: "Hot gas valve / harvest gas routing circuit",
      why: whyText || "The diagnosis points toward a hot gas assisted harvest problem.",
      confirmTest: "Verify the valve is being commanded during harvest and that harvest behavior changes appropriately when it operates.",
      toolToUse: "Multimeter, thermometer, visual inspection",
      expectedReading: "The hot gas valve should receive the correct signal during harvest and contribute to a normal release cycle.",
      passInterpretation: "If the valve is being commanded and harvest still fails, inspect scaling, plate condition, and control timing.",
      failInterpretation: "If the valve is not being energized or is stuck/not functioning, harvest performance can be directly affected.",
      nextIfFail: "Check the control signal, coil condition, valve operation, and related tubing/circuit behavior before replacing the valve.",
      fieldCheck: "Inspect coil voltage, valve actuation, harvest timing, and whether release improves when the circuit is active.",
      likelyFix: "Repair the control issue or replace the failed hot gas valve if direct testing proves it is defective.",
      commonMistake: "Replacing the valve without confirming the board actually sends the command during harvest.",
      safetyNote: "This may involve live voltage and hot refrigeration lines. Use proper caution.",
    };
  }

  if (c.includes("bin control") || c.includes("bin thermostat") || c.includes("bin full")) {
    return {
      title: "Ice machine bin control guidance",
      suspectedPart: "Bin control / bin thermostat / ice level shutoff circuit",
      why: whyText || "The diagnosis points toward a bin control or ice level issue.",
      confirmTest: "Verify whether the bin control is open/closed in the proper state and whether it is falsely stopping production.",
      toolToUse: "Multimeter and visual inspection",
      expectedReading: "The bin control should change state correctly based on actual ice level and machine condition.",
      passInterpretation: "If the bin control behaves normally, continue into the main freeze/harvest sequence.",
      failInterpretation: "If the bin control is stuck, misreading, or falsely indicating full bin, it can stop ice production.",
      nextIfFail: "Check the control state, placement, wiring, and actual bin condition, then replace the failed control if proven bad.",
      fieldCheck: "Inspect sensor placement, thermostat state, wiring, contamination, and whether the machine restarts when the control is bypass-tested correctly.",
      likelyFix: "Correct the bin control issue and verify normal stop/start behavior based on actual ice level.",
      commonMistake: "Condemning the main control board when the machine is only being held off by a bad bin control input.",
      safetyNote: "Use safe testing practices if temporarily bypassing controls for diagnosis.",
    };
  }

  if (c.includes("scale") || c.includes("water distribution") || c.includes("water system")) {
    return {
      title: "Ice machine scale / water system guidance",
      suspectedPart: "Water distribution path / scale buildup / reservoir or float system",
      why: whyText || "The diagnosis points toward a water-side performance issue.",
      confirmTest: "Inspect water distribution, trough/sump condition, scale buildup, float action, and freeze surface condition.",
      toolToUse: "Visual inspection, cleaning tools, thermometer if needed",
      expectedReading: "Water should distribute evenly and machine surfaces/controls should operate without scale interference.",
      passInterpretation: "If the water system is clean and distributing normally, move back toward refrigeration or control sequence issues.",
      failInterpretation: "If scale or poor distribution is obvious, that condition can directly cause poor freeze, harvest, or production performance.",
      nextIfFail: "Clean/descale the system as appropriate, restore normal water flow and level control, then re-evaluate cycle operation.",
      fieldCheck: "Inspect trough, sump, float, distribution tube, spray pattern, plate condition, and visible scale buildup.",
      likelyFix: "Clean/descale the machine and repair any failed water-side components affecting fill or distribution.",
      commonMistake: "Chasing refrigeration problems when the real issue is heavy scale or poor water distribution.",
      safetyNote: "Use proper chemical handling and cleaning procedures when descaling.",
    };
  }

  if (c.includes("dirty condenser") || c.includes("condenser") || c.includes("high head")) {
    return {
      title: "Ice machine condenser / heat rejection guidance",
      suspectedPart: "Condenser coil, condenser fan, or heat rejection path",
      why: whyText || "The diagnosis points toward poor heat rejection affecting production or freeze performance.",
      confirmTest: "Check condenser cleanliness, fan operation, airflow/water flow as applicable, and compare head pressure behavior to normal conditions.",
      toolToUse: "Visual inspection, gauges, amp meter",
      expectedReading: "Condenser operation and head pressure should be appropriate for the machine’s current ambient/load conditions.",
      passInterpretation: "If heat rejection looks normal, continue deeper into water system, freeze, or harvest logic.",
      failInterpretation: "If the condenser is fouled or heat rejection is poor, freeze efficiency and production will suffer.",
      nextIfFail: "Clean the condenser, verify fan/water-cooled operation, and recheck cycle performance before condemning refrigeration components.",
      fieldCheck: "Inspect condenser coil, fan blade, motor amps, ambient around the machine, and signs of head pressure stress.",
      likelyFix: "Restore proper heat rejection and verify improved freeze/production performance.",
      commonMistake: "Condemning the compressor or charge before correcting an obviously dirty condenser.",
      safetyNote: "Use electrical safety and proper cleaning methods around condenser components.",
    };
  }
  
    if (c.includes("low pressure switch")) {
    return {
      title: "Low pressure switch guidance",
      suspectedPart: "Low pressure switch / low-pressure safety circuit",
      why: whyText || "The diagnosis points toward a low-pressure safety issue.",
      confirmTest: "Verify actual suction pressure and compare it to the switch state before condemning the switch itself.",
      toolToUse: "Digital gauges and multimeter",
      expectedReading: "If suction pressure is truly low, the switch may be opening correctly. If pressure is normal, the switch/control path may be faulty.",
      passInterpretation: "If suction pressure and switch behavior agree, the switch may be doing its job and the real cause is system-related.",
      failInterpretation: "If the switch is open with normal suction pressure, the switch or wiring/control path is suspect.",
      nextIfFail: "Check suction pressure, refrigerant condition, airflow, evaporator load, and wiring before replacing the switch.",
      fieldCheck: "Inspect suction pressure, evaporator conditions, wiring, reset behavior if applicable, and whether the switch is opening under a real low-pressure condition.",
      likelyFix: "Correct the true low-pressure cause if present, or replace the failed switch only after proving it is not responding correctly.",
      commonMistake: "Replacing the low pressure switch without checking actual suction pressure and system operating conditions.",
      safetyNote: "Do not bypass a safety and leave the unit running. Use it only for controlled diagnosis if appropriate.",
    };
  }

  if (c.includes("high pressure switch")) {
    return {
      title: "High pressure switch guidance",
      suspectedPart: "High pressure switch / high-pressure safety circuit",
      why: whyText || "The diagnosis points toward a high-pressure safety issue.",
      confirmTest: "Verify actual head pressure and compare it to the switch state before replacing the switch.",
      toolToUse: "Digital gauges and multimeter",
      expectedReading: "If head pressure is truly excessive, the switch may be opening correctly. If pressure is normal, the switch/control path may be faulty.",
      passInterpretation: "If high head pressure is real, look for condenser airflow, dirty coil, overcharge, or restriction causes.",
      failInterpretation: "If the switch is open without truly high pressure, the switch or wiring/control path may be defective.",
      nextIfFail: "Check condenser condition, fan operation, ambient/load, charge condition, and switch state before replacing parts.",
      fieldCheck: "Inspect condenser cleanliness, airflow, fan amps, head pressure, and whether the switch state matches reality.",
      likelyFix: "Correct the true high-pressure cause, or replace the failed switch only after proving abnormal switch behavior.",
      commonMistake: "Replacing the high pressure switch without checking real head pressure and condenser performance.",
      safetyNote: "High-pressure trips often indicate a real system problem. Do not reset repeatedly without finding the cause.",
    };
  }

  if (c.includes("pressure switch")) {
    return {
      title: "Furnace pressure switch guidance",
      suspectedPart: "Pressure switch / proving circuit / inducer draft path",
      why: whyText || "The diagnosis points toward a furnace draft proving issue.",
      confirmTest: "Verify inducer operation, venting, tubing, port cleanliness, and proving conditions before replacing the switch.",
      toolToUse: "Multimeter and manometer",
      expectedReading: "The switch should change state correctly when the inducer establishes proper draft/proving conditions.",
      passInterpretation: "If proving conditions are weak, blocked, or unstable, the switch may be reacting correctly.",
      failInterpretation: "If proving conditions are correct but the switch still fails to respond, the switch or its immediate circuit is suspect.",
      nextIfFail: "Inspect tubing, ports, venting, inducer performance, and then replace the switch only if direct testing proves failure.",
      fieldCheck: "Check inducer amps/sound, vent blockage, cracked tubing, water in hose, plugged ports, and switch response.",
      likelyFix: "Correct the draft/proving problem or replace the failed pressure switch if it is not responding to proper conditions.",
      commonMistake: "Replacing the switch when the real issue is a blocked vent, plugged port, or weak inducer.",
      safetyNote: "This is part of safe combustion proving. Verify safe venting before returning the unit to service.",
    };
  }

  if (c.includes("limit switch")) {
    return {
      title: "Limit switch guidance",
      suspectedPart: "High-limit switch / overtemperature protection circuit",
      why: whyText || "The diagnosis points toward a limit or overheating issue.",
      confirmTest: "Check heat rise, blower airflow, static pressure, filter, and coil condition before replacing the limit.",
      toolToUse: "Multimeter, thermometer, manometer",
      expectedReading: "A normal heat rise and airflow condition should not drive the limit open during normal operation.",
      passInterpretation: "If temperature rise is excessive or airflow is poor, the limit may be opening correctly to protect the unit.",
      failInterpretation: "If airflow and temperature are normal but the limit is open, the switch or connection may be faulty.",
      nextIfFail: "Correct airflow or heat delivery problems first; replace the limit only if it fails under proper operating conditions.",
      fieldCheck: "Inspect filter, blower, wheel, motor speed, indoor coil, static pressure, and heat rise.",
      likelyFix: "Restore proper airflow/temperature conditions or replace the failed limit switch if proven defective.",
      commonMistake: "Replacing the limit without checking airflow, heat rise, and static pressure first.",
      safetyNote: "A tripped limit can indicate dangerous overheating. Do not ignore the reason it opened.",
    };
  }

  if (c.includes("rollout switch")) {
    return {
      title: "Rollout switch guidance",
      suspectedPart: "Rollout safety / unsafe burner or venting condition",
      why: whyText || "The diagnosis points toward a rollout or unsafe combustion condition.",
      confirmTest: "Inspect burner flame pattern, carryover, heat exchanger area, venting, and combustion conditions before resetting or replacing anything.",
      toolToUse: "Multimeter and combustion/visual inspection tools",
      expectedReading: "Rollout should remain normal during safe burner operation with stable flame carryover and proper venting.",
      passInterpretation: "If there is true rollout or flame disturbance, the switch may be doing its job and the unsafe condition must be corrected.",
      failInterpretation: "If there is no actual rollout and the switch remains open or unstable, the switch or connection may be faulty.",
      nextIfFail: "Investigate burner condition, venting, exchanger concerns, and flame pattern before replacing the switch.",
      fieldCheck: "Inspect burners, flame carryover, venting, exchanger area, soot, and signs of abnormal combustion.",
      likelyFix: "Correct the unsafe combustion/venting issue, or replace the failed rollout safety only after proving it is not reacting to a real hazard.",
      commonMistake: "Resetting rollout repeatedly without investigating the underlying combustion problem.",
      safetyNote: "Treat rollout as a serious safety event until proven otherwise.",
    };
  }

  if (c.includes("condensate safety")) {
    return {
      title: "Condensate safety guidance",
      suspectedPart: "Condensate overflow / drain safety circuit",
      why: whyText || "The diagnosis points toward a condensate safety shutdown or open drain protection circuit.",
      confirmTest: "Check the drain path, pan, trap, slope, and whether the safety switch is opening because water is actually backing up.",
      toolToUse: "Multimeter and visual inspection",
      expectedReading: "The safety should remain normal when the drain path is clear and no overflow/back-up exists.",
      passInterpretation: "If water is backing up, the safety may be opening correctly and the drain problem must be fixed first.",
      failInterpretation: "If the drain is clear but the safety remains open, the switch, wiring, or mounting may be faulty.",
      nextIfFail: "Clear and verify the drain first, then retest the safety before replacing it.",
      fieldCheck: "Inspect drain line, trap, pan, slime buildup, safety switch state, and evidence of overflow.",
      likelyFix: "Clear the drain issue or replace the failed condensate safety only after confirming the drain path is normal.",
      commonMistake: "Bypassing the condensate safety without fixing the water problem or confirming switch behavior.",
      safetyNote: "Do not leave condensate safeties bypassed in service.",
    };
  }

  if (c.includes("bin control")) {
    return {
      title: "Ice machine bin control guidance",
      suspectedPart: "Bin control / ice level shutoff circuit",
      why: whyText || "The diagnosis points toward a bin control or full-bin shutoff issue.",
      confirmTest: "Verify actual bin condition and confirm the control changes state correctly based on real ice level.",
      toolToUse: "Multimeter and visual inspection",
      expectedReading: "The bin control should change state at the correct ice level and should not falsely hold the machine off.",
      passInterpretation: "If the bin is truly full or the control state matches actual conditions, continue into the main cycle logic.",
      failInterpretation: "If the control falsely reads full/not full, the control, placement, contamination, or wiring may be the problem.",
      nextIfFail: "Check sensor placement, cleanliness, wiring, and true control state before replacing the bin control.",
      fieldCheck: "Inspect bin level condition, sensor placement, contamination, wire condition, and whether the machine restarts appropriately.",
      likelyFix: "Correct the bin control issue and verify normal machine stop/start behavior.",
      commonMistake: "Replacing the main board when the machine is actually being held off by a faulty bin control input.",
      safetyNote: "Use safe diagnosis practices if temporarily bypassing controls for testing.",
    };
  }

  if (c.includes("water level control")) {
    return {
      title: "Ice machine water level control guidance",
      suspectedPart: "Float / water level sensor / reservoir level control",
      why: whyText || "The diagnosis points toward a water level control issue.",
      confirmTest: "Verify actual water level movement and confirm the float/sensor changes state correctly during fill and operation.",
      toolToUse: "Multimeter and visual inspection",
      expectedReading: "The level control should respond correctly as the sump/reservoir fills and empties.",
      passInterpretation: "If level control changes state normally, continue into valve, board, or water path issues.",
      failInterpretation: "If the control sticks, falsely indicates level, or never changes state, the level control path is suspect.",
      nextIfFail: "Inspect float movement, scaling, reservoir condition, and sensor response before replacing the part.",
      fieldCheck: "Check float freedom, slime/scale buildup, sensor cleanliness, wiring, and actual water level behavior.",
      likelyFix: "Clean/repair the water level control path or replace the failed float/sensor if proven defective.",
      commonMistake: "Replacing the valve or board first when the level control is actually misreading.",
      safetyNote: "Shut power and water off as needed before opening the water control area.",
    };
  }
  
  return {
    title: "General repair guidance",
    suspectedPart: "Most likely system indicated by diagnosis",
    why: whyText || "This guidance is based on the current likely cause from the diagnosis output.",
    confirmTest: "Take the next highest-value reading that proves or disproves this suspected cause before replacing parts.",
    toolToUse: "Meter and the most appropriate field instrument for the suspected system",
    expectedReading: "You should get a reading or condition that clearly supports or rejects the suspected fault.",
    passInterpretation: "If the reading does not support the suspected cause, move to the next likely cause instead of replacing parts blindly.",
    failInterpretation: "If the reading clearly proves abnormal operation, continue down that failure path and verify the specific failed component.",
    nextIfFail: "Take one more confirming measurement before replacing the part, then verify full operation after repair.",
    fieldCheck: "Visually inspect wiring, connections, sequence of operation, and compare actual readings to expected operation.",
    likelyFix: "Confirm the failed component or condition with a direct test, then repair and verify full operation afterward.",
    commonMistake: "Replacing a part based only on symptoms without proving the failure.",
    safetyNote: "Use normal lockout, electrical, refrigerant, and combustion safety procedures for the equipment being serviced.",
  };
}

export function buildRepairGuidance(
  diagnosis: DiagnosisLike | null,
  equipmentType: string
): RepairGuidanceItem[] {
  const causes = diagnosis?.likely_causes || [];

  return causes.slice(0, 3).map((c) => {
    const causeText = c.cause || "Likely issue";
    const whyText = c.why || "";
    const guidance = pickGuidanceFromCause(causeText, whyText, equipmentType);

    return {
      ...guidance,
      confidence:
        typeof c.probability_percent === "number" ? c.probability_percent : null,
    };
  });
}