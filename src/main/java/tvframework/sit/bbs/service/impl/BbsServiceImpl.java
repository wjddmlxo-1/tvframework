package tvframework.sit.bbs.service.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import tvframework.com.cmm.idgnr.IdGnrService;
import tvframework.sit.bbs.dto.BbsAuthorDTO;
import tvframework.sit.bbs.dto.BbsCategoryDTO;
import tvframework.sit.bbs.dto.BbsCodeDetailOptionDTO;
import tvframework.sit.bbs.dto.BbsCommentPendingDTO;
import tvframework.sit.bbs.dto.BbsDTO;
import tvframework.sit.bbs.dto.BbsNttTrashDTO;
import tvframework.sit.bbs.dto.BbsPopupNoticeDTO;
import tvframework.sit.bbs.dto.BbsPopupPreviewDTO;
import tvframework.sit.bbs.dto.BbsPopupSettingDTO;
import tvframework.sit.bbs.dto.BbsSortRequestDTO;
import tvframework.sit.bbs.service.BbsService;
import tvframework.sym.cmm.dto.CodeOptionDTO;

/**
 * 사이트 게시판 관리 서비스 구현
 */
@Service
public class BbsServiceImpl implements BbsService {

    private static final int MAX_BBS_ID = 50;
    private static final int MAX_CMPNY_CD = 20;
    private static final int MAX_BBS_NM_KEY = 60;
    private static final int MAX_BBS_CN = 400;
    private static final int MAX_TY = 20;
    private static final int MAX_YN = 1;
    private static final int MAX_PERM_EXTSN = 100;
    private static final int MAX_USER_ID = 20;
    private static final int MAX_TARGET_CD = 20;
    private static final int MAX_CATEGORY_NM = 60;

    private final BbsMapper bbsMapper;
    private final IdGnrService egovBBSMstrIdGnrService;
    private final IdGnrService bbsAuthorIdGnrService;
    private final IdGnrService bbsCategoryIdGnrService;

    public BbsServiceImpl(
        BbsMapper bbsMapper,
        @Qualifier("egovBBSMstrIdGnrService") IdGnrService egovBBSMstrIdGnrService,
        @Qualifier("bbsAuthorIdGnrService") IdGnrService bbsAuthorIdGnrService,
        @Qualifier("bbsCategoryIdGnrService") IdGnrService bbsCategoryIdGnrService
    ) {
        this.bbsMapper = bbsMapper;
        this.egovBBSMstrIdGnrService = egovBBSMstrIdGnrService;
        this.bbsAuthorIdGnrService = bbsAuthorIdGnrService;
        this.bbsCategoryIdGnrService = bbsCategoryIdGnrService;
    }

    @Override
    public List<CodeOptionDTO> selectBbsTypeOptions(String cmpnyCd, String languageCode) throws Exception {
        return toCodeOptions(selectBbsCodeDetailOptionsRaw(cmpnyCd, "CMMNCODE.BBS.001", languageCode));
    }

    @Override
    public List<CodeOptionDTO> selectLayoutTypeOptions(String cmpnyCd, String languageCode) throws Exception {
        return toCodeOptions(selectBbsCodeDetailOptionsRaw(cmpnyCd, "CMMNCODE.BBS.003", languageCode));
    }

    @Override
    public List<BbsCodeDetailOptionDTO> selectBbsFeatureCodeOptions(String cmpnyCd, String bbsTyCodeId, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        if (!StringUtils.hasText(bbsTyCodeId)) {
            return Collections.emptyList();
        }
        return selectBbsCodeDetailOptionsRaw(cmpnyCd, bbsTyCodeId.trim(), languageCode);
    }

    private List<BbsCodeDetailOptionDTO> selectBbsCodeDetailOptionsRaw(String cmpnyCd, String codeId, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        if (!StringUtils.hasText(codeId)) {
            return Collections.emptyList();
        }
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("codeId", codeId.trim());
        p.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        List<BbsCodeDetailOptionDTO> list = bbsMapper.selectBbsCodeDetailOptions(p);
        return list != null ? list : Collections.emptyList();
    }

