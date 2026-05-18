import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { itemIdxByPage } from "@/utils/calc";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import Paging from "@/components/Paging";
import { CMMN_GROUP_I18N_KEYS, CMMN_GROUP_I18N_FALLBACK } from "./cmmnGroupI18n";

type GroupItem = {
  cmpnyCd: string;
  cmpnyNm: string;
  groupId: string;
  groupNm: string;
  groupEngNm: string;
  groupCn: string;
  useFl: string;
  creationDt: string;
};

function CmmnGroupList() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const { companyList, cmpnyCd, setCmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_GROUP_I18N_KEYS, CMMN_GROUP_I18N_FALLBACK, { cmpnyCd });
  const [groupList, setGroupList] = useState<GroupItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
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
    const requestId = ++latestRequestIdRef.current;
    const listURL = `/cmmnGroup/list?cmpnyCd=${encodeURIComponent(cmpnyCd)}&searchKeyword=${encodeURIComponent(searchKeyword)}&pageIndex=${pageIndex}&recordCountPerPage=${recordCountPerPage}`;

    EgovNet.requestFetch(
      listURL,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (requestId !== latestRequestIdRef.current) return;
        if (resp && resp.result) {
          const result = resp.result;
          setGroupList(result.list || []);
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
  }, [cmpnyCd, searchKeyword, paginationInfo.currentPageNo, paginationInfo.recordCountPerPage, i18nText.msgErrorOnList]);

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
    if (selectedKeys.size === 0) {
      alert(i18nText.msgSelectItemToDelete);
      return;
    }
    if (!confirm(i18nText.msgConfirmDeleteGroup)) return;

    const list = groupList
      .filter((item) => selectedKeys.has(`${item.cmpnyCd}|${item.groupId}`))
      .map((item) => ({ cmpnyCd: item.cmpnyCd, groupId: item.groupId }));

    EgovNet.requestFetch(
      "/cmmnGroup/deleteList",
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

  const rowKey = (item: GroupItem) => `${item.cmpnyCd}|${item.groupId}`;

  const toggleSelect = (item: GroupItem) => {
    const key = rowKey(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (groupList.length === 0) return;
    const allSelected = groupList.every((item) => selectedKeys.has(rowKey(item)));
    if (allSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(groupList.map(rowKey)));
    }
  };
  const isAllChecked = groupList.length > 0 && groupList.every((item) => selectedKeys.has(rowKey(item)));

  const goDetail = (item: GroupItem) => {
    navigate(URL.SYSTEM_GROUP_DETAIL, {
      state: { cmpnyCd: item.cmpnyCd, groupId: item.groupId },
    });
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
                  <label className="f_select" htmlFor="cmpnyCd">
                    <select
                      id="cmpnyCd"
                      value={String(cmpnyCd ?? "")}
                      onChange={(e) => {
                        const v = e.target.value;
                        syncCompanySession(v);
                        setSelectedKeys(new Set());
                        setPaginationInfo((prev) => ({ ...prev, currentPageNo: 1 }));
                      }}
                    >
                      {companyList.map((c) => (
                        <option key={c.cmpnyCd} value={c.cmpnyCd}>{c.cmpnyNm}</option>
                      ))}
                    </select>
                  </label>
                  <label className="f_input" htmlFor="searchKeyword">
                    <input
                      type="text"
                      id="searchKeyword"
                      placeholder={i18nText.placeholderSearchGroupNameId}
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </label>
                </div>
                <div className="right-box">
                  <button type="button" className="pd-btn" onClick={() => navigate(URL.SYSTEM_GROUP_CREATE)}>
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
                      checked={isAllChecked}
                      onChange={toggleSelectAll}
                      aria-label={i18nText.etcAllSelect}
                    />
                  </span>
                  <span className="md-col-no">{i18nText.labelNo}</span>
                  <span>{i18nText.labelCompanyName}</span>
                  <span>{i18nText.labelGroupId}</span>
                  <span>{i18nText.labelGroupName}</span>
                  <span>{i18nText.labelGroupEngName}</span>
                  <span>{i18nText.labelGroupDesc}</span>
                  <span>{i18nText.labelRegDate}</span>
                  <span className="md-col-use">{i18nText.labelUseYn}</span>
                </div>
                <div className="result">
                  {groupList.length === 0 ? (
                    <p className="no_data" key="0">{i18nText.msgNoSearchResult}</p>
                  ) : (
                    groupList.map((item, index) => {
                      const listIdx = itemIdxByPage(
                        paginationInfo.totalRecordCount || 0,
                        paginationInfo.currentPageNo || 1,
                        paginationInfo.recordCountPerPage || 15,
                        index
                      );
                      return (
                        <Link
                          key={rowKey(item)}
                          to={URL.SYSTEM_GROUP_DETAIL}
                          state={{ cmpnyCd: item.cmpnyCd, groupId: item.groupId }}
                          className="list_item"
                        >
                          <div className="md-col-chk" onClick={(e) => e.preventDefault()}>
                            <input
                              type="checkbox"
                              checked={selectedKeys.has(rowKey(item))}
                              onChange={() => toggleSelect(item)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`${item.groupNm ?? item.groupId}${i18nText.ariaSelectSuffix}`}
                            />
                          </div>
                          <div className="md-col-no">{listIdx}</div>
                          <div>{item.cmpnyNm ?? ""}</div>
                          <div>{item.groupId}</div>
                          <div>{item.groupNm ?? ""}</div>
                          <div>{item.groupEngNm ?? ""}</div>
                          <div title={item.groupCn ?? ""}>{item.groupCn ?? ""}</div>
                          <div>{item.creationDt ?? ""}</div>
                          <div className="md-col-use">{item.useFl === "Y" ? i18nText.etcY : i18nText.etcN}</div>
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

export default CmmnGroupList;
