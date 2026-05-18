package tvframework.sym.usr.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 회사 사용자 리스트 한 행 DTO (목록 조회)
 */
@Getter
@Setter
public class CmmnUserManageListDTO {
    private Long mbrshSq;
    private String userId;
    private String userNm;
    private String deptNm;
    private String ofcpsNm;
}
