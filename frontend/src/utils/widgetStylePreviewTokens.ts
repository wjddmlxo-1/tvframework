/**
 * 위젯 스타일 미리보기: 서버/DB CSS·HTML 템플릿에 삽입되는 토큰 치환.
 *
 * 공통코드 `styleTy` (DETAIL_CODE_VALUE, 코드=코드값 동일):
 * - ST01 카드형, ST02 리스트형, ST03 테이블형, ST04 차트형(막대), ST05 차트형(선),
 *   ST06 차트형(파이), ST07 커스텀(HTML)
 */

export type BasicStyle = {
  background: string;
  borderColor: string;
  titleColor: string;
  borderWidth: number;
  borderRadius: number;
  boxShadow: "Y" | "N";
  header: "Y" | "N";
  headerBackground: string;
  headerHeight: number;
};

export function buildHeaderTitleCss(b: BasicStyle): string {
  const headerBlock =
    b.header === "Y"
      ? `.wgs-header{display:flex;align-items:center;padding:10px 28px 8px 28px;height:${b.headerHeight}px;}`
      : `.wgs-header{display:none;}`;
  return `.wgs-title{font-weight:600;color:#333;}
${headerBlock}`;
}

/** 카드형 폴백(설정 누락 시) */
export function buildCssFromBasic(b: BasicStyle): string {
  const shadow = b.boxShadow === "Y" ? "" : "";
  return `.wgs-card{background:${b.background};border-radius:${b.borderRadius}px;${shadow}overflow:hidden;font-family:'Pretendard Variable';}
.wgs-body{padding:8px 28px !important;}
.wgs-value{margin-bottom:8px;font-size:1.1rem;}
.wgs-data{font-size:0.9rem;color:#64748b;}
${buildHeaderTitleCss(b)}`;
}

/**
 * `pinBasicStyleChrome` 전용: `.wgs-card` 껍데기만 (배경·테두리·그림자).
 * `buildCssFromBasic` 전체를 맨 뒤에 한 번 더 넣으면 `.wgs-body`/헤더 규칙이 앞선 템플릿 CSS를 덮어
 * 테이블·막대 미리보기 레이아웃이 깨질 수 있어 분리한다.
 */
export function buildPinnedBasicCardChromeOnly(b: BasicStyle): string {
  const shadow = b.boxShadow === "Y" ? "" : "";
  return `.wgs-card{background:${b.background};border-radius:${b.borderRadius}px;${shadow}overflow:hidden;font-family:'Pretendard Variable';}`;
}

/**
 * CSS 템플릿(htmlTemplate/cssTemplate) 내 토큰 치환.
 * 사용 가능 토큰: {{WGS_BG}}, {{WGS_BORDER_COLOR}}, {{WGS_BORDER_WIDTH}}, {{WGS_BORDER_RADIUS}},
 * {{WGS_BOX_SHADOW}}, {{WGS_TITLE_COLOR}}, {{WGS_HEADER_BG}}, {{WGS_HEADER_HEIGHT}},
 * {{WGS_HEADER_AND_TITLE_CSS}}, {{WGS_SHELL_BASE}}
 */
export function applyWidgetPreviewTokens(template: string, b: BasicStyle): string {
  if (!template) return "";
  const shadow = b.boxShadow === "Y" ? "" : "";
  const shellBase = `.wgs-shell{font-family:'Pretendard Variable';box-sizing:border-box;}
.wgs-shell *{box-sizing:border-box;}`;
  const customHdrRules =
    b.header === "Y" ? "display:flex;align-items:center;" : "display:none;";
  return template
    .replace(/\{\{WGS_BG\}\}/g, b.background)
    .replace(/\{\{WGS_BORDER_COLOR\}\}/g, b.borderColor)
    .replace(/\{\{WGS_BORDER_WIDTH\}\}/g, String(b.borderWidth))
    .replace(/\{\{WGS_BORDER_RADIUS\}\}/g, String(b.borderRadius))
    .replace(/\{\{WGS_BOX_SHADOW\}\}/g, shadow)
    .replace(/\{\{WGS_TITLE_COLOR\}\}/g, b.titleColor)
    .replace(/\{\{WGS_HEADER_BG\}\}/g, b.headerBackground)
    .replace(/\{\{WGS_HEADER_HEIGHT\}\}/g, String(b.headerHeight))
    .replace(/\{\{WGS_HEADER_AND_TITLE_CSS\}\}/g, buildHeaderTitleCss(b))
    .replace(/\{\{WGS_SHELL_BASE\}\}/g, shellBase)
    .replace(/\{\{WGS_CUSTOM_HDR_RULES\}\}/g, customHdrRules);
}

