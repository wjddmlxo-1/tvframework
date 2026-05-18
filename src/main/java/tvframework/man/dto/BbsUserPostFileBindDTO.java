package tvframework.man.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsUserPostFileBindDTO {
    private String cmpnyCd;
    private String bbsId;
    private String nttSq;
    private List<String> fileSqs;
}
