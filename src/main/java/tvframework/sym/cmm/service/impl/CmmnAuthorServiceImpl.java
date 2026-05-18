package tvframework.sym.cmm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import tvframework.sym.cmm.dto.CmmnAuthorDTO;
import tvframework.sym.cmm.dto.CmmnAuthorHierarchyEdgeDTO;
import tvframework.sym.cmm.dto.CmmnAuthorListResponseDTO;
import tvframework.sym.cmm.dto.CmmnAuthorRequestDTO;
import tvframework.sym.cmm.dto.CmmnAuthorUserDTO;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnGroupOptionDTO;
import tvframework.sym.cmm.dto.CmmnUserSearchDTO;
import tvframework.sym.cmm.service.CmmnAuthorService;

/**
 * 권한 관리 서비스 구현 클래스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnAuthorService")
@RequiredArgsConstructor
public class CmmnAuthorServiceImpl extends AbstractServiceImpl implements CmmnAuthorService {

    /** CM_AUTHOR 스키마: AUTHOR_CD/AUTHOR_NM/AUTHOR_CN */
    private static final int MAX_AUTHOR_CD_LEN = 20;
    private static final int MAX_AUTHOR_NM_LEN = 100;
    private static final int MAX_AUTHOR_CN_LEN = 400;
    /** CM_AUTHOR_USER: USER_TY, USER_CD */
    private static final int MAX_USER_TY_LEN = 20;
    private static final int MAX_USER_CD_LEN = 20;
    /** CM_AUTHOR_MENU: MENU_ID */
    private static final int MAX_MENU_ID_LEN = 30;

    private final CmmnAuthorMapper cmmnAuthorMapper;

    @Override
    public List<CmmnCompanyOptionDTO> selectCompanyList(String loginUserId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("loginUserId", loginUserId);
        return cmmnAuthorMapper.selectCompanyList(params);
    }

    @Override
    public List<CmmnGroupOptionDTO> selectGroupList(String companyCode, String searchKeyword, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnAuthorMapper.selectGroupList(params);
    }

    @Override
    public List<CmmnUserSearchDTO> selectGroupUserList(String companyCode, String groupId, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("groupId", groupId);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnAuthorMapper.selectGroupUserList(params);
    }

    @Override
    public List<CmmnUserSearchDTO> selectUserSearchList(String companyCode, String searchKeyword, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnAuthorMapper.selectUserSearchList(params);
    }

    @Override
    public List<CmmnUserSearchDTO> selectDeptUserList(String companyCode, String deptCode, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("deptCode", deptCode);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnAuthorMapper.selectDeptUserList(params);
    }

    @Override
    public CmmnAuthorListResponseDTO selectAuthorList(String cmpnyCd, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("searchKeyword", searchKeyword);
        params.put("pageIndex", pageIndex);
        params.put("recordCountPerPage", recordCountPerPage);
        params.put("offset", ((pageIndex != null ? pageIndex : 1) - 1) * (recordCountPerPage != null ? recordCountPerPage : 10));

        List<CmmnAuthorDTO> list = cmmnAuthorMapper.selectAuthorList(params);
        int totalCount = cmmnAuthorMapper.selectAuthorListTotCnt(params);

        CmmnAuthorListResponseDTO response = new CmmnAuthorListResponseDTO();
        response.setList(list);
        tvframework.com.cmm.pagination.PaginationInfo paginationInfo = new tvframework.com.cmm.pagination.PaginationInfo();
        paginationInfo.setCurrentPageNo(pageIndex != null ? pageIndex : 1);
        paginationInfo.setRecordCountPerPage(recordCountPerPage != null ? recordCountPerPage : 10);
        paginationInfo.setPageSize(10);
        paginationInfo.setTotalRecordCount(totalCount);
        response.setPaginationInfo(paginationInfo);
        return response;
    }

    @Override
    public CmmnAuthorDTO selectAuthorDetail(String cmpnyCd, String authorCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("authorCd", authorCd);
        return cmmnAuthorMapper.selectAuthorDetail(params);
    }

    @Override
    public List<CmmnAuthorUserDTO> selectAuthorUserList(String cmpnyCd, String authorCd, String languageCode) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("authorCd", authorCd);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnAuthorMapper.selectAuthorUserList(params);
    }

    @Override
    public List<tvframework.sym.cmm.dto.CmmnAuthorMenuDTO> selectAuthorMenuList(String cmpnyCd, String authorCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("authorCd", authorCd);
        return cmmnAuthorMapper.selectAuthorMenuList(params);
    }

    @Override
    @Transactional
    public void insertAuthor(CmmnAuthorRequestDTO requestDTO) throws Exception {
        validateAuthorPayload(requestDTO);
        String creationId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd().trim());
        params.put("authorCd", requestDTO.getAuthorCd().trim());
        params.put("authorNm", requestDTO.getAuthorNm().trim());
        params.put("authorCn", trimToEmpty(requestDTO.getAuthorCn()));
        params.put("useFl", requestDTO.getUseFl());
        params.put("creationId", creationId);
        cmmnAuthorMapper.insertAuthor(params);

        insertAuthorUsers(requestDTO, creationId);
        insertAuthorMenus(requestDTO, creationId);
    }

    @Override
    @Transactional
    public void updateAuthor(CmmnAuthorRequestDTO requestDTO) throws Exception {
        validateAuthorPayload(requestDTO);
        String updateId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd().trim());
        params.put("authorCd", requestDTO.getAuthorCd().trim());
        params.put("authorNm", requestDTO.getAuthorNm().trim());
        params.put("authorCn", trimToEmpty(requestDTO.getAuthorCn()));
        params.put("useFl", requestDTO.getUseFl());
        params.put("updateId", updateId);
        cmmnAuthorMapper.updateAuthor(params);

        Map<String, String> delParams = new HashMap<>();
        delParams.put("cmpnyCd", requestDTO.getCmpnyCd());
        delParams.put("authorCd", requestDTO.getAuthorCd());
        cmmnAuthorMapper.deleteAuthorUser(delParams);
        cmmnAuthorMapper.deleteAuthorMenu(delParams);
        insertAuthorUsers(requestDTO, updateId);
        insertAuthorMenus(requestDTO, updateId);
    }

    private void insertAuthorUsers(CmmnAuthorRequestDTO requestDTO, String creationId) {
        if (requestDTO.getAuthorUserList() == null || requestDTO.getAuthorUserList().isEmpty()) {
            return;
        }
        int sortOrd = 1;
        for (CmmnAuthorUserDTO user : requestDTO.getAuthorUserList()) {
            Map<String, Object> params = new HashMap<>();
            params.put("cmpnyCd", requestDTO.getCmpnyCd());
            params.put("authorCd", requestDTO.getAuthorCd());
            String userTy = user.getUserTy() != null ? user.getUserTy() : "USER";
            if ("ROLE".equalsIgnoreCase(userTy)) {
                userTy = "GROUP";
            }
            params.put("userTy", userTy);
            params.put("userCd", user.getUserCd());
            params.put("sortOrd", String.valueOf(sortOrd++));
            params.put("creationId", creationId);
            cmmnAuthorMapper.insertAuthorUser(params);
        }
    }

    private void insertAuthorMenus(CmmnAuthorRequestDTO requestDTO, String creationId) {
        if (requestDTO.getMenuIdList() == null || requestDTO.getMenuIdList().isEmpty()) {
            return;
        }

        String cmpnyCd = requestDTO.getCmpnyCd() != null ? requestDTO.getCmpnyCd().trim() : null;
        String authorCd = requestDTO.getAuthorCd() != null ? requestDTO.getAuthorCd().trim() : null;
        if (cmpnyCd == null || authorCd == null || cmpnyCd.isEmpty() || authorCd.isEmpty()) {
            return;
        }

        List<String> normalizedMenuIds = requestDTO.getMenuIdList().stream()
                .filter(mid -> mid != null && !mid.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .collect(Collectors.toList());
        if (normalizedMenuIds.isEmpty()) {
            return;
        }

        // 선택된 메뉴만 저장하면 트리 구성 시 부모 노드가 누락될 수 있어,
        // 선택 메뉴 + 상위(부모) 메뉴까지 함께 저장한다.
        Map<String, Object> expandedParams = new HashMap<>();
        expandedParams.put("cmpnyCd", cmpnyCd);
        expandedParams.put("menuIdList", normalizedMenuIds);
        List<String> menuIdsWithAncestors = cmmnAuthorMapper.selectMenuIdsWithAncestors(expandedParams);
        if (menuIdsWithAncestors == null || menuIdsWithAncestors.isEmpty()) {
            return;
        }

        int sortOrd = 1;
        for (String menuId : menuIdsWithAncestors) {
            Map<String, Object> params = new HashMap<>();
            params.put("cmpnyCd", cmpnyCd);
            params.put("authorCd", authorCd);
            params.put("menuId", menuId);
            params.put("sortOrd", String.valueOf(sortOrd++));
            params.put("creationId", creationId);
            cmmnAuthorMapper.insertAuthorMenu(params);
        }
    }

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
    public void deleteAuthor(String cmpnyCd, String authorCd) throws Exception {
        if ("AUTH_ADMIN".equals(authorCd) || "SYS_ADMIN".equals(authorCd)) {
            return;
        }
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("authorCd", authorCd);
        cmmnAuthorMapper.deleteAuthorUser(params);
        cmmnAuthorMapper.deleteAuthorMenu(params);
        cmmnAuthorMapper.deleteAuthor(params);
    }

    @Override
    @Transactional
    public void deleteAuthorList(List<CmmnAuthorDTO> list) throws Exception {
        List<CmmnAuthorDTO> filtered = list.stream()
                .filter(a -> !"AUTH_ADMIN".equals(a.getAuthorCd()) && !"SYS_ADMIN".equals(a.getAuthorCd()))
                .collect(Collectors.toList());
        for (CmmnAuthorDTO item : filtered) {
            deleteAuthor(item.getCmpnyCd(), item.getAuthorCd());
        }
    }

    @Override
    public List<CmmnAuthorHierarchyEdgeDTO> selectAuthorHierarchyList(String cmpnyCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        return cmmnAuthorMapper.selectAuthorHierarchyList(params);
    }

    @Override
    @Transactional
    public void insertAuthorHierarchy(String cmpnyCd, String upperAuthorCd, String lowerAuthorCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("upperAuthorCd", upperAuthorCd);
        params.put("lowerAuthorCd", lowerAuthorCd);
        params.put("creationId", resolveCreationId());
        cmmnAuthorMapper.insertAuthorHierarchy(params);
    }

    @Override
    @Transactional
    public void deleteAuthorHierarchy(String cmpnyCd, String upperAuthorCd, String lowerAuthorCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("upperAuthorCd", upperAuthorCd);
        params.put("lowerAuthorCd", lowerAuthorCd);
        cmmnAuthorMapper.deleteAuthorHierarchy(params);
    }

    @Override
    public List<CmmnAuthorDTO> selectUnmappedLowerAuthors(String cmpnyCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        return cmmnAuthorMapper.selectUnmappedLowerAuthors(params);
    }

    @Override
    public List<CmmnAuthorDTO> selectAuthorListAll(String cmpnyCd, String searchKeyword) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("searchKeyword", searchKeyword);
        return cmmnAuthorMapper.selectAuthorListAll(params);
    }

    private void validateAuthorPayload(CmmnAuthorRequestDTO requestDTO) throws Exception {
        if (requestDTO == null || !StringUtils.hasText(requestDTO.getCmpnyCd())) {
            throw new IllegalArgumentException("회사코드는 필수입니다.");
        }
        if (!StringUtils.hasText(requestDTO.getAuthorCd()) || !StringUtils.hasText(requestDTO.getAuthorNm())) {
            throw new IllegalArgumentException("권한코드와 권한명은 필수입니다.");
        }
        if (!StringUtils.hasText(requestDTO.getUseFl())) {
            throw new IllegalArgumentException("사용여부는 필수입니다.");
        }
        String cd = requestDTO.getAuthorCd().trim();
        String nm = requestDTO.getAuthorNm().trim();
        if (cd.length() > MAX_AUTHOR_CD_LEN || nm.length() > MAX_AUTHOR_NM_LEN) {
            throw new IllegalArgumentException("입력 길이가 허용 범위를 초과했습니다.");
        }
        String cn = trimToEmpty(requestDTO.getAuthorCn());
        if (cn.length() > MAX_AUTHOR_CN_LEN) {
            throw new IllegalArgumentException("권한 설명 길이가 허용 범위를 초과했습니다.");
        }
        if (requestDTO.getAuthorUserList() != null) {
            for (CmmnAuthorUserDTO u : requestDTO.getAuthorUserList()) {
                if (u == null) {
                    continue;
                }
                String ut = u.getUserTy() != null ? u.getUserTy().trim() : "";
                if (ut.length() > MAX_USER_TY_LEN) {
                    throw new IllegalArgumentException("사용자 유형 길이가 허용 범위를 초과했습니다.");
                }
                String uc = u.getUserCd() != null ? u.getUserCd().trim() : "";
                if (!StringUtils.hasText(uc)) {
                    throw new IllegalArgumentException("권한 사용자 코드는 필수입니다.");
                }
                if (uc.length() > MAX_USER_CD_LEN) {
                    throw new IllegalArgumentException("사용자 코드 길이가 허용 범위를 초과했습니다.");
                }
            }
        }
        if (requestDTO.getMenuIdList() != null) {
            for (String mid : requestDTO.getMenuIdList()) {
                if (mid != null && mid.trim().length() > MAX_MENU_ID_LEN) {
                    throw new IllegalArgumentException("메뉴 ID 길이가 허용 범위를 초과했습니다.");
                }
            }
        }
    }

    private static String trimToEmpty(String s) {
        return s == null ? "" : s.trim();
    }
}
