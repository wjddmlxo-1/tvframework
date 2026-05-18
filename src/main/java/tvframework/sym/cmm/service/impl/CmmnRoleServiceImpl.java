package tvframework.sym.cmm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.pagination.PaginationInfo;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import tvframework.sym.cmm.dto.CmmnAuthorRoleSaveDTO;
import tvframework.sym.cmm.dto.CmmnRoleDTO;
import tvframework.sym.cmm.dto.CmmnRoleListResponseDTO;
import tvframework.sym.cmm.dto.CmmnRoleRequestDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmm.service.CmmnRoleService;

@Service("cmmnRoleService")
@RequiredArgsConstructor
public class CmmnRoleServiceImpl extends AbstractServiceImpl implements CmmnRoleService {

    /** CM_ROLE 스키마 */
    private static final int MAX_ROLE_CD_LEN = 20;
    private static final int MAX_ROLE_NM_LEN = 100;
    private static final int MAX_ROLE_TY_LEN = 20;
    private static final int MAX_ROLE_PTTRN_LEN = 100;
    private static final int MAX_ROLE_DC_LEN = 400;

    private final CmmnRoleMapper cmmnRoleMapper;

    @Override
    public List<CodeOptionDTO> selectRoleTypeOptions(String companyCode, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnRoleMapper.selectRoleTypeOptions(params);
    }

    @Override
    public CmmnRoleListResponseDTO selectRoleList(String cmpnyCd, String roleTy, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("roleTy", roleTy);
        params.put("searchKeyword", searchKeyword);
        params.put("pageIndex", pageIndex);
        params.put("recordCountPerPage", recordCountPerPage);
        params.put("offset", ((pageIndex != null ? pageIndex : 1) - 1) * (recordCountPerPage != null ? recordCountPerPage : 10));

        List<CmmnRoleDTO> list = cmmnRoleMapper.selectRoleList(params);
        int total = cmmnRoleMapper.selectRoleListTotCnt(params);
        CmmnRoleListResponseDTO res = new CmmnRoleListResponseDTO();
        res.setList(list);
        PaginationInfo p = new PaginationInfo();
        p.setCurrentPageNo(pageIndex != null ? pageIndex : 1);
        p.setRecordCountPerPage(recordCountPerPage != null ? recordCountPerPage : 10);
        p.setPageSize(10);
        p.setTotalRecordCount(total);
        res.setPaginationInfo(p);
        return res;
    }

    @Override
    public CmmnRoleDTO selectRoleDetail(String cmpnyCd, String roleCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("roleCd", roleCd);
        return cmmnRoleMapper.selectRoleDetail(params);
    }

    @Override
    @Transactional
    public void insertRole(CmmnRoleRequestDTO dto) throws Exception {
        validateRole(dto, true);
        String creationId = resolveUserId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", dto.getCmpnyCd().trim());
        params.put("roleCd", dto.getRoleCd().trim());
        params.put("roleNm", dto.getRoleNm().trim());
        params.put("roleTy", dto.getRoleTy() != null ? dto.getRoleTy().trim() : "");
        params.put("rolePttrn", dto.getRolePttrn() != null ? dto.getRolePttrn().trim() : "");
        params.put("roleDc", dto.getRoleDc() != null ? dto.getRoleDc().trim() : "");
        params.put("roleSort", parseRoleSort(dto.getRoleSort()));
        params.put("creationId", creationId);
        cmmnRoleMapper.insertRole(params);
    }

    @Override
    @Transactional
    public void updateRole(CmmnRoleRequestDTO dto) throws Exception {
        validateRole(dto, false);
        String updateId = resolveUserId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", dto.getCmpnyCd().trim());
        params.put("roleCd", dto.getRoleCd().trim());
        params.put("roleNm", dto.getRoleNm().trim());
        params.put("roleTy", dto.getRoleTy() != null ? dto.getRoleTy().trim() : "");
        params.put("rolePttrn", dto.getRolePttrn() != null ? dto.getRolePttrn().trim() : "");
        params.put("roleDc", dto.getRoleDc() != null ? dto.getRoleDc().trim() : "");
        params.put("roleSort", parseRoleSort(dto.getRoleSort()));
        params.put("updateId", updateId);
        cmmnRoleMapper.updateRole(params);
    }

    @Override
    @Transactional
    public void deleteRole(String cmpnyCd, String roleCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("roleCd", roleCd);
        // FK(CM_AUTHOR_ROLE_RELATE -> CM_ROLE) 보호를 위해 자식 데이터 먼저 삭제
        cmmnRoleMapper.deleteAuthorRoleByRole(params);
        cmmnRoleMapper.deleteRole(params);
    }

