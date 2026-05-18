package tvframework.sit.bbs.dto;

import lombok.Getter;
import lombok.Setter;

/** 팝업공지 내역 행 */
@Getter
@Setter
public class BbsPopupNoticeDTO {

    private String popupSq;
    private String nttSq;
    private String bbsId;
    private String cmpnyCd;
    private String bbsNm;
    private String title;
    private String hideFl;
    private String useFl;
    private String userNm;
    private String creationDt;
    private String statusColor;
}
