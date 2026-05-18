import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import { SERVER_URL } from "@/config";
import URL from "@/constants/url";
import { getSessionItem } from "@/utils/storage";
import { itemIdxByPage } from "@/utils/calc";
import { getLanguageCodeForApi } from "@/utils/language";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import Paging from "@/components/Paging";
import { CMMN_PROGRAM_I18N_KEYS, CMMN_PROGRAM_I18N_FALLBACK } from "./cmmnProgramI18n";

function CmmnProgramList() {
  const navigate = useNavigate();
  const { langGb } = useLanguage();
  const { companyList, cmpnyCd, setCmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_PROGRAM_I18N_KEYS, CMMN_PROGRAM_I18N_FALLBACK, { cmpnyCd });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [programList, setProgramList] = useState([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const latestRequestIdRef = useRef(0);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPageNo: 1,
    recordCountPerPage: 15,
    pageSize: 10,
    totalRecordCount: 0,
  });

  const retrieveList = useCallback(() => {
    if (!cmpnyCd?.trim()) return;
    const pageIndex = paginationInfo.currentPageNo;
    const recordCountPerPage = paginationInfo.recordCountPerPage;
    const langCode = getLanguageCodeForApi(langGb);
    const requestId = ++latestRequestIdRef.current;
    const params = new URLSearchParams();
    params.set("pageIndex", String(pageIndex));
    params.set("recordCountPerPage", String(recordCountPerPage));
    if (searchKeyword.trim()) params.set("searchKeyword", searchKeyword.trim());
    if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
    if (langCode) params.set("langCode", langCode);
    const listURL = `/cmmnProgram/list?${params.toString()}`;

    const requestOptions = {
      method: "GET",
      headers: { "Content-type": "application/json" },
    };

    EgovNet.requestFetch(
      listURL,
      requestOptions,
      (resp) => {
        if (requestId !== latestRequestIdRef.current) return;
        if (resp && resp.result) {
          const result = resp.result;
          setProgramList(result.list || []);
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
  }, [searchKeyword, cmpnyCd, langGb, paginationInfo.currentPageNo, paginationInfo.recordCountPerPage, i18nText.msgErrorOnList]);

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
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompanyFirst);
      return;
    }
    if (!confirm(i18nText.msgConfirmDelete)) return;

    const jToken = getSessionItem("jToken");
    const deleteHeaders: Record<string, string> = { "Content-type": "application/json" };
    if (jToken) deleteHeaders["Authorization"] = jToken;

    const deletePromises = Array.from(selectedIds).map((progrmFileNm) => {
      const q = new URLSearchParams();
      q.set("cmpnyCd", cmpnyCd.trim());
      const url = `${SERVER_URL}/cmmnProgram/${encodeURIComponent(progrmFileNm)}?${q.toString()}`;
      return fetch(url, {
        method: "DELETE",
        headers: deleteHeaders,
        credentials: "include",
      }).then((r) => r.json());
    });

    Promise.all(deletePromises).then((responses) => {
      const failed = responses.some((r) => r?.resultCode !== 200);
      if (failed) {
        alert(responses.find((r) => r?.resultCode !== 200)?.resultMessage || i18nText.msgErrorOnDelete);
        return;
      }
      alert(i18nText.msgDeleted);
      setSelectedIds(new Set());
      retrieveList();
    }).catch(() => {
      alert(i18nText.msgErrorOnDelete);
    });
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

  const toggleSelect = (progrmFileNm: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(progrmFileNm)) next.delete(progrmFileNm);
      else next.add(progrmFileNm);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === programList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(programList.map((p: { progrmFileNm: string }) => p.progrmFileNm)));
    }
  };

  const resultCnt = paginationInfo.totalRecordCount || 0;

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
                  <label className="f_select" htmlFor="cmpnyCd">
                    <select
                      id="cmpnyCd"
                      value={String(cmpnyCd ?? "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        syncCompanySession(v);
                        setSelectedIds(new Set());
                        setPaginationInfo((prev) => ({ ...prev, currentPageNo: 1 }));
                      }}
                    >
                      {companyList.length === 0 ? (
                        <option value="">{i18nText.msgLoadingCompanyList}</option>
                      ) : (
                        companyList.map((c) => (
                          <option key={c.cmpnyCd} value={c.cmpnyCd}>{c.cmpnyNm}</option>
                        ))
                      )}
                    </select>
                  </label>
                  <label className="f_input" htmlFor="searchKeyword">
                    <input
                      type="text"
                      id="searchKeyword"
                      placeholder={i18nText.placeholderSearchProgramNameUrl}
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </label>
                </div>
                <div className="right-box">
                  <button type="button" className="pd-btn" onClick={() => navigate(URL.SYSTEM_PROGRAM_CREATE, { state: { cmpnyCd } })}>
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

              <div className="board_list BRD006 md-admin-list">
                <div className="head">
                  <span className="md-col-chk">
                    <input
                      type="checkbox"
                      checked={programList.length > 0 && selectedIds.size === programList.length}
                      onChange={toggleSelectAll}
                      aria-label={i18nText.etcAllSelect}
                    />
                  </span>
                  <span className="md-col-no">{i18nText.labelNo}</span>
                  <span>{i18nText.labelFileName}</span>
                  <span>{i18nText.labelProgramName}</span>
                  <span>{i18nText.labelUrl}</span>
                  <span>{i18nText.labelDescription}</span>
                  <span className="md-col-use">{i18nText.labelUseYn}</span>
                </div>
                <div className="result">
                  {programList.length === 0 ? (
                    <p className="no_data" key="0">{i18nText.msgNoSearchResult}</p>
                  ) : (
                    programList.map((item: { progrmFileNm: string; cmpnyCd?: string; progrmNmCode: string; messageCn?: string; progrmUrl: string; progrmDc?: string; useFl: string }, index: number) => {
                      const totalForNo =
                        resultCnt > 0 ? resultCnt : (paginationInfo.currentPageNo - 1) * paginationInfo.recordCountPerPage + programList.length;
                      const listIdx = itemIdxByPage(totalForNo, paginationInfo.currentPageNo || 1, paginationInfo.recordCountPerPage || 15, index);
                      const itemCmpnyCd = item.cmpnyCd ?? cmpnyCd;
                      return (
                        <Link
                          key={`${itemCmpnyCd}|${item.progrmFileNm}`}
                          to={URL.SYSTEM_PROGRAM_MODIFY}
                          state={{ progrmFileNm: item.progrmFileNm, cmpnyCd: itemCmpnyCd }}
                          className="list_item"
                        >
                          <div className="md-col-chk" onClick={(e) => e.preventDefault()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.progrmFileNm)}
                              onChange={() => toggleSelect(item.progrmFileNm)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`${item.messageCn ?? item.progrmFileNm} 선택`}
                            />
                          </div>
                          <div className="md-col-no">{listIdx}</div>
                          <div>{item.progrmFileNm}</div>
                          <div>{item.messageCn}</div>
                          <div>{item.progrmUrl}</div>
                          <div>{item.progrmDc ?? ""}</div>
                          <div className="md-col-use">{item.useFl === "Y" ? i18nText.etcUse : i18nText.etcNotUse}</div>
                        </Link>
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
                    <Paging
                      pagination={paginationInfo}
                      moveToPage={moveToPage}
                    />
                  </div>

                  <div className="total-page-box">
                    {paginationInfo.totalRecordCount > 0
                      ? `${Math.min(paginationInfo.currentPageNo * paginationInfo.recordCountPerPage, paginationInfo.totalRecordCount)}/${paginationInfo.totalRecordCount}`
                      : "0/0"}
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

export default CmmnProgramList;
