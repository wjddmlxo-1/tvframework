package tvframework.sym.grp.service;

import java.util.List;

import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnDeptTreeDTO;
import tvframework.sym.grp.dto.CmmnGroupDTO;
import tvframework.sym.grp.dto.CmmnGroupListResponseDTO;
import tvframework.sym.grp.dto.CmmnGroupRequestDTO;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;

/**
 * 그룹 관리 서비스 인터페이스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnGroupService {

    /**
     * 회사 목록 조회 (ADMIN 그룹 사용자 소속 회사)
     */
    List<CmmnCompanyOptionDTO> selectCompanyList(String loginUserId) throws Exception;

    /**
     * 그룹 목록 조회 (페이징)
     */
    CmmnGroupListResponseDTO selectGroupList(String cmpnyCd, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage, String languageCode) throws Exception;

    /**
     * 그룹 상세 조회
     */
    CmmnGroupDTO selectGroupDetail(String cmpnyCd, String groupId) throws Exception;

    /**
     * 그룹 사용자 목록 조회
     */
    List<CmmnGroupUserDTO> selectGroupUserList(String cmpnyCd, String groupId, String languageCode) throws Exception;

    /**
     * 사용자 검색 (그룹 등록/수정용, MBRSH_SQ 포함)
     */
    List<CmmnGroupUserDTO> selectUserSearchList(String cmpnyCd, String searchKeyword, String languageCode) throws Exception;

    /**
     * 부서 트리 조회
     */
    List<CmmnDeptTreeDTO> selectDeptTree(String cmpnyCd, String languageCode) throws Exception;

    /**
     * 부서 사용자 목록 조회 (MBRSH_SQ 포함)
     */
    List<CmmnGroupUserDTO> selectDeptUserList(String cmpnyCd, String deptCd, String languageCode) throws Exception;

    /**
     * 그룹 등록 (그룹 사용자 포함)
     */
    void insertGroup(CmmnGroupRequestDTO requestDTO) throws Exception;

    /**
     * 그룹 수정 (그룹 사용자 포함)
     */
    void updateGroup(CmmnGroupRequestDTO requestDTO) throws Exception;

    /**
     * 그룹 삭제
     */
    void deleteGroup(String cmpnyCd, String groupId) throws Exception;

    /**
     * 그룹 일괄 삭제
     */
    void deleteGroupList(List<CmmnGroupDTO> list) throws Exception;
}
