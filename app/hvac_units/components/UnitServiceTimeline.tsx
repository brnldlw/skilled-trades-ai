"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

type ServiceEvent = {
  id?: string;
  service_date?: string | null;
  symptom?: string | null;
  diagnosis_summary?: string | null;
  final_confirmed_cause?: string | null;
  parts_replaced?: string | null;
  actual_fix_performed?: string | null;
  outcome_status?: string | null;
  callback_occurred?: string | null;
  tech_closeout_notes?: string | null;
};

export function UnitServiceTimeline({
  loading,
  events,
  message,
  getComponentFilterOptions,
  eventMatchesComponentFilter,
  getComponentDisplayForEvent,
  onEditEvent,
}: {
  loading: boolean;
  events: ServiceEvent[];
  message: string;
  getComponentFilterOptions: (events: ServiceEvent[]) => Array<{ value: string; label: string }>;
  eventMatchesComponentFilter: (event: ServiceEvent, filterValue: string) => boolean;
  getComponentDisplayForEvent: (event: ServiceEvent) => string;
  onEditEvent: (event: ServiceEvent) => void;
}) {
  const { lang } = useLang();
  const [componentFilter, setComponentFilter] = useState("all");

  return (
    <>
      <SmallHint>
        {t("ust_shows_prior_events", lang)}
      </SmallHint>

      {loading ? (
        <div style={{ marginTop: 12 }}>
          <SmallHint>{t("ust_loading_timeline", lang)}</SmallHint>
        </div>
      ) : events.length ? (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {(() => {
            const options = getComponentFilterOptions(events);
            const activeFilter = options.some((option) => option.value === componentFilter)
              ? componentFilter
              : "all";
            const filteredEvents = events.filter((event) =>
              eventMatchesComponentFilter(event, activeFilter)
            );

            return (
              <>
                <div style={{ marginBottom: 10, display: "grid", gap: 6 }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 900 }}>{t("ust_filter_by_component", lang)}</span>
                    <select
                      value={activeFilter}
                      onChange={(e) => setComponentFilter(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    >
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {filteredEvents.length ? (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {event.service_date
                          ? new Date(event.service_date).toLocaleDateString()
                          : t("ust_unknown_service_date", lang)}
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <SmallHint><b>{t("label_symptom_colon", lang)}</b> {event.symptom || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>{t("label_diagnosis_colon", lang)}</b> {event.diagnosis_summary || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>{t("label_confirmed_cause_colon", lang)}</b> {event.final_confirmed_cause || "-"}</SmallHint>
                      </div>

                      {getComponentDisplayForEvent(event) ? (
                        <div style={{ marginTop: 4 }}>
                          <SmallHint>
                            <b>{t("label_affected_component_colon", lang)}</b> {getComponentDisplayForEvent(event)}
                          </SmallHint>
                        </div>
                      ) : null}

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>{t("label_parts_replaced_colon", lang)}</b> {event.parts_replaced || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>{t("label_actual_fix_colon", lang)}</b> {event.actual_fix_performed || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint>
                          <b>{t("label_outcome_colon", lang)}</b> {event.outcome_status || "-"} • <b>{t("label_callback_colon", lang)}</b> {event.callback_occurred || "-"}
                        </SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>{t("label_notes_colon", lang)}</b> {event.tech_closeout_notes || "-"}</SmallHint>

                        <div style={{ marginTop: 8 }}>
                          <button
                            onClick={() => onEditEvent(event)}
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
                            {t("btn_edit_event", lang)}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fafafa",
                    }}
                  >
                    <SmallHint>{t("ust_no_events_match_filter", lang)}</SmallHint>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <SmallHint>
            {message || t("ust_load_unit_hint", lang)}
          </SmallHint>
        </div>
      )}
    </>
  );
}
