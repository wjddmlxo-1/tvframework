/**
 * 공통 레이아웃 크롬 문자열 (`Header`, `LeftSidebar`, `Footer`)
 * 다국어관리와 동일: `I18N_KEYS` + 폴백 + `/cmmnMessage/texts` (`useCmmnScreenI18n`)
 */

export const CMMN_LAYOUT_CHROME_I18N_KEYS = {
  // —— Header —
  titleOpenDashboardConfig: "title.sysmanage.myHome.openConfig",
  ariaOpenDashboardConfig: "aria.sysmanage.myHome.openConfigToolbar",
  altPortalLogo: "title.layout.portalBrand",
  labelAccountSection: "label.layout.account",
  labelThemeChange: "label.layout.themeChange",
  msgLogoutSuccess: "message.sysmanage.account.logout_success",
  msgLoginInfo: "message.sysmanage.account.login_info",
  btnLogin: "button.sysmanage.account.login",
  btnLogout: "button.sysmanage.account.logout",
  btnMyProfile: "button.sysmanage.account.myProfile",
  btnPassword: "button.sysmanage.account.password",
  themeLight: "button.sysmanage.account.light",
  themeDark: "button.sysmanage.account.dark",
  themeNight: "button.sysmanage.account.night",
  themeSystem: "button.sysmanage.account.systemDefault",
  etcAllMenuClosedTitle: "etc.sysmanage.layout.allMenuClosedTitle",
  titleBoardMenuSwitch: "etc.sysmanage.layout.boardMenuToggleToBoardTitle",
  titleGeneralMenuSwitch: "etc.sysmanage.layout.boardMenuToggleToGeneralTitle",
  ariaBoardMenuSwitch: "aria.sysmanage.layout.boardMenuToggleToBoard",
  ariaGeneralMenuSwitch: "aria.sysmanage.layout.boardMenuToggleToGeneral",
  ariaAccountMenu: "aria.sysmanage.layout.accountMenu",
  ariaCloseUserMenu: "aria.sysmanage.layout.closeUserPopover",
  langFallbackKoKr: "etc.sysmanage.layout.langOptionKoKr",
  langFallbackEnUs: "etc.sysmanage.layout.langOptionEnUs",

  // —— LeftSidebar —
  msgSidebarLoginRequired: "message.sysmanage.layout.sidebarLoginRequired",
  msgSidebarCompanyRequired: "message.sysmanage.layout.sidebarCompanyRequired",
  msgSidebarNoMenu: "message.sysmanage.layout.sidebarNoMenu",
  ariaSidebarExpand: "aria.sysmanage.layout.sidebarExpandMenu",
  ariaSidebarCollapse: "aria.sysmanage.layout.sidebarCollapseMenu",

  // —— Footer —
  labelContactEmail: "label.layout.contactEmail",
  labelContactPhone: "label.layout.contactPhone",
  footerCopyright: "etc.sysmanage.layout.footerCopyright",
} as const;

export type CmmnLayoutChromeI18nText = Record<keyof typeof CMMN_LAYOUT_CHROME_I18N_KEYS, string>;

export const CMMN_LAYOUT_CHROME_I18N_FALLBACK: CmmnLayoutChromeI18nText = {
  titleOpenDashboardConfig: "홈 화면 구성",
  ariaOpenDashboardConfig: "홈 화면 구성 열기",
  altPortalLogo: "사내업무포털",
  labelAccountSection: "계정",
  labelThemeChange: "테마 변경",
  msgLogoutSuccess: "로그아웃되었습니다!",
  msgLoginInfo: "{name} 님이, {userSe}로 로그인",
  btnLogin: "로그인",
  btnLogout: "로그아웃",
  btnMyProfile: "내 프로필",
  btnPassword: "비밀번호",
  themeLight: "라이트",
  themeDark: "다크",
  themeNight: "야간",
  themeSystem: "시스템 기본값",
  etcAllMenuClosedTitle: "전체메뉴 닫힘",
  titleBoardMenuSwitch: "게시판 메뉴로 전환",
  titleGeneralMenuSwitch: "일반 메뉴로 전환",
  ariaBoardMenuSwitch: "게시판 메뉴로 전환",
  ariaGeneralMenuSwitch: "일반 메뉴로 전환",
  ariaAccountMenu: "계정 메뉴",
  ariaCloseUserMenu: "메뉴 닫기",
  langFallbackKoKr: "한국어 (ko_KR)",
  langFallbackEnUs: "English (en_US)",

  msgSidebarLoginRequired: "로그인 후 메뉴가 표시됩니다.",
  msgSidebarCompanyRequired: "회사를 선택하면 메뉴가 표시됩니다.",
  msgSidebarNoMenu: "표시할 메뉴가 없습니다. 권한·메뉴 설정을 확인하세요.",
  ariaSidebarExpand: "메뉴 펼치기",
  ariaSidebarCollapse: "메뉴 접기",

  labelContactEmail: "대표문의메일",
  labelContactPhone: "대표전화",
  footerCopyright: "Copyright © 2014 Tech Valley System. All Rights Reserved.",
};

