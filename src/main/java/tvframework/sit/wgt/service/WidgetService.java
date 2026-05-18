package tvframework.sit.wgt.service;

import java.util.List;

import tvframework.sit.wgt.dto.WidgetDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 위젯 관리 서비스
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
public interface WidgetService {

    List<CodeOptionDTO> selectCategoryOptions(String languageCode) throws Exception;

    List<WidgetDTO> selectWidgetList(String categoryCd, String widgetName, String cmpnyCd) throws Exception;

    WidgetDTO selectWidgetDetail(String widgetId, String cmpnyCd) throws Exception;

    String selectNextWidgetId(String cmpnyCd) throws Exception;

    void insertWidget(WidgetDTO dto, String userId) throws Exception;

    void updateWidget(WidgetDTO dto, String userId) throws Exception;

    void deleteWidget(String widgetId, String cmpnyCd) throws Exception;
}
