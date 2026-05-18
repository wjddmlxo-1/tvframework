package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/** 권한 구조(상위-하위) 엣지 */
@Getter
@Setter
public class CmmnAuthorHierarchyEdgeDTO {

    private String cmpnyCd;
    private String upperAuthorCd;
    private String lowerAuthorCd;
}
