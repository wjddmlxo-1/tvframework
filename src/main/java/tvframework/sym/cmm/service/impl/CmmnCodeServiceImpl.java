package tvframework.sym.cmm.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.sym.cmm.exception.CmmnCodeDuplicateKeyException;
import tvframework.com.cmm.service.AbstractServiceImpl;
import tvframework.com.cmm.util.UserDetailsHelper;
import tvframework.sym.cmm.dto.CodeDetailDTO;
import tvframework.sym.cmm.dto.CodeTreeDTO;
import tvframework.sym.cmm.dto.CmmnCodeRequestDTO;
import tvframework.sym.cmm.dto.CmmnCodeResponseDTO;
import tvframework.sym.cmm.service.CmmnCodeService;

/**
 * 공통코드 관리 서비스 구현 클래스
 * 
 * @author 공통 서비스 개발팀
 * @since 2025.01.01
 * @version 1.0
 */
@Service("cmmnCodeService")
@RequiredArgsConstructor
public class CmmnCodeServiceImpl extends AbstractServiceImpl implements CmmnCodeService {

    private final CmmnCodeMapper cmmnCodeMapper;

    /**
     * 코드 트리 조회
     */
    @Override
    public List<CodeTreeDTO> selectCodeTree(String langGb, String cmpnyCd) throws Exception {
        try {
            String langCodeParam = (langGb != null && !langGb.isEmpty()) ? langGb : "ko_KR";
            Map<String, String> params = new HashMap<>();
            params.put("langGb", langCodeParam);
            params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
            List<Map<String, Object>> treeList = cmmnCodeMapper.selectCodeTree(params);
            if (treeList == null) {
                return new ArrayList<>();
            }
            return buildTree(treeList);
        } catch (Exception e) {
            System.err.println("코드 트리 조회 중 오류 발생: langGb=" + langGb);
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 트리 구조로 변환
     */
    private List<CodeTreeDTO> buildTree(List<Map<String, Object>> flatList) {
        Map<String, CodeTreeDTO> nodeMap = new HashMap<>();
        List<CodeTreeDTO> rootNodes = new ArrayList<>();

        if (flatList == null || flatList.isEmpty()) {
            return rootNodes;
        }

        // 모든 노드를 맵에 저장
        for (Map<String, Object> item : flatList) {
            if (item == null || item.get("codeId") == null) {
                continue;
            }
            CodeTreeDTO node = new CodeTreeDTO();
            node.setCodeId((String) item.get("codeId"));
            node.setName((String) item.get("name"));
            node.setUpperCodeId((String) item.get("upperCodeId"));
            node.setUseFl((String) item.get("useFl"));
            node.setPath((String) item.get("path"));
            Object levelObj = item.get("level");
            if (levelObj != null) {
                if (levelObj instanceof Integer) {
                    node.setLevel((Integer) levelObj);
                } else if (levelObj instanceof Number) {
                    node.setLevel(((Number) levelObj).intValue());
                }
            }
            node.setChildren(new ArrayList<>());
            nodeMap.put(node.getCodeId(), node);
        }

        // 트리 구조 생성 (flatList 순서 유지 → 쿼리 ORDER BY PATH와 동일한 루트/형제 순서)
        for (Map<String, Object> item : flatList) {
            if (item == null || item.get("codeId") == null) continue;
            CodeTreeDTO node = nodeMap.get(item.get("codeId"));
            if (node == null) continue;
            if (node.getUpperCodeId() == null || "#".equals(node.getUpperCodeId())) {
                rootNodes.add(node);
            } else {
                CodeTreeDTO parent = nodeMap.get(node.getUpperCodeId());
                if (parent != null) parent.getChildren().add(node);
            }
        }

        return rootNodes;
    }

    /**
     * 코드 상세 조회
     */
    @Override
    public CmmnCodeResponseDTO selectCodeDetail(String codeId, String langGb, String cmpnyCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("langGb", langGb);
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        return cmmnCodeMapper.selectCodeDetail(params);
    }

    /**
     * 코드 리스트 조회
     */
    @Override
    public List<CodeDetailDTO> selectCodeDetailList(String codeId, String langGb, String cmpnyCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("langGb", langGb);
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        return cmmnCodeMapper.selectCodeDetailList(params);
    }

    /**
     * 상위 코드 정보 조회
     */
    @Override
    public CmmnCodeResponseDTO selectParentCode(String codeId, String langGb, String cmpnyCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("langGb", langGb);
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        return cmmnCodeMapper.selectParentCode(params);
    }

    /**
     * 코드 등록
     */
    @Override
    @Transactional
    public void insertCode(CmmnCodeRequestDTO requestDTO) throws Exception {
        String creationId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd());
        params.put("codeId", requestDTO.getCodeId());
        params.put("upperCodeId", requestDTO.getUpperCodeId());
        params.put("useFl", requestDTO.getUseFl());
        params.put("codeCn", requestDTO.getCodeCn());
        params.put("codeLangKey", requestDTO.getCodeLangKey());
        params.put("creationId", creationId);

        try {
            cmmnCodeMapper.insertCode(params);
        } catch (DataIntegrityViolationException e) {
            throw new CmmnCodeDuplicateKeyException(
                "동일한 코드(ID)가 이미 존재합니다. 다른 코드를 입력하세요.",
                "CODE_ID",
                null
            );
        } catch (Exception e) {
            if (isDuplicateKeyException(e)) {
                throw new CmmnCodeDuplicateKeyException(
                    "동일한 코드(ID)가 이미 존재합니다. 다른 코드를 입력하세요.",
                    "CODE_ID",
                    null
                );
            }
            throw e;
        }

        // 코드 리스트 삭제 후 재등록
        if (requestDTO.getCodeDetailList() != null && !requestDTO.getCodeDetailList().isEmpty()) {
            cmmnCodeMapper.deleteCodeDetail(params);
            int index = 0;
            for (CodeDetailDTO detail : requestDTO.getCodeDetailList()) {
                Map<String, Object> detailParams = new HashMap<>();
                detailParams.put("cmpnyCd", requestDTO.getCmpnyCd());
                detailParams.put("codeId", requestDTO.getCodeId());
                detailParams.put("detailCodeId", detail.getDetailCodeId());
                detailParams.put("detailCodeValue", detail.getDetailCodeValue());
                detailParams.put("codeLangKey", detail.getCodeLangKey());
                detailParams.put("sortingSq", detail.getSortingSq());
                detailParams.put("useFl", detail.getUseFl());
                detailParams.put("creationId", creationId);
                try {
                    cmmnCodeMapper.insertCodeDetail(detailParams);
                } catch (DataIntegrityViolationException e) {
                    throw new CmmnCodeDuplicateKeyException(
                        "코드리스트의 코드가 중복되었습니다. (" + (index + 1) + "번째 행) 다른 코드를 입력하세요.",
                        "DETAIL_CODE_ID",
                        index
                    );
                } catch (Exception e) {
                    if (isDuplicateKeyException(e)) {
                        throw new CmmnCodeDuplicateKeyException(
                            "코드리스트의 코드가 중복되었습니다. (" + (index + 1) + "번째 행) 다른 코드를 입력하세요.",
                            "DETAIL_CODE_ID",
                            index
                        );
                    }
                    throw e;
                }
                index++;
            }
        }
    }

    /**
     * 예외 또는 원인 체인에 PK/Unique 중복 오류가 포함되어 있는지 여부
     */
    private boolean isDuplicateKeyException(Throwable t) {
        for (Throwable x = t; x != null; x = x.getCause()) {
            String msg = x.getMessage();
            if (msg != null && (msg.contains("Duplicate entry") || msg.contains("PRIMARY") || msg.contains("unique constraint"))) {
                return true;
            }
        }
        return false;
    }

    /**
     * 코드 수정
     */
    @Override
    @Transactional
    public void updateCode(String codeId, CmmnCodeRequestDTO requestDTO) throws Exception {
        String updateId = resolveCreationId();
        Map<String, Object> params = new HashMap<>();
        params.put("cmpnyCd", requestDTO.getCmpnyCd());
        params.put("codeId", codeId);
        params.put("useFl", requestDTO.getUseFl());
        params.put("codeCn", requestDTO.getCodeCn());
        params.put("codeLangKey", requestDTO.getCodeLangKey());
        params.put("updateId", updateId);

        cmmnCodeMapper.updateCode(params);

        // 코드 리스트 삭제 후 재등록
        if (requestDTO.getCodeDetailList() != null) {
            cmmnCodeMapper.deleteCodeDetail(params);
            int index = 0;
            for (CodeDetailDTO detail : requestDTO.getCodeDetailList()) {
                Map<String, Object> detailParams = new HashMap<>();
                detailParams.put("cmpnyCd", requestDTO.getCmpnyCd());
                detailParams.put("codeId", codeId);
                detailParams.put("detailCodeId", detail.getDetailCodeId());
                detailParams.put("detailCodeValue", detail.getDetailCodeValue());
                detailParams.put("codeLangKey", detail.getCodeLangKey());
                detailParams.put("sortingSq", detail.getSortingSq());
                detailParams.put("useFl", detail.getUseFl());
                detailParams.put("creationId", updateId);
                try {
                    cmmnCodeMapper.insertCodeDetail(detailParams);
                } catch (DataIntegrityViolationException e) {
                    throw new CmmnCodeDuplicateKeyException(
                        "코드리스트의 코드가 중복되었습니다. (" + (index + 1) + "번째 행) 다른 코드를 입력하세요.",
                        "DETAIL_CODE_ID",
                        index
                    );
                } catch (Exception e) {
                    if (isDuplicateKeyException(e)) {
                        throw new CmmnCodeDuplicateKeyException(
                            "코드리스트의 코드가 중복되었습니다. (" + (index + 1) + "번째 행) 다른 코드를 입력하세요.",
                            "DETAIL_CODE_ID",
                            index
                        );
                    }
                    throw e;
                }
                index++;
            }
        }
    }

    /**
     * 코드 삭제
     */
    @Override
    @Transactional
    public void deleteCode(String codeId, String cmpnyCd) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");

        // 코드 리스트 삭제
        cmmnCodeMapper.deleteCodeDetail(params);
        // 코드 삭제
        cmmnCodeMapper.deleteCode(params);
    }

    /**
     * 하위 코드 존재 여부 확인
     */
    @Override
    public String checkChildren(String codeId, String cmpnyCd) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("codeId", codeId);
        params.put("cmpnyCd", cmpnyCd != null ? cmpnyCd : "");
        return cmmnCodeMapper.checkChildren(params);
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

