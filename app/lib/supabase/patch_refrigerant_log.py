"""
patch_refrigerant_log.py
Run from your project root: python3 patch_refrigerant_log.py
"""

with open('app/hvac_units/page.tsx', 'r') as f:
    content = f.read()

errors = []

# ── 1. Add import ────────────────────────────────────────────
old_import = 'import { SmartReadingsVoice, VoiceTextArea, VoiceInputButton } from "./components/VoiceInput";'
new_import = '''import { SmartReadingsVoice, VoiceTextArea, VoiceInputButton } from "./components/VoiceInput";

import { RefrigerantLog } from "./components/RefrigerantLog";'''

if old_import in content:
    content = content.replace(old_import, new_import)
    print("OK: import added")
else:
    errors.append("MISSING: VoiceInput import line not found")

# ── 2. Inject RefrigerantLog section before Step 5 closeout ──
# Find the step-5 wrapper comment
old_step5 = '{/* step-wrappers-page-reflow-v1-step-5 */}'
new_step5 = '''{/* refrigerant-log-v1 */}
      <div style={{ marginTop: 16 }}>
        <SectionCard title="🧪 Refrigerant Log" id="refrigerant-log">
          <SmallHint>
            EPA 608 compliant refrigerant tracking. Log every pound added or recovered.
            Export a compliance CSV at any time. A2L safety warnings included.
          </SmallHint>
          <div style={{ marginTop: 12 }}>
            <RefrigerantLog
              refrigerantType={refrigerantType}
              equipmentType={equipmentType}
              manufacturer={manufacturer}
              model={model}
              customerName={customerName}
              siteName={siteName}
              serviceDate={serviceDate}
              unitId={loadedUnit?.id || ""}
            />
          </div>
        </SectionCard>
      </div>

{/* step-wrappers-page-reflow-v1-step-5 */}'''

if old_step5 in content:
    content = content.replace(old_step5, new_step5, 1)
    print("OK: RefrigerantLog injected before Step 5")
else:
    errors.append("MISSING: step-wrappers-page-reflow-v1-step-5 comment not found")

# ── 3. Add to NavMenu in NavMenu.tsx ─────────────────────────
try:
    with open('app/components/NavMenu.tsx', 'r') as f:
        nav = f.read()

    old_nav_items = '  { label: "Measurements", href: "/hvac_units#measurements", icon: "📊" },'
    new_nav_items = '''  { label: "Measurements", href: "/hvac_units#measurements", icon: "📊" },
  { label: "Refrigerant Log", href: "/hvac_units#refrigerant-log", icon: "🧪" },'''

    if old_nav_items in nav:
        nav = nav.replace(old_nav_items, new_nav_items)
        with open('app/components/NavMenu.tsx', 'w') as f:
            f.write(nav)
        print("OK: Refrigerant Log added to NavMenu")
    else:
        print("WARN: Could not add to NavMenu - add manually if needed")
except Exception as e:
    print(f"WARN: NavMenu update failed - {e}")

# ── Write page.tsx ───────────────────────────────────────────
if errors:
    print("\nERRORS:")
    for e in errors:
        print(" ", e)
    print("\npage.tsx NOT saved due to errors above.")
else:
    with open('app/hvac_units/page.tsx', 'w') as f:
        f.write(content)
    print("\nSUCCESS - page.tsx saved")
    print("Next: npm run build")