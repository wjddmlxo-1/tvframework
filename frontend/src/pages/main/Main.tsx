import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";
import { SERVER_URL } from "@/config";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CMMN_MAIN_HOME_I18N_KEYS,
  CMMN_MAIN_HOME_I18N_FALLBACK,
  replaceI18nPlaceholders,
} from "@/pages/main/cmmnMainHomeI18n";
import { getLanguageCodeForApi } from "@/utils/language";
import initPage from "@/js/ui";
import { getSessionItem } from "@/utils/storage";
import { decodeHtmlEntities } from "@/utils/htmlDecode";
import {
  applyWidgetPreviewTokens,
  buildCssFromBasic,
  buildWidgetStylePreviewSrcDoc,
  ensureChartPreviewCardShell,
  isChartStyleTypeForPreview,
  replaceChartPreviewJsTokens,
  shouldAggregateWidgetPreviewJsAcrossRows,
  splitBasicModeCssStored,
  tryParseBasicStyleFromCss,
  type BasicStyle,
} from "@/utils/widgetStylePreviewTokens";

/** 화면 분할: 좌우 / 상하 / ㅠ / 역ㅠ / 2×2 / 3×2 / 3×3 */
type LayoutKind = "split-v" | "split-h" | "split-t" | "split-t-inv" | "grid-2x2" | "grid-3x2" | "grid-3x3";

type SlotEntry = {
  slotId: string;
  instanceId: string;
  widgetId: string;
};

type LayoutModel = {
  kind: LayoutKind;
  slots: SlotEntry[];
};

type GalleryRow = {
  widgetId: string;
  widgetName: string;
  fileSq?: string;
  categoryCd?: string;
  datasetId?: string;
  styleId?: string;
  mappingJson?: string;
  configJson?: string;
};

type CodeOpt = { code: string; name: string };

type DashRow = {
  dashbrdId?: string;
  layoutJson?: string;
  configJson?: string;
};

const MAIN_DASHBOARD_API = "/mainDashboard";

/** 3열×2행 슬롯 ID: 행 0~1, 열 0~2 (예: "00") */
const SLOT_IDS_GRID_3X2 = Array.from({ length: 6 }, (_, i) => `${Math.floor(i / 3)}${i % 3}`);
/** 3×3 슬롯 ID: 행·열 0~2 */
const SLOT_IDS_GRID_3X3 = Array.from({ length: 9 }, (_, i) => `${Math.floor(i / 3)}${i % 3}`);

const SLOT_IDS: Record<LayoutKind, string[]> = {
  "split-v": ["L", "R"],
  "split-h": ["T", "B"],
  "split-t": ["TL", "TR", "B"],
  "split-t-inv": ["T", "BL", "BR"],
  "grid-2x2": ["A", "B", "C", "D"],
  "grid-3x2": SLOT_IDS_GRID_3X2,
  "grid-3x3": SLOT_IDS_GRID_3X3,
};

function slotCount(kind: LayoutKind): number {
  return SLOT_IDS[kind].length;
}

function normalizeGalleryRows(raw: unknown): GalleryRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: Record<string, unknown>) => {
      const widgetId = String(item.widgetId ?? item.widget_id ?? "").trim();
      const widgetName = String(item.widgetName ?? item.widget_name ?? widgetId).trim();
      const fileSqRaw = item.fileSq ?? item.file_sq;
      const fileSq = fileSqRaw != null && String(fileSqRaw).trim() !== "" ? String(fileSqRaw) : undefined;
      return {
        widgetId,
        widgetName,
        fileSq,
        categoryCd: item.categoryCd != null ? String(item.categoryCd) : undefined,
        datasetId: item.datasetId != null ? String(item.datasetId).trim() : undefined,
        styleId: item.styleId != null ? String(item.styleId).trim() : undefined,
        mappingJson: item.mappingJson != null ? String(item.mappingJson) : undefined,
        configJson: item.configJson != null ? String(item.configJson) : undefined,
      };
    })
    .filter((r) => r.widgetId);
}

const DEFAULT_BASIC_PREVIEW: BasicStyle = {
  background: "#ffffff",
  borderColor: "#334155",
  titleColor: "#0f172a",
  borderWidth: 1,
  borderRadius: 8,
  boxShadow: "Y",
  header: "Y",
  headerBackground: "#f1f5f9",
  headerHeight: 40,
};

function escapeHtmlPlain(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmptyWidgetPreviewDoc(message: string): string {
  return buildWidgetStylePreviewSrcDoc(
    `<div class="wgs-card"><div class="wgs-body"><div class="wgs-data">${escapeHtmlPlain(message)}</div></div></div>`,
    buildCssFromBasic(DEFAULT_BASIC_PREVIEW)
  );
}

function hasWidgetStyleTokens(s: string): boolean {
  return String(s || "").includes("{{WGS_");
}

function normalizeTemplateFromApi(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "";
  const s = String(raw);
  const decoded = decodeHtmlEntities(s);
  return decoded != null && decoded.trim() !== "" ? decoded : s;
}

function normalizeHtmlTemplateFromApi(raw: string | undefined | null): string {
  const n = normalizeTemplateFromApi(raw);
  if (!n) return "";
  let out = n.replace(/\\"/g, '"').replace(/\\'/g, "'");
  if (!/^\s*</.test(out) && /^\s*[a-z][\w:-]*\s+[^>]*>/i.test(out)) {
    out = out.replace(/^(\s*)([a-z][\w:-]*\s+[^>]*>)/i, "$1<$2");
  }
  return out;
}

function parseMappingDataList(raw: string | undefined): Record<string, string> {
  try {
    const o = JSON.parse(normalizeTemplateFromApi(raw) || "{}") as { dataList?: unknown };
    const dl = o.dataList;
    if (!dl || typeof dl !== "object" || Array.isArray(dl)) return {};
    const out: Record<string, string> = {};
    Object.entries(dl as Record<string, unknown>).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    });
    return out;
  } catch {
    return {};
  }
}

type WidgetLangMapEntry = {
  langKey: string;
  displayMessage: string;
  messages?: Record<string, string>;
  phrases?: Record<string, WidgetLangMapEntry>;
};

function normalizeJsonFromApi(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "{}";
  const s = String(raw);
  const decoded = decodeHtmlEntities(s);
  return decoded != null && decoded.trim() !== "" ? decoded : s;
}

function normalizeLangCodeForCompare(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toLowerCase();
}

