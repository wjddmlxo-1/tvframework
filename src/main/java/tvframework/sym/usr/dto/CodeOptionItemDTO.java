package tvframework.sym.usr.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 코드 옵션 한 항목 (LANG_SECTION_CODE / LANG_SECTION_NAME)
 */
@Getter
@Setter
public class CodeOptionItemDTO {
    private String langSectionCode;
    private String langSectionName;
}
