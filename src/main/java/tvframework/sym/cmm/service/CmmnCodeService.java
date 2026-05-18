package tvframework.sym.cmm.service;

import java.util.List;

import tvframework.sym.cmm.dto.CodeDetailDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmm.dto.CodeTreeDTO;
import tvframework.sym.cmm.dto.CmmnCodeRequestDTO;
import tvframework.sym.cmm.dto.CmmnCodeResponseDTO;

/**
 * 공통코드 관리 서비스 인터페이스
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnCodeService {

    /** 언어 목록은 CmmnMessageService.selectLanguages(CmmnMessage_SQL_mysql.xml) 단일 소스 사용 */

    /**
     * 코드 트리 조회
     * 
     * @param langGb 언어구분
     * @return 코드 트리 목록
     * @throws Exception
     */
    List<CodeTreeDTO> selectCodeTree(String langGb, String cmpnyCd) throws Exception;

    /**
     * 코드 상세 조회
     * 
     * @param codeId 코드 ID
     * @param langGb 언어구분
     * @param cmpnyCd 회사코드
     * @return 코드 상세 정보
     * @throws Exception
     */
    CmmnCodeResponseDTO selectCodeDetail(String codeId, String langGb, String cmpnyCd) throws Exception;

    /**
     * 코드 리스트 조회
     * 
     * @param codeId 코드 ID
     * @param langGb 언어구분
     * @param cmpnyCd 회사코드
     * @return 코드 리스트
     * @throws Exception
     */
    List<CodeDetailDTO> selectCodeDetailList(String codeId, String langGb, String cmpnyCd) throws Exception;

    /**
     * 상위 코드 정보 조회
     * 
     * @param codeId 코드 ID
     * @param langGb 언어구분
     * @param cmpnyCd 회사코드
     * @return 상위 코드 정보
     * @throws Exception
     */
    CmmnCodeResponseDTO selectParentCode(String codeId, String langGb, String cmpnyCd) throws Exception;

    /**
     * 코드 등록
     * 
     * @param requestDTO 코드 정보
     * @throws Exception
     */
    void insertCode(CmmnCodeRequestDTO requestDTO) throws Exception;

    /**
     * 코드 수정
     * 
     * @param codeId 코드 ID
     * @param requestDTO 코드 정보
     * @throws Exception
     */
    void updateCode(String codeId, CmmnCodeRequestDTO requestDTO) throws Exception;

    /**
     * 코드 삭제
     * 
     * @param codeId 코드 ID
     * @param cmpnyCd 회사코드
     * @throws Exception
     */
    void deleteCode(String codeId, String cmpnyCd) throws Exception;

    /**
     * 하위 코드 존재 여부 확인
     * 
     * @param codeId 코드 ID
     * @param cmpnyCd 회사코드
     * @return "O" 또는 "X"
     * @throws Exception
     */
    String checkChildren(String codeId, String cmpnyCd) throws Exception;
}

