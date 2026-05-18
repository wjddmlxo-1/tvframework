import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_LOGIN_PORTAL_I18N_FALLBACK, CMMN_LOGIN_PORTAL_I18N_KEYS } from "@/pages/login/cmmnLoginAuthI18n";

const SnsNaverBt = () => {
  const i18nText = useCmmnScreenI18n(CMMN_LOGIN_PORTAL_I18N_KEYS, CMMN_LOGIN_PORTAL_I18N_FALLBACK);
  const NAVER_CLIENT_ID = import.meta.env.VITE_APP_NAVER_CLIENTID; // 발급받은 클라이언트 아이디
  const REDIRECT_URI = import.meta.env.VITE_APP_NAVER_CALLBACKURL; // Callback URL
  const STATE = import.meta.env.VITE_APP_STATE; //다른 서버와 통신 시 암호화문자
  const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;

  const NaverLogin = () => {
    window.location.href = NAVER_AUTH_URL;
  };

  return (
    <a href="#!" onClick={NaverLogin} className="btn_center social naver">
      <button>{i18nText.btnNaverLogin}</button>
    </a>
  );
};

export default SnsNaverBt;
