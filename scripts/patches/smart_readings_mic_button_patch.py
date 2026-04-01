from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise RuntimeError(f"Could not find expected block for: {label}")
    return source.replace(old, new, 1)


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "smart-readings-mic-v1" in source:
        print("Smart readings mic patch already applied.")
        return

    helper_block = """      // smart-readings-mic-v1
      const [smartReadingsListening, setSmartReadingsListening] = useState(false);

      function browserSupportsSmartReadingsDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startSmartReadingsDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setSmartReadingsMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__smartReadingsRecognition && smartReadingsListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__smartReadingsRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setSmartReadingsListening(true);
            setSmartReadingsMessage(
              "Listening... say readings like suction 50 head 175 superheat 18 subcool 7"
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

            setSmartReadingsInput((prev) =>
              [String(prev || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setSmartReadingsMessage(
              "Dictation captured. Review the text and tap Parse Readings."
            );
          };

          recognition.onerror = (event: any) => {
            setSmartReadingsListening(false);
            w.__smartReadingsRecognition = null;
            setSmartReadingsMessage(
              event?.error
                ? `Dictation error: ${String(event.error)}`
                : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setSmartReadingsListening(false);
            w.__smartReadingsRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setSmartReadingsListening(false);
          (window as any).__smartReadingsRecognition = null;
          setSmartReadingsMessage("Could not start dictation.");
          console.error("SMART READINGS DICTATION FAILED", err);
        }
      }

      function stopSmartReadingsDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__smartReadingsRecognition) {
          try {
            w.__smartReadingsRecognition.stop();
          } catch (err) {
            console.error("SMART READINGS DICTATION STOP FAILED", err);
          }
        }
        setSmartReadingsListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "smart readings mic helpers",
    )

    old_buttons = """              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={applySmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Parse Readings
                </button>

                <button
                  type="button"
                  onClick={clearSmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Clear Parser
                </button>
              </div>
"""

    new_buttons = """              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={applySmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Parse Readings
                </button>

                <button
                  type="button"
                  onClick={startSmartReadingsDictation}
                  disabled={!browserSupportsSmartReadingsDictation() || smartReadingsListening}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: smartReadingsListening ? "#f7f7f7" : "#ffffff",
                    color: "#111",
                    cursor:
                      !browserSupportsSmartReadingsDictation() || smartReadingsListening
                        ? "not-allowed"
                        : "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity:
                      !browserSupportsSmartReadingsDictation() || smartReadingsListening ? 0.7 : 1,
                  }}
                >
                  {smartReadingsListening ? "Listening..." : "Start Dictation"}
                </button>

                <button
                  type="button"
                  onClick={stopSmartReadingsDictation}
                  disabled={!smartReadingsListening}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: smartReadingsListening ? "pointer" : "not-allowed",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: smartReadingsListening ? 1 : 0.7,
                  }}
                >
                  Stop Dictation
                </button>

                <button
                  type="button"
                  onClick={clearSmartReadingsParser}
                  style={{
                    padding: "8px 12px",
                    fontWeight: 900,
                    border: "1px solid #cfcfcf",
                    borderRadius: 10,
                    background: "#ffffff",
                    color: "#111",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  Clear Parser
                </button>
              </div>

              {!browserSupportsSmartReadingsDictation() ? (
                <SmallHint>
                  Dictation is not supported in this browser. Try Chrome or Edge.
                </SmallHint>
              ) : null}
"""

    source = replace_once(
        source,
        old_buttons,
        new_buttons,
        "smart readings parser buttons",
    )

    backup = PAGE.with_name(PAGE.name + ".smart-readings-mic.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()