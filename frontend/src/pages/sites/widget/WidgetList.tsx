import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import CODE from "@/constants/code";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageCodeForApi } from "@/utils/language";
import { decodeHtmlEntities } from "@/utils/htmlDecode";
import { SERVER_URL } from "@/config";
import { getSessionItem } from "@/utils/storage";
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
import MultilingualLookupPopup from "@/components/MultilingualLookupPopup";
import MdUnderlineTabs from "@/components/MdUnderlineTabs";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import WidgetAuthorAuthPanel from "./WidgetAuthorAuthPanel";
import {
  CMMN_WIDGET_I18N_FALLBACK,
  CMMN_WIDGET_I18N_KEYS,
  replaceI18nPlaceholders,
} from "./cmmnWidgetI18n";

const MAX_WIDGET_NAME = 100;
const MAX_WIDGET_ID = 50;
const MAX_DATASET_ID = 50;
const MAX_STYLE_ID = 50;
const MAX_CATEGORY_CD = 50;
const MAX_FILE_SQ = 30;

type WidgetRow = {
  widgetId: string;
  widgetName: string;
  datasetTy?: string;
  styleTy?: string;
  useFl: string;
  modifyDt?: string;
};

type CodeOpt = { code: string; name: string };

type DatasetOpt = { datasetId: string; datasetName: string; datasetTy: string };
type StyleOpt = { styleId: string; styleName: string; styleTy: string };

type WidgetAuthor = { authorCd: string; authorNm?: string; authorCn?: string };
type StyleTemplate = { html: string; css: string; js: string; styleTy: string };
type StyleTemplateTokens = { htmlTokens: string[]; jsOnlyTokens: string[]; allTokens: string[] };

const DEFAULT_MAPPING = '{\n  "dataList": {},\n  "langList": {}\n}';

const DEFAULT_CONFIG = '{\n  "configList": [\n    {\n      "cache_second": "600",\n      "limitCnt": "3",\n      "viewItem": []\n    }\n  ]\n}';
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

function escapeHtmlText(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(s: string): string {
  return escapeHtmlText(s).replace(/'/g, "&#39;");
}

function wrapStylePreviewI18nHit(token: string, column: string, displayText: string): string {
  const te = escapeHtmlAttr(token);
  const ce = escapeHtmlAttr(column);
  const inner = escapeHtmlText(displayText);
  return `<span class="wgs-i18n-hit" data-wgs-t="${te}" data-wgs-c="${ce}">${inner}</span>`;
}

function normalizeJsonFromApi(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "{}";
  const s = String(raw);
  const decoded = decodeHtmlEntities(s);
  return decoded != null && decoded.trim() !== "" ? decoded : s;
}

/** 위젯 스타일 HTML/CSS 템플릿 — API 응답 이스케이프 복원 */
function normalizeTemplateFromApi(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "";
  const s = String(raw);
  const decoded = decodeHtmlEntities(s);
  return decoded != null && decoded.trim() !== "" ? decoded : s;
}

/** HTML만: 시작 태그 '<' 누락/이스케이프 따옴표 잔존 보정 */
function normalizeHtmlTemplateFromApi(raw: string | undefined | null): string {
  const n = normalizeTemplateFromApi(raw);
  if (!n) return "";
  let out = n.replace(/\\"/g, '"').replace(/\\'/g, "'");
  if (!/^\s*</.test(out) && /^\s*[a-z][\w:-]*\s+[^>]*>/i.test(out)) {
    out = out.replace(/^(\s*)([a-z][\w:-]*\s+[^>]*>)/i, "$1<$2");
  }
  return out;
}

function hasWidgetStyleTokens(s: string): boolean {
  return String(s || "").includes("{{WGS_");
}

function shouldRepeatPreviewRows(styleTy: string | undefined): boolean {
  return !isChartStyleTypeForPreview(styleTy);
}

/** mappingJson.dataList: 스타일 토큰명 → 데이터셋 컬럼명 */
function parseMappingDataList(raw: string): Record<string, string> | null {
  try {
    const o = JSON.parse(raw.trim() || "{}") as { dataList?: unknown };
    const dl = o.dataList;
    if (!dl || typeof dl !== "object" || Array.isArray(dl)) return null;
    const out: Record<string, string> = {};
    Object.entries(dl as Record<string, unknown>).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) out[k] = v.trim();
    });
    return out;
  } catch {
    return null;
  }
}

/** 매핑 JSON langList: 데이터 컬럼명(TITLE 등) → 다국어 키·표시문·언어별 문구 */
type WidgetLangMapEntry = {
  langKey: string;
  displayMessage: string;
  messages?: Record<string, string>;
  /** 셀 원문 안의 부분 문자열 → 해당 구간만 다국어 치환 (예: "전월 대비", "달성률") */
  phrases?: Record<string, WidgetLangMapEntry>;
};

const WIDGET_LANG_DND_MIME = "application/x-widget-lang-map";

function parseMappingLangList(raw: string): Record<string, WidgetLangMapEntry> {
  try {
    const o = JSON.parse(raw.trim() || "{}") as { langList?: unknown };
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
      /** 저장 키: 컬럼명. 구형(토큰 키 + dataColumn)은 컬럼으로 승격 */
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

/** langList.phrases 값은 중첩 phrases 없이 저장 (한 컬럼·한 단계 부분 문구만) */
function langPhraseLeafToJson(e: WidgetLangMapEntry): Record<string, unknown> {
  return {
    langKey: e.langKey,
    displayMessage: e.displayMessage,
    ...(e.messages && Object.keys(e.messages).length > 0 ? { messages: e.messages } : {}),
  };
}

function langEntryToJsonObject(e: WidgetLangMapEntry): Record<string, unknown> {
  const phrasesJson: Record<string, unknown> | undefined =
    e.phrases && Object.keys(e.phrases).length > 0
      ? Object.fromEntries(Object.entries(e.phrases).map(([pk, pe]) => [pk, langPhraseLeafToJson(pe)]))
      : undefined;
  return {
    langKey: e.langKey,
    displayMessage: e.displayMessage,
    ...(e.messages && Object.keys(e.messages).length > 0 ? { messages: e.messages } : {}),
    ...(phrasesJson ? { phrases: phrasesJson } : {}),
  };
}

function normalizeLangCodeForCompare(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toLowerCase();
}

/** langList.messages에서 현재 UI langGb에 맞는 문구 (코드 형식 불일치 대비) */
function messageForActiveLang(messages: Record<string, string> | undefined, langGb: string): string | undefined {
  if (!messages || Object.keys(messages).length === 0) return undefined;
  const raw = String(langGb || "").trim();
  const candidates: string[] = [];
  if (raw) {
    candidates.push(raw, raw.replace(/-/g, "_"));
  }
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

/** 데이터 미리보기 표 머리글(<th>)만 다국어 표시 — 행 데이터 값은 원본 유지 */
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

/** 스타일 미리보기 셀: phrases가 있으면 원문에서 키 문자열만 치환, 없으면 컬럼 단위 치환 */
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
      if (!key) return;
      const localized = resolveMappedColumnHeaderPreviewText(key, ph[key], activeLangGb);
      if (localized !== key) {
        s = replacePhraseWithFlexibleWhitespace(s, key, localized);
      }
    });
    return s;
  }
  return resolveMappedColumnHeaderPreviewText(raw, langEntry, activeLangGb);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 일반 공백/NBSP/HTML nbsp 차이를 흡수해 phrase 치환 */
function replacePhraseWithFlexibleWhitespace(source: string, phraseKey: string, localized: string): string {
  if (!phraseKey || localized === phraseKey) return source;
  if (source.indexOf(phraseKey) >= 0) return source.split(phraseKey).join(localized);
  const escaped = escapeRegExp(phraseKey.trim()).replace(/\s+/g, "(?:\\s|\\u00A0|&nbsp;|&#160;)+");
  if (!escaped) return source;
  return source.replace(new RegExp(escaped, "g"), localized);
}

/**
 * 템플릿의 정적 문구(헤더/레이블/타이틀)만 다국어 phrase 치환.
 * 데이터 셀 값은 토큰 치환 단계에서 원본 유지하므로 영향 없음.
 */
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
      out = replacePhraseWithFlexibleWhitespace(out, key, value);
    });
  return out;
}

function mergeLangChipIntoColumnEntry(
  prev: WidgetLangMapEntry | undefined,
  phrase: string | undefined,
  entry: WidgetLangMapEntry
): WidgetLangMapEntry {
  if (!phrase) {
    return entry;
  }
  const base: WidgetLangMapEntry = prev
    ? {
      langKey: prev.langKey,
      displayMessage: prev.displayMessage,
      ...(prev.messages && Object.keys(prev.messages).length > 0 ? { messages: { ...prev.messages } } : {}),
      ...(prev.phrases && Object.keys(prev.phrases).length > 0 ? { phrases: { ...prev.phrases } } : {}),
    }
    : {
      langKey: entry.langKey,
      displayMessage: entry.displayMessage,
      ...(entry.messages && Object.keys(entry.messages).length > 0 ? { messages: { ...entry.messages } } : {}),
    };
  const nextPhrases = { ...(base.phrases || {}) };
  nextPhrases[phrase] = {
    langKey: entry.langKey,
    displayMessage: entry.displayMessage,
    ...(entry.messages && Object.keys(entry.messages).length > 0 ? { messages: { ...entry.messages } } : {}),
  };
  return {
    ...base,
    langKey: base.langKey?.trim() ? base.langKey : entry.langKey,
    displayMessage: base.displayMessage?.trim() ? base.displayMessage : entry.displayMessage,
    phrases: nextPhrases,
  };
}

/** 다국어 탭: langList를 원문 → 표시문 한 줄 요약으로 펼침 */
type LangMappingSummaryRow =
  | { kind: "phrase"; column: string; phrase: string; label: string }
  | { kind: "column"; column: string; label: string };

