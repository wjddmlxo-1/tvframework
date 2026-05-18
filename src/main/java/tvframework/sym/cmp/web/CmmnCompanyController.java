package tvframework.sym.cmp.web;

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
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.dto.CmmnCompanyDTO;
import tvframework.sym.cmp.dto.CmmnCompanyListResponseDTO;
import tvframework.sym.cmp.dto.CmmnCompanyRequestDTO;
import tvframework.sym.cmp.service.CmmnCompanyService;

/**
 * 회사정보 관리 컨트롤러
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnCompany")
@RequiredArgsConstructor
@Tag(name = "CmmnCompanyController", description = "회사정보 관리")
public class CmmnCompanyController {

    private final CmmnCompanyService cmmnCompanyService;

    @Operation(summary = "회사정보 목록 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/list")
    public IntermediateResultVO<CmmnCompanyListResponseDTO> selectCompanyList(
        @Parameter(name = "sbscrbSttus", description = "가입상태", in = ParameterIn.QUERY) @RequestParam(value = "sbscrbSttus", required = false) String sbscrbSttus,
        @Parameter(name = "searchKeyword", description = "검색어(회사ID/회사명)", in = ParameterIn.QUERY) @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "pageIndex", description = "페이지 번호", in = ParameterIn.QUERY, example = "1") @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
        @Parameter(name = "recordCountPerPage", description = "페이지당 항목 수", in = ParameterIn.QUERY, example = "15") @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage,
        @Parameter(name = "langCode", description = "언어코드", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        CmmnCompanyListResponseDTO result = cmmnCompanyService.selectCompanyList(
            sbscrbSttus, searchKeyword, pageIndex, recordCountPerPage, langCode);
        return IntermediateResultVO.success(result);
    }

    @Operation(summary = "회사정보 상세 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnCompanyDTO> selectCompanyDetail(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnCompanyService.selectCompanyDetail(cmpnyCd));
    }

    @Operation(summary = "공통코드 옵션 조회 (기업구분/업종코드/가입상태/국가)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/codeOption")
    public IntermediateResultVO<List<CodeOptionDTO>> selectCodeOption(
        @Parameter(name = "codeId", description = "코드ID (CMMNCODE.500:기업구분, CMMNCODE.510:업종코드, CMMNCODE.540:가입상태)", in = ParameterIn.QUERY) @RequestParam("codeId") String codeId,
        @Parameter(name = "langCode", description = "언어코드", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnCompanyService.selectCodeOption(codeId, langCode));
    }

    @Operation(summary = "회사ID 중복 검사")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "O:가능, X:불가") })
    @GetMapping("/checkDuplicate")
    public IntermediateResultVO<String> checkDuplicateCmpnyCd(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(cmmnCompanyService.checkDuplicateCmpnyCd(cmpnyCd));
    }

    @Operation(summary = "회원가입 약관 조회")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "조회 성공") })
    @GetMapping("/stplat")
    public IntermediateResultVO<Map<String, String>> selectJoinStplat(
        @Parameter(name = "langCode", description = "언어코드", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(cmmnCompanyService.selectJoinStplat(langCode));
    }

    @Operation(summary = "회사정보 등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류(회사ID 중복 등)")
    })
    @PostMapping
    public IntermediateResultVO<Object> insertCompany(@RequestBody CmmnCompanyRequestDTO requestDTO) throws Exception {
        try {
            cmmnCompanyService.insertCompany(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 회사 ID가 이미 존재합니다. 다른 회사 ID를 입력하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "CMPNY_CD");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "회원가입(회사 가입신청)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 오류")
    })
    @PostMapping("/join")
    public IntermediateResultVO<Object> joinCompany(@RequestBody CmmnCompanyRequestDTO requestDTO) throws Exception {
        try {
            cmmnCompanyService.insertCompanyJoin(requestDTO);
            return IntermediateResultVO.success(null);
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 회사 ID가 이미 존재합니다. 다른 회사 ID를 입력하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "CMPNY_CD");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "회사정보 수정")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "수정 성공") })
    @PutMapping
    public IntermediateResultVO<Void> updateCompany(@RequestBody CmmnCompanyRequestDTO requestDTO) throws Exception {
        cmmnCompanyService.updateCompany(requestDTO);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "회사정보 삭제(상태값 변경)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @DeleteMapping
    public IntermediateResultVO<Void> deleteCompany(
        @Parameter(name = "cmpnyCd", description = "회사코드", in = ParameterIn.QUERY) @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        cmmnCompanyService.deleteCompany(cmpnyCd);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "회사정보 일괄 삭제(상태값 변경)")
    @ApiResponses(value = { @ApiResponse(responseCode = "200", description = "삭제 성공") })
    @PostMapping("/deleteList")
    public IntermediateResultVO<Void> deleteCompanyList(@RequestBody List<String> cmpnyCdList) throws Exception {
        cmmnCompanyService.deleteCompanyList(cmpnyCdList);
        return IntermediateResultVO.success(null);
    }
}
