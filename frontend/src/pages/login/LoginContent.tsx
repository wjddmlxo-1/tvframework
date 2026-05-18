import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as EgovNet from "@/api/egovFetch";

import URL from "@/constants/url";
import CODE from "@/constants/code";
import { getLocalItem, setLocalItem, setSessionItem } from "@/utils/storage";
import SnsNaverBt from "@/components/sns/SnsNaverBt";
import SnsKakaoBt from "@/components/sns/SnsKakaoBt";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_LOGIN_PORTAL_I18N_KEYS,
  CMMN_LOGIN_PORTAL_I18N_FALLBACK,
} from "@/pages/login/cmmnLoginAuthI18n";

type LoginContentProps = { onChangeLogin: (user: Record<string, unknown>) => void };

function LoginContent({ onChangeLogin }: LoginContentProps) {
  const navigate = useNavigate();
  const i18nText = useCmmnScreenI18n(CMMN_LOGIN_PORTAL_I18N_KEYS, CMMN_LOGIN_PORTAL_I18N_FALLBACK);
  const [userInfo, setUserInfo] = useState({
    id: "",
    password: "default",
    userSe: "USR",
  });
  const [saveIDFlag, setSaveIDFlag] = useState(false);
  const idRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const KEY_ID = "KEY_ID";
  const KEY_SAVE_ID_FLAG = "KEY_SAVE_ID_FLAG";

  const handleSaveIDFlag = () => {
    setLocalItem(KEY_SAVE_ID_FLAG, !saveIDFlag);
    setSaveIDFlag(!saveIDFlag);
  };

  useEffect(() => {
    const idFlag = getLocalItem(KEY_SAVE_ID_FLAG);
    const flag = idFlag === null ? false : idFlag;
    setSaveIDFlag(flag);
    if (!flag) setLocalItem(KEY_ID, "");
  }, []);

  useEffect(() => {
    const data = getLocalItem(KEY_ID);
    if (data !== null) setUserInfo((prev) => ({ ...prev, id: data }));
  }, []);

  const activeEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.target === idRef.current && passwordRef.current?.value === "") {
        alert(i18nText.msgCheckPasswordThenSubmit);
        passwordRef.current?.focus();
      } else {
        submitFormHandler();
      }
    }
  };

  const submitFormHandler = () => {
    const trimmedId = String(userInfo?.id ?? "").trim();
    if (!trimmedId) {
      alert(i18nText.msgEnterIdRequired);
      idRef.current?.focus();
      return;
    }
    const pwd = String(userInfo?.password ?? "").trim();
    if (!pwd || pwd === "default") {
      alert(i18nText.msgEnterPasswordRequired);
      passwordRef.current?.focus();
      return;
    }
    const loginUrl = "/auth/login-jwt";
    const requestOptions = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ ...userInfo, id: trimmedId, password: pwd }),
    };

    EgovNet.requestFetch(loginUrl, requestOptions, (resp) => {
      const resultVO = resp.resultVO as Record<string, unknown> | undefined;
      const jToken = resp?.jToken || null;
      setSessionItem("jToken", jToken);

      if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
        setSessionItem("loginUser", resultVO);
        onChangeLogin(resultVO ?? {});
        if (saveIDFlag) setLocalItem(KEY_ID, (resultVO as { id?: string })?.id);
        navigate(URL.MAIN);
        document.querySelector(".all_menu.WEB")?.classList.add("closed");
        document.querySelector(".btnAllMenu")?.classList.remove("active");
        const btnAllMenu = document.querySelector(".btnAllMenu");
        if (btnAllMenu) (btnAllMenu as HTMLElement).title = i18nText.etcAllMenuClosedTitle;
        document.querySelector(".all_menu.Mobile")?.classList.add("closed");
      } else {
        const message = String(resp?.resultMessage ?? i18nText.msgLoginFailDefault);
        alert(message);
        if (message.includes("아이디")) {
          idRef.current?.focus();
        } else if (message.includes("비밀번호")) {
          passwordRef.current?.focus();
        }
      }
    });
  };

  return (
    <div className="contents" id="contents">
      <div className="md-login-page">
        <div className="md-login-page__card">
          <h1 className="md-login-page__title">{i18nText.titleLogin}</h1>
          <p className="md-login-page__subtitle">
            {i18nText.etcIntroLine1}
            {" "}
            {i18nText.etcIntroLine2}
          </p>

          <form className="md-login-page__form" onSubmit={(e) => e.preventDefault()}>
            <div className="md-login-page__field">
              <input
                type="text"
                className="md-login-page__input"
                title={i18nText.labelId}
                placeholder={i18nText.placeholderEnterUserId}
                value={userInfo?.id}
                onChange={(e) => setUserInfo({ ...userInfo, id: e.target.value })}
                ref={idRef}
                onKeyDown={activeEnter}
              />
            </div>
            <div className="md-login-page__field">
              <input
                type="password"
                className="md-login-page__input"
                title={i18nText.labelPassword}
                placeholder={i18nText.placeholderEnterPassword}
                onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
                ref={passwordRef}
                onKeyDown={activeEnter}
              />
            </div>

            <div className="md-login-page__row">
              <label className="md-login-page__checkbox" htmlFor="saveid">
                <input
                  type="checkbox"
                  id="saveid"
                  onChange={handleSaveIDFlag}
                  checked={saveIDFlag}
                />
                <span>{i18nText.etcIdSave}</span>
              </label>
            </div>

            <button type="button" className="md-login-page__submit" onClick={submitFormHandler}>
              {i18nText.btnLogin}
            </button>

            <Link to={URL.MYPAGE_CREATE} className="md-login-page__signup">
              {i18nText.btnSignup}
            </Link>
          </form>

          <ul className="md-login-page__tips">
            <li>{i18nText.etcTipPasswordMix}</li>
            <li>{i18nText.etcTipPasswordRotate}</li>
          </ul>

          <div className="md-login-page__social">
            <SnsNaverBt />
            <SnsKakaoBt />
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginContent;