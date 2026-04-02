from __future__ import annotations

import re
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

    candidates = [x for x in [textarea_close, self_close] if x != -1]
    if not candidates:
        raise RuntimeError(f"Could not find control end for: {label}")

    close_idx = min(candidates)
    if close_idx == textarea_close:
        insert_at = close_idx + len("</textarea>")
    else:
        insert_at = close_idx + len("/>")

    return source[:insert_at] + block + source[insert_at:]


def main() -> None:
    if not PAGE.exists():
        raise FileNotFoundError(f"Missing file: {PAGE}")

    source = PAGE.read_text(encoding="utf-8")

    if "reusable-field-dictation-v1" in source:
        print("Reusable dictation helper patch already applied.")
        return

    helper_block = """      // reusable-field-dictation-v1
      const [sharedTextDictationActiveField, setSharedTextDictationActiveField] = useState("");
      const [sharedTextDictationMessages, setSharedTextDictationMessages] = useState<Record<string, string>>({
        techCloseoutNotes: "",
        partsReplaced: "",
        followUp: "",
      });

      function browserSupportsSharedTextDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function setSharedTextDictationFieldMessage(fieldKey: string, message: string) {
        setSharedTextDictationMessages((prev) => ({
          ...prev,
          [fieldKey]: message,
        }));
      }

      function stopSharedTextDictation() {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w.__sharedTextFieldRecognition) {
          try {
            w.__sharedTextFieldRecognition.stop();
          } catch (err) {
            console.error("SHARED TEXT DICTATION STOP FAILED", err);
          }
          w.__sharedTextFieldRecognition = null;
        }
        setSharedTextDictationActiveField("");
      }

      function startSharedTextDictation(config: {
        fieldKey: string;
        listeningMessage: string;
        successMessage: string;
        getCurrentValue: () => string;
        setValue: (value: string) => void;
      }) {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          setSharedTextDictationFieldMessage(
            config.fieldKey,
            "Speech recognition is not supported in this browser. Try Chrome or Edge."
          );
          return;
        }

        try {
          if (w.__sharedTextFieldRecognition) {
            stopSharedTextDictation();
          }

          const recognition = new SpeechRecognitionCtor();
          w.__sharedTextFieldRecognition = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setSharedTextDictationActiveField(config.fieldKey);
            setSharedTextDictationFieldMessage(config.fieldKey, config.listeningMessage);
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

            config.setValue(
              [String(config.getCurrentValue() || "").trim(), cleaned].filter(Boolean).join(" ")
            );
            setSharedTextDictationFieldMessage(config.fieldKey, config.successMessage);
          };

          recognition.onerror = (event: any) => {
            setSharedTextDictationActiveField("");
            w.__sharedTextFieldRecognition = null;
            setSharedTextDictationFieldMessage(
              config.fieldKey,
              event?.error ? `Dictation error: ${String(event.error)}` : "Dictation failed."
            );
          };

          recognition.onend = () => {
            setSharedTextDictationActiveField("");
            w.__sharedTextFieldRecognition = null;
          };

          recognition.start();
        } catch (err) {
          setSharedTextDictationActiveField("");
          w.__sharedTextFieldRecognition = null;
          setSharedTextDictationFieldMessage(config.fieldKey, "Could not start dictation.");
          console.error("SHARED TEXT DICTATION START FAILED", err);
        }
      }

      function renderSharedTextDictationControls(config: {
        fieldKey: string;
        startLabel: string;
        messageLabel: string;
        listeningMessage: string;
        successMessage: string;
        getCurrentValue: () => string;
        setValue: (value: string) => void;
      }) {
        const active = sharedTextDictationActiveField === config.fieldKey;
        const message = sharedTextDictationMessages[config.fieldKey] || "";

        return (
          <>
            <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() =>
                  startSharedTextDictation({
                    fieldKey: config.fieldKey,
                    listeningMessage: config.listeningMessage,
                    successMessage: config.successMessage,
                    getCurrentValue: config.getCurrentValue,
                    setValue: config.setValue,
                  })
                }
                disabled={!browserSupportsSharedTextDictation() || active}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: active ? "#f7f7f7" : "#ffffff",
                  color: "#111",
                  cursor: !browserSupportsSharedTextDictation() || active ? "not-allowed" : "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  opacity: !browserSupportsSharedTextDictation() || active ? 0.7 : 1,
                }}
              >
                {active ? "Listening..." : config.startLabel}
              </button>

              <button
                type="button"
                onClick={stopSharedTextDictation}
                disabled={!active}
                style={{
                  padding: "8px 12px",
                  fontWeight: 900,
                  border: "1px solid #cfcfcf",
                  borderRadius: 10,
                  background: "#ffffff",
                  color: "#111",
                  cursor: active ? "pointer" : "not-allowed",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  opacity: active ? 1 : 0.7,
                }}
              >
                Stop Dictation
              </button>
            </div>

            {!browserSupportsSharedTextDictation() ? (
              <SmallHint style={{ marginTop: 6 }}>
                Dictation is not supported in this browser. Try Chrome or Edge.
              </SmallHint>
            ) : null}

            {message ? (
              <SmallHint style={{ marginTop: 6 }}>
                <b>{config.messageLabel}:</b> {message}
              </SmallHint>
            ) : null}
          </>
        );
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "reusable dictation helper insert",
    )

    # Remove old one-off Tech Closeout Notes dictation UI if it exists.
    source = re.sub(
        r'\n\s*\{/\*\s*closeout-note-dictation-v1\s*\*/.*?\{techCloseoutDictationMessage \? \(\s*<SmallHint style=\{\{ marginTop: 6 \}\}>\s*<b>Dictation:</b> \{techCloseoutDictationMessage\}\s*</SmallHint>\s*\) : null\}\n',
        "\n",
        source,
        flags=re.DOTALL,
    )

    tech_notes_ui = """

          {/* reusable-field-dictation-v1-tech-notes */}
          {renderSharedTextDictationControls({
            fieldKey: "techCloseoutNotes",
            startLabel: "Start Tech Notes Dictation",
            messageLabel: "Tech Notes Dictation",
            listeningMessage: "Listening... describe your closeout notes.",
            successMessage: "Dictation captured and added to Tech Closeout Notes.",
            getCurrentValue: () => String(techCloseoutNotes || ""),
            setValue: setTechCloseoutNotes,
          })}
