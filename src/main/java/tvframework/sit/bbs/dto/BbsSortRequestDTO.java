package tvframework.sit.bbs.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BbsSortRequestDTO {

    private String cmpnyCd;
    private List<BbsSortItemDTO> items;

    @Getter
    @Setter
    public static class BbsSortItemDTO {
        private String bbsId;
        private Integer sortingSq;
    }
}
