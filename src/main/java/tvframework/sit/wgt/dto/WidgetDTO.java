package tvframework.sit.wgt.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 위젯 정보 DTO (CM_WIDGET 및 목록/상세 확장 필드)
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Getter
@Setter
@Schema(description = "위젯")
public class WidgetDTO {

    @Schema(description = "위젯ID")
    private String widgetId;

    @Schema(description = "회사코드")
    private String cmpnyCd;

    @Schema(description = "위젯명")
    private String widgetName;

    @Schema(description = "데이터셋ID")
    private String datasetId;

    @Schema(description = "스타일ID")
    private String styleId;

    @Schema(description = "카테고리코드")
    private String categoryCd;

    @Schema(description = "매핑JSON 문자열")
    private String mappingJson;

    @Schema(description = "설정JSON 문자열")
    private String configJson;

    @Schema(description = "파일번호")
    private String fileSq;

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

    /** 목록: 데이터 유형 코드 (CM_WIDGET_DATASET.DATASET_TY) */
    @Schema(description = "데이터 유형 코드")
    private String datasetTy;

    /** 목록: 스타일 유형 코드 (CM_WIDGET_STYLE.STYLE_TY) */
    @Schema(description = "스타일 유형 코드")
    private String styleTy;

    /** 상세: 권한 목록 */
    private List<WidgetAuthorDTO> authors;

    /** 저장 시 권한 코드 목록 */
    private List<String> authorCdList;
}
