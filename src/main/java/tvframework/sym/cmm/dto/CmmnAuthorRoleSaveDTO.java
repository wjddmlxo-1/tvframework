package tvframework.sym.cmm.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

/** 권한에 매핑할 롤 일괄 저장 */
@Getter
@Setter
public class CmmnAuthorRoleSaveDTO {

    private String cmpnyCd;
    private String authorCd;
    private List<String> roleCdList;
}
