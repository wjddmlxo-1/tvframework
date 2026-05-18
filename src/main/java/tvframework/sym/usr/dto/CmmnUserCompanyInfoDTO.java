package tvframework.sym.usr.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 회사별 사용자 정보 한 행 (상세 조회 - 회사별 정보)
 */
@Getter
@Setter
public class CmmnUserCompanyInfoDTO {
    /** CM_USER_ORGNZT_MBRSH.MBRSH_SQ */
    private Long mbrshSq;
    /** CM_USER_ORGNZT_MBRSH.CMPNY_CD */
    private String companyCode;
    /** CM_CMPNY.CMPNY_NM (없으면 회사코드) */
    private String companyNm;
    private String emplNo;
    private String ofcpsCd;
    private String offmTelno;
    private String emailAdres;
    private String ecnyYmd;
    private String retireYmd;
    private String deptCd;
    private String deptNm;
}
