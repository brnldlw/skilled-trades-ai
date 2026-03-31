from __future__ import annotations

import re
import shutil
from pathlib import Path

TARGET = Path("app/hvac_units/page.tsx")
BACKUP_SUFFIX = ".unit-tag-guardrail.bak"

SENTINEL_HELPER = "unit-tag-helper-text-v1"
SENTINEL_GUARD = "unit-tag-save-guard-v1"


def detect_identifier(source: str, candidates: list[str], label: str, required: bool = True) -> str | None:
    for name in candidates:
        if re.search(rf"\b{name}\b", source):
            return name
    if required:
        raise RuntimeError(f"Could not detect {label}. Looked for: {', '.join(candidates)}")
    return None


def strengthen_label(source: str) -> tuple[str, bool]:
    patterns = [
        (
            re.compile(r"(>)(\s*Unit Nickname / Tag\s*)(<)"),
            r"\1Unit Nickname / Tag *\3",
        ),
        (
            re.compile(r'(["\'])Unit Nickname / Tag(["\'])'),
            r'\1Unit Nickname / Tag *\2',
        ),
    ]
    updated = source
    changed = False
    for pattern, replacement in patterns:
        new_source, count = pattern.subn(replacement, updated, count=1)
        if count:
            updated = new_source
            changed = True
            break
    return updated, changed


def insert_helper_text(source: str, unit_tag_var: str) -> tuple[str, bool]:
    if SENTINEL_HELPER in source:
        return source, False

    helper = (
        f"\n"
        f"              {{/* {SENTINEL_HELPER} */}}\n"
        f'              <p className="mt-1 text-xs text-amber-200/90">\n'
        f"                Use a clear unit tag like RTU-1, RTU-2, WIC-1, Reach-In 3, or Merchandiser 2.\n"
        f"              </p>"
    )

    value_patterns = [
        re.compile(
            rf"(<input\b[^>]*value=\{{{re.escape(unit_tag_var)}\}}[^>]*/>)",
            re.DOTALL,
        ),
        re.compile(
            rf"(<textarea\b[^>]*value=\{{{re.escape(unit_tag_var)}\}}[^>]*>.*?</textarea>)",
            re.DOTALL,
        ),
    ]

    for pattern in value_patterns:
        match = pattern.search(source)
        if match:
            insert_at = match.end(1)
            return source[:insert_at] + helper + source[insert_at:], True

    return source, False


def inject_save_guard(
    source: str,
    customer_var: str,
    site_var: str,
    unit_tag_var: str,
    site_units_var: str,
) -> tuple[str, bool]:
    if SENTINEL_GUARD in source:
        return source, False

    guard_block = f"""
    // {SENTINEL_GUARD}
    const __unitTagGuardCustomer = String({customer_var} ?? "").trim();
    const __unitTagGuardSite = String({site_var} ?? "").trim();
    const __unitTagGuardTag = String({unit_tag_var} ?? "").trim();
    const __unitTagGuardSiteUnits = Array.isArray({site_units_var}) ? {site_units_var} : [];
    if (
      __unitTagGuardCustomer &&
      __unitTagGuardSite &&
      __unitTagGuardSiteUnits.length >= 2 &&
      !__unitTagGuardTag
    ) {{
      const proceedWithoutTag = window.confirm(
        "This site already has multiple saved units. Saving without a Unit Nickname / Tag can mix units up. Use a clear tag like RTU-1, RTU-2, WIC-1, Reach-In 3, or Merchandiser 2. Save anyway?"
      );
      if (!proceedWithoutTag) return;
    }}
"""

    patterns = [
        re.compile(r"(async function saveCurrentUnit\s*\([^)]*\)\s*\{)"),
        re.compile(r"(function saveCurrentUnit\s*\([^)]*\)\s*\{)"),
        re.compile(r"(const saveCurrentUnit\s*=\s*async\s*\([^)]*\)\s*=>\s*\{)"),
        re.compile(r"(const saveCurrentUnit\s*=\s*\([^)]*\)\s*=>\s*\{)"),
    ]

    for pattern in patterns:
        match = pattern.search(source)
        if match:
            insert_at = match.end(1)
            return source[:insert_at] + guard_block + source[insert_at:], True

    raise RuntimeError("Could not find saveCurrentUnit() to patch.")


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Could not find target file: {TARGET}")

    original = TARGET.read_text(encoding="utf-8")
    updated = original

    customer_var = detect_identifier(
        updated,
        ["customerName", "customer", "customerLabel", "selectedCustomerName"],
        "customer variable",
        required=True,
    )
    site_var = detect_identifier(
        updated,
        ["siteName", "site", "locationName", "siteLabel", "selectedSiteName"],
        "site variable",
        required=True,
    )
    unit_tag_var = detect_identifier(
        updated,
        ["unitNickname", "unitTag", "unitNicknameTag", "nickname", "unitLabel", "assetTag"],
        "unit tag variable",
        required=True,
    )
    site_units_var = detect_identifier(
        updated,
        [
            "siteUnitsAtLocation",
            "savedUnitsAtLocation",
            "savedUnitsAtSite",
            "siteUnits",
            "unitsAtSite",
            "locationUnits",
            "existingUnitsAtSite",
            "unitsForSite",
            "matchingSiteUnits",
        ],
        "site units collection variable",
        required=True,
    )

    changed_any = False

    updated, changed = strengthen_label(updated)
    changed_any = changed_any or changed

    updated, changed = insert_helper_text(updated, unit_tag_var)
    changed_any = changed_any or changed

    updated, changed = inject_save_guard(updated, customer_var, site_var, unit_tag_var, site_units_var)
    changed_any = changed_any or changed

    if not changed_any:
        print("No changes applied. The file may already be patched.")
        return

    backup_path = TARGET.with_name(TARGET.name + BACKUP_SUFFIX)
    shutil.copy2(TARGET, backup_path)
    TARGET.write_text(updated, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup_path}")
    print(
        f"Detected vars: customer={customer_var}, site={site_var}, unitTag={unit_tag_var}, siteUnits={site_units_var}"
    )


if __name__ == "__main__":
    main()