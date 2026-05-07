"use client";

import { useState, useEffect } from "react";
import {
  getUserProfile,
  getEffectiveTier,
  canAccess,
  type UserProfile,
  type SubscriptionTier,
  type FeatureKey,
} from "../../lib/supabase/subscription";

export type UseSubscriptionResult = {
  profile: UserProfile | null;
  tier: SubscriptionTier;
  loading: boolean;
  isPaid: boolean;
  isAdmin: boolean;
  can: (feature: FeatureKey) => boolean;
};

export function useSubscription(): UseSubscriptionResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const tier = profile ? getEffectiveTier(profile) : "free";

  return {
    profile,
    tier,
    loading,
    isPaid: tier !== "free",
    isAdmin: !!profile?.is_admin,
    can: (feature: FeatureKey) => canAccess(tier, feature),
  };
}