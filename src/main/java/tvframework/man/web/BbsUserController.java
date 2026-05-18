package tvframework.man.web;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import tvframework.com.cmm.LoginVO;
import tvframework.com.cmm.ResponseCode;
import tvframework.com.cmm.service.IntermediateResultVO;
import tvframework.man.dto.BbsUserBoardDTO;
import tvframework.man.dto.BbsUserCategoryDTO;
import tvframework.man.dto.BbsUserCommentDTO;
import tvframework.man.dto.BbsUserCommentSaveDTO;
import tvframework.man.dto.BbsUserFileBinaryDTO;
import tvframework.man.dto.BbsUserFileUploadDTO;
import tvframework.man.dto.BbsUserNttPageDTO;
import tvframework.man.dto.BbsUserPostActionDTO;
import tvframework.man.dto.BbsUserPostDetailDTO;
import tvframework.man.dto.BbsUserPopupNoticeDTO;
import tvframework.man.dto.BbsUserPopupPreviewDTO;
import tvframework.man.dto.BbsUserPopupSettingDTO;
import tvframework.man.dto.BbsUserPostSaveDTO;
import tvframework.man.dto.BbsUserPostFileBindDTO;
import tvframework.man.dto.BbsUserPostFileDTO;
import tvframework.man.service.BbsUserService;

@RestController
@RequestMapping("/bbs/main")
@RequiredArgsConstructor
@Tag(name = "BbsUserController", description = "사용자 게시판")
public class BbsUserController {

    private final BbsUserService bbsUserService;

    @Operation(summary = "접근 가능 게시판 목록(읽기 권한·건수)")
    @GetMapping("/boards")
    public IntermediateResultVO<List<BbsUserBoardDTO>> boards(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(bbsUserService.selectBoardsForUser(cmpnyCd, uid, langCode));
    }

    @Operation(summary = "게시판 카테고리 목록")
    @GetMapping("/categories")
    public IntermediateResultVO<List<BbsUserCategoryDTO>> categories(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("bbsId") String bbsId,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(bbsUserService.selectCategoriesForUser(cmpnyCd, uid, bbsId));
    }

