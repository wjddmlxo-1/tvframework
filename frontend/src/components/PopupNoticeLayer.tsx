import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSessionItem } from "@/utils/storage";
import { getLanguageCodeForApi } from "@/utils/language";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_COMPONENT_I18N_FALLBACK, CMMN_COMPONENT_I18N_KEYS } from "@/components/cmmnComponentI18n";

type PopupNoticeRow = {
  popupSq: string;
  nttSq: string;
  bbsId: string;
  title?: string;
};

type PopupPreview = {
  popupSq: string;
  nttSq: string;
  bbsId: string;
  title?: string;
  contents?: string;
  userNm?: string;
  creationDt?: string;
  rdCnt?: number;
  likeCnt?: number;
  dislikeCnt?: number;
  favoriteCnt?: number;
  myLikeFl?: string;
  myDislikeFl?: string;
  myFavoriteFl?: string;
  xcnts?: number;
  ydnts?: number;
  width?: number;
  vrticl?: number;
  hideFl?: string;
};

const todayYmd = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

function PopupNoticeLayer() {
  const location = useLocation();
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const cmpnyCd = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_COMPONENT_I18N_KEYS, CMMN_COMPONENT_I18N_FALLBACK, { cmpnyCd });
  const loginUserId = String((getSessionItem("loginUser") as { id?: string } | null)?.id ?? "").trim();

  const [queue, setQueue] = useState<PopupNoticeRow[]>([]);
  const [preview, setPreview] = useState<PopupPreview | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const readKeyRef = useRef("");
  const isMainPath = useMemo(() => {
    const normalize = (p: string) => p.replace(/\/+$/, "");
    return normalize(location.pathname) === normalize(URL.MAIN);
  }, [location.pathname]);

  const isBlocked = useCallback((popupSq?: string) => {
    const key = String(popupSq ?? "").trim();
    if (!key) return true;
    const scope = `${cmpnyCd}:${loginUserId || "anonymous"}:${key}`;
    if (localStorage.getItem(`bbs-popup-user-never-${scope}`) === "Y") return true;
    if (localStorage.getItem(`bbs-popup-user-today-${scope}`) === todayYmd()) return true;
    return false;
  }, [cmpnyCd, loginUserId]);

  const loadPopupList = useCallback(() => {
    if (!cmpnyCd) {
      setQueue([]);
      setPreview(null);
      setOpen(false);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd, langCode });
    EgovNet.requestFetch(
      `/bbs/main/popup/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: PopupNoticeRow[] }) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        const rows = ok && Array.isArray(resp?.result) ? resp.result : [];
        const filtered = rows.filter((row) => !isBlocked(row.popupSq));
        setQueue(filtered);
        if (filtered.length > 0) {
          setOpen(true);
        } else {
          setPreview(null);
          setOpen(false);
        }
      },
      () => {
        setQueue([]);
        setPreview(null);
        setOpen(false);
      }
    );
  }, [cmpnyCd, langCode, isBlocked]);

  useEffect(() => {
    if (isMainPath) {
      loadPopupList();
    }
  }, [isMainPath, loadPopupList]);

  const openPreview = useCallback(
    (row: PopupNoticeRow) => {
      if (!cmpnyCd || !row.popupSq || !row.bbsId || !row.nttSq) return;
      setLoading(true);
      setOpen(true);
      const q = new URLSearchParams({
        cmpnyCd,
        popupSq: row.popupSq,
        bbsId: row.bbsId,
        nttSq: row.nttSq,
        langCode,
      });
      EgovNet.requestFetch(
        `/bbs/main/popup/preview?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
        (resp: { resultCode?: number; result?: PopupPreview | null }) => {
          const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
          const next = ok ? resp?.result ?? null : null;
          setPreview(next);
          setLoading(false);
          if (!next) {
            setOpen(false);
          }
        },
        () => {
          setPreview(null);
          setLoading(false);
          setOpen(false);
        }
      );
    },
    [cmpnyCd, langCode]
  );

  const openCurrent = useCallback(() => {
    if (!cmpnyCd || loading || queue.length === 0) return;
    const current = queue[0];
    // 이미 같은 팝업을 화면에 올려둔 상태면 재조회하지 않음(요청 루프 방지)
    if (preview?.popupSq === current.popupSq) {
      return;
    }
    openPreview(current);
  }, [cmpnyCd, loading, queue, preview?.popupSq, openPreview]);

  useEffect(() => {
    if (!open || loading) return;
    if (queue.length === 0) {
      setOpen(false);
      setPreview(null);
      return;
    }
    openCurrent();
  }, [open, loading, queue, openCurrent]);

  const closeByConfirm = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  const closeNever = useCallback(() => {
    const key = String(preview?.popupSq ?? "").trim();
    if (key) {
      const scope = `${cmpnyCd}:${loginUserId || "anonymous"}:${key}`;
      localStorage.setItem(`bbs-popup-user-never-${scope}`, "Y");
    }
    setQueue((prev) => prev.slice(1));
  }, [cmpnyCd, loginUserId, preview?.popupSq]);

  const closeToday = useCallback(() => {
    const key = String(preview?.popupSq ?? "").trim();
    if (key) {
      const scope = `${cmpnyCd}:${loginUserId || "anonymous"}:${key}`;
      localStorage.setItem(`bbs-popup-user-today-${scope}`, todayYmd());
    }
    setQueue((prev) => prev.slice(1));
  }, [cmpnyCd, loginUserId, preview?.popupSq]);

  const showDismissOptions = useMemo(() => {
    // "보지 않기 기능" 스위치가 ON(Y)일 때만 하단 체크박스 노출
    return String(preview?.hideFl || "").trim().toUpperCase() === "Y";
  }, [preview?.hideFl]);

  const markRead = useCallback(() => {
    if (!preview || actionLoading) return;
    setActionLoading(true);
    EgovNet.requestFetch(
      "/bbs/main/post/read",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nttSq: preview.nttSq, bbsId: preview.bbsId, cmpnyCd }),
      },
      () => {
        setPreview((prev) => (prev ? { ...prev, rdCnt: Number(prev.rdCnt ?? 0) + 1 } : prev));
        setActionLoading(false);
      },
      () => setActionLoading(false)
    );
  }, [actionLoading, cmpnyCd, preview]);

  const toggleVote = useCallback(
    (voteGb: "L" | "D") => {
      if (!preview || actionLoading) return;
      setActionLoading(true);
      setPreview((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        const currentLike = (next.myLikeFl || "N") === "Y";
        const currentDislike = (next.myDislikeFl || "N") === "Y";
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
        } else if (currentDislike) {
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
        return next;
      });
      EgovNet.requestFetch(
        "/bbs/main/post/vote/toggle",
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nttSq: preview.nttSq, bbsId: preview.bbsId, cmpnyCd, voteGb }),
        },
        () => setActionLoading(false),
        () => setActionLoading(false)
      );
    },
    [actionLoading, cmpnyCd, preview]
  );

  const toggleFavorite = useCallback(() => {
    if (!preview || actionLoading) return;
    setActionLoading(true);
    setPreview((prev) => {
      if (!prev) return prev;
      const active = (prev.myFavoriteFl || "N") === "Y";
      const cnt = Number(prev.favoriteCnt ?? 0);
      return { ...prev, myFavoriteFl: active ? "N" : "Y", favoriteCnt: active ? Math.max(0, cnt - 1) : cnt + 1 };
    });
    EgovNet.requestFetch(
      "/bbs/main/post/favorite/toggle",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nttSq: preview.nttSq, bbsId: preview.bbsId, cmpnyCd }),
      },
      () => setActionLoading(false),
      () => setActionLoading(false)
    );
  }, [actionLoading, cmpnyCd, preview]);

  const copyShareUrl = useCallback(() => {
    if (!preview) return;
    const link = `${window.location.origin}${URL.MAIN_BBS}?bbsId=${encodeURIComponent(preview.bbsId)}&nttSq=${encodeURIComponent(preview.nttSq)}`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(link).then(
        () => alert(i18nText.msgUrlCopied),
        () => alert(link)
      );
    } else {
      alert(link);
    }
  }, [preview, i18nText.msgUrlCopied]);

  useEffect(() => {
    if (!preview || actionLoading) return;
    const readKey = `${preview.popupSq}:${preview.nttSq}:${preview.bbsId}:${cmpnyCd}`;
    if (readKeyRef.current === readKey) return;
    readKeyRef.current = readKey;
    markRead();
  }, [cmpnyCd, preview, markRead, actionLoading]);

  if (!isMainPath || !open || (!preview && !loading)) {
    return null;
  }

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const rawW = Number(preview?.width) || 520;
  const rawH = Number(preview?.vrticl) || 620;
  const w = Math.min(Math.max(280, rawW), vw - 16);
  const h = Math.min(Math.max(220, rawH), vh - 16);
  const rawL = Number(preview?.xcnts);
  const rawT = Number(preview?.ydnts);
  const left = Math.min(Math.max(8, Number.isFinite(rawL) ? rawL : 100), Math.max(8, vw - w - 8));
  const top = Math.min(Math.max(8, Number.isFinite(rawT) ? rawT : 100), Math.max(8, vh - h - 8));

  return (
    <div className="bbs-user-popup-layer-overlay" role="presentation">
      <div
        className="bbs-user-popup-layer"
        style={{ left, top, width: w, height: h }}
        role="dialog"
        aria-modal="true"
        aria-label={i18nText.titlePopupNotice}
      >
        {loading && <div className="bbs-user-popup-layer__busy">{i18nText.msgLoadingInline}</div>}
        {preview && (
          <>
            <div className="bbs-user-popup-layer__body">
              <h3 className="bbs-user-popup-layer__title">{preview.title || i18nText.msgUntitled}</h3>
              <div className="bbs-user-popup-layer__meta">
                <span>{i18nText.labelCreatedDate} : {preview.creationDt || "-"}</span>
                <span>|</span>
                <span>{i18nText.labelAuthor} {preview.userNm || "-"}</span>
                <span>|</span>
                <span className="bbs-user-popup-layer__read">👁 {preview.rdCnt ?? 0}</span>
                <span>|</span>
                <button
                  type="button"
                  className={`bbs-user-popup-layer__icon-btn ${(preview.myLikeFl || "N") === "Y" ? "is-active" : ""}`}
                  onClick={() => toggleVote("L")}
                  disabled={actionLoading}
                  title={i18nText.labelRecommend}
                >
                  <span>👍</span> {preview.likeCnt ?? 0}
                </button>
                <span>|</span>
                <button
                  type="button"
                  className={`bbs-user-popup-layer__icon-btn ${(preview.myDislikeFl || "N") === "Y" ? "is-active" : ""}`}
                  onClick={() => toggleVote("D")}
                  disabled={actionLoading}
                  title={i18nText.labelDisrecommend}
                >
                  <span>👎</span> {preview.dislikeCnt ?? 0}
                </button>
                <span>|</span>
                <button
                  type="button"
                  className={`bbs-user-popup-layer__icon-btn ${(preview.myFavoriteFl || "N") === "Y" ? "is-active" : ""}`}
                  onClick={toggleFavorite}
                  disabled={actionLoading}
                  title={i18nText.labelFavorite}
                >
                  <span>☆</span> {preview.favoriteCnt ?? 0}
                </button>
                <span>|</span>
                <button type="button" className="bbs-user-popup-layer__icon-btn" onClick={copyShareUrl} title={i18nText.btnShare}>
                  📤 {i18nText.btnShare}
                </button>
              </div>
              <div className="bbs-user-popup-layer__contents" dangerouslySetInnerHTML={{ __html: preview.contents || "" }} />
            </div>
            <div className="bbs-user-popup-layer__footer">
              {showDismissOptions && (
                <>
                  <label className="bbs-user-popup-layer__dismiss-check">
                    <input type="checkbox" onChange={closeNever} />
                    {i18nText.btnNeverShow}
                  </label>
                  <label className="bbs-user-popup-layer__dismiss-check">
                    <input type="checkbox" onChange={closeToday} />
                    {i18nText.btnHideToday}
                  </label>
                </>
              )}
              <button type="button" className="bbs-user-page__write" onClick={closeByConfirm}>
                {i18nText.btnClose}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PopupNoticeLayer;
