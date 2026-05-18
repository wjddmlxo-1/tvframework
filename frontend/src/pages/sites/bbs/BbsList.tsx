import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import { fetchCompanyList, resolveCmpnyCdForFormCreate, type CompanyOption } from "@/api/companyList";
import CODE from "@/constants/code";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { useCompanyList } from "@/hooks/useCompanyList";
import { getLanguageCodeForApi } from "@/utils/language";
import MultilingualLookupPopup, { MULTILINGUAL_LOOKUP_PLACEHOLDER } from "@/components/MultilingualLookupPopup";

import MdSwitch from "@/components/MdSwitch";
import MdUnderlineTabs from "@/components/MdUnderlineTabs";

import BbsManageAuthorTab, { type BbsAuthRow } from "./BbsManageAuthorTab";
import { CMMN_BBS_I18N_FALLBACK, CMMN_BBS_I18N_KEYS } from "./cmmnBbsI18n";

type CodeOpt = { code: string; name: string; detailCodeId?: string };

/** /bbs/featureCodeOptions 응답 (BbsCodeDetailOptionDTO) */
type FeatureCodeOpt = {
  name?: string;
  detailCodeId?: string;
  detailCodeValue?: string;
  useFl?: string;
  sortingSq?: number;
  langKey?: string;
};

const BBS_FEATURE_FALLBACK_ORDER: readonly string[] = [
  "REPLY_FL",
  "DISLIKE_FL",
  "ENFRC_SECRET_FL",
  "RESVE_FL",
  "CATEGORY_FL",
  "COMMENT_FL",
  "ATCHMNFL_FL",
  "ANONYMOUS_FL",
  "LIKE_FL",
  "NOTICE_FL",
  "COMMENT_CONFM_FL",
];

type BbsRow = {
  bbsId: string;
  bbsNmKey?: string;
  bbsName: string;
  bbsTy?: string;
  bbsTyNm?: string;
  statusColor?: string;
  sortingSq?: number;
};

type BbsDetail = {
  bbsId: string;
  cmpnyCd: string;
  bbsNmKey?: string;
  bbsName: string;
  bbsCn?: string;
  bbsTy?: string;
  layoutTy?: string;
  replyFl?: string;
  commentFl?: string;
  likeFl?: string;
  dislikeFl?: string;
  atchmnflFl?: string;
  noticeFl?: string;
  enfrcSecretFl?: string;
  anonymousFl?: string;
  commentConfmFl?: string;
  resveFl?: string;
  categoryFl?: string;
  maxFileSize?: number;
  maxFileCount?: number;
  permExtsn?: string;
  postsPerPage?: number;
  titleLength?: number;
  validFrom?: string;
  validTo?: string;
  sortingSq?: number;
  useFl?: string;
  categories?: { categorySq?: string; categoryNm: string; sortingSq?: number }[];
  authors?: BbsAuthRow[];
  tabTrashOrange?: boolean;
  tabCommentOrange?: boolean;
};

type TrashRow = { nttSq: string; title: string; creationDt?: string; userNm?: string; depth?: number };
type CommentRow = { commentSq: string; nttSq: string; mbrshSq: string; comment?: string; creationDt?: string; userNm?: string };
type PopupNoticeRow = {
  popupSq: string;
  nttSq: string;
  bbsId: string;
  cmpnyCd: string;
  bbsNm?: string;
  title?: string;
  hideFl?: string;
  useFl?: string;
  userNm?: string;
  creationDt?: string;
  depth?: number;
  statusColor?: string;
};
type PopupSetting = {
  popupSq: string;
  nttSq: string;
  bbsId: string;
  cmpnyCd: string;
  xcnts?: number | null;
  ydnts?: number | null;
  width?: number | null;
  vrticl?: number | null;
  startDt?: string | null;
  endDt?: string | null;
  hideFl?: string;
  useFl?: string;
};
type PopupPreview = {
  popupSq: string;
  nttSq: string;
  bbsId: string;
  cmpnyCd: string;
  title?: string;
  contents?: string;
  rdCnt?: number;
  likeCnt?: number;
  dislikeCnt?: number;
  favoriteCnt?: number;
  userNm?: string;
  creationDt?: string;
  likeFl?: string;
  dislikeFl?: string;
  myLikeFl?: string | null;
  myDislikeFl?: string | null;
  myFavoriteFl?: string;
  xcnts?: number | null;
  ydnts?: number | null;
  width?: number | null;
  vrticl?: number | null;
};

function yn(b: boolean): string {
  return b ? "Y" : "N";
}

function parseYn(v: string | undefined, def: boolean): boolean {
  if (v == null || v === "") return def;
  return v === "Y";
}

function isMemoBoardType(code: string | undefined): boolean {
  const v = (code || "").trim().toUpperCase();
  return v === "MEMO" || v.endsWith(".MEMO");
}

function toDateTimeLocal(v?: string | null): string {
  if (!v) return "";
  const t = String(v).trim();
  if (!t) return "";
  const d = t.replace(" ", "T");
  return d.length >= 16 ? d.slice(0, 16) : d;
}

function fromDateTimeLocal(v?: string): string | undefined {
  if (!v || !v.trim()) return undefined;
  return `${v}:00`.replace("T", " ");
}

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

type FeaturePreset = "GENERAL" | "NOTICE" | "ANONYMOUS" | "GALLERY" | "GUESTBOOK" | "QNA" | "CUSTOM";
const GENERAL_PRESETS: readonly FeaturePreset[] = ["GENERAL", "NOTICE", "ANONYMOUS", "GALLERY"];
const MEMO_PRESETS: readonly FeaturePreset[] = ["GUESTBOOK", "QNA"];

const MAX_CATEGORY_COUNT = 20;
/** 화면설계: 특수문자 제한(한글·영문·숫자·공백·밑줄) */
const CATEGORY_NAME_OK = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9_\s]+$/;

/** API 미등록·빈 응답 시에도 화면에 항상 표시 (DB LAYOUT_TY: LIST / CARD / ALBUM) */
const DEFAULT_LAYOUT_OPTIONS: CodeOpt[] = [
  { code: "LIST", name: "LIST" },
  { code: "CARD", name: "CARD" },
  { code: "ALBUM", name: "ALBUM" },
];

/** 필수 입력 표시 — 위젯관리 등과 동일 */
const ReqStar = () => <span style={{ color: "#c00" }}>*</span>;

function layoutCodesEqual(a: string | undefined, b: string | undefined): boolean {
  return (a ?? "").trim().toUpperCase() === (b ?? "").trim().toUpperCase();
}

function layoutIconKind(code: string): "list" | "card" | "album" {
  const u = code.toUpperCase();
  if (u.includes("CARD")) return "card";
  if (u.includes("ALBUM") || u.includes("GALLERY") || u.includes("GRID")) return "album";
  return "list";
}

function BbsLayoutKindIcon({ kind }: { kind: "list" | "card" | "album" }) {
  const c = "currentColor";
  if (kind === "list") {
    return (
      <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden focusable="false" className="bbs-layout-toggle__svg">
        <circle cx="3" cy="3" r="1.35" fill={c} />
        <circle cx="3" cy="8" r="1.35" fill={c} />
        <circle cx="3" cy="13" r="1.35" fill={c} />
        <rect x="7" y="1.6" width="14" height="2.2" rx="0.45" fill={c} />
        <rect x="7" y="6.9" width="14" height="2.2" rx="0.45" fill={c} />
        <rect x="7" y="12.2" width="14" height="2.2" rx="0.45" fill={c} />
      </svg>
    );
  }
  if (kind === "card") {
    return (
      <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden focusable="false" className="bbs-layout-toggle__svg">
        <rect x="1" y="1" width="7.5" height="14" rx="1" fill={c} />
        <rect x="11.5" y="1" width="7.5" height="14" rx="1" fill={c} />
      </svg>
    );
  }
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden focusable="false" className="bbs-layout-toggle__svg">
      <rect x="1" y="1" width="7" height="6.5" rx="0.75" fill={c} />
      <rect x="12" y="1" width="7" height="6.5" rx="0.75" fill={c} />
      <rect x="1" y="8.5" width="7" height="6.5" rx="0.75" fill={c} />
      <rect x="12" y="8.5" width="7" height="6.5" rx="0.75" fill={c} />
    </svg>
  );
}

