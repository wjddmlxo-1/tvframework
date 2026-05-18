package tvframework.sit.wgs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯 스타일 DTO (CM_WIDGET_STYLE)
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Getter
@Setter
@Schema(description = "위젯 스타일")
public class WidgetStyleDTO {

    @Schema(description = "스타일ID")
    private String styleId;

    @Schema(description = "회사코드")
    private String cmpnyCd;

    @Schema(description = "스타일명")
    private String styleName;

    @Schema(description = "스타일유형")
    private String styleTy;

    @Schema(description = "HTML 템플릿")
    private String htmlTemplate;

    @Schema(description = "CSS 템플릿")
    private String cssTemplate;

    @Schema(description = "JS 템플릿")
    private String jsTemplate;

    @Schema(description = "사용여부 Y/N")
    private String useFl;

    @Schema(description = "생성자")
    private String creationId;

    @Schema(description = "생성일시")
    private String creationDt;

    @Schema(description = "수정자")
    private String updateId;

    @Schema(description = "수정일시")
    private String updateDt;

    @Schema(description = "목록 표시용 수정일(YYYY-MM-DD)")
    private String modifyDt;
}
