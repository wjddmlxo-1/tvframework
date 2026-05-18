import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_BBS_USER_I18N_KEYS,
  CMMN_BBS_USER_I18N_FALLBACK,
} from "@/pages/main/cmmnBbsUserI18n";
import { getLanguageCodeForApi } from "@/utils/language";
import { getLocalItem, getSessionItem, setLocalItem } from "@/utils/storage";

const BBS_USER_SIDEBAR_I18N_KEYS = {
  labelBoard: CMMN_BBS_USER_I18N_KEYS.labelBoard,
  msgSidebarSelectCompanyHint: CMMN_BBS_USER_I18N_KEYS.msgSidebarSelectCompanyHint,
  etcSidebarFavoriteAllPosts: CMMN_BBS_USER_I18N_KEYS.etcSidebarFavoriteAllPosts,
  etcSidebarViewAllPosts: CMMN_BBS_USER_I18N_KEYS.etcSidebarViewAllPosts,
  etcSidebarFavoriteOnly: CMMN_BBS_USER_I18N_KEYS.etcSidebarFavoriteOnly,
  etcSidebarFavoriteRemoveTitle: CMMN_BBS_USER_I18N_KEYS.etcSidebarFavoriteRemoveTitle,
  etcSidebarFavoriteAddTitle: CMMN_BBS_USER_I18N_KEYS.etcSidebarFavoriteAddTitle,
  etcSidebarLoading: CMMN_BBS_USER_I18N_KEYS.etcSidebarLoading,
} as const;

const BBS_USER_SIDEBAR_I18N_FALLBACK = {
  labelBoard: CMMN_BBS_USER_I18N_FALLBACK.labelBoard,
  msgSidebarSelectCompanyHint: CMMN_BBS_USER_I18N_FALLBACK.msgSidebarSelectCompanyHint,
  etcSidebarFavoriteAllPosts: CMMN_BBS_USER_I18N_FALLBACK.etcSidebarFavoriteAllPosts,
  etcSidebarViewAllPosts: CMMN_BBS_USER_I18N_FALLBACK.etcSidebarViewAllPosts,
  etcSidebarFavoriteOnly: CMMN_BBS_USER_I18N_FALLBACK.etcSidebarFavoriteOnly,
  etcSidebarFavoriteRemoveTitle: CMMN_BBS_USER_I18N_FALLBACK.etcSidebarFavoriteRemoveTitle,
  etcSidebarFavoriteAddTitle: CMMN_BBS_USER_I18N_FALLBACK.etcSidebarFavoriteAddTitle,
  etcSidebarLoading: CMMN_BBS_USER_I18N_FALLBACK.etcSidebarLoading,
} as const;

type BoardRow = {
  bbsId: string;
  bbsName?: string;
  bbsTy?: string;
  postCount?: number;
  unreadCount?: number;
};

