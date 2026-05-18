package tvframework.sit.bbs.dto;

import lombok.Getter;
import lombok.Setter;

/** 팝업공지 설정 */
@Getter
@Setter
public class BbsPopupSettingDTO {

    private String popupSq;
    private String nttSq;
    private String bbsId;
    private String cmpnyCd;

    private Integer xcnts;
    private Integer ydnts;
    private Integer width;
    private Integer vrticl;

    /** yyyy-MM-dd HH:mm:ss */
    private String startDt;
    /** yyyy-MM-dd HH:mm:ss */
    private String endDt;

    private String hideFl;
    private String useFl;
}
