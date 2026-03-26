from pathlib import Path

path = Path("app/lib/supabase/work-orders.ts")
text = path.read_text()

if "export async function updateUnitForCurrentUser(" in text:
    raise SystemExit("updateUnitForCurrentUser already exists.")

anchor = "export async function createServiceEventForCurrentUser("
idx = text.find(anchor)
if idx == -1:
    raise SystemExit("Could not find createServiceEventForCurrentUser anchor.")

block = """
export async function updateUnitForCurrentUser(
  unitId: string,
  input: Partial<Omit<UnitRow, "id" | "user_id" | "created_at">>
) {
  const supabase = createClient();
  await getCurrentUserId();

  const payload = {
    ...input,
  };

  const { data, error } = await supabase
    .from("units")
    .update(payload)
    .eq("id", unitId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UnitRow;
}

"""

text = text[:idx] + block + text[idx:]
path.write_text(text)
print("Added updateUnitForCurrentUser.")