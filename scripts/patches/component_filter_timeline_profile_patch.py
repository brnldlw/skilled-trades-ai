from __future__ import annotations

import re
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

    if "component-filter-helpers-v1" not in source:
        helper_block = """      // component-filter-helpers-v1
      const [unitTimelineComponentFilter, setUnitTimelineComponentFilter] = useState("all");
      const [unitProfileTimelineComponentFilter, setUnitProfileTimelineComponentFilter] = useState("all");

      function normalizeComponentFilterValue(value: string) {
        return String(value || "").trim().toLowerCase();
      }

      function getTimelineComponentFilterOptions(events: any[]) {
        const seen = new Set<string>();
        const options: Array<{ value: string; label: string }> = [
          { value: "all", label: "All components" },
        ];

        for (const event of Array.isArray(events) ? events : []) {
          const label = getAffectedComponentDisplayForEvent(event);
          if (!label) continue;
          const value = normalizeComponentFilterValue(label);
          if (!value || seen.has(value)) continue;
          seen.add(value);
          options.push({ value, label });
        }

        return options;
      }

      function timelineEventMatchesComponentFilter(event: any, filterValue: string) {
        const normalizedFilter = normalizeComponentFilterValue(filterValue);
        if (!normalizedFilter || normalizedFilter === "all") return true;
        const label = getAffectedComponentDisplayForEvent(event);
        return normalizeComponentFilterValue(label) === normalizedFilter;
      }

"""
        source = insert_before_once(
            source,
            'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
            helper_block,
            "component filter helpers",
        )

    if "component-filter-ui-current-timeline-v1" not in source:
        current_timeline_pattern = re.compile(
            r'(?P<indent>\s*)\{unitServiceTimeline\.map\(\(event\) => \((?P<body>.*?)\n(?P=indent)\)\)\}',
            re.DOTALL,
        )

        current_timeline_match = current_timeline_pattern.search(source)
        if not current_timeline_match:
            raise RuntimeError("Could not find unitServiceTimeline.map(...) block to add component filter.")

        indent = current_timeline_match.group("indent")
        body = current_timeline_match.group("body")

        current_timeline_replacement = f"""{indent}{{(() => {{
{indent}  const __options = getTimelineComponentFilterOptions(unitServiceTimeline);
{indent}  const __activeFilter = __options.some((option) => option.value === unitTimelineComponentFilter)
{indent}    ? unitTimelineComponentFilter
{indent}    : "all";
{indent}  const __filteredEvents = unitServiceTimeline.filter((event) =>
{indent}    timelineEventMatchesComponentFilter(event, __activeFilter)
{indent}  );

{indent}  return (
{indent}    <>
{indent}      <div style={{{{ marginBottom: 10, display: "grid", gap: 6 }}}}>
{indent}        <label style={{{{ display: "grid", gap: 6 }}}}>
{indent}          <span style={{{{ fontWeight: 900 }}}}>Filter Timeline by Component</span>
{indent}          <select
{indent}            value={{__activeFilter}}
{indent}            onChange={{(e) => setUnitTimelineComponentFilter(e.target.value)}}
{indent}            style={{{{ width: "100%", padding: 8 }}}}
{indent}          >
{indent}            {{__options.map((option) => (
{indent}              <option key={{option.value}} value={{option.value}}>
{indent}                {{option.label}}
{indent}              </option>
{indent}            ))}}
{indent}          </select>
{indent}        </label>
{indent}      </div>

{indent}      {{__filteredEvents.length ? (
{indent}        __filteredEvents.map((event) => ({body}
{indent}        ))
{indent}      ) : (
{indent}        <div
{indent}          style={{{{
{indent}            border: "1px solid #eee",
{indent}            borderRadius: 10,
{indent}            padding: 10,
{indent}            background: "#fafafa",
{indent}          }}}}
{indent}        >
{indent}          <SmallHint>No service events match the selected component filter.</SmallHint>
{indent}        </div>
{indent}      )}}
{indent}    </>
{indent}  );
{indent}}})()}}"""

        source = (
            source[: current_timeline_match.start()]
            + current_timeline_replacement
            + source[current_timeline_match.end() :]
        )

        source = source.replace(
            "/* affected-component-display-v1 */",
            "/* affected-component-display-v1 */ /* component-filter-ui-current-timeline-v1 */",
            1,
        )

    if "component-filter-ui-profile-timeline-v1" not in source:
        profile_timeline_pattern = re.compile(
            r'(?P<indent>\s*)\{unitProfileTimeline\.map\(\(event\) => \((?P<body>.*?)\n(?P=indent)\)\)\}',
            re.DOTALL,
        )

        profile_timeline_match = profile_timeline_pattern.search(source)
        if not profile_timeline_match:
            raise RuntimeError("Could not find unitProfileTimeline.map(...) block to add component filter.")

        indent = profile_timeline_match.group("indent")
        body = profile_timeline_match.group("body")

        profile_timeline_replacement = f"""{indent}{{(() => {{
{indent}  const __options = getTimelineComponentFilterOptions(unitProfileTimeline);
{indent}  const __activeFilter = __options.some((option) => option.value === unitProfileTimelineComponentFilter)
{indent}    ? unitProfileTimelineComponentFilter
{indent}    : "all";
{indent}  const __filteredEvents = unitProfileTimeline.filter((event) =>
{indent}    timelineEventMatchesComponentFilter(event, __activeFilter)
{indent}  );

{indent}  return (
{indent}    <>
{indent}      <div style={{{{ marginBottom: 10, display: "grid", gap: 6 }}}}>
{indent}        <label style={{{{ display: "grid", gap: 6 }}}}>
{indent}          <span style={{{{ fontWeight: 900 }}}}>Filter Timeline by Component</span>
{indent}          <select
{indent}            value={{__activeFilter}}
{indent}            onChange={{(e) => setUnitProfileTimelineComponentFilter(e.target.value)}}
{indent}            style={{{{ width: "100%", padding: 8 }}}}
{indent}          >
{indent}            {{__options.map((option) => (
{indent}              <option key={{option.value}} value={{option.value}}>
{indent}                {{option.label}}
{indent}              </option>
{indent}            ))}}
{indent}          </select>
{indent}        </label>
{indent}      </div>

{indent}      {{__filteredEvents.length ? (
{indent}        __filteredEvents.map((event) => ({body}
{indent}        ))
{indent}      ) : (
{indent}        <div
{indent}          style={{{{
{indent}            border: "1px solid #eee",
{indent}            borderRadius: 10,
{indent}            padding: 10,
{indent}            background: "#fafafa",
{indent}          }}}}
{indent}        >
{indent}          <SmallHint>No service events match the selected component filter.</SmallHint>
{indent}        </div>
{indent}      )}}
{indent}    </>
{indent}  );
{indent}}})()}}"""

        source = (
            source[: profile_timeline_match.start()]
            + profile_timeline_replacement
            + source[profile_timeline_match.end() :]
        )

        source = source.replace(
            "/* affected-component-display-v2 */",
            "/* affected-component-display-v2 */ /* component-filter-ui-profile-timeline-v1 */",
            1,
        )

    backup = PAGE.with_name(PAGE.name + ".component-filter-timeline-profile.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()