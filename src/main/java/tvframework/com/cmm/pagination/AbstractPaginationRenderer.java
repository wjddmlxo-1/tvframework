package tvframework.com.cmm.pagination;

/**
 * 페이징 렌더러 추상 클래스
 * EgovFrame의 AbstractPaginationRenderer를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public abstract class AbstractPaginationRenderer implements PaginationRenderer {
    
    protected String firstPageLabel;
    protected String previousPageLabel;
    protected String currentPageLabel;
    protected String otherPageLabel;
    protected String nextPageLabel;
    protected String lastPageLabel;
    
    /**
     * 변수를 초기화한다.
     */
    public abstract void initVariables();
    
    @Override
    public String renderPagination(PaginationInfo paginationInfo, String jsFunction) {
        if (paginationInfo == null) {
            return "";
        }
        
        initVariables();
        
        StringBuilder sb = new StringBuilder();
        
        int firstPageNo = paginationInfo.getFirstPageNo();
        int lastPageNo = paginationInfo.getLastPageNo();
        int currentPageNo = paginationInfo.getCurrentPageNo();
        
        // 첫 페이지
        if (currentPageNo > firstPageNo) {
            sb.append(replace(firstPageLabel, jsFunction, String.valueOf(firstPageNo)));
        } else {
            sb.append("<li>&#160;</li>");
        }
        
        // 이전 페이지
        if (paginationInfo.hasPreviousPage()) {
            sb.append(replace(previousPageLabel, jsFunction, String.valueOf(currentPageNo - 1)));
        }
        
        // 페이지 번호
        for (int i = firstPageNo; i <= lastPageNo; i++) {
            if (i == currentPageNo) {
                sb.append(replace(currentPageLabel, "{0}", String.valueOf(i)));
            } else {
                sb.append(replace(otherPageLabel, jsFunction, String.valueOf(i), String.valueOf(i)));
            }
        }
        
        // 다음 페이지
        if (paginationInfo.hasNextPage()) {
            sb.append(replace(nextPageLabel, jsFunction, String.valueOf(currentPageNo + 1)));
        }
        
        // 마지막 페이지
        if (currentPageNo < lastPageNo) {
            sb.append(replace(lastPageLabel, jsFunction, String.valueOf(lastPageNo)));
        } else {
            sb.append("<li>&#160;</li>");
        }
        
        return sb.toString();
    }
    
    /**
     * 문자열을 치환한다.
     * 
     * @param str 원본 문자열
     * @param jsFunction JavaScript 함수명
     * @param pageIndex 페이지 인덱스
     * @return 치환된 문자열
     */
    protected String replace(String str, String jsFunction, String pageIndex) {
        return str.replace("{0}", jsFunction).replace("{1}", pageIndex);
    }
    
    /**
     * 문자열을 치환한다.
     * 
     * @param str 원본 문자열
     * @param jsFunction JavaScript 함수명
     * @param pageIndex 페이지 인덱스
     * @param pageNumber 페이지 번호
     * @return 치환된 문자열
     */
    protected String replace(String str, String jsFunction, String pageIndex, String pageNumber) {
        return str.replace("{0}", jsFunction).replace("{1}", pageIndex).replace("{2}", pageNumber);
    }
}

