from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if 'title="Help / Quick Start"' in text:
    raise SystemExit("Help / Quick Start section already exists.")

anchor = '        <SectionCard title="Customer / Site / Unit">'
idx = text.find(anchor)
if idx == -1:
    raise SystemExit('Could not find "Customer / Site / Unit" anchor.')

wrapper_start = text.rfind('        <div style={{ marginTop: 16 }}>', 0, idx)
if wrapper_start == -1:
    raise SystemExit('Could not find wrapper before "Customer / Site / Unit".')

block = """
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Help / Quick Start">
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>1. Quick Start</div>
                <SmallHint>Save a new unit or load an existing one. Enter the symptom, use the hints, add photos if needed, then save the call to the timeline.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>2. Historical Entry</div>
                <SmallHint>Load the unit first whenever possible. Turn on Historical Entry Mode to reduce clutter. Enter service date, symptom, cause, fix, outcome, callback, and notes. Use Save & Add Another for multiple old calls on the same unit.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>3. Photos</div>
                <SmallHint>Open Service Event Photos, take or attach photos, then save the call so the photos stay with that service event and appear later in timeline/profile history.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>4. Editing</div>
                <SmallHint>Load a unit and use Update Loaded Unit to correct unit details. In Unit Service Timeline, use Edit Event to fix a saved service entry, then use Update Event to save changes.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>5. Parts / Manuals / Hints</div>
                <SmallHint>Unit History Troubleshooting Hints uses saved history from that unit. Parts & Manuals Assist gives broad search and history-aware suggestions. History is guidance only and does not stop you from chasing a brand-new issue.</SmallHint>
              </div>

              <div>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>FAQ</div>
                <SmallHint><b>How do I avoid duplicates?</b> Load the unit first when possible. Serial number is the strongest identifier.</SmallHint>
                <SmallHint><b>How do I correct a unit?</b> Load it, change the fields, then click Update Loaded Unit.</SmallHint>
                <SmallHint><b>How do I fix a saved call?</b> Use Edit Event in the Unit Service Timeline.</SmallHint>
                <SmallHint><b>How do I enter lots of old calls fast?</b> Use Historical Entry Mode and Save & Add Another.</SmallHint>
                <SmallHint><b>Where do photos go?</b> Photos attach to the service event and show in the timeline/profile later.</SmallHint>
              </div>
            </div>
          </SectionCard>
        </div>

"""

text = text[:wrapper_start] + block + text[wrapper_start:]
path.write_text(text)
print("Added inline Help / Quick Start section.")