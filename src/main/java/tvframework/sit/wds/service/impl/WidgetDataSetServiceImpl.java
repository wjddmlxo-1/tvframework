package tvframework.sit.wds.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import java.sql.Types;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import lombok.RequiredArgsConstructor;
import tvframework.sit.wds.dto.WidgetDataSetDTO;
import tvframework.sit.wds.dto.WidgetDataSetPreviewRequestDTO;
import tvframework.sit.wds.dto.WidgetDataSetPreviewResponseDTO;
import tvframework.sit.wds.service.WidgetDataSetService;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.service.CmmnCompanyService;

/**
 * 위젯 데이터셋 서비스 구현
 */
@Service
@RequiredArgsConstructor
public class WidgetDataSetServiceImpl implements WidgetDataSetService {

    private static final int MAX_DATASET_ID = 50;
    private static final int MAX_DATASET_NAME = 100;
    private static final int MAX_DATASET_TY = 20;
    private static final int MAX_CMPNY_CD = 20;
    private static final int MAX_USE_FL = 1;
    private static final int SQL_PREVIEW_MAX_ROWS = 100;
    /** 위젯 데이터셋 데이터 유형 (CM_CODE_DETAIL.CODE_ID) */
    private static final String DATASET_TY_CODE_ID = "CMMNCODE.580";

    private final WidgetDataSetMapper widgetDataSetMapper;
    private final CmmnCompanyService cmmnCompanyService;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<CodeOptionDTO> selectDataTypeOptions(String languageCode) throws Exception {
        return cmmnCompanyService.selectCodeOption(DATASET_TY_CODE_ID, languageCode);
    }

    @Override
    public List<WidgetDataSetDTO> selectWidgetDataSetList(String dataType, String datasetName, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("dataType", dataType);
        params.put("datasetName", datasetName);
        params.put("cmpnyCd", cmpnyCd.trim());
        return widgetDataSetMapper.selectWidgetDataSetList(params);
    }

    @Override
    public WidgetDataSetDTO selectWidgetDataSetDetail(String datasetId, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("datasetId", datasetId);
        params.put("cmpnyCd", cmpnyCd.trim());
        return widgetDataSetMapper.selectWidgetDataSetDetail(params);
    }

