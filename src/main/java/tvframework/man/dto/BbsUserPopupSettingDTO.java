package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserPopupSettingDTO {

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