/** @deprecated `CMMN_LAYOUT_CHROME_I18N_KEYS` 헤더 전체와 동일 */
export const CMMN_LAYOUT_HEADER_I18N_KEYS = {
  titleOpenDashboardConfig: CMMN_LAYOUT_CHROME_I18N_KEYS.titleOpenDashboardConfig,
  ariaOpenDashboardConfig: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaOpenDashboardConfig,
  altPortalLogo: CMMN_LAYOUT_CHROME_I18N_KEYS.altPortalLogo,
  labelAccountSection: CMMN_LAYOUT_CHROME_I18N_KEYS.labelAccountSection,
  labelThemeChange: CMMN_LAYOUT_CHROME_I18N_KEYS.labelThemeChange,
  msgLogoutSuccess: CMMN_LAYOUT_CHROME_I18N_KEYS.msgLogoutSuccess,
  msgLoginInfo: CMMN_LAYOUT_CHROME_I18N_KEYS.msgLoginInfo,
  btnLogin: CMMN_LAYOUT_CHROME_I18N_KEYS.btnLogin,
  btnLogout: CMMN_LAYOUT_CHROME_I18N_KEYS.btnLogout,
  btnMyProfile: CMMN_LAYOUT_CHROME_I18N_KEYS.btnMyProfile,
  btnPassword: CMMN_LAYOUT_CHROME_I18N_KEYS.btnPassword,
  themeLight: CMMN_LAYOUT_CHROME_I18N_KEYS.themeLight,
  themeDark: CMMN_LAYOUT_CHROME_I18N_KEYS.themeDark,
  themeNight: CMMN_LAYOUT_CHROME_I18N_KEYS.themeNight,
  themeSystem: CMMN_LAYOUT_CHROME_I18N_KEYS.themeSystem,
  etcAllMenuClosedTitle: CMMN_LAYOUT_CHROME_I18N_KEYS.etcAllMenuClosedTitle,
  titleBoardMenuSwitch: CMMN_LAYOUT_CHROME_I18N_KEYS.titleBoardMenuSwitch,
  titleGeneralMenuSwitch: CMMN_LAYOUT_CHROME_I18N_KEYS.titleGeneralMenuSwitch,
  ariaBoardMenuSwitch: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaBoardMenuSwitch,
  ariaGeneralMenuSwitch: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaGeneralMenuSwitch,
  ariaAccountMenu: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaAccountMenu,
  ariaCloseUserMenu: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaCloseUserMenu,
  langFallbackKoKr: CMMN_LAYOUT_CHROME_I18N_KEYS.langFallbackKoKr,
  langFallbackEnUs: CMMN_LAYOUT_CHROME_I18N_KEYS.langFallbackEnUs,
} as const;

export type CmmnLayoutHeaderI18nText = Record<keyof typeof CMMN_LAYOUT_HEADER_I18N_KEYS, string>;

