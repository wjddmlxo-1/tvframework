package tvframework.com.cmm.pagination;

/**
 * 페이징 렌더러 인터페이스
 * EgovFrame의 PaginationRenderer를 대체하는 인터페이스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface PaginationRenderer {
    
    /**
     * 페이징을 렌더링한다.
     * 
     * @param paginationInfo 페이징 정보
     * @param jsFunction JavaScript 함수명
     * @return 렌더링된 HTML
     */
    String renderPagination(PaginationInfo paginationInfo, String jsFunction);
}