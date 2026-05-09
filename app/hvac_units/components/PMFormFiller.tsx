"use client";

import React, { useState, useEffect, useRef } from "react";

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

const CATEGORY_CONFIG = {
  equipment: { label: "Equipment Info", icon: "🔧", color: "#2563eb" },
  customer:  { label: "Customer / Site", icon: "🏢", color: "#16a34a" },
  tech:      { label: "Technician", icon: "👷", color: "#7c3aed" },
  readings:  { label: "Field Readings", icon: "📊", color: "#d97706" },
  date:      { label: "Dates", icon: "📅", color: "#0891b2" },
  other:     { label: "Other", icon: "📋", color: "#64748b" },
};

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
  const [forms, setForms] = useState<PMForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<PMForm | null>(null);
  const [values, setValues] = useState<FieldValues>({});
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<"list" | "fill" | "upload">("list");
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
    setUploadMsg("Reading your form and identifying fields...");
    try {
      const fd = new FormData();
      fd.append("action", "analyze_form");
      fd.append("file", file);
      fd.append("formName", formName);

      const res = await fetch("/api/pm-forms", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || json.error) {
        setUploadMsg("❌ Error: " + (json.error || "Upload failed. Check that your PDF has readable text (not a scanned image)."));
        return;
      }

      const fieldCount = json?.fields?.length || 0;
      if (fieldCount === 0) {
        setUploadMsg("⚠️ No fields detected. Make sure the PDF is not a scanned image — it must have readable text. Try a different PDF.");
        return;
      }
      setUploadMsg(`✅ Found ${fieldCount} fields. Opening form...`);
      // Use the form returned directly from the API — don't wait for DB reload
      const returnedForm = json.form || { id: null, name: formName, fields: json.fields, file_name: "" };
      // Ensure fields are set on the form object
      returnedForm.fields = json.fields;
      setSelectedForm(returnedForm);
      setValues({});
      await loadForms();
      setTimeout(() => setView("fill"), 800);
    } catch (e: any) {
      setUploadMsg("Error: " + e?.message);
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
        if (count === 0) alert("Nameplate read but no matching form fields found. Fields may need different labels.");
      } else {
        alert("Could not read nameplate: " + (json?.error || "Make sure the photo clearly shows the unit data plate."));
      }
    } catch (e: any) {
      console.error("Photo analysis failed:", e);
      alert("Photo analysis failed: " + e?.message);
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
      `MY HVAC/R TOOL — PM FORM`,
      `Form: ${selectedForm.name}`,
      `Generated: ${new Date().toLocaleString()}`,
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
        lines.push(`${f.label}: ${typeof val === "boolean" ? (val ? "Yes" : "No") : val}`);
      });
      lines.push("");
    });

    // Empty fields
    const empty = selectedForm.fields.filter(f => !values[f.id]);
    if (empty.length > 0) {
      lines.push("── Not Filled ──");
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
    setDownloadStatus("Filling PDF fields...");
    try {
      const filledValues = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== "" && v !== false && v !== undefined)
      );

      const res = await fetch("/api/pm-forms-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: selectedForm.id, values: filledValues }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("PDF fill error:", err);
        setDownloadStatus("PDF fill failed — downloading as text instead.");
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
      setDownloadStatus(`✅ PDF downloaded with ${filledCount} fields filled.`);
      setTimeout(() => { setSaved(false); setDownloadStatus(""); }, 4000);
    } catch (e: any) {
      console.error("Download failed:", e);
      setDownloadStatus("Error — downloading as text instead.");
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
            {loadingForms ? "Loading forms..." : `${forms.length} form${forms.length !== 1 ? "s" : ""} saved`}
          </div>
          <button onClick={() => { setView("upload"); setUploadMsg(""); }}
            style={{ padding: "8px 16px", background: "#0f1f3d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            + Upload Form
          </button>
        </div>

        {forms.length === 0 && !loadingForms && (
          <div style={{ padding: 24, textAlign: "center" as const, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No forms uploaded yet</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
              Upload your company PM form or asset sheet. The AI will read it and identify every field automatically.
            </div>
            <button onClick={() => setView("upload")}
              style={{ padding: "10px 20px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              Upload Your First Form
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {forms.map(form => (
            <div key={form.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{form.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {form.fields?.length || 0} fields · {form.file_name}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => { setSelectedForm(form); setValues({}); setView("fill"); }}
                  style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Fill Form →
                </button>
                <button onClick={async () => {
                  if (!confirm(`Delete "${form.name}"?`)) return;
                  const fd = new FormData();
                  fd.append("action", "delete_form");
                  fd.append("formId", form.id);
                  await fetch("/api/pm-forms", { method: "POST", body: fd });
                  await loadForms();
                }}
                  style={{ padding: "8px 12px", background: "#fff", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: "10px 14px", background: "#eff6ff", border: "1px solid #bae6fd", borderRadius: 8, fontSize: 12, color: "#1d4ed8", lineHeight: 1.6 }}>
          <strong>How it works:</strong> Upload any PDF form once. The AI reads it and identifies every field. On a job, take a photo of the unit nameplate and equipment info fills automatically. Talk-to-text for customer info and notes. Download the completed form to send wherever you need.
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
            ← Forms
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f1f3d" }}>{selectedForm.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{filledCount} of {totalCount} fields filled</div>
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
            📷 {analyzingPhoto ? "Reading nameplate..." : "Photo Nameplate → Auto-fill"}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
            onChange={e => e.target.files?.[0] && handleNameplatePhoto(e.target.files[0])} />

          {(manufacturer || model || serial) && (
            <div style={{ padding: "6px 12px", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
              ✓ Job data auto-filled where matched
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
            {pct === 100 ? "✅ Form complete — ready to download" : `Form ${pct}% complete`}
          </div>
          {pdfFieldCount > 0 && (
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
              PDF has {pdfFieldCount} fillable fields — values will be written directly into the PDF.
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
              {saved ? "✅ Downloaded!" : "⬇️ Download Filled PDF"}
            </button>
            <button onClick={copyToClipboard}
              style={{ padding: "10px 18px", background: "#fff", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
              📋 Copy as Text
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
        {isAutoFilled && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 6, padding: "1px 6px", borderRadius: 10, background: "#dcfce7", color: "#16a34a" }}>AUTO-FILLED</span>}
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
            title="Speak to fill"
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
  const [formName, setFormName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!selectedFile && formName.trim().length > 0 && !uploading;

  return (
    <div>
      <button onClick={onBack}
        style={{ marginBottom: 14, padding: "7px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
        ← Back
      </button>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f1f3d", marginBottom: 4 }}>Upload Company PM Form</div>
          <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Upload your company PM or asset sheet as a PDF. AI reads it and identifies every field automatically.
            <strong> PDF must have selectable text</strong> — scanned image PDFs won't work.
          </div>
        </div>

        {/* Step 1: Name */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            Step 1 — Give this form a name
          </label>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. Annual PM Checklist, Customer Asset Sheet"
            style={{ width: "100%", padding: "11px 14px", border: `2px solid ${formName.trim() ? "#16a34a" : "#e2e8f0"}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fafafa" }}
          />
          {formName.trim() && <div style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}>✓ Name entered</div>}
        </div>

        {/* Step 2: File */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>
            Step 2 — Select your PDF
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${selectedFile ? "#16a34a" : "#e2e8f0"}`, borderRadius: 10, padding: "20px", textAlign: "center" as const, cursor: "pointer", background: selectedFile ? "#f0fdf4" : "#f8fafc" }}>
            {selectedFile ? (
              <div>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>{(selectedFile.size / 1024).toFixed(0)} KB — tap to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Tap to select PDF</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Max 10MB · PDF files only</div>
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
            ? "🤖 AI is reading your form — please wait..."
            : !formName.trim() && !selectedFile
            ? "Enter a name and select a PDF to continue"
            : !formName.trim()
            ? "Enter a name for this form first"
            : !selectedFile
            ? "Select a PDF file to continue"
            : "🤖 Upload & Analyze Form"}
        </button>

        <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
          The AI reads the PDF and identifies every blank field. Works best with editable/fillable PDFs or PDFs with real text (not scanned images). Processing takes 15-30 seconds.
        </div>
      </div>
    </div>
  );
}