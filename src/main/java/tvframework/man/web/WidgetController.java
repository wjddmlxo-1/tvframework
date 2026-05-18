package tvframework.man.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.man.dto.WidgetDTO;
import tvframework.man.service.WidgetService;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 메인 홈 대시보드(CM_DASHBRD) REST API.
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.10
 */
@RestController("mainDashboardWidgetController")
@RequestMapping("/mainDashboard")
@Tag(name = "MainDashboardController", description = "메인 홈 대시보드")
public class WidgetController {

    private final WidgetService widgetService;

    public WidgetController(@Qualifier("manWidgetServiceImpl") WidgetService widgetService) {
        this.widgetService = widgetService;
    }

    @Operation(summary = "나의 대시보드 조회(사용자 저장분 우선, 없으면 회사 기본)")
    @GetMapping("/dashboard")
    public IntermediateResultVO<WidgetDTO> dashboard(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        WidgetDTO row = widgetService.selectDashboard(cmpnyCd, uid);
        return IntermediateResultVO.success(row);
    }

    @Operation(summary = "위젯 갤러리 목록(메인)")
    @GetMapping("/widgets")
    public IntermediateResultVO<List<tvframework.sit.wgt.dto.WidgetDTO>> widgets(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "categoryCd", required = false) String categoryCd,
        @RequestParam(value = "searchKeyword", required = false) String searchKeyword
    ) throws Exception {
        return IntermediateResultVO.success(widgetService.selectWidgetGallery(cmpnyCd, categoryCd, searchKeyword));
    }

    @Operation(summary = "카테고리 공통코드(CMMNCODE.582)")
    @GetMapping("/categories")
    public IntermediateResultVO<List<CodeOptionDTO>> categories(
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(widgetService.selectCategoryOptions(langCode));
    }

    @Operation(summary = "신규 대시보드 ID 채번")
    @GetMapping("/nextDashbrdId")
    public IntermediateResultVO<Map<String, String>> nextDashbrdId() throws Exception {
        Map<String, String> m = new HashMap<>();
        m.put("dashbrdId", widgetService.selectNextDashbrdId());
        return IntermediateResultVO.success(m);
    }

    @Operation(summary = "나의 대시보드 저장")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "900", description = "입력값/중복 오류")
    })
    @PostMapping("/save")
    public IntermediateResultVO<Object> save(
        @RequestBody WidgetDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            widgetService.saveUserDashboard(dto, uid, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 대시보드 ID가 이미 존재합니다. 다른 ID를 사용하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "DASHBRD_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "회사 기본 대시보드 저장(관리자)")
    @PostMapping("/saveDefault")
    public IntermediateResultVO<Object> saveDefault(
        @RequestBody WidgetDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        if (loginVO == null || !StringUtils.hasText(loginVO.getId())) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("로그인이 필요합니다.");
            return vo;
        }
        if (!"ADM".equals(loginVO.getUserSe())) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.AUTH_ERROR.getCode());
            vo.setResultMessage("기본값 저장은 관리자만 사용할 수 있습니다.");
            return vo;
        }
        try {
            widgetService.saveDefaultDashboard(dto, loginVO.getId());
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 대시보드 ID가 이미 존재합니다. 다른 ID를 사용하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "DASHBRD_ID");
            vo.setResult(focus);
            return vo;
        }
    }
}
