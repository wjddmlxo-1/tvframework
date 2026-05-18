import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import CmmnAuthorList from "./CmmnAuthorList";
import { CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK } from "./cmmnAuthorI18n";
import CmmnAuthorEdit from "./CmmnAuthorEdit";
import CmmnAuthorStructureTab from "./CmmnAuthorStructureTab";
import CmmnRoleTab from "./CmmnRoleTab";

type MainTab = "auth" | "structure" | "role";

type AuthorRightPanel = { kind: "create" } | { kind: "detail"; cmpnyCd: string; authorCd: string };

/**
 * 권한관리 통합 화면 (탭: 권한 관리 | 권한구조 | 롤 관리)
 * 회사 목록은 useCompanyList → GET /cmmnMessage/companies (백엔드 CmmnMessageMapper.selectCompanyList)
 */
function CmmnAuthorManage() {
  const { langGb } = useLanguage();
  const [mainTab, setMainTab] = useState<MainTab>("auth");
  const { companyList, cmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK, { cmpnyCd });
  const [authorRightPanel, setAuthorRightPanel] = useState<AuthorRightPanel>({ kind: "create" });
  const [authorListRefreshToken, setAuthorListRefreshToken] = useState(0);

  const onCompanyChange = (v: string) => {
    syncCompanySession(v);
    setAuthorRightPanel({ kind: "create" });
  };

  const onAuthorEmbeddedCommit = useCallback(() => {
    setAuthorListRefreshToken((t) => t + 1);
    setAuthorRightPanel({ kind: "create" });
  }, []);

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.pageTitle}</h1>
          <ul>
            <li>
              <Link to={URL.MAIN} className="home">
                {i18nText.navHome}
              </Link>
            </li>
            <li>
              <Link to={URL.SYSTEM}>{i18nText.navSystem}</Link>
            </li>
            <li>{i18nText.pageTitle}</li>
          </ul>
        </div>

        <div className="layout">
          <div
            className="contents contents--author"
            id="contents"
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
          >
            <div className="au-tab-header">
              <button
                type="button"
                className={`au-tab${mainTab === "auth" ? " active" : ""}`}
                onClick={() => setMainTab("auth")}
              >
                {i18nText.titleTabAuthManage}
              </button>
              <button
                type="button"
                className={`au-tab${mainTab === "structure" ? " active" : ""}`}
                onClick={() => setMainTab("structure")}
              >
                {i18nText.titleTabAuthStructure}
              </button>
              <button
                type="button"
                className={`au-tab${mainTab === "role" ? " active" : ""}`}
                onClick={() => setMainTab("role")}
              >
                {i18nText.titleTabRoleManage}
              </button>
              <div className="au-tab-right">
                <label className="f_select" htmlFor="authorManage_cmpnyCd">
                  <select id="authorManage_cmpnyCd" value={cmpnyCd} onChange={(e) => onCompanyChange(e.target.value)} title={i18nText.labelCompanyName}>
                    {companyList.map((c) => (
                      <option key={c.cmpnyCd} value={c.cmpnyCd}>
                        {c.cmpnyNm}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {mainTab === "auth" && (
              <div style={{ display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}>
                <CmmnAuthorEdit
                  key={authorRightPanel.kind === "detail" ? `d-${authorRightPanel.authorCd}` : "create"}
                  mode="create"
                  embedded
                  listSlot={
                    <CmmnAuthorList
                      manageCmpnyCd={cmpnyCd}
                      hidePageChrome
                      splitMode
                      selectedRowKey={
                        authorRightPanel.kind === "detail"
                          ? `${authorRightPanel.cmpnyCd}|${authorRightPanel.authorCd}`
                          : null
                      }
                      onRowSelect={(item) =>
                        setAuthorRightPanel({ kind: "detail", cmpnyCd: item.cmpnyCd, authorCd: item.authorCd })
                      }
                      listRefreshToken={authorListRefreshToken}
                    />
                  }
                  manageCmpnyCd={cmpnyCd}
                  embedCmpnyCd={cmpnyCd}
                  embedAuthorCd={authorRightPanel.kind === "detail" ? authorRightPanel.authorCd : null}
                  onEmbeddedCommit={onAuthorEmbeddedCommit}
                />
              </div>
            )}
            {mainTab === "structure" && <CmmnAuthorStructureTab cmpnyCd={cmpnyCd} langGb={langGb || "ko_KR"} />}
            {mainTab === "role" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 0%",
                  minHeight: 0,
                  height: 0,
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <CmmnRoleTab cmpnyCd={cmpnyCd} langGb={langGb || "ko_KR"} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnAuthorManage;
