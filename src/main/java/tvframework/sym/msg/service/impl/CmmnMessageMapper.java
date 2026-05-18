package tvframework.sym.msg.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.msg.dto.CmmnMessageDTO;
import tvframework.sym.msg.dto.CmmnMessageDetailResponseDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.msg.dto.MessageDetailDTO;
import tvframework.sym.msg.dto.CmmnMessageTextRowDTO;

/**
 * 다국어 메시지 관리를 위한 데이터 접근 클래스
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnMessageMapper")
public class CmmnMessageMapper extends AbstractMapper {

    /**
     * 메시지 리스트 조회 (⑦)
     * 
     * @param params 조회 조건
     * @return 메시지 리스트
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectMessageList(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectMessageList", params);
    }

    /**
     * 메시지 리스트 개수 조회
     * 
     * @param params 조회 조건
     * @return 메시지 개수
     */
    public Integer selectMessageListCount(Map<String, Object> params) {
        return selectOne("CmmnMessageMapper.selectMessageListCount", params);
    }

    /**
     * 메시지 상세 조회
     * 
     * @param params langKey, langGb
     * @return 메시지 상세 정보
     */
    public CmmnMessageDetailResponseDTO selectMessageDetail(Map<String, String> params) {
        return selectOne("CmmnMessageMapper.selectMessageDetail", params);
    }

    /**
     * 메시지 등록
     * 
     * @param params langGb, langKey, langCode, messageCn
     */
    public void insertMessage(Map<String, String> params) {
        insert("CmmnMessageMapper.insertMessage", params);
    }

    /**
     * 메시지 삭제 (langKey 기준)
     * 
     * @param params langGb, langKey
     */
    public void deleteMessageByLangKey(Map<String, String> params) {
        delete("CmmnMessageMapper.deleteMessageByLangKey", params);
    }

    /**
     * 메시지 상세 조회 - 메시지 목록
     * 
     * @param params langKey, langGb
     * @return 메시지 목록
     */
    @SuppressWarnings("unchecked")
    public List<MessageDetailDTO> selectMessageDetailMessages(Map<String, String> params) {
        return selectList("CmmnMessageMapper.selectMessageDetailMessages", params);
    }

    /**
     * UI 번역 일괄 조회 (LANG_KEY 목록 + LANG_CODE)
     */
    @SuppressWarnings("unchecked")
    public List<CmmnMessageTextRowDTO> selectMessageTextsByKeys(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectMessageTextsByKeys", params);
    }

    /**
     * 언어 목록 조회 (회사코드 반영)
     * @param params companyCode, languageCode
     * @return 언어 목록
     */
    @SuppressWarnings("unchecked")
    public List<CodeOptionDTO> selectLanguages(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectLanguages", params);
    }

    /**
     * 구분 목록 조회 (회사코드 반영)
     * @param params companyCode, languageCode
     * @return 구분 목록
     */
    @SuppressWarnings("unchecked")
    public List<CodeOptionDTO> selectCategories(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectCategories", params);
    }

    /**
     * 회사 목록 조회 (로그인 사용자 ADMIN 그룹 기준)
     *
     * @param params loginUserId
     * @return 회사 목록 (cmpnyCd, cmpnyNm)
     */
    @SuppressWarnings("unchecked")
    public List<CmmnCompanyOptionDTO> selectCompanyList(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectCompanyList", params);
    }

    /**
     * Map 리스트를 DTO 리스트로 변환
     * 
     * @param list Map 리스트
     * @return DTO 리스트
     */
    @SuppressWarnings("unchecked")
    public List<CmmnMessageDTO> convertToDTOList(List<Map<String, Object>> list) {
        List<CmmnMessageDTO> result = new java.util.ArrayList<>();
        for (Map<String, Object> map : list) {
            CmmnMessageDTO dto = new CmmnMessageDTO();
            dto.setLangGb((String) map.get("LANG_GB"));
            dto.setLangKey((String) map.get("LANG_KEY"));
            dto.setMessageCns((String) map.get("MESSAGE_CNS"));
            result.add(dto);
        }
        return result;
    }
}

