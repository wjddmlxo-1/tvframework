package tvframework.sit.wgs.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import tvframework.sit.wgs.dto.WidgetStyleDTO;
import tvframework.sit.wgs.dto.WidgetStylePreviewSampleDTO;
import tvframework.sit.wgs.service.WidgetStyleService;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.service.CmmnCompanyService;

/**
 * 위젯 스타일 서비스 구현
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Service
@RequiredArgsConstructor
public class WidgetStyleServiceImpl implements WidgetStyleService {

    private static final int MAX_STYLE_ID = 50;
    private static final int MAX_CMPNY_CD = 20;
    private static final int MAX_STYLE_NAME = 100;
    private static final int MAX_STYLE_TY = 20;
    private static final int MAX_USE_FL = 1;
    private static final int MAX_USER_ID = 20;

    /** 스타일 유형 (CM_CODE_DETAIL.CODE_ID) */
    private static final String STYLE_TY_CODE_ID = "CMMNCODE.581";

    private final WidgetStyleMapper widgetStyleMapper;
    private final CmmnCompanyService cmmnCompanyService;
    private final WidgetStylePreviewDefaultsHolder widgetStylePreviewDefaultsHolder;

    @Override
    public List<CodeOptionDTO> selectStyleTypeOptions(String languageCode) throws Exception {
        return cmmnCompanyService.selectCodeOption(STYLE_TY_CODE_ID, languageCode);
    }

    @Override
    public List<WidgetStyleDTO> selectWidgetStyleList(String styleTy, String styleName, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("styleTy", styleTy);
        params.put("styleName", styleName);
        params.put("cmpnyCd", cmpnyCd.trim());
        List<WidgetStyleDTO> list = widgetStyleMapper.selectWidgetStyleList(params);
        if (list != null) {
            for (WidgetStyleDTO d : list) {
                sanitizeTemplateTextFields(d);
            }
        }
        return list;
    }

    @Override
    public WidgetStyleDTO selectWidgetStyleDetail(String styleId, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        if (!StringUtils.hasText(styleId)) {
            throw new IllegalArgumentException("스타일 ID는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("styleId", styleId.trim());
        params.put("cmpnyCd", cmpnyCd.trim());
        WidgetStyleDTO dto = widgetStyleMapper.selectWidgetStyleDetail(params);
        sanitizeTemplateTextFields(dto);
        return dto;
    }

    @Override
    public String selectNextStyleId(String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd.trim());
        return widgetStyleMapper.selectNextStyleId(params);
    }

    @Override
    public WidgetStylePreviewSampleDTO selectPreviewSample(String styleTy) throws Exception {
        /*
         * 화면에서 넘어오는 styleTy는 보통 DETAIL_CODE_VALUE(ST01 등)이다.
         * DB에서 VALUE→ID를 치환하면 운영 데이터에 따라 여러 VALUE가 동일 ID로만 묶여
         * 미리보기가 항상 같아질 수 있으므로, 미리보기는 요청 값 그대로 Holder에 넘긴다.
         * classpath 샘플 JSON이 없으면 빈 템플릿을 반환한다.
         */
        return widgetStylePreviewDefaultsHolder.resolveSample(styleTy);
    }

    @Override
    public WidgetStyleDTO selectBaseTemplateByStyleTy(String styleTy, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        if (!StringUtils.hasText(styleTy)) {
            throw new IllegalArgumentException("스타일 유형은 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("styleTy", styleTy.trim());
        params.put("cmpnyCd", cmpnyCd.trim());
        WidgetStyleDTO dto = widgetStyleMapper.selectBaseTemplateByStyleTy(params);
        sanitizeTemplateTextFields(dto);
        return dto;
    }

    @Override
    @Transactional
    public void insertWidgetStyle(WidgetStyleDTO dto, String userId) throws Exception {
        validateSizes(dto, true);
        String cmpnyCd = dto.getCmpnyCd().trim();
        String styleId = StringUtils.hasText(dto.getStyleId()) ? dto.getStyleId().trim() : selectNextStyleId(cmpnyCd);
        dto.setStyleId(styleId);
        dto.setCmpnyCd(cmpnyCd);

        Map<String, Object> params = new HashMap<>();
        params.put("styleId", styleId);
        params.put("cmpnyCd", cmpnyCd);
        params.put("styleName", dto.getStyleName().trim());
        params.put("styleTy", dto.getStyleTy().trim());
        params.put("htmlTemplate", nullToEmpty(dto.getHtmlTemplate()));
        params.put("cssTemplate", nullToEmpty(dto.getCssTemplate()));
        params.put("jsTemplate", nullToEmpty(dto.getJsTemplate()));
        params.put("useFl", StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y");
        params.put("creationId", truncateUserId(userId));
        params.put("updateId", truncateUserId(userId));
        widgetStyleMapper.insertWidgetStyle(params);
    }

    @Override
    @Transactional
    public void updateWidgetStyle(WidgetStyleDTO dto, String userId) throws Exception {
        validateSizes(dto, false);
        if (!StringUtils.hasText(dto.getStyleId())) {
            throw new IllegalArgumentException("스타일 ID는 필수입니다.");
        }
        if (!StringUtils.hasText(dto.getCmpnyCd())) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        String cmpnyCd = dto.getCmpnyCd().trim();
        WidgetStyleDTO prev = selectWidgetStyleDetail(dto.getStyleId().trim(), cmpnyCd);
        if (prev == null) {
            throw new IllegalArgumentException("스타일을 찾을 수 없습니다.");
        }

        Map<String, Object> params = new HashMap<>();
        params.put("styleId", dto.getStyleId().trim());
        params.put("cmpnyCd", cmpnyCd);
        params.put("styleName", dto.getStyleName().trim());
        params.put("styleTy", dto.getStyleTy().trim());
        params.put("htmlTemplate", nullToEmpty(dto.getHtmlTemplate()));
        params.put("cssTemplate", nullToEmpty(dto.getCssTemplate()));
        params.put("jsTemplate", nullToEmpty(dto.getJsTemplate()));
        params.put("useFl", StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y");
        params.put("updateId", truncateUserId(userId));
        widgetStyleMapper.updateWidgetStyle(params);
    }

    @Override
    @Transactional
    public void deleteWidgetStyle(String styleId, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(styleId)) {
            throw new IllegalArgumentException("스타일 ID는 필수입니다.");
        }
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> q = new HashMap<>();
        q.put("styleId", styleId.trim());
        q.put("cmpnyCd", cmpnyCd.trim());
        String flag = widgetStyleMapper.selectDeletePossibleFlag(q);
        if (!"O".equals(flag)) {
            throw new IllegalStateException("위젯에서 사용 중인 스타일은 삭제할 수 없습니다.");
        }
        widgetStyleMapper.deleteWidgetStyle(q);
    }

    private static void sanitizeTemplateTextFields(WidgetStyleDTO dto) {
        if (dto == null) {
            return;
        }
        dto.setHtmlTemplate(stripIllFormedSurrogates(dto.getHtmlTemplate()));
        dto.setCssTemplate(stripIllFormedSurrogates(dto.getCssTemplate()));
        dto.setJsTemplate(stripIllFormedSurrogates(dto.getJsTemplate()));
    }

    /**
     * DB·클라이언트에서 잘린 이모지 등으로 UTF-16 서로게이트 쌍이 깨지면 Jackson이 JSON 응답 작성 시
     * {@code Unmatched first part of surrogate pair} 로 실패한다. 고립된 high/low 서로게이트만 제거한다.
     */
    private static String stripIllFormedSurrogates(String s) {
        if (s == null || s.isEmpty()) {
            return s;
        }
        StringBuilder out = new StringBuilder(s.length());
        int len = s.length();
        for (int i = 0; i < len; ) {
            char c = s.charAt(i);
            if (Character.isHighSurrogate(c)) {
                if (i + 1 < len && Character.isLowSurrogate(s.charAt(i + 1))) {
                    out.append(c);
                    out.append(s.charAt(i + 1));
                    i += 2;
                } else {
                    i++;
                }
            } else if (Character.isLowSurrogate(c)) {
                i++;
            } else {
                out.append(c);
                i++;
            }
        }
        return out.toString();
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }

    private static String truncateUserId(String userId) {
        if (!StringUtils.hasText(userId)) {
            return "system";
        }
        String t = userId.trim();
        return t.length() > MAX_USER_ID ? t.substring(0, MAX_USER_ID) : t;
    }

    private void validateSizes(WidgetStyleDTO dto, boolean insert) {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        if (!StringUtils.hasText(dto.getCmpnyCd()) || dto.getCmpnyCd().trim().length() > MAX_CMPNY_CD) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 1~20자 이내여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getStyleName()) || dto.getStyleName().trim().length() > MAX_STYLE_NAME) {
            throw new IllegalArgumentException("스타일명은 1~100자 이내여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getStyleTy()) || dto.getStyleTy().trim().length() > MAX_STYLE_TY) {
            throw new IllegalArgumentException("스타일 유형이 올바르지 않습니다.");
        }
        if (StringUtils.hasText(dto.getUseFl()) && dto.getUseFl().trim().length() > MAX_USE_FL) {
            throw new IllegalArgumentException("사용여부 값이 올바르지 않습니다.");
        }
        if (StringUtils.hasText(dto.getStyleId()) && dto.getStyleId().trim().length() > MAX_STYLE_ID) {
            throw new IllegalArgumentException("스타일 ID 길이가 제한을 초과했습니다.");
        }
        if (insert && !StringUtils.hasText(dto.getStyleId())) {
            return;
        }
        if (!insert && !StringUtils.hasText(dto.getStyleId())) {
            throw new IllegalArgumentException("스타일 ID는 필수입니다.");
        }
    }
}
