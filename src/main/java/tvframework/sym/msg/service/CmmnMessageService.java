package tvframework.sym.msg.service;

import java.util.List;
import java.util.Map;

import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.msg.dto.CmmnMessageDeleteRequestDTO;
import tvframework.sym.msg.dto.CmmnMessageDetailResponseDTO;
import tvframework.sym.msg.dto.CmmnMessageListResponseDTO;
import tvframework.sym.msg.dto.CmmnMessageRequestDTO;

/**
 * 다국어 메시지 관리 서비스 인터페이스
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnMessageService {

    /**
     * 메시지 리스트 조회 (⑦)
     * 
     * @param langGb 언어구분
     * @param category 구분
     * @param searchCondition 검색 조건
     * @param pageIndex 페이지 번호
     * @param recordCountPerPage 페이지당 항목 수
     * @return 메시지 리스트
     * @throws Exception
     */
    CmmnMessageListResponseDTO selectMessageList(
        String langGb, String cmpnyCd, String category, String searchCondition,
        Integer pageIndex, Integer recordCountPerPage) throws Exception;

    /**
     * 메시지 상세 조회
     * 
     * @param langKey 언어 Key
     * @param langGb 언어구분
     * @return 메시지 상세 정보
     * @throws Exception
     */
    CmmnMessageDetailResponseDTO selectMessageDetail(String langKey, String langGb, String cmpnyCd) throws Exception;

    /**
     * UI 번역 일괄 조회 (LANG_KEY 목록 + LANG_CODE). 화면 단위로 DB 왕복 1회에 사용.
     */
    Map<String, String> selectMessageTextsByKeys(List<String> langKeys, String langCode, String cmpnyCd) throws Exception;

    /**
     * 메시지 등록
     * 
     * @param requestDTO 메시지 정보
     * @throws Exception
     */
    void insertMessage(CmmnMessageRequestDTO requestDTO) throws Exception;

    /**
     * 메시지 수정
     * 
     * @param langKey 언어 Key
     * @param requestDTO 메시지 정보
     * @throws Exception
     */
    void updateMessage(String langKey, CmmnMessageRequestDTO requestDTO) throws Exception;

    /**
     * 메시지 삭제 (⑥)
     * 
     * @param requestDTO 삭제 요청 정보
     * @throws Exception
     */
    void deleteMessage(CmmnMessageDeleteRequestDTO requestDTO) throws Exception;

    /**
     * 언어 목록 조회 (회사코드 반영)
     * @param cmpnyCd 회사코드
     * @param langCode 언어 코드 (초기값: ko_KR)
     * @return 언어 목록
     * @throws Exception
     */
    List<CodeOptionDTO> selectLanguages(String cmpnyCd, String langCode) throws Exception;

    /**
     * 구분 목록 조회 (회사코드 반영)
     * @param cmpnyCd 회사코드
     * @param langCode 언어 코드 (초기값: ko_KR)
     * @return 구분 목록
     * @throws Exception
     */
    List<CodeOptionDTO> selectCategories(String cmpnyCd, String langCode) throws Exception;

    /**
     * 회사 목록 조회 (로그인 사용자 ADMIN 그룹 기준)
     *
     * @param loginUserId 로그인 사용자 ID
     * @return 회사 목록
     * @throws Exception
     */
    List<CmmnCompanyOptionDTO> selectCompanyList(String loginUserId) throws Exception;

}

