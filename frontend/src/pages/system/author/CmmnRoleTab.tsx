import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import * as EgovNet from "@/api/egovFetch";
import CODE from "@/constants/code";
import { getLanguageCodeForApi } from "@/utils/language";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";

import { CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK } from "./cmmnAuthorI18n";

type RoleRow = {
  cmpnyCd: string;
  roleCd: string;
  roleNm: string;
  roleTy?: string;
  rolePttrn?: string;
  roleDc?: string;
  roleSort?: string;
  mappedYn?: string;
};

type AuthorLite = { authorCd: string; authorNm: string; authorCn?: string };
type CodeOpt = { code: string; name: string };

type Props = {
  cmpnyCd: string;
  langGb: string;
};

const MAX = { ROLE_CD: 20, ROLE_NM: 100, ROLE_TY: 20, ROLE_PTTRN: 100, ROLE_DC: 400 };

/** 상단 롤 목록은 페이징 없이 한 번에 조회 (스크롤로 탐색) */
const ROLE_LIST_FETCH_ALL_SIZE = 10000;

function CmmnRoleTab({ cmpnyCd, langGb }: Props) {
  const i18nText = useCmmnScreenI18n(CMMN_AUTHOR_I18N_KEYS, CMMN_AUTHOR_I18N_FALLBACK, { cmpnyCd });
  const langCode = getLanguageCodeForApi(langGb) || "ko_KR";
  const [roleTyFilter, setRoleTyFilter] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleList, setRoleList] = useState<RoleRow[]>([]);
  const [roleTypeOptions, setRoleTypeOptions] = useState<CodeOpt[]>([]);
  const [form, setForm] = useState<RoleRow>({
    cmpnyCd: "",
    roleCd: "",
    roleNm: "",
    roleTy: "",
    rolePttrn: "",
    roleDc: "",
    roleSort: "",
  });
  const [isCreate, setIsCreate] = useState(true);
  const [selectedRoleKeys, setSelectedRoleKeys] = useState<Set<string>>(new Set());

  const [authors, setAuthors] = useState<AuthorLite[]>([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthorCd, setSelectedAuthorCd] = useState<string | null>(null);
  const [roleMapList, setRoleMapList] = useState<RoleRow[]>([]);
  const [mapRoleTy, setMapRoleTy] = useState("");
  const [mapSearchKeyword, setMapSearchKeyword] = useState("");
  const [listRefreshVer, setListRefreshVer] = useState(0);
  const roleCdInputRef = useRef<HTMLInputElement>(null);
  /** 우측 author-embed-panel(테두리·패딩 포함 바깥 박스) 높이에 좌측 목록 높이를 맞추기 위한 측정 */
  const embedRoleFormPanelRef = useRef<HTMLDivElement>(null);
  const [embedRoleFormPanelPx, setEmbedRoleFormPanelPx] = useState<number | null>(null);

  const loadRoleTypes = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    EgovNet.requestFetch(
      `/cmmnRole/roleTypes?cmpnyCd=${encodeURIComponent(cmpnyCd)}&langCode=${encodeURIComponent(langCode)}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) setRoleTypeOptions(resp.result);
        else setRoleTypeOptions([]);
      },
      () => setRoleTypeOptions([])
    );
  }, [cmpnyCd, langCode]);

  useEffect(() => {
    loadRoleTypes();
  }, [loadRoleTypes]);

  useEffect(() => {
    if (!cmpnyCd.trim()) return;
    const params = new URLSearchParams({
      cmpnyCd,
      pageIndex: "1",
      recordCountPerPage: String(ROLE_LIST_FETCH_ALL_SIZE),
    });
    if (roleTyFilter) params.set("roleTy", roleTyFilter);
    if (searchKeyword.trim()) params.set("searchKeyword", searchKeyword.trim());
    EgovNet.requestFetch(
      `/cmmnRole/list?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const result = resp?.result;
        if (result?.list) setRoleList(result.list);
        else setRoleList([]);
      },
      () => setRoleList([])
    );
  }, [cmpnyCd, roleTyFilter, searchKeyword, listRefreshVer]);

  const loadAuthors = useCallback(() => {
    if (!cmpnyCd.trim()) return;
    const params = new URLSearchParams({ cmpnyCd });
    if (authorSearch.trim()) params.set("searchKeyword", authorSearch.trim());
    EgovNet.requestFetch(
      `/cmmnAuthor/authorsAll?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const list = resp?.result;
        if (Array.isArray(list)) {
          setAuthors(
            list.map((a: { authorCd?: string; authorNm?: string }) => ({
              authorCd: String(a.authorCd ?? ""),
              authorNm: String(a.authorNm ?? ""),
            }))
          );
        } else setAuthors([]);
      },
      () => setAuthors([])
    );
  }, [cmpnyCd, authorSearch]);

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  const loadRolesForAuthor = useCallback(() => {
    if (!cmpnyCd.trim() || !selectedAuthorCd) {
      setRoleMapList([]);
      return;
    }
    const params = new URLSearchParams({ cmpnyCd, authorCd: selectedAuthorCd });
    if (mapRoleTy) params.set("roleTy", mapRoleTy);
    if (mapSearchKeyword.trim()) params.set("searchKeyword", mapSearchKeyword.trim());
    EgovNet.requestFetch(
      `/cmmnRole/rolesForAuthor?${params.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) setRoleMapList(resp.result);
        else setRoleMapList([]);
      },
      () => setRoleMapList([])
    );
  }, [cmpnyCd, selectedAuthorCd, mapRoleTy, mapSearchKeyword]);

  useEffect(() => {
    loadRolesForAuthor();
  }, [loadRolesForAuthor]);

  const handleSearch = () => {
    setListRefreshVer((v) => v + 1);
  };

  /** 우측 패널 높이 동기화: 의존성으로 effect를 재실행하면 옵저버가 끊겼다 붙으며 순간적으로 틀어질 수 있음 → 마운트 시 1회만 구독 */
  useLayoutEffect(() => {
    const el = embedRoleFormPanelRef.current;
    if (!el) return;

    let rafId = 0;
    const measure = () => {
      const node = embedRoleFormPanelRef.current;
      if (!node) return;
      const h = Math.round(node.getBoundingClientRect().height);
      if (h <= 0) return;
      setEmbedRoleFormPanelPx((prev) => (prev === h ? prev : h));
    };
    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measure);
    };

    schedule();
    requestAnimationFrame(schedule);

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("resize", schedule);
    const fontsReady = document.fonts?.ready;
    if (fontsReady) void fontsReady.then(schedule);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const handleInitForm = () => {
    setIsCreate(true);
    setForm({
      cmpnyCd,
      roleCd: "",
      roleNm: "",
      roleTy: roleTypeOptions[0]?.code ?? "",
      rolePttrn: "",
      roleDc: "",
      roleSort: "",
    });
    setTimeout(() => roleCdInputRef.current?.focus(), 50);
  };

  const selectRoleRow = (row: RoleRow) => {
    setIsCreate(false);
    setForm({ ...row, cmpnyCd: row.cmpnyCd || cmpnyCd });
  };

  const truncate = (v: string | undefined, max: number) => (v ?? "").slice(0, max);

  const handleSaveRole = () => {
    if (!cmpnyCd.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    if (!form.roleCd?.trim() || !form.roleNm?.trim()) {
      alert(i18nText.msgRoleRequired);
      return;
    }
    if (!form.roleTy?.trim()) {
      alert(i18nText.msgSelectRoleType);
      return;
    }
    const body = {
      cmpnyCd,
      roleCd: truncate(form.roleCd, MAX.ROLE_CD),
      roleNm: truncate(form.roleNm, MAX.ROLE_NM),
      roleTy: truncate(form.roleTy, 50),
      rolePttrn: truncate(form.rolePttrn, MAX.ROLE_PTTRN),
      roleDc: truncate(form.roleDc, MAX.ROLE_DC),
      roleSort: truncate(form.roleSort, MAX.ROLE_SORT),
    };
    const url = "/cmmnRole";
    const method = isCreate ? "POST" : "PUT";
    EgovNet.requestFetch(
      url,
      { method, headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
      (resp) => {
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgSaveSuccess);
          setListRefreshVer((v) => v + 1);
          if (isCreate) handleInitForm();
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnSave);
          const focusInfo = resp?.result as { duplicateKey?: string } | undefined;
          if (focusInfo?.duplicateKey === "ROLE_CD") {
            setTimeout(() => roleCdInputRef.current?.focus(), 100);
          }
        }
      },
      () => alert(i18nText.msgErrorOnSave)
    );
  };

  const handleDeleteRole = () => {
    if (isCreate) return;
    if (!window.confirm(i18nText.msgConfirmDelete)) return;
    EgovNet.requestFetch(
      `/cmmnRole?cmpnyCd=${encodeURIComponent(cmpnyCd)}&roleCd=${encodeURIComponent(form.roleCd)}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgDeleted);
          handleInitForm();
          setListRefreshVer((v) => v + 1);
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const handleDeleteList = () => {
    if (selectedRoleKeys.size === 0) {
      alert(i18nText.msgSelectItemToDelete1);
      return;
    }
    if (!confirm(i18nText.msgConfirmDeleteRole)) return;
    const list = roleList.filter((r) => selectedRoleKeys.has(r.roleCd)).map((r) => ({ cmpnyCd: r.cmpnyCd, roleCd: r.roleCd }));
    EgovNet.requestFetch(
      "/cmmnRole/deleteList",
      { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(list) },
      (resp) => {
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgDeleted);
          setSelectedRoleKeys(new Set());
          setListRefreshVer((v) => v + 1);
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const toggleRoleMap = (roleCd: string) => {
    setRoleMapList((prev) =>
      prev.map((r) =>
        r.roleCd === roleCd ? { ...r, mappedYn: r.mappedYn === "Y" ? "N" : "Y" } : r
      )
    );
  };

  /** 권한 롤 정보: 전체 선택(모두 Y) / 전체 해제(모두 N). 일부만 체크면 헤더는 해제 상태 */
  const toggleAllRoleMap = () => {
    if (!selectedAuthorCd || roleMapList.length === 0) return;
    const allChecked = roleMapList.every((r) => r.mappedYn === "Y");
    setRoleMapList((prev) => prev.map((r) => ({ ...r, mappedYn: allChecked ? "N" : "Y" })));
  };

  const roleMapHeaderAllChecked = roleMapList.length > 0 && roleMapList.every((r) => r.mappedYn === "Y");

  const handleSaveAuthorRoles = () => {
    if (!selectedAuthorCd) {
      alert(i18nText.msgSelectAuth);
      return;
    }
    const roleCdList = roleMapList.filter((r) => r.mappedYn === "Y").map((r) => r.roleCd);
    EgovNet.requestFetch(
      "/cmmnRole/authorRoles",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ cmpnyCd, authorCd: selectedAuthorCd, roleCdList }),
      },
      (resp) => {
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgSaveSuccess);
          loadRolesForAuthor();
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnSave);
        }
      },
      () => alert(i18nText.msgErrorOnSave)
    );
  };

  useEffect(() => {
    if (cmpnyCd) {
      setForm((f) => ({ ...f, cmpnyCd }));
    }
  }, [cmpnyCd]);

  const rowKey = (r: RoleRow) => r.roleCd;

  const roleToolbarRight = (
    <div className="card-bar" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "nowrap", justifyContent: "flex-end" }}>
      <button type="button" className="btn btn_default_h46 role-tab-btn" onClick={handleInitForm}>
        {i18nText.btnReset}
      </button>
      <button type="button" className="btn btn_default_h46 role-tab-btn" onClick={handleDeleteRole} disabled={isCreate}>
        {i18nText.btnDelete}
      </button>
      <button type="button" className="btn btn_blue_h46 role-tab-btn" onClick={handleSaveRole}>
        {i18nText.btnSave}
      </button>
    </div>
  );

  const embedGridCols = "minmax(280px, 46%) 1fr";

  return (
    <div
      className="author-embed-root"
      style={{
        flex: "1 1 0%",
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className="md-form-card" style={{ flex: "1 1 0%", minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: "1 1 0%", minHeight: 0, width: "100%", gap: 20, overflow: "hidden" }}>
          {/* 권한관리 탭과 동일: 상단 툴바 + 좌 목록 / 우 입력폼 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: embedGridCols,
              gridTemplateRows: "auto",
              columnGap: 16,
              flex: "0 0 auto",
              width: "100%",
              alignItems: "start",
            }}
          >
            <div
              className="author-embed-panel"
              style={{
                gridColumn: 1,
                gridRow: 1,
                minHeight: 0,
                width: "100%",
                alignSelf: "start",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: 0,
                height: embedRoleFormPanelPx != null ? embedRoleFormPanelPx : undefined,
                maxHeight: embedRoleFormPanelPx != null ? embedRoleFormPanelPx : "min(60vh, 520px)",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "nowrap",
                  padding: "10px 12px",
                  borderBottom: "1px solid #e5e7eb",
                  flexShrink: 0,
                }}
              >
                <label className="f_select" style={{ width: 240, minWidth: 240, flexShrink: 0 }}>
                  <select value={roleTyFilter} onChange={(e) => setRoleTyFilter(e.target.value)}>
                    <option value="">{i18nText.etcAll}</option>
                    {roleTypeOptions.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="f_input" style={{ flex: "1 1 0%", minWidth: 100, maxWidth: 320 }}>
                  <input
                    type="text"
                    value={searchKeyword}
                    placeholder={i18nText.placeholderSearchRoleNameCode}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </label>
                <div style={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "nowrap", alignItems: "center" }}>
                  <button type="button" className="btn btn_default_h46 role-tab-btn" onClick={handleSearch}>
                    <span>{i18nText.btnSearch}</span>
                  </button>
                  <button type="button" className="btn btn_dark_h46 role-tab-btn" onClick={handleDeleteList}>
                    <span>{i18nText.btnDelete}</span>
                  </button>
                </div>
              </div>
              <div
                className="board_list BRD006 md-admin-list md-role-top-list"
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  marginTop: 0,
                  border: "none",
                  borderRadius: 0,
                }}
              >
                <div className="head" style={{ flexShrink: 0 }}>
                  <span className="md-col-chk">
                    <input
                      type="checkbox"
                      checked={roleList.length > 0 && selectedRoleKeys.size === roleList.length}
                      onChange={(e) =>
                        setSelectedRoleKeys(e.target.checked ? new Set(roleList.map((r) => r.roleCd)) : new Set())
                      }
                      aria-label={i18nText.etcSelectAllAriaLabel}
                    />
                  </span>
                  <span>{i18nText.labelRoleCode}</span>
                  <span>{i18nText.labelRoleName}</span>
                  <span>{i18nText.labelDescription}</span>
                </div>
                <div className="result" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {roleList.length === 0 ? (
                    <p className="no_data">{i18nText.msgNoSearchResult}</p>
                  ) : (
                    roleList.map((item) => (
                      <div
                        key={rowKey(item)}
                        className="list_item"
                        onClick={() => selectRoleRow(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="md-col-chk" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRoleKeys.has(item.roleCd)}
                            onChange={() =>
                              setSelectedRoleKeys((prev) => {
                                const n = new Set(prev);
                                if (n.has(item.roleCd)) n.delete(item.roleCd);
                                else n.add(item.roleCd);
                                return n;
                              })
                            }
                          />
                        </div>
                        <div>{item.roleCd}</div>
                        <div>{item.roleNm}</div>
                        <div title={item.roleDc}>{item.roleDc ?? ""}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div
              ref={embedRoleFormPanelRef}
              className="author-embed-panel"
              style={{
                gridColumn: 2,
                gridRow: 1,
                minHeight: 0,
                alignSelf: "start",
                display: "flex",
                flexDirection: "column",
                padding: "0 12px 10px 12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 0 8px" }}>{roleToolbarRight}</div>
              <div className="board_view2 md-program-edit-form" style={{ flexShrink: 0 }}>
                <dl>
                  <dt>
                    {i18nText.labelRoleCode} <span className="req">*</span>
                  </dt>
                  <dd>
                    <input
                      ref={roleCdInputRef}
                      id="roleEdit_roleCd"
                      className="f_input w_full"
                      value={form.roleCd}
                      disabled={!isCreate}
                      onChange={(e) => setForm((f) => ({ ...f, roleCd: e.target.value }))}
                      maxLength={MAX.ROLE_CD}
                    />
                  </dd>
                </dl>
                <dl>
                  <dt>
                    {i18nText.labelRoleName} <span className="req">*</span>
                  </dt>
                  <dd>
                    <input
                      className="f_input w_full"
                      value={form.roleNm}
                      onChange={(e) => setForm((f) => ({ ...f, roleNm: e.target.value }))}
                      maxLength={MAX.ROLE_NM}
                    />
                  </dd>
                </dl>
                <dl>
                  <dt>
                    {i18nText.labelRoleType} <span className="req">*</span>
                  </dt>
                  <dd>
                    <select
                      className="f_select w_full"
                      value={form.roleTy}
                      onChange={(e) => setForm((f) => ({ ...f, roleTy: e.target.value }))}
                    >
                      <option value="">{i18nText.labelSelect}</option>
                      {roleTypeOptions.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelRolePattern}</dt>
                  <dd>
                    <input
                      className="f_input w_full"
                      value={form.rolePttrn ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, rolePttrn: e.target.value }))}
                      maxLength={MAX.ROLE_PTTRN}
                    />
                  </dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelRoleSort}</dt>
                  <dd>
                    <input
                      type="number"
                      className="f_input w_full"
                      value={form.roleSort ?? ""}
                      min={-32768}
                      max={32767}
                      onChange={(e) => setForm((f) => ({ ...f, roleSort: e.target.value }))}
                    />
                  </dd>
                </dl>
                <dl>
                  <dt>{i18nText.labelRoleDesc}</dt>
                  <dd>
                    <textarea
                      className="f_txtar w_full"
                      rows={3}
                      value={form.roleDc ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, roleDc: e.target.value }))}
                      maxLength={MAX.ROLE_DC}
                    />
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: embedGridCols,
              /* auto 행은 콘텐츠 높이만큼 늘어남 → 남은 영역 1행으로 고정 후 내부 스크롤 */
              gridTemplateRows: "minmax(0, 1fr)",
              columnGap: 16,
              /* flex:1 만으로는 min-height:auto 때문에 콘텐츠 높이만큼 부모가 다시 늘어날 수 있음 → basis 0 + height 0으로 남은 영역 고정 */
              flex: "1 1 0%",
              minHeight: 0,
              height: 0,
              overflow: "hidden",
              alignItems: "stretch",
              width: "100%",
            }}
          >
            <div
              className="author-embed-panel"
              style={{
                minHeight: 0,
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div className="author-embed-panel__title">{i18nText.titleAuthList}</div>
              <label className="f_input w_full" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder={i18nText.placeholderSearchAuthNameCodeRole}
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), loadAuthors())}
                />
              </label>
              <div
                className="board_list BRD006 md-admin-list"
                style={{
                  flex: "0 0 auto",
                  height: "clamp(280px, 42vh, 460px)",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                }}
              >
                <div className="head" style={{ flexShrink: 0 }}>
                  <span className="md-col-no">{i18nText.labelSelect}</span>
                  <span>{i18nText.labelAuthCode}</span>
                  <span>{i18nText.labelAuthName}</span>
                </div>
                <div className="result" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {authors.map((a) => (
                    <div
                      key={a.authorCd}
                      className="list_item"
                      onClick={() => setSelectedAuthorCd(a.authorCd)}
                      style={{
                        background: selectedAuthorCd === a.authorCd ? "#e3f2fd" : undefined,
                        cursor: "pointer",
                      }}
                    >
                      <div className="md-col-no">
                        <input
                          type="radio"
                          name="selAuthor"
                          checked={selectedAuthorCd === a.authorCd}
                          onChange={() => setSelectedAuthorCd(a.authorCd)}
                        />
                      </div>
                      <div>{a.authorCd}</div>
                      <div>{a.authorNm}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="author-embed-panel"
              style={{
                minHeight: 0,
                height: "100%",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div className="author-embed-panel__title">{i18nText.titleAuthRoleInfo}</div>
              <div className="author-role-searchbar">
                <div className="author-role-searchbar__row">
                  <label className="f_select author-role-searchbar__select">
                    <select value={mapRoleTy} onChange={(e) => setMapRoleTy(e.target.value)}>
                      <option value="">{i18nText.placeholderRoleTypeAll}</option>
                      {roleTypeOptions.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="f_input author-role-searchbar__input">
                    <input
                      type="text"
                      placeholder={i18nText.placeholderSearchRoleNameCode}
                      value={mapSearchKeyword}
                      onChange={(e) => setMapSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), loadRolesForAuthor())}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn_blue_h46 btn-slim author-role-searchbar__btn"
                    onClick={() => loadRolesForAuthor()}
                  >
                    {i18nText.btnSearch2}
                  </button>
                  <button
                    type="button"
                    className="btn btn_blue_h46 btn-slim author-role-searchbar__btn"
                    onClick={handleSaveAuthorRoles}
                  >
                    {i18nText.btnSave}
                  </button>
                </div>
              </div>
              <div
                className="board_list BRD006 md-admin-list"
                style={{
                  flex: "0 0 auto",
                  height: "clamp(280px, 42vh, 460px)",
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  marginTop: 0,
                }}
              >
                <div className="head" style={{ flexShrink: 0 }}>
                  <span className="md-col-chk">
                    <input
                      type="checkbox"
                      checked={roleMapHeaderAllChecked}
                      onChange={toggleAllRoleMap}
                      disabled={!selectedAuthorCd || roleMapList.length === 0}
                      aria-label={i18nText.etcSelectAllAriaLabel}
                    />
                  </span>
                  <span>{i18nText.labelRoleCode}</span>
                  <span>{i18nText.labelRoleName}</span>
                  <span>{i18nText.labelDescription}</span>
                </div>
                <div className="result" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {!selectedAuthorCd ? (
                    <p className="no_data">{i18nText.msgSelectAuth}</p>
                  ) : roleMapList.length === 0 ? (
                    <p className="no_data">{i18nText.msgNoRole}</p>
                  ) : (
                    roleMapList.map((r) => (
                      <div key={r.roleCd} className="list_item">
                        <div className="md-col-chk">
                          <input
                            type="checkbox"
                            checked={r.mappedYn === "Y"}
                            onChange={() => toggleRoleMap(r.roleCd)}
                          />
                        </div>
                        <div>{r.roleCd}</div>
                        <div>{r.roleNm}</div>
                        <div>{r.roleDc ?? ""}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnRoleTab;
