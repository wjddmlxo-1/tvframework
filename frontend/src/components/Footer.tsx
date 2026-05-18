import { Link } from "react-router-dom";

import { useCmmnScreenI18n } from "@/hooks/useCmmnScreenI18n";
import {
  CMMN_LAYOUT_FOOTER_I18N_KEYS,
  CMMN_LAYOUT_FOOTER_I18N_FALLBACK,
} from "@/components/cmmnLayoutChromeI18n";
import { getSessionItem } from "@/utils/storage";

import logoFooterImg from "/assets/images/logo_footer_w.png";
import logoFooterImgMobile from "/assets/images/logo_footer_m.png";
import bannerImg_01 from "/assets/images/banner_w_01.png";
import bannerImgMobile_01 from "/assets/images/banner_m_01.png";
import bannerImg_02 from "/assets/images/banner_w_02.png";
import bannerImgMobile_02 from "/assets/images/banner_m_02.png";

function Footer() {
  const cmpnyCd = String(getSessionItem("selectedCmpnyCd") ?? "").trim();
  const footerI18n = useCmmnScreenI18n(CMMN_LAYOUT_FOOTER_I18N_KEYS, CMMN_LAYOUT_FOOTER_I18N_FALLBACK, {
    cmpnyCd,
  });

  return (
    <div className="footer">
      <div className="inner">
        <h1>
          <Link to="">
          {/*
            <img className="w" src={logoFooterImg} alt="" />
            <img className="m" src={logoFooterImgMobile} alt="" />
          */}            
          </Link>
        </h1>
        <div className="info">
          <p>
            {footerI18n.labelContactEmail} : wjddmlxo@gmail.com{" "}
            <span className="m_hide">|</span>
            <br className="m_show" /> {footerI18n.labelContactPhone} : 010-6633-1086
            <br />
            </p>
          <p className="copy">{footerI18n.footerCopyright}</p>
        </div>
        <div className="right_col">
          {/*
          <Link to="">
            <img className="w" src={bannerImg_01} alt="" />
            <img className="m" src={bannerImgMobile_01} alt="" />
          </Link>
          <Link to="">
            <img className="w" src={bannerImg_02} alt="" />
            <img className="m" src={bannerImgMobile_02} alt="" />
          </Link>
          */}    
        </div>
      </div>
    </div>
  );
}

export default Footer;
