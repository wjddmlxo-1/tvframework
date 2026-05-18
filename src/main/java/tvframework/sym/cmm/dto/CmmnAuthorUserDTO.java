package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 권한 사용자 DTO (테이블: CM_AUTHOR_USER)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnAuthorUserDTO {

    /** 회사코드 */
    private String cmpnyCd;
    /** 권한코드 */
    private String authorCd;
    /** 사용자유형(ROLE, USER) */
    private String userTy;
    /** USER: CM_USER_ORGNZT_MBRSH.MBRSH_SQ, GROUP: 그룹ID */
    private String userCd;
    /** 정렬순서 */
    private String sortOrd;
    /** 사용자명 (조인) */
    private String userNm;
    /** 부서명 (조인) */
    private String deptNm;
}
