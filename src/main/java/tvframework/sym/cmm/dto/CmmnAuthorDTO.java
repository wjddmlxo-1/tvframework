package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 권한 정보 DTO (테이블: CM_AUTHOR)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnAuthorDTO {

    /** 회사코드 */
    private String cmpnyCd;
    /** 권한코드 */
    private String authorCd;
    /** 권한명 */
    private String authorNm;
    /** 권한설명 */
    private String authorCn;
    /** 사용여부 */
    private String useFl;
    /** 생성일자 */
    private String creationDt;
    /** 회사명 (조인) */
    private String cmpnyNm;
}
