package tvframework.let.main.web;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.ResultVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 템플릿 메인 페이지 컨트롤러 클래스(Sample 소스)
 * @author 실행환경 개발팀 JJY
 * @since 2011.08.31
 * @version 1.0
 * @see
 *
 * <pre>
 * << 개정이력(Modification Information) >>
 *
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *   2011.08.31  JJY            최초 생성
 *
 * </pre>
 */
@RestController
@Tag(name="MainApiController",description = "메인 페이지")
public class MainApiController {

	/**
	 * 템플릿 메인 페이지 조회
	 * @return 메인페이지 정보 Map [key : 항목명]
	 *
	 * @throws Exception
	 */
	@Operation(
			summary = "메인 페이지",
			description = "템플릿 메인 페이지 조회",
			tags = {"MainApiController"}
	)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "조회 성공")
	})
	@GetMapping(value = "/mainPage")
	public ResultVO getMgtMainPage()
	  throws Exception{

		ResultVO resultVO = new ResultVO();
		Map<String, Object> resultMap = new HashMap<String, Object>();

		// 레거시 LETTNBBS 기반 메인 공지/갤러리 영역은 제거됨. UI는 빈 목록을 사용.
		resultMap.put("notiList", Collections.emptyList());
		resultMap.put("galList", Collections.emptyList());

		resultVO.setResult(resultMap);
		resultVO.setResultCode(ResponseCode.SUCCESS.getCode());
		resultVO.setResultMessage(ResponseCode.SUCCESS.getMessage());

		return resultVO;
	}

}