/**
 * 차트형 스타일 여부(영문/일반 키워드).
 * DB `styleTy`가 `ST01`~`ST07`처럼 코드값만 올 때는 **여기서 true로 두지 않는다** — 테이블형(ST03)까지 차트로 오인하면
 * 미리보기에서 `<tr>` 행 반복이 막힌다. ST 코드 전용 판별은 `isBareDetailStyleTyCode` 등으로 분리한다.
 */
export function isChartStyleTypeForPreview(styleTy: string | undefined): boolean {
  const raw = String(styleTy ?? "").trim();
  if (!raw) return false;
  const s = raw.toLowerCase();
  if (/line|bar|pie|doughnut|chart|map|geo/.test(s)) return true;
  return false;
}

/** 공통코드 패턴만 있는지 (`ST01`~`ST07` 등, 코드명은 위 파일머리 주석 참고) */
export function isBareDetailStyleTyCode(styleTy: string | undefined): boolean {
  return /^st\d{2,}$/i.test(String(styleTy ?? "").trim());
}

/** 공통코드 기반 차트형(ST04 막대, ST05 선, ST06 파이) */
export function isChartDetailStyleTyCode(styleTy: string | undefined): boolean {
  return /^st0(?:4|5|6)$/i.test(String(styleTy ?? "").trim());
}

/**
 * 차트형인데 HTML에 wgs-card가 없으면 미리보기용 기본 카드 셸을 감싼다.
 * - 키워드(bar/line/…)로 차트로 보이거나, `ST##` 이면서 **`<table>`이 없는** 템플릿(캔버스·div 차트)일 때만 적용.
 * - `ST##` + `<table>`(예: 테이블형 ST03)은 카드로 한 번 더 감싸지 않는다.
 */
export function ensureChartPreviewCardShell(html: string, styleTy: string | undefined): string {
  const raw = String(styleTy ?? "").trim();
  if (!raw) return html;
  const keywordChart = isChartStyleTypeForPreview(styleTy);
  const bareChart = isChartDetailStyleTyCode(styleTy);
  const hasTable = /<table\b/i.test(html);
  const needsShell = keywordChart || (bareChart && !hasTable);
  if (!needsShell) return html;
  if (/\bclass=["'][^"']*\bwgs-card\b/i.test(html)) return html;
  return `<div class="wgs-card"><div class="wgs-header"><span class="wgs-title">{{title}}</span></div><div class="wgs-body">${html}</div></div>`;
}

function isUnmappedTokenPlaceholder(s: string): boolean {
  return /^\{\{[a-zA-Z0-9_]+\}\}$/.test(String(s).trim());
}

/**
 * DB에 저장된 단일 행용 Chart.js 스니펫이 다행 치환 후 깨지는 경우를 보정한다.
 * - `labels:['{{label}}']` + 다행 → `labels:['"a","b"']` 가 되어 라벨이 한 덩어리로만 인식됨 → `labels:["a","b"]`
 * - `data:[Number('{{value}}')||0]` + 다행 → `Number('1,2,3')` 는 NaN → `data:[1,2,3]`
 * 권장 템플릿은 `labels:[{{label}}]`, `data:[{{value}}]` 이지만 기존 저장분과 호환한다.
 */
function normalizeAggregatedChartPreviewJsLegacyPatterns(js: string): string {
  let out = js;
  out = out.replace(
    /labels:\s*\[\s*'((?:"[^"]*")(?:\s*,\s*"[^"]*")*)\s*'\s*\]/g,
    (_m, inner: string) => `labels:[${inner}]`
  );
  out = out.replace(/data:\s*\[\s*Number\(\s*'([\d,\s]+)'\s*\)\s*\|\|\s*0\s*\]/g, (_m, inner: string) => {
    const parts = inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return "data:[0]";
    if (parts.length === 1) {
      const n = Number(parts[0]);
      return `data:[${Number.isFinite(n) ? n : 0}]`;
    }
    const nums = parts.map((p) => Number(p));
    if (nums.some((x) => Number.isNaN(x))) return _m;
    return `data:[${nums.join(",")}]`;
  });
  return out;
}

/**
 * 차트형 JS 템플릿: 미리보기 행 전체를 집계해 `{{token}}` 치환.
 * HTML은 1행만 쓰고(카드 중복 방지), Chart.js 등은 `labels`/`data` 배열에 모든 행이 필요하므로 JS만 다행 집계한다.
 *
 * `getCellDisplay(row, token)`은 위젯관리/메인의 단일 행 치환과 동일한 규칙으로 표시 문자열을 돌려준다.
 */
export function replaceChartPreviewJsTokens(
  js: string,
  rows: Record<string, unknown>[],
  getCellDisplay: (row: Record<string, unknown>, token: string) => string,
  options?: { widgetIdForJs?: string }
): string {
  const list = rows.length > 0 ? rows : [{}];
  const widgetIdForJs = options?.widgetIdForJs ?? "preview";
  const replaced = js.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, tokenRaw) => {
    const token = String(tokenRaw || "");
    if (token === "widgetId") return String(widgetIdForJs);
    const displays = list.map((row) => getCellDisplay(row, token));
    /** `labels:[{{x}}]` 등에 `{{x}}`가 남으면 `[{` 로 파싱되어 SyntaxError — 빈 치환으로 `[]`만 남긴다 */
    if (displays.some((d) => isUnmappedTokenPlaceholder(String(d)))) {
      return "";
    }
    const allSame = displays.length > 0 && displays.every((d) => d === displays[0]);
    if (allSame || displays.length === 1) {
      const one = displays[0] ?? "";
      const numStr = String(one).replace(/,/g, "").trim();
      const n = Number(numStr);
      if (numStr !== "" && Number.isFinite(n)) {
        return String(n);
      }
      return JSON.stringify(one);
    }
    const allNumeric = displays.every((d) => {
      const t = String(d).replace(/,/g, "").trim();
      return t !== "" && !Number.isNaN(Number(t));
    });
    if (allNumeric) {
      return displays.map((d) => Number(String(d).replace(/,/g, ""))).join(",");
    }
    return displays.map((d) => JSON.stringify(d)).join(",");
  });
  return normalizeAggregatedChartPreviewJsLegacyPatterns(replaced);
}

