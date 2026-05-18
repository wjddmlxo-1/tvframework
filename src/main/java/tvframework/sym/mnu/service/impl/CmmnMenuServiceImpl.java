package tvframework.sym.mnu.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import tvframework.sym.mnu.dto.CmmnMenuDTO;
import tvframework.sym.mnu.dto.CmmnMenuRequestDTO;
import tvframework.sym.mnu.dto.MenuTreeDTO;
import tvframework.sym.mnu.service.CmmnMenuService;

/**
 * 메뉴 관리 서비스 구현 클래스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnMenuService")
@RequiredArgsConstructor
public class CmmnMenuServiceImpl extends AbstractServiceImpl implements CmmnMenuService {

    private static final String DEFAULT_CMPNY_CD = "1000000001";

    private final CmmnMenuMapper cmmnMenuMapper;

    @Override
    public List<MenuTreeDTO> selectMenuTree(String cmpnyCd, String langGb) throws Exception {
        String lang = (langGb != null && !langGb.isEmpty()) ? langGb : "ko_KR";
        String companyCd = (cmpnyCd != null && !cmpnyCd.isEmpty()) ? cmpnyCd : DEFAULT_CMPNY_CD;
        List<Map<String, Object>> flatList = cmmnMenuMapper.selectMenuTree(companyCd, lang);
        return buildMenuTree(flatList);
    }

    @Override
    public List<MenuTreeDTO> selectMenuTreeForSearch(String cmpnyCd, String langGb) throws Exception {
        String lang = (langGb != null && !langGb.isEmpty()) ? langGb : "ko_KR";
        String companyCd = (cmpnyCd != null && !cmpnyCd.isEmpty()) ? cmpnyCd : DEFAULT_CMPNY_CD;
        List<Map<String, Object>> flatList = cmmnMenuMapper.selectMenuTreeForSearch(companyCd, lang);
        return buildMenuTree(flatList);
    }

    @Override
    public List<MenuTreeDTO> selectSidebarMenuTree(String userId, String cmpnyCd, String langGb) throws Exception {
        Object principal = UserDetailsHelper.getAuthenticatedUser();
        if (!(principal instanceof LoginVO)) {
            return new ArrayList<>();
        }
        String authId = ((LoginVO) principal).getId();
        if (authId == null || userId == null || !authId.trim().equals(userId.trim())) {
            throw new IllegalArgumentException("userId must match the authenticated user.");
        }
        String lang = (langGb != null && !langGb.isEmpty()) ? langGb : "ko_KR";
        String companyCd = (cmpnyCd != null && !cmpnyCd.isEmpty()) ? cmpnyCd : DEFAULT_CMPNY_CD;
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", companyCd);
        params.put("userId", userId.trim());
        params.put("langGb", lang);
        params.put("languageCode", lang);
        List<Map<String, Object>> flatList = cmmnMenuMapper.selectSidebarMenuForUser(params);
        return buildMenuTree(flatList);
    }

    /**
     * flatList는 쿼리 ORDER BY PATH 순서로 들어옴.
     * flatList 순서를 그대로 유지해 트리를 만들면 루트/형제 순서가 PATH 순서와 일치함.
     */
    private List<MenuTreeDTO> buildMenuTree(List<Map<String, Object>> flatList) {
        Map<String, MenuTreeDTO> nodeMap = new HashMap<>();
        List<MenuTreeDTO> rootNodes = new ArrayList<>();
        if (flatList == null || flatList.isEmpty()) {
            return rootNodes;
        }
        for (Map<String, Object> item : flatList) {
            if (item == null || item.get("menuId") == null) continue;
            MenuTreeDTO node = new MenuTreeDTO();
            node.setMenuId((String) item.get("menuId"));
            node.setMenuNm((String) item.get("menuNm"));
            node.setUpperMenuId((String) item.get("upperMenuId"));
            node.setSortOrd((String) item.get("sortOrd"));
            node.setUseFl((String) item.get("useFl"));
            node.setProgrmFileNm((String) item.get("progrmFileNm"));
            node.setImageFullPath((String) item.get("imageFullPath"));
            Object navigateUrlObj = item.get("navigateUrl");
            if (navigateUrlObj != null) {
                node.setNavigateUrl((String) navigateUrlObj);
            }
            node.setPath((String) item.get("path"));
            Object levelObj = item.get("treeLevel");
            if (levelObj != null) {
                node.setTreeLevel(levelObj instanceof Integer ? (Integer) levelObj : ((Number) levelObj).intValue());
            }
            node.setChildren(new ArrayList<>());
            nodeMap.put(node.getMenuId(), node);
        }
        for (Map<String, Object> item : flatList) {
            if (item == null || item.get("menuId") == null) continue;
            MenuTreeDTO node = nodeMap.get(item.get("menuId"));
            if (node == null) continue;
            if (node.getUpperMenuId() == null || "#".equals(node.getUpperMenuId())) {
                rootNodes.add(node);
            } else {
                MenuTreeDTO parent = nodeMap.get(node.getUpperMenuId());
                if (parent != null) {
                    parent.getChildren().add(node);
                } else {
                    // 권한/조인 조건으로 부모가 결과셋에 없더라도 자식 메뉴는 노출되도록 루트로 승격
                    rootNodes.add(node);
                }
            }
        }
        return rootNodes;
    }

    @Override
    public CmmnMenuDTO selectMenuDetail(String cmpnyCd, String menuId, String langGb) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null && !cmpnyCd.isEmpty() ? cmpnyCd : DEFAULT_CMPNY_CD);
        params.put("menuId", menuId);
        params.put("langGb", langGb != null && !langGb.isEmpty() ? langGb : "ko_KR");
        return cmmnMenuMapper.selectMenuDetail(params);
    }

    @Override
    @Transactional
    public void insertMenu(CmmnMenuRequestDTO requestDTO) throws Exception {
        String creationId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd() != null ? requestDTO.getCmpnyCd() : DEFAULT_CMPNY_CD);
        params.put("menuId", requestDTO.getMenuId());
        params.put("menuNmCd", requestDTO.getMenuNmCd());
        params.put("progrmFileNm", requestDTO.getProgrmFileNm());
        params.put("upperMenuId", requestDTO.getUpperMenuId());
        params.put("sortOrd", requestDTO.getSortOrd());
        params.put("menuDc", requestDTO.getMenuDc());
        params.put("useFl", requestDTO.getUseFl() != null ? requestDTO.getUseFl() : "Y");
        params.put("imagePath", requestDTO.getImagePath());
        params.put("imageNm", requestDTO.getImageNm());
        params.put("creationId", creationId);
        cmmnMenuMapper.insertMenu(params);
    }

    @Override
    @Transactional
    public void updateMenu(String cmpnyCd, String menuId, CmmnMenuRequestDTO requestDTO) throws Exception {
        String companyCd = (cmpnyCd != null && !cmpnyCd.isEmpty()) ? cmpnyCd : (requestDTO.getCmpnyCd() != null && !requestDTO.getCmpnyCd().isEmpty() ? requestDTO.getCmpnyCd() : DEFAULT_CMPNY_CD);
        String updateId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", companyCd);
        params.put("menuId", menuId);
        params.put("menuNmCd", requestDTO.getMenuNmCd());
        params.put("progrmFileNm", requestDTO.getProgrmFileNm());
        params.put("upperMenuId", requestDTO.getUpperMenuId());
        params.put("sortOrd", requestDTO.getSortOrd());
        params.put("menuDc", requestDTO.getMenuDc());
        params.put("useFl", requestDTO.getUseFl());
        params.put("imagePath", requestDTO.getImagePath());
        params.put("imageNm", requestDTO.getImageNm());
        params.put("updateId", updateId);
        cmmnMenuMapper.updateMenu(params);
    }

    /** 로그인 사용자 ID (없으면 'admin') */
    private String resolveCreationId() {
        try {
            Object principal = UserDetailsHelper.getAuthenticatedUser();
            if (principal instanceof LoginVO) {
                String id = ((LoginVO) principal).getId();
                if (id != null && !id.trim().isEmpty()) {
                    return id.trim();
                }
            }
        } catch (Exception ignored) {
            // ignore
        }
        return "admin";
    }

    @Override
    @Transactional
    public void deleteMenu(String cmpnyCd, String menuId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null && !cmpnyCd.isEmpty() ? cmpnyCd : DEFAULT_CMPNY_CD);
        params.put("menuId", menuId);
        cmmnMenuMapper.deleteMenu(params);
    }

    @Override
    public String checkChildren(String cmpnyCd, String menuId) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null && !cmpnyCd.isEmpty() ? cmpnyCd : DEFAULT_CMPNY_CD);
        params.put("menuId", menuId);
        return cmmnMenuMapper.checkChildren(params);
    }
}