    private static List<CodeOptionDTO> toCodeOptions(List<BbsCodeDetailOptionDTO> raw) {
        if (CollectionUtils.isEmpty(raw)) {
            return Collections.emptyList();
        }
        List<CodeOptionDTO> out = new ArrayList<>();
        for (BbsCodeDetailOptionDTO r : raw) {
            if (r == null || !StringUtils.hasText(r.getDetailCodeValue())) {
                continue;
            }
            CodeOptionDTO o = new CodeOptionDTO();
            o.setCode(r.getDetailCodeValue().trim());
            o.setName(StringUtils.hasText(r.getName()) ? r.getName().trim() : r.getDetailCodeValue().trim());
            if (StringUtils.hasText(r.getDetailCodeId())) {
                o.setDetailCodeId(r.getDetailCodeId().trim());
            }
            out.add(o);
        }
        return out;
    }

    @Override
    public List<BbsDTO> selectBbsList(String cmpnyCd, String bbsTy, String searchKeyword, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        if (StringUtils.hasText(bbsTy)) {
            p.put("bbsTy", bbsTy.trim());
        }
        if (StringUtils.hasText(searchKeyword)) {
            p.put("searchKeyword", searchKeyword.trim());
        }
        return bbsMapper.selectBbsList(p);
    }

    @Override
    public BbsDTO selectBbsDetail(String bbsId, String cmpnyCd, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        String lang = StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR";
        p.put("languageCode", lang);
        BbsDTO dto = bbsMapper.selectBbsDetail(p);
        if (dto == null) {
            return null;
        }
        dto.setCategories(bbsMapper.selectBbsCategories(p));
        dto.setAuthors(bbsMapper.selectBbsAuthors(p));
        String trashColor = bbsMapper.selectTrashTabStatusColor(p);
        dto.setTabTrashOrange(trashColor != null && "ORANGE".equalsIgnoreCase(trashColor.trim()));
        String commentColor = bbsMapper.selectCommentTabStatusColor(p);
        dto.setTabCommentOrange(commentColor != null && "ORANGE".equalsIgnoreCase(commentColor.trim()));
        return dto;
    }

