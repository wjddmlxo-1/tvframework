package tvframework.sym.cmp.service;

import java.util.Map;
import java.util.List;

import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.cmp.dto.CmmnCompanyDTO;
import tvframework.sym.cmp.dto.CmmnCompanyListResponseDTO;
import tvframework.sym.cmp.dto.CmmnCompanyRequestDTO;

/**
 * 회사정보 관리 서비스 인터페이스
 *
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
public interface CmmnCompanyService {

    /**
     * 회사정보 목록 조회 (페이징)
     */
    CmmnCompanyListResponseDTO selectCompanyList(String sbscrbSttus, String searchKeyword,
            Integer pageIndex, Integer recordCountPerPage, String languageCode) throws Exception;

    /**
     * 회사정보 상세 조회
     */
    CmmnCompanyDTO selectCompanyDetail(String cmpnyCd) throws Exception;

    /**
     * 공통코드 옵션 조회 (CodeOptionDTO: code, name)
     */
    List<CodeOptionDTO> selectCodeOption(String codeId, String languageCode) throws Exception;

    /**
     * 회사ID 중복 검사 (가능: O, 불가: X)
     */
    String checkDuplicateCmpnyCd(String cmpnyCd) throws Exception;

    /**
     * 회사정보 등록
     */
    void insertCompany(CmmnCompanyRequestDTO requestDTO) throws Exception;

    /**
     * 회사정보 수정
     */
    void updateCompany(CmmnCompanyRequestDTO requestDTO) throws Exception;

    /**
     * 회사정보 삭제 (상태값 변경)
     */
    void deleteCompany(String cmpnyCd) throws Exception;

    /**
     * 회사정보 일괄 삭제 (상태값 변경)
     */
    void deleteCompanyList(List<String> cmpnyCdList) throws Exception;

    /**
     * 회원가입 약관 정보 조회
     */
    Map<String, String> selectJoinStplat(String languageCode) throws Exception;

    /**
     * 회원가입(회사 가입신청) 저장
     */
    void insertCompanyJoin(CmmnCompanyRequestDTO requestDTO) throws Exception;
}
