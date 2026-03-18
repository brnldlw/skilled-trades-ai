import { createClient } from "./client";

export type UnitRow = {
  id: string;
  user_id: string;
  created_at?: string;
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

export type ServiceEventRow = {
  id: string;
  user_id: string;
  unit_id: string;
  created_at?: string;
  service_date?: string | null;
  symptom?: string | null;
  diagnosis_summary?: string | null;
  final_confirmed_cause?: string | null;
  parts_replaced?: string | null;
  actual_fix_performed?: string | null;
  outcome_status?: string | null;
  callback_occurred?: string | null;
  tech_closeout_notes?: string | null;
};

async function getCurrentUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User is not logged in.");
  return user.id;
}

export async function listUnitsForCurrentUser() {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as UnitRow[];
}

export async function createUnitForCurrentUser(row: Omit<UnitRow, "user_id">) {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const payload: UnitRow = {
    ...row,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("units")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as UnitRow;
}

export async function createServiceEventForCurrentUser(
  row: Omit<ServiceEventRow, "user_id">
) {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const payload: ServiceEventRow = {
    ...row,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("service_events")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as ServiceEventRow;
}

export async function findStrongUnitMatchForCurrentUser(input: {
  customer_name?: string;
  site_name?: string;
  unit_nickname?: string;
  serial?: string;
}) {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const serial = (input.serial || "").trim();
  const customer = (input.customer_name || "").trim();
  const site = (input.site_name || "").trim();
  const nickname = (input.unit_nickname || "").trim();

  if (serial) {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("user_id", userId)
      .eq("serial", serial)
      .limit(1);

    if (error) throw error;
    if (data && data.length) return data[0] as UnitRow;
  }

  if (customer && site && nickname) {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("user_id", userId)
      .eq("customer_name", customer)
      .eq("site_name", site)
      .eq("unit_nickname", nickname)
      .limit(1);

    if (error) throw error;
    if (data && data.length) return data[0] as UnitRow;
  }

  return null;
}