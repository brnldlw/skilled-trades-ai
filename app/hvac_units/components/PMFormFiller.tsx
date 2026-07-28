"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLang } from "../../components/LanguageContext";
import { t, type Language } from "../../lib/translations";

type FormField = {
  id: string;
  label: string;
  type: "text" | "date" | "number" | "checkbox" | "signature";
  category: "equipment" | "customer" | "tech" | "readings" | "date" | "other";
  nameplateField?: string | null;
  placeholder?: string;
  required?: boolean;
};

type PMForm = {
  id: string;
  name: string;
  file_name: string;
  fields: FormField[];
  page_count: number;
  created_at: string;
};

type FieldValues = Record<string, string | boolean>;

function getCategoryConfig(lang: Language) {
  return {
    equipment: { label: t("pmf_cat_equipment", lang), icon: "🔧", color: "#2563eb" },
    customer:  { label: t("pmf_cat_customer", lang), icon: "🏢", color: "#16a34a" },
    tech:      { label: t("pmf_cat_tech", lang), icon: "👷", color: "#7c3aed" },
    readings:  { label: t("pmf_cat_readings", lang), icon: "📊", color: "#d97706" },
    date:      { label: t("pmf_cat_date", lang), icon: "📅", color: "#0891b2" },
    other:     { label: t("pmf_cat_other", lang), icon: "📋", color: "#64748b" },
  };
}

// ── Voice input hook ──────────────────────────────────────────
function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  function start() {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => {
      const text = e.results[e.resultIndex][0].transcript.trim();
      if (text) onResult(text);
    };
    recRef.current = r;
    r.start();
  }

  function stop() {
    recRef.current?.stop();
    setListening(false);
  }

  return { listening, start, stop };
}

