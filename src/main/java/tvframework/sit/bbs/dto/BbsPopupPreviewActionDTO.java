package tvframework.sit.bbs.dto;

import lombok.Getter;
import lombok.Setter;

/** 팝업공지 미리보기 액션 요청 */
@Getter
@Setter
public class BbsPopupPreviewActionDTO {

    private String nttSq;
    private String bbsId;
    private String cmpnyCd;

    /** L(추천), D(비추천) */
    private String voteGb;
}
