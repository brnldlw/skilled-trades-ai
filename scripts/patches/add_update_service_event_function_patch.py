from pathlib import Path

path = Path("app/lib/supabase/work-orders.ts")
text = path.read_text()

if "export async function updateServiceEventForCurrentUser(" in text:
    raise SystemExit("updateServiceEventForCurrentUser already exists.")

anchor = "export async function listServiceEventsForUnitForCurrentUser("
idx = text.find(anchor)
if idx == -1:
    raise SystemExit("Could not find listServiceEventsForUnitForCurrentUser anchor.")

block = """
export async function updateServiceEventForCurrentUser(
  eventId: string,
  input: Partial<Omit<ServiceEventRow, "id" | "user_id" | "created_at">>
) {
  const supabase = createClient();
  await getCurrentUserId();

  const payload = {
    ...input,
  };

  const { data, error } = await supabase
    .from("service_events")
    .update(payload)
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ServiceEventRow;
}

"""

text = text[:idx] + block + text[idx:]
path.write_text(text)
print("Added updateServiceEventForCurrentUser.")