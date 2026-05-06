import { createClient } from "./client";

export type RefrigerantLogEntry = {
  id: string;
  user_id?: string | null;
  company_id?: string | null;
  created_at?: string;
  unit_id?: string | null;
  customer_name?: string | null;
  site_name?: string | null;
  service_date: string;
  tech_name?: string | null;
  equipment_type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  refrigerant_type: string;
  action: "added" | "recovered" | "transferred";
  amount_lbs: number;
  cylinder_id?: string | null;
  reason?: string | null;
  leak_detected?: boolean | null;
  leak_location?: string | null;
  notes?: string | null;
};

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Not logged in");
  return user.id;
}

export async function addRefrigerantLogEntry(
  entry: Omit<RefrigerantLogEntry, "id" | "user_id" | "created_at">
): Promise<RefrigerantLogEntry> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("refrigerant_log")
    .insert({ ...entry, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as RefrigerantLogEntry;
}

export async function listRefrigerantLogEntries(
  limit = 100
): Promise<RefrigerantLogEntry[]> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("refrigerant_log")
    .select("*")
    .eq("user_id", userId)
    .order("service_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as RefrigerantLogEntry[];
}

export async function deleteRefrigerantLogEntry(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("refrigerant_log")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
