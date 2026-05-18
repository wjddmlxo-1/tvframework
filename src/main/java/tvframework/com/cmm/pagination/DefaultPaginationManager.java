package tvframework.com.cmm.pagination;

import java.util.HashMap;
import java.util.Map;

/**
 * 기본 페이징 관리자
 * EgovFrame의 DefaultPaginationManager를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class DefaultPaginationManager {
    
    private Map<String, PaginationRenderer> rendererType = new HashMap<>();
    
    /**
     * 렌더러 타입을 설정한다.
     * 
     * @param rendererType 렌더러 타입 맵
     */
    public void setRendererType(Map<String, PaginationRenderer> rendererType) {
        this.rendererType = rendererType;
    }
    
    /**
     * 페이징을 렌더링한다.
     * 
     * @param paginationInfo 페이징 정보
     * @param type 렌더러 타입
     * @param jsFunction JavaScript 함수명
     * @return 렌더링된 HTML
     */
    public String renderPagination(PaginationInfo paginationInfo, String type, String jsFunction) {
        PaginationRenderer renderer = rendererType.get(type);
        if (renderer == null) {
            renderer = rendererType.get("default");
        }
        if (renderer == null) {
            return "";
        }
        return renderer.renderPagination(paginationInfo, jsFunction);
    }
}

