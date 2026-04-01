from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_function_block(source: str, func_name: str, new_block: str) -> str:
    marker = f"function {func_name}() {{"
    start = source.find(marker)
    if start == -1:
        raise RuntimeError(f"Could not find function {func_name}().")

    i = start
    depth = 0
    in_string = None
    escape = False

    while i < len(source):
        ch = source[i]

        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
        else:
            if ch in ("'", '"', "`"):
                in_string = ch
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    return source[:start] + new_block + source[end:]

        i += 1

    raise RuntimeError(f"Could not parse function block for {func_name}().")


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "guided-next-test-engine-v3" in source:
        print("Readings-aware Guided Next-Test Engine v2 patch already applied.")
        return

    new_function = """function buildGuidedNextTests() {
        // guided-next-test-engine-v3
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = componentLabel.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const recentParts = getRecentSameComponentPartsForAssist();
        const recentFix = getMostRecentSameComponentFixForAssist();

        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const tests: Array<{
          title: string;
          tool: string;
          why: string;
          how: string;
        }> = [];

        tests.push({
          title: "Confirm the target component and active call",
          tool: "Visual check + meter",
          why: "Do not waste time testing the wrong section of the system.",
          how:
            "Verify the selected affected component, confirm there is an active call on that component, and check disconnect / breaker / fuse / board output before deeper diagnosis.",
        });

        // Readings-aware tests first, because they should change the tech's next move
        if (superheat !== null && subcool !== null && superheat > 18 && subcool < 5) {
          tests.push({
            title: "High SH + low SC path",
            tool: "Gauges + line temperatures + airflow check",
            why: "This pattern leans toward underfeed, undercharge, or restriction.",
            how:
              "Verify airflow first, then check refrigerant feed path, obvious restrictions, and whether the system may be undercharged before replacing major parts.",
          });
        }

        if (superheat !== null && subcool !== null && superheat < 6 && subcool > 15) {
          tests.push({
            title: "Low SH + high SC path",
            tool: "Gauges + airflow + metering/device check",
            why: "This pattern can point toward floodback, overfeed, or an airflow problem.",
            how:
              "Verify indoor / evaporator airflow, blower or fan operation, and metering behavior before condemning the compressor or charge condition.",
          });
        }

        if (superheat !== null && subcool !== null && superheat > 18 && subcool > 15) {
          tests.push({
            title: "High SH + high SC path",
            tool: "Gauges + liquid line temperature + restriction check",
            why: "This pattern can indicate a liquid-line restriction or a feed problem.",
            how:
              "Check liquid line temperature drop, filter drier / restriction points, and the metering path before replacing components.",
          });
        }

        if (superheat !== null && subcool !== null && superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
          tests.push({
            title: "Readings are not screaming charge problem first",
            tool: "Meter + airflow / controls check",
            why: "When SH/SC look reasonable, the next win is often electrical, control, or airflow related.",
            how:
              "Shift the next tests toward controls, fan operation, relays/contactors, safeties, and component-specific sequence checks before changing refrigerant-side parts.",
          });
        }

        if (deltaT !== null && deltaT < 14 && (issue.includes("not cooling") || issue.includes("no cool"))) {
          tests.push({
            title: "Low air temperature split path",
            tool: "Thermometer + airflow check",
            why: "A weak split often points toward airflow, control, or charge/feed issues.",
            how:
              "Verify blower / fan operation, filter / coil condition, indoor airflow, and then compare refrigerant readings before replacing parts.",
          });
        }

        if (deltaT !== null && deltaT > 24) {
          tests.push({
            title: "High air temperature split path",
            tool: "Thermometer + airflow / freeze check",
            why: "A very high split can point toward airflow restriction, icing, or low load conditions.",
            how:
              "Check filter / coil condition, fan performance, frost pattern, and actual load conditions before deciding the system is fixed or before replacing feed components.",
          });
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          tests.push({
            title: "Heat rejection check first",
            tool: "Gauges + visual condenser check",
            why: "Head pressure is running hot against ambient conditions.",
            how:
              "Check condenser coil condition, fan operation, rotation, airflow blockage, and ambient / load conditions before condemning the refrigerant circuit.",
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat > 20) {
          tests.push({
            title: "Low-feed evaporator path",
            tool: "Gauges + line temps + visual coil check",
            why: "Low suction with high superheat leans toward a starved evaporator.",
            how:
              "Check airflow, frost pattern, metering device feed, and restriction points before replacing major components.",
          });
        }

        if (suctionPressure is not None if False else False):
            pass
"""
    # use a clean JS block, not Python syntax
    new_function = """function buildGuidedNextTests() {
        // guided-next-test-engine-v3
        const componentLabel = String(getCurrentAffectedComponentLabelForAssist() || "Primary component").trim();
        const componentLabelLower = componentLabel.toLowerCase();
        const equipment = String(equipmentType || "").trim().toLowerCase();
        const issue = String(symptom || "").trim().toLowerCase();
        const sameComponentHistory = getSameComponentHistoryForTroubleshooting();
        const recentParts = getRecentSameComponentPartsForAssist();
        const recentFix = getMostRecentSameComponentFixForAssist();

        const suctionPressure = getObservationValue(
          observations,
          (l) => l === "suction pressure" || (l.includes("suction") && l.includes("pressure")),
          "psi"
        );

        const headPressure = getObservationValue(
          observations,
          (l) =>
            l === "head pressure" ||
            ((l.includes("liquid") || l.includes("head") || l.includes("high")) && l.includes("pressure")),
          "psi"
        );

        const returnAirTemp = getObservationValue(
          observations,
          (l) => l.includes("return air temp") || (l.includes("return") && l.includes("temp")),
          "°F"
        );

        const supplyAirTemp = getObservationValue(
          observations,
          (l) => l.includes("supply air temp") || (l.includes("supply") && l.includes("temp")),
          "°F"
        );

        const boxTemp = getObservationValue(
          observations,
          (l) => l.includes("box temp"),
          "°F"
        );

        const ambientTemp = getObservationValue(
          observations,
          (l) =>
            l.includes("ambient temp") ||
            l.includes("outside temp") ||
            l.includes("outdoor ambient") ||
            l.includes("outdoor temp") ||
            l.includes("oa temp"),
          "°F"
        );

        const superheat = chargeAnalysis?.superheat ?? null;
        const subcool = chargeAnalysis?.subcool ?? null;

        const deltaT =
          returnAirTemp !== null && supplyAirTemp !== null
            ? Math.round((returnAirTemp - supplyAirTemp) * 10) / 10
            : null;

        const tests: Array<{
          title: string;
          tool: string;
          why: string;
          how: string;
        }> = [];

        tests.push({
          title: "Confirm the target component and active call",
          tool: "Visual check + meter",
          why: "Do not waste time testing the wrong section of the system.",
          how:
            "Verify the selected affected component, confirm there is an active call on that component, and check disconnect / breaker / fuse / board output before deeper diagnosis.",
        });

        // Readings-aware paths
        if (superheat !== null && subcool !== null && superheat > 18 && subcool < 5) {
          tests.push({
            title: "High SH + low SC path",
            tool: "Gauges + line temperatures + airflow check",
            why: "This pattern leans toward underfeed, undercharge, or restriction.",
            how:
              "Verify airflow first, then check refrigerant feed path, obvious restrictions, and whether the system may be undercharged before replacing major parts.",
          });
        }

        if (superheat !== null && subcool !== null && superheat < 6 && subcool > 15) {
          tests.push({
            title: "Low SH + high SC path",
            tool: "Gauges + airflow + metering/device check",
            why: "This pattern can point toward floodback, overfeed, or an airflow problem.",
            how:
              "Verify indoor / evaporator airflow, blower or fan operation, and metering behavior before condemning the compressor or charge condition.",
          });
        }

        if (superheat !== null && subcool !== null && superheat > 18 && subcool > 15) {
          tests.push({
            title: "High SH + high SC path",
            tool: "Gauges + liquid line temperature + restriction check",
            why: "This pattern can indicate a liquid-line restriction or a feed problem.",
            how:
              "Check liquid line temperature drop, filter drier / restriction points, and the metering path before replacing components.",
          });
        }

        if (superheat !== null && subcool !== null && superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
          tests.push({
            title: "Readings are not screaming charge problem first",
            tool: "Meter + airflow / controls check",
            why: "When SH/SC look reasonable, the next win is often electrical, control, or airflow related.",
            how:
              "Shift the next tests toward controls, fan operation, relays/contactors, safeties, and component-specific sequence checks before changing refrigerant-side parts.",
          });
        }

        if (deltaT !== null && deltaT < 14 && (issue.includes("not cooling") || issue.includes("no cool"))) {
          tests.push({
            title: "Low air temperature split path",
            tool: "Thermometer + airflow check",
            why: "A weak split often points toward airflow, control, or charge/feed issues.",
            how:
              "Verify blower / fan operation, filter / coil condition, indoor airflow, and then compare refrigerant readings before replacing parts.",
          });
        }

        if (deltaT !== null && deltaT > 24) {
          tests.push({
            title: "High air temperature split path",
            tool: "Thermometer + airflow / freeze check",
            why: "A very high split can point toward airflow restriction, icing, or low load conditions.",
            how:
              "Check filter / coil condition, fan performance, frost pattern, and actual load conditions before deciding the system is fixed or before replacing feed components.",
          });
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          tests.push({
            title: "Heat rejection check first",
            tool: "Gauges + visual condenser check",
            why: "Head pressure is running hot against ambient conditions.",
            how:
              "Check condenser coil condition, fan operation, rotation, airflow blockage, and ambient / load conditions before condemning the refrigerant circuit.",
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat > 20) {
          tests.push({
            title: "Low-feed evaporator path",
            tool: "Gauges + line temps + visual coil check",
            why: "Low suction with high superheat leans toward a starved evaporator.",
            how:
              "Check airflow, frost pattern, metering device feed, and restriction points before replacing major components.",
          });
        }

        if (suctionPressure !== null && superheat !== null && superheat < 5) {
          tests.push({
            title: "Floodback / overfeed path",
            tool: "Gauges + airflow + metering check",
            why: "Low superheat says do not rush to add charge or change compressors.",
            how:
              "Check evaporator airflow, metering device behavior, and whether the coil is overfeeding before making a major repair decision.",
          });
        }

        if (boxTemp !== null && equipment.includes("walk-in")) {
          tests.push({
            title: "Use actual box temperature to set the next move",
            tool: "Thermometer + control / defrost check",
            why: "Walk-in decisions should track the real box condition, not just the complaint.",
            how:
              `Box temp is ${boxTemp}°F. Compare that against setpoint, product load, and defrost behavior before ordering parts.`,
          });
        }

        // Component / symptom / history aware paths
        if (
          componentLabelLower.includes("condensing") ||
          componentLabelLower.includes("outdoor") ||
          componentLabelLower.includes("condenser")
        ) {
          tests.push({
            title: "Verify outdoor electrical operation first",
            tool: "Meter + capacitor tester",
            why: "A lot of no-cool calls are found here before refrigerant diagnosis starts.",
            how:
              "Check line voltage, contactor pull-in, capacitor value, condenser fan operation, and obvious coil fouling before condemning compressor or charge.",
          });

          tests.push({
            title: "Check heat rejection before refrigerant diagnosis",
            tool: "Visual + gauges",
            why: "Dirty coil / bad fan / low ambient problems can distort the pressure story.",
            how:
              "Verify condenser airflow, fan direction, coil cleanliness, and ambient conditions before trusting head-pressure conclusions.",
          });
        }

        if (componentLabelLower.includes("evaporator") || componentLabelLower.includes("indoor head")) {
          tests.push({
            title: "Check fan / ice / drain condition first",
            tool: "Visual + amp check",
            why: "Evap-side airflow and frost issues cause a lot of false TXV / charge calls.",
            how:
              "Check fan operation, blade condition, drain condition, ice pattern, and any defrost circuit before replacing refrigeration parts.",
          });

          tests.push({
            title: "Read the frost pattern before changing parts",
            tool: "Visual + temperatures / gauges",
            why: "The frost pattern tells you whether this is airflow, feed, or defrost related.",
            how:
              "Compare coil pattern, suction / line temp, and box condition before condemning TXV, EEV, or charge.",
          });
        }

        if (componentLabelLower.includes("furnace")) {
          tests.push({
            title: "Run the heat sequence in order",
            tool: "Meter + visual",
            why: "Furnace issues are usually found in the sequence / safety chain.",
            how:
              "Verify call for heat, inducer, pressure switch, ignitor, flame sense, limits, and board outputs before replacing the board or gas valve.",
          });
        }

        if (componentLabelLower.includes("air handler") || componentLabelLower.includes("indoor unit")) {
          tests.push({
            title: "Check indoor airflow and safeties first",
            tool: "Meter + visual",
            why: "Indoor blower and drain safeties often mimic bigger failures.",
            how:
              "Verify blower motor operation, board / relay output, capacitor / module condition, and drain safety before replacing indoor components.",
          });
        }

        if (equipment.includes("walk-in")) {
          tests.push({
            title: "Verify walk-in control and defrost operation",
            tool: "Visual + control check",
            why: "Walk-in callbacks often come from defrost / delay / drain heat issues.",
            how:
              "Check box temp, defrost schedule, termination, fan delay, drain heat, and door / frame heat before ordering parts.",
          });
        }

        if (equipment.includes("ice machine")) {
          tests.push({
            title: "Separate water-side from refrigeration-side issues",
            tool: "Visual + sequence check",
            why: "Ice machines waste time when the sequence is not separated clearly.",
            how:
              "Check freeze / harvest sequence, water flow, water level, and sensor states before blaming refrigeration components.",
          });
        }

        if (issue.includes("not cooling") || issue.includes("no cool")) {
          tests.push({
            title: "Prove power and controls before expensive parts",
            tool: "Meter",
            why: "No-cool complaints often get over-diagnosed.",
            how:
              "Verify control call, line voltage, obvious electrical failures, and airflow first. Do not jump straight to compressor, TXV, or charge.",
          });
        }

        if (issue.includes("freeze") || issue.includes("icing") || issue.includes("ice")) {
          tests.push({
            title: "Treat icing as airflow / defrost / feed until proven otherwise",
            tool: "Visual + temperatures + controls",
            why: "Icing problems are often repeat issues when the wrong thing is replaced.",
            how:
              "Check airflow, fan operation, defrost operation, drain condition, and frost pattern before condemning refrigerant-side parts.",
          });
        }

        if (issue.includes("heat")) {
          tests.push({
            title: "Follow the heating safety chain",
            tool: "Meter + visual",
            why: "Heating failures are usually sequence-related before they are part-related.",
            how:
              "Verify the full sequence of operation and each safety before replacing a board, valve, or ignitor.",
          });
        }

        if (sameComponentHistory.length) {
          tests.push({
            title: "Compare with same-component history before replacing parts",
            tool: "History + current readings",
            why: "Repeat failures often come back because the root cause was not verified.",
            how:
              `Review the ${sameComponentHistory.length} prior same-component event(s), compare current conditions to the last repair, and verify the previous fix path before repeating it.`,
          });
        }

        if (recentParts.length || recentFix) {
          tests.push({
            title: "Verify the last repair path did not fail again",
            tool: "Visual + electrical / temperature checks",
            why: "A repeated fix can hide the real root cause.",
            how:
              `Recent same-component parts/fix history: ${[recentParts.join(", "), recentFix].filter(Boolean).join(" • ") || "See history"}. Confirm the replaced part, wiring, setup, and operating conditions before changing it again.`,
          });
        }

        const seen = new Set<string>();
        return tests.filter((test) => {
          const key = `${test.title}|${test.how}`.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 6);
      }"""

    source = replace_function_block(source, "buildGuidedNextTests", new_function)

    backup = PAGE.with_name(PAGE.name + ".readings-aware-guided-next-test-engine-v2.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
