"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import { SectionCard } from "./SectionCard";
import { createClient } from "../../lib/supabase/client";

type CompanyMember = {
  id: string;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
};

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontWeight: 900,
  border: "1px solid #cfcfcf",
  borderRadius: 10,
  background: "#ffffff",
  color: "#111",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

export function CompanyAdminPanel() {
  const [showAddTechTools, setShowAddTechTools] = useState(false);
  const [addTechEmail, setAddTechEmail] = useState("");
  const [addTechBusy, setAddTechBusy] = useState(false);
  const [addTechMessage, setAddTechMessage] = useState("");

  const [showCompanyTeam, setShowCompanyTeam] = useState(false);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [companyMembersBusy, setCompanyMembersBusy] = useState(false);
  const [companyMembersMessage, setCompanyMembersMessage] = useState("");

  async function loadCompanyMembers() {
    try {
      setCompanyMembersBusy(true);
      setCompanyMembersMessage("");

      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) throw new Error("No active session found.");

      const res = await fetch("/api/company/list-members", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      setCompanyMembers(data.members || []);
    } catch (err) {
      console.error("LOAD COMPANY MEMBERS FAILED", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object"
            ? JSON.stringify(err)
            : String(err);

      setCompanyMembersMessage(`Could not load company team: ${msg}`);
      setCompanyMembers([]);
    } finally {
      setCompanyMembersBusy(false);
    }
  }

  async function handleAddTechToCompany() {
    const email = addTechEmail.trim().toLowerCase();
    if (!email) {
      setAddTechMessage("Enter the tech email.");
      return;
    }

    try {
      setAddTechBusy(true);
      setAddTechMessage("");

      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) throw new Error("No active session found.");

      const res = await fetch("/api/company/add-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email,
          role: "tech",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }

      if (data?.alreadyMember) {
        setAddTechMessage("That user is already attached to this company.");
      } else {
        setAddTechMessage("Tech added to company.");
      }

      setAddTechEmail("");
      await loadCompanyMembers();
    } catch (err) {
      console.error("ADD TECH FAILED", err);
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object"
            ? JSON.stringify(err)
            : String(err);

      setAddTechMessage(`Add tech failed: ${msg}`);
    } finally {
      setAddTechBusy(false);
    }
  }

  return (
    <>
      <SectionCard title="Company Admin / Add Tech">
        <button onClick={() => setShowAddTechTools((v) => !v)} style={btnStyle}>
          {showAddTechTools ? "Hide Add Tech" : "Show Add Tech"}
        </button>

        {showAddTechTools ? (
          <div style={{ marginTop: 12 }}>
            <SmallHint>
              Add an existing user account to your company as a tech.
            </SmallHint>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                alignItems: "end",
              }}
            >
              <div>
                <label style={{ fontWeight: 900 }}>"Tech Email"</label>
                <br />
                <input
                  value={addTechEmail}
                  onChange={(e) => setAddTechEmail(e.target.value)}
                  placeholder="tech@example.com"
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <button
                onClick={handleAddTechToCompany}
                disabled={addTechBusy}
                style={btnStyle}
              >
                {addTechBusy ? "Adding..." : "Add Tech"}
              </button>
            </div>

            {addTechMessage ? (
              <SmallHint style={{ marginTop: 10 }}>{addTechMessage}</SmallHint>
            ) : null}
          </div>
        ) : (
          <SmallHint style={{ marginTop: 12 }}>
            Hidden by default to keep the main workflow clean.
          </SmallHint>
        )}
      </SectionCard>

      <div style={{ marginTop: 10 }}>
        <SectionCard title="Company Team">
          <button onClick={() => setShowCompanyTeam((v) => !v)} style={btnStyle}>
            {showCompanyTeam ? "Hide Team" : "Show Team"}
          </button>

          {showCompanyTeam ? (
            <div style={{ marginTop: 12 }}>
              {companyMembersBusy ? (
                <SmallHint>Loading company team...</SmallHint>
              ) : companyMembers.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {companyMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {member.full_name || member.email || member.user_id}
                      </div>
                      <SmallHint style={{ marginTop: 4 }}>
                        {member.email || "No email"} • {member.role || "-"} • {member.status || "-"}
                      </SmallHint>
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>
                  {companyMembersMessage || "No company members found yet."}
                </SmallHint>
              )}
            </div>
          ) : (
            <SmallHint style={{ marginTop: 12 }}>
              Hidden by default to keep the main workflow clean.
            </SmallHint>
          )}
        </SectionCard>
      </div>
    </>
  );
}
