package tvframework.sym.usr.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;
import tvframework.sym.usr.dto.CmmnDeptManageDTO;
import tvframework.sym.usr.dto.CmmnUserCompanyInfoDTO;
import tvframework.sym.usr.dto.CmmnUserDTO;
import tvframework.sym.usr.dto.CmmnUserManageListDTO;
import tvframework.sym.usr.dto.CodeOptionItemDTO;

/**
 * 사용자관리(CM_USER, CM_DEPT, CM_USER_ORGNZT_MBRSH) Mapper
 */
@Repository
public class CmmnUserManageMapper extends AbstractMapper {

    private static final String NS = "tvframework.sym.usr.service.impl.CmmnUserManageMapper";

    public List<CmmnUserManageListDTO> selectCompanyUserList(Map<String, Object> params) {
        return selectList(NS + ".selectCompanyUserList", params);
    }

    public CmmnUserDTO selectUserByUserId(Map<String, Object> params) {
        return selectOne(NS + ".selectUserByUserId", params);
    }

    public List<CmmnUserCompanyInfoDTO> selectUserCompanyInfoList(Map<String, Object> params) {
        return selectList(NS + ".selectUserCompanyInfoList", params);
    }

    public List<String> selectUserCompanyCodes(Map<String, Object> params) {
        return selectList(NS + ".selectUserCompanyCodes", params);
    }

    public List<CmmnUserCompanyInfoDTO> selectUserCompanyInfoAllByUserId(Map<String, Object> params) {
        return selectList(NS + ".selectUserCompanyInfoAllByUserId", params);
    }

    public int countMbrshByUserAndSq(Map<String, Object> params) {
        Integer n = selectOne(NS + ".countMbrshByUserAndSq", params);
        return n != null ? n : 0;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> selectUserOrgnztMbrshByMbrshSq(Map<String, Object> params) {
        return (Map<String, Object>) selectOne(NS + ".selectUserOrgnztMbrshByMbrshSq", params);
    }

    public int updateUserOrgnztMbrshPartial(Map<String, Object> params) {
        return update(NS + ".updateUserOrgnztMbrshPartial", params);
    }

    public List<CodeOptionItemDTO> selectCodeOptionByCodeId(Map<String, Object> params) {
        return selectList(NS + ".selectCodeOptionByCodeId", params);
    }

    public int updateUser(Map<String, Object> params) {
        return update(NS + ".updateUser", params);
    }

    public int updateUserSbscrSttus(Map<String, Object> params) {
        return update(NS + ".updateUserSbscrSttus", params);
    }

    public int updateUserPassword(Map<String, Object> params) {
        return update(NS + ".updateUserPassword", params);
    }

    public Long selectMbrshSqByUserAndCompany(Map<String, Object> params) {
        return selectOne(NS + ".selectMbrshSqByUserAndCompany", params);
    }

    public int insertUserOrgnztMbrsh(Map<String, Object> params) {
        return insert(NS + ".insertUserOrgnztMbrsh", params);
    }

    public int updateUserOrgnztMbrsh(Map<String, Object> params) {
        return update(NS + ".updateUserOrgnztMbrsh", params);
    }

    public int insertUser(Map<String, Object> params) {
        return insert(NS + ".insertUser", params);
    }

    public int deleteGroupUserByMbrshSq(Map<String, Object> params) {
        return delete(NS + ".deleteGroupUserByMbrshSq", params);
    }

    public int deleteUserOrgnztMbrshByMbrshSq(Map<String, Object> params) {
        return delete(NS + ".deleteUserOrgnztMbrshByMbrshSq", params);
    }

    public int deleteUser(Map<String, Object> params) {
        return delete(NS + ".deleteUser", params);
    }

    public CmmnDeptManageDTO selectDeptDetail(Map<String, Object> params) {
        return selectOne(NS + ".selectDeptDetail", params);
    }

    public int insertDept(Map<String, Object> params) {
        return insert(NS + ".insertDept", params);
    }

    public int countDeptByCode(Map<String, Object> params) {
        Integer n = selectOne(NS + ".countDeptByCode", params);
        return n != null ? n : 0;
    }

    public int updateDept(Map<String, Object> params) {
        return update(NS + ".updateDept", params);
    }

    public int countDeptChildren(Map<String, Object> params) {
        Integer n = selectOne(NS + ".countDeptChildren", params);
        return n != null ? n : 0;
    }

    public int countDeptUsers(Map<String, Object> params) {
        Integer n = selectOne(NS + ".countDeptUsers", params);
        return n != null ? n : 0;
    }

    public int deactivateDept(Map<String, Object> params) {
        return update(NS + ".deactivateDept", params);
    }

    public List<CmmnGroupUserDTO> selectDeptUserList(Map<String, Object> params) {
        return selectList(NS + ".selectDeptUserList", params);
    }

    public int updateUserOrgnztMbrshDeptCdByKey(Map<String, Object> params) {
        return update(NS + ".updateUserOrgnztMbrshDeptCdByKey", params);
    }

    public int updateUserOrgnztMbrshDeptNull(Map<String, Object> params) {
        return update(NS + ".updateUserOrgnztMbrshDeptNull", params);
    }

    public List<CmmnGroupUserDTO> selectUserSearchList(Map<String, Object> params) {
        return selectList(NS + ".selectUserSearchList", params);
    }

    public String checkDuplicateUserId(Map<String, Object> params) {
        return selectOne(NS + ".checkDuplicateUserId", params);
    }

    public int updateUserPasswordMatchOld(Map<String, Object> params) {
        return update(NS + ".updateUserPasswordMatchOld", params);
    }
}
