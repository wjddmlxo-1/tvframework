package tvframework.sym.cmm.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 코드 상세 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CodeDetailDTO {
    private String codeId;
    private String detailCodeId;
    private String detailCodeValue;
    private String codeLangKey;
    private String codeName;
    private Integer sortingSq;
    private String useFl;
}