function messageForActiveLang(messages: Record<string, string> | undefined, langGb: string): string | undefined {
  if (!messages || Object.keys(messages).length === 0) return undefined;
  const raw = String(langGb || "").trim();
  const candidates: string[] = [];
  if (raw) candidates.push(raw, raw.replace(/-/g, "_"));
  for (const cand of candidates) {
    const v = messages[cand];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  const targetNorm = normalizeLangCodeForCompare(raw);
  for (const [k, v] of Object.entries(messages)) {
    if (normalizeLangCodeForCompare(k) === targetNorm && String(v).trim() !== "") return String(v);
  }
  const head = targetNorm.split("_")[0];
  if (head && head.length >= 2) {
    for (const [k, v] of Object.entries(messages)) {
      const kn = normalizeLangCodeForCompare(k);
      if ((kn === head || kn.startsWith(`${head}_`)) && String(v).trim() !== "") return String(v);
    }
  }
  return undefined;
}

function parseMappingLangList(raw: string | undefined): Record<string, WidgetLangMapEntry> {
  try {
    const o = JSON.parse(normalizeTemplateFromApi(raw) || "{}") as { langList?: unknown };
    const ll = o.langList;
    if (!ll || typeof ll !== "object" || Array.isArray(ll)) return {};
    const out: Record<string, WidgetLangMapEntry> = {};
    Object.entries(ll as Record<string, unknown>).forEach(([k, v]) => {
      if (typeof v === "string") {
        const s = v.trim();
        if (s) out[k] = { langKey: s, displayMessage: s };
        return;
      }
      if (!v || typeof v !== "object" || Array.isArray(v)) return;
      const e = v as Record<string, unknown>;
      const langKey = String(e.langKey ?? "").trim();
      if (!langKey) return;
      let messages: Record<string, string> | undefined;
      if (e.messages && typeof e.messages === "object" && !Array.isArray(e.messages)) {
        messages = {};
        Object.entries(e.messages as Record<string, unknown>).forEach(([lc, t]) => {
          if (typeof t === "string" && t) messages![lc] = t;
        });
        if (Object.keys(messages).length === 0) messages = undefined;
      }
      const dataCol = String(e.dataColumn ?? "").trim();
      const columnKey = dataCol || k;
      let phrases: Record<string, WidgetLangMapEntry> | undefined;
      const phRaw = e.phrases;
      if (phRaw && typeof phRaw === "object" && !Array.isArray(phRaw)) {
        phrases = {};
        Object.entries(phRaw as Record<string, unknown>).forEach(([pk, pv]) => {
          if (!pv || typeof pv !== "object" || Array.isArray(pv)) return;
          const pe = pv as Record<string, unknown>;
          const pkLang = String(pe.langKey ?? "").trim();
          if (!pkLang) return;
          let pm: Record<string, string> | undefined;
          if (pe.messages && typeof pe.messages === "object" && !Array.isArray(pe.messages)) {
            pm = {};
            Object.entries(pe.messages as Record<string, unknown>).forEach(([lc, t]) => {
              if (typeof t === "string" && t) pm![lc] = t;
            });
            if (Object.keys(pm).length === 0) pm = undefined;
          }
          phrases![pk] = {
            langKey: pkLang,
            displayMessage: String(pe.displayMessage ?? pkLang),
            ...(pm ? { messages: pm } : {}),
          };
        });
        if (Object.keys(phrases).length === 0) phrases = undefined;
      }
      out[columnKey] = {
        langKey,
        displayMessage: String(e.displayMessage ?? langKey),
        ...(messages ? { messages } : {}),
        ...(phrases ? { phrases } : {}),
      };
    });
    return out;
  } catch {
    return {};
  }
}

function resolveMappedColumnHeaderPreviewText(
  columnNameFallback: unknown,
  langEntry: WidgetLangMapEntry | undefined,
  activeLangGb: string
): string {
  if (!langEntry) return String(columnNameFallback ?? "");
  const localized = messageForActiveLang(langEntry.messages, activeLangGb);
  if (localized !== undefined) return localized;
  const dm = langEntry.displayMessage?.trim();
  if (dm) return dm;
  return String(columnNameFallback ?? "");
}

function resolveCellValuePreviewText(
  rawText: unknown,
  langEntry: WidgetLangMapEntry | undefined,
  activeLangGb: string
): string {
  const raw = String(rawText ?? "");
  if (!langEntry) return raw;
  const ph = langEntry.phrases;
  if (ph && Object.keys(ph).length > 0) {
    let s = raw;
    const keys = Object.keys(ph).sort((a, b) => b.length - a.length);
    keys.forEach((key) => {
      if (!key || s.indexOf(key) < 0) return;
      const localized = resolveMappedColumnHeaderPreviewText(key, ph[key], activeLangGb);
      if (localized !== key) s = s.split(key).join(localized);
    });
    return s;
  }
  return resolveMappedColumnHeaderPreviewText(raw, langEntry, activeLangGb);
}

function applyLocalizedPhrasesToTemplate(
  template: string,
  langMap: Record<string, WidgetLangMapEntry>,
  activeLangGb: string
): string {
  let out = String(template || "");
  const pairs: Array<{ key: string; value: string }> = [];
  Object.values(langMap).forEach((entry) => {
    const ph = entry.phrases;
    if (!ph) return;
    Object.entries(ph).forEach(([rawPhrase, pe]) => {
      const key = String(rawPhrase || "");
      if (!key) return;
      const value = resolveMappedColumnHeaderPreviewText(key, pe, activeLangGb);
      if (value && value !== key) pairs.push({ key, value });
    });
  });
  pairs
    .sort((a, b) => b.key.length - a.key.length)
    .forEach(({ key, value }) => {
      out = out.split(key).join(value);
    });
  return out;
}

function extractFirstTableDataRowTemplate(html: string): string | null {
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  let searchArea: string | null = null;
  if (tbodyMatch) searchArea = tbodyMatch[1];
  else {
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    searchArea = tableMatch ? tableMatch[1] : null;
  }
  if (searchArea == null) return null;
  const trRe = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const trs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = trRe.exec(searchArea)) != null) trs.push(m[0]);
  if (trs.length === 0) return null;
  const withToken = trs.find((tr) => /\{\{\s*[a-zA-Z0-9_]/.test(tr));
  return withToken ?? trs[0];
}

function extractListRowTemplate(html: string): string | null {
  const openRe = /<div[^>]*\bclass=["'][^"']*(?:\b(?:list-row|wgs-list-row)\b)[^"']*["'][^>]*>/i;
  const openMatch = html.match(openRe);
  if (!openMatch || openMatch.index == null) return null;
  const start = openMatch.index;
  let pos = start + openMatch[0].length;
  let depth = 1;
  while (depth > 0 && pos < html.length) {
    const rest = html.slice(pos);
    const relOpen = rest.search(/<div\b/i);
    const relClose = rest.search(/<\/div>/i);
    if (relClose === -1) return null;
    if (relOpen !== -1 && relOpen < relClose) {
      depth += 1;
      const afterLt = pos + relOpen;
      const relGt = html.indexOf(">", afterLt);
      if (relGt === -1) return null;
      pos = relGt + 1;
    } else {
      depth -= 1;
      pos = pos + relClose + 6;
    }
  }
  return html.slice(start, pos);
}

function hasMappedTokenInTemplate(template: string, fieldMapping: Record<string, string>): boolean {
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) != null) {
    const token = m[1];
    if (!token || token === "widgetId" || token.startsWith("WGS_")) continue;
    if (fieldMapping[token]) return true;
  }
  return false;
}

function buildHtmlWithRepeatedFragment(
  fullHtml: string,
  fragment: string,
  repeatedBodies: string,
  replaceTokenByRow: (src: string, row: Record<string, unknown>) => string,
  shellRow: Record<string, unknown>
): string {
  const idx = fullHtml.indexOf(fragment);
  if (idx < 0) return replaceTokenByRow(fullHtml.replace(fragment, repeatedBodies), shellRow);
  const before = fullHtml.slice(0, idx);
  const after = fullHtml.slice(idx + fragment.length);
  return replaceTokenByRow(before, shellRow) + repeatedBodies + replaceTokenByRow(after, shellRow);
}

function getRowValueByCandidateKey(row: Record<string, unknown>, key: string): unknown {
  if (!key) return undefined;
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  const lower = key.toLowerCase();
  const found = Object.keys(row).find((k) => String(k).toLowerCase() === lower);
  return found ? row[found] : undefined;
}

function requestFetchAsync(url: string, requestOptions: RequestInit): Promise<any> {
  return new Promise((resolve, reject) => {
    EgovNet.requestFetch(url, requestOptions, (resp) => resolve(resp), (error) => reject(error));
  });
}

function newInstanceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyLayout(kind: LayoutKind = "split-h"): LayoutModel {
  return { kind, slots: [] };
}

