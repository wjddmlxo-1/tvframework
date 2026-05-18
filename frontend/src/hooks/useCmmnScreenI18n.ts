import { useCallback, useEffect, useState } from "react";

import * as EgovNet from "@/api/egovFetch";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageCodeForApi } from "@/utils/language";

type KeyMap = Readonly<Record<string, string>>;

/**
 * 다국어관리 화면과 동일 패턴: `I18N_KEYS`(슬롯 → LANG_KEY) + 한글 폴백 후 `/cmmnMessage/texts` 일괄 조회.
 */
export function useCmmnScreenI18n<T extends KeyMap>(
  i18nKeys: T,
  fallback: { [K in keyof T]: string },
  options?: { cmpnyCd?: string | null }
): { [K in keyof T]: string } {
  const { langGb } = useLanguage();
  const cmpnyCd = options?.cmpnyCd;

  const [text, setText] = useState<{ [K in keyof T]: string }>(() => ({ ...fallback }));

  const fetchBatch = useCallback(() => {
    const langKeys = Object.values(i18nKeys);
    const params = new URLSearchParams();
    langKeys.forEach((k) => params.append("langKeys", k));
    params.set("langCode", getLanguageCodeForApi(langGb || "ko_KR"));
    if (cmpnyCd) params.set("cmpnyCd", String(cmpnyCd));
    return new Promise<Record<string, string>>((resolve) => {
      EgovNet.requestFetch(
        `/cmmnMessage/texts?${params.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          const raw = resp?.result;
          if (raw != null && typeof raw === "object" && !Array.isArray(raw)) {
            resolve(raw as Record<string, string>);
          } else {
            resolve({});
          }
        },
        () => resolve({})
      );
    });
  }, [cmpnyCd, langGb, i18nKeys]);

  useEffect(() => {
    let active = true;
    fetchBatch().then((byLangKey) => {
      if (!active) return;
      setText((prev) => {
        const next = { ...prev };
        (Object.entries(i18nKeys) as [keyof T, string][]).forEach(([slot, langKey]) => {
          const v = byLangKey[langKey];
          if (v != null && String(v).trim() !== "") {
            next[slot] = String(v).trim();
          }
        });
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [fetchBatch, i18nKeys]);

  return text;
}
