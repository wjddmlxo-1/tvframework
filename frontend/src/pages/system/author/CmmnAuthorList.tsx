import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import Paging from "@/components/Paging";
import { CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK } from "./cmmnAuthorI18n";
import { useAuthorEmbedFormHeight } from "@/pages/system/author/AuthorEmbedLayoutContext";

type AuthorItem = {
  cmpnyCd: string;
  cmpnyNm: string;
  authorCd: string;
  authorNm: string;
  authorCn: string;
  useFl: string;
  creationDt: string;
};

type CmmnAuthorListProps = {
  /** 상위(CmmnAuthorManage)에서 회사코드만 제어할 때 */
  manageCmpnyCd?: string;
  hidePageChrome?: boolean;
  /** 목록+상세 분할: 행 클릭 시 라우팅 대신 콜백 */
  splitMode?: boolean;
  selectedRowKey?: string | null;
  onRowSelect?: (item: AuthorItem) => void;
  /** 등록 버튼: 분할 모드에서 우측 등록 폼으로 전환 */
  onRegisterClick?: () => void;
  /** 상세 저장/삭제 후 목록 재조회 */
  listRefreshToken?: number;
  /** 통합 임베드 툴바 우측(초기화/저장/삭제) 슬롯 */
  splitEmbedToolbarRight?: React.ReactNode;
};

