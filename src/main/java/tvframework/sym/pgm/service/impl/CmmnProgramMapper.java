package tvframework.sym.pgm.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.pgm.dto.CmmnProgramDTO;

/**
 * 프로그램 관리 Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnProgramMapper")
public class CmmnProgramMapper extends AbstractMapper {

    /**
     * 프로그램 목록 조회
     */
    @SuppressWarnings("unchecked")
    public List<CmmnProgramDTO> selectProgramList(Map<String, Object> params) {
        return selectList("CmmnProgramMapper.selectProgramList", params);
    }

    /**
     * 프로그램 목록 총 건수 조회
     */
    public int selectProgramListTotCnt(Map<String, Object> params) {
        Integer cnt = selectOne("CmmnProgramMapper.selectProgramListTotCnt", params);
        return cnt != null ? cnt : 0;
    }

    /**
     * 프로그램 상세 조회
     */
    public CmmnProgramDTO selectProgramDetail(Map<String, String> params) {
        return selectOne("CmmnProgramMapper.selectProgramDetail", params);
    }

    /**
     * 프로그램 등록
     */
    public void insertProgram(Map<String, Object> params) {
        insert("CmmnProgramMapper.insertProgram", params);
    }

    /**
     * 프로그램 수정
     */
    public void updateProgram(Map<String, Object> params) {
        update("CmmnProgramMapper.updateProgram", params);
    }

    /**
     * 프로그램 삭제
     */
    public void deleteProgram(Map<String, String> params) {
        delete("CmmnProgramMapper.deleteProgram", params);
    }
}
