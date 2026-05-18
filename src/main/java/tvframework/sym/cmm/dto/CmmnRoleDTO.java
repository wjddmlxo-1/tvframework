package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/** CM_ROLE 조회/목록용 */
@Getter
@Setter
public class CmmnRoleDTO {

    private String cmpnyCd;
    private String roleCd;
    private String roleNm;
    private String roleTy;
    private String rolePttrn;
    private String roleDc;
    private String roleSort;
    private String creationDt;
    /** 권한-롤 매핑 화면: Y/N */
    private String mappedYn;
}
