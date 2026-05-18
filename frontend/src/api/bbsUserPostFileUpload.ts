import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";

/** POST /bbs/main/post/file/upload 응답 result (게시글 첨부·프로필 등 공통) */
export type BbsMainPostFileUploadRow = {
  fileSq: string;
  fileSqDisplay?: string;
  fileNm?: string;
  mimeTy?: string;
  fileSize?: number;
};

/**
 * 프로필 사진 전용 업로드(CM_FILE FILE_TY=PROFILE).
 * 내 프로필·시스템관리 사용자관리에서 사용.
 */
export function uploadProfileFile(
  file: File,
  onSuccess: (row: BbsMainPostFileUploadRow) => void,
  onError?: (message?: string) => void
): void {
  const fd = new FormData();
  fd.append("file", file);
  EgovNet.requestFetch(
    "/bbs/main/profile/file/upload",
    { method: "POST", body: fd, credentials: "include" },
    (resp: { resultCode?: number | string; result?: BbsMainPostFileUploadRow; resultMessage?: string }) => {
      if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS) && resp?.result?.fileSq) {
        onSuccess(resp.result as BbsMainPostFileUploadRow);
      } else {
        const msg = resp?.resultMessage || "파일 업로드에 실패했습니다.";
        if (onError) onError(msg);
        else alert(msg);
      }
    },
    () => {
      if (onError) onError();
      else alert("파일 업로드에 실패했습니다.");
    }
  );
}

/**
 * 사용자 게시판 글쓰기(BbsUserWrite)와 동일한 파일 업로드.
 * FormData + POST /bbs/main/post/file/upload, credentials include, 헤더는 requestFetch 가 처리.
 */
export function uploadBbsMainPostFile(
  file: File,
  onSuccess: (row: BbsMainPostFileUploadRow) => void,
  onError?: (message?: string) => void
): void {
  const fd = new FormData();
  fd.append("file", file);
  EgovNet.requestFetch(
    "/bbs/main/post/file/upload",
    { method: "POST", body: fd, credentials: "include" },
    (resp: { resultCode?: number | string; result?: BbsMainPostFileUploadRow; resultMessage?: string }) => {
      if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS) && resp?.result?.fileSq) {
        onSuccess(resp.result as BbsMainPostFileUploadRow);
      } else {
        const msg = resp?.resultMessage || "파일 업로드에 실패했습니다.";
        if (onError) onError(msg);
        else alert(msg);
      }
    },
    () => {
      if (onError) onError();
      else alert("파일 업로드에 실패했습니다.");
    }
  );
}
