import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import CODE from "@/constants/code";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_LOGIN_PASSWORD_I18N_KEYS,
  CMMN_LOGIN_PASSWORD_I18N_FALLBACK,
} from "@/pages/login/cmmnLoginAuthI18n";

function UserPasswordUpdate() {
  const navigate = useNavigate();
  const i18nText = useCmmnScreenI18n(CMMN_LOGIN_PASSWORD_I18N_KEYS, CMMN_LOGIN_PASSWORD_I18N_FALLBACK);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const formValidator = () => {
    if (!oldPassword?.trim()) {
      alert(i18nText.msgOldPwRequired);
      return false;
    }
    if (!newPassword?.trim()) {
      alert(i18nText.msgNewPwRequired);
      return false;
    }
    if (newPassword === oldPassword) {
      alert(i18nText.msgNewPwSameAsOld);
      return false;
    }
    return true;
  };

  const updatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert(i18nText.msgNewPwConfirmMismatch);
      return;
    }
    if (!formValidator()) return;

    EgovNet.requestFetch(
      "/user/password",
      {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      },
      (resp) => {
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgPwChangeSuccessHint);
          navigate(URL.MAIN, { replace: true });
        } else {
          alert(resp?.resultMessage || i18nText.msgPwChangeNotApplied);
        }
      },
      () => alert(i18nText.msgPwChangeError)
    );
  };

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.titleChangePassword}</h1>
          <ul>
            <li><Link to={URL.MAIN} className="home">Home</Link></li>
            <li><Link to={URL.SYSTEM}>{i18nText.labelSystemBread}</Link></li>
            <li><Link to={URL.SYSTEM_USER}>{i18nText.titleUserManageCrumb}</Link></li>
            <li>{i18nText.titleChangePassword}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents" id="contents">
            <div className="md-page-header" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
              <div className="md-page-actions" style={{ display: "flex", gap: "10px" }}>
                <Link to={URL.SYSTEM_USER} className="btn btn_skyblue_h46">{i18nText.btnList}</Link>
                <button type="button" className="btn btn_blue_h46" onClick={updatePassword}>{i18nText.btnChange}</button>
              </div>
            </div>

            <div className="md-form-card" style={{ padding: "8px 16px" }}>
              <div className="board_view2 md-program-edit-form">
              <dl>
                <dt>{i18nText.labelOldPassword} <span className="req">*</span></dt>
                <dd>
                  <input
                    type="password"
                    className="f_input w_full"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    maxLength={100}
                  />
                </dd>
              </dl>
              <dl>
                <dt>{i18nText.labelNewPassword} <span className="req">*</span></dt>
                <dd>
                  <input
                    type="password"
                    className="f_input w_full"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    maxLength={100}
                  />
                </dd>
              </dl>
              <dl>
                <dt>{i18nText.labelConfirmInput} <span className="req">*</span></dt>
                <dd>
                  <input
                    type="password"
                    className="f_input w_full"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={100}
                  />
                </dd>
              </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPasswordUpdate;
