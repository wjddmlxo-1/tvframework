import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import { CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK } from "./cmmnAuthorI18n";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Position,
  ReactFlowInstance,
  type EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "reactflow";

import "reactflow/dist/style.css";

type RelationEdge = { upperAuthorCd: string; lowerAuthorCd: string };

type AuthorRow = { authorCd: string; authorNm: string; authorCn?: string };

type Props = {
  cmpnyCd: string;
  langGb: string;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 64;
const X_SPACING = 260;
const Y_SPACING = 110;

function CmmnAuthorStructureTab({ cmpnyCd, langGb }: Props) {
  const i18nText = useCmmnScreenI18n(CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK, { cmpnyCd });
  const [edges, setEdges] = useState<RelationEdge[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [unmapped, setUnmapped] = useState<AuthorRow[]>([]);
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);

  const reactFlowWrapRef = useRef<HTMLDivElement | null>(null);

  // 드래그 중 “상위(드롭 대상)” 하이라이트를 위한 상태
  const [pendingDropUpper, setPendingDropUpper] = useState<string | null>(null);

  const loadEdges = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/hierarchy?cmpnyCd=${encodeURIComponent(cmpnyCd)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) setEdges(resp.result);
        else setEdges([]);
      },
      () => setEdges([])
    );
  }, [cmpnyCd]);

  const loadAuthors = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/authorsAll?cmpnyCd=${encodeURIComponent(cmpnyCd)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
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

  const loadUnmapped = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    EgovNet.requestFetch(
      `/cmmnAuthor/hierarchyUnmapped?cmpnyCd=${encodeURIComponent(cmpnyCd)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const list = resp?.result;
        if (Array.isArray(list)) {
          setUnmapped(
            list.map((r: { authorCd?: string; authorNm?: string; authorCn?: string }) => ({
              authorCd: String(r.authorCd ?? ""),
              authorNm: String(r.authorNm ?? ""),
              authorCn: r.authorCn,
            }))
          );
        } else setUnmapped([]);
      },
      () => setUnmapped([])
    );
  }, [cmpnyCd]);

  useEffect(() => {
    loadEdges();
    loadAuthors();
    loadUnmapped();
  }, [loadEdges, loadAuthors, loadUnmapped, cmpnyCd, langGb]);

  const authorNmByCd = useMemo(() => {
    const map = new Map<string, string>();
    authors.forEach((a) => map.set(a.authorCd, a.authorNm));
    return map;
  }, [authors]);

  const handleDeleteEdge = useCallback(
    (e: RelationEdge) => {
      if (!window.confirm(i18nText.msgConfirmDeleteStructureEdge)) return;
      const q = new URLSearchParams({
        cmpnyCd,
        upperAuthorCd: e.upperAuthorCd,
        lowerAuthorCd: e.lowerAuthorCd,
      });
      EgovNet.requestFetch(
        `/cmmnAuthor/hierarchy?${q.toString()}`,
        { method: "DELETE", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            loadEdges();
            loadUnmapped();
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
          }
        },
        () => alert(i18nText.msgErrorOnDelete)
      );
    },
    [cmpnyCd, loadEdges, loadUnmapped, i18nText.msgConfirmDeleteStructureEdge, i18nText.msgErrorOnDelete]
  );

  const flowNodes = useMemo(() => {
    /** 관계(edge)에 실제로 등장하는 권한만 표시 (가독성) */
    const edgeNodeCds = new Set<string>();
    edges.forEach((e) => {
      if (e.upperAuthorCd) edgeNodeCds.add(e.upperAuthorCd);
      if (e.lowerAuthorCd) edgeNodeCds.add(e.lowerAuthorCd);
    });

    const cds = Array.from(edgeNodeCds).filter(Boolean);
    if (cds.length === 0) return [];

    const incomingCount = new Map<string, number>();
    cds.forEach((cd) => incomingCount.set(cd, 0));
    edges.forEach((e) => {
      if (!e.lowerAuthorCd || !incomingCount.has(e.lowerAuthorCd)) return;
      incomingCount.set(e.lowerAuthorCd, (incomingCount.get(e.lowerAuthorCd) || 0) + 1);
    });

    const adjacency = new Map<string, string[]>();
    cds.forEach((cd) => adjacency.set(cd, []));
    edges.forEach((e) => {
      if (!e.upperAuthorCd || !e.lowerAuthorCd) return;
      adjacency.get(e.upperAuthorCd)?.push(e.lowerAuthorCd);
    });

    const roots = cds.filter((cd) => (incomingCount.get(cd) || 0) === 0);
    const level = new Map<string, number>();
    roots.forEach((r) => level.set(r, 0));

    /**
     * 순환 그래프에서도 멈추지 않도록:
     * 1) Kahn(진입차수 0)으로 DAG 부분 처리
     * 2) 남은 순환 노드는 0으로 시작
     * 3) edge 기반 완화는 최대 N회로 제한
     */
    const indegree = new Map(incomingCount);
    const queue: string[] = [...roots];
    while (queue.length) {
      const cur = queue.shift();
      if (!cur) continue;
      const curLv = level.get(cur) ?? 0;
      (adjacency.get(cur) || []).forEach((n) => {
        const prevLv = level.get(n);
        if (prevLv == null || prevLv < curLv + 1) {
          level.set(n, curLv + 1);
        }
        indegree.set(n, (indegree.get(n) || 0) - 1);
        if ((indegree.get(n) || 0) === 0) queue.push(n);
      });
    }

    cds.forEach((cd) => {
      if (!level.has(cd)) level.set(cd, 0);
    });

    for (let i = 0; i < cds.length; i += 1) {
      let changed = false;
      edges.forEach((e) => {
        const up = e.upperAuthorCd;
        const low = e.lowerAuthorCd;
        if (!up || !low || !level.has(up) || !level.has(low)) return;
        const nextLv = (level.get(up) || 0) + 1;
        if ((level.get(low) || 0) < nextLv) {
          level.set(low, nextLv);
          changed = true;
        }
      });
      if (!changed) break;
    }

    const levels = new Map<number, string[]>();
    cds.forEach((cd) => {
      const lv = level.get(cd) ?? 0;
      levels.set(lv, [...(levels.get(lv) || []), cd]);
    });

    const nodes: any[] = [];
    const orderedLevels = Array.from(levels.keys()).sort((a, b) => a - b);
    orderedLevels.forEach((lv) => {
      const arr = (levels.get(lv) || []).sort();
      arr.forEach((cd, idx) => {
        const isDropTarget = pendingDropUpper === cd;
        nodes.push({
          id: cd,
          type: "default",
          // 레벨(lv)을 좌->우로 배치하고, 같은 레벨은 위->아래로 배치
          position: { x: lv * X_SPACING, y: idx * Y_SPACING },
          draggable: false,
          // 좌->우 흐름(UPPER -> LOWER)을 시각적으로 표현
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          style: {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            border: isDropTarget ? "2px solid #2563eb" : "1px solid #e5e7eb",
            borderRadius: 6,
            background: "#fff",
            boxShadow: isDropTarget
              ? "0 0 0 3px rgba(37,99,235,0.25), 0 1px 3px rgba(0,0,0,0.06)"
              : "0 1px 3px rgba(0,0,0,0.06)",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          },
          data: {
            label: (
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0f172a",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cd}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {authorNmByCd.get(cd) || ""}
                </div>
              </div>
            ),
          },
        });
      });
    });

    return nodes;
  }, [edges, pendingDropUpper, authorNmByCd]);

  // async로 edges가 로드된 뒤에도 노드가 화면에 들어오도록 재-fit
  useEffect(() => {
    if (!rf) return;
    if (!flowNodes || flowNodes.length === 0) return;
    // padding 약간만 두고 즉시 반영
    rf.fitView({ padding: 0.2, duration: 0 });
  }, [rf, flowNodes]);

  const flowEdges = useMemo(() => {
    return edges
      .filter((e) => e.upperAuthorCd && e.lowerAuthorCd)
      .map((e, idx) => ({
        id: `${e.upperAuthorCd}-${e.lowerAuthorCd}-${idx}`,
        source: e.upperAuthorCd,
        target: e.lowerAuthorCd,
        animated: true,
        type: "deleteEdge",
        style: { stroke: "#94a3b8" },
        data: { relation: e },
      }));
  }, [edges]);

  const edgeTypes = useMemo(() => {
    // 엣지 가운데 x 버튼으로 삭제
    const DeleteEdge = (props: EdgeProps<any>) => {
      const rel: RelationEdge | undefined = props.data?.relation;
      const [edgePath] = getBezierPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
      });

      const midX = (props.sourceX + props.targetX) / 2;
      const midY = (props.sourceY + props.targetY) / 2;

      return (
        <>
          <BaseEdge path={edgePath} style={props.style} />
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
                pointerEvents: "all",
              }}
            >
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (rel) handleDeleteEdge(rel);
                }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 2,
                  border: "1px solid #94a3b8",
                  background: "#6b7280",
                  color: "#fff",
                  fontSize: 13,
                  lineHeight: "24px",
                  cursor: "pointer",
                }}
                aria-label={i18nText.ariaDeleteRelation}
              >
                x
              </button>
            </div>
          </EdgeLabelRenderer>
        </>
      );
    };

    return { deleteEdge: DeleteEdge };
  }, [handleDeleteEdge, i18nText]);

  const findNodeAt = useCallback(
    (flowPos: { x: number; y: number }) => {
      // 노드는 position 기반이므로, style width/height를 기준으로 박스 hit-test
      // 드롭 위치가 애매한 문제를 줄이기 위해 약간 더 큰 히트 박스를 사용합니다.
      const HIT_PADDING_X = 24;
      const HIT_PADDING_Y = 18;
      return (flowNodes as any[]).find((n) => {
        const left = n.position.x;
        const top = n.position.y;
        return (
          flowPos.x >= left - HIT_PADDING_X &&
          flowPos.x <= left + NODE_WIDTH + HIT_PADDING_X &&
          flowPos.y >= top - HIT_PADDING_Y &&
          flowPos.y <= top + NODE_HEIGHT + HIT_PADDING_Y
        );
      })?.id as string | undefined;
    },
    [flowNodes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const lowerCd =
        e.dataTransfer.getData("application/authorCd") ||
        e.dataTransfer.getData("text/plain") ||
        e.dataTransfer.getData("authorCd");
      if (!lowerCd) return;
      if (!rf) return;

      const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const upperCd = pendingDropUpper || findNodeAt(pos);
      if (!upperCd) return;
      if (upperCd === lowerCd) return;

      const q = new URLSearchParams({
        cmpnyCd,
        upperAuthorCd: upperCd,
        lowerAuthorCd: lowerCd,
      });
      EgovNet.requestFetch(
        `/cmmnAuthor/hierarchy?${q.toString()}`,
        { method: "POST", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            loadEdges();
            loadUnmapped();
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnSave);
          }
        },
        () => alert(i18nText.msgErrorOnSave)
      );
    },
    [rf, pendingDropUpper, findNodeAt, cmpnyCd, loadEdges, loadUnmapped, i18nText.msgErrorOnSave]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!rf) return;
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const upperCd = findNodeAt(pos) || null;
    setPendingDropUpper(upperCd);
    e.dataTransfer.dropEffect = "move";
  }, [rf, findNodeAt]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="md-form-card md-form-card--panel">
        <div className="system-subtitle" style={{ marginBottom: 8 }}>
          {i18nText.titleStructureRelation}
        </div>

        <div
          ref={reactFlowWrapRef}
          style={{
            marginTop: 0,
            height: 420,
            minHeight: 420,
            overflow: "hidden",
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            position: "relative",
          }}
        >
          {/* 디버그: 데이터 로딩이 되었는지 확인 */}
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
            edges: {edges.length} / nodes: {flowNodes.length}
          </div>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges as any}
            edgeTypes={edgeTypes as any}
            nodesDraggable={false}
            zoomOnScroll
            fitView
            onInit={(instance) => setRf(instance)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ width: "100%", height: "100%" }}
          >
            <Background gap={24} size={1} color="#f1f5f9" />
            <Controls />
            <MiniMap nodeStrokeColor="#94a3b8" nodeColor="#e2e8f0" />
          </ReactFlow>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="md-form-card md-form-card--panel">
          <div
            style={{
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div className="system-subtitle" style={{ marginBottom: 0 }}>
              {i18nText.titleAuthList}
            </div>
            <div style={{ color: "#64748b", fontSize: 12 }}>
              {i18nText.subtitleStructureDragHint}
            </div>
          </div>

          <div className="board_list md-admin-list board_list--flat">
            <div className="head">
              <span>{i18nText.labelAuthCode}</span>
              <span>{i18nText.labelAuthName}</span>
              <span>{i18nText.labelAuthDesc}</span>
            </div>

            <div className="result">
              {authors.length === 0 ? (
                <p className="no_data">{i18nText.msgNoData}</p>
              ) : (
                authors.map((r) => (
                  <div
                    key={`all-${r.authorCd}`}
                    className="list_item"
                    draggable
                    onDragStart={(ev) => {
                      ev.dataTransfer.setData("application/authorCd", r.authorCd);
                      ev.dataTransfer.setData("text/plain", r.authorCd);
                      ev.dataTransfer.effectAllowed = "move";
                    }}
                    style={{ cursor: "grab" }}
                    title={i18nText.titleDraggableAuthorRow}
                  >
                    <div>{r.authorCd}</div>
                    <div>{r.authorNm}</div>
                    <div title={r.authorCn}>{r.authorCn ?? ""}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md-form-card md-form-card--panel">
          <div className="system-subtitle" style={{ marginBottom: 8 }}>
            {i18nText.titleUnmappedAuthorList}
          </div>

          <div className="board_list md-admin-list board_list--flat">
            <div className="head">
              <span>{i18nText.labelAuthCode}</span>
              <span>{i18nText.labelAuthName}</span>
              <span>{i18nText.labelDescription}</span>
            </div>

            <div className="result">
              {unmapped.length === 0 ? (
                <p
                  className="no_data"
                  style={{
                    margin: 0,
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  {i18nText.msgNoData}
                </p>
              ) : (
                unmapped.map((r) => (
                  <div key={r.authorCd} className="list_item">
                    <div>{r.authorCd}</div>
                    <div>{r.authorNm}</div>
                    <div title={r.authorCn}>{r.authorCn ?? ""}</div>
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

export default CmmnAuthorStructureTab;

