import { useNavigate, useLocation } from "react-router-dom";
import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import { CMMN_COMPONENT_I18N_FALLBACK, CMMN_COMPONENT_I18N_KEYS } from "@/components/cmmnComponentI18n";

function Error() {
  const navigate = useNavigate();
  const location = useLocation();
  const i18nText = useCmmnScreenI18n(CMMN_COMPONENT_I18N_KEYS, CMMN_COMPONENT_I18N_FALLBACK);

  const state = (location.state as { msg?: string } | null) ?? {};
  let errormessage = state.msg || i18nText.msgUnknownError;

  if (errormessage === "No message available") {
    errormessage = i18nText.msgUnknownError;
  }

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="ERROR">
      <h1>{i18nText.etcErrorTitle}</h1>
      <div className="box">
        <p>{errormessage}</p>
        <div className="btn_area">
          <button className="btn btn_blue_h46 w_130" onClick={goBack}>
            {i18nText.btnPrevPage}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Error;
