package tvframework.sym.cmm.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import tvframework.com.cmm.pagination.PaginationInfo;

/**
 * 권한 목록 조회 응답 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnAuthorListResponseDTO {

    private List<CmmnAuthorDTO> list;
    private PaginationInfo paginationInfo;
}
