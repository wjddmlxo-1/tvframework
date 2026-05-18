/**
 * 브라우저/시스템 언어를 기반으로 API용 언어코드 반환 (맨 처음 인자 없을 때 default)
 * - ko, ko-KR → ko_KR
 * - en, en-US → en_US
 * - zh-CN → zh_CN 등
 */
export function getDefaultLanguageCode(): string {
  const nav =
    typeof navigator !== "undefined"
      ? (navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage || "")
      : "";
  if (nav) {
    const normalized = nav.replace("-", "_");
    if (normalized.startsWith("ko")) return "ko_KR";
    if (normalized.startsWith("en")) return "en_US";
    if (normalized.startsWith("zh")) return normalized.length >= 5 ? normalized : "zh_CN";
    if (normalized.startsWith("ja")) return "ja_JP";
    return normalized;
  }
  return "ko_KR";
}

/**
 * 언어 목록/구분 조회 시 사용할 langCode 결정
 * - 선택된 언어(langGb)가 있으면 해당 코드 사용
 * - 없으면 브라우저 기본 언어 사용
 */
export function getLanguageCodeForApi(selectedLangGb: string | undefined): string {
  if (selectedLangGb != null && String(selectedLangGb).trim() !== "") {
    return selectedLangGb.trim();
  }
  return getDefaultLanguageCode();
}