function buildLangMappingSummaryRows(
  map: Record<string, WidgetLangMapEntry>,
  activeLangGb: string
): LangMappingSummaryRow[] {
  const rows: LangMappingSummaryRow[] = [];
  Object.entries(map).forEach(([column, e]) => {
    const phrases = e.phrases;
    if (phrases && Object.keys(phrases).length > 0) {
      Object.entries(phrases).forEach(([phrase, pe]) => {
        const localized = messageForActiveLang(pe.messages, activeLangGb);
        const label = (localized || pe.displayMessage?.trim() || pe.langKey || "").trim() || phrase;
        rows.push({ kind: "phrase", column, phrase, label });
      });
    } else if ((e.langKey || "").trim()) {
      const localized = messageForActiveLang(e.messages, activeLangGb);
      const label = (localized || e.displayMessage?.trim() || e.langKey || "").trim();
      rows.push({ kind: "column", column, label });
    }
  });
  rows.sort((a, b) => {
    const ca = a.column.localeCompare(b.column, "ko");
    if (ca !== 0) return ca;
    if (a.kind === "phrase" && b.kind === "phrase") return a.phrase.localeCompare(b.phrase, "ko");
    return a.kind === "column" ? -1 : 1;
  });
  return rows;
}

function extractLangEntryFromDragData(rawPayload: string): WidgetLangMapEntry | null {
  try {
    const entry = JSON.parse(rawPayload) as WidgetLangMapEntry;
    if (!entry?.langKey?.trim()) return null;
    return {
      langKey: entry.langKey.trim(),
      displayMessage: String(entry.displayMessage ?? entry.langKey),
      ...(entry.messages && Object.keys(entry.messages).length ? { messages: { ...entry.messages } } : {}),
    };
  } catch {
    return null;
  }
}

function extractMappableTokens(template: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) != null) {
    const token = m[1];
    if (!token || token === "widgetId" || token.startsWith("WGS_")) continue;
    if (!seen.has(token)) {
      seen.add(token);
      out.push(token);
    }
  }
  return out;
}

function mergeUniqueTokens(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  groups.forEach((g) => {
    g.forEach((t) => {
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    });
  });
  return out;
}

/**
 * 테이블형: 반복에 쓸 첫 `<tr>...</tr>` 원본 조각(매핑 전 문자열).
 * 이미 치환된 HTML에서는 같은 문자열을 찾을 수 없어, baseSingle.replace(원본tr) 패턴은 실패함.
 */
