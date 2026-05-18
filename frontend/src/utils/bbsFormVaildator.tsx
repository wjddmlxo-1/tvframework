import { CMMN_BBS_USER_I18N_FALLBACK } from "@/pages/main/cmmnBbsUserI18n";

const bbsFormVaildator = (formData: FormData): boolean => {
  if (formData.get("nttSj") === null || formData.get("nttSj") === "") {
    alert(CMMN_BBS_USER_I18N_FALLBACK.msgRequiredTitleContents);
    return false;
  }
  if (formData.get("nttCn") === null || formData.get("nttCn") === "") {
    alert(CMMN_BBS_USER_I18N_FALLBACK.msgRequiredTitleContents);
    return false;
  }
  return true;
};

export default bbsFormVaildator;

