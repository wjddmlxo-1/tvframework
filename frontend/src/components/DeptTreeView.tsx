import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_COMPONENT_I18N_FALLBACK, CMMN_COMPONENT_I18N_KEYS } from "@/components/cmmnComponentI18n";

import {
  buildDeptHierarchy,
  expandDeptTreeToLevel2,
  fetchDeptTree,
  type DeptTreeHierarchyNode,
  type DeptTreeItem,
} from "@/api/deptTree";

export type DeptTreeViewProps = {
  /** 회사코드 */
  cmpnyCd: string;
  /** CM_MESSAGE_LANG 등과 맞는 언어코드 (예: ko_KR) */
  langGb: string;
  /** 현재 선택 부서 코드 */
  selectedDeptCd: string;
  /** 부서 노드 클릭 시 */
  onSelectDept: (deptCd: string, deptNm?: string) => void;
  /** 트리 영역에 적용할 className (선택) */
  className?: string;
  /** 빈 회사/빈 목록 메시지 커스터마이즈 */
  emptyNoCompanyMessage?: string;
  emptyNoDeptMessage?: string;
};

/**
 * 시스템 권한관리(CmmnAuthorEdit) 부서 탭과 동일한 계층 트리 UI.
 * - fetchDeptTree → buildDeptHierarchy
 * - 2레벨까지 초기 펼침(expandDeptTreeToLevel2)
 */
export default function DeptTreeView({
  cmpnyCd,
  langGb,
  selectedDeptCd,
  onSelectDept,
  className,
  emptyNoCompanyMessage,
  emptyNoDeptMessage,
}: DeptTreeViewProps) {
  const i18nText = useCmmnScreenI18n(CMMN_COMPONENT_I18N_KEYS, CMMN_COMPONENT_I18N_FALLBACK, { cmpnyCd });
  const [deptTree, setDeptTree] = useState<DeptTreeItem[]>([]);
  const [deptExpandedNodes, setDeptExpandedNodes] = useState<Set<string>>(new Set());
  const noCompanyMessage = emptyNoCompanyMessage ?? i18nText.msgSelectCompanyForDeptTree;
  const noDeptMessage = emptyNoDeptMessage ?? i18nText.msgNoDepartmentFound;

  const loadDeptTree = useCallback(() => {
    const cd = cmpnyCd?.trim();
    if (!cd) {
      setDeptTree([]);
      setDeptExpandedNodes(new Set());
      return;
    }
    fetchDeptTree(
      cd,
      langGb || "ko_KR",
      (list) => {
        setDeptTree(list);
        setDeptExpandedNodes(expandDeptTreeToLevel2(list));
      },
      () => {
        setDeptTree([]);
        setDeptExpandedNodes(new Set());
      }
    );
  }, [cmpnyCd, langGb]);

  useEffect(() => {
    loadDeptTree();
  }, [loadDeptTree]);

  const deptTreeHierarchy = useMemo(() => buildDeptHierarchy(deptTree), [deptTree]);

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

    const FolderIcon = ({ isOpen }: { isOpen: boolean }) => (
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: "4px", flexShrink: 0 }}>
        {isOpen ? (
          <path fill="#FFA500" fillRule="evenodd" d="M2 2v12h12V6H8L6 4H2zm0-2h4l2 2h8v10H0V0z" />
        ) : (
          <path fill="#FFA500" fillRule="evenodd" d="M2 2h5l2 2h7v10H2V2z" />
        )}
      </svg>
    );
    const DocumentIcon = () => (
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: "4px", flexShrink: 0 }}>
        <path fill="#666" d="M10 0H2v16h12V4h-4V0zm2 14H4V2h4v4h4v8z" />
      </svg>
    );
    const ExpandIcon = ({ expanded }: { expanded: boolean }) => (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "16px",
          height: "16px",
          marginRight: "4px",
          border: "1px solid #999",
          borderRadius: "2px",
          backgroundColor: "#fff",
          fontSize: "12px",
          lineHeight: "1",
          cursor: "pointer",
          flexShrink: 0,
          color: "#666",
        }}
      >
        {expanded ? "−" : "+"}
      </span>
    );

    return (
      <div key={node.deptCd} style={{ position: "relative" }}>
        {level > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: `${(level - 1) * 20 + 10}px`,
                top: "0",
                bottom: isLast ? "24px" : "0",
                width: "1px",
                borderLeft: "1px dotted #ccc",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${(level - 1) * 20 + 10}px`,
                top: "24px",
                width: "10px",
                height: "1px",
                borderTop: "1px dotted #ccc",
                pointerEvents: "none",
              }}
            />
          </>
        )}
        <div
          className={`tree-node ${isSelected ? "selected" : ""}`}
          style={{
            position: "relative",
            padding: "6px 8px",
            paddingLeft: level > 0 ? `${level * 20 + 8}px` : "8px",
            cursor: "pointer",
            textDecoration: isSelected ? "underline" : "none",
            fontWeight: isSelected ? "bold" : "normal",
            display: "flex",
            alignItems: "center",
            backgroundColor: isSelected ? "#e3f2fd" : "transparent",
            borderRadius: "3px",
            minHeight: "32px",
          }}
          onClick={() => {
            onSelectDept(node.deptCd, node.deptNm);
            if (hasChildren && !isExpanded) toggleDeptNode(node.deptCd);
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {hasChildren ? (
            <span onClick={(e) => toggleDeptNode(node.deptCd, e)} style={{ display: "flex", alignItems: "center" }}>
              <ExpandIcon expanded={isExpanded} />
            </span>
          ) : (
            <span style={{ width: "20px", display: "inline-block", flexShrink: 0 }} />
          )}
          {hasChildren ? <FolderIcon isOpen={isExpanded} /> : <DocumentIcon />}
          <span style={{ flex: 1, color: "#333" }}>{node.deptNm || node.deptCd}</span>
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

  const trimmed = cmpnyCd?.trim() ?? "";

  return (
    <div
      className={className}
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ddd",
        borderRadius: "5px",
        padding: "15px 10px",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "5px 0" }}>
        {!trimmed ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{noCompanyMessage}</div>
        ) : deptTree.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{noDeptMessage}</div>
        ) : deptTreeHierarchy.length > 0 ? (
          deptTreeHierarchy.map((node, index) => renderDeptTreeNode(node, 0, index === deptTreeHierarchy.length - 1))
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>{noDeptMessage}</div>
        )}
      </div>
    </div>
  );
}
