import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { getLanguageCodeForApi } from "@/utils/language";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_JOIN_COMPANY_I18N_KEYS,
  CMMN_JOIN_COMPANY_I18N_FALLBACK,
} from "@/pages/login/cmmnLoginAuthI18n";

type CodeOption = { code: string; name: string };
type Terms = { useStplatCn: string; infoProvdAgreCn: string };

const CODE_ID_ENTRPRS = "CMMNCODE.500";
const CODE_ID_INDUTY = "CMMNCODE.510";
const CODE_ID_NATION = "CMMNCODE.520";

const MAX_LEN = {
  CMPNY_CD: 20,
  CMPNY_NM: 60,
  ENTRPRS_GB: 8,
  BSNS_NO: 20,
  CPR_NO: 20,
  CXFC: 50,
  NATION_CD: 2,
  ZIP_CD: 20,
  ADRES_ONE: 200,
  ADRES_TWO: 200,
  CITY_NM: 100,
  STATE_NM: 100,
  OFFM_TELNO: 20,
  FXNUM: 20,
  INDUTY_CD: 6,
  APPLCNT_ID: 20,
  APPLCNT_NM: 60,
  APPLCNT_EMAIL: 50,
} as const;

function truncate(s: string | undefined, max: number): string | undefined {
  if (s == null) return undefined;
  const t = s.trim();
  return t === "" ? undefined : t.slice(0, max);
}

