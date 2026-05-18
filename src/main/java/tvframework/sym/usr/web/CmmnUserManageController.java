package tvframework.sym.usr.web;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.ResponseCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;
import tvframework.sym.usr.dto.CmmnDeptManageDTO;
import tvframework.sym.usr.dto.CodeOptionItemDTO;
import tvframework.sym.usr.service.CmmnUserManageService;

/**
 * 사용자관리(화면설계서) API 컨트롤러
 */
@RestController
@RequestMapping("/cmmnUserManage")
@RequiredArgsConstructor
@Tag(name = "CmmnUserManageController", description = "사용자관리(회사 사용자/부서 관리)")
public class CmmnUserManageController {

    private final CmmnUserManageService cmmnUserManageService;

    @Operation(summary = "회사 사용자 리스트")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/companyUserList")
    public IntermediateResultVO<Map<String, Object>> companyUserList(
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "searchKeyword", in = ParameterIn.QUERY) @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @Parameter(name = "pageIndex", in = ParameterIn.QUERY) @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
        @Parameter(name = "recordCountPerPage", in = ParameterIn.QUERY) @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.selectCompanyUserList(companyCode, searchKeyword, langCode, pageIndex, recordCountPerPage));
    }

    @Operation(summary = "사용자 상세(기본정보+회사별 정보)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/userDetail")
    public IntermediateResultVO<Map<String, Object>> userDetail(
        @Parameter(name = "userId", in = ParameterIn.QUERY) @RequestParam("userId") String userId,
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.selectUserDetail(userId, companyCode, langCode));
    }

    @Operation(summary = "내 프로필(로그인 본인, 회사 소속 시에만 회사별 정보 조회)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/myProfile")
    public IntermediateResultVO<Map<String, Object>> myProfile(
        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO loginUser,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam(value = "companyCode", required = false) String preferredCompanyCode
    ) throws Exception {
        if (loginUser == null || loginUser.getId() == null || loginUser.getId().isBlank()) {
            IntermediateResultVO<Map<String, Object>> err = new IntermediateResultVO<>();
            err.setResultCode(ResponseCode.AUTH_ERROR.getCode());
            err.setResultMessage(ResponseCode.AUTH_ERROR.getMessage());
            return err;
        }
        return IntermediateResultVO.success(
            cmmnUserManageService.selectMyProfile(loginUser.getId(), preferredCompanyCode, langCode));
    }

    @Operation(summary = "내 프로필 저장(기본정보 + 소속별 회사정보 목록)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "저장 성공") })
    @PutMapping("/myProfile")
    public IntermediateResultVO<Object> saveMyProfile(
        @Parameter(hidden = true) @AuthenticationPrincipal LoginVO loginUser,
        @RequestBody Map<String, Object> body) throws Exception {
        if (loginUser == null || loginUser.getId() == null || loginUser.getId().isBlank()) {
            IntermediateResultVO<Object> err = new IntermediateResultVO<>();
            err.setResultCode(ResponseCode.AUTH_ERROR.getCode());
            err.setResultMessage(ResponseCode.AUTH_ERROR.getMessage());
            return err;
        }
        String userId = (String) body.get("userId");
        if (userId == null || !userId.equals(loginUser.getId())) {
            IntermediateResultVO<Object> err = new IntermediateResultVO<>();
            err.setResultCode(ResponseCode.AUTH_ERROR.getCode());
            err.setResultMessage(ResponseCode.AUTH_ERROR.getMessage());
            return err;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> userBasic = (Map<String, Object>) body.get("userBasic");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> companyInfoList = (List<Map<String, Object>>) body.get("companyInfoList");
        String updateId = (String) body.get("updateId");
        String creationId = (String) body.get("creationId");
        if (updateId == null) {
            updateId = loginUser.getId();
        }
        if (creationId == null) {
            creationId = loginUser.getId();
        }
        cmmnUserManageService.saveMyProfile(loginUser.getId(), userBasic, companyInfoList, updateId, creationId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "코드 옵션(비밀번호힌트/성별/직위/부서등급)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/codeOption")
    public IntermediateResultVO<List<CodeOptionItemDTO>> codeOption(
        @Parameter(name = "codeId", in = ParameterIn.QUERY) @RequestParam("codeId") String codeId,
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.selectCodeOption(codeId, companyCode, langCode));
    }

    @Operation(summary = "중복 아이디 검사")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "O:가능, X:불가") })
    @GetMapping("/checkDuplicateUserId")
    public IntermediateResultVO<String> checkDuplicateUserId(
        @Parameter(name = "userId", in = ParameterIn.QUERY) @RequestParam("userId") String userId
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.checkDuplicateUserId(userId));
    }

    @Operation(summary = "사용자 등록")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "등록 성공") })
    @PostMapping("/userRegistration")
    public IntermediateResultVO<Object> userRegistration(@RequestBody Map<String, Object> body) throws Exception {
        String companyCode = (String) body.get("companyCode");
        String creationId = (String) body.get("creationId");
        if (creationId == null) creationId = "admin";
        @SuppressWarnings("unchecked")
        Map<String, Object> userBasic = (Map<String, Object>) body.get("userBasic");
        @SuppressWarnings("unchecked")
        Map<String, Object> companyInfo = (Map<String, Object>) body.get("companyInfo");
        cmmnUserManageService.saveUserRegistration(companyCode, userBasic, companyInfo, creationId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "사용자 상세 저장(수정)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "저장 성공") })
    @PutMapping("/userDetail")
    public IntermediateResultVO<Object> userDetailSave(@RequestBody Map<String, Object> body) throws Exception {
        String companyCode = (String) body.get("companyCode");
        String userId = (String) body.get("userId");
        String updateId = (String) body.get("updateId");
        String creationId = (String) body.get("creationId");
        if (updateId == null) updateId = "admin";
        if (creationId == null) creationId = "admin";
        @SuppressWarnings("unchecked")
        Map<String, Object> userBasic = (Map<String, Object>) body.get("userBasic");
        @SuppressWarnings("unchecked")
        Map<String, Object> companyInfo = (Map<String, Object>) body.get("companyInfo");
        cmmnUserManageService.saveUserDetail(companyCode, userId, userBasic, companyInfo, updateId, creationId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "회사 사용자 삭제")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @DeleteMapping("/companyUser")
    public IntermediateResultVO<Object> deleteCompanyUser(
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "mbrshSq", in = ParameterIn.QUERY) @RequestParam("mbrshSq") Long mbrshSq,
        @Parameter(name = "userId", in = ParameterIn.QUERY) @RequestParam("userId") String userId
    ) throws Exception {
        cmmnUserManageService.deleteCompanyUser(companyCode, mbrshSq, userId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "부서 상세")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/deptDetail")
    public IntermediateResultVO<CmmnDeptManageDTO> deptDetail(
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "deptCd", in = ParameterIn.QUERY) @RequestParam("deptCd") String deptCd,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.selectDeptDetail(companyCode, deptCd, langCode));
    }

    @Operation(summary = "부서 등록")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "등록 성공") })
    @PostMapping("/dept")
    public IntermediateResultVO<Object> insertDept(@RequestBody Map<String, Object> body) throws Exception {
        String companyCode = (String) body.get("companyCode");
        String creationId = (String) body.get("creationId");
        if (creationId == null) creationId = "admin";
        try {
            cmmnUserManageService.insertDept(companyCode, body, creationId);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = IntermediateResultVO.inputCheckError(null);
            vo.setResultMessage(e.getMessage() != null ? e.getMessage() : "입력값을 확인하세요.");
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = IntermediateResultVO.inputCheckError(null);
            vo.setResultMessage("이미 등록된 부서 코드입니다. 다른 부서 코드를 입력하세요.");
            return vo;
        }
    }

    @Operation(summary = "부서 수정")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "수정 성공") })
    @PutMapping("/dept")
    public IntermediateResultVO<Object> updateDept(@RequestBody Map<String, Object> body) throws Exception {
        String companyCode = (String) body.get("companyCode");
        String deptCd = (String) body.get("deptCd");
        String updateId = (String) body.get("updateId");
        if (updateId == null) updateId = "admin";
        cmmnUserManageService.updateDept(companyCode, deptCd, body, updateId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "부서 삭제(비활성 처리)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @RequestMapping(value = "/deptDelete", method = { RequestMethod.DELETE, RequestMethod.POST })
    public IntermediateResultVO<Object> deleteDept(
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "deptCd", in = ParameterIn.QUERY) @RequestParam("deptCd") String deptCd,
        @Parameter(name = "updateId", in = ParameterIn.QUERY) @RequestParam(value = "updateId", required = false) String updateId
    ) throws Exception {
        try {
            cmmnUserManageService.deleteDept(companyCode, deptCd, updateId != null ? updateId : "admin");
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = IntermediateResultVO.inputCheckError(null);
            vo.setResultMessage(e.getMessage() != null ? e.getMessage() : "삭제할 수 없습니다.");
            return vo;
        }
    }

    @Operation(summary = "부서 사용자 리스트")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/deptUserList")
    public IntermediateResultVO<List<CmmnGroupUserDTO>> deptUserList(
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "deptCd", in = ParameterIn.QUERY) @RequestParam("deptCd") String deptCd,
        @Parameter(name = "searchKeyword", in = ParameterIn.QUERY) @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.selectDeptUserList(companyCode, deptCd, searchKeyword, langCode));
    }

    @Operation(summary = "부서 사용자 삭제(DEPT_CD=NULL)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @RequestMapping(value = "/deptUserDelete", method = { RequestMethod.PUT, RequestMethod.POST })
    public IntermediateResultVO<Object> deleteDeptUser(
        @Parameter(name = "mbrshSq", in = ParameterIn.QUERY) @RequestParam("mbrshSq") Long mbrshSq,
        @Parameter(name = "updateId", in = ParameterIn.QUERY) @RequestParam(value = "updateId", required = false) String updateId
    ) throws Exception {
        cmmnUserManageService.deleteDeptUser(mbrshSq, updateId != null ? updateId : "admin");
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "부서 사용자 추가")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "저장 성공") })
    @PostMapping("/deptUser")
    public IntermediateResultVO<Object> saveDeptUser(@RequestBody Map<String, Object> body) throws Exception {
        String companyCode = (String) body.get("companyCode");
        String userId = (String) body.get("userId");
        String creationId = (String) body.get("creationId");
        String updateId = (String) body.get("updateId");
        if (creationId == null) creationId = "admin";
        if (updateId == null) updateId = "admin";
        @SuppressWarnings("unchecked")
        Map<String, Object> companyInfo = (Map<String, Object>) body.get("companyInfo");
        Long mbrshSq = null;
        Object ms = body.get("mbrshSq");
        if (ms instanceof Number) {
            mbrshSq = ((Number) ms).longValue();
        }
        cmmnUserManageService.saveDeptUser(companyCode, userId, mbrshSq, companyInfo, creationId, updateId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "사용자 검색(팝업)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/userSearch")
    public IntermediateResultVO<List<CmmnGroupUserDTO>> userSearch(
        @Parameter(name = "companyCode", in = ParameterIn.QUERY) @RequestParam("companyCode") String companyCode,
        @Parameter(name = "searchKeyword", in = ParameterIn.QUERY) @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnUserManageService.selectUserSearchList(companyCode, searchKeyword, langCode));
    }
}
