package tvframework.com.cmm.pagination;

import java.io.Serializable;

/**
 * 페이징 정보를 담는 클래스
 * EgovFrame의 PaginationInfo를 대체하는 클래스
 * 
 * @author 공통 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public class PaginationInfo implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /** 현재 페이지 번호 */
    private int currentPageNo = 1;
    
   /** 페이지당 레코드 수 */
    private int recordCountPerPage = 10;
    
    /** 페이지 사이즈 */
    private int pageSize = 10;
    
     /** 전체 레코드 수 */
    private int totalRecordCount = 0;
    
    /**
     * 현재 페이지 번호를 반환한다.
     * 
     * @return 현재 페이지 번호
     */
    public int getCurrentPageNo() {
        return currentPageNo;
    }
    
    /**
     * 현재 페이지 번호를 설정한다.
     * 
     * @param currentPageNo 현재 페이지 번호
     */
    public void setCurrentPageNo(int currentPageNo) {
        this.currentPageNo = currentPageNo;
    }
    
    /**
     * 페이지당 레코드 수를 반환한다.
     * 
     * @return 페이지당 레코드 수
     */
    public int getRecordCountPerPage() {
        return recordCountPerPage;
    }
    
    /**
     * 페이지당 레코드 수를 설정한다.
     * 
     * @param recordCountPerPage 페이지당 레코드 수
     */
    public void setRecordCountPerPage(int recordCountPerPage) {
        this.recordCountPerPage = recordCountPerPage;
    }
    
    /**
     * 페이지 사이즈를 반환한다.
     * 
     * @return 페이지 사이즈
     */
    public int getPageSize() {
        return pageSize;
    }
    
   /**
     * 페이지 사이즈를 설정한다.
     * 
     * @param pageSize 페이지 사이즈
     */
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
    
     /**
     * 전체 레코드 수를 반환한다.
     * 
     * @return 전체 레코드 수
     */
    public int getTotalRecordCount() {
        return totalRecordCount;
    }
    
    /**
     * 전체 레코드 수를 설정한다.
     * 
     * @param totalRecordCount 전체 레코드 수
     */
    public void setTotalRecordCount(int totalRecordCount) {
        this.totalRecordCount = totalRecordCount;
    }
    
    /**
     * 첫 번째 레코드 인덱스를 반환한다.
     * 
     * @return 첫 번째 레코드 인덱스
     */
    public int getFirstRecordIndex() {
        return (currentPageNo - 1) * recordCountPerPage;
    }
    
   /**
     * 마지막 레코드 인덱스를 반환한다.
     * 
     * @return 마지막 레코드 인덱스
     */
    public int getLastRecordIndex() {
        return currentPageNo * recordCountPerPage;
    }
    
    /**
     * 전체 페이지 수를 반환한다.
     * 
     * @return 전체 페이지 수
     */
    public int getTotalPageCount() {
        if (totalRecordCount == 0 || recordCountPerPage == 0) {
            return 0;
        }
        return (int) Math.ceil((double) totalRecordCount / recordCountPerPage);
    }
    
   /**
     * 첫 번째 페이지 번호를 반환한다.
     * 
     * @return 첫 번째 페이지 번호
     */
    public int getFirstPageNo() {
        return ((currentPageNo - 1) / pageSize) * pageSize + 1;
    }
    
    /**
     * 마지막 페이지 번호를 반환한다.
     * 
     * @return 마지막 페이지 번호
     */
    public int getLastPageNo() {
        int lastPageNo = getFirstPageNo() + pageSize - 1;
        int totalPageCount = getTotalPageCount();
        if (lastPageNo > totalPageCount) {
            lastPageNo = totalPageCount;
        }
        return lastPageNo;
    }
    
    /**
     * 이전 페이지 존재 여부를 반환한다.
     * 
     * @return 이전 페이지 존재 여부
     */
    public boolean hasPreviousPage() {
        return currentPageNo > 1;
    }
    
    /**
     * 다음 페이지 존재 여부를 반환한다.
     * 
     * @return 다음 페이지 존재 여부
     */
    public boolean hasNextPage() {
        return currentPageNo < getTotalPageCount();
    }
}

