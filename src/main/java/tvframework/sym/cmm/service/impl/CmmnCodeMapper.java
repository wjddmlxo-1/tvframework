package tvframework.sym.cmm.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.cmm.dto.CodeDetailDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmm.dto.CmmnCodeResponseDTO;

/**
 * 공통코드 관리 Mapper
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnCodeMapper")
public class CmmnCodeMapper extends AbstractMapper {

    /**
     * 코드 트리 조회
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectCodeTree(Map<String, String> params) {
        return selectList("CmmnCodeMapper.selectCodeTree", params);
    }

    /**
     * 코드 상세 조회
     */
    public CmmnCodeResponseDTO selectCodeDetail(Map<String, String> params) {
        return selectOne("CmmnCodeMapper.selectCodeDetail", params);
    }

    /**
     * 코드 리스트 조회
     */
    @SuppressWarnings("unchecked")
    public List<CodeDetailDTO> selectCodeDetailList(Map<String, String> params) {
        return selectList("CmmnCodeMapper.selectCodeDetailList", params);
    }

    /**
     * 상위 코드 정보 조회
     */
    public CmmnCodeResponseDTO selectParentCode(Map<String, String> params) {
        return selectOne("CmmnCodeMapper.selectParentCode", params);
    }

    /**
     * 코드 등록
     */
    public void insertCode(Map<String, Object> params) {
        insert("CmmnCodeMapper.insertCode", params);
    }

    /**
     * 코드 수정
     */
    public void updateCode(Map<String, Object> params) {
        update("CmmnCodeMapper.updateCode", params);
    }

    /**
     * 코드 삭제
     */
    public void deleteCode(Map<String, Object> params) {
        delete("CmmnCodeMapper.deleteCode", params);
    }

    /**
     * 코드 리스트 삭제
     */
    public void deleteCodeDetail(Map<String, Object> params) {
        delete("CmmnCodeMapper.deleteCodeDetail", params);
    }

    /**
     * 코드 리스트 등록
     */
    public void insertCodeDetail(Map<String, Object> params) {
        insert("CmmnCodeMapper.insertCodeDetail", params);
    }

    /**
     * 하위 코드 존재 여부 확인
     */
    public String checkChildren(Map<String, String> params) {
        return selectOne("CmmnCodeMapper.checkChildren", params);
    }
}

