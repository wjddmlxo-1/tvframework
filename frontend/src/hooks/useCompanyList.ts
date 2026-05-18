import { useCallback, useEffect, useState } from "react";

import {
  fetchCompanyList,
  resolveCmpnyCdSessionDefault,
  type CompanyOption,
} from "@/api/companyList";
import { setSessionItem } from "@/utils/storage";

export type { CompanyOption };

/**
 * 회사코드/회사명 콤보 공통: API 한 곳(COMPANY_LIST_API_PATH) + 세션 기본값
 */
export function useCompanyList() {
  const [companyList, setCompanyList] = useState<CompanyOption[]>([]);
  const [cmpnyCd, setCmpnyCd] = useState("");

  const loadCompanies = useCallback(() => {
    fetchCompanyList(
      (list) => {
        setCompanyList(list);
        if (list.length >= 1) {
          const next = resolveCmpnyCdSessionDefault(list);
          setCmpnyCd(next);
          /* 세션에 회사코드가 없으면 헤더 언어(/cmmnMessage/languages)가 빈 목록 — 초기값도 저장·알림 */
          setSessionItem("selectedCmpnyCd", next);
          window.dispatchEvent(new CustomEvent("app:companyChanged"));
        }
      },
      () => setCompanyList([])
    );
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const onCompanyChange = useCallback((v: string) => {
    setCmpnyCd(v);
    setSessionItem("selectedCmpnyCd", v);
    window.dispatchEvent(new CustomEvent("app:companyChanged"));
  }, []);

  return { companyList, cmpnyCd, setCmpnyCd, loadCompanies, onCompanyChange };
}