/** 사용자 게시판 전용 좌측 네비(권한 기반 게시판 목록) */
export default function BbsUserSidebar() {
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const cmpnyCd = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const i18nText = useCmmnScreenI18n(BBS_USER_SIDEBAR_I18N_KEYS, BBS_USER_SIDEBAR_I18N_FALLBACK, { cmpnyCd });
  const [searchParams, setSearchParams] = useSearchParams();

  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const selectedBbsId = searchParams.get("bbsId") || "__ALL__";
  const favoriteOnly = searchParams.get("favoriteOnly") === "Y";

  const favoriteStorageKey = useMemo(() => `bbsUserFavorites:${cmpnyCd || "NONE"}`, [cmpnyCd]);

  useEffect(() => {
    if (!cmpnyCd) {
      setFavoriteIds([]);
      return;
    }
    const raw = getLocalItem(favoriteStorageKey);
    setFavoriteIds(Array.isArray(raw) ? raw.filter((v) => typeof v === "string") : []);
  }, [cmpnyCd, favoriteStorageKey]);

  const loadBoards = useCallback(() => {
    if (!cmpnyCd) {
      setBoards([]);
      return;
    }
    setLoading(true);
    const q = new URLSearchParams({ cmpnyCd, langCode });
    EgovNet.requestFetch(
      `/bbs/main/boards?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: BoardRow[] }) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        const raw = ok && Array.isArray(resp.result) ? resp.result : [];
        setBoards(raw);
        setLoading(false);
      },
      () => {
        setBoards([]);
        setLoading(false);
      }
    );
  }, [cmpnyCd, langCode]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const totalPosts = useMemo(() => boards.reduce((s, b) => s + (Number(b.postCount) || 0), 0), [boards]);
  const favoriteBoards = useMemo(() => boards.filter((b) => favoriteIds.includes(b.bbsId)), [boards, favoriteIds]);
  const visibleBoards = useMemo(
    () => (favoriteOnly ? boards.filter((b) => favoriteIds.includes(b.bbsId)) : boards),
    [boards, favoriteIds, favoriteOnly]
  );
  const favoritePosts = useMemo(
    () => favoriteBoards.reduce((s, b) => s + (Number(b.postCount) || 0), 0),
    [favoriteBoards]
  );

  const selectBoard = (bbsId: string) => {
    const next = new URLSearchParams(searchParams);
    if (bbsId === "__ALL__") next.delete("bbsId");
    else next.set("bbsId", bbsId);
    next.delete("nttSq");
    setSearchParams(next, { replace: true });
  };

  const toggleFavoriteOnly = () => {
    const next = new URLSearchParams(searchParams);
    if (favoriteOnly) next.delete("favoriteOnly");
    else next.set("favoriteOnly", "Y");
    setSearchParams(next, { replace: true });
  };

  const toggleBoardFavorite = (bbsId: string) => {
    const nextIds = favoriteIds.includes(bbsId) ? favoriteIds.filter((id) => id !== bbsId) : [...favoriteIds, bbsId];
    setFavoriteIds(nextIds);
    setLocalItem(favoriteStorageKey, nextIds);
  };

  const handleBoardItemClick = (event: React.MouseEvent<HTMLButtonElement>, bbsId: string, favorite: boolean) => {
    const target = event.target as HTMLElement;
    if (target.closest(".bbs-user-sidebar__star")) {
      toggleBoardFavorite(bbsId);
      return;
    }
    selectBoard(bbsId);
  };

  return (
    <div className="bbs-user-sidebar">
      <div className="bbs-user-sidebar__header">
        <span className="bbs-user-sidebar__header-title">{i18nText.labelBoard}</span>
      </div>
      {!cmpnyCd && <p className="bbs-user-sidebar__hint">{i18nText.msgSidebarSelectCompanyHint}</p>}
      {loading && <p className="bbs-user-sidebar__hint">{i18nText.etcSidebarLoading}</p>}
      <button
        type="button"
        className={`bbs-user-sidebar__item ${selectedBbsId === "__ALL__" ? "is-active" : ""}`}
        onClick={() => selectBoard("__ALL__")}
      >
        <span className="bbs-user-sidebar__item-label">
          {favoriteOnly ? i18nText.etcSidebarFavoriteAllPosts : i18nText.etcSidebarViewAllPosts}
        </span>
        <span className="bbs-user-sidebar__item-count">{favoriteOnly ? favoritePosts : totalPosts}</span>
      </button>
      <button
        type="button"
        className={`bbs-user-sidebar__item bbs-user-sidebar__item--favorite-toggle ${favoriteOnly ? "is-active" : ""}`}
        onClick={toggleFavoriteOnly}
      >
        <span className="bbs-user-sidebar__item-label">{i18nText.etcSidebarFavoriteOnly}</span>
        <span className="bbs-user-sidebar__item-count">{favoriteBoards.length}</span>
      </button>
      <ul className="bbs-user-sidebar__list">
        {visibleBoards.map((b) => {
          const unread = Number(b.unreadCount) || 0;
          const total = Number(b.postCount) || 0;
          const favorite = favoriteIds.includes(b.bbsId);
          return (
            <li key={b.bbsId}>
              <button
                type="button"
                className={`bbs-user-sidebar__item ${selectedBbsId === b.bbsId ? "is-active" : ""}`}
                onClick={(event) => handleBoardItemClick(event, b.bbsId, favorite)}
              >
                <span className="bbs-user-sidebar__item-label">{b.bbsName || b.bbsId}</span>
                <span className="bbs-user-sidebar__item-meta">
                  <span className="bbs-user-sidebar__item-count">
                    {unread}/{total}
                  </span>
                  <span
                    className={`bbs-user-sidebar__star ${favorite ? "is-favorite" : ""}`}
                    title={favorite ? i18nText.etcSidebarFavoriteRemoveTitle : i18nText.etcSidebarFavoriteAddTitle}
                    aria-hidden="true"
                  >
                    <i className={favorite ? "ph-fill ph-push-pin" : "ph-bold ph-push-pin"}></i>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
