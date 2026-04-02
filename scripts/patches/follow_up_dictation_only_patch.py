from __future__ import annotations

import shutil
from pathlib import Path

PAGE = Path("app/hvac_units/page.tsx")


def insert_before_once(source: str, anchor: str, block: str, label: str) -> str:
    idx = source.find(anchor)
    if idx == -1:
        raise RuntimeError(f"Could not find expected anchor for: {label}")
    return source[:idx] + block + source[idx:]


def insert_after_value_control(source: str, value_marker: str, block: str, label: str) -> str:
    idx = source.find(value_marker)
    if idx == -1:
        raise RuntimeError(f"Could not find value marker for: {label}")

    textarea_close = source.find("</textarea>", idx)
    self_close = source.find("/>", idx)

    candidates = [x for x in (textarea_close, self_close) if x != -1]
    if not candidates:
        raise RuntimeError(f"Could not find control end for: {label}")

    close_idx = min(candidates)
    insert_at = close_idx + (len("</textarea>") if close_idx == textarea_close else len("/>"))
    return source[:insert_at] + block + source[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "follow-up-dictation-only-v1" in source:
        print("Follow-Up Recommendation dictation patch already applied.")
        return

    helper_block = """      // follow-up-dictation-only-v1
      const [followUpListening, setFollowUpListening] = useState(false);
      const [followUpDictationMessage, setFollowUpDictationMessage] = useState("");

      function browserSupportsFollowUpDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function startFollowUpDictation() {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setFollowUpDictationMessage(
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__followUpRecognition && followUpListening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w.__followUpRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setFollowUpListening(true);
            setFollowUpDictationMessage(
              "Listening... describe the recommended follow-up."
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

            setDiagnosticCloseoutDrafts((prev) => ({
              ...prev,
              followUp: [String(prev.followUp || "").trim(), cleaned].filter(Boolean).join("\\n"),
            }));
            setFollowUpDictationMessage(
              "Dictation captured and added to Recommended Follow-Up."
            );
          };

          recognition.onerror = (event: any) => {
            setFollowUpListening(false);
            w.__followUpRecognition = null;
            setFollowUpDictationMessage(
              event?.error ? `Dictation error: ${String(event.error)}` : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setFollowUpListening(false);
            w.__followUpRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setFollowUpListening(false);
          w.__followUpRecognition = null;
          setFollowUpDictationMessage("Could not start dictation.");
          console.error("FOLLOW-UP DICTATION FAILED", err);
        }
      }

      function stopFollowUpDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__followUpRecognition) {
          try {
            w.__followUpRecognition.stop();
          } catch (err) {
            console.error("FOLLOW-UP DICTATION STOP FAILED", err);
          }
          w.__followUpRecognition = null;
        }
        setFollowUpListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "follow-up dictation helpers",
    )

    ui_block = """

                {/* follow-up-dictation-only-v1 */}
                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={startFollowUpDictation}
                    disabled={!browserSupportsFollowUpDictation() || followUpListening}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: followUpListening ? "#f7f7f7" : "#ffffff",
                      color: "#111",
                      cursor:
                        !browserSupportsFollowUpDictation() || followUpListening
                          ? "not-allowed"
                          : "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity:
                        !browserSupportsFollowUpDictation() || followUpListening ? 0.7 : 1,
                    }}
                  >
                    {followUpListening ? "Listening..." : "Start Follow-Up Dictation"}
                  </button>

                  <button
                    type="button"
                    onClick={stopFollowUpDictation}
                    disabled={!followUpListening}
                    style={{
                      padding: "8px 12px",
                      fontWeight: 900,
                      border: "1px solid #cfcfcf",
                      borderRadius: 10,
                      background: "#ffffff",
                      color: "#111",
                      cursor: followUpListening ? "pointer" : "not-allowed",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      opacity: followUpListening ? 1 : 0.7,
                    }}
                  >
                    Stop Dictation
                  </button>
                </div>

                {!browserSupportsFollowUpDictation() ? (
                  <SmallHint style={{ marginTop: 6 }}>
                    Dictation is not supported in this browser. Try Chrome or Edge.
                  </SmallHint>
                ) : null}

                {followUpDictationMessage ? (
                  <SmallHint style={{ marginTop: 6 }}>
                    <b>Follow-Up Dictation:</b> {followUpDictationMessage}
                  </SmallHint>
                ) : null}
"""
    source = insert_after_value_control(
        source,
        'value={diagnosticCloseoutDrafts.followUp}',
        ui_block,
        "follow-up dictation UI",
    )

    backup = PAGE.with_name(PAGE.name + ".follow-up-dictation-only-v1.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
