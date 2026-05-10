import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Map Stripe price IDs to internal tiers
// YOU MUST UPDATE THESE after creating products in Stripe
const PRICE_TO_TIER: Record<string, string> = {
  // Monthly prices - replace with your actual Stripe price IDs
  "price_solo_monthly":     "solo",
  "price_shop5_monthly":    "shop_5",
  "price_shop10_monthly":   "shop_10",
  // Annual prices
  "price_solo_annual":      "solo",
  "price_shop5_annual":     "shop_5",
  "price_shop10_annual":    "shop_10",
  // Estimator add-ons (env var price IDs)
  [process.env.STRIPE_PRICE_ESTIMATOR_MONTHLY_20 || "price_estimator_monthly_20"]: "estimator_monthly_20",
  [process.env.STRIPE_PRICE_ESTIMATOR_MONTHLY_UNLIMITED || "price_estimator_monthly_unlimited"]: "estimator_monthly_unlimited",
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

async function updateUserSubscription(
  customerId: string,
  tier: string,
  status: string,
  subscriptionId: string,
  periodEnd: number | null,
  isEstimatorTier: boolean = false
) {
  const supabase = getSupabaseAdmin();

  // Find user by stripe_customer_id
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .limit(1);

  if (!profiles || profiles.length === 0) {
    console.error("No profile found for Stripe customer:", customerId);
    return;
  }

  const isEst = isEstimatorTier || tier.startsWith("estimator_");
  await supabase
    .from("profiles")
    .update(isEst ? {
      estimator_tier: tier.replace("estimator_", ""),
      estimator_subscription_id: subscriptionId,
      estimator_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    } : {
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: subscriptionId,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq("id", profiles[0].id);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    // Verify webhook signature
    if (webhookSecret && sig) {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev mode - parse without verification
      event = JSON.parse(body);
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object;
        // Handle one-time estimator purchase
        if (session.mode === "payment") {
          const supabase = getSupabaseAdmin();
          const userId = session.metadata?.user_id;
          if (userId) {
            const { data: profile } = await supabase.from("profiles").select("estimator_credits").eq("id", userId).single();
            const currentCredits = (profile as any)?.estimator_credits || 0;
            await supabase.from("profiles").update({
              estimator_tier: "single",
              estimator_credits: currentCredits + 1,
            }).eq("id", userId);
          }
          break;
        }

        if (session.mode === "subscription") {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const priceId = subscription.items.data[0]?.price?.id;
          const tier = PRICE_TO_TIER[priceId] || "solo";
          const isEstimatorTier = tier.startsWith("estimator_");

          // Link Stripe customer to Supabase user via email
          const supabase = getSupabaseAdmin();
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", session.customer_details?.email)
            .limit(1);

          if (profiles && profiles.length > 0) {
            const updateData = isEstimatorTier ? {
              stripe_customer_id: session.customer,
              estimator_tier: tier.replace("estimator_", ""),
              estimator_subscription_id: session.subscription,
              estimator_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            } : {
              stripe_customer_id: session.customer,
              subscription_tier: tier,
              subscription_status: "active",
              stripe_subscription_id: session.subscription,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
            };
            await supabase.from("profiles").update(updateData).eq("id", profiles[0].id);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const priceId = sub.items.data[0]?.price?.id;
        const tier = PRICE_TO_TIER[priceId] || "solo";
        await updateUserSubscription(
          sub.customer,
          tier,
          sub.status === "active" ? "active" : sub.status,
          sub.id,
          sub.current_period_end,
          tier.startsWith("estimator_")
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await updateUserSubscription(
          sub.customer,
          "free",
          "cancelled",
          sub.id,
          null,
          false
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const supabase = getSupabaseAdmin();
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", invoice.customer)
          .limit(1);

        if (profiles && profiles.length > 0) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profiles[0].id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed: " + err.message },
      { status: 500 }
    );
  }
}