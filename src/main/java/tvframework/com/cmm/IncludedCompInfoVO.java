package tvframework.com.cmm;

import lombok.Getter;
import lombok.Setter;

/**
 * IncludedInfo annotation??바탕?�로 ?�면???�시???�보�?구성?�기 ?�한 VO ?�래??
 * @author 공통컴포?�트 ?�진??
 * @since 2011.08.26
 * @version 2.0.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *   
 *  ?�정??	?�정??	?�정?�용
 *  -------    	--------    ---------------------------
 *  2011.08.26	?�진??		최초 ?�성
 *
 * </pre>
 */
@Getter
@Setter
public class IncludedCompInfoVO {
	
	private String name;
	private String listUrl;
	private int order;
	private int gid;
	
	
}