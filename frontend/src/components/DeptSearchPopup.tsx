import React, { useEffect, useState } from "react";
import { fetchDeptTree, buildDeptHierarchy, expandDeptTreeToLevel2, type DeptTreeItem, type DeptTreeHierarchyNode } from "@/api/deptTree";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_COMPONENT_I18N_FALLBACK, CMMN_COMPONENT_I18N_KEYS } from "@/components/cmmnComponentI18n";

export type DeptSearchPopupProps = {
  companyCode: string;
  langCode: string;
  onSelect: (deptCd: string, deptNm: string) => void;
  onClose: () => void;
};

/**
 * 회사 기준 부서 트리 검색 팝업 (사용자관리·마이페이지 등 공통)
 */
export default function DeptSearchPopup({ companyCode, langCode, onSelect, onClose }: DeptSearchPopupProps) {
  const i18nText = useCmmnScreenI18n(CMMN_COMPONENT_I18N_KEYS, CMMN_COMPONENT_I18N_FALLBACK, { cmpnyCd: companyCode });
  const [tree, setTree] = useState<DeptTreeItem[]>([]);
  const [deptExpandedNodes, setDeptExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!companyCode) return;
    fetchDeptTree(
      companyCode,
      langCode,
      (list) => {
        setTree(list);
        setDeptExpandedNodes(expandDeptTreeToLevel2(list));
      },
      () => {
        setTree([]);
        setDeptExpandedNodes(new Set());
      }
    );
  }, [companyCode, langCode]);

  const deptTreeHierarchy = buildDeptHierarchy(tree);

  const toggleDeptNode = (deptCd: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeptExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(deptCd)) next.delete(deptCd);
      else next.add(deptCd);
      return next;
    });
  };

  const renderDeptTreeNode = (node: DeptTreeHierarchyNode, level: number, isLast: boolean) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = deptExpandedNodes.has(node.deptCd);

    return (
      <div key={node.deptCd} style={{ position: "relative" }}>
        {level > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: (level - 1) * 16 + 12,
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
                left: (level - 1) * 16 + 13,
                top: 16,
                width: 14,
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
              left: level * 16 + 12,
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
          style={{ paddingLeft: level > 0 ? level * 16 + 8 : 8 }}
          onClick={() => {
            onSelect(node.deptCd, node.deptNm || node.deptCd);
            onClose();
          }}
        >
          {hasChildren ? (
            <span className="tree-toggle-wrap" onClick={(e) => toggleDeptNode(node.deptCd, e)}>
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

  return (
    <div
      className="wrap_pop"
      style={{ display: "block", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="pop_inner"
        style={{
          width: "600px",
          height: "800px",
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
      >
        <div className="pop_header">
          <h1>{i18nText.titleDeptSearch}</h1>
          <button type="button" className="pop_close" aria-label="✕" onClick={onClose} />
        </div>

        <div className="pop_container" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
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
            {deptTreeHierarchy.length > 0 ? (
              deptTreeHierarchy.map((node, idx) => renderDeptTreeNode(node, 0, idx === deptTreeHierarchy.length - 1))
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
                {i18nText.msgNoDepartmentFound}
              </div>
            )}
          </div>
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="pd-btn" onClick={onClose}>
              {i18nText.btnClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
