from pathlib import Path

path = Path("app/lib/supabase/work-orders.ts")
text = path.read_text()

old = """export async function createUnitForCurrentUser(input: Omit<UnitRow, "user_id" | "created_at">) {
  const supabase = createClient();
  const ctx = await getActiveCompanyContext();

  const payload = {
    ...input,
    user_id: ctx.userId,
    company_id: ctx.companyId,
    company_name: input.company_name || ctx.companyName,
  };

  const { data, error } = await supabase
    .from("units")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as UnitRow;
}"""

new = """export async function createUnitForCurrentUser(input: Omit<UnitRow, "user_id" | "created_at">) {
  const existing = await findStrongUnitMatchForCurrentUser({
    customer_name: input.customer_name || "",
    site_name: input.site_name || "",
    unit_nickname: input.unit_nickname || "",
    serial: input.serial || "",
  });

  if (existing?.id) {
    return existing as UnitRow;
  }

  const supabase = createClient();
  const ctx = await getActiveCompanyContext();

  const payload = {
    ...input,
    user_id: ctx.userId,
    company_id: ctx.companyId,
    company_name: input.company_name || ctx.companyName,
  };

  const { data, error } = await supabase
    .from("units")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as UnitRow;
}"""

if old not in text:
    raise SystemExit("Could not find createUnitForCurrentUser block.")

text = text.replace(old, new, 1)
path.write_text(text)
print("Made createUnitForCurrentUser duplicate-safe.")