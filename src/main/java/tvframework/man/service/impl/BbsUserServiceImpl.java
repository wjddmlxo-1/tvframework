package tvframework.man.service.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import tvframework.com.cmm.idgnr.IdGnrService;
import tvframework.man.dto.BbsUserBbsFeaturesDTO;
import tvframework.man.dto.BbsUserBoardDTO;
import tvframework.man.dto.BbsUserBoardPermDTO;
import tvframework.man.dto.BbsUserCategoryDTO;
import tvframework.man.dto.BbsUserCommentAttachmentRowDTO;
import tvframework.man.dto.BbsUserCommentDTO;
import tvframework.man.dto.BbsUserCommentImageDTO;
import tvframework.man.dto.BbsUserCommentSaveDTO;
import tvframework.man.dto.BbsUserFileBinaryDTO;
import tvframework.man.dto.BbsUserFileUploadDTO;
import tvframework.man.dto.BbsUserNttDTO;
import tvframework.man.dto.BbsUserNttPageDTO;
import tvframework.man.dto.BbsUserOrgDTO;
import tvframework.man.dto.BbsUserPopupNoticeDTO;
import tvframework.man.dto.BbsUserPopupPreviewDTO;
import tvframework.man.dto.BbsUserPopupSettingDTO;
import tvframework.man.dto.BbsUserPostSaveDTO;
import tvframework.man.dto.BbsUserPostFileBindDTO;
import tvframework.man.dto.BbsUserPostFileDTO;
import tvframework.man.dto.BbsUserPostDetailDTO;
import tvframework.man.service.BbsUserService;

@Service
public class BbsUserServiceImpl implements BbsUserService {

    private static final int FILE_EXT_MAX = 10;
    private static final int FILE_NM_MAX = 255;
    private static final long MAX_BYTES = 10 * 1024 * 1024L;
    private static final int COMMENT_ATTACH_MAX_COUNT = 4;

