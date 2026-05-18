import { useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import CODE from "@/constants/code";
import BbsUserSidebar from "@/components/BbsUserSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCompanyList } from "@/hooks/useCompanyList";
import { getSessionItem } from "@/utils/storage";

/** 사이드바용 메뉴 노드 (/cmmnMenu/sidebar 응답) */
interface SidebarMenuNode {
  menuId: string;
  menuNm?: string;
  progrmFileNm?: string;
  navigateUrl?: string | null;
  imageFullPath?: string | null;
  treeLevel?: number;
  children?: SidebarMenuNode[];
}

interface LeftSidebarProps {
  collapsed: boolean;
}

function menuLinkTarget(node: SidebarMenuNode): string {
  const v = (node.navigateUrl ?? node.progrmFileNm ?? "").trim();
  return v;
}

function MenuIcon({ node, depth }: { node: SidebarMenuNode; depth: number }) {
  const iconUrl = String(node.imageFullPath || "").trim();
  if (iconUrl) {
    return (
      <img className="nav-icon-img" src={iconUrl} alt="" loading="lazy" aria-hidden />
    );
  }
  return <i className={`ph ${depth === 0 ? "ph-folder" : "ph-caret-right"}`} aria-hidden></i>;
}

function pathMatchesMenu(pathname: string, url: string): boolean {
  if (!url || url === "dir") return false;
  const u = url.replace(/\/$/, "") || "/";
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === u) return true;
  return p.startsWith(`${u}/`);
}

function subtreePathMatches(pathname: string, node: SidebarMenuNode): boolean {
  const link = menuLinkTarget(node);
  if (link && link !== "dir" && pathMatchesMenu(pathname, link)) return true;
  for (const c of node.children ?? []) {
    if (subtreePathMatches(pathname, c)) return true;
  }
  return false;
}

/** 현재 경로에 맞춰 펼칠 폴더 menuId 계산 */
function computeExpandedIds(nodes: SidebarMenuNode[], pathname: string): Set<string> {
  const expanded = new Set<string>();

  function dfs(node: SidebarMenuNode): boolean {
    const children = node.children ?? [];
    if (children.length > 0) {
      let hit = false;
      for (const c of children) {
        if (dfs(c)) hit = true;
      }
      if (hit) expanded.add(node.menuId);
      return hit;
    }
    const url = menuLinkTarget(node);
    if (url && url !== "dir" && pathMatchesMenu(pathname, url)) {
      expanded.add(node.menuId);
      return true;
    }
    return false;
  }

  for (const r of nodes) dfs(r);
  return expanded;
}

/** TREE_LEVEL=1 노드는 숨기고, 하위 노드를 화면 루트로 승격 */
function hideLevelOneNodes(nodes: SidebarMenuNode[]): SidebarMenuNode[] {
  const result: SidebarMenuNode[] = [];
  for (const node of nodes) {
    const children = hideLevelOneNodes(node.children ?? []);
    if (node.treeLevel === 1) {
      result.push(...children);
      continue;
    }
    result.push({ ...node, children });
  }
  return result;
}

function SidebarMenuBranch({
  nodes,
  pathname,
  expanded,
  toggle,
  depth,
}: {
  nodes: SidebarMenuNode[];
  pathname: string;
  expanded: ReadonlySet<string>;
  toggle: (menuId: string) => void;
  depth: number;
}) {
  return (
    <>
      {nodes.map((node) => {
        const children = node.children ?? [];
        const link = menuLinkTarget(node);
        const isDir = !link || link === "dir";
        const hasChildren = children.length > 0;

        if (hasChildren) {
          const isOpen = true;
          const sectionActive = subtreePathMatches(pathname, node);
          return (
            <div key={node.menuId} className="nav-section">
              <button
                type="button"
                className="nav-link"
                aria-expanded={isOpen}
              >
                <MenuIcon node={node} depth={depth} />
                <span className="nav-link-label">{node.menuNm ?? node.menuId}</span>
                <i className="ph ph-caret-up chevron"></i>
              </button>
              {isOpen && (
                <div className="sub-links">
                  <SidebarMenuBranch nodes={children} pathname={pathname} expanded={expanded} toggle={toggle} depth={depth + 1} />
                </div>
              )}
            </div>
          );
        }

        if (isDir) {
          return (
            <div key={node.menuId} className="nav-section">
              <div className="nav-link nav-link--disabled" aria-disabled="true">
                <MenuIcon node={node} depth={depth} />
                <span className="nav-link-label">{node.menuNm ?? node.menuId}</span>
              </div>
            </div>
          );
        }

        const active = pathMatchesMenu(pathname, link);

        if (depth === 0) {
          return (
            <div key={node.menuId} className="nav-section">
              <NavLink
                to={link}
                className={({ isActive }) => `nav-link${isActive || active ? " active" : ""}`}
              >
                <MenuIcon node={node} depth={depth} />
                <span className="nav-link-label">{node.menuNm ?? node.menuId}</span>
              </NavLink>
            </div>
          );
        }

        return (
          <NavLink
            key={node.menuId}
            to={link}
            className={({ isActive }) => isActive || active ? "active" : ""}
          >
            <MenuIcon node={node} depth={depth} />
            {node.menuNm ?? node.menuId}
          </NavLink>
        );
      })}
    </>
  );
}

