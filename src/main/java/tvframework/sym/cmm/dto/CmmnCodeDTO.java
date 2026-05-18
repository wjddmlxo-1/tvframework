package tvframework.sym.cmm.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * 공통코드 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnCodeDTO {
    private String codeId;
    private String upperCodeId;
    private String useFl;
    private String codeCn;
    private String codeName;
    private String codeLangKey;
    private String codeGb;
    private List<CodeDetailDTO> codeDetailList;
}

