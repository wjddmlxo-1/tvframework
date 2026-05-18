const URL = {
  //COMMON
  MAIN: "/tvframework", //메인페이지

  LOGIN: "/tvframework/login", //로그인
  SNS_NAVER_CB: "/tvframework/login/naver/callback",
  SNS_KAKAO_CB: "/tvframework/login/kakao/callback",
  ERROR: "/tvframework/error", //에러

  //SYSTEM
  SYSTEM: "/tvframework/system", // 시스템관리
  SYSTEM_CODE: "/tvframework/system/code", // 시스템관리/공통코드관리
  SYSTEM_CODE_DETAIL: "/tvframework/system/code/detail", // 시스템관리/공통코드관리/상세
  SYSTEM_PROGRAM: "/tvframework/system/program", // 시스템관리/프로그램관리
  SYSTEM_PROGRAM_DETAIL: "/tvframework/system/program/detail", // 시스템관리/프로그램관리/상세
  SYSTEM_PROGRAM_CREATE: "/tvframework/system/program/create", // 시스템관리/프로그램관리/등록
  SYSTEM_PROGRAM_MODIFY: "/tvframework/system/program/modify", // 시스템관리/프로그램관리/수정
  SYSTEM_MESSAGE: "/tvframework/system/message", // 시스템관리/다국어관리
  SYSTEM_MESSAGE_DETAIL: "/tvframework/system/message/detail", // 시스템관리/다국어관리/상세
  SYSTEM_MESSAGE_CREATE: "/tvframework/system/message/create", // 시스템관리/다국어관리/등록
  SYSTEM_MESSAGE_MODIFY: "/tvframework/system/message/modify", // 시스템관리/다국어관리/수정
  SYSTEM_MESSAGE_REPLY: "/tvframework/system/message/reply", // 시스템관리/다국어관리/답글

  SYSTEM_COMPANY: "/tvframework/system/company", // 시스템관리/회사정보관리
  SYSTEM_COMPANY_DETAIL: "/tvframework/system/company/detail", // 회사정보관리 상세
  SYSTEM_COMPANY_CREATE: "/tvframework/system/company/create", // 회사정보관리 등록
  SYSTEM_COMPANY_MODIFY: "/tvframework/system/company/modify", // 회사정보관리 수정

  SYSTEM_USER: "/tvframework/system/user/", // 시스템관리/사용자관리 목록
  SYSTEM_USER_DETAIL: "/tvframework/system/user/detail", // 시스템관리/사용자관리 상세
  SYSTEM_USER_PASSWORD: "/tvframework/system/user/password", // 시스템관리/사용자 암호변경

  SYSTEM_WEEKLY: "/tvframework/system/weekly", // 시스템관리/금주의행사
  SYSTEM_WEEKLY_DETAIL: "/tvframework/system/weekly/detail",

  SYSTEM_GALLERY: "/tvframework/system/gallery", // 시스템관리/사이트갤러리 (메인 링크 등)

  SYSTEM_MENU: "/tvframework/system/menu",
  SYSTEM_GROUP: "/tvframework/system/group",
  SYSTEM_GROUP_CREATE: "/tvframework/system/group/create",
  SYSTEM_GROUP_DETAIL: "/tvframework/system/group/detail",
  SYSTEM_AUTHOR: "/tvframework/system/author",
  SYSTEM_AUTHOR_CREATE: "/tvframework/system/author/create",
  SYSTEM_AUTHOR_DETAIL: "/tvframework/system/author/detail",

  // SITES (사이트관리)
  SITES: "/tvframework/sites",
  SITES_WIDGETDATASET: "/tvframework/sites/widgetdataset",
  SITES_WIDGETDATASET_DETAIL: "/tvframework/sites/widgetdataset/detail",
  SITES_WIDGETDATASET_CREATE: "/tvframework/sites/widgetdataset/create",
  SITES_WIDGETDATASET_MODIFY: "/tvframework/sites/widgetdataset/modify",
  SITES_WIDGETSTYLE: "/tvframework/sites/widgetstyle",
  SITES_WIDGETSTYLE_DETAIL: "/tvframework/sites/widgetstyle/detail",
  SITES_WIDGETSTYLE_CREATE: "/tvframework/sites/widgetstyle/create",
  SITES_WIDGETSTYLE_MODIFY: "/tvframework/sites/widgetstyle/modify",
  SITES_WIDGET: "/tvframework/sites/widget",
  SITES_WIDGET_DETAIL: "/tvframework/sites/widget/detail",
  SITES_WIDGET_CREATE: "/tvframework/sites/widget/create",
  SITES_WIDGET_MODIFY: "/tvframework/sites/widget/modify",
  SITES_BBS: "/tvframework/sites/bbs",
  SITES_BBS_DETAIL: "/tvframework/sites/bbs/detail",
  SITES_BBS_CREATE: "/tvframework/sites/bbs/create",
  SITES_BBS_MODIFY: "/tvframework/sites/bbs/modify",

  /** 사용자 게시판 */
  MAIN_BBS: "/tvframework/main/bbs",
  MAIN_BBS_WRITE: "/tvframework/main/bbs/write",

  //MYPAGE
  MYPAGE_MODIFY: "/mypage/modify", // 마이페이지/회원 수정
  MYPAGE_CREATE: "/mypage/create", // 마이페이지/회원 등록
};

 
export default URL;

