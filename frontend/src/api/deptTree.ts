import * as EgovNet from "@/api/egovFetch";

/** 부서 트리 API 응답 항목 (공통) */
export type DeptTreeItem = {
  deptCd: string;
  deptNm: string;
  upperDeptCd: string;
  treeLevel: number;
  path?: string;
};

export type DeptTreeHierarchyNode = DeptTreeItem & { children?: DeptTreeHierarchyNode[] };

/** 부서 트리 로딩 시 2레벨까지 펼칠 노드 ID 집합 */
export function expandDeptTreeToLevel2(flat: { deptCd: string; treeLevel: number }[]): Set<string> {
  return new Set((flat || []).filter((n) => n.treeLevel <= 2).map((n) => n.deptCd));
}

/** flat 부서 목록을 계층 트리로 변환 */
export function buildDeptHierarchy(flat: DeptTreeItem[]): DeptTreeHierarchyNode[] {
  const byUpper = new Map<string, DeptTreeItem[]>();
  flat.forEach((node) => {
    const key = node.upperDeptCd == null || node.upperDeptCd === "" || node.upperDeptCd === "#" ? "#" : node.upperDeptCd;
    if (!byUpper.has(key)) byUpper.set(key, []);
    byUpper.get(key)!.push(node);
  });
  const build = (upperKey: string): DeptTreeHierarchyNode[] => {
    const list = byUpper.get(upperKey) || [];
    return list.map((n) => ({ ...n, children: build(n.deptCd) }));
  };
  return build("#");
}

/**
 * 부서 트리 조회 (공통)
 * - 그룹관리 부서탭, 권한관리 부서탭, 사용자관리 부서명 팝업, 사용자관리 부서관리 탭 왼쪽 트리에서 공통 사용
 */
export function fetchDeptTree(
  cmpnyCd: string,
  langGb: string,
  onSuccess: (list: DeptTreeItem[]) => void,
  onError?: () => void
): void {
  if (!cmpnyCd) {
    onSuccess([]);
    return;
  }
  const lang = langGb || "ko_KR";
  EgovNet.requestFetch(
    `/cmmnGroup/deptTree?cmpnyCd=${encodeURIComponent(cmpnyCd)}&langGb=${encodeURIComponent(lang)}`,
    { method: "GET", headers: { "Content-type": "application/json" } },
    (resp) => {
      if (resp?.result && Array.isArray(resp.result)) {
        onSuccess(resp.result as DeptTreeItem[]);
      } else {
        onSuccess([]);
      }
    },
    onError ?? (() => onSuccess([]))
  );
}
