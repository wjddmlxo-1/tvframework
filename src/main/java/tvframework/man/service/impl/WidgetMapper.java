package tvframework.man.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.man.dto.WidgetDTO;

/**
 * 메인 홈 대시보드 MyBatis Mapper (CM_DASHBRD, 메인 위젯 갤러리).
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.10
 */
@Repository("manMainWidgetMapper")
public class WidgetMapper extends AbstractMapper {

    private static final String NS = "tvframework.man.service.impl.WidgetMapper.";

    public BigDecimal selectMbrshSq(Map<String, Object> params) {
        return selectOne(NS + "selectMbrshSq", params);
    }

    public WidgetDTO selectUserDashboard(Map<String, Object> params) {
        return selectOne(NS + "selectUserDashboard", params);
    }

    public WidgetDTO selectDefaultDashboard(Map<String, Object> params) {
        return selectOne(NS + "selectDefaultDashboard", params);
    }

    public int insertDashboard(Map<String, Object> params) {
        return insert(NS + "insertDashboard", params);
    }

    public int updateDashboard(Map<String, Object> params) {
        return update(NS + "updateDashboard", params);
    }

    @SuppressWarnings("unchecked")
    public List<tvframework.sit.wgt.dto.WidgetDTO> selectMainWidgetGallery(Map<String, Object> params) {
        return selectList(NS + "selectMainWidgetGallery", params);
    }
}
