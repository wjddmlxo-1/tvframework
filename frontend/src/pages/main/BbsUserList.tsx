import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";
import { SERVER_URL } from "@/config";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { getLanguageCodeForApi } from "@/utils/language";
import { getSessionItem } from "@/utils/storage";
import BbsUserWrite from "@/pages/main/BbsUserWrite";
import MdSwitch from "@/components/MdSwitch";
import {
  CMMN_BBS_USER_I18N_FALLBACK,
  CMMN_BBS_USER_I18N_KEYS,
  type CmmnBbsUserI18nText,
  replaceI18nPlaceholders,
} from "@/pages/main/cmmnBbsUserI18n";

type BoardMeta = {
  bbsId: string;
  bbsName?: string;
  bbsTy?: string;
  layoutTy?: string;
};

type NttRow = {
  nttSq: string;
  bbsId: string;
  bbsName?: string;
  title?: string;
  snippet?: string;
  userNm?: string;
  creationDt?: string;
  rdCnt?: number;
  commentCnt?: number;
  depth?: number;
  noticeYn?: string;
  nttSttus?: string;
  thumbFileSq?: string;
  thumbMimeTy?: string;
  profileFileSq?: string;
};

type PageResult = {
  list?: NttRow[];
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
};

type Detail = {
  nttSq?: string;
  bbsId?: string;
  cmpnyCd?: string;
  title?: string;
  contents?: string;
  rdCnt?: number;
  likeCnt?: number;
  dislikeCnt?: number;
  favoriteCnt?: number;
  userNm?: string;
  creationId?: string;
  profileFileSq?: string;
  noticeYn?: string;
  nttSttus?: string;
  creationDt?: string;
  myLikeFl?: string;
  myDislikeFl?: string;
  myFavoriteFl?: string;
  /** CM_BBS.LIKE_FL / DISLIKE_FL — 추천·비추천 기능 사용 여부 */
  likeFl?: string;
  dislikeFl?: string;
  commentFl?: string;
  replyFl?: string;
  permReadingFl?: string;
  permWritingFl?: string;
  permReplyFl?: string;
  permManagerFl?: string;
};

type PostFileRow = {
  fileSq: string;
  fileNm?: string;
  mimeTy?: string;
  fileSize?: number;
};

type CommentImage = { fileSq: string; mimeTy?: string };
type CommentRow = {
  commentSq: string;
  parentCommentSq?: string;
  comment?: string;
  secretFl?: string;
  creationDt?: string;
  userId?: string;
  userNm?: string;
  myCommentFl?: string;
  threadDepth?: number;
  images?: CommentImage[];
};

type CommentImgRow = { fileSq: string; size: number };
type PaneLayoutMode = "default" | "detail-wide" | "list-wide" | "detail-hidden";
type PopupNoticeRow = {
  popupSq: string;
  nttSq: string;
  bbsId: string;
  cmpnyCd: string;
  title?: string;
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
  myLikeFl?: string | null;
  myDislikeFl?: string | null;
  myFavoriteFl?: string;
  xcnts?: number | null;
  ydnts?: number | null;
  width?: number | null;
  vrticl?: number | null;
};
type PopupSetting = {
  popupSq?: string;
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

const PAGE_SIZE = 10;
const COMMENT_IMG_MAX = 4;
const COMMENT_IMG_MAX_BYTES = 10 * 1024 * 1024;

function todayYmd() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

/** 필수 입력 표시 — 게시판관리 팝업공지 설정과 동일 */
const ReqStar = () => <span style={{ color: "#c00" }}>*</span>;

function fromDateTimeLocal(v?: string): string | undefined {
  if (!v || !v.trim()) return undefined;
  return `${v}:00`.replace("T", " ");
}

/** CM_BBS.BBS_TY 표시용 (관리 화면 코드와 동일 계열) */
const BBS_TY_LABEL_LANG_KEYS: Record<string, keyof CmmnBbsUserI18nText> = {
  GENERAL: "etcBoardTypeGeneral",
  NOTICE: "etcBoardTypeNotice",
  ANONYMOUS: "etcBoardTypeAnonymous",
  GALLERY: "etcBoardTypeGallery",
  GUESTBOOK: "etcBoardTypeGuestbook",
  QNA: "etcBoardTypeQna",
  MEMO: "etcBoardTypeMemo",
  CUSTOM: "etcBoardTypeCustom",
};

function boardTypeDisplayLabel(code?: string, t?: CmmnBbsUserI18nText): string {
  const raw = String(code ?? "").trim();
  if (!raw) return "—";
  const u = raw.toUpperCase();
  const key = BBS_TY_LABEL_LANG_KEYS[u];
  if (key && t) return t[key];
  if (u.endsWith(".MEMO") || u === "MEMO") {
    // 서버에서 MEMO로 내려오는 경우(추가 접미어 등)도 처리
    return t?.etcBoardTypeMemo ?? raw;
  }
  return raw;
}

function layoutKindFromTy(layoutTy?: string): "LIST" | "CARD" | "ALBUM" {
  const u = String(layoutTy ?? "")
    .trim()
    .toUpperCase();
  if (u.includes("CARD")) return "CARD";
  if (u.includes("ALBUM") || u.includes("GALLERY") || u.includes("GRID")) return "ALBUM";
  return "LIST";
}

function layoutVisualToIconKind(v: "LIST" | "CARD" | "ALBUM"): "list" | "card" | "album" {
  if (v === "CARD") return "card";
  if (v === "ALBUM") return "album";
  return "list";
}

function layoutVisualKorean(v: "LIST" | "CARD" | "ALBUM", t: CmmnBbsUserI18nText): string {
  if (v === "CARD") return t.etcLayoutCard;
  if (v === "ALBUM") return t.etcLayoutAlbum;
  return t.etcLayoutList;
}

function LayoutTyIcon({ kind }: { kind: "list" | "card" | "album" }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24" as const, "aria-hidden": true as const };
  if (kind === "list") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
      </svg>
    );
  }
  if (kind === "card") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="7" height="16" rx="1.5" />
        <rect x="14" y="4" width="7" height="16" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="currentColor">
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
    </svg>
  );
}

function decodeHtmlEntities(s: string): string {
  if (!s) return s;
  const ta = document.createElement("textarea");
  ta.innerHTML = s;
  return ta.value;
}

function detailPermFlags(detail: Detail, currentUserId: string) {
  const uid = String(currentUserId || "").trim();
  const aid = String(detail.creationId || "").trim();
  const isOwner = Boolean(uid && aid && uid === aid);
  const readY = (detail.permReadingFl || "N").toUpperCase() === "Y";
  const writeY = (detail.permWritingFl || "N").toUpperCase() === "Y";
  const replyY = (detail.permReplyFl || "N").toUpperCase() === "Y";
  const mgrY = (detail.permManagerFl || "N").toUpperCase() === "Y";
  const commentFeatureY = (detail.commentFl || "N").toUpperCase() === "Y";
  const replyFeatureY = (detail.replyFl || "N").toUpperCase() === "Y";
  const likeFeatureY = (detail.likeFl || "N").toUpperCase() === "Y";
  const dislikeFeatureY = (detail.dislikeFl || "N").toUpperCase() === "Y";
  return {
    canShare: readY,
    /** 즐겨찾기 등 — 게시판 기능 플래그와 무관 */
    canFavorite: readY,
    canLike: readY && likeFeatureY,
    canDislike: readY && dislikeFeatureY,
    canEdit: mgrY || (writeY && isOwner),
    canDelete: mgrY || (writeY && isOwner),
    canComment: commentFeatureY,
    canReply: replyFeatureY && (readY || replyY || mgrY),
    canPopup: mgrY,
  };
}

function isApiSuccess(resp: { resultCode?: number | string } | null | undefined) {
  return Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
}

function isLikelyImageFile(f: File): boolean {
  const t = (f.type || "").toLowerCase();
  if (t.startsWith("image/")) return true;
  const ext = (f.name.split(".").pop() || "").toLowerCase().trim();
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "heif", "svg", "ico"].includes(ext);
}