/** layoutJson 문자열: HTML 엔티티·BOM·이중 JSON 문자열까지 흔들리지 않게 파싱 */
function parseLayoutJsonPayloadString(raw: string): Record<string, unknown> | null {
  let s = raw.replace(/^\uFEFF/, "").trim();
  if (!s) return null;
  s = decodeHtmlEntities(s) || s;
  try {
    let v: unknown = JSON.parse(s);
    if (typeof v === "string") {
      v = JSON.parse(v.trim());
    }
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** slots가 배열이 아니라 객체(인덱스 키)로 올 때 보정 */
function slotsArrayFromPayload(o: Record<string, unknown>): unknown[] | null {
  const s = o.slots;
  if (Array.isArray(s)) return s;
  if (s != null && typeof s === "object" && !Array.isArray(s)) {
    return Object.values(s as Record<string, unknown>);
  }
  return null;
}

/** API가 layoutJson을 객체로 줄 때도 처리 (문자열만 가정하면 JSON.parse 실패) */
function parseLayoutJson(json: unknown): LayoutModel {
  if (json == null || json === "") return emptyLayout("split-h");
  try {
    let o: Record<string, unknown>;
    if (typeof json === "string") {
      const parsed = parseLayoutJsonPayloadString(json);
      if (!parsed) return emptyLayout("split-h");
      o = parsed;
    } else if (typeof json === "object" && json !== null && !Array.isArray(json)) {
      o = json as Record<string, unknown>;
    } else {
      return emptyLayout("split-h");
    }
    const kind = (o.kind as LayoutKind) || "split-h";
    const validKinds: LayoutKind[] = ["split-v", "split-h", "split-t", "split-t-inv", "grid-2x2", "grid-3x2", "grid-3x3"];
    const k = validKinds.includes(kind) ? kind : "split-h";
    const slotsArr = slotsArrayFromPayload(o);
    if (slotsArr) {
      const slots = slotsArr
        .map((s) => {
          const r = s as Record<string, unknown>;
          const slotId = String(r.slotId ?? "").trim();
          const widgetId = String(r.widgetId ?? r.widget_id ?? "").trim();
          const instanceId = String(r.instanceId ?? "").trim() || newInstanceId();
          if (!slotId || !widgetId) return null;
          return { slotId, instanceId, widgetId };
        })
        .filter(Boolean) as SlotEntry[];
      return { kind: k, slots };
    }
    /* 구버전: widgets 배열만 있는 경우 — 첫 슬롯들에 순서대로 매핑 */
    if (Array.isArray(o.widgets)) {
      const ids = SLOT_IDS[k];
      const slots: SlotEntry[] = [];
      (o.widgets as Array<Record<string, unknown>>).forEach((w, i) => {
        const widgetId = String(w.widgetId ?? w.widget_id ?? "").trim();
        if (!widgetId || i >= ids.length) return;
        slots.push({
          slotId: ids[i],
          instanceId: String(w.instanceId ?? "").trim() || newInstanceId(),
          widgetId,
        });
      });
      return { kind: k, slots };
    }
    return emptyLayout(k);
  } catch {
    return emptyLayout("split-h");
  }
}

/** CONFIG_JSON을 textarea용 문자열로 (객체로 오면 stringify — [object Object] 방지) */
function configJsonToText(v: unknown): string {
  if (v == null || v === "") return "[]";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return "[]";
  }
}

/** MySQL CAST(x AS JSON)와 동일하게 RFC JSON인지 검사 후 정규화. `allowEmptyFallback`이 있으면 빈 문자열일 때 그 값 사용 */
function normalizeJsonForMysqlOrAlert(
  raw: string,
  fieldLabel: string,
  msgEmptyTemplate: string,
  msgInvalidTemplate: string,
  allowEmptyFallback?: string
): string | null {
  const t = raw.replace(/\uFEFF/g, "").trim();
  if (!t) {
    if (allowEmptyFallback !== undefined) return allowEmptyFallback;
    alert(replaceI18nPlaceholders(msgEmptyTemplate, { field: fieldLabel }));
    return null;
  }
  try {
    return JSON.stringify(JSON.parse(t));
  } catch {
    alert(replaceI18nPlaceholders(msgInvalidTemplate, { field: fieldLabel }));
    return null;
  }
}

function layoutToJsonPayload(layout: LayoutModel): string {
  const legacyWidgets = layout.slots.map((s, idx) => {
    let x = idx % 2;
    let y = Math.floor(idx / 2);
    if ((layout.kind === "grid-3x2" || layout.kind === "grid-3x3") && /^\d{2}$/.test(s.slotId)) {
      x = parseInt(s.slotId[1]!, 10);
      y = parseInt(s.slotId[0]!, 10);
    } else if (layout.kind === "grid-2x2") {
      const i = ["A", "B", "C", "D"].indexOf(s.slotId);
      if (i >= 0) {
        x = i % 2;
        y = Math.floor(i / 2);
      }
    }
    return {
      instanceId: s.instanceId,
      widgetId: s.widgetId,
      x,
      y,
      w: 6,
      h: 3,
    };
  });
  return JSON.stringify({
    kind: layout.kind,
    preset: layout.kind,
    cols: 12,
    rowHeight: 100,
    slots: layout.slots,
    widgets: legacyWidgets,
  });
}

function LayoutWireIcon({ kind, active }: { kind: LayoutKind; active: boolean }) {
  const stroke = active ? "#0f172a" : "#94a3b8";
  const fill = active ? "#e2e8f0" : "#f8fafc";
  const common = { stroke, strokeWidth: 2, fill };
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" aria-hidden className="md-home-layout-svg">
      {kind === "split-v" && (
        <>
          <rect x="2" y="4" width="16" height="24" rx="1" {...common} />
          <rect x="22" y="4" width="16" height="24" rx="1" {...common} />
        </>
      )}
      {kind === "split-h" && (
        <>
          <rect x="4" y="4" width="32" height="10" rx="1" {...common} />
          <rect x="4" y="18" width="32" height="10" rx="1" {...common} />
        </>
      )}
      {kind === "split-t" && (
        <>
          <rect x="4" y="4" width="13" height="10" rx="1" {...common} />
          <rect x="23" y="4" width="13" height="10" rx="1" {...common} />
          <rect x="4" y="18" width="32" height="10" rx="1" {...common} />
        </>
      )}
      {kind === "split-t-inv" && (
        <>
          <rect x="4" y="4" width="32" height="10" rx="1" {...common} />
          <rect x="4" y="18" width="13" height="10" rx="1" {...common} />
          <rect x="23" y="18" width="13" height="10" rx="1" {...common} />
        </>
      )}
      {kind === "grid-2x2" && (
        <>
          <rect x="4" y="4" width="13" height="10" rx="1" {...common} />
          <rect x="23" y="4" width="13" height="10" rx="1" {...common} />
          <rect x="4" y="18" width="13" height="10" rx="1" {...common} />
          <rect x="23" y="18" width="13" height="10" rx="1" {...common} />
        </>
      )}
      {kind === "grid-3x2" &&
        [0, 1].flatMap((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={4 + col * 11}
              y={4 + row * 13}
              width={9}
              height={10}
              rx={0.8}
              {...common}
            />
          ))
        )}
      {kind === "grid-3x3" &&
        [0, 1, 2].flatMap((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={4 + col * 11}
              y={4 + row * 8.5}
              width={9}
              height={6.5}
              rx={0.8}
              {...common}
            />
          ))
        )}
    </svg>
  );
}

function gridStyleForKind(kind: LayoutKind): React.CSSProperties {
  const fill: React.CSSProperties = {
    width: "100%",
    minHeight: 0,
    height: "100%",
    boxSizing: "border-box",
  };
  switch (kind) {
    case "split-v":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gridTemplateRows: "minmax(120px, 1fr)",
        gap: 12,
        alignContent: "stretch",
      };
    case "split-h":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "minmax(120px, 1fr) minmax(120px, 1fr)",
        gap: 12,
      };
    case "split-t":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        /* 상단 줄 최소 높이 — auto만 쓰면 썸네일 영역이 0에 가깝게 붕괴할 수 있음 */
        gridTemplateRows: "minmax(120px, 1fr) minmax(120px, 1fr)",
        gap: 12,
        gridTemplateAreas: '"tl tr" "b b"',
      };
    case "split-t-inv":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gridTemplateRows: "minmax(120px, 1fr) minmax(120px, 1fr)",
        gap: 12,
        gridTemplateAreas: '"t t" "bl br"',
      };
    case "grid-2x2":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gridTemplateRows: "repeat(2, minmax(100px, 1fr))",
        gap: 12,
      };
    case "grid-3x2":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "repeat(2, minmax(140px, 1fr))",
        gap: 14,
        alignContent: "stretch",
      };
    case "grid-3x3":
      return {
        ...fill,
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gridTemplateRows: "repeat(3, minmax(110px, 1fr))",
        gap: 12,
        alignContent: "stretch",
      };
    default:
      return {};
  }
}