    @Override
    public String selectNextDatasetId(String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd.trim());
        return widgetDataSetMapper.selectNextDatasetId(params);
    }

    @Override
    @Transactional
    public void insertWidgetDataSet(WidgetDataSetDTO dto, String userId) throws Exception {
        validateSizes(dto, true);
        String config = StringUtils.hasText(dto.getConfigJson()) ? dto.getConfigJson().trim() : "{}";
        String cmpnyCd = dto.getCmpnyCd().trim();
        String datasetId = StringUtils.hasText(dto.getDatasetId()) ? dto.getDatasetId().trim() : widgetDataSetMapper.selectNextDatasetId(new HashMap<String, Object>() {{
            put("cmpnyCd", cmpnyCd);
        }});
        dto.setDatasetId(datasetId);
        dto.setCmpnyCd(cmpnyCd);

        Map<String, Object> params = new HashMap<>();
        params.put("datasetId", datasetId);
        params.put("cmpnyCd", cmpnyCd);
        params.put("datasetName", dto.getDatasetName().trim());
        params.put("datasetTy", dto.getDatasetTy().trim());
        params.put("configJson", config);
        params.put("useFl", StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y");
        params.put("creationId", userId != null ? userId : "system");
        params.put("updateId", userId != null ? userId : "system");
        widgetDataSetMapper.insertWidgetDataSet(params);
    }

    @Override
    @Transactional
    public void updateWidgetDataSet(WidgetDataSetDTO dto, String userId) throws Exception {
        validateSizes(dto, false);
        if (!StringUtils.hasText(dto.getDatasetId())) {
            throw new IllegalArgumentException("데이터셋 ID는 필수입니다.");
        }
        if (!StringUtils.hasText(dto.getCmpnyCd())) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        String cmpnyCd = dto.getCmpnyCd().trim();
        WidgetDataSetDTO prev = selectWidgetDataSetDetail(dto.getDatasetId().trim(), cmpnyCd);
        if (prev == null) {
            throw new IllegalArgumentException("데이터셋을 찾을 수 없습니다.");
        }
        String newUse = StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y";
        if ("Y".equalsIgnoreCase(prev.getUseFl()) && "N".equalsIgnoreCase(newUse)) {
            Map<String, Object> q = new HashMap<>();
            q.put("datasetId", dto.getDatasetId().trim());
            String flag = widgetDataSetMapper.selectUnusePossibleFlag(q);
            if (!"O".equals(flag)) {
                throw new IllegalStateException("위젯에서 사용 중인 데이터셋은 사용안함으로 변경할 수 없습니다.");
            }
        }
        String config = StringUtils.hasText(dto.getConfigJson()) ? dto.getConfigJson().trim() : "{}";
        Map<String, Object> params = new HashMap<>();
        params.put("datasetId", dto.getDatasetId().trim());
        params.put("cmpnyCd", cmpnyCd);
        params.put("datasetName", dto.getDatasetName().trim());
        params.put("datasetTy", dto.getDatasetTy().trim());
        params.put("configJson", config);
        params.put("useFl", newUse);
        params.put("updateId", userId != null ? userId : "system");
        widgetDataSetMapper.updateWidgetDataSet(params);
    }

    @Override
    @Transactional
    public void deleteWidgetDataSet(String datasetId, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(datasetId)) {
            throw new IllegalArgumentException("데이터셋 ID는 필수입니다.");
        }
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> q = new HashMap<>();
        q.put("datasetId", datasetId.trim());
        q.put("cmpnyCd", cmpnyCd.trim());
        String flag = widgetDataSetMapper.selectDeletePossibleFlag(q);
        if (!"O".equals(flag)) {
            throw new IllegalStateException("위젯에서 사용 중인 데이터셋은 삭제할 수 없습니다.");
        }
        widgetDataSetMapper.deleteWidgetDataSet(q);
    }

    @Override
    public WidgetDataSetPreviewResponseDTO preview(WidgetDataSetPreviewRequestDTO request) throws Exception {
        WidgetDataSetPreviewResponseDTO res = new WidgetDataSetPreviewResponseDTO();
        if (request == null || !StringUtils.hasText(request.getDatasetTy())) {
            res.setMessage("데이터 유형이 필요합니다.");
            return res;
        }
        String ty = request.getDatasetTy().trim().toUpperCase(Locale.ROOT);
        String raw = StringUtils.hasText(request.getConfigJson()) ? request.getConfigJson() : "{}";
        Map<String, String> p = request.getPreviewParams() != null ? request.getPreviewParams() : new HashMap<>();

        switch (ty) {
            case "STATIC":
                return previewStatic(raw, res);
            case "SQL":
                return previewSql(raw, p, res);
            case "API":
                return previewApi(raw, p, res);
            default:
                res.setMessage("지원하지 않는 데이터 유형입니다.");
                return res;
        }
    }

    private WidgetDataSetPreviewResponseDTO previewStatic(String configJson, WidgetDataSetPreviewResponseDTO res) {
        try {
            JsonNode root = objectMapper.readTree(configJson);
            JsonNode items = root.path("items");
            if (!items.isArray() || items.size() == 0) {
                res.setMessage("items 배열이 비어 있습니다.");
                return res;
            }
            Set<String> cols = new LinkedHashSet<>();
            List<Map<String, Object>> rows = new ArrayList<>();
            for (JsonNode row : items) {
                Map<String, Object> m = new LinkedHashMap<>();
                Iterator<String> it = row.fieldNames();
                while (it.hasNext()) {
                    String k = it.next();
                    cols.add(k);
                    JsonNode v = row.get(k);
                    if (v.isNumber()) {
                        m.put(k, v.numberValue());
                    } else if (v.isBoolean()) {
                        m.put(k, v.booleanValue());
                    } else {
                        m.put(k, v.asText());
                    }
                }
                rows.add(m);
            }
            res.setColumns(new ArrayList<>(cols));
            res.setRows(rows);
        } catch (Exception e) {
            res.setMessage("JSON 파싱 오류: " + e.getMessage());
        }
        return res;
    }

    private WidgetDataSetPreviewResponseDTO previewSql(String configJson, Map<String, String> p, WidgetDataSetPreviewResponseDTO res) {
        try {
            JsonNode root = objectMapper.readTree(configJson);
            String sql = root.path("query").asText("");
            if (!StringUtils.hasText(sql)) {
                res.setMessage("query 항목이 비어 있습니다.");
                return res;
            }
            String cleaned = validateSelectOnly(sql);
            // Config(JSON)의 query 제외 필드에서 :이름 바인드 후보 수집 → 미리보기 파라미터(세션/화면)가 덮어씀 (회사·사용자는 Config에서 무시)
            Map<String, Object> bind = mergeSqlPreviewBindMap(root, p);
            if (!cleaned.toUpperCase(Locale.ROOT).contains("LIMIT")) {
                cleaned = cleaned + " LIMIT " + SQL_PREVIEW_MAX_ROWS;
            }
            List<Map<String, Object>> rows = namedParameterJdbcTemplate.queryForList(cleaned, bind);
            List<String> cols = new ArrayList<>();
            if (!rows.isEmpty()) {
                cols.addAll(rows.get(0).keySet());
            }
            res.setColumns(cols);
            res.setRows(rows);
        } catch (Exception e) {
            res.setMessage("SQL 미리보기 오류: " + e.getMessage());
        }
        return res;
    }

    /**
     * SQL 미리보기 바인드: Config JSON(최상위 query 제외, 중첩 객체·configList 등 포함)에서 스칼라 값 수집 후,
     * previewParams(회사코드·사용자ID 등)로 덮어씀. 회사/사용자 관련 키는 Config에서 넣지 않음.
     */
    private Map<String, Object> mergeSqlPreviewBindMap(JsonNode configRoot, Map<String, String> previewParams) {
        Map<String, Object> bind = new HashMap<>();
        if (configRoot != null && configRoot.isObject()) {
            collectSqlBindValuesFromConfig(configRoot, bind, true);
            // configList[0].limitCnt 등 흔한 구조를 재귀 수집이 놓치는 경우 대비
            ensureLimitCntFromConfigList(configRoot, bind);
        }
        if (previewParams != null) {
            for (Map.Entry<String, String> e : previewParams.entrySet()) {
                String key = e.getKey();
                if (!StringUtils.hasText(key)) {
                    continue;
                }
                String val = e.getValue();
                // Config에서 이미 채운 값(예: limitCnt)을 빈 문자열 미리보기 값으로 덮어쓰지 않음
                if (StringUtils.hasText(val)) {
                    bind.put(key, val);
                } else if (!bind.containsKey(key)) {
                    bind.put(key, "");
                }
            }
        }
        bind.putIfAbsent("listCnt", 100);
        bind.putIfAbsent("todayDt", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        // SQL은 :limitCnt, 미리보기 파라미터는 listCnt만 오는 경우가 많음. Config에 limitCnt가 없으면 listCnt로 충족
        if (!bind.containsKey("limitCnt") && bind.containsKey("listCnt")) {
            bind.put("limitCnt", bind.get("listCnt"));
        }
        // LIMIT 등에 문자열 "3" 대신 정수 바인드(MySQL·드라이버에 따라 grammar 오류 방지)
        coerceIntBindIfPossible(bind, "limitCnt");
        coerceIntBindIfPossible(bind, "listCnt");
        return bind;
    }

    /**
     * LIMIT 등에 문자열이 바인드되면 MySQL 드라이버가 {@code LIMIT '3'} 형태로 보내 문법 오류가 날 수 있음.
     * JDBC 타입을 INTEGER로 고정해 {@code setInt} 경로를 타도록 한다.
     */
    private static void coerceIntBindIfPossible(Map<String, Object> bind, String key) {
        if (bind == null || !StringUtils.hasText(key) || !bind.containsKey(key)) {
            return;
        }
        Object v = bind.get(key);
        Integer n = null;
        if (v instanceof Number) {
            n = ((Number) v).intValue();
        } else if (v instanceof String && StringUtils.hasText((String) v)) {
            try {
                n = Integer.parseInt(((String) v).trim());
            } catch (NumberFormatException ignored) {
                return;
            }
        } else {
            return;
        }
        bind.put(key, new SqlParameterValue(Types.INTEGER, n));
    }

    /** configList[].limitCnt 명시 추출 (재귀 수집과 무관하게 바인드 보강) */
    private void ensureLimitCntFromConfigList(JsonNode root, Map<String, Object> bind) {
        if (bind.containsKey("limitCnt")) {
            return;
        }
        JsonNode cl = root.path("configList");
        if (!cl.isArray() || cl.size() == 0) {
            return;
        }
        for (JsonNode block : cl) {
            if (!block.isObject() || !block.has("limitCnt")) {
                continue;
            }
            JsonNode lc = block.get("limitCnt");
            if (lc != null && !lc.isNull() && lc.isValueNode()) {
                bind.put("limitCnt", jsonScalarToBind(lc));
                return;
            }
        }
    }

    /** 회사코드·사용자ID는 세션/화면(previewParams) 전용 — Config JSON 값으로 치환하지 않음 */
    private static boolean isSessionOnlySqlBindKey(String key) {
        if (key == null) {
            return false;
        }
        String k = key.toLowerCase(Locale.ROOT);
        return "companycd".equals(k) || "cmpnycd".equals(k) || "userid".equals(k) || "user_id".equals(k);
    }

    /**
     * Config JSON에서 NamedParameterJdbcTemplate 바인드 후보 수집.
     * 최상위 {@code query} 필드는 SQL 본문이므로 제외. 객체·배열(예: configList)은 재귀적으로 스칼라만 수집.
     */
    private void collectSqlBindValuesFromConfig(JsonNode node, Map<String, Object> out, boolean isRoot) {
        if (node == null || !node.isObject()) {
            return;
        }
        Iterator<String> it = node.fieldNames();
        while (it.hasNext()) {
            String k = it.next();
            if (isRoot && "query".equals(k)) {
                continue;
            }
            if (isSessionOnlySqlBindKey(k)) {
                continue;
            }
            JsonNode v = node.get(k);
            if (v == null || v.isNull()) {
                continue;
            }
            if (v.isObject()) {
                collectSqlBindValuesFromConfig(v, out, false);
            } else if (v.isArray()) {
                for (JsonNode el : v) {
                    if (el.isObject()) {
                        collectSqlBindValuesFromConfig(el, out, false);
                    } else if (el.isValueNode()) {
                        out.put(k, jsonScalarToBind(el));
                    }
                }
            } else if (v.isValueNode()) {
                out.put(k, jsonScalarToBind(v));
            }
        }
    }

    private static Object jsonScalarToBind(JsonNode v) {
        if (v.isBoolean()) {
            return v.booleanValue();
        }
        if (v.isInt()) {
            return v.intValue();
        }
        if (v.isLong()) {
            return v.longValue();
        }
        if (v.isDouble() || v.isFloat()) {
            return v.doubleValue();
        }
        if (v.isBigDecimal()) {
            return v.decimalValue();
        }
        return v.asText();
    }

    private String validateSelectOnly(String sql) {
        String s = sql.trim();
        String upper = s.toUpperCase(Locale.ROOT);
        if (!upper.startsWith("SELECT")) {
            throw new IllegalArgumentException("SELECT 문만 실행할 수 있습니다.");
        }
        int semi = s.indexOf(';');
        if (semi >= 0 && semi < s.length() - 1) {
            throw new IllegalArgumentException("세미콜론은 문장 끝에만 허용됩니다.");
        }
        if (semi == s.length() - 1) {
            s = s.substring(0, semi).trim();
        }
        return s;
    }

    private WidgetDataSetPreviewResponseDTO previewApi(String configJson, Map<String, String> previewParams, WidgetDataSetPreviewResponseDTO res) {
        try {
            JsonNode root = objectMapper.readTree(configJson);
            String baseUrl = root.path("url").asText("").trim();
            if (!StringUtils.hasText(baseUrl)) {
                res.setMessage("url 항목이 비어 있습니다.");
                return res;
            }
            String lower = baseUrl.toLowerCase(Locale.ROOT);
            if (!lower.startsWith("https://") && !lower.startsWith("http://")) {
                res.setMessage("url은 http(s) 스킴만 허용됩니다.");
                return res;
            }
            String method = root.path("method").asText("GET").toUpperCase(Locale.ROOT);
            if (!"GET".equals(method)) {
                res.setMessage("미리보기는 GET만 지원합니다.");
                return res;
            }

            Map<String, Object> bind = mergeApiPreviewBindMap(root, previewParams);
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(baseUrl);
            JsonNode paramsNode = root.path("params");
            if (paramsNode.isObject()) {
                Iterator<String> pit = paramsNode.fieldNames();
                while (pit.hasNext()) {
                    String pk = pit.next();
                    JsonNode pv = paramsNode.get(pk);
                    String resolved = resolveApiParamValue(pv, bind);
                    uriBuilder.queryParam(pk, resolved);
                }
            }

            String finalUrl = uriBuilder.encode().build().toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            JsonNode headersNode = root.path("headers");
            if (headersNode.isObject()) {
                Iterator<String> hit = headersNode.fieldNames();
                while (hit.hasNext()) {
                    String hk = hit.next();
                    JsonNode hv = headersNode.get(hk);
                    if (hv != null && hv.isValueNode()) {
                        headers.set(hk, resolveApiParamValue(hv, bind));
                    }
                }
            }

            RestTemplate rt = new RestTemplate();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = rt.exchange(finalUrl, HttpMethod.GET, entity, String.class);
            String body = response.getBody();
            if (body == null || body.isEmpty()) {
                res.setMessage("응답이 비어 있습니다.");
                return res;
            }
            JsonNode data = parseJsonFromApiBody(body);
            if (data != null) {
                if (data.isArray()) {
                    return jsonArrayToPreview((ArrayNode) data, res);
                }
                if (data.isObject()) {
                    List<Map<String, Object>> rows = new ArrayList<>();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> one = objectMapper.convertValue(data, Map.class);
                    rows.add(one);
                    res.setColumns(new ArrayList<>(one.keySet()));
                    res.setRows(rows);
                    return res;
                }
                res.setMessage("JSON 배열·객체 형식만 미리보기 표로 표시할 수 있습니다.");
                return res;
            }
            if (previewPlainTextTable(body, res)) {
                return res;
            }
            res.setMessage(
                "API 응답이 JSON이 아니며, 주석(#)·빈 줄을 제외한 뒤 탭/공백 구분 표로도 해석할 수 없습니다. "
                    + "(기상청 API는 params에 disp=1 이면 JSON입니다.) 응답 앞부분: "
                    + truncateForPreviewMessage(body, 240));
        } catch (Exception e) {
            res.setMessage("API 미리보기 오류: " + e.getMessage());
        }
        return res;
    }

    /**
     * JSON 전체 또는 본문 중 첫 '{'·'[' 이후만 파싱 (앞쪽 # 주석·텍스트가 있어도 JSON이 이어지는 경우).
     */
    private JsonNode parseJsonFromApiBody(String body) {
        String s = stripUtf8Bom(body.trim());
        if (s.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readTree(s);
        } catch (Exception ignored) {
            // fall through
        }
        int idxObj = s.indexOf('{');
        int idxArr = s.indexOf('[');
        int start = -1;
        if (idxObj >= 0 && idxArr >= 0) {
            start = Math.min(idxObj, idxArr);
        } else if (idxObj >= 0) {
            start = idxObj;
        } else if (idxArr >= 0) {
            start = idxArr;
        }
        if (start < 0) {
            return null;
        }
        try {
            return objectMapper.readTree(s.substring(start));
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String stripUtf8Bom(String s) {
        if (s != null && !s.isEmpty() && s.charAt(0) == '\uFEFF') {
            return s.substring(1);
        }
        return s;
    }

    private static String truncateForPreviewMessage(String body, int maxLen) {
        String t = body.replace("\r\n", "\n").replace('\r', '\n').trim();
        if (t.length() <= maxLen) {
            return t;
        }
        return t.substring(0, maxLen) + "…";
    }

    /**
     * 기상청 typ01 등 # 주석 + 탭/고정구분 텍스트 표를 미리보기 행으로 변환.
     */
    private boolean previewPlainTextTable(String body, WidgetDataSetPreviewResponseDTO res) {
        List<String> lines = new ArrayList<>();
        for (String line : body.split("\\R")) {
            String t = line.trim();
            if (t.isEmpty() || t.startsWith("#")) {
                continue;
            }
            lines.add(t);
        }
        if (lines.isEmpty()) {
            return false;
        }
        List<String[]> splitLines = new ArrayList<>();
        for (String line : lines) {
            splitLines.add(splitPlainTextTableLine(line));
        }
        int maxCols = splitLines.stream().mapToInt(a -> a.length).max().orElse(0);
        if (maxCols == 0) {
            return false;
        }
        List<List<String>> tableRows = new ArrayList<>();
        for (String[] r : splitLines) {
            List<String> row = new ArrayList<>();
            for (int i = 0; i < maxCols; i++) {
                row.add(i < r.length ? r[i].trim() : "");
            }
            tableRows.add(row);
        }
        boolean headerFirst = isProbableHeaderRow(tableRows.get(0));
        List<String> columns;
        int dataStart;
        if (headerFirst) {
            columns = sanitizePreviewColumnNames(tableRows.get(0));
            dataStart = 1;
        } else {
            columns = new ArrayList<>();
            for (int c = 0; c < maxCols; c++) {
                columns.add("col_" + (c + 1));
            }
            dataStart = 0;
        }
        if (dataStart >= tableRows.size()) {
            return false;
        }
        List<Map<String, Object>> outRows = new ArrayList<>();
        for (int i = dataStart; i < tableRows.size(); i++) {
            List<String> r = tableRows.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            for (int c = 0; c < columns.size(); c++) {
                m.put(columns.get(c), c < r.size() ? r.get(c) : "");
            }
            outRows.add(m);
        }
        res.setColumns(columns);
        res.setRows(outRows);
        return true;
    }

    private static String[] splitPlainTextTableLine(String line) {
        if (line.contains("\t")) {
            return line.split("\t", -1);
        }
        if (line.contains("|")) {
            return line.split("\\|", -1);
        }
        return line.split("\\s{2,}", -1);
    }

    private static boolean isProbableHeaderRow(List<String> cells) {
        if (cells == null || cells.isEmpty()) {
            return false;
        }
        int numeric = 0;
        int nonEmpty = 0;
        for (String c : cells) {
            String t = c.trim();
            if (t.isEmpty()) {
                continue;
            }
            nonEmpty++;
            if (t.matches("^-?[0-9]+(\\.[0-9]+)?$")) {
                numeric++;
            }
        }
        if (nonEmpty == 0) {
            return false;
        }
        return numeric * 2 < nonEmpty;
    }

    private static List<String> sanitizePreviewColumnNames(List<String> row) {
        List<String> out = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < row.size(); i++) {
            String base = row.get(i).trim();
            if (!StringUtils.hasText(base)) {
                base = "col_" + (i + 1);
            } else {
                base = base.replaceAll("[^a-zA-Z0-9_가-힣]", "_");
                if (base.isEmpty()) {
                    base = "col_" + (i + 1);
                }
            }
            String name = base;
            int n = 2;
            while (seen.contains(name)) {
                name = base + "_" + n;
                n++;
            }
            seen.add(name);
            out.add(name);
        }
        return out;
    }

    /**
     * API 미리보기: Config에서 url·method·headers·params 제외한 스칼라와 previewParams를 병합.
     * params 값이 {@code ":이름"} 형태면 병합 맵에서 치환(예: {@code :searchdate}, {@code :authkey}).
     */
    private Map<String, Object> mergeApiPreviewBindMap(JsonNode configRoot, Map<String, String> previewParams) {
        Map<String, Object> bind = new HashMap<>();
        if (configRoot != null && configRoot.isObject()) {
            collectApiBindValuesFromConfig(configRoot, bind, true);
        }
        if (previewParams != null) {
            for (Map.Entry<String, String> e : previewParams.entrySet()) {
                String key = e.getKey();
                if (!StringUtils.hasText(key)) {
                    continue;
                }
                String val = e.getValue();
                if (StringUtils.hasText(val)) {
                    bind.put(key, val);
                } else if (!bind.containsKey(key)) {
                    bind.put(key, "");
                }
            }
        }
        bind.putIfAbsent("todayDt", LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        bind.putIfAbsent("searchdate", LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE));
        return bind;
    }

    private void collectApiBindValuesFromConfig(JsonNode node, Map<String, Object> out, boolean isRoot) {
        if (node == null || !node.isObject()) {
            return;
        }
        Iterator<String> it = node.fieldNames();
        while (it.hasNext()) {
            String k = it.next();
            if (isRoot && isApiConfigRootSkipKey(k)) {
                continue;
            }
            if (isSessionOnlySqlBindKey(k)) {
                continue;
            }
            JsonNode v = node.get(k);
            if (v == null || v.isNull()) {
                continue;
            }
            if (v.isObject()) {
                collectApiBindValuesFromConfig(v, out, false);
            } else if (v.isArray()) {
                for (JsonNode el : v) {
                    if (el.isObject()) {
                        collectApiBindValuesFromConfig(el, out, false);
                    } else if (el.isValueNode()) {
                        out.put(k, jsonScalarToBind(el));
                    }
                }
            } else if (v.isValueNode()) {
                out.put(k, jsonScalarToBind(v));
            }
        }
    }

    private static boolean isApiConfigRootSkipKey(String k) {
        return "query".equals(k) || "url".equals(k) || "method".equals(k) || "headers".equals(k) || "params".equals(k);
    }

    private String resolveApiParamValue(JsonNode node, Map<String, Object> bind) {
        if (node == null || !node.isValueNode()) {
            return "";
        }
        Object raw = jsonScalarToBind(node);
        String s = raw instanceof String ? (String) raw : String.valueOf(raw);
        String t = s.trim();
        if (t.startsWith(":") && t.length() > 1 && PLACEHOLDER_NAME.matcher(t.substring(1)).matches()) {
            String name = t.substring(1);
            if (!bind.containsKey(name)) {
                return "";
            }
            return stringifyBindValueForApi(bind.get(name));
        }
        return s;
    }

    private static final java.util.regex.Pattern PLACEHOLDER_NAME = java.util.regex.Pattern.compile("[a-zA-Z_][a-zA-Z0-9_]*");

    private static String stringifyBindValueForApi(Object o) {
        if (o == null) {
            return "";
        }
        if (o instanceof SqlParameterValue) {
            Object v = ((SqlParameterValue) o).getValue();
            return v != null ? String.valueOf(v) : "";
        }
        return String.valueOf(o);
    }

    private WidgetDataSetPreviewResponseDTO jsonArrayToPreview(ArrayNode arr, WidgetDataSetPreviewResponseDTO res) {
        Set<String> cols = new LinkedHashSet<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (JsonNode n : arr) {
            if (n.isObject()) {
                Map<String, Object> m = objectMapper.convertValue(n, Map.class);
                cols.addAll(m.keySet());
                rows.add(m);
            }
        }
        res.setColumns(new ArrayList<>(cols));
        res.setRows(rows);
        return res;
    }

    private void validateSizes(WidgetDataSetDTO dto, boolean insert) {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        if (!StringUtils.hasText(dto.getCmpnyCd()) || dto.getCmpnyCd().trim().length() > MAX_CMPNY_CD) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 1~20자 이내여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getDatasetName()) || dto.getDatasetName().trim().length() > MAX_DATASET_NAME) {
            throw new IllegalArgumentException("데이터셋명은 1~100자 이내여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getDatasetTy()) || dto.getDatasetTy().trim().length() > MAX_DATASET_TY) {
            throw new IllegalArgumentException("데이터 유형이 올바르지 않습니다.");
        }
        if (StringUtils.hasText(dto.getDatasetId()) && dto.getDatasetId().trim().length() > MAX_DATASET_ID) {
            throw new IllegalArgumentException("데이터셋 ID 길이가 제한을 초과했습니다.");
        }
        if (StringUtils.hasText(dto.getUseFl()) && dto.getUseFl().trim().length() > MAX_USE_FL) {
            throw new IllegalArgumentException("사용여부 값이 올바르지 않습니다.");
        }
    }
}
