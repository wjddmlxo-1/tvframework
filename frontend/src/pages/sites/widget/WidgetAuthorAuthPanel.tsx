import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as EgovNet from "@/api/egovFetch";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  type NodeProps,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { buildAuthorHierarchyNodeLayouts, type AuthorRelationEdge } from "./widgetAuthorHierarchyLayout";
import { replaceI18nPlaceholders, type CmmnWidgetI18nText } from "./cmmnWidgetI18n";

export type WidgetAuthorRow = { authorCd: string; authorNm?: string; authorCn?: string };

type AuthorMasterRow = { authorCd: string; authorNm: string; authorCn?: string };

const NODE_W = 220;
const NODE_H = 64;

const MIME_WIDGET_AUTHOR = "application/x-widget-author";

function WidgetAuthorDnDNode(props: NodeProps<WidgetAuthorRow>) {
  const { data } = props;
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0, width: 1, height: 1 }} />
      <div
        className="nodrag nopan"
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          const payload: WidgetAuthorRow = {
            authorCd: data.authorCd,
            authorNm: data.authorNm,
            authorCn: data.authorCn,
          };
          e.dataTransfer.setData(MIME_WIDGET_AUTHOR, JSON.stringify(payload));
          e.dataTransfer.setData("application/authorCd", data.authorCd);
          e.dataTransfer.setData("text/plain", data.authorCd);
          e.dataTransfer.effectAllowed = "copy";
        }}
        style={{
          width: NODE_W,
          height: NODE_H,
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          cursor: "grab",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#0f172a",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {data.authorCd}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#64748b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          {data.authorNm || ""}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, width: 1, height: 1 }} />
    </>
  );
}

type Props = {
  cmpnyCd: string;
  assigned: WidgetAuthorRow[];
  onChangeAssigned: (next: WidgetAuthorRow[]) => void;
  t: CmmnWidgetI18nText;
};

function parseDropAuthor(
  e: React.DragEvent,
  masterByCd: Map<string, AuthorMasterRow>
): WidgetAuthorRow | null {
  const raw = e.dataTransfer.getData(MIME_WIDGET_AUTHOR);
  if (raw) {
    try {
      const o = JSON.parse(raw) as Partial<WidgetAuthorRow>;
      const cd = String(o.authorCd ?? "").trim();
      if (!cd) return null;
      const fromMaster = masterByCd.get(cd);
      return {
        authorCd: cd,
        authorNm: o.authorNm ?? fromMaster?.authorNm ?? "",
        authorCn: o.authorCn ?? fromMaster?.authorCn,
      };
    } catch {
      /* fall through */
    }
  }
  const cd =
    e.dataTransfer.getData("application/authorCd").trim() || e.dataTransfer.getData("text/plain").trim();
  if (!cd) return null;
  const fromMaster = masterByCd.get(cd);
  return { authorCd: cd, authorNm: fromMaster?.authorNm ?? "", authorCn: fromMaster?.authorCn };
}