/** 기본 모드 저장 시 자동 붙는 카드·헤더 CSS와 사용자 정의 CSS 구분 */
export const WGS_BASIC_CHROME_MARKER = "/*__WGS_BASIC_CHROME__*/";

/**
 * 기본 스타일 모드 저장용: 미리보기와 동일한 최종 CSS.
 * - 토큰 있음: 치환한 한 덩어리
 * - 토큰 없음: 사용자 CSS + 마커 + buildCssFromBasic (재저장 시 중복 append 방지)
 */
export function mergeBasicModeCssForSave(customCss: string, b: BasicStyle): string {
  let c = customCss.replace(/\r\n/g, "\n").trim();
  if (!c) {
    return buildCssFromBasic(b);
  }
  /** 기본→상세 전환 등으로 마커+크롬까지 들어온 경우 사용자 CSS만 사용 */
  const splitMarker = splitBasicModeCssStored(c);
  if (splitMarker.chromeCss != null) {
    c = splitMarker.customCss.trim();
  }
  if (!c) {
    return buildCssFromBasic(b);
  }
  if (/\{\{WGS_/.test(c)) {
    return applyWidgetPreviewTokens(c, b);
  }
  /** 마커 없이 이전 저장본 전체가 들어온 경우 끝의 buildCssFromBasic(파일에 박힌 값) 제거 */
  if (!c.includes(WGS_BASIC_CHROME_MARKER)) {
    const embedded = tryParseBasicStyleFromCss(c);
    if (embedded) {
      const { customCss: stripped, didStrip } = stripTrailingBasicChrome(c, embedded);
      if (didStrip) {
        c = stripped;
      }
    }
  }
  if (!c) {
    return buildCssFromBasic(b);
  }
  return `${c}\n${WGS_BASIC_CHROME_MARKER}\n${buildCssFromBasic(b)}`;
}

export function splitBasicModeCssStored(full: string): { customCss: string; chromeCss: string | null } {
  const s = full.replace(/\r\n/g, "\n").trim();
  if (!s) {
    return { customCss: "", chromeCss: null };
  }
  const marker = `\n${WGS_BASIC_CHROME_MARKER}\n`;
  const i = s.lastIndexOf(marker);
  if (i >= 0) {
    return {
      customCss: s.slice(0, i).trimEnd(),
      chromeCss: s.slice(i + marker.length).trim() || null,
    };
  }
  return { customCss: s, chromeCss: null };
}

/** buildCssFromBasic 출력에서 슬라이더 상태 역추출 (저장·재조회 후 복원) */
export function tryParseBasicStyleFromCss(css: string): BasicStyle | null {
  if (!css || typeof css !== "string") return null;
  const cssN = css.replace(/\r\n/g, "\n");
  const cardM = cssN.match(/\.wgs-card\s*\{([^}]*)\}/);
  if (!cardM) return null;
  const inner = cardM[1];
  const bg = inner.match(/background:\s*([^;]+);/);
  const borderM = inner.match(/border:\s*([0-9.]+)px\s+solid\s+([^;]+);/);
  const radiusM = inner.match(/border-radius:\s*([0-9.]+)px/);
  if (!bg || !borderM || !radiusM) return null;
  const boxShadow: "Y" | "N" = /box-shadow/.test(inner) ? "Y" : "N";

  const titleM = cssN.match(/\.wgs-title\s*\{[^}]*color:\s*([^;]+);/);
  const titleColor = titleM ? titleM[1].trim() : "#0f172a";

  const headerHidden = /\.wgs-header\s*\{[^}]*display:\s*none/.test(cssN);
  const header: "Y" | "N" = headerHidden ? "N" : "Y";

  let headerBackground = "#f1f5f9";
  let headerHeight = 40;
  if (header === "Y") {
    const headerBlock = cssN.match(/\.wgs-header\s*\{([^}]*)\}/);
    if (headerBlock) {
      const hi = headerBlock[1];
      const hm = hi.match(/height:\s*([0-9.]+)px/);
      const bm = hi.match(/background:\s*([^;]+);/);
      if (hm) headerHeight = Number(hm[1]) || 40;
      if (bm) headerBackground = bm[1].trim();
    }
  }

  return {
    background: bg[1].trim(),
    borderColor: borderM[2].trim(),
    titleColor,
    borderWidth: Number(borderM[1]) || 1,
    borderRadius: Number(radiusM[1]) || 8,
    boxShadow,
    header,
    headerBackground,
    headerHeight,
  };
}

