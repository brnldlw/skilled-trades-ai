"use client";
import { useEffect, useState } from "react";
import { AdminPanel } from "../hvac_units/components/AdminPanel";
import { NavMenu } from "../components/NavMenu";
import { createClient } from "../lib/supabase/client";

export default function AdminPage() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/auth"; return; }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (data?.is_admin) {
        setAllowed(true);
      } else {
        window.location.href = "/hvac_units";
      }
      setChecking(false);
    });
  }, []);

  if (checking) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Checking access...</div>;
  if (!allowed) return null;

  return (
    <div style={{ paddingTop: 52, fontFamily: "system-ui, sans-serif" }}>
      <NavMenu currentPath="/admin" />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#0f1f3d" }}>
          Admin Panel
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
          Manage user subscriptions, grant overrides, and set trial access.
        </p>
        <AdminPanel />
      </div>
    </div>
  );
}
