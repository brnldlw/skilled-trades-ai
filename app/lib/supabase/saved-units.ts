import { createClient } from "./client";

export type SavedUnitRow = {
  id: string;
  user_id: string;
  saved_at?: string;

  customer_name?: string | null;
  site_name?: string | null;
  site_address?: string | null;
  unit_nickname?: string | null;
  property_type?: string | null;
  equipment_type?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  refrigerant_type?: string | null;
  symptom?: string | null;
  error_code?: string | null;
  error_code_source?: string | null;

  selected_pack_id?: string | null;
  flow_node_id?: string | null;
  flow_history?: unknown;
  observations?: unknown;
  raw_result?: string | null;
  nameplate?: unknown;

  final_confirmed_cause?: string | null;
  actual_fix_performed?: string | null;
  outcome_status?: string | null;
  callback_occurred?: string | null;
  tech_closeout_notes?: string | null;
};

export async function listSavedUnitsForCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_units")
    .select("*")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) throw error;
  return (data || []) as SavedUnitRow[];
}

export async function insertSavedUnitForCurrentUser(
  row: Omit<SavedUnitRow, "user_id">
) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User is not logged in.");

  const payload: SavedUnitRow = {
    ...row,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("saved_units")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as SavedUnitRow;
}

export async function deleteSavedUnitForCurrentUser(id: string) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User is not logged in.");

  const { error } = await supabase
    .from("saved_units")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}