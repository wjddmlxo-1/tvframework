package tvframework.sym.usr.service.impl;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tvframework.com.cmm.idgnr.IdGnrService;
import tvframework.com.cmm.pagination.PaginationInfo;
import tvframework.sym.grp.dto.CmmnGroupUserDTO;
import tvframework.sym.usr.dto.CmmnDeptManageDTO;
import tvframework.sym.usr.dto.CmmnUserCompanyInfoDTO;
import tvframework.sym.usr.dto.CmmnUserDTO;
import tvframework.sym.usr.dto.CmmnUserManageListDTO;
import tvframework.sym.usr.dto.CodeOptionItemDTO;
import tvframework.sym.usr.service.CmmnUserManageService;
import tvframework.let.utl.sim.service.FileScrty;

/**
 * 사용자관리(화면설계서) 서비스 구현
 */
@Service
public class CmmnUserManageServiceImpl implements CmmnUserManageService {

    private final CmmnUserManageMapper cmmnUserManageMapper;
    private final IdGnrService egovUserOrgnztMbrshIdGnrService;

    public CmmnUserManageServiceImpl(CmmnUserManageMapper cmmnUserManageMapper,
            @Qualifier("egovUserOrgnztMbrshIdGnrService") IdGnrService egovUserOrgnztMbrshIdGnrService) {
        this.cmmnUserManageMapper = cmmnUserManageMapper;
        this.egovUserOrgnztMbrshIdGnrService = egovUserOrgnztMbrshIdGnrService;
    }

    @Override
    public Map<String, Object> selectCompanyUserList(String companyCode, String searchKeyword, String languageCode,
            Integer pageIndex, Integer recordCountPerPage) throws Exception {
        int offset = ((pageIndex != null ? pageIndex : 1) - 1) * (recordCountPerPage != null ? recordCountPerPage : 15);
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        params.put("recordCountPerPage", recordCountPerPage != null ? recordCountPerPage : 15);
        params.put("offset", offset);

        List<CmmnUserManageListDTO> list = cmmnUserManageMapper.selectCompanyUserList(params);

        PaginationInfo paginationInfo = new PaginationInfo();
        paginationInfo.setCurrentPageNo(pageIndex != null ? pageIndex : 1);
        paginationInfo.setRecordCountPerPage(recordCountPerPage != null ? recordCountPerPage : 15);
        paginationInfo.setPageSize(10);
        paginationInfo.setTotalRecordCount(list.size());

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("paginationInfo", paginationInfo);
        return result;
    }

    @Override
    public Map<String, Object> selectUserDetail(String userId, String companyCode, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("companyCode", companyCode);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");

        CmmnUserDTO user = cmmnUserManageMapper.selectUserByUserId(params);
        List<CmmnUserCompanyInfoDTO> companyInfoList = cmmnUserManageMapper.selectUserCompanyInfoList(params);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("companyInfoList", companyInfoList != null ? companyInfoList : List.of());
        result.put("companyInfo", (companyInfoList != null && !companyInfoList.isEmpty()) ? companyInfoList.get(0) : null);
        return result;
    }

