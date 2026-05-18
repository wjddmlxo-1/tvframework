package tvframework.sym.mnu.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 메뉴 등록/수정 요청 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnMenuRequestDTO {
    private String cmpnyCd;
    private String menuId;
    private String menuNmCd;
    private String progrmFileNm;
    private String upperMenuId;
    private String sortOrd;
    private String menuDc;
    private String useFl;
    private String imagePath;
    private String imageNm;
}