export function PMFormFiller({
  manufacturer,
  model,
  serial,
  refrigerantType,
  equipmentType,
}: {
  manufacturer?: string;
  model?: string;
  serial?: string;
  refrigerantType?: string;
  equipmentType?: string;
}) {
  const { lang } = useLang();
  const CATEGORY_CONFIG = getCategoryConfig(lang);
  const [forms, setForms] = useState<PMForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<PMForm | null>(null);
  const [values, setValues] = useState<FieldValues>({});
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"list" | "fill" | "upload" | "map">("list");
  const [pdfFieldNames, setPdfFieldNames] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [loadingForms, setLoadingForms] = useState(true);
  const [pdfFieldCount, setPdfFieldCount] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load forms on mount
  useEffect(() => {
    loadForms();
  }, []);

  // Load PDF field count when form is selected
  useEffect(() => {
    if (!selectedForm?.id) return;
    fetch(`/api/pm-forms-fill?formId=${selectedForm.id}`)
      .then(r => r.json())
      .then(d => setPdfFieldCount(d.pdfFields?.length || 0))
      .catch(() => {});
  }, [selectedForm?.id]);

  // Auto-fill nameplate fields when form is selected
  useEffect(() => {
    if (!selectedForm) return;
    const autoFills: FieldValues = {};
    const nameplate: Record<string, string | undefined> = {
      manufacturer, model, serial, refrigerant: refrigerantType, equipment_type: equipmentType,
    };

    selectedForm.fields.forEach(field => {
      if (field.nameplateField && nameplate[field.nameplateField]) {
        autoFills[field.id] = nameplate[field.nameplateField] as string;
      }
      // Auto-fill today's date for date fields
      if (field.category === "date" && field.label.toLowerCase().includes("date") && !field.label.toLowerCase().includes("next")) {
        autoFills[field.id] = new Date().toLocaleDateString("en-US");
      }
    });

    if (Object.keys(autoFills).length > 0) {
      setValues(prev => ({ ...autoFills, ...prev }));
    }
  }, [selectedForm, manufacturer, model, serial, refrigerantType, equipmentType]);

  async function loadForms() {
    setLoadingForms(true);
    try {
      const fd = new FormData();
      fd.append("action", "list_forms");
      const res = await fetch("/api/pm-forms", { method: "POST", body: fd });
      const json = await res.json();
      setForms(json.forms || []);
    } catch (e) {
      console.error("Failed to load forms:", e);
    } finally {
      setLoadingForms(false);
    }
  }

  async function handleUpload(file: File, formName: string) {
    setUploading(true);
    setUploadMsg(t("pmf_reading_form", lang));
    try {
      const fd = new FormData();
      fd.append("action", "analyze_form");
      fd.append("file", file);
      fd.append("formName", formName);

      const res = await fetch("/api/pm-forms", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || json.error) {
        setUploadMsg(t("pmf_error_prefix", lang).replace("{value}", json.error || t("pmf_upload_failed_generic", lang)));
        return;
      }

      const fieldCount = json?.fields?.length || 0;
      if (fieldCount === 0) {
        setUploadMsg(t("pmf_no_fields_detected", lang));
        return;
      }
      const autoMapped = json.autoMapped || 0;
      setUploadMsg(
        t("pmf_found_fields", lang).replace("{count}", String(fieldCount)) +
        (autoMapped > 0 ? t("pmf_ai_auto_mapped", lang).replace("{count}", String(autoMapped)) : "") +
        t("pmf_opening_form", lang)
      );
      const returnedForm = json.form || { id: null, name: formName, fields: json.fields, file_name: "" };
      returnedForm.fields = json.fields;
      setSelectedForm(returnedForm);
      setValues({});
      await loadForms();
      // If AI vision mapped most fields, go straight to fill
      if (autoMapped >= Math.max(fieldCount * 0.5, 3)) {
        setTimeout(() => setView("fill"), 1000);
      } else {
        // Load PDF fields for manual mapping screen
        if (returnedForm.id) {
          fetch(`/api/pm-forms-fill?formId=${returnedForm.id}`)
            .then(r => r.json())
            .then(d => {
              const allNames = (d.pdfFields || [])
                .filter((f: any) => f.type === "text")
                .sort((a: any, b: any) => parseInt(a.name.replace(/[^0-9]/g, "")) - parseInt(b.name.replace(/[^0-9]/g, "")))
                .map((f: any) => f.name);
              setPdfFieldNames(allNames);
            }).catch(() => {});
        }
        setTimeout(() => setView("map"), 1000);
      }
    } catch (e: any) {
      setUploadMsg(t("pmf_error_colon", lang).replace("{value}", e?.message || ""));
    } finally {
      setUploading(false);
    }
  }

  async function handleNameplatePhoto(file: File) {
    if (!selectedForm) return;
    setAnalyzingPhoto(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call nameplate parse API
      const res = await fetch("/api/nameplate-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });
      const json = await res.json();

      if (json.ok && json.data) {
        const np = json.data;
        const fills: FieldValues = {};
        selectedForm.fields.forEach((field: any) => {
          const label = field.label.toLowerCase();
          if (field.nameplateField && np[field.nameplateField]) {
            fills[field.id] = np[field.nameplateField]; return;
          }
          if (/manufacturer|make/.test(label) && np.manufacturer) fills[field.id] = np.manufacturer;
          else if (/model/.test(label) && np.model) fills[field.id] = np.model;
          else if (/serial/.test(label) && np.serial) fills[field.id] = np.serial;
          else if (/refrigerant/.test(label) && np.refrigerant) fills[field.id] = np.refrigerant;
          else if (/voltage/.test(label) && np.voltage) fills[field.id] = np.voltage;
          else if (/tonnage|tons/.test(label) && np.tonnage) fills[field.id] = np.tonnage;
          else if (/mca/.test(label) && np.mca) fills[field.id] = np.mca;
          else if (/mop/.test(label) && np.mop) fills[field.id] = np.mop;
          else if (/rla/.test(label) && np.rla) fills[field.id] = np.rla;
          else if (/fla/.test(label) && np.fla) fills[field.id] = np.fla;
          else if (/phase/.test(label) && np.phase) fills[field.id] = np.phase;
          else if (/hz|hertz|freq/.test(label) && np.hz) fills[field.id] = np.hz;
        });

        const count = Object.keys(fills).length;
        setValues(prev => ({ ...prev, ...fills }));
        if (count === 0) alert(t("pmf_nameplate_no_match", lang));
      } else {
        alert(t("pmf_could_not_read_nameplate", lang).replace("{value}", json?.error || t("pmf_photo_show_dataplate", lang)));
      }
    } catch (e: any) {
      console.error("Photo analysis failed:", e);
      alert(t("pmf_photo_analysis_failed", lang).replace("{value}", e?.message || ""));
    } finally {
      setAnalyzingPhoto(false);
    }
  }

  function handleVoiceForField(fieldId: string) {
    setActiveVoiceField(fieldId);
    setListeningField(fieldId);
  }

  function generateFilledFormText(): string {
    if (!selectedForm) return "";
    const lines: string[] = [
      t("pmf_report_title", lang),
      t("pmf_report_form_colon", lang).replace("{value}", selectedForm.name),
      t("pmf_report_generated_colon", lang).replace("{value}", new Date().toLocaleString()),
      ``,
    ];

    const byCategory = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
      const fields = selectedForm.fields.filter(f => f.category === cat && values[f.id]);
      if (fields.length > 0) acc[cat] = fields;
      return acc;
    }, {} as Record<string, FormField[]>);

    Object.entries(byCategory).forEach(([cat, fields]) => {
      const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
      lines.push(`── ${cfg.label} ──`);
      fields.forEach(f => {
        const val = values[f.id];
        lines.push(`${f.label}: ${typeof val === "boolean" ? (val ? t("option_yes", lang) : t("option_no", lang)) : val}`);
      });
      lines.push("");
    });

    // Empty fields
    const empty = selectedForm.fields.filter(f => !values[f.id]);
    if (empty.length > 0) {
      lines.push(t("pmf_report_not_filled", lang));
      empty.forEach(f => lines.push(`${f.label}: ___________`));
    }

    return lines.join("\n");
  }

  async function downloadFilledPDF() {
    if (!selectedForm?.id) {
      downloadTextFallback();
      return;
    }
    setSaved(false);
    setDownloadStatus(t("pmf_filling_pdf", lang));
    try {
      const filledValues = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== "" && v !== false && v !== undefined)
      );

      const res = await fetch("/api/pm-forms-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: selectedForm.id, values: filledValues, fieldMappings }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("PDF fill error:", err);
        setDownloadStatus(t("pmf_pdf_fill_failed", lang));
        downloadTextFallback();
        return;
      }

      const filledCount = res.headers.get("X-Fields-Filled") || "?";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedForm.name.replace(/[^a-z0-9]/gi, "-")}-filled.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSaved(true);
      setDownloadStatus(t("pmf_pdf_downloaded_count", lang).replace("{count}", String(filledCount)));
      setTimeout(() => { setSaved(false); setDownloadStatus(""); }, 4000);
    } catch (e: any) {
      console.error("Download failed:", e);
      setDownloadStatus(t("pmf_download_error_fallback", lang));
      downloadTextFallback();
    }
  }

  function downloadTextFallback() {
    const text = generateFilledFormText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedForm?.name || "PM-Form"}-${new Date().toLocaleDateString("en-US").replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generateFilledFormText()).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", background: "#fafafa",
  };

  // ── View: Form list ───────────────────────────────────────
  if (view === "list") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {loadingForms ? t("pmf_loading_forms", lang) : t("pmf_forms_saved", lang).replace("{count}", String(forms.length))}
          </div>
          <button onClick={() => { setView("upload"); setUploadMsg(""); }}
            style={{ padding: "8px 16px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {t("btn_upload_form", lang)}
          </button>
        </div>

        {forms.length === 0 && !loadingForms && (
          <div style={{ padding: 24, textAlign: "center" as const, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{t("pmf_no_forms_title", lang)}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
              {t("pmf_no_forms_body", lang)}
            </div>
            <button onClick={() => setView("upload")}
              style={{ padding: "10px 20px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              {t("btn_upload_first_form", lang)}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {forms.map(form => (
            <div key={form.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{form.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {t("pmf_fields_count_file", lang).replace("{count}", String(form.fields?.length || 0)).replace("{value}", form.file_name)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => {
                  setSelectedForm(form);
                  setValues({});
                  // Load pdf field names
                  if (form.id) {
                    fetch(`/api/pm-forms-fill?formId=${form.id}`)
                      .then(r => r.json())
                      .then(d => {
                        const allNames = (d.pdfFields || [])
                          .sort((a: any, b: any) => {
                            const na = parseInt(a.name.replace(/\D/g, "") || "0");
                            const nb = parseInt(b.name.replace(/\D/g, "") || "0");
                            return na - nb;
                          })
                          .map((f: any) => f.name);
                        setPdfFieldNames(allNames);
                        // Load saved mappings if any
                        const saved = localStorage.getItem(`fm_${form.id}`);
                        if (saved) { setFieldMappings(JSON.parse(saved)); setView("fill"); }
                        else setView("map");
                      }).catch(() => setView("fill"));
                  } else setView("fill");
                }}
                  style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  {t("btn_fill_form_arrow", lang)}
                </button>
                <button onClick={async () => {
                  if (!confirm(t("pmf_confirm_delete_form", lang).replace("{value}", form.name))) return;
                  const fd = new FormData();
                  fd.append("action", "delete_form");
                  fd.append("formId", form.id);
                  await fetch("/api/pm-forms", { method: "POST", body: fd });
                  await loadForms();
                }}
                  style={{ padding: "8px 12px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  {t("btn_delete", lang)}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, fontSize: 12, color: "#1d4ed8", lineHeight: 1.6 }}>
          <strong>{t("pmf_how_it_works_title", lang)}</strong> {t("pmf_how_it_works_body", lang)}
        </div>
      </div>
    );
  }

  // ── View: Upload form ─────────────────────────────────────
  if (view === "upload") {
    return (
      <UploadView
        onBack={() => setView("list")}
        onUpload={handleUpload}
        uploading={uploading}
        message={uploadMsg}
      />
    );
  }

  // ── View: Map fields ─────────────────────────────────────
  if (view === "map" && selectedForm) {
    return (
      <MapView
        form={selectedForm}
        pdfFieldNames={pdfFieldNames}
        onSave={(mappings) => {
          setFieldMappings(mappings);
          if (selectedForm.id) {
            try { localStorage.setItem(`fm_${selectedForm.id}`, JSON.stringify(mappings)); } catch {}
          }
          setView("fill");
        }}
        onSkip={() => setView("fill")}
        onBack={() => setView("list")}
      />
    );
  }

  // ── View: Fill form ───────────────────────────────────────
  if (view === "fill" && selectedForm) {
    const fieldsByCategory = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
      const fields = selectedForm.fields.filter(f => f.category === cat);
      if (fields.length > 0) acc[cat] = fields;
      return acc;
    }, {} as Record<string, FormField[]>);

    const filledCount = Object.values(values).filter(v => v !== "" && v !== false).length;
    const totalCount = selectedForm.fields.length;
    const pct = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setView("list")} style={{ padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
            {t("btn_forms_back", lang)}
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d" }}>{selectedForm.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{t("pmf_fields_filled_of", lang).replace("{filled}", String(filledCount)).replace("{total}", String(totalCount))}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#2563eb", borderRadius: 3, transition: "width 0.3s" }} />
        </div>

        {/* Auto-fill actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const }}>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={analyzingPhoto}
            style={{ padding: "8px 14px", background: analyzingPhoto ? "#e2e8f0" : "#0f1f3d", color: analyzingPhoto ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
            {analyzingPhoto ? t("pmf_reading_nameplate", lang) : t("pmf_photo_autofill", lang)}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
            onChange={e => e.target.files?.[0] && handleNameplatePhoto(e.target.files[0])} />

          {(manufacturer || model || serial) && (
            <div style={{ padding: "6px 12px", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
              {t("pmf_job_data_autofilled", lang)}
            </div>
          )}
        </div>

        {/* Fields by category */}
        {Object.entries(fieldsByCategory).map(([cat, fields]) => {
          const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
          return (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: "0.07em", textTransform: "uppercase" as const, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{cfg.icon}</span> {cfg.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {fields.map(field => (
                  <FieldInput
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    onChange={val => setValues(prev => ({ ...prev, [field.id]: val }))}
                    isAutoFilled={!!(field.nameplateField && values[field.id])}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Download / Save actions */}
        <div style={{ marginTop: 20, padding: "16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
            {pct === 100 ? t("pmf_form_complete", lang) : t("pmf_form_pct_complete", lang).replace("{value}", String(pct))}
          </div>
          {pdfFieldCount > 0 && (
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
              {t("pmf_pdf_fillable_fields", lang).replace("{count}", String(pdfFieldCount))}
            </div>
          )}
          {downloadStatus && (
            <div style={{ marginBottom: 10, padding: "8px 12px", background: "#eff6ff", borderRadius: 8, fontSize: 12, color: "#1d4ed8" }}>
              {downloadStatus}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <button onClick={downloadFilledPDF}
              style={{ padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              {saved ? t("pmf_downloaded", lang) : t("btn_download_filled_pdf", lang)}
            </button>
            <button onClick={copyToClipboard}
              style={{ padding: "10px 18px", background: "#fff", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              {t("btn_copy_as_text", lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Field Input component ─────────────────────────────────────
function FieldInput({
  field,
  value,
  onChange,
  isAutoFilled,
}: {
  field: FormField;
  value: string | boolean | undefined;
  onChange: (val: string | boolean) => void;
  isAutoFilled: boolean;
}) {
  const { lang } = useLang();
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  function startVoice() {
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e: any) => {
      const text = e.results[e.resultIndex][0].transcript.trim();
      if (text) onChange(text);
    };
    recRef.current = r;
    r.start();
  }

  const inp: React.CSSProperties = {
    flex: 1,
    padding: "9px 12px",
    border: `1px solid ${isAutoFilled ? "#bbf7d0" : "#e2e8f0"}`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    background: isAutoFilled ? "#f0fdf4" : "#fafafa",
    color: "#1e293b",
  };

  if (field.type === "checkbox") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#16a34a" }} />
        <label style={{ fontSize: 13, color: "#374151", cursor: "pointer", flex: 1 }}
          onClick={() => onChange(!value)}>
          {field.label}
          {field.required && <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>}
        </label>
      </div>
    );
  }

  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
        {field.label}
        {field.required && <span style={{ color: "#dc2626", marginLeft: 3 }}>*</span>}
        {isAutoFilled && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 6, padding: "1px 6px", borderRadius: 10, background: "#dcfce7", color: "#16a34a" }}>{t("pmf_auto_filled_badge", lang)}</span>}
      </label>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          style={inp}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={typeof value === "boolean" ? "" : (value || "")}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
        />
        {/* Voice button for text fields */}
        {field.type === "text" && (
          <button
            type="button"
            onClick={startVoice}
            disabled={listening}
            title={t("pmf_speak_to_fill", lang)}
            style={{
              width: 38, height: 38, borderRadius: 8, border: `1px solid ${listening ? "#dc2626" : "#e2e8f0"}`,
              background: listening ? "#fef2f2" : "#f8fafc", cursor: "pointer",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, animation: listening ? "mic-pulse 1s ease-in-out infinite" : "none",
            }}>
            {listening ? "⏹" : "🎤"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Upload View — self-contained with its own state ───────────
function UploadView({ onBack, onUpload, uploading, message }: {
  onBack: () => void;
  onUpload: (file: File, name: string) => void;
  uploading: boolean;
  message: string;
}) {
  const { lang } = useLang();
  const [formName, setFormName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!selectedFile && formName.trim().length > 0 && !uploading;

  return (
    <div>
      <button onClick={onBack}
        style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        {t("tour_back", lang)}
      </button>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>{t("pmf_upload_title", lang)}</div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            {t("pmf_upload_body", lang)}
            <strong> {t("pmf_upload_body_bold", lang)}</strong>{t("pmf_upload_body_end", lang)}
          </div>
        </div>

        {/* Step 1: Name */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            {t("pmf_step1_name", lang)}
          </label>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder={t("pmf_form_name_placeholder", lang)}
            style={{ width: "100%", padding: "11px 14px", border: `2px solid ${formName.trim() ? "#16a34a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa" }}
          />
          {formName.trim() && <div style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}>{t("pmf_name_entered", lang)}</div>}
        </div>

        {/* Step 2: File */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            {t("pmf_step2_select_pdf", lang)}
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${selectedFile ? "#16a34a" : "#e2e8f0"}`, borderRadius: 10, padding: "20px", textAlign: "center" as const, cursor: "pointer", background: selectedFile ? "#f0fdf4" : "#f8fafc" }}>
            {selectedFile ? (
              <div>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>{t("pmf_kb_tap_to_change", lang).replace("{value}", (selectedFile.size / 1024).toFixed(0))}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{t("pmf_tap_to_select_pdf", lang)}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("pmf_max_10mb", lang)}</div>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) setSelectedFile(f);
            }}
          />
        </div>

        {/* Status message */}
        {message && (
          <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, lineHeight: 1.5,
            background: message.startsWith("✅") ? "#f0fdf4" : message.startsWith("⚠️") ? "#fffbeb" : "#fef2f2",
            border: `1px solid ${message.startsWith("✅") ? "#bbf7d0" : message.startsWith("⚠️") ? "#fde68a" : "#fecaca"}`,
            color: message.startsWith("✅") ? "#166534" : message.startsWith("⚠️") ? "#854d0e" : "#dc2626" }}>
            {message}
          </div>
        )}

        {/* Submit button — always visible, shows state */}
        <button
          onClick={() => canSubmit && onUpload(selectedFile!, formName.trim())}
          style={{
            padding: "14px",
            background: uploading ? "#dbeafe" : canSubmit ? "#f97316" : "#e2e8f0",
            color: uploading ? "#1d4ed8" : canSubmit ? "#fff" : "#94a3b8",
            border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15,
            cursor: canSubmit ? "pointer" : "default",
            fontFamily: "inherit",
            boxShadow: canSubmit ? "0 4px 16px rgba(249,115,22,0.35)" : "none",
            transition: "all 0.2s",
          }}
        >
          {uploading
            ? t("pmf_ai_reading_wait", lang)
            : !formName.trim() && !selectedFile
            ? t("pmf_enter_name_and_select", lang)
            : !formName.trim()
            ? t("pmf_enter_name_first", lang)
            : !selectedFile
            ? t("pmf_select_pdf_continue", lang)
            : t("btn_upload_analyze_form", lang)}
        </button>

        <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
          {t("pmf_upload_footer_note", lang)}
        </div>
      </div>
    </div>
  );
}

// ── MapView — one-time field mapping screen ───────────────────
function MapView({ form, pdfFieldNames, onSave, onSkip, onBack }: {
  form: any;
  pdfFieldNames: string[];
  onSave: (mappings: Record<string, string>) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const { lang } = useLang();
  const fields: any[] = Array.isArray(form.fields) ? form.fields : [];

  // Sort PDF field names numerically so 1,2,3...10,11 not 1,10,11,2,3
  const sortedPdfFields = [...pdfFieldNames].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, "") || "0");
    const nb = parseInt(b.replace(/\D/g, "") || "0");
    return na - nb;
  });

  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    // Pre-fill sequentially using sorted order
    const m: Record<string, string> = {};
    fields.forEach((f: any, i: number) => {
      if (sortedPdfFields[i]) m[f.id] = sortedPdfFields[i];
    });
    return m;
  });

  const mappedCount = Object.values(mappings).filter(v => v).length;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        {t("tour_back", lang)}
      </button>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 4 }}>{t("pmf_map_title", lang)}</div>
        <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
          {t("pmf_map_body", lang)} <strong>{t("pmf_map_body_tab", lang)}</strong> {t("pmf_map_body_rest", lang)}
          {sortedPdfFields.length > 0 && <span>{t("pmf_map_pdf_slots", lang).replace("{count}", String(sortedPdfFields.length)).replace("{value}", sortedPdfFields[sortedPdfFields.length - 1])}</span>}
        </div>
      </div>

      <div style={{ marginBottom: 8, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, fontSize: 12, color: "#16a34a" }}>
        {t("pmf_fields_mapped_of", lang).replace("{mapped}", String(mappedCount)).replace("{total}", String(fields.length))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 2, fontSize: 11, fontWeight: 700, color: "#64748b", padding: "4px 8px" }}>{t("pmf_col_field_label", lang)}</div>
        <div style={{ flex: 3, fontSize: 11, fontWeight: 700, color: "#64748b", padding: "4px 8px" }}>{t("pmf_col_pdf_slot", lang)}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, maxHeight: 450, overflowY: "auto" as const, paddingRight: 4 }}>
        {fields.map((field: any, idx: number) => (
          <div key={field.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 2, fontSize: 12, color: "#1e293b", padding: "7px 10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, lineHeight: 1.3 }}>
              <span style={{ fontSize: 10, color: "#94a3b8", display: "block" }}>#{idx + 1}</span>
              {field.label}
            </div>
            <select
              value={mappings[field.id] || ""}
              onChange={e => setMappings(prev => ({ ...prev, [field.id]: e.target.value }))}
              style={{ flex: 3, padding: "7px 8px", border: `1px solid ${mappings[field.id] ? "#16a34a" : "#e2e8f0"}`, borderRadius: 6, fontSize: 12, fontFamily: "inherit", background: mappings[field.id] ? "#f0fdf4" : "#fafafa" }}
            >
              <option value="">{t("pmf_select_pdf_slot_option", lang)}</option>
              {sortedPdfFields.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button
          onClick={() => onSave(mappings)}
          style={{ flex: 1, padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          {t("pmf_save_and_fill_form", lang).replace("{count}", String(mappedCount))}
        </button>
        <button
          onClick={onSkip}
          style={{ padding: "10px 14px", background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          {t("btn_skip", lang)}
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
        {t("pmf_map_footer_note", lang)}
      </div>
    </div>
  );
}