package tvframework.sym.pgm.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import tvframework.com.cmm.pagination.PaginationInfo;

/**
 * 프로그램 관리 리스트 응답 DTO
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnProgramListResponseDTO {

    private List<CmmnProgramDTO> list;
    private PaginationInfo paginationInfo;
}
