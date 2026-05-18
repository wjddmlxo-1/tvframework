import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import CODE from "@/constants/code";
import { getSessionItem } from "@/utils/storage";
import { useCompanyList } from "@/hooks/useCompanyList";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLanguageCodeForApi } from "@/utils/language";
import { decodeHtmlEntities } from "@/utils/htmlDecode";

import {
  CMMN_WIDGET_DATASET_I18N_KEYS,
  CMMN_WIDGET_DATASET_I18N_FALLBACK,
  replaceI18nPlaceholders,
} from "./cmmnWidgetDatasetI18n";

const MAX_DATASET_ID = 50;
const MAX_DATASET_NAME = 100;
const MAX_DATASET_TY = 20;

type DatasetRow = {
  datasetId: string;
  datasetName: string;
  datasetTy: string;
  useFl: string;
  modifyDt?: string;
};

type CodeOpt = { code: string; name: string };

/**
 * REST 응답에서 Jackson HtmlCharacterEscapes 때문에 JSON 문자열이 &quot; 형태로 오는 경우 복원
 * (공통 WebMvcConfig의 htmlEscapingConverter와 동일 맥락 — 다국어 메시지 등과 같이 디코딩)
 */
function normalizeConfigJsonFromApi(raw: string | undefined | null): string {
  if (raw == null || String(raw).trim() === "") return "{}";
  const s = String(raw);
  const decoded = decodeHtmlEntities(s);
  return decoded != null && decoded.trim() !== "" ? decoded : s;
}

const DEFAULT_SQL_REST = '{\n  "configList": [\n    {\n      "cache_second": "60",\n      "limitCnt": "3",\n      "viewItem": []\n    }\n  ]\n}';

const DEFAULT_STATIC = '{\n  "items": []\n}';

/** 로컬 날짜 YYYYMMDD (한국수출입은행 환율 API searchdate 등) */
function formatLocalYmd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

const DEFAULT_API = [
  "{",
  '  "url": "https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON",',
  '  "method": "GET",',
  '  "headers": { "Accept": "application/json" },',
  '  "params": {',
  '    "authkey": ":authkey",',
  '    "data": "AP01",',
  '    "searchdate": ":searchdate",',
  '    "cur_unit": "USD"',
  "  }",
  "}",
].join("\n");

