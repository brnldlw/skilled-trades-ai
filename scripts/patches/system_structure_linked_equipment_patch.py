from __future__ import annotations

import re
import shutil
from pathlib import Path
from textwrap import dedent

TARGET = Path("app/hvac_units/page.tsx")
BACKUP_SUFFIX = ".system-structure-v2.bak"

STATE_SENTINEL = "system-structure-state-v2"
UI_SENTINEL = "system-structure-ui-v2"
SAVE_SENTINEL = "system-structure-save-guard-v2"


def insert_after(source: str, anchor: str, block: str, sentinel: str) -> tuple[str, bool]:
    if sentinel in source:
        return source, False
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find anchor: {anchor!r}")
    insert_at = idx + len(anchor)
    return source[:insert_at] + block + source[insert_at:], True


def insert_before(source: str, anchor: str, block: str, sentinel: str) -> tuple[str, bool]:
    if sentinel in source:
        return source, False
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find anchor: {anchor!r}")
    return source[:idx] + block + "\n" + source[idx:], True


def remove_old_paired_ui(source: str) -> tuple[str, bool]:
    patterns = [
        re.compile(
            r'\s*\{/\*\s*paired-equipment-ui-v2\s*\*/\}\s*<SectionCard title="Paired Equipment / Tag Identity">.*?</SectionCard>\s*',
            re.DOTALL,
        ),
        re.compile(
            r'\s*\{/\*\s*paired-equipment-ui-v1\s*\*/\}\s*<div.*?</div>\s*',
            re.DOTALL,
        ),
    ]
    updated = source
    changed = False
    for pattern in patterns:
        updated, count = pattern.subn("\n", updated, count=1)
        if count:
            changed = True
    return updated, changed


