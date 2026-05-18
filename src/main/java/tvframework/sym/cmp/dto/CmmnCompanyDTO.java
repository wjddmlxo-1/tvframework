package tvframework.sym.cmp.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 회사정보 DTO (테이블: CM_CMPNY)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnCompanyDTO {

    /** CMPNY_CD - 회사코드 (PK) */
    private String cmpnyCd;
    /** CMPNY_NM - 회사명 */
    private String cmpnyNm;
    /** ENTRPRS_GB - 기업구분 */
    private String entrprsGb;
    /** BSNS_NO - 사업자등록번호 */
    private String bsnsNo;
    /** CPR_NO - 법인등록번호 */
    private String cprNo;
    /** CXFC - 대표이사 */
    private String cxfc;
    /** NATION_CD - 국가코드 */
    private String nationCd;
    /** ZIP_CD - 우편번호 */
    private String zipCd;
    /** ADRES_ONE - 주소1 */
    private String adresOne;
    /** ADRES_TWO - 주소2 */
    private String adresTwo;
    /** CITY_NM - 도시 */
    private String cityNm;
    /** STATE_NM - 주/도/광역시 */
    private String stateNm;
    /** OFFM_TELNO - 사무실전화번호 */
    private String offmTelno;
    /** FXNUM - 팩스번호 */
    private String fxnum;
    /** INDUTY_CD - 업종코드 */
    private String indutyCd;
    /** SBSCRB_DT - 가입일자 */
    private String sbscrbDt;
    /** SBSCRB_STTUS - 가입상태 */
    private String sbscrbSttus;
    /** EXPRTN_YMD - 만기일 */
    private String exprtnYmd;
    /** APPLCNT_ID - 신청자ID */
    private String applcntId;
    /** APPLCNT_NM - 신청자이름 */
    private String applcntNm;
    /** APPLCNT_EMAIL - 신청자이메일 */
    private String applcntEmail;
    /** USE_FL - 사용여부 */
    private String useFl;
    /** CREATION_ID - 생성자아이디 */
    private String creationId;
    /** CREATION_DT - 생성일자 */
    private String creationDt;
    /** UPDATE_ID - 업데이트아이디 */
    private String updateId;
    /** UPDATE_DT - 업데이트일자 */
    private String updateDt;
    /** 가입상태명 (조인, 다국어) */
    private String sbscrbSttusNm;
}
