import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import useDebounce from "@/hooks/useDebounce";
import * as EgovNet from "@/api/egovFetch";
import { fetchDeptTree, buildDeptHierarchy, expandDeptTreeToLevel2, type DeptTreeItem, type DeptTreeHierarchyNode } from "@/api/deptTree";
import { SERVER_URL } from "@/config";
import URL from "@/constants/url";
import { fetchCompanyList, resolveCmpnyCdForFormCreate } from "@/api/companyList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { AuthorEmbedFormHeightContext } from "@/pages/system/author/AuthorEmbedLayoutContext";

import { CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK } from "./cmmnAuthorI18n";
import CmmnAuthorList from "@/pages/system/author/CmmnAuthorList";

type AuthorUserRow = { userTy: string; userCd: string; userNm?: string; deptNm?: string };
/** API(CmmnUserSearchDTO) — USER_CD에는 MBRSH_SQ를 넣기 위해 구성원번호 사용 */
type UserSearchItem = {
  mbrshSq?: string;
  userId: string;
  userNm: string;
  deptCd: string;
  deptNm: string;
};

/** CM_AUTHOR_USER.USER_CD: USER 유형은 CM_USER_ORGNZT_MBRSH.MBRSH_SQ(문자열) */
function authorUserMemberKey(u: { mbrshSq?: string | number; userId: string }): string {
  const sq = u.mbrshSq != null && String(u.mbrshSq).trim() !== "" ? String(u.mbrshSq).trim() : "";
  return sq;
}

/** 체크박스 키(API에 mbrshSq가 없을 때만 userId로 구분) */
function userSearchSelectionKey(u: { mbrshSq?: string | number; userId: string }): string {
  return authorUserMemberKey(u) || u.userId;
}
type GroupOption = { groupId: string; groupNm: string };
type MenuTreeNode = { menuId: string; menuNm?: string; children?: MenuTreeNode[] };

export type CmmnAuthorEditProps = {
  mode: "create" | "detail";
  /** 통합 화면에서 목록 옆에 임베드할 때 */
  embedded?: boolean;
  /** 통합 화면: 권한 목록(좌) + 입력폼(우) 1행, 사용자/그룹/부서(좌) + 권한사용자·메뉴(우) 2행 */
  listSlot?: React.ReactNode;
  manageCmpnyCd?: string;
  embedCmpnyCd?: string;
  embedAuthorCd?: string | null;
  onEmbeddedCommit?: () => void;
};

