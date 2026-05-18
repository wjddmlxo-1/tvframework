package tvframework.sit.bbs.dto;

import lombok.Getter;
import lombok.Setter;

/** 팝업공지 미리보기 상세 */
@Getter
@Setter
public class BbsPopupPreviewDTO {

    private String popupSq;
    private String nttSq;
    private String bbsId;
    private String cmpnyCd;

    private String title;
    private String contents;
    private Integer rdCnt;
    private Integer likeCnt;
    private Integer dislikeCnt;
    private Integer favoriteCnt;
    private String userNm;
    private String creationDt;

    /** 게시판 기능 사용 여부 */
    private String likeFl;
    private String dislikeFl;

    /** 로그인 사용자 기준 상태 */
    private String myLikeFl;
    private String myDislikeFl;
    private String myFavoriteFl;

    /** 팝업 위치/크기 */
    private Integer xcnts;
    private Integer ydnts;
    private Integer width;
    private Integer vrticl;
}
