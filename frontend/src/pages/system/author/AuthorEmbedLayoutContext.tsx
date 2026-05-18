import { createContext, useContext } from "react";

/** 통합 권한관리: 우측 입력폼(권한설명 포함) 높이(px) — 좌측 목록 테이블 높이 맞춤용 */
export const AuthorEmbedFormHeightContext = createContext<number | null>(null);

export function useAuthorEmbedFormHeight() {
  return useContext(AuthorEmbedFormHeightContext);
}
