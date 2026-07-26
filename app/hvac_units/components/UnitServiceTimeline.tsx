"use client";

import { useState } from "react";
import { SmallHint } from "./SmallHint";

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
  const [componentFilter, setComponentFilter] = useState("all");

  return (
    <>
      <SmallHint>
        Shows prior service events for the currently loaded unit.
      </SmallHint>

      {loading ? (
        <div style={{ marginTop: 12 }}>
          <SmallHint>Loading service timeline...</SmallHint>
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
                    <span style={{ fontWeight: 900 }}>Filter Timeline by Component</span>
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
                          : "Unknown service date"}
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <SmallHint><b>Symptom:</b> {event.symptom || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Diagnosis:</b> {event.diagnosis_summary || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Confirmed Cause:</b> {event.final_confirmed_cause || "-"}</SmallHint>
                      </div>

                      {getComponentDisplayForEvent(event) ? (
                        <div style={{ marginTop: 4 }}>
                          <SmallHint>
                            <b>Affected Component:</b> {getComponentDisplayForEvent(event)}
                          </SmallHint>
                        </div>
                      ) : null}

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Parts Replaced:</b> {event.parts_replaced || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Actual Fix:</b> {event.actual_fix_performed || "-"}</SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint>
                          <b>Outcome:</b> {event.outcome_status || "-"} • <b>Callback:</b> {event.callback_occurred || "-"}
                        </SmallHint>
                      </div>

                      <div style={{ marginTop: 4 }}>
                        <SmallHint><b>Notes:</b> {event.tech_closeout_notes || "-"}</SmallHint>

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
                            Edit Event
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
                    <SmallHint>No service events match the selected component filter.</SmallHint>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <SmallHint>
            {message || "Load a saved unit to view its service timeline."}
          </SmallHint>
        </div>
      )}
    </>
  );
}
