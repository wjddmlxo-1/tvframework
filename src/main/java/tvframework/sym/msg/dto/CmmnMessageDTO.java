package tvframework.sym.msg.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 다국어 메시지 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnMessageDTO {
    private String langGb;
    private String langKey;
    private String messageCns; // 구분자(|)로 연결된 메시지들
}

