package tvframework.sit.wgs.service.impl;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import tvframework.sit.wgs.dto.WidgetStylePreviewSampleDTO;

/**
 * (선택) classpath에 JSON이 있으면 미리보기 샘플 템플릿을 읽습니다. 없으면 빈 샘플을 반환합니다.
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Component
public class WidgetStylePreviewDefaultsHolder {

    private static final String CONFIG = "tvframework/config/widget-style-preview-defaults.json";

    /** 애플리케이션에 ObjectMapper 빈이 없을 수 있어 classpath JSON 전용 인스턴스 사용 */
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private JsonNode root;

    @PostConstruct
    public void load() throws IOException {
        ClassPathResource res = new ClassPathResource(CONFIG);
        if (!res.exists()) {
            root = OBJECT_MAPPER.createObjectNode();
            return;
        }
        try (InputStream in = res.getInputStream()) {
            root = OBJECT_MAPPER.readTree(in);
        }
    }

    /**
     * @param styleTy 스타일 유형 코드 (DETAIL_CODE_ID 또는 VALUE 등). 없으면 fallback 사용.
     */
    public WidgetStylePreviewSampleDTO resolveSample(String styleTy) {
        String fallback = root.path("fallback").asText("CARD");
        JsonNode samples = root.path("samples");
        JsonNode aliases = root.path("sampleKeyAliases");
        String key = StringUtils.hasText(styleTy) ? styleTy.trim() : fallback;
        JsonNode n = samples.path(key);
        if (!n.isObject() && aliases.isObject() && aliases.has(key)) {
            String aliasTarget = aliases.path(key).asText("");
            if (StringUtils.hasText(aliasTarget)) {
                key = aliasTarget.trim();
                n = samples.path(key);
            }
        }
        if (!n.isObject()) {
            n = samples.path(fallback);
        }
        WidgetStylePreviewSampleDTO dto = new WidgetStylePreviewSampleDTO();
        if (n.isObject()) {
            dto.setHtmlTemplate(n.path("htmlTemplate").asText(""));
            dto.setCssTemplate(n.path("cssTemplate").asText(""));
        }
        return dto;
    }
}
