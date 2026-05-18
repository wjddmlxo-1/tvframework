package tvframework.com.cmm;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 *  ?�래??
 * @author 공통?�비?�개발�? ?�삼??
 * @since 2009.06.01
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *   ?�정??     ?�정??          ?�정?�용
 *  -------       --------    ---------------------------
 *   2009.3.11   ?�삼??         최초 ?�성
 *
 * </pre>
 */
@Getter
@Setter
public class ComDefaultCodeVO implements Serializable {
    /**
	 *  serialVersion UID
	 */
	private static final long serialVersionUID = -2020648489890016404L;

	/** 코드 ID */
    private String codeId = "";

    /** ?�세코드 */
    private String code = "";

    /** 코드�?*/
    private String codeNm = "";

    /** 코드?�명 */
    private String codeDc = "";

    /** ?�정?�이블명 */
    private String tableNm = "";	//?�정?�이블에??코드?�보를추출시 ?�용

    /** ?�세 조건 ?��? */
    private String haveDetailCondition = "N";

    /** ?�세 조건 */
    private String detailCondition = "";

    /**
     * toString 메소?��? ?�치한??
     */
    public String toString() {
	return ToStringBuilder.reflectionToString(this);
    }
}