/** 저장 시 붙은 buildCssFromBasic(b) 접미사를 제거해 편집용 custom CSS만 남김 */
export function stripTrailingBasicChrome(full: string, b: BasicStyle): { customCss: string; didStrip: boolean } {
  const chrome = buildCssFromBasic(b).replace(/\r\n/g, "\n").trim();
  const f = full.replace(/\r\n/g, "\n").trimEnd();
  if (f.length >= chrome.length && f.slice(-chrome.length) === chrome) {
    return { customCss: f.slice(0, -chrome.length).replace(/\s+$/, ""), didStrip: true };
  }
  return { customCss: full, didStrip: false };
}

/** Chart.js UMD — 미리보기 iframe에서 전역 `Chart` 제공 */
export const WIDGET_PREVIEW_CHART_JS_CDN =
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js";

export type WidgetStylePreviewSrcDocOptions = {
  /** 미리보기 iframe 하단에서 실행할 인라인 스크립트 */
  js?: string;
  /** 다국어: 치환된 값 클릭·드롭 시 parent.postMessage 로 선택/적용 전달 */
  injectI18nHitLayer?: boolean;
  /** 다국어 DnD MIME (부모와 동일해야 iframe drop 에서 getData 성공) */
  i18nDragMimeType?: string;
  /**
   * 기본스타일(슬라이더)로 `.wgs-card` 껍데기(배경·테두리·반경·그림자)만 `<head>` 맨 뒤 **별도 `<style>`** 에 한 번 더 넣는다.
   * 선형 등 일부 DB 템플릿에서 첫 `<style>`이 깨져 카드 테두리가 빠질 때 보강한다. (`buildCssFromBasic` 전체를 넣지 않음 — 본문·헤더 규칙 덮어쓰기 방지)
   */
  pinBasicStyleChrome?: BasicStyle;
};

/** JS에 Chart.js API 사용이 있으면 true (불필요한 CDN 로드 방지) */
export function widgetPreviewJsNeedsChartJs(js: string): boolean {
  return /\bChart\b/i.test(String(js || ""));
}

