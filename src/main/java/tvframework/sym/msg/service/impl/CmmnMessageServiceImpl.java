package tvframework.sym.msg.service.impl;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tvframework.sym.cmm.dto.CmmnCompanyOptionDTO;
import tvframework.sym.cmm.dto.CodeOptionDTO;
import tvframework.sym.msg.dto.CmmnMessageDeleteRequestDTO;
import tvframework.sym.msg.dto.CmmnMessageDetailResponseDTO;
import tvframework.sym.msg.dto.CmmnMessageListResponseDTO;
import tvframework.sym.msg.dto.CmmnMessageRequestDTO;
import tvframework.sym.msg.dto.CmmnMessageRequestDTO.MessageRequestItem;
import tvframework.sym.msg.dto.CmmnMessageTextRowDTO;
import tvframework.sym.msg.dto.MessageDetailDTO;
import tvframework.sym.msg.service.CmmnMessageService;
import lombok.RequiredArgsConstructor;

/**
 * 다국어 메시지 관리 서비스 구현 클래스
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnMessageService")
@RequiredArgsConstructor
public class CmmnMessageServiceImpl extends AbstractServiceImpl implements CmmnMessageService {

    private final CmmnMessageMapper cmmnMessageMapper;

    /**
     * 메시지 리스트 조회 (⑦)
     */
    @Override
    public CmmnMessageListResponseDTO selectMessageList(
        String langGb, String cmpnyCd, String category, String searchCondition,
        Integer pageIndex, Integer recordCountPerPage) throws Exception {

        Map<String, Object> params = new HashMap<>();
        params.put("langGb", langGb);
        params.put("cmpnyCd", cmpnyCd);
        params.put("category", category);
        params.put("searchCondition", searchCondition);
        params.put("pageIndex", pageIndex);
        params.put("recordCountPerPage", recordCountPerPage);
        params.put("offset", (pageIndex - 1) * recordCountPerPage);

        List<Map<String, Object>> list = cmmnMessageMapper.selectMessageList(params);
        Integer totalCount = cmmnMessageMapper.selectMessageListCount(params);

        CmmnMessageListResponseDTO response = new CmmnMessageListResponseDTO();
        response.setList(cmmnMessageMapper.convertToDTOList(list));

        tvframework.com.cmm.pagination.PaginationInfo paginationInfo = new tvframework.com.cmm.pagination.PaginationInfo();
        paginationInfo.setCurrentPageNo(pageIndex != null ? pageIndex : 1);
        paginationInfo.setRecordCountPerPage(recordCountPerPage != null ? recordCountPerPage : 10);
        paginationInfo.setPageSize(10);
        paginationInfo.setTotalRecordCount(totalCount);
        response.setPaginationInfo(paginationInfo);

        return response;
    }

    /**
     * 메시지 상세 조회
     */
    @Override
    public CmmnMessageDetailResponseDTO selectMessageDetail(String langKey, String langGb, String cmpnyCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("langKey", langKey);
        params.put("langGb", langGb);
        params.put("cmpnyCd", cmpnyCd);

        CmmnMessageDetailResponseDTO result = cmmnMessageMapper.selectMessageDetail(params);
        if (result != null) {
            List<MessageDetailDTO> messages = cmmnMessageMapper.selectMessageDetailMessages(params);
            result.setMessages(messages);
        }
        return result;
    }

    @Override
    public Map<String, String> selectMessageTextsByKeys(List<String> langKeys, String langCode, String cmpnyCd) throws Exception {
        if (langKeys == null || langKeys.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Object> params = new HashMap<>();
        params.put("langKeys", langKeys);
        params.put("langCode", langCode);
        params.put("cmpnyCd", cmpnyCd);
        List<CmmnMessageTextRowDTO> rows = cmmnMessageMapper.selectMessageTextsByKeys(params);
        Map<String, String> out = new LinkedHashMap<>();
        if (rows != null) {
            for (CmmnMessageTextRowDTO row : rows) {
                if (row == null || row.getLangKey() == null) {
                    continue;
                }
                String cn = row.getMessageCn();
                if (cn != null && !cn.trim().isEmpty()) {
                    out.put(row.getLangKey().trim(), cn.trim());
                }
            }
        }
        return out;
    }

    /**
     * 메시지 등록
     */
    @Override
    @Transactional
    public void insertMessage(CmmnMessageRequestDTO requestDTO) throws Exception {
        String creationId = "admin";
        try {
            Object principal = UserDetailsHelper.getAuthenticatedUser();
            if (principal instanceof LoginVO) {
                String id = ((LoginVO) principal).getId();
                if (id != null && !id.trim().isEmpty()) {
                    creationId = id.trim();
                }
            }
        } catch (Exception ignored) {
            // 인증 정보 없을 때 기본값 유지
        }
        final String creationIdFinal = creationId;
        for (MessageRequestItem item : requestDTO.getMessages()) {
            // 메시지 값을 입력하지 않은 항목은 레코드로 저장하지 않음
            String messageCn = item.getMessageCn();
            if (messageCn == null || messageCn.trim().isEmpty()) {
                continue;
            }
            Map<String, String> params = new HashMap<>();
            params.put("cmpnyCd", requestDTO.getCmpnyCd());
            params.put("langGb", requestDTO.getLangGb());
            params.put("langKey", requestDTO.getLangKey());
            params.put("langCode", item.getLangCode());
            params.put("messageCn", messageCn.trim());
            params.put("creationId", creationIdFinal);
            cmmnMessageMapper.insertMessage(params);
        }
    }

    /**
     * 메시지 수정
     */
    @Override
    @Transactional
    public void updateMessage(String langKey, CmmnMessageRequestDTO requestDTO) throws Exception {
        // 기존 메시지 삭제
        Map<String, String> deleteParams = new HashMap<>();
        deleteParams.put("cmpnyCd", requestDTO.getCmpnyCd());
        deleteParams.put("langGb", requestDTO.getLangGb());
        deleteParams.put("langKey", langKey);
        cmmnMessageMapper.deleteMessageByLangKey(deleteParams);

        // 새 메시지 등록
        insertMessage(requestDTO);
    }

    /**
     * 메시지 삭제 (⑥)
     */
    @Override
    @Transactional
    public void deleteMessage(CmmnMessageDeleteRequestDTO requestDTO) throws Exception {
        for (String langKey : requestDTO.getLangKeys()) {
            Map<String, String> params = new HashMap<>();
            params.put("cmpnyCd", requestDTO.getCmpnyCd());
            params.put("langGb", requestDTO.getLangGb());
            params.put("langKey", langKey);
            cmmnMessageMapper.deleteMessageByLangKey(params);
        }
    }

    /**
     * 언어 목록 조회 (회사코드 반영)
     */
    @Override
    public List<CodeOptionDTO> selectLanguages(String cmpnyCd, String langCode) throws Exception {
        if (cmpnyCd == null || cmpnyCd.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        String languageCode = (langCode != null && !langCode.isEmpty()) ? langCode : "ko_KR";
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", cmpnyCd);
        params.put("languageCode", languageCode);

        // 터미널 콘솔에 쿼리 id 및 인자 출력
        System.out.println("[다국어관리] 언어 목록 조회 쿼리: CmmnMessageMapper.selectLanguages");
        System.out.println("[다국어관리] 인자: companyCode=" + cmpnyCd + ", languageCode=" + languageCode);
        System.out.println("[다국어관리] SQL: SELECT A.DETAIL_CODE_ID AS code, B.MESSAGE_CN AS name FROM CM_CODE_DETAIL A INNER JOIN CM_MESSAGE_LANG B ON B.LANG_KEY = A.CODE_LANG_KEY AND B.CMPNY_CD = A.CMPNY_CD WHERE A.CODE_ID = 'CMMNCODE.100' AND A.USE_FL = 'Y' AND A.CMPNY_CD = #{companyCode} AND B.LANG_CODE = #{languageCode} ORDER BY A.SORTING_SQ ASC");

        return cmmnMessageMapper.selectLanguages(params);
    }

    /**
     * 구분 목록 조회 (회사코드 반영)
     */
    @Override
    public List<CodeOptionDTO> selectCategories(String cmpnyCd, String langCode) throws Exception {
        if (cmpnyCd == null || cmpnyCd.trim().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        Map<String, Object> params = new HashMap<>();
        params.put("companyCode", cmpnyCd);
        params.put("languageCode", (langCode != null && !langCode.isEmpty()) ? langCode : "ko_KR");
        return cmmnMessageMapper.selectCategories(params);
    }

    /**
     * 회사 목록 조회 (로그인 사용자 ADMIN 그룹 기준)
     */
    @Override
    public List<CmmnCompanyOptionDTO> selectCompanyList(String loginUserId) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("loginUserId", loginUserId);
        return cmmnMessageMapper.selectCompanyList(params);
    }

}

