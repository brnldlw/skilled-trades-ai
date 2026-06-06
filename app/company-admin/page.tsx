"use client";

import React, { useState, useEffect } from "react";
import { NavMenu } from "../components/NavMenu";

type Member = {
  user_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  joined_at: string;
  subscription_tier?: string;
};

type CompanyInfo = {
  id: string;
  display_name: string;
  join_code: string;
  member_count: number;
};

export default function CompanyAdminPage() {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/company/admin");
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCompany(data.company);
      setMembers(data.members || []);
    } catch (e: any) {
      setError("Failed to load. Make sure you have company admin access.");
    } finally {
      setLoading(false);
    }
  }

  async function updateMember(userId: string, action: "remove" | "make_manager" | "make_tech") {
    setMessage("");
    try {
      const res = await fetch("/api/company/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(action === "remove" ? "Member removed." : "Role updated.");
        load();
      } else {
        setMessage(data.error || "Action failed.");
      }
    } catch {
      setMessage("Something went wrong.");
    }
  }

  function copyJoinCode() {
    if (company?.join_code) {
      navigator.clipboard.writeText(company.join_code).catch(() => {});
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  }

  const inp: React.CSSProperties = { fontFamily: "inherit" };

  return (
    <div style={{ paddingTop: 70, fontFamily: "inherit" }}>
      <NavMenu currentPath="/company-admin" />
      <div style={{ padding: "16px 14px 80px", maxWidth: 700, margin: "0 auto" }}>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f1f3d", marginBottom: 4 }}>
          🏢 Company Admin
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
          Manage your team members, roles, and access.
        </p>

        {error && (
          <div style={{ padding: "14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 16, fontSize: 14, color: "#dc2626" }}>
            {error}
            <div style={{ fontSize: 12, marginTop: 4, color: "#64748b" }}>
              Contact support@myhvacrtool.com if you need company admin access set up.
            </div>
          </div>
        )}

        {message && (
          <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 14, fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading...</div>
        ) : company && (
          <>
            {/* Company info + join code */}
            <div style={{ background: "#0f1f3d", borderRadius: 14, padding: "20px", marginBottom: 20, color: "#fff" }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{company.display_name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                {company.member_count} team member{company.member_count !== 1 ? "s" : ""}
              </div>

              <div style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>
                  Team Join Code — share this with your techs
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "0.3em", color: "#fff", fontFamily: "monospace" }}>
                    {company.join_code}
                  </div>
                  <button onClick={copyJoinCode}
                    style={{ padding: "8px 16px", background: codeCopied ? "#16a34a" : "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", ...inp }}>
                    {codeCopied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
                  Techs enter this code when signing up to join your company automatically.
                </div>
              </div>
            </div>

            {/* Team members */}
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f1f3d", marginBottom: 12 }}>
              Team Members ({members.length})
            </div>

            {members.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", background: "#f8fafc", borderRadius: 10, color: "#64748b", fontSize: 14 }}>
                No team members yet. Share your join code to add techs.
              </div>
            ) : members.map(member => (
              <div key={member.user_id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d" }}>
                      {member.name || member.email}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{member.email}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: member.role === "admin" || member.role === "manager" ? "#eff6ff" : "#f1f5f9", color: member.role === "admin" || member.role === "manager" ? "#1d4ed8" : "#374151" }}>
                        {member.role === "admin" ? "Company Admin" : member.role === "manager" ? "Manager" : "Tech"}
                      </span>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: member.status === "active" ? "#dcfce7" : "#fef2f2", color: member.status === "active" ? "#166534" : "#dc2626" }}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                    {member.role !== "manager" && member.role !== "admin" && (
                      <button onClick={() => updateMember(member.user_id, "make_manager")}
                        style={{ padding: "6px 12px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bae6fd", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", ...inp }}>
                        Make Manager
                      </button>
                    )}
                    {member.role === "manager" && (
                      <button onClick={() => updateMember(member.user_id, "make_tech")}
                        style={{ padding: "6px 12px", background: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", ...inp }}>
                        Set as Tech
                      </button>
                    )}
                    {member.role !== "admin" && (
                      <button onClick={() => {
                        if (confirm(`Remove ${member.name || member.email} from the company? They will lose access to shared unit history.`)) {
                          updateMember(member.user_id, "remove");
                        }
                      }}
                        style={{ padding: "6px 12px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", ...inp }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Individual subscription note */}
            <div style={{ marginTop: 20, padding: "14px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>
                💡 Individual subscriptions
              </div>
              <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                Techs who leave your company keep their own subscription and service history. Any tech can also subscribe individually at $19/mo — independent of the company account. If a tech leaves, remove them here and their access to shared company data is revoked immediately.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}