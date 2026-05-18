import React, { useCallback, useEffect, useState } from "react";

import * as EgovNet from "@/api/egovFetch";
import { getLanguageCodeForApi } from "@/utils/language";
import DeptTreeView from "@/components/DeptTreeView";
import MdSwitch from "@/components/MdSwitch";
import type { CmmnBbsI18nText } from "./cmmnBbsI18n";
export type BbsAuthRow = {
  targetTy: "ROLE" | "USER" | "GROUP" | "DEPT";
  targetCd: string;
  targetNm?: string;
  readingFl: string;
  writingFl: string;
  replyFl: string;
  managerFl: string;
};

type Props = {
  cmpnyCd: string;
  langGb: string;
  authors: BbsAuthRow[];
  onChange: (next: BbsAuthRow[]) => void;
  t: CmmnBbsI18nText;
};

type AuthorPick = { authorCd: string; authorNm: string; authorCn?: string };
type UserPick = { mbrshSq?: string; userId: string; userNm: string; deptNm?: string };
type GroupPick = { groupId: string; groupNm: string };

function yn(b: boolean): string {
  return b ? "Y" : "N";
}

export default function BbsManageAuthorTab({ cmpnyCd, langGb, authors, onChange, t }: Props) {
  const [sub, setSub] = useState<"ROLE" | "USER" | "GROUP" | "DEPT">("ROLE");
  const [kwRole, setKwRole] = useState("");
  const [kwUser, setKwUser] = useState("");
  const [kwGroup, setKwGroup] = useState("");
  const [roleRows, setRoleRows] = useState<AuthorPick[]>([]);
  const [userRows, setUserRows] = useState<UserPick[]>([]);
  const [groupRows, setGroupRows] = useState<GroupPick[]>([]);
  const [selDept, setSelDept] = useState<string>("");
  const [selDeptNm, setSelDeptNm] = useState<string>("");
  const [deptUsers, setDeptUsers] = useState<UserPick[]>([]);

  /** 백엔드 CM_MESSAGE_LANG.LANG_CODE 등과 맞춤 (다른 게시판 API와 동일) */
  const lang = getLanguageCodeForApi(langGb);
  const authSubTabs: { value: "ROLE" | "USER" | "GROUP" | "DEPT"; label: string }[] = [
    { value: "ROLE", label: t.etcAuthTabRole },
    { value: "USER", label: t.etcAuthTabUser },
    { value: "GROUP", label: t.etcAuthTabGroup },
    { value: "DEPT", label: t.etcAuthTabDept },
  ];

  const loadRoles = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    const q = new URLSearchParams({
      cmpnyCd: cmpnyCd.trim(),
      pageIndex: "1",
      recordCountPerPage: "500",
      searchKeyword: kwRole.trim(),
    });
    EgovNet.requestFetch(
      `/cmmnAuthor/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: { list?: AuthorPick[] } }) => {
        const list = resp?.result?.list;
        setRoleRows(Array.isArray(list) ? list : []);
      },
      () => setRoleRows([])
    );
  }, [cmpnyCd, kwRole]);

  const loadUsers = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    const q = new URLSearchParams({
      cmpnyCd: cmpnyCd.trim(),
      searchKeyword: kwUser.trim(),
      langGb: lang,
    });
    EgovNet.requestFetch(
      `/cmmnAuthor/userSearch?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: UserPick[] }) => {
        setUserRows(Array.isArray(resp?.result) ? resp.result : []);
      },
      () => setUserRows([])
    );
  }, [cmpnyCd, kwUser, lang]);

  const loadGroups = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    const q = new URLSearchParams({
      cmpnyCd: cmpnyCd.trim(),
      searchKeyword: kwGroup.trim(),
      langGb: lang,
    });
    EgovNet.requestFetch(
      `/cmmnAuthor/groups?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: GroupPick[] }) => {
        setGroupRows(Array.isArray(resp?.result) ? resp.result : []);
      },
      () => setGroupRows([])
    );
  }, [cmpnyCd, kwGroup, lang]);

  const loadDeptUsers = useCallback(() => {
    if (!cmpnyCd.trim() || !selDept) {
      setDeptUsers([]);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim(), deptCd: selDept, langGb: lang });
    EgovNet.requestFetch(
      `/cmmnAuthor/deptUsers?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp: { result?: UserPick[] }) => {
        setDeptUsers(Array.isArray(resp?.result) ? resp.result : []);
      },
      () => setDeptUsers([])
    );
  }, [cmpnyCd, selDept, lang]);

  useEffect(() => {
    loadDeptUsers();
  }, [loadDeptUsers]);

  useEffect(() => {
    if (sub === "ROLE") loadRoles();
  }, [sub, loadRoles]);

  useEffect(() => {
    if (sub === "USER") loadUsers();
  }, [sub, loadUsers]);

  useEffect(() => {
    if (sub === "GROUP") loadGroups();
  }, [sub, loadGroups]);

  const addRow = (row: BbsAuthRow) => {
    const k = `${row.targetTy}|${row.targetCd}`;
    if (authors.some((a) => `${a.targetTy}|${a.targetCd}` === k)) return;
    onChange([...authors, row]);
  };

  const removeAt = (idx: number) => {
    onChange(authors.filter((_, i) => i !== idx));
  };

  const patchAt = (idx: number, patch: Partial<BbsAuthRow>) => {
    onChange(authors.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  };

  return (
    <div className="f_group pop_form_label_top">
      <div className="md-bbs-auth-subhead">
        <span className="md-bbs-auth-subhead__title">{t.etcAuthAddTarget}</span>
        <span className="md-bbs-auth-subhead__hint">{t.etcAuthAddTargetHint}</span>
      </div>
      <div className="md-bbs-auth-segments" role="tablist" aria-label={t.etcAuthTargetTypeAria}>
        {authSubTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={sub === tab.value}
            className={`md-bbs-auth-segments__btn${sub === tab.value ? " md-bbs-auth-segments__btn--active" : ""}`}
            onClick={() => setSub(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sub === "ROLE" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="f_input" style={{ width: 400 }} value={kwRole} onChange={(e) => setKwRole(e.target.value)} placeholder={t.etcAuthRoleNameSearchPlaceholder} />
            <button type="button" className="pd-btn primary" style={{ flexShrink: 0 }} onClick={loadRoles}>
              {t.btnSearch}
            </button>
          </div>
          <div
            className="board_list md-author-user-list md-bbs-auth-pick-cols-3"
            style={{ maxHeight: 200, overflow: "auto", marginTop: 8 }}
          >
            <div className="head">
              <span>{t.etcAuthCode}</span>
              <span>{t.etcAuthTabRole}</span>
              <span>{t.btnAdd}</span>
            </div>
            <div className="result">
              {roleRows.map((r) => (
                <div key={r.authorCd} className="list_item">
                  <span>{r.authorCd}</span>
                  <span>{r.authorNm}</span>
                  <span>
                    <button
                      type="button"
                      className="btn btn_skyblue_h46 md-bbs-auth-table-action-btn"
                      title={t.btnAdd}
                      onClick={() =>
                        addRow({
                          targetTy: "ROLE",
                          targetCd: r.authorCd,
                          targetNm: `${r.authorNm} (${r.authorCd})`,
                          readingFl: "Y",
                          writingFl: "N",
                          replyFl: "N",
                          managerFl: "N",
                        })
                      }
                    >
                      {t.btnPlus}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sub === "USER" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="f_input" style={{ width: 400 }} value={kwUser} onChange={(e) => setKwUser(e.target.value)} placeholder={t.etcAuthUserSearchPlaceholder} />
            <button type="button" className="pd-btn primary" style={{ flexShrink: 0 }} onClick={loadUsers}>
              {t.btnSearch}
            </button>
          </div>
          <div
            className="board_list md-author-user-list md-bbs-auth-pick-cols-4"
            style={{ maxHeight: 200, overflow: "auto", marginTop: 8 }}
          >
            <div className="head">
              <span>{t.etcUserId}</span>
              <span>{t.etcName}</span>
              <span>{t.etcDept}</span>
              <span>{t.btnAdd}</span>
            </div>
            <div className="result">
              {userRows.map((u) => (
                <div key={u.mbrshSq ?? u.userId} className="list_item">
                  <span>{u.userId}</span>
                  <span>{u.userNm}</span>
                  <span>{u.deptNm ?? ""}</span>
                  <span>
                    <button
                      type="button"
                      className="btn btn_skyblue_h46 md-bbs-auth-table-action-btn"
                      onClick={() =>
                        addRow({
                          targetTy: "USER",
                          targetCd: u.mbrshSq != null && String(u.mbrshSq).trim() !== "" ? String(u.mbrshSq) : u.userId,
                          targetNm: `${u.userNm} (${u.userId})`,
                          readingFl: "Y",
                          writingFl: "N",
                          replyFl: "N",
                          managerFl: "N",
                        })
                      }
                    >
                      {t.btnPlus}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sub === "GROUP" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="f_input" style={{ width: 400 }} value={kwGroup} onChange={(e) => setKwGroup(e.target.value)} placeholder={t.etcAuthGroupSearchPlaceholder} />
            <button type="button" className="pd-btn primary" style={{ flexShrink: 0 }} onClick={loadGroups}>
              {t.btnSearch}
            </button>
          </div>
          <div
            className="board_list md-author-user-list md-bbs-auth-pick-cols-3"
            style={{ maxHeight: 200, overflow: "auto", marginTop: 8 }}
          >
            <div className="head">
              <span>{t.etcGroupId}</span>
              <span>{t.etcAuthTabGroup}</span>
              <span>{t.btnAdd}</span>
            </div>
            <div className="result">
              {groupRows.map((g) => (
                <div key={g.groupId} className="list_item">
                  <span>{g.groupId}</span>
                  <span>{g.groupNm}</span>
                  <span>
                    <button
                      type="button"
                      className="btn btn_skyblue_h46 md-bbs-auth-table-action-btn"
                      onClick={() =>
                        addRow({
                          targetTy: "GROUP",
                          targetCd: g.groupId,
                          targetNm: `${g.groupNm} (${g.groupId})`,
                          readingFl: "Y",
                          writingFl: "N",
                          replyFl: "N",
                          managerFl: "N",
                        })
                      }
                    >
                      {t.btnPlus}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sub === "DEPT" && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1fr) minmax(280px,1.2fr)", gap: 12, marginBottom: 12 }}>
          <div
            className="md-form-card"
            style={{
              display: "flex",
              flexDirection: "column",
              maxHeight: 280,
              minHeight: 0,
              overflow: "hidden",
              gap: 8,
            }}
          >
            <h4 className="system-subtitle" style={{ marginTop: 0, flexShrink: 0 }}>
              {t.etcAuthTabDept}
            </h4>
            <DeptTreeView
              cmpnyCd={cmpnyCd.trim()}
              langGb={lang}
              selectedDeptCd={selDept}
              onSelectDept={(deptCd, deptNm) => {
                setSelDept(deptCd);
                setSelDeptNm((deptNm ?? "").trim());
              }}
            />
          </div>
          <div>
            <div className="board_list md-author-user-list md-bbs-auth-pick-cols-3" style={{ maxHeight: 240, overflow: "auto" }}>
              <div className="head">
                <span>{t.etcDeptCode}</span>
                <span>{t.etcAuthTabUser}</span>
                <span>{t.btnAdd}</span>
              </div>
              <div className="result">
                {deptUsers.map((u) => (
                  <div key={`${selDept}-${u.mbrshSq ?? u.userId}`} className="list_item">
                    <span>{selDept}</span>
                    <span>
                      {u.userNm} ({u.userId})
                    </span>
                    <span>
                      <button
                        type="button"
                        className="btn btn_skyblue_h46 md-bbs-auth-table-action-btn"
                        onClick={() =>
                          addRow({
                            targetTy: "USER",
                            targetCd: u.mbrshSq != null && String(u.mbrshSq).trim() !== "" ? String(u.mbrshSq) : u.userId,
                            targetNm: `${u.userNm} (${u.userId})`,
                            readingFl: "Y",
                            writingFl: "N",
                            replyFl: "N",
                            managerFl: "N",
                          })
                        }
                      >
                        {t.btnPlus}
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>{t.etcDeptPermissionHint}</p>
            <button
              type="button"
              className="btn btn_skyblue_h46"
              disabled={!selDept}
              onClick={() =>
                selDept &&
                addRow({
                  targetTy: "DEPT",
                  targetCd: selDept,
                  targetNm: selDeptNm ? `${selDeptNm} (${selDept})` : selDept,
                  readingFl: "Y",
                  writingFl: "N",
                  replyFl: "N",
                  managerFl: "N",
                })
              }
            >
              {t.etcAddForDeptPermission}
            </button>
          </div>
        </div>
      )}

      <h4 className="system-subtitle">{t.etcAuthList}</h4>
      <div className="board_list md-author-user-list md-bbs-auth-assigned-list" style={{ overflow: "auto" }}>
        <div className="head">
          <span>{t.labelType}</span>
          <span>{t.etcTarget}</span>
          <span>{t.etcRead}</span>
          <span>{t.etcWrite}</span>
          <span>{t.etcReply}</span>
          <span>{t.etcManage}</span>
          <span>{t.btnDelete}</span>
        </div>
        <div className="result">
          {authors.map((a, idx) => (
            <div key={`${a.targetTy}-${a.targetCd}-${idx}`} className="list_item">
              <span>{a.targetTy}</span>
              <span>{a.targetNm || a.targetCd}</span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <MdSwitch
                  id={`bbs-auth-read-${idx}`}
                  compact
                  ariaLabel={t.etcRead}
                  checked={a.readingFl === "Y"}
                  onChange={(c) => patchAt(idx, { readingFl: yn(c) })}
                />
              </span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <MdSwitch
                  id={`bbs-auth-write-${idx}`}
                  compact
                  ariaLabel={t.etcWrite}
                  checked={a.writingFl === "Y"}
                  onChange={(c) => patchAt(idx, { writingFl: yn(c) })}
                />
              </span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <MdSwitch
                  id={`bbs-auth-reply-${idx}`}
                  compact
                  ariaLabel={t.etcReply}
                  checked={a.replyFl === "Y"}
                  onChange={(c) => patchAt(idx, { replyFl: yn(c) })}
                />
              </span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <MdSwitch
                  id={`bbs-auth-mgr-${idx}`}
                  compact
                  ariaLabel={t.etcManage}
                  checked={a.managerFl === "Y"}
                  onChange={(c) => patchAt(idx, { managerFl: yn(c) })}
                />
              </span>
              <span>
                <button
                  type="button"
                  className="btn btn_skyblue_h46 md-bbs-auth-table-action-btn md-bbs-auth-table-action-btn--icon"
                  aria-label={t.btnDelete}
                  title={t.btnDelete}
                  onClick={() => removeAt(idx)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
