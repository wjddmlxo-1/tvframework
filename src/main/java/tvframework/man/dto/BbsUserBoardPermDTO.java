package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자 게시판(CM_BBS_AUTHOR)에서 현재 사용자에 매칭되는 권한 플래그 집계(행 중 하나라도 Y면 Y).
 */
@Getter
@Setter
public class BbsUserBoardPermDTO {

    private String permReadingFl;
    private String permWritingFl;
    private String permReplyFl;
    private String permManagerFl;
}