export default function UserJoin() {
  const navigate = useNavigate();
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const i18nText = useCmmnScreenI18n(CMMN_JOIN_COMPANY_I18N_KEYS, CMMN_JOIN_COMPANY_I18N_FALLBACK);
  const cmpnyCdInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    cmpnyCd: "",
    cmpnyNm: "",
    entrprsGb: "",
    indutyCd: "",
    cxfc: "",
    bsnsNo: "",
    cprNo: "",
    adresOne: "",
    adresTwo: "",
    cityNm: "",
    stateNm: "",
    nationCd: "",
    zipCd: "",
    offmTelno: "",
    fxnum: "",
    applcntId: "",
    applcntNm: "",
    applcntEmail: "",
  });

  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [entrprsOptions, setEntrprsOptions] = useState<CodeOption[]>([]);
  const [indutyOptions, setIndutyOptions] = useState<CodeOption[]>([]);
  const [nationOptions, setNationOptions] = useState<CodeOption[]>([]);

  const [termsOpen, setTermsOpen] = useState(false);
  const [terms, setTerms] = useState<Terms>({ useStplatCn: "", infoProvdAgreCn: "" });
  const [agreeUseTerms, setAgreeUseTerms] = useState(false);
  const [agreeInfoTerms, setAgreeInfoTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const loadCodeOptions = useCallback(() => {
    const base = `/cmmnCompany/codeOption?langCode=${encodeURIComponent(langCode)}`;
    EgovNet.requestFetch(
      `${base}&codeId=${encodeURIComponent(CODE_ID_ENTRPRS)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (r) => {
        if (r?.result && Array.isArray(r.result)) setEntrprsOptions(r.result);
      },
      () => setEntrprsOptions([])
    );
    EgovNet.requestFetch(
      `${base}&codeId=${encodeURIComponent(CODE_ID_INDUTY)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (r) => {
        if (r?.result && Array.isArray(r.result)) setIndutyOptions(r.result);
      },
      () => setIndutyOptions([])
    );
    EgovNet.requestFetch(
      `${base}&codeId=${encodeURIComponent(CODE_ID_NATION)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (r) => {
        if (r?.result && Array.isArray(r.result)) setNationOptions(r.result);
      },
      () => setNationOptions([])
    );
  }, [langCode]);

  useEffect(() => {
    loadCodeOptions();
  }, [loadCodeOptions]);

  const handleDuplicateCheck = () => {
    const id = form.cmpnyCd?.trim();
    if (!id) {
      alert(i18nText.msgEnterCompanyIdForDup);
      cmpnyCdInputRef.current?.focus();
      return;
    }
    EgovNet.requestFetch(
      `/cmmnCompany/checkDuplicate?cmpnyCd=${encodeURIComponent(id)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result === "O") {
          setDuplicateChecked(true);
          alert(i18nText.msgIdAvailable);
        } else {
          setDuplicateChecked(false);
          alert(i18nText.msgIdNotAvailable);
          cmpnyCdInputRef.current?.focus();
        }
      },
      () => {
        setDuplicateChecked(false);
        alert(i18nText.msgDupCheckError);
      }
    );
  };

  const openTerms = () => {
    setAgreeUseTerms(false);
    setAgreeInfoTerms(false);
    setTermsOpen(true);
    EgovNet.requestFetch(
      `/cmmnCompany/stplat?langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const r = (resp?.result ?? {}) as Partial<Terms>;
        setTerms({
          useStplatCn: String(r.useStplatCn ?? ""),
          infoProvdAgreCn: String(r.infoProvdAgreCn ?? ""),
        });
      },
      () => setTerms({ useStplatCn: "", infoProvdAgreCn: "" })
    );
  };

  const handleAgree = () => {
    if (!agreeUseTerms || !agreeInfoTerms) {
      alert(i18nText.msgAgreeCheckRequired);
      return;
    }
    setAgreed(true);
    setTermsOpen(false);
  };

  const handleSubmit = () => {
    if (!form.cmpnyCd.trim()) {
      alert(i18nText.msgEnterCompanyId);
      cmpnyCdInputRef.current?.focus();
      return;
    }
    if (!duplicateChecked) {
      alert(i18nText.msgDupMustRun);
      cmpnyCdInputRef.current?.focus();
      return;
    }
    if (!form.cmpnyNm.trim()) {
      alert(i18nText.msgEnterCompanyNm);
      return;
    }
    if (!form.bsnsNo.trim()) {
      alert(i18nText.msgEnterBsnsNo);
      return;
    }
    if (!form.applcntId.trim()) {
      alert(i18nText.msgEnterApplicantId);
      return;
    }
    if (!agreed) {
      alert(i18nText.msgMustAgreeTerms);
      return;
    }

    const applcntId = truncate(form.applcntId, MAX_LEN.APPLCNT_ID) || "";
    const body = {
      cmpnyCd: truncate(form.cmpnyCd, MAX_LEN.CMPNY_CD) || "",
      cmpnyNm: truncate(form.cmpnyNm, MAX_LEN.CMPNY_NM),
      entrprsGb: truncate(form.entrprsGb, MAX_LEN.ENTRPRS_GB),
      indutyCd: truncate(form.indutyCd, MAX_LEN.INDUTY_CD),
      cxfc: truncate(form.cxfc, MAX_LEN.CXFC),
      bsnsNo: truncate(form.bsnsNo, MAX_LEN.BSNS_NO),
      cprNo: truncate(form.cprNo, MAX_LEN.CPR_NO),
      adresOne: truncate(form.adresOne, MAX_LEN.ADRES_ONE),
      adresTwo: truncate(form.adresTwo, MAX_LEN.ADRES_TWO),
      cityNm: truncate(form.cityNm, MAX_LEN.CITY_NM),
      stateNm: truncate(form.stateNm, MAX_LEN.STATE_NM),
      nationCd: truncate(form.nationCd, MAX_LEN.NATION_CD),
      zipCd: truncate(form.zipCd, MAX_LEN.ZIP_CD),
      offmTelno: truncate(form.offmTelno, MAX_LEN.OFFM_TELNO),
      fxnum: truncate(form.fxnum, MAX_LEN.FXNUM),
      applcntId,
      applcntNm: truncate(form.applcntNm, MAX_LEN.APPLCNT_NM),
      applcntEmail: truncate(form.applcntEmail, MAX_LEN.APPLCNT_EMAIL),
      sbscrbSttus: "A",
      useFl: "Y",
    };

    EgovNet.requestFetch(
      "/cmmnCompany/join",
      { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgJoinCompleted);
          navigate(URL.LOGIN);
        } else {
          alert(resp?.resultMessage || i18nText.msgJoinSaveFail);
        }
      },
      () => alert(i18nText.msgJoinSaveFailNet)
    );
  };

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.titleSignUp}</h1>
          <ul>
            <li><Link to={URL.MAIN} className="home">Home</Link></li>
            <li>{i18nText.titleSignUp}</li>
          </ul>
        </div>
        <div className="layout">
          <div className="contents contents--author contents--group contents--company" id="contents">
            <div className="md-form-card md-form-card--company">
              <div className="md-page-header" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button type="button" className="btn btn_skyblue_h46" onClick={openTerms}>{i18nText.btnConfirmTerms}</button>
                  <button type="button" className="btn btn_blue_h46" onClick={handleSubmit}>{i18nText.btnSave}</button>
                </div>
              </div>
              <div className="board_view2 md-program-edit-form md-company-edit-form">
                <div style={{ padding: "8px 0 12px 0", color: "#333", lineHeight: 1.6 }}>
                  <div><strong>{i18nText.etcBizRuleTitle}</strong></div>
                  <div>{i18nText.etcBizRuleLine}</div>
                  <div style={{ marginTop: 8 }}><strong>{i18nText.etcAdminMemoTitle}</strong></div>
                  <div>{i18nText.etcAdminMemo1}</div>
                  <div>{i18nText.etcAdminMemo2}</div>
                </div>
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelCompanyId} <span className="req">*</span></dt>
                    <dd>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          ref={cmpnyCdInputRef}
                          type="text"
                          className="f_input w_full"
                          value={form.cmpnyCd}
                          onChange={(e) => { setForm((f) => ({ ...f, cmpnyCd: e.target.value })); setDuplicateChecked(false); }}
                          maxLength={MAX_LEN.CMPNY_CD}
                        />
                        <button type="button" className="btn btn_skyblue_h46" onClick={handleDuplicateCheck}>{i18nText.btnDupCheckId}</button>
                      </div>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelCompanyNm} <span className="req">*</span></dt>
                    <dd><input type="text" className="f_input w_full" value={form.cmpnyNm} onChange={(e) => setForm((f) => ({ ...f, cmpnyNm: e.target.value }))} maxLength={MAX_LEN.CMPNY_NM} /></dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelEntrprsGb}</dt>
                    <dd>
                      <select className="f_select w_full" value={form.entrprsGb} onChange={(e) => setForm((f) => ({ ...f, entrprsGb: e.target.value }))}>
                        <option value="">{i18nText.etcSelect}</option>
                        {entrprsOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                </div>
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelIndutyCd}</dt>
                    <dd>
                      <select className="f_select w_full" value={form.indutyCd} onChange={(e) => setForm((f) => ({ ...f, indutyCd: e.target.value }))}>
                        <option value="">{i18nText.etcSelect}</option>
                        {indutyOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                  <dl><dt>{i18nText.labelCxfc}</dt><dd><input type="text" className="f_input w_full" value={form.cxfc} onChange={(e) => setForm((f) => ({ ...f, cxfc: e.target.value }))} maxLength={MAX_LEN.CXFC} /></dd></dl>
                  <dl><dt>{i18nText.labelBsnsNo} <span className="req">*</span></dt><dd><input type="text" className="f_input w_full" value={form.bsnsNo} onChange={(e) => setForm((f) => ({ ...f, bsnsNo: e.target.value }))} maxLength={MAX_LEN.BSNS_NO} /></dd></dl>
                </div>
                <div className="md-company-edit-form__row">
                  <dl><dt>{i18nText.labelCprNo}</dt><dd><input type="text" className="f_input w_full" value={form.cprNo} onChange={(e) => setForm((f) => ({ ...f, cprNo: e.target.value }))} maxLength={MAX_LEN.CPR_NO} /></dd></dl>
                  <dl><dt>{i18nText.labelCityNm}</dt><dd><input type="text" className="f_input w_full" value={form.cityNm} onChange={(e) => setForm((f) => ({ ...f, cityNm: e.target.value }))} maxLength={MAX_LEN.CITY_NM} /></dd></dl>
                  <dl><dt>{i18nText.labelStateNm}</dt><dd><input type="text" className="f_input w_full" value={form.stateNm} onChange={(e) => setForm((f) => ({ ...f, stateNm: e.target.value }))} maxLength={MAX_LEN.STATE_NM} /></dd></dl>
                </div>
                <div className="md-company-edit-form__row md-company-edit-form__row--full">
                  <dl><dt>{i18nText.labelAddrOne}</dt><dd><input type="text" className="f_input w_full" value={form.adresOne} onChange={(e) => setForm((f) => ({ ...f, adresOne: e.target.value }))} maxLength={MAX_LEN.ADRES_ONE} /></dd></dl>
                </div>
                <div className="md-company-edit-form__row md-company-edit-form__row--full">
                  <dl><dt>{i18nText.labelAddrTwo}</dt><dd><input type="text" className="f_input w_full" value={form.adresTwo} onChange={(e) => setForm((f) => ({ ...f, adresTwo: e.target.value }))} maxLength={MAX_LEN.ADRES_TWO} /></dd></dl>
                </div>
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelNationCd}</dt>
                    <dd>
                      <select className="f_select w_full" value={form.nationCd} onChange={(e) => setForm((f) => ({ ...f, nationCd: e.target.value }))}>
                        <option value="">{i18nText.etcSelect}</option>
                        {nationOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                  <dl><dt>{i18nText.labelZipCd}</dt><dd><input type="text" className="f_input w_full" value={form.zipCd} onChange={(e) => setForm((f) => ({ ...f, zipCd: e.target.value }))} maxLength={MAX_LEN.ZIP_CD} /></dd></dl>
                  <dl><dt>{i18nText.labelOffmTelno}</dt><dd><input type="text" className="f_input w_full" value={form.offmTelno} onChange={(e) => setForm((f) => ({ ...f, offmTelno: e.target.value }))} maxLength={MAX_LEN.OFFM_TELNO} /></dd></dl>
                </div>
                <div className="md-company-edit-form__row">
                  <dl><dt>{i18nText.labelFxnum}</dt><dd><input type="text" className="f_input w_full" value={form.fxnum} onChange={(e) => setForm((f) => ({ ...f, fxnum: e.target.value }))} maxLength={MAX_LEN.FXNUM} /></dd></dl>
                  <dl><dt>{i18nText.labelApplcntId} <span className="req">*</span></dt><dd><input type="text" className="f_input w_full" value={form.applcntId} onChange={(e) => setForm((f) => ({ ...f, applcntId: e.target.value }))} maxLength={MAX_LEN.APPLCNT_ID} /></dd></dl>
                  <dl><dt>{i18nText.labelApplcntNm}</dt><dd><input type="text" className="f_input w_full" value={form.applcntNm} onChange={(e) => setForm((f) => ({ ...f, applcntNm: e.target.value }))} maxLength={MAX_LEN.APPLCNT_NM} /></dd></dl>
                </div>
                <div className="md-company-edit-form__row">
                  <dl><dt>{i18nText.labelApplcntEmail}</dt><dd><input type="text" className="f_input w_full" value={form.applcntEmail} onChange={(e) => setForm((f) => ({ ...f, applcntEmail: e.target.value }))} maxLength={MAX_LEN.APPLCNT_EMAIL} /></dd></dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {termsOpen && (
        <div className="wrap_pop" style={{ display: "block" }}>
          <div className="pop_inner pop_inner_w800 pop_msg_edit">
            <div className="pop_header">
              <h1>{i18nText.popupTermsTitle}</h1>
              <button className="btn close" type="button" onClick={() => setTermsOpen(false)}>
                {i18nText.btnClose}
              </button>
            </div>
            <div className="pop_container">
              <div className="board_view2 pop_form_label_top">
                <dl>
                  <dt>{i18nText.labelTermsCn}</dt>
                  <dd>
                    <textarea className="f_txtar w_full" readOnly value={terms.useStplatCn} />
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <input type="checkbox" checked={agreeUseTerms} onChange={(e) => setAgreeUseTerms(e.target.checked)} />
                      {i18nText.labelAgreeTerms}
                    </label>
                  </dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelInfoConsentCn}</dt>
                  <dd>
                    <textarea className="f_txtar w_full" readOnly value={terms.infoProvdAgreCn} />
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <input type="checkbox" checked={agreeInfoTerms} onChange={(e) => setAgreeInfoTerms(e.target.checked)} />
                      {i18nText.labelAgreeInfo}
                    </label>
                  </dd>
                </dl>
              </div>
              <div className="board_btn_area">
                <div className="right_col btn1">
                  <button
                    type="button"
                    className="btn btn_skyblue_h46 w_100"
                    onClick={() => {
                      setTermsOpen(false);
                      setAgreed(false);
                      alert(i18nText.msgRejectNoSignup);
                    }}
                  >
                    {i18nText.btnDisagree}
                  </button>
                  <button type="button" className="btn btn_blue_h46 w_100" onClick={handleAgree}>
                    {i18nText.btnAgree}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
