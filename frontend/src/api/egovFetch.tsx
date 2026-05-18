import { SERVER_URL } from "../config";

import URL from "@/constants/url";
import CODE from "@/constants/code";
import { getSessionItem, setSessionItem } from "@/utils/storage";
import { CMMN_LOGIN_PORTAL_I18N_FALLBACK } from "@/pages/login/cmmnLoginAuthI18n";

/** 세션 만료 시 alert/redirect를 한 번만 수행하기 위한 플래그 */
let sessionExpiryHandled = false;

/** 쿼리스트링 생성 (레거시 호환 — 객체 값은 문자열로 결합) */
export function getQueryString(params: Record<string, unknown>): string {
  return `?${Object.entries(params)
    .map((e) => e.join("="))
    .join("&")}`;
}

function isFormDataBody(body: RequestInit["body"]): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

/** fetch RequestInit 에 넣으면 안 되는 비표준 필드 제거 (origin 등) */
function toFetchInit(init: RequestInit & { origin?: string }): RequestInit {
  const { origin: _drop, ...rest } = init;
  void _drop;
  return rest;
}

export function requestFetch(
  url: string,
  requestOptions: RequestInit,
  handler?: (resp: any) => void,
  errorHandler?: (error: any) => void
) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isAuthScreen =
    currentPath === URL.LOGIN ||
    currentPath === URL.SNS_NAVER_CB ||
    currentPath === URL.SNS_KAKAO_CB ||
    currentPath === URL.MYPAGE_CREATE;
  console.groupCollapsed("requestFetch");
  console.log("requestFetch [URL] : ", SERVER_URL + url);
  console.log("requestFetch [requestOption] : ", requestOptions);

  // 로그인 시 JWT를 Authorization 헤더에 설정 (백엔드에서 로그인 사용자 인식)
  const sessionUser = getSessionItem("loginUser");
  const sessionUserId = sessionUser?.id ?? null;
  const jToken = getSessionItem("jToken");

  let merged: RequestInit & { origin?: string } = { ...requestOptions };

  if (sessionUserId != null && sessionUserId !== "" && jToken) {
    const headers = new Headers();
    if (requestOptions.headers != null) {
      try {
        const h = new Headers(requestOptions.headers as HeadersInit);
        h.forEach((value, key) => {
          headers.set(key, value);
        });
      } catch {
        /* ignore invalid headers */
      }
    }
    headers.set("Authorization", jToken);
    // multipart(FormData): Content-Type 을 임의로 두면 boundary 가 없어 업로드가 실패하거나
    // 서버가 비JSON/HTML을 돌려 response.json() 이 조용히 실패할 수 있음 → 브라우저가 boundary 포함 Content-Type 설정
    if (isFormDataBody(requestOptions.body)) {
      headers.delete("Content-Type");
    }
    merged = { ...merged, headers };
  } else if (isFormDataBody(requestOptions.body) && requestOptions.headers != null) {
    try {
      const headers = new Headers(requestOptions.headers as HeadersInit);
      headers.delete("Content-Type");
      merged = { ...merged, headers };
    } catch {
      merged = { ...merged };
    }
  }

  //CORS ISSUE 로 인한 조치 - origin 및 credentials 추가
  // origin 추가 (fetch 표준이 아니므로 실제 fetch 에는 넣지 않음 — 아래 toFetchInit 에서 제거)
  if (!merged["origin"]) {
    merged = { ...merged, origin: SERVER_URL };
  }
  // credentials 추가
  if (!merged["credentials"]) {
    merged = { ...merged, credentials: "include" };
  }

  const fetchInit = toFetchInit(merged);

  fetch(SERVER_URL + url, fetchInit)
    .then(async (response) => {
      if (response.status === 401) {
        return { resultCode: CODE.RCV_ERROR_AUTH };
      }
      const text = await response.text();
      const trimmed = (text ?? "").trim();
      if (!trimmed) {
        throw new Error(`빈 응답 (HTTP ${response.status})`);
      }
      try {
        return JSON.parse(trimmed) as Record<string, unknown>;
      } catch {
        throw new Error(
          `JSON이 아닌 응답 (HTTP ${response.status}): ${trimmed.slice(0, 200)}${trimmed.length > 200 ? "…" : ""}`
        );
      }
    })
    .then((resp) => {
      if (Number(resp?.resultCode) === Number(CODE.RCV_ERROR_AUTH)) {
        // 로그인/회원가입 화면에서는 세션만 정리하고 Alert/리다이렉트 루프를 막는다.
        if (isAuthScreen) {
          sessionStorage.setItem("loginUser", JSON.stringify({ id: "" }));
          setSessionItem("jToken", null);
          return false;
        }
        if (!sessionExpiryHandled) {
          sessionExpiryHandled = true;
          alert(CMMN_LOGIN_PORTAL_I18N_FALLBACK.msgLoginRequiredPath);
          sessionStorage.setItem("loginUser", JSON.stringify({ id: "" }));
          setSessionItem("jToken", null);
          window.location.href = URL.LOGIN;
        }
        return false;
      } else {
        return resp;
      }
    })
    .then((resp) => {
      console.groupCollapsed("requestFetch.then()");
      console.log("requestFetch [response] ", resp);
      if (typeof handler === "function") {
        handler(resp);
      } else {
        console.log("egov fetch handler not assigned!");
      }
      console.groupEnd("requestFetch.then()");
    })
    .catch((error) => {
      console.error("There was an error!", error);
      if (error === "TypeError: Failed to fetch") {
        alert(CMMN_LOGIN_PORTAL_I18N_FALLBACK.msgServerConnectionError);
      }

      if (typeof errorHandler === "function") {
        errorHandler(error);
      } else {
        console.error("egov error handler not assigned!");
        alert(`ERR : ${(error as Error).message}`);
      }
    })
    .finally(() => {
      console.log("requestFetch finally end");
      console.groupEnd("requestFetch");
    });
}
