import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { itemIdxByPage } from "@/utils/calc";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { getLanguageCodeForApi } from "@/utils/language";

import Paging from "@/components/Paging";
import MultilingualLookupPopup from "@/components/MultilingualLookupPopup";
import { CMMN_MENU_I18N_KEYS, CMMN_MENU_I18N_FALLBACK } from "./cmmnMenuI18n";

/** 메뉴 트리 노드 타입 */
interface MenuTreeNode {
  menuId: string;
  menuNm?: string;
  upperMenuId?: string;
  sortOrd?: string;
  useFl?: string;
  progrmFileNm?: string;
  path?: string;
  treeLevel?: number;
  children?: MenuTreeNode[];
}

/** 메뉴 폼 상태 */
interface MenuFormState {
  menuId: string;
  sortOrd: string;
  upperMenuId: string;
  upperMenuNm: string;
  menuNmCd: string;
  menuNm: string;
  progrmFileNm: string;
  imagePath: string;
  imageNm: string;
  useFl: string;
  menuDc: string;
}

const emptyForm: MenuFormState = {
  menuId: "",
  sortOrd: "",
  upperMenuId: "#",
  upperMenuNm: "",
  menuNmCd: "",
  menuNm: "",
  progrmFileNm: "",
  imagePath: "/",
  imageNm: "/",
  useFl: "Y",
  menuDc: "",
};

function findMenuNmInTree(nodes: MenuTreeNode[], menuId: string): string | null {
  for (const node of nodes) {
    if (node.menuId === menuId) return node.menuNm || node.menuId || null;
    if (node.children?.length) {
      const found = findMenuNmInTree(node.children, menuId);
      if (found != null) return found;
    }
  }
  return null;
}