    @Override
    public String selectNextBbsId() throws Exception {
        return egovBBSMstrIdGnrService.getNextStringId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void insertBbs(BbsDTO dto, String userId) throws Exception {
        validateForSave(dto, true);
        String uid = truncate(userId, MAX_USER_ID);
        Map<String, Object> row = buildBoardRow(dto, uid, true);
        if (dto.getSortingSq() == null) {
            Map<String, Object> mq = new HashMap<>();
            mq.put("cmpnyCd", dto.getCmpnyCd().trim());
            int max = bbsMapper.selectMaxSortingSq(mq);
            row.put("sortingSq", max + 1);
        }
        bbsMapper.insertBbs(row);
        if (isMemoBbsTy(dto.getBbsTy())) {
            dto.setCategories(Collections.emptyList());
        }
        saveCategoriesIfPresent(dto, uid, true);
        saveAuthorsIfPresent(dto, uid, true);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateBbs(BbsDTO dto, String userId) throws Exception {
        validateForSave(dto, false);
        String uid = truncate(userId, MAX_USER_ID);
        if (isMemoBbsTy(dto.getBbsTy())) {
            dto.setCategories(Collections.emptyList());
        }
        Map<String, Object> row = buildBoardRow(dto, uid, false);
        bbsMapper.updateBbs(row);
        if (dto.getCategories() != null) {
            replaceCategories(dto, uid);
        }
        if (dto.getAuthors() != null) {
            replaceAuthors(dto, uid);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteBbs(String bbsId, String cmpnyCd, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        if (bbsMapper.countNttByBbs(p) > 0 || bbsMapper.countCommentByBbs(p) > 0) {
            throw new IllegalArgumentException("게시글 또는 댓글이 있는 게시판은 삭제할 수 없습니다.");
        }
        bbsMapper.deleteBbsAuthorsByBoard(p);
        bbsMapper.deleteBbsCategoriesByBoard(p);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.deleteBbs(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateBbsSortOrder(BbsSortRequestDTO req, String userId) throws Exception {
        if (req == null || !StringUtils.hasText(req.getCmpnyCd())) {
            throw new IllegalArgumentException("회사코드는 필수입니다.");
        }
        if (CollectionUtils.isEmpty(req.getItems())) {
            return;
        }
        String uid = truncate(userId, MAX_USER_ID);
        for (BbsSortRequestDTO.BbsSortItemDTO it : req.getItems()) {
            if (it == null || !StringUtils.hasText(it.getBbsId()) || it.getSortingSq() == null) {
                continue;
            }
            Map<String, Object> p = new HashMap<>();
            p.put("cmpnyCd", req.getCmpnyCd().trim());
            p.put("bbsId", it.getBbsId().trim());
            p.put("sortingSq", it.getSortingSq());
            p.put("updateId", uid);
            bbsMapper.updateBbsSorting(p);
        }
    }

    @Override
    public List<BbsNttTrashDTO> selectTrashList(String bbsId, String cmpnyCd) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        return bbsMapper.selectTrashNttList(baseBoardKey(bbsId, cmpnyCd));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreTrashNtt(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("nttSq", nttSq);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.restoreTrashNtt(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void purgeTrashNtt(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("nttSq", nttSq);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.purgeTrashNtt(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreAllTrash(String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.restoreAllTrashNtt(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void purgeAllTrash(String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.purgeAllTrashNtt(p);
    }

    @Override
    public List<BbsCommentPendingDTO> selectPendingComments(String bbsId, String cmpnyCd) throws Exception {
        return bbsMapper.selectPendingComments(baseBoardKey(bbsId, cmpnyCd));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveComment(String commentSq, String nttSq, String mbrshSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("commentSq", commentSq);
        p.put("nttSq", nttSq);
        p.put("mbrshSq", mbrshSq);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.approveComment(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void rejectComment(String commentSq, String nttSq, String mbrshSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("commentSq", commentSq);
        p.put("nttSq", nttSq);
        p.put("mbrshSq", mbrshSq);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.rejectComment(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveAllComments(String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.approveAllPendingComments(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void rejectAllComments(String bbsId, String cmpnyCd, String userId) throws Exception {
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.rejectAllPendingComments(p);
    }

    @Override
    public List<BbsPopupNoticeDTO> selectPopupNoticeList(String cmpnyCd, String languageCode) throws Exception {
        requireCmpny(cmpnyCd);
        Map<String, Object> p = new HashMap<>();
        p.put("cmpnyCd", cmpnyCd.trim());
        p.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        List<BbsPopupNoticeDTO> list = bbsMapper.selectPopupNoticeList(p);
        return list != null ? list : Collections.emptyList();
    }

    @Override
    public BbsPopupSettingDTO selectPopupSetting(String popupSq, String nttSq, String bbsId, String cmpnyCd) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        if (!StringUtils.hasText(popupSq) || !StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("팝업번호와 게시글번호는 필수입니다.");
        }
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("popupSq", popupSq.trim());
        p.put("nttSq", nttSq.trim());
        return bbsMapper.selectPopupSetting(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePopupSetting(BbsPopupSettingDTO dto, String userId) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        requireCmpny(dto.getCmpnyCd());
        requireBbsId(dto.getBbsId());
        if (!StringUtils.hasText(dto.getPopupSq()) || !StringUtils.hasText(dto.getNttSq())) {
            throw new IllegalArgumentException("팝업번호와 게시글번호는 필수입니다.");
        }
        if (!StringUtils.hasText(dto.getStartDt()) || !StringUtils.hasText(dto.getEndDt())
            || dto.getXcnts() == null || dto.getYdnts() == null || dto.getWidth() == null || dto.getVrticl() == null) {
            throw new IllegalArgumentException("시작일/종료일/X/Y좌표/가로/세로는 필수입니다.");
        }
        Map<String, Object> p = baseBoardKey(dto.getBbsId(), dto.getCmpnyCd());
        p.put("popupSq", dto.getPopupSq().trim());
        p.put("nttSq", dto.getNttSq().trim());
        p.put("xcnts", dto.getXcnts() != null ? dto.getXcnts() : 100);
        p.put("ydnts", dto.getYdnts() != null ? dto.getYdnts() : 100);
        p.put("width", dto.getWidth() != null ? dto.getWidth() : 400);
        p.put("vrticl", dto.getVrticl() != null ? dto.getVrticl() : 500);
        p.put("startDt", dto.getStartDt());
        p.put("endDt", dto.getEndDt());
        p.put("hideFl", yn(dto.getHideFl()));
        p.put("useFl", yn(dto.getUseFl()));
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.updatePopupSetting(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePopupNotice(String popupSq, String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        if (!StringUtils.hasText(popupSq) || !StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("팝업번호와 게시글번호는 필수입니다.");
        }
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("popupSq", popupSq.trim());
        p.put("nttSq", nttSq.trim());
        p.put("updateId", truncate(userId, MAX_USER_ID));
        bbsMapper.deletePopupNotice(p);
    }

    @Override
    public BbsPopupPreviewDTO selectPopupPreview(String popupSq, String nttSq, String bbsId, String cmpnyCd, String languageCode, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        if (!StringUtils.hasText(popupSq) || !StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("팝업번호와 게시글번호는 필수입니다.");
        }
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("popupSq", popupSq.trim());
        p.put("nttSq", nttSq.trim());
        p.put("languageCode", StringUtils.hasText(languageCode) ? languageCode.trim() : "ko_KR");
        p.put("userId", truncate(userId, MAX_USER_ID));
        return bbsMapper.selectPopupPreview(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markPopupPreviewRead(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        if (!StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("nttSq", nttSq.trim());
        p.put("userId", truncate(userId, MAX_USER_ID));
        bbsMapper.insertPopupPreviewRead(p);
        bbsMapper.updatePopupPreviewCounts(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void togglePopupPreviewVote(String nttSq, String bbsId, String cmpnyCd, String voteGb, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        if (!StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        if (!StringUtils.hasText(voteGb)) {
            throw new IllegalArgumentException("투표구분은 필수입니다.");
        }
        String normalizedVoteGb = voteGb.trim().toUpperCase();
        if (!"L".equals(normalizedVoteGb) && !"D".equals(normalizedVoteGb)) {
            throw new IllegalArgumentException("투표구분은 L 또는 D만 가능합니다.");
        }
        String oppositeVoteGb = "L".equals(normalizedVoteGb) ? "D" : "L";
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("nttSq", nttSq.trim());
        p.put("userId", truncate(userId, MAX_USER_ID));
        p.put("voteGb", normalizedVoteGb);
        int exists = bbsMapper.countPopupPreviewVote(p);
        if (exists > 0) {
            bbsMapper.deletePopupPreviewVote(p);
        } else {
            Map<String, Object> opposite = new HashMap<>(p);
            opposite.put("voteGb", oppositeVoteGb);
            bbsMapper.deletePopupPreviewVote(opposite);
            bbsMapper.insertPopupPreviewVote(p);
        }
        bbsMapper.updatePopupPreviewCounts(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void togglePopupPreviewFavorite(String nttSq, String bbsId, String cmpnyCd, String userId) throws Exception {
        requireCmpny(cmpnyCd);
        requireBbsId(bbsId);
        if (!StringUtils.hasText(nttSq)) {
            throw new IllegalArgumentException("게시글번호는 필수입니다.");
        }
        Map<String, Object> p = baseBoardKey(bbsId, cmpnyCd);
        p.put("nttSq", nttSq.trim());
        p.put("userId", truncate(userId, MAX_USER_ID));
        int exists = bbsMapper.countPopupPreviewFavorite(p);
        if (exists > 0) {
            bbsMapper.deletePopupPreviewFavorite(p);
        } else {
            bbsMapper.insertPopupPreviewFavorite(p);
        }
        bbsMapper.updatePopupPreviewCounts(p);
    }

    private void saveCategoriesIfPresent(BbsDTO dto, String uid, boolean insert) throws Exception {
        if (dto.getCategories() == null) {
            return;
        }
        replaceCategories(dto, uid);
    }

    private void saveAuthorsIfPresent(BbsDTO dto, String uid, boolean insert) throws Exception {
        if (dto.getAuthors() == null) {
            return;
        }
        replaceAuthors(dto, uid);
    }

    private void replaceCategories(BbsDTO dto, String uid) throws Exception {
        Map<String, Object> del = baseBoardKey(dto.getBbsId(), dto.getCmpnyCd());
        bbsMapper.deleteBbsCategoriesByBoard(del);
        if (CollectionUtils.isEmpty(dto.getCategories())) {
            return;
        }
        int ord = 0;
        for (BbsCategoryDTO c : dto.getCategories()) {
            if (c == null || !StringUtils.hasText(c.getCategoryNm())) {
                continue;
            }
            String nm = truncate(c.getCategoryNm().trim(), MAX_CATEGORY_NM);
            Map<String, Object> p = baseBoardKey(dto.getBbsId(), dto.getCmpnyCd());
            p.put("categorySq", bbsCategoryIdGnrService.getNextStringId());
            p.put("categoryNm", nm);
            p.put("sortingSq", c.getSortingSq() != null ? c.getSortingSq() : ord++);
            p.put("creationId", uid);
            p.put("updateId", uid);
            bbsMapper.insertBbsCategory(p);
        }
    }

    private void replaceAuthors(BbsDTO dto, String uid) throws Exception {
        Map<String, Object> del = baseBoardKey(dto.getBbsId(), dto.getCmpnyCd());
        bbsMapper.deleteBbsAuthorsByBoard(del);
        if (CollectionUtils.isEmpty(dto.getAuthors())) {
            return;
        }
        int ord = 0;
        for (BbsAuthorDTO a : dto.getAuthors()) {
            if (a == null || !StringUtils.hasText(a.getTargetTy()) || !StringUtils.hasText(a.getTargetCd())) {
                continue;
            }
            Map<String, Object> p = baseBoardKey(dto.getBbsId(), dto.getCmpnyCd());
            p.put("authorSq", bbsAuthorIdGnrService.getNextStringId());
            p.put("targetTy", truncate(a.getTargetTy().trim(), MAX_TY));
            p.put("targetCd", truncate(a.getTargetCd().trim(), MAX_TARGET_CD));
            p.put("readingFl", yn(a.getReadingFl()));
            p.put("writingFl", yn(a.getWritingFl()));
            p.put("replyFl", yn(a.getReplyFl()));
            p.put("managerFl", yn(a.getManagerFl()));
            p.put("sortingSq", a.getSortingSq() != null ? a.getSortingSq() : ord++);
            p.put("creationId", uid);
            p.put("updateId", uid);
            bbsMapper.insertBbsAuthor(p);
        }
    }

    private static Map<String, Object> baseBoardKey(String bbsId, String cmpnyCd) {
        Map<String, Object> m = new HashMap<>();
        m.put("bbsId", bbsId.trim());
        m.put("cmpnyCd", cmpnyCd.trim());
        return m;
    }

    private void requireCmpny(String cmpnyCd) {
        if (!StringUtils.hasText(cmpnyCd)) {
            throw new IllegalArgumentException("회사코드(cmpnyCd)는 필수입니다.");
        }
        if (cmpnyCd.trim().length() > MAX_CMPNY_CD) {
            throw new IllegalArgumentException("회사코드는 " + MAX_CMPNY_CD + "자 이내여야 합니다.");
        }
    }

    private void requireBbsId(String bbsId) {
        if (!StringUtils.hasText(bbsId)) {
            throw new IllegalArgumentException("게시판ID는 필수입니다.");
        }
        if (bbsId.trim().length() > MAX_BBS_ID) {
            throw new IllegalArgumentException("게시판ID는 " + MAX_BBS_ID + "자 이내여야 합니다.");
        }
    }

    private void validateForSave(BbsDTO dto, boolean insert) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("요청 본문이 없습니다.");
        }
        requireCmpny(dto.getCmpnyCd());
        requireBbsId(dto.getBbsId());
        if (!StringUtils.hasText(dto.getBbsNmKey())) {
            throw new IllegalArgumentException("게시판명* 을 반드시 입력");
        }
        String bbsNmKey = dto.getBbsNmKey();
        if (bbsNmKey.trim().length() > MAX_BBS_NM_KEY) {
            throw new IllegalArgumentException("게시판명KEY는 " + MAX_BBS_NM_KEY + "자 이내여야 합니다.");
        }
        if (StringUtils.hasText(dto.getBbsCn()) && dto.getBbsCn().length() > MAX_BBS_CN) {
            throw new IllegalArgumentException("게시판설명은 " + MAX_BBS_CN + "자 이내여야 합니다.");
        }
        if (StringUtils.hasText(dto.getPermExtsn()) && dto.getPermExtsn().length() > MAX_PERM_EXTSN) {
            throw new IllegalArgumentException("허용확장자는 " + MAX_PERM_EXTSN + "자 이내여야 합니다.");
        }
        if (!insert) {
            Map<String, Object> q = baseBoardKey(dto.getBbsId(), dto.getCmpnyCd());
            if (bbsMapper.selectBbsDetail(q) == null) {
                throw new IllegalArgumentException("수정할 게시판을 찾을 수 없습니다.");
            }
        }
    }

    private Map<String, Object> buildBoardRow(BbsDTO dto, String uid, boolean insert) {
        Map<String, Object> m = new HashMap<>();
        m.put("bbsId", dto.getBbsId().trim());
        m.put("cmpnyCd", dto.getCmpnyCd().trim());
        m.put("bbsNmKey", dto.getBbsNmKey().trim());
        m.put("bbsCn", StringUtils.hasText(dto.getBbsCn()) ? dto.getBbsCn().trim() : null);
        m.put("bbsTy", StringUtils.hasText(dto.getBbsTy()) ? truncate(dto.getBbsTy(), MAX_TY) : "GENERAL");
        m.put("layoutTy", StringUtils.hasText(dto.getLayoutTy()) ? truncate(dto.getLayoutTy(), MAX_TY) : "LIST");
        boolean memo = isMemoBbsTy(m.get("bbsTy").toString());
        m.put("replyFl", memo ? null : yn(dto.getReplyFl()));
        m.put("commentFl", yn(dto.getCommentFl()));
        m.put("likeFl", yn(dto.getLikeFl()));
        m.put("dislikeFl", yn(dto.getDislikeFl()));
        m.put("atchmnflFl", yn(dto.getAtchmnflFl()));
        m.put("noticeFl", memo ? null : yn(dto.getNoticeFl()));
        m.put("enfrcSecretFl", yn(dto.getEnfrcSecretFl()));
        m.put("anonymousFl", yn(dto.getAnonymousFl()));
        m.put("commentConfmFl", yn(dto.getCommentConfmFl()));
        m.put("resveFl", memo ? null : yn(dto.getResveFl()));
        m.put("categoryFl", memo ? null : yn(dto.getCategoryFl()));
        m.put("maxFileSize", dto.getMaxFileSize() != null ? dto.getMaxFileSize() : 10);
        m.put("maxFileCount", dto.getMaxFileCount() != null ? dto.getMaxFileCount() : 4);
        m.put("permExtsn", StringUtils.hasText(dto.getPermExtsn()) ? dto.getPermExtsn().trim() : null);
        m.put("postsPerPage", dto.getPostsPerPage() != null ? dto.getPostsPerPage() : 10);
        m.put("titleLength", dto.getTitleLength() != null ? dto.getTitleLength() : 30);
        m.put("validFrom", dto.getValidFrom());
        m.put("validTo", dto.getValidTo());
        m.put("sortingSq", dto.getSortingSq() != null ? dto.getSortingSq() : 0);
        m.put("useFl", yn(dto.getUseFl()));
        if (insert) {
            m.put("creationId", uid);
        }
        m.put("updateId", uid);
        return m;
    }

    private static String yn(String v) {
        if (!StringUtils.hasText(v)) {
            return "N";
        }
        return "Y".equalsIgnoreCase(v.trim()) ? "Y" : "N";
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }

    /** 프론트 isMemoBoardType 과 동일: MEMO 또는 *.MEMO */
    private static boolean isMemoBbsTy(String bbsTy) {
        if (!StringUtils.hasText(bbsTy)) {
            return false;
        }
        String u = bbsTy.trim().toUpperCase();
        return "MEMO".equals(u) || u.endsWith(".MEMO");
    }
}
