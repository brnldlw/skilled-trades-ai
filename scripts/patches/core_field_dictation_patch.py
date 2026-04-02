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

    if "core-field-dictation-v1" in source:
        print("Core field dictation patch already applied.")
        return

    helper_block = """      // core-field-dictation-v1
      const [symptomListening, setSymptomListening] = useState(false);
      const [confirmedCauseListening, setConfirmedCauseListening] = useState(false);
      const [actualFixListening, setActualFixListening] = useState(false);

      const [symptomDictationMessage, setSymptomDictationMessage] = useState("");
      const [confirmedCauseDictationMessage, setConfirmedCauseDictationMessage] = useState("");
      const [actualFixDictationMessage, setActualFixDictationMessage] = useState("");

      function browserSupportsFieldDictation() {
        if (typeof window === "undefined") return false;
        const w = window as any;
        return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
      }

      function stopSharedFieldDictationInstance(instanceKey: string) {
        if (typeof window === "undefined") return;
        const w = window as any;
        if (w[instanceKey]) {
          try {
            w[instanceKey].stop();
          } catch (err) {
            console.error("FIELD DICTATION STOP FAILED", err);
          }
          w[instanceKey] = null;
        }
      }

      function startFieldDictation(config: {
        instanceKey: string;
        setListening: (value: boolean) => void;
        setMessage: (value: string) => void;
        getCurrentValue: () => string;
        setValue: (value: string) => void;
        listening: boolean;
        listeningMessage: string;
        successMessage: string;
      }) {
        if (typeof window === "undefined") return;

        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
          config.setMessage("Speech recognition is not supported in this browser. Try Chrome or Edge.");
          return;
        }

        try {
          if (w[config.instanceKey] && config.listening) {
            return;
          }

          const recognition = new SpeechRecognitionCtor();
          w[config.instanceKey] = recognition;

          recognition.lang = "en-US";
          recognition.interimResults = false;
          recognition.continuous = false;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            config.setListening(true);
            config.setMessage(config.listeningMessage);
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
            config.setMessage(config.successMessage);
          };

          recognition.onerror = (event: any) => {
            config.setListening(false);
            w[config.instanceKey] = null;
            config.setMessage(
              event?.error ? `Dictation error: ${String(event.error)}` : "Dictation failed."
            );
          };

          recognition.onend = () => {
            config.setListening(false);
            w[config.instanceKey] = null;
          };

          recognition.start();
        } catch (err) {
          config.setListening(false);
          w[config.instanceKey] = null;
          config.setMessage("Could not start dictation.");
          console.error("FIELD DICTATION START FAILED", err);
        }
      }

      function startSymptomDictation() {
        startFieldDictation({
          instanceKey: "__symptomRecognition",
          setListening: setSymptomListening,
          setMessage: setSymptomDictationMessage,
          getCurrentValue: () => String(symptom || ""),
          setValue: setSymptom,
          listening: symptomListening,
          listeningMessage: "Listening... describe the complaint or symptom.",
          successMessage: "Dictation captured and added to Symptom.",
        });
      }

      function stopSymptomDictation() {
        stopSharedFieldDictationInstance("__symptomRecognition");
        setSymptomListening(false);
      }

      function startConfirmedCauseDictation() {
        startFieldDictation({
          instanceKey: "__confirmedCauseRecognition",
          setListening: setConfirmedCauseListening,
          setMessage: setConfirmedCauseDictationMessage,
          getCurrentValue: () => String(finalConfirmedCause || ""),
          setValue: setFinalConfirmedCause,
          listening: confirmedCauseListening,
          listeningMessage: "Listening... describe the confirmed cause.",
          successMessage: "Dictation captured and added to Confirmed Cause.",
        });
      }

      function stopConfirmedCauseDictation() {
        stopSharedFieldDictationInstance("__confirmedCauseRecognition");
        setConfirmedCauseListening(false);
      }

      function startActualFixDictation() {
        startFieldDictation({
          instanceKey: "__actualFixRecognition",
          setListening: setActualFixListening,
          setMessage: setActualFixDictationMessage,
          getCurrentValue: () => String(actualFixPerformed || ""),
          setValue: setActualFixPerformed,
          listening: actualFixListening,
          listeningMessage: "Listening... describe the repair that was performed.",
          successMessage: "Dictation captured and added to Actual Fix.",
        });
      }

      function stopActualFixDictation() {
        stopSharedFieldDictationInstance("__actualFixRecognition");
        setActualFixListening(false);
      }

"""
    source = insert_before_once(
        source,
        'const [showBulkImportTools, setShowBulkImportTools] = useState(false);',
        helper_block,
        "core field dictation helpers",
    )

    symptom_ui = """

          {/* core-field-dictation-v1-symptom */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startSymptomDictation}
              disabled={!browserSupportsFieldDictation() || symptomListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: symptomListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor: !browserSupportsFieldDictation() || symptomListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !browserSupportsFieldDictation() || symptomListening ? 0.7 : 1,
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

          {!browserSupportsFieldDictation() ? (
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

    confirmed_cause_ui = """

          {/* core-field-dictation-v1-confirmed-cause */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startConfirmedCauseDictation}
              disabled={!browserSupportsFieldDictation() || confirmedCauseListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: confirmedCauseListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor: !browserSupportsFieldDictation() || confirmedCauseListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !browserSupportsFieldDictation() || confirmedCauseListening ? 0.7 : 1,
              }}
            >
              {confirmedCauseListening ? "Listening..." : "Start Confirmed Cause Dictation"}
            </button>

            <button
              type="button"
              onClick={stopConfirmedCauseDictation}
              disabled={!confirmedCauseListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: "#ffffff",
                color: "#111",
                cursor: confirmedCauseListening ? "pointer" : "not-allowed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: confirmedCauseListening ? 1 : 0.7,
              }}
            >
              Stop Dictation
            </button>
          </div>

          {!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {confirmedCauseDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Confirmed Cause Dictation:</b> {confirmedCauseDictationMessage}
            </SmallHint>
          ) : null}
