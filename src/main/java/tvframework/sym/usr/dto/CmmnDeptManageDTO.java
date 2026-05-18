package tvframework.sym.usr.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 부서 정보 DTO (CM_DEPT) - 사용자관리 화면용
 */
@Getter
@Setter
public class CmmnDeptManageDTO {
    private String cmpnyCd;
    private String deptCd;
    private String deptNmKey;
    private String deptNm;
    private String upperDeptCd;
    private String upperDeptNmKey;
    private String upperDeptNm;
    private String deptGradCd;
    /** CM_DEPT.DPRLR_ID — 실제 저장값은 회사소속(MBRSH_SQ) */
    private String dprlrId;
    /** 부서장 사용자 ID (표시용) */
    private String dprlrUserId;
    private String dprlrNm;
    private String exprtnYmd;
    private String useFl;
    private String sortOrd;
}
