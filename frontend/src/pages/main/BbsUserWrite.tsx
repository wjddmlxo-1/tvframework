import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import { uploadBbsMainPostFile } from "@/api/bbsUserPostFileUpload";
import CODE from "@/constants/code";
import { SERVER_URL } from "@/config";
import URL from "@/constants/url";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { getLanguageCodeForApi } from "@/utils/language";
import { getSessionItem } from "@/utils/storage";
import {
  CMMN_BBS_USER_I18N_FALLBACK,
  CMMN_BBS_USER_I18N_KEYS,
  replaceI18nPlaceholders,
} from "@/pages/main/cmmnBbsUserI18n";

type BoardMaster = {
  bbsNm?: string;
  atchmnflFl?: string;
  noticeFl?: string;
  /** CM_BBS.ENFRC_SECRET_FL — 비밀글 옵션 */
  enfrcSecretFl?: string;
  /** CM_BBS.ANONYMOUS_FL — 작성자 익명화(표시) */
  anonymousFl?: string;
  resveFl?: string;
  categoryFl?: string;
  maxFileSize?: number;
  maxFileCount?: number;
  permExtsn?: string;
  fileAtchPosblAt?: string;
  posblAtchFileNumber?: number;
  posblAtchFileSize?: number;
};
type CategoryRow = {
  categorySq: string;
  categoryNm?: string;
};
type UploadedFileRow = {
  fileSq: string;
  fileSqDisplay?: string;
  fileNm?: string;
  mimeTy?: string;
  fileSize?: number;
};

type BbsUserWriteProps = {
  embedded?: boolean;
  initialBbsId?: string;
  /** 게시판 설정 LAYOUT_TY (LIST/CARD/ALBUM). 임베드 시 목록에서 전달 */
  boardLayoutTy?: string;
  /** 지정 시 해당 글 수정(PUT /bbs/main/post) */
  editNttSq?: string;
  /** 지정 시 해당 게시글에 대한 답변 작성(POST /bbs/main/post) */
  parentNttSq?: string;
  onDone?: (nttSq?: string) => void;
  onCancel?: () => void;
};

function isAlbumLayoutTy(ty?: string) {
  const u = (ty || "").toUpperCase();
  return u.includes("ALBUM") || u.includes("GALLERY") || u.includes("GRID");
}

/** 목록·상세와 동일한 제목 엔티티 디코딩 */
function decodeHtmlEntities(s: string): string {
  if (!s) return s;
  const ta = document.createElement("textarea");
  ta.innerHTML = s;
  return ta.value;
}

function parseYn(v: unknown, def = false) {
  if (v == null) return def;
  const s = String(v).trim().toUpperCase();
  if (!s) return def;
  return s === "Y" || s === "TRUE" || s === "1";
}

