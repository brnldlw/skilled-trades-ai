from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) add state if missing ----------
state_anchor = 'const [historicalEntryMode, setHistoricalEntryMode] = useState(false);'
if 'const [showQuickStartHelp, setShowQuickStartHelp] = useState(false);' not in text:
    if state_anchor not in text:
        raise SystemExit("Could not find historicalEntryMode state anchor.")
    text = text.replace(
        state_anchor,
        state_anchor + '\nconst [showQuickStartHelp, setShowQuickStartHelp] = useState(false);',
        1,
    )

# ---------- B) force-insert top Help / Quick Start card ----------
if 'title="Help / Quick Start"' not in text:
    anchor = '        <SectionCard title="Customer / Site / Unit">'
    idx = text.find(anchor)
    if idx == -1:
        raise SystemExit('Could not find "Customer / Site / Unit" anchor.')

    wrapper_start = text.rfind('        <div style={{ marginTop: 16 }}>', 0, idx)
    if wrapper_start == -1:
        raise SystemExit('Could not find wrapper before "Customer / Site / Unit".')

    help_card = """
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Help / Quick Start">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => setShowQuickStartHelp(true)}
                style={{
                  padding: "10px 14px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                Open Quick Start Guide
              </button>

              <SmallHint>
                Fast written help for techs using the app in the field.
              </SmallHint>
            </div>
          </SectionCard>
        </div>

"""
    text = text[:wrapper_start] + help_card + text[wrapper_start:]

# ---------- C) force-insert modal if missing ----------
if 'Quick Start Guide' not in text:
    modal_anchor = '      {showUnitProfile ? ('
    idx = text.find(modal_anchor)
    if idx == -1:
        raise SystemExit('Could not find showUnitProfile modal anchor.')

    modal_block = """
      {showQuickStartHelp ? (
        <div
          onClick={() => setShowQuickStartHelp(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 2000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(960px, 96vw)",
              maxHeight: "88vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 12px 40px rgba(0,0,0,0.20)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>Quick Start Guide</div>
                <SmallHint>Simple written help for using the app without leaving the screen.</SmallHint>
              </div>

              <button
                onClick={() => setShowQuickStartHelp(false)}
                style={{
                  padding: "10px 14px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <SectionCard title="1. Quick Start">
                <div style={{ display: "grid", gap: 8 }}>
                  <div>• Save a new unit or load an existing one.</div>
                  <div>• Enter the symptom and use the troubleshooting hints.</div>
                  <div>• Add photos if needed.</div>
                  <div>• Save the current call to the timeline.</div>
                </div>
              </SectionCard>

              <SectionCard title="2. Historical Entry">
                <div style={{ display: "grid", gap: 8 }}>
                  <div>• Load the unit first whenever possible.</div>
                  <div>• Turn on Historical Entry Mode to reduce clutter.</div>
                  <div>• Enter service date, symptom, cause, fix, outcome, callback, and notes.</div>
                  <div>• Use Save & Add Another for multiple old calls on the same unit.</div>
                </div>
              </SectionCard>

              <SectionCard title="3. Photos">
                <div style={{ display: "grid", gap: 8 }}>
                  <div>• Open Service Event Photos.</div>
                  <div>• Take or attach photos.</div>
                  <div>• Save the call so photos stay with that service event.</div>
                  <div>• Saved photos appear later in Unit Profile and timeline history.</div>
                </div>
              </SectionCard>

              <SectionCard title="4. Editing">
                <div style={{ display: "grid", gap: 8 }}>
                  <div>• Load a unit and use Update Loaded Unit to correct unit details.</div>
                  <div>• In Unit Service Timeline, use Edit Event to fix a saved service entry.</div>
                  <div>• Use Update Event to save changes to that same call.</div>
                </div>
              </SectionCard>

              <SectionCard title="5. Parts / Manuals / Hints">
                <div style={{ display: "grid", gap: 8 }}>
                  <div>• Unit History Troubleshooting Hints uses saved history from that unit.</div>
                  <div>• Parts & Manuals Assist gives broad search and history-aware suggestions.</div>
                  <div>• History is guidance only. It does not stop you from chasing a brand-new issue.</div>
                </div>
              </SectionCard>

              <SectionCard title="FAQ">
                <div style={{ display: "grid", gap: 8 }}>
                  <div><b>How do I avoid duplicates?</b> Load the unit first when possible. Serial number is the strongest identifier.</div>
                  <div><b>How do I correct a unit?</b> Load it, change the fields, then click Update Loaded Unit.</div>
                  <div><b>How do I fix a saved call?</b> Use Edit Event in the Unit Service Timeline.</div>
                  <div><b>How do I enter lots of old calls fast?</b> Use Historical Entry Mode and Save & Add Another.</div>
                  <div><b>Where do photos go?</b> Photos attach to the service event and show in the timeline/profile later.</div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      ) : null}

"""
    text = text[:idx] + modal_block + text[idx:]

path.write_text(text)
print("Forced Help / Quick Start card and modal into page.tsx.")