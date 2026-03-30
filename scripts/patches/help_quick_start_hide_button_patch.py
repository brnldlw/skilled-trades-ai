from pathlib import Path
import re

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

if 'const [showQuickStartInline, setShowQuickStartInline] = useState(true);' not in text:
    state_anchor = 'const [historicalEntryMode, setHistoricalEntryMode] = useState(false);'
    if state_anchor not in text:
        raise SystemExit("Could not find historicalEntryMode state anchor.")
    text = text.replace(
        state_anchor,
        state_anchor + '\nconst [showQuickStartInline, setShowQuickStartInline] = useState(true);',
        1,
    )

if "Hide Quick Start" in text or "Show Quick Start" in text:
    raise SystemExit("Quick Start hide/show button already appears to exist.")

pattern = re.compile(
    r'(<SectionCard title="Help / Quick Start">)([\s\S]*?)(\n\s*</SectionCard>)',
    re.S,
)

match = pattern.search(text)
if not match:
    raise SystemExit('Could not find the Help / Quick Start section.')

opening = match.group(1)
inner = match.group(2).rstrip()
closing = match.group(3)

replacement = f"""{opening}
            <button
              onClick={{() => setShowQuickStartInline((v) => !v)}}
              style={{{{
                padding: "10px 14px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}}}
            >
              {{showQuickStartInline ? "Hide Quick Start" : "Show Quick Start"}}
            </button>

            {{showQuickStartInline ? (
{inner}
            ) : (
              <SmallHint style={{{{ marginTop: 12 }}}}>
                Hidden to keep the main workflow clean.
              </SmallHint>
            )}}{closing}"""

text = text[:match.start()] + replacement + text[match.end():]
path.write_text(text)
print("Added hide/show button to Help / Quick Start.")