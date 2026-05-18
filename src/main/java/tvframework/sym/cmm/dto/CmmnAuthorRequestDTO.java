package tvframework.sym.cmm.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/**
 * 권한 등록/수정 요청 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnAuthorRequestDTO {

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
    /** 권한 사용자 목록 */
    private List<CmmnAuthorUserDTO> authorUserList;
    /** 권한 메뉴 목록 (MENU_ID만) */
    private List<String> menuIdList;
}
