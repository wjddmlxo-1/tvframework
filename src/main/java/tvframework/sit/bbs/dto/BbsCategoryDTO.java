package tvframework.sit.bbs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 게시판 카테고리 DTO (CM_BBS_CATEGORY)
 */
@Getter
@Setter
@Schema(description = "게시판 카테고리")
public class BbsCategoryDTO {

    @Schema(description = "카테고리번호")
    private String categorySq;

    @Schema(description = "게시판ID")
    private String bbsId;

    @Schema(description = "회사코드")
    private String cmpnyCd;

    @Schema(description = "카테고리명")
    private String categoryNm;

    @Schema(description = "정렬순서")
    private Integer sortingSq;
}
