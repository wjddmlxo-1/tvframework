package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 회사 선택 옵션 DTO (회사명 드롭다운용)
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnCompanyOptionDTO {

    /** 회사코드 */
    private String cmpnyCd;
    /** 회사명 */
    private String cmpnyNm;
}
