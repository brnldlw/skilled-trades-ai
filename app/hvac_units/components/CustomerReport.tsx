"use client";

import React, { useState } from "react";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type CustomerReportProps = {
  customerName?: string;
  siteName?: string;
  siteAddress?: string;
  serviceDate?: string;
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  refrigerantType?: string;
  symptom?: string;
  finalConfirmedCause?: string;
  actualFixPerformed?: string;
  partsReplaced?: string;
  outcomeStatus?: string;
  techCloseoutNotes?: string;
  observations?: { label: string; value: string; unit: string; note?: string }[];
  companyName?: string;
};

export function CustomerReport(props: CustomerReportProps) {
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasMinData = !!(props.symptom || props.finalConfirmedCause || props.actualFixPerformed);

  async function openReport() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...props, lang }),
      });
      if (!res.ok) {
        setError(t("customer_report_failed", lang));
        return;
      }
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) setError(t("customer_report_popup_blocked", lang));
    } catch (err: any) {
      setError(t("error_prefix", lang) + " " + (err?.message || t("unknown_error", lang)));
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/customer-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...props, lang }),
      });
      if (!res.ok) { setError(t("customer_report_failed_short", lang)); return; }
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `service-report-${props.customerName?.replace(/\s+/g, "-") || "customer"}-${props.serviceDate || new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(t("error_prefix", lang) + " " + (err?.message || t("unknown_error", lang)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "#f0f9ff",
      border: "1px solid #bae6fd",
      borderRadius: 12,
      padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>📄</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0c4a6e" }}>
            {t("customer_report_section_title", lang)}
          </div>
          <div style={{ fontSize: 12, color: "#0369a1", marginTop: 1 }}>
            {t("customer_report_ai_subtitle", lang)}
          </div>
        </div>
      </div>

      {!hasMinData && (
        <div style={{
          fontSize: 12,
          color: "#0369a1",
          background: "#e0f2fe",
          borderRadius: 8,
          padding: "8px 12px",
          marginBottom: 10,
        }}>
          {t("customer_report_fill_prompt", lang)}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 4 }}>
        <button
          onClick={openReport}
          disabled={loading || !hasMinData}
          style={{
            padding: "9px 16px",
            background: hasMinData ? "#0f1f3d" : "#e2e8f0",
            color: hasMinData ? "#fff" : "#94a3b8",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: hasMinData && !loading ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          {loading ? t("btn_generating", lang) : `📋 ${t("btn_preview_report", lang)}`}
        </button>

        <button
          onClick={downloadReport}
          disabled={loading || !hasMinData}
          style={{
            padding: "9px 16px",
            background: "#fff",
            color: hasMinData ? "#0f1f3d" : "#94a3b8",
            border: `1px solid ${hasMinData ? "#0f1f3d" : "#e2e8f0"}`,
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: hasMinData && !loading ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          {`⬇️ ${t("btn_download", lang)}`}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626" }}>{error}</div>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: "#7dd3fc" }}>
        {t("customer_report_includes", lang)}
      </div>
    </div>
  );
}