    @Operation(summary = "게시글 목록(페이징, bbsId 미지정 시 접근 가능 게시판 전체)")
    @GetMapping("/posts")
    public IntermediateResultVO<BbsUserNttPageDTO> posts(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "bbsId", required = false) String bbsId,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @RequestParam(value = "pageIndex", required = false, defaultValue = "1") int pageIndex,
        @RequestParam(value = "pageSize", required = false, defaultValue = "20") int pageSize,
        @RequestParam(value = "sortAsc", required = false, defaultValue = "false") boolean sortAsc,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(
            bbsUserService.selectNttPage(cmpnyCd, uid, langCode, bbsId, pageIndex, pageSize, sortAsc));
    }

    @Operation(summary = "게시글 상세")
    @GetMapping("/post/detail")
    public IntermediateResultVO<BbsUserPostDetailDTO> postDetail(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("nttSq") String nttSq,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(bbsUserService.selectPostDetail(cmpnyCd, uid, langCode, bbsId, nttSq));
    }

    @Operation(summary = "사용자 게시글 등록")
    @PostMapping("/post")
    public IntermediateResultVO<String> postCreate(
        @RequestBody BbsUserPostSaveDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            return IntermediateResultVO.success(bbsUserService.createPost(dto, uid));
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<String> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 게시글 수정")
    @PutMapping("/post")
    public IntermediateResultVO<Void> postUpdate(
        @RequestBody BbsUserPostSaveDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            bbsUserService.updatePost(dto, uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 게시글 삭제(소프트)")
    @DeleteMapping("/post")
    public IntermediateResultVO<Void> postDelete(
        @RequestBody BbsUserPostActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            bbsUserService.deletePost(dto.getCmpnyCd(), dto.getBbsId(), dto.getNttSq(), uid);
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 게시글 첨부파일 업로드(CM_FILE)")
    @PostMapping(value = "/post/file/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IntermediateResultVO<BbsUserFileUploadDTO> postFileUpload(
        @RequestPart("file") MultipartFile file,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            return IntermediateResultVO.success(
                bbsUserService.savePostFileData(file != null ? file.getBytes() : null,
                    file != null ? file.getOriginalFilename() : null,
                    file != null ? file.getContentType() : null,
                    uid));
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<BbsUserFileUploadDTO> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 게시글 첨부파일 바이너리 조회")
    @GetMapping(value = "/post/file", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> postFile(@RequestParam("fileSq") String fileSq) throws Exception {
        BbsUserFileBinaryDTO bin = bbsUserService.loadPostFile(fileSq);
        if (bin == null || bin.getFileData() == null || bin.getFileData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        MediaType mt = MediaType.APPLICATION_OCTET_STREAM;
        if (StringUtils.hasText(bin.getMimeTy())) {
            try {
                mt = MediaType.parseMediaType(bin.getMimeTy());
            } catch (Exception ignored) {
                mt = MediaType.APPLICATION_OCTET_STREAM;
            }
        }
        return ResponseEntity.ok().contentType(mt).body(bin.getFileData());
    }

    @Operation(summary = "사용자 댓글 첨부 이미지 업로드(CM_FILE FILE_TY=BBS_CMT)")
    @PostMapping(value = "/comment/file/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IntermediateResultVO<BbsUserFileUploadDTO> commentFileUpload(
        @RequestPart("file") MultipartFile file,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            return IntermediateResultVO.success(
                bbsUserService.saveCommentFileData(file != null ? file.getBytes() : null,
                    file != null ? file.getOriginalFilename() : null,
                    file != null ? file.getContentType() : null,
                    uid));
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<BbsUserFileUploadDTO> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 댓글 첨부 이미지 바이너리 조회")
    @GetMapping(value = "/comment/file", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> commentFile(@RequestParam("fileSq") String fileSq) throws Exception {
        BbsUserFileBinaryDTO bin = bbsUserService.loadCommentFile(fileSq);
        if (bin == null || bin.getFileData() == null || bin.getFileData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        MediaType mt = MediaType.APPLICATION_OCTET_STREAM;
        if (StringUtils.hasText(bin.getMimeTy())) {
            try {
                mt = MediaType.parseMediaType(bin.getMimeTy());
            } catch (Exception ignored) {
                mt = MediaType.APPLICATION_OCTET_STREAM;
            }
        }
        return ResponseEntity.ok().contentType(mt).body(bin.getFileData());
    }

    @Operation(summary = "프로필 사진 업로드(CM_FILE FILE_TY=PROFILE)")
    @PostMapping(value = "/profile/file/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IntermediateResultVO<BbsUserFileUploadDTO> profileFileUpload(
        @RequestPart("file") MultipartFile file,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        try {
            String uid = loginVO != null ? loginVO.getId() : null;
            return IntermediateResultVO.success(
                bbsUserService.saveProfileFileData(file != null ? file.getBytes() : null,
                    file != null ? file.getOriginalFilename() : null,
                    file != null ? file.getContentType() : null,
                    uid));
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<BbsUserFileUploadDTO> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 프로필 이미지 바이너리 조회(CM_USER.FILE_SQ)")
    @GetMapping(value = "/profile/file", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> profileFile(@RequestParam("fileSq") String fileSq) throws Exception {
        BbsUserFileBinaryDTO bin = bbsUserService.loadProfileFile(fileSq);
        if (bin == null || bin.getFileData() == null || bin.getFileData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        MediaType mt = MediaType.APPLICATION_OCTET_STREAM;
        if (StringUtils.hasText(bin.getMimeTy())) {
            try {
                mt = MediaType.parseMediaType(bin.getMimeTy());
            } catch (Exception ignored) {
                mt = MediaType.APPLICATION_OCTET_STREAM;
            }
        }
        return ResponseEntity.ok().contentType(mt).body(bin.getFileData());
    }

    @Operation(summary = "사용자 게시글 첨부파일 게시글 바인딩")
    @PostMapping("/post/file/bind")
    public IntermediateResultVO<Void> bindPostFiles(
        @RequestBody BbsUserPostFileBindDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.bindPostFiles(dto, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "사용자 게시글 첨부파일 목록")
    @GetMapping("/post/files")
    public IntermediateResultVO<List<BbsUserPostFileDTO>> postFiles(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("nttSq") String nttSq,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        return IntermediateResultVO.success(
            bbsUserService.selectPostFiles(cmpnyCd, loginVO != null ? loginVO.getId() : null, bbsId, nttSq));
    }

    @Operation(summary = "게시글 읽음 처리(조회수 반영)")
    @PostMapping("/post/read")
    public IntermediateResultVO<Void> markRead(
        @RequestBody BbsUserPostActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.markPostRead(dto.getNttSq(), dto.getBbsId(), dto.getCmpnyCd(), loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "게시글 추천/비추천 토글")
    @PostMapping("/post/vote/toggle")
    public IntermediateResultVO<Void> toggleVote(
        @RequestBody BbsUserPostActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.togglePostVote(dto.getNttSq(), dto.getBbsId(), dto.getCmpnyCd(), dto.getVoteGb(),
            loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "게시글 즐겨찾기 토글")
    @PostMapping("/post/favorite/toggle")
    public IntermediateResultVO<Void> toggleFavorite(
        @RequestBody BbsUserPostActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.togglePostFavorite(dto.getNttSq(), dto.getBbsId(), dto.getCmpnyCd(),
            loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "댓글 목록")
    @GetMapping("/comments")
    public IntermediateResultVO<List<BbsUserCommentDTO>> comments(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("nttSq") String nttSq,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(bbsUserService.selectComments(cmpnyCd, uid, bbsId, nttSq));
    }

    @Operation(summary = "사용자 팝업 공지 목록(기간/사용설정 유효)")
    @GetMapping("/popup/list")
    public IntermediateResultVO<List<BbsUserPopupNoticeDTO>> popupNoticeList(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam(value = "bbsId", required = false) String bbsId,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(bbsUserService.selectPopupNoticeList(cmpnyCd, uid, langCode, bbsId));
    }

    @Operation(summary = "사용자 팝업 공지 상세 미리보기")
    @GetMapping("/popup/preview")
    public IntermediateResultVO<BbsUserPopupPreviewDTO> popupPreview(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("popupSq") String popupSq,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("nttSq") String nttSq,
        @RequestParam(value = "langCode", required = false, defaultValue = "ko_KR") String langCode,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        return IntermediateResultVO.success(bbsUserService.selectPopupPreview(cmpnyCd, uid, langCode, popupSq, bbsId, nttSq));
    }

    @Operation(summary = "사용자 팝업 설정 조회(관리 권한)")
    @GetMapping("/popup/setting")
    public IntermediateResultVO<BbsUserPopupSettingDTO> popupSetting(
        @RequestParam("cmpnyCd") String cmpnyCd,
        @RequestParam("bbsId") String bbsId,
        @RequestParam("nttSq") String nttSq,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            return IntermediateResultVO.success(bbsUserService.selectPopupSetting(cmpnyCd, uid, bbsId, nttSq));
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<BbsUserPopupSettingDTO> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 팝업 설정 저장(신규/수정, 관리 권한)")
    @PutMapping("/popup/setting")
    public IntermediateResultVO<BbsUserPopupSettingDTO> popupSettingUpdate(
        @RequestBody BbsUserPopupSettingDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            return IntermediateResultVO.success(bbsUserService.savePopupSetting(dto, uid));
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<BbsUserPopupSettingDTO> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "사용자 팝업 설정 삭제(관리 권한)")
    @DeleteMapping("/popup/setting")
    public IntermediateResultVO<Void> popupSettingDelete(
        @RequestBody BbsUserPostActionDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        String uid = loginVO != null ? loginVO.getId() : null;
        try {
            bbsUserService.deletePopupSetting(dto.getCmpnyCd(), uid, dto.getBbsId(), dto.getNttSq());
            return IntermediateResultVO.success(null);
        } catch (IllegalArgumentException e) {
            IntermediateResultVO<Void> vo = new IntermediateResultVO<>();
            vo.setResultCode(ResponseCode.INPUT_CHECK_ERROR.getCode());
            vo.setResultMessage(e.getMessage());
            return vo;
        }
    }

    @Operation(summary = "댓글 등록/대댓글 등록")
    @PostMapping("/comment")
    public IntermediateResultVO<Void> commentCreate(
        @RequestBody BbsUserCommentSaveDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.createComment(dto, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "댓글 수정")
    @PutMapping("/comment")
    public IntermediateResultVO<Void> commentUpdate(
        @RequestBody BbsUserCommentSaveDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.updateComment(dto, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }

    @Operation(summary = "댓글 삭제(소프트 삭제)")
    @DeleteMapping("/comment")
    public IntermediateResultVO<Void> commentDelete(
        @RequestBody BbsUserCommentSaveDTO dto,
        @AuthenticationPrincipal LoginVO loginVO
    ) throws Exception {
        bbsUserService.deleteComment(dto, loginVO != null ? loginVO.getId() : null);
        return IntermediateResultVO.success(null);
    }
}
