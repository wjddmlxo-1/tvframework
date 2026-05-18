import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanyList } from "@/hooks/useCompanyList";

import Paging from "@/components/Paging";
import CmmnMessageEdit from "./CmmnMessageEdit";
import CmmnMessageDetail from "./CmmnMessageDetail";
import { itemIdxByPage } from "@/utils/calc";
import { exportToExcel } from "@/utils/excelExport";
import { decodeHtmlEntities } from "@/utils/htmlDecode";
import { getLanguageCodeForApi } from "@/utils/language";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  I18N_KEYS,
  CMMN_MESSAGE_I18N_FALLBACK,
  formatExcelFileName,
  type CmmnMessageI18nText,
} from "./cmmnMessageI18n";

export type { CmmnMessageI18nText };

function CmmnMessageList() {
  const navigate = useNavigate();
  const { langGb } = useLanguage();

  const { companyList, cmpnyCd, setCmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();

  // ② 구분 선택
  const [category, setCategory] = useState(""); // ""는 "전체"를 의미
  const [categoryOptions, setCategoryOptions] = useState([]);

  // 언어 목록 (동적 헤더용)
  const [langOptions, setLangOptions] = useState([]);

  // 검색 조건
  const [searchCondition, setSearchCondition] = useState("");

  // 메시지 리스트
  const [messageList, setMessageList] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set()); // langKey를 저장
  const [listTag, setListTag] = useState([]);

  // 페이지네이션
  const [paginationInfo, setPaginationInfo] = useState({
    currentPageNo: 1,
    recordCountPerPage: 15,
    pageSize: 10,
    totalRecordCount: 0,
  });

  // 팝업 상태
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [editMode, setEditMode] = useState("create"); // create or modify
  const [selectedMessage, setSelectedMessage] = useState(null);
  const i18nText = useCmmnScreenI18n(I18N_KEYS, CMMN_MESSAGE_I18N_FALLBACK, { cmpnyCd });


  // 메시지 상세 조회 (회사코드 전달)
  const retrieveMessageDetail = useCallback((langKey, langGbValue) => {
    const params = new URLSearchParams();
    params.set("langKey", langKey);
    params.set("langGb", langGbValue || langGb);
    if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
    const retrieveURL = `/cmmnMessage/detail?${params.toString()}`;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      retrieveURL,
      requestOptions,
      (resp) => {
        if (resp.result) {
          // 상세 데이터를 수정 팝업에 전달할 형식으로 변환
          const detailData = resp.result;
          const messageData = {
            langGb: detailData.langGb || langGbValue || langGb,
            langKey: detailData.langKey || langKey,
            messages: [], // messages 배열로 전달
          };

          // 메시지 목록에서 각 언어별 메시지 추출 (동적으로 처리)
          if (detailData.messages && Array.isArray(detailData.messages)) {
            messageData.messages = detailData.messages.map((msg) => ({
              langCode: msg.langCode,
              messageCn: msg.messageCn || "",
            }));
          } else {
            // messages 배열이 없으면 langOptions를 기반으로 빈 배열 생성
            messageData.messages = langOptions.map((lang) => ({
              langCode: lang.code,
              messageCn: "",
            }));
          }

          setSelectedMessage(messageData);
          setEditMode("modify");
          setShowEditPopup(true);
        }
      },
      () => alert(i18nText.msgErrorOnRetrieve)
    );
  }, [langGb, langOptions, cmpnyCd, i18nText.msgErrorOnRetrieve]);

  // 언어 Key 클릭 핸들러
  const handleLangKeyClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation(); // 행 클릭 이벤트 방지
    retrieveMessageDetail(item.langKey, item.langGb);
  };

  // 언어 목록 조회 (회사코드 반영; languageCode는 선택 시 해당 코드, 없으면 브라우저 기본)
  const retrieveLangOptions = useCallback(() => {
    const companyCode = String(cmpnyCd ?? "").trim();
    if (!companyCode) return;
    const langCodeParam = getLanguageCodeForApi(langGb);
    const params = new URLSearchParams();
    params.append("langCode", langCodeParam);
    params.append("cmpnyCd", companyCode);
    const url = `/cmmnMessage/languages?${params.toString()}`;
    console.log("[다국어관리] 언어 목록 조회 요청", { url, 인자: { cmpnyCd: companyCode, langCode: langCodeParam } });
    EgovNet.requestFetch(
      url,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const list = resp?.result;
        setLangOptions(Array.isArray(list) ? list : []);
      },
      () => setLangOptions([])
    );
  }, [langGb, cmpnyCd]);

  // ② 구분 목록 조회 (회사코드 반영; languageCode는 선택 시 해당 코드, 없으면 브라우저 기본)
  const retrieveCategoryOptions = useCallback(() => {
    const companyCode = String(cmpnyCd ?? "").trim();
    if (!companyCode) return;
    const langCodeParam = getLanguageCodeForApi(langGb);
    const params = new URLSearchParams();
    params.append("langCode", langCodeParam);
    params.append("cmpnyCd", companyCode);
    EgovNet.requestFetch(
      `/cmmnMessage/categories?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const list = resp?.result;
        setCategoryOptions(Array.isArray(list) ? list : []);
      },
      () => setCategoryOptions([])
    );
  }, [langGb, cmpnyCd]);

  // paginationInfo를 ref로 관리하여 무한 루프 방지
  const paginationInfoRef = useRef(paginationInfo);
  const latestRequestIdRef = useRef(0);
  useEffect(() => {
    paginationInfoRef.current = paginationInfo;
  }, [paginationInfo]);

  // ⑦ 메시지 리스트 조회
  const retrieveMessageList = useCallback(() => {
    const companyCode = String(cmpnyCd ?? "").trim();
    if (!companyCode) {
      setMessageList([]);
      return;
    }
    const currentPageNo = paginationInfoRef.current.currentPageNo;
    const recordCountPerPage = paginationInfoRef.current.recordCountPerPage;
    const requestId = ++latestRequestIdRef.current;

    // URL 파라미터 구성 (빈 값은 제외)
    const params = new URLSearchParams();
    params.append("langGb", langGb || "ko_KR");
    if (companyCode) params.append("cmpnyCd", companyCode);
    if (category && category !== "") {
      params.append("category", category);
    }
    if (searchCondition && searchCondition.trim() !== "") {
      params.append("searchCondition", searchCondition.trim());
    }
    params.append("pageIndex", currentPageNo.toString());
    params.append("recordCountPerPage", recordCountPerPage.toString());

    const retrieveListURL = `/cmmnMessage/list?${params.toString()}`;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        if (requestId !== latestRequestIdRef.current) return;
        if (resp.result) {
          const list = resp.result.list || [];
          setMessageList(list);
          if (resp.result.paginationInfo) {
            setPaginationInfo((prev) => ({
              ...prev,
              ...resp.result.paginationInfo,
            }));
          }
        }
      },
      () => {
        if (requestId !== latestRequestIdRef.current) return;
        alert(i18nText.msgErrorOnRetrieve);
      }
    );
  }, [langGb, cmpnyCd, category, searchCondition, i18nText.msgErrorOnRetrieve]);

  // ⑥ 삭제
  const handleDelete = useCallback(() => {
    if (selectedRows.size === 0) {
      alert(i18nText.msgSelectItemToDelete);
      return;
    }

    if (!confirm(i18nText.msgConfirmDelete)) {
      return;
    }

    const langKeys = Array.from(selectedRows);
    // 선택된 항목 중 첫 번째 항목의 langGb를 찾기
    const firstSelectedItem = messageList.find((item) => langKeys.includes(item.langKey));
    const langGbValue = firstSelectedItem?.langGb || langGb;

    const deleteURL = `/cmmnMessage/delete`;
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        cmpnyCd: cmpnyCd || undefined,
        langGb: langGbValue,
        langKeys: langKeys,
      }),
    };

    EgovNet.requestFetch(
      deleteURL,
      requestOptions,
      (resp) => {
        alert(i18nText.msgDeleted);
        setSelectedRows(new Set());
        // 삭제 후 1페이지로 이동하고 재조회
        const newPaginationInfo = {
          ...paginationInfoRef.current,
          currentPageNo: 1,
        };
        paginationInfoRef.current = newPaginationInfo;
        setPaginationInfo(newPaginationInfo);
        // 검색 조건에 맞게 재조회
        retrieveMessageList();
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  }, [selectedRows, messageList, langGb, cmpnyCd, retrieveMessageList, i18nText.msgSelectItemToDelete, i18nText.msgConfirmDelete, i18nText.msgDeleted, i18nText.msgErrorOnDelete]);

  // ⑤ 추가 버튼 클릭
  const handleAdd = () => {
    setEditMode("create");
    setSelectedMessage(null);
    setShowEditPopup(true);
  };

  // 행 체크박스 토글 (langKey 사용)
  const handleRowCheck = useCallback((langKey) => {
    setSelectedRows((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(langKey)) {
        newSelected.delete(langKey);
      } else {
        newSelected.add(langKey);
      }
      return newSelected;
    });
  }, []);

  // 전체 선택/해제
  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      const allLangKeys = new Set(messageList.map((item) => item.langKey));
      setSelectedRows(allLangKeys);
    } else {
      setSelectedRows(new Set());
    }
  }, [messageList]);

  // 페이지 이동
  const moveToPage = (pageIndex) => {
    setPaginationInfo((prev) => ({
      ...prev,
      currentPageNo: pageIndex,
    }));
  };

  // 페이지당 항목 수 변경
  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    setPaginationInfo((prev) => ({
      ...prev,
      recordCountPerPage: newPageSize,
      currentPageNo: 1,
    }));
  };

  // 조회 버튼 클릭
  const handleSearch = () => {
    if ((paginationInfoRef.current.currentPageNo || 1) !== 1) {
      // 페이지를 1로 리셋하고 ref 업데이트
      const newPaginationInfo = {
        ...paginationInfoRef.current,
        currentPageNo: 1,
      };
      paginationInfoRef.current = newPaginationInfo;
      setPaginationInfo(newPaginationInfo);
      return;
    }
    // 현재가 1페이지면 즉시 재조회
    retrieveMessageList();
  };

  // 엑셀 양식 다운로드
  const handleExcelTemplateDownload = () => {
    window.open(`/cmmnMessage/excel/template`, "_blank");
  };

  // 엑셀 업로드
  const handleExcelUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const uploadURL = `/cmmnMessage/excel/upload`;
      const requestOptions = {
        method: "POST",
        body: formData,
      };

      EgovNet.requestFetch(
        uploadURL,
        requestOptions,
        (resp) => {
          alert(i18nText.msgUploaded);
          retrieveMessageList();
        },
        function (resp) {
          console.log("err response : ", resp);
          alert(i18nText.msgErrorOnUpload);
        }
      );
    };
    input.click();
  };

  // 엑셀 다운로드
  const handleExcelDownload = () => {
    if (messageList.length === 0) {
      alert(i18nText.msgNoDataToDownload);
      return;
    }

    if (langOptions.length === 0) {
      alert(i18nText.msgFailLoadLangList);
      return;
    }

    // 헤더 생성 (체크박스 제외)
    const headers = [i18nText.colNo, i18nText.colCategory, i18nText.colLangKey, ...langOptions.map((lang) => lang.name)];

    // 데이터 생성
    const resultCnt = paginationInfo.totalRecordCount || 0;
    const currentPageNo = paginationInfo.currentPageNo || 1;
    const recordCountPerPage = paginationInfo.recordCountPerPage || 15;

    const excelData = messageList.map((item, index) => {
      const listIdx = itemIdxByPage(resultCnt, currentPageNo, recordCountPerPage, index);

      // 메시지를 언어 코드별로 매핑 (HTML 엔티티 디코딩)
      const messageMap = new Map();
      if (item.messageCns) {
        item.messageCns.split("|").forEach((msg) => {
          const [langCode, messageText] = msg.includes(":") ? msg.split(":", 2) : ["", msg];
          if (langCode) {
            // HTML 엔티티 디코딩
            const decodedText = decodeHtmlEntities(messageText || "");
            messageMap.set(langCode, decodedText);
          }
        });
      }

      // 행 데이터 생성: [번호, 구분, 언어 Key, ...각 언어별 메시지]
      return [
        listIdx,
        item.langGb || "",
        item.langKey || "",
        ...langOptions.map((lang) => messageMap.get(lang.code) || ""),
      ];
    });

    // 파일명 생성 (현재 날짜/시간 포함)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const filename = formatExcelFileName(i18nText.excelFileNamePattern, dateStr, timeStr);

    // 엑셀 다운로드 실행
    exportToExcel(headers, excelData, filename);
  };

  // 1) 회사 목록은 useCompanyList에서 마운트 시 로드
  // 2) 회사코드가 있을 때만 언어 목록·구분 목록 조회 (selectCompanyList → selectLanguages 순서 보장)
  useEffect(() => {
    const companyCode = String(cmpnyCd ?? "").trim();
    if (companyCode) {
      retrieveLangOptions();
      retrieveCategoryOptions();
    }
  }, [langGb, cmpnyCd, retrieveLangOptions, retrieveCategoryOptions]);

  // category 변경 시 페이지를 1로 리셋
  const prevCategoryRef = useRef(category);
  useEffect(() => {
    if (langOptions.length > 0 && prevCategoryRef.current !== category) {
      prevCategoryRef.current = category;
      const newPaginationInfo = {
        ...paginationInfoRef.current,
        currentPageNo: 1,
      };
      paginationInfoRef.current = newPaginationInfo;
      setPaginationInfo(newPaginationInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, langOptions.length]);

  // 언어 목록과 카테고리가 준비되면 메시지 리스트 조회
  useEffect(() => {
    if (langOptions.length > 0) {
      retrieveMessageList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langOptions.length, cmpnyCd, category, searchCondition, paginationInfo.currentPageNo, paginationInfo.recordCountPerPage]);

  // 리스트 태그 생성 (messageList와 selectedRows, langOptions 변경 시)
  useEffect(() => {
    if (messageList.length === 0) {
      setListTag([
        <p className="no_data" key="0">
          {i18nText.msgNoSearchResult}
        </p>
      ]);
      return;
    }

    if (langOptions.length === 0) {
      return; // 언어 목록이 없으면 렌더링하지 않음
    }

    const resultCnt = paginationInfo.totalRecordCount || 0;
    const currentPageNo = paginationInfo.currentPageNo || 1;
    const recordCountPerPage = paginationInfo.recordCountPerPage || 15;

    const mutListTag = messageList.map((item, index) => {
      const listIdx = itemIdxByPage(
        resultCnt,
        currentPageNo,
        recordCountPerPage,
        index
      );
      // 메시지를 언어 코드별로 매핑 (HTML 엔티티 디코딩)
      const messageMap = new Map();
      if (item.messageCns) {
        item.messageCns.split("|").forEach((msg) => {
          const [langCode, messageText] = msg.includes(":") ? msg.split(":", 2) : ["", msg];
          if (langCode) {
            // HTML 엔티티 디코딩
            const decodedText = decodeHtmlEntities(messageText || "");
            messageMap.set(langCode, decodedText);
          }
        });
      }
      const isChecked = selectedRows.has(item.langKey);

      return (
        <div
          key={`${item.langKey}-${listIdx}`}
          className="list_item"
          onClick={() => {
            handleRowCheck(item.langKey);
          }}
        >
          <div className="md-col-chk">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                handleRowCheck(item.langKey);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`${item.langKey} 선택`}
            />
          </div>
          <div className="md-col-no">{listIdx}</div>
          <div>{item.langGb}</div>
          <div>
            <a
              href="#"
              className="md-cell-link"
              onClick={(e) => handleLangKeyClick(e, item)}
            >
              {item.langKey}
            </a>
          </div>
          {langOptions.map((lang) => (
            <div key={lang.code}>{messageMap.get(lang.code) || ""}</div>
          ))}
        </div>
      );
    });

    setListTag(mutListTag);
  }, [messageList, selectedRows, paginationInfo, handleRowCheck, langOptions, i18nText.msgNoSearchResult]);

  const Location = React.memo(function Location() {
    return (
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
    );
  });

  return (
    <>
      <div className="container" >
        <div className="c_wrap" >
          {/* <!-- Location --> */}
          <Location />
          {/* <!--// Location --> */}

          <div className="layout" >
            <div className="contents" id="contents">
              {/* <!-- 검색 조건 (한 줄 배치) --> */}
              <div className="condition md-condition md-condition-row">
                <div className="left-box">
                  {/* 회사 선택 (맨 왼쪽) */}
                  <div style={{ minWidth: "180px" }}>
                    <label className="f_select" htmlFor="cmpnyCd">
                      <select
                        id="cmpnyCd"
                        value={String(cmpnyCd ?? "")}
                        onChange={(e) => {
                          syncCompanySession(e.target.value);
                        }}
                      >
                        {companyList.map((c) => (
                          <option key={c.cmpnyCd} value={c.cmpnyCd}>{c.cmpnyNm}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {/* ② 구분 선택 */}
                  <label className="f_select w_130" htmlFor="categorySelect">
                    <select
                      id="categorySelect"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">{i18nText.allCategory}</option>
                      {categoryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* ⑧ 검색 조건 */}
                  <label className="f_input" htmlFor="searchCondition">
                    <input
                      type="text"
                      id="searchCondition"
                      title={i18nText.placeholderSearchCondition}
                      placeholder={i18nText.searchPlaceholder}
                      value={searchCondition}
                      onChange={(e) => setSearchCondition(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="right-box">
                  {/* 
                  <button
                    className="pd-btn"
                    onClick={handleExcelTemplateDownload}
                  >
                    엑셀양식 업로드
                  </button>

                  <button
                    className="pd-btn"
                    onClick={handleExcelUpload}
                  >
                    엑셀 업로드
                  </button>
                 */}
                  <button
                    className="pd-btn"
                    onClick={handleExcelDownload}
                  >
                    {i18nText.btnExcel}
                  </button>

                  <button
                    className="pd-btn"
                    onClick={handleAdd}
                  >
                    {i18nText.btnAdd}
                  </button>

                  <button
                    className="pd-btn"
                    onClick={handleDelete}
                  >
                    {i18nText.btnDelete}
                  </button>

                  <button
                    className="pd-btn primary"
                    onClick={handleSearch}
                  >
                    {i18nText.btnSearch}
                  </button>
                </div>
              </div>

              {/* <!-- 메시지 리스트 --> */}
              <div className="board_list BRD006 md-admin-list">
                <div className="head">
                  <span className="md-col-chk">
                    <input
                      type="checkbox"
                      checked={
                        messageList.length > 0 &&
                        messageList.every((item) => selectedRows.has(item.langKey))
                      }
                      onChange={handleSelectAll}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={i18nText.colSelectAll}
                    />
                  </span>
                  <span className="md-col-no">{i18nText.colNo}</span>
                  <span>{i18nText.colCategory}</span>
                  <span>{i18nText.colLangKey}</span>
                  {langOptions.map((lang) => (
                    <span key={lang.code}>{lang.name}</span>
                  ))}
                </div>
                <div className="result">{listTag}</div>

                {/* <!-- 페이지네이션 --> */}
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
            {/* <!--// 본문 --> */}
          </div>
        </div>
      </div>

      {/* <!-- 추가/수정 팝업 --> */}
      {showEditPopup && (
        <CmmnMessageEdit
          mode={editMode}
          message={selectedMessage}
          langGb={langGb}
          category={category}
          cmpnyCd={cmpnyCd}
          i18nText={i18nText}
          onClose={() => {
            setShowEditPopup(false);
            // 추가/수정 후 1페이지로 이동하고 재조회
            const newPaginationInfo = {
              ...paginationInfoRef.current,
              currentPageNo: 1,
            };
            paginationInfoRef.current = newPaginationInfo;
            setPaginationInfo(newPaginationInfo);
            // 검색 조건에 맞게 재조회
            retrieveMessageList();
          }}
        />
      )}

      {/* <!-- 조회 팝업 --> */}
      {showDetailPopup && (
        <CmmnMessageDetail
          message={selectedMessage}
          langGb={langGb}
          cmpnyCd={cmpnyCd}
          i18nText={i18nText}
          onClose={() => setShowDetailPopup(false)}
        />
      )}
    </>
  );
}

export default CmmnMessageList;

