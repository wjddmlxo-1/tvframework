package tvframework.sit.wgt.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯-권한 조회 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Getter
@Setter
@Schema(description = "위젯 권한")
public class WidgetAuthorDTO {

    @Schema(description = "권한코드")
    private String authorCd;

    @Schema(description = "권한명")
    private String authorNm;

    @Schema(description = "권한 설명")
    private String authorCn;
}
