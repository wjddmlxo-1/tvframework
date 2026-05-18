import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { getSessionItem } from "@/utils/storage";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageCodeForApi } from "@/utils/language";
import MultilingualLookupPopup, { MULTILINGUAL_LOOKUP_PLACEHOLDER } from "@/components/MultilingualLookupPopup";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_PROGRAM_I18N_FALLBACK, CMMN_PROGRAM_I18N_KEYS } from "./cmmnProgramI18n";

function CmmnProgramEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { langGb } = useLanguage();
  const state = (location.state as { progrmFileNm?: string; cmpnyCd?: string }) || {};
  const progrmFileNmFromState = state.progrmFileNm;
  const cmpnyCdFromState = state.cmpnyCd;

  const isCreate = !progrmFileNmFromState;
  const cmpnyCdForI18n = String(cmpnyCdFromState ?? getSessionItem("selectedCmpnyCd") ?? "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_PROGRAM_I18N_KEYS, CMMN_PROGRAM_I18N_FALLBACK, {
    cmpnyCd: cmpnyCdForI18n,
  });

  const [form, setForm] = useState({
    cmpnyCd: "",
    progrmFileNm: "",
    progrmStrePath: "",
    progrmNmCode: "",
    messageCn: "",
    progrmUrl: "",
    progrmDc: "",
    useFl: "Y",
  });

  const [showMultilingualPopup, setShowMultilingualPopup] = useState(false);

  useEffect(() => {
    if (isCreate) {
      const fromState = (location.state as { cmpnyCd?: string })?.cmpnyCd;
      const saved = getSessionItem("selectedCmpnyCd");
      const initialCmpnyCd = fromState ?? (saved != null ? String(saved) : "");
      setForm((prev) => ({ ...prev, cmpnyCd: initialCmpnyCd }));
    }
  }, [isCreate, location.state]);

  useEffect(() => {
    const cmpnyCdForDetail = cmpnyCdFromState ?? (getSessionItem("selectedCmpnyCd") != null ? String(getSessionItem("selectedCmpnyCd")) : "");
    if (!isCreate && progrmFileNmFromState) {
      const params = new URLSearchParams();
      params.set("cmpnyCd", cmpnyCdForDetail || "");
      params.set("progId", progrmFileNmFromState);
      params.set("langCode", getLanguageCodeForApi(langGb) || "ko_KR");
      const retrieveURL = `/cmmnProgram/detail?${params.toString()}`;
      const requestOptions = {
        method: "GET",
        headers: { "Content-type": "application/json" },
      };

      EgovNet.requestFetch(
        retrieveURL,
        requestOptions,
        (resp) => {
          if (resp && resp.result) {
            const r = resp.result as { cmpnyCd?: string; progrmFileNm?: string; progrmStrePath?: string; progrmNmCode?: string; messageCn?: string; message_cn?: string; progrmUrl?: string; progrmDc?: string; useFl?: string };
            const messageCn = r.messageCn ?? r.message_cn ?? "";
            setForm({
              cmpnyCd: r.cmpnyCd ?? cmpnyCdForDetail ?? "",
              progrmFileNm: r.progrmFileNm || "",
              progrmStrePath: r.progrmStrePath || "",
              progrmNmCode: r.progrmNmCode || "",
              messageCn,
              progrmUrl: r.progrmUrl || "",
              progrmDc: r.progrmDc || "",
              useFl: r.useFl === "N" ? "N" : "Y",
            });
          }
        },
        () => {
          alert(i18nText.msgErrorOnRetrieve);
          navigate(URL.SYSTEM_PROGRAM);
        }
      );
    }
  }, [isCreate, progrmFileNmFromState, cmpnyCdFromState, langGb, navigate, i18nText.msgErrorOnRetrieve]);

  const cmpnyCdForPopup = form.cmpnyCd || (getSessionItem("selectedCmpnyCd") != null ? String(getSessionItem("selectedCmpnyCd")) : "");

  const handleOpenProgramNameLookup = () => {
    if (!String(cmpnyCdForPopup).trim()) {
      alert(i18nText.msgSelectCompanyBeforeLookup);
      return;
    }
    setShowMultilingualPopup(true);
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault?.();
    if (!form.progrmFileNm?.trim()) {
      alert(i18nText.msgEnterProgramFileName);
      return;
    }
    if (!form.progrmNmCode?.trim()) {
      alert(i18nText.msgEnterProgramName);
      return;
    }

    if (isCreate) {
      const payload = {
        cmpnyCd: form.cmpnyCd || undefined,
        progrmFileNm: form.progrmFileNm,
        progrmStrePath: form.progrmStrePath,
        progrmNmCode: form.progrmNmCode,
        progrmUrl: form.progrmUrl,
        progrmDc: form.progrmDc,
        useFl: form.useFl,
      };
      const requestOptions = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(payload),
      };
      EgovNet.requestFetch(
        "/cmmnProgram",
        requestOptions,
        (resp) => {
          if (resp && resp.resultCode === 200) {
            alert(i18nText.msgRegistered);
            navigate(URL.SYSTEM_PROGRAM);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnCreate);
          }
        },
        () => alert(i18nText.msgErrorOnCreate)
      );
    } else {
      const progrmFileNm = form.progrmFileNm;
      const requestOptions = {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          cmpnyCd: form.cmpnyCd,
          progrmStrePath: form.progrmStrePath,
          progrmNmCode: form.progrmNmCode,
          progrmUrl: form.progrmUrl,
          progrmDc: form.progrmDc,
          useFl: form.useFl,
        }),
      };
      EgovNet.requestFetch(
        `/cmmnProgram/${encodeURIComponent(progrmFileNm)}`,
        requestOptions,
        (resp) => {
          if (resp && resp.resultCode === 200) {
            alert(i18nText.msgUpdated);
            navigate(URL.SYSTEM_PROGRAM);
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
    if (!window.confirm(i18nText.msgConfirmDeleteProgram)) return;

    const progrmFileNm = form.progrmFileNm;
    const q = new URLSearchParams();
    if (form.cmpnyCd) q.set("cmpnyCd", form.cmpnyCd);
    const deleteUrl = `/cmmnProgram/${encodeURIComponent(progrmFileNm)}${q.toString() ? `?${q.toString()}` : ""}`;
    EgovNet.requestFetch(
      deleteUrl,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp && resp.resultCode === 200) {
          alert(i18nText.msgDeleted);
          navigate(URL.SYSTEM_PROGRAM);
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{isCreate ? i18nText.titleProgramCreate : i18nText.titleProgramDetail}</h1>
          <ul>
            <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
            <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
            <li><Link to={URL.SYSTEM_PROGRAM}>{i18nText.pageTitle}</Link></li>
            <li>{isCreate ? i18nText.btnRegister : i18nText.titleProgramDetail}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents contents--program" id="contents">
            <div className="condition md-condition md-condition-plain-row">
              <div className="left-box" />
              <div className="right-box">
                <Link to={URL.SYSTEM_PROGRAM} className="pd-btn">
                  {i18nText.btnList}
                </Link>
                {!isCreate && (
                  <button type="button" className="pd-btn" onClick={handleDelete}>
                    {i18nText.btnDelete}
                  </button>
                )}
                <button type="button" className="pd-btn primary" onClick={() => handleSubmit()}>
                  {isCreate ? i18nText.btnRegister : i18nText.btnSave}
                </button>
              </div>
            </div>

            <div className="md-form-card md-form-card--program">
              <form onSubmit={handleSubmit} id="program-edit-form">
                <div className="board_view2 md-program-edit-form">
                  <dl>
                    <dt>{i18nText.labelFileName} <span className="req">*</span></dt>
                    <dd>
                      <input
                        type="text"
                        className="f_input w_full"
                        value={form.progrmFileNm}
                        onChange={(e) => setForm((prev) => ({ ...prev, progrmFileNm: e.target.value }))}
                        disabled={!isCreate}
                        maxLength={50}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelStorePath} <span className="req">*</span></dt>
                    <dd>
                      <input
                        type="text"
                        className="f_input w_full"
                        value={form.progrmStrePath}
                        onChange={(e) => setForm((prev) => ({ ...prev, progrmStrePath: e.target.value }))}
                        maxLength={500}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelProgramName} <span className="req">*</span></dt>
                    <dd>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
                        <input
                          type="text"
                          className="f_input"
                          value={form.messageCn ?? ""}
                          readOnly
                          placeholder={MULTILINGUAL_LOOKUP_PLACEHOLDER}
                          style={{ flex: 1, minWidth: 0, backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                        />
                        <button
                          type="button"
                          className="pd-btn primary"
                          onClick={handleOpenProgramNameLookup}
                          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          {i18nText.btnSearch}
                        </button>
                      </div>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelUrl}</dt>
                    <dd>
                      <input
                        type="text"
                        className="f_input w_full"
                        value={form.progrmUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, progrmUrl: e.target.value }))}
                        maxLength={500}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelDescription}</dt>
                    <dd>
                      <textarea
                        className="f_txtar w_full"
                        value={form.progrmDc}
                        onChange={(e) => setForm((prev) => ({ ...prev, progrmDc: e.target.value }))}
                        rows={5}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelUseYn}</dt>
                    <dd>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="useFl"
                            value="Y"
                            checked={form.useFl === "Y"}
                            onChange={() => setForm((prev) => ({ ...prev, useFl: "Y" }))}
                          />
                          <span>{i18nText.etcUse}</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="useFl"
                            value="N"
                            checked={form.useFl === "N"}
                            onChange={() => setForm((prev) => ({ ...prev, useFl: "N" }))}
                          />
                          <span>{i18nText.etcNotUse}</span>
                        </label>
                      </div>
                    </dd>
                  </dl>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <MultilingualLookupPopup
        open={showMultilingualPopup}
        onClose={() => setShowMultilingualPopup(false)}
        cmpnyCd={cmpnyCdForPopup}
        langCode={getLanguageCodeForApi(langGb) || "ko_KR"}
        onSelect={(langKey, displayMessage) => {
          setForm((prev) => ({
            ...prev,
            progrmNmCode: langKey,
            messageCn: displayMessage,
          }));
        }}
      />
    </div>
  );
}

export default CmmnProgramEdit;
