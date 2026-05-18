package tvframework.sym.msg.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * 다국어 메시지 삭제 요청 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnMessageDeleteRequestDTO {
    private String cmpnyCd;
    private String langGb;
    private List<String> langKeys;
}

