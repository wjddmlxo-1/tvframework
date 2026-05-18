import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import { uploadProfileFile } from "@/api/bbsUserPostFileUpload";
import URL from "@/constants/url";
import CODE from "@/constants/code";
import { getSessionItem, setSessionItem } from "@/utils/storage";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageCodeForApi } from "@/utils/language";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_MYPAGE_I18N_KEYS,
  CMMN_MYPAGE_I18N_FALLBACK,
  replaceI18nPlaceholders,
} from "@/pages/mypage/cmmnMypageI18n";
import DeptSearchPopup from "@/components/DeptSearchPopup";
import { SERVER_URL } from "@/config";

const USER_MANAGE_API = "/cmmnUserManage";

const MAX_USER = {
  USER_ID: 20,
  USER_NM: 60,
  USER_ENG_NM: 100,
  PASSWORD: 100,
  BRTHDY: 20,
  PASSWORD_HINT: 10,
  PASSWORD_CNSR: 100,
  NATION_CD: 2,
  ZIP_CD: 20,
  ADRES_ONE: 200,
  ADRES_TWO: 200,
  CITY_NM: 100,
  STATE_NM: 100,
  HOUSE_TELNO: 20,
  MBTLNUM: 20,
  FXNUM: 20,
  EMAIL_ADRES: 50,
} as const;

const MAX_MBRSH = {
  EMPL_NO: 20,
  OFFM_TELNO: 20,
  EMAIL_ADRES: 50,
  OFCPS_CD: 60,
  ECNY_YMD: 8,
  RETIRE_YMD: 8,
  DEPT_CD: 20,
} as const;

