import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { itemIdxByPage } from "@/utils/calc";
import { getLanguageCodeForApi } from "@/utils/language";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import Paging from "@/components/Paging";
import { CMMN_COMPANY_I18N_KEYS, CMMN_COMPANY_I18N_FALLBACK } from "./cmmnCompanyI18n";

type CompanyItem = {
  cmpnyCd: string;
  cmpnyNm: string;
  applcntNm: string;
  applcntEmail: string;
  offmTelno: string;
  exprtnYmd?: string;
  creationDt: string;
  sbscrbSttusNm: string;
  sbscrbSttus?: string;
};

function formatExprtnYmd(ymd: string | undefined): string {
  if (!ymd) return "";
  const s = String(ymd).trim();
  if (s.length === 8) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return s;
}

type CodeOption = { code: string; name: string };

function CmmnCompanyList() {
  const navigate = useNavigate();
  const { langGb } = useLanguage();
  const [sbscrbSttus, setSbscrbSttus] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [companyList, setCompanyList] = useState<CompanyItem[]>([]);
  const [statusOptions, setStatusOptions] = useState<CodeOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const latestRequestIdRef = useRef(0);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPageNo: 1,
    recordCountPerPage: 15,
    pageSize: 10,
    totalRecordCount: 0,
  });

  const langCode = getLanguageCodeForApi(langGb);
  const i18nText = useCmmnScreenI18n(CMMN_COMPANY_I18N_KEYS, CMMN_COMPANY_I18N_FALLBACK);

  const loadStatusOptions = useCallback(() => {
    EgovNet.requestFetch(
      `/cmmnCompany/codeOption?codeId=CMMNCODE.540&langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setStatusOptions(resp.result);
        }
      },
      () => setStatusOptions([])
    );
  }, [langCode]);

  useEffect(() => {
    loadStatusOptions();
  }, [loadStatusOptions]);

  const retrieveList = useCallback(() => {
    const pageIndex = paginationInfo.currentPageNo;
    const recordCountPerPage = paginationInfo.recordCountPerPage;
    const requestId = ++latestRequestIdRef.current;
    const params = new URLSearchParams();
    params.set("pageIndex", String(pageIndex));
    params.set("recordCountPerPage", String(recordCountPerPage));
    params.set("langCode", langCode);
    if (sbscrbSttus && sbscrbSttus !== "") params.set("sbscrbSttus", sbscrbSttus);
    if (searchKeyword.trim()) params.set("searchKeyword", searchKeyword.trim());
    const listURL = `/cmmnCompany/list?${params.toString()}`;

    EgovNet.requestFetch(
      listURL,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (requestId !== latestRequestIdRef.current) return;
        if (resp && resp.result) {
          const result = resp.result;
          setCompanyList(result.list || []);
          if (result.paginationInfo) {
            setPaginationInfo((prev) => ({
              ...prev,
              currentPageNo: result.paginationInfo.currentPageNo ?? prev.currentPageNo,
              recordCountPerPage: result.paginationInfo.recordCountPerPage ?? prev.recordCountPerPage,
              pageSize: result.paginationInfo.pageSize ?? prev.pageSize,
              totalRecordCount: result.paginationInfo.totalRecordCount ?? 0,
            }));
          }
        }
      },
      () => {
        if (requestId !== latestRequestIdRef.current) return;
        alert(i18nText.msgErrorOnList);
      }
    );
  }, [sbscrbSttus, searchKeyword, langCode, paginationInfo.currentPageNo, paginationInfo.recordCountPerPage, i18nText.msgErrorOnList]);

  useEffect(() => {
    retrieveList();
  }, [retrieveList]);

  const handleSearch = () => {
    if (paginationInfo.currentPageNo !== 1) {
      setPaginationInfo((prev) => ({ ...prev, currentPageNo: 1 }));
      return;
    }
    retrieveList();
  };

  const handleDelete = () => {
    if (selectedIds.size === 0) {
      alert(i18nText.msgSelectItemToDelete);
      return;
    }
    if (!confirm(i18nText.msgConfirmDeleteCompany)) return;

    const cmpnyCdList = Array.from(selectedIds);
    EgovNet.requestFetch(
      "/cmmnCompany/deleteList",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(cmpnyCdList),
      },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgDeleted);
          setSelectedIds(new Set());
          retrieveList();
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const moveToPage = (page: number) => {
    setPaginationInfo((prev) => ({ ...prev, currentPageNo: page }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPaginationInfo((prev) => ({
      ...prev,
      recordCountPerPage: newPageSize,
      currentPageNo: 1,
    }));
  };

  const toggleSelect = (cmpnyCd: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cmpnyCd)) next.delete(cmpnyCd);
      else next.add(cmpnyCd);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (companyList.length === 0) return;
    const allSelected = companyList.every((item) => selectedIds.has(item.cmpnyCd));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(companyList.map((item) => item.cmpnyCd)));
    }
  };

  const goDetail = (item: CompanyItem) => {
    navigate(URL.SYSTEM_COMPANY_DETAIL, { state: { cmpnyCd: item.cmpnyCd } });
  };

  return (
    <>
      <div className="container">
        <div className="c_wrap">
          <div className="location">
            <h1 className="location__title">{i18nText.pageTitle}</h1>
            <ul>
              <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
              <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
              <li>{i18nText.pageTitle}</li>
            </ul>
          </div>

          <div className="layout">
            <div className="contents" id="contents">
              <div className="condition md-condition md-condition-row">
                <div className="left-box">
                  <label className="f_select" htmlFor="sbscrbSttus">
                    <select
                      id="sbscrbSttus"
                      value={sbscrbSttus}
                      onChange={(e) => setSbscrbSttus(e.target.value)}
                    >
                      <option value="">{i18nText.etcAll}</option>
                      {statusOptions.map((opt) => (
                        <option key={opt.code} value={opt.code}>{opt.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="f_input" htmlFor="searchKeyword">
                    <input
                      type="text"
                      id="searchKeyword"
                      placeholder={i18nText.placeholderSearchCompanyIdName}
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </label>
                </div>
                <div className="right-box">
                  <button type="button" className="pd-btn" onClick={() => navigate(URL.SYSTEM_COMPANY_CREATE)}>
                    {i18nText.btnRegister}
                  </button>
                  <button type="button" className="pd-btn" onClick={handleDelete}>
                    {i18nText.btnDelete}
                  </button>
                  <button type="button" className="pd-btn primary" onClick={handleSearch}>
                    {i18nText.btnSearch}
                  </button>
                </div>
              </div>

              <div className="board_list BRD006 md-admin-list md-company-list">
                <div className="head">
                  <span className="md-col-chk">
                    <input
                      type="checkbox"
                      checked={companyList.length > 0 && selectedIds.size === companyList.length}
                      onChange={toggleSelectAll}
                      aria-label={i18nText.etcAllSelect}
                    />
                  </span>
                  <span className="md-col-no">{i18nText.labelNo}</span>
                  <span>{i18nText.labelCompanyName}</span>
                  <span>{i18nText.labelCompanyId}</span>
                  <span>{i18nText.labelApplicantName}</span>
                  <span>{i18nText.labelApplicantEmail}</span>
                  <span>{i18nText.labelPhoneNumber}</span>
                  <span>{i18nText.labelExpireDate}</span>
                  <span>{i18nText.labelRegDate}</span>
                  <span className="md-col-use">{i18nText.labelJoinStatus}</span>
                </div>
                <div className="result">
                  {companyList.length === 0 ? (
                    <p className="no_data" key="0">{i18nText.msgNoSearchResult}</p>
                  ) : (
                    companyList.map((item, index) => {
                      const listIdx = itemIdxByPage(
                        paginationInfo.totalRecordCount || 0,
                        paginationInfo.currentPageNo || 1,
                        paginationInfo.recordCountPerPage || 15,
                        index
                      );
                      return (
                        <div
                          key={item.cmpnyCd}
                          className="list_item"
                          role="button"
                          tabIndex={0}
                          onClick={() => goDetail(item)}
                          onKeyDown={(e) => e.key === "Enter" && goDetail(item)}
                        >
                          <div className="md-col-chk" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.cmpnyCd)}
                              onChange={() => toggleSelect(item.cmpnyCd)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`${item.cmpnyNm ?? item.cmpnyCd}${i18nText.ariaSelectSuffix}`}
                            />
                          </div>
                          <div className="md-col-no">{listIdx}</div>
                          <div>{item.cmpnyNm ?? ""}</div>
                          <div>{item.cmpnyCd}</div>
                          <div>{item.applcntNm ?? ""}</div>
                          <div>
                            <a href={`mailto:${item.applcntEmail ?? ""}`} className="link_style" onClick={(e) => e.stopPropagation()}>
                              {item.applcntEmail ?? ""}
                            </a>
                          </div>
                          <div>{item.offmTelno ?? ""}</div>
                          <div>{formatExprtnYmd(item.exprtnYmd)}</div>
                          <div>{item.creationDt ?? ""}</div>
                          <div className="md-col-use">{item.sbscrbSttusNm ?? ""}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 페이지네이션 */}
                <div className="md-pagination">
                  <div>
                    <label className="f_select" htmlFor="pageSizeSelect">
                      <select
                        id="pageSizeSelect"
                        value={paginationInfo.recordCountPerPage}
                        onChange={handlePageSizeChange}
                      >
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="60">60</option>
                        <option value="100">100</option>
                      </select>
                    </label>
                  </div>
                  <div>
                    <Paging pagination={paginationInfo} moveToPage={moveToPage} />
                  </div>
                  <div className="total-page-box">
                    {paginationInfo.totalRecordCount > 0
                      ? `${Math.min(paginationInfo.currentPageNo * paginationInfo.recordCountPerPage, paginationInfo.totalRecordCount)}/${paginationInfo.totalRecordCount}`
                      : i18nText.etcZeroCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CmmnCompanyList;
