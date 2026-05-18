package tvframework.sym.mnu.service;

import java.util.List;

import tvframework.sym.mnu.dto.CmmnMenuDTO;
import tvframework.sym.mnu.dto.CmmnMenuRequestDTO;
import tvframework.sym.mnu.dto.MenuTreeDTO;

/**
 * 메뉴 관리 서비스 인터페이스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnMenuService {

    /**
     * 메뉴 트리 조회
     *
     * @param cmpnyCd 회사코드
     * @param langGb 언어구분
     * @return 메뉴 트리 목록
     * @throws Exception
     */
    List<MenuTreeDTO> selectMenuTree(String cmpnyCd, String langGb) throws Exception;

    /**
     * 메뉴 검색용 트리 조회 (Directory만)
     *
     * @param cmpnyCd 회사코드
     * @param langGb 언어구분
     * @return 메뉴 트리 목록
     * @throws Exception
     */
    List<MenuTreeDTO> selectMenuTreeForSearch(String cmpnyCd, String langGb) throws Exception;

    /**
     * 로그인 사용자 권한 기반 사이드바 메뉴 트리 (CM_AUTHOR_MENU 등)
     *
     * @param userId 로그인 ID (인증 사용자와 일치해야 함)
     * @param cmpnyCd 회사코드
     * @param langGb 언어구분
     * @return 메뉴 트리
     * @throws Exception
     */
    List<MenuTreeDTO> selectSidebarMenuTree(String userId, String cmpnyCd, String langGb) throws Exception;

    /**
     * 메뉴 상세 조회
     *
     * @param cmpnyCd 회사코드
     * @param menuId 메뉴 ID
     * @param langGb 언어구분
     * @return 메뉴 상세 정보
     * @throws Exception
     */
    CmmnMenuDTO selectMenuDetail(String cmpnyCd, String menuId, String langGb) throws Exception;

    /**
     * 메뉴 등록
     *
     * @param requestDTO 메뉴 정보
     * @throws Exception
     */
    void insertMenu(CmmnMenuRequestDTO requestDTO) throws Exception;

    /**
     * 메뉴 수정
     *
     * @param cmpnyCd 회사코드
     * @param menuId 메뉴 ID
     * @param requestDTO 메뉴 정보
     * @throws Exception
     */
    void updateMenu(String cmpnyCd, String menuId, CmmnMenuRequestDTO requestDTO) throws Exception;

    /**
     * 메뉴 삭제
     *
     * @param cmpnyCd 회사코드
     * @param menuId 메뉴 ID
     * @throws Exception
     */
    void deleteMenu(String cmpnyCd, String menuId) throws Exception;

    /**
     * 하위 메뉴 존재 여부 확인
     *
     * @param cmpnyCd 회사코드
     * @param menuId 메뉴 ID
     * @return "O" 또는 "X"
     * @throws Exception
     */
    String checkChildren(String cmpnyCd, String menuId) throws Exception;
}
