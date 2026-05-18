package tvframework.man.service;

import java.util.List;

import tvframework.man.dto.WidgetDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 메인 홈 대시보드(CM_DASHBRD) 서비스.
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.10
 */
public interface WidgetService {

    /**
     * 사용자 저장분 우선, 없으면 회사 기본(MBRSH_SQ IS NULL) 대시보드.
     */
    WidgetDTO selectDashboard(String cmpnyCd, String userId) throws Exception;

    List<CodeOptionDTO> selectCategoryOptions(String langCode) throws Exception;

    List<tvframework.sit.wgt.dto.WidgetDTO> selectWidgetGallery(String cmpnyCd, String categoryCd, String searchKeyword) throws Exception;

    String selectNextDashbrdId() throws Exception;

    void saveUserDashboard(WidgetDTO dto, String userId, String loginId) throws Exception;

    void saveDefaultDashboard(WidgetDTO dto, String loginId) throws Exception;
}
