package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserPopupPreviewDTO {

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
    private String myLikeFl;
    private String myDislikeFl;
    private String myFavoriteFl;

    private Integer xcnts;
    private Integer ydnts;
    private Integer width;
    private Integer vrticl;

    /** CM_NTT_POPUP.HIDE_FL — 오늘 그만 보기 버튼 노출 여부(Y/N) */
    private String hideFl;
}
