"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function ServiceEventPhotos({
  photoUrls,
  busy,
  message,
  onUploadPhotos,
  onRemovePhoto,
}: {
  photoUrls: string[];
  busy: boolean;
  message: string;
  onUploadPhotos: (files: File[] | FileList | null) => void | Promise<void>;
  onRemovePhoto: (index: number) => void;
}) {
  const { lang } = useLang();
  const [showPhotos, setShowPhotos] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPhotos((v) => !v)}
        style={{
          padding: "10px 14px",
          fontWeight: 900,
          border: "1px solid #cfcfcf",
          borderRadius: 10,
          background: "#ffffff",
          color: "#111",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        {showPhotos ? t("btn_hide_photos", lang) : t("btn_show_photos", lang)}
      </button>

      {showPhotos ? (
        <div style={{ marginTop: 12 }}>
          <SmallHint>
            {t("service_photos_hint", lang)}
          </SmallHint>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  e.currentTarget.value = "";
                  onUploadPhotos(files);
                }}
                style={{ width: "100%" }}
              />
            </div>

            {message ? (
              <SmallHint>{message}</SmallHint>
            ) : null}

            {busy ? (
              <SmallHint>{t("uploading_photos", lang)}</SmallHint>
            ) : null}

            {photoUrls.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 10,
                }}
              >
                {photoUrls.map((url, i) => (
                  <div
                    key={url + i}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 8,
                      background: "#fafafa",
                    }}
                  >
                    <button
                      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                      style={{
                        width: "100%",
                        padding: 0,
                        border: "1px solid #e5e5e5",
                        borderRadius: 8,
                        background: "#fff",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                      title={t("btn_open_full_photo", lang)}
                    >
                      <img
                        src={url}
                        alt={`Service event photo ${i + 1}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "contain",
                          borderRadius: 8,
                          display: "block",
                          background: "#fff",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => onRemovePhoto(i)}
                      style={{
                        marginTop: 8,
                        width: "100%",
                        padding: "8px 10px",
                        fontWeight: 900,
                        border: "1px solid #cfcfcf",
                        borderRadius: 10,
                        background: "#ffffff",
                        color: "#111",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      {t("btn_remove_photo", lang)}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <SmallHint>{t("no_service_photos_yet", lang)}</SmallHint>
            )}
          </div>
        </div>
      ) : (
        <SmallHint style={{ marginTop: 12 }}>
          {t("hidden_by_default", lang)}
        </SmallHint>
      )}
    </>
  );
}
