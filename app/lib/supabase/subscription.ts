import { createClient } from "./client";

// ─── Types ────────────────────────────────────────────────────
export type SubscriptionTier = "free" | "solo" | "shop_5" | "shop_10";
export type EstimatorTier = "none" | "single" | "monthly_20" | "monthly_unlimited";

export type EstimatorAccess = {
  tier: EstimatorTier;
  credits: number; // for single-use
  quotesUsedThisMonth: number;
  monthlyLimit: number; // 20 for monthly_20, Infinity for unlimited
  canCreate: boolean;
};

export type UserProfile = {
  id: string;
  email?: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_end?: string | null;
  override_tier?: SubscriptionTier | null;
  override_expires_at?: string | null;
  override_note?: string | null;
  is_admin?: boolean | null;
};

// ─── Feature limits per tier ──────────────────────────────────
export const TIER_LIMITS = {
  free: {
    ai_queries_per_day: 3,
    saved_units: 1,
    pt_refrigerants: ["R-410A", "R-22", "R-404A"],
    sh_sc_calculator: false,
    cfm_calculator: false,
    mfd_calculator: false,
    gas_heat_rise: false,
    refrigerant_log: false,
    customer_reports: false,
    health_score: false,
    voice_input: false,
    unit_history: false,
    offline_mode: false,
    team_features: false,
    label: "Free",
  },
  solo: {
    ai_queries_per_day: Infinity,
    saved_units: Infinity,
    pt_refrigerants: "all",
    sh_sc_calculator: true,
    cfm_calculator: true,
    mfd_calculator: true,
    gas_heat_rise: true,
    refrigerant_log: true,
    customer_reports: true,
    health_score: true,
    voice_input: true,
    unit_history: true,
    offline_mode: true,
    team_features: false,
    label: "Solo Tech",
  },
  shop_5: {
    ai_queries_per_day: Infinity,
    saved_units: Infinity,
    pt_refrigerants: "all",
    sh_sc_calculator: true,
    cfm_calculator: true,
    mfd_calculator: true,
    gas_heat_rise: true,
    refrigerant_log: true,
    customer_reports: true,
    health_score: true,
    voice_input: true,
    unit_history: true,
    offline_mode: true,
    team_features: true,
    label: "Shop — 5 Techs",
  },
  shop_10: {
    ai_queries_per_day: Infinity,
    saved_units: Infinity,
    pt_refrigerants: "all",
    sh_sc_calculator: true,
    cfm_calculator: true,
    mfd_calculator: true,
    gas_heat_rise: true,
    refrigerant_log: true,
    customer_reports: true,
    health_score: true,
    voice_input: true,
    unit_history: true,
    offline_mode: true,
    team_features: true,
    label: "Shop — 10 Techs",
  },
};

export type FeatureKey = keyof typeof TIER_LIMITS.free;

// ─── Get effective tier (respects override) ───────────────────
export function getEffectiveTier(profile: UserProfile): SubscriptionTier {
  if (profile.override_tier && profile.override_expires_at) {
    const expiry = new Date(profile.override_expires_at);
    if (expiry > new Date()) {
      return profile.override_tier as SubscriptionTier;
    }
  }
  if (profile.override_tier && !profile.override_expires_at) {
    return profile.override_tier as SubscriptionTier;
  }
  return profile.subscription_tier || "free";
}

// ─── Check if a feature is available for a tier ───────────────
export function canAccess(tier: SubscriptionTier, feature: FeatureKey): boolean {
  const limits = TIER_LIMITS[tier];
  const val = limits[feature as keyof typeof limits];
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (val === "all") return true;
  return false;
}

export function isPaid(tier: SubscriptionTier): boolean {
  return tier !== "free";
}

// ─── Fetch current user profile ───────────────────────────────
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Return default free profile if none exists
    return {
      id: user.id,
      email: user.email,
      subscription_tier: "free",
      subscription_status: "active",
      is_admin: false,
    };
  }

  return data as UserProfile;
}

// ─── Admin: list all users ────────────────────────────────────
export async function adminListUsers(): Promise<UserProfile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("email", { ascending: true });

  if (error) throw error;
  return (data || []) as UserProfile[];
}

// ─── Admin: set override for a user ──────────────────────────
export async function adminSetOverride(
  userId: string,
  tier: SubscriptionTier | null,
  expiresAt: string | null,
  note: string | null
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      override_tier: tier,
      override_expires_at: expiresAt,
      override_note: note,
    })
    .eq("id", userId);
  if (error) throw error;
}

// ─── Admin: revoke override ───────────────────────────────────
export async function adminRevokeOverride(userId: string): Promise<void> {
  return adminSetOverride(userId, null, null, null);
}

// ─── Estimator access check ───────────────────────────────────
export function getEstimatorAccess(profile: any): EstimatorAccess {
  const tier: EstimatorTier = profile?.estimator_tier || "none";
  const credits: number = profile?.estimator_credits || 0;
  const quotesUsedThisMonth: number = profile?.estimator_quotes_this_month || 0;

  if (tier === "monthly_unlimited") {
    return { tier, credits, quotesUsedThisMonth, monthlyLimit: Infinity, canCreate: true };
  }
  if (tier === "monthly_20") {
    return { tier, credits, quotesUsedThisMonth, monthlyLimit: 20, canCreate: quotesUsedThisMonth < 20 };
  }
  if (tier === "single" && credits > 0) {
    return { tier, credits, quotesUsedThisMonth, monthlyLimit: credits, canCreate: true };
  }
  return { tier: "none", credits: 0, quotesUsedThisMonth: 0, monthlyLimit: 0, canCreate: false };
}

// ─── Track AI query usage (daily limit for free tier) ─────────
export async function checkAndIncrementAiUsage(): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, used: 0, limit: 0 };

  const profile = await getUserProfile();
  const tier = getEffectiveTier(profile || { id: user.id, subscription_tier: "free" });
  const limit = TIER_LIMITS[tier].ai_queries_per_day;

  if (limit === Infinity) return { allowed: true, used: 0, limit: Infinity };

  const today = new Date().toISOString().slice(0, 10);
  const key = `ai_usage_${user.id}_${today}`;

  // Use localStorage for daily count tracking (simple, no extra table needed)
  if (typeof window !== "undefined") {
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    if (current >= limit) {
      return { allowed: false, used: current, limit };
    }
    localStorage.setItem(key, String(current + 1));
    return { allowed: true, used: current + 1, limit };
  }

  return { allowed: true, used: 0, limit };
}