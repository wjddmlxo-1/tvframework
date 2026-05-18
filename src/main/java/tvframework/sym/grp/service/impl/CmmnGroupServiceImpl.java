package tvframework.sym.grp.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CmmnDeptTreeDTO;
import tvframework.sym.grp.dto.CmmnGroupDTO;
import tvframework.sym.grp.dto.CmmnGroupListResponseDTO;
import tvframework.sym.grp.dto.CmmnGroupRequestDTO;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;
import tvframework.sym.grp.service.CmmnGroupService;

/**
 * 그룹 관리 서비스 구현 클래스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnGroupService")
@RequiredArgsConstructor
public class CmmnGroupServiceImpl extends AbstractServiceImpl implements CmmnGroupService {

    private final CmmnGroupMapper cmmnGroupMapper;

    @Override
    public List<CmmnCompanyOptionDTO> selectCompanyList(String loginUserId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("loginUserId", loginUserId);
        return cmmnGroupMapper.selectCompanyList(params);
    }

    @Override
    public CmmnGroupListResponseDTO selectGroupList(String cmpnyCd, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        params.put("pageIndex", pageIndex);
        params.put("recordCountPerPage", recordCountPerPage);
        params.put("offset", (pageIndex - 1) * recordCountPerPage);

        List<CmmnGroupDTO> list = cmmnGroupMapper.selectGroupList(params);
        int totalCount = cmmnGroupMapper.selectGroupListTotCnt(params);

        CmmnGroupListResponseDTO response = new CmmnGroupListResponseDTO();
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
    public CmmnGroupDTO selectGroupDetail(String cmpnyCd, String groupId) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("groupId", groupId);
        return cmmnGroupMapper.selectGroupDetail(params);
    }

    @Override
    public List<CmmnGroupUserDTO> selectGroupUserList(String cmpnyCd, String groupId, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("groupId", groupId);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnGroupMapper.selectGroupUserList(params);
    }

    @Override
    public List<CmmnGroupUserDTO> selectUserSearchList(String cmpnyCd, String searchKeyword, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnGroupMapper.selectUserSearchList(params);
    }

    @Override
    public List<CmmnDeptTreeDTO> selectDeptTree(String cmpnyCd, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnGroupMapper.selectDeptTree(params);
    }

    @Override
    public List<CmmnGroupUserDTO> selectDeptUserList(String cmpnyCd, String deptCd, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("deptCd", deptCd);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnGroupMapper.selectDeptUserList(params);
    }

    @Override
    @Transactional
    public void insertGroup(CmmnGroupRequestDTO requestDTO) throws Exception {
        String creationId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd());
        params.put("groupId", requestDTO.getGroupId());
        params.put("groupNm", requestDTO.getGroupNm());
        params.put("groupEngNm", requestDTO.getGroupEngNm());
        params.put("groupCn", requestDTO.getGroupCn());
        params.put("useFl", requestDTO.getUseFl() != null ? requestDTO.getUseFl() : "Y");
        params.put("creationId", creationId);
        cmmnGroupMapper.insertGroup(params);

        insertGroupUsers(requestDTO, creationId);
    }

    @Override
    @Transactional
    public void updateGroup(CmmnGroupRequestDTO requestDTO) throws Exception {
        String updateId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd());
        params.put("groupId", requestDTO.getGroupId());
        params.put("groupNm", requestDTO.getGroupNm());
        params.put("groupEngNm", requestDTO.getGroupEngNm());
        params.put("groupCn", requestDTO.getGroupCn());
        params.put("useFl", requestDTO.getUseFl() != null ? requestDTO.getUseFl() : "Y");
        params.put("updateId", updateId);
        cmmnGroupMapper.updateGroup(params);

        Map<String, String> delParams = new HashMap<>();
        delParams.put("cmpnyCd", requestDTO.getCmpnyCd());
        delParams.put("groupId", requestDTO.getGroupId());
        cmmnGroupMapper.deleteGroupUser(delParams);
        insertGroupUsers(requestDTO, updateId);
    }

    private void insertGroupUsers(CmmnGroupRequestDTO requestDTO, String creationId) {
        if (requestDTO.getMbrshSqList() == null || requestDTO.getMbrshSqList().isEmpty()) {
            return;
        }
        for (Long mbrshSq : requestDTO.getMbrshSqList()) {
            Map<String, Object> params = new HashMap<>();
            params.put("cmpnyCd", requestDTO.getCmpnyCd());
            params.put("groupId", requestDTO.getGroupId());
            params.put("mbrshSq", mbrshSq);
            params.put("creationId", creationId);
            cmmnGroupMapper.insertGroupUser(params);
        }
    }

    @Override
    @Transactional
    public void deleteGroup(String cmpnyCd, String groupId) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        params.put("groupId", groupId);
        cmmnGroupMapper.deleteGroupUser(params);
        cmmnGroupMapper.deleteGroup(params);
    }

    @Override
    @Transactional
    public void deleteGroupList(List<CmmnGroupDTO> list) throws Exception {
        for (CmmnGroupDTO item : list) {
            deleteGroup(item.getCmpnyCd(), item.getGroupId());
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
}
