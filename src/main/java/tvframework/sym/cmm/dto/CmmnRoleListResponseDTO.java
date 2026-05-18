package tvframework.sym.cmm.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import tvframework.com.cmm.pagination.PaginationInfo;

@Getter
@Setter
public class CmmnRoleListResponseDTO {

    private List<CmmnRoleDTO> list;
    private PaginationInfo paginationInfo;
}
