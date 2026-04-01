from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "closeout-note-dictation-v1" in source:
        print("Closeout note dictation patch already applied.")
        return

    helper_block = """      // closeout-note-dictation-v1
      const [techCloseoutListening, setTechCloseoutListening] = useState(false);
      const [techCloseoutDictationMessage, setTechCloseoutDictationMessage] = useState("");

      function browserSupportsTechCloseoutDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startTechCloseoutDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setTechCloseoutDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__techCloseoutRecognition && techCloseoutListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__techCloseoutRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setTechCloseoutListening(true);
            setTechCloseoutDictationMessage(
              "Listening... describe what you found, what you replaced, and how the equipment performed after repair."
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

            const cleaned = transcript.trim();
            if (!cleaned) return;

            setTechCloseoutNotes((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setTechCloseoutDictationMessage(
              "Dictation captured and added to Tech Closeout Notes."
            );
          };

          recognition.onerror = (event: any) => {
            setTechCloseoutListening(false);
            w.__techCloseoutRecognition = null;
            setTechCloseoutDictationMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setTechCloseoutListening(false);
            w.__techCloseoutRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setTechCloseoutListening(false);
          (window as any).__techCloseoutRecognition = null;
          setTechCloseoutDictationMessage("Could not start dictation.");
          console.error("TECH CLOSEOUT DICTATION FAILED", err);
        }
      }

      function stopTechCloseoutDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__techCloseoutRecognition) {
          try {
            w.__techCloseoutRecognition.stop();
          } catch (err) {
            console.error("TECH CLOSEOUT DICTATION STOP FAILED", err);
          }
        }
        setTechCloseoutListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "closeout dictation helpers",
    )

    target = "value={techCloseoutNotes}"
    idx = source.find(target)
    if idx == -1:
        raise RuntimeError("Could not find Tech Closeout Notes textarea.")

    textarea_close_self = source.find("/>", idx)
    textarea_close_full = source.find("</textarea>", idx)

    candidates = [x for x in [textarea_close_self, textarea_close_full] if x != -1]
    if not candidates:
        raise RuntimeError("Could not find end of Tech Closeout Notes textarea.")

    close_idx = min(candidates)
    if close_idx == textarea_close_full:
        insert_at = close_idx + len("</textarea>")
    else:
        insert_at = close_idx + len("/>")

    ui_block = """

          {/* closeout-note-dictation-v1 */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startTechCloseoutDictation}
              disabled={!browserSupportsTechCloseoutDictation() || techCloseoutListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: techCloseoutListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor:
                  !browserSupportsTechCloseoutDictation() || techCloseoutListening
                    ? "not-allowed"
                    : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity:
                  !browserSupportsTechCloseoutDictation() || techCloseoutListening ? 0.7 : 1,
              }}
            >
              {techCloseoutListening ? "Listening..." : "Start Note Dictation"}
            </button>

            <button
              type="button"
              onClick={stopTechCloseoutDictation}
              disabled={!techCloseoutListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: techCloseoutListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: techCloseoutListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsTechCloseoutDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {techCloseoutDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Dictation:</b> {techCloseoutDictationMessage}
            </SmallHint>
          ) : null}
"""

    source = source[:insert_at] + ui_block + source[insert_at:]

    backup = PAGE.with_name(PAGE.name + ".closeout-note-dictation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
