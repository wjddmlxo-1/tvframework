package tvframework.sym.cmm.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * 코드 트리 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CodeTreeDTO {
    private String codeId;
    private String name;
    private String upperCodeId;
    private String useFl;
    private String path;
    private Integer level;
    private List<CodeTreeDTO> children;
}