function extractFirstTableDataRowTemplate(html: string): string | null {
  const tbodyMatch = html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  let searchArea: string | null = null;
  if (tbodyMatch) {
    searchArea = tbodyMatch[1];
  } else {
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
    searchArea = tableMatch ? tableMatch[1] : null;
  }
  if (searchArea == null) return null;
  const trRe = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const trs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = trRe.exec(searchArea)) != null) {
    trs.push(m[0]);
  }
  if (trs.length === 0) return null;
  /** 헤더만 있는 tr 보다 {{ 토큰이 있는 데이터 행을 우선 */
  const withToken = trs.find((tr) => /\{\{\s*[a-zA-Z0-9_]/.test(tr));
  return withToken ?? trs[0];
}

/**
 * 리스트형: class에 list-row / wgs-list-row 가 있는 바깥 div 한 덩어리(내부 div 중첩 대응).
 * 이전 non-greedy 정규식은 첫 </div>에서 잘려 반복 치환이 실패하고 한 행만 보일 수 있음.
 */
function extractListRowTemplate(html: string): string | null {
  const openRe =
    /<div[^>]*\bclass=["'][^"']*(?:\b(?:list-row|wgs-list-row)\b)[^"']*["'][^>]*>/i;
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

/** 반복 조각 앞·뒤 껍데기만 치환(이미 치환된 행을 다시 firstRow로 덮어쓰지 않음) */
function buildHtmlWithRepeatedFragment(
  fullHtml: string,
  fragment: string,
  repeatedBodies: string,
  replaceTokenByRow: (src: string, row: Record<string, unknown>) => string,
  shellRow: Record<string, unknown>
): string {
  const idx = fullHtml.indexOf(fragment);
  if (idx < 0) {
    return replaceTokenByRow(fullHtml.replace(fragment, repeatedBodies), shellRow);
  }
  const before = fullHtml.slice(0, idx);
  const after = fullHtml.slice(idx + fragment.length);
  return replaceTokenByRow(before, shellRow) + repeatedBodies + replaceTokenByRow(after, shellRow);
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

function toFiniteNumber(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** CM_IDS 채번 숫자 → 표시용 FILE-##### (백엔드 WidgetImageServiceImpl과 동일 패딩) */
function formatWidgetFileSqDisplay(fileSqRaw: string): string {
  const raw = String(fileSqRaw || "").trim();
  if (!raw) return "";
  if (!/^\d+$/.test(raw)) return raw;
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `FILE-${String(Math.floor(n)).padStart(5, "0")}`;
}

async function fetchWidgetImageBlobUrl(fileSq: string): Promise<string | null> {
  const sessionUser = getSessionItem("loginUser");
  const jToken = getSessionItem("jToken");
  const headers: Record<string, string> = {};
  if (sessionUser?.id != null && String(sessionUser.id) !== "" && jToken) {
    headers.Authorization = jToken;
  }
  const q = new URLSearchParams({ fileSq: fileSq.trim() });
  const res = await fetch(`${SERVER_URL}/widget/widgetImage?${q.toString()}`, {
    credentials: "include",
    headers,
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  if (!blob || blob.size === 0) return null;
  return globalThis.URL.createObjectURL(blob);
}

function WidgetList() {
  const { langGb } = useLanguage();
  const widgetIdInputRef = useRef<HTMLInputElement | null>(null);

  const { companyList, cmpnyCd, onCompanyChange } = useCompanyList();

  const i18nText = useCmmnScreenI18n(CMMN_WIDGET_I18N_KEYS, CMMN_WIDGET_I18N_FALLBACK, { cmpnyCd });

  const stylePreviewPlaceholderHtml = useMemo(
    () =>
      `<!DOCTYPE html><html><body style="margin:0;padding:12px;font-family:system-ui;color:#64748b">${escapeHtmlText(i18nText.msgStylePreviewIdle)}</body></html>`,
    [i18nText.msgStylePreviewIdle]
  );

  const previewTokenLabels = useMemo(
    () => ({
      title: i18nText.etcPreviewTokenTitle,
      value: i18nText.etcPreviewTokenValue,
      data: i18nText.etcPreviewTokenData,
    }),
    [i18nText.etcPreviewTokenTitle, i18nText.etcPreviewTokenValue, i18nText.etcPreviewTokenData]
  );

  const [categoryOptions, setCategoryOptions] = useState<CodeOpt[]>([]);
  const [dataTypeOptions, setDataTypeOptions] = useState<CodeOpt[]>([]);
  const [styleTypeOptions, setStyleTypeOptions] = useState<CodeOpt[]>([]);

  const [searchCategory, setSearchCategory] = useState("");
  const [searchWidgetName, setSearchWidgetName] = useState("");
  const [list, setList] = useState<WidgetRow[]>([]);

  const [datasetOptions, setDatasetOptions] = useState<DatasetOpt[]>([]);
  const [styleOptions, setStyleOptions] = useState<StyleOpt[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** 첫 진입 시 신규 등록 폼 — 위젯 ID 자동 채번(useEffect) */
  const [isNew, setIsNew] = useState(true);

  const [widgetId, setWidgetId] = useState("");
  const [widgetName, setWidgetName] = useState("");
  const [useFl, setUseFl] = useState("Y");
  const [categoryCd, setCategoryCd] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [styleId, setStyleId] = useState("");
  /** 매핑 탭: 위젯데이터셋관리와 동일 공통코드(`/widgetDataSet/dataTypes`) — 데이터명 콤보 필터 */
  const [mappingDatasetTy, setMappingDatasetTy] = useState("");
  /** 매핑 탭: 위젯스타일관리와 동일 공통코드(`/widgetStyle/styleTypes`) — 스타일명 콤보 필터 */
  const [mappingStyleTy, setMappingStyleTy] = useState("");
  const [mappingJson, setMappingJson] = useState(DEFAULT_MAPPING);
  /** langList: 컬럼명 → 다국어 항목 */
  const [langMapping, setLangMapping] = useState<Record<string, WidgetLangMapEntry>>({});
  /** 스타일 미리보기에서 클릭한 치환 영역 → langList 컬럼 키에 매핑 */
  const [i18nPreviewSelection, setI18nPreviewSelection] = useState<{
    token: string;
    column: string;
    phrase?: string;
  } | null>(null);
  /** 다국어 조회에서 선택한 메시지 — 드래그 소스(칩)에 실림 */
  const [i18nDragSource, setI18nDragSource] = useState<WidgetLangMapEntry | null>(null);
  const [showI18nLookupPopup, setShowI18nLookupPopup] = useState(false);
  const [configJson, setConfigJson] = useState(DEFAULT_CONFIG);
  const [fileSq, setFileSq] = useState("");
  const [widgetPhotoPreviewUrl, setWidgetPhotoPreviewUrl] = useState<string | undefined>(undefined);
  const widgetPhotoPreviewRevokeRef = useRef<string | null>(null);
  const widgetPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [widgetPhotoUploading, setWidgetPhotoUploading] = useState(false);

  const fileSqDisplayText = useMemo(() => formatWidgetFileSqDisplay(fileSq), [fileSq]);
  const langMappingSummaryRows = useMemo(
    () => buildLangMappingSummaryRows(langMapping, langGb),
    [langMapping, langGb]
  );
  const removeLangMappingSummaryRow = useCallback((row: LangMappingSummaryRow) => {
    if (row.kind === "column") {
      setLangMapping((prev) => {
        const { [row.column]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setLangMapping((prev) => {
        const e = prev[row.column];
        if (!e?.phrases?.[row.phrase]) return prev;
        const nextPhrases = { ...e.phrases };
        delete nextPhrases[row.phrase];
        const hasPhrases = Object.keys(nextPhrases).length > 0;
        const nextEntry: WidgetLangMapEntry = { ...e };
        if (hasPhrases) nextEntry.phrases = nextPhrases;
        else delete nextEntry.phrases;
        const hasTop =
          (nextEntry.langKey || "").trim() !== "" ||
          (nextEntry.messages != null && Object.keys(nextEntry.messages).length > 0);
        if (!hasPhrases && !hasTop) {
          const { [row.column]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [row.column]: nextEntry };
      });
    }
    setI18nPreviewSelection((sel) => {
      if (!sel) return null;
      if (row.kind === "column") return sel.column === row.column ? null : sel;
      return sel.column === row.column && sel.phrase === row.phrase ? null : sel;
    });
  }, []);

  const [authorsDetail, setAuthorsDetail] = useState<WidgetAuthor[]>([]);

  const [mainTab, setMainTab] = useState<"mapping" | "i18n" | "auth" | "check">("mapping");
  /** 스타일관리 미리보기와 동일한 DOM(플레인 치환) — 매핑·설정확인 탭 */
  const [stylePreviewDocPlain, setStylePreviewDocPlain] = useState("");
  /** 다국어 탭: 선택·드롭용 .wgs-i18n-hit + 스크립트 */
  const [stylePreviewDocI18n, setStylePreviewDocI18n] = useState("");
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [styleTemplate, setStyleTemplate] = useState<StyleTemplate | null>(null);
  const [styleTemplateTokens, setStyleTemplateTokens] = useState<string[]>([]);
  const [styleTemplateTokenInfo, setStyleTemplateTokenInfo] = useState<StyleTemplateTokens>({
    htmlTokens: [],
    jsOnlyTokens: [],
    allTokens: [],
  });
  const [datasetPreviewCols, setDatasetPreviewCols] = useState<string[]>([]);
  const [datasetPreviewRows, setDatasetPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [datasetPreviewMsg, setDatasetPreviewMsg] = useState<string | null>(null);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const applyI18nEntryToToken = useCallback(
    (token: string, entry: WidgetLangMapEntry) => {
      const mappedCol = String(fieldMapping[token] || "").trim();
      /** JS 전용 토큰(legend 등)은 컬럼 매핑이 없어도 token 키로 langList 저장 */
      const langKey = mappedCol || token;
      if (!langKey) return;
      setLangMapping((prev) => ({
        ...prev,
        [langKey]: mergeLangChipIntoColumnEntry(prev[langKey], undefined, entry),
      }));
      setI18nPreviewSelection({ token, column: langKey });
    },
    [fieldMapping]
  );
  const i18nDropTargetTokens = useMemo(
    () =>
      styleTemplateTokens.filter((token) => {
        const mapped =
          fieldMapping[token] ||
          fieldMapping[token.toLowerCase()] ||
          fieldMapping[token.toUpperCase()];
        return !String(mapped || "").trim();
      }),
    [styleTemplateTokens, fieldMapping]
  );

  /** 데이터명·스타일명을 바꾸면 이전 매핑·다국어는 무효이므로 초기화 */
  const clearMappingStateForNewDatasetOrStyle = useCallback(() => {
    setMappingJson(DEFAULT_MAPPING);
    setFieldMapping({});
    setLangMapping({});
    setI18nPreviewSelection(null);
    setI18nDragSource(null);
  }, []);

  const loadCategories = useCallback(() => {
    const langCode = getLanguageCodeForApi(langGb);
    EgovNet.requestFetch(
      `/widget/categories?langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setCategoryOptions(resp.result as CodeOpt[]);
        }
      },
      () => { }
    );
  }, [langGb]);

  const loadDataTypes = useCallback(() => {
    const langCode = getLanguageCodeForApi(langGb);
    EgovNet.requestFetch(
      `/widgetDataSet/dataTypes?langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setDataTypeOptions(resp.result as CodeOpt[]);
        }
      },
      () => { }
    );
  }, [langGb]);

  const loadStyleTypes = useCallback(() => {
    const langCode = getLanguageCodeForApi(langGb);
    EgovNet.requestFetch(
      `/widgetStyle/styleTypes?langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setStyleTypeOptions(resp.result as CodeOpt[]);
        }
      },
      () => { }
    );
  }, [langGb]);

  const loadDatasetOptions = useCallback(() => {
    if (!cmpnyCd?.trim()) {
      setDatasetOptions([]);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetDataSet/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setDatasetOptions(
            (resp.result as DatasetOpt[]).map((r) => ({
              datasetId: String(r.datasetId ?? "").trim(),
              datasetName: String(r.datasetName ?? ""),
              datasetTy: String(r.datasetTy ?? ""),
            }))
          );
        } else {
          setDatasetOptions([]);
        }
      },
      () => setDatasetOptions([])
    );
  }, [cmpnyCd]);

  const loadStyleOptions = useCallback(() => {
    if (!cmpnyCd?.trim()) {
      setStyleOptions([]);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetStyle/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setStyleOptions(
            (resp.result as { styleId: string; styleName: string; styleTy: string }[]).map((r) => ({
              styleId: String(r.styleId ?? "").trim(),
              styleName: String(r.styleName ?? ""),
              styleTy: String(r.styleTy ?? ""),
            }))
          );
        } else {
          setStyleOptions([]);
        }
      },
      () => setStyleOptions([])
    );
  }, [cmpnyCd]);

  const loadList = useCallback(() => {
    if (!cmpnyCd?.trim()) {
      setList([]);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
    if (searchCategory) q.set("categoryCd", searchCategory);
    if (searchWidgetName.trim()) q.set("widgetName", searchWidgetName.trim());
    EgovNet.requestFetch(
      `/widget/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setList(resp.result as WidgetRow[]);
        } else {
          setList([]);
        }
      },
      () => setList([])
    );
  }, [cmpnyCd, searchCategory, searchWidgetName]);

  const labelDataTy = useCallback(
    (code: string | undefined) => {
      if (!code) return "-";
      return dataTypeOptions.find((o) => o.code === code)?.name ?? code;
    },
    [dataTypeOptions]
  );

  const labelStyleTy = useCallback(
    (code: string | undefined) => {
      if (!code) return "-";
      return styleTypeOptions.find((o) => o.code === code)?.name ?? code;
    },
    [styleTypeOptions]
  );

  const applyDetailToForm = useCallback(
    (d: WidgetRow & {
      datasetId?: string;
      styleId?: string;
      categoryCd?: string;
      mappingJson?: string;
      configJson?: string;
      fileSq?: string;
      authors?: WidgetAuthor[];
    }) => {
      setWidgetId(d.widgetId != null ? String(d.widgetId).trim() : "");
      setWidgetName(d.widgetName || "");
      setUseFl(d.useFl === "N" ? "N" : "Y");
      setCategoryCd(d.categoryCd != null ? String(d.categoryCd).trim() : "");
      setDatasetId(d.datasetId != null ? String(d.datasetId).trim() : "");
      setStyleId(d.styleId != null ? String(d.styleId).trim() : "");
      const rawM = normalizeJsonFromApi(d.mappingJson) || DEFAULT_MAPPING;
      setMappingJson(rawM);
      const parsedDl = parseMappingDataList(rawM);
      setFieldMapping(parsedDl ?? {});
      setLangMapping(parseMappingLangList(rawM));
      setI18nPreviewSelection(null);
      setI18nDragSource(null);
      setConfigJson(normalizeJsonFromApi(d.configJson) || DEFAULT_CONFIG);
      setFileSq(d.fileSq != null && String(d.fileSq).trim() !== "" ? String(d.fileSq).trim() : "");
      const auths = d.authors || [];
      setAuthorsDetail(auths);
      setMainTab("mapping");
    },
    []
  );

  const loadDetail = useCallback(
    (id: string) => {
      if (!cmpnyCd?.trim()) return;
      const q = new URLSearchParams({ widgetId: id, cmpnyCd: cmpnyCd.trim() });
      EgovNet.requestFetch(
        `/widget/detail?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.result) {
            applyDetailToForm(resp.result as Parameters<typeof applyDetailToForm>[0]);
            setSelectedId(id);
            setIsNew(false);
          }
        },
        () => alert(i18nText.msgErrorOnDetail)
      );
    },
    [applyDetailToForm, cmpnyCd, i18nText.msgErrorOnDetail]
  );

  useEffect(() => {
    loadCategories();
    loadDataTypes();
    loadStyleTypes();
  }, [loadCategories, loadDataTypes, loadStyleTypes]);

  useEffect(() => {
    loadDatasetOptions();
    loadStyleOptions();
  }, [loadDatasetOptions, loadStyleOptions]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  /** 신규 모드에서 위젯 ID 비어 있으면 WIDGET- + 시퀀스 자동 채번(목록 선택·수정 시에는 실행 안 함) */
  useEffect(() => {
    if (!cmpnyCd?.trim() || !isNew || widgetId.trim() !== "") return;
    let alive = true;
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widget/nextWidgetId?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (!alive) return;
        const id = (resp?.result as { widgetId?: string })?.widgetId;
        if (id) setWidgetId(id);
      },
      () => { }
    );
    return () => {
      alive = false;
    };
  }, [cmpnyCd, isNew, widgetId]);

  useEffect(() => {
    if (categoryOptions.length > 0 && !categoryCd && isNew) {
      setCategoryCd(categoryOptions[0].code);
    }
  }, [categoryOptions, categoryCd, isNew]);

  /** 데이터셋 선택 시 샘플 데이터를 읽어 매핑용 드래그 소스로 사용 */
  useEffect(() => {
    if (!datasetId?.trim() || !cmpnyCd?.trim()) {
      setDatasetPreviewCols([]);
      setDatasetPreviewRows([]);
      setDatasetPreviewMsg(null);
      return;
    }
    const q = new URLSearchParams({ datasetId: datasetId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetDataSet/detail?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const r = resp?.result as { datasetTy?: string; configJson?: string } | undefined;
        if (!r?.datasetTy) {
          setDatasetPreviewMsg(i18nText.msgDatasetNotFound);
          setDatasetPreviewCols([]);
          setDatasetPreviewRows([]);
          return;
        }
        const sessionUser = getSessionItem("loginUser");
        const uid = sessionUser?.id != null ? String(sessionUser.id) : "";
        const cc = String(cmpnyCd || "").trim();
        const previewParams: Record<string, string> = {
          companyCd: cc,
          cmpnyCd: cc,
          userId: uid,
          listCnt: "30",
          todayDt: new Date().toISOString().slice(0, 10),
        };
        EgovNet.requestFetch(
          "/widgetDataSet/preview",
          {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              datasetTy: String(r.datasetTy || "").trim(),
              configJson: normalizeJsonFromApi(r.configJson),
              previewParams,
            }),
          },
          (pResp) => {
            const p = pResp?.result as { columns?: string[]; rows?: Record<string, unknown>[]; message?: string };
            if (p?.message) {
              setDatasetPreviewMsg(p.message);
              setDatasetPreviewCols([]);
              setDatasetPreviewRows([]);
              return;
            }
            const cols = Array.isArray(p?.columns) ? p.columns : [];
            const rows = Array.isArray(p?.rows) ? p.rows : [];
            setDatasetPreviewMsg(null);
            setDatasetPreviewCols(cols);
            setDatasetPreviewRows(rows);
          },
          () => {
            setDatasetPreviewMsg(i18nText.msgDatasetPreviewError);
            setDatasetPreviewCols([]);
            setDatasetPreviewRows([]);
          }
        );
      },
      () => {
        setDatasetPreviewMsg(i18nText.msgDatasetDetailError);
        setDatasetPreviewCols([]);
        setDatasetPreviewRows([]);
      }
    );
  }, [datasetId, cmpnyCd, i18nText.msgDatasetNotFound, i18nText.msgDatasetPreviewError, i18nText.msgDatasetDetailError]);

  /** 스타일 미리보기: 선택 스타일 템플릿 로드 */
  useEffect(() => {
    if (!styleId?.trim() || !cmpnyCd?.trim()) {
      setStyleTemplate(null);
      setStyleTemplateTokens([]);
      setStylePreviewDocPlain("");
      setStylePreviewDocI18n("");
      return;
    }
    const q = new URLSearchParams({ styleId: styleId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetStyle/detail?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const r = resp?.result as { htmlTemplate?: string; cssTemplate?: string; jsTemplate?: string; styleTy?: string } | undefined;
        if (!r) {
          setStyleTemplate(null);
          setStyleTemplateTokens([]);
          setStylePreviewDocPlain("");
          setStylePreviewDocI18n("");
          return;
        }
        const htmlTemplate = normalizeHtmlTemplateFromApi(r.htmlTemplate) || "<div></div>";
        const cssTemplate = normalizeTemplateFromApi(r.cssTemplate) || "";
        const jsTemplate = (normalizeTemplateFromApi(r.jsTemplate) || "").trim();
        const styleTy = r.styleTy || "";
        setStyleTemplate({ html: htmlTemplate, css: cssTemplate, js: jsTemplate, styleTy });
        /** 차트형은 JS 템플릿에 {{category}}, {{value}} 토큰이 있을 수 있어 HTML+JS를 합쳐 추출 */
        const htmlTokens = extractMappableTokens(htmlTemplate);
        const jsTokens = extractMappableTokens(jsTemplate);
        const jsOnlyTokens = jsTokens.filter((t) => !htmlTokens.includes(t));
        const tokens = mergeUniqueTokens(htmlTokens, jsTokens);
        setStyleTemplateTokenInfo({ htmlTokens, jsOnlyTokens, allTokens: tokens });
        setStyleTemplateTokens(tokens);
        setFieldMapping((prev) => {
          const next: Record<string, string> = {};
          tokens.forEach((t) => {
            if (prev[t]) next[t] = prev[t];
          });
          return next;
        });
      },
      () => {
        setStyleTemplate(null);
        setStyleTemplateTokens([]);
        setStyleTemplateTokenInfo({ htmlTokens: [], jsOnlyTokens: [], allTokens: [] });
        setStylePreviewDocPlain("");
        setStylePreviewDocI18n("");
      }
    );
  }, [styleId, cmpnyCd]);

  /** 스타일 템플릿 + 데이터/매핑을 합쳐 최종 미리보기 렌더(플레인 = 스타일관리와 동일 DOM, i18n = 다국어 탭 전용) */
  useEffect(() => {
    if (!styleTemplate) {
      setStylePreviewDocPlain("");
      setStylePreviewDocI18n("");
      return;
    }
    const rows = datasetPreviewRows.length > 0 ? datasetPreviewRows : [{}];
    const firstRow = rows[0] as Record<string, unknown>;
    const makeReplaceTokenByRow = (useI18nHits: boolean) => (src: string, row: Record<string, unknown>): string =>
      src.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, tokenRaw) => {
        const token = String(tokenRaw || "");
        if (token === "widgetId") return "preview";
        const col =
          fieldMapping[token] ||
          fieldMapping[token.toLowerCase()] ||
          fieldMapping[token.toUpperCase()] ||
          "";
        if (col && Object.prototype.hasOwnProperty.call(row, col)) {
          const v = row[col];
          const rawText = v == null ? "" : String(v);
          const displayText = resolveCellValuePreviewText(rawText, langMapping[col], langGb);
          if (useI18nHits) return wrapStylePreviewI18nHit(token, col, displayText);
          return escapeHtmlText(displayText);
        }
        const tokenLangEntry =
          langMapping[token] || langMapping[token.toLowerCase()] || langMapping[token.toUpperCase()];
        if (tokenLangEntry) {
          const text = resolveMappedColumnHeaderPreviewText(token, tokenLangEntry, langGb);
          if (useI18nHits) return wrapStylePreviewI18nHit(token, col || token, text);
          return escapeHtmlText(text);
        }
        if (token === "title") {
          return useI18nHits
            ? wrapStylePreviewI18nHit(token, col || "", previewTokenLabels.title)
            : escapeHtmlText(previewTokenLabels.title);
        }
        if (token === "value") {
          return useI18nHits
            ? wrapStylePreviewI18nHit(token, col || "", previewTokenLabels.value)
            : escapeHtmlText(previewTokenLabels.value);
        }
        if (token === "data") {
          return useI18nHits
            ? wrapStylePreviewI18nHit(token, col || "", previewTokenLabels.data)
            : escapeHtmlText(previewTokenLabels.data);
        }
        return `{{${token}}}`;
      });

    const replaceJsTokens = makeReplaceTokenByRow(false);

    const getChartJsCellDisplayPlain = (row: Record<string, unknown>, token: string): string => {
      const col =
        fieldMapping[token] ||
        fieldMapping[token.toLowerCase()] ||
        fieldMapping[token.toUpperCase()] ||
        "";
      if (col) {
        let v: unknown = undefined;
        if (Object.prototype.hasOwnProperty.call(row, col)) v = row[col];
        else {
          const lower = col.toLowerCase();
          const k = Object.keys(row).find((kk) => String(kk).toLowerCase() === lower);
          if (k) v = row[k];
        }
        if (v !== undefined) {
          const rawText = v == null ? "" : String(v);
          return resolveCellValuePreviewText(rawText, langMapping[col], langGb);
        }
      }
      const tokenLangEntry =
        langMapping[token] || langMapping[token.toLowerCase()] || langMapping[token.toUpperCase()];
      if (tokenLangEntry) return resolveMappedColumnHeaderPreviewText(token, tokenLangEntry, langGb);
      if (token === "title") return previewTokenLabels.title;
      if (token === "value") return previewTokenLabels.value;
      if (token === "data") return previewTokenLabels.data;
      return `{{${token}}}`;
    };

    const composePreview = (useI18nHits: boolean): { html: string; css: string; js: string } => {
      const replaceHtml = makeReplaceTokenByRow(useI18nHits);
      const guessedBasic = tryParseBasicStyleFromCss(styleTemplate.css) ?? DEFAULT_BASIC_PREVIEW;
      const htmlWithWgs = hasWidgetStyleTokens(styleTemplate.html)
        ? applyWidgetPreviewTokens(styleTemplate.html, guessedBasic)
        : styleTemplate.html;
      const htmlWithLocalizedLabels = applyLocalizedPhrasesToTemplate(htmlWithWgs, langMapping, langGb);
      const htmlTemplateForPreview = ensureChartPreviewCardShell(htmlWithLocalizedLabels, styleTemplate.styleTy);
      const cssTemplateForPreview = (() => {
        let cssRaw = (styleTemplate.css || "").replace(/\r\n/g, "\n").trim();
        if (!cssRaw) return buildCssFromBasic(guessedBasic);
        const peeled = splitBasicModeCssStored(cssRaw);
        if (peeled.chromeCss != null) {
          cssRaw = peeled.customCss.trim();
        }
        if (!cssRaw) return buildCssFromBasic(guessedBasic);
        if (hasWidgetStyleTokens(cssRaw)) {
          return `${applyWidgetPreviewTokens(cssRaw, guessedBasic)}\n${buildCssFromBasic(guessedBasic)}`;
        }
        /**
         * 스타일관리와 동일 규칙:
         * 토큰 없는 저장 CSS는 그대로 두고, 기본 카드/헤더 크롬을 뒤에 붙여
         * 동일 selector는 기본 스타일 설정값이 우선 적용되도록 함.
         */
        return `${cssRaw}\n${buildCssFromBasic(guessedBasic)}`;
      })();
      const jsTemplateForPreview = hasWidgetStyleTokens(styleTemplate.js)
        ? applyWidgetPreviewTokens(styleTemplate.js, guessedBasic)
        : styleTemplate.js;
      let html = "";
      let css = cssTemplateForPreview;
      let js = "";
      const previewRows = rows;
      const trTemplate = extractFirstTableDataRowTemplate(htmlTemplateForPreview);
      const listRowTemplate = extractListRowTemplate(htmlTemplateForPreview);
      const allowRowRepeat = shouldRepeatPreviewRows(styleTemplate.styleTy);
      if (allowRowRepeat && trTemplate) {
        const rowsForRepeat = hasMappedTokenInTemplate(trTemplate, fieldMapping) ? previewRows : [firstRow];
        const repeatedRows = rowsForRepeat
          .map((r) => replaceHtml(trTemplate, r as Record<string, unknown>))
          .join("");
        html = buildHtmlWithRepeatedFragment(
          htmlTemplateForPreview,
          trTemplate,
          repeatedRows,
          replaceHtml,
          firstRow
        );
      } else if (allowRowRepeat && listRowTemplate) {
        const rowsForRepeat = hasMappedTokenInTemplate(listRowTemplate, fieldMapping) ? previewRows : [firstRow];
        const repeatedRows = rowsForRepeat
          .map((r) => replaceHtml(listRowTemplate, r as Record<string, unknown>))
          .join("");
        html = buildHtmlWithRepeatedFragment(
          htmlTemplateForPreview,
          listRowTemplate,
          repeatedRows,
          replaceHtml,
          firstRow
        );
      } else {
        /**
         * 반복 템플릿(tr/list-row)이 명확하지 않은 일반 HTML은 1회만 렌더한다.
         * (JS 렌더형 포함) 행 수만큼 반복하면 중복 미리보기가 발생한다.
         */
        html = replaceHtml(htmlTemplateForPreview, firstRow);
      }
      js = shouldAggregateWidgetPreviewJsAcrossRows(styleTemplate.styleTy, jsTemplateForPreview)
        ? replaceChartPreviewJsTokens(jsTemplateForPreview, previewRows as Record<string, unknown>[], getChartJsCellDisplayPlain)
        : replaceJsTokens(jsTemplateForPreview, firstRow);

      return { html, css, js };
    };

    const guessedBasicForPin = tryParseBasicStyleFromCss(styleTemplate.css) ?? DEFAULT_BASIC_PREVIEW;
    const plain = composePreview(false);
    const i18n = composePreview(true);
    const ty = styleTemplate.styleTy || "";
    setStylePreviewDocPlain(
      buildWidgetStylePreviewSrcDoc(plain.html, plain.css, ty, {
        js: plain.js || undefined,
        pinBasicStyleChrome: guessedBasicForPin,
      })
    );
    setStylePreviewDocI18n(
      buildWidgetStylePreviewSrcDoc(i18n.html, i18n.css, ty, {
        js: i18n.js || undefined,
        injectI18nHitLayer: true,
        i18nDragMimeType: WIDGET_LANG_DND_MIME,
        pinBasicStyleChrome: guessedBasicForPin,
      })
    );
  }, [styleTemplate, datasetPreviewRows, fieldMapping, langMapping, langGb, previewTokenLabels]);

  /** 드래그 매핑 → mappingJson.dataList·langList 자동 동기화 */
  useEffect(() => {
    setMappingJson((prev) => {
      let root: Record<string, unknown>;
      try {
        root = JSON.parse(prev.trim() || "{}") as Record<string, unknown>;
      } catch {
        return prev;
      }
      if (styleTemplate) {
        const dataList: Record<string, string> = {};
        styleTemplateTokens.forEach((t) => {
          const col = fieldMapping[t];
          if (col) dataList[t] = col;
        });
        root.dataList = dataList;
      }

      const langOut: Record<string, unknown> = {};
      Object.entries(langMapping).forEach(([columnKey, e]) => {
        langOut[columnKey] = langEntryToJsonObject(e);
      });
      root.langList = langOut;
      delete root.i18nSlots;

      return JSON.stringify(root, null, 2);
    });
  }, [fieldMapping, langMapping, styleTemplate, styleTemplateTokens]);

  useLayoutEffect(() => {
    const el = previewIframeRef.current;
    if (el) {
      el.removeAttribute("srcdoc");
      el.srcdoc = stylePreviewDocPlain || stylePreviewPlaceholderHtml;
    }
  }, [stylePreviewDocPlain, stylePreviewPlaceholderHtml]);

  /** FILE_SQ 변경 시 CM_FILE 바이너리 미리보기(JWT fetch → blob URL) */
  useEffect(() => {
    if (widgetPhotoPreviewRevokeRef.current) {
      globalThis.URL.revokeObjectURL(widgetPhotoPreviewRevokeRef.current);
      widgetPhotoPreviewRevokeRef.current = null;
    }
    setWidgetPhotoPreviewUrl(undefined);
    const sq = fileSq.trim();
    if (!sq) return;
    let cancelled = false;
    fetchWidgetImageBlobUrl(sq).then((url) => {
      if (cancelled || !url) return;
      widgetPhotoPreviewRevokeRef.current = url;
      setWidgetPhotoPreviewUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [fileSq]);

  useEffect(() => {
    return () => {
      if (widgetPhotoPreviewRevokeRef.current) {
        globalThis.URL.revokeObjectURL(widgetPhotoPreviewRevokeRef.current);
        widgetPhotoPreviewRevokeRef.current = null;
      }
    };
  }, []);

  const handleWidgetPhotoFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    setWidgetPhotoUploading(true);
    EgovNet.requestFetch(
      "/widget/uploadWidgetImage",
      { method: "POST", body: fd },
      (resp) => {
        setWidgetPhotoUploading(false);
        if (Number(resp?.resultCode) !== Number(CODE.RCV_SUCCESS)) {
          alert(resp?.resultMessage || i18nText.msgImageUploadFailed);
          return;
        }
        const r = resp?.result as { fileSq?: string } | undefined;
        if (r?.fileSq != null && String(r.fileSq).trim() !== "") {
          setFileSq(String(r.fileSq).trim());
        }
      },
      () => {
        setWidgetPhotoUploading(false);
        alert(i18nText.msgErrorOnImageUpload);
      }
    );
  }, [i18nText.msgErrorOnImageUpload, i18nText.msgImageUploadFailed]);

  const handleWidgetPhotoClear = useCallback(() => {
    setFileSq("");
  }, []);

  const fetchNextId = useCallback(
    (cb: (id: string) => void) => {
      if (!cmpnyCd?.trim()) {
        alert(i18nText.msgSelectCompany);
        return;
      }
      const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
      EgovNet.requestFetch(
        `/widget/nextWidgetId?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          const id = (resp?.result as { widgetId?: string })?.widgetId;
          if (id) cb(id);
          else alert(i18nText.msgFailGenerateWidgetId);
        },
        () => alert(i18nText.msgFailGenerateWidgetId)
      );
    },
    [cmpnyCd, i18nText.msgFailGenerateWidgetId, i18nText.msgSelectCompany]
  );

  const handleReset = () => {
    setSelectedId(null);
    setIsNew(true);
    setWidgetName("");
    setUseFl("Y");
    setCategoryCd(categoryOptions[0]?.code || "");
    setDatasetId("");
    setStyleId("");
    setMappingDatasetTy("");
    setMappingStyleTy("");
    clearMappingStateForNewDatasetOrStyle();
    setConfigJson(DEFAULT_CONFIG);
    setFileSq("");
    setAuthorsDetail([]);
    setMainTab("mapping");
    setWidgetId("");
  };

  /** 스타일 미리보기(iframe): 마우스로 문구 선택(또는 클릭) → 칩을 미리보기·파란 영역에 드롭 → langList */
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as
        | { type?: string; token?: string; column?: string; payload?: string; phrase?: string }
        | undefined;
      if (!d) return;
      if (d.type === "WGS_I18N_PREVIEW_HIT") {
        const token = String(d.token || "").trim();
        let col = String(d.column || "").trim();
        if (!col && token && fieldMapping[token]) col = String(fieldMapping[token]).trim();
        const phrase = String(d.phrase || "").trim();
        if (col) setI18nPreviewSelection({ token, column: col, ...(phrase ? { phrase } : {}) });
        else setI18nPreviewSelection(token ? { token, column: "", ...(phrase ? { phrase } : {}) } : null);
        return;
      }
      if (d.type === "WGS_I18N_DROP") {
        const token = String(d.token || "").trim();
        let col = String(d.column || "").trim();
        if (!col && token && fieldMapping[token]) col = String(fieldMapping[token]).trim();
        if (!col && token) col = token;
        const raw = String(d.payload || "");
        const phrase = String(d.phrase || "").trim() || undefined;
        if (!col || !raw) return;
        const entry = extractLangEntryFromDragData(raw);
        if (!entry) return;
        setLangMapping((prev) => ({
          ...prev,
          [col]: mergeLangChipIntoColumnEntry(prev[col], phrase, entry),
        }));
        setI18nPreviewSelection({ token: token || col, column: col, ...(phrase ? { phrase } : {}) });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [fieldMapping]);

  const handleCopy = useCallback(() => {
    if (!widgetName.trim()) {
      alert(i18nText.msgNoWidgetNameToCopy);
      return;
    }
    fetchNextId((id) => {
      setWidgetId(id);
      setIsNew(true);
      setSelectedId(null);
      setWidgetName(`${widgetName.trim().slice(0, 90)}${i18nText.etcCopySuffix}`);
    });
  }, [fetchNextId, i18nText.etcCopySuffix, i18nText.msgNoWidgetNameToCopy, widgetName]);

  const authorCdListForSave = (): string[] =>
    authorsDetail.map((a) => String(a.authorCd || "").trim()).filter(Boolean);

  const buildBody = (): Record<string, unknown> | null => {
    const wName = String(widgetName ?? "").trim();
    const wId = String(widgetId ?? "").trim();
    const dsId = String(datasetId ?? "").trim();
    const stId = String(styleId ?? "").trim();
    const cat = String(categoryCd ?? "").trim();

    if (isNew && !wId) {
      alert(i18nText.msgWidgetIdPending);
      return null;
    }
    const missing: string[] = [];
    if (!wName) missing.push(i18nText.labelWidgetName);
    if (!wId) missing.push(i18nText.labelWidgetId);
    if (!cat) missing.push(i18nText.labelFieldCategory);
    if (!dsId) missing.push(i18nText.labelFieldDatasetName);
    if (!stId) missing.push(i18nText.labelFieldStyleName);
    if (missing.length > 0) {
      alert(`${i18nText.msgRequiredFieldsIntro}\n${missing.join(", ")}`);
      return null;
    }
    if (wName.length > MAX_WIDGET_NAME) {
      alert(replaceI18nPlaceholders(i18nText.msgWidgetNameMax, { max: MAX_WIDGET_NAME }));
      return null;
    }
    if (wId.length > MAX_WIDGET_ID) {
      alert(replaceI18nPlaceholders(i18nText.msgWidgetIdMax, { max: MAX_WIDGET_ID }));
      return null;
    }
    if (fileSq.trim().length > MAX_FILE_SQ) {
      alert(replaceI18nPlaceholders(i18nText.msgFileSqMax, { max: MAX_FILE_SQ }));
      return null;
    }
    let mappingStr = mappingJson.trim();
    let configStr = configJson.trim();
    try {
      if (mappingStr) JSON.parse(mappingStr);
      else mappingStr = "{}";
    } catch {
      alert(i18nText.msgInvalidMappingJson);
      return null;
    }
    try {
      if (configStr) JSON.parse(configStr);
      else configStr = "{}";
    } catch {
      alert(i18nText.msgInvalidConfigJson);
      return null;
    }

    return {
      cmpnyCd: cmpnyCd.trim(),
      widgetId: wId,
      widgetName: wName,
      datasetId: dsId,
      styleId: stId,
      categoryCd: cat,
      mappingJson: mappingStr,
      configJson: configStr,
      fileSq: fileSq.trim() || null,
      useFl: useFl || "Y",
      authorCdList: authorCdListForSave(),
    };
  };

  const handleSave = () => {
    const body = buildBody();
    if (!body) return;

    if (isNew) {
      EgovNet.requestFetch(
        "/widget",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            alert(i18nText.msgSaved);
            loadList();
            loadDetail(body.widgetId as string);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnSave);
            const focusInfo = resp?.result as { duplicateKey?: string } | undefined;
            if (focusInfo?.duplicateKey === "WIDGET_ID") {
              setTimeout(() => widgetIdInputRef.current?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnSave)
      );
    } else {
      EgovNet.requestFetch(
        "/widget",
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            alert(i18nText.msgUpdated);
            loadList();
            loadDetail(body.widgetId as string);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnUpdate);
          }
        },
        () => alert(i18nText.msgErrorOnUpdate)
      );
    }
  };

  const handleDelete = () => {
    if (isNew || !widgetId.trim()) return;
    if (!window.confirm(i18nText.msgConfirmDeleteWidget)) return;
    const q = new URLSearchParams({ widgetId: widgetId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widget?${q.toString()}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgDeleted);
          handleReset();
          loadList();
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const filteredDatasetOptions = useMemo(() => {
    if (!mappingDatasetTy.trim()) return datasetOptions;
    const ty = mappingDatasetTy.trim().toUpperCase();
    return datasetOptions.filter((d) => (d.datasetTy || "").toUpperCase() === ty);
  }, [datasetOptions, mappingDatasetTy]);

  const filteredStyleOptions = useMemo(() => {
    if (!mappingStyleTy.trim()) return styleOptions;
    const ty = mappingStyleTy.trim().toUpperCase();
    return styleOptions.filter((s) => (s.styleTy || "").toUpperCase() === ty);
  }, [styleOptions, mappingStyleTy]);

  /** 목록이 늦게 올 때 한 번만: 선택된 데이터셋/스타일 유형으로 필터 맞춤(이후 사용자 변경은 유지) */
  const mappingDatasetTyHydratedRef = useRef(false);
  const mappingStyleTyHydratedRef = useRef(false);
  useEffect(() => {
    mappingDatasetTyHydratedRef.current = false;
    mappingStyleTyHydratedRef.current = false;
  }, [selectedId]);
  useEffect(() => {
    if (mappingDatasetTyHydratedRef.current || !datasetId?.trim()) return;
    const d = datasetOptions.find((x) => x.datasetId === datasetId);
    if (!d?.datasetTy) return;
    setMappingDatasetTy(d.datasetTy);
    mappingDatasetTyHydratedRef.current = true;
  }, [datasetId, datasetOptions]);
  useEffect(() => {
    if (mappingStyleTyHydratedRef.current || !styleId?.trim()) return;
    const s = styleOptions.find((x) => x.styleId === styleId);
    if (!s?.styleTy) return;
    setMappingStyleTy(s.styleTy);
    mappingStyleTyHydratedRef.current = true;
  }, [styleId, styleOptions]);

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.pageTitle}</h1>
          <ul>
            <li>
              <Link to={URL.MAIN} className="home">
                {i18nText.navHome}
              </Link>
            </li>
            <li>
              <Link to={URL.SITES}>{i18nText.navSiteManage}</Link>
            </li>
            <li>{i18nText.pageTitle}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents md-widget-dataset-page md-widget-style-page">
            <div className="condition md-condition md-condition-plain-row">
              <div className="left-box">
                <label className="f_select" htmlFor="wgt_cmpny">
                  <select
                    id="wgt_cmpny"
                    value={cmpnyCd}
                    onChange={(e) => onCompanyChange(e.target.value)}
                  >
                    {companyList.map((c) => (
                      <option key={c.cmpnyCd} value={c.cmpnyCd}>
                        {c.cmpnyNm}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="right-box">
                <button type="button" className="pd-btn" onClick={handleReset}>{i18nText.btnReset}</button>
                <button type="button" className="pd-btn" onClick={handleCopy}>{i18nText.btnCopy}</button>
                <button type="button" className="pd-btn" onClick={handleDelete} disabled={isNew} style={{ opacity: isNew ? 0.5 : 1, cursor: isNew ? "not-allowed" : "pointer" }}>{i18nText.btnDelete}</button>
                <button type="button" className="pd-btn primary" onClick={handleSave}>{i18nText.btnSave}</button>
              </div>
            </div>

            <div
              className="md-widget-dataset-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.2fr)",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              <section className="md-form-card md-widget-dataset-left">
                <h3 className="system-subtitle" style={{ margin: 0, marginBottom: 12 }}>
                  {i18nText.titleWidgetList}
                </h3>
                <div className="f_group pop_form_label_top md-wds-list-search-row">
                  <div className="md-wds-list-search-field">
                    <label className="f_label" htmlFor="wgt_list_search_category">
                      {i18nText.labelCategory}
                    </label>
                    <select id="wgt_list_search_category" className="f_select" value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
                      <option value="">{i18nText.etcAll}</option>
                      {categoryOptions.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md-wds-list-search-field md-wds-list-search-field--grow">
                    <label className="f_label" htmlFor="wgt_list_search_name">
                      {i18nText.labelWidgetName}
                    </label>
                    <input
                      id="wgt_list_search_name"
                      className="f_input"
                      value={searchWidgetName}
                      onChange={(e) => setSearchWidgetName(e.target.value)}
                      placeholder={i18nText.placeholderSearch}
                    />
                  </div>
                  <button type="button" className="pd-btn primary" onClick={() => loadList()}>
                    {i18nText.btnSearch}
                  </button>
                </div>

                <div className="board_list BRD006 md-admin-list md-widget-dataset-list board_list--flat" style={{ maxHeight: 520, overflow: "auto" }}>
                  <div className="head">
                    <span>{i18nText.labelWidgetName}</span>
                    <span>{i18nText.labelData}</span>
                    <span>{i18nText.labelStyle}</span>
                    <span>{i18nText.etcColumnUse}</span>
                  </div>
                  <div className="result">
                    {list.map((row) => (
                      <button
                        type="button"
                        key={row.widgetId}
                        className={`list_item ${selectedId === row.widgetId && !isNew ? "is-selected" : ""}`}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background:
                            selectedId === row.widgetId && !isNew ? "var(--md-surface-variant, #e8eef2)" : "transparent",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--md-outline-variant, #e0e0e0)",
                        }}
                        onClick={() => loadDetail(row.widgetId)}
                      >
                        <span className="ellipsis" title={row.widgetName}>
                          {row.widgetName}
                        </span>
                        <span>{labelDataTy(row.datasetTy)}</span>
                        <span>{labelStyleTy(row.styleTy)}</span>
                        <span>{row.useFl}</span>
                      </button>
                    ))}
                    {list.length === 0 && (
                      <div className="list_item" style={{ padding: 16, color: "#666" }}>
                        {i18nText.msgNoQueryResult}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="md-form-card">
                <h3 className="system-subtitle" style={{ margin: 0, marginBottom: 12 }}>
                  {i18nText.titleWidgetInfo}
                </h3>

                <div className="f_group pop_form_label_top" style={{ marginTop: 16 }}>
                  <div className="md-bbs-basic-form-grid">
                    <label className="f_label md-bbs-form-label" htmlFor="wgt_widget_name">
                      {i18nText.labelWidgetName}
                      <span style={{ color: "#c00" }}>*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        id="wgt_widget_name"
                        className="f_input"
                        maxLength={MAX_WIDGET_NAME}
                        value={widgetName}
                        onChange={(e) => setWidgetName(e.target.value)}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="wgt_widget_id">
                      {i18nText.labelWidgetId}
                      <span style={{ color: "#c00" }}>*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        id="wgt_widget_id"
                        ref={widgetIdInputRef}
                        className="f_input"
                        readOnly
                        disabled
                        maxLength={MAX_WIDGET_ID}
                        value={widgetId}
                        title={i18nText.etcWidgetIdAutoTitle}
                        style={{
                          background: "var(--md-surface-variant, #e8eaed)",
                          color: "#1e293b",
                          cursor: "not-allowed",
                        }}
                      />
                    </div>
                    <span className="f_label md-bbs-form-label" id="wgt_use_label">
                      {i18nText.labelUseYn}
                    </span>
                    <div className="md-bbs-form-control" role="group" aria-labelledby="wgt_use_label">
                      <div style={{ display: "flex", gap: 16, alignItems: "center", minHeight: 40, flexWrap: "wrap" }}>
                        <label>
                          <input type="radio" name="wgt_use" checked={useFl === "Y"} onChange={() => setUseFl("Y")} />{" "}
                          {i18nText.etcColumnUse}
                        </label>
                        <label>
                          <input type="radio" name="wgt_use" checked={useFl === "N"} onChange={() => setUseFl("N")} />{" "}
                          {i18nText.etcUseYnNo}
                        </label>
                      </div>
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="wgt_category_cd">
                      {i18nText.labelCategory}
                      <span style={{ color: "#c00" }}>*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <select id="wgt_category_cd" className="f_select" value={categoryCd} onChange={(e) => setCategoryCd(e.target.value)}>
                        <option value="">{i18nText.etcSelect}</option>
                        {categoryOptions.map((o) => (
                          <option key={o.code} value={o.code}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="f_label md-bbs-form-label md-bbs-form-label--top" htmlFor="wgt_photo_text">
                      {i18nText.labelWidgetPhoto}
                    </label>
                    <div className="md-bbs-form-control md-bbs-form-control--span-cols-3">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                        <input
                          id="wgt_photo_text"
                          type="text"
                          className="f_input"
                          readOnly
                          value={fileSqDisplayText}
                          placeholder={i18nText.placeholderDisplayOnImageSelect}
                          style={{ flex: "1 1 220px", maxWidth: 320 }}
                        />
                        <input
                          ref={widgetPhotoInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleWidgetPhotoFileChange}
                        />
                        <button
                          type="button"
                          className="btn btn_skyblue_h46"
                          disabled={widgetPhotoUploading}
                          onClick={() => widgetPhotoInputRef.current?.click()}
                        >
                          {widgetPhotoUploading ? i18nText.etcUploading : i18nText.btnSelectImage}
                        </button>
                        {fileSq.trim() !== "" && (
                          <button type="button" className="btn btn_skyblue_h46" onClick={handleWidgetPhotoClear}>
                            {i18nText.btnDeletePhoto}
                          </button>
                        )}
                      </div>
                      {widgetPhotoPreviewUrl && (
                        <img
                          src={widgetPhotoPreviewUrl}
                          alt={i18nText.altWidgetPhotoPreview}
                          style={{
                            marginTop: 10,
                            display: "block",
                            maxHeight: 140,
                            maxWidth: "100%",
                            borderRadius: 8,
                            border: "1px solid var(--md-outline-variant,#e0e0e0)",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="f_group pop_form_label_top" style={{ marginTop: 12 }}>
                  <div className="md-bbs-basic-form-grid">
                    <label className="f_label md-bbs-form-label" htmlFor="wgt_mapping_dataset_ty">
                      {i18nText.labelDataTy}
                    </label>
                    <div className="md-bbs-form-control">
                      <select
                        id="wgt_mapping_dataset_ty"
                        className="f_select"
                        value={mappingDatasetTy}
                        onChange={(e) => {
                          const v = e.target.value;
                          setMappingDatasetTy(v);
                          const cur = datasetOptions.find((x) => x.datasetId === datasetId);
                          if (cur && v && (cur.datasetTy || "").toUpperCase() !== v.toUpperCase()) {
                            clearMappingStateForNewDatasetOrStyle();
                            setDatasetId("");
                          }
                        }}
                      >
                        <option value="">{i18nText.etcAll}</option>
                        {dataTypeOptions.length > 0 ? (
                          dataTypeOptions.map((o) => (
                            <option key={o.code} value={o.code}>
                              {o.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="SQL">SQL</option>
                            <option value="API">API</option>
                            <option value="STATIC">STATIC</option>
                          </>
                        )}
                      </select>
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="wgt_mapping_dataset_id">
                      {i18nText.labelFieldDatasetName}
                      <span style={{ color: "#c00" }}>*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <select
                        id="wgt_mapping_dataset_id"
                        className="f_select"
                        value={datasetId}
                        onChange={(e) => {
                          const id = e.target.value;
                          if (id !== datasetId) clearMappingStateForNewDatasetOrStyle();
                          setDatasetId(id);
                          const d = datasetOptions.find((x) => x.datasetId === id);
                          if (d?.datasetTy) setMappingDatasetTy(d.datasetTy);
                        }}
                      >
                        <option value="">{i18nText.etcSelect}</option>
                        {filteredDatasetOptions.map((d) => (
                          <option key={d.datasetId} value={d.datasetId}>
                            {d.datasetName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="f_label md-bbs-form-label" htmlFor="wgt_mapping_style_ty">
                      {i18nText.labelStyleTy}
                    </label>
                    <div className="md-bbs-form-control">
                      <select
                        id="wgt_mapping_style_ty"
                        className="f_select"
                        value={mappingStyleTy}
                        onChange={(e) => {
                          const v = e.target.value;
                          setMappingStyleTy(v);
                          const cur = styleOptions.find((x) => x.styleId === styleId);
                          if (cur && v && (cur.styleTy || "").toUpperCase() !== v.toUpperCase()) {
                            clearMappingStateForNewDatasetOrStyle();
                            setStyleId("");
                          }
                        }}
                      >
                        {styleTypeOptions.length > 0 ? (
                          <>
                            <option value="">{i18nText.etcAll}</option>
                            {styleTypeOptions.map((o) => (
                              <option key={o.code} value={o.code}>
                                {o.name}
                              </option>
                            ))}
                          </>
                        ) : (
                          <option value="">{i18nText.etcCodeLoading}</option>
                        )}
                      </select>
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="wgt_mapping_style_id">
                      {i18nText.labelStyleNameField}
                      <span style={{ color: "#c00" }}>*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <select
                        id="wgt_mapping_style_id"
                        className="f_select"
                        value={styleId}
                        onChange={(e) => {
                          const id = e.target.value;
                          if (id !== styleId) clearMappingStateForNewDatasetOrStyle();
                          setStyleId(id);
                          const s = styleOptions.find((x) => x.styleId === id);
                          if (s?.styleTy) setMappingStyleTy(s.styleTy);
                        }}
                      >
                        <option value="">{i18nText.etcSelect}</option>
                        {filteredStyleOptions.map((s) => (
                          <option key={s.styleId} value={s.styleId}>
                            {s.styleName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <MdUnderlineTabs<"mapping" | "i18n" | "auth" | "check">
                  aria-label={i18nText.etcWidgetDetailTabsAria}
                  value={mainTab}
                  onChange={(v) => setMainTab(v)}
                  sx={{ mt: 2, mb: 1.5 }}
                  items={[
                    { value: "mapping", label: i18nText.tabMapping },
                    { value: "i18n", label: i18nText.tabI18n },
                    { value: "auth", label: i18nText.tabAuth },
                    { value: "check", label: i18nText.tabCheck },
                  ]}
                />

                <div style={{ paddingTop: 16 }}>
                  {mainTab === "mapping" && (
                    <div className="f_group pop_form_label_top">
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelDataPreview}</label>
                        {datasetPreviewMsg && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#9f1239" }}>{datasetPreviewMsg}</p>}
                        {datasetPreviewCols.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                            {datasetPreviewCols.map((col) => (
                              <span
                                key={col}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData("text/plain", col)}
                                style={{
                                  display: "inline-block",
                                  fontSize: 12,
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  background: "#f8fafc",
                                  cursor: "grab",
                                }}
                                title={i18nText.etcDragColToStyleField}
                              >
                                {col}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "auto", maxHeight: 180 }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr>
                                {datasetPreviewCols.map((c) => (
                                  <th key={c} style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                                    {resolveMappedColumnHeaderPreviewText(c, langMapping[c], langGb)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {datasetPreviewRows.slice(0, 5).map((r, i) => (
                                <tr key={i}>
                                  {datasetPreviewCols.map((c) => (
                                    <td key={c} style={{ padding: 6, borderBottom: "1px solid #f1f5f9" }}>
                                      {String((r as Record<string, unknown>)[c] ?? "")}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {datasetPreviewRows.length === 0 && (
                            <div style={{ padding: 10, color: "#64748b", fontSize: 12 }}>
                              {i18nText.msgSelectDatasetForPreview}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelStyleHandleMapping}</label>
                        {styleTemplateTokens.length === 0 ? (
                          <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>{i18nText.msgNoHandlebarsInStyleTemplate}</p>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {styleTemplateTokens.map((token) => (
                              <div
                                key={token}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const rawLang = e.dataTransfer.getData(WIDGET_LANG_DND_MIME);
                                  if (rawLang) {
                                    const entry = extractLangEntryFromDragData(rawLang);
                                    if (!entry) return;
                                    applyI18nEntryToToken(token, entry);
                                    return;
                                  }
                                  const col = e.dataTransfer.getData("text/plain");
                                  if (!col) return;
                                  setFieldMapping((prev) => ({ ...prev, [token]: col }));
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  border: fieldMapping[token] ? "1px solid #60a5fa" : "1px dashed #94a3b8",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  background: fieldMapping[token] ? "#dbeafe" : "#f8fafc",
                                }}
                                title={i18nText.etcDropDataColumnOnToken}
                              >
                                <strong style={{ fontSize: 12 }}>{`{{${token}}}`}</strong>
                                {styleTemplateTokenInfo.jsOnlyTokens.includes(token) && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      lineHeight: "16px",
                                      padding: "0 6px",
                                      borderRadius: 999,
                                      background: "#e2e8f0",
                                      color: "#334155",
                                    }}
                                    title={i18nText.etcJsOnlyTokenTitle}
                                  >
                                    JS
                                  </span>
                                )}
                                <span style={{ fontSize: 12, color: "#334155" }}>
                                  {fieldMapping[token] ? `→ ${fieldMapping[token]}` : i18nText.etcUnmappedMapping}
                                </span>
                                {fieldMapping[token] && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFieldMapping((prev) => {
                                        const next = { ...prev };
                                        delete next[token];
                                        return next;
                                      })
                                    }
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      color: "#64748b",
                                      cursor: "pointer",
                                      fontSize: 12,
                                    }}
                                    title={i18nText.etcClearMappingTitle}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="f_group_item">
                        <label className="f_label">{i18nText.titleStylePreview}</label>
                        <div
                          className="md-widget-style-preview-wrap"
                          style={{
                            border: "1px solid var(--md-outline-variant, #e0e0e0)",
                            borderRadius: 8,
                            padding: 8,
                            background: "#e8eaed",
                            minHeight: 120,
                            overflow: "auto",
                          }}
                        >
                          <iframe
                            ref={previewIframeRef}
                            title={i18nText.iframeStylePreview}
                            className="md-widget-style-preview-iframe"
                            srcDoc={stylePreviewDocPlain || stylePreviewPlaceholderHtml}
                            style={{
                              width: "100%",
                              minHeight: 360,
                              border: 0,
                              display: "block",
                              background: "#fff",
                            }}
                          />
                        </div>
                      </div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelMappingJson}</label>
                        <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{i18nText.etcMappingJsonHint}</p>
                        <textarea
                          className="f_textarea"
                          style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: 13 }}
                          value={mappingJson}
                          onChange={(e) => {
                            const v = e.target.value;
                            setMappingJson(v);
                            const dl = parseMappingDataList(v);
                            if (dl) {
                              setFieldMapping((prev) => {
                                const next = { ...prev };
                                styleTemplateTokens.forEach((t) => {
                                  if (dl[t]) next[t] = dl[t];
                                  else delete next[t];
                                });
                                return next;
                              });
                            }
                            setLangMapping(parseMappingLangList(v));
                          }}
                        />
                      </div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelConfigJson}</label>
                        <textarea
                          className="f_textarea"
                          style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: 13 }}
                          value={configJson}
                          onChange={(e) => setConfigJson(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {mainTab === "i18n" && (
                    <div className="f_group pop_form_label_top">
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.titleStylePreview}</label>
                        {i18nPreviewSelection?.column ? (
                          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#0f172a" }}>
                            {i18nText.etcI18nSelectedLine} <code>{`{{${i18nPreviewSelection.token}}}`}</code>
                            {i18nText.etcI18nColumnLead}
                            <strong>{i18nPreviewSelection.column}</strong>
                            {i18nPreviewSelection.phrase ? (
                              <>
                                {" "}
                                {i18nText.etcI18nPhrasePart} <strong>{i18nPreviewSelection.phrase}</strong>
                              </>
                            ) : null}
                            <button
                              type="button"
                              className="btn btn_skyblue_h46"
                              style={{ marginLeft: 8 }}
                              onClick={() => setI18nPreviewSelection(null)}
                            >
                              {i18nText.btnClearI18nSelection}
                            </button>
                          </p>
                        ) : (
                          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8" }}>
                            {i18nText.etcI18nSelectInstruction}
                          </p>
                        )}
                        <div
                          className="md-widget-style-preview-wrap"
                          style={{
                            border: "1px solid var(--md-outline-variant, #e0e0e0)",
                            borderRadius: 8,
                            padding: 8,
                            background: "#e8eaed",
                            minHeight: 120,
                            overflow: "auto",
                          }}
                        >
                          <iframe
                            title={i18nText.iframeI18nStylePreview}
                            className="md-widget-style-preview-iframe"
                            srcDoc={stylePreviewDocI18n || stylePreviewPlaceholderHtml}
                            style={{
                              width: "100%",
                              minHeight: 360,
                              border: 0,
                              display: "block",
                              background: "#fff",
                            }}
                          />
                        </div>
                      </div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelTokenI18nMapping}</label>
                        {i18nDropTargetTokens.length === 0 ? (
                          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>{i18nText.etcNoUnmappedTokens}</p>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                            {i18nDropTargetTokens.map((token) => (
                              <div
                                key={`i18n-drop-${token}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const rawLang = e.dataTransfer.getData(WIDGET_LANG_DND_MIME);
                                  if (!rawLang) return;
                                  const entry = extractLangEntryFromDragData(rawLang);
                                  if (!entry) return;
                                  applyI18nEntryToToken(token, entry);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  border: "1px dashed #94a3b8",
                                  borderRadius: 999,
                                  padding: "6px 10px",
                                  background: "#f8fafc",
                                }}
                                title={i18nText.etcDropLangChipTitle}
                              >
                                <strong style={{ fontSize: 12 }}>{`{{${token}}}`}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelLinkedI18n}</label>
                        {langMappingSummaryRows.length === 0 ? (
                          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{i18nText.msgNoMultilingualLinked}</p>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: "6px 4px",
                              fontSize: 13,
                              lineHeight: 1.6,
                              color: "#0f172a",
                            }}
                          >
                            {langMappingSummaryRows.map((row, i) => (
                              <React.Fragment key={row.kind === "phrase" ? `p:${row.column}:${row.phrase}` : `c:${row.column}`}>
                                {i > 0 ? (
                                  <span style={{ color: "#cbd5e1", userSelect: "none", padding: "0 2px" }} aria-hidden>
                                    /
                                  </span>
                                ) : null}
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "4px 10px",
                                    borderRadius: 8,
                                    background: "#f1f5f9",
                                    border: "1px solid #e2e8f0",
                                  }}
                                  title={
                                    row.kind === "phrase"
                                      ? replaceI18nPlaceholders(i18nText.etcLangChipRowTitlePhrase, { column: row.column })
                                      : replaceI18nPlaceholders(i18nText.etcLangChipRowTitleColumn, { column: row.column })
                                  }
                                >
                                  <span>
                                    <strong>
                                      {row.kind === "phrase"
                                        ? row.phrase
                                        : replaceI18nPlaceholders(i18nText.etcLangChipWholeColumn, { column: row.column })}
                                    </strong>
                                    <span style={{ color: "#64748b", margin: "0 4px" }}>→</span>
                                    <span>{row.label}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeLangMappingSummaryRow(row)}
                                    aria-label={i18nText.ariaClearRowMapping}
                                    title={i18nText.titleClearRowMapping}
                                    style={{
                                      border: "none",
                                      background: "#fee2e2",
                                      color: "#b91c1c",
                                      cursor: "pointer",
                                      width: 22,
                                      height: 22,
                                      lineHeight: "20px",
                                      borderRadius: 4,
                                      fontSize: 14,
                                      padding: 0,
                                      flexShrink: 0,
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.labelI18nSearch}</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          <input
                            type="text"
                            className="f_input"
                            readOnly
                            placeholder={i18nText.placeholderSelectMultilingualMessage}
                            style={{ flex: "1 1 220px", maxWidth: 400, background: "var(--md-surface-variant, #e8eaed)", cursor: "not-allowed" }}
                            value={
                              i18nDragSource
                                ? `${i18nDragSource.displayMessage || i18nDragSource.langKey} (${i18nDragSource.langKey})`
                                : ""
                            }
                          />
                          <button
                            type="button"
                            className="btn btn_blue_h46 btn-magnifier"
                            title={i18nText.titleI18nLookup}
                            aria-label={i18nText.ariaI18nLookup}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              minWidth: 32,
                              minHeight: 32,
                              padding: 0,
                            }}
                            onClick={() => {
                              if (!cmpnyCd?.trim()) {
                                alert(i18nText.msgSelectCompany);
                                return;
                              }
                              setShowI18nLookupPopup(true);
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.35-4.35" />
                            </svg>
                          </button>
                        </div>
                        {i18nDragSource ? (
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                            <span
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData(WIDGET_LANG_DND_MIME, JSON.stringify(i18nDragSource));
                                e.dataTransfer.effectAllowed = "copy";
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 13,
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid #fcd34d",
                                background: "#fffbeb",
                                cursor: "grab",
                              }}
                              title={i18nText.titleI18nDragChip}
                            >
                              <strong>{`${i18nText.etcDrag}:`}</strong>
                              <span>{i18nDragSource.displayMessage || i18nDragSource.langKey}</span>
                              <span style={{ color: "#78716c", fontSize: 12 }}>({i18nDragSource.langKey})</span>
                            </span>
                            <button type="button" className="btn btn_skyblue_h46" onClick={() => setI18nDragSource(null)}>
                              {i18nText.btnClearI18nMessage}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {mainTab === "auth" && (
                    <div className="f_group pop_form_label_top">
                      {!cmpnyCd?.trim() ? (
                        <p style={{ fontSize: 13, color: "#64748b" }}>{i18nText.msgPermissionStructure}</p>
                      ) : (
                        <WidgetAuthorAuthPanel
                          cmpnyCd={cmpnyCd.trim()}
                          assigned={authorsDetail}
                          onChangeAssigned={setAuthorsDetail}
                          t={i18nText}
                        />
                      )}
                    </div>
                  )}

                  {mainTab === "check" && (
                    <div>
                      <div className="f_group_item" style={{ marginBottom: 12 }}>
                        <label className="f_label">{i18nText.titleFinalPreview}</label>
                        <div
                          className="md-widget-style-preview-wrap"
                          style={{
                            border: "1px solid var(--md-outline-variant, #e0e0e0)",
                            borderRadius: 8,
                            padding: 8,
                            background: "#e8eaed",
                            minHeight: 120,
                            overflow: "auto",
                          }}
                        >
                          <iframe
                            title={i18nText.iframeFinalPreview}
                            className="md-widget-style-preview-iframe"
                            srcDoc={stylePreviewDocPlain || stylePreviewPlaceholderHtml}
                            style={{
                              width: "100%",
                              minHeight: 360,
                              border: 0,
                              display: "block",
                              background: "#fff",
                            }}
                          />
                        </div>
                      </div>
                      <pre
                        style={{
                          background: "#f8fafc",
                          padding: 12,
                          borderRadius: 8,
                          fontSize: 12,
                          overflow: "auto",
                          maxHeight: 320,
                        }}
                      >
                        {JSON.stringify(
                          {
                            widgetId,
                            widgetName,
                            datasetId,
                            styleId,
                            categoryCd,
                            useFl,
                            fileSq: fileSq || null,
                            mapping: mappingJson,
                            config: configJson,
                            authors: authorsDetail,
                            authorCdList: authorCdListForSave(),
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <MultilingualLookupPopup
        open={showI18nLookupPopup}
        onClose={() => setShowI18nLookupPopup(false)}
        cmpnyCd={cmpnyCd || ""}
        langCode={getLanguageCodeForApi(langGb)}
        onSelect={(langKey, displayMessage, messageMap) => {
          const messages = Object.fromEntries(messageMap.entries());
          setI18nDragSource({
            langKey: langKey.trim(),
            displayMessage: displayMessage || langKey,
            ...(Object.keys(messages).length > 0 ? { messages } : {}),
          });
        }}
      />
    </div>
  );
}

export default WidgetList;
