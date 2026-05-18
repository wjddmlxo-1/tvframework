package tvframework.sit.bbs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * CM_CODE_DETAIL + CM_MESSAGE_LANG 조회 결과 (게시판 유형·기능 옵션 등)
 */
@Getter
@Setter
@Schema(description = "공통코드 상세(다국어명 포함)")
public class BbsCodeDetailOptionDTO {

    @Schema(description = "다국어 메시지(코드명)")
    private String name;

    @Schema(description = "상세코드 ID")
    private String detailCodeId;

    @Schema(description = "상세코드 값")
    private String detailCodeValue;

    @Schema(description = "사용여부 Y/N")
    private String useFl;

    @Schema(description = "정렬순서")
    private Integer sortingSq;

    @Schema(description = "언어 KEY")
    private String langKey;
}
