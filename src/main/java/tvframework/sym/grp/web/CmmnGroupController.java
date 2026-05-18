package tvframework.sym.grp.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnDeptTreeDTO;
import tvframework.sym.grp.dto.CmmnGroupDTO;
import tvframework.sym.grp.dto.CmmnGroupListResponseDTO;
import tvframework.sym.grp.dto.CmmnGroupRequestDTO;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;
import tvframework.sym.grp.service.CmmnGroupService;

/**
 * 그룹 관리 컨트롤러
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnGroup")
@RequiredArgsConstructor
@Tag(name = "CmmnGroupController", description = "그룹 관리")
public class CmmnGroupController {

    private final CmmnGroupService cmmnGroupService;

    @Operation(summary = "회사 목록 조회", description = "회사명 드롭다운용 (ADMIN 그룹 사용자 소속 회사)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/companies")
    public IntermediateResultVO<List<CmmnCompanyOptionDTO>> selectCompanyList(
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String loginUserId = (loginVO != null && loginVO.getId() != null) ? loginVO.getId() : null;
        return IntermediateResultVO.success(cmmnGroupService.selectCompanyList(loginUserId));
    }

    @Operation(summary = "그룹 목록 조회", description = "그룹 목록을 페이징하여 조회합니다.")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/list")
    public IntermediateResultVO<CmmnGroupListResponseDTO> selectGroupList(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "searchKeyword", description = "검색어(그룹ID/그룹명)", in = ParameterIn.QUERY) @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "pageIndex", description = "페이지 번호", in = ParameterIn.QUERY, example = "1") @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
        @Parameter(name = "recordCountPerPage", description = "페이지당 항목 수", in = ParameterIn.QUERY, example = "15") @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        CmmnGroupListResponseDTO result = cmmnGroupService.selectGroupList(cmpnyCd, searchKeyword, pageIndex, recordCountPerPage, langGb);
        return IntermediateResultVO.success(result);
    }

    @Operation(summary = "그룹 상세 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnGroupDTO> selectGroupDetail(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("groupId") String groupId
    ) throws Exception {
        return IntermediateResultVO.success(cmmnGroupService.selectGroupDetail(cmpnyCd, groupId));
    }

    @Operation(summary = "그룹 사용자 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/users")
    public IntermediateResultVO<List<CmmnGroupUserDTO>> selectGroupUserList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("groupId") String groupId,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnGroupService.selectGroupUserList(cmpnyCd, groupId, langGb));
    }

    @Operation(summary = "사용자 검색", description = "그룹 등록/수정용, MBRSH_SQ 포함")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/userSearch")
    public IntermediateResultVO<List<CmmnGroupUserDTO>> selectUserSearchList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnGroupService.selectUserSearchList(cmpnyCd, searchKeyword, langGb));
    }

    @Operation(summary = "부서 트리 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/deptTree")
    public IntermediateResultVO<List<CmmnDeptTreeDTO>> selectDeptTree(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnGroupService.selectDeptTree(cmpnyCd, langGb));
    }

    @Operation(summary = "부서 사용자 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/deptUsers")
    public IntermediateResultVO<List<CmmnGroupUserDTO>> selectDeptUserList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("deptCd") String deptCd,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnGroupService.selectDeptUserList(cmpnyCd, deptCd, langGb));
    }

    @Operation(summary = "그룹 등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류(그룹 ID 중복 등)")
    })
    @PostMapping
    public IntermediateResultVO<Object> insertGroup(@RequestBody CmmnGroupRequestDTO requestDTO) throws Exception {
        try {
            cmmnGroupService.insertGroup(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 그룹 ID가 이미 존재합니다. 다른 그룹 ID를 입력하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "GROUP_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "그룹 수정")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "수정 성공") })
    @PutMapping
    public IntermediateResultVO<Void> updateGroup(@RequestBody CmmnGroupRequestDTO requestDTO) throws Exception {
        cmmnGroupService.updateGroup(requestDTO);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "그룹 삭제(단건)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @DeleteMapping
    public IntermediateResultVO<Void> deleteGroup(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("groupId") String groupId
    ) throws Exception {
        cmmnGroupService.deleteGroup(cmpnyCd, groupId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "그룹 일괄 삭제")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @PostMapping("/deleteList")
    public IntermediateResultVO<Void> deleteGroupList(@RequestBody List<CmmnGroupDTO> list) throws Exception {
        cmmnGroupService.deleteGroupList(list);
        return IntermediateResultVO.success(null);
    }
}
