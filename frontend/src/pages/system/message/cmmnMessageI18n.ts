/**
 * 다국어입력_result.md — 다국어관리 (`CmmnMessageList`, `CmmnMessageEdit`, `CmmnMessageDetail`)
 * CM_MESSAGE_LANG LANG_KEY 목록과 한글 폴백.
 */

export const I18N_KEYS = {
  pageTitle: "title.sysmanage.i18nManage",
  titleI18nSearch: "title.sysmanage.i18nManage.i18nSearch",
  titleI18nCreate: "title.sysmanage.i18nManage.i18nCreate",
  titleI18nDetail: "title.sysmanage.i18nManage.i18nDetail",
  navSystem: "label.sysmanage.i18nManage.system",
  navHome: "menu.root",
  labelLangCode: "label.sysmanage.i18nManage.langCode",
  labelMessage: "label.sysmanage.i18nManage.message",
  labelLanguage: "label.sysmanage.i18nManage.language",
  placeholderSearchCondition: "placeholder.sysmanage.i18nManage.searchCondition",
  searchPlaceholder: "placeholder.sysmanage.i18nManage.enterLanguageKey",
  enterLangMessage: "placeholder.sysmanage.i18nManage.enterLangMessage",
  msgErrorOnRetrieve: "message.sysmanage.i18nManage.errorOnRetrieve",
  msgSelectItemToDelete: "message.sysmanage.i18nManage.selectItemToDelete",
  msgConfirmDelete: "message.sysmanage.i18nManage.confirmDelete",
  msgDeleted: "message.sysmanage.i18nManage.deleted",
  msgErrorOnDelete: "message.sysmanage.i18nManage.errorOnDelete",
  msgUploaded: "message.sysmanage.i18nManage.uploaded",
  msgErrorOnUpload: "message.sysmanage.i18nManage.errorOnUpload",
  msgNoDataToDownload: "message.sysmanage.i18nManage.noDataToDownload",
  msgFailLoadLangList: "message.sysmanage.i18nManage.failLoadLangList",
  msgNoSearchResult: "message.sysmanage.i18nManage.noSearchResult",
  msgRequiredCategory: "message.sysmanage.i18nManage.requiredCategory",
  msgRequiredLangKey: "message.sysmanage.i18nManage.requiredLangKey",
  msgRegistered: "message.sysmanage.i18nManage.registered",
  msgUpdated: "message.sysmanage.i18nManage.updated",
  msgErrorOnSave: "message.sysmanage.i18nManage.errorOnSave",
  btnExcel: "button.sysmanage.i18nManage.excelDownload",
  btnAdd: "button.sysmanage.i18nManage.add",
  btnDelete: "button.sysmanage.i18nManage.delete",
  btnSearch: "button.sysmanage.i18nManage.search",
  btnSave: "button.sysmanage.i18nManage.save",
  btnClose: "button.sysmanage.i18nManage.close",
  etcMultiLangSearch: "etc.sysmanage.i18nSearch.multiLangSearch",
  etcMultiLangAdd: "etc.sysmanage.i18nSearch.multiLangAdd",
  etcDetailEdit: "etc.sysmanage.i18nSearch.detailEdit",
  etcSelectPlaceholder: "etc.sysmanage.i18nSearch.selectPlaceholder",
  allCategory: "etc.sysmanage.i18nSearch.all",
  colSelectAll: "etc.sysmanage.i18nSearch.allSelect",
  excelFileNamePattern: "etc.sysmanage.i18nSearch.fileName",
  colNo: "label.sysmanage.i18nManage.no",
  colCategory: "label.sysmanage.i18nManage.type",
  colLangKey: "label.sysmanage.i18nManage.langKey",
} as const;

export type CmmnMessageI18nText = Record<keyof typeof I18N_KEYS, string>;

/** API 실패·로딩 전 UI 폴백 (한글) */
export const CMMN_MESSAGE_I18N_FALLBACK: CmmnMessageI18nText = {
  pageTitle: "다국어관리",
  titleI18nSearch: "다국어 조회",
  titleI18nCreate: "다국어 추가",
  titleI18nDetail: "다국어 상세조회/수정",
  navSystem: "시스템관리",
  navHome: "Home",
  labelLangCode: "언어코드",
  labelMessage: "메시지",
  labelLanguage: "언어",
  placeholderSearchCondition: "검색 조건",
  searchPlaceholder: "언어 Key를 입력하세요",
  enterLangMessage: "{langName} 메시지 입력",
  msgErrorOnRetrieve: "조회 중 오류가 발생했습니다.",
  msgSelectItemToDelete: "삭제할 항목을 선택해주세요.",
  msgConfirmDelete: "선택한 항목을 삭제하시겠습니까?",
  msgDeleted: "삭제되었습니다.",
  msgErrorOnDelete: "삭제 중 오류가 발생했습니다.",
  msgUploaded: "업로드되었습니다.",
  msgErrorOnUpload: "업로드 중 오류가 발생했습니다.",
  msgNoDataToDownload: "다운로드할 데이터가 없습니다.",
  msgFailLoadLangList: "언어 목록을 불러올 수 없습니다.",
  msgNoSearchResult: "검색된 결과가 없습니다.",
  msgRequiredCategory: "구분은 필수 입력 항목입니다.",
  msgRequiredLangKey: "언어 Key는 필수 입력 항목입니다.",
  msgRegistered: "등록되었습니다.",
  msgUpdated: "수정되었습니다.",
  msgErrorOnSave: "저장 중 오류가 발생했습니다.",
  btnExcel: "엑셀 다운로드",
  btnAdd: "추가",
  btnDelete: "삭제",
  btnSearch: "조회",
  btnSave: "저장",
  btnClose: "닫기",
  etcMultiLangSearch: "다국어 조회",
  etcMultiLangAdd: "다국어 추가",
  etcDetailEdit: "상세조회/수정",
  etcSelectPlaceholder: "선택하세요",
  allCategory: "전체",
  colSelectAll: "전체 선택",
  excelFileNamePattern: "다국어관리_{date}_{time}.xlsx",
  colNo: "번호",
  colCategory: "구분",
  colLangKey: "언어 Key",
};

/** etc.sysmanage.i18nSearch.fileName — `{date}`, `{time}` 자리 치환 */
export function formatExcelFileName(template: string | undefined, dateStr: string, timeStr: string): string {
  const t = (template ?? "").trim();
  if (t.includes("{date}") || t.includes("{time}")) {
    return t.replace(/\{date\}/g, dateStr).replace(/\{time\}/g, timeStr);
  }
  if (t.toLowerCase().endsWith(".xlsx")) {
    return t;
  }
  return `다국어관리_${dateStr}_${timeStr}.xlsx`;
}
