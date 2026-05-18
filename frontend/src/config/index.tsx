/** dev(.env.development)는 VITE_APP_EGOV_CONTEXT_URL, prod 샘플은 VITE_EGOV_CONTEXT_URL 사용 */
const EGOV_CONTEXT_HOST =
  (import.meta.env.VITE_APP_EGOV_CONTEXT_URL as string | undefined) ||
  (import.meta.env.VITE_EGOV_CONTEXT_URL as string | undefined) ||
  "localhost:8080";

export const SERVER_URL = `http://${EGOV_CONTEXT_HOST}`; // REST API 서버 Domain URL

