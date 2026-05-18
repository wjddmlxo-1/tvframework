package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 권한 메뉴 DTO (테이블: CM_AUTHOR_MENU)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnAuthorMenuDTO {

    /** 회사코드 */
    private String cmpnyCd;
    /** 권한코드 */
    private String authorCd;
    /** 메뉴번호 */
    private String menuId;
    /** 정렬순서 */
    private String sortOrd;
}
