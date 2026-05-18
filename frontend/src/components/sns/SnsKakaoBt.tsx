import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_LOGIN_PORTAL_I18N_FALLBACK, CMMN_LOGIN_PORTAL_I18N_KEYS } from "@/pages/login/cmmnLoginAuthI18n";

const SnsKakaoBt = () => {
  const i18nText = useCmmnScreenI18n(CMMN_LOGIN_PORTAL_I18N_KEYS, CMMN_LOGIN_PORTAL_I18N_FALLBACK);
  const KAKAO_CLIENT_ID = import.meta.env.VITE_APP_KAKAO_CLIENTID; // 발급받은 클라이언트 아이디
  const REDIRECT_URI = import.meta.env.VITE_APP_KAKAO_CALLBACKURL; // Callback URL
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

  const KakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <a href="#!" onClick={KakaoLogin} className="btn_center social kakao">
      <button>{i18nText.btnKakaoLogin}</button>
    </a>
  );
};

export default SnsKakaoBt;
