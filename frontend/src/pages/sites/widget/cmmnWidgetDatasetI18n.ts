/**
 * 다국어입력_result.md — 위젯데이터셋관리 (`WidgetDataSetList`)
 * SQL/API 힌트·복사 접미사 등은 `etc.sysmanage.widgetDatasetManage.*` 로 확장.
 */
export const CMMN_WIDGET_DATASET_I18N_KEYS = {
  pageTitle: "title.sysmanage.widgetDatasetManage",
  titleDatasetList: "title.sysmanage.widgetDatasetManage.datasetList",
  titleDatasetInfo: "title.sysmanage.widgetDatasetManage.datasetInfo",
  titleDatasetPreview: "title.sysmanage.widgetDatasetManage.datasetPreview",

  navSiteManage: "label.sysmanage.widgetDatasetManage.siteManage",
  navHome: "menu.root",

  labelType: "label.sysmanage.widgetDatasetManage.type",
  labelDataName: "label.sysmanage.widgetDatasetManage.dataName",
  labelDataId: "label.sysmanage.widgetDatasetManage.dataId",
  labelDataType: "label.sysmanage.widgetDatasetManage.dataType",
  labelUseYn: "label.sysmanage.widgetDatasetManage.useYn",
  labelUpdateDate: "label.sysmanage.widgetDatasetManage.updateDate",

  placeholderSearchDataName: "placeholder.sysmanage.widgetDatasetManage.searchDataName",
  placeholderSelectOnlyQuery: "placeholder.sysmanage.widgetDatasetManage.selectOnlyQuery",
  placeholderConfigListJson: "placeholder.sysmanage.widgetDatasetManage.configListJson",
  placeholderConfigAuthReplace: "placeholder.sysmanage.widgetDatasetManage.configAuthReplace",
  placeholderApiConfigExample: "placeholder.sysmanage.widgetDatasetManage.apiConfigExample",
  placeholderItemsJsonExample: "placeholder.sysmanage.widgetDatasetManage.itemsJsonExample",

  msgErrorOnDetail: "message.sysmanage.widgetDatasetManage.errorOnDetail",
  msgSelectCompany: "message.sysmanage.widgetDatasetManage.selectCompany",
  msgFailGenerateId: "message.sysmanage.widgetDatasetManage.failGenerateId",
  msgInvalidConfigJson: "message.sysmanage.widgetDatasetManage.invalidConfigJson",
  msgInvalidSettingJson: "message.sysmanage.widgetDatasetManage.invalidSettingJson",
  msgNoDataNameToCopy: "message.sysmanage.widgetDatasetManage.noDataNameToCopy",
  msgDatasetNameLength: "message.sysmanage.widgetDatasetManage.datasetNameLength",
  msgSelectDataType: "message.sysmanage.widgetDatasetManage.selectDataType",
  msgDatasetIdLength: "message.sysmanage.widgetDatasetManage.datasetIdLength",
  msgSaved: "message.sysmanage.widgetDatasetManage.saved",
  msgUpdated: "message.sysmanage.widgetDatasetManage.updated",
  msgErrorOnSave: "message.sysmanage.widgetDatasetManage.errorOnSave",
  msgErrorOnUpdate: "message.sysmanage.widgetDatasetManage.errorOnUpdate",
  msgConfirmDeleteDataset: "message.sysmanage.widgetDatasetManage.confirmDeleteDataset",
  msgDeleted: "message.sysmanage.widgetDatasetManage.deleted",
  msgErrorOnDelete: "message.sysmanage.widgetDatasetManage.errorOnDelete",
  msgErrorOnPreviewRequest: "message.sysmanage.widgetDatasetManage.errorOnPreviewRequest",
  msgNoQueryResult: "message.sysmanage.widgetDatasetManage.noQueryResult",
  msgNoPreviewResult: "message.sysmanage.widgetDatasetManage.noPreviewResult",

  btnReset: "button.sysmanage.widgetDatasetManage.reset",
  btnCopy: "button.sysmanage.widgetDatasetManage.copy",
  btnDelete: "button.sysmanage.widgetDatasetManage.delete",
  btnSave: "button.sysmanage.widgetDatasetManage.save",
  btnSearch: "button.sysmanage.widgetDatasetManage.search",
  btnPreview: "button.sysmanage.widgetDatasetManage.preview",

  etcAll: "etc.sysmanage.widgetDatasetManage.all",
  etcUse: "etc.sysmanage.widgetDatasetManage.use",
  etcNotUse: "etc.sysmanage.widgetDatasetManage.notUse",
  etcQuery: "etc.sysmanage.widgetDatasetManage.query",
  etcConfig: "etc.sysmanage.widgetDatasetManage.config",
  etcDataJson: "etc.sysmanage.widgetDatasetManage.dataJson",

  etcCopySuffix: "etc.sysmanage.widgetDatasetManage.copyNameSuffix",
  etcColumnUse: "etc.sysmanage.widgetDatasetManage.columnUse",
  etcLabelApiPreviewAuthkey: "etc.sysmanage.widgetDatasetManage.apiPreviewAuthkeyLabel",
  etcHintSqlBind: "etc.sysmanage.widgetDatasetManage.hintSqlBind",
  etcHintApiPreview: "etc.sysmanage.widgetDatasetManage.hintApiPreview",
} as const;

