package tvframework.sym.usr.web;

import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.ResultVO;
import tvframework.com.cmm.util.ResultVoHelper;
import tvframework.let.utl.sim.service.FileScrty;
import tvframework.sym.usr.service.CmmnUserManageService;
import tvframework.sym.usr.service.CmmnUserService;
import tvframework.sym.usr.service.CmmnUserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 사용자관리·사용자 암호변경 API 컨트롤러
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "CmmnUserApiController", description = "사용자관리 / 사용자 암호변경")
public class CmmnUserApiController {

	private final CmmnUserService cmmnUserService;
	private final CmmnUserManageService cmmnUserManageService;
	private final ResultVoHelper resultVoHelper;

	@Operation(summary = "사용자 암호변경", description = "로그인 사용자의 기존 비밀번호 검증 후 신규 비밀번호로 변경", security = { @SecurityRequirement(name = "Authorization") }, tags = { "CmmnUserApiController" })
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "성공"), @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님"), @ApiResponse(responseCode = "800", description = "저장시 내부 오류") })
	@PatchMapping(value = "/user/password")
	public ResultVO updateUserPassword(
			@RequestBody Map<String, String> param,
			HttpServletRequest request,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {
		ResultVO resultVO = new ResultVO();
		String old_password = param.get("old_password");
		String new_password = param.get("new_password");
		String login_id = user.getId();
		Map<String, Object> resultMap = new HashMap<>();
		resultMap.put("old_password", FileScrty.encryptPassword(old_password, login_id));
		resultMap.put("new_password", FileScrty.encryptPassword(new_password, login_id));
		resultMap.put("login_id", login_id);
		log.debug("===>>> login_id = {}", login_id);
		Integer result = cmmnUserService.updateUserPassword(resultMap);
		log.debug("===>>> result = {}", result);
		if (result != null && result > 0) {
			resultVO.setResultCode(ResponseCode.SUCCESS.getCode());
			resultVO.setResultMessage(ResponseCode.SUCCESS.getMessage());
		} else {
			resultVO.setResultCode(ResponseCode.SAVE_ERROR.getCode());
			resultVO.setResultMessage(ResponseCode.SAVE_ERROR.getMessage());
		}
		return resultVO;
	}

	@Operation(summary = "마이페이지(레거시 호환 최소 정보)", description = "탈퇴 등 레거시 연동용. 상세는 /cmmnUserManage/myProfile 사용", security = { @SecurityRequirement(name = "Authorization") }, tags = { "CmmnUserApiController" })
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공"), @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님") })
	@GetMapping("/mypage")
	public ResultVO selectMypageView(@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {
		Map<String, Object> resultMap = new HashMap<>();
		if (user == null || user.getId() == null) {
			resultMap.put("resultMsg", "회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
			return resultVoHelper.buildFromMap(resultMap, ResponseCode.AUTH_ERROR);
		}
		CmmnUserVO vo = new CmmnUserVO();
		vo.setUniqId(user.getUniqId() != null ? user.getUniqId() : user.getId());
		vo.setMberId(user.getId());
		vo.setMberNm(user.getName());
		resultMap.put("mberManageVO", vo);
		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	@Operation(summary = "마이페이지 탈퇴처리", security = { @SecurityRequirement(name = "Authorization") }, tags = { "CmmnUserApiController" })
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "처리 성공"), @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님") })
	@PutMapping("/mypage/delete")
	public ResultVO deleteMypage(HttpServletRequest request, HttpServletResponse response,
			@Parameter(hidden = true) @AuthenticationPrincipal LoginVO user) throws Exception {
		Map<String, Object> resultMap = new HashMap<>();
		if (user == null || user.getId() == null) {
			resultMap.put("resultMsg", "회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
			return resultVoHelper.buildFromMap(resultMap, ResponseCode.AUTH_ERROR);
		}
		cmmnUserManageService.withdrawMyUser(user.getId(), user.getId());
		new SecurityContextLogoutHandler().logout(request, response, null);
		resultMap.put("resultMsg", "success.common.update");
		return resultVoHelper.buildFromMap(resultMap, ResponseCode.SUCCESS);
	}

	@Operation(summary = "JWT 토큰 검증", description = "Authorization 헤더 토큰 검증", security = { @SecurityRequirement(name = "Authorization") }, tags = { "CmmnUserApiController" })
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "성공"), @ApiResponse(responseCode = "403", description = "인가된 사용자가 아님") })
	@PostMapping(value = "/jwtAuthAPI")
	public ResultVO jwtAuthentication(HttpServletRequest request) throws Exception {
		ResultVO resultVO = new ResultVO();
		resultVO.setResultCode(ResponseCode.SUCCESS.getCode());
		resultVO.setResultMessage(ResponseCode.SUCCESS.getMessage());
		return resultVO;
	}

}
