import React, { useState, useEffect } from "react";

import * as EgovNet from "@/api/egovFetch";
import { decodeHtmlEntities } from "@/utils/htmlDecode";

import { CMMN_MESSAGE_I18N_FALLBACK, type CmmnMessageI18nText } from "./cmmnMessageI18n";

function CmmnMessageDetail({
  message,
  langGb,
  cmpnyCd,
  onClose,
  i18nText,
}: {
  message: { langKey?: string } | null;
  langGb: string;
  cmpnyCd: string | null | undefined;
  onClose?: () => void;
  i18nText?: Partial<CmmnMessageI18nText>;
}) {
  const t: CmmnMessageI18nText = { ...CMMN_MESSAGE_I18N_FALLBACK, ...i18nText };
  console.group("CmmnMessageDetail");
  console.log("[Start] CmmnMessageDetail ------------------------------");

  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    if (message && message.langKey) {
      const params = new URLSearchParams();
      params.set("langKey", message.langKey);
      params.set("langGb", langGb || "");
      if (cmpnyCd) params.set("cmpnyCd", cmpnyCd);
      const retrieveURL = `/cmmnMessage/detail?${params.toString()}`;
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      };

      EgovNet.requestFetch(
        retrieveURL,
        requestOptions,
        (resp) => {
          if (resp.result) {
            setDetailData(resp.result);
          }
        },
        function (resp) {
          console.log("err response : ", resp);
          alert(t.msgErrorOnRetrieve);
        }
      );
    }
  }, [message, langGb, cmpnyCd, i18nText]);

  const handleClose = () => {
    onClose?.();
  };

  console.log("------------------------------CmmnMessageDetail [End]");
  console.groupEnd("CmmnMessageDetail");

  if (!detailData) {
    return null;
  }

  return (
    <div className="wrap_pop">
      <div className="pop_inner pop_inner_w800">
        <div className="pop_header">
          <h1>{t.titleI18nSearch}</h1>
          <button className="btn close" type="button" onClick={handleClose}>
            {t.btnClose}
          </button>
        </div>

        <div className="pop_container">
          <div className="board_view2">
            <dl>
              <dt>{t.colCategory}</dt>
              <dd>{detailData.langGb || ""}</dd>
            </dl>

            <dl>
              <dt>{t.colLangKey}</dt>
              <dd>{detailData.langKey || ""}</dd>
            </dl>

            <dl>
              <dt>{t.labelMessage}</dt>
              <dd>
                <table>
                  <thead>
                    <tr>
                      <th>{t.labelLangCode}</th>
                      <th>{t.labelMessage}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailData.messages &&
                      detailData.messages.map((msg, index) => (
                        <tr key={index}>
                          <td>{msg.langName || msg.langCode}</td>
                          <td>{decodeHtmlEntities(msg.messageCn || "")}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </dd>
            </dl>
          </div>

          <div className="board_btn_area">
            <div className="right_col btn1">
              <button className="btn btn_blue_h46 w_100" onClick={handleClose}>
                {t.btnClose}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CmmnMessageDetail;

