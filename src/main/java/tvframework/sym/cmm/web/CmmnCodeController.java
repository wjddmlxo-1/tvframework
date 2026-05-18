package tvframework.sym.cmm.web;

import java.util.List;

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
import java.util.HashMap;
import java.util.Map;
import tvframework.sym.cmm.dto.CodeDetailDTO;
import tvframework.sym.cmm.exception.CmmnCodeDuplicateKeyException;
import tvframework.sym.cmm.dto.CodeTreeDTO;
import tvframework.sym.cmm.dto.CmmnCodeRequestDTO;
import tvframework.sym.cmm.dto.CmmnCodeResponseDTO;
import tvframework.sym.cmm.service.CmmnCodeService;

/**
 * 공통코드 관리 컨트롤러
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnCode")
@RequiredArgsConstructor
@Tag(name = "CmmnCodeController", description = "공통코드 관리")
public class CmmnCodeController {

    private final CmmnCodeService cmmnCodeService;

    /** 언어 목록은 GET /cmmnMessage/languages (CmmnMessage_SQL_mysql.xml selectLanguages) 단일 소스 사용 */

    /**
     * 코드 트리 조회
     */
    @Operation(
        summary = "코드 트리 조회",
        description = "코드 트리를 조회합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/tree")
    public IntermediateResultVO<List<CodeTreeDTO>> selectCodeTree(
        @Parameter(name = "langGb", description = "언어 구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        List<CodeTreeDTO> result = cmmnCodeService.selectCodeTree(langGb, cmpnyCd);
        return IntermediateResultVO.success(result);
    }

    /**
     * 코드 상세 조회
     */
    @Operation(
        summary = "코드 상세 조회",
        description = "코드 상세 정보를 조회합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnCodeResponseDTO> selectCodeDetail(
        @Parameter(name = "codeId", description = "코드 ID", in = ParameterIn.QUERY)
        @RequestParam("codeId") String codeId,
        @Parameter(name = "langGb", description = "언어 구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        CmmnCodeResponseDTO result = cmmnCodeService.selectCodeDetail(codeId, langGb, cmpnyCd);
        return IntermediateResultVO.success(result);
    }

    /**
     * 코드 리스트 조회
     */
    @Operation(
        summary = "코드 리스트 조회",
        description = "코드 리스트를 조회합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/detailList")
    public IntermediateResultVO<List<CodeDetailDTO>> selectCodeDetailList(
        @Parameter(name = "codeId", description = "코드 ID", in = ParameterIn.QUERY)
        @RequestParam("codeId") String codeId,
        @Parameter(name = "langGb", description = "언어 구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        List<CodeDetailDTO> result = cmmnCodeService.selectCodeDetailList(codeId, langGb, cmpnyCd);
        return IntermediateResultVO.success(result);
    }

    /**
     * 상위 코드 정보 조회
     */
    @Operation(
        summary = "상위 코드 정보 조회",
        description = "상위 코드 정보를 조회합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/parent")
    public IntermediateResultVO<CmmnCodeResponseDTO> selectParentCode(
        @Parameter(name = "codeId", description = "코드 ID", in = ParameterIn.QUERY)
        @RequestParam("codeId") String codeId,
        @Parameter(name = "langGb", description = "언어 구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langGb", required = false, defaultValue = "ko_KR") String langGb,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        CmmnCodeResponseDTO result = cmmnCodeService.selectParentCode(codeId, langGb, cmpnyCd);
        return IntermediateResultVO.success(result);
    }

    /**
     * 코드 등록
     */
    @Operation(
        summary = "코드 등록",
        description = "새로운 코드를 등록합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @PostMapping
    public IntermediateResultVO<Object> insertCode(@RequestBody CmmnCodeRequestDTO requestDTO) throws Exception {
        try {
            cmmnCodeService.insertCode(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (CmmnCodeDuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", e.getDuplicateKey());
            focus.put("duplicateDetailIndex", e.getDuplicateDetailIndex());
            vo.setResult(focus);
            return vo;
        }
    }

    /**
     * 코드 수정
     */
    @Operation(
        summary = "코드 수정",
        description = "기존 코드를 수정합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @PutMapping("/{codeId}")
    public IntermediateResultVO<Object> updateCode(
        @Parameter(name = "codeId", description = "코드 ID", in = ParameterIn.PATH)
        @PathVariable("codeId") String codeId,
        @RequestBody CmmnCodeRequestDTO requestDTO
    ) throws Exception {
        try {
            cmmnCodeService.updateCode(codeId, requestDTO);
            return IntermediateResultVO.success(null);
        } catch (CmmnCodeDuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", e.getDuplicateKey());
            focus.put("duplicateDetailIndex", e.getDuplicateDetailIndex());
            vo.setResult(focus);
            return vo;
        }
    }

    /**
     * 코드 삭제
     */
    @Operation(
        summary = "코드 삭제",
        description = "코드를 삭제합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "삭제 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @DeleteMapping("/{codeId}")
    public IntermediateResultVO<Void> deleteCode(
        @Parameter(name = "codeId", description = "코드 ID", in = ParameterIn.PATH)
        @PathVariable("codeId") String codeId,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        cmmnCodeService.deleteCode(codeId, cmpnyCd);
        return IntermediateResultVO.success(null);
    }

    /**
     * 하위 코드 존재 여부 확인
     */
    @Operation(
        summary = "하위 코드 존재 여부 확인",
        description = "하위 코드 존재 여부를 확인합니다.",
        tags = {"CmmnCodeController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/checkChildren")
    public IntermediateResultVO<Map<String, String>> checkChildren(
        @Parameter(name = "codeId", description = "코드 ID", in = ParameterIn.QUERY)
        @RequestParam("codeId") String codeId,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        String result = cmmnCodeService.checkChildren(codeId, cmpnyCd);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("ox", result);
        return IntermediateResultVO.success(response);
    }
}

