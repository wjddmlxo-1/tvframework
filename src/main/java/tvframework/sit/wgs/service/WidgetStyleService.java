package tvframework.sit.wgs.service;

import java.util.List;

import tvframework.sit.wgs.dto.WidgetStyleDTO;
import tvframework.sit.wgs.dto.WidgetStylePreviewSampleDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 위젯 스타일 서비스
 *
 * @author 공통 서비스 개발팀
 * @since 2026.04.03
 */
public interface WidgetStyleService {

    /**
     * 스타일 유형 공통코드 (CMMNCODE.581)
     */
    List<CodeOptionDTO> selectStyleTypeOptions(String languageCode) throws Exception;

    List<WidgetStyleDTO> selectWidgetStyleList(String styleTy, String styleName, String cmpnyCd) throws Exception;

    WidgetStyleDTO selectWidgetStyleDetail(String styleId, String cmpnyCd) throws Exception;

    String selectNextStyleId(String cmpnyCd) throws Exception;

    /**
     * 신규 등록 시 동일 유형의 기존 템플릿 1건 조회 (기본 스타일)
     */
    WidgetStyleDTO selectBaseTemplateByStyleTy(String styleTy, String cmpnyCd) throws Exception;

    /**
     * 스타일 유형별 미리보기 샘플 (JSON 설정, 키=DETAIL_CODE_ID)
     */
    WidgetStylePreviewSampleDTO selectPreviewSample(String styleTy) throws Exception;

    void insertWidgetStyle(WidgetStyleDTO dto, String userId) throws Exception;

    void updateWidgetStyle(WidgetStyleDTO dto, String userId) throws Exception;

    void deleteWidgetStyle(String styleId, String cmpnyCd) throws Exception;
}
