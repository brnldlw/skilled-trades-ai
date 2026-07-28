"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import { SectionCard } from "./SectionCard";
import { createClient } from "../../lib/supabase/client";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

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
  const { lang } = useLang();
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

      setCompanyMembersMessage(t("cap_load_team_failed", lang).replace("{value}", msg));
      setCompanyMembers([]);
    } finally {
      setCompanyMembersBusy(false);
    }
  }

  async function handleAddTechToCompany() {
    const email = addTechEmail.trim().toLowerCase();
    if (!email) {
      setAddTechMessage(t("cap_enter_tech_email", lang));
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
        setAddTechMessage(t("cap_already_member", lang));
      } else {
        setAddTechMessage(t("cap_tech_added", lang));
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

      setAddTechMessage(t("cap_add_tech_failed", lang).replace("{value}", msg));
    } finally {
      setAddTechBusy(false);
    }
  }

  return (
    <>
      <SectionCard title={t("cap_title", lang)}>
        <button onClick={() => setShowAddTechTools((v) => !v)} style={btnStyle}>
          {showAddTechTools ? t("btn_hide_add_tech", lang) : t("btn_show_add_tech", lang)}
        </button>

        {showAddTechTools ? (
          <div style={{ marginTop: 12 }}>
            <SmallHint>
              {t("cap_add_tech_hint", lang)}
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
                <label style={{ fontWeight: 900 }}>{t("cap_tech_email_label", lang)}</label>
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
                {addTechBusy ? t("btn_adding", lang) : t("btn_add_tech", lang)}
              </button>
            </div>

            {addTechMessage ? (
              <SmallHint style={{ marginTop: 10 }}>{addTechMessage}</SmallHint>
            ) : null}
          </div>
        ) : (
          <SmallHint style={{ marginTop: 12 }}>
            {t("cap_hidden_by_default", lang)}
          </SmallHint>
        )}
      </SectionCard>

      <div style={{ marginTop: 10 }}>
        <SectionCard title={t("cap_team_title", lang)}>
          <button onClick={() => setShowCompanyTeam((v) => !v)} style={btnStyle}>
            {showCompanyTeam ? t("btn_hide_team", lang) : t("btn_show_team", lang)}
          </button>

          {showCompanyTeam ? (
            <div style={{ marginTop: 12 }}>
              {companyMembersBusy ? (
                <SmallHint>{t("cap_loading_team", lang)}</SmallHint>
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
                        {member.email || t("cap_no_email", lang)} • {member.role || "-"} • {member.status || "-"}
                      </SmallHint>
                    </div>
                  ))}
                </div>
              ) : (
                <SmallHint>
                  {companyMembersMessage || t("cap_no_members_found", lang)}
                </SmallHint>
              )}
            </div>
          ) : (
            <SmallHint style={{ marginTop: 12 }}>
              {t("cap_hidden_by_default", lang)}
            </SmallHint>
          )}
        </SectionCard>
      </div>
    </>
  );
}
