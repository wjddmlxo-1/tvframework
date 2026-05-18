package tvframework.sit.wgt.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * CM_FILE BLOB 조회용 (위젯 이미지 등)
 */
@Getter
@Setter
public class CmFileBinaryDTO {

    private byte[] fileData;
    private String mimeTy;
}
