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

    if "actual-fix-performed-dictation-v1" in source:
        print("Actual Fix Performed dictation patch already applied.")
        return

    helper_block = """      // actual-fix-performed-dictation-v1
      const [actualFixListening, setActualFixListening] = useState(false);
      const [actualFixDictationMessage, setActualFixDictationMessage] = useState("");

      function browserSupportsActualFixDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startActualFixDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setActualFixDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__actualFixRecognition && actualFixListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__actualFixRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setActualFixListening(true);
            setActualFixDictationMessage("Listening for Actual Fix Performed...");
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

            setActualFixPerformed((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setActualFixDictationMessage("Dictation added to Actual Fix Performed.");
          };

          recognition.onerror = (event: any) => {
            setActualFixListening(false);
            w.__actualFixRecognition = null;
            setActualFixDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setActualFixListening(false);
            w.__actualFixRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setActualFixListening(false);
          (window as any).__actualFixRecognition = null;
          setActualFixDictationMessage("Could not start dictation.");
          console.error("ACTUAL FIX DICTATION FAILED", err);
        }
      }

      function stopActualFixDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__actualFixRecognition) {
          try {
            w.__actualFixRecognition.stop();
          } catch (err) {
            console.error("ACTUAL FIX DICTATION STOP FAILED", err);
          }
        }
        setActualFixListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "actual fix dictation helpers",
    )

    ui_block = """

          {/* actual-fix-performed-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startActualFixDictation}
              disabled={!browserSupportsActualFixDictation() || actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: actualFixListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsActualFixDictation() || actualFixListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsActualFixDictation() || actualFixListening ? 0.7 : 1,
              }}
            >
              {actualFixListening ? "Listening..." : "Start Fix Dictation"}
            </button>

            <button
              type="button"
              onClick={stopActualFixDictation}
              disabled={!actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: actualFixListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: actualFixListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsActualFixDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {actualFixDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Fix Dictation:</b> {actualFixDictationMessage}
            </SmallHint>
          ) : null}
"""
    source = insert_after_value_field(
        source,
        "value={actualFixPerformed}",
        ui_block,
        "actual fix performed dictation UI",
    )

    backup = PAGE.with_name(PAGE.name + ".actual-fix-performed-dictation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
