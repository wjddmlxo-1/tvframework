package tvframework.man.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BbsUserNttPageDTO {

    private List<BbsUserNttDTO> list;
    private int totalCount;
    private int pageIndex;
    private int pageSize;
}
