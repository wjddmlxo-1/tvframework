import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import CODE from "@/constants/code";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageCodeForApi } from "@/utils/language";
import { decodeHtmlEntities } from "@/utils/htmlDecode";
import {
  CMMN_WIDGET_STYLE_I18N_KEYS,
  CMMN_WIDGET_STYLE_I18N_FALLBACK,
} from "./cmmnWidgetStyleI18n";
import {
  applyWidgetPreviewTokens,
  buildCssFromBasic,
  buildWidgetStylePreviewSrcDoc,
  ensureChartPreviewCardShell,
  mergeBasicModeCssForSave,
  splitBasicModeCssStored,
  stripTrailingBasicChrome,
  tryParseBasicStyleFromCss,
  type BasicStyle,
} from "@/utils/widgetStylePreviewTokens";

const MAX_STYLE_ID = 50;
const MAX_STYLE_NAME = 100;
const MAX_STYLE_TY = 20;

type StyleRow = {
  styleId: string;
  styleName: string;
  styleTy: string;
  useFl: string;
  modifyDt?: string;
};

type CodeOpt = { code: string; name: string };

const DEFAULT_BASIC: BasicStyle = {
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

const DEFAULT_HTML = `<div class="wgs-card">
  <div class="wgs-header"><span class="wgs-title">{{title}}</span></div>
  <div class="wgs-body">
    <div class="wgs-value">{{value}}</div>
    <div class="wgs-data">{{data}}</div>
  </div>
</div>`;

const DEFAULT_JS = `function applyMapping(data, mapping) {
  return data;
}
`;

/** 상세 모드 미리보기 전 iframe 안내 — 본문은 `useMemo`(i18n)로 생성 */
const DETAIL_PREVIEW_IDLE_CSS =
  "body{margin:0;padding:16px;background:#f8fafc;font-family:system-ui,sans-serif;}strong{font-weight:600;}";

/** 신규 등록 안내 — 본문은 `useMemo`(i18n)로 생성 */
const NEW_STYLE_NO_PREVIEW_CSS =
  "body{margin:0;padding:16px;background:#f1f5f9;font-family:system-ui,sans-serif;}strong{font-weight:600;}";

type PreviewPlaceholderLabels = { title: string; value: string; data: string };

function applyPreviewPlaceholders(html: string, ph: PreviewPlaceholderLabels): string {
  return html
    .replace(/\{\{title\}\}/g, ph.title)
    .replace(/\{\{value\}\}/g, ph.value)
    .replace(/\{\{data\}\}/g, ph.data)
    .replace(/\{\{widgetId\}\}/g, "preview")
    /**
     * 스타일관리 미리보기에는 데이터셋·매핑이 없어 xLabel·uv 등이 남는다.
     * `labels:[{{xLabel}}]` 그대로면 `[{` 로 파싱되어 SyntaxError — 알려진 토큰 치환 후
     * 남은 `{{식별자}}`는 제거해 `labels:[]` 형태로 문법만 유효하게 한다(차트는 빈 데이터).
     */
    .replace(/\{\{\s*[a-zA-Z0-9_]+\s*\}\}/g, "");
}

/**
 * 인라인 JS용: `{{value}}` → "값" 같은 HTML 샘플 치환을 하면 `data:[값]` 이 되어 ReferenceError.
 * `{{widgetId}}`만 고정하고 나머지 `{{토큰}}`은 제거해 `data:[]` 등 유효한 문법만 남긴다.
 */
function applyPreviewPlaceholdersForJs(js: string): string {
  return js
    .replace(/\{\{widgetId\}\}/g, "preview")
    .replace(/\{\{\s*[a-zA-Z0-9_]+\s*\}\}/g, "");
}

/** DB에 {{WGS_*}} 토큰이 있으면 슬라이더로 치환; 이미 저장 시점에 치환된 값만 있으면 토큰 치환이 무효이므로 기본 카드 CSS로 미리보기 */
function hasWidgetStyleTokens(s: string): boolean {
  return s.includes("{{WGS_");
}

function previewHtmlForBasicMode(htmlTemplate: string, basicStyle: BasicStyle): string {
  const h = htmlTemplate.trim();
  if (!h) {
    return applyWidgetPreviewTokens(DEFAULT_HTML, basicStyle);
  }
  if (hasWidgetStyleTokens(h)) {
    return applyWidgetPreviewTokens(h, basicStyle);
  }
  return h;
}

function previewCssForBasicMode(cssTemplate: string, basicStyle: BasicStyle): string {
  let c = cssTemplate.replace(/\r\n/g, "\n").trim();
  if (!c) {
    return buildCssFromBasic(basicStyle);
  }
  const peeled = splitBasicModeCssStored(c);
  if (peeled.chromeCss != null) {
    c = peeled.customCss.trim();
  }
  if (!c) {
    return buildCssFromBasic(basicStyle);
  }
  if (hasWidgetStyleTokens(c)) {
    /** 토큰만 치환하고 끝내면 슬라이더 테두리 두께 등이 빠질 수 있음(선형 등 {{WGS_}}가 섞인 템플릿) */
    return `${applyWidgetPreviewTokens(c, basicStyle)}\n${buildCssFromBasic(basicStyle)}`;
  }
  /** 토큰 없이 저장된 DB CSS는 그대로 쓰고, 슬라이더(카드·헤더 공통 크롬)는 뒤에 붙여 동일 선택자는 슬라이더가 우선 */
  return `${c}\n${buildCssFromBasic(basicStyle)}`;
}

function previewJsForBasicMode(jsTemplate: string, basicStyle: BasicStyle): string {
  const j = jsTemplate.trim();
  if (!j) {
    return applyWidgetPreviewTokens(DEFAULT_JS, basicStyle);
  }
  if (hasWidgetStyleTokens(j)) {
    return applyWidgetPreviewTokens(j, basicStyle);
  }
  return j;
}

type WidgetStyleDetail = {
  htmlTemplate?: string;
  cssTemplate?: string;
  jsTemplate?: string;
};

function normalizeTemplatesFromApi(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "";
  const s = String(raw);
  const decoded = decodeHtmlEntities(s);
  return decoded != null && decoded.trim() !== "" ? decoded : s;
}

/**
 * 일부 저장본에서 HTML 시작 태그의 '<' 누락 또는 \" 이스케이프가 남는 경우가 있어
 * 미리보기 텍스트 노출(div class="...")을 방지하기 위한 보정.
 */
function normalizeHtmlTemplateFromApi(raw: string | undefined | null): string {
  const n = normalizeTemplatesFromApi(raw);
  if (!n) return "";
  let out = n.replace(/\\"/g, '"').replace(/\\'/g, "'");
  if (!/^\s*</.test(out) && /^\s*[a-z][\w:-]*\s+[^>]*>/i.test(out)) {
    out = out.replace(/^(\s*)([a-z][\w:-]*\s+[^>]*>)/i, "$1<$2");
  }
  return out;
}

function WidgetStyleList() {
  const { langGb } = useLanguage();
  const styleIdInputRef = useRef<HTMLInputElement | null>(null);

  const { companyList, cmpnyCd, onCompanyChange } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_WIDGET_STYLE_I18N_KEYS, CMMN_WIDGET_STYLE_I18N_FALLBACK, {
    cmpnyCd: cmpnyCd || null,
  });

  const previewPh = useMemo(
    (): PreviewPlaceholderLabels => ({
      title: i18nText.etcPreviewPlaceholderTitle,
      value: i18nText.etcPreviewPlaceholderValue,
      data: i18nText.etcPreviewPlaceholderData,
    }),
    [i18nText.etcPreviewPlaceholderTitle, i18nText.etcPreviewPlaceholderValue, i18nText.etcPreviewPlaceholderData]
  );

  const detailPreviewIdleInnerHtml = useMemo(
    () =>
      `<p class="wgs-detail-idle" style="margin:0;padding:8px 0;font-size:14px;color:#64748b;line-height:1.6;">${i18nText.etcDetailPreviewIdleBefore}<strong style="color:#0f172a;">${i18nText.btnPreview}</strong>${i18nText.etcDetailPreviewIdleAfter}</p>`,
    [i18nText.etcDetailPreviewIdleBefore, i18nText.btnPreview, i18nText.etcDetailPreviewIdleAfter]
  );

  const newStyleNoPreviewInnerHtml = useMemo(
    () =>
      `<p class="wgs-new-idle" style="margin:0;padding:12px 0;font-size:14px;color:#64748b;line-height:1.7;">${i18nText.etcNewPreviewIdleLead}<strong style="color:#0f172a;">${i18nText.etcNewPreviewIdleStrong}</strong>${i18nText.etcNewPreviewIdleTail}</p>`,
    [i18nText.etcNewPreviewIdleLead, i18nText.etcNewPreviewIdleStrong, i18nText.etcNewPreviewIdleTail]
  );

  const [styleTypeOptions, setStyleTypeOptions] = useState<CodeOpt[]>([]);
  const [searchStyleTy, setSearchStyleTy] = useState("");
  const [searchStyleName, setSearchStyleName] = useState("");
  const [list, setList] = useState<StyleRow[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [styleId, setStyleId] = useState("");
  const [styleName, setStyleName] = useState("");
  const [styleTy, setStyleTy] = useState("");
  const [useFl, setUseFl] = useState("Y");

  const [htmlTemplate, setHtmlTemplate] = useState(DEFAULT_HTML);
  /** 비어 있으면 카드·헤더 크롬은 슬라이더(basicStyle)만으로 생성·저장 */
  const [cssTemplate, setCssTemplate] = useState("");
  const [jsTemplate, setJsTemplate] = useState(DEFAULT_JS);

  const [uiMode, setUiMode] = useState<"basic" | "detail">("basic");
  const [detailTab, setDetailTab] = useState<"html" | "css" | "js">("html");
  const [basicStyle, setBasicStyle] = useState<BasicStyle>(DEFAULT_BASIC);
  /** 상세 모드: 미리보기 버튼으로만 갱신(편집 직후 자동 반영 안 함) */
  const [detailPreviewHtml, setDetailPreviewHtml] = useState<string | null>(null);
  const [detailPreviewCss, setDetailPreviewCss] = useState<string | null>(null);
  const [detailPreviewJs, setDetailPreviewJs] = useState<string | null>(null);

  const loadStyleTypes = useCallback(() => {
    const langCode = getLanguageCodeForApi(langGb);
    const q = new URLSearchParams({ langCode });
    EgovNet.requestFetch(
      `/widgetStyle/styleTypes?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setStyleTypeOptions(resp.result as CodeOpt[]);
        }
      },
      () => { }
    );
  }, [langGb]);

  const loadList = useCallback(() => {
    if (!cmpnyCd?.trim()) {
      setList([]);
      return;
    }
    const q = new URLSearchParams();
    q.set("cmpnyCd", cmpnyCd.trim());
    if (searchStyleTy) q.set("styleTy", searchStyleTy);
    if (searchStyleName.trim()) q.set("styleName", searchStyleName.trim());
    EgovNet.requestFetch(
      `/widgetStyle/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setList(resp.result as StyleRow[]);
        } else {
          setList([]);
        }
      },
      () => setList([])
    );
  }, [cmpnyCd, searchStyleTy, searchStyleName]);

  const applyDetailToForm = useCallback((d: StyleRow & Partial<WidgetStyleDetail>) => {
    setStyleId(d.styleId || "");
    setStyleName(d.styleName || "");
    setStyleTy(d.styleTy || "");
    setUseFl(d.useFl === "N" ? "N" : "Y");
    setHtmlTemplate(normalizeHtmlTemplateFromApi(d.htmlTemplate) || DEFAULT_HTML);
    const rawCss = normalizeTemplatesFromApi(d.cssTemplate);
    const fullCss = rawCss.trim() ? rawCss : buildCssFromBasic(DEFAULT_BASIC);
    const split = splitBasicModeCssStored(fullCss);
    if (split.chromeCss) {
      const parsed =
        tryParseBasicStyleFromCss(split.chromeCss) ?? tryParseBasicStyleFromCss(fullCss);
      setBasicStyle(parsed ?? DEFAULT_BASIC);
      setCssTemplate(split.customCss);
    } else {
      const parsed = tryParseBasicStyleFromCss(fullCss);
      if (parsed) {
        const { customCss } = stripTrailingBasicChrome(fullCss, parsed);
        setBasicStyle(parsed);
        setCssTemplate(customCss);
      } else {
        setBasicStyle(DEFAULT_BASIC);
        setCssTemplate(fullCss);
      }
    }
    setJsTemplate(normalizeTemplatesFromApi(d.jsTemplate) || DEFAULT_JS);
    setUiMode("basic");
    setDetailTab("html");
    setDetailPreviewHtml(null);
    setDetailPreviewCss(null);
    setDetailPreviewJs(null);
  }, []);

  const loadDetail = useCallback(
    (id: string) => {
      if (!cmpnyCd?.trim()) return;
      const q = new URLSearchParams({ styleId: id });
      q.set("cmpnyCd", cmpnyCd.trim());
      EgovNet.requestFetch(
        `/widgetStyle/detail?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.result) {
            applyDetailToForm(resp.result as StyleRow & WidgetStyleDetail);
            setSelectedId(id);
            setIsNew(false);
          }
        },
        () => alert(i18nText.msgErrorOnDetail)
      );
    },
    [applyDetailToForm, cmpnyCd, i18nText]
  );

  useEffect(() => {
    loadStyleTypes();
  }, [loadStyleTypes]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  /** 목록에서 불러온 기존 스타일(DB에 있는 행 편집 중) */
  const isPersistedStyle = useMemo(() => !isNew && selectedId != null, [isNew, selectedId]);

  /**
   * 저장·기본→상세 전환에 쓰는 최종 HTML/CSS/JS.
   * - 기본 스타일: 편집기·슬라이더 상태만 사용(DB/서버 샘플 API 미사용). 신규·기존 동일.
   * - 상세 스타일: 편집기 문자열 그대로.
   */
  const getTemplatesForSave = () => {
    if (uiMode === "basic") {
      const jsMerged = previewJsForBasicMode(jsTemplate, basicStyle);
      return {
        html: previewHtmlForBasicMode(htmlTemplate, basicStyle),
        css: mergeBasicModeCssForSave(cssTemplate, basicStyle),
        js: jsMerged.trim() ? jsMerged : DEFAULT_JS,
      };
    }
    return {
      html: htmlTemplate,
      css: cssTemplate,
      js: jsTemplate,
    };
  };

  /** 기본 스타일 화면에서 복사·저장 전 HTML/CSS/JS 상태를 동기화 */
  const syncBasicToTemplates = () => {
    if (uiMode !== "basic") return;
    const t = getTemplatesForSave();
    setHtmlTemplate(t.html);
    setCssTemplate(t.css);
    setJsTemplate(t.js);
  };

  const applyDetailPreview = useCallback(() => {
    if (uiMode !== "detail") return;
    const rawHtml = ensureChartPreviewCardShell(previewHtmlForBasicMode(htmlTemplate, basicStyle), styleTy);
    const inner = applyPreviewPlaceholders(rawHtml, previewPh);
    const css = previewCssForBasicMode(cssTemplate, basicStyle);
    const jsRaw = previewJsForBasicMode(jsTemplate, basicStyle);
    setDetailPreviewHtml(inner);
    setDetailPreviewCss(css);
    setDetailPreviewJs(jsRaw.trim() ? applyPreviewPlaceholdersForJs(jsRaw) : "");
  }, [uiMode, htmlTemplate, cssTemplate, jsTemplate, basicStyle, styleTy, previewPh]);

  const handleToggleDetail = () => {
    if (uiMode === "basic") {
      const t = getTemplatesForSave();
      setHtmlTemplate(t.html);
      setCssTemplate(t.css);
      setJsTemplate(t.js);
      setDetailPreviewHtml(null);
      setDetailPreviewCss(null);
      setDetailPreviewJs(null);
      setDetailTab("html");
      setUiMode("detail");
    } else {
      setDetailPreviewHtml(null);
      setDetailPreviewCss(null);
      setDetailPreviewJs(null);
      setUiMode("basic");
    }
  };

  const fetchNextId = (cb: (id: string) => void) => {
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetStyle/nextStyleId?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const id = (resp?.result as { styleId?: string })?.styleId;
        if (id) cb(id);
        else alert(i18nText.msgFailGenerateStyleId);
      },
      () => alert(i18nText.msgFailGenerateStyleId)
    );
  };

  const handleReset = () => {
    setSelectedId(null);
    setIsNew(true);
    setStyleName("");
    setStyleTy(styleTypeOptions[0]?.code || "");
    setUseFl("Y");
    setHtmlTemplate(DEFAULT_HTML);
    setCssTemplate("");
    setJsTemplate(DEFAULT_JS);
    setBasicStyle(DEFAULT_BASIC);
    setUiMode("basic");
    setDetailTab("html");
    setDetailPreviewHtml(null);
    setDetailPreviewCss(null);
    setDetailPreviewJs(null);
    fetchNextId((id) => {
      setStyleId(id);
      setTimeout(() => styleIdInputRef.current?.focus(), 0);
    });
  };

  const handleCopy = () => {
    if (!styleName.trim()) {
      alert(i18nText.msgNoStyleNameToCopy);
      return;
    }
    if (uiMode === "basic") {
      syncBasicToTemplates();
    }
    fetchNextId((id) => {
      setStyleId(id);
      setStyleName(`${styleName.trim().slice(0, 90)}${i18nText.etcCopySuffix}`);
      setIsNew(true);
      setSelectedId(null);
      setTimeout(() => styleIdInputRef.current?.focus(), 0);
    });
  };

  const buildBody = (): Record<string, string> | null => {
    if (!styleName.trim() || !styleId.trim() || !styleTy.trim()) {
      alert(i18nText.msgRequiredFields);
      return null;
    }
    /** 기본=슬라이더·샘플 반영값, 상세=편집기 그대로 */
    const t = getTemplatesForSave();
    return {
      cmpnyCd: cmpnyCd.trim(),
      styleId: styleId.trim(),
      styleName: styleName.trim(),
      styleTy: styleTy.trim(),
      htmlTemplate: t.html,
      cssTemplate: t.css,
      jsTemplate: t.js,
      useFl: useFl || "Y",
    };
  };

  const handleSave = () => {
    const body = buildBody();
    if (!body) return;

    if (isNew) {
      EgovNet.requestFetch(
        "/widgetStyle",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            alert(i18nText.msgSaved);
            loadList();
            loadDetail(body.styleId);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnSave);
            const focusInfo = resp?.result as { duplicateKey?: string } | undefined;
            if (focusInfo?.duplicateKey === "STYLE_ID") {
              setTimeout(() => styleIdInputRef.current?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnSave)
      );
    } else {
      EgovNet.requestFetch(
        "/widgetStyle",
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            alert(i18nText.msgUpdated);
            loadList();
            loadDetail(body.styleId);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnUpdate);
          }
        },
        () => alert(i18nText.msgErrorOnUpdate)
      );
    }
  };

  const handleDelete = () => {
    if (isNew || !styleId.trim()) return;
    if (!window.confirm(i18nText.msgConfirmDeleteStyle)) return;
    const q = new URLSearchParams({ styleId: styleId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetStyle?${q.toString()}`,
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

  useEffect(() => {
    if (uiMode !== "detail") return;
    setDetailPreviewHtml(null);
    setDetailPreviewCss(null);
    setDetailPreviewJs(null);
  }, [styleTy, uiMode]);

  /** 기본 스타일 모드 iframe: DB에 있는 행만 실제 미리보기(신규는 안내 문구만) */
  const previewHtmlSource = useMemo(() => {
    if (!isPersistedStyle) return "";
    return ensureChartPreviewCardShell(previewHtmlForBasicMode(htmlTemplate, basicStyle), styleTy);
  }, [isPersistedStyle, htmlTemplate, basicStyle, styleTy]);

  const previewInnerHtml = useMemo(
    () => (isPersistedStyle ? applyPreviewPlaceholders(previewHtmlSource, previewPh) : ""),
    [isPersistedStyle, previewHtmlSource, previewPh]
  );

  const previewCss = useMemo(() => {
    if (!isPersistedStyle) return "";
    return previewCssForBasicMode(cssTemplate, basicStyle);
  }, [isPersistedStyle, cssTemplate, basicStyle]);

  const previewInnerJs = useMemo(() => {
    if (!isPersistedStyle) return "";
    const raw = previewJsForBasicMode(jsTemplate, basicStyle);
    if (!raw.trim()) return "";
    return applyPreviewPlaceholdersForJs(raw);
  }, [isPersistedStyle, jsTemplate, basicStyle]);

  const previewSrcDoc = useMemo(() => {
    if (uiMode === "detail") {
      if (detailPreviewHtml !== null && detailPreviewCss !== null) {
        return buildWidgetStylePreviewSrcDoc(detailPreviewHtml, detailPreviewCss, styleTy, {
          js: (detailPreviewJs ?? "").trim() || undefined,
          pinBasicStyleChrome: basicStyle,
        });
      }
      return buildWidgetStylePreviewSrcDoc(detailPreviewIdleInnerHtml, DETAIL_PREVIEW_IDLE_CSS, styleTy);
    }
    if (uiMode === "basic" && !isPersistedStyle) {
      return buildWidgetStylePreviewSrcDoc(newStyleNoPreviewInnerHtml, NEW_STYLE_NO_PREVIEW_CSS, styleTy);
    }
    return buildWidgetStylePreviewSrcDoc(previewInnerHtml, previewCss, styleTy, {
      js: previewInnerJs.trim() || undefined,
      pinBasicStyleChrome: basicStyle,
    });
  }, [
    uiMode,
    isPersistedStyle,
    detailPreviewHtml,
    detailPreviewCss,
    detailPreviewJs,
    previewInnerHtml,
    previewCss,
    previewInnerJs,
    styleTy,
    basicStyle,
    detailPreviewIdleInnerHtml,
    newStyleNoPreviewInnerHtml,
  ]);

  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  /** srcDoc는 DOM에 직접 할당. styleTy를 deps에 포함 — 유형만 바뀌고 문자열이 같으면 effect가 스킵되어 iframe이 비는 문제 방지 */
  useLayoutEffect(() => {
    const el = previewIframeRef.current;
    if (el) {
      el.removeAttribute("srcdoc");
      el.srcdoc = previewSrcDoc;
    }
  }, [previewSrcDoc, styleTy, uiMode]);

  useEffect(() => {
    if (styleTypeOptions.length > 0 && !styleTy) {
      setStyleTy(styleTypeOptions[0].code);
    }
  }, [styleTypeOptions, styleTy]);

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
                <label className="f_select" htmlFor="wgs_cmpny">
                  <select
                    id="wgs_cmpny"
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
                <h3 className="system-subtitle" style={{ margin: 0, marginBottom: "12px" }}>
                  {i18nText.titleStyleList}
                </h3>
                <div className="f_group pop_form_label_top md-wds-list-search-row">
                  <div className="md-wds-list-search-field">
                    <label className="f_label" htmlFor="wgs_list_search_ty">
                      {i18nText.labelStyleType}
                    </label>
                    <select
                      id="wgs_list_search_ty"
                      className="f_select"
                      value={searchStyleTy}
                      onChange={(e) => setSearchStyleTy(e.target.value)}
                    >
                      <option value="">{i18nText.etcAll}</option>
                      {styleTypeOptions.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md-wds-list-search-field md-wds-list-search-field--grow">
                    <label className="f_label" htmlFor="wgs_list_search_name">
                      {i18nText.labelStyleName}
                    </label>
                    <input
                      id="wgs_list_search_name"
                      className="f_input"
                      value={searchStyleName}
                      onChange={(e) => setSearchStyleName(e.target.value)}
                      placeholder={i18nText.placeholderSearchStyleName}
                    />
                  </div>
                  <button type="button" className="pd-btn primary" onClick={() => loadList()}>
                    {i18nText.btnSearch}
                  </button>
                </div>

                <div
                  className="board_list BRD006 md-admin-list md-widget-dataset-list board_list--flat"
                  style={{ maxHeight: 520, overflow: "auto" }}
                >
                  <div className="head">
                    <span>{i18nText.labelStyleName}</span>
                    <span>{i18nText.labelStyleType}</span>
                    <span>{i18nText.labelUpdateDate}</span>
                    <span>{i18nText.etcColumnUse}</span>
                  </div>
                  <div className="result">
                    {list.map((row) => (
                      <button
                        type="button"
                        key={row.styleId}
                        className={`list_item ${selectedId === row.styleId && !isNew ? "is-selected" : ""}`}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background:
                            selectedId === row.styleId && !isNew ? "var(--md-surface-variant, #e8eef2)" : "transparent",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--md-outline-variant, #e0e0e0)",
                        }}
                        onClick={() => loadDetail(row.styleId)}
                      >
                        <span className="ellipsis" title={row.styleName}>
                          {row.styleName}
                        </span>
                        <span>{row.styleTy}</span>
                        <span>{row.modifyDt || "-"}</span>
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

              <section className="md-form-card md-widget-dataset-right">
                <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", flexShrink: 0 }}>
                  <h3 className="system-subtitle" style={{ margin: 0 }}>
                    {i18nText.titleStyleInfo}
                  </h3>
                </div>

                <div className="f_group pop_form_label_top" style={{ marginTop: 16 }}>
                  <div className="md-bbs-basic-form-grid">
                    <label className="f_label md-bbs-form-label" htmlFor="wgs_style_name">
                      {i18nText.labelStyleName}
                      <span className="req">*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        id="wgs_style_name"
                        className="f_input"
                        value={styleName}
                        maxLength={MAX_STYLE_NAME}
                        onChange={(e) => setStyleName(e.target.value)}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="widgetstyle_styleId">
                      {i18nText.labelStyleId}
                      <span className="req">*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        id="widgetstyle_styleId"
                        ref={styleIdInputRef}
                        className="f_input"
                        value={styleId}
                        maxLength={MAX_STYLE_ID}
                        onChange={(e) => setStyleId(e.target.value)}
                        readOnly={!isNew}
                        disabled={!isNew}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="wgs_style_ty">
                      {i18nText.labelStyleType}
                      <span className="req">*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <select id="wgs_style_ty" className="f_select" value={styleTy} onChange={(e) => setStyleTy(e.target.value)}>
                        {styleTypeOptions.length > 0 ? (
                          styleTypeOptions.map((o) => (
                            <option key={o.code} value={o.code}>
                              {o.name}
                            </option>
                          ))
                        ) : (
                          <option value="">{i18nText.etcCodeLoading}</option>
                        )}
                      </select>
                    </div>
                    <span className="f_label md-bbs-form-label" id="wgs_use_label">
                      {i18nText.labelUseYn}
                    </span>
                    <div className="md-bbs-form-control" role="group" aria-labelledby="wgs_use_label">
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="wgs_use"
                            value="Y"
                            checked={useFl === "Y"}
                            onChange={(e) => setUseFl(e.target.value)}
                          />
                          <span>{i18nText.etcUse}</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="wgs_use"
                            value="N"
                            checked={useFl === "N"}
                            onChange={(e) => setUseFl(e.target.value)}
                          />
                          <span>{i18nText.etcNotUse}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <button type="button" className="pd-btn primary" style={{ width: "100%", height: "46px" }} onClick={handleToggleDetail}>
                    {uiMode === "basic" ? i18nText.btnToDetailStyle : i18nText.btnToDefaultStyle}
                  </button>
                </div>

                {uiMode === "basic" ? (
                  <div className="f_group pop_form_label_top" style={{ marginTop: 16 }}>
                    <div className="md-bbs-basic-form-grid">
                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_bg_hex">
                        {i18nText.labelBackground}
                      </label>
                      <div className="md-bbs-form-control">
                        <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", minWidth: 0 }}>
                          <input
                            type="color"
                            value={basicStyle.background}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, background: e.target.value }))}
                            aria-label={i18nText.etcAriaBgColor}
                            style={{ width: 40, height: 32, padding: 0, border: "1px solid #ccc", flexShrink: 0 }}
                          />
                          <input
                            id="wgs_basic_bg_hex"
                            className="f_input"
                            value={basicStyle.background}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, background: e.target.value }))}
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_border_hex">
                        {i18nText.labelBorder}
                      </label>
                      <div className="md-bbs-form-control">
                        <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", minWidth: 0 }}>
                          <input
                            type="color"
                            value={basicStyle.borderColor}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, borderColor: e.target.value }))}
                            aria-label={i18nText.etcAriaBorderColor}
                            style={{ width: 40, height: 32, padding: 0, border: "1px solid #ccc", flexShrink: 0 }}
                          />
                          <input
                            id="wgs_basic_border_hex"
                            className="f_input"
                            value={basicStyle.borderColor}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, borderColor: e.target.value }))}
                            maxLength={7}
                          />
                        </div>
                      </div>

                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_title_hex">
                        {i18nText.labelTitle}
                      </label>
                      <div className="md-bbs-form-control">
                        <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", minWidth: 0 }}>
                          <input
                            type="color"
                            value={basicStyle.titleColor}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, titleColor: e.target.value }))}
                            aria-label={i18nText.etcAriaTitleColor}
                            style={{ width: 40, height: 32, padding: 0, border: "1px solid #ccc", flexShrink: 0 }}
                          />
                          <input
                            id="wgs_basic_title_hex"
                            className="f_input"
                            value={basicStyle.titleColor}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, titleColor: e.target.value }))}
                            maxLength={7}
                          />
                        </div>
                      </div>
                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_border_width">
                        {i18nText.labelBorderWidth}
                      </label>
                      <div className="md-bbs-form-control">
                        <input
                          id="wgs_basic_border_width"
                          type="number"
                          className="f_input"
                          min={0}
                          max={32}
                          value={basicStyle.borderWidth}
                          onChange={(e) =>
                            setBasicStyle((s) => ({ ...s, borderWidth: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>

                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_border_radius">
                        {i18nText.labelBorderRadius}
                      </label>
                      <div className="md-bbs-form-control">
                        <input
                          id="wgs_basic_border_radius"
                          type="number"
                          className="f_input"
                          min={0}
                          max={64}
                          value={basicStyle.borderRadius}
                          onChange={(e) =>
                            setBasicStyle((s) => ({ ...s, borderRadius: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>
                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_box_shadow">
                        {i18nText.labelBoxShadow}
                      </label>
                      <div className="md-bbs-form-control">
                        <select
                          id="wgs_basic_box_shadow"
                          className="f_select"
                          value={basicStyle.boxShadow}
                          onChange={(e) =>
                            setBasicStyle((s) => ({ ...s, boxShadow: e.target.value as "Y" | "N" }))
                          }
                        >
                          <option value="Y">{i18nText.etcUse}</option>
                          <option value="N">{i18nText.etcNotUse}</option>
                        </select>
                      </div>

                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_header">
                        {i18nText.labelHeader}
                      </label>
                      <div className="md-bbs-form-control">
                        <select
                          id="wgs_basic_header"
                          className="f_select"
                          value={basicStyle.header}
                          onChange={(e) =>
                            setBasicStyle((s) => ({ ...s, header: e.target.value as "Y" | "N" }))
                          }
                        >
                          <option value="Y">{i18nText.etcUse}</option>
                          <option value="N">{i18nText.etcNotUse}</option>
                        </select>
                      </div>
                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_header_bg_hex">
                        {i18nText.labelHeaderBackground}
                      </label>
                      <div className="md-bbs-form-control">
                        <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", minWidth: 0 }}>
                          <input
                            type="color"
                            value={basicStyle.headerBackground}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, headerBackground: e.target.value }))}
                            aria-label={i18nText.etcAriaHeaderBgColor}
                            style={{ width: 40, height: 32, padding: 0, border: "1px solid #ccc", flexShrink: 0 }}
                          />
                          <input
                            id="wgs_basic_header_bg_hex"
                            className="f_input"
                            value={basicStyle.headerBackground}
                            onChange={(e) => setBasicStyle((s) => ({ ...s, headerBackground: e.target.value }))}
                            maxLength={7}
                          />
                        </div>
                      </div>

                      <label className="f_label md-bbs-form-label" htmlFor="wgs_basic_header_height">
                        {i18nText.labelHeaderHeight}
                      </label>
                      <div className="md-bbs-form-control">
                        <input
                          id="wgs_basic_header_height"
                          type="number"
                          className="f_input"
                          min={0}
                          max={200}
                          value={basicStyle.headerHeight}
                          onChange={(e) =>
                            setBasicStyle((s) => ({ ...s, headerHeight: Number(e.target.value) || 0 }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md-widget-editor" style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      {(["html", "css", "js"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`btn ${detailTab === tab ? "btn_blue_h46" : "btn_skyblue_h46"}`}
                          onClick={() => setDetailTab(tab)}
                        >
                          {tab === "html" ? i18nText.btnHtml : tab === "css" ? i18nText.btnCss : i18nText.btnJs}
                        </button>
                      ))}
                      <button type="button" className="btn btn_blue_h46" onClick={applyDetailPreview}>
                        {i18nText.btnPreview}
                      </button>
                    </div>
                    <textarea
                      className="f_textarea md-widget-editor__area"
                      rows={16}
                      value={detailTab === "html" ? htmlTemplate : detailTab === "css" ? cssTemplate : jsTemplate}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (detailTab === "html") setHtmlTemplate(v);
                        else if (detailTab === "css") setCssTemplate(v);
                        else setJsTemplate(v);
                      }}
                      spellCheck={false}
                      style={{ fontFamily: "monospace", fontSize: 13 }}
                    />
                  </div>
                )}

                <div style={{ marginTop: 20, marginBottom: 8 }}>
                  <h3 className="system-subtitle" style={{ margin: 0 }}>
                    {i18nText.titleStylePreview}
                  </h3>
                </div>
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
                    title={i18nText.etcPreviewIframeTitle}
                    className="md-widget-style-preview-iframe"
                    style={{
                      width: "100%",
                      minHeight: 360,
                      border: 0,
                      display: "block",
                      background: "#fff",
                    }}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WidgetStyleList;
