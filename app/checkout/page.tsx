"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NavMenu } from "../components/NavMenu";

function CheckoutContent() {
  const params = useSearchParams();
  const plan = params.get("plan") || "solo";
  const billing = params.get("billing") || "monthly";
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function startCheckout() {
      try {
        setStatus("redirecting");
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, billing }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Checkout failed. Please try again.");
          setStatus("error");
          return;
        }
        window.location.href = data.url;
      } catch (e: any) {
        setError(e?.message || "Something went wrong.");
        setStatus("error");
      }
    }
    startCheckout();
  }, [plan, billing]);

  const planNames: Record<string, string> = {
    solo: "Solo Tech — $19/mo",
    shop_5: "Shop 5 Techs — $79/mo",
    shop_10: "Shop 10 Techs — $139/mo",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 52px)", padding: 24, textAlign: "center" }}>
      {status === "redirecting" && (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔧</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>
            Setting up your {planNames[plan] || "subscription"}...
          </div>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
            Redirecting you to secure checkout
          </div>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(249,115,22,0.2)", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
      {status === "error" && (
        <>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, maxWidth: 400 }}>{error}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <a href="/pricing" style={{ padding: "11px 24px", background: "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Back to Pricing
            </a>
            <a href="mailto:support@myhvacrtool.com" style={{ padding: "11px 24px", background: "rgba(255,255,255,0.08)", color: "#94a3b8", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Contact Support
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0c1a2e", minHeight: "100vh", paddingTop: 52 }}>
      <NavMenu />
      <Suspense fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 52px)", color: "#f8fafc", fontSize: 16 }}>
          Loading...
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}