export default function WidgetAuthorAuthPanel({ cmpnyCd, assigned, onChangeAssigned, t }: Props) {
  const [edges, setEdges] = useState<AuthorRelationEdge[]>([]);
  const [authors, setAuthors] = useState<AuthorMasterRow[]>([]);
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);

  const masterByCd = useMemo(() => {
    const m = new Map<string, AuthorMasterRow>();
    authors.forEach((a) => m.set(a.authorCd, a));
    return m;
  }, [authors]);

  const loadEdges = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/hierarchy?cmpnyCd=${encodeURIComponent(cmpnyCd)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: unknown }) => {
        const list = resp?.result;
        if (Array.isArray(list)) {
          setEdges(
            list.map((r: { upperAuthorCd?: string; lowerAuthorCd?: string }) => ({
              upperAuthorCd: String(r.upperAuthorCd ?? ""),
              lowerAuthorCd: String(r.lowerAuthorCd ?? ""),
            }))
          );
        } else setEdges([]);
      },
      () => setEdges([])
    );
  }, [cmpnyCd]);

  const loadAuthors = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/authorsAll?cmpnyCd=${encodeURIComponent(cmpnyCd)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: unknown }) => {
        const list = resp?.result;
        if (Array.isArray(list)) {
          setAuthors(
            list.map((r: { authorCd?: string; authorNm?: string; authorCn?: string }) => ({
              authorCd: String(r.authorCd ?? ""),
              authorNm: String(r.authorNm ?? ""),
              authorCn: r.authorCn,
            }))
          );
        } else setAuthors([]);
      },
      () => setAuthors([])
    );
  }, [cmpnyCd]);

  useEffect(() => {
    loadEdges();
    loadAuthors();
  }, [loadEdges, loadAuthors, cmpnyCd]);

  const flowNodes = useMemo(() => {
    const layouts = buildAuthorHierarchyNodeLayouts(edges);
    return layouts.map((n) => {
      const row = masterByCd.get(n.id);
      return {
        id: n.id,
        type: "widgetAuthorDnD",
        position: n.position,
        draggable: false,
        selectable: true,
        data: {
          authorCd: n.id,
          authorNm: row?.authorNm ?? "",
          authorCn: row?.authorCn,
        },
      };
    });
  }, [edges, masterByCd]);

  const flowEdges = useMemo(
    () =>
      edges
        .filter((e) => e.upperAuthorCd && e.lowerAuthorCd)
        .map((e, idx) => ({
          id: `${e.upperAuthorCd}-${e.lowerAuthorCd}-${idx}`,
          source: e.upperAuthorCd,
          target: e.lowerAuthorCd,
          animated: true,
          style: { stroke: "#94a3b8" },
        })),
    [edges]
  );

  const nodeTypes = useMemo(() => ({ widgetAuthorDnD: WidgetAuthorDnDNode }), []);

  useEffect(() => {
    if (!rf) return;
    if (flowNodes.length === 0) return;
    rf.fitView({ padding: 0.2, duration: 0 });
  }, [rf, flowNodes]);

  const onDropGrid = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const row = parseDropAuthor(e, masterByCd);
      if (!row?.authorCd) return;
      if (assigned.some((a) => a.authorCd === row.authorCd)) {
        return;
      }
      onChangeAssigned([...assigned, row]);
    },
    [assigned, masterByCd, onChangeAssigned]
  );

  const onDragOverGrid = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const removeAuthor = useCallback(
    (authorCd: string) => {
      onChangeAssigned(assigned.filter((a) => a.authorCd !== authorCd));
    },
    [assigned, onChangeAssigned]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="md-form-card" style={{ padding: 16 }}>
        <div className="system-subtitle" style={{ marginBottom: 12 }}>
          {t.titleAuthRelation}
        </div>
        <div
          style={{
            height: 420,
            minHeight: 420,
            overflow: "hidden",
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 10,
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 8px",
              fontSize: 12,
              color: "#0f172a",
              pointerEvents: "none",
            }}
          >
            {replaceI18nPlaceholders(t.etcFlowEdgeNodeCounts, {
              edgeCount: edges.length,
              nodeCount: flowNodes.length,
            })}
          </div>
          {flowNodes.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: 13,
                padding: 24,
                textAlign: "center",
              }}
            >
              {t.msgNoPermissionStructure}
              <br />
              {t.msgDragPermissionNodeHint}
            </div>
          ) : (
            <ReactFlow
              nodes={flowNodes as any}
              edges={flowEdges as any}
              nodeTypes={nodeTypes as any}
              nodesDraggable={false}
              fitView
              onInit={(instance) => setRf(instance)}
              style={{ width: "100%", height: "100%" }}
            >
              <Background gap={24} size={1} color="#f1f5f9" />
              <Controls />
              <MiniMap nodeStrokeColor="#94a3b8" nodeColor="#e2e8f0" />
            </ReactFlow>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 10, marginBottom: 0 }}>
          {t.msgDragNodeToPermissionInfo}
        </p>
      </div>

      <div className="md-form-card" style={{ padding: 16 }}>
        <div className="system-subtitle" style={{ marginBottom: 12 }}>
          {t.titleAuthInfo}
        </div>
        <div
          onDrop={onDropGrid}
          onDragOver={onDragOverGrid}
          style={{
            minHeight: 160,
            border: "2px dashed #cbd5e1",
            borderRadius: 8,
            padding: 8,
            background: "linear-gradient(180deg, #f8fafc 0%, #fff 100%)",
          }}
        >
          <div className="board_list md-admin-list md-author-list-cols md-widget-author-info-table BRD006">
            <div className="head">
              <span className="md-col-author-cd">{t.labelAuthCode}</span>
              <span className="md-col-author-nm">{t.labelAuthName}</span>
              <span className="md-col-author-dc">{t.labelDescription}</span>
            </div>
            <div className="result">
              {assigned.length === 0 ? (
                <p className="no_data" style={{ margin: 0, padding: "24px 8px", textAlign: "center", width: "100%" }}>
                  {t.msgDragFromTopPermission}
                </p>
              ) : (
                assigned.map((a) => (
                  <div key={a.authorCd} className="list_item">
                    <div className="md-col-author-cd" style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <span className="ellipsis" style={{ minWidth: 0, flex: 1 }} title={a.authorCd}>
                        {a.authorCd}
                      </span>
                      <button
                        type="button"
                        className="btn btn_skyblue_h46"
                        title={replaceI18nPlaceholders(t.btnRemovePermission, { title: a.authorCd })}
                        aria-label={replaceI18nPlaceholders(t.ariaRemoveAuthor, { code: a.authorCd })}
                        onClick={() => removeAuthor(a.authorCd)}
                        style={{
                          width: 26,
                          height: 26,
                          minWidth: 26,
                          minHeight: 26,
                          padding: 0,
                          fontSize: 12,
                          lineHeight: "24px",
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="md-col-author-nm">{a.authorNm || "-"}</div>
                    <div className="md-col-author-dc ellipsis" title={a.authorCn || ""}>
                      {a.authorCn || "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
