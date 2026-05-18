package tvframework.man.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * CM_DASHBRD 대시보드 정보 DTO (메인 홈 화면 저장/조회).
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.10
 */
@Getter
@Setter
@Schema(description = "대시보드(CM_DASHBRD)")
public class WidgetDTO {

    @Schema(description = "대시보드ID", maxLength = 50)
    private String dashbrdId;

    @Schema(description = "회사코드", maxLength = 20)
    private String cmpnyCd;

    @Schema(description = "구성원번호(기본값 저장 시 null)")
    private BigDecimal mbrshSq;

    @Schema(description = "배치JSON 문자열")
    private String layoutJson;

    @Schema(description = "설정JSON 문자열")
    private String configJson;

    @Schema(description = "사용여부 Y/N", maxLength = 1)
    private String useFl;

    @Schema(description = "생성자아이디", maxLength = 20)
    private String creationId;

    @Schema(description = "생성일시")
    private String creationDt;

    @Schema(description = "수정자아이디", maxLength = 20)
    private String updateId;

    @Schema(description = "수정일시")
    private String updateDt;
}
