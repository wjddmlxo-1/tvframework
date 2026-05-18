package tvframework.sym.grp.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import tvframework.com.cmm.pagination.PaginationInfo;

/**
 * 그룹 목록 조회 응답 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnGroupListResponseDTO {

    /** 그룹 목록 */
    private List<CmmnGroupDTO> list;
    /** 페이징 정보 */
    private PaginationInfo paginationInfo;
}
