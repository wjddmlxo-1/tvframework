package tvframework.sym.cmm.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.cmm.dto.CmmnAuthorRoleSaveDTO;
import tvframework.sym.cmm.dto.CmmnRoleDTO;
import tvframework.sym.cmm.dto.CmmnRoleListResponseDTO;
import tvframework.sym.cmm.dto.CmmnRoleRequestDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmm.service.CmmnRoleService;

@RestController
@RequestMapping("/cmmnRole")
@RequiredArgsConstructor
@Tag(name = "CmmnRoleController", description = "롤 관리")
public class CmmnRoleController {

    private final CmmnRoleService cmmnRoleService;

    @Operation(summary = "롤 유형 공통코드(CMMNCODE.572)")
    @GetMapping("/roleTypes")
    public IntermediateResultVO<List<CodeOptionDTO>> selectRoleTypes(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnRoleService.selectRoleTypeOptions(cmpnyCd, langCode));
    }

    @Operation(summary = "롤 목록(페이징)")
    @GetMapping("/list")
    public IntermediateResultVO<CmmnRoleListResponseDTO> selectRoleList(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam(value = "roleTy", required = false) String roleTy,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
            @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
            @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage
    ) throws Exception {
        return IntermediateResultVO.success(
                cmmnRoleService.selectRoleList(cmpnyCd, roleTy, searchKeyword, pageIndex, recordCountPerPage));
    }

    @Operation(summary = "롤 상세")
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnRoleDTO> selectRoleDetail(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam("roleCd") String roleCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnRoleService.selectRoleDetail(cmpnyCd, roleCd));
    }

    @Operation(summary = "롤 등록")
    @PostMapping
    public IntermediateResultVO<Object> insertRole(@RequestBody CmmnRoleRequestDTO dto) throws Exception {
        try {
            cmmnRoleService.insertRole(dto);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 롤코드가 이미 존재합니다. 다른 롤코드를 입력하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "ROLE_CD");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "롤 수정")
    @PutMapping
    public IntermediateResultVO<Void> updateRole(@RequestBody CmmnRoleRequestDTO dto) throws Exception {
        try {
            cmmnRoleService.updateRole(dto);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "롤 삭제(단건)")
    @DeleteMapping
    public IntermediateResultVO<Void> deleteRole(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam("roleCd") String roleCd
    ) throws Exception {
        cmmnRoleService.deleteRole(cmpnyCd, roleCd);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "롤 일괄 삭제")
    @PostMapping("/deleteList")
    public IntermediateResultVO<Void> deleteRoleList(@RequestBody List<CmmnRoleDTO> list) throws Exception {
        cmmnRoleService.deleteRoleList(list);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "권한별 롤 매핑 목록(체크 여부)")
    @GetMapping("/rolesForAuthor")
    public IntermediateResultVO<List<CmmnRoleDTO>> selectRolesForAuthor(
            @RequestParam("cmpnyCd") String cmpnyCd,
            @RequestParam("authorCd") String authorCd,
            @RequestParam(value = "roleTy", required = false) String roleTy,
            @RequestParam(value = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        return IntermediateResultVO.success(
                cmmnRoleService.selectRolesWithMappingForAuthor(cmpnyCd, authorCd, roleTy, searchKeyword));
    }

    @Operation(summary = "권한-롤 저장")
    @PostMapping("/authorRoles")
    public IntermediateResultVO<Void> saveAuthorRoles(@RequestBody CmmnAuthorRoleSaveDTO dto) throws Exception {
        try {
            cmmnRoleService.saveAuthorRoles(dto);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }
}
