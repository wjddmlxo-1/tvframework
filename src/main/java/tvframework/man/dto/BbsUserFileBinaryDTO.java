package tvframework.man.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserFileBinaryDTO {
    private byte[] fileData;
    private String mimeTy;
}