/**
 * 미리보기 JS에서 `{{토큰}}`을 데이터셋 **전 행**으로 집계할지 여부.
 * - `new Chart` 등이 있으면 무조건 집계.
 * - 스타일 유형에 line|bar|chart… 가 있으면 집계.
 * - `ST04`·`ST05` 같이 **코드값만** 있는 막대/선형도 집계해야 함 (`isChartStyleTypeForPreview`는 테이블 오인 방지로 ST## 제외).
 */
export function shouldAggregateWidgetPreviewJsAcrossRows(styleTy: string | undefined, js: string): boolean {
  if (widgetPreviewJsNeedsChartJs(js)) return true;
  if (isChartStyleTypeForPreview(styleTy)) return true;
  if (isChartDetailStyleTyCode(styleTy)) return true;
  return false;
}

function escapeInlineScriptForSrcDoc(s: string): string {
  return s.replace(/<\/script>/gi, "<\\/script>");
}

/** `border-radius`는 테두리 두께와 무관 — `border:` / `border-top:` 등만 본다 */
function wgsCardBlockHasBorderProperty(inner: string): boolean {
  if (/\bborder\s*:/i.test(inner)) return true;
  if (/\bborder-(?:top|right|bottom|left)\s*:/i.test(inner)) return true;
  return false;
}

/**
 * `.wgs-card`, `.wgs-card.chart-card`, `.chart-card.wgs-card` 등 DB에 흔한 선택자.
 * (이전 정규식은 `.chart-card.wgs-card` 블록을 못 잡아 보강 border가 슬라이더 border 뒤에 붙어 덮어쓸 수 있었다.)
 */
function forEachWgsCardRuleBlock(css: string, fn: (inner: string) => void): void {
  const re =
    /\.(?:[a-zA-Z0-9_-]+\.)*wgs-card(?:\.[a-zA-Z0-9_-]+)?\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    fn(m[1]);
  }
}

function cssHasAnyWgsCardBorderDeclaration(css: string): boolean {
  let found = false;
  forEachWgsCardRuleBlock(css, (inner) => {
    if (wgsCardBlockHasBorderProperty(inner)) found = true;
  });
  return found;
}

/**
 * iframe 미리보기: 카드에 `border:`가 전혀 없을 때만 외곽이 보이도록 **outline**으로 보조한다.
 * `border:…`를 넣으면 기본스타일 슬라이더의 테두리 두께 규칙보다 뒤에 와 **덮어쓰는** 부작용이 생긴다.
 */
function ensurePreviewWgsCardBorder(css: string): string {
  const c = css.replace(/\r\n/g, "\n");
  if (cssHasAnyWgsCardBorderDeclaration(c)) {
    return css;
  }
  return `${c}\n/* wgs-preview: 카드 외곽( border 미설정 시만, 슬라이더 border와 충돌 없음 ) */\n.wgs-card,.chart-card.wgs-card,.wgs-card.chart-card{box-sizing:border-box;outline-offset:-1px;}\n`;
}

/**
 * 관리 화면 전역 CSS와 분리해 위젯 미리보기를 iframe(srcDoc)으로 렌더링할 때 사용.
 * CSS에 `</style>` 문자열이 들어가도 문서가 깨지지 않게 이스케이프한다.
 * `options.js`가 있으면 인라인 스크립트 실행. `Chart` 식별자가 있으면 Chart.js CDN을 먼저 로드.
 */
