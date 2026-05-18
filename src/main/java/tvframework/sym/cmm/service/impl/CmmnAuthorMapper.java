package tvframework.sym.cmm.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.cmm.dto.CmmnAuthorDTO;
import tvframework.sym.cmm.dto.CmmnAuthorHierarchyEdgeDTO;
import tvframework.sym.cmm.dto.CmmnAuthorMenuDTO;
import tvframework.sym.cmm.dto.CmmnAuthorUserDTO;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnGroupOptionDTO;
import tvframework.sym.cmm.dto.CmmnUserSearchDTO;

/**
 * 권한 관리 Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnAuthorMapper")
public class CmmnAuthorMapper extends AbstractMapper {

    public List<CmmnCompanyOptionDTO> selectCompanyList(Map<String, Object> params) {
        return selectList("CmmnMessageMapper.selectCompanyList", params);
    }

    public List<CmmnGroupOptionDTO> selectGroupList(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectGroupList", params);
    }

    public List<CmmnUserSearchDTO> selectGroupUserList(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectGroupUserList", params);
    }

    public List<CmmnUserSearchDTO> selectUserSearchList(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectUserSearchList", params);
    }

    public List<CmmnUserSearchDTO> selectDeptUserList(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectDeptUserList", params);
    }

    public List<CmmnAuthorDTO> selectAuthorList(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectAuthorList", params);
    }

    public int selectAuthorListTotCnt(Map<String, Object> params) {
        Integer cnt = selectOne("CmmnAuthorMapper.selectAuthorListTotCnt", params);
        return cnt != null ? cnt : 0;
    }

    public CmmnAuthorDTO selectAuthorDetail(Map<String, String> params) {
        return selectOne("CmmnAuthorMapper.selectAuthorDetail", params);
    }

    public List<CmmnAuthorUserDTO> selectAuthorUserList(Map<String, String> params) {
        return selectList("CmmnAuthorMapper.selectAuthorUserList", params);
    }

    public List<CmmnAuthorMenuDTO> selectAuthorMenuList(Map<String, String> params) {
        return selectList("CmmnAuthorMapper.selectAuthorMenuList", params);
    }

    public void insertAuthor(Map<String, Object> params) {
        insert("CmmnAuthorMapper.insertAuthor", params);
    }

    public void updateAuthor(Map<String, Object> params) {
        update("CmmnAuthorMapper.updateAuthor", params);
    }

    public void deleteAuthorUser(Map<String, String> params) {
        delete("CmmnAuthorMapper.deleteAuthorUser", params);
    }

    public void insertAuthorUser(Map<String, Object> params) {
        insert("CmmnAuthorMapper.insertAuthorUser", params);
    }

    public void deleteAuthorMenu(Map<String, String> params) {
        delete("CmmnAuthorMapper.deleteAuthorMenu", params);
    }

    public void insertAuthorMenu(Map<String, Object> params) {
        insert("CmmnAuthorMapper.insertAuthorMenu", params);
    }

    public List<String> selectMenuIdsWithAncestors(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectMenuIdsWithAncestors", params);
    }

    public void deleteAuthor(Map<String, String> params) {
        delete("CmmnAuthorMapper.deleteAuthor", params);
    }

    public List<CmmnAuthorHierarchyEdgeDTO> selectAuthorHierarchyList(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectAuthorHierarchyList", params);
    }

    public void insertAuthorHierarchy(Map<String, Object> params) {
        insert("CmmnAuthorMapper.insertAuthorHierarchy", params);
    }

    public void deleteAuthorHierarchy(Map<String, Object> params) {
        delete("CmmnAuthorMapper.deleteAuthorHierarchy", params);
    }

    public List<CmmnAuthorDTO> selectUnmappedLowerAuthors(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectUnmappedLowerAuthors", params);
    }

    public List<CmmnAuthorDTO> selectAuthorListAll(Map<String, Object> params) {
        return selectList("CmmnAuthorMapper.selectAuthorListAll", params);
    }
}
