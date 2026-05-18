package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

/** 댓글별 CM_FILE(BBS_CMT) 첨부 행 — 목록 조회 후 서비스에서 댓글별로 묶음 */
@Getter
@Setter
public class BbsUserCommentAttachmentRowDTO {
    private String commentSq;
    private String fileSq;
    private String mimeTy;
}
