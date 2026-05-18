package tvframework.sit.wgt.service.impl;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import tvframework.com.cmm.idgnr.IdGnrService;
import tvframework.sit.wgt.dto.WidgetAuthorDTO;
import tvframework.sit.wgt.dto.WidgetDTO;
import tvframework.sit.wgt.service.WidgetService;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.service.CmmnCompanyService;

/**
 * 위젯 관리 서비스 구현
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Service
public class WidgetServiceImpl implements WidgetService {

    private static final int MAX_WIDGET_ID = 50;
    private static final int MAX_CMPNY_CD = 20;
    private static final int MAX_WIDGET_NAME = 100;
    private static final int MAX_DATASET_ID = 50;
    private static final int MAX_STYLE_ID = 50;
    private static final int MAX_CATEGORY_CD = 50;
    private static final int MAX_USE_FL = 1;
    private static final int MAX_USER_ID = 20;
    private static final int MAX_AUTHOR_CD = 20;

    /** 위젯 카테고리 (CM_CODE_DETAIL.CODE_ID) */
    private static final String CATEGORY_CODE_ID = "CMMNCODE.582";

    private final WidgetMapper widgetMapper;
    private final CmmnCompanyService cmmnCompanyService;
    private final IdGnrService widgetIdGnrService;

    public WidgetServiceImpl(
        WidgetMapper widgetMapper,
        CmmnCompanyService cmmnCompanyService,
        @Qualifier("widgetIdGnrService") IdGnrService widgetIdGnrService
    ) {
        this.widgetMapper = widgetMapper;
        this.cmmnCompanyService = cmmnCompanyService;
        this.widgetIdGnrService = widgetIdGnrService;
    }

    @Override
    public List<CodeOptionDTO> selectCategoryOptions(String languageCode) throws Exception {
        return cmmnCompanyService.selectCodeOption(CATEGORY_CODE_ID, languageCode);
    }

    @Override
    public List<WidgetDTO> selectWidgetList(String categoryCd, String widgetName, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("categoryCd", categoryCd);
        params.put("widgetName", widgetName);
        params.put("cmpnyCd", cmpnyCd.trim());
        return widgetMapper.selectWidgetList(params);
    }

    @Override
    public WidgetDTO selectWidgetDetail(String widgetId, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        if (!StringUtils.hasText(widgetId)) {
            throw new IllegalArgumentException("위젯 ID는 필수입니다.");
        }
        Map<String, Object> params = new HashMap<>();
        params.put("widgetId", widgetId.trim());
        params.put("cmpnyCd", cmpnyCd.trim());
        WidgetDTO dto = widgetMapper.selectWidgetDetail(params);
        if (dto != null) {
            List<WidgetAuthorDTO> authors = widgetMapper.selectWidgetAuthors(params);
            dto.setAuthors(authors);
        }
        return dto;
    }

    @Override
    public String selectNextWidgetId(String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        return widgetIdGnrService.getNextStringId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertWidget(WidgetDTO dto, String userId) throws Exception {
        validateWidgetForSave(dto, true);
        String uid = StringUtils.hasText(userId) ? userId.trim() : null;
        Map<String, Object> params = buildWidgetParams(dto, uid);
        widgetMapper.insertWidget(params);
        saveWidgetAuthors(dto.getWidgetId(), dto.getCmpnyCd(), dto.getAuthorCdList(), uid);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWidget(WidgetDTO dto, String userId) throws Exception {
        validateWidgetForSave(dto, false);
        Map<String, Object> curQ = new HashMap<>();
        curQ.put("widgetId", dto.getWidgetId().trim());
        curQ.put("cmpnyCd", dto.getCmpnyCd().trim());
        WidgetDTO cur = widgetMapper.selectWidgetDetail(curQ);
        if (cur == null) {
            throw new IllegalArgumentException("수정할 위젯을 찾을 수 없습니다.");
        }
        String oldSq = cur.getFileSq();
        String newSq = dto.getFileSq();
        if (StringUtils.hasText(oldSq)) {
            if (!StringUtils.hasText(newSq) || !oldSq.trim().equals(newSq.trim())) {
                Map<String, Object> fq = new HashMap<>();
                fq.put("fileSq", oldSq.trim());
                widgetMapper.deleteFileBySq(fq);
            }
        }

        String uid = StringUtils.hasText(userId) ? userId.trim() : null;
        Map<String, Object> params = buildWidgetParams(dto, uid);
        widgetMapper.updateWidget(params);
        Map<String, Object> del = new HashMap<>();
        del.put("widgetId", dto.getWidgetId().trim());
        del.put("cmpnyCd", dto.getCmpnyCd().trim());
        widgetMapper.deleteWidgetAuthors(del);
        saveWidgetAuthors(dto.getWidgetId(), dto.getCmpnyCd(), dto.getAuthorCdList(), uid);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWidget(String widgetId, String cmpnyCd) throws Exception {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        if (!StringUtils.hasText(widgetId)) {
            throw new IllegalArgumentException("위젯 ID는 필수입니다.");
        }
        String wid = widgetId.trim();
        String cc = cmpnyCd.trim();

        Map<String, Object> q = new HashMap<>();
        q.put("widgetId", wid);
        q.put("cmpnyCd", cc);
        WidgetDTO cur = widgetMapper.selectWidgetDetail(q);
        if (cur == null) {
            throw new IllegalArgumentException("삭제할 위젯을 찾을 수 없습니다.");
        }

        widgetMapper.deleteWidgetAuthors(q);
        if (StringUtils.hasText(cur.getFileSq())) {
            Map<String, Object> fq = new HashMap<>();
            fq.put("fileSq", cur.getFileSq().trim());
            widgetMapper.deleteFileBySq(fq);
        }
        widgetMapper.deleteWidget(q);
    }

    private void saveWidgetAuthors(String widgetId, String cmpnyCd, List<String> authorCdList, String userId) throws Exception {
        if (!StringUtils.hasText(widgetId) || !StringUtils.hasText(cmpnyCd)) {
            return;
        }
        if (CollectionUtils.isEmpty(authorCdList)) {
            return;
        }
        LinkedHashSet<String> seen = new LinkedHashSet<>();
        String uid = StringUtils.hasText(userId) ? userId : null;
        for (String ac : authorCdList) {
            if (!StringUtils.hasText(ac)) {
                continue;
            }
            String code = ac.trim();
            if (!seen.add(code)) {
                continue;
            }
            if (code.length() > MAX_AUTHOR_CD) {
                throw new IllegalArgumentException("권한코드 길이는 " + MAX_AUTHOR_CD + "자 이하여야 합니다.");
            }
            Map<String, Object> p = new HashMap<>();
            p.put("widgetId", widgetId.trim());
            p.put("cmpnyCd", cmpnyCd.trim());
            p.put("authorCd", code);
            p.put("creationId", uid);
            p.put("updateId", uid);
            widgetMapper.insertWidgetAuthor(p);
        }
    }

    private Map<String, Object> buildWidgetParams(WidgetDTO dto, String userId) {
        Map<String, Object> params = new HashMap<>();
        params.put("widgetId", dto.getWidgetId().trim());
        params.put("cmpnyCd", dto.getCmpnyCd().trim());
        params.put("widgetName", dto.getWidgetName().trim());
        params.put("datasetId", dto.getDatasetId().trim());
        params.put("styleId", dto.getStyleId().trim());
        params.put("categoryCd", dto.getCategoryCd().trim());
        params.put("mappingJson", normalizeJson(dto.getMappingJson()));
        params.put("configJson", normalizeJson(dto.getConfigJson()));
        params.put("fileSq", StringUtils.hasText(dto.getFileSq()) ? dto.getFileSq().trim() : null);
        params.put("useFl", StringUtils.hasText(dto.getUseFl()) ? dto.getUseFl().trim() : "Y");
        params.put("creationId", userId);
        params.put("updateId", userId);
        return params;
    }

    private String normalizeJson(String s) {
        if (!StringUtils.hasText(s)) {
            return "{}";
        }
        return s.trim();
    }

    private void validateWidgetForSave(WidgetDTO dto, boolean insert) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        if (!StringUtils.hasText(dto.getCmpnyCd()) || dto.getCmpnyCd().trim().length() > MAX_CMPNY_CD) {
            throw new IllegalArgumentException("회사코드는 필수이며 " + MAX_CMPNY_CD + "자 이하여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getWidgetId()) || dto.getWidgetId().trim().length() > MAX_WIDGET_ID) {
            throw new IllegalArgumentException("위젯 ID는 필수이며 " + MAX_WIDGET_ID + "자 이하여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getWidgetName()) || dto.getWidgetName().trim().length() > MAX_WIDGET_NAME) {
            throw new IllegalArgumentException("위젯명은 필수이며 " + MAX_WIDGET_NAME + "자 이하여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getDatasetId()) || dto.getDatasetId().trim().length() > MAX_DATASET_ID) {
            throw new IllegalArgumentException("데이터셋 ID는 필수이며 " + MAX_DATASET_ID + "자 이하여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getStyleId()) || dto.getStyleId().trim().length() > MAX_STYLE_ID) {
            throw new IllegalArgumentException("스타일 ID는 필수이며 " + MAX_STYLE_ID + "자 이하여야 합니다.");
        }
        if (!StringUtils.hasText(dto.getCategoryCd()) || dto.getCategoryCd().trim().length() > MAX_CATEGORY_CD) {
            throw new IllegalArgumentException("카테고리는 필수이며 " + MAX_CATEGORY_CD + "자 이하여야 합니다.");
        }
        if (StringUtils.hasText(dto.getUseFl()) && dto.getUseFl().trim().length() > MAX_USE_FL) {
            throw new IllegalArgumentException("사용여부 값이 올바르지 않습니다.");
        }
    }
}
