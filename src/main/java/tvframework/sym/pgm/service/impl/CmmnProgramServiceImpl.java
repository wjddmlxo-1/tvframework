package tvframework.sym.pgm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import tvframework.sym.pgm.dto.CmmnProgramDTO;
import tvframework.sym.pgm.dto.CmmnProgramListResponseDTO;
import tvframework.sym.pgm.dto.CmmnProgramRequestDTO;
import tvframework.sym.pgm.service.CmmnProgramService;

/**
 * 프로그램 관리 서비스 구현 클래스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnProgramService")
@RequiredArgsConstructor
public class CmmnProgramServiceImpl extends AbstractServiceImpl implements CmmnProgramService {

    private final CmmnProgramMapper cmmnProgramMapper;

    @Override
    public CmmnProgramListResponseDTO selectProgramList(
            String searchKeyword, String cmpnyCd, String langCode, Integer pageIndex, Integer recordCountPerPage) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("searchKeyword", searchKeyword);
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        params.put("langCode", (langCode != null && !langCode.isEmpty()) ? langCode : "ko");
        params.put("pageIndex", pageIndex);
        params.put("recordCountPerPage", recordCountPerPage);
        params.put("offset", (pageIndex - 1) * recordCountPerPage);

        List<CmmnProgramDTO> list = cmmnProgramMapper.selectProgramList(params);
        int totalCount = cmmnProgramMapper.selectProgramListTotCnt(params);

        CmmnProgramListResponseDTO response = new CmmnProgramListResponseDTO();
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
    public CmmnProgramDTO selectProgramDetail(String cmpnyCd, String progId, String langCode) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        params.put("progrmFileNm", progId);
        params.put("langCode", (langCode != null && !langCode.isEmpty()) ? langCode : "ko");
        return cmmnProgramMapper.selectProgramDetail(params);
    }

    @Override
    @Transactional
    public void insertProgram(CmmnProgramRequestDTO requestDTO) throws Exception {
        String creationId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd() != null ? requestDTO.getCmpnyCd() : "");
        params.put("progrmFileNm", requestDTO.getProgrmFileNm());
        params.put("progrmStrePath", requestDTO.getProgrmStrePath());
        params.put("progrmNmCode", requestDTO.getProgrmNmCode());
        params.put("progrmUrl", requestDTO.getProgrmUrl());
        params.put("progrmDc", requestDTO.getProgrmDc());
        params.put("useFl", requestDTO.getUseFl());
        params.put("creationId", creationId);
        cmmnProgramMapper.insertProgram(params);
    }

    @Override
    @Transactional
    public void updateProgram(CmmnProgramRequestDTO requestDTO) throws Exception {
        String updateId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd() != null ? requestDTO.getCmpnyCd() : "");
        params.put("progrmFileNm", requestDTO.getProgrmFileNm());
        params.put("progrmStrePath", requestDTO.getProgrmStrePath());
        params.put("progrmNmCode", requestDTO.getProgrmNmCode());
        params.put("progrmUrl", requestDTO.getProgrmUrl());
        params.put("progrmDc", requestDTO.getProgrmDc());
        params.put("useFl", requestDTO.getUseFl());
        params.put("updateId", updateId);
        cmmnProgramMapper.updateProgram(params);
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
    public void deleteProgram(String cmpnyCd, String progId) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        params.put("progrmFileNm", progId);
        cmmnProgramMapper.deleteProgram(params);
    }
}