"""

    actual_fix_ui = """

          {/* core-field-dictation-v1-actual-fix */}
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startActualFixDictation}
              disabled={!browserSupportsFieldDictation() || actualFixListening}
              style={{
                padding: "8px 12px",
                fontWeight: 900,
                border: "1px solid #cfcfcf",
                borderRadius: 10,
                background: actualFixListening ? "#f7f7f7" : "#ffffff",
                color: "#111",
                cursor: !browserSupportsFieldDictation() || actualFixListening ? "not-allowed" : "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: !browserSupportsFieldDictation() || actualFixListening ? 0.7 : 1,
              }}
            >
              {actualFixListening ? "Listening..." : "Start Actual Fix Dictation"}
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

          {!browserSupportsFieldDictation() ? (
            <SmallHint style={{ marginTop: 6 }}>
              Dictation is not supported in this browser. Try Chrome or Edge.
            </SmallHint>
          ) : null}

          {actualFixDictationMessage ? (
            <SmallHint style={{ marginTop: 6 }}>
              <b>Actual Fix Dictation:</b> {actualFixDictationMessage}
            </SmallHint>
          ) : null}
"""

    source = insert_after_value_control(
        source,
        'value={symptom}',
        symptom_ui,
        "symptom dictation UI",
    )

    source = insert_after_value_control(
        source,
        'value={finalConfirmedCause}',
        confirmed_cause_ui,
        "confirmed cause dictation UI",
    )

    source = insert_after_value_control(
        source,
        'value={actualFixPerformed}',
        actual_fix_ui,
        "actual fix dictation UI",
    )

    backup = PAGE.with_name(PAGE.name + ".core-field-dictation.bak")
    shutil.copy2(PAGE, backup)
    PAGE.write_text(source, encoding="utf-8")

    print(f"Patched {PAGE}")
    print(f"Backup written to {backup}")


if __name__ == "__main__":
    main()
