package tvframework.sym.mnu.web;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.mnu.dto.CmmnMenuDTO;
import tvframework.sym.mnu.dto.CmmnMenuRequestDTO;
import tvframework.sym.mnu.dto.MenuTreeDTO;
import tvframework.sym.mnu.service.CmmnMenuService;

/**
 * 메뉴 관리 컨트롤러
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnMenu")
@RequiredArgsConstructor
@Tag(name = "CmmnMenuController", description = "메뉴 관리")
public class CmmnMenuController {

    private final CmmnMenuService cmmnMenuService;

    @Operation(summary = "메뉴 트리 조회", description = "메뉴 목록을 트리 구조로 조회합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/tree")
    public IntermediateResultVO<List<MenuTreeDTO>> selectMenuTree(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd,
        @Parameter(name = "langGb", description = "언어구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        List<MenuTreeDTO> result = cmmnMenuService.selectMenuTree(cmpnyCd, langGb);
        return IntermediateResultVO.success(result);
    }

    @Operation(summary = "메뉴 검색용 트리 조회", description = "상위메뉴 선택용 트리(Directory만) 조회합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/treeForSearch")
    public IntermediateResultVO<List<MenuTreeDTO>> selectMenuTreeForSearch(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd,
        @Parameter(name = "langGb", description = "언어구분", in = ParameterIn.QUERY)
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        List<MenuTreeDTO> result = cmmnMenuService.selectMenuTreeForSearch(cmpnyCd, langGb);
        return IntermediateResultVO.success(result);
    }

    @Operation(summary = "사이드바 메뉴(권한)", description = "로그인 사용자에게 허용된 메뉴만 트리로 조회합니다. userId는 인증 사용자와 동일해야 합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/sidebar")
    public IntermediateResultVO<List<MenuTreeDTO>> selectSidebarMenuTree(
        @Parameter(name = "userId", description = "로그인 ID", in = ParameterIn.QUERY) @RequestParam(value = "userId", required = true) String userId,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd,
        @Parameter(name = "langGb", description = "언어구분", in = ParameterIn.QUERY)
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        try {
            List<MenuTreeDTO> result = cmmnMenuService.selectSidebarMenuTree(userId, cmpnyCd, langGb);
            return IntermediateResultVO.success(result);
        } catch (IllegalArgumentException e) {
            return IntermediateResultVO.inputCheckError(Collections.emptyList());
        }
    }

    @Operation(summary = "메뉴 상세 조회", description = "메뉴 상세 정보를 조회합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnMenuDTO> selectMenuDetail(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd,
        @Parameter(name = "menuId", description = "메뉴 ID", in = ParameterIn.QUERY) @RequestParam("menuId") String menuId,
        @Parameter(name = "langGb", description = "언어구분", in = ParameterIn.QUERY) @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb
    ) throws Exception {
        CmmnMenuDTO result = cmmnMenuService.selectMenuDetail(cmpnyCd, menuId, langGb);
        return IntermediateResultVO.success(result);
    }

    @Operation(summary = "메뉴 등록", description = "메뉴를 등록합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류(메뉴 No 중복 등)")
    })
    @PostMapping
    public IntermediateResultVO<Object> insertMenu(@RequestBody CmmnMenuRequestDTO requestDTO) throws Exception {
        try {
            cmmnMenuService.insertMenu(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 메뉴 No가 이미 존재합니다. 다른 메뉴 No를 입력하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "MENU_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "메뉴 수정", description = "메뉴를 수정합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "수정 성공") })
    @PutMapping("/{menuId}")
    public IntermediateResultVO<Void> updateMenu(
        @PathVariable String menuId,
        @RequestBody CmmnMenuRequestDTO requestDTO
    ) throws Exception {
        String cmpnyCd = requestDTO.getCmpnyCd() != null ? requestDTO.getCmpnyCd() : "";
        cmmnMenuService.updateMenu(cmpnyCd, menuId, requestDTO);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "메뉴 삭제", description = "메뉴를 삭제합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @DeleteMapping("/{menuId}")
    public IntermediateResultVO<Void> deleteMenu(
        @PathVariable String menuId,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd
    ) throws Exception {
        cmmnMenuService.deleteMenu(cmpnyCd, menuId);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "하위 메뉴 존재 여부", description = "하위 메뉴 존재 여부를 확인합니다.", tags = { "CmmnMenuController" })
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/checkChildren")
    public IntermediateResultVO<String> checkChildren(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd,
        @Parameter(name = "menuId", description = "메뉴 ID", in = ParameterIn.QUERY) @RequestParam("menuId") String menuId
    ) throws Exception {
        String result = cmmnMenuService.checkChildren(cmpnyCd, menuId);
        return IntermediateResultVO.success(result);
    }
}