def insert_save_guard(source: str, block: str, sentinel: str) -> tuple[str, bool]:
    if sentinel in source:
        return source, False

    patterns = [
        re.compile(r"(async function saveCurrentUnit\s*\([^)]*\)\s*\{)", re.DOTALL),
        re.compile(r"(function saveCurrentUnit\s*\([^)]*\)\s*\{)", re.DOTALL),
        re.compile(r"(const saveCurrentUnit\s*=\s*async\s*\([^)]*\)\s*=>\s*\{)", re.DOTALL),
        re.compile(r"(const saveCurrentUnit\s*=\s*\([^)]*\)\s*=>\s*\{)", re.DOTALL),
    ]

    for pattern in patterns:
        match = pattern.search(source)
        if match:
            insert_at = match.end(0)
            return source[:insert_at] + block + source[insert_at:], True

    raise RuntimeError("Could not find saveCurrentUnit() to insert system structure guard.")


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Could not find target file: {TARGET}")

    original = TARGET.read_text(encoding="utf-8")
    updated = original
    changed_any = False

    updated, changed = remove_old_paired_ui(updated)
    changed_any = changed_any or changed

    state_anchor = 'const [unitServiceTimelineMessage, setUnitServiceTimelineMessage] = useState("");'

    state_block = dedent("""

      // system-structure-state-v2
      const [systemType, setSystemType] = useState<
        "single" | "split_system" | "furnace_ac" | "heat_pump_air_handler" | "walk_in" | "mini_split" | "other_multi"
      >("single");
      const [primaryComponentRole, setPrimaryComponentRole] = useState("unit");
      const [primaryTagStatus, setPrimaryTagStatus] = useState<"readable" | "partial" | "unreadable">("readable");
      const [primaryTagIssueReason, setPrimaryTagIssueReason] = useState("");
      const [primaryCheckedInsideForInternalLabel, setPrimaryCheckedInsideForInternalLabel] = useState(false);

      const [linkedEquipmentComponents, setLinkedEquipmentComponents] = useState<
        Array<{
          id: string;
          role: string;
          tag: string;
          manufacturer: string;
          model: string;
          serial: string;
          tagStatus: "readable" | "partial" | "unreadable";
          tagIssueReason: string;
          checkedInsideForInternalLabel: boolean;
        }>
      >([]);

      const systemStructureDefaults: Record<
        string,
        { primaryRole: string; linkedRole: string; linkedLabel: string }
      > = {
        single: { primaryRole: "unit", linkedRole: "linked_component", linkedLabel: "Linked Component" },
        split_system: { primaryRole: "outdoor_unit", linkedRole: "indoor_unit", linkedLabel: "Indoor Unit" },
        furnace_ac: { primaryRole: "outdoor_unit", linkedRole: "furnace", linkedLabel: "Furnace" },
        heat_pump_air_handler: { primaryRole: "outdoor_unit", linkedRole: "air_handler", linkedLabel: "Air Handler" },
        walk_in: { primaryRole: "condensing_unit", linkedRole: "evaporator", linkedLabel: "Evaporator" },
        mini_split: { primaryRole: "outdoor_unit", linkedRole: "indoor_head", linkedLabel: "Indoor Head" },
        other_multi: { primaryRole: "primary_component", linkedRole: "linked_component", linkedLabel: "Linked Component" },
      };

      const linkedEquipmentRoleOptions = [
        { value: "linked_component", label: "Linked Component" },
        { value: "indoor_unit", label: "Indoor Unit" },
        { value: "outdoor_unit", label: "Outdoor Unit" },
        { value: "furnace", label: "Furnace" },
        { value: "air_handler", label: "Air Handler" },
        { value: "condensing_unit", label: "Condensing Unit" },
        { value: "evaporator", label: "Evaporator" },
        { value: "indoor_head", label: "Indoor Head" },
        { value: "other", label: "Other" },
      ] as const;

      const addLinkedEquipmentComponent = (roleOverride?: string) => {
        const defaults = systemStructureDefaults[systemType] || systemStructureDefaults.single;
        const nextRole = roleOverride || defaults.linkedRole;
        setLinkedEquipmentComponents((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${prev.length + 1}`,
            role: nextRole,
            tag: "",
            manufacturer: "",
            model: "",
            serial: "",
            tagStatus: "readable",
            tagIssueReason: "",
            checkedInsideForInternalLabel: false,
          },
        ]);
      };

      const updateLinkedEquipmentComponent = (
        id: string,
        field:
          | "role"
          | "tag"
          | "manufacturer"
          | "model"
          | "serial"
          | "tagStatus"
          | "tagIssueReason"
          | "checkedInsideForInternalLabel",
        value: string | boolean
      ) => {
        setLinkedEquipmentComponents((prev) =>
          prev.map((component) =>
            component.id === id
              ? ({
                  ...component,
                  [field]: value,
                } as typeof component)
              : component
          )
        );
      };

      const removeLinkedEquipmentComponent = (id: string) => {
        setLinkedEquipmentComponents((prev) => prev.filter((component) => component.id !== id));
      };
    """)

    updated, changed = insert_after(updated, state_anchor, state_block, STATE_SENTINEL)
    changed_any = changed_any or changed

    ui_anchor = '<div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>'

    ui_block = dedent("""
                  {/* system-structure-ui-v2 */}
                  <div
                    style={{
                      marginTop: 12,
                      border: "1px solid #d7d7d7",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fbfbfb",
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 16 }}>
                      System Structure / Linked Equipment
                    </div>

                    <SmallHint>
                      The Unit Tag / Manufacturer / Model / Serial fields above are the primary piece of equipment for
                      this call. Use this section when the system has linked equipment like outdoor + indoor, furnace +
                      AC, condensing unit + evaporator, or multiple evaporators / indoor heads.
                    </SmallHint>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 10,
                      }}
                    >
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 900 }}>System Type</span>
                        <select
                          value={systemType}
                          onChange={(e) => {
                            const nextType = e.target.value as
                              | "single"
                              | "split_system"
                              | "furnace_ac"
                              | "heat_pump_air_handler"
                              | "walk_in"
                              | "mini_split"
                              | "other_multi";
                            setSystemType(nextType);
                            setPrimaryComponentRole(systemStructureDefaults[nextType]?.primaryRole || "unit");

                            if (nextType === "single") {
                              setLinkedEquipmentComponents([]);
                            } else if (!linkedEquipmentComponents.length) {
                              const defaults = systemStructureDefaults[nextType] || systemStructureDefaults.single;
                              setLinkedEquipmentComponents([
                                {
                                  id: `${Date.now()}-1`,
                                  role: defaults.linkedRole,
                                  tag: "",
                                  manufacturer: "",
                                  model: "",
                                  serial: "",
                                  tagStatus: "readable",
                                  tagIssueReason: "",
                                  checkedInsideForInternalLabel: false,
                                },
                              ]);
                            }
                          }}
                          style={{ width: "100%", padding: 8 }}
                        >
                          <option value="single">Single piece of equipment</option>
                          <option value="split_system">Split system</option>
                          <option value="furnace_ac">Furnace + AC</option>
                          <option value="heat_pump_air_handler">Heat pump + air handler</option>
                          <option value="walk_in">Walk-in condensing unit + evaporator(s)</option>
                          <option value="mini_split">Mini-split outdoor + indoor head(s)</option>
                          <option value="other_multi">Other multi-component system</option>
                        </select>
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 900 }}>Primary Component Role</span>
                        <select
                          value={primaryComponentRole}
                          onChange={(e) => setPrimaryComponentRole(e.target.value)}
                          style={{ width: "100%", padding: 8 }}
                        >
                          <option value="unit">Unit</option>
                          <option value="outdoor_unit">Outdoor Unit</option>
                          <option value="indoor_unit">Indoor Unit</option>
                          <option value="furnace">Furnace</option>
                          <option value="air_handler">Air Handler</option>
                          <option value="condensing_unit">Condensing Unit</option>
                          <option value="evaporator">Evaporator</option>
                          <option value="indoor_head">Indoor Head</option>
                          <option value="primary_component">Primary Component</option>
                        </select>
                      </label>

                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ fontWeight: 900 }}>Primary Tag Status</span>
                        <select
                          value={primaryTagStatus}
                          onChange={(e) =>
                            setPrimaryTagStatus(e.target.value as "readable" | "partial" | "unreadable")
                          }
                          style={{ width: "100%", padding: 8 }}
                        >
                          <option value="readable">Readable</option>
                          <option value="partial">Partial / damaged</option>
                          <option value="unreadable">Unreadable / destroyed</option>
                        </select>
                      </label>
                    </div>

                    {primaryTagStatus !== "readable" ? (
                      <div
                        style={{
                          border: "1px solid #f0c36d",
                          borderRadius: 10,
                          padding: 12,
                          background: "#fff8e8",
                          display: "grid",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>Primary component damaged or unreadable tag workflow</div>

                        <SmallHint>
                          Check inside the electrical, fan, or control area for an internal label before saving
                          incomplete primary component information.
                        </SmallHint>

                        <label style={{ display: "grid", gap: 6 }}>
                          <span style={{ fontWeight: 900 }}>Reason primary tag could not be fully read</span>
                          <textarea
                            value={primaryTagIssueReason}
                            onChange={(e) => setPrimaryTagIssueReason(e.target.value)}
                            rows={3}
                            placeholder="Example: Outdoor tag sun-faded. Checked inside control panel and found partial serial only."
                            style={{ width: "100%", padding: 8 }}
                          />
                        </label>

                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontWeight: 700,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={primaryCheckedInsideForInternalLabel}
                            onChange={(e) => setPrimaryCheckedInsideForInternalLabel(e.target.checked)}
                          />
                          I checked inside the electrical / fan / control area for an internal label.
                        </label>
                      </div>
                    ) : null}

                    {systemType !== "single" ? (
                      <div
                        style={{
                          border: "1px solid #d7d7d7",
                          borderRadius: 12,
                          padding: 12,
                          background: "#fff",
                          display: "grid",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>Linked Equipment Components</div>
                            <SmallHint>
                              Add every linked piece of equipment for this system so history does not get mixed up.
                            </SmallHint>
                          </div>

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => addLinkedEquipmentComponent()}
                              style={{
                                padding: "8px 12px",
                                fontWeight: 900,
                                border: "1px solid #cfcfcf",
                                borderRadius: 10,
                                background: "#ffffff",
                                color: "#111",
                                cursor: "pointer",
                              }}
                            >
                              Add {systemStructureDefaults[systemType]?.linkedLabel || "Linked Component"}
                            </button>

                            {systemType === "walk_in" ? (
                              <button
                                type="button"
                                onClick={() => addLinkedEquipmentComponent("evaporator")}
                                style={{
                                  padding: "8px 12px",
                                  fontWeight: 900,
                                  border: "1px solid #cfcfcf",
                                  borderRadius: 10,
                                  background: "#ffffff",
                                  color: "#111",
                                  cursor: "pointer",
                                }}
                              >
                                Add Evaporator
                              </button>
                            ) : null}

                            {systemType === "mini_split" ? (
                              <button
                                type="button"
                                onClick={() => addLinkedEquipmentComponent("indoor_head")}
                                style={{
                                  padding: "8px 12px",
                                  fontWeight: 900,
                                  border: "1px solid #cfcfcf",
                                  borderRadius: 10,
                                  background: "#ffffff",
                                  color: "#111",
                                  cursor: "pointer",
                                }}
                              >
                                Add Indoor Head
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {!linkedEquipmentComponents.length ? (
                          <div
                            style={{
                              border: "1px solid #f0c36d",
                              borderRadius: 10,
                              padding: 10,
                              background: "#fff8e8",
                              fontWeight: 700,
                            }}
                          >
                            This system type needs linked equipment entered before save.
                          </div>
                        ) : null}

                        {linkedEquipmentComponents.map((component, idx) => (
                          <div
                            key={component.id}
                            style={{
                              border: "1px solid #eee",
                              borderRadius: 10,
                              padding: 10,
                              background: "#fafafa",
                              display: "grid",
                              gap: 10,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                              <div style={{ fontWeight: 900 }}>Linked Component {idx + 1}</div>

                              <button
                                type="button"
                                onClick={() => removeLinkedEquipmentComponent(component.id)}
                                style={{
                                  padding: "6px 10px",
                                  fontWeight: 900,
                                  border: "1px solid #cfcfcf",
                                  borderRadius: 10,
                                  background: "#ffffff",
                                  color: "#111",
                                  cursor: "pointer",
                                }}
                              >
                                Remove
                              </button>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: 10,
                              }}
                            >
                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontWeight: 900 }}>Component Role</span>
                                <select
                                  value={component.role}
                                  onChange={(e) => updateLinkedEquipmentComponent(component.id, "role", e.target.value)}
                                  style={{ width: "100%", padding: 8 }}
                                >
                                  {linkedEquipmentRoleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontWeight: 900 }}>Component Tag</span>
                                <input
                                  value={component.tag}
                                  onChange={(e) => updateLinkedEquipmentComponent(component.id, "tag", e.target.value)}
                                  placeholder="Example: EVAP-2, Indoor Head 3"
                                  style={{ width: "100%", padding: 8 }}
                                />
                              </label>

                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontWeight: 900 }}>Manufacturer</span>
                                <input
                                  value={component.manufacturer}
                                  onChange={(e) =>
                                    updateLinkedEquipmentComponent(component.id, "manufacturer", e.target.value)
                                  }
                                  style={{ width: "100%", padding: 8 }}
                                />
                              </label>

                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontWeight: 900 }}>Model</span>
                                <input
                                  value={component.model}
                                  onChange={(e) => updateLinkedEquipmentComponent(component.id, "model", e.target.value)}
                                  style={{ width: "100%", padding: 8 }}
                                />
                              </label>

                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontWeight: 900 }}>Serial</span>
                                <input
                                  value={component.serial}
                                  onChange={(e) => updateLinkedEquipmentComponent(component.id, "serial", e.target.value)}
                                  style={{ width: "100%", padding: 8 }}
                                />
                              </label>

                              <label style={{ display: "grid", gap: 6 }}>
                                <span style={{ fontWeight: 900 }}>Tag Status</span>
                                <select
                                  value={component.tagStatus}
                                  onChange={(e) =>
                                    updateLinkedEquipmentComponent(component.id, "tagStatus", e.target.value)
                                  }
                                  style={{ width: "100%", padding: 8 }}
                                >
                                  <option value="readable">Readable</option>
                                  <option value="partial">Partial / damaged</option>
                                  <option value="unreadable">Unreadable / destroyed</option>
                                </select>
                              </label>
                            </div>

                            {component.tagStatus !== "readable" ? (
                              <div
                                style={{
                                  border: "1px solid #f0c36d",
                                  borderRadius: 10,
                                  padding: 12,
                                  background: "#fff8e8",
                                  display: "grid",
                                  gap: 10,
                                }}
                              >
                                <SmallHint>
                                  Check inside the electrical, fan, or control area for another label for this linked
                                  component before saving incomplete information.
                                </SmallHint>

                                <label style={{ display: "grid", gap: 6 }}>
                                  <span style={{ fontWeight: 900 }}>Reason tag could not be fully read</span>
                                  <textarea
                                    value={component.tagIssueReason}
                                    onChange={(e) =>
                                      updateLinkedEquipmentComponent(component.id, "tagIssueReason", e.target.value)
                                    }
                                    rows={3}
                                    style={{ width: "100%", padding: 8 }}
                                  />
                                </label>

                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontWeight: 700,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={component.checkedInsideForInternalLabel}
                                    onChange={(e) =>
                                      updateLinkedEquipmentComponent(
                                        component.id,
                                        "checkedInsideForInternalLabel",
                                        e.target.checked
                                      )
                                    }
                                  />
                                  I checked inside the electrical / fan / control area for an internal label.
                                </label>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
    """)

    updated, changed = insert_before(updated, ui_anchor, ui_block, UI_SENTINEL)
    changed_any = changed_any or changed

    save_block = dedent("""

        // system-structure-save-guard-v2
        const __systemType = String(systemType ?? "single").trim();
        const __primaryTagState = String(primaryTagStatus ?? "readable").trim();
        const __primaryTagReason = String(primaryTagIssueReason ?? "").trim();
        const __primaryHasSupportId =
          String(unitNickname ?? "").trim().length > 0 ||
          String(manufacturer ?? "").trim().length > 0 ||
          String(model ?? "").trim().length > 0 ||
          String(serialNumber ?? "").trim().length > 0 ||
          String(nameplate?.serial ?? "").trim().length > 0;

        const __linkedComponents = Array.isArray(linkedEquipmentComponents) ? linkedEquipmentComponents : [];
        const __requiresLinkedComponents = __systemType !== "single";

        if (__primaryTagState !== "readable") {
          if (!primaryCheckedInsideForInternalLabel) {
            window.alert(
              "Before saving a partial or unreadable primary component tag, check inside the electrical, fan, or control area for an internal label and confirm that step."
            );
            return;
          }

          if (!__primaryTagReason) {
            window.alert(
              "Add a short reason explaining why the primary component tag is partial or unreadable before saving."
            );
            return;
          }

          if (!__primaryHasSupportId) {
            window.alert(
              "Do not save a damaged or unreadable primary component tag without at least one supporting identifier like unit tag, manufacturer, model, or serial."
            );
            return;
          }
        }

        if (__requiresLinkedComponents && __linkedComponents.length === 0) {
          window.alert(
            "This system type requires linked equipment to be entered before saving. Add the indoor unit, furnace, air handler, evaporator, or other linked component(s) first."
          );
          return;
        }

        if (
          __systemType === "walk_in" &&
          !__linkedComponents.some((component) => String(component.role ?? "").trim() === "evaporator")
        ) {
          window.alert(
            "Walk-in systems must include at least one evaporator in the linked equipment section before saving."
          );
          return;
        }

        if (
          __systemType === "mini_split" &&
          !__linkedComponents.some((component) => String(component.role ?? "").trim() === "indoor_head")
        ) {
          window.alert(
            "Mini-split systems must include at least one indoor head in the linked equipment section before saving."
          );
          return;
        }

        for (const component of __linkedComponents) {
          const __role = String(component.role ?? "").trim();
          const __tag = String(component.tag ?? "").trim();
          const __manufacturer = String(component.manufacturer ?? "").trim();
          const __model = String(component.model ?? "").trim();
          const __serial = String(component.serial ?? "").trim();
          const __tagStatus = String(component.tagStatus ?? "readable").trim();
          const __tagReason = String(component.tagIssueReason ?? "").trim();

          if (!__role) {
            window.alert("Each linked component must have a component role before saving.");
            return;
          }

          if (!__tag && !__manufacturer && !__model && !__serial) {
            window.alert(
              "Each linked component must include at least one identifier like a tag, manufacturer, model, or serial before saving."
            );
            return;
          }

          if (__tagStatus !== "readable") {
            if (!component.checkedInsideForInternalLabel) {
              window.alert(
                "Before saving a partial or unreadable linked component tag, check inside the electrical, fan, or control area for an internal label and confirm that step."
              );
              return;
            }

            if (!__tagReason) {
              window.alert(
                "Add a short reason explaining why the linked component tag is partial or unreadable before saving."
              );
              return;
            }
          }
        }
    """)

    updated, changed = insert_save_guard(updated, save_block, SAVE_SENTINEL)
    changed_any = changed_any or changed

    if not changed_any:
        print("No changes applied.")
        return

    backup_path = TARGET.with_name(TARGET.name + BACKUP_SUFFIX)
    shutil.copy2(TARGET, backup_path)
    TARGET.write_text(updated, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup_path}")


if __name__ == "__main__":
    main()