"""

    parts_replaced_ui = """

          {/* reusable-field-dictation-v1-parts-replaced */}
          {renderSharedTextDictationControls({
            fieldKey: "partsReplaced",
            startLabel: "Start Parts Replaced Dictation",
            messageLabel: "Parts Replaced Dictation",
            listeningMessage: "Listening... name the parts that were replaced.",
            successMessage: "Dictation captured and added to Parts Replaced.",
            getCurrentValue: () => String(partsReplaced || ""),
            setValue: setPartsReplaced,
          })}
"""

    follow_up_ui = """

                {/* reusable-field-dictation-v1-follow-up */}
                {renderSharedTextDictationControls({
                  fieldKey: "followUp",
                  startLabel: "Start Follow-Up Dictation",
                  messageLabel: "Follow-Up Dictation",
                  listeningMessage: "Listening... describe the recommended follow-up.",
                  successMessage: "Dictation captured and added to Recommended Follow-Up.",
                  getCurrentValue: () => String(diagnosticCloseoutDrafts.followUp || ""),
                  setValue: (value: string) =>
                    setDiagnosticCloseoutDrafts((prev) => ({
                      ...prev,
                      followUp: value,
                    })),
                })}
"""

    source = insert_after_value_control(
        source,
        'value={techCloseoutNotes}',
        tech_notes_ui,
        "tech closeout notes shared dictation UI",
    )

    source = insert_after_value_control(
        source,
        'value={partsReplaced}',
        parts_replaced_ui,
        "parts replaced shared dictation UI",
    )

    source = insert_after_value_control(
        source,
        'value={diagnosticCloseoutDrafts.followUp}',
        follow_up_ui,
        "follow-up shared dictation UI",
    )

    backup = PAGE.with_name(PAGE.name + ".reusable-dictation-helper-and-fields.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
