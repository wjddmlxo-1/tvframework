import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { getLanguageCodeForApi } from "@/utils/language";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import { CMMN_COMPANY_I18N_KEYS, CMMN_COMPANY_I18N_FALLBACK } from "./cmmnCompanyI18n";

type CodeOption = { code: string; name: string };

type Mode = "create" | "detail" | "modify";

const CODE_ID_ENTRPRS = "CMMNCODE.500";
const CODE_ID_INDUTY = "CMMNCODE.510";
const CODE_ID_NATION = "CMMNCODE.520";
const CODE_ID_SBSCRB = "CMMNCODE.540";

/** CM_CMPNY 컬럼 길이 제한 (저장/수정 시 초과 방지) */
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
  SBSCRB_STTUS: 2,
  APPLCNT_NM: 60,
  APPLCNT_EMAIL: 50,
  USE_FL: 1,
} as const;

function truncate(s: string | undefined, max: number): string | undefined {
  if (s == null) return undefined;
  const t = s.trim();
  return t === "" ? undefined : t.slice(0, max);
}

function CmmnCompanyEdit(props: { mode: Mode }) {
  const { mode } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { langGb } = useLanguage();
  const state = (location.state as { cmpnyCd?: string }) || {};
  const cmpnyCdFromState = state.cmpnyCd;

  const isCreate = mode === "create";
  const isDetail = mode === "detail";
  const isModify = mode === "modify";
  /** 상세/수정 페이지 진입 시 바로 수정 모드 → 저장 버튼 표시 */
  const isReadOnly = false;

  const langCode = getLanguageCodeForApi(langGb);

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
    applcntNm: "",
    applcntEmail: "",
    sbscrbSttus: "",
    exprtnYmd: "9999-12-30",
    useFl: "Y",
  });
  const cmpnyForI18n = String(form.cmpnyCd ?? "").trim() || null;
  const i18nText = useCmmnScreenI18n(CMMN_COMPANY_I18N_KEYS, CMMN_COMPANY_I18N_FALLBACK, { cmpnyCd: cmpnyForI18n });

  const [entrprsOptions, setEntrprsOptions] = useState<CodeOption[]>([]);
  const [indutyOptions, setIndutyOptions] = useState<CodeOption[]>([]);
  const [sbscrbOptions, setSbscrbOptions] = useState<CodeOption[]>([]);
  const [nationOptions, setNationOptions] = useState<CodeOption[]>([]);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const cmpnyCdInputRef = useRef<HTMLInputElement>(null);

  const loadCodeOptions = useCallback(() => {
    const base = `/cmmnCompany/codeOption?langCode=${encodeURIComponent(langCode)}`;
    EgovNet.requestFetch(`${base}&codeId=${encodeURIComponent(CODE_ID_ENTRPRS)}`, { method: "GET", headers: { "Content-type": "application/json" } }, (r) => {
      if (r?.result && Array.isArray(r.result)) setEntrprsOptions(r.result);
    }, () => setEntrprsOptions([]));
    EgovNet.requestFetch(`${base}&codeId=${encodeURIComponent(CODE_ID_INDUTY)}`, { method: "GET", headers: { "Content-type": "application/json" } }, (r) => {
      if (r?.result && Array.isArray(r.result)) setIndutyOptions(r.result);
    }, () => setIndutyOptions([]));
    EgovNet.requestFetch(`${base}&codeId=${encodeURIComponent(CODE_ID_SBSCRB)}`, { method: "GET", headers: { "Content-type": "application/json" } }, (r) => {
      if (r?.result && Array.isArray(r.result)) setSbscrbOptions(r.result);
    }, () => setSbscrbOptions([]));
    EgovNet.requestFetch(`${base}&codeId=${encodeURIComponent(CODE_ID_NATION)}`, { method: "GET", headers: { "Content-type": "application/json" } }, (r) => {
      if (r?.result && Array.isArray(r.result)) setNationOptions(r.result);
    }, () => setNationOptions([]));
  }, [langCode]);

  useEffect(() => {
    loadCodeOptions();
  }, [loadCodeOptions]);

  const loadDetail = useCallback(() => {
    if (!cmpnyCdFromState) return;
    EgovNet.requestFetch(
      `/cmmnCompany/detail?cmpnyCd=${encodeURIComponent(cmpnyCdFromState)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result) {
          const r = resp.result as Record<string, unknown>;
          setForm({
            cmpnyCd: String(r.cmpnyCd ?? ""),
            cmpnyNm: String(r.cmpnyNm ?? ""),
            entrprsGb: String(r.entrprsGb ?? ""),
            indutyCd: String(r.indutyCd ?? ""),
            cxfc: String(r.cxfc ?? ""),
            bsnsNo: String(r.bsnsNo ?? ""),
            cprNo: String(r.cprNo ?? ""),
            adresOne: String(r.adresOne ?? ""),
            adresTwo: String(r.adresTwo ?? ""),
            cityNm: String(r.cityNm ?? ""),
            stateNm: String(r.stateNm ?? ""),
            nationCd: String(r.nationCd ?? ""),
            zipCd: String(r.zipCd ?? ""),
            offmTelno: String(r.offmTelno ?? ""),
            fxnum: String(r.fxnum ?? ""),
            applcntNm: String(r.applcntNm ?? ""),
            applcntEmail: String(r.applcntEmail ?? ""),
            sbscrbSttus: String(r.sbscrbSttus ?? ""),
            exprtnYmd: (() => {
              const raw = String(r.exprtnYmd ?? "");
              if (raw.length === 8) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
              return raw.slice(0, 10) || "9999-12-30";
            })(),
            useFl: r.useFl === "N" ? "N" : "Y",
          });
        }
      },
      () => {
        alert(i18nText.msgErrorOnRetrieve);
        navigate(URL.SYSTEM_COMPANY);
      }
    );
  }, [cmpnyCdFromState, navigate, i18nText.msgErrorOnRetrieve]);

  useEffect(() => {
    if (!isCreate && cmpnyCdFromState) loadDetail();
  }, [isCreate, cmpnyCdFromState, loadDetail]);

  const handleDuplicateCheck = () => {
    const id = form.cmpnyCd?.trim();
    if (!id) {
      alert(i18nText.msgEnterCompanyIdForDuplicateCheck);
      cmpnyCdInputRef.current?.focus();
      return;
    }
    EgovNet.requestFetch(
      `/cmmnCompany/checkDuplicate?cmpnyCd=${encodeURIComponent(id)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const possible = resp?.result;
        if (possible === "O") {
          setDuplicateChecked(true);
          alert(i18nText.msgDuplicateIdAvailable);
        } else {
          setDuplicateChecked(false);
          alert(i18nText.msgDuplicateIdUnavailable);
          cmpnyCdInputRef.current?.focus();
        }
      },
      () => {
        setDuplicateChecked(false);
        alert(i18nText.msgDuplicateCheckError);
      }
    );
  };

  const handleSubmit = () => {
    if (!form.cmpnyCd?.trim()) {
      alert(i18nText.msgEnterCompanyId);
      cmpnyCdInputRef.current?.focus();
      return;
    }
    if (!form.cmpnyNm?.trim()) {
      alert(i18nText.msgEnterCompanyName);
      return;
    }
    if (!form.bsnsNo?.trim()) {
      alert(i18nText.msgEnterBsnsNo);
      return;
    }
    if (isCreate) {
      if (!duplicateChecked) {
        alert(i18nText.msgRequireDuplicateCheck);
        cmpnyCdInputRef.current?.focus();
        return;
      }
    }

    const body = {
      cmpnyCd: truncate(form.cmpnyCd, MAX_LEN.CMPNY_CD),
      cmpnyNm: truncate(form.cmpnyNm, MAX_LEN.CMPNY_NM),
      entrprsGb: truncate(form.entrprsGb, MAX_LEN.ENTRPRS_GB) || undefined,
      indutyCd: truncate(form.indutyCd, MAX_LEN.INDUTY_CD) || undefined,
      cxfc: truncate(form.cxfc, MAX_LEN.CXFC) || undefined,
      bsnsNo: truncate(form.bsnsNo, MAX_LEN.BSNS_NO) || undefined,
      cprNo: truncate(form.cprNo, MAX_LEN.CPR_NO) || undefined,
      adresOne: truncate(form.adresOne, MAX_LEN.ADRES_ONE) || undefined,
      adresTwo: truncate(form.adresTwo, MAX_LEN.ADRES_TWO) || undefined,
      cityNm: truncate(form.cityNm, MAX_LEN.CITY_NM) || undefined,
      stateNm: truncate(form.stateNm, MAX_LEN.STATE_NM) || undefined,
      nationCd: truncate(form.nationCd, MAX_LEN.NATION_CD) || undefined,
      zipCd: truncate(form.zipCd, MAX_LEN.ZIP_CD) || undefined,
      offmTelno: truncate(form.offmTelno, MAX_LEN.OFFM_TELNO) || undefined,
      fxnum: truncate(form.fxnum, MAX_LEN.FXNUM) || undefined,
      applcntNm: truncate(form.applcntNm, MAX_LEN.APPLCNT_NM) || undefined,
      applcntEmail: truncate(form.applcntEmail, MAX_LEN.APPLCNT_EMAIL) || undefined,
      sbscrbSttus: truncate(form.sbscrbSttus, MAX_LEN.SBSCRB_STTUS) || undefined,
      exprtnYmd: form.exprtnYmd ? form.exprtnYmd.replace(/-/g, "").slice(0, 8) : undefined,
      useFl: (form.useFl || "Y").slice(0, MAX_LEN.USE_FL),
    };

    if (isCreate) {
      EgovNet.requestFetch(
        "/cmmnCompany",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgRegistered);
            navigate(URL.SYSTEM_COMPANY);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnRegister);
            const focusInfo = resp?.result as { duplicateKey?: string } | undefined;
            if (focusInfo?.duplicateKey === "CMPNY_CD") {
              setTimeout(() => document.getElementById("companyEdit_cmpnyCd")?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnRegister)
      );
    } else {
      EgovNet.requestFetch(
        "/cmmnCompany",
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgUpdated);
            navigate(URL.SYSTEM_COMPANY);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnUpdate);
          }
        },
        () => alert(i18nText.msgErrorOnUpdate)
      );
    }
  };

  const handleDelete = () => {
    if (isCreate) return;
    if (!window.confirm(i18nText.msgConfirmDeleteSingleCompany)) return;
    EgovNet.requestFetch(
      `/cmmnCompany?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgDeleted);
          navigate(URL.SYSTEM_COMPANY);
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  if (!isCreate && !cmpnyCdFromState) {
    navigate(URL.SYSTEM_COMPANY);
    return null;
  }

  const pageTitle = isCreate ? i18nText.titleCompanyCreate : i18nText.titleCompanyDetail;

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{pageTitle}</h1>
          <ul>
            <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
            <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
            <li><Link to={URL.SYSTEM_COMPANY}>{i18nText.pageTitle}</Link></li>
            <li>{pageTitle}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents contents--company" id="contents">
            <div className="condition md-condition md-condition-plain-row">
              <div className="left-box" />
              <div className="right-box">
                <button type="button" className="pd-btn" onClick={() => navigate(URL.SYSTEM_COMPANY)}>{i18nText.btnList}</button>
                {!isCreate && (
                  <button type="button" className="pd-btn" onClick={handleDelete}>{i18nText.btnDelete}</button>
                )}
                <button type="button" className="pd-btn primary" onClick={handleSubmit}>{i18nText.btnSave}</button>
              </div>
            </div>

            <div className="md-form-card md-form-card--company">
              <div className="board_view2 md-program-edit-form md-company-edit-form">
                {/* 1행: 회사ID*, 회사명*, 기업구분 */}
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelCompanyId} <span className="req">*</span></dt>
                    <dd>
                      <div className="md-input-group" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          id="companyEdit_cmpnyCd"
                          ref={cmpnyCdInputRef}
                          type="text"
                          className="f_input w_full"
                          value={form.cmpnyCd}
                          onChange={(e) => { setForm((f) => ({ ...f, cmpnyCd: e.target.value })); setDuplicateChecked(false); }}
                          readOnly={!isCreate}
                          placeholder={i18nText.placeholderCompanyId}
                          maxLength={MAX_LEN.CMPNY_CD}
                        />
                        {isCreate && (
                          <button type="button" className="btn btn_skyblue_h46" onClick={handleDuplicateCheck} style={{ flexShrink: 0 }}>{i18nText.btnDuplicateCheck}</button>
                        )}
                      </div>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelCompanyName} <span className="req">*</span></dt>
                    <dd>
                      <input
                        id="companyEdit_cmpnyNm"
                        type="text"
                        className="f_input w_full"
                        value={form.cmpnyNm}
                        onChange={(e) => setForm((f) => ({ ...f, cmpnyNm: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderCompanyName}
                        maxLength={MAX_LEN.CMPNY_NM}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelEntrprsGb}</dt>
                    <dd>
                      <select
                        id="companyEdit_entrprsGb"
                        className="f_select w_full"
                        value={form.entrprsGb}
                        onChange={(e) => setForm((f) => ({ ...f, entrprsGb: e.target.value }))}
                        disabled={isReadOnly}
                      >
                        <option value="">{i18nText.labelSelectOption}</option>
                        {entrprsOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                </div>
                {/* 2행: 업종코드, 대표이사 이름, 사업자 등록번호* */}
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelIndutyCd}</dt>
                    <dd>
                      <select
                        id="companyEdit_indutyCd"
                        className="f_select w_full"
                        value={form.indutyCd}
                        onChange={(e) => setForm((f) => ({ ...f, indutyCd: e.target.value }))}
                        disabled={isReadOnly}
                      >
                        <option value="">{i18nText.labelSelectOption}</option>
                        {indutyOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelCxfc}</dt>
                    <dd>
                      <input
                        id="companyEdit_cxfc"
                        type="text"
                        className="f_input w_full"
                        value={form.cxfc}
                        onChange={(e) => setForm((f) => ({ ...f, cxfc: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderCxfc}
                        maxLength={MAX_LEN.CXFC}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelBsnsNo} <span className="req">*</span></dt>
                    <dd>
                      <input
                        id="companyEdit_bsnsNo"
                        type="text"
                        className="f_input w_full"
                        value={form.bsnsNo}
                        onChange={(e) => setForm((f) => ({ ...f, bsnsNo: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderBsnsNo}
                        maxLength={MAX_LEN.BSNS_NO}
                      />
                    </dd>
                  </dl>
                </div>
                {/* 3행: 법인 등록번호, 회사정보 상태코드, 만기일 */}
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelCprNo}</dt>
                    <dd>
                      <input
                        id="companyEdit_cprNo"
                        type="text"
                        className="f_input w_full"
                        value={form.cprNo}
                        onChange={(e) => setForm((f) => ({ ...f, cprNo: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderCprNo}
                        maxLength={MAX_LEN.CPR_NO}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelCompanyStatusCode}</dt>
                    <dd>
                      <select
                        id="companyEdit_sbscrbSttus"
                        className="f_select w_full"
                        value={form.sbscrbSttus}
                        onChange={(e) => setForm((f) => ({ ...f, sbscrbSttus: e.target.value }))}
                        disabled={isReadOnly}
                      >
                        <option value="">{i18nText.labelSelectOption}</option>
                        {sbscrbOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelExpireDate}</dt>
                    <dd>
                      <input
                        id="companyEdit_exprtnYmd"
                        type="date"
                        className="f_input w_full"
                        value={form.exprtnYmd}
                        onChange={(e) => setForm((f) => ({ ...f, exprtnYmd: e.target.value }))}
                        readOnly={isReadOnly}
                      />
                    </dd>
                  </dl>
                </div>
                {/* 3행: 주소 1 (전체폭) */}
                <div className="md-company-edit-form__row md-company-edit-form__row--full">
                  <dl>
                    <dt>{i18nText.labelAddress1}</dt>
                    <dd>
                      <input
                        id="companyEdit_adresOne"
                        type="text"
                        className="f_input w_full"
                        value={form.adresOne}
                        onChange={(e) => setForm((f) => ({ ...f, adresOne: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderAddress1}
                        maxLength={MAX_LEN.ADRES_ONE}
                      />
                    </dd>
                  </dl>
                </div>
                {/* 4행: 주소 2 (전체폭) */}
                <div className="md-company-edit-form__row md-company-edit-form__row--full">
                  <dl>
                    <dt>{i18nText.labelAddress2}</dt>
                    <dd>
                      <input
                        id="companyEdit_adresTwo"
                        type="text"
                        className="f_input w_full"
                        value={form.adresTwo}
                        onChange={(e) => setForm((f) => ({ ...f, adresTwo: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderAddress2}
                        maxLength={MAX_LEN.ADRES_TWO}
                      />
                    </dd>
                  </dl>
                </div>
                {/* 5행: 도시, 주/도/광역시, 국가 */}
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelCity}</dt>
                    <dd>
                      <input
                        id="companyEdit_cityNm"
                        type="text"
                        className="f_input w_full"
                        value={form.cityNm}
                        onChange={(e) => setForm((f) => ({ ...f, cityNm: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderCity}
                        maxLength={MAX_LEN.CITY_NM}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelStateRegion}</dt>
                    <dd>
                      <input
                        id="companyEdit_stateNm"
                        type="text"
                        className="f_input w_full"
                        value={form.stateNm}
                        onChange={(e) => setForm((f) => ({ ...f, stateNm: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderStateRegion}
                        maxLength={MAX_LEN.STATE_NM}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelNation}</dt>
                    <dd>
                      <select
                        id="companyEdit_nationCd"
                        className="f_select w_full"
                        value={form.nationCd}
                        onChange={(e) => setForm((f) => ({ ...f, nationCd: e.target.value }))}
                        disabled={isReadOnly}
                      >
                        <option value="">{i18nText.labelSelectOption}</option>
                        {nationOptions.map((o) => <option key={o.code} value={o.code}>{o.name}</option>)}
                      </select>
                    </dd>
                  </dl>
                </div>
                {/* 6행: 우편번호, 전화번호, 팩스번호 */}
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelZipCd}</dt>
                    <dd>
                      <input
                        id="companyEdit_zipCd"
                        type="text"
                        className="f_input w_full"
                        value={form.zipCd}
                        onChange={(e) => setForm((f) => ({ ...f, zipCd: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderZipCd}
                        maxLength={MAX_LEN.ZIP_CD}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelPhoneNumber}</dt>
                    <dd>
                      <input
                        id="companyEdit_offmTelno"
                        type="text"
                        className="f_input w_full"
                        value={form.offmTelno}
                        onChange={(e) => setForm((f) => ({ ...f, offmTelno: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderPhone}
                        maxLength={MAX_LEN.OFFM_TELNO}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelFax}</dt>
                    <dd>
                      <input
                        id="companyEdit_fxnum"
                        type="text"
                        className="f_input w_full"
                        value={form.fxnum}
                        onChange={(e) => setForm((f) => ({ ...f, fxnum: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.placeholderFax}
                        maxLength={MAX_LEN.FXNUM}
                      />
                    </dd>
                  </dl>
                </div>
                {/* 7행: 신청자 이름, 신청자 이메일 */}
                <div className="md-company-edit-form__row">
                  <dl>
                    <dt>{i18nText.labelApplicantName}</dt>
                    <dd>
                      <input
                        id="companyEdit_applcntNm"
                        type="text"
                        className="f_input w_full"
                        value={form.applcntNm}
                        onChange={(e) => setForm((f) => ({ ...f, applcntNm: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.labelApplicantName}
                        maxLength={MAX_LEN.APPLCNT_NM}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelApplicantEmail}</dt>
                    <dd>
                      <input
                        id="companyEdit_applcntEmail"
                        type="text"
                        className="f_input w_full"
                        value={form.applcntEmail}
                        onChange={(e) => setForm((f) => ({ ...f, applcntEmail: e.target.value }))}
                        readOnly={isReadOnly}
                        placeholder={i18nText.labelApplicantEmail}
                        maxLength={MAX_LEN.APPLCNT_EMAIL}
                      />
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnCompanyEdit;
