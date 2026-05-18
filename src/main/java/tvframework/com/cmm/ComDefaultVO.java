package tvframework.com.cmm;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * @Class Name : ComDefaultVO.java
 * @Description : ComDefaultVO class
 * @Modification Information
 * @
 * @  ?�정??        ?�정??                  ?�정?�용
 * @ -------    --------    ---------------------------
 * @ 2009.02.01    조재??        최초 ?�성
 *
 *  @author 공통?�비??개발?� 조재??
 *  @since 2009.02.01
 *  @version 1.0
 *  @see
 *
 */
@Getter
@Setter
public class ComDefaultVO implements Serializable {

	private static final long serialVersionUID = 1L;

	/** 검?�조�?*/
    private String searchCondition = "";

    /** 검?�Keyword */
    private String searchKeyword = "";

    /** 검?�사?�여부 */
    private String searchUseYn = "";

    /** ?�재?�이지 */
    private int pageIndex = 1;

    /** ?�이지�?�� */
    private int pageUnit = 10;

    /** ?�이지?�이�?*/
    private int pageSize = 10;

    /** firstIndex */
    private int firstIndex = 1;

    /** lastIndex */
    private int lastIndex = 1;

    /** recordCountPerPage */
    private int recordCountPerPage = 10;

    /** 검?�KeywordFrom */
    private String searchKeywordFrom = "";

	/** 검?�KeywordTo */
    private String searchKeywordTo = "";

    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }

    
}