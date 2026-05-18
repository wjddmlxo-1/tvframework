package tvframework.sit.wgt.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sit.wgt.dto.CmFileBinaryDTO;
import tvframework.sit.wgt.dto.WidgetAuthorDTO;
import tvframework.sit.wgt.dto.WidgetDTO;

/**
 * 위젯 MyBatis Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
@Repository("widgetMapper")
public class WidgetMapper extends AbstractMapper {

    @SuppressWarnings("unchecked")
    public List<WidgetDTO> selectWidgetList(Map<String, Object> params) {
        return selectList("WidgetMapper.selectWidgetList", params);
    }

    public WidgetDTO selectWidgetDetail(Map<String, Object> params) {
        return selectOne("WidgetMapper.selectWidgetDetail", params);
    }

    @SuppressWarnings("unchecked")
    public List<WidgetAuthorDTO> selectWidgetAuthors(Map<String, Object> params) {
        return selectList("WidgetMapper.selectWidgetAuthors", params);
    }

    public void insertWidget(Map<String, Object> params) {
        insert("WidgetMapper.insertWidget", params);
    }

    public void updateWidget(Map<String, Object> params) {
        update("WidgetMapper.updateWidget", params);
    }

    public void deleteWidgetAuthors(Map<String, Object> params) {
        delete("WidgetMapper.deleteWidgetAuthors", params);
    }

    public void insertWidgetAuthor(Map<String, Object> params) {
        insert("WidgetMapper.insertWidgetAuthor", params);
    }

    public void deleteWidget(Map<String, Object> params) {
        delete("WidgetMapper.deleteWidget", params);
    }

    public void deleteFileBySq(Map<String, Object> params) {
        delete("WidgetMapper.deleteFileBySq", params);
    }

    public void insertCmFileWidgetData(Map<String, Object> params) {
        insert("WidgetMapper.insertCmFileWidgetData", params);
    }

    public CmFileBinaryDTO selectCmFileWidgetData(Map<String, Object> params) {
        return selectOne("WidgetMapper.selectCmFileWidgetData", params);
    }
}
