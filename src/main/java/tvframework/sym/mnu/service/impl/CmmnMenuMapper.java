package tvframework.sym.mnu.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import tvframework.com.cmm.dataaccess.AbstractMapper;
import tvframework.sym.mnu.dto.CmmnMenuDTO;

/**
 * 메뉴 관리 Mapper
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Repository("cmmnMenuMapper")
public class CmmnMenuMapper extends AbstractMapper {

    /**
     * 메뉴 트리 조회 (WITH RECURSIVE)
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectMenuTree(String cmpnyCd, String langGb) {
        Map<String, String> params = new java.util.HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null && !cmpnyCd.isEmpty() ? cmpnyCd : "1000000001");
        params.put("langGb", langGb != null && !langGb.isEmpty() ? langGb : "ko_KR");
        return selectList("CmmnMenuMapper.selectMenuTree", params);
    }

    /**
     * 메뉴 검색용 트리 조회 (Directory만, PROGRM_FILE_NM = 'dir')
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectMenuTreeForSearch(String cmpnyCd, String langGb) {
        Map<String, String> params = new java.util.HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null && !cmpnyCd.isEmpty() ? cmpnyCd : "1000000001");
        params.put("langGb", langGb != null && !langGb.isEmpty() ? langGb : "ko_KR");
        return selectList("CmmnMenuMapper.selectMenuTreeForSearch", params);
    }

    /**
     * 로그인 사용자 권한 기반 사이드바 메뉴 (플랫 후 트리 조립)
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> selectSidebarMenuForUser(Map<String, String> params) {
        return selectList("CmmnMenuMapper.selectSidebarMenuForUser", params);
    }

    /**
     * 메뉴 상세 조회
     */
    public CmmnMenuDTO selectMenuDetail(Map<String, String> params) {
        return selectOne("CmmnMenuMapper.selectMenuDetail", params);
    }

    /**
     * 메뉴 등록
     */
    public void insertMenu(Map<String, Object> params) {
        insert("CmmnMenuMapper.insertMenu", params);
    }

    /**
     * 메뉴 수정
     */
    public void updateMenu(Map<String, Object> params) {
        update("CmmnMenuMapper.updateMenu", params);
    }

    /**
     * 메뉴 삭제
     */
    public void deleteMenu(Map<String, Object> params) {
        delete("CmmnMenuMapper.deleteMenu", params);
    }

    /**
     * 하위 메뉴 존재 여부 확인
     */
    public String checkChildren(Map<String, String> params) {
        return selectOne("CmmnMenuMapper.checkChildren", params);
    }
}
