package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 코드 옵션 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CodeOptionDTO {
    private String code;
    private String name;
    /** CM_CODE_DETAIL.DETAIL_CODE_ID (게시판유형별 기능 조회 등에 사용) */
    private String detailCodeId;
}

