package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * 사용자 API용 CM_BBS 기능 플래그(관리자 화면 토글과 동일 컬럼).
 */
@Getter
@Setter
public class BbsUserBbsFeaturesDTO {
    private String replyFl;
    private String commentFl;
    private String likeFl;
    private String dislikeFl;
    private String atchmnflFl;
    private String noticeFl;
    private String enfrcSecretFl;
    private String anonymousFl;
    private String resveFl;
    private String categoryFl;
    private String commentConfmFl;
}
