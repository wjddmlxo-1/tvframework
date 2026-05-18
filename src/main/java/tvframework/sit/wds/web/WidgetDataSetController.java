package tvframework.sit.wds.web;

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
import tvframework.sit.wds.dto.WidgetDataSetDTO;
import tvframework.sit.wds.dto.WidgetDataSetPreviewRequestDTO;
import tvframework.sit.wds.dto.WidgetDataSetPreviewResponseDTO;
import tvframework.sit.wds.service.WidgetDataSetService;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 위젯 데이터셋 REST API
 */
@RestController
@RequestMapping("/widgetDataSet")
@RequiredArgsConstructor
@Tag(name = "WidgetDataSetController", description = "위젯 데이터셋 관리")
public class WidgetDataSetController {

    private final WidgetDataSetService widgetDataSetService;

    @Operation(summary = "데이터 유형 공통코드(CMMNCODE.580)")
    @GetMapping("/dataTypes")
    public IntermediateResultVO<List<CodeOptionDTO>> dataTypes(
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(widgetDataSetService.selectDataTypeOptions(langCode));
    }

    @Operation(summary = "데이터셋 목록")
    @GetMapping("/list")
    public IntermediateResultVO<List<WidgetDataSetDTO>> list(
        @RequestParam(value = "dataType", required = false) String dataType,
        @RequestParam(value = "datasetName", required = false) String datasetName,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetDataSetService.selectWidgetDataSetList(dataType, datasetName, cmpnyCd));
    }

    @Operation(summary = "데이터셋 상세")
    @GetMapping("/detail")
    public IntermediateResultVO<WidgetDataSetDTO> detail(
        @RequestParam("datasetId") String datasetId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetDataSetService.selectWidgetDataSetDetail(datasetId, cmpnyCd));
    }

    @Operation(summary = "신규 데이터셋 ID 채번")
    @GetMapping("/nextDatasetId")
    public IntermediateResultVO<Map<String, String>> nextDatasetId(@RequestParam("cmpnyCd") String cmpnyCd) throws Exception {
        Map<String, String> m = new HashMap<>();
        m.put("datasetId", widgetDataSetService.selectNextDatasetId(cmpnyCd));
        return IntermediateResultVO.success(m);
    }

    @Operation(summary = "미리보기")
    @PostMapping("/preview")
    public IntermediateResultVO<WidgetDataSetPreviewResponseDTO> preview(@RequestBody WidgetDataSetPreviewRequestDTO request) throws Exception {
        return IntermediateResultVO.success(widgetDataSetService.preview(request));
    }

    @Operation(summary = "등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "900", description = "입력값/중복 오류")
    })
    @PostMapping
    public IntermediateResultVO<Object> insert(
        @RequestBody WidgetDataSetDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            widgetDataSetService.insertWidgetDataSet(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 데이터셋 ID가 이미 존재합니다. 다른 ID를 사용하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "DATASET_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "수정")
    @PutMapping
    public IntermediateResultVO<Void> update(
        @RequestBody WidgetDataSetDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            widgetDataSetService.updateWidgetDataSet(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalStateException | IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "삭제")
    @DeleteMapping
    public IntermediateResultVO<Void> delete(
        @RequestParam("datasetId") String datasetId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        try {
            widgetDataSetService.deleteWidgetDataSet(datasetId, cmpnyCd);
            return IntermediateResultVO.success(null);
        } catch (IllegalStateException | IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }
}
