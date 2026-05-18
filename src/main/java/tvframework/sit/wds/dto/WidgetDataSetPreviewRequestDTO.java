package tvframework.sit.wds.dto;

import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯 데이터셋 미리보기 요청
 */
@Getter
@Setter
@Schema(description = "위젯 데이터셋 미리보기 요청")
public class WidgetDataSetPreviewRequestDTO {

    @Schema(description = "데이터유형 SQL/API/STATIC")
    private String datasetTy;

    @Schema(description = "병합된 설정 JSON")
    private String configJson;

    @Schema(description = "바인딩 변수(:companyCd 등)")
    private Map<String, String> previewParams;
}