function CmmnAuthorEdit(props: CmmnAuthorEditProps) {
  const { mode, embedded, listSlot, manageCmpnyCd, embedCmpnyCd, embedAuthorCd, onEmbeddedCommit } = props;
  const embedAssignBesideTabs = Boolean(embedded && listSlot);
  const formBlockEmbedRef = useRef<HTMLDivElement | null>(null);
  const [embedFormBlockPx, setEmbedFormBlockPx] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { langGb } = useLanguage();
  const state = (location.state as { cmpnyCd?: string; authorCd?: string }) || {};
  const cmpnyCdFromState = embedded
    ? String(embedCmpnyCd ?? manageCmpnyCd ?? state.cmpnyCd ?? "").trim()
    : String(state.cmpnyCd ?? "").trim();
  const authorCdFromState = embedded ? String(embedAuthorCd ?? "").trim() : String(state.authorCd ?? "").trim();

  const isCreate = embedded ? !authorCdFromState : mode === "create";
  const isDetail = embedded ? !!authorCdFromState : mode === "detail";

  const [companyList, setCompanyList] = useState<{ cmpnyCd: string; cmpnyNm: string }[]>([]);
  const [form, setForm] = useState({
    cmpnyCd: "",
    authorCd: "",
    authorNm: "",
    authorCn: "",
    useFl: "Y",
  });
  const cmpnyForI18n = String(form.cmpnyCd || manageCmpnyCd || embedCmpnyCd || "").trim() || null;
  const i18nText = useCmmnScreenI18n(CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK, { cmpnyCd: cmpnyForI18n });
  const [authorUserList, setAuthorUserList] = useState<AuthorUserRow[]>([]);
  const [menuTreeData, setMenuTreeData] = useState<MenuTreeNode[]>([]);
  const [menuExpandedNodes, setMenuExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<"user" | "group" | "dept">("user");
  /** 하단 우측: 권한 사용자 목록 vs 권한 메뉴 트리(명세: 메뉴는 탭 선택 시에만 표시) */
  const [assignRightTab, setAssignRightTab] = useState<"authUser" | "authMenu">("authUser");
  const [userSearchKeyword, setUserSearchKeyword] = useState("");
  const [userSearchList, setUserSearchList] = useState<UserSearchItem[]>([]);
  const [selectedUserKeys, setSelectedUserKeys] = useState<Set<string>>(new Set());
  const [groupSearchKeyword, setGroupSearchKeyword] = useState("");
  const [groupList, setGroupList] = useState<GroupOption[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  const [groupUserPreview, setGroupUserPreview] = useState<UserSearchItem[]>([]);
  const [deptTree, setDeptTree] = useState<DeptTreeItem[]>([]);
  const [deptExpandedNodes, setDeptExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedDeptCd, setSelectedDeptCd] = useState<string | null>(null);
  const [deptUserList, setDeptUserList] = useState<UserSearchItem[]>([]);
  const [selectedDeptUserKeys, setSelectedDeptUserKeys] = useState<Set<string>>(new Set());

  const loadCompanies = useCallback(() => {
    fetchCompanyList((list) => {
      setCompanyList(list);
      if (embedded && manageCmpnyCd) {
        setForm((f) => ({ ...f, cmpnyCd: manageCmpnyCd }));
        return;
      }
      if (!isDetail && list?.length) {
        const initialCmpnyCd = resolveCmpnyCdForFormCreate(list);
        if (initialCmpnyCd) {
          setForm((f) => ({ ...f, cmpnyCd: initialCmpnyCd }));
        }
      }
    }, () => { });
  }, [isDetail, embedded, manageCmpnyCd]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const loadDetail = useCallback(() => {
    if (!cmpnyCdFromState || !authorCdFromState) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/detail?cmpnyCd=${encodeURIComponent(cmpnyCdFromState)}&authorCd=${encodeURIComponent(authorCdFromState)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result) {
          const r = resp.result;
          setForm({
            cmpnyCd: r.cmpnyCd ?? "",
            authorCd: r.authorCd ?? "",
            authorNm: r.authorNm ?? "",
            authorCn: r.authorCn ?? "",
            useFl: r.useFl === "N" ? "N" : "Y",
          });
        }
      },
      () => {
        alert(i18nText.msgErrorOnRetrieve);
        if (!embedded) navigate(URL.SYSTEM_AUTHOR);
      }
    );
  }, [cmpnyCdFromState, authorCdFromState, navigate, embedded, i18nText.msgErrorOnRetrieve]);

  const loadAuthorUsers = useCallback(() => {
    if (!cmpnyCdFromState || !authorCdFromState) return;
    const lang = langGb || "ko_KR";
    EgovNet.requestFetch(
      `/cmmnAuthor/users?cmpnyCd=${encodeURIComponent(cmpnyCdFromState)}&authorCd=${encodeURIComponent(authorCdFromState)}&langGb=${encodeURIComponent(lang)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setAuthorUserList(
            resp.result.map((u: { userTy: string; userCd: string; userNm?: string; deptNm?: string }) => ({
              userTy: u.userTy || "USER",
              userCd: u.userCd || "",
              userNm: u.userNm ?? "",
              deptNm: u.deptNm ?? "",
            }))
          );
        }
      },
      () => { }
    );
  }, [cmpnyCdFromState, authorCdFromState, langGb]);

  const loadAuthorMenus = useCallback(() => {
    if (!cmpnyCdFromState || !authorCdFromState) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/menus?cmpnyCd=${encodeURIComponent(cmpnyCdFromState)}&authorCd=${encodeURIComponent(authorCdFromState)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setSelectedMenuIds(new Set(resp.result.map((m: { menuId: string }) => m.menuId)));
        }
      },
      () => { }
    );
  }, [cmpnyCdFromState, authorCdFromState]);

  const fetchUserSearch = useCallback(() => {
    if (!form.cmpnyCd) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    const lang = langGb || "ko_KR";
    EgovNet.requestFetch(
      `/cmmnAuthor/userSearch?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&searchKeyword=${encodeURIComponent(userSearchKeyword)}&langGb=${encodeURIComponent(lang)}`,
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
  }, [form.cmpnyCd, userSearchKeyword, langGb, i18nText.msgSelectCompany]);

  const fetchUserSearchRef = useRef(fetchUserSearch);
  fetchUserSearchRef.current = fetchUserSearch;
  const debouncedFetchUserSearch = useDebounce(() => fetchUserSearchRef.current(), 300);

  const fetchGroupList = useCallback(() => {
    if (!form.cmpnyCd) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    const lang = langGb || "ko_KR";
    const url = `/cmmnAuthor/groups?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&langGb=${encodeURIComponent(lang)}${groupSearchKeyword.trim() ? `&searchKeyword=${encodeURIComponent(groupSearchKeyword.trim())}` : ""}`;
    EgovNet.requestFetch(
      url,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setGroupList(resp.result);
        } else {
          setGroupList([]);
        }
      },
      () => setGroupList([])
    );
  }, [form.cmpnyCd, groupSearchKeyword, langGb, i18nText.msgSelectCompany]);

  const fetchGroupListRef = useRef(fetchGroupList);
  fetchGroupListRef.current = fetchGroupList;
  const debouncedFetchGroupList = useDebounce(() => fetchGroupListRef.current(), 300);

  useEffect(() => {
    if (activeTab === "group" && form.cmpnyCd) fetchGroupList();
  }, [activeTab, form.cmpnyCd, fetchGroupList]);

  useEffect(() => {
    if (activeTab === "user" && form.cmpnyCd) fetchUserSearch();
  }, [activeTab, form.cmpnyCd, fetchUserSearch]);

  useEffect(() => {
    if (selectedGroupIds.size === 0) {
      setGroupUserPreview([]);
      return;
    }
    const lang = langGb || "ko_KR";
    const promises = Array.from(selectedGroupIds).map((groupId) =>
      fetch(
        `${SERVER_URL}/cmmnAuthor/groupUsers?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&groupId=${encodeURIComponent(groupId)}&langGb=${encodeURIComponent(lang)}`,
        { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" }
      ).then((r) => r.json())
    );
    Promise.all(promises).then((results) => {
      const merged: UserSearchItem[] = [];
      const seen = new Set<string>();
      results.forEach((res) => {
        const arr = res?.result || [];
        arr.forEach((u: UserSearchItem) => {
          if (!seen.has(u.userId)) {
            seen.add(u.userId);
            merged.push(u);
          }
        });
      });
      setGroupUserPreview(merged);
    });
  }, [selectedGroupIds, form.cmpnyCd, langGb]);

  /** 부서 트리 조회 (공통 API 사용) */
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
      `/cmmnAuthor/deptUsers?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&deptCd=${encodeURIComponent(selectedDeptCd)}&langGb=${encodeURIComponent(lang)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setDeptUserList(resp.result);
          setSelectedDeptUserKeys(new Set());
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

  const deptTreeHierarchy = React.useMemo(() => buildDeptHierarchy(deptTree), [deptTree]);

  const toggleDeptNode = (deptCd: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeptExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(deptCd)) next.delete(deptCd);
      else next.add(deptCd);
      return next;
    });
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

  const expandMenuAll = useCallback((nodes: MenuTreeNode[], expandedSet = new Set<string>()): Set<string> => {
    if (!nodes || nodes.length === 0) return expandedSet;
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        expandedSet.add(node.menuId);
        expandMenuAll(node.children, expandedSet);
      }
    });
    return expandedSet;
  }, []);

  const loadMenuTree = useCallback(() => {
    const cmpnyCd = form.cmpnyCd?.trim();
    if (!cmpnyCd) {
      setMenuTreeData([]);
      return;
    }
    const lang = langGb || "ko_KR";
    EgovNet.requestFetch(
      `/cmmnMenu/tree?cmpnyCd=${encodeURIComponent(cmpnyCd)}&langGb=${encodeURIComponent(lang)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const data = resp?.result ?? resp;
        if (Array.isArray(data)) {
          setMenuTreeData(data as MenuTreeNode[]);
          setMenuExpandedNodes(expandMenuAll(data as MenuTreeNode[]));
        } else {
          setMenuTreeData([]);
        }
      },
      () => setMenuTreeData([])
    );
  }, [form.cmpnyCd, langGb, expandMenuAll]);

  const toggleMenuNode = (menuId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMenuExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const renderMenuTreeNode = (node: MenuTreeNode, level = 0, isLast = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = menuExpandedNodes.has(node.menuId);
    const isChecked = selectedMenuIds.has(node.menuId);
    const hasSelectedChild = hasChildren && hasSelectedMenuDescendant(node, selectedMenuIds);
    const isCheckboxDisabled = isChecked && hasSelectedChild;

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
          className="tree-node"
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8, cursor: "default" }}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleMenuNode(node.menuId, e)} className="tree-toggle-wrap">
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
          <span
            onClick={(e) => e.stopPropagation()}
            className="tree-node-chk"
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={isCheckboxDisabled}
              onChange={() => !isCheckboxDisabled && toggleMenu(node.menuId)}
              onClick={(e) => e.stopPropagation()}
              title={isCheckboxDisabled ? i18nText.msgMenuCheckboxLocked : undefined}
            />
          </span>
          <span className="tree-node-label">{node.menuNm || node.menuId}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child, index) =>
              renderMenuTreeNode(child, level + 1, index === node.children!.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (isDetail && cmpnyCdFromState && authorCdFromState) {
      loadDetail();
      loadAuthorUsers();
      loadAuthorMenus();
    }
  }, [isDetail, cmpnyCdFromState, authorCdFromState, loadDetail, loadAuthorUsers, loadAuthorMenus]);

  useEffect(() => {
    loadMenuTree();
  }, [loadMenuTree]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form.cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    if (!form.authorCd?.trim()) {
      alert(i18nText.msgEnterAuthCode);
      return;
    }
    if (!form.authorNm?.trim()) {
      alert(i18nText.msgEnterAuthName);
      return;
    }

    const body = {
      cmpnyCd: form.cmpnyCd,
      authorCd: form.authorCd,
      authorNm: form.authorNm,
      authorCn: form.authorCn || "",
      useFl: form.useFl,
      authorUserList: authorUserList.map((u, i) => ({
        userTy: u.userTy,
        userCd: u.userCd,
        sortOrd: String(i + 1),
      })),
      menuIdList: Array.from(selectedMenuIds),
    };

    if (isCreate) {
      EgovNet.requestFetch(
        "/cmmnAuthor",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgRegistered);
            if (embedded) onEmbeddedCommit?.();
            else navigate(URL.SYSTEM_AUTHOR);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnRegister);
            const focusInfo = resp?.result;
            if (focusInfo && typeof focusInfo === "object" && (focusInfo as { duplicateKey?: string }).duplicateKey === "AUTHOR_CD") {
              setTimeout(() => document.getElementById("authorEdit_authorCd")?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnRegister)
      );
    } else {
      EgovNet.requestFetch(
        "/cmmnAuthor",
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (resp?.resultCode === 200) {
            alert(i18nText.msgUpdated);
            if (embedded) onEmbeddedCommit?.();
            else navigate(URL.SYSTEM_AUTHOR);
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
    if (form.authorCd === "AUTH_ADMIN") {
      alert(i18nText.msgAdminNotDeletable);
      return;
    }
    if (!window.confirm(i18nText.msgConfirmDeleteSingleAuth)) return;
    EgovNet.requestFetch(
      `/cmmnAuthor?cmpnyCd=${encodeURIComponent(form.cmpnyCd)}&authorCd=${encodeURIComponent(form.authorCd)}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.resultCode === 200) {
          alert(i18nText.msgDeleted);
          if (embedded) onEmbeddedCommit?.();
          else navigate(URL.SYSTEM_AUTHOR);
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const addUsersToAuthor = () => {
    const toAdd = userSearchList.filter((u) => selectedUserKeys.has(userSearchSelectionKey(u)));
    const existing = new Set(authorUserList.map((a) => `${a.userTy}:${a.userCd}`));
    const newRows: AuthorUserRow[] = [];
    let skippedNoMbrsh = 0;
    toAdd.forEach((u) => {
      const sq = authorUserMemberKey(u);
      if (!sq) {
        skippedNoMbrsh += 1;
        return;
      }
      const rowKey = `USER:${sq}`;
      if (!existing.has(rowKey)) {
        existing.add(rowKey);
        newRows.push({ userTy: "USER", userCd: sq, userNm: u.userNm, deptNm: u.deptNm });
      }
    });
    if (skippedNoMbrsh > 0) {
      alert(`${i18nText.msgSkippedMbrshPrefix}${skippedNoMbrsh}${i18nText.msgSkippedMbrshSuffix}`);
    }
    setAuthorUserList((prev) => [...prev, ...newRows]);
    setSelectedUserKeys(new Set());
  };

  const removeSelectedFromAuthor = () => {
    setAuthorUserList((prev) => prev.filter((_, i) => !selectedAuthorRows.has(i)));
    setSelectedAuthorRows(new Set());
  };

  const [selectedAuthorRows, setSelectedAuthorRows] = useState<Set<number>>(new Set());
  const toggleAuthorRow = (index: number) => {
    setSelectedAuthorRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addGroupsToAuthor = () => {
    const existing = new Set(authorUserList.map((a) => `${a.userTy}:${a.userCd}`));
    const newRows: AuthorUserRow[] = [];
    selectedGroupIds.forEach((groupId) => {
      const key = `GROUP:${groupId}`;
      if (!existing.has(key)) {
        existing.add(key);
        const g = groupList.find((x) => x.groupId === groupId);
        newRows.push({ userTy: "GROUP", userCd: groupId, userNm: g?.groupNm });
      }
    });
    setAuthorUserList((prev) => [...prev, ...newRows]);
    setSelectedGroupIds(new Set());
  };

  const addDeptUsersToAuthor = () => {
    const toAdd = deptUserList.filter((u) => selectedDeptUserKeys.has(userSearchSelectionKey(u)));
    const existing = new Set(authorUserList.map((a) => `${a.userTy}:${a.userCd}`));
    const newRows: AuthorUserRow[] = [];
    let skippedNoMbrsh = 0;
    toAdd.forEach((u) => {
      const sq = authorUserMemberKey(u);
      if (!sq) {
        skippedNoMbrsh += 1;
        return;
      }
      const rowKey = `USER:${sq}`;
      if (!existing.has(rowKey)) {
        existing.add(rowKey);
        newRows.push({ userTy: "USER", userCd: sq, userNm: u.userNm, deptNm: u.deptNm });
      }
    });
    if (skippedNoMbrsh > 0) {
      alert(`${i18nText.msgSkippedMbrshPrefix}${skippedNoMbrsh}${i18nText.msgSkippedMbrshSuffix}`);
    }
    setAuthorUserList((prev) => [...prev, ...newRows]);
    setSelectedDeptUserKeys(new Set());
  };

  const toggleDeptUser = (u: UserSearchItem) => {
    const k = userSearchSelectionKey(u);
    setSelectedDeptUserKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const findMenuNode = (nodes: MenuTreeNode[], menuId: string): MenuTreeNode | null => {
    for (const node of nodes) {
      if (node.menuId === menuId) return node;
      if (node.children) {
        const found = findMenuNode(node.children, menuId);
        if (found) return found;
      }
    }
    return null;
  };

  const findMenuAncestorIds = (nodes: MenuTreeNode[], targetId: string, ancestors: string[] = []): string[] | null => {
    for (const node of nodes) {
      if (node.menuId === targetId) return ancestors;
      const next = node.children
        ? findMenuAncestorIds(node.children, targetId, [...ancestors, node.menuId])
        : null;
      if (next) return next;
    }
    return null;
  };

  const getMenuDescendantIds = (node: MenuTreeNode): Set<string> => {
    const set = new Set<string>();
    if (node.children) {
      for (const c of node.children) {
        set.add(c.menuId);
        getMenuDescendantIds(c).forEach((id) => set.add(id));
      }
    }
    return set;
  };

  const hasSelectedMenuDescendant = (node: MenuTreeNode, selected: Set<string>): boolean => {
    if (!node.children) return false;
    return node.children.some(
      (c) => selected.has(c.menuId) || hasSelectedMenuDescendant(c, selected)
    );
  };

  const toggleMenu = (menuId: string) => {
    setSelectedMenuIds((prev) => {
      const next = new Set(prev);
      const node = findMenuNode(menuTreeData, menuId);
      if (prev.has(menuId)) {
        if (node && hasSelectedMenuDescendant(node, prev)) return prev;
        next.delete(menuId);
        if (node) getMenuDescendantIds(node).forEach((id) => next.delete(id));
        const ancestorIds = findMenuAncestorIds(menuTreeData, menuId);
        if (ancestorIds) {
          for (const aid of ancestorIds) {
            const anode = findMenuNode(menuTreeData, aid);
            if (anode && !hasSelectedMenuDescendant(anode, next)) next.delete(aid);
          }
        }
      } else {
        next.add(menuId);
        const ancestorIds = findMenuAncestorIds(menuTreeData, menuId);
        if (ancestorIds) ancestorIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!embedAssignBesideTabs) {
      setEmbedFormBlockPx(null);
      return;
    }
    const el = formBlockEmbedRef.current;
    if (!el) return;
    const sync = () => setEmbedFormBlockPx(Math.round(el.getBoundingClientRect().height));
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [embedAssignBesideTabs]);

  if (!embedded && isDetail && !cmpnyCdFromState && !authorCdFromState) {
    navigate(URL.SYSTEM_AUTHOR);
    return null;
  }

  const pageTitle = isCreate ? i18nText.titleAuthCreate : i18nText.titleAuthDetail;

  const panelStyle = {
    minHeight: "400px",
    backgroundColor: "#fff",
  };
  const upperPanelStyle = {
    ...panelStyle,
    minHeight: 0,
    padding: "6px 12px 6px 8px",
  };
  /** 통합(좌 목록·우 폼) 1행: 좌측 목록과 상단 라인 맞춤 — 폼 상단 패딩 제거 */
  const formUpperPanelStyle = embedAssignBesideTabs
    ? { ...upperPanelStyle, padding: "0 12px 6px 8px" }
    : upperPanelStyle;

  const tabsPanelOuterStyle = embedAssignBesideTabs
    ? {
      ...panelStyle,
      flex: 1,
      minHeight: 0,
      display: "flex" as const,
      flexDirection: "column" as const,
    }
    : { ...panelStyle, flex: "0 0 auto" as const, display: "flex" as const, flexDirection: "column" as const };
  const tabsInnerScrollStyle = embedAssignBesideTabs
    ? {
      flex: "0 0 auto" as const,
      display: "flex" as const,
      flexDirection: "column" as const,
      overflow: "hidden" as const,
    }
    : {
      flex: "0 0 auto" as const,
      display: "flex" as const,
      flexDirection: "column" as const,
      overflow: "hidden" as const,
    };

  const assignRightPanel = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div className="au-sub-tabs">
        <button type="button" className={`sub-tab${assignRightTab === "authUser" ? " active" : ""}`} onClick={() => setAssignRightTab("authUser")}>
          {i18nText.titlePanelAuthUsers}
        </button>
        <button type="button" className={`sub-tab${assignRightTab === "authMenu" ? " active" : ""}`} onClick={() => setAssignRightTab("authMenu")}>
          {i18nText.titlePanelAuthMenu}
        </button>
      </div>
      {assignRightTab === "authUser" ? (
        <div className="board_list BRD006 md-admin-list no-top-border" style={{ border: "1px solid #e0e0e0", borderRadius: "4px", flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="head">
            <span className="md-col-chk">
              <input
                type="checkbox"
                checked={authorUserList.length > 0 && selectedAuthorRows.size === authorUserList.length}
                onChange={(e) => setSelectedAuthorRows(e.target.checked ? new Set(authorUserList.map((_, i) => i)) : new Set())}
                aria-label={i18nText.etcSelectAllAriaLabel}
              />
            </span>
            <span>{i18nText.colUserOrGroupId}</span>
            <span>{i18nText.colUserOrGroupNm}</span>
            <span>{i18nText.colDeptNm}</span>
          </div>
          <div className="result" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {authorUserList.length === 0 ? (
              <p className="no_data">{i18nText.msgNoUsersRegistered}</p>
            ) : (
              authorUserList.map((row, idx) => (
                <div key={`${row.userTy}-${row.userCd}-${idx}`} className="list_item">
                  <div className="md-col-chk">
                    <input
                      type="checkbox"
                      checked={selectedAuthorRows.has(idx)}
                      onChange={() => toggleAuthorRow(idx)}
                      aria-label={`${row.userNm ?? row.userCd}${i18nText.ariaSelectSuffix}`}
                    />
                  </div>
                  <div>{row.userCd}</div>
                  <div>{row.userNm ?? ""}</div>
                  <div>{row.deptNm ?? "-"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div
          className="md-form-card"
          style={{
            flex: 1,
            maxHeight: "495px",
            overflowY: "auto",
            padding: "12px 6px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#fff",
          }}
        >
          {menuTreeData.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{i18nText.msgNoMenuData}</div>
          ) : (
            menuTreeData.map((node, index) => renderMenuTreeNode(node, 0, index === menuTreeData.length - 1))
          )}
        </div>
      )}
    </div>
  );

  const authorFormBlock = (
    <div style={{ ...formUpperPanelStyle, flex: "0 0 auto" }}>
      <div className="board_view2 md-program-edit-form" style={{ padding: "12px 0" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <dl style={{ flex: "0 0 auto", width: "100%", minWidth: 0, margin: 0 }}>
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
          <dl style={{ flex: "0 0 auto", width: "100%", minWidth: 0, margin: 0 }}>
            <dt>{i18nText.labelAuthCode} <span className="req">*</span></dt>
            <dd>
              <input
                id="authorEdit_authorCd"
                type="text"
                className="f_input w_full"
                value={form.authorCd}
                onChange={(e) => setForm((f) => ({ ...f, authorCd: e.target.value }))}
                disabled={isDetail}
                placeholder={i18nText.placeholderAuthCode}
                maxLength={20}
                style={{ backgroundColor: isDetail ? "#f5f5f5" : "#fff" }}
              />
            </dd>
          </dl>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: "100%",
            boxSizing: "border-box",
            marginTop: 0,
          }}
        >
          <dl style={{ flex: "0 0 auto", width: "100%", minWidth: 0, margin: 0 }}>
            <dt>{i18nText.labelAuthName} <span className="req">*</span></dt>
            <dd>
              <input
                type="text"
                className="f_input w_full"
                value={form.authorNm}
                onChange={(e) => setForm((f) => ({ ...f, authorNm: e.target.value }))}
                placeholder={i18nText.placeholderAuthName}
                maxLength={100}
              />
            </dd>
          </dl>
          <dl style={{ flex: "0 0 auto", width: "100%", minWidth: 0, margin: 0 }}>
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
        </div>
        <dl>
          <dt>{i18nText.labelAuthDesc}</dt>
          <dd>
            <textarea
              className="f_txtar w_full"
              value={form.authorCn}
              onChange={(e) => setForm((f) => ({ ...f, authorCn: e.target.value }))}
              rows={2}
              placeholder={i18nText.placeholderAuthDescription}
              maxLength={400}
            />
          </dd>
        </dl>
      </div>
    </div>
  );

  const authorTabsBlock = (
    <div style={tabsPanelOuterStyle}>
      <div className="au-sub-tabs">
        <button type="button" className={`sub-tab${activeTab === "user" ? " active" : ""}`} onClick={() => setActiveTab("user")}>{i18nText.labelUser}</button>
        <button type="button" className={`sub-tab${activeTab === "group" ? " active" : ""}`} onClick={() => setActiveTab("group")}>{i18nText.labelGroup}</button>
        <button type="button" className={`sub-tab${activeTab === "dept" ? " active" : ""}`} onClick={() => setActiveTab("dept")}>{i18nText.etcTabDept}</button>
      </div>

      <div style={tabsInnerScrollStyle}>
        {activeTab === "user" && (
          <div className="transfer-row">
            <div className="transfer-col">
              <div className="card-search-row">
                <span>{i18nText.labelUserNameIdField}</span>
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
              <div className="board_list BRD006 md-admin-list au-transfer-list" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <div className="head head--compact">
                  <span className="md-col-chk"><input type="checkbox" checked={userSearchList.length > 0 && selectedUserKeys.size === userSearchList.length} onChange={(e) => setSelectedUserKeys(e.target.checked ? new Set(userSearchList.map((u) => userSearchSelectionKey(u))) : new Set())} aria-label={i18nText.etcSelectAllAriaLabel} /></span>
                  <span>{i18nText.colUserId}</span>
                  <span>{i18nText.colUserNm}</span>
                  <span>{i18nText.colDeptNm}</span>
                </div>
                <div className="result">
                  {userSearchList.length === 0 ? (
                    <p className="no_data">{i18nText.hintUserSearchAuto}</p>
                  ) : (
                    userSearchList.map((u, idx) => (
                      <div key={userSearchSelectionKey(u)} className="list_item">
                        <div className="md-col-chk"><input type="checkbox" checked={selectedUserKeys.has(userSearchSelectionKey(u))} onChange={() => setSelectedUserKeys((prev) => { const n = new Set(prev); const k = userSearchSelectionKey(u); if (n.has(k)) n.delete(k); else n.add(k); return n; })} aria-label={`${u.userNm ?? u.userId}${i18nText.ariaSelectSuffix}`} /></div>
                        <div>{u.userId}</div>
                        <div>{u.userNm ?? ""}</div>
                        <div>{u.deptNm ?? "-"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="transfer-arrows">
              <button type="button" className="arr-btn" onClick={addUsersToAuthor} title={i18nText.ariaAddUsersToAuthor}><i className="ph ph-caret-right" /></button>
              <button type="button" className="arr-btn" onClick={removeSelectedFromAuthor} title={i18nText.ariaRemoveSelection}><i className="ph ph-caret-left" /></button>
            </div>
            {!embedAssignBesideTabs && assignRightPanel}
          </div>
        )}

        {activeTab === "group" && (
          <div className="transfer-row">
            <div className="transfer-col">
              <div className="card-search-row">
                <span>{i18nText.labelGroupNameIdField}</span>
                <label className="f_input" style={{ flex: 1, minWidth: 0, margin: 0 }}>
                  <input
                    type="text"
                    placeholder={i18nText.placeholderSearchGroupNameId}
                    value={groupSearchKeyword}
                    onChange={(e) => {
                      setGroupSearchKeyword(e.target.value);
                      debouncedFetchGroupList();
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), fetchGroupList())}
                  />
                </label>
              </div>
              <div className="board_list BRD006 md-admin-list au-transfer-list" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <div className="head head--compact">
                  <span className="md-col-chk"><input type="checkbox" checked={groupList.length > 0 && selectedGroupIds.size === groupList.length} onChange={(e) => setSelectedGroupIds(e.target.checked ? new Set(groupList.map((g) => g.groupId)) : new Set())} aria-label={i18nText.etcSelectAllAriaLabel} /></span>
                  <span>{i18nText.colGroupId}</span>
                  <span>{i18nText.colGroupNm}</span>
                </div>
                <div className="result">
                  {groupList.length === 0 ? (
                    <p className="no_data">{i18nText.hintGroupSearchAuto}</p>
                  ) : (
                    groupList.map((g, idx) => (
                      <div key={g.groupId} className="list_item">
                        <div className="md-col-chk"><input type="checkbox" checked={selectedGroupIds.has(g.groupId)} onChange={() => setSelectedGroupIds((prev) => { const n = new Set(prev); if (n.has(g.groupId)) n.delete(g.groupId); else n.add(g.groupId); return n; })} aria-label={`${g.groupNm ?? g.groupId}${i18nText.ariaSelectSuffix}`} /></div>
                        <div>{g.groupId}</div>
                        <div>{g.groupNm ?? ""}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {groupUserPreview.length > 0 && (
                <div style={{ borderTop: "1px solid #e0e0e0", padding: "8px 16px", maxHeight: "120px", overflowY: "auto", background: "#fafafa", flexShrink: 0 }}>
                  <div className="system-subtitle" style={{ marginBottom: "6px" }}>{i18nText.titleSelectedGroupUsers}</div>
                  <textarea readOnly rows={3} style={{ width: "100%", resize: "none", padding: "8px", fontSize: "13px", border: "none", background: "transparent" }} value={groupUserPreview.map((u) => `${u.userId} | ${u.userNm ?? ""} | ${u.deptNm ?? ""}`).join("\n")} />
                </div>
              )}
            </div>
            <div className="transfer-arrows">
              <button type="button" className="arr-btn" onClick={addGroupsToAuthor} title={i18nText.ariaAddGroupsToAuthor}><i className="ph ph-caret-right" /></button>
              <button type="button" className="arr-btn" onClick={removeSelectedFromAuthor} title={i18nText.ariaRemoveSelection}><i className="ph ph-caret-left" /></button>
            </div>
            {!embedAssignBesideTabs && assignRightPanel}
          </div>
        )}

        {activeTab === "dept" && (
          <div className="transfer-row">
            <div className="transfer-col">
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "10px 12px" }}>
                  {deptTree.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                      {i18nText.msgDeptTreeHelp}
                    </div>
                  ) : deptTreeHierarchy.length > 0 ? (
                    deptTreeHierarchy.map((node, index) =>
                      renderDeptTreeNode(node, 0, index === deptTreeHierarchy.length - 1)
                    )
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{i18nText.msgNoDeptInCompany}</div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, maxHeight: "45%", margin: "8px 0 0", overflow: "hidden" }}>
                <div className="sub-panel-header">{i18nText.titleDeptUsers}</div>
                <div className="board_list BRD006 md-admin-list no-border-top" style={{ flex: 1, minHeight: 0, overflow: "auto", border: "none" }}>
                  <div className="head head--compact">
                    <span className="md-col-chk"><input type="checkbox" checked={deptUserList.length > 0 && selectedDeptUserKeys.size === deptUserList.length} onChange={(e) => setSelectedDeptUserKeys(e.target.checked ? new Set(deptUserList.map((u) => userSearchSelectionKey(u))) : new Set())} aria-label={i18nText.etcSelectAllAriaLabel} /></span>
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
                        <div key={userSearchSelectionKey(u)} className="list_item">
                          <div className="md-col-chk"><input type="checkbox" checked={selectedDeptUserKeys.has(userSearchSelectionKey(u))} onChange={() => toggleDeptUser(u)} aria-label={`${u.userNm ?? u.userId}${i18nText.ariaSelectSuffix}`} /></div>
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
            <div className="transfer-arrows">
              <button type="button" className="arr-btn" onClick={addDeptUsersToAuthor} title={i18nText.ariaAddUsersToAuthor}><i className="ph ph-caret-right" /></button>
              <button type="button" className="arr-btn" onClick={removeSelectedFromAuthor} title={i18nText.ariaRemoveSelection}><i className="ph ph-caret-left" /></button>
            </div>
            {!embedAssignBesideTabs && assignRightPanel}
          </div>
        )}
      </div>
    </div>
  );

  const authorHeaderActions = (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
      <button
        type="button"
        className="btn btn_default_h46"
        onClick={() => {
          if (embedded) {
            // 통합 화면에서는 초기화 클릭 시 상세 -> 입력(등록) 모드로 전환
            onEmbeddedCommit?.();
            setForm((f) => ({
              ...f,
              cmpnyCd: cmpnyCdFromState || f.cmpnyCd,
              authorCd: "",
              authorNm: "",
              authorCn: "",
              useFl: "Y",
            }));
            setAuthorUserList([]);
            setSelectedAuthorRows(new Set());
            setSelectedMenuIds(new Set());
            setAssignRightTab("authUser");
            setTimeout(() => document.getElementById("authorEdit_authorCd")?.focus(), 50);
            return;
          }
          if (isDetail && cmpnyCdFromState && authorCdFromState) {
            loadDetail();
            loadAuthorUsers();
            loadAuthorMenus();
            return;
          }
          setForm((f) => ({
            ...f,
            authorCd: "",
            authorNm: "",
            authorCn: "",
            useFl: "Y",
          }));
          setAuthorUserList([]);
          setSelectedMenuIds(new Set());
          setTimeout(() => document.getElementById("authorEdit_authorCd")?.focus(), 50);
        }}
      >
        {i18nText.btnReset}
      </button>
      <button type="button" className="btn btn_dark_h46" onClick={() => handleSubmit()}>
        {i18nText.btnSave}
      </button>
      {isDetail && form.authorCd !== "AUTH_ADMIN" && form.authorCd !== "SYS_ADMIN" && (
        <button type="button" className="btn btn_blue_h46" onClick={handleDelete}>
          {i18nText.btnDelete}
        </button>
      )}
      {!embedded && (
        <button type="button" className="btn btn_blue_h46" onClick={() => navigate(URL.SYSTEM_AUTHOR)}>
          {i18nText.btnList}
        </button>
      )}
    </div>
  );

  return (
    <div
      className={embedded ? "author-embed-root" : "container"}
      style={embedded ? { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" } : undefined}
    >
      <div className="c_wrap" style={embedded ? { padding: "0", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : undefined}>
        {!embedded && (
          <div className="location">
            <h1 className="location__title">{pageTitle}</h1>
            <ul>
              <li><Link to={URL.MAIN} className="home">{i18nText.navHome}</Link></li>
              <li><Link to={URL.SYSTEM}>{i18nText.navSystem}</Link></li>
              <li><Link to={URL.SYSTEM_AUTHOR}>{i18nText.pageTitle}</Link></li>
              <li>{pageTitle}</li>
            </ul>
          </div>
        )}

        <div className="layout" style={embedded ? { flex: 1, minHeight: 0, overflow: "hidden" } : undefined}>
          <div
            className="contents contents--author"
            id="contents"
            style={
              embedded
                ? {
                  flex: 1,
                  minHeight: 0,
                  overflow: embedAssignBesideTabs ? "hidden" : "auto",
                  padding: "0",
                  ...(embedAssignBesideTabs ? { display: "flex", flexDirection: "column" as const } : {}),
                }
                : undefined
            }
          >
            <div
              className="md-form-card"
              style={embedAssignBesideTabs ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" } : undefined}
            >
              {!embedAssignBesideTabs && (
                <div className="md-page-header" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  {authorHeaderActions}
                </div>
              )}

              {embedAssignBesideTabs ? (
                <div className="au-grid">
                  {/* Card 1: 권한 목록 */}
                  <div className="au-card">
                    {listSlot}
                  </div>
                  {/* Card 2: 권한 등록/상세 폼 */}
                  <div ref={formBlockEmbedRef} className="au-card">
                    <div className="card-bar card-bar-right">
                      {authorHeaderActions}
                    </div>
                    {authorFormBlock}
                  </div>
                  {/* Card 3: 사용자/그룹/부서 탭 */}
                  <div className="au-card">
                    {authorTabsBlock}
                  </div>
                  {/* Card 4: 권한사용자/권한메뉴 */}
                  <div className="au-card">
                    {assignRightPanel}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "20px", alignItems: "stretch", minHeight: 0 }}>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {authorFormBlock}
                    {authorTabsBlock}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnAuthorEdit;