    /**
     * Windows 등에서 multipart MIME이 비어 있거나 application/octet-stream으로 오는 경우가 있어
     * 확장자로 image/* 를 추정한다.
     */
    private static String resolveCommentImageMimeType(String mimeType, String fileExt) {
        String raw = StringUtils.hasText(mimeType) ? mimeType.trim().toLowerCase(Locale.ROOT) : "";
        if (raw.startsWith("image/")) {
            return raw;
        }
        String ex = StringUtils.hasText(fileExt) ? fileExt.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "") : "";
        if (ex.isEmpty()) {
            return raw;
        }
        switch (ex) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "bmp":
                return "image/bmp";
            case "heic":
            case "heif":
                return "image/heic";
            case "svg":
                return "image/svg+xml";
            case "ico":
                return "image/x-icon";
            default:
                return raw;
        }
    }

    private final BbsUserMapper bbsUserMapper;
    private final IdGnrService nttCommentIdGnrService;
    private final IdGnrService egovNttIdGnrService;
    private final IdGnrService cmFileSqIdGnrService;

    public BbsUserServiceImpl(
        BbsUserMapper bbsUserMapper,
        @Qualifier("nttCommentIdGnrService") IdGnrService nttCommentIdGnrService,
        @Qualifier("egovNttIdGnrService") IdGnrService egovNttIdGnrService,
        @Qualifier("cmFileSqIdGnrService") IdGnrService cmFileSqIdGnrService
    ) {
        this.bbsUserMapper = bbsUserMapper;
        this.nttCommentIdGnrService = nttCommentIdGnrService;
        this.egovNttIdGnrService = egovNttIdGnrService;
        this.cmFileSqIdGnrService = cmFileSqIdGnrService;
    }

    @Override
    public List<BbsUserBoardDTO> selectBoardsForUser(String cmpnyCd, String userId, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        if (!StringUtils.hasText(userId)) {
            return Collections.emptyList();
        }
        BbsUserOrgDTO org = bbsUserMapper.selectUserOrgMembership(buildOrgParams(cmpnyCd, userId));
        if (org == null || !StringUtils.hasText(org.getMbrshSq())) {
            return Collections.emptyList();
        }
        Map<String, Object> p = buildAuthParams(cmpnyCd, userId, org.getMbrshSq(), org.getDeptCd(), languageCode);
        List<BbsUserBoardDTO> list = bbsUserMapper.selectBoardsForUser(p);
        return list != null ? list : Collections.emptyList();
    }

    @Override
    public BbsUserNttPageDTO selectNttPage(String cmpnyCd, String userId, String languageCode,
            String bbsId, int pageIndex, int pageSize, boolean sortAsc) throws Exception {
        requireCmpny(cmpnyCd);
        if (!StringUtils.hasText(userId)) {
            return new BbsUserNttPageDTO(Collections.emptyList(), 0, pageIndex, pageSize);
        }
        BbsUserOrgDTO org = bbsUserMapper.selectUserOrgMembership(buildOrgParams(cmpnyCd, userId));
        if (org == null || !StringUtils.hasText(org.getMbrshSq())) {
            return new BbsUserNttPageDTO(Collections.emptyList(), 0, pageIndex, pageSize);
        }
        Map<String, Object> auth = buildAuthParams(cmpnyCd, userId, org.getMbrshSq(), org.getDeptCd(), languageCode);
        List<String> accessible = bbsUserMapper.selectAccessibleBbsIds(auth);
        if (CollectionUtils.isEmpty(accessible)) {
            return new BbsUserNttPageDTO(Collections.emptyList(), 0, pageIndex, pageSize);
        }
        List<String> bbsIds;
        if (StringUtils.hasText(bbsId) && !"__ALL__".equalsIgnoreCase(bbsId.trim())) {
            String bid = bbsId.trim();
            if (!accessible.contains(bid)) {
                return new BbsUserNttPageDTO(Collections.emptyList(), 0, pageIndex, pageSize);
            }
            bbsIds = Collections.singletonList(bid);
        } else {
            bbsIds = new ArrayList<>(accessible);
        }
        int size = Math.min(Math.max(pageSize, 1), 100);
        int idx = Math.max(pageIndex, 1);
        int offset = (idx - 1) * size;
        String lang = StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR";
        Map<String, Object> q = new HashMap<>();
        q.put("cmpnyCd", cmpnyCd.trim());
        q.put("bbsIds", bbsIds);
        q.put("languageCode", lang);
        q.put("sortAsc", sortAsc);
        q.put("limit", size);
        q.put("offset", offset);
        int total = bbsUserMapper.countNttList(q);
        List<BbsUserNttDTO> rows = bbsUserMapper.selectNttList(q);
        if (rows != null && !rows.isEmpty()) {
            Map<String, BbsUserBoardPermDTO> permCache = new HashMap<>();
            for (BbsUserNttDTO row : rows) {
                if (row == null) continue;
                boolean isSecret = "SECRET".equalsIgnoreCase(row.getNttSttus());
                if (!isSecret) continue;
                String rowBbsId = StringUtils.hasText(row.getBbsId()) ? row.getBbsId().trim() : "";
                if (rowBbsId.isEmpty()) continue;
                BbsUserBoardPermDTO perm = permCache.computeIfAbsent(rowBbsId, k -> resolveBoardPerm(auth, k));
                boolean manager = "Y".equalsIgnoreCase(perm != null ? perm.getPermManagerFl() : null);
                boolean owner = StringUtils.hasText(row.getCreationId()) && row.getCreationId().trim().equals(userId.trim());
                if (!manager && !owner) {
                    row.setTitle("비밀글입니다.");
                    row.setSnippet("권한이 없어 내용을 확인할 수 없습니다.");
                }
            }
        }
        return new BbsUserNttPageDTO(rows != null ? rows : Collections.emptyList(), total, idx, size);
    }

    @Override
    public BbsUserPostDetailDTO selectPostDetail(String cmpnyCd, String userId, String languageCode,
            String bbsId, String nttSq) throws Exception {
        requireCmpny(cmpnyCd);
        if (!StringUtils.hasText(userId) || !StringUtils.hasText(bbsId) || !StringUtils.hasText(nttSq)) {
            return null;
        }
        BbsUserOrgDTO org = bbsUserMapper.selectUserOrgMembership(buildOrgParams(cmpnyCd, userId));
        if (org == null || !StringUtils.hasText(org.getMbrshSq())) {
            return null;
        }
        Map<String, Object> auth = buildAuthParams(cmpnyCd, userId, org.getMbrshSq(), org.getDeptCd(), languageCode);
        List<String> accessible = bbsUserMapper.selectAccessibleBbsIds(auth);
        if (CollectionUtils.isEmpty(accessible) || !accessible.contains(bbsId.trim())) {
            return null;
        }
        Map<String, Object> d = new HashMap<>(auth);
        d.put("bbsId", bbsId.trim());
        d.put("nttSq", nttSq.trim());
        BbsUserPostDetailDTO detail = bbsUserMapper.selectPostDetail(d);
        if (detail != null) {
            applyBoardPermToDetail(detail, auth, bbsId);
            boolean isSecret = "SECRET".equalsIgnoreCase(detail.getNttSttus());
            boolean manager = "Y".equalsIgnoreCase(detail.getPermManagerFl());
            boolean owner = StringUtils.hasText(detail.getCreationId()) && detail.getCreationId().trim().equals(userId.trim());
            if (isSecret && !manager && !owner) {
                detail.setTitle("비밀글입니다.");
                detail.setContents("권한이 없어 내용을 확인할 수 없습니다.");
            }
        }
        return detail;
    }

    private BbsUserBoardPermDTO resolveBoardPerm(Map<String, Object> auth, String bbsId) {
        Map<String, Object> q = new HashMap<>(auth);
        q.put("bbsId", bbsId.trim());
        BbsUserBoardPermDTO perm = bbsUserMapper.selectBbsAuthorAggFlags(q);
        if (perm == null) {
            perm = new BbsUserBoardPermDTO();
            perm.setPermReadingFl("N");
            perm.setPermWritingFl("N");
            perm.setPermReplyFl("N");
            perm.setPermManagerFl("N");
        }
        return perm;
    }

    private void applyBoardPermToDetail(BbsUserPostDetailDTO detail, Map<String, Object> auth, String bbsId) {
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, bbsId);
        detail.setPermReadingFl(perm.getPermReadingFl());
        detail.setPermWritingFl(perm.getPermWritingFl());
        detail.setPermReplyFl(perm.getPermReplyFl());
        detail.setPermManagerFl(perm.getPermManagerFl());
    }

    private static void assertPostWriteOrManage(BbsUserBoardPermDTO perm, String creationId, String userId) {
        if (perm == null) {
            throw new IllegalArgumentException("게시판 권한 정보를 확인할 수 없습니다.");
        }
        if ("Y".equalsIgnoreCase(perm.getPermManagerFl())) {
            return;
        }
        if ("Y".equalsIgnoreCase(perm.getPermWritingFl())
            && StringUtils.hasText(creationId)
            && StringUtils.hasText(userId)
            && creationId.trim().equals(userId.trim())) {
            return;
        }
        throw new IllegalArgumentException("게시글 처리 권한이 없습니다.");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePost(BbsUserPostSaveDTO dto, String userId) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        if (!StringUtils.hasText(dto.getNttSq())) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        if (!StringUtils.hasText(dto.getTitle()) || !StringUtils.hasText(dto.getContents())) {
            throw new IllegalArgumentException("제목/내용은 필수입니다.");
        }
        Map<String, Object> d = new HashMap<>(auth);
        d.put("bbsId", dto.getBbsId().trim());
        d.put("nttSq", dto.getNttSq().trim());
        BbsUserPostDetailDTO existing = bbsUserMapper.selectPostDetail(d);
        if (existing == null) {
            throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
        }
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, dto.getBbsId());
        assertPostWriteOrManage(perm, existing.getCreationId(), userId);
        Map<String, Object> layoutP = new HashMap<>();
        layoutP.put("cmpnyCd", dto.getCmpnyCd().trim());
        layoutP.put("bbsId", dto.getBbsId().trim());
        String layoutTy = bbsUserMapper.selectBbsLayoutTy(layoutP);
        List<String> fileSqs = normalizeFileSqList(dto.getFileSqs());
        if (isAlbumLayoutTy(layoutTy)) {
            if (CollectionUtils.isEmpty(fileSqs)) {
                throw new IllegalArgumentException("앨범형 게시판은 이미지 첨부를 1개 이상 등록해야 합니다.");
            }
            Map<String, Object> imgQ = new HashMap<>();
            imgQ.put("fileSqs", fileSqs);
            if (bbsUserMapper.countImageFilesAmongSqs(imgQ) < 1) {
                throw new IllegalArgumentException("앨범형 게시판은 이미지 파일을 1개 이상 첨부해야 합니다.");
            }
        }
        BbsUserBbsFeaturesDTO bbsFeatUp = loadBbsFeatures(dto.getCmpnyCd(), dto.getBbsId());
        assertFeaturesForPostSave(bbsFeatUp, dto, false);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("title", dto.getTitle().trim());
        p.put("contents", dto.getContents().trim());
        p.put("categorySq", StringUtils.hasText(dto.getCategorySq()) ? dto.getCategorySq().trim() : null);
        p.put("noticeAt", normalizeYn(dto.getNoticeAt()));
        p.put("nttSttus", normalizeNttStatus(dto.getNttSttus()));
        p.put("ntceBgnde", StringUtils.hasText(dto.getNtceBgnde()) ? dto.getNtceBgnde().trim() : null);
        p.put("ntceEndde", StringUtils.hasText(dto.getNtceEndde()) ? dto.getNtceEndde().trim() : null);
        p.put("updateId", userId.trim());
        p.put("userId", userId.trim());
        p.put("managerOverride", "Y".equalsIgnoreCase(perm.getPermManagerFl()) ? 1 : 0);
        int n = bbsUserMapper.updateUserPost(p);
        if (n < 1) {
            throw new IllegalArgumentException("게시글을 수정할 수 없습니다.");
        }
        // 수정 모드 첨부 동기화:
        // - fileSqs 미전달(null): 첨부 변경 없음
        // - fileSqs 빈 배열: 기존 첨부 전체 삭제
        // - fileSqs 전달+비어있지 않음: 전달 목록만 유지, 나머지 삭제 후 바인딩
        if (dto.getFileSqs() != null) {
            Map<String, Object> fp = new HashMap<>();
            fp.put("nttSq", dto.getNttSq().trim());
            fp.put("updateId", userId.trim());
            if (CollectionUtils.isEmpty(fileSqs)) {
                bbsUserMapper.softDeletePostFilesForPost(fp);
            } else {
                fp.put("fileSqs", fileSqs);
                bbsUserMapper.softDeletePostFilesForPostNotIn(fp);
                BbsUserPostFileBindDTO bind = new BbsUserPostFileBindDTO();
                bind.setCmpnyCd(dto.getCmpnyCd().trim());
                bind.setBbsId(dto.getBbsId().trim());
                bind.setNttSq(dto.getNttSq().trim());
                bind.setFileSqs(fileSqs);
                bindPostFiles(bind, userId);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePost(String cmpnyCd, String bbsId, String nttSq, String userId) throws Exception {
        if (!StringUtils.hasText(cmpnyCd) || !StringUtils.hasText(bbsId) || !StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("회사/게시판/게시글번호는 필수입니다.");
        }
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        Map<String, Object> d = new HashMap<>(auth);
        d.put("bbsId", bbsId.trim());
        d.put("nttSq", nttSq.trim());
        BbsUserPostDetailDTO existing = bbsUserMapper.selectPostDetail(d);
        if (existing == null) {
            throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
        }
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, bbsId);
        assertPostWriteOrManage(perm, existing.getCreationId(), userId);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        p.put("nttSq", nttSq.trim());
        p.put("updateId", userId.trim());
        p.put("userId", userId.trim());
        p.put("managerOverride", "Y".equalsIgnoreCase(perm.getPermManagerFl()) ? 1 : 0);
        bbsUserMapper.softDeletePostAttachedFiles(p);
        int n = bbsUserMapper.softDeleteUserPost(p);
        if (n < 1) {
            throw new IllegalArgumentException("게시글을 삭제할 수 없습니다.");
        }
    }

    @Override
    public void markPostRead(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        Map<String, Object> p = new HashMap<>();
        p.put("nttSq", nttSq.trim());
        p.put("bbsId", bbsId.trim());
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("userId", userId.trim());
        bbsUserMapper.insertPostRead(p);
        bbsUserMapper.updatePostCounts(p);
    }

    @Override
    public void togglePostVote(String nttSq, String bbsId, String cmpnyCd, String voteGb, String userId) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        if (!StringUtils.hasText(voteGb)) {
            throw new IllegalArgumentException("투표구분은 필수입니다.");
        }
        String normalizedVoteGb = voteGb.trim().toUpperCase();
        if (!"L".equals(normalizedVoteGb) && !"D".equals(normalizedVoteGb)) {
            throw new IllegalArgumentException("투표구분은 L 또는 D만 가능합니다.");
        }
        BbsUserBbsFeaturesDTO voteFeat = loadBbsFeatures(cmpnyCd, bbsId);
        if (voteFeat == null) {
            throw new IllegalArgumentException("게시판 설정을 확인할 수 없습니다.");
        }
        if ("L".equals(normalizedVoteGb) && !isFeatureY(voteFeat.getLikeFl())) {
            throw new IllegalArgumentException("이 게시판은 추천을 사용할 수 없습니다.");
        }
        if ("D".equals(normalizedVoteGb) && !isFeatureY(voteFeat.getDislikeFl())) {
            throw new IllegalArgumentException("이 게시판은 비추천을 사용할 수 없습니다.");
        }
        String oppositeVoteGb = "L".equals(normalizedVoteGb) ? "D" : "L";
        Map<String, Object> p = new HashMap<>();
        p.put("nttSq", nttSq.trim());
        p.put("bbsId", bbsId.trim());
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("userId", userId.trim());
        p.put("voteGb", normalizedVoteGb);
        int exists = bbsUserMapper.countPostVote(p);
        if (exists > 0) {
            bbsUserMapper.deletePostVote(p);
        } else {
            Map<String, Object> opposite = new HashMap<>(p);
            opposite.put("voteGb", oppositeVoteGb);
            bbsUserMapper.deletePostVote(opposite);
            bbsUserMapper.insertPostVote(p);
        }
        bbsUserMapper.updatePostCounts(p);
    }

    @Override
    public void togglePostFavorite(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        Map<String, Object> p = new HashMap<>();
        p.put("nttSq", nttSq.trim());
        p.put("bbsId", bbsId.trim());
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("userId", userId.trim());
        int exists = bbsUserMapper.countPostFavorite(p);
        if (exists > 0) {
            bbsUserMapper.deletePostFavorite(p);
        } else {
            bbsUserMapper.insertPostFavorite(p);
        }
        bbsUserMapper.updatePostCounts(p);
    }

    @Override
    public List<BbsUserCommentDTO> selectComments(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        p.put("nttSq", nttSq.trim());
        p.put("mbrshSq", auth.get("mbrshSq"));
        p.put("userId", userId != null ? userId.trim() : "");
        List<BbsUserCommentDTO> rows = bbsUserMapper.selectCommentList(p);
        if (rows == null) {
            rows = Collections.emptyList();
        }
        Map<String, Object> ap = new HashMap<>();
        ap.put("cmpnyCd", cmpnyCd.trim());
        ap.put("bbsId", bbsId.trim());
        ap.put("nttSq", nttSq.trim());
        List<BbsUserCommentAttachmentRowDTO> att = bbsUserMapper.selectCommentAttachmentsForNtt(ap);
        Map<String, List<BbsUserCommentImageDTO>> byComment = new HashMap<>();
        if (att != null) {
            for (BbsUserCommentAttachmentRowDTO r : att) {
                if (!StringUtils.hasText(r.getCommentSq()) || !StringUtils.hasText(r.getFileSq())) {
                    continue;
                }
                BbsUserCommentImageDTO img = new BbsUserCommentImageDTO();
                img.setFileSq(r.getFileSq().trim());
                img.setMimeTy(r.getMimeTy());
                byComment.computeIfAbsent(r.getCommentSq().trim(), k -> new ArrayList<>()).add(img);
            }
        }
        for (BbsUserCommentDTO row : rows) {
            String sq = row.getCommentSq() != null ? row.getCommentSq().trim() : "";
            List<BbsUserCommentImageDTO> imgs = byComment.get(sq);
            row.setImages(imgs != null ? imgs : new ArrayList<>());
        }
        return rows;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createComment(BbsUserCommentSaveDTO dto, String userId) throws Exception {
        if (dto == null) throw new IllegalArgumentException("요청 본문이 없습니다.");
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        BbsUserBbsFeaturesDTO cmtFeat = loadBbsFeatures(dto.getCmpnyCd(), dto.getBbsId());
        if (cmtFeat == null) {
            throw new IllegalArgumentException("게시판 설정을 확인할 수 없습니다.");
        }
        if (!isFeatureY(cmtFeat.getCommentFl())) {
            throw new IllegalArgumentException("이 게시판은 댓글을 사용할 수 없습니다.");
        }
        if (!StringUtils.hasText(dto.getNttSq()) || !StringUtils.hasText(dto.getComment())) {
            throw new IllegalArgumentException("게시글번호/댓글내용은 필수입니다.");
        }
        String secretFl = normalizeYn(dto.getSecretFl());
        String parentCommentSq = StringUtils.hasText(dto.getParentCommentSq())
            ? dto.getParentCommentSq().trim()
            : (StringUtils.hasText(dto.getUpperCommentSq()) ? dto.getUpperCommentSq().trim() : null);
        String groupNo = null;
        int depth = 0;
        int orderNo = 0;
        if (StringUtils.hasText(parentCommentSq)) {
            Map<String, Object> parent = new HashMap<>();
            parent.put("cmpnyCd", dto.getCmpnyCd().trim());
            parent.put("bbsId", dto.getBbsId().trim());
            parent.put("nttSq", dto.getNttSq().trim());
            parent.put("commentSq", parentCommentSq);
            String parentSecret = bbsUserMapper.selectCommentSecretFl(parent);
            if ("Y".equalsIgnoreCase(parentSecret)) {
                secretFl = "Y";
            }
            Map<String, Object> parentInfo = bbsUserMapper.selectCommentThreadInfo(parent);
            if (parentInfo == null || parentInfo.get("groupNo") == null) {
                throw new IllegalArgumentException("답글 대상 댓글을 찾을 수 없습니다.");
            }
            groupNo = String.valueOf(parentInfo.get("groupNo"));
            depth = ((Number) parentInfo.getOrDefault("depth", 0)).intValue() + 1;
            Map<String, Object> maxQ = new HashMap<>();
            maxQ.put("cmpnyCd", dto.getCmpnyCd().trim());
            maxQ.put("bbsId", dto.getBbsId().trim());
            maxQ.put("nttSq", dto.getNttSq().trim());
            maxQ.put("groupNo", groupNo);
            orderNo = bbsUserMapper.selectMaxCommentOrderNoByGroup(maxQ) + 1;
        }
        List<String> fileSqsNorm = normalizeFileSqList(dto.getFileSqs());
        assertValidCommentAttachmentList(fileSqsNorm);
        Object nextCommentSq = nttCommentIdGnrService.getNextLongId();
        if (!StringUtils.hasText(parentCommentSq)) {
            groupNo = String.valueOf(nextCommentSq);
            depth = 0;
            orderNo = 0;
        }
        Map<String, Object> p = new HashMap<>();
        p.put("commentSq", nextCommentSq);
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("mbrshSq", auth.get("mbrshSq"));
        p.put("comment", dto.getComment().trim());
        p.put("secretFl", secretFl);
        p.put("groupNo", groupNo);
        p.put("orderNo", orderNo);
        p.put("depth", depth);
        p.put("creationId", userId.trim());
        p.put("updateId", userId.trim());
        bbsUserMapper.insertComment(p);
        if (!fileSqsNorm.isEmpty()) {
            Map<String, Object> bind = new HashMap<>();
            bind.put("commentSq", String.valueOf(nextCommentSq).trim());
            bind.put("fileSqs", fileSqsNorm);
            bind.put("updateId", userId.trim());
            bbsUserMapper.updateCommentFilesRefSq(bind);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateComment(BbsUserCommentSaveDTO dto, String userId) throws Exception {
        if (dto == null) throw new IllegalArgumentException("요청 본문이 없습니다.");
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        if (!StringUtils.hasText(dto.getCommentSq()) || !StringUtils.hasText(dto.getComment())) {
            throw new IllegalArgumentException("댓글번호/댓글내용은 필수입니다.");
        }
        Map<String, Object> ownerQ = new HashMap<>();
        ownerQ.put("cmpnyCd", dto.getCmpnyCd().trim());
        ownerQ.put("bbsId", dto.getBbsId().trim());
        ownerQ.put("nttSq", dto.getNttSq().trim());
        ownerQ.put("commentSq", dto.getCommentSq().trim());
        ownerQ.put("userId", userId.trim());
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, dto.getBbsId());
        boolean manager = "Y".equalsIgnoreCase(perm != null ? perm.getPermManagerFl() : null);
        if (!manager && bbsUserMapper.countCommentOwner(ownerQ) <= 0) {
            throw new IllegalArgumentException("댓글 수정 권한이 없습니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("commentSq", dto.getCommentSq().trim());
        p.put("comment", dto.getComment().trim());
        p.put("secretFl", normalizeYn(dto.getSecretFl()));
        p.put("updateId", userId.trim());
        bbsUserMapper.updateComment(p);
        if (dto.getFileSqs() != null) {
            List<String> norm = normalizeFileSqList(dto.getFileSqs());
            assertValidCommentAttachmentList(norm);
            Map<String, Object> fd = new HashMap<>();
            fd.put("commentSq", dto.getCommentSq().trim());
            fd.put("updateId", userId.trim());
            if (norm.isEmpty()) {
                bbsUserMapper.softDeleteCommentFilesForComment(fd);
            } else {
                fd.put("fileSqs", norm);
                bbsUserMapper.softDeleteCommentFilesForCommentNotIn(fd);
                Map<String, Object> bind = new HashMap<>();
                bind.put("commentSq", dto.getCommentSq().trim());
                bind.put("fileSqs", norm);
                bind.put("updateId", userId.trim());
                bbsUserMapper.updateCommentFilesRefSq(bind);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteComment(BbsUserCommentSaveDTO dto, String userId) throws Exception {
        if (dto == null) throw new IllegalArgumentException("요청 본문이 없습니다.");
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        if (!StringUtils.hasText(dto.getCommentSq())) {
            throw new IllegalArgumentException("댓글번호는 필수입니다.");
        }
        Map<String, Object> ownerQ = new HashMap<>();
        ownerQ.put("cmpnyCd", dto.getCmpnyCd().trim());
        ownerQ.put("bbsId", dto.getBbsId().trim());
        ownerQ.put("nttSq", dto.getNttSq().trim());
        ownerQ.put("commentSq", dto.getCommentSq().trim());
        ownerQ.put("userId", userId.trim());
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, dto.getBbsId());
        boolean manager = "Y".equalsIgnoreCase(perm != null ? perm.getPermManagerFl() : null);
        if (!manager && bbsUserMapper.countCommentOwner(ownerQ) <= 0) {
            throw new IllegalArgumentException("댓글 삭제 권한이 없습니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("commentSq", dto.getCommentSq().trim());
        p.put("updateId", userId.trim());
        Map<String, Object> fd = new HashMap<>();
        fd.put("commentSq", dto.getCommentSq().trim());
        fd.put("updateId", userId.trim());
        bbsUserMapper.softDeleteCommentFilesForComment(fd);
        bbsUserMapper.deleteComment(p);
    }

    @Override
    public List<BbsUserPopupNoticeDTO> selectPopupNoticeList(String cmpnyCd, String userId, String languageCode, String bbsId) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, languageCode);
        List<String> accessible = bbsUserMapper.selectAccessibleBbsIds(auth);
        if (CollectionUtils.isEmpty(accessible)) {
            return Collections.emptyList();
        }
        List<String> bbsIds;
        if (StringUtils.hasText(bbsId) && !"__ALL__".equalsIgnoreCase(bbsId.trim())) {
            String bid = bbsId.trim();
            if (!accessible.contains(bid)) {
                return Collections.emptyList();
            }
            bbsIds = Collections.singletonList(bid);
        } else {
            bbsIds = new ArrayList<>(accessible);
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        p.put("bbsIds", bbsIds);
        List<BbsUserPopupNoticeDTO> list = bbsUserMapper.selectPopupNoticeListForUser(p);
        return list != null ? list : Collections.emptyList();
    }

    @Override
    public BbsUserPopupPreviewDTO selectPopupPreview(String cmpnyCd, String userId, String languageCode,
            String popupSq, String bbsId, String nttSq) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, languageCode);
        assertReadableBoard(auth, bbsId);
        if (!StringUtils.hasText(popupSq) || !StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("팝업번호/게시글번호는 필수입니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        p.put("popupSq", popupSq.trim());
        p.put("bbsId", bbsId.trim());
        p.put("nttSq", nttSq.trim());
        p.put("userId", userId.trim());
        return bbsUserMapper.selectPopupPreviewForUser(p);
    }

    @Override
    public BbsUserPopupSettingDTO selectPopupSetting(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception {
        if (!StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, bbsId);
        if (!"Y".equalsIgnoreCase(perm.getPermManagerFl())) {
            throw new IllegalArgumentException("팝업 설정 권한이 없습니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        p.put("nttSq", nttSq.trim());
        BbsUserPopupSettingDTO s = bbsUserMapper.selectPopupSettingByPostForUser(p);
        if (s != null) {
            return s;
        }
        BbsUserPopupSettingDTO init = new BbsUserPopupSettingDTO();
        init.setCmpnyCd(cmpnyCd.trim());
        init.setBbsId(bbsId.trim());
        init.setNttSq(nttSq.trim());
        init.setXcnts(100);
        init.setYdnts(100);
        init.setWidth(400);
        init.setVrticl(500);
        init.setHideFl("Y");
        init.setUseFl("Y");
        return init;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BbsUserPopupSettingDTO savePopupSetting(BbsUserPopupSettingDTO dto, String userId) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        if (!StringUtils.hasText(dto.getNttSq())) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        if (!StringUtils.hasText(dto.getStartDt()) || !StringUtils.hasText(dto.getEndDt())
            || dto.getXcnts() == null || dto.getYdnts() == null || dto.getWidth() == null || dto.getVrticl() == null) {
            throw new IllegalArgumentException("시작일/종료일/X/Y좌표/가로/세로는 필수입니다.");
        }
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, dto.getBbsId());
        if (!"Y".equalsIgnoreCase(perm.getPermManagerFl())) {
            throw new IllegalArgumentException("팝업 설정 권한이 없습니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("xcnts", dto.getXcnts() != null ? dto.getXcnts() : 100);
        p.put("ydnts", dto.getYdnts() != null ? dto.getYdnts() : 100);
        p.put("width", dto.getWidth() != null ? dto.getWidth() : 400);
        p.put("vrticl", dto.getVrticl() != null ? dto.getVrticl() : 500);
        p.put("startDt", dto.getStartDt());
        p.put("endDt", dto.getEndDt());
        p.put("hideFl", normalizeYn(dto.getHideFl()));
        p.put("useFl", normalizeYn(dto.getUseFl()));
        p.put("updateId", userId.trim());

        BbsUserPopupSettingDTO existing = bbsUserMapper.selectPopupSettingByPostForUser(p);
        if (existing == null) {
            bbsUserMapper.insertPopupSettingByPostForUser(p);
        } else {
            bbsUserMapper.updatePopupSettingByPostForUser(p);
        }
        return bbsUserMapper.selectPopupSettingByPostForUser(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePopupSetting(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception {
        if (!StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        BbsUserBoardPermDTO perm = resolveBoardPerm(auth, bbsId);
        if (!"Y".equalsIgnoreCase(perm.getPermManagerFl())) {
            throw new IllegalArgumentException("팝업 설정 권한이 없습니다.");
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        p.put("nttSq", nttSq.trim());
        bbsUserMapper.deletePopupSettingByPostForUser(p);
    }

    @Override
    public List<BbsUserCategoryDTO> selectCategoriesForUser(String cmpnyCd, String userId, String bbsId) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        List<BbsUserCategoryDTO> rows = bbsUserMapper.selectCategoriesForUser(p);
        return rows != null ? rows : Collections.emptyList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String createPost(BbsUserPostSaveDTO dto, String userId) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        if (!StringUtils.hasText(dto.getTitle()) || !StringUtils.hasText(dto.getContents())) {
            throw new IllegalArgumentException("제목/내용은 필수입니다.");
        }
        Map<String, Object> layoutP = new HashMap<>();
        layoutP.put("cmpnyCd", dto.getCmpnyCd().trim());
        layoutP.put("bbsId", dto.getBbsId().trim());
        String layoutTy = bbsUserMapper.selectBbsLayoutTy(layoutP);
        List<String> fileSqs = normalizeFileSqList(dto.getFileSqs());
        if (isAlbumLayoutTy(layoutTy)) {
            if (CollectionUtils.isEmpty(fileSqs)) {
                throw new IllegalArgumentException("앨범형 게시판은 이미지 첨부를 1개 이상 등록해야 합니다.");
            }
            Map<String, Object> imgQ = new HashMap<>();
            imgQ.put("fileSqs", fileSqs);
            if (bbsUserMapper.countImageFilesAmongSqs(imgQ) < 1) {
                throw new IllegalArgumentException("앨범형 게시판은 이미지 파일을 1개 이상 첨부해야 합니다.");
            }
        }
        BbsUserBbsFeaturesDTO bbsFeatCr = loadBbsFeatures(dto.getCmpnyCd(), dto.getBbsId());
        assertFeaturesForPostSave(bbsFeatCr, dto, true);
        String nttSq = String.valueOf(egovNttIdGnrService.getNextLongId());
        String parentNttSq = StringUtils.hasText(dto.getParentNttSq()) ? dto.getParentNttSq().trim() : null;
        String groupNo = nttSq;
        int orderNo = 0;
        int depth = 0;
        if (StringUtils.hasText(parentNttSq)) {
            Map<String, Object> tq = new HashMap<>();
            tq.put("cmpnyCd", dto.getCmpnyCd().trim());
            tq.put("bbsId", dto.getBbsId().trim());
            tq.put("nttSq", parentNttSq);
            Map<String, Object> parentInfo = bbsUserMapper.selectPostThreadInfo(tq);
            if (parentInfo == null || parentInfo.get("groupNo") == null) {
                throw new IllegalArgumentException("답변 대상 게시글을 찾을 수 없습니다.");
            }
            groupNo = String.valueOf(parentInfo.get("groupNo"));
            depth = ((Number) parentInfo.getOrDefault("depth", 0)).intValue() + 1;
            Map<String, Object> maxQ = new HashMap<>();
            maxQ.put("cmpnyCd", dto.getCmpnyCd().trim());
            maxQ.put("bbsId", dto.getBbsId().trim());
            maxQ.put("groupNo", groupNo);
            orderNo = bbsUserMapper.selectMaxPostOrderNoByGroup(maxQ) + 1;
        }
        Map<String, Object> p = new HashMap<>();
        p.put("nttSq", nttSq);
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("categorySq", StringUtils.hasText(dto.getCategorySq()) ? dto.getCategorySq().trim() : null);
        p.put("title", dto.getTitle().trim());
        p.put("contents", dto.getContents().trim());
        p.put("noticeAt", normalizeYn(dto.getNoticeAt()));
        p.put("nttSttus", normalizeNttStatus(dto.getNttSttus()));
        p.put("ntceBgnde", StringUtils.hasText(dto.getNtceBgnde()) ? dto.getNtceBgnde().trim() : null);
        p.put("ntceEndde", StringUtils.hasText(dto.getNtceEndde()) ? dto.getNtceEndde().trim() : null);
        p.put("groupNo", groupNo);
        p.put("orderNo", orderNo);
        p.put("depth", depth);
        p.put("creationId", userId.trim());
        p.put("updateId", userId.trim());
        bbsUserMapper.insertPost(p);
        if (!CollectionUtils.isEmpty(fileSqs)) {
            BbsUserPostFileBindDTO bind = new BbsUserPostFileBindDTO();
            bind.setCmpnyCd(dto.getCmpnyCd().trim());
            bind.setBbsId(dto.getBbsId().trim());
            bind.setNttSq(nttSq);
            bind.setFileSqs(fileSqs);
            bindPostFiles(bind, userId);
        }
        return nttSq;
    }

    private static boolean isAlbumLayoutTy(String layoutTy) {
        if (!StringUtils.hasText(layoutTy)) {
            return false;
        }
        String u = layoutTy.trim().toUpperCase(Locale.ROOT);
        return u.contains("ALBUM") || u.contains("GALLERY") || u.contains("GRID");
    }

    @Override
    public BbsUserFileUploadDTO savePostFileData(byte[] data, String fileName, String mimeType, String userId) throws Exception {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("파일 내용이 없습니다.");
        }
        if (data.length > MAX_BYTES) {
            throw new IllegalArgumentException("파일 크기는 10MB 이하여야 합니다.");
        }
        String orig = StringUtils.hasText(fileName) ? fileName.trim() : "file";
        if (orig.length() > FILE_NM_MAX) {
            orig = orig.substring(0, FILE_NM_MAX);
        }
        String ct = StringUtils.hasText(mimeType) ? mimeType.trim() : "application/octet-stream";
        String ext = "";
        int dot = orig.lastIndexOf('.');
        if (dot >= 0 && dot < orig.length() - 1) {
            ext = orig.substring(dot + 1).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        }
        if (ext.length() > FILE_EXT_MAX) {
            ext = ext.substring(0, FILE_EXT_MAX);
        }
        long seq = cmFileSqIdGnrService.getNextLongId();
        String fileSq = String.valueOf(seq);
        String uid = StringUtils.hasText(userId) ? userId.trim() : null;
        Map<String, Object> p = new HashMap<>();
        p.put("fileSq", fileSq);
        p.put("fileNm", orig);
        p.put("mimeTy", ct);
        p.put("fileExt", StringUtils.hasText(ext) ? ext : null);
        p.put("fileData", data);
        p.put("fileSize", (long) data.length);
        p.put("creationId", uid);
        p.put("updateId", uid);
        bbsUserMapper.insertCmFilePostData(p);
        BbsUserFileUploadDTO out = new BbsUserFileUploadDTO();
        out.setFileSq(fileSq);
        out.setFileSqDisplay("FILE-" + String.format("%05d", seq));
        out.setFileNm(orig);
        out.setMimeTy(ct);
        out.setFileSize((long) data.length);
        return out;
    }

    @Override
    public BbsUserFileBinaryDTO loadPostFile(String fileSq) throws Exception {
        if (!StringUtils.hasText(fileSq)) return null;
        Map<String, Object> q = new HashMap<>();
        q.put("fileSq", fileSq.trim());
        return bbsUserMapper.selectCmFilePostData(q);
    }

    @Override
    public BbsUserFileUploadDTO saveCommentFileData(byte[] data, String fileName, String mimeType, String userId) throws Exception {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("파일 내용이 없습니다.");
        }
        if (data.length > MAX_BYTES) {
            throw new IllegalArgumentException("파일 크기는 10MB 이하여야 합니다.");
        }
        String orig = StringUtils.hasText(fileName) ? fileName.trim() : "file";
        if (orig.length() > FILE_NM_MAX) {
            orig = orig.substring(0, FILE_NM_MAX);
        }
        int dot = orig.lastIndexOf('.');
        String ext = "";
        if (dot >= 0 && dot < orig.length() - 1) {
            ext = orig.substring(dot + 1).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        }
        if (ext.length() > FILE_EXT_MAX) {
            ext = ext.substring(0, FILE_EXT_MAX);
        }
        String ct = resolveCommentImageMimeType(mimeType, ext);
        if (!ct.startsWith("image/")) {
            throw new IllegalArgumentException("댓글 첨부는 이미지 파일만 가능합니다.");
        }
        long seq = cmFileSqIdGnrService.getNextLongId();
        String fileSq = String.valueOf(seq);
        String uid = StringUtils.hasText(userId) ? userId.trim() : null;
        Map<String, Object> p = new HashMap<>();
        p.put("fileSq", fileSq);
        p.put("fileNm", orig);
        p.put("mimeTy", ct);
        p.put("fileExt", StringUtils.hasText(ext) ? ext : null);
        p.put("fileData", data);
        p.put("fileSize", (long) data.length);
        p.put("creationId", uid);
        p.put("updateId", uid);
        bbsUserMapper.insertCmFileCommentData(p);
        BbsUserFileUploadDTO out = new BbsUserFileUploadDTO();
        out.setFileSq(fileSq);
        out.setFileSqDisplay("FILE-" + String.format("%05d", seq));
        out.setFileNm(orig);
        out.setMimeTy(ct);
        out.setFileSize((long) data.length);
        return out;
    }

    @Override
    public BbsUserFileBinaryDTO loadCommentFile(String fileSq) throws Exception {
        if (!StringUtils.hasText(fileSq)) return null;
        Map<String, Object> q = new HashMap<>();
        q.put("fileSq", fileSq.trim());
        return bbsUserMapper.selectCmFileCommentData(q);
    }

    @Override
    public BbsUserFileBinaryDTO loadProfileFile(String fileSq) throws Exception {
        if (!StringUtils.hasText(fileSq)) return null;
        Map<String, Object> q = new HashMap<>();
        q.put("fileSq", fileSq.trim());
        return bbsUserMapper.selectCmFileProfileData(q);
    }

    @Override
    public BbsUserFileUploadDTO saveProfileFileData(byte[] data, String fileName, String mimeType, String userId) throws Exception {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("파일 내용이 없습니다.");
        }
        if (data.length > MAX_BYTES) {
            throw new IllegalArgumentException("파일 크기는 10MB 이하여야 합니다.");
        }
        String orig = StringUtils.hasText(fileName) ? fileName.trim() : "image";
        if (orig.length() > FILE_NM_MAX) {
            orig = orig.substring(0, FILE_NM_MAX);
        }
        int dot = orig.lastIndexOf('.');
        String ext = "";
        if (dot >= 0 && dot < orig.length() - 1) {
            ext = orig.substring(dot + 1).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        }
        if (ext.length() > FILE_EXT_MAX) {
            ext = ext.substring(0, FILE_EXT_MAX);
        }
        String ct = resolveCommentImageMimeType(mimeType, ext);
        if (!ct.startsWith("image/")) {
            throw new IllegalArgumentException("프로필 사진은 이미지 파일만 등록할 수 있습니다.");
        }
        long seq = cmFileSqIdGnrService.getNextLongId();
        String fileSq = String.valueOf(seq);
        String uid = StringUtils.hasText(userId) ? userId.trim() : null;
        Map<String, Object> p = new HashMap<>();
        p.put("fileSq", fileSq);
        p.put("fileNm", orig);
        p.put("mimeTy", ct);
        p.put("fileExt", StringUtils.hasText(ext) ? ext : null);
        p.put("fileData", data);
        p.put("fileSize", (long) data.length);
        p.put("creationId", uid);
        p.put("updateId", uid);
        bbsUserMapper.insertCmFileProfileData(p);
        BbsUserFileUploadDTO out = new BbsUserFileUploadDTO();
        out.setFileSq(fileSq);
        out.setFileSqDisplay("FILE-" + String.format("%05d", seq));
        out.setFileNm(orig);
        out.setMimeTy(ct);
        out.setFileSize((long) data.length);
        return out;
    }

    @Override
    public void bindPostFiles(BbsUserPostFileBindDTO dto, String userId) throws Exception {
        if (dto == null) throw new IllegalArgumentException("요청 본문이 없습니다.");
        Map<String, Object> auth = resolveAuthContext(dto.getCmpnyCd(), userId, "ko_KR");
        assertReadableBoard(auth, dto.getBbsId());
        if (!StringUtils.hasText(dto.getNttSq()) || CollectionUtils.isEmpty(dto.getFileSqs())) {
            return;
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", dto.getCmpnyCd().trim());
        p.put("bbsId", dto.getBbsId().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("fileSqs", dto.getFileSqs());
        p.put("updateId", userId != null ? userId.trim() : null);
        bbsUserMapper.updatePostFilesRefSq(p);
    }

    @Override
    public List<BbsUserPostFileDTO> selectPostFiles(String cmpnyCd, String userId, String bbsId, String nttSq) throws Exception {
        Map<String, Object> auth = resolveAuthContext(cmpnyCd, userId, "ko_KR");
        assertReadableBoard(auth, bbsId);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        p.put("nttSq", nttSq.trim());
        List<BbsUserPostFileDTO> rows = bbsUserMapper.selectPostFiles(p);
        return rows != null ? rows : Collections.emptyList();
    }

    private void requireCmpny(String cmpnyCd) {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
    }

    private Map<String, Object> buildOrgParams(String cmpnyCd, String userId) {
        Map<String, Object> m = new HashMap<>();
        m.put("cmpnyCd", cmpnyCd.trim());
        m.put("userId", userId.trim());
        return m;
    }

    private Map<String, Object> buildAuthParams(String cmpnyCd, String userId, String mbrshSq, String deptCd, String languageCode) {
        Map<String, Object> m = new HashMap<>();
        m.put("cmpnyCd", cmpnyCd.trim());
        m.put("userId", userId.trim());
        m.put("mbrshSq", mbrshSq.trim());
        m.put("deptCd", StringUtils.hasText(deptCd) ? deptCd.trim() : "");
        m.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        return m;
    }

    private Map<String, Object> resolveAuthContext(String cmpnyCd, String userId, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        if (!StringUtils.hasText(userId)) {
            throw new IllegalArgumentException("로그인 정보가 필요합니다.");
        }
        BbsUserOrgDTO org = bbsUserMapper.selectUserOrgMembership(buildOrgParams(cmpnyCd, userId));
        if (org == null || !StringUtils.hasText(org.getMbrshSq())) {
            throw new IllegalArgumentException("사용자 소속 정보를 찾을 수 없습니다.");
        }
        return buildAuthParams(cmpnyCd, userId, org.getMbrshSq(), org.getDeptCd(), languageCode);
    }

    private void assertReadableBoard(Map<String, Object> auth, String bbsId) {
        if (!StringUtils.hasText(bbsId)) {
            throw new IllegalArgumentException("게시판ID는 필수입니다.");
        }
        List<String> accessible = bbsUserMapper.selectAccessibleBbsIds(auth);
        if (CollectionUtils.isEmpty(accessible) || !accessible.contains(bbsId.trim())) {
            throw new IllegalArgumentException("해당 게시판 접근 권한이 없습니다.");
        }
    }

    private static List<String> normalizeFileSqList(List<String> fileSqs) {
        if (CollectionUtils.isEmpty(fileSqs)) {
            return Collections.emptyList();
        }
        List<String> out = new ArrayList<>();
        for (String s : fileSqs) {
            if (StringUtils.hasText(s)) {
                out.add(s.trim());
            }
        }
        return out;
    }

    private void assertValidCommentAttachmentList(List<String> fileSqs) throws Exception {
        if (CollectionUtils.isEmpty(fileSqs)) {
            return;
        }
        if (fileSqs.size() > COMMENT_ATTACH_MAX_COUNT) {
            throw new IllegalArgumentException("댓글 사진은 최대 " + COMMENT_ATTACH_MAX_COUNT + "장까지 첨부할 수 있습니다.");
        }
        Map<String, Object> q = new HashMap<>();
        q.put("fileSqs", fileSqs);
        int imgCnt = bbsUserMapper.countImageCommentFilesAmongSqs(q);
        if (imgCnt < fileSqs.size()) {
            throw new IllegalArgumentException("댓글 첨부는 이미지 파일만 가능합니다.");
        }
        long sum = bbsUserMapper.sumCommentFileBytesAmongSqs(q);
        if (sum > MAX_BYTES) {
            throw new IllegalArgumentException("댓글 첨부 이미지 합계는 10MB를 넘을 수 없습니다.");
        }
    }

    private BbsUserBbsFeaturesDTO loadBbsFeatures(String cmpnyCd, String bbsId) throws Exception {
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("bbsId", bbsId.trim());
        return bbsUserMapper.selectBbsFeatureFlags(p);
    }

    private static boolean isFeatureY(String s) {
        return StringUtils.hasText(s) && "Y".equalsIgnoreCase(s.trim());
    }

    /**
     * CM_BBS 기능 플래그와 요청 본문 일치 검증(관리자 토글과 사용자 화면 정합성).
     *
     * @param checkParentReply 신규 등록 시 parentNttSq(답글)만 검사
     */
    private void assertFeaturesForPostSave(BbsUserBbsFeaturesDTO f, BbsUserPostSaveDTO dto, boolean checkParentReply) throws Exception {
        if (f == null) {
            throw new IllegalArgumentException("게시판 설정을 확인할 수 없습니다.");
        }
        if (checkParentReply && StringUtils.hasText(dto.getParentNttSq()) && !isFeatureY(f.getReplyFl())) {
            throw new IllegalArgumentException("이 게시판은 답글을 사용할 수 없습니다.");
        }
        if ("Y".equals(normalizeYn(dto.getNoticeAt())) && !isFeatureY(f.getNoticeFl())) {
            throw new IllegalArgumentException("이 게시판은 공지 게시를 사용할 수 없습니다.");
        }
        if ("SECRET".equalsIgnoreCase(normalizeNttStatus(dto.getNttSttus())) && !isFeatureY(f.getEnfrcSecretFl())) {
            throw new IllegalArgumentException("이 게시판은 비밀글을 사용할 수 없습니다.");
        }
        if (StringUtils.hasText(dto.getCategorySq()) && !isFeatureY(f.getCategoryFl())) {
            throw new IllegalArgumentException("이 게시판은 카테고리를 사용할 수 없습니다.");
        }
        if ((StringUtils.hasText(dto.getNtceBgnde()) || StringUtils.hasText(dto.getNtceEndde())) && !isFeatureY(f.getResveFl())) {
            throw new IllegalArgumentException("이 게시판은 예약게시를 사용할 수 없습니다.");
        }
        List<String> fileSqs = normalizeFileSqList(dto.getFileSqs());
        if (!CollectionUtils.isEmpty(fileSqs) && !isFeatureY(f.getAtchmnflFl())) {
            throw new IllegalArgumentException("이 게시판은 첨부파일을 사용할 수 없습니다.");
        }
    }

    private String normalizeYn(String v) {
        return "Y".equalsIgnoreCase(StringUtils.hasText(v) ? v.trim() : "") ? "Y" : "N";
    }

    private String normalizeNttStatus(String v) {
        String s = StringUtils.hasText(v) ? v.trim().toUpperCase(Locale.ROOT) : "PUBLIC";
        return "SECRET".equals(s) ? "SECRET" : "PUBLIC";
    }
}