export type CmmnWidgetDatasetI18nText = Record<keyof typeof CMMN_WIDGET_DATASET_I18N_KEYS, string>;

export const CMMN_WIDGET_DATASET_I18N_FALLBACK: CmmnWidgetDatasetI18nText = {
  pageTitle: "위젯데이터셋관리",
  titleDatasetList: "데이터 셋 리스트",
  titleDatasetInfo: "데이터 셋 정보",
  titleDatasetPreview: "데이터 미리보기",

  navSiteManage: "사이트관리",
  navHome: "Home",

  labelType: "유형",
  labelDataName: "데이터명",
  labelDataId: "데이터 ID",
  labelDataType: "데이터 유형",
  labelUseYn: "사용여부",
  labelUpdateDate: "수정일",

  placeholderSearchDataName: "데이터명 검색",
  placeholderSelectOnlyQuery: "SELECT ... (SELECT 만 허용)",
  placeholderConfigListJson: 'configList 등 (JSON). 예: { "configList": [...] }',
  placeholderConfigAuthReplace: "Config에 :authkey 로 두었을 때 여기 입력한 값으로 치환됩니다.",
  placeholderApiConfigExample: '{ "url": "https://...", "method": "GET", "headers": {}, "params": { "key": "값 또는 :이름" } }',
  placeholderItemsJsonExample: '{ "items": [ { "title": "...", "date": "..." } ] }',

  msgErrorOnDetail: "상세 조회 중 오류가 발생했습니다.",
  msgSelectCompany: "회사를 선택하세요.",
  msgFailGenerateId: "데이터셋 ID 채번에 실패했습니다.",
  msgInvalidConfigJson: "Config(JSON) 형식이 올바르지 않습니다.",
  msgInvalidSettingJson: "설정 JSON 형식이 올바르지 않습니다.",
  msgNoDataNameToCopy: "복사할 데이터명이 없습니다.",
  msgDatasetNameLength: "데이터셋명은 1~{max}자 이내여야 합니다.",
  msgSelectDataType: "데이터 유형을 선택하세요.",
  msgDatasetIdLength: "데이터셋 ID는 1~{max}자 이내여야 합니다.",
  msgSaved: "저장되었습니다.",
  msgUpdated: "수정되었습니다.",
  msgErrorOnSave: "저장 중 오류가 발생했습니다.",
  msgErrorOnUpdate: "수정 중 오류가 발생했습니다.",
  msgConfirmDeleteDataset: "선택한 데이터셋을 삭제하시겠습니까?",
  msgDeleted: "삭제되었습니다.",
  msgErrorOnDelete: "삭제 중 오류가 발생했습니다.",
  msgErrorOnPreviewRequest: "미리보기 요청 중 오류가 발생했습니다.",
  msgNoQueryResult: "조회 결과가 없습니다.",
  msgNoPreviewResult: "미리보기 결과가 없습니다.",

  btnReset: "초기화",
  btnCopy: "복사",
  btnDelete: "삭제",
  btnSave: "저장",
  btnSearch: "조회",
  btnPreview: "미리보기",

  etcAll: "전체",
  etcUse: "사용",
  etcNotUse: "사용안함",
  etcQuery: "Query",
  etcConfig: "Config",
  etcDataJson: "DATA (JSON)",

  etcCopySuffix: " (복사)",
  etcColumnUse: "사용",
  etcLabelApiPreviewAuthkey: "미리보기 인증키 (authkey, 선택)",
  etcHintSqlBind:
    "바인드: Config(JSON)에 동일 이름이 있으면 그 값을 사용하고, :cmpnyCd ·:userId는 Config와 무관하게 화면·세션 값으로만 치환합니다. (:todayDt, :limitCnt등은 Config 또는 기본값)",
  etcHintApiPreview:
    "GET 요청만 지원합니다. params는 쿼리스트링으로 붙으며, 값이 :searchdate·:authkey·:todayDt 형태면 Config 스칼라 또는 미리보기 파라미터(오늘 날짜·아래 인증키 등)로 치환합니다. (한국수출입은행 환율 API: data=AP01, searchdate=YYYYMMDD, cur_unit 등)",
};

export function replaceI18nPlaceholders(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)), template);
}
