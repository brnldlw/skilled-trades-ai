from pathlib import Path

path = Path("app/hvac_units/page.tsx")
text = path.read_text()

# ---------- A) strengthen Unit Tag label/help ----------
old_label = """          <label style={{ fontWeight: 900 }}>Unit Nickname / Tag</label>"""
new_label = """          <label style={{ fontWeight: 900, fontSize: 16 }}>Unit Nickname / Tag</label>
          <SmallHint>
            Use a clear unit tag like RTU-1, RTU-2, WIC-1, Reach-In 3, or Merchandiser 2.
          </SmallHint>"""

if old_label in text and "Use a clear unit tag like RTU-1" not in text:
    text = text.replace(old_label, new_label, 1)

# ---------- B) add warning before saving unit when site has multiple units and tag is blank ----------
anchor = "async function saveCurrentUnit() {"
if anchor not in text:
    raise SystemExit("Could not find saveCurrentUnit function anchor.")

warning_block = """
  const siteUnitCount = siteUnitsAtLocation.length;
  if (
    customerName.trim() &&
    siteName.trim() &&
    siteUnitCount > 1 &&
    !unitNickname.trim()
  ) {
    alert(
      "This site already has multiple saved units. Add a clear Unit Nickname / Tag before saving so this unit does not get confused with others at the same location."
    );
    return;
  }
"""

if warning_block not in text:
    text = text.replace(anchor, anchor + "\n" + warning_block, 1)

path.write_text(text)
print("Added stronger Unit Tag guardrail.")