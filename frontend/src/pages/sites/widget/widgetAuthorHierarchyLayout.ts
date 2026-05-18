/**
 * 권한관리 > 권한구조 탭과 동일한 좌표 배치(엣지 기반 레벨링).
 */

export type AuthorRelationEdge = { upperAuthorCd: string; lowerAuthorCd: string };

const X_SPACING = 260;
const Y_SPACING = 110;

export type HierarchyNodeLayout = {
  id: string;
  position: { x: number; y: number };
};

/**
 * 엣지에 등장하는 권한코드만 레이아웃합니다. 엣지가 없으면 빈 배열.
 */
export function buildAuthorHierarchyNodeLayouts(edges: AuthorRelationEdge[]): HierarchyNodeLayout[] {
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

  const out: HierarchyNodeLayout[] = [];
  const orderedLevels = Array.from(levels.keys()).sort((a, b) => a - b);
  orderedLevels.forEach((lv) => {
    const arr = (levels.get(lv) || []).sort();
    arr.forEach((cd, idx) => {
      out.push({
        id: cd,
        position: { x: lv * X_SPACING, y: idx * Y_SPACING },
      });
    });
  });

  return out;
}

export { X_SPACING, Y_SPACING };
