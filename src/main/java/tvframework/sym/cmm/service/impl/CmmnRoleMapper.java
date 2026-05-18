package tvframework.sym.cmm.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.cmm.dto.CmmnRoleDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;

@Repository("cmmnRoleMapper")
public class CmmnRoleMapper extends AbstractMapper {

    public List<CodeOptionDTO> selectRoleTypeOptions(Map<String, Object> params) {
        return selectList("CmmnRoleMapper.selectRoleTypeOptions", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnRoleDTO> selectRoleList(Map<String, Object> params) {
        return selectList("CmmnRoleMapper.selectRoleList", params);
    }

    public int selectRoleListTotCnt(Map<String, Object> params) {
        Integer cnt = selectOne("CmmnRoleMapper.selectRoleListTotCnt", params);
        return cnt != null ? cnt : 0;
    }

    public CmmnRoleDTO selectRoleDetail(Map<String, String> params) {
        return selectOne("CmmnRoleMapper.selectRoleDetail", params);
    }

    public void insertRole(Map<String, Object> params) {
        insert("CmmnRoleMapper.insertRole", params);
    }

    public void updateRole(Map<String, Object> params) {
        update("CmmnRoleMapper.updateRole", params);
    }

    public void deleteRole(Map<String, String> params) {
        delete("CmmnRoleMapper.deleteRole", params);
    }

    public void deleteAuthorRoleByRole(Map<String, String> params) {
        delete("CmmnRoleMapper.deleteAuthorRoleByRole", params);
    }

    public void deleteAuthorRoleByAuthor(Map<String, String> params) {
        delete("CmmnRoleMapper.deleteAuthorRoleByAuthor", params);
    }

    public void insertAuthorRole(Map<String, Object> params) {
        insert("CmmnRoleMapper.insertAuthorRole", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnRoleDTO> selectRolesWithMappingForAuthor(Map<String, Object> params) {
        return selectList("CmmnRoleMapper.selectRolesWithMappingForAuthor", params);
    }
}
