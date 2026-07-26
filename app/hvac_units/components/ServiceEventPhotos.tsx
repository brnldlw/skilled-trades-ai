"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";

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
        {showPhotos ? "Hide Photos" : "Show Photos"}
      </button>

      {showPhotos ? (
        <div style={{ marginTop: 12 }}>
          <SmallHint>
            Attach field photos to this service event so the next tech can see what happened.
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
              <SmallHint>Uploading photo(s)...</SmallHint>
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
                      title="Open full photo"
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
                      Remove Photo
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <SmallHint>No service event photos attached yet.</SmallHint>
            )}
          </div>
        </div>
      ) : (
        <SmallHint style={{ marginTop: 12 }}>
          Hidden by default to keep the main workflow clean.
        </SmallHint>
      )}
    </>
  );
}
