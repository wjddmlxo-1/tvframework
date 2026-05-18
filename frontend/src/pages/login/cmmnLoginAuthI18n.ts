/** 로그인(`LoginContent`)·회사가입(`UserJoin`)·암호변경(`UserPasswordUpdate`) — `Docs/다국어입력_result.md` 및 CM_MESSAGE 정합 */

export const CMMN_LOGIN_PORTAL_I18N_KEYS = {
  titleLogin: "title.sysmanage.login",
  labelId: "label.sysmanage.login.id",
  labelPassword: "label.sysmanage.login.password",
  placeholderEnterUserId: "placeholder.sysmanage.login.enterUserId",
  placeholderEnterPassword: "placeholder.sysmanage.login.enterPassword",
  msgLoginRequiredPath: "message.sysmanage.login.login_required_path",
  msgServerConnectionError: "message.sysmanage.login.server_connection_error",
  msgLogoutSuccess: "message.sysmanage.login.logout_success",
  btnLogin: "button.sysmanage.login.login",
  btnSignup: "button.sysmanage.login.signup",
  btnNaverLogin: "button.sysmanage.login.naver_login",
  btnKakaoLogin: "button.sysmanage.login.kakao_login",

  msgCheckPasswordThenSubmit: "message.sysmanage.login.check_password_then_submit",
  msgSnsSimpleLoginInProgress: "message.sysmanage.login.sns_simple_login_in_progress",
  msgLoggingIn: "message.sysmanage.login.logging_in",
  msgEnterIdRequired: "message.sysmanage.login.enter_id_required",
  msgEnterPasswordRequired: "message.sysmanage.login.enter_password_required",
  msgLoginFailDefault: "message.sysmanage.login.login_fail_default",
  etcIdSave: "etc.sysmanage.login.id_save",
  etcIntroLine1: "etc.sysmanage.login.intro_line1",
  etcIntroLine2: "etc.sysmanage.login.intro_line2",
  etcTipPasswordMix: "etc.sysmanage.login.tip_password_mix",
  etcTipPasswordRotate: "etc.sysmanage.login.tip_password_rotate",
  etcAllMenuClosedTitle: "etc.sysmanage.layout.allMenuClosedTitle",
} as const;

export type CmmnLoginPortalI18nText = Record<keyof typeof CMMN_LOGIN_PORTAL_I18N_KEYS, string>;

export const CMMN_LOGIN_PORTAL_I18N_FALLBACK: CmmnLoginPortalI18nText = {
  titleLogin: "로그인",
  labelId: "아이디",
  labelPassword: "비밀번호",
  placeholderEnterUserId: "아이디 입력",
  placeholderEnterPassword: "비밀번호 입력",
  msgLoginRequiredPath: "로그인이 필요한 경로입니다.",
  msgServerConnectionError: "서버와의 연결이 원활하지 않습니다. 서버를 확인하세요.",
  msgLogoutSuccess: "로그아웃되었습니다!",
  btnLogin: "로그인",
  btnSignup: "회원가입",
  btnNaverLogin: "네이버 로그인",
  btnKakaoLogin: "카카오 로그인",

  msgCheckPasswordThenSubmit: "비밀번호 입력 여부를 확인하여 주세요",
  msgSnsSimpleLoginInProgress: "Sns 간편 로그인 중...",
  msgLoggingIn: "로그인 중...",
  msgEnterIdRequired: "아이디를 입력해 주세요.",
  msgEnterPasswordRequired: "비밀번호를 입력해 주세요.",
  msgLoginFailDefault: "로그인에 실패했습니다.",
  etcIdSave: "ID 저장",
  etcIntroLine1: "표준프레임워크 로그인 페이지입니다.",
  etcIntroLine2: "로그인을 하시면 모든 서비스를 제한없이 이용하실 수 있습니다.",
  etcTipPasswordMix:
    "비밀번호는 6~12자의 영문 대/소문자, 숫자, 특수문자를 혼합해서 사용하실 수 있습니다.",
  etcTipPasswordRotate:
    "쉬운 비밀번호나 자주 쓰는 사이트의 비밀번호가 같을 경우, 도용되기 쉬우므로 주기적으로 변경하셔서 사용하는 것이 좋습니다.",
  etcAllMenuClosedTitle: "전체메뉴 닫힘",
};