function slotArea(kind: LayoutKind, slotId: string): React.CSSProperties {
  if (kind === "split-t") {
    if (slotId === "TL") return { gridArea: "tl" };
    if (slotId === "TR") return { gridArea: "tr" };
    if (slotId === "B") return { gridArea: "b" };
  }
  if (kind === "split-t-inv") {
    if (slotId === "T") return { gridArea: "t" };
    if (slotId === "BL") return { gridArea: "bl" };
    if (slotId === "BR") return { gridArea: "br" };
  }
  if ((kind === "grid-3x2" || kind === "grid-3x3") && slotId.length === 2 && /^\d{2}$/.test(slotId)) {
    const row = parseInt(slotId[0]!, 10);
    const col = parseInt(slotId[1]!, 10);
    const maxRow = kind === "grid-3x2" ? 1 : 2;
    if (row >= 0 && row <= maxRow && col >= 0 && col <= 2) {
      return { gridRow: row + 1, gridColumn: col + 1, minWidth: 0, minHeight: 0 };
    }
  }
  return {};
}

type MainLocationState = { openDashboardConfig?: boolean };

function clampHomeConfigPanelPos(
  left: number,
  top: number,
  panelW: number,
  panelH: number
): { left: number; top: number } {
  const margin = 8;
  const maxL = Math.max(margin, window.innerWidth - panelW - margin);
  const maxT = Math.max(margin, window.innerHeight - panelH - margin);
  return {
    left: Math.round(Math.min(maxL, Math.max(margin, left))),
    top: Math.round(Math.min(maxT, Math.max(margin, top))),
  };
}

