import * as EgovNet from "@/api/egovFetch";
import { getSessionItem } from "@/utils/storage";

/**
 * 백엔드 CmmnMessageMapper.selectCompanyList (로그인 사용자 기준 회사 옵션)
 * Message / Group / Author 컨트롤러 모두 동일 SQL·동일 응답 구조.
 */
export const COMPANY_LIST_API_PATH = "/cmmnMessage/companies";

export type CompanyOption = { cmpnyCd: string; cmpnyNm: string };

export function normalizeCompanyListResponse(raw: unknown): CompanyOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((c: { cmpnyCd?: string | number; cmpnyNm?: string }) => ({
    cmpnyCd: String(c?.cmpnyCd ?? ""),
    cmpnyNm: String(c?.cmpnyNm ?? ""),
  }));
}

/** 목록/검색 콤보: 세션(selectedCmpnyCd)이 목록에 있으면 우선, 아니면 첫 회사 */
export function resolveCmpnyCdSessionDefault(list: CompanyOption[]): string {
  if (list.length < 1) return "";
  const saved = getSessionItem("selectedCmpnyCd");
  const savedStr = saved != null ? String(saved).trim() : "";
  if (savedStr && list.some((c) => String(c.cmpnyCd) === savedStr)) return savedStr;
  return list[0].cmpnyCd;
}

/**
 * 등록 폼(권한·그룹 등): 회사가 1개면 그 코드,
 * 여러 개면 세션이 목록에 있으면 세션, 아니면 첫 번째
 */
export function resolveCmpnyCdForFormCreate(list: CompanyOption[]): string {
  if (list.length < 1) return "";
  if (list.length === 1) return list[0].cmpnyCd;
  return resolveCmpnyCdSessionDefault(list);
}

export function fetchCompanyList(onSuccess: (list: CompanyOption[]) => void, onError?: () => void): void {
  EgovNet.requestFetch(
    COMPANY_LIST_API_PATH,
    { method: "GET", headers: { "Content-type": "application/json" } },
    (resp) => {
      onSuccess(normalizeCompanyListResponse(resp?.result));
    },
    onError ?? (() => {})
  );
}