function LeftSidebar({ collapsed }: LeftSidebarProps) {
  const location = useLocation();
  const { langGb } = useLanguage();
  const pathname = location.pathname;
  const [menuTree, setMenuTree] = useState<SidebarMenuNode[]>([]);
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(new Set());

  const { cmpnyCd } = useCompanyList();

  const sessionUser = getSessionItem("loginUser") as { id?: string } | null;
  const userId = String(sessionUser?.id ?? "").trim();
  const loggedIn = userId.length > 0;

  const lang = langGb || "ko_KR";
  const visibleMenuTree = useMemo(() => hideLevelOneNodes(menuTree), [menuTree]);

  const loadSidebarMenu = useCallback(() => {
    if (!loggedIn || !cmpnyCd) {
      setMenuTree([]);
      return;
    }
    const qs = new URLSearchParams({
      userId,
      cmpnyCd,
      langGb: lang,
    });
    EgovNet.requestFetch(
      `/cmmnMenu/sidebar?${qs.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        const data = ok ? resp?.result ?? resp : null;
        const tree = Array.isArray(data) ? (data as SidebarMenuNode[]) : [];
        setMenuTree(tree);
      },
      () => setMenuTree([])
    );
  }, [loggedIn, userId, cmpnyCd, lang]);

  useEffect(() => {
    loadSidebarMenu();
  }, [loadSidebarMenu]);

  useEffect(() => {
    if (visibleMenuTree.length === 0) {
      setExpandedMenuIds(new Set());
      return;
    }
    setExpandedMenuIds(computeExpandedIds(visibleMenuTree, pathname));
  }, [visibleMenuTree, pathname]);

  const toggle = useCallback((menuId: string) => {
    setExpandedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  }, []);

  const userBbsActive = pathMatchesMenu(pathname, URL.MAIN_BBS);

  const sidebarInner = useMemo(() => {
    if (!loggedIn) {
      return (
        <div className="nav-section">
          <p className="sidebar-empty-msg">로그인 후 메뉴가 표시됩니다.</p>
        </div>
      );
    }
    if (!cmpnyCd) {
      return (
        <div className="nav-section">
          <p className="sidebar-empty-msg">회사를 선택하면 메뉴가 표시됩니다.</p>
        </div>
      );
    }
    if (visibleMenuTree.length === 0) {
      return (
        <div className="nav-section">
          <p className="sidebar-empty-msg">표시할 메뉴가 없습니다. 권한·메뉴 설정을 확인하세요.</p>
        </div>
      );
    }
    return (
      <SidebarMenuBranch
        nodes={visibleMenuTree}
        pathname={pathname}
        expanded={expandedMenuIds}
        toggle={toggle}
        depth={0}
      />
    );
  }, [loggedIn, cmpnyCd, visibleMenuTree, pathname, expandedMenuIds, toggle]);

  if (userBbsActive) {
    return (
      <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
        <div className="sidebar-search">
          <i className="ph ph-magnifying-glass search-icon"></i>
          <input type="text" placeholder="Search anything" readOnly />
          <div className="keys"><kbd>⌘</kbd><kbd>K</kbd></div>
        </div>
        <div className="nav-section">
          <BbsUserSidebar />
        </div>
        <div className="sidebar-spacer" />
      </aside>
    );
  }

  return (
    <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
      {/* 검색 */}
      <div className="sidebar-search">
        <i className="ph ph-magnifying-glass search-icon"></i>
        <input type="text" placeholder="Search anything" readOnly />
        <div className="keys">
          <kbd>⌘</kbd><kbd>K</kbd>
        </div>
      </div>

      {sidebarInner}

      <div className="sidebar-spacer" />
    </aside>
  );
}

export default LeftSidebar;
