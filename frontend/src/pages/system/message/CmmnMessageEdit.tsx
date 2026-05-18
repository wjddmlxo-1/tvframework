import React, { useState, useEffect, useCallback } from "react";

import * as EgovNet from "@/api/egovFetch";
import { decodeHtmlEntities } from "@/utils/htmlDecode";

import { CMMN_MESSAGE_I18N_FALLBACK, type CmmnMessageI18nText } from "./cmmnMessageI18n";

function CmmnMessageEdit({
  mode,
  message,
  langGb,
  category,
  cmpnyCd,
  onClose,
  i18nText,
}: {
  mode: string;
  message: unknown;
  langGb: string;
  category: string;
  cmpnyCd: string | null | undefined;
  onClose: () => void;
  /** 생략 시 `CMMN_MESSAGE_I18N_FALLBACK` (전용 라우트 등) */
  i18nText?: Partial<CmmnMessageI18nText>;
}) {
  const t: CmmnMessageI18nText = { ...CMMN_MESSAGE_I18N_FALLBACK, ...i18nText };
  console.group("CmmnMessageEdit");
  console.log("[Start] CmmnMessageEdit ------------------------------");

  const [formData, setFormData] = useState({
    langGb: category || "",
    langKey: "",
    messages: {}, // 동적으로 언어 목록에 따라 생성됨
  });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [langCodeOptions, setLangCodeOptions] = useState([]);

  // 구분 목록 조회 (CmmnMessage selectLanguages 단일 소스, 회사코드 사용)
  const retrieveCategoryOptions = useCallback(() => {
    const companyCode = String(cmpnyCd ?? "").trim();
    if (!companyCode) return;
    const langCodeParam = langGb || "ko_KR";
    const params = new URLSearchParams({ langCode: langCodeParam, cmpnyCd: companyCode });
    const retrieveListURL = `/cmmnMessage/categories?${params.toString()}`;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        if (resp.result && resp.result.length > 0) {
          setCategoryOptions(resp.result);
        }
      },
      function (resp) {
        console.log("err response : ", resp);
      }
    );
  }, [langGb, cmpnyCd]);

  // 언어 코드 목록 조회 (CmmnMessage selectLanguages 단일 소스, 회사코드 사용)
  const retrieveLangCodeOptions = useCallback(() => {
    const companyCode = String(cmpnyCd ?? "").trim();
    if (!companyCode) return;
    const langCodeParam = langGb || "ko_KR";
    const params = new URLSearchParams({ langCode: langCodeParam, cmpnyCd: companyCode });
    const retrieveListURL = `/cmmnMessage/languages?${params.toString()}`;
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        if (resp.result && resp.result.length > 0) {
          setLangCodeOptions(resp.result);
        }
      },
      function (resp) {
        console.log("err response : ", resp);
      }
    );
  }, [langGb, cmpnyCd]);

  useEffect(() => {
    retrieveCategoryOptions();
    retrieveLangCodeOptions();
  }, [retrieveCategoryOptions, retrieveLangCodeOptions]);

  // 언어 목록이 로드되면 messages 초기화
  useEffect(() => {
    if (langCodeOptions.length === 0) {
      return; // 언어 목록이 없으면 초기화하지 않음
    }

    // 언어 목록을 기반으로 messages 객체 생성
    const initialMessages = {};
    langCodeOptions.forEach((lang) => {
      initialMessages[lang.code] = "";
    });

    if (message) {
      // 수정 모드: message에서 해당 언어의 메시지 값을 가져옴
      setFormData((prev) => ({
        langGb: message.langGb || category || prev.langGb || "",
        langKey: message.langKey || prev.langKey || "",
        messages: langCodeOptions.reduce((acc, lang) => {
          // message 객체에서 해당 언어 코드의 값을 찾음
          // message.ko_KR, message.en_US 등의 형식 또는 message.messages 배열에서 찾음
          let messageValue = "";
          if (message[lang.code] !== undefined) {
            messageValue = message[lang.code] || "";
          } else if (message.messages && Array.isArray(message.messages)) {
            const msgItem = message.messages.find((msg) => msg.langCode === lang.code);
            messageValue = msgItem ? msgItem.messageCn || "" : "";
          }
          // HTML 엔티티 디코딩
          acc[lang.code] = decodeHtmlEntities(messageValue);
          return acc;
        }, {}),
      }));
    } else {
      // 등록 모드: 빈 값으로 초기화
      setFormData((prev) => ({
        langGb: category || prev.langGb || "",
        langKey: prev.langKey || "",
        messages: initialMessages,
      }));
    }
  }, [langCodeOptions, message, category]);

  const handleInputChange = (field, value) => {
    if (field.startsWith("messages.")) {
      const langCode = field.replace("messages.", "");
      setFormData((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [langCode]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = () => {
    // 필수 입력 검증
    if (!formData.langGb) {
      alert(t.msgRequiredCategory);
      return;
    }
    if (!formData.langKey) {
      alert(t.msgRequiredLangKey);
      return;
    }

    const saveURL = mode === "create" ? `/cmmnMessage` : `/cmmnMessage/${formData.langKey}`;
    const body: Record<string, unknown> = {
      langGb: formData.langGb,
      langKey: formData.langKey,
      messages: Object.entries(formData.messages).map(([langCode, messageCn]) => ({
        langCode,
        messageCn,
      })),
    };
    if (cmpnyCd) body.cmpnyCd = cmpnyCd;
    const requestOptions = {
      method: mode === "create" ? "POST" : "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    };

    EgovNet.requestFetch(
      saveURL,
      requestOptions,
      (resp) => {
        alert(mode === "create" ? t.msgRegistered : t.msgUpdated);
        onClose();
      },
      function (resp) {
        console.log("err response : ", resp);
        alert(t.msgErrorOnSave);
      }
    );
  };

  const handleClose = () => {
    onClose();
  };

  console.log("------------------------------CmmnMessageEdit [End]");
  console.groupEnd();

  return (
    <div className="wrap_pop">
      <div className="pop_inner pop_inner_w800 pop_msg_edit">
        <div className="pop_header">
          <h1>{mode === "create" ? t.titleI18nCreate : t.titleI18nDetail}</h1>
          <button type="button" className="pop_close" onClick={handleClose} aria-label={t.btnClose} />
        </div>

        <div className="pop_container">
          <div className="board_view2 pop_form_label_top">
            <div className="pop_form_row pop_form_row_two">
              <dl>
                <dt>
                  <label htmlFor="langGb">{t.colCategory}<span className="req_asterisk">*</span></label>
                </dt>
                <dd>
                  <label className="f_select w_full" htmlFor="langGb">
                    <select
                      id="langGb"
                      value={formData.langGb}
                      onChange={(e) => handleInputChange("langGb", e.target.value)}
                      disabled={mode === "modify"}
                    >
                      <option value="">{t.etcSelectPlaceholder}</option>
                      {categoryOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </dd>
              </dl>
              <dl>
                <dt>
                  <label htmlFor="langKey">{t.colLangKey}<span className="req_asterisk">*</span></label>
                </dt>
                <dd>
                  <input
                    className="f_input w_full"
                    type="text"
                    id="langKey"
                    value={formData.langKey}
                    onChange={(e) => handleInputChange("langKey", e.target.value)}
                    disabled={mode === "modify"}
                    placeholder={t.searchPlaceholder}
                  />
                </dd>
              </dl>
            </div>

            <dl>
              <dt>
                <label>{t.labelMessage}</label>
              </dt>
              <dd>
                <div className="board_list md-msg-edit-list">
                  <div className="head">
                    <span className="md-col-lang">{t.labelLanguage}</span>
                    <span className="md-col-msg">{t.labelMessage}</span>
                  </div>
                  <div className="result">
                    {langCodeOptions.map((lang) => (
                      <div key={lang.code} className="list_item">
                        <div className="md-col-lang">{lang.name}</div>
                        <div className="md-col-msg">
                          <input
                            className="f_input w_full"
                            type="text"
                            value={formData.messages[lang.code] || ""}
                            onChange={(e) => handleInputChange(`messages.${lang.code}`, e.target.value)}
                            placeholder={(t.enterLangMessage || "{langName} 메시지 입력").replace(
                              /\{langName\}/g,
                              lang.name
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </dd>
            </dl>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button className="pd-btn primary" onClick={handleSave}>
              {t.btnSave}
            </button>
            <button className="pd-btn" onClick={handleClose}>
              {t.btnClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnMessageEdit;