/** 회사 신규 가입 신청 (`UserJoin`) */
export const CMMN_JOIN_COMPANY_I18N_KEYS = {
  titleSignUp: "title.sysmanage.login.signUp",

  btnSave: "button.sysmanage.joinCompany.save",
  btnConfirmTerms: "button.sysmanage.joinCompany.confirm_terms",
  btnDupCheckId: "button.sysmanage.joinCompany.dup_check_id",
  btnClose: "button.sysmanage.joinCompany.close",
  btnDisagree: "button.sysmanage.joinCompany.disagree",
  btnAgree: "button.sysmanage.joinCompany.agree",

  popupTermsTitle: "title.sysmanage.joinCompany.confirm_terms",

  labelCompanyId: "label.sysmanage.joinCompany.company_id",
  labelCompanyNm: "label.sysmanage.joinCompany.company_name",
  labelEntrprsGb: "label.sysmanage.joinCompany.entrprs_gb",
  labelIndutyCd: "label.sysmanage.joinCompany.industry_cd",
  labelCxfc: "label.sysmanage.joinCompany.ceo",
  labelBsnsNo: "label.sysmanage.joinCompany.biz_reg_no",
  labelCprNo: "label.sysmanage.joinCompany.corp_reg_no",
  labelCityNm: "label.sysmanage.joinCompany.city",
  labelStateNm: "label.sysmanage.joinCompany.state",
  labelAddrOne: "label.sysmanage.joinCompany.address_one",
  labelAddrTwo: "label.sysmanage.joinCompany.address_two",
  labelNationCd: "label.sysmanage.joinCompany.country",
  labelZipCd: "label.sysmanage.joinCompany.zip",
  labelOffmTelno: "label.sysmanage.joinCompany.phone",
  labelFxnum: "label.sysmanage.joinCompany.fax",
  labelApplcntId: "label.sysmanage.joinCompany.applicant_id",
  labelApplcntNm: "label.sysmanage.joinCompany.applicant_name",
  labelApplcntEmail: "label.sysmanage.joinCompany.applicant_email",

  labelTermsCn: "label.sysmanage.joinCompany.terms_content",
  labelInfoConsentCn: "label.sysmanage.joinCompany.info_consent_content",
  labelAgreeTerms: "label.sysmanage.joinCompany.agree_terms_check",
  labelAgreeInfo: "label.sysmanage.joinCompany.agree_info_check",

  etcSelect: "etc.sysmanage.joinCompany.select_placeholder",
  etcBizRuleTitle: "etc.sysmanage.joinCompany.biz_rules_title",
  etcBizRuleLine: "etc.sysmanage.joinCompany.biz_rules_line",
  etcAdminMemoTitle: "etc.sysmanage.joinCompany.admin_memo_title",
  etcAdminMemo1: "etc.sysmanage.joinCompany.admin_memo_line1",
  etcAdminMemo2: "etc.sysmanage.joinCompany.admin_memo_line2",

  msgEnterCompanyIdForDup: "message.sysmanage.joinCompany.enter_company_id_for_dup",
  msgIdAvailable: "message.sysmanage.joinCompany.id_available",
  msgIdNotAvailable: "message.sysmanage.joinCompany.id_not_available",
  msgDupCheckError: "message.sysmanage.joinCompany.dup_check_error",
  msgAgreeCheckRequired: "message.sysmanage.joinCompany.agree_check_required",
  msgEnterCompanyId: "message.sysmanage.joinCompany.enter_company_id",
  msgDupMustRun: "message.sysmanage.joinCompany.dup_must_run",
  msgEnterCompanyNm: "message.sysmanage.joinCompany.enter_company_name",
  msgEnterBsnsNo: "message.sysmanage.joinCompany.enter_biz_no",
  msgEnterApplicantId: "message.sysmanage.joinCompany.enter_applicant_id",
  msgMustAgreeTerms: "message.sysmanage.joinCompany.must_agree_terms_for_join",
  msgJoinCompleted: "message.sysmanage.joinCompany.join_completed",
  msgJoinSaveFail: "message.sysmanage.joinCompany.save_error_fallback",
  msgJoinSaveFailNet: "message.sysmanage.joinCompany.save_error_network",
  msgRejectNoSignup: "message.sysmanage.joinCompany.reject_need_agree_else",
} as const;

export type CmmnJoinCompanyI18nText = Record<keyof typeof CMMN_JOIN_COMPANY_I18N_KEYS, string>;

