package tvframework.sym.grp.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 그룹 사용자 DTO (CM_GROUP_USER + 사용자/부서명 조인)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnGroupUserDTO {

    /** 구성원번호 (CM_USER_ORGNZT_MBRSH.MBRSH_SQ) */
    private Long mbrshSq;
    /** 사용자ID */
    private String userId;
    /** 사용자명 */
    private String userNm;
    /** 부서명 */
    private String deptNm;
}
