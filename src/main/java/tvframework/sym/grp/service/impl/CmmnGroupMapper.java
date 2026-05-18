package tvframework.sym.grp.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnDeptTreeDTO;
import tvframework.sym.grp.dto.CmmnGroupDTO;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;

/**
 * 그룹 관리 Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnGroupMapper")
public class CmmnGroupMapper extends AbstractMapper {

    @SuppressWarnings("unchecked")
    public List<CmmnCompanyOptionDTO> selectCompanyList(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectCompanyList", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnGroupDTO> selectGroupList(Map<String, Object> params) {
        return selectList("CmmnGroupMapper.selectGroupList", params);
    }

    public int selectGroupListTotCnt(Map<String, Object> params) {
        Integer cnt = selectOne("CmmnGroupMapper.selectGroupListTotCnt", params);
        return cnt != null ? cnt : 0;
    }

    public CmmnGroupDTO selectGroupDetail(Map<String, String> params) {
        return selectOne("CmmnGroupMapper.selectGroupDetail", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnGroupUserDTO> selectGroupUserList(Map<String, Object> params) {
        return selectList("CmmnGroupMapper.selectGroupUserList", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnGroupUserDTO> selectUserSearchList(Map<String, Object> params) {
        return selectList("CmmnGroupMapper.selectUserSearchList", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnDeptTreeDTO> selectDeptTree(Map<String, Object> params) {
        return selectList("CmmnGroupMapper.selectDeptTree", params);
    }

    @SuppressWarnings("unchecked")
    public List<CmmnGroupUserDTO> selectDeptUserList(Map<String, Object> params) {
        return selectList("CmmnGroupMapper.selectDeptUserList", params);
    }

    public void insertGroup(Map<String, Object> params) {
        insert("CmmnGroupMapper.insertGroup", params);
    }

    public void updateGroup(Map<String, Object> params) {
        update("CmmnGroupMapper.updateGroup", params);
    }

    public void deleteGroupUser(Map<String, String> params) {
        delete("CmmnGroupMapper.deleteGroupUser", params);
    }

    public void insertGroupUser(Map<String, Object> params) {
        insert("CmmnGroupMapper.insertGroupUser", params);
    }

    public void deleteGroup(Map<String, String> params) {
        delete("CmmnGroupMapper.deleteGroup", params);
    }
}
