package tvframework.sym.usr.service;

import java.util.List;
import java.util.Map;

import tvframework.com.cmm.pagination.PaginationInfo;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;
import tvframework.sym.usr.dto.CmmnDeptManageDTO;
import tvframework.sym.usr.dto.CmmnUserCompanyInfoDTO;
import tvframework.sym.usr.dto.CmmnUserDTO;
import tvframework.sym.usr.dto.CmmnUserManageListDTO;
import tvframework.sym.usr.dto.CodeOptionItemDTO;

/**
 * 사용자관리(화면설계서) 서비스 인터페이스
 */
public interface CmmnUserManageService {

    /** 회사 사용자 리스트 조회 (페이징) */
    Map<String, Object> selectCompanyUserList(String companyCode, String searchKeyword, String languageCode,
            Integer pageIndex, Integer recordCountPerPage) throws Exception;

    /** 사용자 기본정보 + 회사별 정보 (상세) */
    Map<String, Object> selectUserDetail(String userId, String companyCode, String languageCode) throws Exception;

    /**
     * 내 프로필 조회: {@code selectUserByUserId} + {@code selectUserCompanyInfoAllByUserId}(전체 소속 행).
     * 코드옵션용 {@code profileCompanyCode}: {@code preferredCompanyCode} 가 소속에 있으면 해당, 없으면 첫 소속 회사.
     */
    Map<String, Object> selectMyProfile(String userId, String preferredCompanyCode, String languageCode) throws Exception;

    /**
     * 내 프로필 저장: CM_USER 갱신 후, 요청의 각 MBRSH_SQ 가 로그인 USER_ID 소속일 때만 {@code updateUserOrgnztMbrsh}.
     */
    void saveMyProfile(String loginUserId, Map<String, Object> userBasic, List<Map<String, Object>> companyInfoList,
            String updateId, String creationId) throws Exception;

    /** 마이페이지 탈퇴: CM_USER 구독상태 탈퇴 처리 */
    void withdrawMyUser(String userId, String updateId) throws Exception;

    /** 코드 옵션 (비밀번호힌트, 성별, 직위, 부서등급) */
    List<CodeOptionItemDTO> selectCodeOption(String codeId, String companyCode, String languageCode) throws Exception;

    /** 중복 아이디 검사 (O: 사용가능, X: 사용불가) */
    String checkDuplicateUserId(String userId) throws Exception;

    /** 사용자 등록 (CM_USER + 회사별 CM_USER_ORGNZT_MBRSH) */
    void saveUserRegistration(String companyCode, Map<String, Object> userBasic, Map<String, Object> companyInfo,
            String creationId) throws Exception;

    /** 사용자 상세 저장 (CM_USER 수정 + 회사별 정보 있으면 UPDATE 없으면 INSERT) */
    void saveUserDetail(String companyCode, String userId, Map<String, Object> userBasic, Map<String, Object> companyInfo,
            String updateId, String creationId) throws Exception;

    /** 회사 사용자 삭제 (CM_GROUP_USER → CM_USER_ORGNZT_MBRSH → CM_USER) */
    void deleteCompanyUser(String companyCode, Long mbrshSq, String userId) throws Exception;

    /** 부서 상세 조회 */
    CmmnDeptManageDTO selectDeptDetail(String companyCode, String deptCd, String languageCode) throws Exception;

    /** 부서 등록 */
    void insertDept(String companyCode, Map<String, Object> dept, String creationId) throws Exception;

    /** 부서 수정 */
    void updateDept(String companyCode, String deptCd, Map<String, Object> dept, String updateId) throws Exception;

    /** 부서 삭제(비활성 처리) */
    void deleteDept(String companyCode, String deptCd, String updateId) throws Exception;

    /** 부서 사용자 리스트 */
    List<CmmnGroupUserDTO> selectDeptUserList(String companyCode, String deptCd, String searchKeyword, String languageCode) throws Exception;

    /** 부서 사용자 삭제 (DEPT_CD = NULL) */
    void deleteDeptUser(Long mbrshSq, String updateId) throws Exception;

    /**
     * 부서 사용자 추가.
     * mbrshSq 가 있으면 해당 구성원 행만 DEPT_CD 갱신. 없으면 USER_ID+회사로 조회 후 기존 INSERT/UPDATE.
     */
    void saveDeptUser(String companyCode, String userId, Long mbrshSq, Map<String, Object> companyInfo, String creationId, String updateId) throws Exception;

    /** 사용자 검색 (팝업) */
    List<CmmnGroupUserDTO> selectUserSearchList(String companyCode, String searchKeyword, String languageCode) throws Exception;
}
