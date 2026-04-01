from __future__ import annotations

import shutil
from pathlib import Path

TARGET = Path("app/lib/supabase/work-orders.ts")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not TARGET.exists():
        raise FileNotFoundError(f"Missing file: {TARGET}")

    source = TARGET.read_text(encoding="utf-8")

    if "UnitComponentRow" in source and "replaceUnitComponentsForUnitForCurrentUser" in source:
        print("Supabase component persistence patch already applied.")
        return

    source = replace_once(
        source,
        """export type UnitRow = {
  id: string;
  user_id: string;
  created_at?: string;
  company_id?: string | null;
  company_name?: string | null;
  customer_name?: string | null;
  site_name?: string | null;
  site_address?: string | null;
  unit_nickname?: string | null;
  property_type?: string | null;
  equipment_type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serial?: string | null;
  refrigerant_type?: string | null;
};
""",
        """export type UnitRow = {
  id: string;
  user_id: string;
  created_at?: string;
  company_id?: string | null;
  company_name?: string | null;
  customer_name?: string | null;
  site_name?: string | null;
  site_address?: string | null;
  unit_nickname?: string | null;
  property_type?: string | null;
  equipment_type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serial?: string | null;
  refrigerant_type?: string | null;
  system_type?: string | null;
  primary_component_role?: string | null;
  primary_tag_status?: string | null;
  primary_tag_issue_reason?: string | null;
  primary_checked_inside_for_internal_label?: boolean | null;
};
""",
        "UnitRow",
    )

    source = replace_once(
        source,
        """export type ServiceEventRow = {
  id: string;
  user_id?: string | null;
  unit_id: string;
  created_at?: string;
  company_id?: string | null;
  company_name?: string | null;
  service_date?: string | null;
  symptom?: string | null;
  diagnosis_summary?: string | null;
  final_confirmed_cause?: string | null;
  parts_replaced?: string | null;
  actual_fix_performed?: string | null;
  outcome_status?: string | null;
  callback_occurred?: string | null;
  tech_closeout_notes?: string | null;
  photo_urls?: string[] | null;
};
""",
        """export type UnitComponentRow = {
  id: string;
  user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  company_id?: string | null;
  company_name?: string | null;
  unit_id: string;
  position?: number | null;
  role?: string | null;
  component_tag?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serial?: string | null;
  tag_status?: string | null;
  tag_issue_reason?: string | null;
  checked_inside_for_internal_label?: boolean | null;
};

export type ServiceEventRow = {
  id: string;
  user_id?: string | null;
  unit_id: string;
  created_at?: string;
  company_id?: string | null;
  company_name?: string | null;
  service_date?: string | null;
  symptom?: string | null;
  diagnosis_summary?: string | null;
  final_confirmed_cause?: string | null;
  parts_replaced?: string | null;
  actual_fix_performed?: string | null;
  outcome_status?: string | null;
  callback_occurred?: string | null;
  tech_closeout_notes?: string | null;
  photo_urls?: string[] | null;
  affected_component_label_snapshot?: string | null;
  affected_component_role_snapshot?: string | null;
};
""",
        "ServiceEventRow",
    )

    helper_block = """

export async function listUnitComponentsForUnitForCurrentUser(unitId: string) {
  const supabase = createClient();
  await getCurrentUserId();

  const { data, error } = await supabase
    .from("unit_components")
    .select("*")
    .eq("unit_id", unitId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as UnitComponentRow[];
}

export async function replaceUnitComponentsForUnitForCurrentUser(
  unitId: string,
  input: Array<{
    position?: number | null;
    role?: string | null;
    component_tag?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    serial?: string | null;
    tag_status?: string | null;
    tag_issue_reason?: string | null;
    checked_inside_for_internal_label?: boolean | null;
  }>
) {
  const supabase = createClient();
  const ctx = await getActiveCompanyContext();

  const { error: deleteError } = await supabase
    .from("unit_components")
    .delete()
    .eq("unit_id", unitId);

  if (deleteError) throw deleteError;

  if (!input.length) return [] as UnitComponentRow[];

  const payload = input.map((row, index) => ({
    user_id: ctx.userId,
    company_id: ctx.companyId,
    company_name: ctx.companyName,
    unit_id: unitId,
    position: row.position ?? index,
    role: row.role || "",
    component_tag: row.component_tag || "",
    manufacturer: row.manufacturer || "",
    model: row.model || "",
    serial: row.serial || "",
    tag_status: row.tag_status || "readable",
    tag_issue_reason: row.tag_issue_reason || "",
    checked_inside_for_internal_label: Boolean(row.checked_inside_for_internal_label),
  }));

  const { data, error } = await supabase
    .from("unit_components")
    .insert(payload)
    .select("*");

  if (error) throw error;
  return (data || []) as UnitComponentRow[];
}
"""
    source = insert_before_once(
        source,
        "export async function createServiceEventForCurrentUser(",
        helper_block,
        "unit component helpers",
    )

    backup = TARGET.with_name(TARGET.name + ".component-persistence.bak")
    shutil.copy2(TARGET, backup)
    TARGET.write_text(source, encoding="utf-8")

    print(f"Patched {TARGET}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
