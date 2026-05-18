package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자 검색 결과 DTO (사용자/그룹 사용자 조회)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnUserSearchDTO {

    /** 구성원번호 (CM_USER_ORGNZT_MBRSH.MBRSH_SQ) */
    private String mbrshSq;
    /** 사용자ID */
    private String userId;
    /** 사용자명 */
    private String userNm;
    /** 부서코드 */
    private String deptCd;
    /** 부서명 */
    private String deptNm;
    /** 그룹ID (그룹 사용자 조회 시) */
    private String groupId;
}
