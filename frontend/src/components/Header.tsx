import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";

import * as EgovNet from "@/api/egovFetch";

import URL from "@/constants/url";
import CODE from "@/constants/code";
import { SERVER_URL } from "@/config";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_LAYOUT_HEADER_I18N_KEYS,
  CMMN_LAYOUT_HEADER_I18N_FALLBACK,
  replaceI18nPlaceholders as replaceLayoutHeaderI18nPlaceholders,
} from "@/components/cmmnLayoutChromeI18n";
import { getLanguageCodeForApi } from "@/utils/language";

import logoImg from "/assets/images/logo.png";
import logoImgMobile from "/assets/images/logo_m.svg";
import { getSessionItem, setSessionItem } from "@/utils/storage";

type ThemeKey = "light" | "dark" | "night" | "system";

/** 헤더: 게시판 포털(책/목록 형태) */
function HeaderBoardPortalIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="8" y1="15" x2="12" y2="15" />
    </svg>
  );
}

/** 헤더: 2×2 그리드(위젯/대시보드 진입) 아이콘 */
function HeaderGridMenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/** 탑 영역 프로필: 검은 원 + 흰 실루엣 (기본 아바타 스타일) */
function HeaderUserSilhouetteIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

const USER_MANAGE_API = "/cmmnUserManage";

function headerProfileImageHref(fileSq: string | null | undefined): string | null {
  if (fileSq == null || String(fileSq).trim() === "") return null;
  return `${SERVER_URL}/bbs/main/profile/file?fileSq=${encodeURIComponent(String(fileSq).trim())}`;
}