/** API/DB에서 오는 생일·입퇴사일을 input[type=date]용 YYYYMMDD 로 통일 */
function normalizeYmd(v: unknown): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" && Number.isFinite(v)) {
    const s = String(Math.trunc(v));
    return /^\d{8}$/.test(s) ? s : "";
  }
  const s = String(v).trim();
  if (!s) return "";
  if (/^\d{8}$/.test(s)) return s;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}${m[2]}${m[3]}`;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : "";
}

type CompanyRow = {
  mbrshSq: number;
  companyCode: string;
  companyNm: string;
  emplNo: string;
  offmTelno: string;
  emailAdres: string;
  ofcpsCd: string;
  ecnyYmd: string;
  retireYmd: string;
  deptCd: string;
  deptNm: string;
};

function truncate(s: string | undefined, max: number): string | undefined {
  if (s == null) return undefined;
  const t = s.trim();
  return t === "" ? undefined : t.slice(0, max);
}

type CodeOption = { langSectionCode: string; langSectionName: string };

/** 마이페이지: 로그인 사용자 본인 프로필 (사용자관리와 동일 CM_USER + 회사별 정보) */
export default function MypageProfile() {
  const navigate = useNavigate();
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const cmpnyCdI18n = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_MYPAGE_I18N_KEYS, CMMN_MYPAGE_I18N_FALLBACK, { cmpnyCd: cmpnyCdI18n });

  const sessionUser = getSessionItem("loginUser");
  const userId = String(sessionUser?.id ?? "").trim();

  /** 서버에서 결정된 프로필 회사(소속 없으면 null) — 코드옵션·회사별정보·저장에 사용 */
  const [profileCompanyCode, setProfileCompanyCode] = useState<string | null>(null);
  const [userBasic, setUserBasic] = useState<Record<string, string>>({});
  const [companyRows, setCompanyRows] = useState<CompanyRow[]>([]);
  const [ofcpsByCompany, setOfcpsByCompany] = useState<Record<string, CodeOption[]>>({});
  const [deptPopupIndex, setDeptPopupIndex] = useState<number | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordHintOptions, setPasswordHintOptions] = useState<CodeOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<CodeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeptPopup, setShowDeptPopup] = useState(false);

  /** CM_USER.FILE_SQ — 사용자관리 화면과 동일 (`/bbs/main/post/file/upload` → 저장 시 myProfile에 반영) */
  const [profileFileSq, setProfileFileSq] = useState("");
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileImgFailed, setProfileImgFailed] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const loadCodeOptions = useCallback(() => {
    if (!profileCompanyCode) {
      setPasswordHintOptions([]);
      setGenderOptions([]);
      return;
    }
    ["CMMNCODE.530", "CMMNCODE.570"].forEach((codeId) => {
      EgovNet.requestFetch(
        `${USER_MANAGE_API}/codeOption?codeId=${encodeURIComponent(codeId)}&companyCode=${encodeURIComponent(profileCompanyCode)}&langCode=${encodeURIComponent(langCode)}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.result && Array.isArray(resp.result)) {
            if (codeId === "CMMNCODE.530") setPasswordHintOptions(resp.result);
            else if (codeId === "CMMNCODE.570") setGenderOptions(resp.result);
          }
        }
      );
    });
  }, [profileCompanyCode, langCode]);

  const loadMyProfile = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const saved = getSessionItem("selectedCmpnyCd");
    const pref = saved != null && String(saved).trim() !== "" ? String(saved).trim() : "";
    const qs = new URLSearchParams({ langCode });
    if (pref) qs.set("companyCode", pref);
    EgovNet.requestFetch(
      `${USER_MANAGE_API}/myProfile?${qs.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        setLoading(false);
        if (resp?.resultCode !== 200 && resp?.resultCode != null) {
          alert(resp?.resultMessage || i18nText.msgProfileLoadFail);
          return;
        }
        const r = resp?.result ?? {};
        const u = r.user ?? {};
        const pcc = r.profileCompanyCode != null && String(r.profileCompanyCode).trim() !== "" ? String(r.profileCompanyCode).trim() : null;
        setProfileCompanyCode(pcc);
        const pfs = u.profileFileSq != null && String(u.profileFileSq).trim() !== "" ? String(u.profileFileSq).trim() : "";
        setProfileFileSq(pfs);
        setProfileImgFailed(false);
        setUserBasic({
          userId: u.userId != null ? String(u.userId) : userId,
          userNm: u.userNm != null ? String(u.userNm) : "",
          userEngNm: u.userEngNm != null ? String(u.userEngNm) : "",
          genderCd: u.genderCd != null ? String(u.genderCd).trim() : "",
          brthdy: normalizeYmd(u.brthdy),
          zipCd: u.zipCd != null ? String(u.zipCd) : "",
          adresOne: u.adresOne != null ? String(u.adresOne) : "",
          adresTwo: u.adresTwo != null ? String(u.adresTwo) : "",
          cityNm: u.cityNm != null ? String(u.cityNm) : "",
          stateNm: u.stateNm != null ? String(u.stateNm) : "",
          nationCd: u.nationCd != null ? String(u.nationCd) : "",
          houseTelno: u.houseTelno != null ? String(u.houseTelno) : "",
          mbtlnum: u.mbtlnum != null ? String(u.mbtlnum) : "",
          fxnum: u.fxnum != null ? String(u.fxnum) : "",
          emailAdres: u.emailAdres != null ? String(u.emailAdres) : "",
          passwordHint: u.passwordHint != null ? String(u.passwordHint) : "",
          passwordCnsr: u.passwordCnsr != null ? String(u.passwordCnsr) : "",
          password: "",
        });
        const rawList = Array.isArray(r.companyInfoList) ? r.companyInfoList : [];
        setCompanyRows(
          rawList.map((row: Record<string, unknown>) => ({
            mbrshSq: Number(row.mbrshSq),
            companyCode: String(row.companyCode ?? ""),
            companyNm: String(row.companyNm ?? row.companyCode ?? ""),
            emplNo: row.emplNo != null ? String(row.emplNo) : "",
            offmTelno: row.offmTelno != null ? String(row.offmTelno) : "",
            emailAdres: row.emailAdres != null ? String(row.emailAdres) : "",
            ofcpsCd: row.ofcpsCd != null ? String(row.ofcpsCd) : "",
            ecnyYmd: normalizeYmd(row.ecnyYmd),
            retireYmd: normalizeYmd(row.retireYmd),
            deptCd: row.deptCd != null ? String(row.deptCd) : "",
            deptNm: row.deptNm != null ? String(row.deptNm) : "",
          }))
        );
        setPasswordConfirm("");
      },
      () => {
        setLoading(false);
        alert(i18nText.msgProfileQueryError);
      }
    );
  }, [userId, langCode, i18nText]);

  useEffect(() => {
    if (!userId) {
      alert(i18nText.msgLoginRequired);
      navigate(URL.LOGIN);
    }
  }, [userId, navigate, i18nText.msgLoginRequired]);

  useEffect(() => {
    if (userId) loadMyProfile();
  }, [userId, loadMyProfile]);

  useEffect(() => {
    loadCodeOptions();
  }, [loadCodeOptions]);

  /** 소속 회사별 직위 코드 옵션 */
  useEffect(() => {
    const distinct = [...new Set(companyRows.map((r) => r.companyCode).filter(Boolean))];
    if (distinct.length === 0) {
      setOfcpsByCompany({});
      return;
    }
    distinct.forEach((cc) => {
      EgovNet.requestFetch(
        `${USER_MANAGE_API}/codeOption?codeId=${encodeURIComponent("CMMNCODE.560")}&companyCode=${encodeURIComponent(cc)}&langCode=${encodeURIComponent(langCode)}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          const opts = Array.isArray(resp?.result) ? resp.result : [];
          setOfcpsByCompany((prev) => ({ ...prev, [cc]: opts }));
        }
      );
    });
  }, [companyRows, langCode]);

  useEffect(() => {
    const onCompanyChanged = () => loadMyProfile();
    window.addEventListener("app:companyChanged", onCompanyChanged);
    return () => window.removeEventListener("app:companyChanged", onCompanyChanged);
  }, [loadMyProfile]);

  const formatYmd = (s: string) => {
    if (!s || s.length !== 8) return s;
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  };
  const toYmd = (s: string) => (s || "").replace(/-/g, "").slice(0, 8);

  const handleSave = () => {
    if (!(userBasic.userNm || "").trim()) {
      alert(i18nText.msgUsernameRequired);
      return;
    }
    if (!(userBasic.userEngNm ?? "").trim()) {
      alert(i18nText.msgUserEnNameRequired);
      return;
    }
    const pwd = (userBasic.password ?? "").trim();
    if (pwd) {
      if (pwd !== passwordConfirm) {
        alert(i18nText.msgPasswordMismatch);
        return;
      }
    }
    const rowMissingDept = companyRows.find(
      (row) => (row.companyCode ?? "").trim() !== "" && !(row.deptCd ?? "").trim()
    );
    if (rowMissingDept) {
      alert(
        replaceI18nPlaceholders(i18nText.msgSelectDeptByCompany, {
          companyName: rowMissingDept.companyNm || rowMissingDept.companyCode,
        })
      );
      return;
    }
    const brthdyVal = (userBasic.brthdy ?? "").replace(/-/g, "").slice(0, MAX_USER.BRTHDY);
    const userBasicTruncated: Record<string, string> = {
      userId: userId.slice(0, MAX_USER.USER_ID),
      userNm: (truncate(userBasic.userNm, MAX_USER.USER_NM) ?? ""),
      userEngNm: (truncate(userBasic.userEngNm, MAX_USER.USER_ENG_NM) ?? ""),
      genderCd: (userBasic.genderCd ?? "").slice(0, 1),
      brthdy: brthdyVal ?? "",
      adresOne: truncate(userBasic.adresOne, MAX_USER.ADRES_ONE) ?? "",
      adresTwo: truncate(userBasic.adresTwo, MAX_USER.ADRES_TWO) ?? "",
      cityNm: truncate(userBasic.cityNm, MAX_USER.CITY_NM) ?? "",
      stateNm: truncate(userBasic.stateNm, MAX_USER.STATE_NM) ?? "",
      nationCd: truncate(userBasic.nationCd, MAX_USER.NATION_CD) ?? "",
      zipCd: truncate(userBasic.zipCd, MAX_USER.ZIP_CD) ?? "",
      houseTelno: truncate(userBasic.houseTelno, MAX_USER.HOUSE_TELNO) ?? "",
      mbtlnum: truncate(userBasic.mbtlnum, MAX_USER.MBTLNUM) ?? "",
      fxnum: truncate(userBasic.fxnum, MAX_USER.FXNUM) ?? "",
      emailAdres: truncate(userBasic.emailAdres, MAX_USER.EMAIL_ADRES) ?? "",
      passwordHint: truncate(userBasic.passwordHint, MAX_USER.PASSWORD_HINT) ?? "",
      passwordCnsr: truncate(userBasic.passwordCnsr, MAX_USER.PASSWORD_CNSR) ?? "",
      profileFileSq: profileFileSq.trim(),
    };
    if (pwd) {
      userBasicTruncated.password = pwd.slice(0, MAX_USER.PASSWORD);
    }
    const companyInfoList = companyRows.map((row) => {
      const ecny = (row.ecnyYmd ?? "").replace(/-/g, "").slice(0, MAX_MBRSH.ECNY_YMD);
      const ret = (row.retireYmd ?? "").replace(/-/g, "").slice(0, MAX_MBRSH.RETIRE_YMD);
      return {
        mbrshSq: row.mbrshSq,
        companyCode: row.companyCode,
        deptCd: (row.deptCd ?? "").slice(0, MAX_MBRSH.DEPT_CD),
        deptNm: row.deptNm ?? "",
        emplNo: truncate(row.emplNo, MAX_MBRSH.EMPL_NO) ?? "",
        offmTelno: truncate(row.offmTelno, MAX_MBRSH.OFFM_TELNO) ?? "",
        emailAdres: truncate(row.emailAdres, MAX_MBRSH.EMAIL_ADRES) ?? "",
        ofcpsCd: (row.ofcpsCd ?? "").slice(0, MAX_MBRSH.OFCPS_CD),
        ecnyYmd: ecny ?? "",
        retireYmd: ret ?? "",
      };
    });

    const body = {
      userId,
      userBasic: userBasicTruncated,
      companyInfoList,
      updateId: userId,
      creationId: userId,
    };

    EgovNet.requestFetch(
      `${USER_MANAGE_API}/myProfile`,
      { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgSaveSuccess);
          const loginUser = getSessionItem("loginUser") || {};
          setSessionItem("loginUser", { ...loginUser, name: userBasicTruncated.userNm });
          window.dispatchEvent(new CustomEvent("app:profileUpdated"));
          loadMyProfile();
        } else alert(resp?.resultMessage || i18nText.msgSaveFailShort);
      },
      () => alert(i18nText.msgSaveError)
    );
  };

  const deleteMember = () => {
    if (!window.confirm(i18nText.msgConfirmWithdraw)) return;
    EgovNet.requestFetch(
      "/mypage/delete",
      {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({}),
      },
      (resp) => {
        if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
          setSessionItem("loginUser", { id: "" });
          setSessionItem("jToken", null);
          document.querySelector(".all_menu.WEB")?.classList.add("closed");
          document.querySelector(".btnAllMenu")?.classList.remove("active");
          const btnAllMenu = document.querySelector(".btnAllMenu");
          if (btnAllMenu) (btnAllMenu as HTMLElement).title = i18nText.etcAllMenuClosedTitle;
          document.querySelector(".all_menu.Mobile")?.classList.add("closed");
          alert(i18nText.msgWithdrawDone);
          navigate(URL.MAIN, { replace: true });
        } else {
          alert(
            replaceI18nPlaceholders(i18nText.msgWithdrawError, { detail: resp.resultMessage || "" })
          );
        }
      }
    );
  };

  const profileImageHref =
    profileFileSq.trim() !== ""
      ? `${SERVER_URL}/bbs/main/profile/file?fileSq=${encodeURIComponent(profileFileSq.trim())}`
      : null;

  const handleProfileFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = input.files;
    if (!files?.length || profileUploading) return;
    const f = files[0];
    input.value = "";
    if (!f.type.startsWith("image/")) {
      alert(i18nText.msgImageOnly);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      alert(i18nText.msgFileSize10mb);
      return;
    }
    setProfileUploading(true);
    uploadProfileFile(
      f,
      (row) => {
        setProfileUploading(false);
        setProfileFileSq(String(row.fileSq).trim());
        setProfileImgFailed(false);
      },
      (msg) => {
        setProfileUploading(false);
        alert(msg ?? i18nText.msgImageUploadFail);
      }
    );
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.titleMyProfile}</h1>
          <ul>
            <li>
              <Link to={URL.MAIN} className="home">
                Home
              </Link>
            </li>
            <li>{i18nText.labelMyPage}</li>
            <li>{i18nText.labelCrumbMyProfile}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents contents--user" id="contents">
            <div className="md-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {loading && <span style={{ fontSize: "14px", color: "#666" }}>{i18nText.msgLoadingInline}</span>}
                {!loading && companyRows.length === 0 && (
                  <span style={{ fontSize: "14px", color: "#666" }}>{i18nText.msgNoCompanyBasicOnly}</span>
                )}
              </div>
              <div className="md-page-actions" style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="btn btn_blue_h46" onClick={handleSave} disabled={loading}>
                  {i18nText.btnSave}
                </button>
                <button type="button" className="btn btn_delete" onClick={deleteMember}>
                  {i18nText.btnWithdraw}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="md-form-card" style={{ padding: "8px 16px" }}>
                <h3 className="system-subtitle" style={{ marginTop: 0, marginBottom: "6px" }}>
                  {i18nText.titleUserBasicInfo}
                </h3>
                <div className="board_view2 md-program-edit-form" style={{ width: "100%", boxSizing: "border-box" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) minmax(0, 1fr)", gap: "10px 16px", alignItems: "start" }}>
                    <input ref={profileFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileFileChange} />
                    <dl>
                      <dt>
                        {i18nText.labelUserId} <span className="req">*</span>
                      </dt>
                      <dd style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <input
                          type="text"
                          className="f_input w_full"
                          style={{ flex: "1 1 auto", minWidth: 200, maxWidth: "100%" }}
                          value={userBasic.userId ?? ""}
                          readOnly
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelProfileImage}</dt>
                      <dd style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            overflow: "hidden",
                            flexShrink: 0,
                            background: "#fff",
                            border: "1px solid #dce3eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#cbd5e1",
                          }}
                          aria-hidden
                        >
                          {profileImageHref && !profileImgFailed ? (
                            <img
                              src={profileImageHref}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={() => setProfileImgFailed(true)}
                            />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn_default_h35"
                          style={{ flexShrink: 0 }}
                          disabled={profileUploading || loading}
                          onClick={() => profileFileInputRef.current?.click()}
                        >
                          {profileUploading ? i18nText.etcUploading : i18nText.btnSelectPhoto}
                        </button>
                        {profileFileSq.trim() !== "" && (
                          <button
                            type="button"
                            className="btn btn_default_h35"
                            style={{ flexShrink: 0 }}
                            disabled={profileUploading || loading}
                            onClick={() => {
                              setProfileFileSq("");
                              setProfileImgFailed(false);
                            }}
                          >
                            {i18nText.btnDeletePhoto}
                          </button>
                        )}
                      </dd>
                    </dl>
                    <dl>
                      <dt>
                        {i18nText.labelUserName} <span className="req">*</span>
                      </dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={userBasic.userNm ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, userNm: e.target.value }))}
                          maxLength={MAX_USER.USER_NM}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>
                        {i18nText.labelUserEnName} <span className="req">*</span>
                      </dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={userBasic.userEngNm ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, userEngNm: e.target.value }))}
                          maxLength={MAX_USER.USER_ENG_NM}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelGender}</dt>
                      <dd>
                        <select className="f_select w_full" value={userBasic.genderCd ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, genderCd: e.target.value }))}>
                          <option value="">{i18nText.etcSelect}</option>
                          {genderOptions.map((o) => (
                            <option key={o.langSectionCode} value={o.langSectionCode}>
                              {o.langSectionName}
                            </option>
                          ))}
                        </select>
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelBirthDate}</dt>
                      <dd>
                        <input
                          type="date"
                          className="f_input w_full"
                          value={formatYmd(userBasic.brthdy ?? "")}
                          onChange={(e) => setUserBasic((u) => ({ ...u, brthdy: toYmd(e.target.value) }))}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelZipCode}</dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={userBasic.zipCd ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, zipCd: e.target.value }))}
                          placeholder={i18nText.placeholderZipCode}
                          maxLength={MAX_USER.ZIP_CD}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelCity}</dt>
                      <dd>
                        <input type="text" className="f_input w_full" value={userBasic.cityNm ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, cityNm: e.target.value }))} maxLength={MAX_USER.CITY_NM} />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelAddress1}</dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={userBasic.adresOne ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, adresOne: e.target.value }))}
                          maxLength={MAX_USER.ADRES_ONE}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelAddress2}</dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={userBasic.adresTwo ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, adresTwo: e.target.value }))}
                          maxLength={MAX_USER.ADRES_TWO}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelState}</dt>
                      <dd>
                        <input type="text" className="f_input w_full" value={userBasic.stateNm ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, stateNm: e.target.value }))} maxLength={MAX_USER.STATE_NM} />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelCountry}</dt>
                      <dd>
                        <input
                          type="text"
                          className="f_input w_full"
                          value={userBasic.nationCd ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, nationCd: e.target.value }))}
                          placeholder={i18nText.placeholderCountryKr}
                          maxLength={MAX_USER.NATION_CD}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelPhone}</dt>
                      <dd>
                        <input type="text" className="f_input w_full" value={userBasic.houseTelno ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, houseTelno: e.target.value }))} maxLength={MAX_USER.HOUSE_TELNO} />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelMobilePhone}</dt>
                      <dd>
                        <input type="text" className="f_input w_full" value={userBasic.mbtlnum ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, mbtlnum: e.target.value }))} maxLength={MAX_USER.MBTLNUM} />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelFax}</dt>
                      <dd>
                        <input type="text" className="f_input w_full" value={userBasic.fxnum ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, fxnum: e.target.value }))} maxLength={MAX_USER.FXNUM} />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelEmail}</dt>
                      <dd>
                        <input
                          type="email"
                          className="f_input w_full"
                          value={userBasic.emailAdres ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, emailAdres: e.target.value }))}
                          maxLength={MAX_USER.EMAIL_ADRES}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelPassword}</dt>
                      <dd>
                        <input
                          type="password"
                          className="f_input w_full"
                          value={userBasic.password ?? ""}
                          onChange={(e) => setUserBasic((u) => ({ ...u, password: e.target.value }))}
                          placeholder={i18nText.placeholderKeepPassword}
                          maxLength={MAX_USER.PASSWORD}
                        />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelPasswordConfirm}</dt>
                      <dd>
                        <input type="password" className="f_input w_full" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} maxLength={MAX_USER.PASSWORD} />
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelPasswordHint}</dt>
                      <dd>
                        <select className="f_select w_full" value={userBasic.passwordHint ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, passwordHint: e.target.value }))}>
                          <option value="">{i18nText.etcSelect}</option>
                          {passwordHintOptions.map((o) => (
                            <option key={o.langSectionCode} value={o.langSectionCode}>
                              {o.langSectionName}
                            </option>
                          ))}
                        </select>
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelPasswordAnswer}</dt>
                      <dd>
                        <input type="text" className="f_input w_full" value={userBasic.passwordCnsr ?? ""} onChange={(e) => setUserBasic((u) => ({ ...u, passwordCnsr: e.target.value }))} maxLength={MAX_USER.PASSWORD_CNSR} />
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              {companyRows.map((row, idx) => (
                <div key={`${row.mbrshSq}-${row.companyCode}`} className="md-form-card" style={{ padding: "8px 16px" }}>
                  <h3 className="system-subtitle" style={{ marginTop: 0, marginBottom: "6px" }}>
                    {replaceI18nPlaceholders(i18nText.etcCompanySectionTitle, {
                      companyName: row.companyNm || row.companyCode,
                    })}
                  </h3>
                  <div className="board_view2 md-program-edit-form" style={{ width: "100%", boxSizing: "border-box" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", alignItems: "start" }}>
                      <dl>
                        <dt>{i18nText.labelEmployeeNo}</dt>
                        <dd>
                          <input
                            type="text"
                            className="f_input w_full"
                            value={row.emplNo}
                            onChange={(e) =>
                              setCompanyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, emplNo: e.target.value } : r)))
                            }
                            maxLength={MAX_MBRSH.EMPL_NO}
                          />
                        </dd>
                      </dl>
                      <dl>
                        <dt>{i18nText.labelPhone}</dt>
                        <dd>
                          <input
                            type="text"
                            className="f_input w_full"
                            value={row.offmTelno}
                            onChange={(e) =>
                              setCompanyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, offmTelno: e.target.value } : r)))
                            }
                            maxLength={MAX_MBRSH.OFFM_TELNO}
                          />
                        </dd>
                      </dl>
                      <dl>
                        <dt>{i18nText.labelEmail}</dt>
                        <dd>
                          <input
                            type="text"
                            className="f_input w_full"
                            value={row.emailAdres}
                            onChange={(e) =>
                              setCompanyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, emailAdres: e.target.value } : r)))
                            }
                            maxLength={MAX_MBRSH.EMAIL_ADRES}
                          />
                        </dd>
                      </dl>
                      <dl>
                        <dt>{i18nText.labelPosition}</dt>
                        <dd>
                          <select
                            className="f_select w_full"
                            value={row.ofcpsCd}
                            onChange={(e) =>
                              setCompanyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ofcpsCd: e.target.value } : r)))
                            }
                          >
                            <option value="">{i18nText.etcSelect}</option>
                            {(ofcpsByCompany[row.companyCode] ?? []).map((o) => (
                              <option key={o.langSectionCode} value={o.langSectionCode}>
                                {o.langSectionName}
                              </option>
                            ))}
                          </select>
                        </dd>
                      </dl>
                      <dl>
                        <dt>{i18nText.labelJoinDate}</dt>
                        <dd>
                          <input
                            type="date"
                            className="f_input w_full"
                            value={formatYmd(row.ecnyYmd)}
                            onChange={(e) =>
                              setCompanyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ecnyYmd: toYmd(e.target.value) } : r)))
                            }
                          />
                        </dd>
                      </dl>
                      <dl>
                        <dt>{i18nText.labelLeaveDate}</dt>
                        <dd>
                          <input
                            type="date"
                            className="f_input w_full"
                            value={formatYmd(row.retireYmd)}
                            onChange={(e) =>
                              setCompanyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, retireYmd: toYmd(e.target.value) } : r)))
                            }
                          />
                        </dd>
                      </dl>
                      <dl style={{ gridColumn: "1 / -1" }}>
                        <dt>
                          {i18nText.labelDeptName} <span className="req">*</span>
                        </dt>
                        <dd style={{ display: "flex", gap: "8px" }}>
                          <input type="text" className="f_input w_full" readOnly value={row.deptNm} placeholder={i18nText.placeholderDeptSearch} />
                          <button
                            type="button"
                            className="btn btn_blue_h46"
                            disabled={!(row.companyCode ?? "").trim()}
                            onClick={() => {
                              setDeptPopupIndex(idx);
                              setShowDeptPopup(true);
                            }}
                          >
                            {i18nText.btnSearchDepartment}
                          </button>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDeptPopup && deptPopupIndex != null && (companyRows[deptPopupIndex]?.companyCode ?? "").trim() !== "" && (
        <DeptSearchPopup
          companyCode={companyRows[deptPopupIndex].companyCode}
          langCode={langCode}
          onSelect={(deptCd, deptNm) => {
            const i = deptPopupIndex;
            setCompanyRows((rows) => rows.map((r, j) => (j === i ? { ...r, deptCd, deptNm } : r)));
            setShowDeptPopup(false);
            setDeptPopupIndex(null);
          }}
          onClose={() => {
            setShowDeptPopup(false);
            setDeptPopupIndex(null);
          }}
        />
      )}
    </div>
  );
}
