import { createClient } from "./client";

export type UnitRow = {
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

async function getActiveCompanyContext() {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data: membership, error: membershipError } = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;
  if (!membership?.company_id) {
    throw new Error("No active company membership found for current user.");
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("display_name, legal_name")
    .eq("id", membership.company_id)
    .maybeSingle();

  if (companyError) throw companyError;

  return {
    userId,
    companyId: membership.company_id as string,
    companyName: (company?.display_name || company?.legal_name || "") as string,
  };
}

export async function listUnitsForCurrentUser() {
  const supabase = createClient();
  await getCurrentUserId();

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as UnitRow[];
}

export async function createUnitForCurrentUser(input: Omit<UnitRow, "user_id" | "created_at">) {
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
}


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

export async function createServiceEventForCurrentUser(
  input: Omit<ServiceEventRow, "user_id">
) {
  const supabase = createClient();
  const ctx = await getActiveCompanyContext();

  const payload = {
    ...input,
    user_id: ctx.userId,
    company_id: ctx.companyId,
    company_name: input.company_name || ctx.companyName,
  };

    const { data, error } = await supabase
    .from("service_events")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ServiceEventRow;
}

  export async function getCurrentUserMembership() {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("company_memberships")
    .select("id, company_id, role, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return (data || null) as
    | { id: string; company_id: string; role: string; status: string }
    | null;
}

export async function ensureProfileForCurrentUser(email?: string) {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: email || null,
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

export async function createCompanyForCurrentUser(input: {
  companyName: string;
  email?: string;
}) {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const companyName = input.companyName.trim();
  if (!companyName) throw new Error("Company name is required.");

  const normalizedName = companyName.toLowerCase().replace(/\s+/g, " ").trim();

  await ensureProfileForCurrentUser(input.email);

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      legal_name: companyName,
      display_name: companyName,
      normalized_name: normalizedName,
    })
    .select("*")
    .single();

  if (companyError) throw companyError;

  const { error: membershipError } = await supabase
    .from("company_memberships")
    .insert({
      user_id: userId,
      company_id: company.id,
      role: "admin",
      status: "active",
    });

  if (membershipError) throw membershipError;

  return company;
}

export async function findStrongUnitMatchForCurrentUser(input: {
  customer_name?: string;
  site_name?: string;
  unit_nickname?: string;
  serial?: string;
}) {
  const supabase = createClient();
  await getCurrentUserId();

  const serial = (input.serial || "").trim();
  const customer = (input.customer_name || "").trim();
  const site = (input.site_name || "").trim();
  const nickname = (input.unit_nickname || "").trim();

  if (serial) {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("serial", serial)
      .limit(1);

    if (error) throw error;
    if (data && data.length) return data[0] as UnitRow;
  }

  if (customer && site && nickname) {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("customer_name", customer)
      .eq("site_name", site)
      .eq("unit_nickname", nickname)
      .limit(1);

    if (error) throw error;
    if (data && data.length) return data[0] as UnitRow;
  }

  return null;
}

export async function listServiceEventsForUnitForCurrentUser(unitId: string) {
  const supabase = createClient();
  await getCurrentUserId();

  const { data, error } = await supabase
    .from("service_events")
    .select("*")
    .eq("unit_id", unitId)
    .order("service_date", { ascending: false });

  if (error) throw error;
  return (data || []) as ServiceEventRow[];
}

export async function deleteUnitForCurrentUser(id: string) {
  const supabase = createClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("units")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

