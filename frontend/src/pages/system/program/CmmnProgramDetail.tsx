import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { getSessionItem } from "@/utils/storage";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_PROGRAM_I18N_FALLBACK, CMMN_PROGRAM_I18N_KEYS } from "./cmmnProgramI18n";

interface DetailState {
  progrmFileNm?: string;
  progrmNmCode?: string;
  progrmStrePath?: string;
  progrmUrl?: string;
  progrmDc?: string;
  useFl?: string;
}

function CmmnProgramDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { progrmFileNm?: string; cmpnyCd?: string }) || {};
  const progrmFileNm = state.progrmFileNm || "";
  const cmpnyCd = state.cmpnyCd || "";
  const cmpnyCdForI18n = String(cmpnyCd || getSessionItem("selectedCmpnyCd") || "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_PROGRAM_I18N_KEYS, CMMN_PROGRAM_I18N_FALLBACK, {
    cmpnyCd: cmpnyCdForI18n,
  });

  const [detail, setDetail] = useState<DetailState>({});

  useEffect(() => {
    if (!progrmFileNm) {
      navigate(URL.SYSTEM_PROGRAM);
      return;
    }
    const params = new URLSearchParams();
    if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
    params.set("progId", progrmFileNm);
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
          setDetail(resp.result);
        }
      },
      () => {
        alert(i18nText.msgErrorOnRetrieve);
        navigate(URL.SYSTEM_PROGRAM);
      }
    );
  }, [progrmFileNm, cmpnyCd, navigate, i18nText.msgErrorOnRetrieve]);

  return (
    <>
      <div className="container">
        <div className="c_wrap">
          <div className="location">
            <h1 className="location__title">{i18nText.titleProgramDetail}</h1>
            <ul>
              <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
              <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
              <li><Link to={URL.SYSTEM_PROGRAM}>{i18nText.pageTitle}</Link></li>
              <li>{i18nText.titleProgramDetail}</li>
            </ul>
          </div>

          <div className="layout">
            <div className="contents contents--program" id="contents">
              <div className="md-form-card md-form-card--program">
                <div className="md-page-header">
                  <div className="md-page-actions">
                    <button
                      type="button"
                      className="btn btn_blue_h46"
                      onClick={() => navigate(URL.SYSTEM_PROGRAM_MODIFY, { state: { progrmFileNm, cmpnyCd } })}
                    >
                      {i18nText.btnSave}
                    </button>
                    <button type="button" className="btn btn_skyblue_h46" onClick={() => navigate(URL.SYSTEM_PROGRAM)}>
                      {i18nText.btnList}
                    </button>
                  </div>
                </div>

                <div className="board_view2">
                <dl>
                  <dt>{i18nText.labelFileName}</dt>
                  <dd>{detail.progrmFileNm || ""}</dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelStorePath}</dt>
                  <dd>{detail.progrmStrePath || ""}</dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelProgramName}</dt>
                  <dd>{detail.progrmNmCode || ""}</dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelUrl}</dt>
                  <dd>{detail.progrmUrl || ""}</dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelDescription}</dt>
                  <dd>{detail.progrmDc || ""}</dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelUseYn}</dt>
                  <dd>{detail.useFl === "Y" ? i18nText.etcUse : i18nText.etcNotUse}</dd>
                </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CmmnProgramDetail;
