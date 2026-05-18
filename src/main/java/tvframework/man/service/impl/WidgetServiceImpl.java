package tvframework.man.service.impl;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import tvframework.com.cmm.idgnr.IdGnrService;
import tvframework.man.dto.WidgetDTO;
import tvframework.man.service.WidgetService;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.service.CmmnCompanyService;

/**
 * 메인 홈 대시보드(CM_DASHBRD) 서비스 구현.
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.10
 */
@Service("manWidgetServiceImpl")
public class WidgetServiceImpl implements WidgetService {

    private static final String CATEGORY_CODE_ID = "CMMNCODE.582";

    private static final int MAX_DASHBRD_ID = 50;
    private static final int MAX_CMPNY_CD = 20;
    private static final int MAX_USE_FL = 1;
    private static final int MAX_USER_ID = 20;

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final WidgetMapper widgetMapper;
    private final CmmnCompanyService cmmnCompanyService;
    private final IdGnrService dashbrdIdGnrService;

    public WidgetServiceImpl(
        WidgetMapper widgetMapper,
        CmmnCompanyService cmmnCompanyService,
        @Qualifier("dashbrdIdGnrService") IdGnrService dashbrdIdGnrService
    ) {
        this.widgetMapper = widgetMapper;
        this.cmmnCompanyService = cmmnCompanyService;
        this.dashbrdIdGnrService = dashbrdIdGnrService;
    }

