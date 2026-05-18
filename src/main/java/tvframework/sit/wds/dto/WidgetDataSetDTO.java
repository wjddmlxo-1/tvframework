package tvframework.sit.wds.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯 데이터셋 DTO (CM_WIDGET_DATASET)
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.02
 */
@Getter
@Setter
@Schema(description = "위젯 데이터셋")
public class WidgetDataSetDTO {

    @Schema(description = "데이터셋ID")
    private String datasetId;

    @Schema(description = "회사코드")
    private String cmpnyCd;

    @Schema(description = "데이터셋명")
    private String datasetName;

    @Schema(description = "데이터유형(SQL/API/STATIC)")
    private String datasetTy;

    @Schema(description = "설정 JSON 문자열")
    private String configJson;

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
