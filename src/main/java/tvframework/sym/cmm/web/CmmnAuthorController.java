package tvframework.sym.cmm.web;

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
import tvframework.sym.cmm.dto.CmmnAuthorDTO;
import tvframework.sym.cmm.dto.CmmnAuthorHierarchyEdgeDTO;
import tvframework.sym.cmm.dto.CmmnAuthorListResponseDTO;
import tvframework.sym.cmm.dto.CmmnAuthorMenuDTO;
import tvframework.sym.cmm.dto.CmmnAuthorRequestDTO;
import tvframework.sym.cmm.dto.CmmnAuthorUserDTO;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnGroupOptionDTO;
import tvframework.sym.cmm.dto.CmmnUserSearchDTO;
import tvframework.sym.cmm.service.CmmnAuthorService;

/**
 * 권한 관리 컨트롤러
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnAuthor")
@RequiredArgsConstructor
@Tag(name = "CmmnAuthorController", description = "권한 관리")
public class CmmnAuthorController {

    private final CmmnAuthorService cmmnAuthorService;

    @Operation(summary = "회사 목록 조회", description = "회사명 드롭다운용 회사 목록을 조회합니다. (ADMIN 그룹 사용자 소속 회사)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/companies")
    public IntermediateResultVO<List<CmmnCompanyOptionDTO>> selectCompanyList(
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String loginUserId = (loginVO != null && loginVO.getId() != null) ? loginVO.getId() : null;
        return IntermediateResultVO.success(cmmnAuthorService.selectCompanyList(loginUserId));
    }

    @Operation(summary = "그룹 목록 조회", description = "그룹ID·그룹명으로 검색 가능")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/groups")
    public IntermediateResultVO<List<CmmnGroupOptionDTO>> selectGroupList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectGroupList(cmpnyCd, searchKeyword, langGb));
    }

    @Operation(summary = "그룹 사용자 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/groupUsers")
    public IntermediateResultVO<List<CmmnUserSearchDTO>> selectGroupUserList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("groupId") String groupId,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectGroupUserList(cmpnyCd, groupId, langGb));
    }

    @Operation(summary = "사용자 검색", description = "사용자ID·사용자명으로 검색")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/userSearch")
    public IntermediateResultVO<List<CmmnUserSearchDTO>> selectUserSearchList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectUserSearchList(cmpnyCd, searchKeyword, langGb));
    }

    @Operation(summary = "부서 사용자 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/deptUsers")
    public IntermediateResultVO<List<CmmnUserSearchDTO>> selectDeptUserList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("deptCd") String deptCd,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectDeptUserList(cmpnyCd, deptCd, langGb));
    }

    @Operation(summary = "권한 목록 조회", description = "권한 목록을 페이징하여 조회합니다.")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/list")
    public IntermediateResultVO<CmmnAuthorListResponseDTO> selectAuthorList(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "searchKeyword", description = "검색어(권한코드/권한명)", in = ParameterIn.QUERY) @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "pageIndex", description = "페이지 번호", in = ParameterIn.QUERY, example = "1") @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
        @Parameter(name = "recordCountPerPage", description = "페이지당 항목 수", in = ParameterIn.QUERY, example = "15") @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage
    ) throws Exception {
        CmmnAuthorListResponseDTO result = cmmnAuthorService.selectAuthorList(cmpnyCd, searchKeyword, pageIndex, recordCountPerPage);
        return IntermediateResultVO.success(result);
    }

    @Operation(summary = "권한 상세 조회", description = "권한 상세 정보를 조회합니다.")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnAuthorDTO> selectAuthorDetail(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam("cmpnyCd") String cmpnyCd,
        @Parameter(name = "authorCd", description = "권한코드", in = ParameterIn.QUERY) @RequestParam("authorCd") String authorCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectAuthorDetail(cmpnyCd, authorCd));
    }

    @Operation(summary = "권한 사용자 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/users")
    public IntermediateResultVO<List<CmmnAuthorUserDTO>> selectAuthorUserList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("authorCd") String authorCd,
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectAuthorUserList(cmpnyCd, authorCd, langGb));
    }

    @Operation(summary = "권한 메뉴 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/menus")
    public IntermediateResultVO<List<CmmnAuthorMenuDTO>> selectAuthorMenuList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("authorCd") String authorCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectAuthorMenuList(cmpnyCd, authorCd));
    }

    @Operation(summary = "권한 등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류(권한코드 중복 등)")
    })
    @PostMapping
    public IntermediateResultVO<Object> insertAuthor(@RequestBody CmmnAuthorRequestDTO requestDTO) throws Exception {
        try {
            cmmnAuthorService.insertAuthor(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 권한코드가 이미 존재합니다. 다른 권한코드를 입력하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "AUTHOR_CD");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "권한 수정")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "수정 성공"), @ApiResponse(responseCode = "900", description = "입력값 무결성 오류") })
    @PutMapping
    public IntermediateResultVO<Void> updateAuthor(@RequestBody CmmnAuthorRequestDTO requestDTO) throws Exception {
        try {
            cmmnAuthorService.updateAuthor(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "권한 삭제(단건)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @DeleteMapping
    public IntermediateResultVO<Void> deleteAuthor(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("authorCd") String authorCd
    ) throws Exception {
        cmmnAuthorService.deleteAuthor(cmpnyCd, authorCd);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "권한 일괄 삭제")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @PostMapping("/deleteList")
    public IntermediateResultVO<Void> deleteAuthorList(@RequestBody List<CmmnAuthorDTO> list) throws Exception {
        cmmnAuthorService.deleteAuthorList(list);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "권한 구조(상위-하위) 목록")
    @GetMapping("/hierarchy")
    public IntermediateResultVO<List<CmmnAuthorHierarchyEdgeDTO>> selectAuthorHierarchyList(
            @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectAuthorHierarchyList(cmpnyCd));
    }

    @Operation(summary = "권한 구조 관계 등록")
    @PostMapping("/hierarchy")
    public IntermediateResultVO<Void> insertAuthorHierarchy(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam("upperAuthorCd") String upperAuthorCd,
            @RequestParam("lowerAuthorCd") String lowerAuthorCd
    ) throws Exception {
        cmmnAuthorService.insertAuthorHierarchy(cmpnyCd, upperAuthorCd, lowerAuthorCd);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "권한 구조 관계 삭제")
    @DeleteMapping("/hierarchy")
    public IntermediateResultVO<Void> deleteAuthorHierarchy(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam("upperAuthorCd") String upperAuthorCd,
            @RequestParam("lowerAuthorCd") String lowerAuthorCd
    ) throws Exception {
        cmmnAuthorService.deleteAuthorHierarchy(cmpnyCd, upperAuthorCd, lowerAuthorCd);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "권한구조용 매핑 안된 하위 권한 후보")
    @GetMapping("/hierarchyUnmapped")
    public IntermediateResultVO<List<CmmnAuthorDTO>> selectUnmappedLowerAuthors(
            @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectUnmappedLowerAuthors(cmpnyCd));
    }

    @Operation(summary = "권한 전체 목록(롤 탭 등, 페이징 없음)")
    @GetMapping("/authorsAll")
    public IntermediateResultVO<List<CmmnAuthorDTO>> selectAuthorListAll(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        return IntermediateResultVO.success(cmmnAuthorService.selectAuthorListAll(cmpnyCd, searchKeyword));
    }
}
