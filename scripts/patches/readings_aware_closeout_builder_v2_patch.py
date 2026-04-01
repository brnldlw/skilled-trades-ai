from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "readings-aware-closeout-builder-v2" in source:
        print("Readings-aware Closeout Builder v2 patch already applied.")
        return

    helper_block = """      // readings-aware-closeout-builder-v2
      function buildPlainEnglishCloseoutReadingsInterpretation() {
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

        const notes: string[] = [];
        const followUpItems: string[] = [];

        if (superheat !== null && subcool !== null) {
          if (superheat > 18 && subcool < 5) {
            notes.push("High superheat with low subcool points toward underfeed, undercharge, restriction, or airflow verification.");
            followUpItems.push("Verify airflow and refrigerant feed path before repeating major part replacement.");
          } else if (superheat < 6 && subcool > 15) {
            notes.push("Low superheat with high subcool points toward floodback, overfeed, or an airflow-related issue.");
            followUpItems.push("Check airflow and metering behavior before condemning compressor or charge condition.");
          } else if (superheat > 18 && subcool > 15) {
            notes.push("High superheat with high subcool can point toward a liquid-line restriction or feed issue.");
            followUpItems.push("Check for restriction points and liquid line temperature drop before replacing components.");
          } else if (superheat >= 6 && superheat <= 18 && subcool >= 5 && subcool <= 15) {
            notes.push("Superheat and subcool look reasonably balanced, so controls, airflow, or electrical checks may matter more than a major charge correction.");
          }
        } else {
          if (superheat !== null) {
            if (superheat > 20) {
              notes.push("High superheat suggests the evaporator may be starved or airflow may need verified.");
              followUpItems.push("Verify feed path, airflow, and possible restriction before changing major parts.");
            } else if (superheat < 5) {
              notes.push("Low superheat suggests floodback, overfeed, or airflow issues should be checked.");
              followUpItems.push("Check evaporator airflow and metering behavior before adding charge or replacing compressors.");
            }
          }

          if (subcool !== null) {
            if (subcool < 5) {
              notes.push("Low subcool suggests undercharge or liquid feed verification may still be needed.");
            } else if (subcool > 15) {
              notes.push("High subcool suggests overcharge or a restriction should be ruled out.");
            }
          }
        }

        if (deltaT !== null) {
          if (deltaT < 14) {
            notes.push("The return-to-supply temperature split is weak, which points toward airflow, control, or charge/feed verification.");
            followUpItems.push("Verify indoor airflow and compare current split against operating conditions before closing the call.");
          } else if (deltaT > 24) {
            notes.push("The return-to-supply temperature split is very high, so airflow restriction, icing, or low-load conditions should be considered.");
            followUpItems.push("Check filter, coil, fan performance, and frost pattern before repeating the same repair.");
          }
        }

        if (headPressure !== null && ambientTemp !== null && headPressure > ambientTemp * 3.2) {
          notes.push("Head pressure is high relative to ambient, which points toward heat rejection issues first.");
          followUpItems.push("Verify condenser airflow, fan operation, coil cleanliness, and ambient/load conditions.");
        }

        if (boxTemp !== null && String(equipmentType || "").toLowerCase().includes("walk-in")) {
          notes.push(`Box temperature is ${boxTemp}°F, so defrost performance, control strategy, and actual box load should be part of the closeout decision.`);
        }

        const uniqueNotes: string[] = [];
        const uniqueNoteSet = new Set<string>();
        for (const note of notes) {
          const key = note.trim().toLowerCase();
          if (!key || uniqueNoteSet.has(key)) continue;
          uniqueNoteSet.add(key);
          uniqueNotes.push(note);
        }

        const uniqueFollowUps: string[] = [];
        const uniqueFollowUpSet = new Set<string>();
        for (const item of followUpItems) {
          const key = item.trim().toLowerCase();
          if (!key || uniqueFollowUpSet.has(key)) continue;
          uniqueFollowUpSet.add(key);
          uniqueFollowUps.push(item);
        }

        return {
          summary: uniqueNotes.join(" "),
          followUpItems: uniqueFollowUps,
        };
      }

"""
    source = insert_before_once(
        source,
        "      function buildDiagnosticCloseoutDrafts() {",
        helper_block,
        "plain-English readings helper insert",
    )

    source = replace_once(
        source,
        """        const warnings = getComponentAwareWarningSignals().slice(0, 2);
        const readingsSummary = buildCloseoutReadingsSummary();
        const siteLabel = String(siteName || siteAddress || customerName || "this site").trim();
        const followUpItems: string[] = [];
""",
        """        const warnings = getComponentAwareWarningSignals().slice(0, 2);
        const readingsSummary = buildCloseoutReadingsSummary();
        const readingsInterpretationResult = buildPlainEnglishCloseoutReadingsInterpretation();
        const readingsInterpretation = readingsInterpretationResult.summary;
        const readingsFollowUp = readingsInterpretationResult.followUpItems;
        const siteLabel = String(siteName || siteAddress || customerName || "this site").trim();
        const followUpItems: string[] = [];
""",
        "readings interpretation variables",
    )

    source = replace_once(
        source,
        """        if (warnings.length) {
          followUpItems.push(...warnings);
        }

        if (outcome && outcome !== "Not Set") {
""",
        """        if (warnings.length) {
          followUpItems.push(...warnings);
        }

        if (readingsFollowUp.length) {
          followUpItems.push(...readingsFollowUp);
        }

        if (outcome && outcome !== "Not Set") {
""",
        "follow-up insert",
    )

    source = replace_once(
        source,
        """          fix
            ? `Work performed: ${fix}.`
            : "A final repair action has not been documented yet.",
          outcome && outcome !== "Not Set"
            ? `Current system status: ${outcome}.`
            : "",
          readingsSummary ? `Key field readings: ${readingsSummary}.` : "",
        ].filter(Boolean);
""",
        """          fix
            ? `Work performed: ${fix}.`
            : "A final repair action has not been documented yet.",
          outcome && outcome !== "Not Set"
            ? `Current system status: ${outcome}.`
            : "",
          readingsInterpretation ? `Reading interpretation: ${readingsInterpretation}` : "",
          readingsSummary ? `Key field readings: ${readingsSummary}.` : "",
        ].filter(Boolean);
""",
        "customer summary readings insert",
    )

    source = replace_once(
        source,
        """          cause ? `Confirmed cause: ${cause}` : "Confirmed cause: not documented",
          fix ? `Actual fix: ${fix}` : "Actual fix: not documented",
          readingsSummary ? `Key readings: ${readingsSummary}` : "",
          outcome && outcome !== "Not Set" ? `Outcome: ${outcome}` : "",
""",
        """          cause ? `Confirmed cause: ${cause}` : "Confirmed cause: not documented",
          fix ? `Actual fix: ${fix}` : "Actual fix: not documented",
          readingsInterpretation ? `Readings meaning: ${readingsInterpretation}` : "",
          readingsSummary ? `Key readings: ${readingsSummary}` : "",
          outcome && outcome !== "Not Set" ? `Outcome: ${outcome}` : "",
""",
        "internal summary readings insert",
    )

    backup = PAGE.with_name(PAGE.name + ".readings-aware-closeout-builder-v2.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
