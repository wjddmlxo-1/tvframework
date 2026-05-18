import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import useDebounce from "@/hooks/useDebounce";
import * as EgovNet from "@/api/egovFetch";
import { fetchDeptTree, buildDeptHierarchy, expandDeptTreeToLevel2, type DeptTreeItem, type DeptTreeHierarchyNode } from "@/api/deptTree";
import URL from "@/constants/url";
import { fetchCompanyList, resolveCmpnyCdForFormCreate } from "@/api/companyList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import { CMMN_GROUP_I18N_KEYS, CMMN_GROUP_I18N_FALLBACK } from "./cmmnGroupI18n";

type GroupUserRow = { mbrshSq: number; userId: string; userNm?: string; deptNm?: string };
type UserSearchItem = { mbrshSq: number; userId: string; userNm?: string; deptNm?: string };

function CmmnGroupEdit(props: { mode: "create" | "detail" }) {
  const { mode } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { langGb } = useLanguage();
  const state = (location.state as { cmpnyCd?: string; groupId?: string }) || {};
  const cmpnyCdFromState = state.cmpnyCd;
  const groupIdFromState = state.groupId;

  const isCreate = mode === "create";
  const isDetail = mode === "detail";

  const [companyList, setCompanyList] = useState<{ cmpnyCd: string; cmpnyNm: string }[]>([]);
  const [form, setForm] = useState({
    cmpnyCd: "",
    groupId: "",
    groupNm: "",
    groupEngNm: "",
    groupCn: "",
    useFl: "Y",
  });
  const i18nText = useCmmnScreenI18n(CMMN_GROUP_I18N_KEYS, CMMN_GROUP_I18N_FALLBACK, { cmpnyCd: form.cmpnyCd });
  const [groupUserList, setGroupUserList] = useState<GroupUserRow[]>([]);
  const [selectedAuthorRows, setSelectedAuthorRows] = useState<Set<number>>(new Set());

  const [activeTab, setActiveTab] = useState<"user" | "dept">("user");
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [userSearchList, setUserSearchList] = useState<UserSearchItem[]>([]);
  const [selectedUserMbrshSq, setSelectedUserMbrshSq] = useState<Set<number>>(new Set());
  const [deptTree, setDeptTree] = useState<DeptTreeItem[]>([]);
  const [deptExpandedNodes, setDeptExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedDeptCd, setSelectedDeptCd] = useState<string | null>(null);
  const [deptUserList, setDeptUserList] = useState<UserSearchItem[]>([]);
  const [selectedDeptUserMbrshSq, setSelectedDeptUserMbrshSq] = useState<Set<number>>(new Set());

  const loadCompanies = useCallback(() => {
    fetchCompanyList((list) => {
      setCompanyList(list);
      if (!isDetail && list?.length) {
        const initialCmpnyCd = resolveCmpnyCdForFormCreate(list);
        if (initialCmpnyCd) {
          setForm((f) => ({ ...f, cmpnyCd: initialCmpnyCd }));
        }
      }
    }, () => { });
  }, [isDetail]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const loadDetail = useCallback(() => {
    if (!cmpnyCdFromState || !groupIdFromState) return;
    EgovNet.requestFetch(
      `/cmmnGroup/detail?cmpnyCd=${encodeURIComponent(cmpnyCdFromState)}&groupId=${encodeURIComponent(groupIdFromState)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result) {
          const r = resp.result;
          setForm({
            cmpnyCd: r.cmpnyCd ?? "",
            groupId: r.groupId ?? "",
            groupNm: r.groupNm ?? "",
            groupEngNm: r.groupEngNm ?? "",
            groupCn: r.groupCn ?? "",
            useFl: r.useFl === "N" ? "N" : "Y",
          });
        }
      },
      () => {
        alert(i18nText.msgErrorOnRetrieve);
        navigate(URL.SYSTEM_GROUP);
      }
    );
  }, [cmpnyCdFromState, groupIdFromState, navigate, i18nText.msgErrorOnRetrieve]);

  const loadGroupUsers = useCallback(() => {
    if (!cmpnyCdFromState || !groupIdFromState) return;
    const lang = langGb || "ko_KR";
    EgovNet.requestFetch(
      `/cmmnGroup/users?cmpnyCd=${encodeURIComponent(cmpnyCdFromState)}&groupId=${encodeURIComponent(groupIdFromState)}&langGb=${encodeURIComponent(lang)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setGroupUserList(
            resp.result.map((u: { mbrshSq: number; userId: string; userNm?: string; deptNm?: string }) => ({
              mbrshSq: u.mbrshSq,
              userId: u.userId ?? "",
              userNm: u.userNm ?? "",
              deptNm: u.deptNm ?? "",
            }))
          );
        }
      },
      () => { }
    );
  }, [cmpnyCdFromState, groupIdFromState, langGb]);

  useEffect(() => {
    if (isDetail && cmpnyCdFromState && groupIdFromState) {
      loadDetail();
      loadGroupUsers();
    }
  }, [isDetail, cmpnyCdFromState, groupIdFromState, loadDetail, loadGroupUsers]);

  const fetchUserSearch = useCallback(() => {
    if (!form.cmpnyCd) {
      setUserSearchList([]);
      return;
    }
    const lang = langGb || "ko_KR";
    EgovNet.requestFetch(
      `/cmmnGroup/userSearch?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&searchKeyword=${encodeURIComponent(userSearchKeyword)}&langGb=${encodeURIComponent(lang)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setUserSearchList(resp.result);
        } else {
          setUserSearchList([]);
        }
      },
      () => setUserSearchList([])
    );
  }, [form.cmpnyCd, userSearchKeyword, langGb]);

  const fetchUserSearchRef = useRef(fetchUserSearch);
  fetchUserSearchRef.current = fetchUserSearch;
  const debouncedFetchUserSearch = useDebounce(() => fetchUserSearchRef.current(), 300);

  useEffect(() => {
    if (activeTab === "user" && form.cmpnyCd) fetchUserSearch();
  }, [activeTab, form.cmpnyCd, fetchUserSearch]);

  /** 遺???몃━ 議고쉶 (怨듯넻 API ?ъ슜) */
  const loadDeptTree = useCallback(() => {
    if (!form.cmpnyCd) {
      setDeptTree([]);
      setDeptExpandedNodes(new Set());
      return;
    }
    fetchDeptTree(
      form.cmpnyCd,
      langGb || "ko_KR",
      (list) => {
        setDeptTree(list);
        setDeptExpandedNodes(expandDeptTreeToLevel2(list));
      },
      () => { setDeptTree([]); setDeptExpandedNodes(new Set()); }
    );
  }, [form.cmpnyCd, langGb]);

  const fetchDeptUsers = useCallback(() => {
    if (!form.cmpnyCd || !selectedDeptCd) {
      setDeptUserList([]);
      return;
    }
    const lang = langGb || "ko_KR";
    EgovNet.requestFetch(
      `/cmmnGroup/deptUsers?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&deptCd=${encodeURIComponent(selectedDeptCd)}&langGb=${encodeURIComponent(lang)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setDeptUserList(resp.result);
          setSelectedDeptUserMbrshSq(new Set());
        } else {
          setDeptUserList([]);
        }
      },
      () => setDeptUserList([])
    );
  }, [form.cmpnyCd, selectedDeptCd, langGb]);

  useEffect(() => {
    if (activeTab === "dept" && form.cmpnyCd) loadDeptTree();
  }, [activeTab, form.cmpnyCd, loadDeptTree]);

  useEffect(() => {
    if (activeTab === "dept" && selectedDeptCd) fetchDeptUsers();
    else if (activeTab !== "dept") setDeptUserList([]);
  }, [activeTab, selectedDeptCd, fetchDeptUsers]);

  const deptTreeHierarchy = buildDeptHierarchy(deptTree);

  const toggleDeptNode = (deptCd: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeptExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(deptCd)) next.delete(deptCd);
      else next.add(deptCd);
      return next;
    });
  };

  const addUsersToGroup = () => {
    const toAdd = userSearchList.filter((u) => selectedUserMbrshSq.has(u.mbrshSq));
    const existingSq = new Set(groupUserList.map((u) => u.mbrshSq));
    const newOnes = toAdd.filter((u) => !existingSq.has(u.mbrshSq));
    if (newOnes.length === 0) return;
    setGroupUserList((prev) => [...prev, ...newOnes.map((u) => ({ mbrshSq: u.mbrshSq, userId: u.userId, userNm: u.userNm, deptNm: u.deptNm }))]);
    setSelectedUserMbrshSq(new Set());
  };

  const addDeptUsersToGroup = () => {
    const toAdd = deptUserList.filter((u) => selectedDeptUserMbrshSq.has(u.mbrshSq));
    const existingSq = new Set(groupUserList.map((u) => u.mbrshSq));
    const newOnes = toAdd.filter((u) => !existingSq.has(u.mbrshSq));
    if (newOnes.length === 0) return;
    setGroupUserList((prev) => [...prev, ...newOnes.map((u) => ({ mbrshSq: u.mbrshSq, userId: u.userId, userNm: u.userNm, deptNm: u.deptNm }))]);
    setSelectedDeptUserMbrshSq(new Set());
  };

  const removeSelectedFromGroup = () => {
    const toRemove = Array.from(selectedAuthorRows);
    setGroupUserList((prev) => prev.filter((_, idx) => !selectedAuthorRows.has(idx)));
    setSelectedAuthorRows(new Set());
  };

  const toggleAuthorRow = (idx: number) => {
    setSelectedAuthorRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const panelStyle = {
    padding: "8px 12px 10px 8px",
    minHeight: "400px",
    backgroundColor: "#fff",
  };
  const upperPanelStyle = {
    ...panelStyle,
    minHeight: 0,
    padding: "6px 12px 6px 8px",
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form.cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    if (!form.groupId?.trim()) {
      alert(i18nText.msgEnterGroupId);
      return;
    }
    if (!form.groupNm?.trim()) {
      alert(i18nText.msgEnterGroupName);
      return;
    }
    if (!form.groupEngNm?.trim()) {
      alert(i18nText.msgEnterGroupNameEn);
      return;
    }

    const body = {
      cmpnyCd: form.cmpnyCd,
      groupId: form.groupId,
      groupNm: form.groupNm,
      groupEngNm: form.groupEngNm,
      groupCn: form.groupCn || "",
      useFl: form.useFl,
      mbrshSqList: groupUserList.map((u) => u.mbrshSq),
    };

    if (isCreate) {
      EgovNet.requestFetch(
        "/cmmnGroup",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgRegistered);
            navigate(URL.SYSTEM_GROUP);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnRegister);
            const focusInfo = resp?.result;
            if (focusInfo && typeof focusInfo === "object" && (focusInfo as { duplicateKey?: string }).duplicateKey === "GROUP_ID") {
              setTimeout(() => document.getElementById("groupEdit_groupId")?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnRegister)
      );
    } else {
      EgovNet.requestFetch(
        "/cmmnGroup",
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgUpdated);
            navigate(URL.SYSTEM_GROUP);
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
    if (!window.confirm(i18nText.msgConfirmDeleteGroup)) return;
    EgovNet.requestFetch(
      `/cmmnGroup?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&groupId=${encodeURIComponent(form.groupId)}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgDeleted);
          navigate(URL.SYSTEM_GROUP);
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const renderDeptTreeNode = (node: DeptTreeHierarchyNode, level = 0, isLast = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = deptExpandedNodes.has(node.deptCd);
    const isSelected = selectedDeptCd === node.deptCd;

    return (
      <div key={node.deptCd} style={{ position: "relative" }}>
        {level > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: (level - 1) * 16 + 15,
                top: 0,
                ...(isLast ? { height: 16 } : { bottom: 0 }),
                width: 1,
                borderLeft: "1px solid #ddd",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: (level - 1) * 16 + 15,
                top: 16,
                width: 13,
                height: 1,
                borderTop: "1px solid #ddd",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </>
        )}
        {hasChildren && isExpanded && (
          <div
            style={{
              position: "absolute",
              left: level * 16 + 15,
              top: 16,
              height: 20,
              width: 1,
              borderLeft: "1px solid #ddd",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}
        <div
          className={`tree-node${isSelected ? " tree-node--selected" : ""}`}
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8 }}
          onClick={() => {
            setSelectedDeptCd(node.deptCd);
            if (hasChildren && !isExpanded) toggleDeptNode(node.deptCd);
          }}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleDeptNode(node.deptCd, e)} className="tree-toggle-wrap">
              <span className="tree-toggle-btn">{isExpanded ? "−" : "+"}</span>
            </span>
          ) : (
            <span style={{ display: "none" }} />
          )}
          {hasChildren ? (
            <i className={`icon-box ${isExpanded ? "icon-folder-open" : "icon-folder"}`} />
          ) : (
            <i className="ph ph-file menu-tree-file-icon" />
          )}
          <span className="tree-node-label">{node.deptNm || node.deptCd}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, index) =>
              renderDeptTreeNode(child, level + 1, index === node.children!.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (isDetail && !cmpnyCdFromState && !groupIdFromState) {
    navigate(URL.SYSTEM_GROUP);
    return null;
  }

  const pageTitle = isCreate ? i18nText.titleGroupCreate : i18nText.titleGroupDetail;

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{pageTitle}</h1>
          <ul>
            <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
            <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
            <li><Link to={URL.SYSTEM_GROUP}>{i18nText.pageTitle}</Link></li>
            <li>{pageTitle}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents contents--author contents--group" id="contents">
            <div className="condition md-condition md-condition-plain-row">
              <div className="left-box" />
              <div className="right-box">
                <button type="button" className="pd-btn" onClick={() => navigate(URL.SYSTEM_GROUP)}>{i18nText.btnList}</button>
                {isDetail && (
                  <button type="button" className="pd-btn" onClick={handleDelete}>{i18nText.btnDelete}</button>
                )}
                <button type="button" className="pd-btn primary" onClick={() => handleSubmit()}>{i18nText.btnSave}</button>
              </div>
            </div>

            <div className="gr-grid">

              {/* Card 1: 상단 폼 */}
              <div className="au-card">
                <div className="gr-form-body">
                  <div className="board_view2 md-program-edit-form">
                    <div style={{ display: "flex", gap: "16px", flexWrap: "nowrap", width: "100%", boxSizing: "border-box" }}>
                      <dl style={{ flex: "1 1 0%", minWidth: 0, margin: 0 }}>
                        <dt>{i18nText.labelCompanyName} <span className="req">*</span></dt>
                        <dd>
                          <select
                            className="f_select w_full"
                            value={form.cmpnyCd}
                            onChange={(e) => setForm((f) => ({ ...f, cmpnyCd: e.target.value }))}
                            disabled={isDetail}
                            style={{ backgroundColor: isDetail ? "#f5f5f5" : "#fff" }}
                          >
                            {companyList.map((c) => (
                              <option key={c.cmpnyCd} value={c.cmpnyCd}>{c.cmpnyNm}</option>
                            ))}
                          </select>
                        </dd>
                      </dl>
                      <dl style={{ flex: "1 1 0%", minWidth: 0, margin: 0 }}>
                        <dt>{i18nText.labelGroupId} <span className="req">*</span></dt>
                        <dd>
                          <input
                            id="groupEdit_groupId"
                            type="text"
                            className="f_input w_full"
                            value={form.groupId}
                            onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}
                            disabled={isDetail}
                            placeholder={i18nText.placeholderGroupId}
                            style={{ backgroundColor: isDetail ? "#f5f5f5" : "#fff" }}
                          />
                        </dd>
                      </dl>
                    </div>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "nowrap", width: "100%", boxSizing: "border-box" }}>
                      <dl style={{ flex: "1 1 0%", minWidth: 0, margin: 0 }}>
                        <dt>{i18nText.labelGroupName} <span className="req">*</span></dt>
                        <dd>
                          <input
                            type="text"
                            className="f_input w_full"
                            value={form.groupNm}
                            onChange={(e) => setForm((f) => ({ ...f, groupNm: e.target.value }))}
                            placeholder={i18nText.placeholderGroupName}
                          />
                        </dd>
                      </dl>
                      <dl style={{ flex: "1 1 0%", minWidth: 0, margin: 0 }}>
                        <dt>{i18nText.labelGroupEngName} <span className="req">*</span></dt>
                        <dd>
                          <input
                            type="text"
                            className="f_input w_full"
                            value={form.groupEngNm}
                            onChange={(e) => setForm((f) => ({ ...f, groupEngNm: e.target.value }))}
                            placeholder={i18nText.placeholderGroupNameEn}
                          />
                        </dd>
                      </dl>
                    </div>
                    <dl>
                      <dt>{i18nText.labelUseYn} <span className="req">*</span></dt>
                      <dd>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input type="radio" name="useFl" value="Y" checked={form.useFl === "Y"} onChange={() => setForm((f) => ({ ...f, useFl: "Y" }))} />
                            <span>{i18nText.etcUseRadio}</span>
                          </label>
                          <label className="radio-label">
                            <input type="radio" name="useFl" value="N" checked={form.useFl === "N"} onChange={() => setForm((f) => ({ ...f, useFl: "N" }))} />
                            <span>{i18nText.etcNotUseRadio}</span>
                          </label>
                        </div>
                      </dd>
                    </dl>
                    <dl>
                      <dt>{i18nText.labelGroupDesc2}</dt>
                      <dd>
                        <textarea
                          className="f_txtar w_full"
                          value={form.groupCn}
                          onChange={(e) => setForm((f) => ({ ...f, groupCn: e.target.value }))}
                          rows={2}
                          placeholder={i18nText.placeholderGroupDescription}
                        />
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              {/* ?? ?섎떒 3-?⑤꼸: 醫뚯륫 ??+ ?붿궡??+ ?곗륫 洹몃９?ъ슜???? */}
              <div className="gr-bottom">

                {/* Card 2: 醫뚯륫 - ?ъ슜??遺????*/}
                <div className="au-card">
                  <div className="au-sub-tabs">
                    <button type="button" className={`sub-tab${activeTab === "user" ? " active" : ""}`} onClick={() => setActiveTab("user")}>{i18nText.etcTabUser}</button>
                    <button type="button" className={`sub-tab${activeTab === "dept" ? " active" : ""}`} onClick={() => setActiveTab("dept")}>{i18nText.etcTabDept}</button>
                  </div>

                  {activeTab === "user" && (
                    <>
                      <div className="card-search-row">
                        <span>{i18nText.labelUserNameField}</span>
                        <label className="f_input" style={{ flex: 1, minWidth: 0, margin: 0 }}>
                          <input
                            type="text"
                            placeholder={i18nText.placeholderSearchUserNameId}
                            value={userSearchKeyword}
                            onChange={(e) => {
                              setUserSearchKeyword(e.target.value);
                              debouncedFetchUserSearch();
                            }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), fetchUserSearch())}
                          />
                        </label>
                      </div>
                      <div className="board_list BRD006 md-admin-list no-border-top" style={{ overflow: "auto" }}>
                        <div className="head">
                          <span className="md-col-chk"><input type="checkbox" checked={userSearchList.length > 0 && selectedUserMbrshSq.size === userSearchList.length} onChange={(e) => setSelectedUserMbrshSq(e.target.checked ? new Set(userSearchList.map((u) => u.mbrshSq)) : new Set())} aria-label={i18nText.etcAllSelect} /></span>
                          <span className="md-col-no">{i18nText.labelNo}</span>
                          <span>{i18nText.colUserId}</span>
                          <span>{i18nText.colUserNm}</span>
                          <span>{i18nText.colDeptNm}</span>
                        </div>
                        <div className="result">
                          {userSearchList.length === 0 ? (
                            <p className="no_data">{i18nText.hintUserSearchAuto}</p>
                          ) : (
                            userSearchList.map((u, idx) => (
                              <div key={u.mbrshSq} className="list_item">
                                <div className="md-col-chk"><input type="checkbox" checked={selectedUserMbrshSq.has(u.mbrshSq)} onChange={() => setSelectedUserMbrshSq((prev) => { const n = new Set(prev); if (n.has(u.mbrshSq)) n.delete(u.mbrshSq); else n.add(u.mbrshSq); return n; })} aria-label={`${u.userNm ?? u.userId}${i18nText.ariaSelectSuffix}`} /></div>
                                <div className="md-col-no">{idx + 1}</div>
                                <div>{u.userId}</div>
                                <div>{u.userNm ?? ""}</div>
                                <div>{u.deptNm ?? "-"}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "dept" && (
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
                      {/* 트리 영역 */}
                      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 8px" }}>
                        {deptTree.length === 0 ? (
                          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{i18nText.msgDeptTreeHelp}</div>
                        ) : deptTreeHierarchy.length > 0 ? (
                          deptTreeHierarchy.map((node, index) => renderDeptTreeNode(node, 0, index === deptTreeHierarchy.length - 1))
                        ) : (
                          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{i18nText.msgNoDeptInCompany}</div>
                        )}
                      </div>
                      {/* 부서 사용자 영역 */}
                      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, maxHeight: "45%", margin: "8px 0 0 0", overflow: "hidden" }}>
                        <div className="sub-panel-header">{i18nText.titleDeptUsers}</div>
                        <div className="board_list BRD006 md-admin-list no-border-top" style={{ flex: 1, minHeight: 0, overflow: "auto", border: "none" }}>
                          <div className="head">
                            <span className="md-col-chk"><input type="checkbox" checked={deptUserList.length > 0 && selectedDeptUserMbrshSq.size === deptUserList.length} onChange={(e) => setSelectedDeptUserMbrshSq(e.target.checked ? new Set(deptUserList.map((u) => u.mbrshSq)) : new Set())} aria-label={i18nText.etcAllSelect} /></span>
                            <span className="md-col-no">{i18nText.labelNo}</span>
                            <span>{i18nText.colUserId}</span>
                            <span>{i18nText.colUserNm}</span>
                            <span>{i18nText.colDeptNm}</span>
                          </div>
                          <div className="result">
                            {!selectedDeptCd ? (
                              <p className="no_data">{i18nText.msgSelectDept}</p>
                            ) : deptUserList.length === 0 ? (
                              <p className="no_data">{i18nText.msgNoUsersInDept}</p>
                            ) : (
                              deptUserList.map((u, idx) => (
                                <div key={u.mbrshSq} className="list_item">
                                  <div className="md-col-chk"><input type="checkbox" checked={selectedDeptUserMbrshSq.has(u.mbrshSq)} onChange={() => setSelectedDeptUserMbrshSq((prev) => { const n = new Set(prev); if (n.has(u.mbrshSq)) n.delete(u.mbrshSq); else n.add(u.mbrshSq); return n; })} aria-label={`${u.userNm ?? u.userId}${i18nText.ariaSelectSuffix}`} /></div>
                                  <div className="md-col-no">{idx + 1}</div>
                                  <div>{u.userId}</div>
                                  <div>{u.userNm ?? ""}</div>
                                  <div>{u.deptNm ?? "-"}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ?붿궡??踰꾪듉 */}
                <div className="transfer-arrows">
                  <button
                    type="button"
                    className="arr-btn"
                    onClick={activeTab === "user" ? addUsersToGroup : addDeptUsersToGroup}
                    title={i18nText.ariaAddUsersToGroup}
                  >
                    <i className="ph ph-caret-right" />
                  </button>
                  <button
                    type="button"
                    className="arr-btn"
                    onClick={removeSelectedFromGroup}
                    title={i18nText.ariaRemoveFromGroup}
                  >
                    <i className="ph ph-caret-left" />
                  </button>
                </div>

                {/* Card 3: ?곗륫 - 洹몃９ ?ъ슜??*/}
                <div className="au-card">
                  <div className="card-bar">
                    <span style={{ fontWeight: 600 }}>{i18nText.titleGroupUsersPanel}</span>
                  </div>
                  <div className="board_list BRD006 md-admin-list no-border-top" style={{ overflow: "auto" }}>
                    <div className="head">
                      <span className="md-col-chk"><input type="checkbox" checked={groupUserList.length > 0 && selectedAuthorRows.size === groupUserList.length} onChange={(e) => setSelectedAuthorRows(e.target.checked ? new Set(groupUserList.map((_, i) => i)) : new Set())} aria-label={i18nText.etcAllSelect} /></span>
                      <span className="md-col-no">{i18nText.labelNo}</span>
                      <span>{i18nText.colUserId}</span>
                      <span>{i18nText.colUserNm}</span>
                      <span>{i18nText.colDeptNm}</span>
                    </div>
                    <div className="result">
                      {groupUserList.length === 0 ? (
                        <p className="no_data">{i18nText.msgNoUsersRegistered}</p>
                      ) : (
                        groupUserList.map((row, idx) => (
                          <div key={`${row.mbrshSq}-${idx}`} className="list_item">
                            <div className="md-col-chk"><input type="checkbox" checked={selectedAuthorRows.has(idx)} onChange={() => toggleAuthorRow(idx)} aria-label={`${row.userNm ?? row.userId}${i18nText.ariaSelectSuffix}`} /></div>
                            <div className="md-col-no">{idx + 1}</div>
                            <div>{row.userId}</div>
                            <div>{row.userNm ?? ""}</div>
                            <div>{row.deptNm ?? "-"}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>{/* gr-bottom */}
            </div>{/* gr-grid */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnGroupEdit;
