package tvframework.man.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserCommentDTO {
    private String commentSq;
    private String nttSq;
    private String bbsId;
    private String cmpnyCd;
    private String parentCommentSq;
    private String comment;
    private String secretFl;
    private String noticeFl;
    private String creationDt;
    private String userId;
    private String userNm;
    private String myCommentFl;
    /** 댓글 깊이(0=댓글,1=답글,2=답글의답글...) */
    private Integer threadDepth;
    /** 댓글 첨부 이미지(CM_FILE FILE_TY=BBS_CMT, REFER_SQ=COMMENT_SQ) */
    private List<BbsUserCommentImageDTO> images;
}
