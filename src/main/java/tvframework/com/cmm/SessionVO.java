package tvframework.com.cmm;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

/**
 * ?�션 VO ?�래??
 * @author 공통?�비??개발?� 박�???
 * @since 2009.03.06
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *
 *   ?�정??     ?�정??         ?�정?�용
 *  -------    --------    ---------------------------
 *  2009.03.06  박�???         최초 ?�성
 *
 *  </pre>
 */

@Getter
@Setter
public class SessionVO implements Serializable {

	private static final long serialVersionUID = -2848741427493626376L;
	/** ?�이??*/
	private String sUserId;
	/** ?�름 */
	private String sUserNm;
	/** ?�메??*/
	private String sEmail;
	/** ?�용?�구�?*/
	private String sUserSe;
	/** 조직(부??ID */
	private String orgnztId;
	/** 고유?�이??*/
	private String uniqId;
	
}