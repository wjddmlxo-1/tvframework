package tvframework.sym.msg.dto;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * 다국어 메시지 요청 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnMessageRequestDTO {
    private String cmpnyCd;
    private String langGb;
    private String langKey;
    private List<MessageRequestItem> messages;

    @Getter
    @Setter
    public static class MessageRequestItem {
        private String langCode;
        private String messageCn;
    }
}

