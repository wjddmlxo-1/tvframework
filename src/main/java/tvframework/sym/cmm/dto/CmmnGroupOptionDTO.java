package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 그룹 선택 옵션 DTO (그룹 조회)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnGroupOptionDTO {

    /** 그룹ID */
    private String groupId;
    /** 그룹명 */
    private String groupNm;
}
