package tvframework.sym.msg.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 메시지 상세 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class MessageDetailDTO {
    private String langCode;
    private String langName;
    private String messageCn;
}

