package tvframework.sym.cmp.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.dto.CmmnCompanyDTO;

/**
 * 회사정보 Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnCompanyMapper")
public class CmmnCompanyMapper extends AbstractMapper {

    @SuppressWarnings("unchecked")
    public List<CmmnCompanyDTO> selectCompanyList(Map<String, Object> params) {
        return selectList("CmmnCompanyMapper.selectCompanyList", params);
    }

    public int selectCompanyListTotCnt(Map<String, Object> params) {
        Integer cnt = selectOne("CmmnCompanyMapper.selectCompanyListTotCnt", params);
        return cnt != null ? cnt : 0;
    }

    public CmmnCompanyDTO selectCompanyDetail(Map<String, Object> params) {
        return selectOne("CmmnCompanyMapper.selectCompanyDetail", params);
    }

    public void insertCompany(Map<String, Object> params) {
        insert("CmmnCompanyMapper.insertCompany", params);
    }

    public void updateCompany(Map<String, Object> params) {
        update("CmmnCompanyMapper.updateCompany", params);
    }

    public void deleteCompany(Map<String, Object> params) {
        update("CmmnCompanyMapper.deleteCompany", params);
    }

    public String checkDuplicateCmpnyCd(Map<String, Object> params) {
        return selectOne("CmmnCompanyMapper.checkDuplicateCmpnyCd", params);
    }

    public Map<String, String> selectJoinStplat(Map<String, Object> params) {
        return selectOne("CmmnCompanyMapper.selectJoinStplat", params);
    }

    @SuppressWarnings("unchecked")
    public List<CodeOptionDTO> selectCodeOptionByCodeId(Map<String, Object> params) {
        return selectList("CmmnCompanyMapper.selectCodeOptionByCodeId", params);
    }
}
