from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) Add state ----------
state_anchor = 'const [showServiceEventPhotos, setShowServiceEventPhotos] = useState(false);'
state_insert = state_anchor + '\nconst [historicalEntryMode, setHistoricalEntryMode] = useState(false);'

if 'const [historicalEntryMode, setHistoricalEntryMode] = useState(false);' not in text:
    if state_anchor not in text:
        raise SystemExit("Could not find showServiceEventPhotos state anchor.")
    text = text.replace(state_anchor, state_insert, 1)

# ---------- B) Insert toggle block above Customer / Site / Unit ----------
customer_anchor = '        <SectionCard title="Customer / Site / Unit">'
toggle_block = '''      <div style={{ marginTop: 16 }}>
        <SectionCard title="Historical Entry Mode">
          <button
            onClick={() => setHistoricalEntryMode((v) => !v)}
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
            {historicalEntryMode ? "Turn Historical Entry Mode Off" : "Turn Historical Entry Mode On"}
          </button>

          <SmallHint style={{ marginTop: 12 }}>
            {historicalEntryMode
              ? "Historical Entry Mode is ON. Company/admin sections are hidden so you can enter past calls faster."
              : "Turn this on when entering old service calls. It hides company/admin clutter and keeps the screen cleaner."}
          </SmallHint>
        </SectionCard>
      </div>

'''

if 'title="Historical Entry Mode"' not in text:
    if customer_anchor not in text:
        raise SystemExit('Could not find "Customer / Site / Unit" anchor.')
    text = text.replace(customer_anchor, toggle_block + customer_anchor, 1)

# ---------- C) Helper to wrap top-level titled blocks ----------
def wrap_titled_block(source: str, title: str) -> str:
    marker = f'title="{title}"'
    title_idx = source.find(marker)
    if title_idx == -1:
        raise SystemExit(f'Could not find title="{title}".')

    start = source.rfind('      <div style={{ marginTop: 16 }}>', 0, title_idx)
    if start == -1:
        raise SystemExit(f'Could not find wrapper div for "{title}".')

    i = start
    depth = 0
    end = None

    while i < len(source):
        next_open = source.find("<div", i)
        next_close = source.find("</div>", i)

        if next_close == -1:
            break

        if next_open != -1 and next_open < next_close:
            depth += 1
            i = next_open + 4
        else:
            depth -= 1
            i = next_close + len("</div>")
            if depth == 0:
                end = i
                break

    if end is None:
        raise SystemExit(f'Could not find end of wrapper div for "{title}".')

    block = source[start:end]
    if "{!historicalEntryMode ? (" in block:
        return source

    wrapped = f'{{!historicalEntryMode ? (\\n{block}\\n      ) : null}}'
    return source[:start] + wrapped + source[end:]

# ---------- D) Hide company/admin clutter in historical mode ----------
for title in [
    "Company Admin / Add Tech",
    "Company Team",
]:
    if f'title="{title}"' in text:
        text = wrap_titled_block(text, title)

path.write_text(text)
print("Added Historical Entry Mode toggle and hid company/admin sections when enabled.")