export const CMMN_COMPONENT_I18N_KEYS = {
  titleI18nSearch: "title.sysmanage.i18nSearch",
  titlePopupNotice: "title.sysmanage.i18nSearch.popupNotice",
  titleDeptSearch: "title.sysmanage.i18nSearch.deptSearch",

  labelNo: "label.sysmanage.i18nSearch.no",
  labelType: "label.sysmanage.i18nSearch.type",
  labelLangKey: "label.sysmanage.i18nSearch.langKey",
  labelAuthor: "label.sysmanage.i18nSearch.author",
  labelCreatedDate: "label.sysmanage.i18nSearch.createdDate",
  labelAttachment: "label.sysmanage.i18nSearch.attachment",

  placeholderSearchLangKeyMulti: "placeholder.sysmanage.i18nSearch.searchLangKeyMulti",
  placeholderSelectMultilingual: "placeholder.sysmanage.i18nSearch.selectMultilingual",

  msgNoSearchResult: "message.sysmanage.i18nSearch.noSearchResult",
  msgNoDepartmentFound: "message.sysmanage.i18nSearch.no_department_found",
  msgSelectCompanyForDeptTree: "message.sysmanage.i18nSearch.select_company_for_dept_tree",
  msgUrlCopied: "message.sysmanage.i18nSearch.url_copied",
  msgFileDeleted: "message.sysmanage.i18nSearch.file_deleted",
  msgFileLimitTotal: "message.sysmanage.i18nSearch.file_limit_total",
  msgFileUploadLimit: "message.sysmanage.i18nSearch.file_upload_limit",
  msgFileUploadRemain: "message.sysmanage.i18nSearch.file_upload_remain",
  msgUnknownError: "message.sysmanage.i18nSearch.unknown_error",

  btnSearch: "button.sysmanage.i18nSearch.search",
  btnClose: "button.sysmanage.i18nSearch.close",
  btnPrevPage: "button.sysmanage.i18nSearch.prevPage",
  btnFirst: "button.sysmanage.i18nSearch.first",
  btnPrev: "button.sysmanage.i18nSearch.prev",
  btnNext: "button.sysmanage.i18nSearch.next",

  etcByte: "etc.sysmanage.i18nSearch.byte",
  etcErrorTitle: "etc.sysmanage.i18nSearch.error",
  etcCloseSymbol: "etc.sysmanage.i18nSearch.close",
  etcAll: "etc.sysmanage.i18nSearch.all",

  msgLoadingInline: "message.sysmanage.i18nSearch.loading_inline",
  msgUntitled: "message.sysmanage.i18nSearch.untitled",
  labelRecommend: "label.sysmanage.i18nSearch.recommend",
  labelDisrecommend: "label.sysmanage.i18nSearch.disrecommend",
  labelFavorite: "label.sysmanage.i18nSearch.favorite",
  btnShare: "button.sysmanage.i18nSearch.share",
  btnNeverShow: "button.sysmanage.i18nSearch.neverShow",
  btnHideToday: "button.sysmanage.i18nSearch.hideToday",
} as const;

export type CmmnComponentI18nText = Record<keyof typeof CMMN_COMPONENT_I18N_KEYS, string>;

export const CMMN_COMPONENT_I18N_FALLBACK: CmmnComponentI18nText = {
  titleI18nSearch: "다국어 조회",
  titlePopupNotice: "팝업공지",
  titleDeptSearch: "부서 검색",

  labelNo: "번호",
  labelType: "구분",
  labelLangKey: "언어 Key",
  labelAuthor: "작성자",
  labelCreatedDate: "작성일자",
  labelAttachment: "첨부파일",

  placeholderSearchLangKeyMulti: "언어 Key/다국어 검색",
  placeholderSelectMultilingual: "다국어를 조회해 선택하세요",

  msgNoSearchResult: "검색된 결과가 없습니다.",
  msgNoDepartmentFound: "조회된 부서가 없습니다.",
  msgSelectCompanyForDeptTree: "회사를 선택한 뒤 부서 트리가 조회됩니다.",
  msgUrlCopied: "URL이 클립보드에 복사되었습니다.",
  msgFileDeleted: "첨부파일이 삭제되었습니다.",
  msgFileLimitTotal: "총 첨부파일 개수는 {n} 까지 입니다.",
  msgFileUploadLimit: "총 업로드 가능한 첨부파일 개수는 {n} 개 입니다.",
  msgFileUploadRemain: "현재 업로드 가능한 첨부파일 개수는 {remain} 개 입니다.",
  msgUnknownError: "알 수 없는 에러가 발생했습니다.",

  btnSearch: "조회",
  btnClose: "닫기",
  btnPrevPage: "이전페이지",
  btnFirst: "처음",
  btnPrev: "이전",
  btnNext: "다음",

  etcByte: "byte",
  etcErrorTitle: "Error",
  etcCloseSymbol: "×",
  etcAll: "전체",

  msgLoadingInline: "불러오는 중…",
  msgUntitled: "(제목 없음)",
  labelRecommend: "추천",
  labelDisrecommend: "비추천",
  labelFavorite: "즐겨찾기",
  btnShare: "공유",
  btnNeverShow: "다시 보지 않기",
  btnHideToday: "오늘 하루 보지 않기",
};

export function replacePlaceholders(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)), template);
}
