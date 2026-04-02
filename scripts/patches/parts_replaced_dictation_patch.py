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

    if "parts-replaced-dictation-v1" in source:
        print("Parts Replaced dictation patch already applied.")
        return

    helper_block = """      // parts-replaced-dictation-v1
      const [partsReplacedListening, setPartsReplacedListening] = useState(false);
      const [partsReplacedDictationMessage, setPartsReplacedDictationMessage] = useState("");

      function browserSupportsPartsReplacedDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startPartsReplacedDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setPartsReplacedDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__partsReplacedRecognition && partsReplacedListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__partsReplacedRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setPartsReplacedListening(true);
            setPartsReplacedDictationMessage("Listening for Parts Replaced...");
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

            setPartsReplaced((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setPartsReplacedDictationMessage("Dictation added to Parts Replaced.");
          };

          recognition.onerror = (event: any) => {
            setPartsReplacedListening(false);
            w.__partsReplacedRecognition = null;
            setPartsReplacedDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setPartsReplacedListening(false);
            w.__partsReplacedRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setPartsReplacedListening(false);
          (window as any).__partsReplacedRecognition = null;
          setPartsReplacedDictationMessage("Could not start dictation.");
          console.error("PARTS REPLACED DICTATION FAILED", err);
        }
      }

      function stopPartsReplacedDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__partsReplacedRecognition) {
          try {
            w.__partsReplacedRecognition.stop();
          } catch (err) {
            console.error("PARTS REPLACED DICTATION STOP FAILED", err);
          }
        }
        setPartsReplacedListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "parts replaced dictation helpers",
    )

    ui_block = """

          {/* parts-replaced-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startPartsReplacedDictation}
              disabled={!browserSupportsPartsReplacedDictation() || partsReplacedListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: partsReplacedListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsPartsReplacedDictation() || partsReplacedListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsPartsReplacedDictation() || partsReplacedListening ? 0.7 : 1,
              }}
            >
              {partsReplacedListening ? "Listening..." : "Start Parts Dictation"}
            </button>

            <button
              type="button"
              onClick={stopPartsReplacedDictation}
              disabled={!partsReplacedListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: partsReplacedListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: partsReplacedListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsPartsReplacedDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {partsReplacedDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Parts Dictation:</b> {partsReplacedDictationMessage}
            </SmallHint>
          ) : null}
"""
    source = insert_after_value_field(
        source,
        "value={partsReplaced}",
        ui_block,
        "parts replaced dictation UI",
    )

    backup = PAGE.with_name(PAGE.name + ".parts-replaced-dictation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
