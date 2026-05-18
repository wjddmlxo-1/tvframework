package tvframework.sit.wds.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sit.wds.dto.WidgetDataSetDTO;

/**
 * 위젯 데이터셋 Mapper
 */
@Repository("widgetDataSetMapper")
public class WidgetDataSetMapper extends AbstractMapper {

    @SuppressWarnings("unchecked")
    public List<WidgetDataSetDTO> selectWidgetDataSetList(Map<String, Object> params) {
        return selectList("WidgetDataSetMapper.selectWidgetDataSetList", params);
    }

    public WidgetDataSetDTO selectWidgetDataSetDetail(Map<String, Object> params) {
        return selectOne("WidgetDataSetMapper.selectWidgetDataSetDetail", params);
    }

    public String selectUnusePossibleFlag(Map<String, Object> params) {
        return selectOne("WidgetDataSetMapper.selectUnusePossibleFlag", params);
    }

    public String selectDeletePossibleFlag(Map<String, Object> params) {
        return selectOne("WidgetDataSetMapper.selectDeletePossibleFlag", params);
    }

    public String selectNextDatasetId() {
        return selectOne("WidgetDataSetMapper.selectNextDatasetId");
    }

    @SuppressWarnings("unchecked")
    public String selectNextDatasetId(Map<String, Object> params) {
        return selectOne("WidgetDataSetMapper.selectNextDatasetId", params);
    }

    public void insertWidgetDataSet(Map<String, Object> params) {
        insert("WidgetDataSetMapper.insertWidgetDataSet", params);
    }

    public void updateWidgetDataSet(Map<String, Object> params) {
        update("WidgetDataSetMapper.updateWidgetDataSet", params);
    }

    public void deleteWidgetDataSet(Map<String, Object> params) {
        delete("WidgetDataSetMapper.deleteWidgetDataSet", params);
    }
}