export const CMMN_LAYOUT_HEADER_I18N_FALLBACK: CmmnLayoutHeaderI18nText = {
  titleOpenDashboardConfig: CMMN_LAYOUT_CHROME_I18N_FALLBACK.titleOpenDashboardConfig,
  ariaOpenDashboardConfig: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaOpenDashboardConfig,
  altPortalLogo: CMMN_LAYOUT_CHROME_I18N_FALLBACK.altPortalLogo,
  labelAccountSection: CMMN_LAYOUT_CHROME_I18N_FALLBACK.labelAccountSection,
  labelThemeChange: CMMN_LAYOUT_CHROME_I18N_FALLBACK.labelThemeChange,
  msgLogoutSuccess: CMMN_LAYOUT_CHROME_I18N_FALLBACK.msgLogoutSuccess,
  msgLoginInfo: CMMN_LAYOUT_CHROME_I18N_FALLBACK.msgLoginInfo,
  btnLogin: CMMN_LAYOUT_CHROME_I18N_FALLBACK.btnLogin,
  btnLogout: CMMN_LAYOUT_CHROME_I18N_FALLBACK.btnLogout,
  btnMyProfile: CMMN_LAYOUT_CHROME_I18N_FALLBACK.btnMyProfile,
  btnPassword: CMMN_LAYOUT_CHROME_I18N_FALLBACK.btnPassword,
  themeLight: CMMN_LAYOUT_CHROME_I18N_FALLBACK.themeLight,
  themeDark: CMMN_LAYOUT_CHROME_I18N_FALLBACK.themeDark,
  themeNight: CMMN_LAYOUT_CHROME_I18N_FALLBACK.themeNight,
  themeSystem: CMMN_LAYOUT_CHROME_I18N_FALLBACK.themeSystem,
  etcAllMenuClosedTitle: CMMN_LAYOUT_CHROME_I18N_FALLBACK.etcAllMenuClosedTitle,
  titleBoardMenuSwitch: CMMN_LAYOUT_CHROME_I18N_FALLBACK.titleBoardMenuSwitch,
  titleGeneralMenuSwitch: CMMN_LAYOUT_CHROME_I18N_FALLBACK.titleGeneralMenuSwitch,
  ariaBoardMenuSwitch: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaBoardMenuSwitch,
  ariaGeneralMenuSwitch: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaGeneralMenuSwitch,
  ariaAccountMenu: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaAccountMenu,
  ariaCloseUserMenu: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaCloseUserMenu,
  langFallbackKoKr: CMMN_LAYOUT_CHROME_I18N_FALLBACK.langFallbackKoKr,
  langFallbackEnUs: CMMN_LAYOUT_CHROME_I18N_FALLBACK.langFallbackEnUs,
};

export const CMMN_LAYOUT_SIDEBAR_I18N_KEYS = {
  msgSidebarLoginRequired: CMMN_LAYOUT_CHROME_I18N_KEYS.msgSidebarLoginRequired,
  msgSidebarCompanyRequired: CMMN_LAYOUT_CHROME_I18N_KEYS.msgSidebarCompanyRequired,
  msgSidebarNoMenu: CMMN_LAYOUT_CHROME_I18N_KEYS.msgSidebarNoMenu,
  ariaSidebarExpand: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaSidebarExpand,
  ariaSidebarCollapse: CMMN_LAYOUT_CHROME_I18N_KEYS.ariaSidebarCollapse,
} as const;

export type CmmnLayoutSidebarI18nText = Record<keyof typeof CMMN_LAYOUT_SIDEBAR_I18N_KEYS, string>;

export const CMMN_LAYOUT_SIDEBAR_I18N_FALLBACK: CmmnLayoutSidebarI18nText = {
  msgSidebarLoginRequired: CMMN_LAYOUT_CHROME_I18N_FALLBACK.msgSidebarLoginRequired,
  msgSidebarCompanyRequired: CMMN_LAYOUT_CHROME_I18N_FALLBACK.msgSidebarCompanyRequired,
  msgSidebarNoMenu: CMMN_LAYOUT_CHROME_I18N_FALLBACK.msgSidebarNoMenu,
  ariaSidebarExpand: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaSidebarExpand,
  ariaSidebarCollapse: CMMN_LAYOUT_CHROME_I18N_FALLBACK.ariaSidebarCollapse,
};

export const CMMN_LAYOUT_FOOTER_I18N_KEYS = {
  labelContactEmail: CMMN_LAYOUT_CHROME_I18N_KEYS.labelContactEmail,
  labelContactPhone: CMMN_LAYOUT_CHROME_I18N_KEYS.labelContactPhone,
  footerCopyright: CMMN_LAYOUT_CHROME_I18N_KEYS.footerCopyright,
} as const;

export type CmmnLayoutFooterI18nText = Record<keyof typeof CMMN_LAYOUT_FOOTER_I18N_KEYS, string>;

export const CMMN_LAYOUT_FOOTER_I18N_FALLBACK: CmmnLayoutFooterI18nText = {
  labelContactEmail: CMMN_LAYOUT_CHROME_I18N_FALLBACK.labelContactEmail,
  labelContactPhone: CMMN_LAYOUT_CHROME_I18N_FALLBACK.labelContactPhone,
  footerCopyright: CMMN_LAYOUT_CHROME_I18N_FALLBACK.footerCopyright,
};

export function replaceI18nPlaceholders(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)), template);
}
