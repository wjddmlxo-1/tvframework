package tvframework.sym.cmp.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import tvframework.com.cmm.pagination.PaginationInfo;

/**
 * 회사정보 목록 응답 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnCompanyListResponseDTO {

    private List<CmmnCompanyDTO> list;
    private PaginationInfo paginationInfo;
}
