export type ErrorCodeGuidance = {
  title: string;
  summary: string;
  firstChecks: string[];
  warnings: string[];
  nextSteps: string[];
};

export function buildErrorCodeGuidance(args: {
  manufacturer: string;
  model: string;
  equipmentType: string;
  errorCode: string;
  errorCodeSource: string;
}): ErrorCodeGuidance | null {
  const manufacturer = args.manufacturer.trim();
  const model = args.model.trim();
  const equipmentType = args.equipmentType.trim();
  const errorCode = args.errorCode.trim();
  const errorCodeSource = args.errorCodeSource.trim();

  if (!errorCode) return null;

  const code = errorCode.toLowerCase();
  const eq = equipmentType.toLowerCase();

  const base: ErrorCodeGuidance = {
    title: `Error Code Guidance: ${errorCode}`,
    summary: `Use the exact manufacturer/model context before trusting any generic meaning for code ${errorCode}.`,
    firstChecks: [
      `Confirm the exact code text/flash pattern from the ${errorCodeSource || "reported source"}.`,
      "Verify manufacturer and model are correct before interpreting the code.",
      "Check whether the code is active, stored, intermittent, or historical.",
    ],
    warnings: [
      "Do not replace parts from a generic code meaning alone.",
      "Many codes point to a circuit or condition, not a single failed part.",
      "A safety code may mean the safety is doing its job, not that the safety itself is bad.",
    ],
    nextSteps: [
      "Use the code as a direction, then confirm with live readings and sequence-of-operation checks.",
    ],
  };

  if (code.includes("high") && code.includes("pressure")) {
    return {
      ...base,
      summary: `Code ${errorCode} likely points toward a high-pressure condition or high-pressure safety event.`,
      firstChecks: [
        ...base.firstChecks,
        "Check condenser cleanliness and airflow/water flow.",
        "Verify head pressure with gauges.",
        "Check fan operation and ambient/load conditions.",
      ],
      warnings: [
        ...base.warnings,
        "Do not assume the high-pressure switch is bad until actual head pressure is checked.",
      ],
      nextSteps: [
        "Measure head pressure.",
        "Inspect condenser and fan operation.",
        "Check for overcharge or restriction if pressure is truly high.",
      ],
    };
  }

  if (code.includes("low") && code.includes("pressure")) {
    return {
      ...base,
      summary: `Code ${errorCode} likely points toward a low-pressure condition or low-pressure safety event.`,
      firstChecks: [
        ...base.firstChecks,
        "Check suction pressure with gauges.",
        "Inspect airflow/load conditions.",
        "Check evaporator condition and charge indicators.",
      ],
      warnings: [
        ...base.warnings,
        "Do not replace the low-pressure switch before confirming actual suction conditions.",
      ],
      nextSteps: [
        "Measure suction pressure.",
        "Compare superheat and evaporator condition.",
        "Check for low charge, airflow problems, or restriction.",
      ],
    };
  }

  if (code.includes("flame") || code.includes("ignition")) {
    return {
      ...base,
      summary: `Code ${errorCode} likely points toward ignition or flame-proving trouble.`,
      firstChecks: [
        ...base.firstChecks,
        "Verify full heating sequence of operation.",
        "Check igniter operation and flame sensor signal.",
        "Check burner carryover and grounding.",
      ],
      warnings: [
        ...base.warnings,
        "Do not replace the flame sensor without checking microamps and ground quality.",
      ],
      nextSteps: [
        "Measure flame signal.",
        "Check igniter and gas valve sequence.",
        "Inspect burners, flame carryover, and grounds.",
      ],
    };
  }

  if (code.includes("pressure switch")) {
    return {
      ...base,
      summary: `Code ${errorCode} likely points toward a draft/proving or pressure switch problem.`,
      firstChecks: [
        ...base.firstChecks,
        "Verify inducer operation.",
        "Inspect tubing, ports, and venting.",
        "Check proving conditions before condemning the switch.",
      ],
      warnings: [
        ...base.warnings,
        "Pressure switch codes often come from blocked venting, weak inducer, or plugged ports.",
      ],
      nextSteps: [
        "Check inducer and venting.",
        "Verify switch state with proper draft conditions.",
        "Replace the switch only if direct testing proves it is faulty.",
      ],
    };
  }

  if (code.includes("limit") || code.includes("rollout")) {
    return {
      ...base,
      summary: `Code ${errorCode} likely points toward a temperature limit or combustion safety trip.`,
      firstChecks: [
        ...base.firstChecks,
        "Check airflow, filter, blower, coil, and heat rise.",
        "Inspect burner flame pattern and venting if rollout is involved.",
      ],
      warnings: [
        ...base.warnings,
        "Do not just reset and walk away from rollout or repeated limit trips.",
      ],
      nextSteps: [
        "Check whether the safety tripped for a real reason.",
        "Verify airflow or combustion condition.",
        "Only replace the safety if it fails under proper conditions.",
      ],
    };
  }

  if (eq.includes("ice machine")) {
    if (code.includes("water") || code.includes("fill")) {
      return {
        ...base,
        summary: `Code ${errorCode} likely points toward an ice machine water fill or water control issue.`,
        firstChecks: [
          ...base.firstChecks,
          "Check incoming water supply and filter.",
          "Verify fill valve command and fill timing.",
          "Inspect float/level control behavior.",
        ],
        warnings: [
          ...base.warnings,
          "Do not blame the board first when water supply, valve, or level control could be the cause.",
        ],
        nextSteps: [
          "Verify water supply.",
          "Check valve command and actual fill.",
          "Inspect level control and scale buildup.",
        ],
      };
    }

    if (code.includes("harvest") || code.includes("hot gas")) {
      return {
        ...base,
        summary: `Code ${errorCode} likely points toward an ice machine harvest or release problem.`,
        firstChecks: [
          ...base.firstChecks,
          "Verify the machine enters harvest at the correct time.",
          "Check harvest assist / hot gas action if applicable.",
          "Inspect scale and release surface condition.",
        ],
        warnings: [
          ...base.warnings,
          "Do not assume refrigeration is bad if the real issue is release timing or heavy scale.",
        ],
        nextSteps: [
          "Check harvest timing.",
          "Check hot gas / release function.",
          "Inspect plate/surface condition and scale.",
        ],
      };
    }

    if (code.includes("bin")) {
      return {
        ...base,
        summary: `Code ${errorCode} likely points toward a bin control or ice level shutdown issue.`,
        firstChecks: [
          ...base.firstChecks,
          "Verify actual bin condition.",
          "Check bin control state and placement.",
          "Inspect wiring and sensor cleanliness.",
        ],
        warnings: [
          ...base.warnings,
          "Do not condemn the main board before proving the bin control input is correct.",
        ],
        nextSteps: [
          "Check bin control status.",
          "Verify sensor/control placement.",
          "Confirm whether the machine is being held off falsely.",
        ],
      };
    }
  }

  return {
    ...base,
    nextSteps: [
      "Confirm exact code and source.",
      "Verify manufacturer/model context.",
      "Use live readings and sequence-of-operation checks to prove the fault path.",
    ],
  };
}