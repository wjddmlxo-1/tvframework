package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserNttDTO {

    private String nttSq;
    private String bbsId;
    private String bbsName;
    private String title;
    private String snippet;
    private String userNm;
    private String creationId;
    private String nttSttus;
    private String creationDt;
    private Integer rdCnt;
    private Integer commentCnt;
    private String noticeYn;
    /** 게시글 깊이(0=원글,1=답변...) */
    private Integer depth;
    /** 앨범·카드 썸네일: 첫 첨부 파일 (FILE_SQ 오름차순) */
    private String thumbFileSq;
    private String thumbMimeTy;
    /** 작성자 프로필 이미지(CM_USER.FILE_SQ) */
    private String profileFileSq;
}
