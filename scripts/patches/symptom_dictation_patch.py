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

    if "symptom-dictation-v1" in source:
        print("Symptom dictation patch already applied.")
        return

    helper_block = """      // symptom-dictation-v1
      const [symptomListening, setSymptomListening] = useState(false);
      const [symptomDictationMessage, setSymptomDictationMessage] = useState("");

      function browserSupportsSymptomDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startSymptomDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setSymptomDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__symptomRecognition && symptomListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__symptomRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setSymptomListening(true);
            setSymptomDictationMessage("Listening for Symptom...");
          };

          recognition.onresult = (event: any) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const result = event.results[i];
              if (result?.isFinal && result[0]?.transcript) {
                transcript += String(result[0].transcript).trim() + " ";
              }
            }

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setSymptom((prev) => [String(prev || "").trim(), cleaned].filter(Boolean).join(" "));
            setSymptomDictationMessage("Dictation added to Symptom.");
          };

          recognition.onerror = (event: any) => {
            setSymptomListening(false);
            w.__symptomRecognition = null;
            setSymptomDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setSymptomListening(false);
            w.__symptomRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setSymptomListening(false);
          (window as any).__symptomRecognition = null;
          setSymptomDictationMessage("Could not start dictation.");
          console.error("SYMPTOM DICTATION FAILED", err);
        }
      }

      function stopSymptomDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__symptomRecognition) {
          try {
            w.__symptomRecognition.stop();
          } catch (err) {
            console.error("SYMPTOM DICTATION STOP FAILED", err);
          }
        }
        setSymptomListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "symptom dictation helpers",
    )

    ui_block = """

          {/* symptom-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startSymptomDictation}
              disabled={!browserSupportsSymptomDictation() || symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: symptomListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsSymptomDictation() || symptomListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsSymptomDictation() || symptomListening ? 0.7 : 1,
              }}
            >
              {symptomListening ? "Listening..." : "Start Symptom Dictation"}
            </button>

            <button
              type="button"
              onClick={stopSymptomDictation}
              disabled={!symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: symptomListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: symptomListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsSymptomDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {symptomDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Symptom Dictation:</b> {symptomDictationMessage}
            </SmallHint>
          ) : null}
"""
    source = insert_after_value_field(
        source,
        "value={symptom}",
        ui_block,
        "symptom dictation UI",
    )

    backup = PAGE.with_name(PAGE.name + ".symptom-dictation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