export default function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const { langGb } = useLanguage();
  const { companyList, cmpnyCd, onCompanyChange } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_MAIN_HOME_I18N_KEYS, CMMN_MAIN_HOME_I18N_FALLBACK, { cmpnyCd });

  const emptyWidgetPreviewSrcDoc = useMemo(
    () => buildEmptyWidgetPreviewDoc(i18nText.msgWidgetPreviewUnavailable),
    [i18nText.msgWidgetPreviewUnavailable]
  );

  const layoutPresets = useMemo(
    (): Array<{ id: LayoutKind; label: string }> => [
      { id: "split-v", label: i18nText.layoutSplitVL },
      { id: "split-h", label: i18nText.layoutSplitTB },
      { id: "split-t", label: i18nText.layoutSplitTop2BottomFull },
      { id: "split-t-inv", label: i18nText.layoutSplitTopFullBottom2 },
      { id: "grid-2x2", label: i18nText.layoutGrid22 },
      { id: "grid-3x2", label: i18nText.layoutGrid32 },
      { id: "grid-3x3", label: i18nText.layoutGrid33 },
    ],
    [i18nText]
  );

  const [configOpen, setConfigOpen] = useState(false);
  /** 떠 있는 구성 패널 위치 (화면 기준 px) */
  const [configPanelPos, setConfigPanelPos] = useState<{ left: number; top: number } | null>(null);
  const configPanelRef = useRef<HTMLDivElement | null>(null);
  const configPanelPosRef = useRef(configPanelPos);
  configPanelPosRef.current = configPanelPos;
  const panelMoveRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
  } | null>(null);
  const [categoryCd, setCategoryCd] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categories, setCategories] = useState<CodeOpt[]>([]);
  const [gallery, setGallery] = useState<GalleryRow[]>([]);
  const [dash, setDash] = useState<DashRow | null>(null);
  const [layout, setLayout] = useState<LayoutModel>(() => emptyLayout("split-h"));
  const [configJsonText, setConfigJsonText] = useState<string>("[]");
  const [loading, setLoading] = useState(false);
  const [dragWidgetId, setDragWidgetId] = useState<string | null>(null);
  const [widgetPreviewDocs, setWidgetPreviewDocs] = useState<Record<string, string>>({});
  /** 팝업·메인 공통: 배치 대상 슬롯 */
  const [focusedSlotId, setFocusedSlotId] = useState<string | null>(null);

  const sessionLogin = getSessionItem("loginUser") as { userSe?: string; name?: string; id?: string } | null;
  const isAdmin = sessionLogin?.userSe === "ADM";

  /* 탑영역 그리드 버튼 → state로 전달 시 홈 화면 구성 패널 오픈 */
  useEffect(() => {
    const st = location.state as MainLocationState | null;
    if (st?.openDashboardConfig) {
      setConfigOpen(true);
      navigate(`${location.pathname}${location.search || ""}`, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, location.search, navigate]);

  /* 구성 패널 최초 위치(하단 중앙 근처) — 이후 드래그로 자유 이동 */
  useLayoutEffect(() => {
    if (!configOpen) return;
    setConfigPanelPos((prev) => {
      if (prev) return prev;
      const margin = 12;
      const w = Math.min(920, window.innerWidth - margin * 2);
      const hEst = Math.min(420, Math.round(window.innerHeight * 0.42));
      const left = Math.round((window.innerWidth - w) / 2);
      const top = Math.round(window.innerHeight - hEst - margin - 32);
      return clampHomeConfigPanelPos(left, top, w, hEst);
    });
  }, [configOpen]);

  useEffect(() => {
    if (!configOpen) return;
    const onResize = () => {
      setConfigPanelPos((p) => {
        if (!p || !configPanelRef.current) return p;
        const { offsetWidth, offsetHeight } = configPanelRef.current;
        return clampHomeConfigPanelPos(p.left, p.top, offsetWidth, offsetHeight);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [configOpen]);

  const langCode = useMemo(() => getLanguageCodeForApi(langGb), [langGb]);

  const loadCategories = useCallback(() => {
    EgovNet.requestFetch(
      `${MAIN_DASHBOARD_API}/categories?langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { Accept: "application/json" } },
      (resp: { resultCode?: number; result?: CodeOpt[] }) => {
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS) && Array.isArray(resp.result)) {
          setCategories(resp.result.map((c) => ({ code: c.code, name: c.name })));
        }
      }
    );
  }, [langCode]);

  const loadGallery = useCallback(() => {
    if (!cmpnyCd) return;
    const q = new URLSearchParams({ cmpnyCd });
    if (categoryCd && categoryCd !== "ALL") q.set("categoryCd", categoryCd);
    if (searchKeyword.trim()) q.set("searchKeyword", searchKeyword.trim());
    EgovNet.requestFetch(
      `${MAIN_DASHBOARD_API}/widgets?${q.toString()}`,
      { method: "GET", headers: { Accept: "application/json" } },
      (resp: { resultCode?: number; result?: unknown }) => {
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
          setGallery(normalizeGalleryRows(resp.result));
        } else {
          setGallery([]);
        }
      }
    );
  }, [cmpnyCd, categoryCd, searchKeyword]);

  const loadDashboard = useCallback(() => {
    if (!cmpnyCd) return;
    setLoading(true);
    EgovNet.requestFetch(
      `${MAIN_DASHBOARD_API}/dashboard?cmpnyCd=${encodeURIComponent(cmpnyCd)}`,
      { method: "GET", headers: { Accept: "application/json" } },
      (resp: { resultCode?: number; result?: DashRow | null }) => {
        setLoading(false);
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
          const row = resp.result;
          setDash(row || null);
          setLayout(parseLayoutJson(row?.layoutJson));
          setConfigJsonText(configJsonToText(row?.configJson));
        }
      },
      () => setLoading(false)
    );
  }, [cmpnyCd]);

  useEffect(() => {
    initPage();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    loadDashboard();
  }, [cmpnyCd, loadDashboard]);

  useEffect(() => {
    setFocusedSlotId(SLOT_IDS[layout.kind][0] ?? null);
  }, [layout.kind]);

  useEffect(() => {
    if (configOpen) {
      loadGallery();
      loadCategories();
    }
  }, [configOpen, loadGallery, loadCategories]);

  useEffect(() => {
    const slotWidgetIds = Array.from(new Set(layout.slots.map((s) => s.widgetId).filter(Boolean)));
    if (!cmpnyCd || slotWidgetIds.length === 0) {
      setWidgetPreviewDocs({});
      return;
    }
    let alive = true;
    const sessionUser = getSessionItem("loginUser");
    const uid = sessionUser?.id != null ? String(sessionUser.id) : "";
    const previewParams: Record<string, string> = {
      companyCd: cmpnyCd,
      cmpnyCd,
      userId: uid,
      listCnt: "30",
      todayDt: new Date().toISOString().slice(0, 10),
    };
    const fetchPreviewDoc = async (widgetId: string): Promise<[string, string]> => {
      const galleryMeta = gallery.find((g) => g.widgetId === widgetId);
      let meta = galleryMeta;
      try {
        const widgetQ = new URLSearchParams({ widgetId, cmpnyCd });
        const widgetResp = await requestFetchAsync(`/widget/detail?${widgetQ.toString()}`, {
          method: "GET",
          headers: { "Content-type": "application/json" },
        });
        const widgetRow = widgetResp?.result as
          | { datasetId?: string; styleId?: string; mappingJson?: string; configJson?: string }
          | undefined;
        if (widgetRow) {
          meta = {
            ...galleryMeta,
            widgetId,
            widgetName: galleryMeta?.widgetName || widgetId,
            styleId: String(widgetRow.styleId || "").trim() || galleryMeta?.styleId,
            datasetId: String(widgetRow.datasetId || "").trim() || galleryMeta?.datasetId,
            mappingJson: widgetRow.mappingJson ?? galleryMeta?.mappingJson,
            configJson: widgetRow.configJson ?? galleryMeta?.configJson,
          };
        }
        if (!meta?.styleId) return [widgetId, emptyWidgetPreviewSrcDoc];

        const styleQ = new URLSearchParams({ styleId: meta.styleId, cmpnyCd });
        const styleResp = await requestFetchAsync(
          `/widgetStyle/detail?${styleQ.toString()}`,
          { method: "GET", headers: { "Content-type": "application/json" } }
        );
        const styleRow = styleResp?.result as
          | { htmlTemplate?: string; cssTemplate?: string; jsTemplate?: string; styleTy?: string }
          | undefined;
        if (!styleRow) return [widgetId, emptyWidgetPreviewSrcDoc];
        let rows: Record<string, unknown>[] = [{}];
        if (meta.datasetId) {
          const dsQ = new URLSearchParams({ datasetId: meta.datasetId, cmpnyCd });
          const dsResp = await requestFetchAsync(
            `/widgetDataSet/detail?${dsQ.toString()}`,
            { method: "GET", headers: { "Content-type": "application/json" } }
          );
          const dsTy = String((dsResp?.result as { datasetTy?: string } | undefined)?.datasetTy || "").trim();
          const dsCfg = normalizeJsonFromApi(
            (dsResp?.result as { configJson?: string } | undefined)?.configJson
          );
          if (dsTy) {
            const pvResp = await requestFetchAsync(
              "/widgetDataSet/preview",
              {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ datasetTy: dsTy, configJson: dsCfg, previewParams }),
              }
            );
            const pvRows = (pvResp?.result as { rows?: Record<string, unknown>[] } | undefined)?.rows;
            if (Array.isArray(pvRows) && pvRows.length > 0) rows = pvRows;
          }
        }
        const fieldMapping = parseMappingDataList(meta.mappingJson);
        const langMapping = parseMappingLangList(meta.mappingJson);
        const firstRow = rows[0] || {};
        const htmlTemplateNormalized = normalizeHtmlTemplateFromApi(styleRow.htmlTemplate) || "<div></div>";
        const cssTemplateNormalized = normalizeTemplateFromApi(styleRow.cssTemplate) || "";
        const jsTemplateNormalized = normalizeTemplateFromApi(styleRow.jsTemplate) || "";
        const guessedBasic = tryParseBasicStyleFromCss(cssTemplateNormalized) ?? DEFAULT_BASIC_PREVIEW;
        const htmlWithWgs = hasWidgetStyleTokens(htmlTemplateNormalized)
          ? applyWidgetPreviewTokens(htmlTemplateNormalized, guessedBasic)
          : htmlTemplateNormalized;
        const htmlWithLocalizedLabels = applyLocalizedPhrasesToTemplate(htmlWithWgs, langMapping, langGb);
        const htmlTemplateForPreview = ensureChartPreviewCardShell(htmlWithLocalizedLabels, styleRow.styleTy);
        const cssTemplateForPreview = (() => {
          let cssRaw = cssTemplateNormalized.replace(/\r\n/g, "\n").trim();
          if (!cssRaw) return buildCssFromBasic(guessedBasic);
          const peeled = splitBasicModeCssStored(cssRaw);
          if (peeled.chromeCss != null) cssRaw = peeled.customCss.trim();
          if (!cssRaw) return buildCssFromBasic(guessedBasic);
          if (hasWidgetStyleTokens(cssRaw)) {
            return `${applyWidgetPreviewTokens(cssRaw, guessedBasic)}\n${buildCssFromBasic(guessedBasic)}`;
          }
          return `${cssRaw}\n${buildCssFromBasic(guessedBasic)}`;
        })();
        const jsTemplateForPreview = hasWidgetStyleTokens(jsTemplateNormalized)
          ? applyWidgetPreviewTokens(jsTemplateNormalized, guessedBasic)
          : jsTemplateNormalized;
        const replaceByRow = (src: string, row: Record<string, unknown>) =>
          src.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, tokenRaw) => {
            const token = String(tokenRaw || "");
            if (token === "widgetId") return widgetId;
            const mappedCol =
              fieldMapping[token] ??
              fieldMapping[token.toLowerCase()] ??
              fieldMapping[token.toUpperCase()] ??
              "";
            const v =
              getRowValueByCandidateKey(row, mappedCol) ??
              getRowValueByCandidateKey(row, token) ??
              getRowValueByCandidateKey(row, token.toUpperCase()) ??
              getRowValueByCandidateKey(row, token.toLowerCase());
            const langCol =
              mappedCol ||
              (getRowValueByCandidateKey(row, token) !== undefined
                ? token
                : getRowValueByCandidateKey(row, token.toUpperCase()) !== undefined
                  ? token.toUpperCase()
                  : getRowValueByCandidateKey(row, token.toLowerCase()) !== undefined
                    ? token.toLowerCase()
                    : "");
            if (v !== undefined) return resolveCellValuePreviewText(v, langMapping[langCol], langGb);
            const tokenLangEntry =
              langMapping[token] || langMapping[token.toLowerCase()] || langMapping[token.toUpperCase()];
            if (tokenLangEntry) return resolveMappedColumnHeaderPreviewText(token, tokenLangEntry, langGb);
            if (token === "title") return i18nText.etcPreviewTokenTitle;
            if (token === "value") return i18nText.etcPreviewTokenValue;
            if (token === "data") return i18nText.etcPreviewTokenData;
            return `{{${token}}}`;
          });
        const trTemplate = extractFirstTableDataRowTemplate(htmlTemplateForPreview);
        const listRowTemplate = extractListRowTemplate(htmlTemplateForPreview);
        let finalHtml = "";
        if (!isChartStyleTypeForPreview(styleRow.styleTy) && trTemplate) {
          const rowsForRepeat = hasMappedTokenInTemplate(trTemplate, fieldMapping) ? rows : [firstRow];
          const repeatedRows = rowsForRepeat.map((r) => replaceByRow(trTemplate, r)).join("");
          finalHtml = buildHtmlWithRepeatedFragment(htmlTemplateForPreview, trTemplate, repeatedRows, replaceByRow, firstRow);
        } else if (!isChartStyleTypeForPreview(styleRow.styleTy) && listRowTemplate) {
          const rowsForRepeat = hasMappedTokenInTemplate(listRowTemplate, fieldMapping) ? rows : [firstRow];
          const repeatedRows = rowsForRepeat.map((r) => replaceByRow(listRowTemplate, r)).join("");
          finalHtml = buildHtmlWithRepeatedFragment(
            htmlTemplateForPreview,
            listRowTemplate,
            repeatedRows,
            replaceByRow,
            firstRow
          );
        } else {
          finalHtml = replaceByRow(htmlTemplateForPreview, firstRow);
        }
        const finalJs = shouldAggregateWidgetPreviewJsAcrossRows(styleRow.styleTy, jsTemplateForPreview)
          ? replaceChartPreviewJsTokens(
            jsTemplateForPreview,
            rows,
            (row, token) => replaceByRow(`{{${token}}}`, row),
            { widgetIdForJs: widgetId }
          )
          : replaceByRow(jsTemplateForPreview, firstRow);
        return [
          widgetId,
          buildWidgetStylePreviewSrcDoc(finalHtml, cssTemplateForPreview, styleRow.styleTy, {
            js: finalJs || undefined,
            pinBasicStyleChrome: guessedBasic,
          }),
        ];
      } catch {
        return [widgetId, emptyWidgetPreviewSrcDoc];
      }
    };
    Promise.all(slotWidgetIds.map((wid) => fetchPreviewDoc(wid))).then((entries) => {
      if (!alive) return;
      setWidgetPreviewDocs(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, [
    layout.slots,
    cmpnyCd,
    gallery,
    langGb,
    emptyWidgetPreviewSrcDoc,
    i18nText.etcPreviewTokenTitle,
    i18nText.etcPreviewTokenValue,
    i18nText.etcPreviewTokenData,
  ]);

  const layoutJsonString = useMemo(() => layoutToJsonPayload(layout), [layout]);

  const applyLayoutKind = useCallback((kind: LayoutKind) => {
    setLayout((prev) => {
      const allowed = new Set(SLOT_IDS[kind]);
      const kept = prev.slots.filter((s) => allowed.has(s.slotId));
      return { kind, slots: kept };
    });
    setFocusedSlotId(SLOT_IDS[kind][0] ?? null);
  }, []);

  const assignWidgetToSlot = useCallback((widgetId: string, slotId?: string | null) => {
    const id = String(widgetId || "").trim();
    if (!id) return;
    setLayout((prev) => {
      const slots = SLOT_IDS[prev.kind];
      const target =
        (slotId && slots.includes(slotId) ? slotId : null) ||
        focusedSlotId ||
        slots.find((sid) => !prev.slots.some((s) => s.slotId === sid)) ||
        slots[0];
      if (!target) return prev;
      const next = prev.slots.filter((s) => s.slotId !== target);
      next.push({ slotId: target, instanceId: newInstanceId(), widgetId: id });
      return { ...prev, slots: next };
    });
  }, [focusedSlotId]);

  const removeSlot = useCallback((slotId: string) => {
    setLayout((prev) => ({ ...prev, slots: prev.slots.filter((s) => s.slotId !== slotId) }));
  }, []);

  const closeConfigModal = useCallback(() => {
    setConfigOpen(false);
  }, []);

  const onCancelModal = useCallback(() => {
    setConfigOpen(false);
    loadDashboard();
  }, [loadDashboard]);

  const onSave = useCallback(() => {
    if (!cmpnyCd) return;
    const layoutNorm = normalizeJsonForMysqlOrAlert(
      layoutJsonString,
      i18nText.labelJsonLayoutField,
      i18nText.msgJsonFieldEmpty,
      i18nText.msgJsonInvalid
    );
    if (layoutNorm == null) return;
    const configNorm = normalizeJsonForMysqlOrAlert(
      configJsonText || "[]",
      i18nText.labelJsonConfigField,
      i18nText.msgJsonFieldEmpty,
      i18nText.msgJsonInvalid,
      "[]"
    );
    if (configNorm == null) return;
    const body: Record<string, unknown> = {
      cmpnyCd,
      layoutJson: layoutNorm,
      configJson: configNorm,
      useFl: "Y",
    };
    if (dash?.dashbrdId) body.dashbrdId = dash.dashbrdId;
    EgovNet.requestFetch(
      `${MAIN_DASHBOARD_API}/save`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
          loadDashboard();
          closeConfigModal();
        } else {
          alert(resp.resultMessage || i18nText.msgSaveFailed);
        }
      }
    );
  }, [
    cmpnyCd,
    layoutJsonString,
    configJsonText,
    dash?.dashbrdId,
    loadDashboard,
    closeConfigModal,
    i18nText,
  ]);

  const onSaveDefault = useCallback(() => {
    if (!cmpnyCd || !isAdmin) return;
    const layoutNorm = normalizeJsonForMysqlOrAlert(
      layoutJsonString,
      i18nText.labelJsonLayoutField,
      i18nText.msgJsonFieldEmpty,
      i18nText.msgJsonInvalid
    );
    if (layoutNorm == null) return;
    const configNorm = normalizeJsonForMysqlOrAlert(
      configJsonText || "[]",
      i18nText.labelJsonConfigField,
      i18nText.msgJsonFieldEmpty,
      i18nText.msgJsonInvalid,
      "[]"
    );
    if (configNorm == null) return;
    const body: Record<string, unknown> = {
      cmpnyCd,
      layoutJson: layoutNorm,
      configJson: configNorm,
      useFl: "Y",
    };
    EgovNet.requestFetch(
      `${MAIN_DASHBOARD_API}/saveDefault`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
          loadDashboard();
          closeConfigModal();
        } else {
          alert(resp.resultMessage || i18nText.msgSaveDefaultFailed);
        }
      }
    );
  }, [cmpnyCd, layoutJsonString, configJsonText, isAdmin, loadDashboard, closeConfigModal, i18nText]);

  const onDropSlot = useCallback(
    (e: React.DragEvent, slotId: string) => {
      e.preventDefault();
      const wid =
        e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/widget-id") || dragWidgetId || "";
      setDragWidgetId(null);
      if (wid) assignWidgetToSlot(wid, slotId);
    },
    [dragWidgetId, assignWidgetToSlot]
  );

  const onDragOverSlot = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const widgetMeta = useCallback(
    (widgetId: string) => gallery.find((g) => g.widgetId === widgetId),
    [gallery]
  );

  const renderSlotCard = useCallback(
    (slotId: string) => {
      const entry = layout.slots.find((s) => s.slotId === slotId);
      const meta = entry ? widgetMeta(entry.widgetId) : undefined;
      const isFocus = focusedSlotId === slotId;
      return (
        <div
          key={slotId}
          role="button"
          tabIndex={0}
          className={`md-home-slot wgs-card${isFocus ? " is-focus" : ""}${entry ? " has-widget" : ""}${layout.kind === "grid-3x2" || layout.kind === "grid-3x3" ? " md-home-slot--dense" : ""
            }`}
          style={slotArea(layout.kind, slotId)}
          onClick={() => setFocusedSlotId(slotId)}
          onKeyDown={(e) => e.key === "Enter" && setFocusedSlotId(slotId)}
          onDragOver={onDragOverSlot}
          onDrop={(e) => onDropSlot(e, slotId)}
        >
          {entry ? (
            <div className="md-home-slot__inner">
              <button
                type="button"
                className="md-home-slot__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSlot(slotId);
                }}
                aria-label={i18nText.ariaRemoveWidget}
              >
                ×
              </button>
              <div
                className={`md-home-slot__body${meta?.fileSq ? " md-home-slot__body--fill" : " md-home-slot__body--placeholder"}`}
              >
                <iframe
                  title={replaceI18nPlaceholders(i18nText.etcIframePreviewTitle, {
                    name: meta?.widgetName || entry.widgetId,
                  })}
                  className="md-home-slot__iframe"
                  srcDoc={widgetPreviewDocs[entry.widgetId] || emptyWidgetPreviewSrcDoc}
                />
              </div>
            </div>
          ) : (
            <div className="md-home-slot__empty">{i18nText.hintSelectWidget}</div>
          )}
        </div>
      );
    },
    [
      layout.slots,
      layout.kind,
      focusedSlotId,
      gallery,
      widgetMeta,
      i18nText,
      emptyWidgetPreviewSrcDoc,
      onDragOverSlot,
      onDropSlot,
      removeSlot,
      widgetPreviewDocs,
    ]
  );

  const renderCanvas = useCallback(() => {
    const ids = SLOT_IDS[layout.kind];
    const gridProps = gridStyleForKind(layout.kind);
    return (
      <div className={`md-home-canvas md-home-canvas--fill`} style={gridProps}>
        {ids.map((sid) => renderSlotCard(sid))}
      </div>
    );
  }, [layout.kind, renderSlotCard]);

  const onDockHeadPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = e.target as HTMLElement;
    if (el.closest("button")) return;
    const pos = configPanelPosRef.current;
    if (!pos) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    panelMoveRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originLeft: pos.left,
      originTop: pos.top,
    };
  }, []);

  const onDockHeadPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const mv = panelMoveRef.current;
    if (!mv || e.pointerId !== mv.pointerId || !configPanelRef.current) return;
    const dx = e.clientX - mv.startX;
    const dy = e.clientY - mv.startY;
    const { offsetWidth, offsetHeight } = configPanelRef.current;
    setConfigPanelPos(clampHomeConfigPanelPos(mv.originLeft + dx, mv.originTop + dy, offsetWidth, offsetHeight));
  }, []);

  const onDockHeadPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (panelMoveRef.current?.pointerId === e.pointerId) {
      panelMoveRef.current = null;
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  const onDockHeadLostPointerCapture = useCallback(() => {
    panelMoveRef.current = null;
  }, []);

  return (
    <div className="container P_MAIN md-main-home main-dashboard md-main-home--layout-fill">
      <div className="md-main-home__wrap">
        <header className="md-main-home__page-head">
          <div className="md-main-home__brand egov-page-title">
            <h1 className="egov-page-title__main">{i18nText.titleHome}
              <span className="egov-page-subtitle__main">Dashboard</span>
            </h1>
          </div>
        </header>

        <section className="md-main-home__workspace">
          {loading && <div className="md-main-home__loading-inline">…</div>}
          {renderCanvas()}
        </section>
      </div>

      {configOpen && configPanelPos && (
        <div
          className="md-home-config-dock"
          role="dialog"
          aria-modal="false"
          aria-labelledby="md-home-dock-title"
        >
          <div
            ref={configPanelRef}
            className="md-home-config-dock__panel"
            style={{ left: configPanelPos.left, top: configPanelPos.top }}
          >
            <div
              className="md-home-config-dock__head"
              title={i18nText.hintDockMove}
              onPointerDown={onDockHeadPointerDown}
              onPointerMove={onDockHeadPointerMove}
              onPointerUp={onDockHeadPointerUp}
              onPointerCancel={onDockHeadPointerUp}
              onLostPointerCapture={onDockHeadLostPointerCapture}
            >
              <h2 id="md-home-dock-title" className="md-home-config-dock__title">
                {i18nText.titleHome}
              </h2>
              <button
                type="button"
                className="md-home-config-dock__close"
                onClick={closeConfigModal}
                aria-label={i18nText.ariaCloseDock}
              >
                ×
              </button>
            </div>
            <div className="md-home-modal__toolbar">
              <label className="md-main-home__field">
                <span className="md-main-home__label">{i18nText.labelCompany}</span>
                <select className="md-input md-input--sm" value={cmpnyCd} onChange={(e) => onCompanyChange(e.target.value)}>
                  {companyList.map((c) => (
                    <option key={c.cmpnyCd} value={c.cmpnyCd}>
                      {c.cmpnyNm}
                    </option>
                  ))}
                </select>
              </label>
              <label className="md-main-home__field">
                <span className="md-main-home__label">{i18nText.labelCategory}</span>
                <select className="md-input md-input--sm" value={categoryCd} onChange={(e) => setCategoryCd(e.target.value)}>
                  <option value="ALL">{i18nText.labelCategoryAll}</option>
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <input
                type="search"
                className="md-input md-input--sm md-main-home__search"
                placeholder={i18nText.placeholderSearchWidget}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadGallery()}
              />
              <div className="md-main-home__actions">
                <button type="button" className="md-btn md-btn--text" onClick={onCancelModal}>
                  {i18nText.btnCancel}
                </button>
                <button type="button" className="md-btn md-btn--raised md-btn--accent" onClick={onSave}>
                  {i18nText.btnSave}
                </button>
                {isAdmin && (
                  <button type="button" className="md-btn md-btn--raised md-btn--accent" onClick={onSaveDefault}>
                    {i18nText.btnSaveDefault}
                  </button>
                )}
              </div>
            </div>

            <p className="md-home-config-dock__hint">
              {i18nText.hintDockMove} {i18nText.hintGalleryDrag}
            </p>

            <div className="md-home-modal__layout-row">
              <span className="md-home-modal__layout-label">{i18nText.labelLayoutPick}</span>
              <div className="md-home-layout-icons">
                {layoutPresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.label}
                    className={`md-home-layout-btn${layout.kind === p.id ? " is-active" : ""}`}
                    onClick={() => applyLayoutKind(p.id)}
                  >
                    <LayoutWireIcon kind={p.id} active={layout.kind === p.id} />
                  </button>
                ))}
              </div>
            </div>

            <div className="md-main-home__gallery md-home-config-dock__gallery">
              <div className="md-main-home__gallery-label">{i18nText.labelGallery}</div>
              <div className="md-main-home__gallery-scroll">
                {!cmpnyCd && <p className="md-main-home__gallery-empty">{i18nText.msgGalleryLoadHint}</p>}
                {cmpnyCd && gallery.length === 0 && <p className="md-main-home__gallery-empty">{i18nText.msgGalleryEmpty}</p>}
                {gallery.map((w) => (
                  <button
                    type="button"
                    key={w.widgetId}
                    className="md-main-home__gallery-card wgs-card"
                    draggable
                    title={w.widgetName}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", w.widgetId);
                      e.dataTransfer.setData("text/widget-id", w.widgetId);
                      e.dataTransfer.effectAllowed = "copy";
                      setDragWidgetId(w.widgetId);
                    }}
                    onDragEnd={() => setDragWidgetId(null)}
                  >
                    <div className="md-main-home__thumb">
                      {w.fileSq ? (
                        <img alt="" draggable={false} src={`${SERVER_URL}/widget/widgetImage?fileSq=${encodeURIComponent(w.fileSq)}`} />
                      ) : (
                        <span className="md-main-home__thumb-ph">W</span>
                      )}
                    </div>
                    <div className="md-main-home__gallery-name">{w.widgetName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      <style>{`
        .main-dashboard.md-main-home.P_MAIN::before,
        .md-main-home.P_MAIN::before { display: none !important; }
        .md-main-home.md-main-home--layout-fill {
          display: flex;
          flex-direction: column;
          min-height: calc(100dvh - 88px);
          max-width: 100%;
          box-sizing: border-box;
        }
        .md-main-home { max-width: 1400px; margin: 0 auto; padding: 16px 12px 32px; position: relative; z-index: 0; }
        .md-main-home__wrap {
          display: flex;
          flex-direction: column;
          gap: 18px;
          flex: 1 1 auto;
          min-height: 0;
        }
        .md-main-home__page-head { display: flex; align-items: center; justify-content: flex-start; gap: 16px; flex-wrap: wrap; flex-shrink: 0; }
        .egov-page-title__main { margin: 0; font-size: 22px; font-weight: 700; color: #3c3c3c; margin-left: 10px; }
        .egov-page-subtitle__main { color: #939393; font-weight: 500; font-size: 14px; margin-left: 12px; top: 2px;
position: relative; letter-spacing: 0.02rem; }

        .md-main-home__workspace {
          position: relative;
          z-index: 1;
          flex: 1 1 auto;
          min-height: 320px;
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          box-sizing: border-box;
        }
        .md-main-home__loading-inline { font-size: 13px; color: #64748b; margin-bottom: 8px; flex-shrink: 0; }
        .md-home-canvas.md-home-canvas--fill {
          flex: 1 1 auto;
          width: 100%;
          min-height: 280px;
          align-content: stretch;
          align-items: stretch;
        }
        .md-home-slot {
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          cursor: pointer;
          overflow: hidden;
          transition: border-color .15s, box-shadow .15s, background .15s;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
        }
        .md-home-slot:not(.has-widget) {
          min-height: 120px;
          align-self: stretch;
          height: 100%;
        }
        .md-home-slot:not(.has-widget):hover {
          border-color: #64748b;
          background: #f1f5f9;
        }
        .md-home-slot.has-widget {
          min-height: 0;
          height: 100%;
          align-self: stretch;
          background: #fff;
          position: relative;
          border-radius: 10px;
          box-shadow:0 2px 8px rgba(0, 0, 0, .04), 0 0 1px rgba(0, 0, 0, .06);
        }
        .md-home-slot__inner {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .md-home-slot__remove {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 4;
          width: 30px;
          height: 30px;
          padding: 0 0 1px 0;
          margin: 10px;
          border: none;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.65);
          color: #fff;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease, background-color 0.15s ease;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }
        .md-home-slot.has-widget:hover .md-home-slot__remove,
        .md-home-slot.has-widget:focus-within .md-home-slot__remove {
          opacity: 1;
          pointer-events: auto;
        }
        .md-home-slot__remove:hover {
          background: rgba(185, 28, 28, 0.92);
        }
        .md-home-slot__remove:focus-visible {
          opacity: 1;
          pointer-events: auto;
          outline: 2px solid #0ea5e9;
          outline-offset: 2px;
        }
        @media (hover: none), (pointer: coarse) {
          .md-home-slot.has-widget .md-home-slot__remove {
            opacity: 0.88;
            pointer-events: auto;
          }
        }
        .md-home-slot--dense .md-home-slot__remove {
          top: 4px;
          right: 4px;
          width: 26px;
          height: 26px;
          font-size: 17px;
        }
        .md-home-slot.is-focus { 
        }
        .md-home-slot__body {
          flex: 1 1 auto;
          min-height: 0;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .md-home-slot__body--fill {
          box-sizing: border-box;
          align-items: center;
          justify-content: center;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
        .md-home-slot__body--placeholder {
          padding: 10px;
          min-height: 80px;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
        .md-home-slot__img--fit {
          display: block;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          object-fit: contain;
          object-position: center;
          -webkit-user-drag: none;
          user-select: none;
          pointer-events: none;
        }
        .md-home-slot__iframe {
          width: 100%;
          height: 100%;
          min-height: 120px;
          border: 0;
          background: #fff;
          display: block;
        }
        .md-home-slot__ph { font-size: 12px; color: #64748b; word-break: break-all; text-align: center; padding: 8px; }
        .md-home-slot__empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 14px;
          line-height: 1.55;
          padding: 20px 18px;
          text-align: center;
          max-width: 260px;
          margin: 0 auto;
        }
        .md-home-config-dock {
          position: fixed;
          inset: 0;
          z-index: 10030;
          pointer-events: none;
        }
        .md-home-config-dock__panel {
          position: fixed;
          pointer-events: auto;
          width: min(920px, calc(100vw - 24px));
          max-height: min(52vh, 480px);
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.18);
          padding: 12px 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
          box-sizing: border-box;
        }
        .md-home-config-dock__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          gap: 12px;
          cursor: move;
          user-select: none;
          touch-action: none;
          margin: -4px -8px 0;
          padding: 4px 8px 8px;
          border-radius: 10px;
        }
        .md-home-config-dock__head:hover { background: rgba(15, 23, 42, 0.03); }
        .md-home-config-dock__title { margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; flex: 1 1 auto; min-width: 0; }
        .md-home-config-dock__close {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 50%;
          font-size: 14px;
          line-height: 1;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .md-home-config-dock__close:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
        .md-home-config-dock__hint { margin: 0; font-size: 12px; color: #64748b; line-height: 1.45; flex-shrink: 0; }
        .md-home-config-dock__gallery {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
          margin-top: 2px;
        }
        .md-home-config-dock__gallery .md-main-home__gallery-scroll {
          max-height: min(22vh, 200px);
          overflow-y: auto;
          overflow-x: auto;
        }
        .md-home-modal__toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 0; flex-shrink: 0; }
        .md-home-modal__layout-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 0; flex-shrink: 0; }
        .md-home-modal__layout-label { font-size: 12px; font-weight: 600; color: #64748b; }
        .md-home-layout-icons { display: flex; flex-wrap: nowrap; gap: 8px; }
        .md-home-layout-btn { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 8px 10px; cursor: pointer; height:inherit;}
        .md-home-layout-btn.is-active { border-color: #334155; background: #e2e8f0; }
        .md-main-home__field { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #334155; }
        .md-input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 13px; background: #fff; min-height: 36px; }
        .md-input--sm { padding: 6px 8px; min-height: 32px; }
        .md-main-home__search { min-width: 140px; flex: 1 1 160px; }
        .md-main-home__actions { display: flex; gap: 8px; margin-left: auto; }
        .md-btn { border-radius: 8px; padding: 8px 14px; font-size: 13px; cursor: pointer; border: 1px solid transparent; min-height: 36px; }
        .md-btn--text { background: transparent; color: #475569; border-color: #e2e8f0; }
        .md-btn--raised { background: #b91c1c; color: #fff; box-shadow: 0 1px 2px rgba(15,23,42,.12); }
        .md-btn--accent:hover { filter: brightness(1.05); }
        .md-btn--icon { min-width: 28px; padding: 0 6px; background: transparent; border: none; color: #64748b; font-size: 18px; line-height: 1; }
        .md-main-home__gallery-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        .md-main-home__gallery-scroll { display: flex; gap: 10px; overflow-x: auto; padding: 4px 2px 8px; scrollbar-width: thin; align-items: flex-start; min-height: 100px; flex-wrap: wrap; }
        .md-main-home__gallery-empty { margin: 0; padding: 8px 12px; font-size: 13px; color: #64748b; flex: 1 1 100%; }
        .md-main-home__gallery-card { flex: 0 0 auto; width: 112px; height:inherit; padding: 8px; cursor: grab; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; text-align: left; font: inherit; color: inherit; }
        .md-main-home__gallery-card:active { cursor: grabbing; }
        .md-main-home__thumb { height: 56px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .md-main-home__thumb img { width: 100%; height: 100%; object-fit: cover; }
        .md-main-home__thumb-ph { font-weight: 700; color: #94a3b8; font-size: 16px; }
        .md-main-home__gallery-name { margin-top: 6px; font-size: 11px; color: #0f172a; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}