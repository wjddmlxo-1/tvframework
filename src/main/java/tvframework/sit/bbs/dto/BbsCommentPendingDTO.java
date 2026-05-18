package tvframework.sit.bbs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** 승인 대기 댓글 행 */
@Getter
@Setter
public class BbsCommentPendingDTO {

    private String commentSq;
    private String nttSq;
    private String mbrshSq;
    private String comment;
    private String creationDt;
    private String userNm;
}
