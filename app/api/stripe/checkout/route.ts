import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// YOUR STRIPE PRICE IDs - update these after creating products in Stripe dashboard
const PRICES = {
  solo_monthly:              process.env.STRIPE_PRICE_SOLO_MONTHLY              || "price_solo_monthly",
  solo_annual:               process.env.STRIPE_PRICE_SOLO_ANNUAL               || "price_solo_annual",
  shop5_monthly:             process.env.STRIPE_PRICE_SHOP5_MONTHLY             || "price_shop5_monthly",
  shop5_annual:              process.env.STRIPE_PRICE_SHOP5_ANNUAL              || "price_shop5_annual",
  shop10_monthly:            process.env.STRIPE_PRICE_SHOP10_MONTHLY            || "price_shop10_monthly",
  shop10_annual:             process.env.STRIPE_PRICE_SHOP10_ANNUAL             || "price_shop10_annual",
  // Estimator add-on prices
  estimator_single:          process.env.STRIPE_PRICE_ESTIMATOR_SINGLE          || "price_estimator_single",
  estimator_monthly_20:      process.env.STRIPE_PRICE_ESTIMATOR_MONTHLY_20      || "price_estimator_monthly_20",
  estimator_monthly_unlimited: process.env.STRIPE_PRICE_ESTIMATOR_MONTHLY_UNLIMITED || "price_estimator_monthly_unlimited",
};

// Estimator plans use payment_intent (one-time) or subscription mode
const ESTIMATOR_PLANS = ["estimator_single", "estimator_monthly_20", "estimator_monthly_unlimited"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, billing } = body;
    // plan: "solo" | "shop_5" | "shop_10"
    // billing: "monthly" | "annual"

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Pick price ID
    let priceId: string;
    let mode: "payment" | "subscription" = "subscription";

    if (ESTIMATOR_PLANS.includes(plan)) {
      priceId = PRICES[plan as keyof typeof PRICES];
      mode = plan === "estimator_single" ? "payment" : "subscription";
    } else {
      const priceKey = `${plan.replace("_", "")}_${billing}` as keyof typeof PRICES;
      priceId = PRICES[priceKey];
    }

    const stripe = require("stripe")(stripeKey);

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/hvac_units?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        plan,
        billing,
      },
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 0,
        metadata: { user_id: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Checkout failed: " + (err?.message || String(err)) },
      { status: 500 }
    );
  }
}