    @Override
    public WidgetDTO selectDashboard(String cmpnyCd, String userId) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        if (!StringUtils.hasText(userId)) {
            return widgetMapper.selectDefaultDashboard(baseParam(cmpnyCd.trim()));
        }
        Map<String, Object> p = baseParam(cmpnyCd.trim());
        p.put("userId", userId.trim());
        BigDecimal mbrsh = widgetMapper.selectMbrshSq(p);
        if (mbrsh != null) {
            p.put("mbrshSq", mbrsh);
            WidgetDTO userDash = widgetMapper.selectUserDashboard(p);
            if (userDash != null) {
                return userDash;
            }
        }
        return widgetMapper.selectDefaultDashboard(baseParam(cmpnyCd.trim()));
    }

    private static Map<String, Object> baseParam(String cmpnyCd) {
        Map<String, Object> m = new HashMap<>();
        m.put("cmpnyCd", cmpnyCd);
        return m;
    }

    @Override
    public List<CodeOptionDTO> selectCategoryOptions(String langCode) throws Exception {
        return cmmnCompanyService.selectCodeOption(CATEGORY_CODE_ID, langCode);
    }

    @Override
    public List<tvframework.sit.wgt.dto.WidgetDTO> selectWidgetGallery(String cmpnyCd, String categoryCd, String searchKeyword) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        if (StringUtils.hasText(categoryCd)) {
            p.put("categoryCd", categoryCd.trim());
        }
        if (StringUtils.hasText(searchKeyword)) {
            p.put("searchKeyword", searchKeyword.trim());
        }
        return widgetMapper.selectMainWidgetGallery(p);
    }

    @Override
    public String selectNextDashbrdId() throws Exception {
        return dashbrdIdGnrService.getNextStringId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveUserDashboard(WidgetDTO dto, String userId, String loginId) throws Exception {
        validateCommon(dto, loginId);
        assertJsonParsableForMysql("layoutJson", dto.getLayoutJson());
        assertJsonParsableForMysql("configJson", dto.getConfigJson());
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("로그인 사용자 정보가 없습니다.");
        }
        Map<String, Object> mq = new HashMap<>();
        mq.put("cmpnyCd", dto.getCmpnyCd().trim());
        mq.put("userId", userId.trim());
        BigDecimal mbrsh = widgetMapper.selectMbrshSq(mq);
        if (mbrsh == null) {
            throw new IllegalArgumentException("해당 회사에 대한 구성원(MBRSH_SQ) 정보가 없어 저장할 수 없습니다.");
        }

        Map<String, Object> dq = new HashMap<>();
        dq.put("cmpnyCd", dto.getCmpnyCd().trim());
        dq.put("mbrshSq", mbrsh);
        WidgetDTO existing = widgetMapper.selectUserDashboard(dq);

        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", dto.getCmpnyCd().trim());
        params.put("mbrshSq", mbrsh);
        params.put("layoutJson", dto.getLayoutJson());
        params.put("configJson", dto.getConfigJson());
        params.put("useFl", StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y");
        params.put("updateId", truncate(loginId, MAX_USER_ID));

        if (existing != null && StringUtils.hasText(existing.getDashbrdId())) {
            params.put("dashbrdId", existing.getDashbrdId().trim());
            widgetMapper.updateDashboard(params);
        } else {
            /* 신규 사용자 행: 기본 대시보드 ID가 화면에 있어도 PK 충돌 방지 — 항상 신규 채번 */
            params.put("dashbrdId", dashbrdIdGnrService.getNextStringId());
            params.put("creationId", truncate(loginId, MAX_USER_ID));
            widgetMapper.insertDashboard(params);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveDefaultDashboard(WidgetDTO dto, String loginId) throws Exception {
        validateCommon(dto, loginId);
        assertJsonParsableForMysql("layoutJson", dto.getLayoutJson());
        assertJsonParsableForMysql("configJson", dto.getConfigJson());
        Map<String, Object> dq = baseParam(dto.getCmpnyCd().trim());
        WidgetDTO existing = widgetMapper.selectDefaultDashboard(dq);

        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", dto.getCmpnyCd().trim());
        params.put("mbrshSq", null);
        params.put("layoutJson", dto.getLayoutJson());
        params.put("configJson", dto.getConfigJson());
        params.put("useFl", StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y");
        params.put("updateId", truncate(loginId, MAX_USER_ID));

        if (existing != null && StringUtils.hasText(existing.getDashbrdId())) {
            params.put("dashbrdId", existing.getDashbrdId().trim());
            widgetMapper.updateDashboard(params);
        } else {
            // 신규 회사 기본 행: CM_IDS 기반 채번만 사용(요청의 dashbrdId는 사용자 행 ID와 충돌 가능)
            params.put("dashbrdId", dashbrdIdGnrService.getNextStringId());
            params.put("creationId", truncate(loginId, MAX_USER_ID));
            widgetMapper.insertDashboard(params);
        }
    }

    /** MyBatis `CAST(#{...} AS JSON)` 전에 문자열이 RFC JSON인지 검사 */
    private void assertJsonParsableForMysql(String fieldName, String raw) {
        if (!StringUtils.hasText(raw)) {
            return;
        }
        try {
            OBJECT_MAPPER.readTree(raw);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(
                    fieldName + "은(는) 유효한 JSON 문자열이어야 합니다. 키는 큰따옴표로 표기하세요.");
        }
    }

    private void validateCommon(WidgetDTO dto, String loginId) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        if (!StringUtils.hasText(dto.getCmpnyCd())) {
            throw new IllegalArgumentException("회사코드는 필수입니다.");
        }
        if (dto.getCmpnyCd().trim().length() > MAX_CMPNY_CD) {
            throw new IllegalArgumentException("회사코드는 " + MAX_CMPNY_CD + "자 이내여야 합니다.");
        }
        if (StringUtils.hasText(dto.getDashbrdId()) && dto.getDashbrdId().trim().length() > MAX_DASHBRD_ID) {
            throw new IllegalArgumentException("대시보드ID는 " + MAX_DASHBRD_ID + "자 이내여야 합니다.");
        }
        if (StringUtils.hasText(dto.getUseFl()) && dto.getUseFl().trim().length() > MAX_USE_FL) {
            throw new IllegalArgumentException("사용여부는 " + MAX_USE_FL + "자여야 합니다.");
        }
        if (!StringUtils.hasText(loginId)) {
            throw new IllegalArgumentException("로그인 사용자 정보가 없습니다.");
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }
}
