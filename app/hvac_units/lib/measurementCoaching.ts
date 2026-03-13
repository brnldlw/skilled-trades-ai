export type MeasurementCoachingItem = {
  measurement: string;
  tool: string;
  whereToMeasure: string;
  expectedResult: string;
  ifHigh: string;
  ifLow: string;
  nextStep: string;
};

function buildMeasurementCoachingItem(measurement: string): MeasurementCoachingItem {
  const m = measurement.toLowerCase();

  if (m.includes("suction pressure")) {
    return {
      measurement,
      tool: "Digital gauges",
      whereToMeasure: "Low-side service port of the refrigeration circuit.",
      expectedResult: "Should line up with a reasonable evaporator saturation temperature for the operating condition and refrigerant.",
      ifHigh: "May point toward high load, overfeeding, compressor inefficiency, or other abnormal refrigeration conditions.",
      ifLow: "May point toward low charge, airflow problems, restriction, or underfeeding evaporator.",
      nextStep: "Compare suction pressure to suction line temp, superheat, indoor airflow, and box/return air conditions.",
    };
  }

  if (m.includes("liquid pressure") || m.includes("head pressure")) {
    return {
      measurement,
      tool: "Digital gauges",
      whereToMeasure: "High-side / liquid service port.",
      expectedResult: "Should support a reasonable condensing saturation temperature for ambient and load conditions.",
      ifHigh: "May suggest dirty condenser, overcharge, airflow issues, non-condensables, or high ambient/load.",
      ifLow: "May suggest undercharge, low ambient effects, feeding issues, or compressor inefficiency.",
      nextStep: "Compare with condenser airflow, liquid line temp, subcool, and ambient conditions.",
    };
  }

  if (m.includes("superheat")) {
    return {
      measurement,
      tool: "Digital gauges and pipe clamp",
      whereToMeasure: "Use low-side pressure plus suction line temperature at the evaporator outlet / service area.",
      expectedResult: "Should be in a reasonable range for the equipment and metering strategy.",
      ifHigh: "Often supports underfeeding, low charge, restriction, or starved evaporator conditions.",
      ifLow: "May suggest overfeeding, flooding risk, or metering/control problems.",
      nextStep: "Compare with subcool, suction pressure, airflow, and metering device behavior before replacing parts.",
    };
  }

  if (m.includes("subcool")) {
    return {
      measurement,
      tool: "Digital gauges and pipe clamp",
      whereToMeasure: "Use high-side pressure plus liquid line temperature leaving the condenser.",
      expectedResult: "Should be in a reasonable range for the unit design and operating condition.",
      ifHigh: "May suggest overcharge, backed-up liquid, or some restriction patterns depending on the rest of the readings.",
      ifLow: "May suggest low charge, poor condenser performance, or insufficient liquid seal.",
      nextStep: "Compare with superheat, head pressure, condenser airflow, and overall charge indicators.",
    };
  }

  if (m.includes("return static")) {
    return {
      measurement,
      tool: "Manometer",
      whereToMeasure: "Return side duct/plenum before the blower and before major components as appropriate.",
      expectedResult: "Should be within a reasonable negative static range for the equipment and duct system.",
      ifHigh: "May indicate return restriction such as dirty filter, collapsed duct, undersized return, or blocked path.",
      ifLow: "May suggest low airflow demand, leakage, measurement location issue, or weak blower performance.",
      nextStep: "Compare with supply static, filter pressure drop, and coil pressure drop.",
    };
  }

  if (m.includes("supply static")) {
    return {
      measurement,
      tool: "Manometer",
      whereToMeasure: "Supply plenum/duct after the blower and after major components as appropriate.",
      expectedResult: "Should be within a reasonable positive static range for the equipment and duct system.",
      ifHigh: "May indicate supply restriction such as closed dampers, blocked ducts, dirty coil, or undersized duct.",
      ifLow: "May indicate low blower output, leakage, open duct conditions, or poor measurement location.",
      nextStep: "Compare with return static and calculate total external static.",
    };
  }

  if (m.includes("external static pressure")) {
    return {
      measurement,
      tool: "Manometer",
      whereToMeasure: "Measure total external static using return and supply pressure taps in proper locations.",
      expectedResult: "Should stay within the blower/equipment acceptable external static range.",
      ifHigh: "Often indicates airflow restriction or duct system resistance that must be corrected first.",
      ifLow: "May indicate low blower output, duct leakage, or incorrect test setup.",
      nextStep: "Break it down into return static, supply static, filter drop, and coil drop.",
    };
  }

  if (m.includes("filter pressure drop")) {
    return {
      measurement,
      tool: "Manometer",
      whereToMeasure: "Across the air filter.",
      expectedResult: "Should show a reasonable pressure drop for the filter type and airflow.",
      ifHigh: "Filter is likely loaded, restrictive, undersized, or airflow is too high for the setup.",
      ifLow: "May indicate low airflow, bypassing, missing filter, or measurement issue.",
      nextStep: "Inspect the filter condition and compare with total static and blower performance.",
    };
  }

  if (m.includes("coil pressure drop")) {
    return {
      measurement,
      tool: "Manometer",
      whereToMeasure: "Across the indoor coil / evaporator section.",
      expectedResult: "Should show a reasonable pressure drop for the coil and airflow.",
      ifHigh: "May indicate a dirty coil, restricted airflow, wet coil loading, or excessive airflow.",
      ifLow: "May indicate low airflow, bypass, or poor measurement location.",
      nextStep: "Inspect coil condition and compare with total airflow/static findings.",
    };
  }

  if (m.includes("heat rise")) {
    return {
      measurement,
      tool: "Thermometer or temperature probes",
      whereToMeasure: "Return air and supply air in stable locations across the furnace/heat section.",
      expectedResult: "Should fall within the manufacturer’s listed heat rise range.",
      ifHigh: "Usually points toward low airflow, dirty filter, blower issue, or duct restriction.",
      ifLow: "May indicate high airflow, low firing rate, bypass, or incorrect measurement location.",
      nextStep: "Compare with static pressure, blower setup, filter condition, and firing performance.",
    };
  }

  if (m.includes("flame sensor")) {
    return {
      measurement,
      tool: "Meter capable of microamp flame signal measurement",
      whereToMeasure: "In series with the flame sensor circuit during flame proving.",
      expectedResult: "Should show a stable flame signal strong enough for reliable proving.",
      ifHigh: "Usually not a problem by itself if the signal is stable and the sequence is normal.",
      ifLow: "May indicate dirty flame sensor, poor grounding, weak flame carryover, or ignition issues.",
      nextStep: "Clean the sensor, verify grounds and burner carryover, then remeasure before replacing parts.",
    };
  }

  if (m.includes("line voltage")) {
    return {
      measurement,
      tool: "Multimeter",
      whereToMeasure: "Across the incoming power or the load being checked.",
      expectedResult: "Should match the equipment’s required supply voltage within an acceptable tolerance.",
      ifHigh: "May indicate supply issue or incorrect source voltage and can damage equipment.",
      ifLow: "May cause contactor chatter, motor/compressor starting problems, overheating, or nuisance trips.",
      nextStep: "Verify source voltage, check under load, inspect wiring/connections, and compare line vs load side.",
    };
  }

  if (m.includes("control voltage")) {
    return {
      measurement,
      tool: "Multimeter",
      whereToMeasure: "Across the relevant low-voltage terminals such as R-C or R-W.",
      expectedResult: "Should show the proper control voltage when the circuit is being called.",
      ifHigh: "Usually not the common issue; verify transformer and control setup if abnormal.",
      ifLow: "May indicate transformer issues, blown fuse, bad board, open safety, or wiring problem.",
      nextStep: "Trace the low-voltage circuit through safeties, board logic, and field wiring.",
    };
  }

  if (m.includes("evap coil temp")) {
    return {
      measurement,
      tool: "Temperature probe or clamp depending on access",
      whereToMeasure: "On or near the evaporator coil / outlet area as appropriate.",
      expectedResult: "Should support the current refrigeration mode and should not indicate abnormal icing/freezing unless conditions warrant it.",
      ifHigh: "May indicate poor refrigeration effect, warm box/load, or weak evaporator performance.",
      ifLow: "May indicate freeze-up risk, underfeeding/airflow issues, or normal low-temp operation depending on equipment.",
      nextStep: "Compare with suction pressure, superheat, airflow, and defrost or load conditions.",
    };
  }

  if (m.includes("box temp")) {
    return {
      measurement,
      tool: "Thermometer or temperature probe",
      whereToMeasure: "In the conditioned box/space away from direct discharge air if possible.",
      expectedResult: "Should be near the target setpoint for the application.",
      ifHigh: "May indicate refrigeration capacity issue, airflow issue, defrost/infiltration problem, or heavy load.",
      ifLow: "May indicate control/setpoint issue, sensor issue, or overcooling.",
      nextStep: "Compare with call for cooling, evaporator condition, refrigerant readings, and defrost behavior.",
    };
  }

  return {
    measurement,
    tool: "Appropriate HVAC/R test instrument",
    whereToMeasure: "At the correct point in the circuit or air path for this measurement.",
    expectedResult: "Reading should make sense for the equipment type, operating mode, and current load conditions.",
    ifHigh: "A high reading may point toward restriction, overload, incorrect setup, or abnormal operating conditions depending on the measurement.",
    ifLow: "A low reading may point toward underperformance, loss of supply, weak operation, or measurement setup issues depending on the measurement.",
    nextStep: "Compare this reading with the related measurements around it before replacing parts.",
  };
}

export function buildMeasurementCoaching(measurements: string[]): MeasurementCoachingItem[] {
  return measurements.map((m) => buildMeasurementCoachingItem(m));
}