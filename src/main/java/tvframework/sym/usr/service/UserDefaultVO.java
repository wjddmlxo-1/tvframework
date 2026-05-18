package tvframework.sym.usr.service;

import java.io.Serializable;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * 사용자 검색조건 VO
 */
public class UserDefaultVO implements Serializable {

	private static final long serialVersionUID = 1L;

	private String sbscrbSttus = "0";
	private String searchCondition = "";
	private String searchKeyword = "";
	private String searchUseYn = "";
	private int pageIndex = 1;
	private int pageUnit = 10;
	private int pageSize = 10;
	private int firstIndex = 1;
	private int lastIndex = 1;
	private int recordCountPerPage = 10;

	public String getSbscrbSttus() { return sbscrbSttus; }
	public void setSbscrbSttus(String sbscrbSttus) { this.sbscrbSttus = sbscrbSttus; }
	public String getSearchCondition() { return searchCondition; }
	public void setSearchCondition(String searchCondition) { this.searchCondition = searchCondition; }
	public String getSearchKeyword() { return searchKeyword; }
	public void setSearchKeyword(String searchKeyword) { this.searchKeyword = searchKeyword; }
	public String getSearchUseYn() { return searchUseYn; }
	public void setSearchUseYn(String searchUseYn) { this.searchUseYn = searchUseYn; }
	public int getPageIndex() { return pageIndex; }
	public void setPageIndex(int pageIndex) { this.pageIndex = pageIndex; }
	public int getPageUnit() { return pageUnit; }
	public void setPageUnit(int pageUnit) { this.pageUnit = pageUnit; }
	public int getPageSize() { return pageSize; }
	public void setPageSize(int pageSize) { this.pageSize = pageSize; }
	public int getFirstIndex() { return firstIndex; }
	public void setFirstIndex(int firstIndex) { this.firstIndex = firstIndex; }
	public int getLastIndex() { return lastIndex; }
	public void setLastIndex(int lastIndex) { this.lastIndex = lastIndex; }
	public int getRecordCountPerPage() { return recordCountPerPage; }
	public void setRecordCountPerPage(int recordCountPerPage) { this.recordCountPerPage = recordCountPerPage; }

	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
}
