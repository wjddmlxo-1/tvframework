import React, { useState, useEffect, useRef, useId } from "react";
import * as EgovNet from "@/api/egovFetch";
import Paging from "@/components/Paging";
import { itemIdxByPage } from "@/utils/calc";
import { decodeHtmlEntities } from "@/utils/htmlDecode";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_COMPONENT_I18N_FALLBACK, CMMN_COMPONENT_I18N_KEYS } from "@/components/cmmnComponentI18n";

/** 다국어 조회로 채우는 입력란 공통 placeholder */
export const MULTILINGUAL_LOOKUP_PLACEHOLDER = CMMN_COMPONENT_I18N_FALLBACK.placeholderSelectMultilingual;

export type MultilingualLookupOnSelect = (
  langKey: string,
  displayMessage: string,
  messageMap: Map<string, string>
) => void;

type MessageRow = { langKey?: string; langGb?: string; messageCns?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** 회사코드 — 목록/언어/구분 API에 반영 */
  cmpnyCd: string;
  /** API langGb·표시 언어 판별용 (예: ko_KR) */
  langCode: string;
  onSelect: MultilingualLookupOnSelect;
};

function parseMessageMap(messageCns: string | undefined): Map<string, string> {
  const messageMap = new Map<string, string>();
  if (!messageCns) return messageMap;
  messageCns.split("|").forEach((msg) => {
    const [code, text] = msg.includes(":") ? msg.split(":", 2) : ["", msg];
    if (code) messageMap.set(code, text || "");
  });
  return messageMap;
}

/**
 * 공통코드관리 화면의 다국어 조회 팝업과 동일 UX/API (`/cmmnMessage/languages|categories|list`)
 */
