package tvframework.sym.cmm.service;

import java.util.List;

import tvframework.sym.cmm.dto.CmmnAuthorDTO;
import tvframework.sym.cmm.dto.CmmnAuthorHierarchyEdgeDTO;
import tvframework.sym.cmm.dto.CmmnAuthorListResponseDTO;
import tvframework.sym.cmm.dto.CmmnAuthorMenuDTO;
import tvframework.sym.cmm.dto.CmmnAuthorRequestDTO;
import tvframework.sym.cmm.dto.CmmnAuthorUserDTO;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnGroupOptionDTO;
import tvframework.sym.cmm.dto.CmmnUserSearchDTO;


/**
 * 권한 관리 서비스 인터페이스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnAuthorService {

    /**
     * 회사 목록 조회 (회사명 드롭다운, ADMIN 그룹 사용자 소속 회사)
     * @param loginUserId 로그인 사용자 ID
     */
    List<CmmnCompanyOptionDTO> selectCompanyList(String loginUserId) throws Exception;

    /**
     * 그룹 목록 조회 (그룹ID·그룹명 검색)
     */
    List<CmmnGroupOptionDTO> selectGroupList(String companyCode, String searchKeyword, String languageCode) throws Exception;

    /**
     * 그룹 사용자 목록 조회
     */
    List<CmmnUserSearchDTO> selectGroupUserList(String companyCode, String groupId, String languageCode) throws Exception;

    /**
     * 사용자 검색 (사용자ID·사용자명)
     */
    List<CmmnUserSearchDTO> selectUserSearchList(String companyCode, String searchKeyword, String languageCode) throws Exception;

    /**
     * 부서 사용자 목록 조회
     */
    List<CmmnUserSearchDTO> selectDeptUserList(String companyCode, String deptCode, String languageCode) throws Exception;

    /**
     * 권한 목록 조회 (페이징)
     */
    CmmnAuthorListResponseDTO selectAuthorList(String cmpnyCd, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage) throws Exception;

    /**
     * 권한 상세 조회
     */
    CmmnAuthorDTO selectAuthorDetail(String cmpnyCd, String authorCd) throws Exception;

    /**
     * 권한 사용자 목록 조회
     */
    List<CmmnAuthorUserDTO> selectAuthorUserList(String cmpnyCd, String authorCd, String languageCode) throws Exception;

    /**
     * 권한 메뉴 목록 조회
     */
    List<CmmnAuthorMenuDTO> selectAuthorMenuList(String cmpnyCd, String authorCd) throws Exception;

    /**
     * 권한 등록 (사용자/메뉴 포함)
     */
    void insertAuthor(CmmnAuthorRequestDTO requestDTO) throws Exception;

    /**
     * 권한 수정 (사용자/메뉴 포함)
     */
    void updateAuthor(CmmnAuthorRequestDTO requestDTO) throws Exception;

    /**
     * 권한 삭제 (단건, AUTH_ADMIN 불가)
     */
    void deleteAuthor(String cmpnyCd, String authorCd) throws Exception;

    /**
     * 권한 일괄 삭제 (목록에서 선택, AUTH_ADMIN 제외)
     */
    void deleteAuthorList(List<CmmnAuthorDTO> list) throws Exception;

    /** 권한 구조(상위-하위) 목록 */
    List<CmmnAuthorHierarchyEdgeDTO> selectAuthorHierarchyList(String cmpnyCd) throws Exception;

    /** 권한 구조 관계 저장 */
    void insertAuthorHierarchy(String cmpnyCd, String upperAuthorCd, String lowerAuthorCd) throws Exception;

    /** 권한 구조 관계 삭제 */
    void deleteAuthorHierarchy(String cmpnyCd, String upperAuthorCd, String lowerAuthorCd) throws Exception;

    /** 하위로 한 번도 매핑되지 않은 권한(권한구조 등록용) */
    List<CmmnAuthorDTO> selectUnmappedLowerAuthors(String cmpnyCd) throws Exception;

    /** 롤 탭 등: 페이징 없이 권한 목록 */
    List<CmmnAuthorDTO> selectAuthorListAll(String cmpnyCd, String searchKeyword) throws Exception;
}
