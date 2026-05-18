package tvframework.sit.wds.service;

import java.util.List;

import tvframework.sit.wds.dto.WidgetDataSetDTO;
import tvframework.sit.wds.dto.WidgetDataSetPreviewRequestDTO;
import tvframework.sit.wds.dto.WidgetDataSetPreviewResponseDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 위젯 데이터셋 서비스
 */
public interface WidgetDataSetService {

    List<CodeOptionDTO> selectDataTypeOptions(String languageCode) throws Exception;

    List<WidgetDataSetDTO> selectWidgetDataSetList(String dataType, String datasetName, String cmpnyCd) throws Exception;

    WidgetDataSetDTO selectWidgetDataSetDetail(String datasetId, String cmpnyCd) throws Exception;

    String selectNextDatasetId(String cmpnyCd) throws Exception;

    void insertWidgetDataSet(WidgetDataSetDTO dto, String userId) throws Exception;

    void updateWidgetDataSet(WidgetDataSetDTO dto, String userId) throws Exception;

    void deleteWidgetDataSet(String datasetId, String cmpnyCd) throws Exception;

    WidgetDataSetPreviewResponseDTO preview(WidgetDataSetPreviewRequestDTO request) throws Exception;
}
