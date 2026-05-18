package tvframework.sym.cmm.service;

import java.util.List;

import tvframework.sym.cmm.dto.CmmnAuthorRoleSaveDTO;
import tvframework.sym.cmm.dto.CmmnRoleDTO;
import tvframework.sym.cmm.dto.CmmnRoleListResponseDTO;
import tvframework.sym.cmm.dto.CmmnRoleRequestDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

public interface CmmnRoleService {

    List<CodeOptionDTO> selectRoleTypeOptions(String companyCode, String languageCode) throws Exception;

    CmmnRoleListResponseDTO selectRoleList(String cmpnyCd, String roleTy, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage) throws Exception;

    CmmnRoleDTO selectRoleDetail(String cmpnyCd, String roleCd) throws Exception;

    void insertRole(CmmnRoleRequestDTO dto) throws Exception;

    void updateRole(CmmnRoleRequestDTO dto) throws Exception;

    void deleteRole(String cmpnyCd, String roleCd) throws Exception;

    void deleteRoleList(List<CmmnRoleDTO> list) throws Exception;

    /** 권한에 매핑된 롤 목록(체크 상태 포함) */
    List<CmmnRoleDTO> selectRolesWithMappingForAuthor(String cmpnyCd, String authorCd, String roleTy,
            String searchKeyword) throws Exception;

    /** 권한-롤 저장(전체 삭제 후 재등록) */
    void saveAuthorRoles(CmmnAuthorRoleSaveDTO dto) throws Exception;
}
