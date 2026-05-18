package tvframework.sit.bbs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 게시판 권한 DTO (CM_BBS_AUTHOR + 표시용 targetNm)
 */
@Getter
@Setter
@Schema(description = "게시판 권한")
public class BbsAuthorDTO {

    @Schema(description = "권한일련번호")
    private String authorSq;

    @Schema(description = "게시판ID")
    private String bbsId;

    @Schema(description = "회사코드")
    private String cmpnyCd;

    @Schema(description = "대상유형 ROLE/USER/DEPT/GROUP")
    private String targetTy;

    @Schema(description = "대상코드")
    private String targetCd;

    @Schema(description = "대상 표시명")
    private String targetNm;

    @Schema(description = "열람 Y/N")
    private String readingFl;

    @Schema(description = "작성 Y/N")
    private String writingFl;

    @Schema(description = "답글 Y/N")
    private String replyFl;

    @Schema(description = "관리자 Y/N")
    private String managerFl;

    @Schema(description = "정렬순서")
    private Integer sortingSq;
}
