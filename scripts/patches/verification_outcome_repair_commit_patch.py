from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "verification-outcome-repair-commit-v1" in source:
        print("Verification Outcome + Repair Commit patch already applied.")
        return

    helper_block = """      // verification-outcome-repair-commit-v1
      const [selectedVerificationOutcome, setSelectedVerificationOutcome] = useState("");
      const [verificationOutcomeNote, setVerificationOutcomeNote] = useState("");
      const [verificationOutcomeMessage, setVerificationOutcomeMessage] = useState("");

      function applyVerificationOutcomeAndRepairCommit() {
        const payload = buildPartVerificationChecklistItems();
        const selectedPart = String(payload.selectedPart || "").trim();
        const outcome = String(selectedVerificationOutcome || "").trim();

        if (!selectedPart) {
          setVerificationOutcomeMessage("Choose a part in Part Verification Checklist first.");
          return;
        }

        if (!outcome) {
          setVerificationOutcomeMessage("Choose a verification outcome first.");
          return;
        }

        const lines = [
          "Verification Outcome",
          `Part: ${selectedPart}`,
          `Outcome: ${outcome}`,
          symptom ? `Symptom: ${symptom}` : "",
          getCurrentAffectedComponentLabelForAssist()
            ? `Component: ${getCurrentAffectedComponentLabelForAssist()}`
            : "",
          verificationOutcomeNote.trim() ? `Note: ${verificationOutcomeNote.trim()}` : "",
        ].filter(Boolean);

        const block = lines.join("\\n");

        setTechCloseoutNotes((prev) =>
          [String(prev || "").trim(), block].filter(Boolean).join("\\n\\n")
        );

        if (outcome === "Replaced") {
          setPartsReplaced((prev) => {
            const current = String(prev || "").trim();
            const existing = current
              .split(/[;,]/)
              .map((entry) => entry.trim().toLowerCase())
              .filter(Boolean);

            if (existing.includes(selectedPart.toLowerCase())) {
              return current;
            }

            return [current, selectedPart].filter(Boolean).join(", ");
          });

          setActualFixPerformed((prev) => {
            const current = String(prev || "").trim();
            const repairLine = `Replaced ${selectedPart}`;
            if (current.toLowerCase().includes(repairLine.toLowerCase())) {
              return current;
            }
            return [current, repairLine].filter(Boolean).join("; ");
          });
        }

        setVerificationOutcomeMessage("Verification outcome added to Tech Closeout Notes.");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "verification outcome helpers",
    )

    ui_block = """      {/* verification-outcome-repair-commit-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="Verification Outcome + Repair Commit">
          <SmallHint>
            Mark what happened after you checked the part so the app can document the decision path and commit the repair more cleanly.
          </SmallHint>

          {(() => {
            const payload = buildPartVerificationChecklistItems();
            const selectedPart = String(payload.selectedPart || "").trim();
            const outcomes = [
              "Verified bad",
              "Tested good",
              "Needs more testing",
              "Replaced",
              "Not the cause",
            ];

            return (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Part Focus
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {selectedPart || "Choose a part in Part Verification Checklist"}
                    </div>
                  </div>

                  <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10, background: "#fafafa" }}>
                    <div style={{ fontWeight: 900, fontSize: 12, color: "#666", textTransform: "uppercase" }}>
                      Current Outcome
                    </div>
                    <div style={{ marginTop: 4, fontWeight: 700 }}>
                      {selectedVerificationOutcome || "Not selected"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {outcomes.map((outcome) => {
                    const active = selectedVerificationOutcome === outcome;
                    return (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => setSelectedVerificationOutcome(outcome)}
                        style={{
                          padding: "8px 12px",
                          fontWeight: 900,
                          border: "1px solid #cfcfcf",
                          borderRadius: 999,
                          background: active ? "#eef6ff" : "#ffffff",
                          color: "#111",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      >
                        {outcome}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontWeight: 900 }}>Verification Note (optional)</label>
                  <textarea
                    value={verificationOutcomeNote}
                    onChange={(e) => setVerificationOutcomeNote(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: 8 }}
                    placeholder="Example: coil voltage present, contacts burnt, replaced contactor and rechecked operation"
                  />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={applyVerificationOutcomeAndRepairCommit}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}
                  >
                    Apply Verification Outcome
                  </button>
                </div>

                {verificationOutcomeMessage ? (
                  <SmallHint>
                    <b>Verification Outcome:</b> {verificationOutcomeMessage}
                  </SmallHint>
                ) : null}
              </div>
            );
          })()}
        </SectionCard>
      </div>

"""
    source = insert_before_once(
        source,
        '{/* suggested-parts-to-verify-v1 */}',
        ui_block,
        "verification outcome UI",
    )

    backup = PAGE.with_name(PAGE.name + ".verification-outcome-repair-commit-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
