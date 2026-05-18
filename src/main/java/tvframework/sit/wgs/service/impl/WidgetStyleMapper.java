package tvframework.sit.wgs.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sit.wgs.dto.WidgetStyleDTO;

/**
 * 위젯 스타일 MyBatis Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Repository("widgetStyleMapper")
public class WidgetStyleMapper extends AbstractMapper {

    @SuppressWarnings("unchecked")
    public List<WidgetStyleDTO> selectWidgetStyleList(Map<String, Object> params) {
        return selectList("WidgetStyleMapper.selectWidgetStyleList", params);
    }

    public WidgetStyleDTO selectWidgetStyleDetail(Map<String, Object> params) {
        return selectOne("WidgetStyleMapper.selectWidgetStyleDetail", params);
    }

    public String selectDeletePossibleFlag(Map<String, Object> params) {
        return selectOne("WidgetStyleMapper.selectDeletePossibleFlag", params);
    }

    public String selectNextStyleId(Map<String, Object> params) {
        return selectOne("WidgetStyleMapper.selectNextStyleId", params);
    }

    public WidgetStyleDTO selectBaseTemplateByStyleTy(Map<String, Object> params) {
        return selectOne("WidgetStyleMapper.selectBaseTemplateByStyleTy", params);
    }

    /** 스타일 유형 VALUE(DETAIL_CODE_VALUE) → JSON 샘플 키용 ID(DETAIL_CODE_ID) */
    public String selectStyleTyDetailCodeId(Map<String, Object> params) {
        return selectOne("WidgetStyleMapper.selectStyleTyDetailCodeId", params);
    }

    public void insertWidgetStyle(Map<String, Object> params) {
        insert("WidgetStyleMapper.insertWidgetStyle", params);
    }

    public void updateWidgetStyle(Map<String, Object> params) {
        update("WidgetStyleMapper.updateWidgetStyle", params);
    }

    public void deleteWidgetStyle(Map<String, Object> params) {
        delete("WidgetStyleMapper.deleteWidgetStyle", params);
    }
}
