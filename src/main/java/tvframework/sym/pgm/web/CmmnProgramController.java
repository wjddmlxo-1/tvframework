package tvframework.sym.pgm.web;

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
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sym.pgm.dto.CmmnProgramDTO;
import tvframework.sym.pgm.dto.CmmnProgramListResponseDTO;
import tvframework.sym.pgm.dto.CmmnProgramRequestDTO;
import tvframework.sym.pgm.service.CmmnProgramService;

/**
 * 프로그램 관리 컨트롤러
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@RestController
@RequestMapping("/cmmnProgram")
@RequiredArgsConstructor
@Tag(name = "CmmnProgramController", description = "프로그램 관리")
public class CmmnProgramController {

    private final CmmnProgramService cmmnProgramService;

    /**
     * 프로그램 목록 조회
     */
    @Operation(
        summary = "프로그램 목록 조회",
        description = "프로그램 목록을 조회합니다.",
        tags = {"CmmnProgramController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/list")
    public IntermediateResultVO<CmmnProgramListResponseDTO> selectProgramList(
        @Parameter(name = "searchKeyword", description = "검색어(프로그램명/URL)", in = ParameterIn.QUERY)
        @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @Parameter(name = "cmpnyCd", description = "회사코드(메시지 기반 프로그램명 검색 시 사용)", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "langCode", description = "언어코드(메시지 기반 프로그램명 검색 시 사용, 미입력 시 ko)", in = ParameterIn.QUERY)
        @RequestParam(value = "langCode", required = false) String langCode,
        @Parameter(name = "pageIndex", description = "페이지 번호", in = ParameterIn.QUERY, example = "1")
        @RequestParam(value = "pageIndex", defaultValue = "1") Integer pageIndex,
        @Parameter(name = "recordCountPerPage", description = "페이지당 항목 수", in = ParameterIn.QUERY, example = "15")
        @RequestParam(value = "recordCountPerPage", defaultValue = "15") Integer recordCountPerPage
    ) throws Exception {
        CmmnProgramListResponseDTO result = cmmnProgramService.selectProgramList(
            searchKeyword, cmpnyCd, langCode, pageIndex, recordCountPerPage);
        return IntermediateResultVO.success(result);
    }

    /**
     * 프로그램 상세 조회
     */
    @Operation(
        summary = "프로그램 상세 조회",
        description = "프로그램 상세 정보를 조회합니다.",
        tags = {"CmmnProgramController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping("/detail")
    public IntermediateResultVO<CmmnProgramDTO> selectProgramDetail(
        @Parameter(name = "cmpnyCd", description = "회사코드 (PK)", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = false) String cmpnyCd,
        @Parameter(name = "progId", description = "프로그램 ID (PK)", in = ParameterIn.QUERY)
        @RequestParam("progId") String progId,
        @Parameter(name = "langCode", description = "언어코드 (프로그램명 메시지 조인용)", in = ParameterIn.QUERY)
        @RequestParam(value = "langCode", required = false) String langCode
    ) throws Exception {
        CmmnProgramDTO result = cmmnProgramService.selectProgramDetail(
            cmpnyCd != null ? cmpnyCd : "", progId, langCode);
        return IntermediateResultVO.success(result);
    }

    /**
     * 프로그램 등록
     */
    @Operation(
        summary = "프로그램 등록",
        description = "새로운 프로그램을 등록합니다.",
        tags = {"CmmnProgramController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "등록 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @PostMapping
    public IntermediateResultVO<Void> insertProgram(@RequestBody CmmnProgramRequestDTO requestDTO) throws Exception {
        cmmnProgramService.insertProgram(requestDTO);
        return IntermediateResultVO.success(null);
    }

    /**
     * 프로그램 수정
     */
    @Operation(
        summary = "프로그램 수정",
        description = "기존 프로그램을 수정합니다.",
        tags = {"CmmnProgramController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @PutMapping("/{progId}")
    public IntermediateResultVO<Void> updateProgram(
        @Parameter(name = "progId", description = "프로그램 ID (PK)", in = ParameterIn.PATH)
        @PathVariable("progId") String progId,
        @RequestBody CmmnProgramRequestDTO requestDTO
    ) throws Exception {
        requestDTO.setProgrmFileNm(progId);
        cmmnProgramService.updateProgram(requestDTO);
        return IntermediateResultVO.success(null);
    }

    /**
     * 프로그램 삭제 (PK: cmpnyCd, progId)
     */
    @Operation(
        summary = "프로그램 삭제",
        description = "프로그램을 삭제합니다.",
        tags = {"CmmnProgramController"}
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "삭제 성공"),
        @ApiResponse(responseCode = "900", description = "입력값 무결성 오류")
    })
    @DeleteMapping("/{progId}")
    public IntermediateResultVO<Void> deleteProgram(
        @Parameter(name = "cmpnyCd", description = "회사코드 (PK)", in = ParameterIn.QUERY)
        @RequestParam(value = "cmpnyCd", required = true) String cmpnyCd,
        @Parameter(name = "progId", description = "프로그램 ID (PK)", in = ParameterIn.PATH)
        @PathVariable("progId") String progId
    ) throws Exception {
        if (cmpnyCd == null || cmpnyCd.trim().isEmpty()) {
            IntermediateResultVO<Void> err = IntermediateResultVO.inputCheckError(null);
            err.setResultMessage("회사코드(cmpnyCd)는 필수입니다.");
            return err;
        }
        cmmnProgramService.deleteProgram(cmpnyCd.trim(), progId);
        return IntermediateResultVO.success(null);
    }
}
