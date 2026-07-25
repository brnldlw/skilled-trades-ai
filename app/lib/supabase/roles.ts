import { createClient } from "./client";

export async function getCompanyMembershipRole(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("company_memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  return data?.role ?? null;
}