function CmmnMenuList() {
  const { langGb } = useLanguage();
  const lang = langGb || "ko_KR";

  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
  const menuTreeRef = useRef<MenuTreeNode[]>([]);
  useEffect(() => {
    menuTreeRef.current = menuTree;
  }, [menuTree]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuFormState>({ ...emptyForm });
  const [isAddMode, setIsAddMode] = useState(true);

  const { companyList, cmpnyCd, setCmpnyCd, onCompanyChange: syncCompanySession } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_MENU_I18N_KEYS, CMMN_MENU_I18N_FALLBACK, { cmpnyCd });

  // 메뉴 검색 팝업 (상위메뉴 선택)
  const [showMenuSearchPopup, setShowMenuSearchPopup] = useState(false);
  const [menuSearchTree, setMenuSearchTree] = useState<MenuTreeNode[]>([]);
  const [menuSearchExpanded, setMenuSearchExpanded] = useState<Set<string>>(new Set());

  const [showMultilingualPopup, setShowMultilingualPopup] = useState(false);

  // 프로그램 파일명 검색 팝업
  const [showProgramPopup, setShowProgramPopup] = useState(false);
  const [programList, setProgramList] = useState<any[]>([]);
  const [programSearchKeyword, setProgramSearchKeyword] = useState("");
  const [programPaginationInfo, setProgramPaginationInfo] = useState({
    currentPageNo: 1,
    recordCountPerPage: 15,
    pageSize: 10,
    totalRecordCount: 0,
  });
  const programCallbackRef = useRef<((progrmFileNm: string) => void) | null>(null);
  const programPaginationInfoRef = useRef(programPaginationInfo);
  useEffect(() => {
    programPaginationInfoRef.current = programPaginationInfo;
  }, [programPaginationInfo]);

  const expandTreeToLevel2 = useCallback((nodes: MenuTreeNode[], level = 0, expandedSet = new Set<string>()) => {
    if (!nodes?.length) return expandedSet;
    nodes.forEach((node) => {
      if (node.children?.length && level < 2) {
        expandedSet.add(node.menuId);
        expandTreeToLevel2(node.children, level + 1, expandedSet);
      }
    });
    return expandedSet;
  }, []);

  const fetchMenuTree = useCallback(() => {
    if (!cmpnyCd?.trim()) {
      setMenuTree([]);
      return;
    }
    EgovNet.requestFetch(
      `/cmmnMenu/tree?cmpnyCd=${encodeURIComponent(cmpnyCd.trim())}&langGb=${lang}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const data = resp?.result ?? resp;
        setMenuTree(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setExpandedNodes(expandTreeToLevel2(data));
        }
      },
      () => setMenuTree([])
    );
  }, [cmpnyCd, lang, expandTreeToLevel2]);

  const fetchMenuDetail = useCallback(
    (menuId: string) => {
      if (!cmpnyCd?.trim()) return;
      EgovNet.requestFetch(
        `/cmmnMenu/detail?cmpnyCd=${encodeURIComponent(cmpnyCd.trim())}&menuId=${encodeURIComponent(menuId)}&langGb=${lang}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          const r = resp?.result ?? resp;
          if (r) {
            const upperId = r.upperMenuId ?? "#";
            const upperNm = upperId === "#" ? "" : (findMenuNmInTree(menuTreeRef.current, upperId) ?? "");
            setForm({
              menuId: r.menuId ?? "",
              sortOrd: r.sortOrd ?? "",
              upperMenuId: upperId,
              upperMenuNm: upperNm,
              menuNmCd: r.menuNmCd ?? "",
              menuNm: r.menuNm ?? "",
              progrmFileNm: r.progrmFileNm ?? "",
              imagePath: r.imagePath ?? "/",
              imageNm: r.imageNm ?? "/",
              useFl: r.useFl ?? "Y",
              menuDc: r.menuDc ?? "",
            });
            setSelectedMenuId(menuId);
            setIsAddMode(false);
          }
        },
        () => { }
      );
    },
    [cmpnyCd, lang]
  );

  useEffect(() => {
    if (cmpnyCd?.trim()) fetchMenuTree();
    else setMenuTree([]);
  }, [cmpnyCd, fetchMenuTree]);

  useEffect(() => {
    if (selectedMenuId && !isAddMode) {
      fetchMenuDetail(selectedMenuId);
    }
  }, [selectedMenuId, isAddMode, fetchMenuDetail]);

  useEffect(() => {
    if (form.upperMenuId && form.upperMenuId !== "#" && !form.upperMenuNm && menuTree.length > 0) {
      const nm = findMenuNmInTree(menuTree, form.upperMenuId);
      if (nm) setForm((prev) => ({ ...prev, upperMenuNm: nm }));
    }
  }, [form.upperMenuId, form.upperMenuNm, menuTree]);

  const toggleNode = (menuId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const renderTreeNode = (node: MenuTreeNode, level: number, isLast: boolean) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.menuId);
    const isSelected = selectedMenuId === node.menuId;

    return (
      <div key={node.menuId} style={{ position: "relative" }}>
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
          className={`tree-node${isSelected ? " tree-node--selected" : ""}${node.useFl === "N" ? " tree-node--disabled" : ""}`}
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8 }}
          onClick={() => {
            setSelectedMenuId(node.menuId);
            fetchMenuDetail(node.menuId);
            if (hasChildren && !isExpanded) toggleNode(node.menuId);
          }}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleNode(node.menuId, e)} className="tree-toggle-wrap">
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
          <span className="tree-node-label">{node.menuNm || node.menuId}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, idx) => renderTreeNode(child, level + 1, idx === node.children!.length - 1))}
          </div>
        )}
      </div>
    );
  };

  const handleInit = () => {
    setForm({ ...emptyForm });
    setSelectedMenuId(null);
    setIsAddMode(true);
  };

  const handleSave = () => {
    if (!form.menuId?.trim()) {
      alert(i18nText.msgEnterMenuNo);
      return;
    }
    if (!form.sortOrd?.trim()) {
      alert(i18nText.msgEnterMenuOrder);
      return;
    }
    if (form.upperMenuId == null || String(form.upperMenuId).trim() === "") {
      alert(i18nText.msgSelectParentMenu);
      return;
    }
    if (!form.menuNmCd?.trim()) {
      alert(i18nText.msgSelectMenuName);
      return;
    }
    if (!form.progrmFileNm?.trim()) {
      alert(i18nText.msgSelectProgramFile);
      return;
    }

    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompanyBeforeSave);
      return;
    }
    const body = {
      cmpnyCd: cmpnyCd.trim(),
      menuId: form.menuId.trim(),
      sortOrd: form.sortOrd.trim(),
      upperMenuId: form.upperMenuId.trim() || "#",
      menuNmCd: form.menuNmCd.trim(),
      progrmFileNm: form.progrmFileNm.trim(),
      imagePath: form.imagePath?.trim() || "/",
      imageNm: form.imageNm?.trim() || "/",
      useFl: form.useFl || "Y",
      menuDc: form.menuDc?.trim() || "",
    };

    if (isAddMode) {
      EgovNet.requestFetch(
        "/cmmnMenu",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgMenuRegistered);
            fetchMenuTree();
            fetchMenuDetail(form.menuId.trim());
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnRegister);
            const focusInfo = resp?.result;
            if (focusInfo && typeof focusInfo === "object" && (focusInfo as { duplicateKey?: string }).duplicateKey === "MENU_ID") {
              setTimeout(() => document.getElementById("menuDetail_menuId")?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnRegister)
      );
    } else {
      EgovNet.requestFetch(
        `/cmmnMenu/${encodeURIComponent(form.menuId)}`,
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgMenuUpdated);
            fetchMenuTree();
            fetchMenuDetail(form.menuId);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnUpdate);
          }
        },
        () => alert(i18nText.msgErrorOnUpdate)
      );
    }
  };

  const handleDelete = () => {
    if (!selectedMenuId) {
      alert(i18nText.msgSelectMenuToDelete);
      return;
    }
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompanyBeforeDelete);
      return;
    }
    if (!window.confirm(i18nText.msgConfirmDeleteMenu)) return;

    EgovNet.requestFetch(
      `/cmmnMenu/checkChildren?cmpnyCd=${encodeURIComponent(cmpnyCd.trim())}&menuId=${encodeURIComponent(selectedMenuId)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const ox = resp?.result ?? resp;
        if (String(ox).toUpperCase() === "O") {
          alert(i18nText.msgHasChildMenu);
          return;
        }
        EgovNet.requestFetch(
          `/cmmnMenu/${encodeURIComponent(selectedMenuId)}?cmpnyCd=${encodeURIComponent(cmpnyCd.trim())}`,
          { method: "DELETE", headers: { "Content-type": "application/json" } },
          (delResp) => {
            if (delResp?.resultCode === 200) {
              alert(i18nText.msgDeleted);
              handleInit();
              fetchMenuTree();
            } else {
              alert(delResp?.resultMessage || i18nText.msgErrorOnDelete);
            }
          },
          () => alert(i18nText.msgErrorOnDelete)
        );
      },
      () => alert(i18nText.msgErrorCheckChild)
    );
  };

  const openMenuSearchPopup = () => {
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompanySearchMenu);
      return;
    }
    setShowMenuSearchPopup(true);
    EgovNet.requestFetch(
      `/cmmnMenu/treeForSearch?cmpnyCd=${encodeURIComponent(cmpnyCd.trim())}&langGb=${lang}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const data = resp?.result ?? resp;
        setMenuSearchTree(Array.isArray(data) ? data : []);
        setMenuSearchExpanded(expandTreeToLevel2(Array.isArray(data) ? data : []));
      },
      () => setMenuSearchTree([])
    );
  };

  const selectParentMenu = (node: MenuTreeNode) => {
    setForm((prev) => ({ ...prev, upperMenuId: node.menuId, upperMenuNm: node.menuNm || node.menuId }));
    setShowMenuSearchPopup(false);
  };

  const toggleMenuSearchNode = (menuId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMenuSearchExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const renderMenuSearchTreeNode = (node: MenuTreeNode, level: number, isLast: boolean) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = menuSearchExpanded.has(node.menuId);
    return (
      <div key={node.menuId} style={{ position: "relative" }}>
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
          className={`tree-node${node.useFl === "N" ? " tree-node--disabled" : ""}`}
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8 }}
          onClick={() => selectParentMenu(node)}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleMenuSearchNode(node.menuId, e)} className="tree-toggle-wrap">
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
          <span className="tree-node-label">{node.menuNm || node.menuId}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, idx) => renderMenuSearchTreeNode(child, level + 1, idx === node.children!.length - 1))}
          </div>
        )}
      </div>
    );
  };

  const openMultilingualPopup = () => {
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    setShowMultilingualPopup(true);
  };

  const openProgramPopup = () => {
    programCallbackRef.current = (progrmFileNm: string) => {
      setForm((prev) => ({ ...prev, progrmFileNm }));
    };
    setShowProgramPopup(true);
    setProgramSearchKeyword("");
    setProgramPaginationInfo({
      currentPageNo: 1,
      recordCountPerPage: 15,
      pageSize: 10,
      totalRecordCount: 0,
    });
  };

  const handleCloseProgramPopup = () => {
    setShowProgramPopup(false);
    programCallbackRef.current = null;
    setProgramList([]);
    setProgramSearchKeyword("");
  };

  const handleProgramSearch = () => {
    setProgramPaginationInfo((prev) => ({ ...prev, currentPageNo: 1 }));
  };

  const moveToProgramPage = (pageIndex: number) => {
    setProgramPaginationInfo((prev) => ({ ...prev, currentPageNo: pageIndex }));
  };

  const handleProgramPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    setProgramPaginationInfo((prev) => ({
      ...prev,
      recordCountPerPage: newPageSize,
      currentPageNo: 1,
    }));
  };

  useEffect(() => {
    if (!showProgramPopup) return;
    if (!cmpnyCd?.trim()) {
      setProgramList([]);
      return;
    }
    const params = new URLSearchParams();
    params.set("searchKeyword", programSearchKeyword);
    params.set("cmpnyCd", cmpnyCd.trim());
    params.set("langCode", getLanguageCodeForApi(langGb) || "ko");
    params.set("pageIndex", String(programPaginationInfoRef.current.currentPageNo));
    params.set("recordCountPerPage", String(programPaginationInfoRef.current.recordCountPerPage));
    EgovNet.requestFetch(
      `/cmmnProgram/list?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const res = resp?.result;
        setProgramList(res?.list ?? []);
        if (res?.paginationInfo) {
          setProgramPaginationInfo((prev) => ({ ...prev, ...res.paginationInfo }));
        }
      },
      () => setProgramList([])
    );
  }, [showProgramPopup, cmpnyCd, langGb, programSearchKeyword, programPaginationInfo.currentPageNo, programPaginationInfo.recordCountPerPage]);

  const selectProgram = (item: any) => {
    if (programCallbackRef.current) {
      programCallbackRef.current(item.progrmFileNm || "");
    }
    setShowProgramPopup(false);
  };

  return (
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
          <div className="contents contents--menu" id="contents">
            <div className="condition md-condition md-condition-plain-row">
              <div className="left-box">
                <label className="f_select" htmlFor="cmpnyCd">
                  <select
                    id="cmpnyCd"
                    value={String(cmpnyCd ?? "")}
                    onChange={(e) => {
                      syncCompanySession(e.target.value);
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
              </div>
              <div className="right-box">
                <button type="button" className="pd-btn" onClick={handleInit}>{i18nText.btnReset}</button>
                <button type="button" className="pd-btn" onClick={handleSave} disabled={!isAddMode} style={{ opacity: isAddMode ? 1 : 0.5, cursor: isAddMode ? "pointer" : "not-allowed" }}>{i18nText.btnAdd}</button>
                <button
                  type="button"
                  className="pd-btn"
                  onClick={handleDelete}
                  disabled={isAddMode || !selectedMenuId}
                  style={{ opacity: isAddMode || !selectedMenuId ? 0.5 : 1, cursor: isAddMode || !selectedMenuId ? "not-allowed" : "pointer" }}
                >
                  {i18nText.btnDelete}
                </button>
                <button type="button" className="pd-btn primary" onClick={handleSave} disabled={isAddMode} style={{ opacity: isAddMode ? 0.5 : 1, cursor: isAddMode ? "not-allowed" : "pointer" }}>{i18nText.btnUpdate}</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, alignItems: "stretch", minHeight: 0 }}>
              <div className="md-form-card menu-tree-card">
                <div className="menu-tree-scroll">
                  {menuTree.length > 0 ? (
                    menuTree.map((node, idx) => renderTreeNode(node, 0, idx === menuTree.length - 1))
                  ) : (
                    <div style={{ padding: 20, textAlign: "center", color: "#999" }}>{i18nText.msgNoMenu}</div>
                  )}
                </div>
              </div>

              <div
                className="md-form-card"
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 600,
                }}
              >
                <div className="board_view2 md-program-edit-form code-detail-form">
                  <dl>
                    <dt>{i18nText.labelMenuNo} <span className="req">*</span></dt>
                    <dd>
                      <input
                        id="menuDetail_menuId"
                        type="text"
                        className="f_input w_full"
                        value={form.menuId}
                        onChange={(e) => setForm((prev) => ({ ...prev, menuId: e.target.value }))}
                        readOnly={!isAddMode}
                        style={{ backgroundColor: isAddMode ? "#fff" : "#f5f5f5" }}
                        maxLength={30}
                      />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelMenuOrder} <span className="req">*</span></dt>
                    <dd>
                      <input type="text" className="f_input w_full" value={form.sortOrd} onChange={(e) => setForm((prev) => ({ ...prev, sortOrd: e.target.value }))} maxLength={5} />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelParentMenuNo} <span className="req">*</span></dt>
                    <dd className="dd--with-btn">
                      <input type="text" className="f_input" style={{ flex: 1 }} value={form.upperMenuNm} readOnly placeholder={i18nText.placeholderSelectMenuSearch} title={form.upperMenuId && form.upperMenuId !== "#" ? form.upperMenuId : ""} />
                      <button type="button" className="search-icon-btn" onClick={openMenuSearchPopup} title={i18nText.etcMenuSearch} aria-label={i18nText.etcMenuSearch}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </button>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelMenuName} <span className="req">*</span></dt>
                    <dd className="dd--with-btn">
                      <input type="text" className="f_input" style={{ flex: 1 }} value={form.menuNm} readOnly placeholder={i18nText.placeholderSelectMultilingual} />
                      <button type="button" className="search-icon-btn" onClick={openMultilingualPopup} title={i18nText.etcMultiLangSearch} aria-label={i18nText.etcMultiLangSearch}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </button>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelFileName} <span className="req">*</span></dt>
                    <dd className="dd--with-btn">
                      <input type="text" className="f_input" style={{ flex: 1 }} value={form.progrmFileNm} readOnly placeholder={i18nText.placeholderSearchProgramFileName} />
                      <button type="button" className="search-icon-btn" onClick={openProgramPopup} title={i18nText.etcProgramFileSearch} aria-label={i18nText.etcProgramFileSearch}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </button>
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelImagePath} <span className="req">*</span></dt>
                    <dd>
                      <input type="text" className="f_input w_full" value={form.imagePath} onChange={(e) => setForm((prev) => ({ ...prev, imagePath: e.target.value }))} />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelImageName} <span className="req">*</span></dt>
                    <dd>
                      <input type="text" className="f_input w_full" value={form.imageNm} onChange={(e) => setForm((prev) => ({ ...prev, imageNm: e.target.value }))} />
                    </dd>
                  </dl>
                  <dl>
                    <dt>{i18nText.labelUseYn}</dt>
                    <dd>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input type="radio" name="useFl" value="Y" checked={form.useFl === "Y"} onChange={(e) => setForm((prev) => ({ ...prev, useFl: e.target.value }))} />
                          {i18nText.etcUse}
                        </label>
                        <label className="radio-label">
                          <input type="radio" name="useFl" value="N" checked={form.useFl === "N"} onChange={(e) => setForm((prev) => ({ ...prev, useFl: e.target.value }))} />
                          {i18nText.etcNotUse}
                        </label>
                      </div>
                    </dd>
                  </dl>
                  <dl className="dl--va-top">
                    <dt>{i18nText.labelDescription}</dt>
                    <dd>
                      <textarea className="f_txtar w_full" value={form.menuDc} onChange={(e) => setForm((prev) => ({ ...prev, menuDc: e.target.value }))} rows={4} />
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 검색 팝업 (다국어 조회 팝업과 동일 디자인, 트리는 메뉴관리 트리와 동일 형태) */}
      {showMenuSearchPopup && (
        <div
          className="wrap_pop"
          onClick={() => setShowMenuSearchPopup(false)}
        >
          <div
            className="pop_inner"
            style={{ width: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pop_header">
              <h1>{i18nText.titleMenuSearch}</h1>
              <button
                type="button"
                className="pop_close"
                onClick={() => setShowMenuSearchPopup(false)}
                aria-label={i18nText.etcCloseX}
              />
            </div>

            <div className="pop_container">
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "15px 10px",
                  backgroundColor: "#fff",
                  overflowY: "auto",
                }}
              >
                {menuSearchTree.length > 0 ? (
                  menuSearchTree.map((node, idx) => renderMenuSearchTreeNode(node, 0, idx === menuSearchTree.length - 1))
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "#999" }}>{i18nText.msgNoMenuFound}</div>
                )}
              </div>
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" className="pd-btn" onClick={() => setShowMenuSearchPopup(false)}>{i18nText.btnClose}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MultilingualLookupPopup
        open={showMultilingualPopup}
        onClose={() => setShowMultilingualPopup(false)}
        cmpnyCd={cmpnyCd || ""}
        langCode={lang}
        onSelect={(langKey, displayMessage) => {
          setForm((prev) => ({ ...prev, menuNmCd: langKey, menuNm: displayMessage }));
        }}
      />

      {/* 프로그램 파일명 검색 팝업 (다국어관리 형태, 프로그램관리 리스트 참조) */}
      {showProgramPopup && (
        <div
          className="wrap_pop"
          onClick={handleCloseProgramPopup}
        >
          <div
            className="pop_inner"
            style={{ width: "1200px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pop_header">
              <h1>{i18nText.titleProgramSearch}</h1>
              <button
                type="button"
                className="pop_close"
                onClick={handleCloseProgramPopup}
                aria-label={i18nText.etcCloseX}
              />
            </div>

            <div className="pop_container">
              <div className="condition md-condition md-condition-plain-row">
                <div className="left-box">
                  <label className="f_input" htmlFor="programSearchKeywordInput">
                    <input
                      type="text"
                      id="programSearchKeywordInput"
                      className="f_input"
                      value={programSearchKeyword}
                      onChange={(e) => setProgramSearchKeyword(e.target.value)}
                      onKeyPress={(e) => { if (e.key === "Enter") handleProgramSearch(); }}
                      placeholder={i18nText.placeholderSearchProgramNameUrl}
                    />
                  </label>
                  <button type="button" className="pd-btn primary" onClick={handleProgramSearch}>
                    {i18nText.btnSearch}
                  </button>
                </div>
              </div>

              <div className="board_list board_list--flat" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div className="head">
                  <span className="md-col-no">{i18nText.labelNo}</span>
                  <span>{i18nText.labelProgramFile}</span>
                  <span>{i18nText.labelProgramName}</span>
                  <span>{i18nText.labelUrl}</span>
                  <span>{i18nText.labelUseYn}</span>
                </div>

                <div className="result" style={{ flex: 1, overflowY: "auto" }}>
                  {programList.length > 0 ? (
                    programList.map((item: any, index: number) => {
                      const { totalRecordCount = 0, currentPageNo = 1, recordCountPerPage = 15 } = programPaginationInfo;
                      const listIdx = itemIdxByPage(totalRecordCount, currentPageNo, recordCountPerPage, index);
                      return (
                        <div
                          key={(item.progrmFileNm ?? "") + index}
                          className="list_item"
                          onClick={() => selectProgram(item)}
                        >
                          <div className="md-col-no">{listIdx}</div>
                          <div>{item.progrmFileNm || ""}</div>
                          <div>{item.messageCn ?? item.message_cn ?? ""}</div>
                          <div>{item.progrmUrl || ""}</div>
                          <div>{item.useFl === "Y" ? i18nText.etcUse : i18nText.etcNotUse}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no_data">
                      {i18nText.msgNoSearchResult}
                    </div>
                  )}
                </div>
              </div>

              <div className="md-pagination">
                <div>
                  <label className="f_select" htmlFor="menuProgramPageSizeSelect">
                    <select
                      id="menuProgramPageSizeSelect"
                      value={programPaginationInfo.recordCountPerPage}
                      onChange={handleProgramPageSizeChange}
                    >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={60}>60</option>
                      <option value={100}>100</option>
                    </select>
                  </label>
                </div>
                <div>
                  <Paging
                    pagination={programPaginationInfo}
                    moveToPage={moveToProgramPage}
                  />
                </div>
                <div className="total-page-box">
                  {programPaginationInfo.totalRecordCount > 0
                    ? `${Math.min(programPaginationInfo.currentPageNo * programPaginationInfo.recordCountPerPage, programPaginationInfo.totalRecordCount)}/${programPaginationInfo.totalRecordCount}`
                    : "0/0"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CmmnMenuList;
