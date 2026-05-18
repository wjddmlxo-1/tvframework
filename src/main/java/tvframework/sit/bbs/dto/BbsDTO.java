package tvframework.sit.bbs.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 게시판 정보 DTO (CM_BBS 및 목록·상세 확장 필드)
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.15
 */
@Getter
@Setter
@Schema(description = "게시판")
public class BbsDTO {

    @Schema(description = "게시판ID")
    private String bbsId;

    @Schema(description = "회사코드")
    private String cmpnyCd;

    @Schema(description = "게시판명")
    private String bbsName;

    @Schema(description = "게시판명KEY")
    private String bbsNmKey;

    @Schema(description = "게시판설명")
    private String bbsCn;

    @Schema(description = "게시판유형 GENERAL/MEMO")
    private String bbsTy;

    @Schema(description = "구성유형 LIST/CARD/ALBUM")
    private String layoutTy;

    @Schema(description = "답글여부 Y/N")
    private String replyFl;

    @Schema(description = "댓글여부 Y/N")
    private String commentFl;

    @Schema(description = "추천여부 Y/N")
    private String likeFl;

    @Schema(description = "비추천여부 Y/N")
    private String dislikeFl;

    @Schema(description = "파일첨부여부 Y/N")
    private String atchmnflFl;

    @Schema(description = "공지게시여부 Y/N")
    private String noticeFl;

    @Schema(description = "강제비밀글여부 Y/N")
    private String enfrcSecretFl;

    @Schema(description = "익명여부 Y/N")
    private String anonymousFl;

    @Schema(description = "댓글관리자승인 Y/N")
    private String commentConfmFl;

    @Schema(description = "예약게시 Y/N")
    private String resveFl;

    @Schema(description = "카테고리분류 Y/N")
    private String categoryFl;

    @Schema(description = "최대파일크기(MB)")
    private Integer maxFileSize;

    @Schema(description = "최대파일개수")
    private Integer maxFileCount;

    @Schema(description = "허용확장자")
    private String permExtsn;

    @Schema(description = "페이지당게시물수")
    private Integer postsPerPage;

    @Schema(description = "제목줄임글자수")
    private Integer titleLength;

    @Schema(description = "공개시작일")
    private String validFrom;

    @Schema(description = "공개종료일")
    private String validTo;

    @Schema(description = "정렬순서")
    private Integer sortingSq;

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

    /** 목록: 게시판유형명 */
    private String bbsTyNm;

    /** 목록: 상태색 RED/ORANGE/GREEN */
    private String statusColor;

    /** 상세: 휴지통 탭 주황 표시 */
    private Boolean tabTrashOrange;

    /** 상세: 댓글승인 탭 주황 표시 */
    private Boolean tabCommentOrange;

    private List<BbsCategoryDTO> categories;

    private List<BbsAuthorDTO> authors;
}
