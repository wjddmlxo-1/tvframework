package tvframework.com.cmm.util;

import java.util.Map;

import org.springframework.stereotype.Component;

import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.ResultVO;
/**
 * ResultVO ?�성???�는 ?�퍼 ?�틸리티 ?�래??
 * 공통 ?�답 객체(ResultVO)�??��? 구조�??�성?????�도�??�용?�는 ?�래???�니??
 * 
 * @author 김?�섭(nirsa)
 * @since 2025.04.06
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정?�력(Modification Information) >>
 *   
 *   ?�정??         ?�정??        ?�정?�용
 *   ----------    ------------     -------------------
 *   2025.04.06    김?�섭(nirsa)      최초 ?�성 
 *
 * </pre>
 */

@Component
public class ResultVoHelper {
	/**
	 * Map 기반 결과 ?�이?��? ResultVO�??�성?�다.
	 *
	 * @param resultMap 결과 ?�이??Map
	 * @param code ?�답 코드 (ResponseCode)
	 * @return ?�성??ResultVO 객체
	 */
	public ResultVO buildFromMap(Map<String, Object> resultMap, ResponseCode code) {
	    ResultVO resultVO = new ResultVO();
	    resultVO.setResult(resultMap);
	    resultVO.setResultCode(code.getCode());
	    resultVO.setResultMessage(code.getMessage());
	    return resultVO;
	}
	
	/**
	 * ?��? ?�성??ResultVO 객체???�답 코드 �?메시지�??�정?�다.
	 *
	 * @param resultVO 결과 VO 객체
	 * @param code ?�답 코드 (ResponseCode)
	 * @return 코드가 ?�용??ResultVO 객체
	 */
	public ResultVO buildFromResultVO(ResultVO resultVO, ResponseCode code) {
	    resultVO.setResultCode(code.getCode());
	    resultVO.setResultMessage(code.getMessage());
	    return resultVO;
	}
}