function WidgetDataSetList() {
  const { langGb } = useLanguage();
  const datasetIdInputRef = useRef<HTMLInputElement | null>(null);

  const { companyList, cmpnyCd, onCompanyChange } = useCompanyList();
  const i18nText = useCmmnScreenI18n(CMMN_WIDGET_DATASET_I18N_KEYS, CMMN_WIDGET_DATASET_I18N_FALLBACK, {
    cmpnyCd: cmpnyCd || null,
  });

  const [dataTypeOptions, setDataTypeOptions] = useState<CodeOpt[]>([]);
  const [searchDataType, setSearchDataType] = useState("");
  const [searchName, setSearchName] = useState("");
  const [list, setList] = useState<DatasetRow[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [datasetId, setDatasetId] = useState("");
  const [datasetName, setDatasetName] = useState("");
  const [datasetTy, setDatasetTy] = useState("SQL");
  const [useFl, setUseFl] = useState("Y");
  const [configJson, setConfigJson] = useState("{}");
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlRestJson, setSqlRestJson] = useState(DEFAULT_SQL_REST);

  const [subTab, setSubTab] = useState<"primary" | "config">("primary");

  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);
  /** API 미리보기 시 params의 :authkey 치환용 (저장되지 않음) */
  const [apiPreviewAuthkey, setApiPreviewAuthkey] = useState("");

  const loadDataTypes = useCallback(() => {
    const langCode = getLanguageCodeForApi(langGb);
    const q = new URLSearchParams({ langCode });
    EgovNet.requestFetch(
      `/widgetDataSet/dataTypes?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setDataTypeOptions(resp.result as CodeOpt[]);
        }
      },
      () => { }
    );
  }, [langGb]);

  const loadList = useCallback(() => {
    if (!cmpnyCd?.trim()) {
      setList([]);
      return;
    }
    const q = new URLSearchParams();
    q.set("cmpnyCd", cmpnyCd.trim());
    if (searchDataType) q.set("dataType", searchDataType);
    if (searchName.trim()) q.set("datasetName", searchName.trim());
    EgovNet.requestFetch(
      `/widgetDataSet/list?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (resp?.result && Array.isArray(resp.result)) {
          setList(resp.result as DatasetRow[]);
        } else {
          setList([]);
        }
      },
      () => setList([])
    );
  }, [cmpnyCd, searchDataType, searchName]);

  const applyDetailToForm = useCallback((d: DatasetRow & { configJson?: string }) => {
    setDatasetId(d.datasetId || "");
    setDatasetName(d.datasetName || "");
    setDatasetTy((d.datasetTy || "SQL").toUpperCase());
    setUseFl(d.useFl === "N" ? "N" : "Y");
    const raw = normalizeConfigJsonFromApi(d.configJson);
    setConfigJson(raw);
    try {
      const o = JSON.parse(raw) as { query?: string;[k: string]: unknown };
      if ((d.datasetTy || "").toUpperCase() === "SQL") {
        setSqlQuery(typeof o.query === "string" ? o.query : "");
        const { query: _q, ...rest } = o;
        setSqlRestJson(JSON.stringify(rest, null, 2));
      } else {
        setSqlQuery("");
        setSqlRestJson(DEFAULT_SQL_REST);
      }
    } catch {
      setSqlQuery("");
      setSqlRestJson(DEFAULT_SQL_REST);
    }
    setSubTab("primary");
  }, []);

  const loadDetail = useCallback(
    (id: string) => {
      if (!cmpnyCd?.trim()) return;
      const q = new URLSearchParams({ datasetId: id });
      q.set("cmpnyCd", cmpnyCd.trim());
      EgovNet.requestFetch(
        `/widgetDataSet/detail?${q.toString()}`,
        { method: "GET", headers: { "Content-type": "application/json" } },
        (resp) => {
          if (resp?.result) {
            applyDetailToForm(resp.result as DatasetRow & { configJson?: string });
            setSelectedId(id);
            setIsNew(false);
          }
        },
        () => alert(i18nText.msgErrorOnDetail)
      );
    },
    [applyDetailToForm, cmpnyCd, i18nText]
  );

  useEffect(() => {
    loadDataTypes();
  }, [loadDataTypes]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const fetchNextId = (cb: (id: string) => void) => {
    if (!cmpnyCd?.trim()) {
      alert(i18nText.msgSelectCompany);
      return;
    }
    const q = new URLSearchParams({ cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetDataSet/nextDatasetId?${q.toString()}`,
      { method: "GET", headers: { "Content-type": "application/json" } },
      (resp) => {
        const id = (resp?.result as { datasetId?: string })?.datasetId;
        if (id) cb(id);
        else alert(i18nText.msgFailGenerateId);
      },
      () => alert(i18nText.msgFailGenerateId)
    );
  };

  const buildBodyConfigJson = (): string | null => {
    const ty = datasetTy.toUpperCase();
    if (ty === "SQL") {
      let rest: Record<string, unknown> = {};
      try {
        rest = JSON.parse(sqlRestJson || "{}") as Record<string, unknown>;
      } catch {
        alert(i18nText.msgInvalidConfigJson);
        return null;
      }
      return JSON.stringify({ ...rest, query: sqlQuery });
    }
    try {
      JSON.parse(configJson || "{}");
    } catch {
      alert(i18nText.msgInvalidSettingJson);
      return null;
    }
    return configJson || "{}";
  };

  const handleReset = () => {
    setSelectedId(null);
    setIsNew(true);
    setDatasetName("");
    setDatasetTy("SQL");
    setUseFl("Y");
    setSqlQuery("");
    setSqlRestJson(DEFAULT_SQL_REST);
    setConfigJson(DEFAULT_STATIC);
    setApiPreviewAuthkey("");
    setSubTab("primary");
    fetchNextId((id) => {
      setDatasetId(id);
      setTimeout(() => datasetIdInputRef.current?.focus(), 0);
    });
  };

  const handleCopy = () => {
    if (!datasetName.trim()) {
      alert(i18nText.msgNoDataNameToCopy);
      return;
    }
    const cfg = buildBodyConfigJson();
    if (cfg === null) return;
    fetchNextId((id) => {
      setDatasetId(id);
      setDatasetName(`${datasetName.trim().slice(0, 90)}${i18nText.etcCopySuffix}`);
      setIsNew(true);
      setSelectedId(null);
      if (datasetTy.toUpperCase() !== "SQL") {
        setConfigJson(cfg);
      }
      setTimeout(() => datasetIdInputRef.current?.focus(), 0);
    });
  };

  const handleSave = () => {
    if (!datasetName.trim() || datasetName.trim().length > MAX_DATASET_NAME) {
      alert(replaceI18nPlaceholders(i18nText.msgDatasetNameLength, { max: MAX_DATASET_NAME }));
      return;
    }
    if (!datasetTy.trim() || datasetTy.trim().length > MAX_DATASET_TY) {
      alert(i18nText.msgSelectDataType);
      return;
    }
    if (!datasetId.trim() || datasetId.trim().length > MAX_DATASET_ID) {
      alert(replaceI18nPlaceholders(i18nText.msgDatasetIdLength, { max: MAX_DATASET_ID }));
      return;
    }
    const cfg = buildBodyConfigJson();
    if (cfg === null) return;

    const body = {
      cmpnyCd: cmpnyCd.trim(),
      datasetId: datasetId.trim(),
      datasetName: datasetName.trim(),
      datasetTy: datasetTy.trim(),
      configJson: cfg,
      useFl: useFl || "Y",
    };

    if (isNew) {
      EgovNet.requestFetch(
        "/widgetDataSet",
        { method: "POST", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            alert(i18nText.msgSaved);
            loadList();
            loadDetail(body.datasetId);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnSave);
            const focusInfo = resp?.result as { duplicateKey?: string } | undefined;
            if (focusInfo?.duplicateKey === "DATASET_ID") {
              setTimeout(() => datasetIdInputRef.current?.focus(), 100);
            }
          }
        },
        () => alert(i18nText.msgErrorOnSave)
      );
    } else {
      EgovNet.requestFetch(
        "/widgetDataSet",
        { method: "PUT", headers: { "Content-type": "application/json" }, body: JSON.stringify(body) },
        (resp) => {
          if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
            alert(i18nText.msgUpdated);
            loadList();
            loadDetail(body.datasetId);
          } else {
            alert(resp?.resultMessage || i18nText.msgErrorOnUpdate);
          }
        },
        () => alert(i18nText.msgErrorOnUpdate)
      );
    }
  };

  const handleDelete = () => {
    if (isNew || !datasetId.trim()) return;
    if (!window.confirm(i18nText.msgConfirmDeleteDataset)) return;
    const q = new URLSearchParams({ datasetId: datasetId.trim(), cmpnyCd: cmpnyCd.trim() });
    EgovNet.requestFetch(
      `/widgetDataSet?${q.toString()}`,
      { method: "DELETE", headers: { "Content-type": "application/json" } },
      (resp) => {
        if (Number(resp?.resultCode) === Number(CODE.RCV_SUCCESS)) {
          alert(i18nText.msgDeleted);
          handleReset();
          loadList();
        } else {
          alert(resp?.resultMessage || i18nText.msgErrorOnDelete);
        }
      },
      () => alert(i18nText.msgErrorOnDelete)
    );
  };

  const handlePreview = () => {
    const cfg = buildBodyConfigJson();
    if (cfg === null) return;
    const sessionUser = getSessionItem("loginUser");
    const uid = sessionUser?.id != null ? String(sessionUser.id) : "";
    const cc = String(cmpnyCd || "").trim();
    const previewParams: Record<string, string> = {
      companyCd: cc,
      cmpnyCd: cc,
      userId: uid,
      listCnt: "100",
      todayDt: new Date().toISOString().slice(0, 10),
      searchdate: formatLocalYmd(),
    };
    if (datasetTy.trim().toUpperCase() === "API" && apiPreviewAuthkey.trim()) {
      previewParams.authkey = apiPreviewAuthkey.trim();
    }
    EgovNet.requestFetch(
      "/widgetDataSet/preview",
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          datasetTy: datasetTy.trim(),
          configJson: cfg,
          previewParams,
        }),
      },
      (resp) => {
        const r = resp?.result as { columns?: string[]; rows?: Record<string, unknown>[]; message?: string };
        if (r?.message) {
          setPreviewMsg(r.message);
          setPreviewCols([]);
          setPreviewRows([]);
          return;
        }
        setPreviewMsg(null);
        setPreviewCols(Array.isArray(r?.columns) ? r.columns : []);
        setPreviewRows(Array.isArray(r?.rows) ? r.rows : []);
      },
      () => alert(i18nText.msgErrorOnPreviewRequest)
    );
  };

  const onChangeDatasetTy = (ty: string) => {
    const u = ty.toUpperCase();
    setDatasetTy(u);
    setSubTab("primary");
    if (u === "SQL") {
      try {
        const o = JSON.parse(configJson || "{}") as { query?: string };
        setSqlQuery(typeof o.query === "string" ? o.query : "");
        const { query: _q, ...rest } = o as { query?: string;[k: string]: unknown };
        setSqlRestJson(JSON.stringify(rest, null, 2));
      } catch {
        setSqlQuery("");
        setSqlRestJson(DEFAULT_SQL_REST);
      }
    } else if (u === "STATIC") {
      setConfigJson((prev) => (prev && prev !== "{}" ? prev : DEFAULT_STATIC));
    } else if (u === "API") {
      setConfigJson((prev) => (prev && prev !== "{}" ? prev : DEFAULT_API));
    }
  };

  const renderEditor = () => {
    const ty = datasetTy.toUpperCase();
    if (ty === "SQL") {
      return (
        <div className="md-widget-editor">
          <div className="md-widget-editor__tabs">
            <button
              type="button"
              className={`md-widget-editor__tab ${subTab === "primary" ? "is-active" : ""}`}
              onClick={() => setSubTab("primary")}
            >
              {i18nText.etcQuery}
            </button>
            <button
              type="button"
              className={`md-widget-editor__tab ${subTab === "config" ? "is-active" : ""}`}
              onClick={() => setSubTab("config")}
            >
              {i18nText.etcConfig}
            </button>
          </div>
          {subTab === "primary" ? (
            <textarea
              className="f_textarea md-widget-editor__area"
              rows={12}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder={i18nText.placeholderSelectOnlyQuery}
            />
          ) : (
            <textarea
              className="f_textarea md-widget-editor__area"
              rows={12}
              value={sqlRestJson}
              onChange={(e) => setSqlRestJson(e.target.value)}
              placeholder={i18nText.placeholderConfigListJson}
            />
          )}
          <p className="md-widget-hint">{i18nText.etcHintSqlBind}</p>
        </div>
      );
    }
    if (ty === "API") {
      return (
        <div className="md-widget-editor">
          <textarea
            className="f_textarea md-widget-editor__area"
            rows={14}
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            placeholder={i18nText.placeholderApiConfigExample}
          />
          <p className="f_label" style={{ marginTop: 10, marginBottom: 4 }}>
            {i18nText.etcLabelApiPreviewAuthkey}
          </p>
          <input
            type="password"
            className="f_input"
            autoComplete="off"
            value={apiPreviewAuthkey}
            onChange={(e) => setApiPreviewAuthkey(e.target.value)}
            placeholder={i18nText.placeholderConfigAuthReplace}
            style={{ width: "100%", maxWidth: 480 }}
          />
          <p className="md-widget-hint">{i18nText.etcHintApiPreview}</p>
        </div>
      );
    }
    /* STATIC */
    return (
      <div className="md-widget-editor">
        <p className="f_label" style={{ marginBottom: 8 }}>
          {i18nText.etcDataJson}
        </p>
        <textarea
          className="f_textarea md-widget-editor__area"
          rows={14}
          value={configJson}
          onChange={(e) => setConfigJson(e.target.value)}
          placeholder={i18nText.placeholderItemsJsonExample}
        />
      </div>
    );
  };

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="location">
          <h1 className="location__title">{i18nText.pageTitle}</h1>
          <ul>
            <li>
              <Link to={URL.MAIN} className="home">
                {i18nText.navHome}
              </Link>
            </li>
            <li>
              <Link to={URL.SITES}>{i18nText.navSiteManage}</Link>
            </li>
            <li>{i18nText.pageTitle}</li>
          </ul>
        </div>

        <div className="layout">
          <div className="contents md-widget-dataset-page">
            <div className="condition md-condition md-condition-plain-row">
              <div className="left-box">
                <label className="f_select" htmlFor="wds_cmpny">
                  <select
                    id="wds_cmpny"
                    value={cmpnyCd}
                    onChange={(e) => onCompanyChange(e.target.value)}
                  >
                    {companyList.map((c) => (
                      <option key={c.cmpnyCd} value={c.cmpnyCd}>
                        {c.cmpnyNm}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="right-box">
                <button type="button" className="pd-btn" onClick={handleReset}>{i18nText.btnReset}</button>
                <button type="button" className="pd-btn" onClick={handleCopy}>{i18nText.btnCopy}</button>
                <button type="button" className="pd-btn" onClick={handleDelete} disabled={isNew} style={{ opacity: isNew ? 0.5 : 1, cursor: isNew ? "not-allowed" : "pointer" }}>{i18nText.btnDelete}</button>
                <button type="button" className="pd-btn primary" onClick={handleSave}>{i18nText.btnSave}</button>
              </div>
            </div>

            <div
              className="md-widget-dataset-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.2fr)",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              <section className="md-form-card md-widget-dataset-left">
                <h3 className="system-subtitle" style={{ margin: 0, marginBottom: "12px" }}>
                  {i18nText.titleDatasetList}
                </h3>
                <div className="f_group pop_form_label_top md-wds-list-search-row">
                  <div className="md-wds-list-search-field">
                    <label className="f_label" htmlFor="wds_list_search_ty">
                      {i18nText.labelType}
                    </label>
                    <select
                      id="wds_list_search_ty"
                      className="f_select"
                      value={searchDataType}
                      onChange={(e) => setSearchDataType(e.target.value)}
                    >
                      <option value="">{i18nText.etcAll}</option>
                      {dataTypeOptions.map((o) => (
                        <option key={o.code} value={o.code}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md-wds-list-search-field md-wds-list-search-field--grow">
                    <label className="f_label" htmlFor="wds_list_search_name">
                      {i18nText.labelDataName}
                    </label>
                    <input
                      id="wds_list_search_name"
                      className="f_input"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder={i18nText.placeholderSearchDataName}
                    />
                  </div>
                  <button type="button" className="pd-btn primary" onClick={() => loadList()}>
                    {i18nText.btnSearch}
                  </button>
                </div>

                <div
                  className="board_list BRD006 md-admin-list md-widget-dataset-list board_list--flat"
                  style={{ maxHeight: 520, overflow: "auto" }}
                >
                  <div className="head">
                    <span>{i18nText.labelDataName}</span>
                    <span>{i18nText.labelType}</span>
                    <span>{i18nText.labelUpdateDate}</span>
                    <span>{i18nText.etcColumnUse}</span>
                  </div>
                  <div className="result">
                    {list.map((row) => (
                      <button
                        type="button"
                        key={row.datasetId}
                        className={`list_item ${selectedId === row.datasetId && !isNew ? "is-selected" : ""}`}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background: selectedId === row.datasetId && !isNew ? "var(--md-surface-variant, #e8eef2)" : "transparent",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--md-outline-variant, #e0e0e0)",
                        }}
                        onClick={() => loadDetail(row.datasetId)}
                      >
                        <span className="ellipsis" title={row.datasetName}>
                          {row.datasetName}
                        </span>
                        <span>{row.datasetTy}</span>
                        <span>{row.modifyDt || "-"}</span>
                        <span>{row.useFl}</span>
                      </button>
                    ))}
                    {list.length === 0 && <div className="list_item" style={{ padding: 16, color: "#666" }}>{i18nText.msgNoQueryResult}</div>}
                  </div>
                </div>
              </section>

              <section className="md-form-card md-widget-dataset-right">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "15px",
                    flexShrink: 0,
                  }}
                >
                  <h3 className="system-subtitle" style={{ margin: 0 }}>
                    {i18nText.titleDatasetInfo}
                  </h3>
                </div>

                <div className="f_group pop_form_label_top" style={{ marginTop: 16 }}>
                  <div className="md-bbs-basic-form-grid">
                    <label className="f_label md-bbs-form-label" htmlFor="wds_dataset_name">
                      {i18nText.labelDataName}
                      <span className="req">*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        id="wds_dataset_name"
                        className="f_input"
                        value={datasetName}
                        maxLength={MAX_DATASET_NAME}
                        onChange={(e) => setDatasetName(e.target.value)}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="widgetdataset_datasetId">
                      {i18nText.labelDataId}
                      <span className="req">*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <input
                        id="widgetdataset_datasetId"
                        ref={datasetIdInputRef}
                        className="f_input"
                        value={datasetId}
                        maxLength={MAX_DATASET_ID}
                        onChange={(e) => setDatasetId(e.target.value)}
                        readOnly={!isNew}
                        disabled={!isNew}
                      />
                    </div>
                    <label className="f_label md-bbs-form-label" htmlFor="wds_dataset_ty">
                      {i18nText.labelDataType}
                      <span className="req">*</span>
                    </label>
                    <div className="md-bbs-form-control">
                      <select id="wds_dataset_ty" className="f_select" value={datasetTy} onChange={(e) => onChangeDatasetTy(e.target.value)}>
                        {dataTypeOptions.length > 0 ? (
                          dataTypeOptions.map((o) => (
                            <option key={o.code} value={o.code}>
                              {o.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="SQL">SQL</option>
                            <option value="API">API</option>
                            <option value="STATIC">STATIC</option>
                          </>
                        )}
                      </select>
                    </div>
                    <span className="f_label md-bbs-form-label" id="wds_use_label">
                      {i18nText.labelUseYn}
                    </span>
                    <div className="md-bbs-form-control" role="group" aria-labelledby="wds_use_label">
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="wds_use"
                            value="Y"
                            checked={useFl === "Y"}
                            onChange={(e) => setUseFl(e.target.value)}
                          />
                          <span>{i18nText.etcUse}</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="wds_use"
                            value="N"
                            checked={useFl === "N"}
                            onChange={(e) => setUseFl(e.target.value)}
                          />
                          <span>{i18nText.etcNotUse}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {renderEditor()}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "20px",
                    marginBottom: "12px",
                    flexShrink: 0,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <h3 className="system-subtitle" style={{ margin: 0 }}>
                    {i18nText.titleDatasetPreview}
                  </h3>
                  <button type="button" className="btn btn_blue_h46" onClick={handlePreview}>
                    {i18nText.btnPreview}
                  </button>
                </div>
                {previewMsg && <p className="md-widget-preview-msg">{previewMsg}</p>}
                <div className="board_list BRD006" style={{ overflow: "auto", maxHeight: 280 }}>
                  <table className="md-widget-preview-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {previewCols.map((c) => (
                          <th key={c} style={{ border: "1px solid #ddd", padding: 6, background: "#f5f5f5" }}>
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((r, i) => (
                        <tr key={i}>
                          {previewCols.map((c) => (
                            <td key={c} style={{ border: "1px solid #eee", padding: 6 }}>
                              {r[c] != null ? String(r[c] as string) : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!previewMsg && previewRows.length === 0 && (
                    <p style={{ padding: 12, color: "#888" }}>{i18nText.msgNoPreviewResult}</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WidgetDataSetList;
