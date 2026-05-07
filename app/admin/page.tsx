"use client";
import { AdminPanel } from "../hvac_units/components/AdminPanel";
import { NavMenu } from "../components/NavMenu";

export default function AdminPage() {
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