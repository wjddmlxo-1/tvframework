package tvframework.sit.bbs.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/** 휴지통 게시글 행 */
@Getter
@Setter
public class BbsNttTrashDTO {

    private String nttSq;
    private String bbsId;
    private String cmpnyCd;
    private String title;
    private String creationDt;
    private String userNm;
}