    @Override
    public Map<String, Object> selectMyProfile(String userId, String preferredCompanyCode, String languageCode) throws Exception {
        String lang = languageCode != null ? languageCode : "ko_KR";
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        params.put("languageCode", lang);

        CmmnUserDTO user = cmmnUserManageMapper.selectUserByUserId(params);
        List<CmmnUserCompanyInfoDTO> companyInfoList = cmmnUserManageMapper.selectUserCompanyInfoAllByUserId(params);
        if (companyInfoList == null) {
            companyInfoList = List.of();
        }

        final String effectiveCompany;
        if (companyInfoList.isEmpty()) {
            effectiveCompany = null;
        } else {
            String pref = preferredCompanyCode != null ? preferredCompanyCode.trim() : "";
            if (!pref.isEmpty() && companyInfoList.stream().anyMatch(c -> pref.equals(c.getCompanyCode()))) {
                effectiveCompany = pref;
            } else {
                effectiveCompany = companyInfoList.get(0).getCompanyCode();
            }
        }

        CmmnUserCompanyInfoDTO companyInfo = companyInfoList.stream()
                .filter(c -> effectiveCompany != null && effectiveCompany.equals(c.getCompanyCode()))
                .findFirst()
                .orElse(companyInfoList.isEmpty() ? null : companyInfoList.get(0));

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("companyInfoList", companyInfoList);
        result.put("companyInfo", companyInfo);
        result.put("profileCompanyCode", effectiveCompany);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveMyProfile(String loginUserId, Map<String, Object> userBasic, List<Map<String, Object>> companyInfoList,
            String updateId, String creationId) throws Exception {
        userBasic.put("userId", loginUserId);
        userBasic.put("updateId", updateId);
        Object brthdy = userBasic.get("brthdy");
        if (brthdy != null && String.valueOf(brthdy).isBlank()) {
            userBasic.put("brthdy", null);
        }
        String password = (String) userBasic.get("password");
        if (password != null && !password.isEmpty()) {
            userBasic.put("password", FileScrty.encryptPassword(password, loginUserId));
            cmmnUserManageMapper.updateUserPassword(userBasic);
        }
        cmmnUserManageMapper.updateUser(userBasic);

        if (companyInfoList == null || companyInfoList.isEmpty()) {
            return;
        }
        for (Map<String, Object> row : companyInfoList) {
            Object mbrshObj = row.get("mbrshSq");
            if (mbrshObj == null) {
                continue;
            }
            long mbrshSq = mbrshObj instanceof Number ? ((Number) mbrshObj).longValue() : Long.parseLong(String.valueOf(mbrshObj).trim());
            Map<String, Object> verify = new HashMap<>();
            verify.put("mbrshSq", mbrshSq);
            verify.put("userId", loginUserId);
            if (cmmnUserManageMapper.countMbrshByUserAndSq(verify) < 1) {
                continue;
            }
            Map<String, Object> dbRow = cmmnUserManageMapper.selectUserOrgnztMbrshByMbrshSq(verify);
            if (dbRow == null || dbRow.isEmpty()) {
                continue;
            }
            String nDept = strOrNull(emptyToNull(row.get("deptCd")));
            String nEmpl = strOrNull(emptyToNull(row.get("emplNo")));
            String nOffm = strOrNull(emptyToNull(row.get("offmTelno")));
            String nEmail = strOrNull(emptyToNull(row.get("emailAdres")));
            String nOfcps = strOrNull(emptyToNull(row.get("ofcpsCd")));
            String nEcny = normYmd8(emptyToNull(row.get("ecnyYmd")));
            String nRet = normYmd8(emptyToNull(row.get("retireYmd")));

            String oDept = strOrNull(dbRow.get("deptCd"));
            String oEmpl = strOrNull(dbRow.get("emplNo"));
            String oOffm = strOrNull(dbRow.get("offmTelno"));
            String oEmail = strOrNull(dbRow.get("emailAdres"));
            String oOfcps = strOrNull(dbRow.get("ofcpsCd"));
            String oEcny = normYmd8(dbRow.get("ecnyYmd"));
            String oRet = normYmd8(dbRow.get("retireYmd"));

            Map<String, Object> patch = new HashMap<>();
            patch.put("mbrshSq", mbrshSq);
            patch.put("userId", loginUserId);
            patch.put("updateId", updateId);
            boolean dirty = false;
            if (!Objects.equals(nDept, oDept)) {
                patch.put("setDeptCd", Boolean.TRUE);
                patch.put("deptCd", nDept);
                dirty = true;
            }
            if (!Objects.equals(nEmpl, oEmpl)) {
                patch.put("setEmplNo", Boolean.TRUE);
                patch.put("emplNo", nEmpl);
                dirty = true;
            }
            if (!Objects.equals(nOffm, oOffm)) {
                patch.put("setOffmTelno", Boolean.TRUE);
                patch.put("offmTelno", nOffm);
                dirty = true;
            }
            if (!Objects.equals(nEmail, oEmail)) {
                patch.put("setEmailAdres", Boolean.TRUE);
                patch.put("emailAdres", nEmail);
                dirty = true;
            }
            if (!Objects.equals(nOfcps, oOfcps)) {
                patch.put("setOfcpsCd", Boolean.TRUE);
                patch.put("ofcpsCd", nOfcps);
                dirty = true;
            }
            if (!Objects.equals(nEcny, oEcny)) {
                patch.put("setEcnyYmd", Boolean.TRUE);
                patch.put("ecnyYmd", nEcny);
                dirty = true;
            }
            if (!Objects.equals(nRet, oRet)) {
                patch.put("setRetireYmd", Boolean.TRUE);
                patch.put("retireYmd", nRet);
                dirty = true;
            }
            if (dirty) {
                cmmnUserManageMapper.updateUserOrgnztMbrshPartial(patch);
            }
        }
    }

    private static Object emptyToNull(Object v) {
        if (v == null) {
            return null;
        }
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    private static String strOrNull(Object o) {
        if (o == null) {
            return null;
        }
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }

    /** DB/화면 값을 YYYYMMDD 또는 null 로 통일 */
    private static String normYmd8(Object o) {
        if (o == null) {
            return null;
        }
        if (o instanceof BigDecimal) {
            return normYmd8(((BigDecimal) o).toPlainString());
        }
        if (o instanceof Number) {
            long v = ((Number) o).longValue();
            String s = String.valueOf(v);
            return s.length() == 8 && s.matches("\\d{8}") ? s : null;
        }
        String s = String.valueOf(o).trim();
        if (s.isEmpty()) {
            return null;
        }
        if (s.matches("\\d{8}")) {
            return s;
        }
        String digits = s.replaceAll("\\D", "");
        if (digits.length() >= 8) {
            return digits.substring(0, 8);
        }
        return null;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void withdrawMyUser(String userId, String updateId) throws Exception {
        Map<String, Object> p = new HashMap<>();
        p.put("userId", userId);
        p.put("sbscrSttus", "D");
        p.put("updateId", updateId != null && !updateId.isBlank() ? updateId : userId);
        cmmnUserManageMapper.updateUserSbscrSttus(p);
    }

    @Override
    public List<CodeOptionItemDTO> selectCodeOption(String codeId, String companyCode, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("companyCode", companyCode);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnUserManageMapper.selectCodeOptionByCodeId(params);
    }

    @Override
    public String checkDuplicateUserId(String userId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("userId", userId);
        String r = cmmnUserManageMapper.checkDuplicateUserId(params);
        return r != null ? r : "O";
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveUserRegistration(String companyCode, Map<String, Object> userBasic, Map<String, Object> companyInfo,
            String creationId) throws Exception {
        if (userBasic == null) {
            throw new IllegalArgumentException("사용자 기본정보(userBasic)가 없습니다.");
        }
        String userId = (String) userBasic.get("userId");
        String password = (String) userBasic.get("password");
        // CM_USER.USER_TYPE NOT NULL: 화면에서 누락되면 기본 USER로 보정
        String userType = Objects.toString(userBasic.get("userType"), "").trim();
        userBasic.put("userType", userType.isEmpty() ? "USER" : userType);
        // CM_USER.SBSCRB_STTUS 기본값과 동일하게 보정
        String sbscrbSttus = Objects.toString(userBasic.get("sbscrbSttus"), "").trim();
        userBasic.put("sbscrbSttus", sbscrbSttus.isEmpty() ? "P" : sbscrbSttus);
        if (password != null && !password.isEmpty()) {
            userBasic.put("password", FileScrty.encryptPassword(password, userId));
        }
        userBasic.put("creationId", creationId);
        cmmnUserManageMapper.insertUser(userBasic);

        long mbrshSq = egovUserOrgnztMbrshIdGnrService.getNextLongId();
        Map<String, Object> mbrsh = new HashMap<>();
        mbrsh.put("mbrshSq", mbrshSq);
        mbrsh.put("userId", userId);
        mbrsh.put("companyCode", companyCode);
        mbrsh.put("deptCd", companyInfo != null ? companyInfo.get("deptCd") : null);
        mbrsh.put("emplNo", companyInfo != null ? companyInfo.get("emplNo") : null);
        mbrsh.put("offmTelno", companyInfo != null ? companyInfo.get("offmTelno") : null);
        mbrsh.put("emailAdres", companyInfo != null ? companyInfo.get("emailAdres") : null);
        mbrsh.put("ofcpsCd", companyInfo != null ? companyInfo.get("ofcpsCd") : null);
        mbrsh.put("ecnyYmd", companyInfo != null ? companyInfo.get("ecnyYmd") : null);
        mbrsh.put("retireYmd", companyInfo != null ? companyInfo.get("retireYmd") : null);
        mbrsh.put("creationId", creationId);
        cmmnUserManageMapper.insertUserOrgnztMbrsh(mbrsh);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveUserDetail(String companyCode, String userId, Map<String, Object> userBasic, Map<String, Object> companyInfo,
            String updateId, String creationId) throws Exception {
        userBasic.put("userId", userId);
        userBasic.put("updateId", updateId);
        String password = (String) userBasic.get("password");
        if (password != null && !password.isEmpty()) {
            userBasic.put("password", FileScrty.encryptPassword(password, userId));
            cmmnUserManageMapper.updateUserPassword(userBasic);
        }
        cmmnUserManageMapper.updateUser(userBasic);

        if (companyCode == null || companyCode.isBlank()) {
            return;
        }

        Long mbrshSq = cmmnUserManageMapper.selectMbrshSqByUserAndCompany(Map.of("userId", userId, "companyCode", companyCode));
        if (mbrshSq != null) {
            Map<String, Object> mbrsh = new HashMap<>();
            mbrsh.put("mbrshSq", mbrshSq);
            mbrsh.put("deptCd", companyInfo != null ? companyInfo.get("deptCd") : null);
            mbrsh.put("emplNo", companyInfo != null ? companyInfo.get("emplNo") : null);
            mbrsh.put("offmTelno", companyInfo != null ? companyInfo.get("offmTelno") : null);
            mbrsh.put("emailAdres", companyInfo != null ? companyInfo.get("emailAdres") : null);
            mbrsh.put("ofcpsCd", companyInfo != null ? companyInfo.get("ofcpsCd") : null);
            mbrsh.put("ecnyYmd", companyInfo != null ? companyInfo.get("ecnyYmd") : null);
            mbrsh.put("retireYmd", companyInfo != null ? companyInfo.get("retireYmd") : null);
            mbrsh.put("updateId", updateId);
            cmmnUserManageMapper.updateUserOrgnztMbrsh(mbrsh);
        } else {
            long newMbrshSq = egovUserOrgnztMbrshIdGnrService.getNextLongId();
            Map<String, Object> mbrsh = new HashMap<>();
            mbrsh.put("mbrshSq", newMbrshSq);
            mbrsh.put("userId", userId);
            mbrsh.put("companyCode", companyCode);
            mbrsh.put("deptCd", companyInfo != null ? companyInfo.get("deptCd") : null);
            mbrsh.put("emplNo", companyInfo != null ? companyInfo.get("emplNo") : null);
            mbrsh.put("offmTelno", companyInfo != null ? companyInfo.get("offmTelno") : null);
            mbrsh.put("emailAdres", companyInfo != null ? companyInfo.get("emailAdres") : null);
            mbrsh.put("ofcpsCd", companyInfo != null ? companyInfo.get("ofcpsCd") : null);
            mbrsh.put("ecnyYmd", companyInfo != null ? companyInfo.get("ecnyYmd") : null);
            mbrsh.put("retireYmd", companyInfo != null ? companyInfo.get("retireYmd") : null);
            mbrsh.put("creationId", creationId);
            cmmnUserManageMapper.insertUserOrgnztMbrsh(mbrsh);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCompanyUser(String companyCode, Long mbrshSq, String userId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("mbrshSq", mbrshSq);
        params.put("userId", userId);
        cmmnUserManageMapper.deleteGroupUserByMbrshSq(params);
        cmmnUserManageMapper.deleteUserOrgnztMbrshByMbrshSq(params);
        cmmnUserManageMapper.deleteUser(params);
    }

    @Override
    public CmmnDeptManageDTO selectDeptDetail(String companyCode, String deptCd, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("deptCd", deptCd);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnUserManageMapper.selectDeptDetail(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertDept(String companyCode, Map<String, Object> dept, String creationId) throws Exception {
        String deptCd = dept != null ? String.valueOf(dept.getOrDefault("deptCd", "")).trim() : "";
        if (companyCode == null || companyCode.isBlank()) {
            throw new IllegalArgumentException("회사 코드를 선택하세요.");
        }
        if (deptCd.isBlank()) {
            throw new IllegalArgumentException("부서 코드를 입력하세요.");
        }
        Map<String, Object> check = new HashMap<>();
        check.put("companyCode", companyCode);
        check.put("deptCd", deptCd);
        if (cmmnUserManageMapper.countDeptByCode(check) > 0) {
            throw new IllegalArgumentException("이미 등록된 부서 코드입니다. 다른 부서 코드를 입력하세요.");
        }

        dept.put("companyCode", companyCode);
        dept.put("deptCd", deptCd);
        dept.put("creationId", creationId);
        cmmnUserManageMapper.insertDept(dept);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateDept(String companyCode, String deptCd, Map<String, Object> dept, String updateId) throws Exception {
        dept.put("companyCode", companyCode);
        dept.put("deptCd", deptCd);
        dept.put("updateId", updateId);
        cmmnUserManageMapper.updateDept(dept);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteDept(String companyCode, String deptCd, String updateId) throws Exception {
        if (companyCode == null || companyCode.isBlank()) {
            throw new IllegalArgumentException("회사 코드가 없습니다.");
        }
        if (deptCd == null || deptCd.isBlank() || Objects.equals(deptCd, "#")) {
            throw new IllegalArgumentException("삭제할 부서를 선택하세요.");
        }

        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("deptCd", deptCd);

        int childCnt = cmmnUserManageMapper.countDeptChildren(params);
        if (childCnt > 0) {
            throw new IllegalArgumentException("하위 부서가 존재하여 삭제할 수 없습니다. 하위 부서를 먼저 삭제(또는 비활성)하세요.");
        }
        int userCnt = cmmnUserManageMapper.countDeptUsers(params);
        if (userCnt > 0) {
            throw new IllegalArgumentException("해당 부서에 소속 사용자가 있어 삭제할 수 없습니다. 먼저 부서 사용자에서 제거하세요.");
        }

        params.put("updateId", updateId != null ? updateId : "admin");
        cmmnUserManageMapper.deactivateDept(params);
    }

    @Override
    public List<CmmnGroupUserDTO> selectDeptUserList(String companyCode, String deptCd, String searchKeyword, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("deptCd", deptCd);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnUserManageMapper.selectDeptUserList(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteDeptUser(Long mbrshSq, String updateId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("mbrshSq", mbrshSq);
        params.put("updateId", updateId);
        cmmnUserManageMapper.updateUserOrgnztMbrshDeptNull(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveDeptUser(String companyCode, String userId, Long mbrshSq, Map<String, Object> companyInfo, String creationId, String updateId) throws Exception {
        String deptCd = companyInfo != null ? (String) companyInfo.get("deptCd") : null;
        if (mbrshSq != null && userId != null && !userId.isBlank()) {
            Map<String, Object> assign = new HashMap<>();
            assign.put("mbrshSq", mbrshSq);
            assign.put("companyCode", companyCode);
            assign.put("userId", userId);
            assign.put("deptCd", deptCd);
            assign.put("updateId", updateId);
            int n = cmmnUserManageMapper.updateUserOrgnztMbrshDeptCdByKey(assign);
            if (n == 1) {
                return;
            }
            throw new IllegalArgumentException("부서 배정 대상 구성원(MBRSH_SQ)을 찾을 수 없거나 USER_ID/회사와 일치하지 않습니다.");
        }
        Long existingSq = cmmnUserManageMapper.selectMbrshSqByUserAndCompany(Map.of("userId", userId, "companyCode", companyCode));
        if (existingSq != null) {
            Map<String, Object> mbrsh = new HashMap<>();
            mbrsh.put("mbrshSq", existingSq);
            mbrsh.put("deptCd", deptCd);
            mbrsh.put("emplNo", companyInfo != null ? companyInfo.get("emplNo") : null);
            mbrsh.put("offmTelno", companyInfo != null ? companyInfo.get("offmTelno") : null);
            mbrsh.put("emailAdres", companyInfo != null ? companyInfo.get("emailAdres") : null);
            mbrsh.put("ofcpsCd", companyInfo != null ? companyInfo.get("ofcpsCd") : null);
            mbrsh.put("ecnyYmd", companyInfo != null ? companyInfo.get("ecnyYmd") : null);
            mbrsh.put("retireYmd", companyInfo != null ? companyInfo.get("retireYmd") : null);
            mbrsh.put("updateId", updateId);
            cmmnUserManageMapper.updateUserOrgnztMbrsh(mbrsh);
        } else {
            long newMbrshSq = egovUserOrgnztMbrshIdGnrService.getNextLongId();
            Map<String, Object> mbrsh = new HashMap<>();
            mbrsh.put("mbrshSq", newMbrshSq);
            mbrsh.put("userId", userId);
            mbrsh.put("companyCode", companyCode);
            mbrsh.put("deptCd", deptCd);
            mbrsh.put("emplNo", companyInfo != null ? companyInfo.get("emplNo") : null);
            mbrsh.put("offmTelno", companyInfo != null ? companyInfo.get("offmTelno") : null);
            mbrsh.put("emailAdres", companyInfo != null ? companyInfo.get("emailAdres") : null);
            mbrsh.put("ofcpsCd", companyInfo != null ? companyInfo.get("ofcpsCd") : null);
            mbrsh.put("ecnyYmd", companyInfo != null ? companyInfo.get("ecnyYmd") : null);
            mbrsh.put("retireYmd", companyInfo != null ? companyInfo.get("retireYmd") : null);
            mbrsh.put("creationId", creationId);
            cmmnUserManageMapper.insertUserOrgnztMbrsh(mbrsh);
        }
    }

    @Override
    public List<CmmnGroupUserDTO> selectUserSearchList(String companyCode, String searchKeyword, String languageCode) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", companyCode);
        params.put("searchKeyword", searchKeyword);
        params.put("languageCode", languageCode != null ? languageCode : "ko_KR");
        return cmmnUserManageMapper.selectUserSearchList(params);
    }
}