export function buildWidgetStylePreviewSrcDoc(
  html: string,
  css: string,
  /** 유형이 바뀌어도 서버 HTML이 동일할 때 srcdoc 문자열이 같아지는 것을 막기 위한 표시(캐시/리렌더) */
  styleTyMarker?: string,
  options?: WidgetStylePreviewSrcDocOptions
): string {
  const safeCss = ensurePreviewWgsCardBorder(css).replace(/<\/style>/gi, "<\\/style>");
  const pinBasic = options?.pinBasicStyleChrome;
  const pinChromeCss =
    pinBasic != null
      ? ensurePreviewWgsCardBorder(buildPinnedBasicCardChromeOnly(pinBasic)).replace(/<\/style>/gi, "<\\/style>")
      : "";
  const marker =
    styleTyMarker != null && String(styleTyMarker).trim() !== ""
      ? `<!--wgs-style-ty:${String(styleTyMarker).replace(/-->/g, "")}-->`
      : "";
  const jsTrim = options?.js?.trim() ?? "";
  let tail = "";
  if (jsTrim) {
    const safeJs = escapeInlineScriptForSrcDoc(jsTrim);
    if (widgetPreviewJsNeedsChartJs(jsTrim)) {
      tail = `<script src="${WIDGET_PREVIEW_CHART_JS_CDN}" crossorigin="anonymous"></script><script>${safeJs}</script>`;
    } else {
      tail = `<script>${safeJs}</script>`;
    }
  }
  const i18nHitCss = options?.injectI18nHitLayer
    ? `.wgs-i18n-hit{cursor:text;border-radius:3px;transition:box-shadow .15s ease;-webkit-user-select:text;user-select:text}.wgs-i18n-hit:hover{box-shadow:0 0 0 2px #93c5fd}.wgs-i18n-hit.wgs-i18n-sel{box-shadow:0 0 0 2px #f59e0b;background:rgba(254,243,199,.4)}th.wgs-i18n-cell-sel,td.wgs-i18n-cell-sel,.wgs-i18n-cell-sel{box-shadow:inset 0 0 0 2px #f59e0b;background:rgba(254,243,199,.25)}`
    : "";
  const mimeJson = JSON.stringify(options?.i18nDragMimeType ?? "application/x-widget-lang-map");
  const i18nHitScript = options?.injectI18nHitLayer
    ? `<script>(function(){
function wgsHitEl(t){
  if(!t)return null;
  if(t.nodeType===3)return t.parentElement&&t.parentElement.closest?t.parentElement.closest(".wgs-i18n-hit"):null;
  return t.closest?t.closest(".wgs-i18n-hit"):null;
}
function wgsSelInsideHit(hit,sel){
  if(!hit||!sel||sel.rangeCount<1)return false;
  return hit.contains(sel.anchorNode)&&hit.contains(sel.focusNode);
}
function wgsNodeEl(t){
  if(!t)return null;
  return t.nodeType===1?t:(t.parentElement||null);
}
function wgsCellEl(t){
  var el=wgsNodeEl(t);
  if(!el||!el.closest)return null;
  return el.closest("th,td,li,div,p,span");
}
function wgsFirstMappedHit(root){
  if(!root||!root.querySelector)return null;
  return root.querySelector(".wgs-i18n-hit[data-wgs-c]");
}
function wgsColumnFromTableCell(cell){
  if(!cell||!cell.closest)return "";
  var table=cell.closest("table");
  if(!table||!cell.parentElement)return "";
  var kids=Array.prototype.slice.call(cell.parentElement.children||[]);
  var idx=kids.indexOf(cell);
  if(idx<0)return "";
  var srcRow=table.querySelector("tbody tr")||table.querySelector("tr");
  if(!srcRow)return "";
  var srcCell=srcRow.children&&srcRow.children[idx]?srcRow.children[idx]:null;
  if(!srcCell)return "";
  var hit=wgsFirstMappedHit(srcCell);
  return hit?(hit.getAttribute("data-wgs-c")||""):"";
}
function wgsInferColumnNear(node){
  var cell=wgsCellEl(node);
  if(!cell)return "";
  var c=wgsColumnFromTableCell(cell);
  if(c)return c;
  var ownHit=wgsFirstMappedHit(cell);
  if(ownHit)return ownHit.getAttribute("data-wgs-c")||"";
  var p=cell.parentElement;
  while(p&&p!==document.body){
    var near=wgsFirstMappedHit(p);
    if(near)return near.getAttribute("data-wgs-c")||"";
    p=p.parentElement;
  }
  return "";
}
var MIME=${mimeJson};
var lastPhrase="";
document.addEventListener("mouseup",function(e){
  var sel=window.getSelection();
  var hit=null;
  var box=null;
  var phrase="";
  if(sel&&sel.rangeCount>0&&!sel.isCollapsed){
    var ha=wgsHitEl(sel.anchorNode),hf=wgsHitEl(sel.focusNode);
    if(ha&&hf&&ha===hf)hit=ha;
    else if(ha&&!hf)hit=ha;
    else if(!ha&&hf)hit=hf;
    else if(ha&&hf&&ha!==hf){
      var r=sel.getRangeAt(0);
      hit=wgsHitEl(r.commonAncestorContainer);
    }
    if(!hit){
      var r2=sel.getRangeAt(0);
      hit=wgsHitEl(r2.commonAncestorContainer);
    }
    if(hit&&wgsSelInsideHit(hit,sel)){
      phrase=(sel.toString()||"").replace(/\\u00a0/g," ").replace(/\\r\\n/g,"\\n").trim();
      if(phrase&&(!hit.textContent||hit.textContent.indexOf(phrase)<0))phrase="";
    }else if(sel&&sel.rangeCount>0&&!sel.isCollapsed){
      hit=null;
      box=wgsCellEl(sel.getRangeAt(0).commonAncestorContainer);
      /** hit 바깥 선택도 부분 문구 그대로 사용(기존은 셀 전체 텍스트로만 내려감) */
      phrase=(sel.toString()||"").replace(/\\u00a0/g," ").replace(/\\r\\n/g,"\\n").trim();
    }
  }
  if(!hit){
    hit=wgsHitEl(e.target);
    if(!hit)box=wgsCellEl(e.target);
  }
  var c="",tok="";
  if(hit){
    c=hit.getAttribute("data-wgs-c")||"";
    tok=hit.getAttribute("data-wgs-t")||"";
  }else{
    c=wgsInferColumnNear(box||e.target)||"";
    if(!c)return;
    tok=(box&&box.getAttribute&&box.getAttribute("data-wgs-t"))||"";
  }
  document.querySelectorAll(".wgs-i18n-cell-sel").forEach(function(x){x.classList.remove("wgs-i18n-cell-sel")});
  document.querySelectorAll(".wgs-i18n-hit.wgs-i18n-sel").forEach(function(x){x.classList.remove("wgs-i18n-sel")});
  if(hit)hit.classList.add("wgs-i18n-sel");
  else if(box&&box.classList)box.classList.add("wgs-i18n-cell-sel");
  var fullTrim=((hit?hit.textContent:(box?box.textContent:""))||"").trim();
  if(!phrase&&!hit&&box&&box.textContent){
    phrase=(box.textContent||"").replace(/\\u00a0/g," ").replace(/\\r\\n/g,"\\n").trim();
  }
  lastPhrase=phrase;
  var msg={type:"WGS_I18N_PREVIEW_HIT",token:tok,column:c};
  if(phrase)msg.phrase=phrase;
  if(window.parent&&window.parent!==window)window.parent.postMessage(msg,"*");
});
document.addEventListener("dragover",function(e){
  var el=wgsHitEl(e.target);
  var c=el?(el.getAttribute("data-wgs-c")||""):wgsInferColumnNear(e.target);
  if(!c)return;
  e.preventDefault();
  if(e.dataTransfer)e.dataTransfer.dropEffect="copy";
},true);
document.addEventListener("drop",function(e){
  var el=wgsHitEl(e.target);
  var box=null;
  if(!el){
    box=wgsCellEl(e.target);
  }
  e.preventDefault();
  e.stopPropagation();
  var raw=e.dataTransfer.getData(MIME);
  if(!raw)raw=e.dataTransfer.getData("text/plain");
  if(!raw)return;
  var c=el?(el.getAttribute("data-wgs-c")||""):wgsInferColumnNear(box||e.target);
  if(!c)return;
  var tok=el?(el.getAttribute("data-wgs-t")||""):"";
  var msg={type:"WGS_I18N_DROP",token:tok,column:c,payload:raw};
  var phraseForDrop=lastPhrase||"";
  if(!phraseForDrop){
    var targetText=((el?el.textContent:(box?box.textContent:""))||"").replace(/\\u00a0/g," ").replace(/\\r\\n/g,"\\n").trim();
    if(targetText)phraseForDrop=targetText;
  }
  if(phraseForDrop)msg.phrase=phraseForDrop;
  if(window.parent&&window.parent!==window)window.parent.postMessage(msg,"*");
},true);
})();</script>`
    : "";
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" /><style>${safeCss}</style>${i18nHitCss ? `<style>${i18nHitCss}</style>` : ""
    }${pinChromeCss
      ? `<style data-wgs-basic-chrome="1">${pinChromeCss}</style>`
      : ""
    }</head><body style="margin:0;font-family:'Pretendard Variable',system-ui,-apple-system,'Segoe UI',sans-serif !important;">${marker}${html}${tail}${i18nHitScript}</body></html>`;
}
