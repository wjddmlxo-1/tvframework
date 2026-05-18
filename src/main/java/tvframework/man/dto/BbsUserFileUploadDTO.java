package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserFileUploadDTO {
    private String fileSq;
    private String fileSqDisplay;
    private String fileNm;
    private String mimeTy;
    private Long fileSize;
}