function Header() {
  console.group("Header");
  console.log("[Start] Header ------------------------------");

  const sessionUser = getSessionItem("loginUser");
  const sessionUserId = sessionUser?.id;
  const sessionUserName = sessionUser?.name;
  const sessionUserSe = sessionUser?.userSe;

  const navigate = useNavigate();
  const location = useLocation();
  const headerCmpnyCd = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const layoutHeaderI18n = useCmmnScreenI18n(CMMN_LAYOUT_HEADER_I18N_KEYS, CMMN_LAYOUT_HEADER_I18N_FALLBACK, {
    cmpnyCd: headerCmpnyCd,
  });
  const { langGb, setLangGb } = useLanguage();
  const [langOptions, setLangOptions] = useState<Array<{ code: string; name: string }>>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeKey>("light");
  const [headerProfileFileSq, setHeaderProfileFileSq] = useState<string | null>(null);
  const [headerProfileImgFailed, setHeaderProfileImgFailed] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const loadHeaderProfile = useCallback(() => {
    if (!sessionUserId) {
      setHeaderProfileFileSq(null);
      setHeaderProfileImgFailed(false);
      return;
    }
    const langCode = getLanguageCodeForApi(langGb);
    const saved = getSessionItem("selectedCmpnyCd");
    const pref = saved != null && String(saved).trim() !== "" ? String(saved).trim() : "";
    const qs = new URLSearchParams({ langCode });
    if (pref) qs.set("companyCode", pref);
    EgovNet.requestFetch(
      `${USER_MANAGE_API}/myProfile?${qs.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (Number(resp?.resultCode) !== Number(CODE.RCV_SUCCESS)) {
          setHeaderProfileFileSq(null);
          return;
        }
        const u = resp?.result?.user;
        const sq =
          u?.profileFileSq != null && String(u.profileFileSq).trim() !== ""
            ? String(u.profileFileSq).trim()
            : null;
        setHeaderProfileFileSq(sq);
        setHeaderProfileImgFailed(false);
      },
      () => setHeaderProfileFileSq(null)
    );
  }, [sessionUserId, langGb]);

  useEffect(() => {
    loadHeaderProfile();
  }, [loadHeaderProfile]);

  useEffect(() => {
    const onCompanyChanged = () => loadHeaderProfile();
    window.addEventListener("app:companyChanged", onCompanyChanged);
    return () => window.removeEventListener("app:companyChanged", onCompanyChanged);
  }, [loadHeaderProfile]);

  useEffect(() => {
    const onProfileUpdated = () => loadHeaderProfile();
    window.addEventListener("app:profileUpdated", onProfileUpdated);
    return () => window.removeEventListener("app:profileUpdated", onProfileUpdated);
  }, [loadHeaderProfile]);

  // 클릭 외부 시 사용자 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  // 언어 목록 조회 (CmmnMessage selectLanguages 단일 소스, 회사코드=세션 값)
  const retrieveLangOptions = useCallback((paramLangGb) => {
    const fbKo = { code: "ko_KR", name: layoutHeaderI18n.langFallbackKoKr };
    const fbEn = { code: "en_US", name: layoutHeaderI18n.langFallbackEnUs };
    const cmpnyCd = (typeof getSessionItem === "function" && getSessionItem("selectedCmpnyCd")) || "";
    const langCodeParam = paramLangGb || "ko_KR";
    const params = new URLSearchParams({ langCode: langCodeParam });
    if (String(cmpnyCd).trim()) params.append("cmpnyCd", String(cmpnyCd).trim());
    const retrieveListURL = `/cmmnMessage/languages?${params.toString()}`;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        const raw = ok && Array.isArray(resp.result) ? resp.result : [];
        const normalized = raw
          .map((row: { code?: string; name?: string; detailCodeId?: string; messageCn?: string }) => ({
            code: String(row?.code ?? row?.detailCodeId ?? "").trim(),
            name: String(row?.name ?? row?.messageCn ?? row?.code ?? "").trim(),
          }))
          .filter((row: { code: string }) => row.code);
        if (normalized.length > 0) {
          setLangOptions(normalized);
        } else {
          /* 회사 미선택·DB 미등록 시에도 셀렉트가 비지 않도록 */
          setLangOptions([fbKo, fbEn]);
        }
      },
      function (resp) {
        console.log("err response : ", resp);
        setLangOptions([fbKo, fbEn]);
      }
    );
  }, [layoutHeaderI18n.langFallbackKoKr, layoutHeaderI18n.langFallbackEnUs]);

  useEffect(() => {
    // 초기 조회: ko_KR 사용
    retrieveLangOptions("ko_KR");
  }, [retrieveLangOptions]);

  // 회사 변경 시 상단 언어 목록 재조회 (다국어관리·공통코드관리 등에서 회사 선택 시)
  useEffect(() => {
    const onCompanyChanged = () => retrieveLangOptions(langGb);
    window.addEventListener("app:companyChanged", onCompanyChanged);
    return () => window.removeEventListener("app:companyChanged", onCompanyChanged);
  }, [langGb, retrieveLangOptions]);

  // 언어 변경 핸들러
  const handleLanguageChange = (e) => {
    const newLangGb = e.target.value;
    setLangGb(newLangGb);
    // 언어 목록 재조회 (선택된 언어 값으로)
    retrieveLangOptions(newLangGb);
  };

  const logInHandler = useCallback(() => {
    navigate(URL.LOGIN);
    document.querySelector(".all_menu.WEB")?.classList.add("closed");
    document.querySelector(".btnAllMenu")?.classList.remove("active");
    const btnAllMenu = document.querySelector(".btnAllMenu");
    if (btnAllMenu) (btnAllMenu as HTMLElement).title = layoutHeaderI18n.etcAllMenuClosedTitle;
    document.querySelector(".all_menu.Mobile")?.classList.add("closed");
  }, [navigate, layoutHeaderI18n.etcAllMenuClosedTitle]);
  const inBbsUser = location.pathname.startsWith(URL.MAIN_BBS);

  const headerProfileImgUrl = headerProfileImageHref(headerProfileFileSq);
  const showHeaderProfilePhoto = Boolean(headerProfileImgUrl && !headerProfileImgFailed);

  const toggleBbsUser = () => {
    if (!sessionUserId) {
      navigate(URL.LOGIN);
      return;
    }
    if (inBbsUser) {
      const ret = sessionStorage.getItem("bbsUserReturnPath") || URL.MAIN;
      sessionStorage.removeItem("bbsUserReturnPath");
      navigate(ret);
      return;
    }
    sessionStorage.setItem("bbsUserReturnPath", `${location.pathname}${location.search}`);
    navigate(URL.MAIN_BBS);
  };

  const logOutHandler = useCallback(() => {
    const logOutUrl = "/auth/logout";
    const requestOptions = {
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include" as RequestCredentials,
    };
    EgovNet.requestFetch(logOutUrl, requestOptions, function (resp) {
      console.log("===>>> logout resp= ", resp);
      if (parseInt(resp.resultCode) === parseInt(CODE.RCV_SUCCESS)) {
        setSessionItem("loginUser", { id: "" });
        setSessionItem("jToken", null);
        window.alert(layoutHeaderI18n.msgLogoutSuccess);
        navigate(URL.MAIN);
        document.querySelector(".all_menu.WEB")?.classList.add("closed");
        document.querySelector(".btnAllMenu")?.classList.remove("active");
        const btnAllMenu = document.querySelector(".btnAllMenu");
        if (btnAllMenu) (btnAllMenu as HTMLElement).title = layoutHeaderI18n.etcAllMenuClosedTitle;
        document.querySelector(".all_menu.Mobile")?.classList.add("closed");
      }
    });
  }, [navigate, layoutHeaderI18n.msgLogoutSuccess, layoutHeaderI18n.etcAllMenuClosedTitle]);

  console.log("------------------------------Header [End]");
  console.groupEnd();

  return (
    // <!-- header -->
    <div>

      <header className="global-header">
        <Link className="header-logo" to={URL.MAIN}>
          <img src={logoImg} alt={layoutHeaderI18n.altPortalLogo} className="logo-img" />
          <span>Techvalley</span>
        </Link>
        <nav className="header-nav" id="headerNav">
          <a className="h-nav-link active" href="#">Overview</a>
          <a className="h-nav-link" href="#">Tickets</a>
          <a className="h-nav-link" href="#">Clients</a>
          <a className="h-nav-link" href="#">Agents</a>
          <a className="h-nav-link" href="#">Knowledge</a>
          <a className="h-nav-link" href="#">Analytics</a>
          <a className="h-nav-link" href="#">Settings</a>
        </nav>

        {/* 상단 메뉴(gnb) 제거 - 좌측 사이드바로 이동 */}
        <div className="user_info">
          {sessionUserId ? (
            <div className="header-user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="header-apps-grid-btn"
                title={layoutHeaderI18n.titleOpenDashboardConfig}
                aria-label={layoutHeaderI18n.ariaOpenDashboardConfig}
                onClick={() => navigate(URL.MAIN, { state: { openDashboardConfig: true } })}
              >
                <i className="ph ph-squares-four"></i>
              </button>
              <button
                type="button"
                className={`header-apps-grid-btn header-bbs-user-btn ${inBbsUser ? "is-active" : ""}`}
                title={inBbsUser ? layoutHeaderI18n.titleGeneralMenuSwitch : layoutHeaderI18n.titleBoardMenuSwitch}
                aria-label={
                  inBbsUser ? layoutHeaderI18n.ariaGeneralMenuSwitch : layoutHeaderI18n.ariaBoardMenuSwitch
                }
                aria-pressed={inBbsUser}
                onClick={toggleBbsUser}
              >
                <HeaderBoardPortalIcon size={20} />
              </button>
              <button
                type="button"
                className="header-user-avatar"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                title={layoutHeaderI18n.ariaAccountMenu}
              >
                {showHeaderProfilePhoto && headerProfileImgUrl ? (
                  <img
                    className="header-user-avatar__photo"
                    src={headerProfileImgUrl}
                    alt=""
                    width={34}
                    onError={() => setHeaderProfileImgFailed(true)}
                  />
                ) : (
                  <span className="header-user-avatar__icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="header-user-popover">
                  <div className="header-user-popover__top">
                    <span className="header-user-popover__top-icon" aria-hidden>
                      {showHeaderProfilePhoto && headerProfileImgUrl ? (
                        <img
                          className="header-user-popover__top-photo"
                          src={headerProfileImgUrl}
                          alt=""
                          width={32}
                          height={32}
                          onError={() => setHeaderProfileImgFailed(true)}
                        />
                      ) : (
                        <HeaderUserSilhouetteIcon size={18} />
                      )}
                    </span>
                    <span className="header-user-popover__top-text">
                      {replaceLayoutHeaderI18nPlaceholders(layoutHeaderI18n.msgLoginInfo, {
                        name: sessionUserName ?? "",
                        userSe: sessionUserSe ?? "",
                      })}
                    </span>
                    <button
                      type="button"
                      className="header-user-popover__close"
                      onClick={() => setUserMenuOpen(false)}
                      aria-label={layoutHeaderI18n.ariaCloseUserMenu}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="header-user-popover__body">
                    <div className="header-user-popover__col">
                      <h3 className="header-user-popover__title">{layoutHeaderI18n.labelAccountSection}</h3>
                      <NavLink
                        to={URL.MYPAGE_MODIFY}
                        className="header-user-popover__item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="header-user-popover__item-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        {layoutHeaderI18n.btnMyProfile}
                      </NavLink>
                      <Link
                        to={URL.SYSTEM_USER_PASSWORD}
                        className="header-user-popover__item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="header-user-popover__item-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </span>
                        {layoutHeaderI18n.btnPassword}
                      </Link>
                      <button type="button" className="header-user-popover__item" onClick={() => { setUserMenuOpen(false); logOutHandler(); }}>
                        <span className="header-user-popover__item-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                        </span>
                        {layoutHeaderI18n.btnLogout}
                      </button>
                    </div>
                    <div className="header-user-popover__col">
                      <h3 className="header-user-popover__title">{layoutHeaderI18n.labelThemeChange}</h3>
                      {(["light", "dark", "night", "system"] as const).map((key) => (
                        <button
                          key={key}
                          type="button"
                          className={`header-user-popover__item ${theme === key ? "is-active" : ""}`}
                          onClick={() => setTheme(key)}
                        >
                          <span className="header-user-popover__item-icon">
                            {key === "light" && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                              </svg>
                            )}
                            {key === "dark" && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                              </svg>
                            )}
                            {key === "night" && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            )}
                            {key === "system" && (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                              </svg>
                            )}
                          </span>
                          {key === "light" && layoutHeaderI18n.themeLight}
                          {key === "dark" && layoutHeaderI18n.themeDark}
                          {key === "night" && layoutHeaderI18n.themeNight}
                          {key === "system" && layoutHeaderI18n.themeSystem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 언어 선택은 팝업 외부에 유지 */}
              <label className="f_select header_lang_select" htmlFor="headerLangSelect">
                <select id="headerLangSelect" value={langGb} onChange={handleLanguageChange}>
                  {langOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <>
              <button onClick={logInHandler} className="btn login">
                {layoutHeaderI18n.btnLogin}
              </button>
              <label className="f_select header_lang_select" htmlFor="headerLangSelect">
                <select id="headerLangSelect" value={langGb} onChange={handleLanguageChange}>
                  {langOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
        {/* <!--// PC web에서 보여지는 영역 --> */}
        {/* 전체메뉴 버튼 제거 - 좌측 사이드바로 이동 */}
      </header>


    </div>
  );
}

export default Header;
