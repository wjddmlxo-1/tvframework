package tvframework.sym.msg.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * UI 번역 일괄 조회 행 (LANG_KEY · MESSAGE_CN)
 */
@Getter
@Setter
public class CmmnMessageTextRowDTO {
    private String langKey;
    private String messageCn;
}
