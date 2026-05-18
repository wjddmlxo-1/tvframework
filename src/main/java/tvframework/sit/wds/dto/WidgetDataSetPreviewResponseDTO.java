package tvframework.sit.wds.dto;

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯 데이터셋 미리보기 응답
 */
@Getter
@Setter
@Schema(description = "위젯 데이터셋 미리보기 응답")
public class WidgetDataSetPreviewResponseDTO {

    @Schema(description = "컬럼명(순서)")
    private List<String> columns;

    @Schema(description = "행 데이터")
    private List<Map<String, Object>> rows;

    @Schema(description = "오류 또는 안내 메시지")
    private String message;
}
