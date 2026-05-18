package tvframework.sit.wgs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯 스타일 미리보기 기본 샘플 (classpath JSON 설정에서 로드).
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Getter
@Setter
@Schema(description = "스타일 유형별 미리보기 HTML/CSS 샘플")
public class WidgetStylePreviewSampleDTO {

    @Schema(description = "HTML 템플릿 (토큰 {{WGS_*}} 등)")
    private String htmlTemplate;

    @Schema(description = "CSS 템플릿 (토큰 {{WGS_*}} 등)")
    private String cssTemplate;
}
