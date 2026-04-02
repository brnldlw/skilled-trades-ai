from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def insert_after_value_field(source: str, value_marker: str, block: str, label: str) -> str:
    idx = source.find(value_marker)
    if idx == -1:
        raise RuntimeError(f"Could not find field marker for: {label} ({value_marker})")

    close_self = source.find("/>", idx)
    close_textarea = source.find("</textarea>", idx)

    candidates = [x for x in [close_self, close_textarea] if x != -1]
    if not candidates:
        raise RuntimeError(f"Could not find end of field for: {label}")

    close_idx = min(candidates)
    if close_idx == close_textarea:
        insert_at = close_idx + len("</textarea>")
    else:
        insert_at = close_idx + len("/>")

    return source[:insert_at] + block + source[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "field-dictation-v1" in source:
        print("Field dictation patch already applied.")
        return

    helper_block = """      // field-dictation-v1
      const [fieldDictationListening, setFieldDictationListening] = useState(false);
      const [fieldDictationTarget, setFieldDictationTarget] = useState<"" | "symptom" | "cause" | "fix">("");
      const [fieldDictationMessage, setFieldDictationMessage] = useState("");

      function browserSupportsFieldDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function appendFieldDictationText(
        target: "symptom" | "cause" | "fix",
        transcript: string
      ) {
        const cleaned = String(transcript || "").trim();
        if (!cleaned) return;

        if (target === "symptom") {
          setSymptom((prev) => [String(prev || "").trim(), cleaned].filter(Boolean).join(" "));
          setFieldDictationMessage("Dictation added to Symptom.");
          return;
        }

        if (target === "cause") {
          setFinalConfirmedCause((prev) =>
            [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
          );
          setFieldDictationMessage("Dictation added to Final Confirmed Cause.");
          return;
        }

        if (target === "fix") {
          setActualFixPerformed((prev) =>
            [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
          );
          setFieldDictationMessage("Dictation added to Actual Fix Performed.");
        }
      }

      function startFieldDictation(target: "symptom" | "cause" | "fix") {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setFieldDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__fieldDictationRecognition && fieldDictationListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__fieldDictationRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setFieldDictationListening(true);
            setFieldDictationTarget(target);
            setFieldDictationMessage(
              target === "symptom"
                ? "Listening for Symptom..."
                : target === "cause"
                ? "Listening for Final Confirmed Cause..."
                : "Listening for Actual Fix Performed..."
            );
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            appendFieldDictationText(target, transcript.trim());
          };

          recognition.onerror = (event: any) => {
            setFieldDictationListening(false);
            setFieldDictationTarget("");
            w.__fieldDictationRecognition = null;
            setFieldDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setFieldDictationListening(false);
            setFieldDictationTarget("");
            w.__fieldDictationRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setFieldDictationListening(false);
          setFieldDictationTarget("");
          (window as any).__fieldDictationRecognition = null;
          setFieldDictationMessage("Could not start dictation.");
          console.error("FIELD DICTATION FAILED", err);
        }
      }

      function stopFieldDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__fieldDictationRecognition) {
          try {
            w.__fieldDictationRecognition.stop();
          } catch (err) {
            console.error("FIELD DICTATION STOP FAILED", err);
          }
        }
        setFieldDictationListening(false);
        setFieldDictationTarget("");
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "field dictation helpers",
    )

    def button_block(target: str, title: str) -> str:
        return f"""

          {{/* field-dictation-v1:{target} */}}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={{() => startFieldDictation("{target}")}}
              disabled={{!browserSupportsFieldDictation() || fieldDictationListening}}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background:
                  fieldDictationListening && fieldDictationTarget === "{target}" ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsFieldDictation() || fieldDictationListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsFieldDictation() || fieldDictationListening ? 0.7 : 1,
              }}
            >
              {{fieldDictationListening && fieldDictationTarget === "{target}"
                ? "Listening..."
                : "Start Dictation"}}
            </button>

            <button
              type="button"
              onClick={{stopFieldDictation}}
              disabled={{!fieldDictationListening}}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: fieldDictationListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: fieldDictationListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {{!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}}

          {{fieldDictationMessage && fieldDictationTarget === "{target}" ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>{title} Dictation:</b> {{fieldDictationMessage}}
            </SmallHint>
          ) : null}}
"""

    source = insert_after_value_field(
        source,
        "value={symptom}",
        button_block("symptom", "Symptom"),
        "symptom dictation buttons",
    )

    source = insert_after_value_field(
        source,
        "value={finalConfirmedCause}",
        button_block("cause", "Cause"),
        "cause dictation buttons",
    )

    source = insert_after_value_field(
        source,
        "value={actualFixPerformed}",
        button_block("fix", "Fix"),
        "fix dictation buttons",
    )

    backup = PAGE.with_name(PAGE.name + ".field-dictation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