    @Override
    @Transactional
    public void deleteRoleList(List<CmmnRoleDTO> list) throws Exception {
        if (list == null) {
            return;
        }
        for (CmmnRoleDTO r : list) {
            if (r != null && r.getCmpnyCd() != null && r.getRoleCd() != null) {
                deleteRole(r.getCmpnyCd(), r.getRoleCd());
            }
        }
    }

    @Override
    public List<CmmnRoleDTO> selectRolesWithMappingForAuthor(String cmpnyCd, String authorCd, String roleTy,
            String searchKeyword) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("authorCd", authorCd);
        params.put("roleTy", roleTy);
        params.put("searchKeyword", searchKeyword);
        return cmmnRoleMapper.selectRolesWithMappingForAuthor(params);
    }

    @Override
    @Transactional
    public void saveAuthorRoles(CmmnAuthorRoleSaveDTO dto) throws Exception {
        if (dto == null || !StringUtils.hasText(dto.getCmpnyCd()) || !StringUtils.hasText(dto.getAuthorCd())) {
            throw new IllegalArgumentException("회사코드와 권한코드는 필수입니다.");
        }
        Map<String, String> del = new HashMap<>();
        del.put("cmpnyCd", dto.getCmpnyCd().trim());
        del.put("authorCd", dto.getAuthorCd().trim());
        cmmnRoleMapper.deleteAuthorRoleByAuthor(del);
        if (dto.getRoleCdList() == null || dto.getRoleCdList().isEmpty()) {
            return;
        }
        String creationId = resolveUserId();
        for (String roleCd : dto.getRoleCdList()) {
            if (!StringUtils.hasText(roleCd)) {
                continue;
            }
            Map<String, Object> ins = new HashMap<>();
            ins.put("cmpnyCd", dto.getCmpnyCd().trim());
            ins.put("authorCd", dto.getAuthorCd().trim());
            ins.put("roleCd", roleCd.trim());
            ins.put("creationId", creationId);
            cmmnRoleMapper.insertAuthorRole(ins);
        }
    }

    private void validateRole(CmmnRoleRequestDTO dto, boolean insert) throws Exception {
        if (dto == null || !StringUtils.hasText(dto.getCmpnyCd())) {
            throw new IllegalArgumentException("회사코드는 필수입니다.");
        }
        if (!StringUtils.hasText(dto.getRoleCd()) || !StringUtils.hasText(dto.getRoleNm())) {
            throw new IllegalArgumentException("롤코드와 롤명은 필수입니다.");
        }
        if (!StringUtils.hasText(dto.getRoleTy())) {
            throw new IllegalArgumentException("롤 유형은 필수입니다.");
        }
        if (dto.getRoleCd().trim().length() > MAX_ROLE_CD_LEN || dto.getRoleNm().trim().length() > MAX_ROLE_NM_LEN) {
            throw new IllegalArgumentException("입력 길이가 허용 범위를 초과했습니다.");
        }
        String pt = dto.getRolePttrn() != null ? dto.getRolePttrn().trim() : "";
        if (pt.length() > MAX_ROLE_PTTRN_LEN) {
            throw new IllegalArgumentException("롤 패턴 길이가 허용 범위를 초과했습니다.");
        }
        String dc = dto.getRoleDc() != null ? dto.getRoleDc().trim() : "";
        if (dc.length() > MAX_ROLE_DC_LEN) {
            throw new IllegalArgumentException("롤 설명 길이가 허용 범위를 초과했습니다.");
        }
        String ty = dto.getRoleTy() != null ? dto.getRoleTy().trim() : "";
        if (ty.length() > MAX_ROLE_TY_LEN) {
            throw new IllegalArgumentException("롤 유형 길이가 허용 범위를 초과했습니다.");
        }
        if (StringUtils.hasText(dto.getRoleSort())) {
            parseRoleSort(dto.getRoleSort());
        }
    }

    /** CM_ROLE.ROLE_SORT — smallint */
    private Short parseRoleSort(String roleSort) {
        if (!StringUtils.hasText(roleSort)) {
            return null;
        }
        String s = roleSort.trim();
        try {
            int v = Integer.parseInt(s);
            if (v < Short.MIN_VALUE || v > Short.MAX_VALUE) {
                throw new IllegalArgumentException("롤 정렬은 -32768~32767 범위의 정수여야 합니다.");
            }
            return (short) v;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("롤 정렬은 숫자여야 합니다.");
        }
    }

    private String resolveUserId() {
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
}