export default function MultilingualLookupPopup({ open, onClose, cmpnyCd, langCode, onSelect }: Props) {
  const uid = useId();
  const lc = langCode || "ko_KR";
  const i18nText = useCmmnScreenI18n(CMMN_COMPONENT_I18N_KEYS, CMMN_COMPONENT_I18N_FALLBACK, { cmpnyCd });
  const [messageList, setMessageList] = useState<MessageRow[]>([]);
  const [searchCondition, setSearchCondition] = useState("");
  const [category, setCategory] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<{ code: string; name: string }[]>([]);
  const [langOptions, setLangOptions] = useState<{ code: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({
    currentPageNo: 1,
    recordCountPerPage: 15,
    pageSize: 10,
    totalRecordCount: 0,
  });
  const [popupSession, setPopupSession] = useState(0);

  const paginationRef = useRef(pagination);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const prevCategoryRef = useRef(category);
  const prevSearchRef = useRef(searchCondition);
  useEffect(() => {
    if (!open || langOptions.length === 0) return;
    if (prevCategoryRef.current !== category) {
      prevCategoryRef.current = category;
      const next = { ...paginationRef.current, currentPageNo: 1 };
      paginationRef.current = next;
      setPagination(next);
    }
  }, [category, langOptions.length, open]);

  useEffect(() => {
    if (!open || langOptions.length === 0) return;
    if (prevSearchRef.current !== searchCondition) {
      prevSearchRef.current = searchCondition;
      const next = { ...paginationRef.current, currentPageNo: 1 };
      paginationRef.current = next;
      setPagination(next);
    }
  }, [searchCondition, langOptions.length, open]);

  useEffect(() => {
    if (!open) {
      setMessageList([]);
      setLangOptions([]);
      setCategoryOptions([]);
      prevCategoryRef.current = "";
      prevSearchRef.current = "";
      return;
    }
    paginationRef.current = {
      currentPageNo: 1,
      recordCountPerPage: 15,
      pageSize: 10,
      totalRecordCount: 0,
    };
    setPagination({ ...paginationRef.current });
    setSearchCondition("");
    setCategory("");
    setPopupSession((s) => s + 1);
    const p = new URLSearchParams({ langCode: lc });
    if (String(cmpnyCd).trim()) p.append("cmpnyCd", String(cmpnyCd).trim());
    EgovNet.requestFetch(
      `/cmmnMessage/languages?${p.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result?.length) setLangOptions(resp.result);
      },
      () => { }
    );
    EgovNet.requestFetch(
      `/cmmnMessage/categories?${p.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result?.length) setCategoryOptions(resp.result);
      },
      () => { }
    );
  }, [open, cmpnyCd, lc]);

  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams();
    params.append("langGb", lc);
    if (String(cmpnyCd).trim()) params.append("cmpnyCd", String(cmpnyCd).trim());
    if (category) params.append("category", category);
    if (searchCondition.trim()) params.append("searchCondition", searchCondition.trim());
    params.append("pageIndex", String(paginationRef.current.currentPageNo));
    params.append("recordCountPerPage", String(paginationRef.current.recordCountPerPage));
    EgovNet.requestFetch(
      `/cmmnMessage/list?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result) {
          setMessageList(resp.result.list || []);
          if (resp.result.paginationInfo) {
            setPagination((prev) => ({ ...prev, ...resp.result.paginationInfo }));
          }
        }
      },
      () => setMessageList([])
    );
  }, [
    open,
    popupSession,
    cmpnyCd,
    lc,
    category,
    searchCondition,
    pagination.currentPageNo,
    pagination.recordCountPerPage,
  ]);

  const handleSelectRow = (item: MessageRow) => {
    const messageMap = parseMessageMap(item.messageCns);
    const displayMessage =
      messageMap.get(lc) || (messageMap.size > 0 ? Array.from(messageMap.values())[0] : "");
    onSelect(item.langKey ?? "", displayMessage, messageMap);
    onClose();
  };

  const handleSearchClick = () => {
    setPagination((prev) => ({ ...prev, currentPageNo: 1 }));
  };

  const moveToPage = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, currentPageNo: pageIndex }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const n = parseInt(e.target.value, 10);
    setPagination((prev) => ({ ...prev, recordCountPerPage: n, currentPageNo: 1 }));
  };

  if (!open) return null;

  return (
    <div
      className="wrap_pop"
      style={{
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="pop_inner"
        style={{
          width: "1200px",
          maxWidth: "95vw",
          height: "800px",
          maxHeight: "90vh",
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          backgroundColor: "#fff",
          borderRadius: "6px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby={`${uid}-ml-title`}
      >
        <div className="pop_header">
          <h1 id={`${uid}-ml-title`}>{i18nText.titleI18nSearch}</h1>
          <button
            type="button"
            className="pop_close"
            onClick={onClose}
            aria-label={i18nText.btnClose}
          />
        </div>

        <div className="pop_container">
          <div className="condition md-condition md-condition-plain-row">
            <div className="left-box">
              <label className="f_select w_130" htmlFor="multilingualCategory">
                <select
                  id="multilingualCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">{i18nText.etcAll}</option>
                  {categoryOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="f_input" htmlFor="multilingualSearch">
                <input
                  type="text"
                  id="multilingualSearch"
                  className="f_input"
                  value={searchCondition}
                  onChange={(e) => setSearchCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                  placeholder={i18nText.placeholderSearchLangKeyMulti}
                />
              </label>
              <button
                type="button"
                className="pd-btn primary"
                onClick={handleSearchClick}
              >
                {i18nText.btnSearch}
              </button>
            </div>
          </div>

          <div className="board_list BRD006 md-admin-list board_list--flat" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="head">
              <span className="md-col-no">{i18nText.labelNo}</span>
              <span>{i18nText.labelType}</span>
              <span>{i18nText.labelLangKey}</span>
              {langOptions.map((lang) => (
                <span key={lang.code}>{lang.name}</span>
              ))}
            </div>
            <div className="result" style={{ flex: 1, overflowY: "auto" }}>
              {messageList.length > 0 ? (
                messageList.map((item, index) => {
                  const messageMap = parseMessageMap(item.messageCns);
                  const { totalRecordCount = 0, currentPageNo = 1, recordCountPerPage = 15 } = pagination;
                  const listIdx = itemIdxByPage(totalRecordCount, currentPageNo, recordCountPerPage, index);
                  return (
                    <div
                      key={`${item.langKey}-${index}`}
                      className="list_item"
                      onClick={() => handleSelectRow(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="md-col-no">{listIdx}</div>
                      <div>{item.langGb ?? ""}</div>
                      <div
                        className="link-text"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRow(item);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectRow(item);
                          }
                        }}
                      >
                        {item.langKey ?? ""}
                      </div>
                      {langOptions.map((lang) => (
                        <div key={lang.code}>
                          {decodeHtmlEntities(messageMap.get(lang.code) ?? "")}
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div className="no_data">{i18nText.msgNoSearchResult}</div>
              )}
            </div>
          </div>

          <div className="md-pagination">
            <div>
              <label className="f_select" htmlFor={`${uid}-ml-pagesize`}>
                <select
                  id={`${uid}-ml-pagesize`}
                  value={pagination.recordCountPerPage}
                  onChange={handlePageSizeChange}
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>
            <div>
              <Paging pagination={pagination} moveToPage={moveToPage} />
            </div>
            <div className="total-page-box">
              {pagination.totalRecordCount > 0
                ? `${Math.min(pagination.currentPageNo * pagination.recordCountPerPage, pagination.totalRecordCount)}/${pagination.totalRecordCount}`
                : "0/0"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
