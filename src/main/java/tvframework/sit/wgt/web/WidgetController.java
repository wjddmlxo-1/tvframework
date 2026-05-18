package tvframework.sit.wgt.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
import tvframework.sit.wgt.dto.CmFileBinaryDTO;
import tvframework.sit.wgt.dto.WidgetDTO;
import tvframework.sit.wgt.service.WidgetImageService;
import tvframework.sit.wgt.service.WidgetService;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 위젯 관리 REST API
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@RestController
@RequestMapping("/widget")
@RequiredArgsConstructor
@Tag(name = "WidgetController", description = "위젯 관리")
public class WidgetController {

    private final WidgetService widgetService;
    private final WidgetImageService widgetImageService;

    @Operation(summary = "카테고리 공통코드(CMMNCODE.582)")
    @GetMapping("/categories")
    public IntermediateResultVO<List<CodeOptionDTO>> categories(
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(widgetService.selectCategoryOptions(langCode));
    }

    @Operation(summary = "위젯 목록")
    @GetMapping("/list")
    public IntermediateResultVO<List<WidgetDTO>> list(
        @RequestParam(value = "categoryCd", required = false) String categoryCd,
        @RequestParam(value = "widgetName", required = false) String widgetName,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetService.selectWidgetList(categoryCd, widgetName, cmpnyCd));
    }

    @Operation(summary = "위젯 상세")
    @GetMapping("/detail")
    public IntermediateResultVO<WidgetDTO> detail(
        @RequestParam("widgetId") String widgetId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetService.selectWidgetDetail(widgetId, cmpnyCd));
    }

    @Operation(summary = "신규 위젯 ID 채번")
    @GetMapping("/nextWidgetId")
    public IntermediateResultVO<Map<String, String>> nextWidgetId(@RequestParam("cmpnyCd") String cmpnyCd) throws Exception {
        Map<String, String> m = new HashMap<>();
        m.put("widgetId", widgetService.selectNextWidgetId(cmpnyCd));
        return IntermediateResultVO.success(m);
    }

    @Operation(summary = "위젯 사진 업로드(CM_FILE, FILE_TY=WIDGET, SAVE_TY=DATA)")
    @PostMapping(value = "/uploadWidgetImage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IntermediateResultVO<Map<String, String>> uploadWidgetImage(
        @RequestPart("file") MultipartFile file,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            Map<String, String> r = widgetImageService.saveWidgetImageData(file, uid);
            return IntermediateResultVO.success(r);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Map<String, String>> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "위젯 사진 바이너리 조회(미리보기)")
    @GetMapping(value = "/widgetImage", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> widgetImage(@RequestParam("fileSq") String fileSq) throws Exception {
        CmFileBinaryDTO bin = widgetImageService.loadWidgetImage(fileSq);
        if (bin == null || bin.getFileData() == null || bin.getFileData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        MediaType mt = MediaType.APPLICATION_OCTET_STREAM;
        if (StringUtils.hasText(bin.getMimeTy())) {
            try {
                mt = MediaType.parseMediaType(bin.getMimeTy());
            } catch (Exception ignored) {
                mt = MediaType.APPLICATION_OCTET_STREAM;
            }
        }
        return ResponseEntity.ok().contentType(mt).body(bin.getFileData());
    }

    @Operation(summary = "등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "900", description = "입력값/중복 오류")
    })
    @PostMapping
    public IntermediateResultVO<Object> insert(
        @RequestBody WidgetDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            widgetService.insertWidget(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 위젯 ID가 이미 존재합니다. 다른 ID를 사용하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "WIDGET_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "수정")
    @PutMapping
    public IntermediateResultVO<Void> update(
        @RequestBody WidgetDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            widgetService.updateWidget(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "삭제")
    @DeleteMapping
    public IntermediateResultVO<Void> delete(
        @RequestParam("widgetId") String widgetId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        try {
            widgetService.deleteWidget(widgetId, cmpnyCd);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }
}
