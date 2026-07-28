"use client";

import { useMemo, useState } from "react";
import { SmallHint } from "./SmallHint";
import { Badge } from "./Badge";
import { PillButton } from "./PillButton";
import type { SavedUnitRecord } from "../../lib/unit-store";
import { useLang } from "../../components/LanguageContext";
import { t } from "../../lib/translations";

export function SavedUnitHistory({
  savedUnits,
  onLoadUnit,
  onRemoveUnit,
}: {
  savedUnits: SavedUnitRecord[];
  onLoadUnit: (record: SavedUnitRecord) => void;
  onRemoveUnit: (id: string) => void;
}) {
  const { lang } = useLang();
  const [historyFilter, setHistoryFilter] = useState("");

  const filteredSavedUnits = useMemo(() => {
    const q = historyFilter.trim().toLowerCase();
    if (!q) return savedUnits;
    return savedUnits.filter((u) =>
      [
        u.customerName,
        u.siteName,
        u.siteAddress,
        u.unitNickname,
        u.manufacturer,
        u.model,
        u.symptom,
        u.equipmentType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [savedUnits, historyFilter]);

  return (
    <>
      <input
        value={historyFilter}
        onChange={(e) => setHistoryFilter(e.target.value)}
        placeholder={t("suh_search_placeholder", lang)}
        style={{ width: "100%", padding: 8 }}
      />

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gap: 8,
          maxHeight: 320,
          overflow: "auto",
        }}
      >
        {filteredSavedUnits.length ? (
          filteredSavedUnits.map((u) => (
            <div
              key={u.id}
              style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}
            >
              <div style={{ fontWeight: 900 }}>
                {u.customerName || t("suh_no_customer", lang)}
                {u.companyName ? <Badge text={u.companyName} /> : null}
                {u.unitNickname ? <Badge text={u.unitNickname} /> : null}
              </div>
              <SmallHint style={{ marginTop: 4 }}>
                {u.siteName || "-"} • {u.manufacturer || "-"} {u.model || "-"} •{" "}
                {u.equipmentType || "-"}
              </SmallHint>
              <SmallHint style={{ marginTop: 4 }}>
                {t("suh_saved_colon", lang)} {new Date(u.savedAt).toLocaleString()}
              </SmallHint>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                <PillButton text={t("btn_load", lang)} onClick={() => onLoadUnit(u)} />
                <PillButton text={t("btn_delete", lang)} onClick={() => onRemoveUnit(u.id)} />
              </div>
            </div>
          ))
        ) : (
          <SmallHint>{t("suh_no_saved_units", lang)}</SmallHint>
        )}
      </div>
    </>
  );
}