export default function BbsList() {
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const { companyList, cmpnyCd, onCompanyChange } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_BBS_I18N_KEYS, CMMN_BBS_I18N_FALLBACK, { cmpnyCd });
  const featureFallbackLabels = useMemo<Record<string, string>>(
    () => ({
      REPLY_FL: i18nText.etcFeatureReply,
      DISLIKE_FL: i18nText.etcFeatureDislike,
      ENFRC_SECRET_FL: i18nText.etcFeatureSecret,
      RESVE_FL: i18nText.etcFeatureReserve,
      CATEGORY_FL: i18nText.etcFeatureCategory,
      COMMENT_FL: i18nText.etcFeatureComment,
      ATCHMNFL_FL: i18nText.etcFeatureAttach,
      ANONYMOUS_FL: i18nText.etcFeatureAnonymous,
      LIKE_FL: i18nText.etcFeatureLike,
      NOTICE_FL: i18nText.etcFeatureNotice,
      COMMENT_CONFM_FL: i18nText.etcFeatureCommentApproval,
    }),
    [
      i18nText.etcFeatureReply,
      i18nText.etcFeatureDislike,
      i18nText.etcFeatureSecret,
      i18nText.etcFeatureReserve,
      i18nText.etcFeatureCategory,
      i18nText.etcFeatureComment,
      i18nText.etcFeatureAttach,
      i18nText.etcFeatureAnonymous,
      i18nText.etcFeatureLike,
      i18nText.etcFeatureNotice,
      i18nText.etcFeatureCommentApproval,
    ]
  );

  const defaultLayoutOptions = useMemo<CodeOpt[]>(
    () => [
      { code: "LIST", name: i18nText.etcList },
      { code: "CARD", name: i18nText.etcCard },
      { code: "ALBUM", name: i18nText.etcAlbum },
    ],
    [i18nText.etcAlbum, i18nText.etcCard, i18nText.etcList]
  );
  const bbsIdRef = useRef<HTMLInputElement | null>(null);
  const popupSettingTitleId = useId();

  const [bbsTyOptions, setBbsTyOptions] = useState<CodeOpt[]>([]);
  const [layoutOptions, setLayoutOptions] = useState<CodeOpt[]>([]);
  /** 선택한 게시판 유형(CODE_ID)에 따른 기능 활성화 공통코드 */
  const [featureCodeOpts, setFeatureCodeOpts] = useState<FeatureCodeOpt[]>([]);
  const [searchBbsTy, setSearchBbsTy] = useState("");
  const [searchKw, setSearchKw] = useState("");
  const [list, setList] = useState<BbsRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(true);
  const [mainTab, setMainTab] = useState<"basic" | "auth" | "trash" | "comment">("basic");

  const [bbsId, setBbsId] = useState("");
  const [bbsNmKey, setBbsNmKey] = useState("");
  const [bbsName, setBbsName] = useState("");
  const [bbsCn, setBbsCn] = useState("");
  const [bbsTy, setBbsTy] = useState("GENERAL");
  /** 상세 조회 등으로 바뀐 bbsTy와 구분: 사용자가 폼에서 유형을 바꿀 때만 공통코드 기본값을 토글에 반영 */
  const bbsTyRef = useRef(bbsTy);
  const applyFeatureFlagsAfterBbsTyUserChangeRef = useRef(false);
  useEffect(() => {
    bbsTyRef.current = bbsTy;
  }, [bbsTy]);

  const [layoutTy, setLayoutTy] = useState("LIST");
  const [useFl, setUseFl] = useState(true);
  const [replyFl, setReplyFl] = useState(true);
  const [commentFl, setCommentFl] = useState(true);
  const [likeFl, setLikeFl] = useState(true);
  const [dislikeFl, setDislikeFl] = useState(false);
  const [atchmnflFl, setAtchmnflFl] = useState(true);
  const [noticeFl, setNoticeFl] = useState(true);
  const [enfrcSecretFl, setEnfrcSecretFl] = useState(false);
  const [anonymousFl, setAnonymousFl] = useState(false);
  const [commentConfmFl, setCommentConfmFl] = useState(false);
  const [resveFl, setResveFl] = useState(false);
  const [categoryFl, setCategoryFl] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState<number | null>(10);
  const [maxFileCount, setMaxFileCount] = useState<number | null>(4);
  const [permExtsn, setPermExtsn] = useState<string | null>(null);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [titleLength, setTitleLength] = useState(30);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [sortingSq, setSortingSq] = useState(0);

  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<{ categoryNm: string }[]>([]);
  const [authors, setAuthors] = useState<BbsAuthRow[]>([]);
  const [tabTrashOrange, setTabTrashOrange] = useState(false);
  const [tabCommentOrange, setTabCommentOrange] = useState(false);
  /** 화면설계: 일반/공지/익명/갤러리 프리셋 — 수동 변경 시 CUSTOM */
  const [featurePreset, setFeaturePreset] = useState<FeaturePreset>("GENERAL");

  const [trashRows, setTrashRows] = useState<TrashRow[]>([]);
  const [commentRows, setCommentRows] = useState<CommentRow[]>([]);
  const [popupRows, setPopupRows] = useState<PopupNoticeRow[]>([]);
  const [popupSettingOpen, setPopupSettingOpen] = useState(false);
  const [popupSetting, setPopupSetting] = useState<PopupSetting | null>(null);
  const [popupUseFl, setPopupUseFl] = useState(true);
  const [popupHideFl, setPopupHideFl] = useState(true);
  const [popupStartDt, setPopupStartDt] = useState("");
  const [popupEndDt, setPopupEndDt] = useState("");
  const [popupXcnts, setPopupXcnts] = useState<number | null>(100);
  const [popupYdnts, setPopupYdnts] = useState<number | null>(100);
  const [popupWidth, setPopupWidth] = useState<number | null>(400);
  const [popupVrticl, setPopupVrticl] = useState<number | null>(500);
  const [popupPreviewOpen, setPopupPreviewOpen] = useState(false);
  const [popupPreview, setPopupPreview] = useState<PopupPreview | null>(null);
  const [popupActionLoading, setPopupActionLoading] = useState(false);
  const popupPreviewReadKeyRef = useRef("");
  const [showBbsNameLookupPopup, setShowBbsNameLookupPopup] = useState(false);

  const isMemo = useMemo(() => isMemoBoardType(bbsTy), [bbsTy]);
  const isPopupBoard = selectedId === "BBS-POPUP";

  /** 공통코드가 비어 있으면 LIST/CARD/ALBUM 기본값 — 목록형 → 카드형 → 앨범형 순 */
  const layoutOptionsForUi = useMemo(() => {
    const rank = (code: string) => {
      const u = code.toUpperCase();
      if (u.includes("LIST")) return 0;
      if (u.includes("CARD")) return 1;
      return 2;
    };
    const source = layoutOptions.length > 0 ? layoutOptions : defaultLayoutOptions;
    return [...source].sort((a, b) => rank(a.code) - rank(b.code));
  }, [layoutOptions]);

  const applyFeaturePreset = useCallback((p: Exclude<FeaturePreset, "CUSTOM">) => {
    setFeaturePreset(p);
    if (p === "GENERAL") {
      setReplyFl(true);
      setCommentFl(true);
      setLikeFl(true);
      setDislikeFl(true);
      setAtchmnflFl(true);
      setNoticeFl(true);
      setEnfrcSecretFl(false);
      setAnonymousFl(false);
      setCommentConfmFl(true);
      setResveFl(true);
      setCategoryFl(true);
    } else if (p === "NOTICE") {
      setReplyFl(false);
      setCommentFl(true);
      setLikeFl(true);
      setDislikeFl(true);
      setAtchmnflFl(true);
      setNoticeFl(true);
      setEnfrcSecretFl(false);
      setAnonymousFl(false);
      setCommentConfmFl(true);
      setResveFl(true);
      setCategoryFl(true);
    } else if (p === "ANONYMOUS") {
      setReplyFl(false);
      setCommentFl(true);
      setLikeFl(true);
      setDislikeFl(true);
      setAtchmnflFl(true);
      setNoticeFl(false);
      setEnfrcSecretFl(false);
      setAnonymousFl(true);
      setCommentConfmFl(true);
      setResveFl(true);
      setCategoryFl(true);
    } else if (p === "GALLERY") {
      setReplyFl(false);
      setCommentFl(true);
      setLikeFl(true);
      setDislikeFl(true);
      setAtchmnflFl(true);
      setNoticeFl(false);
      setEnfrcSecretFl(false);
      setAnonymousFl(false);
      setCommentConfmFl(true);
      setResveFl(true);
      setCategoryFl(true);
    } else if (p === "GUESTBOOK") {
      setReplyFl(false);
      setCommentFl(false);
      setLikeFl(true);
      setDislikeFl(true);
      setAtchmnflFl(false);
      setNoticeFl(false);
      setEnfrcSecretFl(false);
      setAnonymousFl(true);
      setCommentConfmFl(true);
      setResveFl(false);
      setCategoryFl(false);
    } else {
      // QNA
      setReplyFl(false);
      setCommentFl(true);
      setLikeFl(true);
      setDislikeFl(true);
      setAtchmnflFl(true);
      setNoticeFl(false);
      setEnfrcSecretFl(false);
      setAnonymousFl(false);
      setCommentConfmFl(true);
      setResveFl(false);
      setCategoryFl(false);
    }
  }, []);

  const enforceMemoDisabledFlags = useCallback(() => {
    // 메모게시판은 답글/예약게시/카테고리분류를 항상 비활성으로 고정
    setReplyFl(false);
    setResveFl(false);
    setCategoryFl(false);
  }, []);

  const applyFeatureFlagsByCodeOptions = useCallback((options: FeatureCodeOpt[]) => {
    const codeUseMap = new Map<string, boolean>();
    options.forEach((o) => {
      const code = String(o.detailCodeValue || "").trim().toUpperCase();
      if (!code) return;
      codeUseMap.set(code, String(o.useFl || "N").toUpperCase() === "Y");
    });
    const pick = (code: string, def: boolean) => (codeUseMap.has(code) ? codeUseMap.get(code)! : def);
    setReplyFl(pick("REPLY_FL", true));
    setCommentFl(pick("COMMENT_FL", true));
    setLikeFl(pick("LIKE_FL", true));
    setDislikeFl(pick("DISLIKE_FL", false));
    setAtchmnflFl(pick("ATCHMNFL_FL", true));
    setNoticeFl(pick("NOTICE_FL", true));
    setEnfrcSecretFl(pick("ENFRC_SECRET_FL", false));
    setAnonymousFl(pick("ANONYMOUS_FL", false));
    setCommentConfmFl(pick("COMMENT_CONFM_FL", false));
    setResveFl(pick("RESVE_FL", false));
    setCategoryFl(pick("CATEGORY_FL", false));
    setFeaturePreset("CUSTOM");
  }, []);

  const loadCodeOptions = useCallback(() => {
    const cd = cmpnyCd?.trim();
    if (!cd) {
      setBbsTyOptions([]);
      setLayoutOptions([]);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cd, langCode });
    EgovNet.requestFetch(
      `/bbs/bbsTypes?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: CodeOpt[] }) => {
        if (Array.isArray(resp?.result)) setBbsTyOptions(resp.result);
        else setBbsTyOptions([]);
      },
      () => setBbsTyOptions([])
    );
    EgovNet.requestFetch(
      `/bbs/layoutTypes?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: CodeOpt[] }) => {
        if (Array.isArray(resp?.result)) setLayoutOptions(resp.result);
        else setLayoutOptions([]);
      },
      () => setLayoutOptions([])
    );
  }, [cmpnyCd, langCode]);

  const loadFeatureCodeOptions = useCallback(() => {
    const cd = cmpnyCd?.trim();
    const tyAtRequest = bbsTyRef.current?.trim() || "";
    if (!cd || !tyAtRequest) {
      setFeatureCodeOpts([]);
      return;
    }
    // 기준: 기능활성화 조회의 CODE_ID는 선택한 게시판유형의 DETAIL_CODE_VALUE
    const q = new URLSearchParams({ cmpnyCd: cd, bbsTyCodeId: tyAtRequest, langCode });
    EgovNet.requestFetch(
      `/bbs/featureCodeOptions?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: FeatureCodeOpt[] }) => {
        const rows = Array.isArray(resp?.result) ? resp.result : [];
        const tyNow = bbsTyRef.current?.trim() || "";
        if (tyAtRequest !== tyNow) return;
        setFeatureCodeOpts(rows);
        if (applyFeatureFlagsAfterBbsTyUserChangeRef.current) {
          applyFeatureFlagsByCodeOptions(rows);
          if (isMemoBoardType(tyNow)) enforceMemoDisabledFlags();
          applyFeatureFlagsAfterBbsTyUserChangeRef.current = false;
        }
      },
      () => setFeatureCodeOpts([])
    );
  }, [cmpnyCd, langCode, applyFeatureFlagsByCodeOptions, enforceMemoDisabledFlags]);

  const loadList = useCallback(() => {
    if (!cmpnyCd?.trim()) return;
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim(), langCode });
    if (searchBbsTy) q.set("bbsTy", searchBbsTy);
    if (searchKw.trim()) q.set("searchKeyword", searchKw.trim());
    EgovNet.requestFetch(
      `/bbs/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: BbsRow[] }) => {
        if (Array.isArray(resp?.result)) setList(resp.result);
        else setList([]);
      },
      () => setList([])
    );
  }, [cmpnyCd, langCode, searchBbsTy, searchKw]);

  const applyDetail = useCallback((d: BbsDetail) => {
    setBbsId(d.bbsId || "");
    setBbsNmKey(d.bbsNmKey || "");
    setBbsName(d.bbsName || "");
    setBbsCn(d.bbsCn || "");
    setBbsTy(d.bbsTy || "GENERAL");
    setLayoutTy((d.layoutTy || "LIST").trim().toUpperCase());
    setUseFl(parseYn(d.useFl, true));
    setReplyFl(parseYn(d.replyFl, true));
    setCommentFl(parseYn(d.commentFl, true));
    setLikeFl(parseYn(d.likeFl, true));
    setDislikeFl(parseYn(d.dislikeFl, false));
    const attachOn = parseYn(d.atchmnflFl, true);
    setAtchmnflFl(attachOn);
    setNoticeFl(parseYn(d.noticeFl, true));
    setEnfrcSecretFl(parseYn(d.enfrcSecretFl, false));
    setAnonymousFl(parseYn(d.anonymousFl, false));
    setCommentConfmFl(parseYn(d.commentConfmFl, false));
    setResveFl(parseYn(d.resveFl, false));
    setCategoryFl(parseYn(d.categoryFl, false));
    if (attachOn) {
      setMaxFileSize(d.maxFileSize ?? 10);
      setMaxFileCount(d.maxFileCount ?? 4);
      setPermExtsn(d.permExtsn != null && String(d.permExtsn).trim() !== "" ? String(d.permExtsn).trim() : null);
    } else {
      setMaxFileSize(null);
      setMaxFileCount(null);
      setPermExtsn(null);
    }
    setPostsPerPage(d.postsPerPage ?? 10);
    setTitleLength(d.titleLength ?? 30);
    setValidFrom(d.validFrom ? d.validFrom.slice(0, 16) : "");
    setValidTo(d.validTo ? d.validTo.slice(0, 16) : "");
    setSortingSq(d.sortingSq ?? 0);
    setCategories((d.categories || []).map((c) => ({ categoryNm: c.categoryNm })));
    setAuthors(
      (d.authors || []).map((a) => ({
        targetTy: a.targetTy as BbsAuthRow["targetTy"],
        targetCd: a.targetCd,
        targetNm: a.targetNm,
        readingFl: a.readingFl || "N",
        writingFl: a.writingFl || "N",
        replyFl: a.replyFl || "N",
        managerFl: a.managerFl || "N",
      }))
    );
    setTabTrashOrange(!!d.tabTrashOrange);
    setTabCommentOrange(!!d.tabCommentOrange);
    setFeaturePreset("CUSTOM");
    if (isMemoBoardType(d.bbsTy)) {
      setReplyFl(false);
      setResveFl(false);
      setCategoryFl(false);
      setCategories([]);
      setCategoryInput("");
    }
  }, []);

  const loadDetail = useCallback(
    (id: string) => {
      if (!cmpnyCd?.trim()) return;
      const q = new URLSearchParams({ bbsId: id, cmpnyCd: cmpnyCd.trim(), langCode });
      EgovNet.requestFetch(
        `/bbs/detail?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp: { result?: BbsDetail }) => {
          if (resp?.result) {
            applyDetail(resp.result);
            setSelectedId(id);
            setIsNew(false);
          }
        },
        () => alert(i18nText.msgDetailViewError)
      );
    },
    [cmpnyCd, langCode, applyDetail, i18nText.msgDetailViewError]
  );

  const fetchNextId = (cb: (id: string) => void) => {
    EgovNet.requestFetch(
      `/bbs/nextBbsId`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: { bbsId?: string } }) => {
        const id = resp?.result?.bbsId;
        if (id) cb(id);
        else alert(i18nText.msgBbsIdSeqFail);
      },
      () => alert(i18nText.msgBbsIdSeqFail)
    );
  };

  const resetNew = useCallback(() => {
    setSelectedId(null);
    setIsNew(true);
    setMainTab("basic");
    setPopupSettingOpen(false);
    setPopupSetting(null);
    setPopupPreviewOpen(false);
    setPopupPreview(null);
    setPopupRows([]);
    fetchNextId((id) => {
      setBbsId(id);
      setBbsNmKey("");
      setBbsName("");
      setBbsCn("");
      setBbsTy(bbsTyOptions[0]?.code || "GENERAL");
      setLayoutTy((layoutOptions[0]?.code || defaultLayoutOptions[0].code).trim().toUpperCase());
      setUseFl(true);
      setReplyFl(true);
      setCommentFl(true);
      setLikeFl(true);
      setDislikeFl(false);
      setAtchmnflFl(true);
      setNoticeFl(true);
      setEnfrcSecretFl(false);
      setAnonymousFl(false);
      setCommentConfmFl(false);
      setResveFl(false);
      setCategoryFl(false);
      setMaxFileSize(10);
      setMaxFileCount(4);
      setPermExtsn(null);
      setPostsPerPage(10);
      setTitleLength(30);
      setValidFrom("");
      setValidTo("");
      setSortingSq(0);
      setCategories([]);
      setAuthors([]);
      setTrashRows([]);
      setCommentRows([]);
      setTabTrashOrange(false);
      setTabCommentOrange(false);
      setFeaturePreset("GENERAL");
    });
    fetchCompanyList((list: CompanyOption[]) => {
      const next = resolveCmpnyCdForFormCreate(list);
      if (next) onCompanyChange(next);
    });
  }, [bbsTyOptions, layoutOptions, onCompanyChange]);

  useEffect(() => {
    loadCodeOptions();
  }, [loadCodeOptions]);

  useEffect(() => {
    loadFeatureCodeOptions();
  }, [loadFeatureCodeOptions]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const allowed = isMemoBoardType(bbsTy) ? MEMO_PRESETS : GENERAL_PRESETS;
    const current = featurePreset === "CUSTOM" ? "" : featurePreset;
    if (featurePreset !== "CUSTOM" && !allowed.includes(current as FeaturePreset)) {
      applyFeaturePreset(allowed[0] as Exclude<FeaturePreset, "CUSTOM">);
      return;
    }
    if (isMemoBoardType(bbsTy)) {
      enforceMemoDisabledFlags();
    }
  }, [bbsTy, featurePreset, applyFeaturePreset, enforceMemoDisabledFlags]);

  /** 첨부 비활성 시 파일 제한 필드 null 초기화 / 다시 활성 시 숫자만 비었으면 기본값 */
  useEffect(() => {
    if (!atchmnflFl) {
      setMaxFileSize(null);
      setMaxFileCount(null);
      setPermExtsn(null);
      return;
    }
    setMaxFileSize((s) => (s == null ? 10 : s));
    setMaxFileCount((c) => (c == null ? 4 : c));
  }, [atchmnflFl]);

  /** 메모 게시판: 카테고리 분류 미사용 — 목록·입력 비움 */
  useEffect(() => {
    if (isMemo) {
      setCategories([]);
      setCategoryInput("");
    }
  }, [isMemo]);

  const buildPayload = (): Record<string, unknown> => ({
    bbsId: bbsId.trim(),
    cmpnyCd: cmpnyCd.trim(),
    bbsNmKey: bbsNmKey.trim(),
    bbsName: bbsName.trim() || undefined,
    bbsCn: bbsCn.trim() || undefined,
    bbsTy,
    layoutTy: (layoutTy || "LIST").trim().toUpperCase(),
    replyFl: isMemo ? null : yn(replyFl),
    commentFl: yn(commentFl),
    likeFl: yn(likeFl),
    dislikeFl: yn(dislikeFl),
    atchmnflFl: yn(atchmnflFl),
    noticeFl: yn(noticeFl),
    enfrcSecretFl: yn(enfrcSecretFl),
    anonymousFl: yn(anonymousFl),
    commentConfmFl: yn(commentConfmFl),
    resveFl: isMemo ? null : yn(resveFl),
    categoryFl: isMemo ? null : yn(categoryFl),
    maxFileSize: atchmnflFl ? maxFileSize : null,
    maxFileCount: atchmnflFl ? maxFileCount : null,
    permExtsn: atchmnflFl ? (permExtsn != null && permExtsn.trim() !== "" ? permExtsn.trim() : null) : null,
    postsPerPage,
    titleLength,
    validFrom: validFrom ? `${validFrom}:00`.replace("T", " ") : undefined,
    validTo: validTo ? `${validTo}:00`.replace("T", " ") : undefined,
    sortingSq,
    useFl: yn(useFl),
    categories: isMemo ? [] : categories.map((c, i) => ({ categoryNm: c.categoryNm, sortingSq: i })),
    authors,
  });

  const handleSave = () => {
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    if (!bbsNmKey.trim()) {
      alert(i18nText.msgBbsNameRequired);
      return;
    }
    const body = buildPayload();
    const url = isNew ? "/bbs" : "/bbs";
    const method = isNew ? "POST" : "PUT";
    EgovNet.requestFetch(
      url,
      {
        method,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(body),
      },
      (resp: { resultCode?: string | number; resultMessage?: string; result?: { duplicateKey?: string } }) => {
        if (Number(resp?.resultCode) !== Number(CODE.RCV_SUCCESS)) {
          const dk = resp?.result && typeof resp.result === "object" ? (resp.result as { duplicateKey?: string }).duplicateKey : undefined;
          if (dk === "BBS_ID" && bbsIdRef.current) {
            bbsIdRef.current.focus();
          }
          alert(resp?.resultMessage || i18nText.msgSaveFailed);
          return;
        }
        alert(i18nText.msgSaveSuccess);
        loadList();
        if (isNew && bbsId.trim()) {
          loadDetail(bbsId.trim());
        } else if (bbsId.trim()) {
          loadDetail(bbsId.trim());
        }
      },
      () => alert(i18nText.msgSaveError)
    );
  };

  const handleDelete = () => {
    if (isNew || !bbsId.trim() || !cmpnyCd?.trim()) return;
    if (!confirm(i18nText.msgConfirmDelete)) return;
    const q = new URLSearchParams({ bbsId: bbsId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/bbs?${q.toString()}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        if (Number(resp?.resultCode) !== Number(CODE.RCV_SUCCESS)) {
          alert(resp?.resultMessage || i18nText.msgDeleteFailed);
          return;
        }
        alert(i18nText.msgDeleteSuccess);
        resetNew();
        loadList();
      },
      () => alert(i18nText.msgDeleteError)
    );
  };

  const loadTrash = useCallback(() => {
    if (!bbsId.trim() || !cmpnyCd?.trim()) return;
    const q = new URLSearchParams({ bbsId: bbsId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/bbs/trash/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: TrashRow[] }) => setTrashRows(Array.isArray(resp?.result) ? resp.result : []),
      () => setTrashRows([])
    );
  }, [bbsId, cmpnyCd]);

  const loadComments = useCallback(() => {
    if (!bbsId.trim() || !cmpnyCd?.trim()) return;
    const q = new URLSearchParams({ bbsId: bbsId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/bbs/comments/pending?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: CommentRow[] }) => setCommentRows(Array.isArray(resp?.result) ? resp.result : []),
      () => setCommentRows([])
    );
  }, [bbsId, cmpnyCd]);

  const loadPopupNotices = useCallback(() => {
    if (!cmpnyCd?.trim()) return;
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim(), langCode });
    EgovNet.requestFetch(
      `/bbs/popup/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: PopupNoticeRow[] }) => setPopupRows(Array.isArray(resp?.result) ? resp.result : []),
      () => setPopupRows([])
    );
  }, [cmpnyCd, langCode]);

  const openPopupSetting = useCallback(
    (row: PopupNoticeRow) => {
      if (!row?.popupSq || !row?.nttSq || !row?.bbsId || !cmpnyCd?.trim()) return;
      const q = new URLSearchParams({ popupSq: row.popupSq, nttSq: row.nttSq, bbsId: row.bbsId, cmpnyCd: cmpnyCd.trim() });
      EgovNet.requestFetch(
        `/bbs/popup/setting?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp: { result?: PopupSetting }) => {
          const s = resp?.result;
          if (!s) return;
          setPopupSetting(s);
          setPopupUseFl(parseYn(s.useFl, true));
          setPopupHideFl(parseYn(s.hideFl, true));
          setPopupStartDt(toDateTimeLocal(s.startDt));
          setPopupEndDt(toDateTimeLocal(s.endDt));
          setPopupXcnts(s.xcnts ?? 100);
          setPopupYdnts(s.ydnts ?? 100);
          setPopupWidth(s.width ?? 400);
          setPopupVrticl(s.vrticl ?? 500);
          setPopupSettingOpen(true);
        },
        () => alert(i18nText.msgPopupConfigError)
      );
    },
    [cmpnyCd, i18nText.msgPopupConfigError]
  );

  const loadPopupPreview = useCallback(
    (setting: PopupSetting) => {
      if (!setting?.popupSq || !setting?.nttSq || !setting?.bbsId || !setting?.cmpnyCd) return;
      const q = new URLSearchParams({
        popupSq: setting.popupSq,
        nttSq: setting.nttSq,
        bbsId: setting.bbsId,
        cmpnyCd: setting.cmpnyCd,
        langCode,
      });
      EgovNet.requestFetch(
        `/bbs/main/popup/preview?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp: { resultCode?: number; result?: PopupPreview | null; resultMessage?: string }) => {
          const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
          if (!ok || !resp?.result) {
            setPopupPreview(null);
            alert(resp?.resultMessage || i18nText.msgPopupPreviewFail);
            return;
          }
          setPopupPreview(resp.result);
        },
        () => alert(i18nText.msgPopupPreviewError)
      );
    },
    [langCode, i18nText.msgPopupPreviewError, i18nText.msgPopupPreviewFail]
  );

  const sendPopupPreviewRead = useCallback((preview: PopupPreview) => {
    setPopupActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/post/read",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nttSq: preview.nttSq, bbsId: preview.bbsId, cmpnyCd: preview.cmpnyCd }),
      },
      () => setPopupActionLoading(false),
      () => setPopupActionLoading(false)
    );
  }, []);

  const togglePopupPreviewVote = useCallback(
    (voteGb: "L" | "D") => {
      if (!popupPreview) return;
      // 즉시 UI 반영: 추천/비추천은 상호 배타
      setPopupPreview((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        const currentLike = next.myLikeFl === "Y";
        const currentDislike = next.myDislikeFl === "Y";
        const likeCnt = Number(next.likeCnt ?? 0);
        const dislikeCnt = Number(next.dislikeCnt ?? 0);
        if (voteGb === "L") {
          if (currentLike) {
            next.myLikeFl = "N";
            next.likeCnt = Math.max(0, likeCnt - 1);
          } else {
            next.myLikeFl = "Y";
            next.likeCnt = likeCnt + 1;
            if (currentDislike) {
              next.myDislikeFl = "N";
              next.dislikeCnt = Math.max(0, dislikeCnt - 1);
            }
          }
        } else {
          if (currentDislike) {
            next.myDislikeFl = "N";
            next.dislikeCnt = Math.max(0, dislikeCnt - 1);
          } else {
            next.myDislikeFl = "Y";
            next.dislikeCnt = dislikeCnt + 1;
            if (currentLike) {
              next.myLikeFl = "N";
              next.likeCnt = Math.max(0, likeCnt - 1);
            }
          }
        }
        return next;
      });
      setPopupActionLoading(true);
      EgovNet.requestFetch(
        "/bbs/main/post/vote/toggle",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nttSq: popupPreview.nttSq,
            bbsId: popupPreview.bbsId,
            cmpnyCd: popupPreview.cmpnyCd,
            voteGb,
          }),
        },
        () => {
          setPopupActionLoading(false);
        },
        () => {
          setPopupActionLoading(false);
          loadPopupPreview(popupPreview);
          alert(i18nText.msgVoteError);
        }
      );
    },
    [popupPreview, loadPopupPreview, i18nText.msgVoteError]
  );

  const togglePopupPreviewFavorite = useCallback(() => {
    if (!popupPreview) return;
    setPopupPreview((prev) => {
      if (!prev) return prev;
      const active = prev.myFavoriteFl === "Y";
      const cnt = Number(prev.favoriteCnt ?? 0);
      return {
        ...prev,
        myFavoriteFl: active ? "N" : "Y",
        favoriteCnt: active ? Math.max(0, cnt - 1) : cnt + 1,
      };
    });
    setPopupActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/post/favorite/toggle",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nttSq: popupPreview.nttSq,
          bbsId: popupPreview.bbsId,
          cmpnyCd: popupPreview.cmpnyCd,
        }),
      },
      () => {
        setPopupActionLoading(false);
      },
      () => {
        setPopupActionLoading(false);
        loadPopupPreview(popupPreview);
        alert(i18nText.msgFavoriteError);
      }
    );
  }, [popupPreview, loadPopupPreview, i18nText.msgFavoriteError]);

  const closePopupPreview = useCallback(() => {
    popupPreviewReadKeyRef.current = "";
    setPopupPreviewOpen(false);
    setPopupPreview(null);
  }, []);

  const closePopupPreviewNever = useCallback(() => {
    if (popupPreview?.popupSq) {
      localStorage.setItem(`bbs-popup-admin-preview-never-${popupPreview.popupSq}`, "Y");
    }
    closePopupPreview();
  }, [popupPreview, closePopupPreview]);

  const closePopupPreviewToday = useCallback(() => {
    if (popupPreview?.popupSq) {
      localStorage.setItem(`bbs-popup-admin-preview-today-${popupPreview.popupSq}`, todayYmd());
    }
    closePopupPreview();
  }, [popupPreview, closePopupPreview]);

  const copyPopupPreviewUrl = useCallback(() => {
    if (!popupPreview) return;
    const link = `${window.location.origin}/bbs/view?bbsId=${encodeURIComponent(popupPreview.bbsId)}&nttSq=${encodeURIComponent(popupPreview.nttSq)}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert(i18nText.msgClipboardCopied))
      .catch(() => alert(i18nText.msgClipboardCopyFail));
  }, [popupPreview, i18nText.msgClipboardCopied, i18nText.msgClipboardCopyFail]);

  useEffect(() => {
    if (mainTab === "trash" && !isNew && bbsId) loadTrash();
  }, [mainTab, isNew, bbsId, loadTrash]);

  useEffect(() => {
    if (mainTab === "comment" && !isNew && bbsId) loadComments();
  }, [mainTab, isNew, bbsId, loadComments]);

  useEffect(() => {
    if (isPopupBoard) {
      loadPopupNotices();
    }
  }, [isPopupBoard, loadPopupNotices]);

  useEffect(() => {
    if (!popupPreviewOpen || !popupPreview) return;
    const readKey = `${popupPreview.popupSq}:${popupPreview.nttSq}:${popupPreview.bbsId}:${popupPreview.cmpnyCd}`;
    if (popupPreviewReadKeyRef.current === readKey) return;
    popupPreviewReadKeyRef.current = readKey;
    sendPopupPreviewRead(popupPreview);
    loadPopupPreview(popupPreview);
  }, [
    popupPreviewOpen,
    popupPreview?.popupSq,
    popupPreview?.nttSq,
    popupPreview?.bbsId,
    popupPreview?.cmpnyCd,
    sendPopupPreviewRead,
    loadPopupPreview,
  ]);

  const featureSwitchDefs: {
    code: string;
    icon: string;
    value: boolean;
    set: (v: boolean) => void;
    disabled: boolean;
  }[] = [
      { code: "REPLY_FL", icon: "↩️", value: replyFl, set: setReplyFl, disabled: isMemo },
      { code: "DISLIKE_FL", icon: "👎", value: dislikeFl, set: setDislikeFl, disabled: false },
      { code: "ENFRC_SECRET_FL", icon: "🔒", value: enfrcSecretFl, set: setEnfrcSecretFl, disabled: false },
      { code: "RESVE_FL", icon: "📅", value: resveFl, set: setResveFl, disabled: isMemo },
      { code: "CATEGORY_FL", icon: "📁", value: categoryFl, set: setCategoryFl, disabled: isMemo },
      { code: "COMMENT_FL", icon: "💬", value: commentFl, set: setCommentFl, disabled: false },
      { code: "ATCHMNFL_FL", icon: "📎", value: atchmnflFl, set: setAtchmnflFl, disabled: false },
      { code: "ANONYMOUS_FL", icon: "🎭", value: anonymousFl, set: setAnonymousFl, disabled: false },
      { code: "LIKE_FL", icon: "👍", value: likeFl, set: setLikeFl, disabled: false },
      { code: "NOTICE_FL", icon: "📢", value: noticeFl, set: setNoticeFl, disabled: isMemo },
      { code: "COMMENT_CONFM_FL", icon: "✅", value: commentConfmFl, set: setCommentConfmFl, disabled: false },
    ];

  const featureGridItems = useMemo(() => {
    const known = new Set<string>([...BBS_FEATURE_FALLBACK_ORDER]);
    const mapped = [...featureCodeOpts]
      .filter((o) => String(o.detailCodeValue || "").trim())
      .sort((a, b) => (a.sortingSq ?? 0) - (b.sortingSq ?? 0))
      .map((o) => {
        const code = String(o.detailCodeValue || "").trim().toUpperCase();
        const id = String(o.detailCodeId || code).trim();
        const label = featureFallbackLabels[code] || String(o.name || "").trim() || code;
        const enabled = String(o.useFl || "Y").toUpperCase() !== "N";
        return { code, id, label, enabled };
      })
      .filter((row) => known.has(row.code));

    const base = BBS_FEATURE_FALLBACK_ORDER.map((code) => ({
      code,
      id: code,
      label: featureFallbackLabels[code] || code,
      enabled: true,
    }));

    if (mapped.length === 0) return base;

    const byCode = new Map(mapped.map((m) => [m.code, m]));
    return BBS_FEATURE_FALLBACK_ORDER.map((code) => byCode.get(code) || { code, id: code, label: featureFallbackLabels[code] || code, enabled: true });
  }, [featureCodeOpts, featureFallbackLabels]);

  const statusDotClass = (c?: string) => {
    if (c === "RED") return "bbs-status-dot bbs-status-dot--red";
    if (c === "ORANGE") return "bbs-status-dot bbs-status-dot--orange";
    return "bbs-status-dot bbs-status-dot--green";
  };
  const bbsStatusHelpText = i18nText.etcBbsStatusHelpText;

  const onDragReorder = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    const reindexed = next.map((row, i) => ({
      ...row,
      sortingSq: i + 1,
    }));
    setList(reindexed);

    // 드래그 후에도 폼의 정렬순서가 갱신되지 않으면, 이후 "저장" 시 PUT /bbs가 옛 sortingSq로 DB를 덮어씀
    if (!isNew && bbsId.trim()) {
      const idx = reindexed.findIndex((r) => r.bbsId === bbsId.trim());
      if (idx >= 0) setSortingSq(idx + 1);
    }

    const items = reindexed.map((row) => ({ bbsId: row.bbsId, sortingSq: row.sortingSq ?? 0 }));
    EgovNet.requestFetch(
      "/bbs/sortOrder",
      {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ cmpnyCd: cmpnyCd.trim(), items }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        if (Number(resp?.resultCode) !== Number(CODE.RCV_SUCCESS)) {
          alert(resp?.resultMessage || i18nText.msgSortSaveFailed);
          loadList();
          if (!isNew && bbsId.trim()) loadDetail(bbsId.trim());
          return;
        }
        loadList();
      },
      () => {
        alert(i18nText.msgSortSaveError);
        loadList();
        if (!isNew && bbsId.trim()) loadDetail(bbsId.trim());
      }
    );
  };

  return (
    <>
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
            <div className="contents md-widget-dataset-page">
              <div className="condition md-condition md-condition-plain-row">
                <div className="left-box">
                  <label className="f_select" htmlFor="bbs_cmpny">
                    <select id="bbs_cmpny" value={cmpnyCd} onChange={(e) => onCompanyChange(e.target.value)}>
                      {companyList.map((c) => (
                        <option key={c.cmpnyCd} value={c.cmpnyCd}>
                          {c.cmpnyNm}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="right-box">
                  <button type="button" className="pd-btn" onClick={handleDelete} disabled={isNew || isPopupBoard} style={{ opacity: isNew || isPopupBoard ? 0.5 : 1, cursor: isNew || isPopupBoard ? "not-allowed" : "pointer" }}>{i18nText.btnDelete}</button>
                  <button type="button" className="pd-btn primary" onClick={handleSave} disabled={isPopupBoard} style={{ opacity: isPopupBoard ? 0.5 : 1, cursor: isPopupBoard ? "not-allowed" : "pointer" }}>{i18nText.btnSave}</button>
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
                  <h3 className="system-subtitle" style={{ margin: "0 0 12px" }}>
                    {i18nText.titleBbsList}
                  </h3>
                  <div className="f_group pop_form_label_top md-wds-list-search-row">
                    <div className="md-wds-list-search-field">
                      <label className="f_label" htmlFor="bbs_search_ty">{i18nText.labelType}</label>
                      <select id="bbs_search_ty" className="f_select" value={searchBbsTy} onChange={(e) => setSearchBbsTy(e.target.value)}>
                        <option value="">{i18nText.etcAll}</option>
                        {bbsTyOptions.map((o) => (
                          <option key={`${o.code}-${o.detailCodeId ?? ""}`} value={o.code}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md-wds-list-search-field md-wds-list-search-field--grow">
                      <label className="f_label" htmlFor="bbs_search_kw">{i18nText.labelBoardName}</label>
                      <input id="bbs_search_kw" className="f_input" value={searchKw} onChange={(e) => setSearchKw(e.target.value)} placeholder={i18nText.placeholderSearch} />
                    </div>
                    <button type="button" className="pd-btn primary" onClick={() => loadList()}>{i18nText.btnSearch}</button>
                    <button
                      type="button"
                      className="pd-btn"
                      title={i18nText.btnAdd}
                      onClick={() => { resetNew(); }}
                    >
                      {i18nText.btnPlus}
                    </button>
                  </div>

                  <div className="board_list md-admin-list md-bbs-mgmt-list" style={{ maxHeight: 520 }}>
                    <div className="head">
                      <span className="md-bbs-col-status" title={bbsStatusHelpText}>
                        {i18nText.labelBoardStatus}
                      </span>
                      <span className="md-bbs-col-name" style={{ textAlign: "center" }}>{i18nText.labelBoardName}</span>
                      <span className="md-bbs-col-ty">{i18nText.labelBoardType}</span>
                    </div>
                    <div className="result">
                      {list.map((row, idx) => (
                        <button
                          type="button"
                          key={row.bbsId}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", String(idx));
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const from = Number(e.dataTransfer.getData("text/plain"));
                            if (!Number.isNaN(from)) onDragReorder(from, idx);
                          }}
                          className={`list_item ${selectedId === row.bbsId && !isNew ? "is-selected" : ""}`}
                          style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", cursor: "pointer", padding: "8px 10px" }}
                          onClick={() => {
                            if (row.bbsId === "BBS-POPUP") {
                              setSelectedId("BBS-POPUP");
                              setIsNew(false);
                              setPopupSettingOpen(false);
                              setPopupPreviewOpen(false);
                              setMainTab("basic");
                              loadPopupNotices();
                              return;
                            }
                            setPopupSettingOpen(false);
                            setPopupPreviewOpen(false);
                            loadDetail(row.bbsId);
                          }}
                        >
                          <span className="md-bbs-col-status">
                            <span
                              className={statusDotClass(row.statusColor)}
                              title={bbsStatusHelpText}
                              aria-label={`${i18nText.labelBoardStatus}: ${bbsStatusHelpText.split("\n").join(", ")}`}
                            />
                          </span>
                          <span className="md-bbs-col-name" style={{ textAlign: "center" }}>{row.bbsName}</span>
                          <span className="md-bbs-col-ty">{row.bbsTyNm || row.bbsTy}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="md-form-card">
                  {!isPopupBoard && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <h3 className="system-subtitle" style={{ margin: 0 }}>
                        {(bbsName.trim() === i18nText.etcQnaName ? i18nText.etcNoticeName : bbsName) || i18nText.etcBoardDefaultName}
                      </h3>
                    </div>
                  )}

                  {isPopupBoard && (
                    <>
                      <h3 className="system-subtitle" style={{ margin: "0 0 12px" }}>
                        {i18nText.titlePopupNotice}
                      </h3>
                      <div className="board_list md-admin-list md-bbs-popup-notice-list" style={{ maxHeight: 520 }}>
                        <div className="head">
                          <span>{i18nText.labelBoardName}</span>
                          <span>{i18nText.labelTitle}</span>
                          <span>{i18nText.labelWriter}</span>
                          <span>{i18nText.labelDateTime}</span>
                          <span>{i18nText.btnSetting}</span>
                        </div>
                        <div className="result">
                          {popupRows.length === 0 ? (
                            <p className="no_data">{i18nText.msgNoPopupNotice}</p>
                          ) : (
                            popupRows.map((r) => (
                              <div key={`${r.popupSq}-${r.nttSq}-${r.bbsId}`} className="list_item">
                                <div>{r.bbsNm ?? ""}</div>
                                <div className="md-bbs-popup-notice-list__title" title={r.title} style={{ paddingLeft: Number(r.depth || 0) > 0 ? `${Math.min(Number(r.depth || 0), 6) * 14}px` : undefined }}>
                                  {(Number(r.depth || 0) > 0 ? "↳ " : "") + (r.title || "")}
                                </div>
                                <div>{r.userNm ?? ""}</div>
                                <div>{r.creationDt ?? ""}</div>
                                <div className="md-bbs-popup-notice-list__actions">
                                  <button type="button" className="btn btn_skyblue_h46 md-bbs-tab-four-cols__btn" onClick={() => openPopupSetting(r)}>
                                    {i18nText.btnSetting}
                                  </button>
                                  <span className={statusDotClass(r.statusColor)} title={i18nText.etcPopupNoticeStatus} aria-hidden />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {!isPopupBoard && (
                    <>
                      <MdUnderlineTabs<"basic" | "auth" | "trash" | "comment">
                        aria-label={i18nText.titleBbs}
                        value={mainTab}
                        onChange={(v) => setMainTab(v)}
                        sx={{ mb: 1.5 }}
                        items={[
                          { value: "basic", label: i18nText.titleBasicSetting },
                          { value: "auth", label: i18nText.titleAuthManage },
                          {
                            value: "trash",
                            label: (
                              <span style={{ whiteSpace: "nowrap" }}>
                                {i18nText.titleTrash}
                                {tabTrashOrange ? <span style={{ color: "#ff8a00" }}>&nbsp;●</span> : ""}
                              </span>
                            ),
                          },
                          {
                            value: "comment",
                            label: (
                              <span style={{ whiteSpace: "nowrap" }}>
                                {i18nText.titleCommentApproval}
                                {tabCommentOrange ? <span style={{ color: "#ff8a00" }}>&nbsp;●</span> : ""}
                              </span>
                            ),
                          },
                        ]}
                      />

                      {mainTab === "basic" && (
                        <div className="f_group pop_form_label_top">
                          <h4 className="system-subtitle">{i18nText.titleBasicSetting}</h4>
                          <div className="md-bbs-basic-form-grid">
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_id_input">
                              {i18nText.labelBoardId}
                              <ReqStar />
                            </label>
                            <div className="md-bbs-form-control">
                              <input
                                id="bbs_id_input"
                                ref={bbsIdRef}
                                className="f_input"
                                readOnly={!isNew}
                                value={bbsId}
                                onChange={(e) => setBbsId(e.target.value)}
                              />
                            </div>
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_name_input">
                              {i18nText.labelBoardName}
                              <ReqStar />
                            </label>
                            <div className="md-bbs-form-control">
                              <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
                                <input
                                  id="bbs_name_input"
                                  type="text"
                                  className="f_input"
                                  value={bbsName}
                                  readOnly
                                  placeholder={MULTILINGUAL_LOOKUP_PLACEHOLDER}
                                  style={{ flex: 1, minWidth: 0, backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                                />
                                <button
                                  type="button"
                                  className="pd-btn primary"
                                  onClick={() => {
                                    if (!cmpnyCd?.trim()) {
                                      alert(i18nText.msgSelectCompanyFirst);
                                      return;
                                    }
                                    setShowBbsNameLookupPopup(true);
                                  }}
                                  style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                                >
                                  {i18nText.btnSearch}
                                </button>
                              </div>
                            </div>

                            <label className="f_label md-bbs-form-label" htmlFor="bbs_ty_select">
                              {i18nText.labelBoardType}
                              <ReqStar />
                            </label>
                            <div className="md-bbs-form-control">
                              <select
                                id="bbs_ty_select"
                                className="f_select"
                                value={bbsTy}
                                onChange={(e) => {
                                  applyFeatureFlagsAfterBbsTyUserChangeRef.current = true;
                                  setBbsTy(e.target.value);
                                }}
                              >
                                {bbsTyOptions.length === 0 ? (
                                  <option value={bbsTy}>{bbsTy}</option>
                                ) : (
                                  bbsTyOptions.map((o) => (
                                    <option key={`${o.code}-${o.detailCodeId ?? ""}`} value={o.code}>
                                      {o.name}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            <label className="f_label md-bbs-form-label" id="bbs_layout_label">
                              {i18nText.labelBoardConfig}
                              <ReqStar />
                            </label>
                            <div className="md-bbs-form-control md-bbs-form-control--compose">
                              <div className="bbs-layout-toggle-group" role="group" aria-labelledby="bbs_layout_label">
                                {layoutOptionsForUi.map((o) => {
                                  const selected = layoutCodesEqual(layoutTy, o.code);
                                  return (
                                    <button
                                      key={o.code}
                                      type="button"
                                      className={`bbs-layout-toggle${selected ? " is-selected" : ""}`}
                                      onClick={() => setLayoutTy(o.code.trim().toUpperCase())}
                                      aria-pressed={selected}
                                    >
                                      <span className="bbs-layout-toggle__icon" aria-hidden>
                                        <BbsLayoutKindIcon kind={layoutIconKind(o.code)} />
                                      </span>
                                      <span className="bbs-layout-toggle__label">{o.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <label className="f_label md-bbs-form-label" htmlFor="bbs_useFl">
                              {i18nText.labelBoardActive}
                            </label>
                            <div className="md-bbs-form-control md-bbs-form-control--switch">
                              <MdSwitch id="bbs_useFl" checked={useFl} onChange={setUseFl} />
                            </div>
                            <label className="f_label md-bbs-form-label md-bbs-form-label--top" htmlFor="bbs_cn">
                              {i18nText.labelDescription}
                            </label>
                            <div className="md-bbs-form-control md-bbs-form-control--textarea">
                              <textarea
                                id="bbs_cn"
                                className="f_input"
                                maxLength={400}
                                rows={3}
                                value={bbsCn}
                                onChange={(e) => setBbsCn(e.target.value)}
                                style={{ resize: "vertical", height: "auto" }}
                              />
                            </div>
                          </div>

                          <div className="bbs-feature-activation">
                            <div className="bbs-feature-activation__preset-row">
                              <label className="f_label bbs-feature-activation__preset-label" htmlFor="bbs_feature_preset">
                                {i18nText.labelFeatureActive}
                              </label>
                              <select
                                id="bbs_feature_preset"
                                className="f_select"
                                value={featurePreset}
                                onChange={(e) => {
                                  const v = e.target.value as FeaturePreset;
                                  if (v === "CUSTOM") return;
                                  applyFeaturePreset(v);
                                }}
                                title={i18nText.etcFeaturePresetTitle}
                              >
                                {isMemo ? (
                                  <>
                                    <option value="GUESTBOOK">{i18nText.etcGuestbook}</option>
                                    <option value="QNA">{i18nText.etcQna}</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="GENERAL">{i18nText.etcGeneral}</option>
                                    <option value="NOTICE">{i18nText.etcNotice}</option>
                                    <option value="ANONYMOUS">{i18nText.etcAnonymous}</option>
                                    <option value="GALLERY">{i18nText.etcGallery}</option>
                                  </>
                                )}
                              </select>
                            </div>
                            <div className="bbs-feature-grid">
                              {[0, 1, 2].map((col) => (
                                <div key={col} className="bbs-feature-grid__cell">
                                  {featureGridItems
                                    .filter((_, i) => i % 3 === col)
                                    .map((item) => {
                                      const sw = featureSwitchDefs.find((d) => d.code === item.code);
                                      if (!sw) return null;
                                      return (
                                        <MdSwitch
                                          key={item.id}
                                          id={`bbs_${item.code}`}
                                          icon={sw.icon}
                                          checked={sw.value}
                                          disabled={sw.disabled}
                                          onChange={(c) => {
                                            setFeaturePreset("CUSTOM");
                                            sw.set(c);
                                          }}
                                        >
                                          {item.label}
                                        </MdSwitch>
                                      );
                                    })}
                                </div>
                              ))}
                            </div>
                          </div>

                          {categoryFl && !isMemo && (
                            <div className="f_group_item" style={{ marginTop: 8 }}>
                              <label className="f_label">{i18nText.labelCategory}</label>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                <input
                                  className="f_input"
                                  maxLength={60}
                                  value={categoryInput}
                                  onChange={(e) => setCategoryInput(e.target.value)}
                                  placeholder={i18nText.placeholderCategoryName}
                                />
                                <button
                                  type="button"
                                  className="btn btn_blue_h46"
                                  title={i18nText.btnAdd}
                                  onClick={() => {
                                    const t = categoryInput.trim();
                                    if (!t) return;
                                    if (categories.length >= MAX_CATEGORY_COUNT) {
                                      alert(i18nText.msgCategoryMaxCount.replace("{n}", String(MAX_CATEGORY_COUNT)));
                                      return;
                                    }
                                    if (!CATEGORY_NAME_OK.test(t)) {
                                      alert(i18nText.msgCategoryNameInvalid);
                                      return;
                                    }
                                    setCategories([...categories, { categoryNm: t }]);
                                    setCategoryInput("");
                                  }}
                                >
                                  {i18nText.btnPlus}
                                </button>
                                <span className="bbs-category-hint">{i18nText.etcCategoryHint.replace("{n}", String(MAX_CATEGORY_COUNT))}</span>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                                {categories.map((c, i) => (
                                  <span
                                    key={`${c.categoryNm}-${i}`}
                                    style={{
                                      border: "1px solid var(--md-outline)",
                                      borderRadius: 8,
                                      padding: "4px 8px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    {c.categoryNm}
                                    <button type="button" className="btn btn_skyblue_h46" onClick={() => setCategories(categories.filter((_, j) => j !== i))}>
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <h4 className="system-subtitle">{i18nText.labelFileLimit}</h4>
                          <div
                            className="md-bbs-file-limit-block"
                            style={{
                              opacity: atchmnflFl ? 1 : 0.55,
                              pointerEvents: atchmnflFl ? undefined : "none",
                              backgroundColor: atchmnflFl ? undefined : "#f5f5f5",
                              borderRadius: 8,
                              padding: atchmnflFl ? 0 : "8px 10px",
                              transition: "opacity 0.15s ease",
                            }}
                            aria-disabled={!atchmnflFl}
                          >
                            <div className="md-bbs-basic-form-grid">
                              <label className="f_label md-bbs-form-label" htmlFor="bbs_max_file_mb">
                                {i18nText.labelMaxFileSize}
                              </label>
                              <div className="md-bbs-form-control">
                                <input
                                  id="bbs_max_file_mb"
                                  type="number"
                                  className="f_input"
                                  disabled={!atchmnflFl}
                                  value={maxFileSize ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    setMaxFileSize(raw === "" ? null : Number(raw));
                                  }}
                                  style={!atchmnflFl ? { backgroundColor: "#e8e8e8", cursor: "not-allowed" } : undefined}
                                />
                              </div>
                              <label className="f_label md-bbs-form-label" htmlFor="bbs_max_file_cnt">
                                {i18nText.labelMaxFileCount}
                              </label>
                              <div className="md-bbs-form-control">
                                <input
                                  id="bbs_max_file_cnt"
                                  type="number"
                                  className="f_input"
                                  disabled={!atchmnflFl}
                                  value={maxFileCount ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    setMaxFileCount(raw === "" ? null : Number(raw));
                                  }}
                                  style={!atchmnflFl ? { backgroundColor: "#e8e8e8", cursor: "not-allowed" } : undefined}
                                />
                              </div>
                              <label className="f_label md-bbs-form-label" htmlFor="bbs_perm_extsn">
                                {i18nText.labelAllowExt}
                              </label>
                              <div className="md-bbs-form-control md-bbs-form-control--span-cols-3">
                                <input
                                  id="bbs_perm_extsn"
                                  className="f_input"
                                  disabled={!atchmnflFl}
                                  maxLength={100}
                                  value={permExtsn ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setPermExtsn(v === "" ? null : v);
                                  }}
                                  placeholder={i18nText.placeholderFileTypeFilter}
                                  style={!atchmnflFl ? { backgroundColor: "#e8e8e8", cursor: "not-allowed" } : undefined}
                                />
                              </div>
                            </div>
                          </div>

                          <h4 className="system-subtitle">{i18nText.labelOperationConfig}</h4>
                          <div className="md-bbs-basic-form-grid">
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_posts_per_page">
                              {i18nText.labelPageSize}
                            </label>
                            <div className="md-bbs-form-control">
                              <input
                                id="bbs_posts_per_page"
                                type="number"
                                className="f_input"
                                value={postsPerPage}
                                onChange={(e) => setPostsPerPage(Number(e.target.value))}
                              />
                            </div>
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_title_length">
                              {i18nText.labelTitleTrim}
                            </label>
                            <div className="md-bbs-form-control">
                              <input
                                id="bbs_title_length"
                                type="number"
                                className="f_input"
                                value={titleLength}
                                onChange={(e) => setTitleLength(Number(e.target.value))}
                              />
                            </div>
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_valid_from">
                              {i18nText.labelOpenStartDate}
                            </label>
                            <div className="md-bbs-form-control">
                              <input
                                id="bbs_valid_from"
                                type="datetime-local"
                                className="f_input"
                                value={validFrom}
                                onChange={(e) => setValidFrom(e.target.value)}
                              />
                            </div>
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_valid_to">
                              {i18nText.labelOpenEndDate}
                            </label>
                            <div className="md-bbs-form-control">
                              <input
                                id="bbs_valid_to"
                                type="datetime-local"
                                className="f_input"
                                value={validTo}
                                onChange={(e) => setValidTo(e.target.value)}
                              />
                            </div>
                            <label className="f_label md-bbs-form-label" htmlFor="bbs_sorting_sq">
                              {i18nText.labelSortOrder}
                            </label>
                            <div className="md-bbs-form-control">
                              <input
                                id="bbs_sorting_sq"
                                type="number"
                                className="f_input"
                                value={sortingSq}
                                onChange={(e) => setSortingSq(Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {mainTab === "auth" && (
                        <BbsManageAuthorTab cmpnyCd={cmpnyCd || ""} langGb={langGb} authors={authors} onChange={setAuthors} t={i18nText} />
                      )}

                      {mainTab === "trash" && (
                        <div>
                          <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 12 }}>
                            <button
                              type="button"
                              className="btn btn_skyblue_h46"
                              disabled={isNew}
                              onClick={() => {
                                if (!bbsId || !cmpnyCd) return;
                                if (!confirm(i18nText.msgRestoreTrashAllConfirm)) return;
                                const q = new URLSearchParams({ bbsId, cmpnyCd });
                                EgovNet.requestFetch(
                                  `/bbs/trash/restoreAll?${q.toString()}`,
                                  { method: "PUT", headers: { "Content-type": "application/json" } },
                                  () => {
                                    loadTrash();
                                    loadDetail(bbsId);
                                  },
                                  () => { }
                                );
                              }}
                            >
                              {i18nText.btnRestoreAll}
                            </button>
                            <button
                              type="button"
                              className="btn btn_skyblue_h46"
                              disabled={isNew}
                              onClick={() => {
                                if (!bbsId || !cmpnyCd) return;
                                if (!confirm(i18nText.msgDeleteTrashAllConfirm)) return;
                                const q = new URLSearchParams({ bbsId, cmpnyCd });
                                EgovNet.requestFetch(
                                  `/bbs/trash/purgeAll?${q.toString()}`,
                                  { method: "PUT", headers: { "Content-type": "application/json" } },
                                  () => {
                                    loadTrash();
                                    loadDetail(bbsId);
                                  },
                                  () => { }
                                );
                              }}
                            >
                              {i18nText.btnDeleteAll}
                            </button>
                          </div>
                          <div className="board_list md-bbs-tab-four-cols">
                            <div className="head">
                              <span style={{ textAlign: "center" }}>{i18nText.labelTitle}</span>
                              <span>{i18nText.labelWriter}</span>
                              <span>{i18nText.labelDateTime}</span>
                              <span>{i18nText.labelAction}</span>
                            </div>
                            <div className="result">
                              {trashRows.map((r) => (
                                <div key={r.nttSq} className="list_item">
                                  <span className="md-bbs-tab-four-cols__title" title={r.title} style={{ paddingLeft: Number(r.depth || 0) > 0 ? `${Math.min(Number(r.depth || 0), 6) * 14}px` : undefined }}>
                                    {(Number(r.depth || 0) > 0 ? "↳ " : "") + r.title}
                                  </span>
                                  <span>{r.userNm}</span>
                                  <span>{r.creationDt}</span>
                                  <span className="md-bbs-tab-four-cols__actions">
                                    <button
                                      type="button"
                                      className="btn btn_skyblue_h46 md-bbs-tab-four-cols__btn"
                                      onClick={() => {
                                        const q = new URLSearchParams({ nttSq: r.nttSq, bbsId: bbsId!, cmpnyCd: cmpnyCd! });
                                        EgovNet.requestFetch(
                                          `/bbs/trash/restore?${q.toString()}`,
                                          { method: "PUT", headers: { "Content-type": "application/json" } },
                                          () => loadTrash(),
                                          () => { }
                                        );
                                      }}
                                    >
                                      {i18nText.btnRestore}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn_skyblue_h46 md-bbs-tab-four-cols__btn"
                                      onClick={() => {
                                        const q = new URLSearchParams({ nttSq: r.nttSq, bbsId: bbsId!, cmpnyCd: cmpnyCd! });
                                        EgovNet.requestFetch(
                                          `/bbs/trash/purge?${q.toString()}`,
                                          { method: "PUT", headers: { "Content-type": "application/json" } },
                                          () => loadTrash(),
                                          () => { }
                                        );
                                      }}
                                    >
                                      {i18nText.btnPermanentDelete}
                                    </button>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {mainTab === "comment" && (
                        <div>
                          <div style={{ display: "flex", flexDirection: "row", gap: 8, marginBottom: 12 }}>
                            <button
                              type="button"
                              className="btn btn_skyblue_h46"
                              disabled={isNew}
                              onClick={() => {
                                if (!bbsId || !cmpnyCd) return;
                                if (!confirm(i18nText.msgApprovePendingCommentsAll)) return;
                                const q = new URLSearchParams({ bbsId, cmpnyCd });
                                EgovNet.requestFetch(
                                  `/bbs/comments/approveAll?${q.toString()}`,
                                  { method: "PUT", headers: { "Content-type": "application/json" } },
                                  () => {
                                    loadComments();
                                    loadDetail(bbsId);
                                  },
                                  () => { }
                                );
                              }}
                            >
                              {i18nText.btnApproveAll}
                            </button>
                            <button
                              type="button"
                              className="btn btn_skyblue_h46"
                              disabled={isNew}
                              onClick={() => {
                                if (!bbsId || !cmpnyCd) return;
                                if (!confirm(i18nText.msgRejectPendingCommentsAll)) return;
                                const q = new URLSearchParams({ bbsId, cmpnyCd });
                                EgovNet.requestFetch(
                                  `/bbs/comments/rejectAll?${q.toString()}`,
                                  { method: "PUT", headers: { "Content-type": "application/json" } },
                                  () => {
                                    loadComments();
                                    loadDetail(bbsId);
                                  },
                                  () => { }
                                );
                              }}
                            >
                              {i18nText.btnRejectAll}
                            </button>
                          </div>
                          <div className="board_list md-bbs-tab-four-cols">
                            <div className="head">
                              <span style={{ textAlign: "center" }}>{i18nText.labelComment}</span>
                              <span>{i18nText.labelWriter}</span>
                              <span>{i18nText.labelDateTime}</span>
                              <span>{i18nText.labelAction}</span>
                            </div>
                            <div className="result">
                              {commentRows.map((r) => (
                                <div key={`${r.commentSq}-${r.nttSq}`} className="list_item">
                                  <span className="md-bbs-tab-four-cols__multiline">{r.comment}</span>
                                  <span>{r.userNm}</span>
                                  <span>{r.creationDt}</span>
                                  <span className="md-bbs-tab-four-cols__actions">
                                    <button
                                      type="button"
                                      className="btn btn_skyblue_h46 md-bbs-tab-four-cols__btn"
                                      onClick={() => {
                                        const q = new URLSearchParams({
                                          commentSq: r.commentSq,
                                          nttSq: r.nttSq,
                                          mbrshSq: r.mbrshSq,
                                          bbsId: bbsId!,
                                          cmpnyCd: cmpnyCd!,
                                        });
                                        EgovNet.requestFetch(
                                          `/bbs/comments/approve?${q.toString()}`,
                                          { method: "PUT", headers: { "Content-type": "application/json" } },
                                          () => loadComments(),
                                          () => { }
                                        );
                                      }}
                                    >
                                      {i18nText.btnApprove}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn_skyblue_h46 md-bbs-tab-four-cols__btn"
                                      onClick={() => {
                                        const q = new URLSearchParams({
                                          commentSq: r.commentSq,
                                          nttSq: r.nttSq,
                                          mbrshSq: r.mbrshSq,
                                          bbsId: bbsId!,
                                          cmpnyCd: cmpnyCd!,
                                        });
                                        EgovNet.requestFetch(
                                          `/bbs/comments/reject?${q.toString()}`,
                                          { method: "PUT", headers: { "Content-type": "application/json" } },
                                          () => loadComments(),
                                          () => { }
                                        );
                                      }}
                                    >
                                      {i18nText.btnReject}
                                    </button>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>
              </div>
              {popupSettingOpen && popupSetting && (
                <div className="wrap_pop" onClick={() => setPopupSettingOpen(false)} role="presentation">
                  <div
                    className="pop_inner pop_inner_w800 pop_msg_edit"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={popupSettingTitleId}
                  >
                    <div className="pop_header">
                      <h1 id={popupSettingTitleId}>{i18nText.titlePopupNoticeSetting}</h1>
                      <button type="button" className="pop_close" onClick={() => setPopupSettingOpen(false)} aria-label={i18nText.btnClose}>
                        ×
                      </button>
                    </div>
                    <div className="pop_container">
                      <div className="md-bbs-basic-form-grid">
                        <label className="f_label md-bbs-form-label">{i18nText.labelPopupActive}</label>
                        <div className="md-bbs-form-control md-bbs-form-control--switch">
                          <MdSwitch id="popup_use_fl" checked={popupUseFl} onChange={setPopupUseFl} />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelDontShow}</label>
                        <div className="md-bbs-form-control md-bbs-form-control--switch">
                          <MdSwitch id="popup_hide_fl" checked={popupHideFl} onChange={setPopupHideFl} />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelStartDate} <ReqStar /></label>
                        <div className="md-bbs-form-control">
                          <input type="datetime-local" className="f_input" value={popupStartDt} onChange={(e) => setPopupStartDt(e.target.value)} />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelEndDate} <ReqStar /></label>
                        <div className="md-bbs-form-control">
                          <input type="datetime-local" className="f_input" value={popupEndDt} onChange={(e) => setPopupEndDt(e.target.value)} />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelXCoord} <ReqStar /></label>
                        <div className="md-bbs-form-control">
                          <input
                            type="number"
                            className="f_input"
                            value={popupXcnts ?? ""}
                            onChange={(e) => setPopupXcnts(e.target.value === "" ? null : Number(e.target.value))}
                          />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelYCoord} <ReqStar /></label>
                        <div className="md-bbs-form-control">
                          <input
                            type="number"
                            className="f_input"
                            value={popupYdnts ?? ""}
                            onChange={(e) => setPopupYdnts(e.target.value === "" ? null : Number(e.target.value))}
                          />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelWidth} <ReqStar /></label>
                        <div className="md-bbs-form-control">
                          <input
                            type="number"
                            className="f_input"
                            value={popupWidth ?? ""}
                            onChange={(e) => setPopupWidth(e.target.value === "" ? null : Number(e.target.value))}
                          />
                        </div>
                        <label className="f_label md-bbs-form-label">{i18nText.labelHeight} <ReqStar /></label>
                        <div className="md-bbs-form-control">
                          <input
                            type="number"
                            className="f_input"
                            value={popupVrticl ?? ""}
                            onChange={(e) => setPopupVrticl(e.target.value === "" ? null : Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="board_btn_area">
                        <div className="right_col btn1">
                          <button
                            type="button"
                            className="btn btn_skyblue_h46 w_100"
                            onClick={() => {
                              if (!confirm(i18nText.msgConfirmDeleteSimple)) return;
                              const q = new URLSearchParams({
                                popupSq: popupSetting.popupSq,
                                nttSq: popupSetting.nttSq,
                                bbsId: popupSetting.bbsId,
                                cmpnyCd: popupSetting.cmpnyCd,
                              });
                              EgovNet.requestFetch(
                                `/bbs/popup?${q.toString()}`,
                                { method: "DELETE", headers: { "Content-type": "application/json" } },
                                () => {
                                  alert(i18nText.msgDeleteSuccess);
                                  setPopupSettingOpen(false);
                                  setPopupSetting(null);
                                  loadPopupNotices();
                                },
                                () => alert(i18nText.msgDeleteError)
                              );
                            }}
                          >
                            {i18nText.btnDelete}
                          </button>
                          <button
                            type="button"
                            className="btn btn_blue_h46 w_100"
                            onClick={() => {
                              if (
                                !popupStartDt.trim() ||
                                !popupEndDt.trim() ||
                                popupXcnts == null ||
                                popupYdnts == null ||
                                popupWidth == null ||
                                popupVrticl == null
                              ) {
                                alert(i18nText.msgRequiredDateCoordSize);
                                return;
                              }
                              const body = {
                                popupSq: popupSetting.popupSq,
                                nttSq: popupSetting.nttSq,
                                bbsId: popupSetting.bbsId,
                                cmpnyCd: popupSetting.cmpnyCd,
                                xcnts: popupXcnts,
                                ydnts: popupYdnts,
                                width: popupWidth,
                                vrticl: popupVrticl,
                                startDt: fromDateTimeLocal(popupStartDt),
                                endDt: fromDateTimeLocal(popupEndDt),
                                hideFl: yn(popupHideFl),
                                useFl: yn(popupUseFl),
                              };
                              EgovNet.requestFetch(
                                "/bbs/popup/setting",
                                { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
                                () => {
                                  alert(i18nText.msgSaveSuccess);
                                  loadPopupNotices();
                                },
                                () => alert(i18nText.msgSaveError)
                              );
                            }}
                          >
                            {i18nText.btnSave}
                          </button>
                          <button
                            type="button"
                            className="btn btn_blue_h46 w_100"
                            onClick={() => {
                              if (!popupSetting) return;
                              if (!popupUseFl) {
                                alert(i18nText.msgPopupPreviewFail);
                                return;
                              }
                              setPopupPreviewOpen(true);
                              loadPopupPreview(popupSetting);
                            }}
                          >
                            {i18nText.btnPreview}
                          </button>
                          <button type="button" className="btn btn_skyblue_h46 w_100" onClick={() => setPopupSettingOpen(false)}>
                            {i18nText.btnClose}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {popupPreviewOpen && popupPreview && (
                <div className="bbs-user-popup-layer-overlay" role="presentation">
                  <div
                    className="bbs-user-popup-layer"
                    style={{
                      left: `${popupPreview.xcnts ?? popupXcnts ?? 100}px`,
                      top: `${popupPreview.ydnts ?? popupYdnts ?? 100}px`,
                      width: `${popupPreview.width ?? popupWidth ?? 520}px`,
                      height: `${popupPreview.vrticl ?? popupVrticl ?? 640}px`,
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={i18nText.msgPopupPreviewFail}
                  >
                    <div className="bbs-user-popup-layer__body">
                      <h3 className="bbs-user-popup-layer__title">{popupPreview.title || `(${i18nText.labelTitle} ${i18nText.etcPopupTitleMissingSuffix})`}</h3>
                      <div className="bbs-user-popup-layer__meta">
                        <span>{i18nText.labelDateTime} : {popupPreview.creationDt || "-"}</span>
                        <span>|</span>
                        <span>{i18nText.labelWriter} {popupPreview.userNm || "-"}</span>
                        <span>|</span>
                        <span className="bbs-user-popup-layer__read" title={i18nText.etcReadCount}>
                          👁 {popupPreview.rdCnt ?? 0}
                        </span>
                        <span>|</span>
                        <button
                          type="button"
                          className={`bbs-user-popup-layer__icon-btn ${(popupPreview.myLikeFl || "N") === "Y" ? "is-active" : ""}`}
                          onClick={() => togglePopupPreviewVote("L")}
                          disabled={popupActionLoading}
                          title={i18nText.etcRecommend}
                        >
                          <span>👍</span> {popupPreview.likeCnt ?? 0}
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          className={`bbs-user-popup-layer__icon-btn ${(popupPreview.myDislikeFl || "N") === "Y" ? "is-active" : ""}`}
                          onClick={() => togglePopupPreviewVote("D")}
                          disabled={popupActionLoading}
                          title={i18nText.etcDisrecommend}
                        >
                          <span>👎</span> {popupPreview.dislikeCnt ?? 0}
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          className={`bbs-user-popup-layer__icon-btn ${(popupPreview.myFavoriteFl || "N") === "Y" ? "is-active" : ""}`}
                          onClick={togglePopupPreviewFavorite}
                          disabled={popupActionLoading}
                          title={i18nText.etcFavorite}
                        >
                          <span>☆</span> {popupPreview.favoriteCnt ?? 0}
                        </button>
                        <span>|</span>
                        <button type="button" className="bbs-user-popup-layer__icon-btn" onClick={copyPopupPreviewUrl} title={i18nText.btnShare}>
                          📤 {i18nText.btnShare}
                        </button>
                      </div>
                      <div
                        className="bbs-user-popup-layer__contents"
                        dangerouslySetInnerHTML={{ __html: popupPreview.contents || "" }}
                      />
                    </div>
                    <div className="bbs-user-popup-layer__footer">
                      {popupHideFl && (
                        <>
                          <label className="bbs-user-popup-layer__dismiss-check">
                            <input type="checkbox" onChange={closePopupPreviewNever} />
                            {i18nText.etcHideDontShowAgain}
                          </label>
                          <label className="bbs-user-popup-layer__dismiss-check">
                            <input type="checkbox" onChange={closePopupPreviewToday} />
                            {i18nText.etcHideToday}
                          </label>
                        </>
                      )}
                      <button type="button" className="bbs-user-page__write" onClick={closePopupPreview}>
                        {i18nText.btnClose}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <MultilingualLookupPopup
        open={showBbsNameLookupPopup}
        onClose={() => setShowBbsNameLookupPopup(false)}
        cmpnyCd={cmpnyCd || ""}
        langCode={langCode || "ko_KR"}
        onSelect={(langKey, displayMessage) => {
          setBbsNmKey(langKey);
          setBbsName(displayMessage);
        }}
      />
    </>
  );
}
