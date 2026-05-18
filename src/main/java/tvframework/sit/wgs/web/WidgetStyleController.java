package tvframework.sit.wgs.web;

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
import tvframework.sit.wgs.dto.WidgetStyleDTO;
import tvframework.sit.wgs.dto.WidgetStylePreviewSampleDTO;
import tvframework.sit.wgs.service.WidgetStyleService;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 위젯 스타일 REST API
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@RestController
@RequestMapping("/widgetStyle")
@RequiredArgsConstructor
@Tag(name = "WidgetStyleController", description = "위젯 스타일 관리")
public class WidgetStyleController {

    private final WidgetStyleService widgetStyleService;

    @Operation(summary = "스타일 유형 공통코드(CMMNCODE.581)")
    @GetMapping("/styleTypes")
    public IntermediateResultVO<List<CodeOptionDTO>> styleTypes(
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(widgetStyleService.selectStyleTypeOptions(langCode));
    }

    @Operation(summary = "스타일 목록")
    @GetMapping("/list")
    public IntermediateResultVO<List<WidgetStyleDTO>> list(
        @RequestParam(value = "styleTy", required = false) String styleTy,
        @RequestParam(value = "styleName", required = false) String styleName,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetStyleService.selectWidgetStyleList(styleTy, styleName, cmpnyCd));
    }

    @Operation(summary = "스타일 상세")
    @GetMapping("/detail")
    public IntermediateResultVO<WidgetStyleDTO> detail(
        @RequestParam("styleId") String styleId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetStyleService.selectWidgetStyleDetail(styleId, cmpnyCd));
    }

    @Operation(summary = "신규 스타일 ID 채번")
    @GetMapping("/nextStyleId")
    public IntermediateResultVO<Map<String, String>> nextStyleId(@RequestParam("cmpnyCd") String cmpnyCd) throws Exception {
        Map<String, String> m = new HashMap<>();
        m.put("styleId", widgetStyleService.selectNextStyleId(cmpnyCd));
        return IntermediateResultVO.success(m);
    }

    @Operation(summary = "미리보기 샘플 HTML/CSS (설정 JSON, 키=스타일 유형 코드)")
    @GetMapping("/previewSample")
    public IntermediateResultVO<WidgetStylePreviewSampleDTO> previewSample(
        @Parameter(name = "styleTy", in = ParameterIn.QUERY) @RequestParam(value = "styleTy", required = false, defaultValue = "") String styleTy
    ) throws Exception {
        return IntermediateResultVO.success(widgetStyleService.selectPreviewSample(styleTy));
    }

    @Operation(summary = "기본 템플릿(동일 유형·회사 첫 건)")
    @GetMapping("/baseTemplate")
    public IntermediateResultVO<WidgetStyleDTO> baseTemplate(
        @RequestParam("styleTy") String styleTy,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(widgetStyleService.selectBaseTemplateByStyleTy(styleTy, cmpnyCd));
    }

    @Operation(summary = "등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "900", description = "입력값/중복 오류")
    })
    @PostMapping
    public IntermediateResultVO<Object> insert(
        @RequestBody WidgetStyleDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            widgetStyleService.insertWidgetStyle(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 스타일 ID가 이미 존재합니다. 다른 ID를 사용하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "STYLE_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "수정")
    @PutMapping
    public IntermediateResultVO<Void> update(
        @RequestBody WidgetStyleDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            widgetStyleService.updateWidgetStyle(dto, uid);
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
        @RequestParam("styleId") String styleId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        try {
            widgetStyleService.deleteWidgetStyle(styleId, cmpnyCd);
            return IntermediateResultVO.success(null);
        } catch (IllegalStateException | IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }
}
