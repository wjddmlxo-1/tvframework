package tvframework.sym.msg.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
import tvframework.com.cmm.pagination.PaginationInfo;

/**
 * 다국어 메시지 리스트 응답 DTO
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Getter
@Setter
public class CmmnMessageListResponseDTO {
    private List<CmmnMessageDTO> list;
    private PaginationInfo paginationInfo;
}