export const CMMN_JOIN_COMPANY_I18N_FALLBACK: CmmnJoinCompanyI18nText = {
  titleSignUp: "회원가입",

  btnSave: "저장",
  btnConfirmTerms: "약관 확인",
  btnDupCheckId: "중복 아이디 검색",
  btnClose: "닫기",
  btnDisagree: "비동의",
  btnAgree: "동의",

  popupTermsTitle: "약관 확인",

  labelCompanyId: "회사ID",
  labelCompanyNm: "회사명",
  labelEntrprsGb: "기업 구분",
  labelIndutyCd: "업종코드",
  labelCxfc: "대표이사",
  labelBsnsNo: "사업자 등록번호",
  labelCprNo: "법인 등록번호",
  labelCityNm: "도시",
  labelStateNm: "주/도/광역시",
  labelAddrOne: "주소 1",
  labelAddrTwo: "주소 2",
  labelNationCd: "국가",
  labelZipCd: "우편번호",
  labelOffmTelno: "전화번호",
  labelFxnum: "팩스번호",
  labelApplcntId: "신청자 아이디",
  labelApplcntNm: "신청자 이름",
  labelApplcntEmail: "신청자 이메일",

  labelTermsCn: "약관내용",
  labelInfoConsentCn: "정보동의내용",
  labelAgreeTerms: "약관 내용에 동의합니다.",
  labelAgreeInfo: "정보이용 내용에 동의합니다.",

  etcSelect: "선택",
  etcBizRuleTitle: "비즈니스 규칙",
  etcBizRuleLine: "회사 정보를 입력하여 신규 기업 가입 신청을 합니다. 저장 성공 시 로그인 화면으로 이동합니다.",
  etcAdminMemoTitle: "관리자 메모",
  etcAdminMemo1: "- 중복 아이디 검색 후에만 저장할 수 있습니다.",
  etcAdminMemo2: "- 약관 확인 후 동의하지 않으면 가입할 수 없습니다.",

  msgEnterCompanyIdForDup: "회사 ID를 입력한 후 중복 검색을 해주세요.",
  msgIdAvailable: "사용 가능한 아이디입니다.",
  msgIdNotAvailable: "사용하실 수 없는 아이디입니다.",
  msgDupCheckError: "중복 검사 중 오류가 발생했습니다.",
  msgAgreeCheckRequired: "약관 내용을 확인하고 동의 체크를 해주세요.",
  msgEnterCompanyId: "회사 ID를 입력하세요.",
  msgDupMustRun: "중복 아이디 검색을 해주십시오.",
  msgEnterCompanyNm: "회사명을 입력하세요.",
  msgEnterBsnsNo: "사업자 등록번호를 입력하세요.",
  msgEnterApplicantId: "신청자 아이디를 입력하세요.",
  msgMustAgreeTerms: "약관 동의를 해야 회사가입이 가능합니다.",
  msgJoinCompleted: "회사 가입신청이 완료되었습니다.",
  msgJoinSaveFail: "저장 중 오류가 발생했습니다.",
  msgJoinSaveFailNet: "저장 중 오류가 발생했습니다.",
  msgRejectNoSignup: "비동의 시 기업가입을 진행할 수 없습니다.",
};

/** 사용자 암호 변경 (`UserPasswordUpdate`) — 문서 `title.sysmanage.login.changePassword` 등 */
export const CMMN_LOGIN_PASSWORD_I18N_KEYS = {
  titleChangePassword: "title.sysmanage.login.changePassword",

  labelOldPassword: "label.sysmanage.login.oldPassword",
  labelNewPassword: "label.sysmanage.login.newPassword",
  labelConfirmInput: "label.sysmanage.login.confirmInput",

  btnChange: "button.sysmanage.login.change",
  btnList: "button.sysmanage.userPassword.list",

  labelSystemBread: "label.sysmanage.userManage.system",
  titleUserManageCrumb: "title.sysmanage.userManage",

  msgOldPwRequired: "message.sysmanage.login.old_password_required",
  msgNewPwRequired: "message.sysmanage.login.new_password_required",
  msgNewPwSameAsOld: "message.sysmanage.login.new_password_same_as_old",
  msgNewPwConfirmMismatch: "message.sysmanage.login.new_password_confirm_mismatch",
  msgPwChangeSuccessHint: "message.sysmanage.login.password_change_success_hint",
  msgPwChangeNotApplied: "message.sysmanage.login.password_change_not_applied",
  msgPwChangeError: "message.sysmanage.login.password_change_error",
} as const;

export type CmmnLoginPasswordI18nText = Record<keyof typeof CMMN_LOGIN_PASSWORD_I18N_KEYS, string>;

export const CMMN_LOGIN_PASSWORD_I18N_FALLBACK: CmmnLoginPasswordI18nText = {
  titleChangePassword: "비밀번호 변경",

  labelOldPassword: "기존 암호",
  labelNewPassword: "신규 암호",
  labelConfirmInput: "입력 확인",

  btnChange: "변경",
  btnList: "목록",

  labelSystemBread: "시스템관리",
  titleUserManageCrumb: "사용자관리",

  msgOldPwRequired: "기존 암호는 필수 값입니다.",
  msgNewPwRequired: "신규 암호는 필수 값입니다.",
  msgNewPwSameAsOld: "신규 암호는 기존 암호와 동일하게 사용할 수 없습니다.",
  msgNewPwConfirmMismatch: "신규 암호와 입력 확인값이 일치하지 않습니다",
  msgPwChangeSuccessHint: "다음 로그인 시 신규 암호를 사용하세요.",
  msgPwChangeNotApplied: "변경되지 않았습니다. 다시 시도해 주세요.",
  msgPwChangeError: "변경 중 오류가 발생했습니다.",
};
