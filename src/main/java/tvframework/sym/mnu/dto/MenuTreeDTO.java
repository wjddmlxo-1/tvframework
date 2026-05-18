package tvframework.sym.mnu.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * 메뉴 트리 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class MenuTreeDTO {
    private String cmpnyCd;
    private String menuId;
    private String menuNm;
    private String upperMenuId;
    private String sortOrd;
    private String useFl;
    private String progrmFileNm;
    /** CM_PROGRM.PROGRM_URL 우선, 없으면 CM_MENU.PROGRM_FILE_NM (사이드바 링크) */
    private String navigateUrl;
    private String imageFullPath;
    private String path;
    private Integer treeLevel;
    private List<MenuTreeDTO> children;
}
