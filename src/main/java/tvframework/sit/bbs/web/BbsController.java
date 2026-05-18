package tvframework.sit.bbs.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.sit.bbs.dto.BbsCodeDetailOptionDTO;
import tvframework.sit.bbs.dto.BbsCommentPendingDTO;
import tvframework.sit.bbs.dto.BbsDTO;
import tvframework.sit.bbs.dto.BbsNttTrashDTO;
import tvframework.sit.bbs.dto.BbsPopupNoticeDTO;
import tvframework.sit.bbs.dto.BbsPopupPreviewActionDTO;
import tvframework.sit.bbs.dto.BbsPopupPreviewDTO;
import tvframework.sit.bbs.dto.BbsPopupSettingDTO;
import tvframework.sit.bbs.dto.BbsSortRequestDTO;
import tvframework.sit.bbs.service.BbsService;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 사이트 게시판 관리 REST API
 */
@RestController
@RequestMapping("/bbs")
@RequiredArgsConstructor
@Tag(name = "BbsController", description = "사이트 게시판 관리")
public class BbsController {

    private final BbsService bbsService;

    @Operation(summary = "게시판유형 공통코드 (회사별 CM_CODE_DETAIL + 다국어, CODE_ID=CMMNCODE.BBS.001)")
    @GetMapping("/bbsTypes")
    public IntermediateResultVO<List<CodeOptionDTO>> bbsTypes(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @Parameter(name = "langCode", in = ParameterIn.QUERY) @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectBbsTypeOptions(cmpnyCd, langCode));
    }

    @Operation(summary = "레이아웃유형 공통코드 (회사별 CM_CODE_DETAIL + 다국어, CODE_ID=CMMNCODE.BBS.003)")
    @GetMapping("/layoutTypes")
    public IntermediateResultVO<List<CodeOptionDTO>> layoutTypes(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectLayoutTypeOptions(cmpnyCd, langCode));
    }

    @Operation(summary = "게시판유형별 기능 활성화 공통코드 (CODE_ID=게시판유형코드, 회사별)")
    @GetMapping("/featureCodeOptions")
    public IntermediateResultVO<List<BbsCodeDetailOptionDTO>> featureCodeOptions(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("bbsTyCodeId") String bbsTyCodeId,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectBbsFeatureCodeOptions(cmpnyCd, bbsTyCodeId, langCode));
    }

    @Operation(summary = "게시판 목록")
    @GetMapping("/list")
    public IntermediateResultVO<List<BbsDTO>> list(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "bbsTy", required = false) String bbsTy,
        @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectBbsList(cmpnyCd, bbsTy, searchKeyword, langCode));
    }

    @Operation(summary = "게시판 상세")
    @GetMapping("/detail")
    public IntermediateResultVO<BbsDTO> detail(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectBbsDetail(bbsId, cmpnyCd, langCode));
    }

    @Operation(summary = "신규 게시판 ID 채번")
    @GetMapping("/nextBbsId")
    public IntermediateResultVO<Map<String, String>> nextBbsId() throws Exception {
        Map<String, String> m = new HashMap<>();
        m.put("bbsId", bbsService.selectNextBbsId());
        return IntermediateResultVO.success(m);
    }

    @Operation(summary = "등록")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "900", description = "입력값/중복 오류")
    })
    @PostMapping
    public IntermediateResultVO<Object> insert(
        @RequestBody BbsDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            bbsService.insertBbs(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        } catch (DuplicateKeyException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage("동일한 게시판 ID가 이미 존재합니다. 다른 ID를 사용하세요.");
            Map<String, Object> focus = new HashMap<>();
            focus.put("duplicateKey", "BBS_ID");
            vo.setResult(focus);
            return vo;
        }
    }

    @Operation(summary = "수정")
    @PutMapping
    public IntermediateResultVO<Object> update(
        @RequestBody BbsDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            bbsService.updateBbs(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "삭제")
    @DeleteMapping
    public IntermediateResultVO<Object> delete(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            bbsService.deleteBbs(bbsId, cmpnyCd, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "목록 정렬순서 저장")
    @PutMapping("/sortOrder")
    public IntermediateResultVO<Object> sortOrder(
        @RequestBody BbsSortRequestDTO req,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            bbsService.updateBbsSortOrder(req, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "휴지통 목록")
    @GetMapping("/trash/list")
    public IntermediateResultVO<List<BbsNttTrashDTO>> trashList(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectTrashList(bbsId, cmpnyCd));
    }

    @Operation(summary = "휴지통 복원")
    @PutMapping("/trash/restore")
    public IntermediateResultVO<Void> trashRestore(
        @RequestParam("nttSq") String nttSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.restoreTrashNtt(nttSq, bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "휴지통 완전삭제")
    @PutMapping("/trash/purge")
    public IntermediateResultVO<Void> trashPurge(
        @RequestParam("nttSq") String nttSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.purgeTrashNtt(nttSq, bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "휴지통 전체 복원")
    @PutMapping("/trash/restoreAll")
    public IntermediateResultVO<Void> trashRestoreAll(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.restoreAllTrash(bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "휴지통 전체 삭제")
    @PutMapping("/trash/purgeAll")
    public IntermediateResultVO<Void> trashPurgeAll(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.purgeAllTrash(bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "승인 대기 댓글 목록")
    @GetMapping("/comments/pending")
    public IntermediateResultVO<List<BbsCommentPendingDTO>> pendingComments(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectPendingComments(bbsId, cmpnyCd));
    }

    @Operation(summary = "댓글 승인")
    @PutMapping("/comments/approve")
    public IntermediateResultVO<Void> approveComment(
        @RequestParam("commentSq") String commentSq,
        @RequestParam("nttSq") String nttSq,
        @RequestParam("mbrshSq") String mbrshSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.approveComment(commentSq, nttSq, mbrshSq, bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "댓글 거절")
    @PutMapping("/comments/reject")
    public IntermediateResultVO<Void> rejectComment(
        @RequestParam("commentSq") String commentSq,
        @RequestParam("nttSq") String nttSq,
        @RequestParam("mbrshSq") String mbrshSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.rejectComment(commentSq, nttSq, mbrshSq, bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "댓글 전체 승인")
    @PutMapping("/comments/approveAll")
    public IntermediateResultVO<Void> approveAllComments(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.approveAllComments(bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "댓글 전체 거절")
    @PutMapping("/comments/rejectAll")
    public IntermediateResultVO<Void> rejectAllComments(
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsService.rejectAllComments(bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "팝업공지 내역")
    @GetMapping("/popup/list")
    public IntermediateResultVO<List<BbsPopupNoticeDTO>> popupNoticeList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectPopupNoticeList(cmpnyCd, langCode));
    }

    @Operation(summary = "팝업공지 설정 조회")
    @GetMapping("/popup/setting")
    public IntermediateResultVO<BbsPopupSettingDTO> popupSetting(
        @RequestParam("popupSq") String popupSq,
        @RequestParam("nttSq") String nttSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd
    ) throws Exception {
        return IntermediateResultVO.success(bbsService.selectPopupSetting(popupSq, nttSq, bbsId, cmpnyCd));
    }

    @Operation(summary = "팝업공지 설정 수정")
    @PutMapping("/popup/setting")
    public IntermediateResultVO<Object> popupSettingUpdate(
        @RequestBody BbsPopupSettingDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            bbsService.updatePopupSetting(dto, loginVO != null ? loginVO.getId() : null);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "팝업공지 삭제")
    @DeleteMapping("/popup")
    public IntermediateResultVO<Object> popupDelete(
        @RequestParam("popupSq") String popupSq,
        @RequestParam("nttSq") String nttSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            bbsService.deletePopupNotice(popupSq, nttSq, bbsId, cmpnyCd, loginVO != null ? loginVO.getId() : null);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "팝업공지 미리보기 상세 조회")
    @GetMapping("/popup/preview")
    public IntermediateResultVO<BbsPopupPreviewDTO> popupPreview(
        @RequestParam("popupSq") String popupSq,
        @RequestParam("nttSq") String nttSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        return IntermediateResultVO.success(
            bbsService.selectPopupPreview(popupSq, nttSq, bbsId, cmpnyCd, langCode, loginVO != null ? loginVO.getId() : null)
        );
    }

    @Operation(summary = "팝업공지 읽기")
    @PutMapping("/popup/preview/read")
    public IntermediateResultVO<Object> popupPreviewRead(
        @RequestBody BbsPopupPreviewActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            bbsService.markPopupPreviewRead(dto.getNttSq(), dto.getBbsId(), dto.getCmpnyCd(), loginVO != null ? loginVO.getId() : null);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "팝업공지 추천/비추천 토글")
    @PutMapping("/popup/preview/vote")
    public IntermediateResultVO<Object> popupPreviewVote(
        @RequestBody BbsPopupPreviewActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            bbsService.togglePopupPreviewVote(
                dto.getNttSq(),
                dto.getBbsId(),
                dto.getCmpnyCd(),
                dto.getVoteGb(),
                loginVO != null ? loginVO.getId() : null
            );
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "팝업공지 즐겨찾기 토글")
    @PutMapping("/popup/preview/favorite")
    public IntermediateResultVO<Object> popupPreviewFavorite(
        @RequestBody BbsPopupPreviewActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            bbsService.togglePopupPreviewFavorite(dto.getNttSq(), dto.getBbsId(), dto.getCmpnyCd(), loginVO != null ? loginVO.getId() : null);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Object> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }
}
