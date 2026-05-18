package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserBoardDTO {

    private String bbsId;
    private String bbsNmKey;
    private String bbsName;
    private String bbsTy;
    /** CM_BBS.LAYOUT_TY (예: LIST, CARD, ALBUM) */
    private String layoutTy;
    private Integer sortingSq;
    private Integer postCount;
    private Integer unreadCount;
}
