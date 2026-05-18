package tvframework.man.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserCommentSaveDTO {
    private String cmpnyCd;
    private String bbsId;
    private String nttSq;
    private String commentSq;
    /** 부모 댓글번호(답글 작성 시 필수). 구버전 upperCommentSq와 호환 */
    private String parentCommentSq;
    /** @deprecated parentCommentSq 사용 */
    private String upperCommentSq;
    private String comment;
    private String secretFl;
    private String noticeFl;
    /** 댓글 첨부 FILE_SQ 목록(등록 후 REFER_SQ=COMMENT_SQ). 최대 4개·이미지·합계 10MB */
    private List<String> fileSqs;
}
