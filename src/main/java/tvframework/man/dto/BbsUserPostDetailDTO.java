package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserPostDetailDTO {

    private String nttSq;
    private String bbsId;
    private String cmpnyCd;
    private String title;
    /** 목록/상세 표시용과 별도 — 글쓰기 수정 시 원문 제목(CM_NTT.TITLE, 카테고리 접두사 없음) */
    private String titlePlain;
    private String contents;
    /** CM_NTT.CATEGORY_SQ */
    private String categorySq;
    /** CM_NTT.RESVE_DT → yyyyMMddHHmmss (예약/공지 기간 시작) */
    private String ntceBgnde;
    /** CM_NTT.EXPIRY_DT → yyyyMMddHHmmss (기간 종료) */
    private String ntceEndde;
    private Integer rdCnt;
    private Integer likeCnt;
    private Integer dislikeCnt;
    private Integer favoriteCnt;
    private String userNm;
    private String creationId;
    private String profileFileSq;
    /** CM_NTT.NTT_TY = NOTICE 여부 */
    private String noticeYn;
    /** CM_NTT.NTT_STTUS (PUBLIC/SECRET) */
    private String nttSttus;
    private String creationDt;
    private String likeFl;
    private String dislikeFl;
    private String commentFl;
    private String replyFl;
    private String myLikeFl;
    private String myDislikeFl;
    private String myFavoriteFl;

    /** CM_BBS_AUTHOR 집계: 열람 권한(공유 등) */
    private String permReadingFl;
    private String permWritingFl;
    private String permReplyFl;
    private String permManagerFl;
}