function CmmnAuthorList(props?: CmmnAuthorListProps) {
  const { manageCmpnyCd, hidePageChrome, splitMode, selectedRowKey, onRowSelect, onRegisterClick, listRefreshToken, splitEmbedToolbarRight } = props ?? {};
  const embedFormH = useAuthorEmbedFormHeight();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const { companyList, cmpnyCd, setCmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();
  const [authorList, setAuthorList] = useState<AuthorItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const latestRequestIdRef = useRef(0);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPageNo: 1,
    recordCountPerPage: 15,
    pageSize: 10,
    totalRecordCount: 0,
  });

  /** 상위에서 회사를 넘기면 그 코드로, 아니면 로컬 콤보 선택값으로 조회 */
  const effectiveCmpny = manageCmpnyCd !== undefined ? String(manageCmpnyCd ?? "").trim() : String(cmpnyCd ?? "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK, {
    cmpnyCd: effectiveCmpny || null,
  });

  const retrieveList = useCallback(() => {
    if (!effectiveCmpny) return;
    const requestId = ++latestRequestIdRef.current;

    if (splitMode) {
      const listURL = `/cmmnAuthor/authorsAll?cmpnyCd=${encodeURIComponent(effectiveCmpny)}&searchKeyword=${encodeURIComponent(searchKeyword)}`;
      EgovNet.requestFetch(
        listURL,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (requestId !== latestRequestIdRef.current) return;
          if (resp?.result && Array.isArray(resp.result)) {
            const rows = resp.result as AuthorItem[];
            setAuthorList(rows);
            setPaginationInfo((prev) => ({
              ...prev,
              currentPageNo: 1,
              totalRecordCount: rows.length,
            }));
          } else {
            setAuthorList([]);
          }
        },
        () => {
          if (requestId !== latestRequestIdRef.current) return;
          alert(i18nText.msgErrorOnList);
        }
      );
      return;
    }

    const pageIndex = paginationInfo.currentPageNo;
    const recordCountPerPage = paginationInfo.recordCountPerPage;
    const listURL = `/cmmnAuthor/list?cmpnyCd=${encodeURIComponent(effectiveCmpny)}&searchKeyword=${encodeURIComponent(searchKeyword)}&pageIndex=${pageIndex}&recordCountPerPage=${recordCountPerPage}`;

    EgovNet.requestFetch(
      listURL,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (requestId !== latestRequestIdRef.current) return;
        if (resp && resp.result) {
          const result = resp.result;
          setAuthorList(result.list || []);
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
  }, [splitMode, effectiveCmpny, searchKeyword, paginationInfo.currentPageNo, paginationInfo.recordCountPerPage, i18nText.msgErrorOnList]);

  useEffect(() => {
    if (manageCmpnyCd !== undefined) {
      if (effectiveCmpny) retrieveList();
      return;
    }
    if (companyList.length > 0 || !cmpnyCd) retrieveList();
  }, [retrieveList, companyList.length, cmpnyCd, manageCmpnyCd, effectiveCmpny]);

  useEffect(() => {
    if (listRefreshToken === undefined || listRefreshToken < 1) return;
    retrieveList();
  }, [listRefreshToken, retrieveList]);

  const handleSearch = () => {
    if (!splitMode && paginationInfo.currentPageNo !== 1) {
      setPaginationInfo((prev) => ({ ...prev, currentPageNo: 1 }));
      return;
    }
    retrieveList();
  };

  const handleDelete = () => {
    if (selectedKeys.size === 0) {
      alert(i18nText.msgSelectItemToDelete);
      return;
    }
    if (!confirm(i18nText.msgConfirmDeleteAuth)) return;

    const list = authorList
      .filter((item) => selectedKeys.has(`${item.cmpnyCd}|${item.authorCd}`))
      .filter((item) => item.authorCd !== "AUTH_ADMIN" && item.authorCd !== "SYS_ADMIN")
      .map((item) => ({ cmpnyCd: item.cmpnyCd, authorCd: item.authorCd }));

    if (list.length === 0) {
      alert(i18nText.msgNoDeletableItem);
      return;
    }

    EgovNet.requestFetch(
      "/cmmnAuthor/deleteList",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(list),
      },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgDeleted);
          setSelectedKeys(new Set());
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

  const rowKey = (item: AuthorItem) => `${item.cmpnyCd}|${item.authorCd}`;

  const toggleSelect = (item: AuthorItem) => {
    const key = rowKey(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectableList = authorList.filter((item) => item.authorCd !== "AUTH_ADMIN" && item.authorCd !== "SYS_ADMIN");
  const toggleSelectAll = () => {
    const allSelectableKeys = new Set(selectableList.map(rowKey));
    const allSelected = selectableList.length > 0 && selectedKeys.size === selectableList.length && selectableList.every((item) => selectedKeys.has(rowKey(item)));
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(allSelectableKeys);
    }
  };
  const isAllSelectableChecked = selectableList.length > 0 && selectableList.every((item) => selectedKeys.has(rowKey(item)));

  const conditionInline = (
    <>
      {manageCmpnyCd === undefined && (
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
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        <label className="f_input" htmlFor="searchKeyword" style={{ flex: "1 1 0%", minWidth: 200, margin: 0 }}>
          <input
            type="text"
            id="searchKeyword"
            placeholder={i18nText.placeholderSearchAuthNameCode}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </label>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0, alignItems: "center" }}>
          <button type="button" className="btn btn_default_h46" onClick={handleSearch}>
            <span>{i18nText.btnSearch}</span>
          </button>
          {!splitMode && (
            <button
              type="button"
              className="btn btn_blue_h46"
              onClick={() => (onRegisterClick ? onRegisterClick() : navigate(URL.SYSTEM_AUTHOR_CREATE))}
            >
              <span>{i18nText.btnRegister}</span>
            </button>
          )}
          <button type="button" className="btn btn_dark_h46" onClick={handleDelete}>
            <span>{i18nText.btnDelete}</span>
          </button>
        </div>
      </div>
    </>
  );

  const conditionBlock = (
    <div className="condition md-condition" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
      {conditionInline}
    </div>
  );

  const tableBlock = (
    <div
      className={`board_list BRD006 md-admin-list md-author-list-cols${splitMode ? " md-author-split-list-scroll" : ""} no-top-border`}
      style={
        splitMode
          ? {
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginTop: 0,
          }
          : undefined
      }
    >
      <div className="head">
        <span className="md-col-chk">
          <input
            type="checkbox"
            checked={isAllSelectableChecked}
            onChange={toggleSelectAll}
            aria-label={selectableList.length === 0 ? i18nText.msgNoSelectableItem : i18nText.etcSelectDeletableExceptAdmin}
          />
        </span>
        <span className="md-col-author-cd">{i18nText.labelAuthCode}</span>
        <span className="md-col-author-nm">{i18nText.labelAuthName}</span>
        <span className="md-col-author-dc">{i18nText.labelAuthDesc}</span>
      </div>
      <div className="result" style={splitMode ? { flex: 1, minHeight: 0, overflowY: "auto" } : undefined}>
        {authorList.length === 0 ? (
          <p className="no_data" key="0">{i18nText.msgNoSearchResult}</p>
        ) : (
          authorList.map((item) => {
            const rowSelKey = rowKey(item);
            const isRowSelected = splitMode && selectedRowKey != null && selectedRowKey === rowSelKey;
            const rowStyle = isRowSelected ? { backgroundColor: "#e8f4fc" as const } : undefined;
            const rowInner = (
              <>
                <div
                  className="md-col-chk"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedKeys.has(rowSelKey)}
                    onChange={() => toggleSelect(item)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={item.authorCd === "AUTH_ADMIN" || item.authorCd === "SYS_ADMIN"}
                    title={item.authorCd === "AUTH_ADMIN" || item.authorCd === "SYS_ADMIN" ? i18nText.msgSystemAuthNotDeletable : ""}
                    aria-label={`${item.authorNm ?? item.authorCd}${i18nText.ariaSelectSuffix}`}
                  />
                </div>
                <div className="md-col-author-cd">{item.authorCd}</div>
                <div className="md-col-author-nm">{item.authorNm ?? ""}</div>
                <div className="md-col-author-dc" title={item.authorCn ?? ""}>
                  {item.authorCn ?? ""}
                </div>
              </>
            );
            if (splitMode && onRowSelect) {
              return (
                <div
                  key={rowSelKey}
                  role="button"
                  tabIndex={0}
                  className="list_item"
                  style={{ cursor: "pointer", ...rowStyle }}
                  onClick={() => onRowSelect(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowSelect(item);
                    }
                  }}
                >
                  {rowInner}
                </div>
              );
            }
            return (
              <Link
                key={rowSelKey}
                to={URL.SYSTEM_AUTHOR_DETAIL}
                state={{ cmpnyCd: item.cmpnyCd, authorCd: item.authorCd }}
                className="list_item"
                style={rowStyle}
              >
                {rowInner}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );

  const inner = (
    <>
      {splitMode ? (
        <>
          {splitEmbedToolbarRight != null ? (
            <div className="card-bar">
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                {conditionInline}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>{splitEmbedToolbarRight}</div>
            </div>
          ) : (
            <div className="card-bar">
              {conditionInline}
            </div>
          )}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {tableBlock}
          </div>
        </>
      ) : (
        <>
          {conditionBlock}
          {tableBlock}
          <div className="board_bot">
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
              <div>
                {paginationInfo.totalRecordCount > 0
                  ? `${Math.min(paginationInfo.currentPageNo * paginationInfo.recordCountPerPage, paginationInfo.totalRecordCount)}/${paginationInfo.totalRecordCount}`
                  : i18nText.etcZeroCount}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  if (hidePageChrome) {
    return inner;
  }

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
              {inner}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CmmnAuthorList;