/** CM_NTT/MyBatis DATE_FORMAT 'yyyyMMddHHmmss' → datetime-local 값 */
function compactDateTimeToDatetimeLocal(compact: string): string {
  const c = String(compact || "").replace(/\D/g, "");
  if (c.length < 12) return "";
  const y = c.slice(0, 4);
  const mo = c.slice(4, 6);
  const d = c.slice(6, 8);
  const h = c.slice(8, 10);
  const mi = c.slice(10, 12);
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

export default function BbsUserWrite(props: BbsUserWriteProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { langGb } = useLanguage();
  const langCode = getLanguageCodeForApi(langGb);
  const bbsId = (props.initialBbsId || searchParams.get("bbsId") || "").trim();
  const parentNttSq = (props.parentNttSq || searchParams.get("parentNttSq") || "").trim();
  const cmpnyCd = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const i18nText = useCmmnScreenI18n(CMMN_BBS_USER_I18N_KEYS, CMMN_BBS_USER_I18N_FALLBACK, { cmpnyCd });

  const [masterBoard, setMasterBoard] = useState<BoardMaster>({});
  const [resolvedLayoutTy, setResolvedLayoutTy] = useState<string | undefined>(props.boardLayoutTy);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [categorySq, setCategorySq] = useState("");
  const [noticeAt, setNoticeAt] = useState(false);
  const [secretAt, setSecretAt] = useState(false);
  const [resveAt, setResveAt] = useState(false);
  const [ntceBgndeView, setNtceBgndeView] = useState("");
  const [ntceEnddeView, setNtceEnddeView] = useState("");
  const [nttSj, setNttSj] = useState("");
  const [nttCn, setNttCn] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // 게시판 설정값 기준으로만 노출한다.
  const useCategory = parseYn(masterBoard.categoryFl, false);
  const useNotice = parseYn(masterBoard.noticeFl, false);
  const useSecret = parseYn(masterBoard.enfrcSecretFl, false);
  const useReserve = parseYn(masterBoard.resveFl, false);
  const useAttach = parseYn(masterBoard.atchmnflFl ?? masterBoard.fileAtchPosblAt, false);
  const maxFileCountRaw = Number(masterBoard.maxFileCount ?? masterBoard.posblAtchFileNumber);
  const maxFileSizeMbRaw = Number(masterBoard.maxFileSize ?? masterBoard.posblAtchFileSize);
  const maxFileCount = Number.isFinite(maxFileCountRaw) && maxFileCountRaw > 0 ? Math.floor(maxFileCountRaw) : 0;
  const maxFileBytes = Number.isFinite(maxFileSizeMbRaw) && maxFileSizeMbRaw > 0 ? Math.floor(maxFileSizeMbRaw * 1024 * 1024) : 0;
  const attachPolicyValid = !useAttach || (maxFileCount > 0 && maxFileBytes > 0);
  const allowedExts = String(masterBoard.permExtsn || "")
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);

  useEffect(() => {
    if (!bbsId) {
      alert(i18nText.msgNoBoardInfo);
      if (props.embedded) {
        props.onCancel?.();
      } else {
        navigate(URL.MAIN_BBS);
      }
      return;
    }
    if (!cmpnyCd) {
      alert(i18nText.msgNoTenant);
      if (props.embedded) {
        props.onCancel?.();
      } else {
        navigate(`${URL.MAIN_BBS}?bbsId=${encodeURIComponent(bbsId)}`);
      }
      return;
    }
    const dq = new URLSearchParams({ cmpnyCd, bbsId, langCode });
    EgovNet.requestFetch(
      `/bbs/detail?${dq.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { result?: BoardMaster }) => {
        const master = resp?.result || {};
        setMasterBoard(master);
        const q = new URLSearchParams({ cmpnyCd, bbsId });
        EgovNet.requestFetch(
          `/bbs/main/categories?${q.toString()}`,
          { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
          (cResp: { result?: CategoryRow[] }) => {
            const list = Array.isArray(cResp?.result) ? cResp.result : [];
            setCategories(list);
          },
          () => setCategories([])
        );
      },
      () => {
        alert(i18nText.msgLoadBoardFail);
        if (props.embedded) {
          props.onCancel?.();
        } else {
          navigate(`${URL.MAIN_BBS}?bbsId=${encodeURIComponent(bbsId)}`);
        }
      }
    );
  }, [bbsId, cmpnyCd, langCode, navigate, props.embedded, props.onCancel]);

  useEffect(() => {
    if (props.boardLayoutTy) {
      setResolvedLayoutTy(props.boardLayoutTy);
    }
  }, [props.boardLayoutTy]);

  useEffect(() => {
    const esq = (props.editNttSq || "").trim();
    if (!esq || !cmpnyCd || !bbsId) {
      return;
    }
    const q = new URLSearchParams({ cmpnyCd, bbsId, nttSq: esq, langCode });
    EgovNet.requestFetch(
      `/bbs/main/post/detail?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: {
        resultCode?: number;
        result?: {
          title?: string;
          titlePlain?: string;
          contents?: string;
          noticeYn?: string;
          nttSttus?: string;
          categorySq?: string;
          ntceBgnde?: string | null;
          ntceEndde?: string | null;
        };
      }) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        const d = ok ? resp?.result : null;
        if (!d) return;
        const plain = String(d.titlePlain ?? "").trim();
        setNttSj(decodeHtmlEntities(plain || d.title || ""));
        setNttCn(d.contents || "");
        setNoticeAt((d.noticeYn || "N") === "Y");
        setSecretAt((d.nttSttus || "PUBLIC").toUpperCase() === "SECRET");
        setCategorySq(String(d.categorySq ?? "").trim());
        const bgnde = String(d.ntceBgnde ?? "").trim();
        const endde = String(d.ntceEndde ?? "").trim();
        const noticeY = (d.noticeYn || "N") === "Y";
        const noticeAutoPeriod = noticeY && endde.startsWith("9999");
        if (!noticeAutoPeriod && (bgnde || endde)) {
          setResveAt(true);
          setNtceBgndeView(compactDateTimeToDatetimeLocal(bgnde));
          setNtceEnddeView(compactDateTimeToDatetimeLocal(endde));
        } else {
          setResveAt(false);
          setNtceBgndeView("");
          setNtceEnddeView("");
        }
      },
      () => {}
    );
    const fq = new URLSearchParams({ cmpnyCd, bbsId, nttSq: esq });
    EgovNet.requestFetch(
      `/bbs/main/post/files?${fq.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: UploadedFileRow[] }) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        setUploadedFiles(ok && Array.isArray(resp?.result) ? resp.result : []);
      },
      () => setUploadedFiles([])
    );
  }, [props.editNttSq, cmpnyCd, bbsId, langCode]);

  useEffect(() => {
    if (props.boardLayoutTy || !cmpnyCd || !bbsId) return;
    const q = new URLSearchParams({ cmpnyCd, langCode });
    EgovNet.requestFetch(
      `/bbs/main/boards?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" }, credentials: "include" },
      (resp: { resultCode?: number; result?: Array<{ bbsId: string; layoutTy?: string }> }) => {
        const ok = Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS);
        const rows = ok && Array.isArray(resp?.result) ? resp.result : [];
        const hit = rows.find((r) => r.bbsId === bbsId);
        setResolvedLayoutTy(hit?.layoutTy);
      },
      () => setResolvedLayoutTy(undefined)
    );
  }, [props.boardLayoutTy, cmpnyCd, bbsId, langCode]);

  const save = () => {
    if (saving) return;
    if (!cmpnyCd) {
      alert(i18nText.msgNoTenant);
      return;
    }
    const toCompactDateTime = (v: string) => `${(v || "").replace(/[-:T]/g, "")}00`;
    const nowCompact = () => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
    };
    if (!nttSj.trim() || !nttCn.trim()) {
      alert(i18nText.msgRequiredTitleContents);
      return;
    }
    if (isAlbumLayoutTy(resolvedLayoutTy)) {
      const imageFiles = uploadedFiles.filter((f) => (f.mimeTy || "").toLowerCase().startsWith("image/"));
      if (imageFiles.length === 0) {
        alert(i18nText.msgAlbumNeedsImage);
        return;
      }
    }
    if (!useAttach && uploadedFiles.length > 0) {
      alert(i18nText.msgAttachDisabled);
      return;
    }
    if (useAttach) {
      if (!attachPolicyValid) {
        alert(i18nText.msgAttachPolicyInvalid);
        return;
      }
      if (uploadedFiles.length > maxFileCount) {
        alert(replaceI18nPlaceholders(i18nText.msgAttachCountMax, { max: maxFileCount }));
        return;
      }
      for (const f of uploadedFiles) {
        const size = Number(f.fileSize || 0);
        if (size > 0 && size > maxFileBytes) {
          alert(replaceI18nPlaceholders(i18nText.msgAttachEachMax, { max: Math.floor(maxFileBytes / 1024 / 1024) }));
          return;
        }
        if (allowedExts.length > 0) {
          const ext = String(f.fileNm || "").split(".").pop()?.toLowerCase().trim() || "";
          if (!ext || !allowedExts.includes(ext)) {
            alert(replaceI18nPlaceholders(i18nText.msgAllowedExtOnly, { exts: allowedExts.join(", ") }));
            return;
          }
        }
      }
    }
    let contents = nttCn.trim();
    if (uploadedFiles.length > 0) contents = `${contents}`;
    const payload: Record<string, unknown> = {
      cmpnyCd,
      bbsId,
      title: nttSj.trim(),
      contents,
      noticeAt: useNotice && noticeAt ? "Y" : "N",
      nttSttus: useSecret && secretAt ? "SECRET" : "PUBLIC",
    };
    if (!props.editNttSq && parentNttSq) payload.parentNttSq = parentNttSq;
    if (useCategory && categorySq) payload.categorySq = categorySq;
    if (useReserve && resveAt) {
      if (!ntceBgndeView && !ntceEnddeView) {
        alert(i18nText.msgReserveDateRequired);
        return;
      }
      const bgnde = ntceBgndeView ? toCompactDateTime(ntceBgndeView) : nowCompact();
      const endde = ntceEnddeView ? toCompactDateTime(ntceEnddeView) : "";
      if (endde && bgnde > endde) {
        alert(i18nText.msgReserveStartAfterEnd);
        return;
      }
      payload.ntceBgnde = bgnde;
      if (endde) payload.ntceEndde = endde;
    } else if (useNotice && noticeAt) {
      payload.ntceBgnde = nowCompact();
      payload.ntceEndde = "99991231235959";
    }
    const editSq = (props.editNttSq || "").trim();
    // 첨부는 CM_FILE에 먼저 올라간 뒤 저장 시 NTT_SQ(REFER_SQ)로 바인딩한다.
    // 수정 모드(editSq)는 빈 배열도 명시 전달하여 "첨부 전체 제거"를 구분한다.
    const fileSqsNorm = uploadedFiles
      .map((f) => String(f.fileSq ?? "").trim())
      .filter((s) => s.length > 0);
    if (editSq || fileSqsNorm.length > 0) {
      payload.fileSqs = fileSqsNorm;
    }
    if (editSq) {
      (payload as Record<string, unknown>).nttSq = editSq;
    }
    setSaving(true);
    const method = editSq ? "PUT" : "POST";
    EgovNet.requestFetch(
      "/bbs/main/post",
      { method, headers: { "Content-type": "application/json" }, body: JSON.stringify(payload), credentials: "include" },
      (resp: { resultCode?: number; resultMessage?: string; result?: string }) => {
        setSaving(false);
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          if (editSq) {
            alert(i18nText.msgPostUpdateSuccess);
            if (props.embedded) {
              props.onDone?.(editSq);
            } else {
              const next = new URLSearchParams({ bbsId, nttSq: editSq });
              navigate(`${URL.MAIN_BBS}?${next.toString()}`);
            }
          } else {
            const newNttSq = String(resp?.result || "").trim();
            alert(i18nText.msgPostCreateSuccess);
            if (props.embedded) {
              props.onDone?.(newNttSq || undefined);
            } else {
              const next = new URLSearchParams({ bbsId });
              if (newNttSq) next.set("nttSq", newNttSq);
              navigate(`${URL.MAIN_BBS}?${next.toString()}`);
            }
          }
          return;
        }
        alert(resp?.resultMessage || (editSq ? i18nText.msgPostUpdateFail : i18nText.msgPostCreateFail));
      },
      () => {
        setSaving(false);
        alert(editSq ? i18nText.msgPostUpdateFail : i18nText.msgPostCreateFail);
      }
    );
  };

  const removePost = () => {
    const editSq = (props.editNttSq || "").trim();
    if (!editSq || deleting || saving || uploading) return;
    if (!cmpnyCd || !bbsId) {
      alert(i18nText.msgNoTenant);
      return;
    }
    if (!window.confirm(i18nText.msgConfirmDeletePostInWrite)) {
      return;
    }
    setDeleting(true);
    EgovNet.requestFetch(
      "/bbs/main/post",
      {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ cmpnyCd, bbsId, nttSq: editSq }),
        credentials: "include",
      },
      (resp: { resultCode?: number; resultMessage?: string }) => {
        setDeleting(false);
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgPostDeleteSuccess);
          if (props.embedded) {
            props.onDone?.();
          } else {
            navigate(`${URL.MAIN_BBS}?bbsId=${encodeURIComponent(bbsId)}`);
          }
          return;
        }
        alert(resp?.resultMessage || i18nText.msgPostDeleteFail);
      },
      () => {
        setDeleting(false);
        alert(i18nText.msgPostDeleteFail);
      }
    );
  };

  const uploadFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || uploading) return;
    const list = Array.from(files);
    const run = async () => {
      setUploading(true);
      let currentCount = uploadedFiles.length;
      for (const f of list) {
        if (!useAttach) {
          alert(i18nText.msgAttachDisabled);
          break;
        }
        if (!attachPolicyValid) {
          alert(i18nText.msgAttachPolicyInvalid);
          break;
        }
        if (currentCount >= maxFileCount) {
          alert(replaceI18nPlaceholders(i18nText.msgAttachCountMax, { max: maxFileCount }));
          break;
        }
        if (f.size > maxFileBytes) {
          alert(replaceI18nPlaceholders(i18nText.msgAttachEachMax, { max: Math.floor(maxFileBytes / 1024 / 1024) }));
          continue;
        }
        if (allowedExts.length > 0) {
          const ext = f.name.split(".").pop()?.toLowerCase().trim() || "";
          if (!ext || !allowedExts.includes(ext)) {
            alert(replaceI18nPlaceholders(i18nText.msgAllowedExtOnly, { exts: allowedExts.join(", ") }));
            continue;
          }
        }
        await new Promise<void>((resolve) => {
          uploadBbsMainPostFile(
            f,
            (row) => {
              setUploadedFiles((prev) => [...prev, row as UploadedFileRow]);
              currentCount += 1;
              resolve();
            },
            (msg) => {
              alert(msg ?? i18nText.msgFileUploadFail);
              resolve();
            }
          );
        });
      }
      setUploading(false);
    };
    run();
  };

  const removeUploadedFile = (fileSq: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileSq !== fileSq));
  };

  const rootClass = ["bbs-user-write", props.embedded ? "bbs-user-write--embedded" : "", props.embedded ? "" : "container"].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className={props.embedded ? "" : "c_wrap"}>
        <div className="md-wrap">
            <div className="md-form-card">
            <div className="board_view2 md-program-edit-form bbs-user-write__board">
              <div className="bbs-user-write__compose">
                <section className="bbs-user-write__compose-main">
                  {props.editNttSq && (
                    <p className="bbs-user-write__mode-hint" role="status">
                      {i18nText.btnEdit} 중
                    </p>
                  )}
                  <div className="bbs-user-write__topblock">
                    <div className="bbs-user-write__topline bbs-user-write__topline--row1">
                      {useCategory && (
                      <div className="bbs-user-write__top-item">
                        <span className="bbs-user-write__top-label">{i18nText.labelBoard}</span>
                        <select className="f_select" value={categorySq} onChange={(e) => setCategorySq(e.target.value)}>
                          <option value="">{i18nText.btnCancel}</option>
                          {categories.map((c) => (
                            <option key={c.categorySq} value={c.categorySq}>
                              {c.categoryNm || c.categorySq}
                            </option>
                          ))}
                        </select>
                      </div>
                      )}
                      <div className="bbs-user-write__top-item">
                        {useNotice && (
                          <label className="md-switch md-switch--compact">
                            <input className="md-switch__input" type="checkbox" checked={noticeAt} onChange={(e) => setNoticeAt(e.target.checked)} />
                            <span className="md-switch__track" aria-hidden>
                              <span className="md-switch__thumb" />
                            </span>
                            <span className="md-switch__label">{i18nText.etcNotice}</span>
                          </label>
                        )}
                        {useSecret && (
                          <label className="md-switch md-switch--compact">
                            <input className="md-switch__input" type="checkbox" checked={secretAt} onChange={(e) => setSecretAt(e.target.checked)} />
                            <span className="md-switch__track" aria-hidden>
                              <span className="md-switch__thumb" />
                            </span>
                            <span className="md-switch__label">{i18nText.etcSecret}</span>
                          </label>
                        )}
                        {useReserve && (
                          <label className={`md-switch md-switch--compact ${!useReserve ? "md-switch--disabled" : ""}`}>
                            <input className="md-switch__input" type="checkbox" checked={resveAt} onChange={(e) => setResveAt(e.target.checked)} />
                            <span className="md-switch__track" aria-hidden>
                              <span className="md-switch__thumb" />
                            </span>
                            <span className="md-switch__label">{i18nText.labelScheduledPost}</span>
                          </label>
                        )}
                      </div>
                    </div>
                    {useReserve && (
                    <div className="bbs-user-write__topline bbs-user-write__topline--period">
                      <div className="bbs-user-write__top-item bbs-user-write__top-item--grow">
                        <span className="bbs-user-write__top-label">{i18nText.labelScheduledPost}</span>
                        <input
                          type="datetime-local"
                          className="f_input"
                          value={ntceBgndeView}
                          disabled={!resveAt}
                          onChange={(e) => setNtceBgndeView(e.target.value)}
                        />
                        <span className="bbs-user-write__period-sep">~</span>
                        <input
                          type="datetime-local"
                          className="f_input"
                          value={ntceEnddeView}
                          disabled={!resveAt}
                          onChange={(e) => setNtceEnddeView(e.target.value)}
                        />
                      </div>
                    </div>
                    )}
                  </div>
                  <div className="bbs-user-write__field">
                    <input
                      className="f_input w_full"
                      name="nttSj"
                      type="text"
                      value={nttSj}
                      onChange={(e) => setNttSj(e.target.value)}
                      maxLength={120}
                      placeholder={i18nText.placeholderWriteTitle}
                    />
                  </div>
                  <div className="bbs-user-write__body-block">
                    <div className="bbs-user-write__editor">
                      <div className="bbs-user-write__toolbar">
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarBold}>
                          B
                        </button>
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarItalic}>
                          I
                        </button>
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarUnderline}>
                          U
                        </button>
                        <span className="bbs-user-write__tool-sep" />
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarBullets}>
                          •
                        </button>
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarNumbering}>
                          1.
                        </button>
                        <span className="bbs-user-write__tool-sep" />
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarAlign}>
                          ≡
                        </button>
                        <button type="button" className="bbs-user-write__tool-btn" title={i18nText.etcToolbarLink}>
                          🔗
                        </button>
                      </div>
                      <textarea
                        className="bbs-user-write__textarea"
                        name="nttCn"
                        rows={10}
                        value={nttCn}
                        onChange={(e) => setNttCn(e.target.value)}
                        placeholder={i18nText.placeholderWriteContents}
                      />
                    </div>
                  </div>
                  {(useAttach || uploadedFiles.length > 0) && (
                  <div className="bbs-user-write__attach-block">
                    <div className="bbs-user-write__file-row bbs-user-write__file-drop">
                      {useAttach ? (
                        <input
                          type="file"
                          multiple
                          disabled={uploading || saving || !attachPolicyValid || uploadedFiles.length >= maxFileCount}
                          onChange={(e) => uploadFiles(e.target.files)}
                        />
                      ) : null}
                      <span className="bbs-user-page__muted">
                        {useAttach
                          ? uploading
                            ? i18nText.etcUploading
                            : attachPolicyValid
                              ? `${replaceI18nPlaceholders(i18nText.msgAttachCountMax, { max: maxFileCount })} ${replaceI18nPlaceholders(i18nText.msgAttachEachMax, {
                                  max: Math.floor(maxFileBytes / 1024 / 1024),
                                })}${allowedExts.length ? ` ${replaceI18nPlaceholders(i18nText.msgAllowedExtOnly, { exts: allowedExts.join(", ") })}` : ""}`
                              : i18nText.msgAttachPolicyInvalid
                          : i18nText.msgAttachDisabled}
                      </span>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <ul className="bbs-user-write__file-list">
                        {uploadedFiles.map((f) => {
                          const href = `${SERVER_URL}/bbs/main/post/file?fileSq=${encodeURIComponent(f.fileSq)}`;
                          const imageLike = (f.mimeTy || "").toLowerCase().startsWith("image/");
                          return (
                            <li key={f.fileSq} className="bbs-user-write__file-item">
                              {imageLike ? (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  <img src={href} alt={f.fileNm || f.fileSq} className="bbs-user-detail__thumb" />
                                </a>
                              ) : (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {f.fileNm || f.fileSqDisplay || f.fileSq}
                                </a>
                              )}
                              <button type="button" className="btn btn_default_h35" onClick={() => removeUploadedFile(f.fileSq)} disabled={saving || uploading}>
                                {i18nText.etcRemove}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  )}
                </section>
              </div>
              <div className="board_btn_area bbs-user-write__actions" style={{ marginTop: 14 }}>
                <div className="right_col btn1">
                  <button className="btn btn_blue_h46" onClick={save} disabled={saving || uploading || deleting}>
                    {saving ? i18nText.etcSaving : i18nText.btnSave}
                  </button>
                  {props.editNttSq && (
                    <button className="btn btn_blue_h46" onClick={removePost} disabled={saving || uploading || deleting}>
                      {deleting ? i18nText.etcDeleting : i18nText.btnDelete}
                    </button>
                  )}
                  <button
                    className="btn btn_blue_h46"
                    onClick={() => {
                      if (props.embedded) props.onCancel?.();
                      else navigate(`${URL.MAIN_BBS}?bbsId=${encodeURIComponent(bbsId)}`);
                    }}
                    disabled={saving || uploading || deleting}
                  >
                    {i18nText.btnCancel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}