function CommentAttachEditor(props: {
  imgs: CommentImgRow[];
  setImgs: Dispatch<SetStateAction<CommentImgRow[]>>;
  uploading: boolean;
  onUploading: (v: boolean) => void;
  disabled?: boolean;
  t: CmmnBbsUserI18nText;
}) {
  const { imgs, setImgs, uploading, onUploading, disabled, t } = props;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canPick = !(disabled || uploading || imgs.length >= COMMENT_IMG_MAX);

  const openFilePicker = () => {
    if (!canPick) return;
    fileInputRef.current?.click();
  };

  const pickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = input.files && input.files.length > 0 ? Array.from(input.files) : [];
    if (!files.length || disabled || uploading) {
      input.value = "";
      return;
    }
    const arr = files.filter((f) => isLikelyImageFile(f));
    if (!arr.length) {
      alert(t.msgImageOnly);
      input.value = "";
      return;
    }
    void (async () => {
      onUploading(true);
      try {
        let acc = imgs;
        for (const f of arr) {
          if (acc.length >= COMMENT_IMG_MAX) {
            alert(t.msgCommentImageCountMax);
            break;
          }
          if (f.size > COMMENT_IMG_MAX_BYTES) {
            alert(t.msgCommentImageEachMax);
            continue;
          }
          const sum = acc.reduce((a, r) => a + r.size, 0);
          if (sum + f.size > COMMENT_IMG_MAX_BYTES) {
            alert(t.msgCommentImageTotalMax);
            break;
          }
          const fd = new FormData();
          fd.append("file", f);
          await new Promise<void>((resolve) => {
            EgovNet.requestFetch(
              "/bbs/main/comment/file/upload",
              { method: "POST", body: fd, credentials: "include" },
              (resp: { resultCode?: number | string; result?: { fileSq?: string | number; fileSize?: number }; resultMessage?: string }) => {
                if (isApiSuccess(resp)) {
                  const fsq = String(resp?.result?.fileSq ?? "").trim();
                  if (fsq) {
                    acc = [...acc, { fileSq: fsq, size: Number(resp?.result?.fileSize) || f.size }];
                    setImgs(acc);
                  } else {
                    alert(resp?.resultMessage || t.msgFileUploadFail);
                  }
                } else {
                  alert(resp?.resultMessage || t.msgFileUploadFail);
                }
                resolve();
              },
              () => {
                alert(t.msgFileUploadFail);
                resolve();
              }
            );
          });
        }
      } finally {
        onUploading(false);
        input.value = "";
      }
    })();
  };

  return (
    <>
      <div className="bbs-user-comment-thread__inline-toolbar bbs-user-comment-thread__inline-toolbar--attach">
        <span className="bbs-user-comment-thread__photo-actions">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="bbs-user-comment-thread__file-input" onChange={pickFiles} />
          <button type="button" className="bbs-user-page__page-btn bbs-user-comment-thread__file-label" onClick={openFilePicker} disabled={!canPick}>
            {t.btnAddPhoto}
          </button>
          {uploading && <span className="bbs-user-page__muted">{t.etcUploading}</span>}
          <span className="bbs-user-page__muted bbs-user-comment-thread__photo-hint">{t.msgCommentPhotoHint}</span>
        </span>
      </div>
      {imgs.length > 0 && (
        <ul className="bbs-user-comment-thread__img-previews">
          {imgs.map((r) => (
            <li key={r.fileSq} className="bbs-user-comment-thread__img-preview">
              <img src={`${SERVER_URL}/bbs/main/comment/file?fileSq=${encodeURIComponent(r.fileSq)}`} alt="" />
              <button
                type="button"
                className="bbs-user-page__page-btn bbs-user-comment-thread__thumb-remove"
                disabled={disabled || uploading}
                onClick={() => setImgs((prev) => prev.filter((x) => x.fileSq !== r.fileSq))}
              >
                {t.etcRemove}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** CM_USER.FILE_SQ — `/bbs/main/profile/file` 바이너리 */
function bbsUserProfileImageHref(fileSq?: string | null): string | null {
  const s = fileSq?.trim();
  if (!s) return null;
  return `${SERVER_URL}/bbs/main/profile/file?fileSq=${encodeURIComponent(s)}`;
}

export default function BbsUserList() {
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const cmpnyCd = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_BBS_USER_I18N_KEYS, CMMN_BBS_USER_I18N_FALLBACK, { cmpnyCd });
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = useMemo(() => {
    const u = getSessionItem("loginUser") as { id?: string } | null;
    return String(u?.id ?? "").trim();
  }, []);

  const bbsIdFilter = searchParams.get("bbsId") || "";
  const nttSq = searchParams.get("nttSq") || "";
  const writeMode = searchParams.get("write") === "Y";
  const editNttSq = searchParams.get("editNttSq") || "";
  const parentNttSq = searchParams.get("parentNttSq") || "";
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [postList, setPostList] = useState<NttRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(Number(searchParams.get("pageIndex") || 1));
  const [sortAsc, setSortAsc] = useState(searchParams.get("sortAsc") === "Y");
  const [listLoading, setListLoading] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [postFiles, setPostFiles] = useState<PostFileRow[]>([]);
  const [postFileLoading, setPostFileLoading] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentSecret, setCommentSecret] = useState(false);
  const [commentImgs, setCommentImgs] = useState<CommentImgRow[]>([]);
  const [rootCommentUploading, setRootCommentUploading] = useState(false);

  const [replyOpenUnderSq, setReplyOpenUnderSq] = useState<string | null>(null);
  const [inlineEditCommentSq, setInlineEditCommentSq] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState("");
  const [inlineSecret, setInlineSecret] = useState(false);
  const [inlineImgs, setInlineImgs] = useState<CommentImgRow[]>([]);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [popupPreviewOpen, setPopupPreviewOpen] = useState(false);
  const [popupPreviewLoading, setPopupPreviewLoading] = useState(false);
  const [popupPreview, setPopupPreview] = useState<PopupPreview | null>(null);
  const [popupActionLoading, setPopupActionLoading] = useState(false);
  const [popupSettingOpen, setPopupSettingOpen] = useState(false);
  const [popupSetting, setPopupSetting] = useState<PopupSetting | null>(null);
  const [popupSettingLoading, setPopupSettingLoading] = useState(false);
  const popupSettingTitleId = useId();
  const [popupUseFl, setPopupUseFl] = useState(true);
  const [popupHideFl, setPopupHideFl] = useState(true);
  const [popupStartDt, setPopupStartDt] = useState("");
  const [popupEndDt, setPopupEndDt] = useState("");
  const [popupXcnts, setPopupXcnts] = useState<number | null>(100);
  const [popupYdnts, setPopupYdnts] = useState<number | null>(100);
  const [popupWidth, setPopupWidth] = useState<number | null>(400);
  const [popupVrticl, setPopupVrticl] = useState<number | null>(500);
  const [popupComments, setPopupComments] = useState<CommentRow[]>([]);
  const [popupCommentLoading, setPopupCommentLoading] = useState(false);
  const [popupCommentActionLoading, setPopupCommentActionLoading] = useState(false);
  const [popupCommentText, setPopupCommentText] = useState("");
  const [popupCommentSecret, setPopupCommentSecret] = useState(false);
  const [popupCommentImgs, setPopupCommentImgs] = useState<CommentImgRow[]>([]);
  const [popupRootCommentUploading, setPopupRootCommentUploading] = useState(false);
  const [popupReplyOpenUnderSq, setPopupReplyOpenUnderSq] = useState<string | null>(null);
  const [popupInlineEditCommentSq, setPopupInlineEditCommentSq] = useState<string | null>(null);
  const [popupInlineDraft, setPopupInlineDraft] = useState("");
  const [popupInlineSecret, setPopupInlineSecret] = useState(false);
  const [popupInlineImgs, setPopupInlineImgs] = useState<CommentImgRow[]>([]);
  const [popupInlineUploading, setPopupInlineUploading] = useState(false);
  const [listKeyword, setListKeyword] = useState("");
  const [paneLayout, setPaneLayout] = useState<PaneLayoutMode>(() => {
    const q = String(searchParams.get("paneLayout") || "").trim();
    if (q === "detail-wide" || q === "list-wide" || q === "detail-hidden") return q;
    return "default";
  });

  const readMarkRef = useRef<string>("");
  const popupPreviewReadKeyRef = useRef<string>("");

  const selectedBoard = useMemo(() => (bbsIdFilter ? boards.find((b) => b.bbsId === bbsIdFilter) ?? null : null), [boards, bbsIdFilter]);
  const perms = useMemo(() => (detail ? detailPermFlags(detail, currentUserId) : null), [detail, currentUserId]);

  const updateQuery = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next);
  };

  const loadBoards = useCallback(() => {
    if (!cmpnyCd) return;
    const q = new URLSearchParams({ cmpnyCd, langCode });
    EgovNet.requestFetch(
      `/bbs/main/boards?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: BoardMeta[] }) => {
        const ok = isApiSuccess(resp);
        setBoards(ok && Array.isArray(resp?.result) ? resp.result : []);
      },
      () => setBoards([])
    );
  }, [cmpnyCd, langCode]);

  const loadList = useCallback(() => {
    if (!cmpnyCd) return;
    setListLoading(true);
    const q = new URLSearchParams({
      cmpnyCd,
      langCode,
      pageIndex: String(pageIndex),
      pageSize: String(PAGE_SIZE),
      sortAsc: String(sortAsc),
    });
    if (bbsIdFilter.trim()) q.set("bbsId", bbsIdFilter.trim());
    EgovNet.requestFetch(
      `/bbs/main/posts?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: PageResult }) => {
        const ok = isApiSuccess(resp);
        const d = ok ? resp?.result : undefined;
        setPostList(Array.isArray(d?.list) ? d!.list! : []);
        setTotalCount(Number(d?.totalCount || 0));
        setListLoading(false);
      },
      () => {
        setPostList([]);
        setTotalCount(0);
        setListLoading(false);
      }
    );
  }, [cmpnyCd, langCode, pageIndex, sortAsc, bbsIdFilter]);

  const loadDetail = useCallback(() => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    const q = new URLSearchParams({ cmpnyCd, bbsId: bbsIdFilter, nttSq, langCode });
    EgovNet.requestFetch(
      `/bbs/main/post/detail?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: Detail | null }) => {
        const ok = isApiSuccess(resp);
        setDetail(ok ? resp?.result ?? null : null);
        setDetailLoading(false);
      },
      () => {
        setDetail(null);
        setDetailLoading(false);
      }
    );
  }, [cmpnyCd, bbsIdFilter, nttSq, langCode]);

  const loadPostFiles = useCallback(() => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq) {
      setPostFiles([]);
      return;
    }
    setPostFileLoading(true);
    const q = new URLSearchParams({ cmpnyCd, bbsId: bbsIdFilter, nttSq });
    EgovNet.requestFetch(
      `/bbs/main/post/files?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: PostFileRow[] }) => {
        const ok = isApiSuccess(resp);
        setPostFiles(ok && Array.isArray(resp?.result) ? resp.result : []);
        setPostFileLoading(false);
      },
      () => {
        setPostFiles([]);
        setPostFileLoading(false);
      }
    );
  }, [cmpnyCd, bbsIdFilter, nttSq]);

  const loadComments = useCallback(() => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq) {
      setComments([]);
      return;
    }
    setCommentLoading(true);
    const q = new URLSearchParams({ cmpnyCd, bbsId: bbsIdFilter, nttSq });
    EgovNet.requestFetch(
      `/bbs/main/comments?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: CommentRow[] }) => {
        const ok = isApiSuccess(resp);
        setComments(ok && Array.isArray(resp?.result) ? resp.result : []);
        setCommentLoading(false);
      },
      () => {
        setComments([]);
        setCommentLoading(false);
      }
    );
  }, [cmpnyCd, bbsIdFilter, nttSq]);

  const reloadAll = () => {
    loadList();
    loadDetail();
    loadPostFiles();
    loadComments();
  };

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    updateQuery({
      pageIndex: String(pageIndex),
      sortAsc: sortAsc ? "Y" : null,
      paneLayout: paneLayout === "default" ? null : paneLayout,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, sortAsc, paneLayout]);

  useEffect(() => {
    loadDetail();
    loadPostFiles();
    loadComments();
  }, [loadDetail, loadPostFiles, loadComments]);

  useEffect(() => {
    if (!detail || !nttSq || !bbsIdFilter || !cmpnyCd) return;
    const key = `${cmpnyCd}:${bbsIdFilter}:${nttSq}`;
    if (readMarkRef.current === key) return;
    readMarkRef.current = key;
    EgovNet.requestFetch(
      "/bbs/main/post/read",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: bbsIdFilter, nttSq }),
      },
      () => {
        loadDetail();
        loadList();
      },
      () => { }
    );
  }, [detail, nttSq, bbsIdFilter, cmpnyCd, loadDetail, loadList]);

  useEffect(() => {
    // 상세 대상 글 변경 시 댓글 입력 상태를 초기화한다.
    setCommentText("");
    setCommentSecret(false);
    setCommentImgs([]);
    setReplyOpenUnderSq(null);
    setInlineEditCommentSq(null);
    setInlineDraft("");
    setInlineSecret(false);
    setInlineImgs([]);
  }, [nttSq, bbsIdFilter]);

  const selectPost = (row: { bbsId: string; nttSq: string }) => {
    updateQuery({
      bbsId: row.bbsId,
      nttSq: row.nttSq,
      write: null,
      editNttSq: null,
      parentNttSq: null,
    });
  };

  const startWrite = () => {
    if (!bbsIdFilter) {
      alert(i18nText.msgNoBoardSelected);
      return;
    }
    if (paneLayout === "detail-hidden") setPaneLayout("default");
    updateQuery({ write: "Y", editNttSq: null, parentNttSq: null, nttSq: null });
  };

  const startEdit = () => {
    if (!detail?.nttSq || !bbsIdFilter) return;
    if (paneLayout === "detail-hidden") setPaneLayout("default");
    updateQuery({ write: "Y", editNttSq: detail.nttSq, parentNttSq: null });
  };

  const startReplyPost = () => {
    if (!detail?.nttSq || !bbsIdFilter) return;
    if (paneLayout === "detail-hidden") setPaneLayout("default");
    updateQuery({ write: "Y", editNttSq: null, parentNttSq: detail.nttSq });
  };

  const closeWrite = (nextNttSq?: string) => {
    updateQuery({
      write: null,
      editNttSq: null,
      parentNttSq: null,
      nttSq: nextNttSq || searchParams.get("nttSq"),
    });
    loadList();
    if (nextNttSq) {
      setTimeout(() => {
        updateQuery({ nttSq: nextNttSq });
      }, 0);
    }
  };

  const toggleVote = (voteGb: "L" | "D") => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq || actionLoading) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/post/vote/toggle",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: bbsIdFilter, nttSq, voteGb }),
      },
      () => {
        setActionLoading(false);
        loadDetail();
        loadList();
      },
      () => setActionLoading(false)
    );
  };

  const toggleFavorite = () => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq || actionLoading) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/post/favorite/toggle",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: bbsIdFilter, nttSq }),
      },
      () => {
        setActionLoading(false);
        loadDetail();
        loadList();
      },
      () => setActionLoading(false)
    );
  };

  const removePost = () => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq || actionLoading) return;
    if (!confirm(i18nText.msgConfirmDeletePost)) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/post",
      {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: bbsIdFilter, nttSq }),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        setActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgDeletePostFailed);
          return;
        }
        updateQuery({ nttSq: null, write: null, editNttSq: null, parentNttSq: null });
        loadList();
      },
      () => setActionLoading(false)
    );
  };

  const shareUrl = () => {
    if (!detail?.nttSq || !bbsIdFilter || !perms?.canShare) return;
    const link = `${window.location.origin}${URL.MAIN_BBS}?bbsId=${encodeURIComponent(bbsIdFilter)}&nttSq=${encodeURIComponent(detail.nttSq)}`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(link).then(() => alert(i18nText.msgClipboardCopied), () => alert(link));
    } else {
      alert(link);
    }
  };

  const loadPopupPreview = () => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq) return;
    setPopupPreviewLoading(true);
    const listQ = new URLSearchParams({ cmpnyCd, bbsId: bbsIdFilter, langCode });
    EgovNet.requestFetch(
      `/bbs/main/popup/list?${listQ.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number | string; result?: PopupNoticeRow[] }) => {
        const ok = isApiSuccess(resp);
        const rows = ok && Array.isArray(resp?.result) ? resp.result : [];
        const hit = rows.find((r) => String(r.nttSq || "").trim() === String(nttSq).trim() && String(r.bbsId || "").trim() === String(bbsIdFilter).trim());
        if (!hit?.popupSq) {
          setPopupPreview(null);
          setPopupPreviewLoading(false);
          alert(i18nText.msgPopupSettingMissing);
          return;
        }
        const q = new URLSearchParams({ cmpnyCd, popupSq: hit.popupSq, bbsId: bbsIdFilter, nttSq, langCode });
        EgovNet.requestFetch(
          `/bbs/main/popup/preview?${q.toString()}`,
          { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
          (dResp: { resultCode?: number | string; result?: PopupPreview | null }) => {
            setPopupPreviewLoading(false);
            if (!isApiSuccess(dResp) || !dResp?.result) {
              setPopupPreview(null);
              alert(i18nText.msgPopupPreviewFail);
              return;
            }
            setPopupPreview(dResp.result);
            setPopupPreviewOpen(true);
          },
          () => {
            setPopupPreviewLoading(false);
            setPopupPreview(null);
            alert(i18nText.msgPopupPreviewFail);
          }
        );
      },
      () => {
        setPopupPreviewLoading(false);
        alert(i18nText.msgPopupListLoadFail);
      }
    );
  };

  const sendPopupPreviewRead = useCallback((preview: PopupPreview) => {
    if (!cmpnyCd) return;
    EgovNet.requestFetch(
      "/bbs/main/post/read",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nttSq: preview.nttSq, bbsId: preview.bbsId, cmpnyCd }),
      },
      () => {
        loadPopupPreview();
        loadList();
      },
      () => { }
    );
  }, [cmpnyCd, loadList]);

  const togglePopupPreviewVote = useCallback((voteGb: "L" | "D") => {
    if (!popupPreview || popupActionLoading) return;
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
          cmpnyCd,
          voteGb,
        }),
      },
      () => {
        setPopupActionLoading(false);
        loadPopupPreview();
        if (popupPreview?.bbsId === bbsIdFilter && popupPreview?.nttSq === nttSq) {
          loadDetail();
        }
        loadList();
      },
      () => setPopupActionLoading(false)
    );
  }, [popupPreview, popupActionLoading, cmpnyCd, loadDetail, loadList, loadPopupPreview, bbsIdFilter, nttSq]);

  const togglePopupPreviewFavorite = useCallback(() => {
    if (!popupPreview || popupActionLoading) return;
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
          cmpnyCd,
        }),
      },
      () => {
        setPopupActionLoading(false);
        loadPopupPreview();
        if (popupPreview?.bbsId === bbsIdFilter && popupPreview?.nttSq === nttSq) {
          loadDetail();
        }
        loadList();
      },
      () => setPopupActionLoading(false)
    );
  }, [popupPreview, popupActionLoading, cmpnyCd, loadDetail, loadList, loadPopupPreview, bbsIdFilter, nttSq]);

  const copyPopupPreviewUrl = useCallback(() => {
    if (!popupPreview) return;
    const link = `${window.location.origin}${URL.MAIN_BBS}?bbsId=${encodeURIComponent(popupPreview.bbsId)}&nttSq=${encodeURIComponent(popupPreview.nttSq)}`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(link).then(() => alert(i18nText.msgClipboardCopied), () => alert(link));
    } else {
      alert(link);
    }
  }, [popupPreview]);

  const closePopupPreview = useCallback(() => {
    setPopupPreviewOpen(false);
    setPopupPreview(null);
    popupPreviewReadKeyRef.current = "";
  }, []);

  const closePopupPreviewNever = useCallback(() => {
    const popupSq = String(popupPreview?.popupSq || "").trim();
    if (popupSq) {
      const scope = `${cmpnyCd}:${currentUserId || "anonymous"}:${popupSq}`;
      localStorage.setItem(`bbs-popup-user-never-${scope}`, "Y");
    }
    closePopupPreview();
  }, [cmpnyCd, currentUserId, popupPreview?.popupSq, closePopupPreview]);

  const closePopupPreviewToday = useCallback(() => {
    const popupSq = String(popupPreview?.popupSq || "").trim();
    if (popupSq) {
      const scope = `${cmpnyCd}:${currentUserId || "anonymous"}:${popupSq}`;
      localStorage.setItem(`bbs-popup-user-today-${scope}`, todayYmd());
    }
    closePopupPreview();
  }, [cmpnyCd, currentUserId, popupPreview?.popupSq, closePopupPreview]);

  useEffect(() => {
    if (!popupPreviewOpen || !popupPreview) return;
    const readKey = `${popupPreview.popupSq}:${popupPreview.nttSq}:${popupPreview.bbsId}:${cmpnyCd}`;
    if (popupPreviewReadKeyRef.current === readKey) return;
    popupPreviewReadKeyRef.current = readKey;
    sendPopupPreviewRead(popupPreview);
  }, [popupPreviewOpen, popupPreview, cmpnyCd, sendPopupPreviewRead]);

  const loadPopupComments = useCallback(() => {
    if (!cmpnyCd || !popupPreview?.bbsId || !popupPreview?.nttSq) {
      setPopupComments([]);
      return;
    }
    setPopupCommentLoading(true);
    const q = new URLSearchParams({ cmpnyCd, bbsId: popupPreview.bbsId, nttSq: popupPreview.nttSq });
    EgovNet.requestFetch(
      `/bbs/main/comments?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number | string; result?: CommentRow[] }) => {
        const ok = isApiSuccess(resp);
        setPopupComments(ok && Array.isArray(resp?.result) ? resp.result : []);
        setPopupCommentLoading(false);
      },
      () => {
        setPopupComments([]);
        setPopupCommentLoading(false);
      }
    );
  }, [cmpnyCd, popupPreview?.bbsId, popupPreview?.nttSq]);

  useEffect(() => {
    if (!popupPreviewOpen) return;
    loadPopupComments();
  }, [popupPreviewOpen, loadPopupComments]);

  useEffect(() => {
    if (!popupPreviewOpen) return;
    setPopupReplyOpenUnderSq(null);
    setPopupInlineEditCommentSq(null);
    setPopupInlineDraft("");
    setPopupInlineSecret(false);
    setPopupInlineImgs([]);
  }, [popupPreview?.nttSq, popupPreview?.bbsId, popupPreviewOpen]);

  const submitPopupComment = () => {
    const text = popupCommentText.trim();
    if (!cmpnyCd || !popupPreview?.bbsId || !popupPreview?.nttSq || !text || popupCommentActionLoading) return;
    setPopupCommentActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cmpnyCd,
          bbsId: popupPreview.bbsId,
          nttSq: popupPreview.nttSq,
          comment: text,
          secretFl: popupCommentSecret ? "Y" : "N",
          ...(popupCommentImgs.length > 0 ? { fileSqs: popupCommentImgs.map((r) => r.fileSq) } : {}),
        }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        setPopupCommentActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgCommentCreateFail);
          return;
        }
        setPopupCommentText("");
        setPopupCommentSecret(false);
        setPopupCommentImgs([]);
        loadPopupComments();
        if (popupPreview?.bbsId === bbsIdFilter && popupPreview?.nttSq === nttSq) {
          loadComments();
          loadList();
        }
      },
      () => setPopupCommentActionLoading(false)
    );
  };

  const startPopupReply = (commentSq: string) => {
    if (popupReplyOpenUnderSq === commentSq) {
      setPopupReplyOpenUnderSq(null);
      setPopupInlineDraft("");
      setPopupInlineSecret(false);
      setPopupInlineImgs([]);
      return;
    }
    setPopupReplyOpenUnderSq(commentSq);
    setPopupInlineEditCommentSq(null);
    setPopupInlineDraft("");
    setPopupInlineSecret(false);
    setPopupInlineImgs([]);
  };

  const startPopupEditComment = (row: CommentRow) => {
    if (popupInlineEditCommentSq === row.commentSq) {
      setPopupInlineEditCommentSq(null);
      setPopupInlineDraft("");
      setPopupInlineSecret(false);
      setPopupInlineImgs([]);
      return;
    }
    setPopupInlineEditCommentSq(row.commentSq);
    setPopupReplyOpenUnderSq(null);
    setPopupInlineDraft(row.comment || "");
    setPopupInlineSecret((row.secretFl || "N") === "Y");
    setPopupInlineImgs((row.images || []).map((im) => ({ fileSq: im.fileSq, size: 0 })));
  };

  const submitPopupInlineReply = () => {
    const text = popupInlineDraft.trim();
    if (!cmpnyCd || !popupPreview?.bbsId || !popupPreview?.nttSq || !popupReplyOpenUnderSq || !text || popupCommentActionLoading) return;
    setPopupCommentActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment/reply",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cmpnyCd,
          bbsId: popupPreview.bbsId,
          nttSq: popupPreview.nttSq,
          parentCommentSq: popupReplyOpenUnderSq,
          comment: text,
          secretFl: popupInlineSecret ? "Y" : "N",
          ...(popupInlineImgs.length > 0 ? { fileSqs: popupInlineImgs.map((r) => r.fileSq) } : {}),
        }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        setPopupCommentActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgReplyCreateFail);
          return;
        }
        setPopupReplyOpenUnderSq(null);
        setPopupInlineDraft("");
        setPopupInlineSecret(false);
        setPopupInlineImgs([]);
        loadPopupComments();
        if (popupPreview?.bbsId === bbsIdFilter && popupPreview?.nttSq === nttSq) {
          loadComments();
          loadList();
        }
      },
      () => setPopupCommentActionLoading(false)
    );
  };

  const submitPopupInlineEdit = () => {
    const text = popupInlineDraft.trim();
    if (!cmpnyCd || !popupPreview?.bbsId || !popupPreview?.nttSq || !popupInlineEditCommentSq || !text || popupCommentActionLoading) return;
    setPopupCommentActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cmpnyCd,
          bbsId: popupPreview.bbsId,
          nttSq: popupPreview.nttSq,
          commentSq: popupInlineEditCommentSq,
          comment: text,
          secretFl: popupInlineSecret ? "Y" : "N",
          fileSqs: popupInlineImgs.map((r) => r.fileSq),
        }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        setPopupCommentActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgCommentUpdateFail);
          return;
        }
        setPopupInlineEditCommentSq(null);
        setPopupInlineDraft("");
        setPopupInlineSecret(false);
        setPopupInlineImgs([]);
        loadPopupComments();
        if (popupPreview?.bbsId === bbsIdFilter && popupPreview?.nttSq === nttSq) {
          loadComments();
          loadList();
        }
      },
      () => setPopupCommentActionLoading(false)
    );
  };

  const openPopupSetting = () => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq) return;
    setPopupSettingLoading(true);
    const q = new URLSearchParams({ cmpnyCd, bbsId: bbsIdFilter, nttSq });
    EgovNet.requestFetch(
      `/bbs/main/popup/setting?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number | string; result?: PopupSetting | null; resultMessage?: string }) => {
        setPopupSettingLoading(false);
        if (!isApiSuccess(resp) || !resp?.result) {
          alert(resp?.resultMessage || i18nText.msgPopupSettingLoadFail);
          return;
        }
        const s = resp.result;
        setPopupSetting({
          popupSq: s.popupSq,
          nttSq: String(s.nttSq ?? nttSq),
          bbsId: String(s.bbsId ?? bbsIdFilter),
          cmpnyCd: String(s.cmpnyCd ?? cmpnyCd),
          xcnts: s.xcnts ?? null,
          ydnts: s.ydnts ?? null,
          width: s.width ?? null,
          vrticl: s.vrticl ?? null,
          startDt: s.startDt ?? null,
          endDt: s.endDt ?? null,
          hideFl: s.hideFl,
          useFl: s.useFl,
        });
        setPopupUseFl((s.useFl || "Y") === "Y");
        setPopupHideFl((s.hideFl || "Y") === "Y");
        setPopupStartDt((s.startDt || "").replace(" ", "T").slice(0, 16));
        setPopupEndDt((s.endDt || "").replace(" ", "T").slice(0, 16));
        setPopupXcnts(s.xcnts != null ? Number(s.xcnts) : null);
        setPopupYdnts(s.ydnts != null ? Number(s.ydnts) : null);
        setPopupWidth(s.width != null ? Number(s.width) : null);
        setPopupVrticl(s.vrticl != null ? Number(s.vrticl) : null);
        setPopupSettingOpen(true);
      },
      () => {
        setPopupSettingLoading(false);
        alert(i18nText.msgPopupSettingLoadFail);
      }
    );
  };

  const savePopupSetting = () => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq) return;
    if (
      !popupStartDt.trim() ||
      !popupEndDt.trim() ||
      popupXcnts == null ||
      popupYdnts == null ||
      popupWidth == null ||
      popupVrticl == null
    ) {
      alert(i18nText.msgRequiredPopupFields);
      return;
    }
    const startMs = new Date(popupStartDt).getTime();
    const endMs = new Date(popupEndDt).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      alert(i18nText.msgInvalidDateFormat);
      return;
    }
    if (startMs >= endMs) {
      alert(i18nText.msgPopupEndMustBeAfterStart);
      return;
    }
    const x = Number(popupXcnts);
    const y = Number(popupYdnts);
    const w = Number(popupWidth);
    const h = Number(popupVrticl);
    if (x < 0 || y < 0 || w <= 0 || h <= 0) {
      alert(i18nText.msgPopupCoordRule);
      return;
    }
    const startDt = fromDateTimeLocal(popupStartDt);
    const endDt = fromDateTimeLocal(popupEndDt);
    if (!startDt || !endDt) {
      alert(i18nText.msgInvalidDateFormat);
      return;
    }
    setPopupSettingLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/popup/setting",
      {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(popupSetting?.popupSq ? { popupSq: popupSetting.popupSq } : {}),
          cmpnyCd,
          bbsId: bbsIdFilter,
          nttSq,
          useFl: popupUseFl ? "Y" : "N",
          hideFl: popupHideFl ? "Y" : "N",
          startDt,
          endDt,
          xcnts: x,
          ydnts: y,
          width: w,
          vrticl: h,
        }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        setPopupSettingLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgSaveError);
          return;
        }
        alert(i18nText.msgSaveSuccess);
      },
      () => {
        setPopupSettingLoading(false);
        alert(i18nText.msgSaveError);
      }
    );
  };

  const closePopupSettingModal = useCallback(() => {
    setPopupSettingOpen(false);
    setPopupSetting(null);
  }, []);

  const deletePopupSetting = () => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq || popupSettingLoading) return;
    if (!confirm(i18nText.msgConfirmDeletePopup)) return;
    setPopupSettingLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/popup/setting",
      {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: bbsIdFilter, nttSq }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        setPopupSettingLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgDeleteError);
          return;
        }
        alert(i18nText.msgDeleteSuccess);
        closePopupSettingModal();
      },
      () => {
        setPopupSettingLoading(false);
        alert(i18nText.msgDeleteError);
      }
    );
  };

  const removePopupComment = (commentSq: string) => {
    if (!cmpnyCd || !popupPreview?.bbsId || !popupPreview?.nttSq || popupCommentActionLoading) return;
    if (!confirm(i18nText.msgConfirmDeleteComment)) return;
    setPopupCommentActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: popupPreview.bbsId, nttSq: popupPreview.nttSq, commentSq }),
      },
      (resp: { resultCode?: number | string; resultMessage?: string }) => {
        setPopupCommentActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgCommentDeleteFail);
          return;
        }
        loadPopupComments();
        if (popupPreview?.bbsId === bbsIdFilter && popupPreview?.nttSq === nttSq) {
          loadComments();
          loadList();
        }
      },
      () => setPopupCommentActionLoading(false)
    );
  };

  const resetCommentEditor = () => {
    setCommentText("");
    setCommentSecret(false);
    setCommentImgs([]);
    setReplyOpenUnderSq(null);
    setInlineEditCommentSq(null);
    setInlineDraft("");
    setInlineSecret(false);
    setInlineImgs([]);
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!cmpnyCd || !bbsIdFilter || !nttSq || !text || actionLoading) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cmpnyCd,
          bbsId: bbsIdFilter,
          nttSq,
          comment: text,
          secretFl: commentSecret ? "Y" : "N",
          ...(commentImgs.length > 0 ? { fileSqs: commentImgs.map((r) => r.fileSq) } : {}),
        }),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        setActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgCommentCreateFail);
          return;
        }
        resetCommentEditor();
        loadComments();
        loadList();
      },
      () => setActionLoading(false)
    );
  };

  const startReply = (commentSq: string) => {
    if (replyOpenUnderSq === commentSq) {
      setReplyOpenUnderSq(null);
      setInlineDraft("");
      setInlineSecret(false);
      setInlineImgs([]);
      return;
    }
    setReplyOpenUnderSq(commentSq);
    setInlineEditCommentSq(null);
    setInlineDraft("");
    setInlineSecret(false);
    setInlineImgs([]);
  };

  const startEditComment = (row: CommentRow) => {
    if (inlineEditCommentSq === row.commentSq) {
      setInlineEditCommentSq(null);
      setInlineDraft("");
      setInlineSecret(false);
      setInlineImgs([]);
      return;
    }
    setInlineEditCommentSq(row.commentSq);
    setReplyOpenUnderSq(null);
    setInlineDraft(row.comment || "");
    setInlineSecret((row.secretFl || "N") === "Y");
    setInlineImgs((row.images || []).map((i) => ({ fileSq: i.fileSq, size: 0 })));
  };

  const submitInlineReply = () => {
    const text = inlineDraft.trim();
    if (!cmpnyCd || !bbsIdFilter || !nttSq || !replyOpenUnderSq || !text || actionLoading) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cmpnyCd,
          bbsId: bbsIdFilter,
          nttSq,
          parentCommentSq: replyOpenUnderSq,
          comment: text,
          secretFl: inlineSecret ? "Y" : "N",
          ...(inlineImgs.length > 0 ? { fileSqs: inlineImgs.map((r) => r.fileSq) } : {}),
        }),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        setActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgReplyCreateFail);
          return;
        }
        setReplyOpenUnderSq(null);
        setInlineDraft("");
        setInlineSecret(false);
        setInlineImgs([]);
        loadComments();
        loadList();
      },
      () => setActionLoading(false)
    );
  };

  const submitInlineEdit = () => {
    const text = inlineDraft.trim();
    if (!cmpnyCd || !bbsIdFilter || !nttSq || !inlineEditCommentSq || !text || actionLoading) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cmpnyCd,
          bbsId: bbsIdFilter,
          nttSq,
          commentSq: inlineEditCommentSq,
          comment: text,
          secretFl: inlineSecret ? "Y" : "N",
          fileSqs: inlineImgs.map((r) => r.fileSq),
        }),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        setActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgCommentUpdateFail);
          return;
        }
        setInlineEditCommentSq(null);
        setInlineDraft("");
        setInlineSecret(false);
        setInlineImgs([]);
        loadComments();
      },
      () => setActionLoading(false)
    );
  };

  const removeComment = (commentSq: string) => {
    if (!cmpnyCd || !bbsIdFilter || !nttSq || actionLoading) return;
    if (!confirm(i18nText.msgConfirmDeleteComment)) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/comment",
      {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cmpnyCd, bbsId: bbsIdFilter, nttSq, commentSq }),
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        setActionLoading(false);
        if (!isApiSuccess(resp)) {
          alert(resp?.resultMessage || i18nText.msgCommentDeleteFail);
          return;
        }
        loadComments();
        loadList();
      },
      () => setActionLoading(false)
    );
  };

  const boardTitle = selectedBoard?.bbsName || i18nText.labelBoard;
  const layoutVisual = layoutKindFromTy(selectedBoard?.layoutTy);
  const isAlbumLayout = layoutVisual === "ALBUM";
  const isCardLayout = layoutVisual === "CARD";
  const detailProfileHref = useMemo(() => bbsUserProfileImageHref(detail?.profileFileSq), [detail?.profileFileSq]);
  const maxPage = Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE));
  const filteredPostList = useMemo(() => {
    const kw = listKeyword.trim().toLowerCase();
    if (!kw) return postList;
    return postList.filter((row) => {
      const title = decodeHtmlEntities(row.title || "").toLowerCase();
      const snippet = decodeHtmlEntities(row.snippet || "").toLowerCase();
      const userNm = String(row.userNm || "").toLowerCase();
      return title.includes(kw) || snippet.includes(kw) || userNm.includes(kw);
    });
  }, [postList, listKeyword]);

  return (
    <div className={`container bbs-user-page ${paneLayout !== "default" ? `bbs-user-page--${paneLayout}` : ""}`}>
      <div className="c_wrap">
        <div className="bbs-user-page__split">
          <section className="bbs-user-page__list">
            <div className="bbs-user-page__toolbar-shell">
              <div className="bbs-user-page__toolbar bbs-user-page__toolbar--listpane">
                <button className="bbs-user-page__page-btn" onClick={() => setSortAsc((p) => !p)}>
                  {i18nText.labelSort}: {sortAsc ? i18nText.etcOldest : i18nText.etcLatest}
                </button>
                <button
                  type="button"
                  className={`bbs-user-page__page-btn bbs-user-page__layout-btn ${paneLayout === "detail-wide" ? "is-active" : ""}`}
                  onClick={() => setPaneLayout("detail-wide")}
                  title={i18nText.etcPaneShrinkMiddleExpandRight}
                  aria-label={i18nText.etcPaneShrinkMiddleExpandRight}
                >
                  <span className="bbs-user-page__layout-ico bbs-user-page__layout-ico--detail-wide" />
                </button>
                <button
                  type="button"
                  className={`bbs-user-page__page-btn bbs-user-page__layout-btn ${paneLayout === "list-wide" ? "is-active" : ""}`}
                  onClick={() => setPaneLayout("list-wide")}
                  title={i18nText.etcPaneExpandMiddleShrinkRight}
                  aria-label={i18nText.etcPaneExpandMiddleShrinkRight}
                >
                  <span className="bbs-user-page__layout-ico bbs-user-page__layout-ico--list-wide" />
                </button>
                <button
                  type="button"
                  className={`bbs-user-page__page-btn bbs-user-page__layout-btn ${paneLayout === "detail-hidden" ? "is-active" : ""}`}
                  onClick={() => setPaneLayout("detail-hidden")}
                  title={i18nText.etcPaneHideRight}
                  aria-label={i18nText.etcPaneHideRight}
                >
                  <span className="bbs-user-page__layout-ico bbs-user-page__layout-ico--detail-hidden" />
                </button>
                <button
                  className="bbs-user-page__page-btn bbs-refresh"
                  onClick={() => {
                    setPageIndex(1);
                    reloadAll();
                  }}
                  disabled={listLoading || detailLoading || commentLoading}
                >
                  <i class="ph-bold ph-arrow-clockwise"></i>
                  {i18nText.btnRefresh}
                </button>
                <span className="bbs-user-page__toolbar-spacer" aria-hidden="true" />
                <input
                  type="search"
                  className="bbs-user-page__search"
                  placeholder={i18nText.placeholderSearchInList}
                  value={listKeyword}
                  onChange={(e) => setListKeyword(e.target.value)}
                />
                <button className="bbs-user-page__write" onClick={startWrite} disabled={!bbsIdFilter}>
                  {i18nText.btnWrite}
                </button>
              </div>
            </div>
            <div className="bbs-user-page__list-head">
              <div className="bbs-user-page__list-head-main">
                <strong className="bbs-user-page__list-title">{boardTitle}</strong>
                {bbsIdFilter && selectedBoard && (
                  <div className="bbs-user-page__board-meta">
                    <span
                      className="bbs-user-page__meta-chip bbs-user-page__meta-chip--type"
                      title={boardTypeDisplayLabel(selectedBoard.bbsTy, i18nText)}
                    >
                      {boardTypeDisplayLabel(selectedBoard.bbsTy, i18nText)}
                    </span>
                    <span
                      className="bbs-user-page__meta-chip bbs-user-page__meta-chip--layout"
                      title={`${i18nText.labelBoardConfig}: ${layoutVisualKorean(layoutVisual, i18nText)}`}
                    >
                      <LayoutTyIcon kind={layoutVisualToIconKind(layoutVisual)} />
                      {layoutVisualKorean(layoutVisual, i18nText)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {listLoading && <p className="bbs-user-page__muted">{i18nText.msgLoadingList}</p>}
            {!listLoading && filteredPostList.length === 0 && <p className="bbs-user-page__muted">{i18nText.msgNoPosts}</p>}
            {!listLoading && filteredPostList.length > 0 && !isAlbumLayout && !isCardLayout && (
              <ul className="bbs-user-page__post-list">
                {filteredPostList.map((row) => {
                  const depth = Math.max(0, Number(row.depth || 0));
                  const prefix = depth > 0 ? "↳ " : "";
                  const profileHref = bbsUserProfileImageHref(row.profileFileSq);
                  return (
                    <li key={`${row.bbsId}-${row.nttSq}`} className={`bbs-user-page__post-item ${row.nttSq === nttSq ? "is-active" : ""}`}>
                      <button type="button" className="bbs-user-page__post-btn" onClick={() => selectPost({ bbsId: row.bbsId, nttSq: row.nttSq })}>
                        <div className="bbs-user-page__post-left bbs-user-page__post-title--indented" style={{ "--post-indent": `${depth * 14}px` } as CSSProperties}>
                          <div className="bbs-user-page__post-title">
                            <span className="bbs-user-page__post-title-inner">
                              {prefix}
                              {(row.noticeYn || "N") === "Y" && <span className="bbs-user-detail__notice-badge">{i18nText.etcNotice}</span>}
                              {(row.nttSttus || "PUBLIC").toUpperCase() === "SECRET" && <span className="secret-icon" title={i18nText.etcSecret}>🔒</span>}
                              <strong>{decodeHtmlEntities(row.title || i18nText.msgTitleNotProvided)}</strong>
                            </span>
                          </div>
                          {row.snippet && <p className="bbs-user-post__snippet bbs-user-post__snippet--list">{decodeHtmlEntities(row.snippet)}</p>}
                        </div>
                        <div className="bbs-user-page__post-right">
                          <div className="bbs-user-page__post-meta">
                            {profileHref ? (
                              <img className="bbs-user-page__post-avatar" src={profileHref} alt="" />
                            ) : (
                              <span className="bbs-user-page__post-avatar bbs-user-page__post-avatar--empty" aria-hidden>👤</span>
                            )}
                            <div className="bbs-user-page__post-meta-text">
                              <span className="bbs-user-page__post-author-name">{row.userNm || "-"}</span>
                              <span className="bbs-user-page__post-rdcnt">
                                <span>{(row.creationDt || "").slice(2)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {!listLoading && filteredPostList.length > 0 && (isAlbumLayout || isCardLayout) && (
              <ul className={`bbs-user-page__post-list ${isAlbumLayout ? "bbs-user-page__post-list--album" : "bbs-user-page__post-list--card"}`}>
                {filteredPostList.map((row) => {
                  const href = row.thumbFileSq ? `${SERVER_URL}/bbs/main/post/file?fileSq=${encodeURIComponent(row.thumbFileSq)}` : "";
                  const profileHref = bbsUserProfileImageHref(row.profileFileSq);
                  return (
                    <li key={`${row.bbsId}-${row.nttSq}`} className={`bbs-user-page__post-item ${row.nttSq === nttSq ? "is-active" : ""}`}>
                      <button type="button" className={`bbs-user-post ${isAlbumLayout ? "bbs-user-post--album" : ""}`} onClick={() => selectPost({ bbsId: row.bbsId, nttSq: row.nttSq })}>
                        {isAlbumLayout && href && (
                          <span className="bbs-user-post__album-cover">
                            <img src={href} alt={row.title || row.nttSq} />
                          </span>
                        )}
                        <div className="bbs-user-post__body">
                          <div className="bbs-user-post__title-row">
                            {(row.noticeYn || "N") === "Y" && <span className="bbs-user-detail__notice-badge">{i18nText.etcNotice}</span>}
                            {(row.nttSttus || "PUBLIC").toUpperCase() === "SECRET" && <span title={i18nText.etcSecret}>🔒</span>}
                            <strong className="bbs-user-post__title">{decodeHtmlEntities(row.title || i18nText.msgTitleNotProvided)}</strong>
                          </div>
                          <p className="bbs-user-post__meta">
                            <span className="bbs-user-page__post-author">
                              {profileHref ? (
                                <img className="bbs-user-page__post-avatar" src={profileHref} alt="" />
                              ) : (
                                <span className="bbs-user-page__post-avatar bbs-user-page__post-avatar--empty" aria-hidden>
                                  👤
                                </span>
                              )}
                              <span>{row.userNm || "-"}</span>
                            </span>
                            <span>{row.creationDt || ""}</span>
                            <span>{i18nText.etcViewCount} {row.rdCnt ?? 0}</span>
                          </p>
                          {isCardLayout && <p className="bbs-user-post__snippet">{decodeHtmlEntities(row.snippet || "")}</p>}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="bbs-user-page__pager">
              <button className="bbs-user-page__page-btn" disabled={pageIndex <= 1} onClick={() => setPageIndex((p) => Math.max(1, p - 1))}>
                {i18nText.btnPrev}
              </button>
              <span>
                {pageIndex} / {maxPage}
              </span>
              <button className="bbs-user-page__page-btn" disabled={pageIndex >= maxPage} onClick={() => setPageIndex((p) => Math.min(maxPage, p + 1))}>
                {i18nText.btnNext}
              </button>
            </div>
          </section>

          {paneLayout !== "detail-hidden" && (
            <aside className={`bbs-user-page__detail${!writeMode && !detailLoading && !detail && !nttSq ? " bbs-user-page__detail--empty" : ""}`}>
              {writeMode ? (
                <BbsUserWrite
                  embedded
                  initialBbsId={bbsIdFilter}
                  boardLayoutTy={selectedBoard?.layoutTy}
                  editNttSq={editNttSq || undefined}
                  parentNttSq={parentNttSq || undefined}
                  onDone={(sq) => closeWrite(sq)}
                  onCancel={() => closeWrite()}
                />
              ) : (
                <>
                  {detailLoading && <p className="bbs-user-page__muted">{i18nText.msgLoadingDetail}</p>}
                  {!detailLoading && !detail && (nttSq ? <p className="bbs-user-page__warn">{i18nText.msgCannotLoadPost}</p> : (
                    <div className="bbs-user-page__empty-detail">
                      <i className="ph ph-file-text bbs-user-page__empty-icon" />
                      <span>{i18nText.msgSelectPost}</span>
                    </div>
                  ))}
                  {!detailLoading && detail && (
                    <article className="bbs-user-detail">
                      <header className="bbs-user-detail__header">
                        <h3>
                          {(detail.noticeYn || "N") === "Y" && <span className="bbs-user-detail__notice-badge">{i18nText.etcNotice}</span>}
                          {(detail.nttSttus || "PUBLIC").toUpperCase() === "SECRET" && <span title={i18nText.etcSecret}>🔒</span>}{" "}
                          {decodeHtmlEntities(detail.title || i18nText.msgTitleNotProvided)}
                        </h3>
                        <div className="bbs-user-detail__author-row">
                          {detailProfileHref ? (
                            <img className="bbs-user-detail__avatar" src={detailProfileHref} alt="" />
                          ) : (
                            <span className="bbs-user-detail__avatar bbs-user-detail__avatar--empty" aria-hidden>
                              👤
                            </span>
                          )}
                          <div className="bbs-user-detail__author-text">
                            <span className="bbs-user-detail__author-name">{detail.userNm || "-"}</span>
                            <span className="bbs-user-detail__author-date">
                              {detail.creationDt || ""} · {i18nText.etcViewCount} {detail.rdCnt ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="bbs-user-detail__actions">
                          <button className="bbs-user-page__page-btn" onClick={() => toggleVote("L")} disabled={actionLoading || !perms?.canLike}>
                            👍 {detail.likeCnt ?? 0}
                          </button>
                          <button className="bbs-user-page__page-btn" onClick={() => toggleVote("D")} disabled={actionLoading || !perms?.canDislike}>
                            👎 {detail.dislikeCnt ?? 0}
                          </button>
                          <button className="bbs-user-page__page-btn" onClick={toggleFavorite} disabled={actionLoading || !perms?.canFavorite}>
                            ☆ {detail.favoriteCnt ?? 0}
                          </button>
                          <button className="bbs-user-page__page-btn" onClick={shareUrl} disabled={!perms?.canShare}>
                            {i18nText.btnShare}
                          </button>
                          {perms?.canReply && (
                            <button className="bbs-user-page__page-btn" onClick={startReplyPost}>
                              {i18nText.btnReply}
                            </button>
                          )}
                          {perms?.canPopup && (
                            <>
                              <button className="bbs-user-page__page-btn" onClick={openPopupSetting} disabled={popupSettingLoading}>
                                {i18nText.btnPopupSetting}
                              </button>
                            </>
                          )}
                          {perms?.canEdit && (
                            <button className="bbs-user-page__page-btn" onClick={startEdit}>
                              {i18nText.btnEdit}
                            </button>
                          )}
                          {perms?.canDelete && (
                            <button className="bbs-user-page__page-btn" onClick={removePost} disabled={actionLoading}>
                              {i18nText.btnDelete}
                            </button>
                          )}
                        </div>
                      </header>

                      <section className="bbs-user-detail__contents" dangerouslySetInnerHTML={{ __html: detail.contents || "" }} />

                      <section className="bbs-user-detail__files">
                        <h3 className="bbs-user-popup__comments-title">{i18nText.labelAttachment}</h3>
                        {postFileLoading && <p className="bbs-user-page__muted">{i18nText.msgLoadingFiles}</p>}
                        {!postFileLoading && postFiles.length === 0 && <p className="bbs-user-page__muted">{i18nText.msgNoFiles}</p>}
                        {!postFileLoading && postFiles.length > 0 && (
                          <ul className="bbs-user-detail__file-list">
                            {postFiles.map((f) => {
                              const href = `${SERVER_URL}/bbs/main/post/file?fileSq=${encodeURIComponent(f.fileSq)}`;
                              const imageLike = (f.mimeTy || "").toLowerCase().startsWith("image/");
                              return (
                                <li key={f.fileSq} className="bbs-user-detail__file-item">
                                  {imageLike ? (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                      <img src={href} alt={f.fileNm || f.fileSq} className="bbs-user-detail__thumb" />
                                    </a>
                                  ) : (
                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                      {f.fileNm || f.fileSq}
                                    </a>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </section>

                      {perms?.canComment ? (
                        <section className="bbs-user-detail__comments bbs-user-comment-thread">
                          <h3 className="bbs-user-comment-thread__title">{i18nText.etcComment}</h3>
                          {commentLoading && <p className="bbs-user-page__muted">{i18nText.msgLoadingComments}</p>}
                          {!commentLoading && comments.length === 0 && <p className="bbs-user-page__muted">{i18nText.msgNoComments}</p>}
                          {!commentLoading && (
                            <ul className="bbs-user-comment-thread__list">
                              {comments.map((c) => {
                                const depth = Math.min(Number(c.threadDepth) || 0, 12);
                                const pad = depth * 18;
                                const mine = (c.myCommentFl || "N") === "Y" || (c.userId && currentUserId && c.userId === currentUserId);
                                const isDeleted = (c.comment || "").trim() === "삭제된 글입니다.";
                                const canManage = !isDeleted && (mine || Boolean(perms?.canPopup));
                                const showReplyForm = replyOpenUnderSq === c.commentSq;
                                const showEditForm = inlineEditCommentSq === c.commentSq;
                                return (
                                  <li key={c.commentSq} className="bbs-user-comment-thread__item">
                                    <div className="bbs-user-comment-thread__row bbs-user-comment-thread__row--indented" style={{ "--comment-indent": `${pad}px` } as CSSProperties}>
                                      {depth > 0 ? <span className="bbs-user-comment-thread__corner">└</span> : <span className="bbs-user-comment-thread__corner bbs-user-comment-thread__corner--root" />}
                                      <div className="bbs-user-comment-thread__main">
                                        <div className="bbs-user-comment-thread__meta">
                                          <span className={`bbs-user-comment-thread__kind ${depth > 0 ? "is-reply" : "is-comment"}`}>{depth > 0 ? i18nText.etcReply : i18nText.etcComment}</span>
                                          <strong>{c.userNm || i18nText.etcAnonymous}</strong>
                                          {(c.secretFl || "N") === "Y" && <span title={`${i18nText.etcSecret} ${i18nText.etcComment}`}>🔒</span>}
                                          <span>{c.creationDt || ""}</span>
                                          <span className={`bbs-user-comment-thread__meta-actions ${canManage ? "is-owner" : ""}`}>
                                            {perms?.canReply && !isDeleted && (
                                              <button type="button" className="bbs-user-page__page-btn" onClick={() => startReply(c.commentSq)} disabled={actionLoading}>
                                                {i18nText.btnReply}
                                              </button>
                                            )}
                                            {canManage && (
                                              <>
                                                <button type="button" className="bbs-user-page__page-btn" onClick={() => startEditComment(c)} disabled={actionLoading}>
                                                  {i18nText.btnEdit}
                                                </button>
                                                <button type="button" className="bbs-user-page__page-btn" onClick={() => removeComment(c.commentSq)} disabled={actionLoading}>
                                                  {i18nText.btnDelete}
                                                </button>
                                              </>
                                            )}
                                          </span>
                                        </div>
                                        <div className={`bbs-user-comment-thread__text ${isDeleted ? "is-deleted" : ""}`}>{c.comment || ""}</div>
                                        {c.images && c.images.length > 0 && (
                                          <ul className="bbs-user-comment-thread__imgs">
                                            {c.images.map((im) => (
                                              <li key={im.fileSq}>
                                                <img src={`${SERVER_URL}/bbs/main/comment/file?fileSq=${encodeURIComponent(im.fileSq)}`} alt="" className="bbs-user-comment-thread__img-thumb" />
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>

                                    {showReplyForm && (
                                      <div className="bbs-user-comment-thread__inline bbs-user-comment-thread__inline--indented" style={{ "--comment-inline-indent": `${pad + 18}px` } as CSSProperties}>
                                        <div className="bbs-user-comment-thread__inline-inner">
                                          <textarea className="bbs-user-comment-thread__textarea" value={inlineDraft} onChange={(e) => setInlineDraft(e.target.value)} placeholder={i18nText.placeholderEnterReply} rows={4} />
                                          <div className="bbs-user-comment-thread__checkbox-row">
                                            <label className="md-switch md-switch--compact">
                                              <input className="md-switch__input" type="checkbox" checked={inlineSecret} onChange={(e) => setInlineSecret(e.target.checked)} />
                                              <span className="md-switch__track" aria-hidden>
                                                <span className="md-switch__thumb" />
                                              </span>
                                              <span className="md-switch__label">{i18nText.etcSecret}</span>
                                            </label>
                                          </div>
                                          <CommentAttachEditor imgs={inlineImgs} setImgs={setInlineImgs} uploading={inlineUploading} onUploading={setInlineUploading} disabled={actionLoading} t={i18nText} />
                                          <div className="bbs-user-comment-thread__inline-actions">
                                            <button type="button" className="bbs-user-page__write" onClick={submitInlineReply} disabled={actionLoading || inlineUploading || !inlineDraft.trim()}>
                                              {i18nText.btnRegister}
                                            </button>
                                            <button type="button" className="bbs-user-page__page-btn" onClick={() => setReplyOpenUnderSq(null)} disabled={actionLoading}>
                                              {i18nText.etcReplyCancel}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {showEditForm && (
                                      <div className="bbs-user-comment-thread__inline bbs-user-comment-thread__inline--indented" style={{ "--comment-inline-indent": `${pad + 18}px` } as CSSProperties}>
                                        <div className="bbs-user-comment-thread__inline-inner">
                                          <textarea className="bbs-user-comment-thread__textarea" value={inlineDraft} onChange={(e) => setInlineDraft(e.target.value)} placeholder={i18nText.placeholderEditComment} rows={4} />
                                          <div className="bbs-user-comment-thread__checkbox-row">
                                            <label className="md-switch md-switch--compact">
                                              <input className="md-switch__input" type="checkbox" checked={inlineSecret} onChange={(e) => setInlineSecret(e.target.checked)} />
                                              <span className="md-switch__track" aria-hidden>
                                                <span className="md-switch__thumb" />
                                              </span>
                                              <span className="md-switch__label">{i18nText.etcSecret}</span>
                                            </label>
                                          </div>
                                          <CommentAttachEditor imgs={inlineImgs} setImgs={setInlineImgs} uploading={inlineUploading} onUploading={setInlineUploading} disabled={actionLoading} t={i18nText} />
                                          <div className="bbs-user-comment-thread__inline-actions">
                                            <button type="button" className="bbs-user-page__write" onClick={submitInlineEdit} disabled={actionLoading || inlineUploading || !inlineDraft.trim()}>
                                              {i18nText.etcEditSave}
                                            </button>
                                            <button type="button" className="bbs-user-page__page-btn" onClick={() => setInlineEditCommentSq(null)} disabled={actionLoading}>
                                              {i18nText.btnCancel}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                          <div className="bbs-user-comment-thread__root">
                            <h4 className="bbs-user-comment-thread__root-title">{i18nText.etcComment} {i18nText.etcWriteAction}</h4>
                            <textarea className="bbs-user-comment-thread__textarea" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={i18nText.placeholderEnterComment} rows={4} />
                            <div className="bbs-user-comment-thread__checkbox-row">
                              <label className="md-switch md-switch--compact">
                                <input className="md-switch__input" type="checkbox" checked={commentSecret} onChange={(e) => setCommentSecret(e.target.checked)} />
                                <span className="md-switch__track" aria-hidden>
                                  <span className="md-switch__thumb" />
                                </span>
                                <span className="md-switch__label">{i18nText.etcSecret}</span>
                              </label>
                            </div>
                            <CommentAttachEditor imgs={commentImgs} setImgs={setCommentImgs} uploading={rootCommentUploading} onUploading={setRootCommentUploading} disabled={actionLoading} t={i18nText} />
                            <div className="bbs-user-comment-thread__inline-actions">
                              <button type="button" className="bbs-user-page__write" onClick={submitComment} disabled={actionLoading || rootCommentUploading || !commentText.trim()}>
                                {i18nText.btnRegister}
                              </button>
                            </div>
                          </div>
                        </section>
                      ) : (
                        <section className="bbs-user-detail__comments bbs-user-comment-thread">
                          <h3 className="bbs-user-comment-thread__title">{i18nText.etcComment}</h3>
                          <p className="bbs-user-page__muted">{i18nText.msgCommentsDisabled}</p>
                        </section>
                      )}
                    </article>
                  )}
                </>
              )}
            </aside>
          )}
        </div>
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
              aria-label={i18nText.etcPopupPreview}
            >
              <div className="bbs-user-popup-layer__body">
                <h3 className="bbs-user-popup-layer__title">{decodeHtmlEntities(popupPreview.title || "") || i18nText.msgTitleNotProvided}</h3>
                <div className="bbs-user-popup-layer__meta">
                  <span>
                    {i18nText.labelCreatedDate} : {popupPreview.creationDt || "-"}
                  </span>
                  <span>|</span>
                  <span>
                    {i18nText.labelAuthor} {popupPreview.userNm || "-"}
                  </span>
                  <span>|</span>
                  <span className="bbs-user-popup-layer__read">👁 {popupPreview.rdCnt ?? 0}</span>
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
                <div className="bbs-user-popup-layer__contents" dangerouslySetInnerHTML={{ __html: popupPreview.contents || "" }} />
              </div>
              <div className="bbs-user-popup-layer__footer">
                {popupHideFl && (
                  <>
                    <label className="bbs-user-popup-layer__dismiss-check">
                      <input type="checkbox" onChange={closePopupPreviewNever} />
                      {i18nText.etcDontShowAgain}
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
        {popupSettingOpen && popupSetting && (
          <div className="wrap_pop" onClick={closePopupSettingModal} role="presentation">
            <div
              className="pop_inner pop_inner_w800 pop_msg_edit"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={popupSettingTitleId}
            >
              <div className="pop_header">
                <h1 id={popupSettingTitleId}>{i18nText.btnPopupSetting}</h1>
                <button type="button" className="pop_close" onClick={closePopupSettingModal} aria-label={i18nText.btnClose}>
                  ×
                </button>
              </div>
              <div className="pop_container">
                <div className="md-wrap">
                  <div className="md-bbs-basic-form-grid">
                    <label className="f_label md-bbs-form-label">{i18nText.labelPopupActive}</label>
                    <div className="md-bbs-form-control md-bbs-form-control--switch">
                      <MdSwitch id="bbs_user_popup_use_fl" checked={popupUseFl} onChange={setPopupUseFl} />
                    </div>
                    <label className="f_label md-bbs-form-label">{i18nText.labelDontShow}</label>
                    <div className="md-bbs-form-control md-bbs-form-control--switch">
                      <MdSwitch id="bbs_user_popup_hide_fl" checked={popupHideFl} onChange={setPopupHideFl} />
                    </div>
                    <label className="f_label md-bbs-form-label">
                      {i18nText.labelStartDate} <ReqStar />
                    </label>
                    <div className="md-bbs-form-control">
                      <input type="datetime-local" className="f_input" value={popupStartDt} onChange={(e) => setPopupStartDt(e.target.value)} />
                    </div>
                    <label className="f_label md-bbs-form-label">
                      {i18nText.labelEndDate} <ReqStar />
                    </label>
                    <div className="md-bbs-form-control">
                      <input type="datetime-local" className="f_input" value={popupEndDt} onChange={(e) => setPopupEndDt(e.target.value)} />
                    </div>
                    <label className="f_label md-bbs-form-label">
                      {i18nText.labelXCoord} <ReqStar />
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        type="number"
                        className="f_input"
                        value={popupXcnts ?? ""}
                        onChange={(e) => setPopupXcnts(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label">
                      {i18nText.labelYCoord} <ReqStar />
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        type="number"
                        className="f_input"
                        value={popupYdnts ?? ""}
                        onChange={(e) => setPopupYdnts(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label">
                      {i18nText.labelWidth} <ReqStar />
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        type="number"
                        className="f_input"
                        value={popupWidth ?? ""}
                        onChange={(e) => setPopupWidth(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label">
                      {i18nText.labelHeight} <ReqStar />
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        type="number"
                        className="f_input"
                        value={popupVrticl ?? ""}
                        onChange={(e) => setPopupVrticl(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <div className="board_btn_area">
                  <div className="right_col btn1">
                    <button type="button" className="btn btn_skyblue_h46 w_100" onClick={deletePopupSetting} disabled={popupSettingLoading}>
                      {i18nText.btnDelete}
                    </button>
                    <button type="button" className="btn btn_blue_h46 w_100" onClick={savePopupSetting} disabled={popupSettingLoading}>
                      {i18nText.btnSave}
                    </button>
                    <button
                      type="button"
                      className="btn btn_blue_h46 w_100"
                      onClick={() => {
                        if (!popupUseFl) {
                          alert(i18nText.msgPopupPreviewFail);
                          return;
                        }
                        loadPopupPreview();
                      }}
                      disabled={popupSettingLoading || popupPreviewLoading}
                    >
                      {i18nText.btnPreview}
                    </button>
                    <button type="button" className="btn btn_skyblue_h46 w_100" onClick={closePopupSettingModal}>
                      {i18nText.btnClose}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
