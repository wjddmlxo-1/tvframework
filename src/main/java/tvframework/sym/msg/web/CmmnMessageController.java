package tvframework.sym.msg.web;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.Map;

import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.msg.dto.CmmnMessageDeleteRequestDTO;
import tvframework.sym.msg.dto.CmmnMessageDetailResponseDTO;
import tvframework.sym.msg.dto.CmmnMessageListResponseDTO;
import tvframework.sym.msg.dto.CmmnMessageRequestDTO;
import tvframework.sym.msg.service.CmmnMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

/**
 * 다국어 메시지 관리 컨트롤러
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnMessage")
@RequiredArgsConstructor
@Tag(name = "CmmnMessageController", description = "다국어 메시지 관리")
public class CmmnMessageController {

    private final CmmnMessageService cmmnMessageService;

    /**
     * 메시지 리스트 조회 (⑦)
     */
    @Operation(
        summary = "메시지 리스트 조회",
        description = "다국어 메시지 리스트를 조회합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/list")
    public IntermediateResultVO<CmmnMessageListResponseDTO> selectMessageList(
        @Parameter(name = "langGb", description = "언어 구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam("langGb") String langGb,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "category", description = "구분", in = ParameterIn.QUERY, example = "list")
        @RequestParam(value = "category", required = false) String category,
        @Parameter(name = "searchCondition", description = "검색 조건", in = ParameterIn.QUERY)
        @RequestParam(value = "searchCondition", required = false) String searchCondition,
        @Parameter(name = "pageIndex", description = "페이지 번호", in = ParameterIn.QUERY, example = "1")
        @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
        @Parameter(name = "recordCountPerPage", description = "페이지당 항목 수", in = ParameterIn.QUERY, example = "15")
        @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage
    ) throws Exception {
        CmmnMessageListResponseDTO result = cmmnMessageService.selectMessageList(
            langGb, cmpnyCd, category, searchCondition, pageIndex, recordCountPerPage);
        return IntermediateResultVO.success(result);
    }

    /**
     * 메시지 상세 조회
     */
    @Operation(
        summary = "메시지 상세 조회",
        description = "다국어 메시지 상세 정보를 조회합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnMessageDetailResponseDTO> selectMessageDetail(
        @Parameter(name = "langKey", description = "언어 Key", in = ParameterIn.QUERY)
        @RequestParam("langKey") String langKey,
        @Parameter(name = "langGb", description = "언어 구분", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam("langGb") String langGb,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        CmmnMessageDetailResponseDTO result = cmmnMessageService.selectMessageDetail(langKey, langGb, cmpnyCd);
        return IntermediateResultVO.success(result);
    }

    @Operation(
        summary = "UI 번역 일괄 조회",
        description = "LANG_KEY 목록 + LANG_CODE(+회사코드) 기준으로 MESSAGE_CN을 한 번에 조회합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/texts")
    public IntermediateResultVO<Map<String, String>> selectMessageTextsByKeys(
        @Parameter(name = "langKeys", description = "언어 Key 목록", in = ParameterIn.QUERY)
        @RequestParam("langKeys") List<String> langKeys,
        @Parameter(name = "langCode", description = "언어 코드", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam("langCode") String langCode,
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnMessageService.selectMessageTextsByKeys(langKeys, langCode, cmpnyCd));
    }

    /**
     * 메시지 등록
     */
    @Operation(
        summary = "메시지 등록",
        description = "새로운 다국어 메시지를 등록합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @PostMapping
    public IntermediateResultVO<Void> insertMessage(@RequestBody CmmnMessageRequestDTO requestDTO) throws Exception {
        cmmnMessageService.insertMessage(requestDTO);
        return IntermediateResultVO.success(null);
    }

    /**
     * 메시지 수정
     */
    @Operation(
        summary = "메시지 수정",
        description = "기존 다국어 메시지를 수정합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @PutMapping("/{langKey}")
    public IntermediateResultVO<Void> updateMessage(
        @Parameter(name = "langKey", description = "언어 Key", in = ParameterIn.PATH)
        @PathVariable("langKey") String langKey,
        @RequestBody CmmnMessageRequestDTO requestDTO
    ) throws Exception {
        cmmnMessageService.updateMessage(langKey, requestDTO);
        return IntermediateResultVO.success(null);
    }

    /**
     * 메시지 삭제 (⑥)
     */
    @Operation(
        summary = "메시지 삭제",
        description = "다국어 메시지를 삭제합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "삭제 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @DeleteMapping("/delete")
    public IntermediateResultVO<Void> deleteMessage(@RequestBody CmmnMessageDeleteRequestDTO requestDTO) throws Exception {
        cmmnMessageService.deleteMessage(requestDTO);
        return IntermediateResultVO.success(null);
    }

    /**
     * 언어 목록 조회
     */
    @Operation(
        summary = "언어 목록 조회",
        description = "언어 목록을 조회합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/languages")
    public IntermediateResultVO<List<CodeOptionDTO>> selectLanguages(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "langCode", description = "언어 코드", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        List<CodeOptionDTO> result = cmmnMessageService.selectLanguages(cmpnyCd, langCode);
        return IntermediateResultVO.success(result);
    }

    /**
     * 구분 목록 조회
     */
    @Operation(
        summary = "구분 목록 조회",
        description = "구분 목록을 조회합니다.",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/categories")
    public IntermediateResultVO<List<CodeOptionDTO>> selectCategories(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "langCode", description = "언어 코드", in = ParameterIn.QUERY, example = "ko_KR")
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        List<CodeOptionDTO> result = cmmnMessageService.selectCategories(cmpnyCd, langCode);
        return IntermediateResultVO.success(result);
    }

    /**
     * 회사 목록 조회 (다국어 관리 상단 검색용, 로그인 사용자 ADMIN 그룹 기준)
     */
    @Operation(
        summary = "회사 목록 조회",
        description = "다국어 관리 검색 조건용 회사 목록 (ADMIN 그룹 소속 회사)",
        tags = {"CmmnMessageController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/companies")
    public IntermediateResultVO<List<CmmnCompanyOptionDTO>> selectCompanyList(
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String loginUserId = (loginVO != null && loginVO.getId() != null) ? loginVO.getId() : null;
        return IntermediateResultVO.success(cmmnMessageService.selectCompanyList(loginUserId));
    }
}

