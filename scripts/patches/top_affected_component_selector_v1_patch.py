from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise RuntimeError(f"Could not find expected block for: {label}")
    print(f"Patched: {label}")
    return text.replace(old, new, 1)


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "top-affected-component-selector-v1" in source:
        print("Top affected component selector already applied.")
        return

    source = "/* top-affected-component-selector-v1 */\n" + source

    old_block = """                <div>
                  <label style={{ fontWeight: 900 }}>Affected Component</label>
                  <div
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                      minHeight: 38,
                    }}
                  >
                    {getCurrentAffectedComponentLabelForAssist() || "Set in lower component/troubleshooting section"}
                  </div>
                </div>
"""
    new_block = """                <div>
                  <label style={{ fontWeight: 900 }}>Affected Component</label>
                  {(() => {
                    const options = getAffectedComponentOptions();
                    return (
                      <div style={{ display: "grid", gap: 8 }}>
                        <select
                          value={affectedComponentId}
                          onChange={(e) => {
                            const nextId = e.target.value;
                            const selected = options.find((option) => option.id === nextId);
                            setAffectedComponentId(nextId);
                            setAffectedComponentLabel(selected?.label || "");
                          }}
                          style={{ width: "100%", padding: 8 }}
                        >
                          <option value="">Select affected component</option>
                          {options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <div
                          style={{
                            width: "100%",
                            padding: 8,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            background: "#fff",
                            minHeight: 38,
                          }}
                        >
                          {getCurrentAffectedComponentLabelForAssist() || "Select the exact component for this call"}
                        </div>
                      </div>
                    );
                  })()}
                </div>
"""
    source = replace_once(source, old_block, new_block, "top Step 2 affected component selector")

    backup = PAGE.with_name(PAGE.name + ".top-affected-component-selector-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
