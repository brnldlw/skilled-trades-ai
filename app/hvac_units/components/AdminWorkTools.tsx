"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import {
  createServiceEventForCurrentUser,
  createUnitForCurrentUser,
  findStrongUnitMatchForCurrentUser,
} from "../../lib/supabase/work-orders";
import { makeId } from "../lib/fileHelpers";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

function parseSimpleCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });

    return row;
  });
}

const btnStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontWeight: 900,
  border: "1px solid #cfcfcf",
  borderRadius: 10,
  background: "#ffffff",
  color: "#111",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

export function AdminWorkTools() {
  const { lang } = useLang();
  const [showBulkImportTools, setShowBulkImportTools] = useState(false);
  const [workOrderImportText, setWorkOrderImportText] = useState("");
  const [workOrderImportRows, setWorkOrderImportRows] = useState<Record<string, string>[]>([]);
  const [workOrderImportLoading, setWorkOrderImportLoading] = useState(false);
  const [workOrderImportMessage, setWorkOrderImportMessage] = useState("");
  const [workOrderImportResults, setWorkOrderImportResults] = useState<
    { rowNumber: number; action: string; unitId: string }[]
  >([]);

  function previewWorkOrderImport() {
    try {
      const rows = parseSimpleCsv(workOrderImportText);
      setWorkOrderImportRows(rows);
      setWorkOrderImportResults([]);
      setWorkOrderImportMessage(
        rows.length
          ? t("awt_parsed_rows", lang).replace("{count}", String(rows.length))
          : t("awt_no_valid_rows", lang)
      );
    } catch {
      setWorkOrderImportRows([]);
      setWorkOrderImportResults([]);
      setWorkOrderImportMessage(t("awt_csv_parse_failed", lang));
    }
  }

  async function importWorkOrderRows() {
    if (!workOrderImportRows.length) {
      setWorkOrderImportMessage(t("awt_nothing_to_import", lang));
      return;
    }

    setWorkOrderImportLoading(true);
    setWorkOrderImportMessage("");
    setWorkOrderImportResults([]);

    try {
      const results: { rowNumber: number; action: string; unitId: string }[] = [];

      for (let i = 0; i < workOrderImportRows.length; i++) {
        const row = workOrderImportRows[i];

        let matchedUnit = await findStrongUnitMatchForCurrentUser({
          customer_name: row.customer_name || "",
          site_name: row.site_name || "",
          unit_nickname: row.unit_nickname || "",
          serial: row.serial || "",
        });

        let action = "matched-existing-unit";

        if (!matchedUnit) {
          matchedUnit = await createUnitForCurrentUser({
            id: makeId(),
            customer_name: row.customer_name || "",
            site_name: row.site_name || "",
            site_address: row.site_address || "",
            unit_nickname: row.unit_nickname || "",
            property_type: row.property_type || "",
            equipment_type: row.equipment_type || "",
            manufacturer: row.manufacturer || "",
            model: row.model || "",
            serial: row.serial || "",
            refrigerant_type: row.refrigerant_type || "",
          });

          action = "created-new-unit";
        }

        await createServiceEventForCurrentUser({
          id: makeId(),
          unit_id: matchedUnit.id,
          service_date: row.service_date || null,
          symptom: row.symptom || "",
          diagnosis_summary: row.diagnosis_summary || "",
          final_confirmed_cause: row.final_confirmed_cause || "",
          parts_replaced: row.parts_replaced || "",
          actual_fix_performed: row.actual_fix_performed || "",
          outcome_status: row.outcome_status || "",
          callback_occurred: row.callback_occurred || "",
          tech_closeout_notes: row.tech_closeout_notes || "",
        });

        results.push({
          rowNumber: i + 1,
          action,
          unitId: matchedUnit.id,
        });
      }

      setWorkOrderImportResults(results);
      setWorkOrderImportMessage(t("awt_imported_count", lang).replace("{count}", String(results.length)));
      setWorkOrderImportText("");
      setWorkOrderImportRows([]);
    } catch (err) {
      console.error(err);
      setWorkOrderImportMessage(t("awt_import_failed", lang));
    } finally {
      setWorkOrderImportLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setShowBulkImportTools((v) => !v)} style={btnStyle}>
        {showBulkImportTools ? t("btn_hide_bulk_import", lang) : t("btn_show_bulk_import", lang)}
      </button>

      {showBulkImportTools ? (
        <div style={{ marginTop: 12 }}>
          <SmallHint>
            {t("awt_csv_hint", lang)}
          </SmallHint>

          <div style={{ marginTop: 12 }}>
            <textarea
              value={workOrderImportText}
              onChange={(e) => setWorkOrderImportText(e.target.value)}
              placeholder={t("awt_csv_placeholder", lang)}
              style={{ width: "100%", minHeight: 180, padding: 10 }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={previewWorkOrderImport} style={btnStyle}>
              {t("btn_preview_import", lang)}
            </button>

            <button
              onClick={importWorkOrderRows}
              disabled={workOrderImportLoading || !workOrderImportRows.length}
              style={btnStyle}
            >
              {workOrderImportLoading ? t("btn_importing", lang) : t("btn_import_rows", lang)}
            </button>
          </div>

          {workOrderImportMessage ? (
            <div style={{ marginTop: 12 }}>
              <SmallHint>{workOrderImportMessage}</SmallHint>
            </div>
          ) : null}

          {workOrderImportRows.length ? (
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {Object.keys(workOrderImportRows[0]).map((key) => (
                      <th
                        key={key}
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #ddd",
                          padding: 8,
                          fontSize: 12,
                        }}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workOrderImportRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(workOrderImportRows[0]).map((key) => (
                        <td
                          key={key}
                          style={{
                            borderBottom: "1px solid #f0f0f0",
                            padding: 8,
                            fontSize: 12,
                          }}
                        >
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <SmallHint style={{ marginTop: 8 }}>
                {t("awt_showing_rows", lang)
                  .replace("{count}", String(Math.min(10, workOrderImportRows.length)))
                  .replace("{total}", String(workOrderImportRows.length))}
              </SmallHint>
            </div>
          ) : null}

          {workOrderImportResults.length ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>{t("awt_import_results", lang)}</div>
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {workOrderImportResults.map((item, idx) => (
                  <li key={idx}>
                    <SmallHint>
                      {t("awt_row_label", lang)
                        .replace("{number}", String(item.rowNumber))
                        .replace("{action}", item.action === "created-new-unit" ? t("awt_action_created", lang) : item.action === "matched-existing-unit" ? t("awt_action_matched", lang) : item.action)
                        .replace("{unitId}", item.unitId)}
                    </SmallHint>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <SmallHint style={{ marginTop: 12 }}>
          {t("awt_hidden_by_default", lang)}
        </SmallHint>
      )}
    </>
  );
}
