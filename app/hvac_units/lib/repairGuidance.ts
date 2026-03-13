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