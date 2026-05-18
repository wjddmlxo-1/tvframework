package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 부서 트리 노드 DTO (권한관리 부서 탭)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnDeptTreeDTO {

    /** 부서코드 */
    private String deptCd;
    /** 부서명 */
    private String deptNm;
    /** 상위부서코드 */
    private String upperDeptCd;
    /** 정렬순서 */
    private Integer sortOrd;
    /** 사용여부 */
    private String useFl;
    /** 경로 (계층 표현) */
    private String path;
    /** 트리 레벨 */
    private Integer treeLevel;
}
