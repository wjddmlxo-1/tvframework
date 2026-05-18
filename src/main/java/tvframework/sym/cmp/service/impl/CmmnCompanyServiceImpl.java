package tvframework.sym.cmp.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.pagination.PaginationInfo;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.dto.CmmnCompanyDTO;
import tvframework.sym.cmp.dto.CmmnCompanyListResponseDTO;
import tvframework.sym.cmp.dto.CmmnCompanyRequestDTO;
import tvframework.sym.cmp.service.CmmnCompanyService;

/**
 * 회사정보 관리 서비스 구현 클래스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnCompanyService")
@RequiredArgsConstructor
public class CmmnCompanyServiceImpl extends AbstractServiceImpl implements CmmnCompanyService {

    private final CmmnCompanyMapper cmmnCompanyMapper;

    @Override
    public CmmnCompanyListResponseDTO selectCompanyList(String sbscrbSttus, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("sbscrbSttus", sbscrbSttus);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        params.put("pageIndex", pageIndex);
        params.put("recordCountPerPage", recordCountPerPage);
        params.put("offset", (pageIndex - 1) * recordCountPerPage);

        List<CmmnCompanyDTO> list = cmmnCompanyMapper.selectCompanyList(params);
        int totalCount = cmmnCompanyMapper.selectCompanyListTotCnt(params);

        CmmnCompanyListResponseDTO response = new CmmnCompanyListResponseDTO();
        response.setList(list);
        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(pageIndex != null ? pageIndex : 1);
        paginationInfo.setRecordCountPerPage(recordCountPerPage != null ? recordCountPerPage : 15);
        paginationInfo.setPageSize(10);
        paginationInfo.setTotalRecordCount(totalCount);
        response.setPaginationInfo(paginationInfo);
        return response;
    }

    @Override
    public CmmnCompanyDTO selectCompanyDetail(String cmpnyCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        return cmmnCompanyMapper.selectCompanyDetail(params);
    }

    @Override
    public List<CodeOptionDTO> selectCodeOption(String codeId, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnCompanyMapper.selectCodeOptionByCodeId(params);
    }

    @Override
    public String checkDuplicateCmpnyCd(String cmpnyCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        return cmmnCompanyMapper.checkDuplicateCmpnyCd(params);
    }

    @Override
    public Map<String, String> selectJoinStplat(String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        Map<String, String> row = cmmnCompanyMapper.selectJoinStplat(params);
        if (row == null) {
            Map<String, String> empty = new HashMap<>();
            empty.put("useStplatCn", "");
            empty.put("infoProvdAgreCn", "");
            return empty;
        }
        return row;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertCompany(CmmnCompanyRequestDTO requestDTO) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd());
        params.put("cmpnyNm", requestDTO.getCmpnyNm());
        params.put("entrprsGb", requestDTO.getEntrprsGb());
        params.put("indutyCd", requestDTO.getIndutyCd());
        params.put("cxfc", requestDTO.getCxfc());
        params.put("bsnsNo", requestDTO.getBsnsNo());
        params.put("cprNo", requestDTO.getCprNo());
        params.put("adresOne", requestDTO.getAdresOne());
        params.put("adresTwo", requestDTO.getAdresTwo());
        params.put("cityNm", requestDTO.getCityNm());
        params.put("stateNm", requestDTO.getStateNm());
        params.put("nationCd", requestDTO.getNationCd());
        params.put("zipCd", requestDTO.getZipCd());
        params.put("offmTelno", requestDTO.getOffmTelno());
        params.put("fxnum", requestDTO.getFxnum());
        params.put("applcntNm", requestDTO.getApplcntNm());
        params.put("applcntEmail", requestDTO.getApplcntEmail());
        params.put("applcntId", requestDTO.getApplcntId());
        params.put("exprtnYmd", requestDTO.getExprtnYmd());
        params.put("sbscrbSttus", requestDTO.getSbscrbSttus());
        params.put("useFl", requestDTO.getUseFl());
        params.put("creationId", requestDTO.getApplcntId() != null ? requestDTO.getApplcntId() : "admin");
        cmmnCompanyMapper.insertCompany(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertCompanyJoin(CmmnCompanyRequestDTO requestDTO) throws Exception {
        insertCompany(requestDTO);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCompany(CmmnCompanyRequestDTO requestDTO) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd());
        params.put("cmpnyNm", requestDTO.getCmpnyNm());
        params.put("entrprsGb", requestDTO.getEntrprsGb());
        params.put("indutyCd", requestDTO.getIndutyCd());
        params.put("cxfc", requestDTO.getCxfc());
        params.put("bsnsNo", requestDTO.getBsnsNo());
        params.put("cprNo", requestDTO.getCprNo());
        params.put("adresOne", requestDTO.getAdresOne());
        params.put("adresTwo", requestDTO.getAdresTwo());
        params.put("cityNm", requestDTO.getCityNm());
        params.put("stateNm", requestDTO.getStateNm());
        params.put("nationCd", requestDTO.getNationCd());
        params.put("zipCd", requestDTO.getZipCd());
        params.put("offmTelno", requestDTO.getOffmTelno());
        params.put("fxnum", requestDTO.getFxnum());
        params.put("applcntNm", requestDTO.getApplcntNm());
        params.put("applcntEmail", requestDTO.getApplcntEmail());
        params.put("exprtnYmd", requestDTO.getExprtnYmd());
        params.put("sbscrbSttus", requestDTO.getSbscrbSttus());
        params.put("useFl", requestDTO.getUseFl());
        cmmnCompanyMapper.updateCompany(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCompany(String cmpnyCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", cmpnyCd);
        cmmnCompanyMapper.deleteCompany(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCompanyList(List<String> cmpnyCdList) throws Exception {
        for (String cmpnyCd : cmpnyCdList) {
            deleteCompany(cmpnyCd);
        }
    }
}
